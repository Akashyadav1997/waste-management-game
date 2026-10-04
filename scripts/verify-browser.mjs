import { mkdir } from 'node:fs/promises';
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

async function sortWithButtons(page, itemName, destinationName) {
  await page.getByRole('button', { name: new RegExp(itemName, 'i') }).click();
  await page.getByRole('button', { name: new RegExp(destinationName, 'i') }).click();
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
  await page.getByRole('button', { name: /^Next$/ }).click();
  await page.getByRole('button', { name: /^Let's help!$/ }).click();
  await page.waitForSelector('canvas');
  await page.screenshot({ path: 'test-results/kitchen-default.png', fullPage: true });
  await page.getByRole('button', { name: /^Sort menu$/ }).click();
  await page.screenshot({ path: 'test-results/kitchen-desktop.png', fullPage: true });

  const pixelCheck = await canvasHasPixels(page);
  if (!pixelCheck.ok) throw new Error(`Canvas pixel check failed: ${JSON.stringify(pixelCheck)}`);

  await sortWithButtons(page, 'Banana peel', 'Dry waste');
  await page.locator('.feedback-toast').getByText(/Hint/i).waitFor();
  await sortWithButtons(page, 'Banana peel', 'Wet waste');
  await page.locator('.feedback-toast').getByText(/Good sorting/i).waitFor();

  await page.getByRole('button', { name: /Clean paper/i }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: /Dry waste/i }).focus();
  await page.keyboard.press('Enter');
  await page.locator('.progress-pill').getByText(/2 of 6/i).waitFor();

  const remaining = [
    ['Vegetable peels', 'Wet waste'],
    ['Eggshells', 'Wet waste'],
    ['Clean cardboard', 'Dry waste'],
    ['Empty plastic bottle', 'Dry waste'],
  ];
  for (const [item, destination] of remaining) {
    await sortWithButtons(page, item, destination);
  }

  await page.getByText(/Chapter complete/i).waitFor();
  await page.screenshot({ path: 'test-results/chapter-complete.png', fullPage: true });
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByText(/No Waste in Drains/i).first().waitFor();

  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByText(/No Waste in Drains/i).first().waitFor();

  await page.getByRole('button', { name: /Open settings/i }).click();
  await page.getByLabel(/Reduced motion/i).check();
  await page.getByLabel(/Lower graphics/i).check();
  await page.getByRole('button', { name: /Close settings/i }).click();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await mobile.goto(baseUrl, { waitUntil: 'networkidle' });
  await mobile.screenshot({ path: 'test-results/mobile-title.png', fullPage: true });
  await mobile.getByRole('button', { name: /Let's Play|Start/i }).first().click();
  await mobile.getByRole('button', { name: /Play/i }).first().click();
  await mobile.getByRole('button', { name: /^Next$/ }).click();
  await mobile.getByRole('button', { name: /^Let's help!$/ }).click();
  await mobile.screenshot({ path: 'test-results/mobile-kitchen.png', fullPage: true });
  await mobile.close();

  await page.getByRole('button', { name: /Open settings/i }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: /Reset progress/i }).click();

  if (consoleErrors.length > 0) throw new Error(`Console errors: ${consoleErrors.join('\n')}`);
    console.log(`Browser verification passed. Pixel check: ${JSON.stringify(pixelCheck)}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
