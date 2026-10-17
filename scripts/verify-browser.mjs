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

async function enterChapter(page, title, screenshotName) {
  await page.getByRole('heading', { name: title, exact: true }).waitFor();
  await page.getByRole('button', { name: /^Next$/ }).click();
  await page.getByRole('button', { name: /^Let's help!$/ }).click();
  await page.waitForSelector('canvas');
  await page.screenshot({ path: `test-results/${screenshotName}`, fullPage: true });
}

async function openSortMenu(page, firstItemName) {
  const firstItem = page.getByRole('button', { name: new RegExp(firstItemName, 'i') });
  if (!(await firstItem.isVisible().catch(() => false))) {
    await page.getByRole('button', { name: /^Sort menu$/ }).click();
  }
  await firstItem.waitFor();
}

async function completeChapter(page, pairs) {
  await openSortMenu(page, pairs[0][0]);
  for (const [item, bin] of pairs) {
    await sortWithButtons(page, item, bin);
  }
  await page.getByText(/Chapter complete/i).waitFor();
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

    await enterChapter(page, 'Breakfast Sorting', 'stage-1-kitchen.png');
    const pixelCheck = await canvasHasPixels(page);
    if (!pixelCheck.ok) throw new Error(`Canvas pixel check failed: ${JSON.stringify(pixelCheck)}`);
    await openSortMenu(page, 'Banana peel');
    await sortWithButtons(page, 'Banana peel', 'Dry waste');
    await page.locator('.feedback-toast').getByText(/Hint/i).waitFor();
    await sortWithButtons(page, 'Banana peel', 'Wet waste');
    await page.locator('.feedback-toast').getByText(/Good sorting/i).waitFor();
    await page.getByRole('button', { name: /Clean paper/i }).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: /Dry waste/i }).focus();
    await page.keyboard.press('Enter');
    await completeChapter(page, [
      ['Vegetable peels', 'Wet waste'],
      ['Eggshells', 'Wet waste'],
      ['Clean cardboard box', 'Dry waste'],
      ['Empty plastic bottle', 'Dry waste'],
    ]);
    await page.screenshot({ path: 'test-results/stage-1-complete.png', fullPage: true });
    await page.getByRole('button', { name: /^Continue$/ }).click();

    await enterChapter(page, 'No Waste in Drains', 'stage-2-bathroom.png');
    await completeChapter(page, [
      ['Empty toothpaste tube', 'Dry waste'],
      ['Empty shampoo sachet', 'Dry waste'],
      ['Empty plastic bottle', 'Dry waste'],
      ['Empty plastic soap wrapper', 'Dry waste'],
      ['Empty soap box', 'Dry waste'],
      ['Used cotton buds', 'Sanitary waste'],
    ]);
    await page.getByRole('button', { name: /^Continue$/ }).click();

    await enterChapter(page, 'Collection Time', 'stage-3-collection.png');
    await completeChapter(page, [
      ['Fruit offcuts', 'Wet waste'],
      ['Empty plastic bag', 'Dry waste'],
      ['Newspaper', 'Dry waste'],
      ['Cooked leftovers', 'Wet waste'],
    ]);
    await page.getByRole('button', { name: /^Continue$/ }).click();

    await enterChapter(page, 'School Courtyard', 'stage-4-school.png');
    await completeChapter(page, [
      ['Clean paper', 'Dry waste'],
      ['Empty plastic snack wrapper', 'Dry waste'],
      ['Banana peel', 'Wet waste'],
    ]);
    await page.getByRole('button', { name: /^Continue$/ }).click();

    await enterChapter(page, 'Blocked Street Drain', 'stage-5-flood.png');
    await completeChapter(page, [
      ['Empty plastic snack wrapper', 'Dry waste'],
      ['Empty plastic bottle', 'Dry waste'],
      ['Empty milk pouch', 'Dry waste'],
      ['Plant leaves', 'Wet waste'],
    ]);
    await page.getByRole('button', { name: /^Continue$/ }).click();

    await enterChapter(page, 'Neighbourhood Challenge', 'stage-6-four-bins.png');
    await completeChapter(page, [
      ['Banana peel', 'Wet waste'],
      ['Clean paper', 'Dry waste'],
      ['Empty plastic bottle', 'Dry waste'],
      ['Empty toothpaste tube', 'Dry waste'],
      ['Safely wrapped sanitary napkin', 'Sanitary waste'],
      ['Used battery', 'Hazardous household waste'],
    ]);
    await page.getByRole('button', { name: /^Continue$/ }).click();
    await page.getByRole('heading', { name: /neighbourhood is cleaner/i }).waitFor();
    await page.screenshot({ path: 'test-results/all-stages-complete.png', fullPage: true });

    await page.getByRole('button', { name: /Replay chapters/i }).click();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: /Replay Chapter 5/i }).click();
    await enterChapter(page, 'Blocked Street Drain', 'mobile-stage-5-flood.png');
    await page.getByRole('button', { name: /Return to chapter selection/i }).click();
    await page.getByRole('button', { name: /Replay Chapter 6/i }).click();
    await enterChapter(page, 'Neighbourhood Challenge', 'mobile-stage-6-four-bins.png');

    await page.getByRole('button', { name: /Open settings/i }).click();
    await page.getByLabel(/Reduced motion/i).check();
    await page.getByLabel(/Lower graphics/i).check();
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
