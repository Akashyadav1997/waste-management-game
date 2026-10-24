import { describe, expect, it } from 'vitest';
import { chapters } from '../data/chapters';
import { getSortingRound, ITEMS_PER_ROUND } from './rounds';
import { chapterCompleted } from './rules';

describe('sorting rounds', () => {
  it.each(chapters)('$id makes every item reachable without overcrowding the scene', (chapter) => {
    const completed: string[] = [];
    const visited: string[] = [];
    const size = chapter.itemsPerRound ?? ITEMS_PER_ROUND;
    const total = Math.ceil(chapter.itemIds.length / size);
    for (let index = 0; index < total; index += 1) {
      const round = getSortingRound(chapter, completed);
      expect(round.index).toBe(index);
      expect(round.itemIds.length).toBeGreaterThan(0);
      expect(round.itemIds.length).toBeLessThanOrEqual(size);
      expect(chapterCompleted(chapter, completed)).toBe(false);
      // Sort in reverse order: the remaining props must not move to new slots.
      for (const id of [...round.itemIds].reverse()) {
        expect(getSortingRound(chapter, completed).itemIds).toEqual(round.itemIds);
        completed.push(id);
        visited.push(id);
      }
    }
    expect(new Set(visited).size).toBe(chapter.itemIds.length);
    expect([...visited].sort()).toEqual([...chapter.itemIds].sort());
    expect(chapterCompleted(chapter, completed)).toBe(true);
    expect(getSortingRound(chapter, completed).index).toBe(total - 1);
    expect(getSortingRound(chapter, []).index).toBe(0);
  });
});


it('opens the kitchen with all six original props while retaining the extra items', () => {
  const chapter = chapters[0];
  expect(getSortingRound(chapter, []).itemIds).toEqual([
    'banana-peel', 'vegetable-peels', 'eggshells', 'clean-paper', 'clean-cardboard', 'empty-plastic-bottle',
  ]);
  expect(chapter.itemIds).toHaveLength(15);
  expect(getSortingRound(chapter, []).total).toBe(3);
});
