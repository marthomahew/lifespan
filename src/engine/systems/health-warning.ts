import { EVENT_BY_ID } from '../../content/events';
import type { Ctx } from '../ctx';
import { fireEvent } from '../events/select';
import { deathProbability, riskFactors } from '../mortality';
import { lowerLabel } from '../text';

/** Yearly risk of dying above this is worth a doctor's warning. */
export const WARNING_RISK = 0.07;
const EVERY = 6;

/** Before the end, a chance to react: a doctor's warning when the risk turns serious. */
export function healthWarning(ctx: Ctx): void {
  const s = ctx.s;
  if (s.death || s.player.age < 40 || s.legal.prison || s.cheats.noBadEvents) return;
  const last = s.events.lastFired['late_health_warning'];
  if (last !== undefined && s.year - last < EVERY) return;
  if (deathProbability(s) < WARNING_RISK) return;
  const def = EVENT_BY_ID['late_health_warning'];
  if (!def) return;
  const top = [...riskFactors(s)].sort((a, b) => b.mult - a.mult)[0];
  const worry = top ? lowerLabel(top.cause) : 'your heart, and your age, and the stairs';
  fireEvent(ctx, def, 'system', { worry });
}
