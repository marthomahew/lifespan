import { Ctx, type Step } from './ctx';
import { EngineError } from './errors';
import { die } from './death';
import { causeOfDeath, rollMortality } from './mortality';
import { pushSnapshot } from './snapshots';
import { prunePending } from './events/select';
import { checkAchievements } from './systems/achievements';
import { stageOf, STAGE_LABEL } from './stage';
import { applyLocks, driftStats, recordStatHistory } from './stats';
import { runYearSystems, yearCircumstances } from './systems';
import { netWorthRef } from './networth';
import type { GameState } from './types';
import { cloneState } from './util';
import { checkAspirations } from './systems/aspirations';
import { healthWarning } from './systems/health-warning';
import { checkChallenge } from './systems/challenge';

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
  ctx.phase('age');
  s.player.age += 1;
  s.year += 1;
  stepInflation(ctx);
  s.events.popupsThisYear = 0;
  s.career.appliedThisYear = [];
  s.events.noticesThisYear = 0;
  const stage = stageOf(s.player.age);
  if (stage !== prevStage)
    ctx.log(
      'system',
      stage === 'middle_age'
        ? 'You are now middle-aged.'
        : stage === 'adult'
          ? 'You are now thirty, and adulthood is official, apparently.'
          : `You are now a${/^[aeiou]/i.test(STAGE_LABEL[stage]) ? 'n' : ''} ${STAGE_LABEL[stage].toLowerCase()}.`,
      true,
    );

  // 2–6 run through the system pipeline in order.
  runYearSystems(ctx, {
    drift: () => driftStats(ctx, yearCircumstances(s)),
  });

  // 7. Mortality.
  ctx.phase('mortality');
  if (!s.death && rollMortality(ctx)) die(ctx, causeOfDeath(ctx));
  healthWarning(ctx);

  // 8. Records and snapshot (autosave is the platform's job).
  ctx.phase('records');
  checkAchievements(ctx);
  checkAspirations(ctx);
  checkChallenge(ctx);
  prunePending(s);
  applyLocks(s);
  recordStatHistory(s);
  s.totals.happinessSum += s.player.stats.happiness;
  s.totals.years += 1;
  s.totals.maxNetWorthRef = Math.max(s.totals.maxNetWorthRef, Math.round(netWorthRef(s)));
  s.rng = ctx.rng.state;
  pushSnapshot(s);
}

/** The order the year's phases ran in (for tests of SPEC §3.4). */
export function traceYear(input: GameState): string[] {
  const ctx = new Ctx(cloneState(input));
  ctx.trace = [];
  ageUpInPlace(ctx);
  return ctx.trace;
}
