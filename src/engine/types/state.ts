import type {
  Attraction,
  CheatState,
  ChainStep,
  DeathInfo,
  Gender,
  Look,
  GenerationRecord,
  LogEntry,
  Npc,
  PendingEvent,
  RngState,
  SimSettings,
  Snapshot,
  Stats,
  VisibleStat,
  WealthTier,
} from './core';
import type {
  AssetState,
  CareerState,
  EducationState,
  EventMeta,
  FamilyState,
  UsageState,
  HealthState,
  LegalState,
  MilitaryState,
  MoneyState,
  MusicState,
  ViceState,
  Will,
} from './sections';

export type Player = {
  first: string;
  last: string;
  gender: Gender;
  attraction: Attraction;
  appearance: string;
  /** The drawn portrait. `appearance` is kept as the matching emoji skin tone. */
  look: Look;
  /** A skill you were born with a gift for: it grows faster with practice. */
  talent: string | null;
  age: number;
  birthYear: number;
  birthCountry: string;
  birthCity: string;
  country: string;
  city: string;
  wealth: WealthTier;
  traits: string[];
  stats: Stats;
  skills: Record<string, number>;
  skillPractice: Record<string, number>;
  /** Language id -> fluency 0..100. */
  languages: Record<string, number>;
  flags: string[];
  achievements: string[];
  /** Life goals the player chose, and the year each was reached. */
  aspirations: { id: string; chosen: number; done: number | null }[];
  parentIds: number[];
  /** Inherited potential that drift pulls toward. */
  genes: { looks: number; smarts: number; health: number };
};

export type GameState = {
  schemaVersion: number;
  lifeId: string;
  seed: number;
  rng: RngState;
  year: number;
  /** Price index relative to 2026 (1.0). */
  inflation: number;
  inflationMult: number;
  player: Player;
  npcs: Npc[];
  nextNpcId: number;
  log: LogEntry[];
  pending: PendingEvent[];
  chains: ChainStep[];
  events: EventMeta;
  money: MoneyState;
  education: EducationState;
  career: CareerState;
  military: MilitaryState | null;
  music: MusicState;
  health: HealthState;
  vices: ViceState;
  legal: LegalState;
  assets: AssetState;
  will: Will;
  family: FamilyState;
  usage: UsageState;
  statHistory: Record<VisibleStat, number[]>;
  /** Running totals used by achievements, titles, and the balance report. */
  totals: { happinessSum: number; years: number; popups: number; maxNetWorthRef: number };
  settings: SimSettings;
  cheats: CheatState;
  snapshots: Snapshot[];
  death: DeathInfo | null;
  dynasty: GenerationRecord[];
  /** The challenge this life was started with, if any. */
  challenge: { id: string; status: 'active' | 'won' | 'lost'; year: number } | null;
  generation: number;
};
