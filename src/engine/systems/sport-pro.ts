import { COUNTRY_BY_ID } from '../../content/countries';
import { JOB_BY_ID } from '../../content/jobs';
import { PRO_LEAGUES, type Position, type ProLeague } from '../../content/sport-pro';
import { SPORT_BY_ID } from '../../content/sports';
import type { Ctx } from '../ctx';
import { countryOf, formatMoney } from '../economy';
import { addStat } from '../stats';
import type { GameState } from '../types';
import { hire, salaryFor, titleFor } from './careers';

/** A professional career in a sport: team, contract, draft, numbers and honours. */
export type ProRecord = {
  team: string;
  /** Overall pick, for draft sports (0: undrafted). */
  pick?: number;
  contractYears: number;
  seasons: number;
  honours: string[];
  /** Last season's line ("4,100 passing yards and 31 touchdowns"). */
  last?: string;
};

export const leagueOf = (s: GameState): ProLeague | undefined => PRO_LEAGUES[s.sport?.sport ?? ''];

/** Your position (or event, or role): chosen when you took the sport up, else the first. */
export function positionOf(s: GameState): Position | undefined {
  const lg = leagueOf(s);
  if (!lg) return undefined;
  return lg.positions.find((p) => p.id === s.sport?.position) ?? lg.positions[0];
}

/** Draft sports: where you'd go in this year's draft, from your form and your programme. */
export function draftPick(ctx: Ctx): { pick: number; line: string } | null {
  const s = ctx.s;
  const lg = leagueOf(s);
  const r = s.sport;
  if (!lg?.rookie || !r) return null;
  // A 100-form star at a major programme goes in the top handful; most go much later.
  const strength = r.form + (r.level >= 4 ? 8 : 0) + ctx.rng.normal(0, 6);
  const raw = Math.round(((112 - strength) / 62) ** 2 * lg.rookie.picks);
  const pick = Math.max(1, raw);
  if (pick > lg.rookie.picks)
    return { pick: 0, line: 'Nobody calls your name, but a team offers you a free-agent deal.' };
  const round = Math.ceil(pick / lg.rookie.perRound);
  const ord = (k: number): string =>
    `${k}${k % 10 === 1 && k % 100 !== 11 ? 'st' : k % 10 === 2 && k % 100 !== 12 ? 'nd' : k % 10 === 3 && k % 100 !== 13 ? 'rd' : 'th'}`;
  const line =
    pick === 1
      ? 'You go first overall.'
      : round === 1
        ? `You go ${ord(pick)} overall, in the first round.`
        : `You go in round ${round}, ${ord(pick)} overall.`;
  return { pick, line };
}

function teamName(ctx: Ctx, lg: ProLeague): string {
  const s = ctx.s;
  const sportDef = SPORT_BY_ID[s.sport?.sport ?? ''];
  // Individual sports have a sponsor or a team, not a city club.
  if (!lg.nicknames.length) {
    if (sportDef?.route.kind === 'team') return 'a WorldTour team';
    return 'the tour';
  }
  // North American leagues play in US (and Canadian) cities; clubs are local.
  const country =
    lg.league === 'the NFL' || lg.league === 'the NBA' || lg.league === 'the NHL'
      ? COUNTRY_BY_ID['us']
      : countryOf(s);
  const city = ctx.rng.pick(country?.cities ?? ['Springfield']);
  return lg.league === 'the top flight'
    ? `${city} ${ctx.rng.pick(lg.nicknames)}`
    : `the ${city} ${ctx.rng.pick(lg.nicknames)}`;
}

/** Turning pro: the contract, the team, and where you start (from your pick or form). */
export function turnPro(ctx: Ctx, pick?: number): void {
  const s = ctx.s;
  const job = JOB_BY_ID['professional_athlete'];
  const lg = leagueOf(s);
  if (!job) return;
  hire(ctx, 'professional_athlete', true);
  if (s.career.jobId !== 'professional_athlete' || !lg) return;
  const c = s.career;
  const form = s.sport?.form ?? 50;
  let level: number;
  let salary: number;
  if (lg.rookie && pick !== undefined) {
    // Rookie scale by pick; undrafted means the practice squad or a two-way deal.
    level = pick === 0 ? 0 : pick <= 10 ? 2 : 1;
    const band = pick === 0 ? undefined : lg.rookie.scale.find(([last]) => pick <= last);
    const ref = band ? band[1] : (SPORT_BY_ID[s.sport?.sport ?? '']?.pro.pay[0]?.[0] ?? 60000);
    salary = Math.round(ref * s.inflation * countryOf(s).currency.perUsd);
  } else {
    level = form >= 88 ? 2 : form >= 70 ? 1 : 0;
    salary = salaryFor(ctx, job, level);
  }
  c.level = level;
  c.salary = salary;
  const rec = c.history.at(-1);
  if (rec) rec.title = titleFor(s, job, level);
  const team = teamName(ctx, lg);
  s.proSport = {
    team,
    ...(pick !== undefined ? { pick } : {}),
    contractYears: lg.rookie && pick ? 4 : 3,
    seasons: 0,
    honours: [],
  };
  const pos = positionOf(s);
  ctx.log(
    'work',
    `${s.sport ? (SPORT_BY_ID[s.sport.sport]?.emoji ?? '🏅') : '🏅'} You sign with ${team}${pos && lg.positions.length > 1 ? ` as a ${pos.label.toLowerCase()}` : ''}: ${s.proSport.contractYears} years at ${formatMoney(s, salary)} a year. You start as a ${titleFor(s, job, level).toLowerCase()}.`,
    true,
  );
}

