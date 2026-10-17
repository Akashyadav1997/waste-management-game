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
