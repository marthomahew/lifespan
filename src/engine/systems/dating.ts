import { COUNTRY_BY_ID } from '../../content/countries';
import { PARENT_JOBS } from '../../content/family';
import { TRAITS } from '../../content/traits';
import { Rng, seedRng } from '../rng';
import type { GameState, Gender } from '../types';
import { usedThisYear } from './usage';

/** Someone you could go on a date with: who they are, and what they want. */
export type Candidate = {
  first: string;
  last: string;
  gender: Gender;
  age: number;
  job: string;
  traits: string[];
  wantsKids: boolean;
  wantsMarriage: boolean;
  /** A line about them, for the card. */
  hook: string;
  lookSeed: number;
};

const HOOKS = [
  'Has strong opinions about bread.',
  'Laughs at their own jokes, which are good.',
  'Is training for a marathon, slowly.',
  'Owns more plants than furniture.',
  'Can name every bird in the park.',
  'Collects postcards from places they have never been.',
  'Cooks a curry that people still talk about.',
  'Knows the words to every song from 1994.',
  'Is learning the cello, badly and happily.',
  'Volunteers at the animal shelter on Sundays.',
  'Has a scar with three different stories.',
  'Writes letters. Actual letters.',
];

/** Tonight's possible dates: seeded by life, year and outing, so they stay put while you choose. */
export function dateCandidates(s: GameState, activityId: string): Candidate[] {
  const outing = usedThisYear(s, `a:${activityId}`);
  const r = new Rng(
    seedRng((Math.imul(s.seed, 131) + s.year * 17 + outing * 7907 + activityId.length) >>> 0),
  );
  const c = COUNTRY_BY_ID[s.player.country] ?? COUNTRY_BY_ID['us'];
  if (!c) return [];
  const taken = new Set([s.player.first, ...s.npcs.map((n) => n.first)]);
  const out: Candidate[] = [];
  const hooks = r.shuffle(HOOKS);
  const usedLast = new Set<string>();
  for (let i = 0; i < 3; i++) {
    const a = s.player.attraction;
    const gender: Gender =
      a === 'men' ? 'male' : a === 'women' ? 'female' : r.chance(0.5) ? 'male' : 'female';
    const pool = (gender === 'male' ? c.names.male : c.names.female).filter((n) => !taken.has(n));
    const first = r.pick(pool.length ? pool : gender === 'male' ? c.names.male : c.names.female);
    taken.add(first);
    // Ages spread around yours (a young player meets 18–24s, not a row of 18s).
    const lo = Math.max(18, s.player.age - 6);
    const age = r.int(lo, Math.max(lo + 5, s.player.age + 6));
    // Jobs fit the age: students and starters when young, retirees later on.
    const tier =
      age < 23 ? 'working' : r.pick(['working', 'middle', 'middle', 'comfortable'] as const);
    const jobs = PARENT_JOBS[tier].filter((j) => j !== 'Unemployed');
    const job = age >= 67 ? 'Retired' : age < 21 && r.chance(0.5) ? 'Student' : r.pick(jobs);
    const t1 = r.pick(TRAITS);
    const t2 = r.pick(TRAITS.filter((t) => t.id !== t1.id && !t1.excludes.includes(t.id)));
    const lasts = c.names.last.filter((l) => !usedLast.has(l));
    const last = r.pick(lasts.length ? lasts : c.names.last);
    usedLast.add(last);
    out.push({
      first,
      last,
      gender,
      age,
      job,
      traits: [t1.id, t2.id],
      // Past fifty, children are a closed chapter.
      wantsKids: age <= 45 && !r.chance(0.45),
      wantsMarriage: !r.chance(0.25),
      hook: hooks[i] ?? '',
      lookSeed: 100_000 + r.int(0, 1_000_000),
    });
  }
  return out;
}
