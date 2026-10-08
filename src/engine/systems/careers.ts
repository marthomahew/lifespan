import { inRecession } from './markets';
import { RESULTS_JOBS, RESULTS_REASON, resultsCareerTick } from './career-modes';
import { luck } from './luck';
import { pickFresh } from '../fresh';
import { WORK_HARDER_ARTS, WORK_HARDER_OFFICE, WORK_HARDER_SPORT } from '../../content/work-lines';
import { JOB_BY_ID } from '../../content/jobs';
import { SPORT_BY_ID } from '../../content/sports';
import { netWorth } from '../networth';
import { initPolitics } from './politics';
import { PRO_LEAGUES } from '../../content/sport-pro';
import { officeTitles } from '../../content/politics';
import { GRAD_BY_ID } from '../../content/education';
import type { JobDef } from '../../content/types';
import type { Ctx } from '../ctx';
import { countryOf, formatMoney, money } from '../economy';
import { EngineError } from '../errors';
import { EVENT_BY_ID } from '../../content/events';
import { fireEvent } from '../events/select';
import { addNpc, remember } from '../npc';
import { addStat } from '../stats';
import type { GameState } from '../types';
import { clampStat } from '../util';
import { clampOdds, playerOdds } from './odds';
import { perkBonus, perkEffect } from './perks';

export {
  hasAdultRecord,
  hasEducation,
  hasOpenJuvenileRecord,
  interviewOdds,
  isVeteran,
  jobListings,
  unmetRequirements,
  type Listing,
} from './career-requirements';
import { interviewOdds, unmetRequirements } from './career-requirements';

export function salaryFor(ctx: Ctx, job: JobDef, level: number): number {
  const sport = job.id === 'professional_athlete' ? SPORT_BY_ID[ctx.s.sport?.sport ?? ''] : null;
  if (sport) {
    // Each sport pays its own way. The top two rungs are a global market, paid in dollars;
    // below that, pay follows the local game.
    const [lo, hi] = sport.pro.pay[Math.min(level, sport.pro.pay.length - 1)] ?? [20000, 30000];
    const posPay =
      PRO_LEAGUES[ctx.s.sport?.sport ?? '']?.positions.find((p) => p.id === ctx.s.sport?.position)
        ?.pay ?? 1;
    const ref = Math.round(lo * Math.pow(hi / lo, ctx.rng.next()) * posPay);
    return level >= 3
      ? Math.round(ref * ctx.s.inflation * countryOf(ctx.s).currency.perUsd)
      : money(ctx.s, ref, 'wage');
  }
  const [lo, hi] = job.salary[Math.min(level, job.salary.length - 1)] ?? [20000, 30000];
  return money(ctx.s, ctx.rng.int(lo, hi), 'wage');
}

/** A job's title at a level: a professional athlete's comes from their sport. */
export function titleFor(s: GameState, job: JobDef, level: number): string {
  if (job.id === 'politician')
    return officeTitles(s.player.country)[Math.min(4, level)] ?? 'Politician';
  const sport = job.id === 'professional_athlete' ? SPORT_BY_ID[s.sport?.sport ?? ''] : null;
  const titles = sport ? sport.pro.titles : job.titles;
  return titles[Math.min(level, titles.length - 1)] ?? job.titles[0] ?? '';
}

/** Leave the current job's coworkers behind (they become acquaintances). */
function leaveCoworkers(ctx: Ctx): void {
  for (const n of ctx.s.npcs) {
    if (n.roles.includes('coworker') || n.roles.includes('boss')) {
      n.roles = n.roles.filter((r) => r !== 'coworker' && r !== 'boss');
      if (!n.roles.length) n.roles.push('acquaintance');
    }
  }
}

