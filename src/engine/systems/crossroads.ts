import { EVENT_BY_ID } from '../../content/events';
import type { Ctx } from '../ctx';
import { fireEvent } from '../events/select';
import { capSalary } from './careers';

const CROSSROADS = ['xr_manage', 'xr_poached', 'xr_package', 'xr_sabbatical'];

/** Every five to eight years in a job, a fork in the road: a real decision about working life. */
export function crossroadsTick(ctx: Ctx): void {
  const s = ctx.s;
  const c = s.career;
  if (!c.jobId || s.legal.prison || s.player.age < 26 || s.player.age > 62) return;
  // The clock starts when you're hired (promotions don't reset it), and never in the first three years.
  const hired = c.history.at(-1)?.from ?? c.since;
  const last = Math.max(c.crossroadsYear ?? hired, hired);
  if (s.year - hired < 3 || s.year - last < 5 || !ctx.rng.chance(s.year - last >= 8 ? 1 : 0.35))
    return;
  c.crossroadsYear = s.year;
  const fresh = CROSSROADS.filter((id) => !(s.events.counts[id] ?? 0));
  const def = EVENT_BY_ID[ctx.rng.pick(fresh.length ? fresh : CROSSROADS)];
  if (def) fireEvent(ctx, def, 'system');
}

/** A pay change from a crossroads choice (a counter-offer, a cut to stay). */
export function scaleSalary(ctx: Ctx, mult: number): void {
  const c = ctx.s.career;
  if (!c.jobId) return;
  c.salary = Math.round(c.salary * mult);
  capSalary(ctx.s);
}

/** Taking a redundancy package: the job ends and a year of pay arrives. */
export function takePackage(ctx: Ctx, years: number): void {
  const c = ctx.s.career;
  ctx.s.money.cash += Math.round(c.salary * years);
}

/** Between 38 and 62, every six years or so: a bigger question about the shape of your life. */
export function lifeChapterTick(ctx: Ctx): void {
  const s = ctx.s;
  if (s.legal.prison || s.legal.fugitive || s.player.age < 38 || s.player.age > 62) return;
  const last = s.events.lastFired['mid_chapter'];
  if (last !== undefined && s.year - last < 6) return;
  if (!ctx.rng.chance(0.3)) return;
  const def = EVENT_BY_ID['mid_chapter'];
  if (def) fireEvent(ctx, def, 'system');
}

/** Past 66, every eight years or so: where, and how, to spend the years that are left. */
export function lateChapterTick(ctx: Ctx): void {
  const s = ctx.s;
  if (s.legal.prison || s.legal.fugitive || s.player.age < 66 || s.player.age > 85) return;
  const last = s.events.lastFired['late_chapter'];
  if (last !== undefined && s.year - last < 8) return;
  if (!ctx.rng.chance(0.3)) return;
  const def = EVENT_BY_ID['late_chapter'];
  if (def) fireEvent(ctx, def, 'system');
}

/** Married seven years or more: every eight years or so, the marriage asks for attention. */
export function marriageTick(ctx: Ctx): void {
  const s = ctx.s;
  if (s.legal.prison || s.player.age < 28 || s.player.age > 75) return;
  const sp = s.npcs.find((n) => n.alive && n.roles.includes('spouse'));
  if (!sp?.romance || s.year - sp.romance.since < 7) return;
  const last = s.events.lastFired['mar_checkin'];
  if (last !== undefined && s.year - last < 8) return;
  if (!ctx.rng.chance(0.25)) return;
  const def = EVENT_BY_ID['mar_checkin'];
  if (def) fireEvent(ctx, def, 'system', { years: s.year - sp.romance.since }, { sp: sp.id });
}
