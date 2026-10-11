import { COUNTRIES } from '../../content/countries';
import {
  CONFERENCE_CITIES,
  CONFERENCE_LINES,
  PROJECTS,
  REVIEW_LINES,
  TEACH_LINES,
  THESIS_LINES,
} from '../../content/science';
import type { Ctx } from '../ctx';
import { formatMoney, money } from '../economy';
import { EngineError } from '../errors';
import { pickFresh } from '../fresh';
import { addNpc } from '../npc';
import type { Rng } from '../rng';
import { addStat } from '../stats';
import type { GameState } from '../types';
import { clampStat } from '../util';
import { workTime } from './activities';
import { applyCareerEffect } from './career-effects';
import {
  activeGrants,
  addRep,
  ensure,
  scienceOpen,
  type LabMember,
  type ScienceRecord,
} from './science-core';
import { addLanguage } from './skills';
import { markUsed, usedThisYear } from './usage';

/**
 * The research career beyond the bench: a group of students and postdocs paid from your
 * grants, conferences and collaborators, refereeing, teaching, tenure for professors,
 * sabbaticals abroad, and patents that can pay for decades.
 */
export type LabAction = 'conference' | 'review' | 'teach' | 'sabbatical';

const APPLIED = ['life', 'chem', 'eng', 'cs', 'physics'];
const YEARS = { phd: 5, postdoc: 3 };
/** One person in the lab costs this much of your grant money a year. */
const memberCost = (s: GameState): number => money(s, 60000, 'wage');

/** How many people your grants can pay for. */
export function labCapacity(s: GameState): number {
  const funding = activeGrants(s)
    .filter((g) => !g.stipend)
    .reduce((t, g) => t + g.perYear, 0);
  return Math.min(8, Math.floor(funding / memberCost(s)));
}

const notPhd = (s: GameState): boolean => !!s.career.jobId;

export function hireReason(s: GameState): string | null {
  if (!scienceOpen(s)) return 'only in a research job';
  if (!notPhd(s)) return 'not while you are a student yourself';
  if ((s.science?.lab?.length ?? 0) >= labCapacity(s))
    return labCapacity(s) === 0 ? 'needs a grant to pay them' : 'your grants are fully spent';
  if (usedThisYear(s, 'sc:hire') >= 2) return 'two hires a year';
  return null;
}

export function hireMember(ctx: Ctx, role: 'phd' | 'postdoc'): void {
  const s = ctx.s;
  const why = hireReason(s);
  if (why) throw new EngineError(why);
  markUsed(s, 'sc:hire');
  const sc = ensure(s);
  const n = addNpc(ctx, {
    role: 'labmate',
    age: role === 'phd' ? ctx.rng.int(23, 27) : ctx.rng.int(28, 34),
    rel: ctx.rng.int(50, 70),
    job: role === 'phd' ? 'PhD student' : 'Postdoc',
    country: ctx.rng.chance(0.3) ? ctx.rng.pick(COUNTRIES).id : s.player.country,
  });
  sc.lab = [...(sc.lab ?? []), { id: n.id, role, since: s.year }];
  ctx.log(
    'work',
    role === 'phd'
      ? `🧑‍🔬 ${n.first} ${n.last} joins your lab as a PhD student, with a new notebook and enormous hope.`
      : `🧑‍🔬 ${n.first} ${n.last} joins your lab as a postdoc and reorganises the freezer on day one.`,
  );
}

function leave(sc: ScienceRecord, s: GameState, m: LabMember): void {
  sc.lab = (sc.lab ?? []).filter((x) => x.id !== m.id);
  const n = s.npcs.find((x) => x.id === m.id);
  if (n) n.roles = n.roles.map((r) => (r === 'labmate' ? 'acquaintance' : r));
}

/** A year in the group: theses defended, postdocs moving on, and what the money can carry. */
function labYear(ctx: Ctx, r: Rng, sc: ScienceRecord): void {
  const s = ctx.s;
  for (const m of [...(sc.lab ?? [])]) {
    const n = s.npcs.find((x) => x.id === m.id);
    if (!n || !n.alive) {
      leave(sc, s, m);
      continue;
    }
    if (s.year - m.since < YEARS[m.role]) continue;
    leave(sc, s, m);
    if (m.role === 'phd') {
      n.job = r.chance(0.5) ? 'Postdoc' : 'Data scientist';
      addRep(sc, 1);
      addStat(s, 'happiness', 4);
      ctx.log('work', `🎓 ${r.pick(THESIS_LINES).replace('{n}', n.first)}`, true);
    } else {
      n.job = 'Professor';
      ctx.log(
        'work',
        `👋 ${n.first} leaves your lab for a faculty job of their own. You give them a box of pipettes and your best advice.`,
      );
    }
  }
  // When the grants end, the people they paid for have to go.
  while ((sc.lab?.length ?? 0) > labCapacity(s)) {
    const m = sc.lab?.at(-1);
    if (!m) break;
    leave(sc, s, m);
    const n = s.npcs.find((x) => x.id === m.id);
    ctx.log(
      'work',
      `📉 The money runs out and ${n?.first ?? 'a postdoc'} has to leave the lab. You write the warmest reference of your life.`,
    );
    addStat(s, 'happiness', -4);
  }
}

