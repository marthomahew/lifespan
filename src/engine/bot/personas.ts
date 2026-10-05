import { COUNTRIES } from '../../content/countries';
import { CRIMES } from '../../content/crimes';
import { FULL_TIME_JOBS, PART_TIME_JOBS } from '../../content/jobs';
import { MAJORS, GRAD_PROGRAMS } from '../../content/education';
import { BRANCHES, SPECIALTIES } from '../../content/military';
import { SKILLS, LANGUAGES } from '../../content/skills';
import type { act } from '../actions';
import type { Rng } from '../rng';
import { activitiesFor } from '../systems/activities';
import { crimeReason } from '../systems/crime';
import { unmetRequirements } from '../systems/careers';
import { enrollReason } from '../systems/education';
import { enlistReason } from '../systems/military';
import { interactionsFor } from '../systems/interactions';
import { emigrateReason } from '../systems/emigration';
import { musicReason, type MusicActionId } from '../systems/music';
import { treatmentsFor } from '../systems/health';
import { countryOf } from '../economy';
import { mortgageQuote } from '../systems/assets';
import type { GameState } from '../types';

type TryAct = (s: GameState, a: Parameters<typeof act>[1]) => GameState;

const doActivity = (
  s: GameState,
  id: string,
  tryAct: TryAct,
  params?: Record<string, unknown>,
): GameState =>
  activitiesFor(s).some((a) => a.id === id && a.enabled)
    ? tryAct(s, { type: 'activity', id, ...(params ? { params } : {}) })
    : s;

function bestJob(s: GameState): string | undefined {
  const ok = FULL_TIME_JOBS.filter(
    (j) => unmetRequirements(s, j).length === 0 && !s.career.appliedThisYear.includes(j.id),
  );
  const ranked = ok.sort((a, b) => (b.salary[0]?.[1] ?? 0) - (a.salary[0]?.[1] ?? 0));
  // Each life has a dream field (by seed) and takes the best job there when it can.
  const fields = [...new Set(FULL_TIME_JOBS.map((j) => j.field))].sort();
  const dream = fields[s.seed % fields.length];
  return (ranked.find((j) => j.field === dream) ?? ranked[0])?.id;
}

/** Settle down: buy the cheapest listed home on a 30-year mortgage once the bank says yes. */
function buyAHome(s: GameState, tryAct: TryAct): GameState {
  if (s.assets.homes.length || s.player.age < 27 || !s.career.jobId) return s;
  if (s.assets.listingsYear !== s.year || s.legal.prison) return s;
  let best = -1;
  s.assets.listings.forEach((l, i) => {
    if (best < 0 || l.price < (s.assets.listings[best]?.price ?? Infinity)) best = i;
  });
  const l = s.assets.listings[best];
  if (!l) return s;
  const financing = { kind: 'mortgage', years: 30, down: 0.2 } as const;
  if (mortgageQuote(s, l.price, financing).problem) return s;
  return tryAct(s, { type: 'buy_home', index: best, financing });
}

function treatEverything(s: GameState, tryAct: TryAct): GameState {
  let cur = s;
  for (const t of treatmentsFor(cur)) {
    const best = [...t.options].sort((a, b) => b.odds - a.odds)[0];
    if (best && cur.money.cash > best.cost)
      cur = tryAct(cur, { type: 'treat', illness: t.illness, method: best.method });
  }
  return cur;
}

function randomInteraction(
  s: GameState,
  rng: Rng,
  tryAct: TryAct,
  filter?: (id: string) => boolean,
): GameState {
  const people = s.npcs.filter((n) => n.alive);
  if (!people.length) return s;
  const n = rng.pick(people);
  const opts = interactionsFor(s, n).filter((v) => v.enabled && (!filter || filter(v.id)));
  if (!opts.length) return s;
  const pick = rng.pick(opts);
  return tryAct(s, {
    type: 'interact',
    npcId: n.id,
    id: pick.id,
    ...(pick.id === 'plan_wedding'
      ? {
          params: {
            size: rng.pick(['small', 'medium', 'large'] as const),
            prenup: rng.chance(0.4),
          },
        }
      : {}),
  });
}

