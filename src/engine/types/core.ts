import type { RngState } from '../rng';

export const SCHEMA_VERSION = 8;

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
export type FaceShape = 'oval' | 'round' | 'square' | 'long' | 'heart';
export type HairCut =
  | 'buzz'
  | 'short'
  | 'side'
  | 'quiff'
  | 'curly'
  | 'afro'
  | 'bob'
  | 'long'
  | 'ponytail'
  | 'bun'
  | 'braids'
  | 'mohawk'
  | 'bald';
export type HairColor =
  | 'black'
  | 'darkbrown'
  | 'brown'
  | 'auburn'
  | 'red'
  | 'blond'
  | 'platinum'
  | 'grey'
  | 'white'
  | 'blue'
  | 'pink'
  | 'green'
  | 'purple';
export type EyeShape = 'round' | 'almond' | 'narrow' | 'wide' | 'hooded';
export type EyeColor = 'darkbrown' | 'brown' | 'hazel' | 'green' | 'blue' | 'grey';
export type BrowShape = 'soft' | 'straight' | 'arched' | 'thick' | 'thin' | 'angled';
export type NoseShape = 'button' | 'straight' | 'wide' | 'long' | 'roman' | 'small';
export type MouthShape = 'smile' | 'grin' | 'neutral' | 'smirk' | 'full';
export type FacialHair = 'none' | 'stubble' | 'moustache' | 'goatee' | 'beard' | 'longbeard';
export type Glasses = 'none' | 'round' | 'square' | 'cateye' | 'sunglasses';
export type TopStyle = 'tee' | 'hoodie' | 'shirt' | 'sweater' | 'vneck';
export type Earrings = 'none' | 'studs' | 'hoops' | 'drops' | 'gems';
export type Headwear = 'none' | 'beanie' | 'cap' | 'bucket' | 'fedora' | 'headscarf';

/** How a character looks, drawn as a layered portrait. Ageing (grey, lines) is applied when drawn. */
export type Look = {
  /** Index into SKIN_COLORS (0 lightest). */
  skin: number;
  face: FaceShape;
  hair: HairCut;
  hairColor: HairColor;
  eyes: EyeShape;
  eyeColor: EyeColor;
  brows: BrowShape;
  nose: NoseShape;
  mouth: MouthShape;
  facialHair: FacialHair;
  glasses: Glasses;
  freckles: boolean;
  top: TopStyle;
  /** Index into TOP_COLORS. */
  topColor: number;
  earrings: Earrings;
  hat: Headwear;
};
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
  /** A teenage boyfriend or girlfriend (14–17, a peer; never with an adult). */
  | 'sweetheart'
  /** A sibling's child, and a parent's sibling (after you continue as an heir). */
  | 'nibling'
  | 'aunt_uncle'
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
  /** Seeds their portrait (else their id): someone you met as a drawn candidate keeps that face. */
  lookSeed?: number;
};

export const PLAYER_ID = 0;

/** An animal in your life. */
export type Pet = {
  id: number;
  kind: string;
  name: string;
  age: number;
  /** Bond with you, 0..100. */
  bond: number;
  /** The pet's health, 0..100. */
  health: number;
  /** Years they would live with ordinary luck. */
  lifespan: number;
  adoptedYear: number;
  alive: boolean;
  /** How they left: died, ran off, rehomed. */
  fate?: string;
  endYear?: number;
  /** Last year you played with or walked them. */
  lastPlay: number;
};

export type ChainPayload = Record<string, string | number | boolean>;
export type ChainStep = {
  eventId: string;
  dueYear: number;
  /** When it was first due, if a prison term has pushed it back. */
  firstDue?: number;
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
  /** Their portrait, for the dynasty (absent in older saves). */
  look?: Look;
  gender?: Gender;
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

/** Per-life rules the player sets. `freeTime: false` lifts the yearly activity budget. */
export type SimSettings = { popupsPerYear: number; freeTime?: boolean };

export type { RngState };