/** Professors: six years in, the tenure committee reads everything you have done. */
function tenureYear(ctx: Ctx, sc: ScienceRecord): void {
  const s = ctx.s;
  const c = s.career;
  if (c.jobId !== 'professor' || sc.tenure !== undefined) return;
  if (c.level >= 2) {
    sc.tenure = s.year;
    ctx.log(
      'work',
      '🔑 Tenure: a job for life, a door with your name on it, and a little less fear.',
      true,
    );
    return;
  }
  if (c.level !== 1 || s.year - c.since < 6) return;
  const recent = sc.papers.filter((p) => s.year - p.year <= 7);
  const funded = sc.grants.some((g) => g.funder !== 'seed');
  if (recent.length >= 4 && funded) {
    sc.tenure = s.year;
    applyCareerEffect(ctx, 'promote');
    addStat(s, 'happiness', 12);
    ctx.log(
      'work',
      '🔑 The tenure committee says yes. You read the letter four times in the corridor.',
      true,
    );
  } else {
    sc.tenure = -s.year;
    addStat(s, 'happiness', -12);
    ctx.log(
      'work',
      `🚪 Tenure is denied: ${recent.length < 4 ? 'not enough papers' : 'no major grant'} in six years. You have a year to find somewhere else.`,
      true,
    );
    applyCareerEffect(ctx, 'fire');
  }
}

export function labReason(s: GameState, a: LabAction): string | null {
  if (!scienceOpen(s)) return 'only in a research job or a PhD';
  const sc = s.science;
  if (a === 'conference' && usedThisYear(s, 'sc:conference') > 0) return 'once a year';
  if (
    a === 'conference' &&
    !activeGrants(s).some((g) => !g.stipend) &&
    s.money.cash < money(s, 1500)
  )
    return `the trip costs ${formatMoney(s, money(s, 1500))} without a grant`;
  if (a === 'review') {
    if ((sc?.papers.length ?? 0) < 2) return 'after two papers of your own';
    if (usedThisYear(s, 'sc:review') >= 2) return 'twice a year';
  }
  if (a === 'teach') {
    if (s.career.jobId !== 'professor') return 'professors teach';
    if (usedThisYear(s, 'sc:teach') > 0) return 'once a year';
  }
  if (a === 'sabbatical') {
    if (s.career.jobId !== 'professor' || !sc?.tenure || sc.tenure < 0) return 'tenured professors';
    if (sc.sabbatical && s.year - sc.sabbatical < 7)
      return `next in ${7 - (s.year - sc.sabbatical)} years`;
  }
  if (s.settings.freeTime !== false && workTime(s).left <= 0) return 'no work time left this year';
  return null;
}

