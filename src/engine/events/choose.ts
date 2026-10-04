import { EVENT_BY_ID } from '../../content/events';
import { EngineError } from '../errors';
import { Ctx, type Step } from '../ctx';
import { applyLocks } from '../stats';
import type { GameState, PendingEvent } from '../types';
import { cloneState } from '../util';
import { applyOutcome, pickOutcome } from './apply';
import { selectableChoices } from './select';
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
  if (!pe) return null;
  const def = pendingDef(s, pe);
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

/** Answer the first pending popup. */
export function choose(input: GameState, choiceId: string): Step {
  const pe = input.pending[0];
  if (!pe) throw new EngineError('no decision is pending');
  const def = pendingDef(input, pe);
  const choice = selectableChoices(input, def).find((c) => c.id === choiceId);
  if (!choice) throw new EngineError(`choice ${choiceId} is not available`);
  const ctx = new Ctx(cloneState(input));
  const s = ctx.s;
  s.pending = s.pending.slice(1);
  const outcome = pickOutcome(ctx, choice.outcomes);
  if (outcome) applyOutcome(ctx, def, outcome, pe.bindings, pe.payload, false);
  // Bindings of later popups may have died in the meantime.
  s.pending = s.pending.filter((p) =>
    Object.values(p.bindings).every((id) => s.npcs.find((n) => n.id === id)?.alive),
  );
  applyLocks(s);
  return ctx.finish();
}
