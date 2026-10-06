import { CRIME_BY_ID } from '../../content/crimes';
import { EVENT_BY_ID } from '../../content/events';
import type { Ctx } from '../ctx';
import { countryOf, formatMoney, money } from '../economy';
import { EngineError } from '../errors';
import { fireEvent } from '../events/select';
import { addNpc } from '../npc';
import { addStat } from '../stats';
import type { GameState } from '../types';
import { clampStat } from '../util';
import { endJob } from './careers';
import { leaveEnrollment } from './education';
import { clampOdds, playerOdds } from './odds';

export const LAWYER_COST = { public: 0, standard: 6000, elite: 40000 } as const;
const LAWYER_BONUS = { public: 0, standard: 0.15, elite: 0.3 } as const;

export function crimeReason(s: GameState, crimeId: string): string | null {
  const def = CRIME_BY_ID[crimeId];
  if (!def) return 'unknown crime';
  if (s.player.age < def.minAge) return `from age ${def.minAge}`;
  if (def.needsJob && !s.career.jobId) return 'needs a job to embezzle from';
  if (def.id === 'tax_evasion' && !s.career.jobId && !(s.career.pension > 0))
    return 'no income to hide';
  if (s.legal.prison) return 'not from prison';
  if (s.legal.case) return 'you already have a case pending';
  return null;
}

export function crimeOdds(s: GameState, crimeId: string): number {
  const def = CRIME_BY_ID[crimeId];
  if (!def) return 0;
  const st = s.player.stats;
  const skill =
    (s.player.skills['athletics'] ?? 0) / 400 +
    (def.id === 'fraud' || def.id === 'embezzlement' || def.id === 'tax_evasion'
      ? (s.player.skills['programming'] ?? 0) / 300 + (st.smarts - 50) / 150
      : 0);
  return clampOdds(
    def.base + playerOdds(s, 'crime') + skill - st.notoriety * 0.004 + (st.smarts - 50) * 0.002,
  );
}

/** Commit a crime (SPEC §5.10): success brings loot and notoriety; arrests open a case. */
export function commitCrime(ctx: Ctx, crimeId: string): void {
  const s = ctx.s;
  const why = crimeReason(s, crimeId);
  if (why) throw new EngineError(why);
  const def = CRIME_BY_ID[crimeId];
  if (!def) return;
  if (!s.player.flags.includes('ever_crime')) s.player.flags.push('ever_crime');
  const ok = ctx.roll(crimeOdds(s, crimeId));
  addStat(s, 'karma', def.karma);
  if (ok) {
    let loot = def.loot[1] > 0 ? money(s, ctx.rng.int(def.loot[0], def.loot[1])) : 0;
    // You can only skim what passes through your hands: about a year's pay at most.
    if (def.needsJob) loot = Math.min(loot, Math.max(s.career.salary, money(s, 5000, 'wage')));
    s.money.cash += loot;
    addStat(s, 'notoriety', def.notoriety);
    ctx.log(
      'crime',
      `${ctx.rng.pick(def.texts.success)}${loot ? ` (${formatMoney(s, loot)})` : ''}`,
    );
  }
  const arrestP = s.cheats.forceSuccess ? 0 : ok ? def.arrest.success : def.arrest.fail;
  if (ctx.rng.chance(arrestP)) {
    ctx.log('crime', ctx.rng.pick(def.texts.caught), true);
    openCase(ctx, crimeId);
  } else if (!ok) ctx.log('crime', ctx.rng.pick(def.texts.fail));
  if (def.id === 'homicide' && ok) {
    const victim = s.npcs.find((n) => n.alive && n.roles.includes('enemy'));
    if (victim) {
      victim.alive = false;
      victim.deathYear = s.year;
      victim.deathCause = 'a killing that was never solved';
    }
  }
}

/** Arrest: open a case and start the court popups (SPEC §5.10 justice). */
export function openCase(ctx: Ctx, crimeId: string): void {
  const s = ctx.s;
  if (s.legal.case || s.legal.prison) return;
  const def = CRIME_BY_ID[crimeId];
  const bail = def ? money(s, Math.max(500, def.sentence[1] * 4000)) : money(s, 2000);
  s.legal.case = { crimeId, bail, stage: 'arrested', lawyer: null };
  if (!s.player.flags.includes('ever_arrested')) s.player.flags.push('ever_arrested');
  const ev = EVENT_BY_ID['legal_arrest'];
  if (ev)
    fireEvent(ctx, ev, 'system', {
      crime: def?.charge ?? 'a crime',
      bail: Math.round(bail),
    });
}

