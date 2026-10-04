import { chapters, nextChapterId } from '../data/chapters';

export function calculateUnlocked(completedChapters: string[]): string[] {
  const completed = new Set(completedChapters);
  const unlocked = new Set<string>(['kitchen']);
  for (const chapter of chapters) {
    if (!chapter.unlockAfter || completed.has(chapter.unlockAfter)) {
      unlocked.add(chapter.id);
    }
  }
  return [...unlocked];
}

export function getNextPlayableChapter(currentChapterId: string, completedChapters: string[]): string | undefined {
  const next = nextChapterId(currentChapterId);
  if (!next) return undefined;
  return calculateUnlocked(completedChapters).includes(next) ? next : undefined;
}

export function addCompletedItem(completed: string[], itemId: string): string[] {
  return completed.includes(itemId) ? completed : [...completed, itemId];
}

export function addCompletedChapter(completed: string[], chapterId: string): string[] {
  return completed.includes(chapterId) ? completed : [...completed, chapterId];
}
