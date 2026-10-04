import { JOB_BY_ID, JOBS } from '../../content/jobs';
import { SPECIALTY_BY_ID } from '../../content/military';
import { GRAD_BY_ID } from '../../content/education';
import type { EducationLevel, JobDef } from '../../content/types';
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
import { speaksLocal } from './emigration';

const RANK: Record<EducationLevel, number> = {
  none: 0,
  high_school: 1,
  associate: 2,
  bachelor: 3,
  master: 4,
  mba: 5,
  law: 5,
  medicine: 5,
  doctorate: 5,
};

export function hasEducation(s: GameState, need: EducationLevel, majors?: string[]): boolean {
  const degs = s.education.degrees;
  const ok = (lvl: string): boolean => {
    if (need === 'none') return true;
    if (['law', 'medicine', 'mba', 'doctorate'].includes(need)) return lvl === need;
    if (need === 'master') return ['master', 'mba', 'doctorate'].includes(lvl);
    return (RANK[lvl as EducationLevel] ?? 0) >= RANK[need];
  };
  // Level and major must be satisfied by the same degree.
  const needsMajor = Boolean(majors?.length) && RANK[need] >= 2;
  if (needsMajor && RANK[need] >= 5)
    return degs.some((d) => ok(d.level)) && degs.some((d) => (majors ?? []).includes(d.field));
  return degs.some((d) => ok(d.level) && (!needsMajor || (majors ?? []).includes(d.field)));
}

export const hasAdultRecord = (s: GameState): boolean =>
  s.legal.record.some((r) => !r.juvenile && (r.verdict === 'convicted' || r.verdict === 'plea'));
/** A juvenile record counts against you until it is sealed at 18. */
export const hasOpenJuvenileRecord = (s: GameState): boolean =>
  !s.legal.sealed &&
  s.legal.record.some((r) => r.juvenile && (r.verdict === 'convicted' || r.verdict === 'plea'));
export const isVeteran = (s: GameState): boolean =>
  s.military !== null &&
  !s.military.active &&
  (s.military.discharge === 'honorable' || s.military.discharge === 'general');

/** Requirements the player doesn't meet for a job (empty = eligible). */
export function unmetRequirements(s: GameState, job: JobDef): string[] {
  const r = job.req;
  const p = s.player;
  const out: string[] = [];
  const vet = isVeteran(s) && r.veteranBonus;
  if (p.age < r.minAge) out.push(`age ${r.minAge}+`);
  if (r.education && !vet && !hasEducation(s, r.education, r.majors))
    out.push(
      r.majors?.length
        ? `${r.education.replace('_', ' ')} in ${r.majors.join('/')}`
        : `${r.education.replace('_', ' ')} degree`,
    );
  if (r.smarts && p.stats.smarts < r.smarts) out.push(`smarts ${r.smarts}`);
  if (r.looks && p.stats.looks < r.looks) out.push(`looks ${r.looks}`);
  if (r.health && p.stats.health < r.health) out.push(`health ${r.health}`);
  for (const [k, v] of Object.entries(r.skills ?? {}))
    if ((p.skills[k] ?? 0) < v) out.push(`${k} ${v}`);
  if (r.cleanRecord && (hasAdultRecord(s) || hasOpenJuvenileRecord(s))) out.push('clean record');
  if (r.licence && !s.assets.licence) out.push("driver's licence");
  if (r.countries?.length && !r.countries.includes(p.country))
    out.push('not available in this country');
  if (s.legal.prison) out.push('not from prison');
  if (s.military?.active) out.push('not while serving');
  return out;
}

export type Listing = { job: JobDef; unmet: string[]; salary: number; current: boolean };

export function jobListings(s: GameState): Listing[] {
  return JOBS.map((job) => ({
    job,
    unmet: unmetRequirements(s, job),
    salary: money(s, ((job.salary[0]?.[0] ?? 0) + (job.salary[0]?.[1] ?? 0)) / 2, 'wage'),
    current: s.career.jobId === job.id || s.career.partTimeId === job.id,
  }));
}

/** Interview odds from stats, traits, and skills, plus veteran and record effects. */
export function interviewOdds(s: GameState, job: JobDef): number {
  const p = s.player.stats;
  let o =
    0.5 +
    (p.smarts - 50) * 0.005 +
    (p.looks - 50) * 0.002 +
    playerOdds(s, 'work') +
    playerOdds(s, 'social') * 0.5;
  for (const [k, v] of Object.entries(job.req.skills ?? {}))
    o += Math.min(0.15, ((s.player.skills[k] ?? 0) - v) * 0.005);
  if (
    isVeteran(s) &&
    (job.req.veteranBonus ||
      SPECIALTY_BY_ID[s.military?.specialty ?? '']?.civilianFields.includes(job.field))
  )
    o += 0.15;
  if (hasAdultRecord(s)) o -= 0.25;
  if (s.player.age >= 18 && !speaksLocal(s)) o -= 0.15;
  if (s.career.jobId) o += 0.05;
  return clampOdds(o);
}