export function caseStep(ctx: Ctx, step: string, arg: string | undefined): void {
  const s = ctx.s;
  const c = s.legal.case;
  if (!c) return;
  if (step === 'case_bail') {
    if (arg === 'pay' && s.money.cash >= c.bail) {
      s.money.cash -= c.bail;
      ctx.log('crime', `You post bail of ${formatMoney(s, c.bail)} and sleep in your own bed.`);
    } else {
      addStat(s, 'happiness', -6);
      ctx.log('crime', 'You wait for your hearing in a cell with a very honest toilet.');
    }
    c.stage = 'charged';
    const ev = EVENT_BY_ID['legal_lawyer'];
    if (ev)
      fireEvent(ctx, ev, 'system', {
        crime: CRIME_BY_ID[c.crimeId]?.charge ?? 'the charge',
      });
  } else if (step === 'case_lawyer') {
    const tier = (
      arg === 'standard' || arg === 'elite' ? arg : 'public'
    ) as keyof typeof LAWYER_COST;
    const cost = money(s, LAWYER_COST[tier]);
    if (s.money.cash >= cost) {
      s.money.cash -= cost;
      c.lawyer = tier;
    } else c.lawyer = 'public';
    const ev = EVENT_BY_ID['legal_plea'];
    if (ev)
      fireEvent(ctx, ev, 'system', {
        crime: CRIME_BY_ID[c.crimeId]?.charge ?? 'the charge',
      });
  } else if (step === 'case_plea') {
    resolveCase(ctx, arg === 'plea');
  }
}

/** Verdict and sentence, scaled by the country (SPEC §5.10). Juvenile cases are lighter. */
export function resolveCase(ctx: Ctx, plea: boolean): void {
  const s = ctx.s;
  const c = s.legal.case;
  if (!c) return;
  const def = CRIME_BY_ID[c.crimeId];
  s.legal.case = null;
  const juvenile = s.player.age < 18;
  const st = s.player.stats;
  let convicted = true;
  if (!plea) {
    const p =
      0.25 +
      LAWYER_BONUS[c.lawyer ?? 'public'] +
      (st.karma - 50) / 250 -
      st.notoriety / 250 -
      (def?.violent ? 0.1 : 0);
    convicted = !ctx.roll(Math.min(0.85, Math.max(0.05, p)));
  }
  if (!convicted) {
    s.legal.record.push({
      crimeId: c.crimeId,
      year: s.year,
      age: s.player.age,
      verdict: 'acquitted',
      sentenceYears: 0,
      juvenile,
    });
    ctx.log(
      'crime',
      'Not guilty. You walk down the courthouse steps into a wall of daylight.',
      true,
    );
    addStat(s, 'happiness', 10);
    return;
  }
  const [lo, hi] = def?.sentence ?? [0, 1];
  let years = Math.round(
    ctx.rng.int(lo, hi) *
      countryOf(s).sentencing *
      (plea ? 0.5 : 1) *
      (s.legal.probation > 0 ? 1.5 : 1),
  );
  if (juvenile) years = Math.min(years, 2);
  s.legal.record.push({
    crimeId: c.crimeId,
    year: s.year,
    age: s.player.age,
    verdict: plea ? 'plea' : 'convicted',
    sentenceYears: years,
    juvenile,
  });
  addStat(s, 'notoriety', 3);
  if (years <= 0) {
    s.legal.probation = ctx.rng.int(1, 3);
    const fine = money(s, ctx.rng.int(200, 2000));
    s.money.cash -= fine;
    ctx.log(
      'crime',
      `${plea ? 'You take the plea.' : 'Guilty.'} The judge gives you ${s.legal.probation} year${s.legal.probation === 1 ? '' : 's'} of probation and a ${formatMoney(s, fine)} fine.`,
      true,
    );
    return;
  }
  imprison(ctx, c.crimeId, years, juvenile);
  ctx.log(
    'crime',
    `${plea ? 'You take the plea deal.' : 'Guilty.'} The sentence is ${years} year${years === 1 ? '' : 's'}${juvenile ? ' in juvenile detention' : ''}.`,
    true,
  );
}

export function imprison(ctx: Ctx, crimeId: string, years: number, juvenile = false): void {
  const s = ctx.s;
  // Caught for something new while on the run: the old years come due too, and the run is over.
  const f = s.legal.fugitive;
  if (f) {
    years += f.owed;
    s.legal.fugitive = null;
    s.player.flags = s.player.flags.filter((x) => x !== 'fugitive' && x !== 'false_papers');
  }
  s.legal.prison = { years, served: 0, crimeId, behaviour: 50 };
  s.assets.housing = 'prison';
  if (!s.player.flags.includes('ever_imprisoned')) s.player.flags.push('ever_imprisoned');
  if (juvenile && !s.player.flags.includes('juvenile_detention'))
    s.player.flags.push('juvenile_detention');
  if (s.career.jobId) endJob(ctx, 'imprisoned');
  s.career.partTimeId = null;
  if (s.education.enrollment) leaveEnrollment(s);
  addStat(s, 'happiness', -15);
  for (const n of s.npcs)
    if (n.alive && (n.roles.includes('partner') || n.roles.includes('spouse')))
      n.rel = clampStat(n.rel - 15);
  if (!s.npcs.some((n) => n.alive && n.roles.includes('cellmate'))) {
    const mate = addNpc(ctx, {
      role: 'cellmate',
      // Prisons are single-sex; a nonbinary player's cellmate could be either.
      ...(s.player.gender === 'nonbinary' ? {} : { gender: s.player.gender }),
      age: Math.max(s.player.age, 18) + ctx.rng.int(-3, 15),
      rel: ctx.rng.int(30, 60),
    });
    ctx.log(
      'crime',
      `Your cellmate is ${mate.first}, who says hello by explaining which bunk is theirs.`,
    );
  }
}

