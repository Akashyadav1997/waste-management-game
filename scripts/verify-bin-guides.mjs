import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem('waste-management-game:v1', JSON.stringify({
      version: 1, completedChapters: ['kitchen', 'drain', 'road', 'school', 'flood'], unlockedChapters: [], lastChapterId: 'finale',
      settings: { narration: false, effects: false, reducedMotion: true },
    }));
  });
  await page.goto(process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5173', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /^Continue$/ }).click();
  await page.getByRole('button', { name: /Play Chapter 6/ }).click();
  await page.getByRole('button', { name: /^Next$/ }).click();
  await page.getByRole('button', { name: /^Let's help!$/ }).click();
  await page.locator('.scene-loading').waitFor({ state: 'hidden' });
  await page.waitForTimeout(500);
  async function scenePoints() {
    return page.evaluate(async () => {
      const { PerspectiveCamera, Vector3 } = await import('/node_modules/.vite/deps/three.js');
      const { frameCamera, getSceneFrame, getRoundItemSpots } = await import('/src/components/three/sceneLayout.ts');
      const rect = document.querySelector('canvas').getBoundingClientRect();
      const aspect = rect.width / rect.height;
      const camera = new PerspectiveCamera(38, aspect, 0.1, 40);
      frameCamera(camera, aspect, 'community');
      const project = (point) => {
        const ndc = point.project(camera);
        return { x: rect.left + (ndc.x + 1) * rect.width / 2, y: rect.top + (1 - ndc.y) * rect.height / 2 };
      };
      return {
        bins: getSceneFrame('community', aspect < 0.75).bins.map((p) => project(p.clone().add(new Vector3(0, 0.4, 0.22)))),
        item: project(getRoundItemSpots('community', aspect < 0.75)[0].clone().add(new Vector3(0, 0.09, 0))),
        empty: { x: rect.left + rect.width / 2, y: rect.top + 155 },
      };
    });
  }
  const points = await scenePoints();
  const names = ['Wet waste', 'Dry waste', 'Sanitary waste', 'Hazardous household waste'];
  for (let index = 0; index < 4; index += 1) {
    await page.mouse.move(points.bins[index].x, points.bins[index].y);
    await page.locator('.bin-guide').getByRole('heading', { name: names[index], exact: true }).waitFor();
  }
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/bin-guide-hazardous.png' });
  await page.mouse.move(points.empty.x, points.empty.y);
  await page.locator('.bin-guide').waitFor({ state: 'hidden' });

  // Selection through the menu must suppress scene guidance too.
  await page.getByRole('button', { name: /^Sort menu$/ }).click();
  await page.locator('.item-button').filter({ has: page.getByText('Banana peel', { exact: true }) }).click();
  await page.getByRole('button', { name: /^Hide menu$/ }).click();
  for (const bin of points.bins) {
    await page.mouse.move(bin.x, bin.y);
    if (await page.locator('.bin-guide').count()) throw new Error('Bin guide appeared with an item selected');
  }
  await page.mouse.click(points.empty.x, points.empty.y);
  await page.mouse.move(points.bins[3].x, points.bins[3].y);
  await page.locator('.bin-guide').waitFor();

  // Start a real canvas drag; the guide must stay hidden over the target bin.
  await page.mouse.move(points.item.x, points.item.y);
  await page.mouse.down();
  await page.mouse.move(points.bins[0].x, points.bins[0].y, { steps: 12 });
  if (await page.locator('.bin-guide').count()) throw new Error('Bin guide appeared during a drag');
  await page.mouse.up();
  await page.locator('.feedback-toast').getByText('Good sorting', { exact: true }).waitFor();
  await page.mouse.move(points.bins[3].x, points.bins[3].y);
  if (await page.locator('.bin-guide').count()) throw new Error('Bin guide overlapped feedback');
  await page.getByRole('button', { name: 'Dismiss message' }).click();

  // The responsive card must fit inside a narrow viewport as well.
  await page.setViewportSize({ width: 390, height: 844 });
  const mobile = await scenePoints();
  await page.mouse.move(mobile.empty.x, mobile.empty.y);
  await page.mouse.move(mobile.bins[3].x, mobile.bins[3].y);
  await page.locator('.bin-guide').waitFor();
  const card = await page.locator('.bin-guide').boundingBox();
  if (card.x < 0 || card.x + card.width > 390) throw new Error('Guide extends past the phone viewport');
  await page.screenshot({ path: 'test-results/bin-guide-mobile.png' });
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('Verified all four bin guides, pointer leave, selected-item suppression, real drag/drop, feedback suppression and mobile layout.');
} finally { await browser.close(); }