export function hire(ctx: Ctx, jobId: string, force = false, quiet = false): void {
  const s = ctx.s;
  s.player.flags = s.player.flags.filter((f) => f !== 'on_benefits');
  const job = JOB_BY_ID[jobId];
  if (!job) return;
  // A proper job checks papers; on the run, only cash-in-hand work (part-time) is open.
  if (!force && !job.partTime && s.legal.fugitive && !s.player.flags.includes('false_papers')) {
    ctx.log(
      'work',
      'They want a passport and a tax number by Friday. You do not go back on Friday.',
    );
    return;
  }
  const c = s.career;
  if (job.partTime) {
    c.partTimeId = job.id;
    ctx.log(
      'work',
      `You start as ${titleFor(s, job, 0)}. The uniform is itchy but the money is money.`,
      true,
    );
    return;
  }
  if (c.jobId) {
    const was = JOB_BY_ID[c.jobId];
    if (was && !quiet)
      ctx.log('work', `You leave your job as ${titleFor(s, was, c.level)} for the new one.`, true);
    endJob(ctx, 'moved on');
  }
  // A full-time job and your own shop don't both fit in a day: a manager takes over.
  if (s.business?.hands === 'self') {
    s.business.hands = 'manager';
    if (!quiet) ctx.log('work', `A manager takes over the day to day at ${s.business.name}.`);
  }
  leaveCoworkers(ctx);
  c.jobId = job.id;
  c.level = 0;
  // A politician starts with a party, a term and an approval rating.
  if (job.id === 'politician' && !s.politics) initPolitics(ctx);
  c.since = s.year;
  c.performance = 55;
  c.salary = salaryFor(ctx, job, 0);
  c.retired = false;
  c.history.push({
    jobId: job.id,
    title: titleFor(s, job, 0) || job.id,
    from: s.year,
    to: null,
    reason: '',
  });
  if (!s.player.flags.includes('ever_employed_ft')) s.player.flags.push('ever_employed_ft');
  if (job.id === 'doctor' && !s.player.flags.includes('residency_done'))
    s.education.residency = GRAD_BY_ID['medicine']?.residency ?? 3;
  const boss = addNpc(ctx, {
    role: 'boss',
    age: Math.max(25, s.player.age + ctx.rng.int(3, 20)),
    rel: ctx.rng.int(40, 65),
  });
  boss.job = job.titles[Math.min(job.titles.length - 1, 2)] ?? 'Manager';
  // One senior colleague, then a peer.
  const senior = addNpc(ctx, {
    role: 'coworker',
    age: Math.min(70, s.player.age + ctx.rng.int(12, 30)),
    rel: ctx.rng.int(45, 70),
  });
  senior.job = job.titles[Math.min(job.titles.length - 1, 1)] ?? null;
  for (let i = 0; i < 1; i++) {
    const cw = addNpc(ctx, {
      role: 'coworker',
      age: Math.max(18, s.player.age + ctx.rng.int(-8, 10)),
      rel: ctx.rng.int(40, 65),
    });
    cw.job = job.titles[0] ?? null;
  }
  // Mid-career, the office also has someone just starting out.
  if (s.player.age >= 35) {
    const junior = addNpc(ctx, {
      role: 'coworker',
      age: ctx.rng.int(22, 30),
      rel: ctx.rng.int(40, 65),
    });
    junior.job = job.titles[0] ?? null;
  }
  if (!quiet)
    ctx.log(
      'work',
      `You're hired as ${titleFor(s, job, 0)} at ${formatMoney(s, c.salary)} a year.`,
      true,
    );
}

export function endJob(ctx: Ctx, reason: string): void {
  const c = ctx.s.career;
  const rec = c.history.at(-1);
  if (rec && rec.to === null) {
    rec.to = ctx.s.year;
    rec.reason = reason;
  }
  c.jobId = null;
  c.level = 0;
  c.salary = 0;
  leaveCoworkers(ctx);
}

