import {
  academy,
  FIELD_LABEL,
  FUNDER_BY_ID,
  LAB_LINES,
  LECTURE_LINES,
  PROPOSAL_LINES,
  REJECT_LINES,
  SEED_LINES,
  venueFor,
  nationalPrize,
  PROJECTS,
  REVIEWER_TWO,
  topPrize,
  type Funder,
} from '../../content/science';
import type { Ctx } from '../ctx';
import { formatMoney, money } from '../economy';
import { EngineError } from '../errors';
import { COUNTRY_BY_ID } from '../../content/countries';
import { pickFresh } from '../fresh';
import { Rng, seedRng } from '../rng';
import { addStat } from '../stats';
import type { GameState } from '../types';
import { clampStat } from '../util';
import { workTime } from './activities';
import { markUsed, usedThisYear } from './usage';
import {
  filePatent,
  hireMember,
  labAction,
  labTick,
  patentsOnly,
  type LabAction,
} from './science-lab';

export * from './science-core';
export {
  hireReason,
  labCapacity,
  labReason,
  patentable,
  patentReason,
  type LabAction,
} from './science-lab';
import {
  activeGrants,
  addRep,
  cap,
  ensure,
  fieldFor,
  fullTime,
  hIndex,
  labBoost,
  RESEARCH_PIPS,
  scienceOpen,
  type Paper,
  type ScienceRecord,
} from './science-core';

function newProject(ctx: Ctx, sc: ScienceRecord, rng: Rng): void {
  const s = ctx.s;
  const pool = PROJECTS[sc.field].filter((p) => (p.from ?? 0) <= s.year);
  const done = new Set(sc.papers.map((p) => p.title.replace(/^more on /, '')));
  const fresh = pool.filter((p) => !done.has(p.title));
  // Once every question has been asked, you follow up your own best work (never the last one).
  const last = sc.papers.at(-1)?.title.replace(/^more on /, '');
  const again = pool.filter((p) => p.title !== last);
  const pick = fresh.length ? rng.pick(fresh) : rng.pick(again.length ? again : pool);
  const title = fresh.length ? pick.title : `more on ${pick.title}`;
  sc.project = {
    title,
    progress: 0,
    quality: clampStat(
      rng.int(20, 35) +
        Math.round(s.player.stats.smarts / 4) +
        Math.min(10, (sc.collaborators ?? 0) * 2),
    ),
    tried: [],
  };
  ctx.log('work', `🔬 A new research project: ${title}.`);
}

/** Push the project along: progress, a little quality, and once in a while a breakthrough. */
function work(ctx: Ctx, sc: ScienceRecord, pip: boolean, rng: Rng): void {
  const s = ctx.s;
  if (!sc.project) newProject(ctx, sc, rng);
  const p = sc.project;
  if (!p || p.progress >= 100) return;
  const smart = s.player.stats.smarts;
  const gain = (pip ? 22 : 18) + Math.round(smart / 8) + labBoost(s) + rng.int(0, 10);
  p.progress = Math.min(100, p.progress + gain);
  p.quality = clampStat(
    p.quality + rng.int(1, 6) + (labBoost(s) > 0 ? 3 : 0) + (smart >= 80 ? 2 : 0),
  );
  if (p.quality >= 65 && rng.chance(pip ? 0.05 : 0.03)) {
    p.quality = clampStat(p.quality + 20);
    ctx.log(
      'work',
      `💡 A result nobody expected, in ${p.title}. You check it three times. It holds.`,
      true,
    );
  }
  if (p.progress >= 100)
    ctx.log('work', `📝 The work on ${p.title} is done and written up. Time to choose a journal.`);
}

export function scienceReason(s: GameState, what: 'research' | 'talk'): string | null {
  if (!scienceOpen(s)) return 'only in a research job or a PhD';
  if (what === 'research') {
    if (usedThisYear(s, 'sc:research') >= RESEARCH_PIPS) return 'done enough this year';
    if (s.science?.project && s.science.project.progress >= 100)
      return 'publish the finished work first';
  } else {
    if ((s.science?.rep ?? 0) < 25) return 'from standing 25';
    if (usedThisYear(s, 'sc:talk') > 0) return 'once a year';
  }
  if (s.settings.freeTime !== false && workTime(s).left <= 0) return 'no work time left this year';
  return null;
}

/** Odds a venue accepts the finished work. */
export function acceptOdds(s: GameState, tier: number): number {
  const p = s.science?.project;
  if (!p) return 0;
  if (tier >= 3) return 0.97;
  const need = [88, 72, 52][tier] ?? 52;
  return Math.max(0.03, Math.min(0.92, 0.5 + (p.quality - need) / 40));
}

