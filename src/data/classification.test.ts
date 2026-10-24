import { describe, expect, it } from 'vitest';
import { isCorrectDestination } from '../game/rules';
import { binScheme, destinations, getDestination } from './bins';
import { chapters, getChapter } from './chapters';
import { getWasteItem, wasteItems } from './wasteItems';

const expectedBins = [
  { id: 'wet-bin', label: 'Wet waste', color: '#178A45', category: 'wet' },
  { id: 'dry-bin', label: 'Dry waste', color: '#1D4ED8', category: 'dry' },
  { id: 'sanitary-bin', label: 'Sanitary waste', color: '#FFFF00', category: 'sanitary' },
  { id: 'hazardous-bin', label: 'Hazardous household waste', color: '#FF0000', category: 'hazardous' },
] as const;

describe('four-bin classification data', () => {
  it('keeps the supplied names, colors and categories as the canonical scheme', () => {
    expect(binScheme).toHaveLength(4);
    expectedBins.forEach((expected) => {
      expect(getDestination(expected.id)).toMatchObject({
        id: expected.id,
        label: expected.label,
        color: expected.color,
        kind: 'bin',
        acceptedCategories: [expected.category],
      });
    });
  });

  it('contains no narrative actions disguised as bins', () => {
    expect(destinations.every((destination) => destination.kind === 'bin')).toBe(true);
    expect(destinations.map((destination) => destination.id)).toEqual(expectedBins.map((bin) => bin.id));
  });

  it('gives every playable item exactly one correct bin', () => {
    wasteItems.forEach((item) => {
      const matches = destinations.filter((destination) => isCorrectDestination(item, destination.id));
      expect(matches.map((destination) => destination.id), item.id).toHaveLength(1);
    });
  });

  it('keeps chapter and item membership in sync and always shows the correct bin', () => {
    chapters.forEach((chapter) => {
      expect(new Set(chapter.itemIds).size, `${chapter.id} item IDs`).toBe(chapter.itemIds.length);
      expect(new Set(chapter.destinationIds).size, `${chapter.id} bin IDs`).toBe(chapter.destinationIds.length);

      chapter.destinationIds.forEach((destinationId) => {
        expect(getDestination(destinationId), `${chapter.id}/${destinationId}`).toBeDefined();
      });

      chapter.itemIds.forEach((itemId) => {
        const item = getWasteItem(itemId);
        expect(item, `${chapter.id}/${itemId}`).toBeDefined();
        expect(item?.chapters, `${chapter.id}/${itemId} reverse membership`).toContain(chapter.id);
        const correctBin = destinations.find((destination) => item && isCorrectDestination(item, destination.id));
        expect(chapter.destinationIds, `${chapter.id}/${itemId} correct bin`).toContain(correctBin?.id);
      });
    });

    wasteItems.forEach((item) => {
      item.chapters.forEach((chapterId) => {
        expect(getChapter(chapterId)?.itemIds, `${item.id}/${chapterId} forward membership`).toContain(item.id);
      });
    });
  });

  it('uses preparation requirements for clean plastic and wrapped sanitary waste', () => {
    expect(getWasteItem('empty-plastic-bottle')?.preparation).toBe('rinseClean');
    expect(getWasteItem('milk-pouch')?.preparation).toBe('rinseClean');
    expect(getWasteItem('contained-sanitary')?.preparation).toBe('wrapSafely');
  });
});

