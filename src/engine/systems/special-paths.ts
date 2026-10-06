import { EVENT_BY_ID } from '../../content/events';
import { SPECIAL_PATHS } from '../../content/special-paths';
import type { Ctx } from '../ctx';
import { fireEvent } from '../events/select';

/** Once a year: the first rare path your life now adds up to, if any, comes knocking (once). */
export function specialPathsTick(ctx: Ctx): void {
  const s = ctx.s;
  if (s.pending.length > 2) return;
  for (const p of SPECIAL_PATHS) {
    if (s.player.flags.includes(`sp:${p.id}`) || !p.when(s)) continue;
    // Not every eligible year: the knock comes when it comes.
    if (!ctx.rng.chance(0.5)) return;
    const def = EVENT_BY_ID[p.event];
    if (!def) return;
    s.player.flags.push(`sp:${p.id}`);
    fireEvent(ctx, def, 'system');
    return;
  }
}
