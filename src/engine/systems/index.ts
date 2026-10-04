import type { Ctx } from '../ctx';
import { drawRandomEvents, runDueChains } from '../events/select';
import type { Circumstances } from '../stats';
import type { GameState } from '../types';

/** Inputs to stat drift derived from the rest of the state. */
export function yearCircumstances(s: GameState): Circumstances {
  const debts = s.money.loans.reduce((t, l) => t + l.balance, 0);
  const income = Math.max(1, s.career.salary);
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
    jobStress: 0,
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
  // 2. Finances.
  ctx.phase('finances');
  // 3. Drift.
  ctx.phase('drift');
  hooks.drift();
  // 4. System ticks.
  ctx.phase('systems');
  // 5. Chain steps due this year.
  ctx.phase('chains');
  if (!ctx.s.death) runDueChains(ctx);
  // 6. Random events.
  ctx.phase('events');
  if (!ctx.s.death) drawRandomEvents(ctx);
}