/** A professional season: standing from form, the numbers, honours, titles, contracts. */
export function proSeason(ctx: Ctx): void {
  const s = ctx.s;
  const c = s.career;
  const sp = s.sport;
  const lg = leagueOf(s);
  const job = JOB_BY_ID['professional_athlete'];
  if (!sp || !lg || !job) return;
  const p = (s.proSport ??= { team: teamName(ctx, lg), contractYears: 2, seasons: 0, honours: [] });
  p.seasons += 1;
  const form = sp.form;
  const q = Math.max(0, Math.min(1, (form - 40) / 60));
  const pos = positionOf(s);
  // Standing (title) follows form; pay follows the contract.
  const level = form >= 88 ? 4 : form >= 76 ? 3 : form >= 63 ? 2 : form >= 50 ? 1 : 0;
  const was = c.level;
  if (level !== was) {
    c.level = level;
    const rec = c.history.at(-1);
    if (rec) rec.title = titleFor(s, job, level);
  }
  const emoji = SPORT_BY_ID[sp.sport]?.emoji ?? '🏅';
  if (pos) {
    p.last = pos.stats(q, ctx.rng.next());
    ctx.log(
      'work',
      `${emoji} Season ${p.seasons}${lg.nicknames.length ? ` with ${p.team}` : ''}: ${p.last}.${level > was ? ` You're now a ${titleFor(s, job, level).toLowerCase()}.` : level < was ? ` You slip to ${titleFor(s, job, level).toLowerCase()}.` : ''}`,
      level > was,
    );
  }
  // Honours: the all-star nod, the individual award, and (sometimes) the lot.
  if (form >= 85 && ctx.rng.chance(0.75)) {
    p.honours.push(`${lg.allStar} (${s.year})`);
    ctx.log('work', `⭐ You're picked for ${lg.allStar}.`, true);
    addStat(s, 'fame', 3);
  }
  if (form >= 94 && ctx.rng.chance(0.35)) {
    p.honours.push(`${lg.mvp} (${s.year})`);
    ctx.log('work', `🏆 You're named ${lg.mvp}.`, true);
    addStat(s, 'fame', 6);
  }
  if (ctx.rng.chance(Math.max(0.03, 0.05 + (form - 60) / 220))) {
    p.honours.push(`${lg.title} (${s.year})`);
    ctx.log('work', `🏆 You win ${lg.title}! The celebrations last a week.`, true);
    addStat(s, 'fame', 5);
    addStat(s, 'happiness', 10);
  }
  // Contracts: when one runs out, the market says what you're worth now.
  p.contractYears -= 1;
  if (p.contractYears <= 0) {
    const years = form >= 85 ? 5 : form >= 65 ? 3 : 1;
    const salary = salaryFor(ctx, job, level);
    const better = salary > c.salary;
    c.salary = salary;
    p.contractYears = years;
    if (form < 40 && ctx.rng.chance(0.5)) {
      ctx.log(
        'work',
        `${emoji} ${p.team === 'the tour' ? 'Your sponsor drops you' : `${p.team} release you`}. You sign a one-year deal somewhere smaller.`,
      );
      p.team = teamName(ctx, lg);
      p.contractYears = 1;
    } else
      ctx.log(
        'work',
        better
          ? `✍️ A new deal: ${years} ${years === 1 ? 'year' : 'years'} at ${formatMoney(s, salary)} a year${form >= 85 ? '. Your agent is unbearable at dinner' : ''}.`
          : `✍️ You re-sign for ${years} ${years === 1 ? 'year' : 'years'} at ${formatMoney(s, salary)} a year.`,
        better,
      );
  } else if (lg.nicknames.length && ctx.rng.chance(0.05)) {
    const from = p.team;
    p.team = teamName(ctx, lg);
    ctx.log(
      'work',
      `${emoji} You're traded from ${from} to ${p.team}. You pack the same bag you unpacked a year ago.`,
    );
  }
}
