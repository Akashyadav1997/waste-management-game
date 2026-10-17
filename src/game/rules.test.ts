import { describe, expect, it } from 'vitest';
import { destinations } from '../data/bins';
import { getWasteItem } from '../data/wasteItems';
import { isCorrectDestination } from './rules';

const expectedBinByItem: Record<string, string> = {
  'banana-peel': 'wet-bin',
  'vegetable-peels': 'wet-bin',
  eggshells: 'wet-bin',
  'clean-paper': 'dry-bin',
  'clean-cardboard': 'dry-bin',
  'empty-plastic-bottle': 'dry-bin',
  'toothpaste-tube': 'dry-bin',
  'shampoo-sachet': 'dry-bin',
  'soap-wrapper': 'dry-bin',
  'soap-box': 'dry-bin',
  'cotton-buds': 'sanitary-bin',
  'fruit-offcuts': 'wet-bin',
  'plastic-bag': 'dry-bin',
  newspaper: 'dry-bin',
  'cooked-leftovers': 'wet-bin',
  'school-wrapper': 'dry-bin',
  'plant-leaves': 'wet-bin',
  'milk-pouch': 'dry-bin',
  'contained-sanitary': 'sanitary-bin',
  'used-battery': 'hazardous-bin',
};

describe('classification rules', () => {
  it.each(Object.entries(expectedBinByItem))('sorts %s only into %s', (itemId, expectedBinId) => {
    const item = getWasteItem(itemId);
    expect(item, itemId).toBeDefined();
    destinations.forEach((destination) => {
      expect(isCorrectDestination(item!, destination.id), `${itemId}/${destination.id}`).toBe(destination.id === expectedBinId);
    });
  });

  it('rejects removed action destinations', () => {
    const item = getWasteItem('empty-plastic-bottle')!;
    expect(isCorrectDestination(item, 'drain')).toBe(false);
    expect(isCorrectDestination(item, 'roadside')).toBe(false);
    expect(isCorrectDestination(item, 'collection-service')).toBe(false);
    expect(isCorrectDestination(item, 'municipal-help')).toBe(false);
    expect(isCorrectDestination(item, 'stay-safe')).toBe(false);
  });
});
