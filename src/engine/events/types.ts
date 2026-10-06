import type { NovelOp } from '../systems/projects';
import type { Gender, Category, ChainPayload, GameState, Role, StatKey, ViceKey } from '../types';

/** Who an event talks about. If a binding can't be filled, the event is ineligible. */
export type NpcQuery = {
  role: Role;
  /** Anyone at all (for system events that name a specific person). */
  anyRole?: boolean;
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
  /** The NPC's gender fits who the player is attracted to (romance with someone you know). */
  fitsAttraction?: boolean;
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
      /** A new friend or enemy the text has already named. */
      first?: string;
      gender?: Gender;
      /** Their age, when the text says it (otherwise near yours). */
      age?: number;
    }
  | { schedule: string; inYears: number | [number, number]; payload?: ChainPayload }
  | {
      system:
        | 'hire'
        | 'conscript'
        | 'sign_label'
        | 'dishonorable'
        | 'injury_discharge'
        | 'therapy'
        | 'case_bail'
        | 'case_lawyer'
        | 'case_plea'
        | 'move_abroad'
        | 'recapture'
        | 'move_out'
        | 'salary_mult'
        | 'illness_plan'
        | 'holiday_home'
        | 'downsize'
        | 'near_family'
        | 'retire'
        | 'focus_off'
        | 'biz_health'
        | 'biz_sell'
        | 'biz_expand'
        | 'biz_manager'
        | 'retrain'
        | 'move_city'
        | 'severance';
      arg?: string;
    }
  | { death: string }
  | { achievement: string }
  | { fame: number }
  | { notoriety: number }
  /** Military conduct (affects promotion and discharge type). */
  | { conduct: number }
  /** Behaviour inside (counts towards early release). */
  | { behaviour: number }
  /** Your favourite pet (of a kind, if given): the bond or their health moves, or they leave. */
  | { pet: 'bond' | 'health'; delta: number; kind?: string }
  | { pet: 'lose'; fate: string; kind?: string }
  /** A new animal joins the family (no shop, no fee: an event already paid). */
  | { pet: 'adopt'; kind: string; name: string }
  /** A step for the novel in progress. */
  | { novel: NovelOp }
  /** Money as a share of your net worth (a big gift, an investment, a settlement). */
  | { wealth: number };

export type ChainStepDef = {
  eventId: string;
  inYears: number | [number, number];
  payload?: ChainPayload;
};

export type OutcomeDef = {
  /** Relative weight; a function lets stats, traits, and skills shift the odds. */
  chance: number | ((s: GameState, payload: ChainPayload) => number);
  text: string;
  /** Other wordings of the same outcome (for events that recur). */
  texts?: string[];
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
  /** The earliest world year this can happen (phones, apps, video calls...). */
  fromYear?: number;
  /** Events sharing a group are alternatives: at most one of them happens in a life. */
  group?: string;
  cooldownYears?: number;
  adultsOnly?: boolean;
  /** Only reachable as a chain step or from code (interviews, trials, ...). */
  chainOnly?: boolean;
  /** Can fire while the player is in prison. Everything else waits until release (SPEC §5.10). */
  inPrison?: boolean;
  text: string;
  choices?: ChoiceDef[];
  outcomes?: OutcomeDef[];
};