export function publishReason(s: GameState, tier: number): string | null {
  if (!scienceOpen(s)) return 'only in a research job or a PhD';
  const p = s.science?.project;
  if (!p || p.progress < 100) return 'nothing finished to publish';
  if (p.tried.includes(tier)) return 'already turned you down';
  return null;
}

/** A funder's name for this life now, or null when it's closed. */
export function funderName(s: GameState, f: Funder): string | null {
  return f.name(s, s.science?.field ?? fieldFor(s));
}

export function grantOdds(s: GameState, f: Funder): number {
  const sc = s.science;
  const recent = (sc?.papers ?? []).filter((p) => s.year - p.year <= 5);
  const top = recent.filter((p) => p.tier <= 1).length;
  const odds =
    f.odds +
    (sc?.rep ?? 0) / 250 +
    Math.min(0.15, recent.length * 0.03) +
    Math.min(0.15, top * 0.05) +
    Math.min(0.15, (sc?.rejected[f.id] ?? 0) * 0.05) +
    (s.player.stats.smarts - 60) / 400;
  // The ERC funds about one proposal in eight: even the best are far from sure.
  return Math.max(0.03, Math.min(f.id.startsWith('erc_') ? 0.35 : 0.75, odds));
}

export function grantAmount(s: GameState, f: Funder): number {
  const mid = (f.amount[0] + f.amount[1]) / 2;
  if (!f.intl) return money(s, mid, 'wage');
  // European grants are set in euros, the same euros wherever you are (amounts are € a year).
  const c = COUNTRY_BY_ID[s.player.country];
  return Math.round((mid * (c?.currency.perUsd ?? 0.92)) / 0.92);
}

export function grantReason(s: GameState, id: string): string | null {
  const f = FUNDER_BY_ID[id];
  if (!f) return 'no such funder';
  if (!scienceOpen(s)) return 'only in a research job or a PhD';
  if (!funderName(s, f)) return 'not open to you';
  if ((s.science?.rep ?? 0) < f.minRep) return `from standing ${f.minRep}`;
  if (activeGrants(s).some((g) => g.funder === id)) return 'already funded by them';
  if (s.science?.pending.some((p) => p.funder === id)) return 'waiting to hear back';
  const erc = (x: string): boolean => id.startsWith('erc_') && x.startsWith('erc_');
  if (activeGrants(s).some((g) => erc(g.funder)) || s.science?.pending.some((p) => erc(p.funder)))
    return 'one ERC grant at a time';
  if (s.settings.freeTime !== false && workTime(s).left <= 0) return 'no work time left this year';
  return null;
}

export type ScienceAction =
  | { id: 'research' }
  | { id: 'publish'; tier: number }
  | { id: 'apply'; funder: string }
  | { id: 'talk' }
  | { id: 'hire'; role: 'phd' | 'postdoc' }
  | { id: 'lab'; what: LabAction }
  | { id: 'patent'; paper: number };

export function scienceAction(ctx: Ctx, a: ScienceAction): void {
  const s = ctx.s;
  if (a.id === 'publish') return publish(ctx, a.tier);
  if (a.id === 'hire') return hireMember(ctx, a.role);
  if (a.id === 'lab') return labAction(ctx, a.what);
  if (a.id === 'patent') return filePatent(ctx, a.paper);
  const why = a.id === 'apply' ? grantReason(s, a.funder) : scienceReason(s, a.id);
  if (why) throw new EngineError(why);
  const sc = ensure(s);
  markUsed(s, 'w:total');
  if (a.id === 'research') {
    markUsed(s, 'sc:research');
    work(ctx, sc, true, ctx.rng);
    if (sc.project && sc.project.progress < 100) ctx.log('work', `🧪 ${pickFresh(ctx, LAB_LINES)}`);
  } else if (a.id === 'talk') {
    markUsed(s, 'sc:talk');
    addStat(s, 'fame', 2 + Math.floor(sc.rep / 30));
    if (usedThisYear(s, 'sc:talk') === 1 && sc.rep < 40) addRep(sc, 1);
    ctx.log(
      'work',
      `🎤 ${pickFresh(ctx, LECTURE_LINES).replace('{field}', FIELD_LABEL[sc.field])}`,
    );
  } else {
    const f = FUNDER_BY_ID[a.funder] as Funder;
    const name = funderName(s, f) ?? f.id;
    sc.pending.push({ funder: f.id, name, year: s.year, odds: grantOdds(s, f) });
    ctx.log(
      'work',
      `📨 ${pickFresh(ctx, f.id === 'seed' ? SEED_LINES : PROPOSAL_LINES).replace('{name}', name)} The answer comes next year.`,
    );
  }
}