// Explicit curriculum coverage: adding a catalogue entry without making it playable must fail.
const requiredItems = {
  wet: ['banana-peel', 'vegetable-peels', 'fruit-offcuts', 'vegetable-offcuts', 'spoiled-produce', 'coffee-grounds', 'paper-coffee-filter', 'plastic-free-tea-bag', 'stale-bread', 'pasta', 'cereals', 'plain-baked-bread', 'cooked-leftovers', 'meat-scraps', 'fish-scraps', 'dairy', 'eggshells', 'nut-shells', 'plant-leaves', 'fresh-flowers', 'dry-leaves', 'dry-flowers', 'packing-straw', 'wooden-ice-cream-stick', 'biodegradable-plate', 'biodegradable-cup', 'biodegradable-glass', 'pencil-shavings'],
  dry: ['clean-paper', 'clean-tissue', 'clean-cardboard', 'newspaper', 'notebook', 'empty-plastic-bottle', 'plastic-pen', 'plastic-container', 'plastic-bag', 'milk-pouch', 'glass-bottle', 'broken-glass', 'razor', 'stapler-pins', 'metal-can', 'aluminium-foil', 'aluminium-tab', 'soda-can', 'old-clothes', 'fabric-scraps', 'rubber-material', 'broom-sticks', 'thermocol', 'plastic-straw', 'plastic-plate', 'plastic-cup', 'plastic-glass', 'eraser'],
  sanitary: ['used-diaper', 'contained-sanitary', 'bandage', 'cotton-buds', 'used-tissue'],
  hazardous: ['used-battery', 'electronics', 'cleaning-chemical', 'paint', 'insecticide', 'expired-medicine', 'thermometer', 'light-bulb', 'tube-light', 'cfl'],
};

it('covers every requested material in a playable stage and the clarified category', () => {
  expect(new Set(wasteItems.map((item) => item.id)).size).toBe(wasteItems.length);
  Object.entries(requiredItems).forEach(([category, ids]) => ids.forEach((id) => {
    const item = getWasteItem(id);
    expect(item?.category, id).toBe(category);
    expect(item?.chapters.length, id).toBeGreaterThan(0);
    expect(chapters.some((chapter) => chapter.itemIds.includes(id)), id).toBe(true);
    expect(item?.hint.length, id).toBeGreaterThan(10);
    expect(item?.handling.length, id).toBeGreaterThan(10);
  }));
});

it('teaches preparation for sharp objects and used hygiene items', () => {
  ['broken-glass', 'razor', 'stapler-pins', 'used-diaper', 'contained-sanitary', 'bandage', 'used-tissue'].forEach((id) => {
    expect(getWasteItem(id)?.preparation, id).toBe('wrapSafely');
  });
  ['plastic-container', 'milk-pouch', 'glass-bottle', 'metal-can', 'soda-can', 'plastic-plate', 'plastic-cup', 'plastic-glass'].forEach((id) => {
    expect(getWasteItem(id)?.preparation, id).toBe('rinseClean');
  });
});

it('gives visually different materials different models', () => {
  [['plant-leaves', 'vegetable-peels'], ['cooked-leftovers', 'fruit-offcuts'], ['milk-pouch', 'shampoo-sachet'], ['clean-tissue', 'used-tissue'], ['packing-straw', 'plastic-straw'], ['biodegradable-plate', 'plastic-plate'], ['biodegradable-cup', 'plastic-cup'], ['pencil-shavings', 'eraser']].forEach(([first, second]) => {
    expect(getWasteItem(first)?.model, `${first}/${second}`).not.toBe(getWasteItem(second)?.model);
  });
});

it('classifies the contents, not whether an item is wrapped in paper', () => {
  for (const id of ['clean-paper', 'clean-tissue']) {
    expect(isCorrectDestination(getWasteItem(id)!, 'dry-bin'), id).toBe(true);
    expect(isCorrectDestination(getWasteItem(id)!, 'sanitary-bin'), id).toBe(false);
  }
  for (const id of ['used-tissue', 'contained-sanitary']) {
    expect(isCorrectDestination(getWasteItem(id)!, 'sanitary-bin'), id).toBe(true);
    expect(isCorrectDestination(getWasteItem(id)!, 'dry-bin'), id).toBe(false);
  }
  expect(getWasteItem('contained-sanitary')?.displayName).toContain('sanitary pad');
  expect(getWasteItem('broken-glass')?.preparation).toBe('wrapSafely');
  expect(isCorrectDestination(getWasteItem('broken-glass')!, 'dry-bin')).toBe(true);
});
