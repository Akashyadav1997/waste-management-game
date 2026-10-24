import { mkdir, readFile } from 'node:fs/promises';
import ts from 'typescript';
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5173';
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function canvasHasPixels(page) {
  const canvas = page.locator('canvas');
  await canvas.waitFor();
  const buffer = await canvas.screenshot({ path: 'test-results/canvas-kitchen.png' });
  const png = PNG.sync.read(buffer);
  const colors = new Set();
  let nonBackground = 0;
  for (let y = 0; y < png.height; y += Math.max(1, Math.floor(png.height / 16))) {
    for (let x = 0; x < png.width; x += Math.max(1, Math.floor(png.width / 16))) {
      const index = (png.width * y + x) * 4;
      const r = png.data[index];
      const g = png.data[index + 1];
      const b = png.data[index + 2];
      const a = png.data[index + 3];
      if (a > 0) colors.add(`${r >> 4}-${g >> 4}-${b >> 4}`);
      if (a > 0 && (Math.abs(r - 247) > 12 || Math.abs(g - 229) > 12 || Math.abs(b - 189) > 12)) nonBackground += 1;
    }
  }
  return { ok: colors.size > 8 && nonBackground > 20, width: png.width, height: png.height, colors: colors.size, nonBackground };
}

// Compile the data fixtures directly so this verification also works against a production preview.
async function loadData(path, replacements = {}) {
  let source = await readFile(new URL(path, import.meta.url), 'utf8');
  for (const [from, to] of Object.entries(replacements)) source = source.replace(from, to);
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
  return `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
}
const wasteModule = await loadData('../src/data/wasteItems.ts');
const { wasteItems } = await import(wasteModule);
const { chapters } = await import(await loadData('../src/data/chapters.ts', { './wasteItems': wasteModule }));
const { destinations } = await import(await loadData('../src/data/bins.ts'));

async function sortWithButtons(page, itemName, destinationName, keyboard = false) {
  const item = page.locator('.item-button').filter({ has: page.getByText(itemName, { exact: true }) });
  const bin = page.locator('.destination-button').filter({ has: page.getByText(destinationName, { exact: true }) });
  if (keyboard) {
    await item.focus(); await page.keyboard.press('Enter');
    await bin.focus(); await page.keyboard.press('Enter');
  } else {
    await item.click(); await bin.click();
  }
}

async function enterChapter(page, title, screenshotName, webgl = true) {
  await page.getByRole('heading', { name: title, exact: true }).waitFor();
  await page.getByRole('button', { name: /^Next$/ }).click();
  await page.getByRole('button', { name: /^Let's help!$/ }).click();
  if (webgl) {
    await page.waitForSelector('canvas');
    await page.locator('.scene-loading').waitFor({ state: 'hidden' });
  }
  await page.screenshot({ path: `test-results/${screenshotName}`, fullPage: true });
}

async function openSortMenu(page) {
  if (!(await page.locator('.accessible-menu').isVisible())) await page.getByRole('button', { name: /^Sort menu$/ }).click();
}

async function completeChapter(page, chapter, { skip = [], screenshots = false, keyboard = false } = {}) {
  await openSortMenu(page);
  const size = chapter.itemsPerRound ?? 3;
  for (let index = 0; index < chapter.itemIds.length; index += 1) {
    const id = chapter.itemIds[index];
    if (skip.includes(id)) continue;
    const item = wasteItems.find((candidate) => candidate.id === id);
    const bin = destinations.find((candidate) => candidate.acceptedCategories.includes(item.category));
    if (await page.locator('.item-button').count() > size) throw new Error('Too many items in a round');
    if (screenshots && index % size === 0) {
      await page.getByRole('button', { name: /^Hide menu$/ }).click();
      await page.screenshot({ path: `test-results/catalogue-${chapter.id}-round-${Math.floor(index / size) + 1}.png` });
      await openSortMenu(page);
    }
    await sortWithButtons(page, item.displayName, bin.label, keyboard);
  }
  await page.getByText('Chapter complete!', { exact: true }).waitFor();
}

async function main() {
  await mkdir('test-results', { recursive: true });
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error' && !message.text().includes('Failed to load resource')) consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'test-results/title-desktop.png', fullPage: true });
    await page.getByRole('button', { name: /Let's Play|Start/i }).first().click();
    await page.getByRole('button', { name: /Play/i }).first().click();

    let pixelCheck;
    for (const chapter of chapters) {
      await enterChapter(page, chapter.title, `stage-${chapter.order}-${chapter.id}.png`);
      if (chapter.id === 'kitchen') {
        pixelCheck = await canvasHasPixels(page);
        if (!pixelCheck.ok) throw new Error(`Canvas pixel check failed: ${JSON.stringify(pixelCheck)}`);
        await openSortMenu(page);
        await sortWithButtons(page, 'Banana peel', 'Dry waste');
        await page.locator('.feedback-toast').getByText(/Hint/i).waitFor();
        await sortWithButtons(page, 'Banana peel', 'Wet waste');
        await page.locator('.feedback-toast').getByText(/Good sorting/i).waitFor();
      }
      await completeChapter(page, chapter, { skip: chapter.id === 'kitchen' ? ['banana-peel'] : [], screenshots: true, keyboard: chapter.id === 'school' });
      await page.getByRole('button', { name: /^Continue$/ }).click();
    }
    await page.getByRole('heading', { name: /neighbourhood is cleaner/i }).waitFor();
    await page.screenshot({ path: 'test-results/all-stages-complete.png', fullPage: true });

    await page.getByRole('button', { name: /Replay chapters/i }).click();
    await page.setViewportSize({ width: 390, height: 844 });
    for (const chapter of chapters) {
      await page.getByRole('button', { name: new RegExp(`Replay Chapter ${chapter.order}`) }).click();
      await enterChapter(page, chapter.title, `mobile-stage-${chapter.order}-${chapter.id}.png`);
      await completeChapter(page, chapter);
      await page.getByRole('button', { name: /Return to chapter selection/i }).click();
    }

    // The complete curriculum must also work when WebGL is unavailable.
    const fallback = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await fallback.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        return type === '2d' ? original.call(this, type, ...args) : null;
      };
    });
    await fallback.goto(baseUrl, { waitUntil: 'networkidle' });
    await fallback.getByRole('button', { name: /Let's Play|Start/i }).first().click();
    await fallback.getByRole('button', { name: /Play/i }).first().click();
    for (const chapter of chapters) {
      await enterChapter(fallback, chapter.title, `fallback-${chapter.id}.png`, false);
      await completeChapter(fallback, chapter, { keyboard: true });
      await fallback.getByRole('button', { name: /^Continue$/ }).click();
    }
    await fallback.getByRole('heading', { name: /neighbourhood is cleaner/i }).waitFor();
    await fallback.close();

    await page.getByRole('button', { name: /Open settings/i }).click();
    await page.getByLabel(/Reduced motion/i).check();
    await page.getByLabel(/Lower graphics/i).check();
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: /Reset progress/i }).click();

    if (consoleErrors.length > 0) throw new Error(`Console errors: ${consoleErrors.join('\n')}`);
    console.log(`Browser verification passed: every item sorted on desktop, mobile and without WebGL. Pixel check: ${JSON.stringify(pixelCheck)}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