/** Apply for a job: part-time jobs decide on the spot; full-time ones go to an interview popup. */
export function applyForJob(ctx: Ctx, jobId: string): void {
  const s = ctx.s;
  const job = JOB_BY_ID[jobId];
  if (!job) throw new EngineError(`unknown job ${jobId}`);
  if (s.career.jobId === jobId || s.career.partTimeId === jobId)
    throw new EngineError('you already work there');
  if (s.career.appliedThisYear.includes(jobId))
    throw new EngineError('you already applied this year');
  const unmet = unmetRequirements(s, job);
  if (unmet.length) throw new EngineError(`needs ${unmet.join(', ')}`);
  s.career.appliedThisYear.push(jobId);
  const odds = interviewOdds(s, job);
  if (job.partTime) {
    if (ctx.roll(Math.min(0.95, odds + 0.2))) hire(ctx, jobId);
    else ctx.log('work', `The ${job.titles[0]?.toLowerCase()} job goes to someone's cousin.`);
    return;
  }
  const variants = ['interview_panel', 'interview_casual', 'interview_test'].filter(
    (id) => EVENT_BY_ID[id],
  );
  const def = EVENT_BY_ID[ctx.rng.pick(variants)];
  if (!def) {
    if (ctx.roll(odds)) hire(ctx, jobId);
    return;
  }
  fireEvent(ctx, def, 'system', {
    jobId,
    odds: Math.round(odds * 1000) / 1000,
    title: titleFor(s, job, 0) || job.id,
  });
}

/** Yearly job tick: performance, raises, promotions, firing, residency (SPEC §5.3). */
export function careerTick(ctx: Ctx): void {
  const s = ctx.s;
  const c = s.career;
  const r = ctx.rng;
  if (!c.jobId) {
    // Out of work at retirement age with a working life behind you: the pension starts anyway.
    if (!c.retired && c.yearsWorked > 0 && s.player.age >= countryOf(s).ages.retirement) {
      c.retired = true;
      c.pension = pensionFor(s);
      ctx.log(
        'work',
        `You reach retirement age and your pension starts: ${formatMoney(s, c.pension)} a year.`,
        true,
      );
    }
    return;
  }
  const job = JOB_BY_ID[c.jobId];
  if (!job) return;
  c.yearsWorked += 1;
  const st = s.player.stats;
  const target =
    25 +
    st.smarts * 0.25 +
    st.discipline * 0.3 +
    playerOdds(s, 'work') * 60 -
    Math.max(0, st.stress - 70) * 0.4 +
    (c.workedHarder === s.year - 1 ? 12 : 0) +
    // Luck at work (and, for athletes, in sport) lifts how well it goes.
    20 * luck(s, 'career') +
    (job.field === 'sports' ? 20 * luck(s, 'sport') : 0);
  c.performance = clampStat(c.performance + (target - c.performance) * 0.35 + r.int(-6, 6));
  c.salary = Math.round(c.salary * (1 + Math.max(0, r.normal(0.025, 0.01))));
  capSalary(s);
  c.peakSalary = Math.max(c.peakSalary ?? 0, c.salary);
  if (s.education.residency > 0 && job.id === 'doctor') {
    s.education.residency -= 1;
    if (s.education.residency === 0) {
      s.player.flags.push('residency_done');
      ctx.log('work', 'Residency is over. You sleep for a whole weekend.', true);
    }
  }
  if (RESULTS_JOBS.includes(job.id) && resultsCareerTick(ctx, job)) return;
  const yearsAtLevel = s.year - c.since;
  const canPromote =
    c.level < job.titles.length - 1 && !(job.id === 'doctor' && s.education.residency > 0);
  const lucky = luck(s, 'career');
  if (
    canPromote &&
    c.performance >= 75 &&
    yearsAtLevel >= (lucky >= 1 ? 1 : 2) &&
    // Better work and a longer wait both make it likelier: a star rarely waits long.
    r.chance(
      Math.min(
        0.95,
        0.35 + (c.performance - 75) * 0.015 + Math.max(0, yearsAtLevel - 2) * 0.15 + 0.35 * lucky,
      ),
    )
  )
    promote(ctx, job);
  else if (c.performance < 25 && lucky < 1 && r.chance(0.4)) {
    ctx.log(
      'work',
      `You're let go from your job as ${titleFor(s, job, c.level)}. HR is very sorry, apparently.`,
      true,
    );
    endJob(ctx, 'fired');
    addStat(s, 'happiness', -10);
    addStat(s, 'stress', 8);
  } else if (inRecession(s.year) && c.performance < 65 && lucky < 1 && r.chance(0.07)) {
    ctx.log(
      'work',
      'The recession reaches your floor. A meeting is booked with HR, and you are part of the cuts.',
      true,
    );
    endJob(ctx, 'laid off');
    addStat(s, 'happiness', -10);
    addStat(s, 'stress', 10);
  }
}

