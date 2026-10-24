import { getSortingRound } from '../game/rounds';
import { create } from 'zustand';
import { chapters, firstChapterId, getChapter } from '../data/chapters';
import { addCompletedChapter, addCompletedItem, calculateUnlocked } from '../game/progression';
import { chapterCompleted, getFeedback } from '../game/rules';
import type { Feedback, GameSettings, GameStatus, SavedProgress } from '../game/types';
import { clearProgress, createDefaultSave, defaultSettings, loadProgress, saveProgress } from './storage';

type Screen = 'title' | 'chapters' | 'game' | 'complete';

type GameState = {
  screen: Screen;
  status: GameStatus;
  chapterId: string;
  selectedItemId?: string;
  completedItemIds: string[];
  sortedDestinations: Record<string, string>;
  completedChapters: string[];
  unlockedChapters: string[];
  feedback?: Feedback;
  settings: GameSettings;
  saveAvailable: boolean;
  busy: boolean;
  hydrate: () => void;
  startNew: () => void;
  continueGame: () => void;
  openChapters: () => void;
  openTitle: () => void;
  startChapter: (chapterId: string) => void;
  replayChapter: (chapterId: string) => void;
  selectItem: (itemId?: string) => void;
  submitDestination: (itemId: string, destinationId: string) => Feedback;
  closeFeedback: () => void;
  completeChapter: () => void;
  goNext: () => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  resetProgress: () => void;
};

function persist(state: Pick<GameState, 'completedChapters' | 'unlockedChapters' | 'chapterId' | 'settings'>): void {
  const progress: SavedProgress = {
    version: 1,
    completedChapters: state.completedChapters,
    unlockedChapters: state.unlockedChapters,
    lastChapterId: state.chapterId,
    settings: state.settings,
  };
  saveProgress(progress);
}

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'title',
  status: 'intro',
  chapterId: firstChapterId,
  completedItemIds: [],
  sortedDestinations: {},
  completedChapters: [],
  unlockedChapters: [firstChapterId],
  settings: defaultSettings,
  saveAvailable: false,
  busy: false,
  hydrate: () => {
    const progress = loadProgress();
    set({
      completedChapters: progress.completedChapters,
      unlockedChapters: progress.unlockedChapters,
      chapterId: progress.lastChapterId ?? firstChapterId,
      settings: progress.settings,
      saveAvailable: progress.completedChapters.length > 0 || Boolean(progress.lastChapterId),
    });
  },
  startNew: () => {
    clearProgress();
    const fresh = createDefaultSave();
    set({
      screen: 'chapters',
      status: 'intro',
      chapterId: firstChapterId,
      selectedItemId: undefined,
      completedItemIds: [],
      sortedDestinations: {},
      completedChapters: fresh.completedChapters,
      unlockedChapters: fresh.unlockedChapters,
      feedback: undefined,
      settings: fresh.settings,
      saveAvailable: false,
      busy: false,
    });
  },
  continueGame: () => {
    const progress = loadProgress();
    const chapterId = progress.lastChapterId && progress.unlockedChapters.includes(progress.lastChapterId) ? progress.lastChapterId : firstChapterId;
    set({
      screen: 'chapters',
      status: 'intro',
      chapterId,
      completedChapters: progress.completedChapters,
      unlockedChapters: progress.unlockedChapters,
      settings: progress.settings,
      saveAvailable: true,
    });
  },
  openChapters: () => set({ screen: 'chapters', status: 'intro', selectedItemId: undefined, feedback: undefined }),
  openTitle: () => set({ screen: 'title', status: 'intro', selectedItemId: undefined, feedback: undefined }),
  startChapter: (chapterId) => {
    if (!get().unlockedChapters.includes(chapterId)) return;
    set({
      screen: 'game',
      status: 'intro',
      chapterId,
      selectedItemId: undefined,
      completedItemIds: [],
      sortedDestinations: {},
      feedback: undefined,
      busy: false,
    });
    persist({ ...get(), chapterId });
  },
  replayChapter: (chapterId) => {
    set({
      screen: 'game',
      status: 'intro',
      chapterId,
      selectedItemId: undefined,
      completedItemIds: [],
      sortedDestinations: {},
      feedback: undefined,
      busy: false,
    });
  },
  selectItem: (itemId) => {
    const state = get();
    if (state.busy || state.status !== 'playing' || state.completedItemIds.includes(itemId ?? '')) return;
    const chapter = getChapter(state.chapterId);
    if (itemId && (!chapter || !getSortingRound(chapter, state.completedItemIds).itemIds.includes(itemId))) return;
    set({ selectedItemId: itemId, status: itemId ? 'playing' : get().status });
  },
  submitDestination: (itemId, destinationId) => {
    const state = get();
    const chapter = getChapter(state.chapterId);
    if (state.busy || state.status !== 'playing' || !chapter || state.completedItemIds.includes(itemId)) {
      return state.feedback ?? getFeedback(itemId, destinationId);
    }

    if (!getSortingRound(chapter, state.completedItemIds).itemIds.includes(itemId) || !chapter.destinationIds.includes(destinationId)) {
      return {
        itemId,
        destinationId,
        correct: false,
        title: 'Try again',
        message: 'That item or bin is not available in this chapter.',
      };
    }

    const feedback = getFeedback(itemId, destinationId);
    const completedItemIds = feedback.correct ? addCompletedItem(state.completedItemIds, itemId) : state.completedItemIds;
    const sortedDestinations = feedback.correct ? { ...state.sortedDestinations, [itemId]: destinationId } : state.sortedDestinations;
    const nextStatus = feedback.correct && chapterCompleted(chapter, completedItemIds) ? 'chapterComplete' : 'playing';
    const completedChapters =
      nextStatus === 'chapterComplete' ? addCompletedChapter(state.completedChapters, chapter.id) : state.completedChapters;
    const unlockedChapters = calculateUnlocked(completedChapters);

    set({
      feedback,
      completedItemIds,
      sortedDestinations,
      selectedItemId: undefined,
      status: nextStatus,
      completedChapters,
      unlockedChapters,
      saveAvailable: true,
      busy: false,
    });

    persist({ ...get(), completedChapters, unlockedChapters });
    return feedback;
  },
  closeFeedback: () => {
    if (get().status === 'chapterComplete') return;
    set({ feedback: undefined, status: 'playing', busy: false });
  },
  completeChapter: () => set({ status: 'chapterComplete', feedback: undefined }),
  goNext: () => {
    const state = get();
    const current = chapters.find((chapter) => chapter.id === state.chapterId);
    const next = current ? chapters.find((chapter) => chapter.order === current.order + 1) : undefined;
    if (!next) {
      set({ screen: 'complete', status: 'chapterComplete' });
      return;
    }
    if (state.unlockedChapters.includes(next.id)) {
      get().startChapter(next.id);
    } else {
      set({ screen: 'chapters' });
    }
  },
  updateSettings: (settings) => {
    const next = { ...get().settings, ...settings };
    set({ settings: next });
    persist({ ...get(), settings: next });
  },
  resetProgress: () => {
    clearProgress();
    const fresh = createDefaultSave();
    set({
      screen: 'title',
      status: 'intro',
      chapterId: firstChapterId,
      selectedItemId: undefined,
      completedItemIds: [],
      sortedDestinations: {},
      completedChapters: fresh.completedChapters,
      unlockedChapters: fresh.unlockedChapters,
      feedback: undefined,
      settings: fresh.settings,
      saveAvailable: false,
      busy: false,
    });
  },
}));
