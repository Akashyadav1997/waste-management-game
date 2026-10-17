# Waste Management Game

A playable 3D educational browser game for children around ages 7-12. Jyoti learns waste segregation through six short chapters set in Indian home, school and neighbourhood scenes.

## Setup

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run verify:browser
```

## Controls

- Mouse or touch: drag an item toward a destination, or tap an item and then tap a destination.
- Keyboard and screen readers: use the item and destination buttons in the right-side controls.
- Settings: sound, narration, reduced motion and lower graphics.
- Gameplay dialogue: chapter intros appear in a centered card; in-play instructions appear in a compact bottom dialogue. The optional Sort menu provides accessible item and destination controls.
- Progress is saved in local storage. Reset progress is available from the top bar and title/settings flow.

## Architecture

- `src/data/wasteItems.ts`: typed item catalog with category, model kind, hints, explanations, handling instructions and chapter availability.
- `src/data/bins.ts`: canonical four-bin names, colors and category rules.
- `src/data/chapters.ts`: story chapter configuration.
- `src/game/rules.ts`: classification and validation rules.
- `src/game/audio.ts`: replaceable local audio controller for effects, browser narration and optional ambience.
- `src/game/progression.ts`: unlock and duplicate-scoring helpers.
- `src/state/storage.ts`: versioned local-storage parsing and recovery.
- `src/state/gameStore.ts`: Zustand game state.
- `src/components/three/GameScene.tsx`: procedural Three.js/R3F scene, Jyoti, bins and draggable items.
- `src/components`: accessible HTML screens, HUD, settings and controls.

## Classification Assumptions

The game follows the supplied four-bin project matrix, with supporting Indian source-segregation references from CPCB/PIB:

- https://www.swm.cpcb.gov.in/
- https://www.pib.gov.in/PressReleasePage.aspx?PRID=2219676&lang=1&reg=3

The canonical project colors are vivid green (`#178A45`) for wet waste, vivid blue (`#1D4ED8`) for dry waste, yellow (`#FFFF00`) for sanitary waste and red (`#FF0000`) for hazardous household waste. Every bin also has a written label and symbol so sorting never depends on color alone.

“Rinse clean” and “Wrap safely” are item preparation requirements, not extra bins. The game does not teach that every dry item is recyclable. Empty packaging is treated as dry waste according to the supplied matrix while explaining that it must never enter drains.

## Asset Credits

Kitchen furniture, characters, bins and waste items are original geometry and canvas textures built in this project. See `ASSETS.md` for the checklist, reviewed CC0 sources that were not bundled, and the remaining character gap. The title illustration is `public/assets/landing-hero.jpg`.

## Known Limitations

- Browser text-to-speech quality depends on the user's browser and installed voices.
- The first production bundle includes a separate Three.js chunk, but the game does not yet lazy-load chapters individually.
- `test-results/` contains local browser verification screenshots after `npm run verify:browser`.
- Character art is original stylised geometry. It has faces, hair, clothing and hands, but it is not a sculpted film-quality GLB. Blender is not available in this workspace, and the reviewed CC0 character packs are low-poly rather than the smooth animated style of the title image.