function publish(ctx: Ctx, tier: number): void {
  const s = ctx.s;
  const why = publishReason(s, tier);
  if (why) throw new EngineError(why);
  const sc = ensure(s);
  const p = sc.project;
  if (!p) return;
  const venue = venueFor(s, sc.field, tier);
  if (!ctx.rng.chance(acceptOdds(s, tier))) {
    p.tried.push(tier);
    ctx.log('work', `📭 ${cap(venue)} turns the paper down. ${pickFresh(ctx, REVIEWER_TWO)}`);
    addStat(s, 'happiness', -2);
    return;
  }
  const breakthrough = p.quality >= 90 && tier <= 1 && ctx.rng.chance(0.35);
  sc.papers.push({
    year: s.year,
    title: p.title,
    venue,
    tier,
    quality: p.quality,
    cites: 0,
    ...(breakthrough ? { breakthrough: true } : {}),
  });
  sc.project = null;
  addRep(sc, ([6, 3, 2, 1][tier] ?? 1) + (breakthrough ? 8 : 0));
  s.career.performance = clampStat(s.career.performance + ([20, 12, 6, 2][tier] ?? 2));
  addStat(s, 'happiness', [10, 6, 3, 1][tier] ?? 1);
  if (tier === 0) addStat(s, 'fame', breakthrough ? 10 : 3);
  ctx.log(
    'work',
    breakthrough
      ? `🌟 Your paper on ${p.title} comes out in ${venue}, and the field changes direction overnight.`
      : tier === 0
        ? `📰 Your paper on ${p.title} is published in ${venue}. Your mother buys three copies.`
        : `📄 Your paper on ${p.title} is published in ${venue}.`,
    tier <= 1,
  );
}

/** Citations a paper picks up in a year: they rise for a few years, then tail off. */
function yearCites(r: Rng, s: GameState, p: Paper): number {
  const age = s.year - p.year;
  if (age <= 0) return 0;
  const shape = age <= 5 ? age / 3 : Math.pow(0.85, age - 5) * 1.6;
  const base = (p.quality / 15) * ([25, 10, 4, 1.2][p.tier] ?? 1);
  return Math.round(base * shape * (0.5 + r.next()) * (p.breakthrough ? 5 : 1));
}

/** The year in a research life: the day job's own progress, citations, decisions, prizes. */
export function scienceTick(ctx: Ctx): void {
  const s = ctx.s;
  const open = scienceOpen(s);
  if (!s.science && !(open && fullTime(s))) return;
  const live = ensure(s);
  // Its own dice: a research life never shifts the rolls of the rest of the year.
  const r = new Rng(seedRng(((s.seed >>> 0) ^ Math.imul(s.year + 104729, 0x85ebca6b)) >>> 0));
  for (const p of live.papers) p.cites += yearCites(r, s, p);
  if (!open) {
    if (live.lab?.length) {
      for (const m of live.lab) {
        const n = s.npcs.find((x) => x.id === m.id);
        if (n) n.roles = n.roles.map((x) => (x === 'labmate' ? 'acquaintance' : x));
      }
      live.lab = [];
      ctx.log('work', '🔬 Without you, your lab disbands: the students find new supervisors.');
    }
    patentsOnly(ctx, r, live);
    return;
  }
  live.field = live.papers.length ? live.field : fieldFor(s);
  // The research the job itself pays for: a project moves along even without extra hours.
  if (fullTime(s)) work(ctx, live, false, r);
  // Standing grows with what you have done.
  if (hIndex(live.papers) >= 12) addRep(live, Math.floor(hIndex(live.papers) / 12));
  decide(ctx, r, live);
  grantYear(ctx, live);
  prizes(ctx, r, live);
  labTick(ctx, r, live);
}

function decide(ctx: Ctx, r: Rng, sc: ScienceRecord): void {
  const s = ctx.s;
  const due = sc.pending.filter((p) => p.year < s.year);
  sc.pending = sc.pending.filter((p) => p.year >= s.year);
  for (const p of due) {
    const f = FUNDER_BY_ID[p.funder];
    if (!f) continue;
    if (!r.chance(p.odds)) {
      sc.rejected[f.id] = (sc.rejected[f.id] ?? 0) + 1;
      ctx.log(
        'work',
        `📭 ${cap(p.name)} says no. ${r.pick(REJECT_LINES)} The reviews will make the next one stronger.`,
      );
      continue;
    }
    const perYear = grantAmount(s, f);
    sc.grants.push({
      funder: f.id,
      name: p.name,
      kind: f.kind,
      perYear,
      from: s.year,
      years: f.years,
      ...(f.stipend ? { stipend: true } : {}),
    });
    addRep(sc, f.intl ? 4 : f.id === 'seed' ? 0 : 2);
    s.career.performance = clampStat(s.career.performance + 15);
    addStat(s, 'happiness', 8);
    ctx.log(
      'work',
      f.stipend
        ? `🎉 ${cap(p.name)} takes you on as a young researcher: ${formatMoney(s, perYear)} a year for ${f.years} years, paid to you.`
        : `🎉 ${cap(p.name)} funds your ${f.kind}: ${formatMoney(s, perYear * f.years)} over ${f.years} ${f.years === 1 ? 'year' : 'years'}.`,
      true,
    );
  }
}

