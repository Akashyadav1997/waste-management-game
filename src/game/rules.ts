import { getDestination } from '../data/bins';
import { getPreparationLabel, getWasteItem } from '../data/wasteItems';
import type { Chapter, Feedback, WasteItem } from './types';

export function isCorrectDestination(item: WasteItem, destinationId: string): boolean {
  const destination = getDestination(destinationId);
  if (!destination) return false;
  return destination.acceptedCategories.includes(item.category);
}

export function getFeedback(itemId: string, destinationId: string): Feedback {
  const item = getWasteItem(itemId);
  const destination = getDestination(destinationId);

  if (!item || !destination) {
    return {
      itemId,
      destinationId,
      correct: false,
      title: 'Try again',
      message: 'That choice is not available in this chapter.',
    };
  }

  const correct = isCorrectDestination(item, destinationId);
  if (correct) {
    const preparation = getPreparationLabel(item.preparation);
    return {
      itemId,
      destinationId,
      correct,
      title: 'Good sorting',
      message: `${item.explanation}${preparation ? ` Remember: ${preparation.toLowerCase()} before sorting.` : ''} ${destination.note}`,
    };
  }

  return {
    itemId,
    destinationId,
    correct,
    title: 'Almost',
    message: `${destination.label} is not the correct bin for this item. Hint: ${item.hint}`,
  };
}

export function chapterCompleted(chapter: Chapter, completedItemIds: string[]): boolean {
  return chapter.itemIds.every((itemId) => completedItemIds.includes(itemId));
}

export function nextUnlockedChapters(completedChapters: string[], allChapterIds: string[], completedChapterId: string): string[] {
  const unlocked = new Set<string>(['kitchen', ...completedChapters, completedChapterId]);
  for (const id of allChapterIds) {
    if (id === 'kitchen') unlocked.add(id);
  }
  return [...unlocked];
}
