import { describe, expect, it } from 'vitest';
import { defaultSettings, parseSavedProgress } from './storage';

describe('saved progress recovery', () => {
  it('recovers gracefully from invalid JSON', () => {
    expect(parseSavedProgress('{broken')).toEqual({
      version: 1,
      completedChapters: [],
      unlockedChapters: ['kitchen'],
      settings: defaultSettings,
    });
  });

  it('recalculates unlocks from valid completed chapters', () => {
    const save = parseSavedProgress(
      JSON.stringify({
        version: 1,
        completedChapters: ['kitchen'],
        unlockedChapters: [],
        settings: { effects: false },
      }),
    );
    expect(save.unlockedChapters).toContain('drain');
    expect(save.settings.effects).toBe(false);
    expect(save.settings.lowQuality).toBe(false);
  });
});
