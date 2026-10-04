import type { Category, ChainPayload, GameState, Role, StatKey, ViceKey } from '../types';

/** Who an event talks about. If a binding can't be filled, the event is ineligible. */
export type NpcQuery = {
  role: Role;
  minRelationship?: number;
  maxRelationship?: number;
  minAge?: number;
  maxAge?: number;
  sameCountry?: boolean;
  gender?: 'male' | 'female';
  /** The NPC must remember something about you. */
  hasMemory?: boolean;
  /** NPC must (not) carry this flag. */
  flag?: string;
  notFlag?: string;
};

export type MoneyAmount = number | { payload: string; mult?: number };

export type Effect =
  | { stat: StatKey; delta: number }
  | { money: MoneyAmount; kind?: 'price' | 'wage' }
  | { rel: string; delta: number; memory?: string }
  | { npcStat: string; stat: 'health' | 'happiness' | 'smarts' | 'looks'; delta: number }
  | { flag: string }
  | { unflag: string }
  | { npcFlag: string; flag: string }
  | { addTrait: string }
  | { removeTrait: string }
  | { skill: string; delta: number }
  | { illness: string }
  | { cure: string }
  | { injury: number }
  | { vice: ViceKey; delta: number }
  | { crime: string; arrest?: boolean }
  | { job: 'fire' | 'promote' | 'demote' | 'raise' | 'hire'; jobId?: string }
  | { performance: number }
  | {
      status:
        | 'meet'
        | 'breakup'
        | 'marry'
        | 'divorce'
        | 'birth'
        | 'adopt'
        | 'friend'
        | 'enemy'
        | 'npc_dies';
      with?: string;
      role?: Role;
    }
  | { schedule: string; inYears: number | [number, number]; payload?: ChainPayload }
  | {
      system: 'hire' | 'conscript' | 'sign_label' | 'dishonorable' | 'injury_discharge' | 'therapy';
      arg?: string;
    }
  | { death: string }
  | { achievement: string }
  | { fame: number }
  | { notoriety: number }
  /** Military conduct (affects promotion and discharge type). */
  | { conduct: number };

export type ChainStepDef = {
  eventId: string;
  inYears: number | [number, number];
  payload?: ChainPayload;
};

export type OutcomeDef = {
  /** Relative weight; a function lets stats, traits, and skills shift the odds. */
  chance: number | ((s: GameState, payload: ChainPayload) => number);
  text: string;
  effects: Effect[];
  next?: ChainStepDef;
  /** Counts as the "it worked" outcome for the force-success cheat. */
  success?: boolean;
};

export type ChoiceDef = {
  id: string;
  label: string;
  requires?: (s: GameState) => boolean;
  outcomes: OutcomeDef[];
};

export type WeightMod = { flag?: string; trait?: string; mult: number };

export type EventDef = {
  id: string;
  kind: 'choice' | 'notice';
  category: Category;
  emoji?: string;
  ages?: [number, number];
  weight: number | ((s: GameState) => number);
  weightMods?: WeightMod[];
  when?: (s: GameState) => boolean;
  bind?: Record<string, NpcQuery>;
  once?: boolean;
  cooldownYears?: number;
  adultsOnly?: boolean;
  /** Only reachable as a chain step or from code (interviews, trials, ...). */
  chainOnly?: boolean;
  text: string;
  choices?: ChoiceDef[];
  outcomes?: OutcomeDef[];
};
