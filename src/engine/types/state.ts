import type { Projects } from '../systems/projects';
import type { Business } from '../systems/business';
import type { ChessRecord } from '../systems/chess';
import type { SportRecord } from '../systems/sport';
import type { MarketSim } from '../systems/markets';
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
  Pet,
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
  /** The face you were born with (family resemblance follows this, not makeovers). */
  birthLook?: Look;
  /** A skill you were born with a gift for: it grows faster with practice. */
  talent: string | null;
  /** How big the gift is: a prodigy's grows twice as fast again. */
  talentLevel?: 'gift' | 'prodigy';
  /** Gifts picked at the start (quick study, and luck of various kinds). */
  gifts?: string[];
  /** Where you started (family business, a twin...): off unless chosen. */
  background?: string | null;
  /** The background's particulars: the business's name, the old country. */
  backgroundData?: Record<string, string>;
  /** What you devote your free time to, year after year: a skill id, or `lang:<id>`. */
  focus?: string | null;
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
  pets: Pet[];
  /** Long projects (a novel in progress); absent in older saves. */
  projects?: Projects;
  /** Market prices after the real record ends (simulated, year by year). */
  market?: MarketSim | null;
  /** The sport you play, season by season. */
  sport?: SportRecord | null;
  /** Your chess record, once you have played a rated tournament. */
  chess?: ChessRecord | null;
  /** A business of your own (one at a time). */
  business?: Business | null;
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
