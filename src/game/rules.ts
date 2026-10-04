import { getDestination } from '../data/bins';
import { getWasteItem } from '../data/wasteItems';
import type { Chapter, Feedback, WasteItem } from './types';

export function isCorrectDestination(item: WasteItem, destinationId: string): boolean {
  const destination = getDestination(destinationId);
  if (!destination) return false;
  if (item.validDestinations) return item.validDestinations.includes(destinationId);
  if (destination.alwaysInvalid) return false;
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
    return {
      itemId,
      destinationId,
      correct,
      title: 'Good sorting',
      message: destination.alwaysInvalid ? item.explanation : `${item.explanation} ${destination.note}`,
    };
  }

  const drainMessage =
    destination.kind === 'drain'
      ? 'Packaging in a drain can catch other litter, block water flow and make streets flood.'
      : destination.kind === 'roadside'
        ? 'Waste left beside the road can scatter near shops and bring animals close to rubbish.'
        : destination.acceptedCategories.length > 0
          ? `This destination is for ${destination.acceptedCategories.join(', ')} waste.`
          : destination.note;

  return {
    itemId,
    destinationId,
    correct,
    title: 'Almost',
    message: `${drainMessage} Hint: ${item.hint}`,
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
