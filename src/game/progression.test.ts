import { describe, expect, it } from 'vitest';
import { addCompletedChapter, addCompletedItem, calculateUnlocked } from './progression';

describe('progression helpers', () => {
  it('prevents duplicate item scoring', () => {
    expect(addCompletedItem(['banana-peel'], 'banana-peel')).toEqual(['banana-peel']);
  });

  it('prevents duplicate chapter completion', () => {
    expect(addCompletedChapter(['kitchen'], 'kitchen')).toEqual(['kitchen']);
  });

  it('unlocks chapters only after prerequisites', () => {
    expect(calculateUnlocked([])).toEqual(['kitchen']);
    expect(calculateUnlocked(['kitchen'])).toContain('drain');
    expect(calculateUnlocked(['kitchen'])).not.toContain('road');
  });
});
