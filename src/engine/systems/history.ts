import { EVENTS } from '../../content/events';
import type { Ctx } from '../ctx';
import { eligibility, fireEvent } from '../events/select';

const HISTORY = EVENTS.filter((e) => e.id.startsWith('hist_'));

/** The world's moments arrive in their year, for everyone they touch (not left to chance). */
export function historyTick(ctx: Ctx): void {
  const s = ctx.s;
  if (s.death) return;
  for (const def of HISTORY) {
    if ((s.events.counts[def.id] ?? 0) > 0) continue;
    if (!eligibility(s, def).ok) continue;
    // The draft lottery isn't everyone's number: it keeps its own odds.
    if (def.id === 'hist_draft_lottery' && !ctx.rng.chance(0.35)) continue;
    fireEvent(ctx, def, 'system');
  }
}
