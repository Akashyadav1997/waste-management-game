import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5173', { waitUntil: 'networkidle' });
  await mkdir('test-results', { recursive: true });
  for (const width of [1920, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1080 });
    for (const chapterId of ['school', 'kitchen', 'drain']) {
      await page.evaluate(async (id) => {
        const { useGameStore } = await import(performance.getEntriesByType('resource').find((entry) => entry.name.includes('/src/state/gameStore.ts'))?.name ?? '/src/state/gameStore.ts');
        useGameStore.getState().replayChapter(id);
        useGameStore.setState({ status: 'playing' });
      }, chapterId);
      await page.locator('canvas').waitFor().catch(async (error) => { console.log(errors, await page.locator('body').innerText()); throw error; });
      await page.locator('.scene-loading').waitFor({ state: 'hidden' });
      await page.waitForTimeout(500);
      const points = await page.evaluate(async () => {
        const fiberUrl = performance.getEntriesByType('resource').find((entry) => entry.name.includes('/@react-three_fiber.js?'))?.name;
        const { _roots } = await import(fiberUrl ?? '/node_modules/.vite/deps/@react-three_fiber.js');
        const { Vector3, Vector2, Raycaster } = await import('/node_modules/.vite/deps/three.js');
        const { useGameStore } = await import(performance.getEntriesByType('resource').find((entry) => entry.name.includes('/src/state/gameStore.ts'))?.name ?? '/src/state/gameStore.ts');
        const { getChapter } = await import('/src/data/chapters.ts');
        const { getWasteItem } = await import('/src/data/wasteItems.ts');
        const { binDropTarget, binUnderRay } = await import('/src/components/three/dragInteraction.ts');
        const canvas = document.querySelector('canvas');
        if (!_roots.get(canvas)) throw new Error(`Missing root: roots=${_roots.size}, canvas=${canvas?.outerHTML.slice(0, 150)}, url=${fiberUrl}`);
        const { scene, camera } = _roots.get(canvas).store.getState();
        let item = getWasteItem(getChapter(useGameStore.getState().chapterId).itemIds[0]);
        let object = scene.getObjectByName(`waste-${item.id}`);
        const rect = canvas.getBoundingClientRect();
        const project = (p) => {
          p.project(camera);
          return { x: rect.left + (p.x + 1) * rect.width / 2, y: rect.top + (1 - p.y) * rect.height / 2 };
        };
        const pickup = project(object.position.clone().add(new Vector3(0.02, 0.07, 0)));
        const ray = new Raycaster();
        ray.setFromCamera(new Vector2((pickup.x - rect.left) / rect.width * 2 - 1, 1 - (pickup.y - rect.top) / rect.height * 2), camera);
        const items = [];
        scene.traverse((node) => { if (node.name.startsWith('waste-')) items.push(node); });
        const hit = ray.intersectObjects(items, true)[0];
        if (hit) {
          object = hit.object;
          while (!object.name.startsWith('waste-')) object = object.parent;
          item = getWasteItem(object.name.slice(6));
        }
        if (!hit) throw new Error(`No pickup hit for ${item.id}`);
        window.dragProbe = { object, localGrab: object.worldToLocal(hit.point.clone()), camera, canvas };
        const bin = scene.getObjectByName(`${item.category}-bin`);
        if (!bin) throw new Error(`No bin for ${item.category}`);
        window.dragProbe.bin = bin;
        const bins = getChapter(useGameStore.getState().chapterId).destinationIds.map(id => scene.getObjectByName(id));
        let nearBin;
        for (const x of [-0.42, -0.35, 0.35, 0.42]) {
          for (const y of [0.2, 0.4, 0.55]) {
            const p = project(bin.localToWorld(new Vector3(x, y, 0.3)));
            if (p.x < rect.left || p.x > rect.right) continue;
            ray.setFromCamera(new Vector2((p.x - rect.left) / rect.width * 2 - 1, 1 - (p.y - rect.top) / rect.height * 2), camera);
            if (!binUnderRay(ray, bins) && binDropTarget(ray, bins) === bin.name) nearBin = p;
          }
        }
        if (!nearBin) throw new Error(`Could not find a forgiving body target in ${useGameStore.getState().chapterId}`);
        return { pickup, nearBin, bin: project(bin.localToWorld(new Vector3(0, 0.42, 0.23))), empty: { x: rect.left + rect.width / 2, y: rect.top + 180 } };
      });
      async function checkAlignment(point) {
        await page.mouse.move(point.x, point.y, { steps: 8 });
        await page.waitForTimeout(100);
        const gap = await page.evaluate(({ x, y }) => {
          const { object, localGrab, camera, canvas } = window.dragProbe;
          const p = object.localToWorld(localGrab.clone()).project(camera);
          const rect = canvas.getBoundingClientRect();
          return Math.hypot(rect.left + (p.x + 1) * rect.width / 2 - x, rect.top + (1 - p.y) * rect.height / 2 - y);
        }, point);
        if (gap > 2) await page.screenshot({ path: 'test-results/drag-failure.png' });
        if (gap > 2) throw new Error(`${chapterId}/${width}: grab drifted ${gap}px`);
      }
      await page.mouse.move(points.pickup.x, points.pickup.y);
      await page.mouse.down();
      await checkAlignment(points.empty);
      if (await page.evaluate(() => window.dragProbe.bin.children[0].scale.x > 1.01)) throw new Error('Empty space targeted a bin');
      await checkAlignment(points.bin);
      await page.waitForFunction(() => window.dragProbe.bin.children[0].scale.x > 1.01);
      if (await page.locator('.bin-drop-cue').count()) throw new Error('Unexpected drop message');
      if (await page.locator('.bin-guide').count()) throw new Error('Idle guide visible during drag');
      await page.screenshot({ path: `test-results/drag-${chapterId}-${width}.png` });
      // A cancellation over a bin must never sort the item.
      await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1 })));
      await page.mouse.up();
      const count = await page.evaluate(async () => (await import(performance.getEntriesByType('resource').find((entry) => entry.name.includes('/src/state/gameStore.ts'))?.name ?? '/src/state/gameStore.ts')).useGameStore.getState().completedItemIds.length);
      if (count) throw new Error('Cancelled drag sorted an item');
      await page.waitForTimeout(400);
      await page.mouse.move(points.pickup.x, points.pickup.y);
      await page.mouse.down();
      await page.mouse.move(points.nearBin.x, points.nearBin.y, { steps: 10 });
      await page.waitForFunction(() => window.dragProbe.bin.children[0].scale.x > 1.01);
      if (await page.locator('.bin-drop-cue').count()) throw new Error('Unexpected drop message');
      await page.waitForTimeout(200);
      const scale = await page.evaluate(() => window.dragProbe.bin.children[0].scale.x);
      if (scale < 1.06) throw new Error('Target bin did not grow');
      await page.screenshot({ path: `test-results/drag-near-bin-${chapterId}-${width}.png` });
      await page.mouse.up();
      await page.locator('.feedback-toast').getByText('Good sorting', { exact: true }).waitFor();
      console.log(`Verified smooth dragging, bin growth, nearby body drop and cancellation: ${chapterId}, ${width}px`);
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));
} finally { await browser.close(); }