export function careerist(s: GameState, rng: Rng, tryAct: TryAct): GameState {
  let cur = doActivity(s, 'study', tryAct);
  const p = cur.player;
  if (p.age >= 17 && !cur.education.enrollment) {
    if (!cur.education.degrees.some((d) => d.level === 'bachelor')) {
      const major = rng.pick(MAJORS);
      if (!enrollReason(cur, 'university', major.id))
        cur = tryAct(cur, { type: 'enroll', kind: 'university', programId: major.id });
    } else if (p.age < 35) {
      const g = rng.pick(GRAD_PROGRAMS);
      if (!enrollReason(cur, 'grad', g.id))
        cur = tryAct(cur, { type: 'enroll', kind: 'grad', programId: g.id });
    }
  }
  if (p.age >= 15 && p.age < 18 && !cur.career.partTimeId)
    cur = tryAct(cur, { type: 'apply_job', jobId: rng.pick(PART_TIME_JOBS).id });
  if (p.age >= 18 && !cur.education.enrollment) {
    const job = bestJob(cur);
    if (job && (!cur.career.jobId || rng.chance(0.15)))
      cur = tryAct(cur, { type: 'apply_job', jobId: job });
  }
  if (cur.career.jobId) {
    for (const id of ['work_harder', 'ask_promotion', 'ask_raise'])
      cur = tryAct(cur, { type: 'career', id });
    if (p.age >= countryOf(cur).ages.retirement && rng.chance(0.5))
      cur = tryAct(cur, { type: 'career', id: 'retire' });
  }
  if (p.age >= 18 && cur.money.cash > 50000)
    cur = tryAct(cur, {
      type: 'money',
      action: {
        op: 'invest',
        key: rng.pick(['bonds', 'index', 'growth'] as const),
        amount: Math.round(cur.money.cash * 0.3),
      },
    });
  if (p.age >= 16 && rng.chance(0.3)) cur = tryAct(cur, { type: 'career', id: 'freelance' });
  cur = buyAHome(cur, tryAct);
  return treatEverything(cur, tryAct);
}

export function criminal(s: GameState, rng: Rng, tryAct: TryAct): GameState {
  let cur = s;
  if (cur.legal.prison) {
    const prisonActs = activitiesFor(cur).filter((a) => a.enabled && a.group === 'prison');
    for (let i = 0; i < 2 && prisonActs.length; i++)
      cur = tryAct(cur, { type: 'activity', id: rng.pick(prisonActs).id });
    return cur;
  }
  const crimes = CRIMES.filter((c) => !crimeReason(cur, c.id));
  if (crimes.length && rng.chance(0.6))
    cur = tryAct(cur, { type: 'crime', id: rng.pick(crimes).id });
  const vices = activitiesFor(cur).filter(
    (a) =>
      a.enabled &&
      (a.group === 'crime' || a.id === 'drink' || a.id === 'smoke' || a.id === 'casino'),
  );
  if (vices.length && rng.chance(0.5))
    cur = tryAct(cur, { type: 'activity', id: rng.pick(vices).id });
  if (cur.player.age >= 18 && !cur.career.jobId && rng.chance(0.4)) {
    const job = rng.pick(FULL_TIME_JOBS);
    if (!unmetRequirements(cur, job).length)
      cur = tryAct(cur, { type: 'apply_job', jobId: job.id });
  }
  return cur;
}

export function family(s: GameState, rng: Rng, tryAct: TryAct): GameState {
  let cur = s;
  for (let i = 0; i < 3; i++) cur = randomInteraction(cur, rng, tryAct);
  if (cur.player.age >= 18) {
    for (const id of ['find_date', 'dating_app', 'nightlife']) cur = doActivity(cur, id, tryAct);
    for (let i = 0; i < 3; i++)
      cur = randomInteraction(cur, rng, tryAct, (id) =>
        ['date_night', 'propose', 'plan_wedding', 'try_for_baby', 'couples_therapy'].includes(id),
      );
    if (cur.player.age >= 25 && rng.chance(0.15)) cur = doActivity(cur, 'adopt', tryAct);
    if (cur.player.age >= 40 && !cur.will.written) cur = doActivity(cur, 'write_will', tryAct);
  }
  if (cur.player.age >= 18 && !cur.career.jobId && !cur.education.enrollment) {
    const job = bestJob(cur);
    if (job) cur = tryAct(cur, { type: 'apply_job', jobId: job });
  }
  cur = buyAHome(cur, tryAct);
  return treatEverything(cur, tryAct);
}

export function military(s: GameState, rng: Rng, tryAct: TryAct): GameState {
  let cur = s;
  const m = cur.military;
  if (!m && !enlistReason(cur, false))
    cur = tryAct(cur, {
      type: 'enlist',
      branch: rng.pick(BRANCHES),
      specialty: rng.pick(SPECIALTIES).id,
      officer: false,
    });
  if (cur.military?.active && cur.year - cur.military.since >= 8 && rng.chance(0.3))
    cur = tryAct(cur, { type: 'discharge' });
  if (cur.military && !cur.military.active) {
    if (!cur.education.enrollment && !cur.education.degrees.some((d) => d.level === 'bachelor')) {
      const major = rng.pick(MAJORS);
      if (!enrollReason(cur, 'university', major.id))
        cur = tryAct(cur, { type: 'enroll', kind: 'university', programId: major.id });
    } else if (!cur.career.jobId && !cur.education.enrollment) {
      const job = bestJob(cur);
      if (job) cur = tryAct(cur, { type: 'apply_job', jobId: job });
    }
  }
  return treatEverything(cur, tryAct);
}

