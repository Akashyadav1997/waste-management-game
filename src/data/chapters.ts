import { wasteItems } from './wasteItems';
import type { Chapter, WasteCategory } from '../game/types';

const chapterDefinitions: Chapter[] = [
  {
    id: 'kitchen',
    order: 1,
    title: 'Breakfast Sorting',
    scene: 'kitchen',
    itemsPerRound: 6,
    intro: [
      'Jyoti sees her mother mixing breakfast waste in one bowl.',
      'Start with two simple groups: wet waste and dry waste. More categories will appear later.',
    ],
    objective: 'Sort food scraps and clean packaging in small rounds. Finish each round to reveal more items.',
    itemIds: [],
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
      'Clean packaging goes in the blue dry-waste bin. Wrapped personal hygiene waste goes in the yellow sanitary-waste bin.',
    ],
    objective: 'Sort bathroom waste into the blue and yellow bins, and keep every item out of the drain.',
    itemIds: [],
    destinationIds: ['dry-bin', 'sanitary-bin'],
    completion: 'The packaging is in the blue bin, the personal hygiene waste is in the yellow bin, and the drain stays clear.',
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
    itemIds: [],
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
    itemIds: [],
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
    itemIds: [],
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
      'Use all four bins. Medicines, chemicals and lamps need the red hazardous bin and adult help.',
    ],
    objective: 'Complete the final mixed sorting challenge.',
    itemIds: [],
    destinationIds: ['wet-bin', 'dry-bin', 'sanitary-bin', 'hazardous-bin'],
    completion: 'Separated collection begins, the neighbourhood is cleaner, and Jyoti celebrates with everyone.',
  },
];

// Alternate available streams so rounds teach a choice instead of repeating one answer.
function chapterItemIds(chapterId: string): string[] {
  if (chapterId === 'kitchen') {
    return wasteItems.filter((item) => item.chapters.includes(chapterId)).map((item) => item.id);
  }
  const categories: WasteCategory[] = ['wet', 'dry', 'sanitary', 'hazardous'];
  const groups = categories.map((category) => wasteItems.filter((item) => item.chapters.includes(chapterId) && item.category === category));
  return Array.from({ length: Math.max(...groups.map((group) => group.length)) }, (_, index) =>
    groups.flatMap((group) => group[index] ? [group[index].id] : []),
  ).flat();
}

export const chapters: Chapter[] = chapterDefinitions.map((chapter) => ({
  ...chapter,
  itemIds: chapterItemIds(chapter.id),
}));

export const firstChapterId = chapters[0].id;

export function getChapter(chapterId: string): Chapter | undefined {
  return chapters.find((chapter) => chapter.id === chapterId);
}

export function nextChapterId(chapterId: string): string | undefined {
  const chapter = getChapter(chapterId);
  if (!chapter) return undefined;
  return chapters.find((candidate) => candidate.order === chapter.order + 1)?.id;
}