export function promote(ctx: Ctx, job: JobDef): void {
  const c = ctx.s.career;
  c.level = Math.min(job.titles.length - 1, c.level + 1);
  c.since = ctx.s.year;
  c.salary = Math.max(Math.round(c.salary * 1.12), salaryFor(ctx, job, c.level));
  capSalary(ctx.s);
  const title = titleFor(ctx.s, job, c.level) || job.id;
  const rec = c.history.at(-1);
  if (rec) rec.title = title;
  ctx.log('work', `Promoted to ${title}.`, true);
  addStat(ctx.s, 'happiness', 6);
}

/** Pension per year in local currency: years worked × the country's rate, plus a slice of final salary. */
export function pensionFor(s: GameState): number {
  const c = countryOf(s);
  const years = s.career.yearsWorked + (s.military?.years ?? 0);
  // Final pay, or most of your best if you're between jobs when the pension starts.
  // (A long-ago peak, such as a sports contract, counts only up to twice today's pay or a
  // generous professional salary: a pension follows a working life, not one big year.)
  const peak = Math.min(
    (s.career.peakSalary ?? 0) * 0.85,
    Math.max(s.career.salary * 2, money(s, 200000, 'wage')),
  );
  const pay = Math.max(s.career.salary, peak);
  const full = money(s, years * c.pensionPerYear, 'wage') + pay * Math.min(0.4, years * 0.01);
  // Past seven-tenths of final pay (or a floor, for low earners) each extra counts a quarter:
  // a pension rarely beats the salary it replaces. A pension perk is a better scheme on top.
  const soft = Math.max(pay * 0.7, money(s, 6000, 'wage'));
  const capped = full <= soft ? full : soft + (full - soft) * 0.25;
  return Math.round(capped * perkEffect(s).pension);
}

export function retire(ctx: Ctx): void {
  const s = ctx.s;
  if (!s.career.jobId) throw new EngineError('you have no job to retire from');
  if (s.player.age < 50) throw new EngineError('retirement is from age 50');
  const early = s.player.age < countryOf(s).ages.retirement;
  s.career.pension = Math.round(pensionFor(s) * (early ? 0.6 : 1));
  endJob(ctx, 'retired');
  s.career.retired = true;
  ctx.log(
    'work',
    `You retire${early ? ' early' : ''}. The pension is ${formatMoney(s, s.career.pension)} a year and the cake is lemon.`,
    true,
  );
  addStat(s, 'stress', -15);
}

/** A modest safety net for adults out of work, so a bad run slows down rather than spirals. */
export function unemploymentBenefit(s: GameState): number {
  const c = s.career;
  const p = s.player;
  if (p.age < 18 || p.age >= countryOf(s).ages.retirement) return 0;
  if (c.jobId || c.partTimeId || c.retired || s.education.enrollment || s.business) return 0;
  // Support needs papers; someone on the run can't sign on.
  if (s.legal.prison || s.military?.active || s.legal.fugitive) return 0;
  // Means-tested: savings above a modest cushion mean you live on those first.
  if (s.money.cash + s.money.savings > money(s, 30000)) return 0;
  // ...and so does wealth of any kind (a yacht is not hardship).
  if (netWorth(s) > money(s, 100000)) return 0;
  return money(s, 7000, 'wage');
}

/** Yearly income for the finances step. */
export function careerIncome(s: GameState): { salary: number; other: number } {
  const c = s.career;
  let salary = c.jobId ? c.salary : 0;
  let other = c.retired ? c.pension : 0;
  if (c.partTimeId) {
    const pt = JOB_BY_ID[c.partTimeId];
    const [lo, hi] = pt?.salary[0] ?? [0, 0];
    salary += money(s, (lo + hi) / 2, 'wage');
  }
  other += perkBonus(s) + unemploymentBenefit(s);
  if (s.legal.prison) {
    salary = 0;
    other = 0;
  }
  return { salary, other };
}

