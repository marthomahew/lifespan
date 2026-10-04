import type { Ctx } from '../ctx';
import { fertilityBaseline, healthBaseline, looksBaseline } from '../stats';
import { clampStat } from '../util';
import { educationCatchUp } from './education';

/** Stats move toward what the skipped years would have made them. */
function statsCatchUp(ctx: Ctx, from: number, to: number): void {
  const p = ctx.s.player;
  const st = p.stats;
  if (to > from) {
    const schoolYears = Math.max(0, Math.min(to, 22) - Math.max(from, 3));
    const cap = 40 + p.genes.smarts * 0.6;
    if (schoolYears > 0 && st.smarts < cap)
      st.smarts = clampStat(Math.min(cap, st.smarts + schoolYears * 2.2));
  }
  const pull = (cur: number, target: number): number => clampStat(cur + (target - cur) * 0.8);
  st.health = pull(st.health, healthBaseline(to, p.genes.health));
  st.looks = pull(st.looks, looksBaseline(to, p.genes.looks));
  st.fertility = clampStat(fertilityBaseline(to, p.gender));
}

/** After a time jump (age cheat), bring systems up to date. */
export function catchUpSystems(ctx: Ctx, from: number, to: number): void {
  statsCatchUp(ctx, from, to);
  educationCatchUp(ctx, from, to);
}