function salaryFor(ctx: Ctx, job: JobDef, level: number): number {
  const [lo, hi] = job.salary[Math.min(level, job.salary.length - 1)] ?? [20000, 30000];
  return money(ctx.s, ctx.rng.int(lo, hi), 'wage');
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

export function hire(ctx: Ctx, jobId: string): void {
  const s = ctx.s;
  const job = JOB_BY_ID[jobId];
  if (!job) return;
  const c = s.career;
  if (job.partTime) {
    c.partTimeId = job.id;
    ctx.log(
      'work',
      `You start as ${job.titles[0]}. The uniform is itchy but the money is money.`,
      true,
    );
    return;
  }
  if (c.jobId) endJob(ctx, 'moved on');
  leaveCoworkers(ctx);
  c.jobId = job.id;
  c.level = 0;
  c.since = s.year;
  c.performance = 55;
  c.salary = salaryFor(ctx, job, 0);
  c.retired = false;
  c.history.push({
    jobId: job.id,
    title: job.titles[0] ?? job.id,
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
  ctx.log('work', `You're hired as ${job.titles[0]} at ${formatMoney(s, c.salary)} a year.`, true);
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
    title: job.titles[0] ?? job.id,
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
    (c.workedHarder === s.year - 1 ? 12 : 0);
  c.performance = clampStat(c.performance + (target - c.performance) * 0.35 + r.int(-6, 6));
  c.salary = Math.round(c.salary * (1 + Math.max(0, r.normal(0.025, 0.01))));
  if (s.education.residency > 0 && job.id === 'doctor') {
    s.education.residency -= 1;
    if (s.education.residency === 0) {
      s.player.flags.push('residency_done');
      ctx.log('work', 'Residency is over. You sleep for a whole weekend.', true);
    }
  }
  const yearsAtLevel = s.year - c.since;
  const canPromote =
    c.level < job.titles.length - 1 && !(job.id === 'doctor' && s.education.residency > 0);
  if (canPromote && c.performance >= 75 && yearsAtLevel >= 2 && r.chance(0.35)) promote(ctx, job);
  else if (c.performance < 25 && r.chance(0.4)) {
    ctx.log(
      'work',
      `You're let go from your job as ${job.titles[c.level] ?? job.titles[0]}. HR is very sorry, apparently.`,
      true,
    );
    endJob(ctx, 'fired');
    addStat(s, 'happiness', -10);
    addStat(s, 'stress', 8);
  }
}

export function promote(ctx: Ctx, job: JobDef): void {
  const c = ctx.s.career;
  c.level = Math.min(job.titles.length - 1, c.level + 1);
  c.since = ctx.s.year;
  c.salary = Math.max(Math.round(c.salary * 1.12), salaryFor(ctx, job, c.level));
  const title = job.titles[c.level] ?? job.titles[0] ?? job.id;
  const rec = c.history.at(-1);
  if (rec) rec.title = title;
  ctx.log('work', `Promoted to ${title}.`, true);
  addStat(ctx.s, 'happiness', 6);
}

/** Pension per year in local currency: years worked × the country's rate, plus a slice of final salary. */
export function pensionFor(s: GameState): number {
  const c = countryOf(s);
  const years = s.career.yearsWorked + (s.military?.years ?? 0);
  return Math.round(
    money(s, years * c.pensionPerYear, 'wage') + s.career.salary * Math.min(0.4, years * 0.01),
  );
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
      ctx.log(
        'work',
        ctx.rng.pick([
          'You stay late every night for a month. Your boss notices; your houseplants do not survive.',
          'You answer emails at weekends. It works, and it shows on your face.',
          'You volunteer for the project nobody wants and quietly nail it.',
        ]),
      );
      return;
    }
    case 'ask_raise': {
      if (!job) throw new EngineError('you need a job');
      if (usedKey(s, 'raise')) throw new EngineError('already asked this year');
      markKey(s, 'raise');
      if (ctx.roll(clampOdds(0.2 + (c.performance - 50) * 0.012 + playerOdds(s, 'social')))) {
        c.salary = Math.round(c.salary * 1.08);
        ctx.log('work', `Your boss agrees to a raise. You are now on ${formatMoney(s, c.salary)}.`);
        addStat(s, 'happiness', 4);
      } else {
        c.performance = clampStat(c.performance - 4);
        ctx.log(
          'work',
          'Your boss says "not this year" with the confidence of someone who says it every year.',
        );
        addStat(s, 'happiness', -3);
      }
      return;
    }
    case 'ask_promotion': {
      if (!job) throw new EngineError('you need a job');
      if (usedKey(s, 'promo')) throw new EngineError('already asked this year');
      markKey(s, 'promo');
      if (c.level >= job.titles.length - 1) throw new EngineError('you are already at the top');
      if (job.id === 'doctor' && s.education.residency > 0)
        throw new EngineError('finish your residency first');
      if (ctx.roll(clampOdds(0.1 + (c.performance - 60) * 0.015 + (s.year - c.since) * 0.04)))
        promote(ctx, job);
      else {
        ctx.log('work', 'You ask for the promotion. Someone from another department gets it.');
        addStat(s, 'happiness', -4);
      }
      return;
    }
    case 'quit': {
      if (!job) throw new EngineError('you need a job');
      ctx.log(
        'work',
        `You quit your job as ${job.titles[c.level] ?? ''}. The exit interview is the most honest conversation you've had there.`,
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
        `A freelance gig pays ${formatMoney(s, pay)}. The client asks for "one small change" eleven times.`,
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
