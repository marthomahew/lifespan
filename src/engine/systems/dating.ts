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
  for (let i = 0; i < 3; i++) {
    const a = s.player.attraction;
    const gender: Gender =
      a === 'men' ? 'male' : a === 'women' ? 'female' : r.chance(0.5) ? 'male' : 'female';
    const pool = (gender === 'male' ? c.names.male : c.names.female).filter((n) => !taken.has(n));
    const first = r.pick(pool.length ? pool : gender === 'male' ? c.names.male : c.names.female);
    taken.add(first);
    const tier = r.pick(['working', 'middle', 'middle', 'comfortable'] as const);
    const jobs = PARENT_JOBS[tier].filter((j) => j !== 'Unemployed');
    const t1 = r.pick(TRAITS);
    const t2 = r.pick(TRAITS.filter((t) => t.id !== t1.id && !t1.excludes.includes(t.id)));
    out.push({
      first,
      last: r.pick(c.names.last),
      gender,
      age: Math.max(18, s.player.age + r.int(-6, 6)),
      job: r.pick(jobs),
      traits: [t1.id, t2.id],
      wantsKids: !r.chance(0.45),
      wantsMarriage: !r.chance(0.25),
      hook: hooks[i] ?? '',
      lookSeed: 100_000 + r.int(0, 1_000_000),
    });
  }
  return out;
}
