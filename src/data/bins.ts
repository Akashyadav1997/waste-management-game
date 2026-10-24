import type { BinDefinition, Destination } from '../game/types';

export const classificationSource = {
  title: 'Project four-bin waste segregation matrix',
  summary:
    'This game uses the supplied project bin scheme: green for wet waste, blue for dry waste, yellow for sanitary waste, and red for hazardous household waste. The clarified matrix puts insecticides, medicines and fluorescent lamps in hazardous waste. Rinsing and safe wrapping are preparation requirements, not separate waste streams.',
  urls: [
    'https://swm.cpcb.gov.in/',
    'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2219676&lang=1&reg=3',
  ],
};

export const binScheme: BinDefinition[] = [
  {
    id: 'wet-bin',
    label: 'Wet waste',
    shortLabel: 'Wet',
    color: '#178A45',
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
    color: '#FFFF00',
    textColor: '#111111',
    symbol: 'S',
    acceptedCategories: ['sanitary'],
    note: 'Safely wrapped sanitary waste should be handled by adults and collected separately.',
  },
  {
    id: 'hazardous-bin',
    label: 'Hazardous household waste',
    shortLabel: 'Hazardous',
    color: '#FF0000',
    textColor: '#111111',
    symbol: 'H',
    acceptedCategories: ['hazardous'],
    note: 'Batteries, electronics, chemicals, medicines and bulbs need adult help and designated collection.',
  },
];

export const destinations: Destination[] = binScheme.map((bin) => ({ ...bin, kind: 'bin' as const }));

export function getDestination(destinationId: string): Destination | undefined {
  return destinations.find((destination) => destination.id === destinationId);
}
