import { EVENT_BY_ID } from '../../content/events';
import { PRODIGY_MILESTONES } from '../../content/prodigy';
import type { Ctx } from '../ctx';
import { fireEvent } from '../events/select';

const level = (s: Ctx['s'], skills: string[]): number =>
  Math.max(0, ...skills.map((k) => s.player.skills[k] ?? 0));

/** Once a year: the first milestone a young talent has newly reached fires its story. */
export function prodigyTick(ctx: Ctx): void {
  const s = ctx.s;
  if (s.death || s.legal.prison) return;
  const flags = s.player.flags;
  for (const m of PRODIGY_MILESTONES) {
    if (flags.includes(`pm:${m.id}`)) continue;
    if (m.after && !flags.includes(`pm:${m.after}`)) continue;
    if (s.player.age > m.maxAge || s.player.age < (m.minAge ?? 0)) continue;
    if (level(s, m.skills) < m.minLevel) continue;
    const def = EVENT_BY_ID[m.event];
    if (!def) continue;
    flags.push(`pm:${m.id}`);
    if (!flags.includes('prodigy_noticed')) flags.push('prodigy_noticed');
    fireEvent(ctx, def, 'system');
    return;
  }
  // The pressure of it all: once, a prodigy in their teens wonders whether it's worth it.
  if (
    flags.includes('prodigy_noticed') &&
    !flags.includes('pm:burnout') &&
    s.player.age >= 11 &&
    s.player.age <= 17 &&
    ctx.rng.chance(0.2)
  ) {
    const def = EVENT_BY_ID['pr_burnout'];
    if (!def) return;
    flags.push('pm:burnout');
    fireEvent(ctx, def, 'system');
  }
}
