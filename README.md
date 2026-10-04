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
- `src/data/bins.ts`: replaceable bin and destination scheme.
- `src/data/chapters.ts`: story chapter configuration.
- `src/game/rules.ts`: classification and validation rules.
- `src/game/audio.ts`: replaceable local audio controller for effects, browser narration and optional ambience.
- `src/game/progression.ts`: unlock and duplicate-scoring helpers.
- `src/state/storage.ts`: versioned local-storage parsing and recovery.
- `src/state/gameStore.ts`: Zustand game state.
- `src/components/three/GameScene.tsx`: procedural Three.js/R3F scene, Jyoti, bins and draggable items.
- `src/components`: accessible HTML screens, HUD, settings and controls.

## Classification Assumptions

The game uses wet, dry, sanitary and special-care categories. This follows current Indian four-stream source segregation guidance from CPCB/PIB:

- https://www.swm.cpcb.gov.in/
- https://www.pib.gov.in/PressReleasePage.aspx?PRID=2219676&lang=1&reg=3

Green and blue are commonly used for wet and dry waste. The game labels every destination with text and symbols because color meanings for sanitary and special-care streams can vary by local body. The color scheme is data-driven in `src/data/bins.ts`.

The game does not teach that every dry item is recyclable. Packaging such as toothpaste tubes and sachets is treated as dry packaging while explaining that it must never enter drains and may need local handling decisions.

## Asset Credits

Kitchen furniture, characters, bins and waste items are original geometry and canvas textures built in this project. See `ASSETS.md` for the checklist, reviewed CC0 sources that were not bundled, and the remaining character gap. The title illustration is `public/assets/landing-hero.jpg`.

## Known Limitations

- Browser text-to-speech quality depends on the user's browser and installed voices.
- The first production bundle includes a separate Three.js chunk, but the game does not yet lazy-load chapters individually.
- `test-results/` contains local browser verification screenshots after `npm run verify:browser`.
- Character art is original stylised geometry. It has faces, hair, clothing and hands, but it is not a sculpted film-quality GLB. Blender is not available in this workspace, and the reviewed CC0 character packs are low-poly rather than the smooth animated style of the title image.
