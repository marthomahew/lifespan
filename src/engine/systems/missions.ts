import { COUNTRIES, COUNTRY_BY_ID } from '../../content/countries';
import { JOB_BY_ID } from '../../content/jobs';
import type { Ctx } from '../ctx';
import { EngineError } from '../errors';
import { addStat } from '../stats';
import type { GameState } from '../types';
import { clampStat } from '../util';
import { workTime } from './activities';
import { titleFor } from './careers';
import { addLanguage } from './skills';
import { markUsed, usedThisYear } from './usage';

/**
 * Three careers measured in what you did, not in reviews: missions flown, operations run,
 * postings held. Each has its own yearly turn and a record the Occupation tab shows.
 */
export type MissionRecord = {
  /** The agency, service or ministry you serve. */
  org: string;
  /** Astronaut flights, spy operations, diplomatic postings. */
  log: { year: number; what: string; ok: boolean }[];
  /** Astronauts: days in space and spacewalks; spies: heat (0..100) and assets; diplomats: treaties. */
  days?: number;
  walks?: number;
  moon?: boolean;
  heat?: number;
  assets?: number;
  treaties?: number;
  /** Diplomats: where you're posted now, and since when. */
  post?: string;
  postSince?: number;
};

export const MISSION_JOBS = ['astronaut', 'intelligence_officer', 'diplomat'];

const AGENCY: Record<string, string> = {
  us: 'NASA',
  cn: 'the China Manned Space Agency',
  jp: 'JAXA',
  in: 'ISRO',
  ca: 'the Canadian Space Agency',
};
const ESA = ['uk', 'fr', 'de', 'it', 'es', 'se', 'nl', 'ie', 'pl'];

function orgFor(s: GameState, job: string): string {
  const c = s.player.country;
  const name = COUNTRY_BY_ID[c]?.name ?? 'your country';
  if (job === 'astronaut')
    return (
      AGENCY[c] ?? (ESA.includes(c) ? 'the European Space Agency' : `${name}'s space programme`)
    );
  if (job === 'intelligence_officer')
    return c === 'us'
      ? 'the CIA'
      : c === 'uk'
        ? 'the Secret Intelligence Service'
        : `${name}'s intelligence service`;
  return `${name}'s foreign ministry`;
}

export function missionsOf(s: GameState): MissionRecord | null {
  return s.missions ?? null;
}

function ensure(ctx: Ctx): MissionRecord {
  const s = ctx.s;
  const job = s.career.jobId ?? '';
  if (!s.missions || s.missions.org !== orgFor(s, job))
    s.missions = { org: orgFor(s, job), log: [] };
  return s.missions;
}

function setLevel(ctx: Ctx, level: number, line: string): void {
  const s = ctx.s;
  const c = s.career;
  const job = JOB_BY_ID[c.jobId ?? ''];
  if (!job || level <= c.level) return;
  c.level = Math.min(job.titles.length - 1, level);
  c.since = s.year;
  const rec = c.history.at(-1);
  if (rec) rec.title = titleFor(s, job, c.level);
  ctx.log('work', `${line} You're now ${titleFor(s, job, c.level).toLowerCase()}.`, true);
  addStat(s, 'happiness', 5);
}

/** What flies in a year: the craft of the era, by agency. */
function flight(s: GameState, ctx: Ctx): { name: string; days: number; moon?: boolean } | null {
  const y = s.year;
  const china = s.player.country === 'cn';
  if (china) {
    if (y < 2003) return null;
    return y >= 2021
      ? { name: 'a Shenzhou flight to the Tiangong station', days: ctx.rng.int(90, 185) }
      : { name: 'a Shenzhou mission', days: ctx.rng.int(2, 33) };
  }
  if (y < 1961) return null;
  if (y <= 1966)
    return {
      name: y <= 1963 ? 'a Mercury capsule flight' : 'a Gemini mission',
      days: ctx.rng.int(1, 14),
    };
  if (y <= 1972) {
    // The Moon, 1969–1972: a few lucky crews walk on it.
    const moon = y >= 1969 && s.career.level >= 2 && ctx.rng.chance(0.4);
    return moon
      ? { name: 'an Apollo mission to the Moon', days: ctx.rng.int(8, 13), moon: true }
      : { name: 'an Apollo mission', days: ctx.rng.int(6, 12) };
  }
  if (y <= 1980)
    return y <= 1975 ? { name: 'a Skylab expedition', days: ctx.rng.int(28, 84) } : null;
  if (y >= 2026 && s.career.level >= 2 && ctx.rng.chance(0.15))
    return { name: 'an Artemis mission to the Moon', days: ctx.rng.int(20, 30), moon: true };
  if (y >= 2000 && ctx.rng.chance(0.6))
    return {
      name:
        y <= 2011
          ? 'an ISS expedition (up by Shuttle or Soyuz)'
          : y < 2020
            ? 'an ISS expedition (up on a Soyuz)'
            : 'an ISS expedition (up on a Crew Dragon)',
      days: ctx.rng.int(150, 200),
    };
  if (y <= 2011) return { name: 'a Space Shuttle mission', days: ctx.rng.int(8, 16) };
  return { name: 'a Soyuz flight to the ISS', days: ctx.rng.int(150, 190) };
}

