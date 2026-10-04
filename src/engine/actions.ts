import { Ctx, type Step } from './ctx';
import { EngineError } from './errors';
import { prunePending } from './events/select';
import { applyLocks } from './stats';
import { activitiesFor, doActivity } from './systems/activities';
import { interact, interactionsFor, type InteractParams } from './systems/interactions';
import type { GameState } from './types';
import { cloneState } from './util';

export type PlayerAction =
  | { type: 'interact'; npcId: number; id: string; params?: InteractParams }
  | { type: 'activity'; id: string; params?: Record<string, unknown> };

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
