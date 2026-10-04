# Kitchen asset checklist

The approved look is the smooth, warm animated kitchen in `public/assets/landing-hero.jpg`. Blender is not installed here, so these assets are original Three.js geometry and canvas textures loaded directly by the scene. No third-party model file is bundled.

Reviewed and not used, because the style is low-poly rather than the smooth clay look of the reference:

- Quaternius Animated Women Pack and Ultimate House Interior Pack. Public domain (CC0). https://quaternius.com/
- Kenney character and furniture kits. Public domain (CC0). https://kenney.nl/

| Asset | Approach | Licence |
| --- | --- | --- |
| Mum and Jyoti | Original meshes: child and adult proportions, hair, clothing, hands, eyes, smile and bindi. `src/components/three/Characters.tsx` | Original project art |
| Refrigerator | Original yellow body, separate doors, seam, metal handles and feet. `KitchenSet.tsx` | Original project art |
| Cabinets, table, stove, sink | Original blue cabinets, wood counters and table, burners, oven door, pot, basin and tap | Original project art |
| Green and blue bins | Original open bins with wheels, hinged lids and painted labels | Original project art |
| Banana peel, food peels, eggshells, paper, cardboard, bottle | Original ribbons, jagged shells, paper and cardboard textures, transparent bottle | Original project art |
| Decorative props | Jars, plates, utensils, windowsill plant and cookware | Original project art |
| Dialogue portrait | Original SVG of Mum, matching the 3D costume colours | Original project art |
| Wood, fabric and paint | Original canvas textures in `textures.ts` | Original project art |

## Remaining gap

Mum and Jyoti are developed enough to read as a child and an adult in the kitchen, with faces, braids or a bun, clothing and hands. They are still built from smooth primitives, not a sculpted character GLB with facial blend shapes. That is the honest limit of this workspace: no modeller is installed, and the available CC0 characters would move the scene away from the approved style.