function astronautYear(ctx: Ctx): void {
  const s = ctx.s;
  const m = ensure(ctx);
  const c = s.career;
  const yearsIn = s.year - (c.history.at(-1)?.from ?? s.year);
  if (c.level === 0) {
    if (yearsIn >= 2)
      setLevel(
        ctx,
        1,
        `🚀 Two years of training at ${m.org}: centrifuges, survival courses and ${s.year >= 1994 ? 'Russian lessons' : 'geology field trips'}. You are assigned to the flight pool.`,
      );
    return;
  }
  // Crews rotate: three years without a flight and your name comes up next.
  const lastFlight = m.log.at(-1)?.year ?? (c.history.at(-1)?.from ?? s.year) + 2;
  const due = s.year - lastFlight >= 3;
  if (!due && !ctx.rng.chance(0.55)) {
    ctx.log(
      'work',
      '🛰️ A year of simulators, mission support and waiting for your name on a crew list.',
    );
    return;
  }
  const f = flight(s, ctx);
  if (!f) {
    ctx.log(
      'work',
      '🛰️ No flights this year: the programme is between spacecraft. You train, and wait.',
    );
    return;
  }
  const walks = ctx.rng.chance(f.days > 30 ? 0.6 : 0.25) ? ctx.rng.int(1, 3) : 0;
  m.days = (m.days ?? 0) + f.days;
  m.walks = (m.walks ?? 0) + walks;
  m.log.push({
    year: s.year,
    what: `${f.name}, ${f.days} days${walks ? `, ${walks} spacewalk${walks > 1 ? 's' : ''}` : ''}`,
    ok: true,
  });
  addStat(s, 'fame', f.moon ? 25 : 3);
  addStat(s, 'happiness', f.moon ? 20 : 8);
  if (f.moon) {
    m.moon = true;
    s.player.flags.push('walked_on_moon');
  }
  if (!s.player.flags.includes('been_to_space')) s.player.flags.push('been_to_space');
  ctx.log(
    'work',
    f.moon
      ? `🌕 You fly ${f.name} and walk on the Moon. Footprints that will outlast everything you own.`
      : `🚀 You fly ${f.name}: ${f.days} days in orbit${walks ? ` and ${walks} spacewalk${walks > 1 ? 's' : ''}` : ''}.`,
    true,
  );
  const flown = m.log.length;
  if (flown >= 1) setLevel(ctx, 2, '🧑‍🚀 Your first flight behind you,');
  if (flown >= 3) setLevel(ctx, 3, '🧑‍🚀 You’re given command of the next crew.');
  if (flown >= 5)
    setLevel(ctx, 4, '🧑‍🚀 Veteran of five flights, you’re asked to run the astronaut office.');
}

const foreign = (s: GameState, ctx: Ctx): string =>
  ctx.rng.pick(COUNTRIES.filter((c) => c.id !== s.player.country)).name;

/** A spy's operation: abroad, deniable, and risky. */
function operation(ctx: Ctx, asked: boolean): void {
  const s = ctx.s;
  const m = ensure(ctx);
  const place = foreign(s, ctx);
  const kind = ctx.rng.pick([
    'recruit a source in',
    'run surveillance in',
    'extract a defector from',
    'unmask a double agent in',
  ]);
  const langs = Object.values(s.player.languages).filter((v) => v >= 60).length;
  const odds = 0.4 + (s.player.stats.smarts - 50) / 150 + langs * 0.05 + (asked ? 0.05 : 0);
  const ok = ctx.rng.chance(Math.max(0.15, Math.min(0.9, odds)));
  m.heat = clampStat((m.heat ?? 0) + (ok ? 10 : 25));
  if (ok && kind.startsWith('recruit')) m.assets = (m.assets ?? 0) + 1;
  m.log.push({ year: s.year, what: `${kind.split(' ')[0]} · ${place}`, ok });
  ctx.log(
    'work',
    ok
      ? `🕶️ An operation to ${kind} ${place}. It goes to plan, which means nobody will ever hear of it.`
      : `🕶️ An operation to ${kind} ${place} goes wrong. You get out, just, through a laundry door.`,
    ok,
  );
  addStat(s, 'stress', ok ? 4 : 10);
}

