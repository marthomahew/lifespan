import { petAction, type PetActionId } from './systems/pets';
import { Ctx, type Step } from './ctx';
import { EngineError } from './errors';
import { prunePending } from './events/select';
import { checkAchievements } from './systems/achievements';
import { applyLocks } from './stats';
import { activitiesFor, doActivity } from './systems/activities';
import { interact, interactionsFor, type InteractParams } from './systems/interactions';
import { applyForJob, careerAction } from './systems/careers';
import { dropOut, enroll } from './systems/education';
import { discharge, enlist } from './systems/military';
import { musicAction, type MusicActionId } from './systems/music';
import { moneyAction, type MoneyAction } from './systems/banking';
import { commitCrime } from './systems/crime';
import { treat } from './systems/health';
import { emigrate } from './systems/emigration';
import type { Treatment } from '../content/types';
import {
  buyHome,
  buyPossession,
  buyVehicle,
  moveInto,
  renovate,
  sellAsset,
  type Financing,
} from './systems/assets';
import type { GameState } from './types';
import { cloneState } from './util';
import { treatInjury } from './systems/injuries';
import { checkAspirations, chooseAspiration, dropAspiration } from './systems/aspirations';
import { checkChallenge } from './systems/challenge';
import { setFocus } from './systems/focus';
import { businessAction, type BusinessOp } from './systems/business';
import { playTournament } from './systems/chess';
import { playMajor, type MajorId } from './systems/chess-crown';
import { takeFameDeal, type FameDeal } from './systems/fame-deals';
import { buyLifestyle, endLifestyle } from './systems/lifestyle';
import { takeUpSport, trainExtra } from './systems/sport';
import { letHome } from './systems/lettings';
import { tradeShares } from './systems/markets';

export type PlayerAction =
  | { type: 'interact'; npcId: number; id: string; params?: InteractParams }
  | { type: 'activity'; id: string; params?: Record<string, unknown> }
  | { type: 'enroll'; kind: 'university' | 'community' | 'grad'; programId: string }
  | { type: 'drop_out' }
  | { type: 'apply_job'; jobId: string }
  | { type: 'career'; id: string }
  | { type: 'enlist'; branch: string; specialty: string; officer: boolean }
  | { type: 'discharge' }
  | { type: 'music'; id: MusicActionId }
  | { type: 'money'; action: MoneyAction }
  | { type: 'buy_home'; index: number; financing: Financing }
  | { type: 'sell_asset'; id: number }
  | { type: 'move_home'; id: number }
  | { type: 'renovate'; id: number }
  | { type: 'buy_vehicle'; model: string; financed: boolean; used?: boolean }
  | { type: 'buy_item'; item: string }
  | { type: 'crime'; id: string }
  | { type: 'treat'; illness: string; method: Treatment }
  | { type: 'treat_injury'; index: number; method: 'physio' | 'surgery' }
  | { type: 'aspiration'; op: 'choose' | 'drop'; id: string }
  | { type: 'emigrate'; country: string; city?: string }
  | { type: 'pet'; petId: number; id: PetActionId }
  | { type: 'focus'; target: string | null }
  | { type: 'business'; action: BusinessOp }
  | { type: 'chess'; tier: string }
  | { type: 'chess_major'; id: MajorId }
  | { type: 'sport'; sport: string | null; position?: string }
  | { type: 'sport_train' }
  | { type: 'lifestyle'; id: string }
  | { type: 'lifestyle_end'; key: number }
  | { type: 'fame_deal'; id: FameDeal['id'] }
  | { type: 'let_home'; id: number; on: boolean }
  | {
      type: 'shares';
      id: string;
      op: 'buy' | 'sell';
      amount: number;
      /** Buy this many shares (or coins) rather than this much money's worth. */
      units?: boolean;
    };

