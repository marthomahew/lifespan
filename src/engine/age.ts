import { Ctx, type Step } from './ctx';
import { EngineError } from './errors';
import { die } from './death';
import { causeOfDeath, rollMortality } from './mortality';
import { pushSnapshot } from './snapshots';
import { stageOf, STAGE_LABEL } from './stage';
import { applyLocks, driftStats, recordStatHistory } from './stats';
import { runYearSystems, yearCircumstances } from './systems';
import { netWorthRef } from './networth';
import type { GameState } from './types';
import { cloneState } from './util';

/** Inflation: default 2.5% a year with ±1.5 points of seeded noise, never below 0. */
export function stepInflation(ctx: Ctx): void {
  const s = ctx.s;
  const rate = Math.max(0, (0.025 + (ctx.rng.next() - 0.5) * 0.03) * s.inflationMult);
  s.inflation = s.inflation * (1 + rate);
}

/** One year (SPEC §3.4). Throws if a decision is pending or the life is over. */
export function ageUp(input: GameState): Step {
  if (input.death) throw new EngineError('life is over');
  if (input.pending.length > 0) throw new EngineError('a decision is pending');
  const ctx = new Ctx(cloneState(input));
  ageUpInPlace(ctx);
  return ctx.finish();
}

export function ageUpInPlace(ctx: Ctx): void {
  const s = ctx.s;
  const prevStage = stageOf(s.player.age);
  // 1. Age, world year, inflation.
  s.player.age += 1;
  s.year += 1;
  stepInflation(ctx);
  s.events.popupsThisYear = 0;
  s.events.noticesThisYear = 0;
  const stage = stageOf(s.player.age);
  if (stage !== prevStage)
    ctx.log(
      'system',
      `You are now a${/^[aeiou]/i.test(STAGE_LABEL[stage]) ? 'n' : ''} ${STAGE_LABEL[stage].toLowerCase()}.`,
      true,
    );

  // 2–6 run through the system pipeline in order.
  runYearSystems(ctx, {
    drift: () => driftStats(ctx, yearCircumstances(s)),
  });

  // 7. Mortality.
  if (!s.death && rollMortality(ctx)) die(ctx, causeOfDeath(ctx));

  // 8. Records and snapshot (autosave is the platform's job).
  applyLocks(s);
  recordStatHistory(s);
  s.totals.happinessSum += s.player.stats.happiness;
  s.totals.years += 1;
  s.totals.maxNetWorthRef = Math.max(s.totals.maxNetWorthRef, Math.round(netWorthRef(s)));
  pushSnapshot(s);
}