export function labAction(ctx: Ctx, a: LabAction): void {
  const s = ctx.s;
  const why = labReason(s, a);
  if (why) throw new EngineError(why);
  const sc = ensure(s);
  markUsed(s, 'w:total');
  markUsed(s, `sc:${a}`);
  if (a === 'conference') {
    const cities = CONFERENCE_CITIES.filter(
      (c) => (c.from ?? 0) <= s.year && c.city !== s.player.city,
    );
    const city = ctx.rng.pick(cities).city;
    const paid = activeGrants(s).some((g) => !g.stipend);
    if (!paid) s.money.cash -= money(s, 1500);
    addRep(sc, 1);
    if (sc.project) sc.project.quality = clampStat(sc.project.quality + 3);
    ctx.log(
      'work',
      `✈️ ${pickFresh(ctx, CONFERENCE_LINES).replace('{city}', city)}${paid ? '' : ` (${formatMoney(s, money(s, 1500))}, from your own pocket.)`}`,
    );
    if (ctx.rng.chance(0.35) && (sc.collaborators ?? 0) < 6) {
      sc.collaborators = (sc.collaborators ?? 0) + 1;
      ctx.log(
        'work',
        `🤝 Over dinner in ${city} you start a collaboration that will outlast the conference.`,
      );
    }
  } else if (a === 'review') {
    addStat(s, 'karma', 1);
    if (sc.rep < 40) addRep(sc, 1);
    ctx.log('work', `🧐 ${pickFresh(ctx, REVIEW_LINES)}`);
  } else if (a === 'teach') {
    s.career.performance = clampStat(s.career.performance + 8);
    addStat(s, 'karma', 1);
    ctx.log('work', `🧑‍🏫 ${pickFresh(ctx, TEACH_LINES)}`);
  } else {
    const where = ctx.rng.pick(COUNTRIES.filter((c) => c.id !== s.player.country));
    sc.sabbatical = s.year;
    addRep(sc, 2);
    addStat(s, 'happiness', 8);
    addStat(s, 'stress', -10);
    const lang = where.languages[0];
    if (lang && lang !== 'english') addLanguage(s, lang, 15);
    if (sc.project) sc.project.progress = Math.min(100, sc.project.progress + 40);
    ctx.log(
      'work',
      `🧳 A sabbatical year in ${where.flag} ${where.name}: a borrowed office, new colleagues, and time to think for the first time in years.`,
      true,
    );
  }
}

/** Papers worth patenting: applied work, good enough, published high, not patented yet. */
export function patentable(s: GameState): number[] {
  const sc = s.science;
  if (!sc || !APPLIED.includes(sc.field) || s.year < 1950) return [];
  const done = new Set((sc.patents ?? []).map((p) => p.title));
  const applied = new Set(PROJECTS[sc.field].filter((p) => p.applied).map((p) => p.title));
  return sc.papers
    .map((p, i) => ({ p, i }))
    .filter(
      ({ p }) =>
        p.quality >= 70 &&
        p.tier <= 2 &&
        !done.has(p.title) &&
        applied.has(p.title.replace(/^more on /, '')),
    )
    .map(({ i }) => i);
}

export function patentReason(s: GameState, i: number): string | null {
  if (!scienceOpen(s)) return 'only in a research job';
  if (!patentable(s).includes(i)) return 'not patentable';
  if (s.money.cash < money(s, 8000)) return `costs ${formatMoney(s, money(s, 8000))}`;
  return null;
}

export function filePatent(ctx: Ctx, i: number): void {
  const s = ctx.s;
  const why = patentReason(s, i);
  if (why) throw new EngineError(why);
  const sc = ensure(s);
  const paper = sc.papers[i];
  if (!paper) return;
  s.money.cash -= money(s, 8000);
  sc.patents = [
    ...(sc.patents ?? []),
    { title: paper.title, from: s.year, licensed: null, royalty: 0 },
  ];
  ctx.log(
    'money',
    `📜 You file a patent on ${paper.title}. The lawyers bill by the hour, and they are not slow.`,
  );
}

/** Patents: two years to find out whether anyone wants it, then royalties for fifteen more. */
function patentYear(ctx: Ctx, r: Rng, sc: ScienceRecord): void {
  const s = ctx.s;
  let paid = 0;
  for (const p of sc.patents ?? []) {
    const age = s.year - p.from;
    if (p.licensed === null && age >= 2) {
      p.licensed = r.chance(0.45);
      if (p.licensed) {
        const jackpot = r.chance(0.06);
        p.royalty = money(s, r.int(5, 60) * 1000 * (jackpot ? 25 : 1));
        ctx.log(
          'money',
          jackpot
            ? `💰 A company licenses your patent on ${p.title}, and it ends up in a product half the world buys.`
            : `💡 A company licenses your patent on ${p.title}: ${formatMoney(s, p.royalty)} a year in royalties.`,
          true,
        );
      } else
        ctx.log(
          'work',
          `📜 Nobody licenses your patent on ${p.title}. It hangs, framed, in the corridor.`,
        );
    }
    if (p.licensed && age > 2 && age <= 17) paid += p.royalty;
  }
  if (paid > 0) s.money.cash += paid;
}

/** The yearly turn for everything here (called from scienceTick). */
export function labTick(ctx: Ctx, r: Rng, sc: ScienceRecord): void {
  labYear(ctx, r, sc);
  tenureYear(ctx, sc);
  patentYear(ctx, r, sc);
}

/** Royalties keep coming after you leave research. */
export function patentsOnly(ctx: Ctx, r: Rng, sc: ScienceRecord): void {
  patentYear(ctx, r, sc);
}
