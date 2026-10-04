import { Ctx, type Step } from './ctx';
import { EngineError } from './errors';
import { prunePending } from './events/select';
import { applyLocks } from './stats';
import { activitiesFor, doActivity } from './systems/activities';
import { interact, interactionsFor, type InteractParams } from './systems/interactions';
import { applyForJob, careerAction } from './systems/careers';
import { dropOut, enroll } from './systems/education';
import { discharge, enlist } from './systems/military';
import { musicAction, type MusicActionId } from './systems/music';
import type { GameState } from './types';
import { cloneState } from './util';

export type PlayerAction =
  | { type: 'interact'; npcId: number; id: string; params?: InteractParams }
  | { type: 'activity'; id: string; params?: Record<string, unknown> }
  | { type: 'enroll'; kind: 'university' | 'community' | 'grad'; programId: string }
  | { type: 'drop_out' }
  | { type: 'apply_job'; jobId: string }
  | { type: 'career'; id: string }
  | { type: 'enlist'; branch: string; specialty: string; officer: boolean }
  | { type: 'discharge' }
  | { type: 'music'; id: MusicActionId };

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
  }
  prunePending(ctx.s);
  applyLocks(ctx.s);
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
