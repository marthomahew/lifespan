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
  const last = c.crossroadsYear ?? c.since;
  if (s.year - last < 5 || !ctx.rng.chance(s.year - last >= 8 ? 1 : 0.35)) return;
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