const MUSIC_ORDER: MusicActionId[] = [
  'busk',
  'open_mic',
  'gig',
  'form_band',
  'go_solo',
  'release',
  'tour',
];

export function musician(s: GameState, rng: Rng, tryAct: TryAct): GameState {
  let cur = doActivity(s, 'practice_skill', tryAct, {
    skill: rng.chance(0.6) ? 'instrument' : 'voice',
  });
  if (cur.player.age >= 10 && !cur.assets.possessions.some((p) => p.item === 'acoustic_guitar'))
    cur = tryAct(cur, { type: 'buy_item', item: 'acoustic_guitar' });
  for (const id of MUSIC_ORDER)
    if (!musicReason(cur, id) && (id !== 'go_solo' || rng.chance(0.4)))
      cur = tryAct(cur, { type: 'music', id });
  if (cur.player.age >= 18 && !cur.career.jobId && cur.player.stats.fame < 30 && rng.chance(0.5)) {
    const job = bestJob(cur);
    if (job) cur = tryAct(cur, { type: 'apply_job', jobId: job });
  }
  cur = buyAHome(cur, tryAct);
  return treatEverything(cur, tryAct);
}

export function emigrant(s: GameState, rng: Rng, tryAct: TryAct): GameState {
  let cur = doActivity(s, 'learn_language', tryAct, { language: rng.pick(LANGUAGES).id });
  if (cur.player.age >= 20 && cur.player.age <= 50 && rng.chance(0.12)) {
    const options = COUNTRIES.filter((c) => !emigrateReason(cur, c.id));
    if (options.length) cur = tryAct(cur, { type: 'emigrate', country: rng.pick(options).id });
  }
  if (cur.player.age >= 18 && !cur.career.jobId) {
    const job = bestJob(cur);
    if (job) cur = tryAct(cur, { type: 'apply_job', jobId: job });
  }
  if (rng.chance(0.4)) cur = doActivity(cur, 'vacation', tryAct);
  return cur;
}

export function chaos(s: GameState, rng: Rng, tryAct: TryAct): GameState {
  let cur = s;
  // Chaos has habits: most years it leans on one of drink, cigarettes, or the casino.
  const habit = (['drink', 'smoke', 'casino'] as const)[cur.seed % 3] ?? 'drink';
  if (rng.chance(0.8)) cur = doActivity(cur, habit, tryAct);
  for (let i = 0; i < 4; i++) {
    const roll = rng.int(0, 9);
    if (roll <= 3) {
      const acts = activitiesFor(cur).filter((a) => a.enabled);
      if (acts.length)
        cur = tryAct(cur, {
          type: 'activity',
          id: rng.pick(acts).id,
          params: { skill: rng.pick(SKILLS).id, language: rng.pick(LANGUAGES).id },
        });
    } else if (roll <= 5) cur = randomInteraction(cur, rng, tryAct);
    else if (roll === 6)
      cur = tryAct(cur, {
        type: 'apply_job',
        jobId: rng.pick([...FULL_TIME_JOBS, ...PART_TIME_JOBS]).id,
      });
    else if (roll === 7) cur = tryAct(cur, { type: 'crime', id: rng.pick(CRIMES).id });
    else if (roll === 8)
      cur = tryAct(cur, {
        type: 'money',
        action: {
          op: rng.pick(['invest', 'deposit', 'borrow'] as const) as 'deposit',
          amount: Math.max(100, Math.round(Math.abs(cur.money.cash) * 0.2)),
        } as never,
      });
    else
      cur = tryAct(cur, {
        type: 'career',
        id: rng.pick(['work_harder', 'ask_raise', 'ask_promotion', 'quit', 'freelance']),
      });
  }
  if (rng.chance(0.2))
    cur = tryAct(cur, {
      type: 'buy_item',
      item: rng.pick(['racing_bike', 'gaming_laptop', 'violin', 'gold_watch']),
    });
  if (cur.player.age >= 18 && rng.chance(0.05))
    cur = tryAct(cur, {
      type: 'buy_vehicle',
      model: 'pelican_runabout',
      financed: rng.chance(0.5),
    });
  if (rng.chance(0.1)) {
    const major = rng.pick(MAJORS);
    if (!enrollReason(cur, 'university', major.id))
      cur = tryAct(cur, { type: 'enroll', kind: 'university', programId: major.id });
  }
  return cur;
}
