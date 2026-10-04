import { describe, expect, it } from 'vitest';
import { getWasteItem } from '../data/wasteItems';
import { isCorrectDestination } from './rules';

describe('classification rules', () => {
  it('sorts unambiguous wet and dry kitchen examples', () => {
    expect(isCorrectDestination(getWasteItem('banana-peel')!, 'wet-bin')).toBe(true);
    expect(isCorrectDestination(getWasteItem('banana-peel')!, 'dry-bin')).toBe(false);
    expect(isCorrectDestination(getWasteItem('clean-cardboard')!, 'dry-bin')).toBe(true);
  });

  it('keeps packaging out of drains', () => {
    expect(isCorrectDestination(getWasteItem('toothpaste-tube')!, 'drain')).toBe(false);
    expect(isCorrectDestination(getWasteItem('shampoo-sachet')!, 'dry-bin')).toBe(true);
    expect(isCorrectDestination(getWasteItem('rinse-water')!, 'drain')).toBe(true);
    expect(isCorrectDestination(getWasteItem('rinse-water')!, 'dry-bin')).toBe(false);
    expect(isCorrectDestination(getWasteItem('cotton-buds')!, 'drain')).toBe(false);
    expect(isCorrectDestination(getWasteItem('cotton-buds')!, 'dry-bin')).toBe(true);
  });

  it('uses explicit safe-action destinations for non-bin decisions', () => {
    expect(isCorrectDestination(getWasteItem('separated-rubbish-bag')!, 'collection-service')).toBe(true);
    expect(isCorrectDestination(getWasteItem('separated-rubbish-bag')!, 'roadside')).toBe(false);
    expect(isCorrectDestination(getWasteItem('blocked-drain-report')!, 'municipal-help')).toBe(true);
  });
});
