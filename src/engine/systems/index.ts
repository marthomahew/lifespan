import type { Ctx } from '../ctx';
import { drawRandomEvents, runDueChains } from '../events/select';
import type { Circumstances } from '../stats';
import type { GameState } from '../types';
import { careerIncome, careerTick, jobStress } from './careers';
import { schoolTick, universityTick } from './education';
import { runFinances } from './finance';
import { militaryPay, militaryTick } from './military';
import { fameTick } from './music';
import { assetsTick } from './assets';
import { healthTick } from './health';
import { legalTick } from './crime';
import { vicesTick } from './vices';
import { npcLifecycle, relationshipDecay } from './npcs';
import { romanceTick } from './romance';

/** Inputs to stat drift derived from the rest of the state. */
export function yearCircumstances(s: GameState): Circumstances {
  const debts = s.money.loans.reduce((t, l) => t + l.balance, 0);
  const income = Math.max(1, s.career.salary + militaryPay(s));
  const close = s.npcs.filter(
    (n) =>
      n.alive &&
      n.roles.some(
        (r) =>
          r === 'mother' || r === 'father' || r === 'spouse' || r === 'partner' || r === 'child',
      ),
  );
  const closeRel = close.length ? close.reduce((t, n) => t + n.rel, 0) / close.length : 50;
  return {
    debtLoad: debts > 0 ? Math.min(1, debts / (income * 4)) : 0,
    inPrison: s.legal.prison !== null,
    closeRel,
    jobStress: jobStress(s) + (s.military?.active ? 30 : 0),
    lifestyle: s.money.lifestyle === 'lavish' ? 6 : s.money.lifestyle === 'frugal' ? -4 : 0,
    studied: s.education.studyYear === s.year - 1,
    inEducation:
      (s.player.age >= 5 && s.player.age <= 17 && !s.education.droppedOut) ||
      s.education.enrollment !== null,
  };
}

export type YearHooks = { drift: () => void };

/** Steps 2–6 of the year in SPEC §3.4 order. */
export function runYearSystems(ctx: Ctx, hooks: YearHooks): void {
  const s = ctx.s;
  // 2. Finances.
  ctx.phase('finances');
  const income = careerIncome(s);
  runFinances(ctx, { salary: income.salary + militaryPay(s), other: income.other });
  // 3. Drift.
  ctx.phase('drift');
  hooks.drift();
  vicesTick(ctx);
  relationshipDecay(ctx);
  // 4. System ticks.
  ctx.phase('systems');
  schoolTick(ctx);
  universityTick(ctx);
  careerTick(ctx);
  militaryTick(ctx);
  fameTick(ctx);
  healthTick(ctx);
  legalTick(ctx);
  assetsTick(ctx);
  npcLifecycle(ctx);
  romanceTick(ctx);
  // 5. Chain steps due this year.
  ctx.phase('chains');
  if (!s.death) runDueChains(ctx);
  // 6. Random events.
  ctx.phase('events');
  if (!s.death) drawRandomEvents(ctx);
}
