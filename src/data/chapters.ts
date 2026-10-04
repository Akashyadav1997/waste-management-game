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
      'Only rinse water belongs in the drain. Packaging and cotton go in the dry bin.',
    ],
    objective: 'Choose the proper disposal route and keep packaging out of the drain.',
    itemIds: ['toothpaste-tube', 'shampoo-sachet', 'empty-plastic-bottle', 'soap-wrapper', 'soap-box', 'rinse-water', 'cotton-buds'],
    destinationIds: ['dry-bin', 'drain'],
    completion: 'The drain stays clear. Jyoti sees how tiny packets can cause big problems.',
  },
  {
    id: 'road',
    order: 3,
    title: 'Collection Time',
    scene: 'street',
    unlockAfter: 'drain',
    intro: [
      'Jyoti sees her father about to leave a rubbish bag beside the road.',
      'Roadside dumping spreads litter and can bring animals close to waste.',
    ],
    objective: 'Help the family use the designated collection service.',
    itemIds: ['separated-rubbish-bag'],
    destinationIds: ['collection-service', 'roadside'],
    completion: 'The bag reaches the collection service, and the shopfront stays tidy.',
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
    objective: 'Identify the blockage causes, report the drain, and keep Jyoti safe.',
    itemIds: ['school-wrapper', 'empty-plastic-bottle', 'blocked-drain-report', 'floodwater-safety'],
    destinationIds: ['dry-bin', 'municipal-help', 'stay-safe'],
    completion: 'Municipal workers clear the blockage while Jyoti stays safely away.',
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
    destinationIds: ['wet-bin', 'dry-bin', 'sanitary-bin', 'special-care-bin'],
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