function spyYear(ctx: Ctx): void {
  const s = ctx.s;
  const m = ensure(ctx);
  const c = s.career;
  const yearsIn = s.year - (c.history.at(-1)?.from ?? s.year);
  m.heat = clampStat((m.heat ?? 0) - 8);
  if (c.level === 0) {
    if (yearsIn >= 2)
      setLevel(ctx, 1, '🕶️ Two years reading other people’s cables. They send you into the field.');
    else
      ctx.log('work', '🗂️ A year of analysis: intercepts, satellite photos and a lot of coffee.');
    return;
  }
  if (ctx.rng.chance(0.6)) operation(ctx, false);
  // Burned: too much heat, and a foreign service knows your face.
  if ((m.heat ?? 0) >= 80 && ctx.rng.chance(0.5)) {
    m.heat = 30;
    m.log.push({ year: s.year, what: 'burned: expelled', ok: false });
    ctx.log(
      'work',
      '🚫 Your cover is blown. You are declared persona non grata and flown home to a desk.',
      true,
    );
    addStat(s, 'stress', 10);
    return;
  }
  const done = m.log.filter((x) => x.ok).length;
  if (done >= 3) setLevel(ctx, 2, '🕶️ A run of clean operations.');
  if (done >= 6 && (m.assets ?? 0) >= 2)
    setLevel(ctx, 3, `🕶️ You’re made head of station in ${foreign(s, ctx)}.`);
  if (done >= 10) setLevel(ctx, 4, '🕶️ Called back to headquarters, to the top floor.');
}

function diplomatYear(ctx: Ctx): void {
  const s = ctx.s;
  const m = ensure(ctx);
  const c = s.career;
  // A new posting every three years (or straight away, at first).
  if (!m.post || s.year - (m.postSince ?? s.year) >= 3) {
    const next = ctx.rng.pick(
      COUNTRIES.filter((x) => x.id !== s.player.country && x.name !== m.post),
    );
    m.post = next.name;
    m.postSince = s.year;
    m.log.push({ year: s.year, what: `posted to ${next.name}`, ok: true });
    const lang = next.languages[0];
    ctx.log(
      'work',
      `🌐 A new posting: ${next.flag} ${next.name}. You pack the formal shoes and a phrasebook.`,
      true,
    );
    if (lang && lang !== 'english') addLanguage(s, lang, 10);
    if (c.performance >= 60 || m.log.length >= 2)
      setLevel(ctx, c.level + 1, '🌐 The posting comes with a promotion.');
    return;
  }
  const here = COUNTRIES.find((x) => x.name === m.post);
  const lang = here?.languages[0];
  if (lang && lang !== 'english') addLanguage(s, lang, 6);
  ctx.log(
    'work',
    `🥂 Another year in ${m.post}: receptions, cables home and the art of saying no so it sounds like maybe.`,
  );
}

/** The yearly turn for a mission career (from the career tick). */
export function missionYear(ctx: Ctx): void {
  const job = ctx.s.career.jobId;
  if (job === 'astronaut') astronautYear(ctx);
  else if (job === 'intelligence_officer') spyYear(ctx);
  else if (job === 'diplomat') diplomatYear(ctx);
}

export type MissionAction = 'operation' | 'lie_low' | 'negotiate';

export function missionReason(s: GameState, a: MissionAction): string | null {
  const job = s.career.jobId;
  if (s.legal.prison) return 'not from prison';
  if (a === 'operation' || a === 'lie_low') {
    if (job !== 'intelligence_officer') return 'not a spy';
    if (s.career.level === 0) return 'analysts stay at their desks';
  }
  if (a === 'negotiate') {
    if (job !== 'diplomat') return 'not a diplomat';
    if (!s.missions?.post) return 'no posting yet';
  }
  if (usedThisYear(s, `ms:${a}`) > 0) return 'once a year';
  if (s.settings.freeTime !== false && workTime(s).left <= 0) return 'no work time left this year';
  return null;
}

export function missionAction(ctx: Ctx, a: MissionAction): void {
  const s = ctx.s;
  const why = missionReason(s, a);
  if (why) throw new EngineError(why);
  markUsed(s, `ms:${a}`);
  markUsed(s, 'w:total');
  const m = ensure(ctx);
  if (a === 'operation') operation(ctx, true);
  else if (a === 'lie_low') {
    m.heat = clampStat((m.heat ?? 0) - 25);
    ctx.log(
      'work',
      '🕶️ You lie low: a dull cover job, regular habits, nothing to see. The heat fades.',
    );
  } else {
    const ok = ctx.rng.chance(0.3 + (s.player.stats.smarts - 50) / 150 + s.career.level * 0.08);
    m.log.push({
      year: s.year,
      what: ok ? `a treaty with ${m.post}` : `talks with ${m.post} stall`,
      ok,
    });
    if (ok) {
      m.treaties = (m.treaties ?? 0) + 1;
      s.career.performance = clampStat(s.career.performance + 10);
      addStat(s, 'fame', 2);
      ctx.log(
        'work',
        `🖋️ After weeks of talks, you and ${m.post} sign an agreement. Champagne, flashbulbs, a commemorative pen.`,
        true,
      );
    } else ctx.log('work', `🖋️ Talks with ${m.post} stall over a single word in paragraph nine.`);
  }
}