/** Jobs and their risk feed mortality (dangerous jobs). */
export function currentJobRisk(s: GameState): number {
  return s.career.jobId ? (JOB_BY_ID[s.career.jobId]?.risk ?? 0) : 0;
}

export function jobStress(s: GameState): number {
  return s.career.jobId ? (JOB_BY_ID[s.career.jobId]?.stress ?? 0) : 0;
}

/** On-the-job actions: work harder, ask for a raise or promotion, quit, freelance. */
export function careerAction(ctx: Ctx, id: string): void {
  const s = ctx.s;
  const c = s.career;
  const job = c.jobId ? JOB_BY_ID[c.jobId] : undefined;
  switch (id) {
    case 'work_harder': {
      if (!job) throw new EngineError('you need a job');
      if (c.workedHarder === s.year) throw new EngineError('already done this year');
      c.workedHarder = s.year;
      c.performance = clampStat(c.performance + 8);
      addStat(s, 'stress', 5);
      // Athletes and performers work harder in their own way.
      if (job.field === 'sports' || job.field === 'arts') {
        ctx.log(
          'work',
          pickFresh(ctx, job.field === 'sports' ? WORK_HARDER_SPORT : WORK_HARDER_ARTS),
        );
        return;
      }
      ctx.log('work', pickFresh(ctx, WORK_HARDER_OFFICE));
      return;
    }
    case 'ask_raise': {
      if (!job) throw new EngineError('you need a job');
      if (RESULTS_JOBS.includes(job.id))
        throw new EngineError(RESULTS_REASON[job.id] ?? 'not here');
      if (usedKey(s, 'raise')) throw new EngineError('already asked this year');
      markKey(s, 'raise');
      if (
        ctx.roll(
          clampOdds(
            0.2 + (c.performance - 50) * 0.012 + playerOdds(s, 'social') + 0.4 * luck(s, 'career'),
          ),
        )
      ) {
        c.salary = Math.round(c.salary * 1.08);
        capSalary(s);
        ctx.log('work', `Your boss agrees to a raise. You are now on ${formatMoney(s, c.salary)}.`);
        addStat(s, 'happiness', 4);
      } else {
        c.performance = clampStat(c.performance - 4);
        ctx.log(
          'work',
          pickFresh(ctx, [
            'Your boss says "not this year" with the confidence of someone who says it every year.',
            'Your boss is very sympathetic about the budget, which is apparently a natural disaster.',
            'You are told your contribution is "really valued", in a tone that does not include money.',
            'Your boss promises to "revisit it in the new year" and writes nothing down.',
            'HR sends a chart about market rates. You appear to be exactly on it, somehow.',
          ]),
        );
        addStat(s, 'happiness', -3);
      }
      return;
    }
    case 'ask_promotion': {
      if (!job) throw new EngineError('you need a job');
      if (RESULTS_JOBS.includes(job.id))
        throw new EngineError(RESULTS_REASON[job.id] ?? 'not here');
      if (usedKey(s, 'promo')) throw new EngineError('already asked this year');
      markKey(s, 'promo');
      if (c.level >= job.titles.length - 1) throw new EngineError('you are already at the top');
      if (job.id === 'doctor' && s.education.residency > 0)
        throw new EngineError('finish your residency first');
      if (
        ctx.roll(
          clampOdds(
            0.1 +
              (c.performance - 60) * 0.015 +
              (s.year - c.since) * 0.04 +
              0.4 * luck(s, 'career'),
          ),
        )
      )
        promote(ctx, job);
      else {
        ctx.log(
          'work',
          pickFresh(ctx, [
            'You ask for the promotion. Someone from another department gets it.',
            'The promotion goes to a person who laughs at all the director’s jokes. You make a note to be funnier.',
            'You are told you are “on the radar”. The radar, it turns out, is a very large screen.',
            'They promote from outside. You are asked to help the new hire settle in.',
            'Not this round, says your boss, which is what your boss said last round.',
          ]),
        );
        addStat(s, 'happiness', -4);
      }
      return;
    }
    case 'quit': {
      if (!job) throw new EngineError('you need a job');
      ctx.log(
        'work',
        `You quit your job as ${titleFor(s, job, c.level)}. The exit interview is the most honest conversation you've had there.`,
        true,
      );
      endJob(ctx, 'quit');
      addStat(s, 'stress', -6);
      return;
    }
    case 'quit_part_time': {
      if (!c.partTimeId) throw new EngineError('you have no part-time job');
      c.partTimeId = null;
      ctx.log('work', 'You hand in your apron and your notice.');
      return;
    }
    case 'retire':
      retire(ctx);
      return;
    case 'freelance': {
      if (s.player.age < 16) throw new EngineError('from age 16');
      if (s.legal.prison) throw new EngineError('not from prison');
      if (c.freelanceYear === s.year) throw new EngineError('one gig a year');
      c.freelanceYear = s.year;
      const sk = s.player.skills;
      const best = Math.max(
        sk['programming'] ?? 0,
        sk['art'] ?? 0,
        sk['writing'] ?? 0,
        sk['cooking'] ?? 0,
        10,
      );
      const pay = money(s, 200 + best * ctx.rng.int(20, 60), 'wage');
      s.money.cash += pay;
      ctx.log(
        'work',
        pickFresh(ctx, [
          `A freelance gig pays ${formatMoney(s, pay)}. The client asks for "one small change" eleven times.`,
          `A weekend job for a friend of a friend: ${formatMoney(s, pay)}, paid on time, which feels like a miracle.`,
          `A freelance job pays ${formatMoney(s, pay)} and comes with a brief that changes twice before lunch.`,
          `You take on a side project for ${formatMoney(s, pay)}. The invoice is the most satisfying thing you write all year.`,
        ]),
      );
      return;
    }
  }
  throw new EngineError(`unknown career action ${id}`);
}

