import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from './gameStore';
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
});