/** Activities, interactions, purchases, applications (SPEC §9.3 act). */
export function act(input: GameState, action: PlayerAction): Step {
  if (input.death) throw new EngineError('life is over');
  if (input.pending.length > 0) throw new EngineError('a decision is pending');
  const ctx = new Ctx(cloneState(input));
  switch (action.type) {
    case 'interact':
      interact(ctx, action.npcId, action.id, action.params);
      break;
    case 'activity':
      doActivity(ctx, action.id, action.params);
      break;
    case 'pet':
      petAction(ctx, action.petId, action.id);
      break;
    case 'enroll':
      enroll(ctx, action.kind, action.programId);
      break;
    case 'drop_out':
      dropOut(ctx);
      break;
    case 'apply_job':
      applyForJob(ctx, action.jobId);
      break;
    case 'career':
      careerAction(ctx, action.id);
      break;
    case 'enlist':
      enlist(ctx, action.branch, action.specialty, action.officer);
      break;
    case 'discharge':
      discharge(ctx);
      break;
    case 'music':
      musicAction(ctx, action.id);
      break;
    case 'money':
      moneyAction(ctx, action.action);
      break;
    case 'buy_home':
      buyHome(ctx, action.index, action.financing);
      break;
    case 'sell_asset':
      sellAsset(ctx, action.id);
      break;
    case 'move_home':
      moveInto(ctx, action.id);
      break;
    case 'renovate':
      renovate(ctx, action.id);
      break;
    case 'buy_vehicle':
      buyVehicle(ctx, action.model, action.financed, action.used ?? false);
      break;
    case 'buy_item':
      buyPossession(ctx, action.item);
      break;
    case 'crime':
      commitCrime(ctx, action.id);
      break;
    case 'treat':
      treat(ctx, action.illness, action.method);
      break;
    case 'treat_injury':
      treatInjury(ctx, action.index, action.method);
      break;
    case 'aspiration':
      if (action.op === 'choose') chooseAspiration(ctx, action.id);
      else dropAspiration(ctx, action.id);
      break;
    case 'emigrate':
      emigrate(ctx, action.country, action.city);
      break;
    case 'focus':
      setFocus(ctx, action.target);
      break;
    case 'business':
      businessAction(ctx, action.action);
      break;
    case 'chess':
      playTournament(ctx, action.tier);
      break;
    case 'chess_major':
      playMajor(ctx, action.id);
      break;
    case 'sport':
      takeUpSport(ctx, action.sport, action.position);
      break;
    case 'sport_train':
      trainExtra(ctx);
      break;
    case 'lifestyle':
      buyLifestyle(ctx, action.id);
      break;
    case 'lifestyle_end':
      endLifestyle(ctx, action.key);
      break;
    case 'fame_deal':
      takeFameDeal(ctx, action.id);
      break;
    case 'let_home':
      letHome(ctx, action.id, action.on);
      break;
    case 'shares':
      tradeShares(ctx, action.id, action.op, action.amount, action.units);
      break;
  }
  prunePending(ctx.s);
  applyLocks(ctx.s);
  checkAchievements(ctx);
  checkAspirations(ctx);
  checkChallenge(ctx);
  return ctx.finish();
}

export type ActionItem = {
  label: string;
  action: PlayerAction;
  enabled: boolean;
  reason: string;
  keywords: string;
};
export type ActionGroup = { group: string; items: ActionItem[] };

/** Everything the player could do right now (powers the ⌘K palette). */
export function availableActions(s: GameState): ActionGroup[] {
  const groups: ActionGroup[] = [];
  const acts = activitiesFor(s).map((a) => ({
    label: `${a.emoji} ${a.label}`,
    action: { type: 'activity', id: a.id } as PlayerAction,
    enabled: a.enabled,
    reason: a.reason,
    keywords: `${a.label} ${a.group} ${a.description}`.toLowerCase(),
  }));
  groups.push({ group: 'Activities', items: acts });
  const people: ActionItem[] = [];
  for (const n of s.npcs.filter((x) => x.alive)) {
    for (const i of interactionsFor(s, n)) {
      if (!i.enabled) continue;
      people.push({
        label: `${i.emoji} ${i.label}: ${n.first} ${n.last}`,
        action: { type: 'interact', npcId: n.id, id: i.id },
        enabled: true,
        reason: '',
        keywords: `${i.label} ${n.first} ${n.last} ${n.roles.join(' ')}`.toLowerCase(),
      });
    }
  }
  groups.push({ group: 'People', items: people });
  return groups;
}
