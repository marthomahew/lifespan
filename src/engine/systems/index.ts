import { petsTick } from './pets';
import { memoryTick } from './memories';
import { crossroadsTick, lateChapterTick, lifeChapterTick, marriageTick } from './crossroads';
import { projectsTick } from './projects';
import type { Ctx } from '../ctx';
import { drawRandomEvents, runDueChains } from '../events/select';
import type { Circumstances } from '../stats';
import type { GameState } from '../types';
import { careerIncome, careerTick, jobStress, unemploymentBenefit } from './careers';
import { schoolTick, universityTick } from './education';
import { runFinances } from './finance';
import { militaryPay, militaryTick } from './military';
import { fameTick } from './music';
import { assetsTick } from './assets';
import { healthTick } from './health';
import { legalTick } from './crime';
import { vicesTick } from './vices';
import { skillDecay } from './skills';
import { languageTick } from './emigration';
import { npcLifecycle, relationshipDecay } from './npcs';
import { romanceTick } from './romance';
import { bonusLine, perkBonus, perkEffect } from './perks';
import { injuryPenalty } from './injuries';
import { formatMoney } from '../economy';

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
    jobStress: Math.max(0, jobStress(s) + perkEffect(s).stress) + (s.military?.active ? 30 : 0),
    lifestyle:
      (s.money.lifestyle === 'lavish' ? 6 : s.money.lifestyle === 'frugal' ? -4 : 0) +
      perkEffect(s).happiness,
    studied: s.education.studyYear === s.year - 1,
    injuryPenalty: injuryPenalty(s),
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
  const bonus = perkBonus(s);
  if (bonus > 0 && !s.legal.prison) ctx.log('money', bonusLine(s, bonus));
  // Announce support once per spell out of work.
  if (unemploymentBenefit(s) === 0)
    s.player.flags = s.player.flags.filter((f) => f !== 'on_benefits');
  else if (!s.player.flags.includes('on_benefits')) {
    s.player.flags.push('on_benefits');
    ctx.log(
      'money',
      `You sign on for unemployment support: ${formatMoney(s, unemploymentBenefit(s))} a year. It covers the basics, and none of the dignity.`,
    );
  }
  runFinances(ctx, { salary: income.salary + militaryPay(s), other: income.other });
  // 3. Drift.
  ctx.phase('drift');
  hooks.drift();
  vicesTick(ctx);
  relationshipDecay(ctx);
  skillDecay(s);
  // 4. System ticks.
  ctx.phase('systems');
  schoolTick(ctx);
  universityTick(ctx);
  careerTick(ctx);
  crossroadsTick(ctx);
  lifeChapterTick(ctx);
  marriageTick(ctx);
  lateChapterTick(ctx);
  militaryTick(ctx);
  fameTick(ctx);
  healthTick(ctx);
  legalTick(ctx);
  languageTick(ctx);
  assetsTick(ctx);
  npcLifecycle(ctx);
  petsTick(ctx);
  memoryTick(ctx);
  projectsTick(ctx);
  romanceTick(ctx);
  // 5. Chain steps due this year.
  ctx.phase('chains');
  if (!s.death) runDueChains(ctx);
  // 6. Random events.
  ctx.phase('events');
  if (!s.death) drawRandomEvents(ctx);
}