export function release(ctx: Ctx, parole: boolean, quiet = false): void {
  const s = ctx.s;
  s.legal.prison = null;
  s.assets.housing = s.assets.homes.some((h) => h.livingIn)
    ? 'owning'
    : s.player.age < 18
      ? 'parents'
      : 'renting';
  if (parole) s.legal.probation = 2;
  if (!s.player.flags.includes('ex_con')) s.player.flags.push('ex_con');
  if (!quiet) s.legal.releasedYear = s.year;
  for (const n of s.npcs)
    if (n.roles.includes('cellmate')) {
      n.roles = n.roles.map((r) => (r === 'cellmate' ? 'acquaintance' : r));
      // Outside, they're someone you used to share a cell with.
      if (!n.flags.includes('former_cellmate')) n.flags.push('former_cellmate');
    }
  if (quiet) return;
  ctx.log(
    'crime',
    parole
      ? 'The parole board lets you out early. The air outside tastes of rain and possibility.'
      : 'You walk out of prison with a plastic bag of belongings and a lot of catching up to do.',
    true,
  );
  addStat(s, 'happiness', 10);
}

/** Yearly legal tick: prison time, parole, probation, sealing juvenile records at 18 (SPEC §5.10). */
export function legalTick(ctx: Ctx): void {
  const s = ctx.s;
  const l = s.legal;
  if (s.player.age === 18 && !l.sealed && l.record.some((r) => r.juvenile)) {
    l.sealed = true;
    ctx.log('crime', 'You turn 18 and your juvenile record is sealed. A clean-ish slate.', true);
  }
  if (l.probation > 0 && !l.prison) l.probation -= 1;
  if (l.fugitive && !l.prison) fugitiveTick(ctx);
  const p = l.prison;
  if (!p) return;
  p.served += 1;
  p.behaviour = clampStat(
    p.behaviour +
      ctx.rng.int(-4, 6) +
      (s.player.traits.includes('hot_headed') ? -4 : 0) +
      (s.player.traits.includes('calm') ? 3 : 0),
  );
  addStat(s, 'stress', 6);
  if (p.served >= p.years) release(ctx, false);
  else if (p.served * 2 >= p.years && p.behaviour >= 60 && ctx.rng.chance(0.4)) release(ctx, true);
}

/** On the run: the risk of a knock at the door fades with the years, and after twenty nobody is looking. */
function fugitiveTick(ctx: Ctx): void {
  const s = ctx.s;
  const f = s.legal.fugitive;
  if (!f) return;
  const years = s.year - f.since;
  if (years >= 20) {
    s.legal.fugitive = null;
    if (!s.player.flags.includes('file_cold')) s.player.flags.push('file_cold');
    s.player.flags = s.player.flags.filter((x) => x !== 'fugitive');
    ctx.log(
      'crime',
      'Twenty years on, the file on you is in a box in a basement. Nobody is looking any more.',
      true,
    );
    return;
  }
  // Good false papers halve the risk.
  const risk =
    Math.max(0.05, 0.3 - years * 0.04) * (s.player.flags.includes('false_papers') ? 0.5 : 1);
  if (!ctx.roll(risk)) return;
  recapture(ctx);
}

export function recapture(ctx: Ctx, surrendered = false): void {
  const s = ctx.s;
  const f = s.legal.fugitive;
  if (!f) return;
  s.legal.fugitive = null;
  s.player.flags = s.player.flags.filter((x) => x !== 'fugitive' && x !== 'false_papers');
  // Being caught costs two more years and any goodwill with the parole board.
  const years = surrendered ? f.owed : f.owed + 2;
  ctx.log(
    'crime',
    surrendered
      ? `You hand yourself in. The sentence: the ${f.owed} ${f.owed === 1 ? 'year' : 'years'} still owed, and nothing more.`
      : 'A knock at six in the morning. They are polite, and there are a lot of them. You are going back.',
    true,
  );
  imprison(ctx, f.crimeId, years);
  if (!surrendered && s.legal.prison) s.legal.prison.behaviour = 25;
}

/** Over the fence: free, with the years still owed and every siren for company. */
export function escapePrison(ctx: Ctx): void {
  const s = ctx.s;
  const p = s.legal.prison;
  if (!p) return;
  const owed = Math.max(1, p.years - p.served) + 3;
  release(ctx, false, true);
  s.legal.fugitive = { since: s.year, owed, crimeId: p.crimeId };
  if (!s.player.flags.includes('fugitive')) s.player.flags.push('fugitive');
  if (!s.player.flags.includes('escaped_once')) s.player.flags.push('escaped_once');
  addStat(s, 'notoriety', 15);
  ctx.log('crime', 'You are free, technically. Every siren is about you now.', true);
}
