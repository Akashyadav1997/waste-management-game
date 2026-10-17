import type { Chapter } from '../game/types';

export const chapters: Chapter[] = [
  {
    id: 'kitchen',
    order: 1,
    title: 'Breakfast Sorting',
    scene: 'kitchen',
    intro: [
      'Jyoti sees her mother mixing breakfast waste in one bowl.',
      'Start with two simple groups: wet waste and dry waste. More categories will appear later.',
    ],
    objective: 'Sort each breakfast item into the correct stream.',
    itemIds: ['banana-peel', 'vegetable-peels', 'eggshells', 'clean-paper', 'clean-cardboard', 'empty-plastic-bottle'],
    destinationIds: ['wet-bin', 'dry-bin'],
    completion: 'The kitchen counter is cleaner, and Jyoti can explain wet and dry waste.',
  },
  {
    id: 'drain',
    order: 2,
    title: 'No Waste in Drains',
    scene: 'bathroom',
    unlockAfter: 'kitchen',
    intro: [
      'Jyoti notices empty wash packaging spread around the basin.',
      'Clean packaging goes in the blue dry-waste bin. Used cotton buds go in the yellow sanitary-waste bin.',
    ],
    objective: 'Sort bathroom waste into the blue and yellow bins, and keep every item out of the drain.',
    itemIds: ['toothpaste-tube', 'shampoo-sachet', 'empty-plastic-bottle', 'soap-wrapper', 'soap-box', 'cotton-buds'],
    destinationIds: ['dry-bin', 'sanitary-bin'],
    completion: 'The packaging is in the blue bin, the cotton buds are in the yellow bin, and the drain stays clear.',
  },
  {
    id: 'road',
    order: 3,
    title: 'Collection Time',
    scene: 'street',
    unlockAfter: 'drain',
    intro: [
      'Jyoti helps her family separate waste before the collection service arrives.',
      'Food waste goes in green, while clean paper and plastic go in blue. Nothing is left beside the road.',
    ],
    objective: 'Separate the household items into wet and dry waste before collection.',
    itemIds: ['fruit-offcuts', 'plastic-bag', 'newspaper', 'cooked-leftovers'],
    destinationIds: ['wet-bin', 'dry-bin'],
    completion: 'The separated waste is ready for collection, and nothing is dumped beside the road.',
  },
  {
    id: 'school',
    order: 4,
    title: 'School Courtyard',
    scene: 'school',
    unlockAfter: 'road',
    intro: [
      'The school courtyard has bins, but paper and wrappers are still on the ground.',
      'A teacher gives short examples while Jyoti finds and sorts the litter.',
    ],
    teacherLine: 'Look at the item first. Clean paper and empty wrappers are dry waste, while food scraps are wet waste.',
    objective: 'Find the litter and sort it using the school bins.',
    itemIds: ['clean-paper', 'school-wrapper', 'banana-peel'],
    destinationIds: ['wet-bin', 'dry-bin'],
    completion: 'The courtyard looks ready for assembly, and the bins are easier to use.',
  },
  {
    id: 'flood',
    order: 5,
    title: 'Blocked Street Drain',
    scene: 'flood',
    unlockAfter: 'school',
    intro: [
      'After heavy rain, Jyoti sees a simplified flooded street where packaging blocks drainage.',
      'She identifies causes and chooses safe community actions.',
    ],
    objective: 'Identify and sort the waste that can block drains while Jyoti stays safely away from floodwater.',
    itemIds: ['school-wrapper', 'empty-plastic-bottle', 'milk-pouch', 'plant-leaves'],
    destinationIds: ['wet-bin', 'dry-bin'],
    completion: 'Jyoti reports the blockage to an adult, stays away from floodwater, and municipal workers clear the drain.',
  },
  {
    id: 'finale',
    order: 6,
    title: 'Neighbourhood Challenge',
    scene: 'community',
    unlockAfter: 'flood',
    intro: [
      'Jyoti explains what she learned to her family and neighbours.',
      'Now combine all categories and decisions.',
    ],
    objective: 'Complete the final mixed sorting challenge.',
    itemIds: ['banana-peel', 'clean-paper', 'empty-plastic-bottle', 'toothpaste-tube', 'contained-sanitary', 'used-battery'],
    destinationIds: ['wet-bin', 'dry-bin', 'sanitary-bin', 'hazardous-bin'],
    completion: 'Separated collection begins, the neighbourhood is cleaner, and Jyoti celebrates with everyone.',
  },
];

export const firstChapterId = chapters[0].id;

export function getChapter(chapterId: string): Chapter | undefined {
  return chapters.find((chapter) => chapter.id === chapterId);
}

export function nextChapterId(chapterId: string): string | undefined {
  const chapter = getChapter(chapterId);
  if (!chapter) return undefined;
  return chapters.find((candidate) => candidate.order === chapter.order + 1)?.id;
}
