import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5173', { waitUntil: 'networkidle' });
  await mkdir('test-results', { recursive: true });
  for (const [width, height] of [[1280, 720], [1366, 768], [1440, 900], [1920, 1080], [1024, 768], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.getByRole('heading', { name: 'Meet the four bins' }).waitFor();
    if (await page.locator('.landing-bin-card').count() !== 4) throw new Error('Missing bin cards');
    const overflow = await page.evaluate(() => ({ horizontal: document.documentElement.scrollWidth > innerWidth, vertical: document.documentElement.scrollHeight > innerHeight }));
    if (overflow.horizontal || (width >= 1024 && overflow.vertical)) throw new Error(`Unnecessary scrolling at ${width}x${height}: ${JSON.stringify(overflow)}`);
    await page.screenshot({ path: `test-results/landing-${width}.png` });
  }
  await page.getByRole('button', { name: "Let's Play", exact: true }).click();
  await page.getByRole('heading', { name: "Choose Jyoti's next stop" }).waitFor();
  if (await page.getByRole('button', { name: /home|landing/i }).count() !== 1) throw new Error('Expected just one back button');
  await page.screenshot({ path: 'test-results/chapters-navigation.png', fullPage: true });
  await page.getByRole('button', { name: 'Return to home screen' }).click();
  await page.getByRole('heading', { name: 'Jyoti’s Clean World', exact: true }).waitFor();
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('Verified landing content and layout at desktop, tablet and phone sizes; one working Home button.');
} finally { await browser.close(); }
