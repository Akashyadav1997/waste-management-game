import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  page.setDefaultTimeout(15000);
  page.setDefaultNavigationTimeout(15000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error' && !message.location().url.endsWith('/favicon.ico')) errors.push(`${message.location().url}: ${message.text()}`); });
  await page.addInitScript(() => {
    localStorage.setItem('waste-management-game:v1', JSON.stringify({
      version: 1, completedChapters: ['kitchen'], unlockedChapters: ['kitchen', 'drain'], lastChapterId: 'drain',
      settings: { narration: false, effects: false, reducedMotion: true },
    }));
  });
  await page.goto(process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5173', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /Play Chapter 2/ }).click();
  await page.getByRole('button', { name: /^Next$/ }).click();
  await page.getByRole('button', { name: /^Let's help!$/ }).click();
  await page.waitForSelector('canvas');
  await page.locator('.scene-loading').waitFor({ state: 'hidden' });
  await page.waitForTimeout(1000);
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/bathroom-vanity-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/bathroom-vanity-mobile.png' });
  await page.getByRole('button', { name: /^Sort menu$/ }).click();
  for (let i = 0; i < 9; i += 1) {
    const item = page.locator('.item-button:not([disabled])').first();
    await item.click();
    const bin = /cotton|diaper|bandage|tissue/i.test(await item.innerText()) ? 'Sanitary waste' : 'Dry waste';
    await page.locator('.destination-button').filter({ has: page.getByText(bin, { exact: true }) }).click();
  }
  await page.getByText('Chapter complete!', { exact: true }).waitFor();
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('Bathroom preview saved; all 9 items sorted with no browser errors.');
} finally { await browser.close(); }
