import { EVENT_BY_ID } from '../../content/events';
import { EngineError } from '../errors';
import { Ctx, type Step } from '../ctx';
import { applyLocks } from '../stats';
import { VISIBLE_STATS, type GameState, type PendingEvent } from '../types';
import { cloneState } from '../util';
import { applyOutcome, pickOutcome } from './apply';
import { prunePending, selectableChoices } from './select';
import { checkAchievements } from '../systems/achievements';
import { renderText } from './tokens';
import type { EventDef } from './types';

export type PopupView = {
  eventId: string;
  emoji: string;
  category: string;
  text: string;
  choices: { id: string; label: string; enabled: boolean }[];
};

export function pendingDef(s: GameState, pe: PendingEvent): EventDef {
  const def = EVENT_BY_ID[pe.eventId];
  if (!def) throw new EngineError(`unknown event ${pe.eventId}`);
  return def;
}

const CAT_EMOJI: Record<string, string> = {
  family: '👪',
  school: '🏫',
  social: '🗨️',
  romance: '💞',
  work: '💼',
  money: '💰',
  health: '🩺',
  crime: '🚔',
  military: '🎖️',
  fame: '🌟',
  travel: '✈️',
  world: '🌍',
  random: '🎲',
};
export function categoryEmoji(cat: string): string {
  return CAT_EMOJI[cat] ?? '•';
}

/** What the popup shows for the first pending event. */
export function currentPopup(s: GameState): PopupView | null {
  const pe = s.pending[0];
  return pe ? popupView(s, pe) : null;
}

/** Render any pending event (null if its id is unknown or it isn't a choice event). */
export function popupView(s: GameState, pe: PendingEvent): PopupView | null {
  const def = EVENT_BY_ID[pe.eventId];
  if (!def || def.kind !== 'choice') return null;
  const selectable = new Set(selectableChoices(s, def).map((c) => c.id));
  return {
    eventId: def.id,
    emoji: def.emoji ?? categoryEmoji(def.category),
    category: def.category,
    text: renderText(s, def.text, pe.bindings, pe.payload),
    choices: (def.choices ?? []).map((c) => ({
      id: c.id,
      label: renderText(s, c.label, pe.bindings, pe.payload),
      enabled: selectable.has(c.id),
    })),
  };
}

/** Resolve the first pending popup on a working draft. */
export function chooseInPlace(ctx: Ctx, choiceId: string): void {
  const s = ctx.s;
  const pe = s.pending[0];
  if (!pe) throw new EngineError('no decision is pending');
  const def = pendingDef(s, pe);
  const choice = selectableChoices(s, def).find((c) => c.id === choiceId);
  if (!choice) throw new EngineError(`choice ${choiceId} is not available`);
  s.pending = s.pending.slice(1);
  const outcome = pickOutcome(ctx, choice.outcomes, pe.payload);
  if (outcome) applyOutcome(ctx, def, outcome, pe.bindings, pe.payload, false);
  // Bindings of later popups may have died in the meantime.
  prunePending(s);
  applyLocks(s);
  // Keep the sparkline's latest point in step with the stat it follows.
  for (const k of VISIBLE_STATS) {
    const h = s.statHistory[k];
    if (h.length) h[h.length - 1] = s.player.stats[k];
  }
}

/** Answer the first pending popup. */
export function choose(input: GameState, choiceId: string): Step {
  if (!input.pending[0]) throw new EngineError('no decision is pending');
  const ctx = new Ctx(cloneState(input));
  chooseInPlace(ctx, choiceId);
  checkAchievements(ctx);
  return ctx.finish();
}