const usedKey = (s: GameState, k: string): boolean =>
  s.usage.year === s.year && (s.usage.used[`c:${k}`] ?? 0) > 0;
const markKey = (s: GameState, k: string): void => {
  if (s.usage.year !== s.year) s.usage = { year: s.year, used: {} };
  s.usage.used[`c:${k}`] = 1;
};

export function rememberBoss(ctx: Ctx, delta: number, text: string): void {
  const boss = ctx.s.npcs.find((n) => n.alive && n.roles.includes('boss'));
  if (boss) remember(ctx.s, boss, text, delta);
}

/** An heir carries on the working life they already had: the job, at their level, quietly. */
export function takeOverJob(ctx: Ctx, jobId: string, level: number): void {
  const job = JOB_BY_ID[jobId];
  if (!job || job.partTime) return;
  const s = ctx.s;
  if (jobId === 'doctor' && !s.player.flags.includes('residency_done'))
    s.player.flags.push('residency_done');
  hire(ctx, jobId, true, true);
  const c = s.career;
  c.level = Math.min(job.titles.length - 1, Math.max(0, level));
  c.salary = salaryFor(ctx, job, c.level);
  c.since = s.year - ctx.rng.int(2, 10);
  const rec = c.history[c.history.length - 1];
  if (rec) rec.title = titleFor(s, job, c.level) || rec.title;
  s.education.residency = 0;
}

/** Pay stays within reach of the job's band for its level (raises can't compound forever). */
export function capSalary(s: GameState): void {
  const c = s.career;
  const job = c.jobId ? JOB_BY_ID[c.jobId] : undefined;
  if (!job) return;
  // An athlete's pay is set by their sport's market, contract by contract.
  if (job.id === 'professional_athlete' && s.sport) return;
  const band = job.salary[Math.min(c.level, job.salary.length - 1)];
  if (!band) return;
  c.salary = Math.min(c.salary, money(s, band[1] * 1.3, 'wage'));
}