/** What a lab grant pays you personally each year: a US summer salary or consulting, capped. */
export function personalShare(s: GameState, g: { funder: string; perYear: number }): number {
  const f = FUNDER_BY_ID[g.funder];
  if (!f || f.intl || f.id === 'programme' || f.id === 'seed') return 0;
  if (f.stipend) return g.perYear;
  const rate = f.id === 'industry' ? 0.1 : s.player.country === 'us' ? 0.08 : 0.03;
  return Math.round(g.perYear * rate);
}

/** Grant money: a stipend is yours; other grants pay a capped slice (summer months, consulting). */
function grantYear(ctx: Ctx, sc: ScienceRecord): void {
  const s = ctx.s;
  let stipend = 0;
  let extra = 0;
  for (const g of sc.grants) {
    const left = g.from + g.years - s.year;
    if (left < 0 || g.from === s.year) continue;
    if (g.stipend) stipend += g.perYear;
    else extra += personalShare(s, g);
    if (left === 0)
      ctx.log(
        'work',
        `📁 Your ${g.kind} from ${g.name} comes to an end, with a final report nobody reads.`,
      );
  }
  // On top of a salary, grants top it up by a quarter at most.
  if (s.career.salary > 0) extra = Math.min(extra, Math.round(s.career.salary * 0.25));
  const paid = stipend + extra;
  if (paid > 0) {
    s.money.cash += paid;
    ctx.log(
      'money',
      `💰 ${stipend ? 'Your young researcher salary' : 'Grant money'}: ${formatMoney(s, paid)} to you this year${stipend ? '' : ' (summer salary and consulting)'}.`,
    );
  }
}

function prizes(ctx: Ctx, r: Rng, sc: ScienceRecord): void {
  const s = ctx.s;
  if (s.player.age < 35) return;
  const won = (p: string): boolean => sc.prizes.includes(p);
  const nat = nationalPrize(s);
  if (s.player.age >= 42 && sc.rep >= 60 && !won(nat) && r.chance(0.12)) {
    sc.prizes.push(nat);
    s.money.cash += money(s, 20000, 'wage');
    addStat(s, 'fame', 5);
    addStat(s, 'happiness', 10);
    ctx.log('work', `🏅 You receive ${nat} for your work on ${FIELD_LABEL[sc.field]}.`, true);
  }
  const ac = academy(s);
  if (s.player.age >= 50 && sc.rep >= 72 && !won(ac) && r.chance(0.1)) {
    sc.prizes.push(ac);
    addStat(s, 'happiness', 8);
    ctx.log('work', `🏛️ You are elected to ${ac}. There is a dinner, and a very old chair.`, true);
  }
  const top = topPrize(s, sc.field);
  const best = Math.max(0, ...sc.papers.map((p) => p.cites));
  const laureate = s.player.flags.includes('nobel_laureate');
  if (
    top &&
    !won(top) &&
    !(laureate && top.includes('Nobel')) &&
    s.player.age >= 42 &&
    sc.rep >= 85 &&
    best >= 3000 &&
    r.chance(0.05)
  ) {
    sc.prizes.push(top);
    if (top.includes('Nobel')) s.player.flags.push('nobel_laureate');
    const shared = r.chance(0.6);
    s.money.cash += money(s, shared ? 350000 : 1000000);
    addStat(s, 'fame', 40);
    addStat(s, 'happiness', 25);
    ctx.log(
      'work',
      `🏆 A phone call at dawn from far away: you have won ${top}${shared ? ', shared with two others' : ''}. The work it is for is decades old. You are on every front page by breakfast.`,
      true,
    );
  }
}

/** Events reach into a research life: standing, the project on the bench, a retraction. */
export function scienceEffect(ctx: Ctx, kind: string, n: number): void {
  const sc = ctx.s.science;
  if (!sc) return;
  if (kind === 'sci_rep') {
    if (n >= 0) addRep(sc, n);
    else sc.rep = clampStat(sc.rep + n);
  } else if (kind === 'sci_quality' && sc.project) {
    sc.project.quality = clampStat(sc.project.quality + n);
  } else if (kind === 'sci_finish' && sc.project) {
    sc.project.progress = 100;
  } else if (kind === 'sci_retract') {
    // The most recent paper comes out of the record, and its citations with it.
    const gone = sc.papers.pop();
    if (gone) sc.rep = clampStat(sc.rep - 10 - (gone.tier <= 1 ? 10 : 0));
  }
}
