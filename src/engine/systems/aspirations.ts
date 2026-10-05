import { ASPIRATION_BY_ID, ASPIRATIONS } from '../../content/aspirations';
import type { Ctx } from '../ctx';
import { EngineError } from '../errors';
import { addStat } from '../stats';
import type { GameState } from '../types';

export const MAX_ACTIVE_ASPIRATIONS = 3;
export const ASPIRATION_MIN_AGE = 14;

const active = (s: GameState): number => s.player.aspirations.filter((a) => a.done === null).length;

/** Why a goal can't be chosen right now, or null. */
export function aspirationReason(s: GameState, id: string): string | null {
  const def = ASPIRATION_BY_ID[id];
  if (!def) return 'no such goal';
  if (s.death) return 'the life is over';
  if (s.player.age < ASPIRATION_MIN_AGE) return `goals start at ${ASPIRATION_MIN_AGE}`;
  if (s.player.aspirations.some((a) => a.id === id)) return 'already one of your goals';
  if (def.done(s)) return 'you have already done this';
  if (active(s) >= MAX_ACTIVE_ASPIRATIONS) return 'three goals at a time is plenty';
  return null;
}

export function chooseAspiration(ctx: Ctx, id: string): void {
  const why = aspirationReason(ctx.s, id);
  if (why) throw new EngineError(why);
  const def = ASPIRATION_BY_ID[id];
  ctx.s.player.aspirations.push({ id, chosen: ctx.s.year, done: null });
  ctx.log('system', `${def?.emoji ?? '🎯'} New life goal: ${def?.label ?? id}.`);
}

export function dropAspiration(ctx: Ctx, id: string): void {
  const s = ctx.s;
  const goal = s.player.aspirations.find((a) => a.id === id && a.done === null);
  if (!goal) throw new EngineError('not one of your open goals');
  s.player.aspirations = s.player.aspirations.filter((a) => a !== goal);
  ctx.log('system', `You let go of a goal: ${ASPIRATION_BY_ID[id]?.label ?? id}.`);
}

/** Mark goals reached (end of each year and after actions), celebrating each once. */
export function checkAspirations(ctx: Ctx): void {
  const s = ctx.s;
  if (s.death) return;
  for (const goal of s.player.aspirations) {
    const def = ASPIRATION_BY_ID[goal.id];
    if (goal.done !== null || !def || !def.done(s)) continue;
    goal.done = s.year;
    addStat(s, 'happiness', 10);
    addStat(s, 'stress', -5);
    ctx.toast({ kind: 'achievement', text: `${def.emoji} Goal reached: ${def.label}` });
    ctx.log(
      'achievement',
      `${def.emoji} Life goal reached: ${def.label}. You did what you set out to do.`,
      true,
    );
  }
}

/** Every goal with whether you could choose it now (the picker). */
export function aspirationOptions(s: GameState): { id: string; reason: string | null }[] {
  return ASPIRATIONS.map((a) => ({ id: a.id, reason: aspirationReason(s, a.id) }));
}
