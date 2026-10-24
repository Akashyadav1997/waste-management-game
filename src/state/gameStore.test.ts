import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from './gameStore';
import { chapters } from '../data/chapters';
import { getWasteItem } from '../data/wasteItems';
import { getSortingRound } from '../game/rounds';
import { clearProgress } from './storage';

describe('game store state transitions', () => {
  beforeEach(() => {
    clearProgress();
    useGameStore.getState().resetProgress();
    useGameStore.getState().startNew();
    useGameStore.getState().startChapter('kitchen');
    useGameStore.setState({ status: 'playing' });
  });

  it('scores a correct item once and keeps the next item playable', () => {
    const first = useGameStore.getState().submitDestination('banana-peel', 'wet-bin');
    expect(first.correct).toBe(true);
    expect(useGameStore.getState().status).toBe('playing');
    expect(useGameStore.getState().completedItemIds).toEqual(['banana-peel']);
    expect(useGameStore.getState().sortedDestinations['banana-peel']).toBe('wet-bin');

    useGameStore.getState().submitDestination('banana-peel', 'wet-bin');
    expect(useGameStore.getState().completedItemIds).toEqual(['banana-peel']);

    useGameStore.getState().submitDestination('clean-paper', 'dry-bin');
    expect(useGameStore.getState().completedItemIds).toEqual(['banana-peel', 'clean-paper']);
  });

  it('allows another item after feedback is closed', () => {
    useGameStore.getState().submitDestination('banana-peel', 'wet-bin');
    useGameStore.getState().closeFeedback();
    useGameStore.getState().submitDestination('clean-paper', 'dry-bin');
    expect(useGameStore.getState().completedItemIds).toEqual(['banana-peel', 'clean-paper']);
  });

  it('rejects bins and items that are not available in the active chapter', () => {
    const wrongBin = useGameStore.getState().submitDestination('banana-peel', 'hazardous-bin');
    expect(wrongBin.correct).toBe(false);
    expect(wrongBin.message).toMatch(/not available/i);

    const wrongItem = useGameStore.getState().submitDestination('used-battery', 'hazardous-bin');
    expect(wrongItem.correct).toBe(false);
    expect(useGameStore.getState().completedItemIds).toEqual([]);
  });
});


it('rejects hidden-round items and completes only after every chapter item is sorted', () => {
  useGameStore.getState().resetProgress();
  useGameStore.getState().startNew();
  for (const chapter of chapters) {
    useGameStore.getState().startChapter(chapter.id);
    useGameStore.setState({ status: 'playing' });
    const hiddenId = chapter.itemIds[chapter.itemsPerRound ?? 3];
    useGameStore.getState().selectItem(hiddenId);
    expect(useGameStore.getState().selectedItemId).toBeUndefined();
    expect(useGameStore.getState().submitDestination(hiddenId, `${getWasteItem(hiddenId)!.category}-bin`).correct).toBe(false);
    expect(useGameStore.getState().completedItemIds).toEqual([]);
    for (const id of chapter.itemIds) {
      const state = useGameStore.getState();
      expect(state.status).toBe('playing');
      expect(getSortingRound(chapter, state.completedItemIds).itemIds).toContain(id);
      expect(state.submitDestination(id, `${getWasteItem(id)!.category}-bin`).correct).toBe(true);
    }
    expect(useGameStore.getState().status).toBe('chapterComplete');
    expect(useGameStore.getState().completedChapters).toContain(chapter.id);
  }
  useGameStore.getState().replayChapter('kitchen');
  expect(useGameStore.getState().completedItemIds).toEqual([]);
});
