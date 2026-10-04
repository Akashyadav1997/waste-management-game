import type { BinDefinition, Destination } from '../game/types';

export const classificationSource = {
  title: 'CPCB/PIB four-stream source segregation guidance',
  summary:
    'Indian guidance identifies wet waste, dry waste, sanitary waste and special-care waste as separate household streams. Green and blue are commonly used for wet and dry. Sanitary and special-care colors vary locally, so this game keeps them configurable and labels every destination with text and symbols.',
  urls: [
    'https://www.swm.cpcb.gov.in/',
    'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2219676&lang=1&reg=3',
  ],
};

export const binScheme: BinDefinition[] = [
  {
    id: 'wet-bin',
    label: 'Wet waste',
    shortLabel: 'Wet',
    color: '#15803D',
    textColor: '#ffffff',
    symbol: 'W',
    acceptedCategories: ['wet'],
    note: 'Food scraps, vegetable peels and eggshells go here for composting or wet-waste collection.',
  },
  {
    id: 'dry-bin',
    label: 'Dry waste',
    shortLabel: 'Dry',
    color: '#1D4ED8',
    textColor: '#ffffff',
    symbol: 'D',
    acceptedCategories: ['dry'],
    note: 'Clean and dry paper, cardboard, bottles and empty packaging go here. Not every dry item is recyclable.',
  },
  {
    id: 'sanitary-bin',
    label: 'Sanitary waste',
    shortLabel: 'Sanitary',
    color: '#c94b5d',
    textColor: '#ffffff',
    symbol: 'S',
    acceptedCategories: ['sanitary'],
    note: 'Safely wrapped sanitary waste should be handled by adults and collected separately.',
  },
  {
    id: 'special-care-bin',
    label: 'Special-care waste',
    shortLabel: 'Special',
    color: '#f2c94c',
    textColor: '#2f2811',
    symbol: 'SC',
    acceptedCategories: ['specialCare'],
    note: 'Batteries, bulbs, medicines and sharps need adult help and local special collection.',
  },
];

export const extraDestinations: Destination[] = [
  {
    id: 'drain',
    label: 'Open drain',
    shortLabel: 'Drain',
    kind: 'drain',
    color: '#4a5568',
    textColor: '#ffffff',
    symbol: 'X',
    acceptedCategories: [],
    note: 'Packaging blocks drains and can make streets flood.',
    alwaysInvalid: true,
  },
  {
    id: 'roadside',
    label: 'Roadside dumping',
    shortLabel: 'Roadside',
    kind: 'roadside',
    color: '#8a6f5a',
    textColor: '#ffffff',
    symbol: '!',
    acceptedCategories: [],
    note: 'Leaving rubbish beside the road attracts litter and animals.',
    alwaysInvalid: true,
  },
  {
    id: 'collection-service',
    label: 'Collection service',
    shortLabel: 'Collector',
    kind: 'collector',
    color: '#6d5bd0',
    textColor: '#ffffff',
    symbol: 'C',
    acceptedCategories: [],
    note: 'Separated waste should be handed to the designated collection service.',
  },
  {
    id: 'municipal-help',
    label: 'Tell an adult or municipal worker',
    shortLabel: 'Report',
    kind: 'municipal',
    color: '#008f9c',
    textColor: '#ffffff',
    symbol: 'M',
    acceptedCategories: [],
    note: 'Adults and trained workers clear blocked drains with proper equipment.',
  },
  {
    id: 'stay-safe',
    label: 'Stay away from floodwater',
    shortLabel: 'Safe',
    kind: 'safe',
    color: '#38444d',
    textColor: '#ffffff',
    symbol: 'OK',
    acceptedCategories: [],
    note: 'Children should not enter floodwater or open drains.',
  },
];

export const destinations: Destination[] = [...binScheme.map((bin) => ({ ...bin, kind: 'bin' as const })), ...extraDestinations];

export function getDestination(destinationId: string): Destination | undefined {
  return destinations.find((destination) => destination.id === destinationId);
}
