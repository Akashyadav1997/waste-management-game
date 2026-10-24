// Visual inspection of the actual game meshes. Requires the Vite dev server.
import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5173', { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    const { createElement: h } = (await import('/node_modules/.vite/deps/react.js')).default;
    const { createRoot } = (await import('/node_modules/.vite/deps/react-dom_client.js')).default;
    const { Canvas } = await import('/node_modules/.vite/deps/@react-three_fiber.js');
    const { WasteShape } = await import('/src/components/three/WasteShapes.tsx');
    const root = document.createElement('div');
    root.style.cssText = 'position:fixed;inset:0;z-index:10000;background:#f7f3ea;padding:32px;font-family:system-ui;color:#263e34;';
    document.body.appendChild(root);
    const props = [
      ['banana', 'Banana peel', 'Connected yellow skin · cream inner fibres'],
      ['peels', 'Vegetable peels', 'Broad carrot, potato and onion skins'],
      ['eggshells', 'Eggshells', 'Thin cracked shells · pale interior'],
      ['containedSanitary', 'Wrapped used sanitary pad', 'Yellow sanitary bin · not ordinary paper'],
      ['tissue', 'Clean unused tissue', 'Blue dry bin'],
      ['usedTissue', 'Used cleaning tissue', 'Yellow sanitary bin'],
    ];
    createRoot(root).render(h('div', {},
      h('h1', { style: { margin: '0 0 8px', fontSize: '27px' } }, 'Waste model review'),
      h('p', { style: { margin: '0 0 24px' } }, 'Actual interactive 3D meshes used in the game'),
      h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' } }, ...props.map(([kind, title, caption]) => h('div', { key: kind, style: { background: '#eee8db', borderRadius: '20px', overflow: 'hidden' } },
        h('div', { style: { height: '320px' } }, h(Canvas, { shadows: true, camera: { position: [0.28, 0.6, 0.9], fov: 38 }, onCreated: ({ camera }) => camera.lookAt(0, 0.08, 0) },
          h('ambientLight', { intensity: 1.6 }),
          h('directionalLight', { position: [-2, 4, 3], intensity: 2.5, castShadow: true, 'shadow-mapSize': [1024, 1024] }),
          h('group', { scale: 1.35 }, h(WasteShape, { kind, variant: 'kitchen' })),
          h('mesh', { rotation: [-Math.PI / 2, 0, 0], position: [0, -0.015, 0], receiveShadow: true }, h('planeGeometry', { args: [200, 200] }), h('meshStandardMaterial', { color: '#eee8db', roughness: 1 })),
        )),
        h('div', { style: { padding: '16px 20px 22px', background: '#fffdf7' } }, h('strong', {}, title), h('p', { style: { margin: '7px 0 0', fontSize: '14px' } }, caption)),
      ))),
    ));
  });
  await page.waitForFunction(() => document.querySelectorAll('canvas').length === 6);
  await page.waitForTimeout(1800);
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/waste-model-review.png' });
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('Saved test-results/waste-model-review.png');
} finally { await browser.close(); }
