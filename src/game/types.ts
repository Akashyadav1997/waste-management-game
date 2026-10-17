export type WasteCategory = 'wet' | 'dry' | 'sanitary' | 'hazardous';

export type PreparationRequirement = 'rinseClean' | 'wrapSafely';

export type ModelKind =
  | 'banana'
  | 'peels'
  | 'eggshells'
  | 'paper'
  | 'cardboard'
  | 'bottle'
  | 'tube'
  | 'sachet'
  | 'bag'
  | 'wrapper'
  | 'containedSanitary'
  | 'battery'
  | 'actionCard'
  | 'water'
  | 'buds';

export type WasteItem = {
  id: string;
  displayName: string;
  category: WasteCategory;
  model: ModelKind;
  explanation: string;
  hint: string;
  handling: string;
  preparation?: PreparationRequirement;
  chapters: string[];
};

export type BinDefinition = {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  textColor: string;
  symbol: string;
  acceptedCategories: WasteCategory[];
  note: string;
};

export type Destination = BinDefinition & { kind: 'bin' };

export type ChapterScene = 'kitchen' | 'bathroom' | 'street' | 'school' | 'flood' | 'community';

export type Chapter = {
  id: string;
  order: number;
  title: string;
  scene: ChapterScene;
  intro: string[];
  objective: string;
  teacherLine?: string;
  itemIds: string[];
  destinationIds: string[];
  completion: string;
  unlockAfter?: string;
};

export type Feedback = {
  itemId: string;
  destinationId: string;
  correct: boolean;
  title: string;
  message: string;
};

export type SavedProgress = {
  version: 1;
  completedChapters: string[];
  unlockedChapters: string[];
  lastChapterId?: string;
  settings: GameSettings;
};

export type GameSettings = {
  effects: boolean;
  narration: boolean;
  ambience: boolean;
  reducedMotion: boolean;
  lowQuality: boolean;
  effectsVolume: number;
  narrationVolume: number;
  ambienceVolume: number;
};

export type GameStatus = 'intro' | 'playing' | 'feedback' | 'chapterComplete' | 'transition';
