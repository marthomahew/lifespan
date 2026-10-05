import type { RngState } from '../rng';

export const SCHEMA_VERSION = 5;

export const VISIBLE_STATS = ['happiness', 'health', 'smarts', 'looks'] as const;
export const HIDDEN_STATS = [
  'karma',
  'discipline',
  'fertility',
  'stress',
  'fame',
  'notoriety',
] as const;
export const ALL_STATS = [...VISIBLE_STATS, ...HIDDEN_STATS] as const;
export type VisibleStat = (typeof VISIBLE_STATS)[number];
export type StatKey = (typeof ALL_STATS)[number];
export type Stats = Record<StatKey, number>;

export const VICES = [
  'alcohol',
  'smoking',
  'gambling',
  'party_drugs',
  'pills',
  'hard_drugs',
] as const;
export type ViceKey = (typeof VICES)[number];

export type Gender = 'male' | 'female' | 'nonbinary';
export type HairStyle = 'default' | 'blond' | 'red' | 'curly' | 'white' | 'bald';
export type ParentSetup = 'together' | 'apart' | 'mother' | 'father';
export type Attraction = 'men' | 'women' | 'everyone';
export type WealthTier = 'poor' | 'working' | 'middle' | 'comfortable' | 'rich';

export const CATEGORIES = [
  'family',
  'school',
  'social',
  'romance',
  'work',
  'money',
  'health',
  'crime',
  'military',
  'fame',
  'travel',
  'world',
  'random',
] as const;
export type Category = (typeof CATEGORIES)[number];
export type LogCategory = Category | 'system' | 'death' | 'achievement' | 'activity';

export type Stage = 'infant' | 'child' | 'teen' | 'young_adult' | 'adult' | 'middle_age' | 'senior';

export type LogEntry = {
  age: number;
  year: number;
  cat: LogCategory;
  text: string;
  /** Milestones feed the timeline (M11.3). */
  milestone?: boolean;
  /** For a choice outcome: the popup's setup and the option picked, so the log reads as a story. */
  prompt?: string;
  chose?: string;
  /** Why it went that way, when your talents tipped it ("Being Charming helped."). */
  because?: string;
};

export type Toast = { kind: 'achievement' | 'info'; text: string };

export type Memory = { year: number; text: string; delta: number };

export type Role =
  | 'mother'
  | 'father'
  | 'sibling'
  | 'grandparent'
  | 'great_grandparent'
  | 'child'
  | 'partner'
  | 'spouse'
  | 'ex'
  | 'friend'
  | 'enemy'
  | 'coworker'
  | 'classmate'
  | 'cellmate'
  | 'teacher'
  | 'boss'
  | 'bandmate'
  | 'stepparent'
  | 'grandchild'
  | 'acquaintance';

export type RomanceStage = 'dating' | 'serious' | 'engaged' | 'married';

export type Npc = {
  id: number;
  first: string;
  last: string;
  gender: Gender;
  /** Age in whole years; kept in step with the world year. */
  age: number;
  birthYear: number;
  alive: boolean;
  deathYear?: number;
  deathCause?: string;
  roles: Role[];
  /** Relationship to the player, 0..100. */
  rel: number;
  traits: string[];
  stats: { health: number; smarts: number; looks: number; happiness: number };
  job: string | null;
  country: string;
  memory: Memory[];
  flags: string[];
  /** Parents by NPC id; 0 is the player. */
  parentIds: number[];
  lastContact: number;
  romance?: { stage: RomanceStage; since: number; prenup: boolean };
  /** Their own wealth in local currency (gifts, inheritance). */
  money: number;
  attraction: Attraction;
  fertility: number;
};

export const PLAYER_ID = 0;

export type ChainPayload = Record<string, string | number | boolean>;
export type ChainStep = {
  eventId: string;
  dueYear: number;
  payload: ChainPayload;
  /** NPC ids for the follow-up's bindings, keyed by binding name. */
  bindings: Record<string, number>;
};

export type PendingEvent = {
  eventId: string;
  bindings: Record<string, number>;
  payload: ChainPayload;
  source: 'random' | 'chain' | 'cheat' | 'system';
};

export type Snapshot = { year: number; age: number; logLength: number; json: string };

export type DeathInfo = {
  year: number;
  age: number;
  cause: string;
  title: string;
  /** Who received the estate. */
  estate: { npcId: number; amount: number }[];
};

export type GenerationRecord = {
  first: string;
  last: string;
  birthYear: number;
  deathYear: number;
  title: string;
  cause: string;
  netWorthRef: number;
  achievements: number;
  fame: number;
  children: number;
};

export type CheatState = {
  used: boolean;
  locks: Partial<Record<StatKey, number>>;
  immortal: boolean;
  forceSuccess: boolean;
  noBadEvents: boolean;
  infiniteMoney: boolean;
  disabledCategories: Category[];
};

export type SimSettings = { popupsPerYear: number };

export type { RngState };
