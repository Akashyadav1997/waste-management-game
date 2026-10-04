import type { GameSettings, SavedProgress } from '../game/types';
import { calculateUnlocked } from '../game/progression';

export const STORAGE_KEY = 'waste-management-game:v1';

export const defaultSettings: GameSettings = {
  effects: true,
  narration: true,
  ambience: false,
  reducedMotion: false,
  lowQuality: false,
  effectsVolume: 0.72,
  narrationVolume: 0.9,
  ambienceVolume: 0.18,
};

export function createDefaultSave(): SavedProgress {
  return {
    version: 1,
    completedChapters: [],
    unlockedChapters: ['kitchen'],
    settings: defaultSettings,
  };
}

export function parseSavedProgress(raw: string | null): SavedProgress {
  if (!raw) return createDefaultSave();
  try {
    const parsed = JSON.parse(raw) as Partial<SavedProgress>;
    if (
      parsed.version !== 1 ||
      !Array.isArray(parsed.completedChapters) ||
      !Array.isArray(parsed.unlockedChapters) ||
      typeof parsed.settings !== 'object' ||
      parsed.settings === null
    ) {
      return createDefaultSave();
    }

    const completedChapters = parsed.completedChapters.filter((value): value is string => typeof value === 'string');
    return {
      version: 1,
      completedChapters,
      unlockedChapters: calculateUnlocked(completedChapters),
      lastChapterId: typeof parsed.lastChapterId === 'string' ? parsed.lastChapterId : undefined,
      settings: {
        ...defaultSettings,
        ...parsed.settings,
        effects:
          typeof (parsed.settings as Partial<GameSettings>).effects === 'boolean'
            ? (parsed.settings as Partial<GameSettings>).effects!
            : ((parsed.settings as Partial<GameSettings> & { sound?: boolean }).sound ?? defaultSettings.effects),
      },
    };
  } catch {
    return createDefaultSave();
  }
}

export function loadProgress(storage: Pick<Storage, 'getItem'> = localStorage): SavedProgress {
  return parseSavedProgress(storage.getItem(STORAGE_KEY));
}

export function saveProgress(progress: SavedProgress, storage: Pick<Storage, 'setItem'> = localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function clearProgress(storage: Pick<Storage, 'removeItem'> = localStorage): void {
  storage.removeItem(STORAGE_KEY);
}
