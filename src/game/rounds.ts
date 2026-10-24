import type { Chapter } from './types';

// Fixed groups keep an item's position stable until its whole round is complete.
export const ITEMS_PER_ROUND = 3;

export function getSortingRound(chapter: Pick<Chapter, 'itemIds' | 'itemsPerRound'>, completedItemIds: string[]) {
  const size = chapter.itemsPerRound ?? ITEMS_PER_ROUND;
  const total = Math.max(1, Math.ceil(chapter.itemIds.length / size));
  const firstRemaining = chapter.itemIds.findIndex((id) => !completedItemIds.includes(id));
  const index = firstRemaining < 0 ? total - 1 : Math.floor(firstRemaining / size);
  return { index, total, itemIds: chapter.itemIds.slice(index * size, (index + 1) * size) };
}
