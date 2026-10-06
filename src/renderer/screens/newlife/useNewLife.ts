import { useState } from 'react';
import { COUNTRIES } from '../../../content/countries';
import { SKILLS } from '../../../content/skills';
import { TRAITS } from '../../../content/traits';
import {
  WEALTH_TIERS,
  type Attraction,
  type Gender,
  newLife,
  type NewLifeOptions,
  type WealthTier,
} from '../../../engine';
import { DEFAULT_LOOK, lookRng, randomLook } from '../../../engine/look';
import type { Look, ParentSetup } from '../../../engine/types';

export const STATS = ['happiness', 'health', 'smarts', 'looks'] as const;
export type StatKey = (typeof STATS)[number];

/** Everything the New Life form holds; '' means "leave it to chance". */
export type Draft = {
  first: string;
  last: string;
  gender: Gender | '';
  attraction: Attraction | '';
  country: string;
  city: string;
  birthYear: number;
  look: Look;
  /** Whether the player shaped the look (else a seeded life rolls its own). */
  lookSet: boolean;
  traits: string[];
  stats: Record<StatKey, number>;
  wealth: WealthTier;
  parents: ParentSetup | '';
  siblings: string;
  talent: string;
  /** A prodigy's gift rather than an ordinary one. */
  prodigy: boolean;
  /** Pick-only gifts (quick study, luck): never rolled by the dice. */
  gifts: string[];
  /** 'auto' follows the Settings frequency; 'none' is an ordinary upbringing. */
  background: string;
  seed: string;
};

export const START: Draft = {
  first: '',
  last: '',
  gender: '',
  attraction: '',
  country: 'us',
  city: '',
  birthYear: 2000,
  look: DEFAULT_LOOK,
  lookSet: false,
  traits: [],
  stats: { happiness: 80, health: 90, smarts: 20, looks: 50 },
  wealth: 'middle',
  parents: '',
  siblings: '',
  talent: '',
  prodigy: false,
  gifts: [],
  background: 'auto',
  seed: '',
};

// The renderer can use the platform's randomness; only the engine must be seeded.
const pick = <T>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)] as T;
const int = (lo: number, hi: number): number => lo + Math.floor(Math.random() * (hi - lo + 1));

/** A random face for the builder (the engine rolls its own when a life is seeded). */
export function rollLook(gender: Gender): Look {
  return randomLook(lookRng(int(1, 2 ** 30), 0), gender);
}

/** Add or remove a trait, keeping at most three and no contradictions. */
export function toggleTrait(cur: string[], id: string): string[] {
  if (cur.includes(id)) return cur.filter((t) => t !== id);
  const t = TRAITS.find((x) => x.id === id);
  const kept = cur.filter((o) => !t?.excludes.includes(o));
  return kept.length >= 3 ? kept : [...kept, id];
}

function randomTraits(): string[] {
  let out: string[] = [];
  for (let i = 0; i < 12 && out.length < int(2, 3); i++) out = toggleTrait(out, pick(TRAITS).id);
  return out;
}

/** Each section's dice: fill it with something you might not have picked. */
export const DICE = {
  identity: (d: Draft): Draft => {
    const gender = pick(['female', 'male', 'female', 'male', 'nonbinary'] as const);
    return {
      ...d,
      first: '',
      last: '',
      gender,
      attraction: pick(['men', 'women', 'everyone'] as const),
    };
  },
  look: (d: Draft): Draft => ({ ...d, look: rollLook(d.gender || 'nonbinary'), lookSet: true }),
  origins: (d: Draft): Draft => ({
    ...d,
    country: pick(COUNTRIES).id,
    city: '',
    birthYear: int(1950, 2025),
    wealth: pick(WEALTH_TIERS),
    parents: pick(['together', 'together', 'apart', 'mother', 'father'] as const),
    siblings: String(pick([0, 1, 1, 2, 3, 4])),
  }),
  nature: (d: Draft): Draft => ({
    ...d,
    traits: randomTraits(),
    talent: pick(['', ...SKILLS.map((k) => k.id)]),
  }),
  stats: (d: Draft): Draft => ({
    ...d,
    stats: {
      happiness: int(40, 100),
      health: int(50, 100),
      smarts: int(5, 60),
      looks: int(20, 90),
    },
  }),
};

export function toOptions(d: Draft): { opts: NewLifeOptions; seed?: number } {
  const opts: NewLifeOptions = {
    country: d.country,
    birthYear: d.birthYear,
    // A seed replays a whole life, face included, unless you shaped the face yourself.
    ...(d.lookSet || !d.seed.trim() ? { look: d.look } : {}),
    traits: d.traits,
    stats: d.stats,
    wealth: d.wealth,
    ...(d.gender ? { gender: d.gender } : {}),
    ...(d.attraction ? { attraction: d.attraction } : {}),
    ...(d.parents ? { parents: d.parents } : {}),
    ...(d.siblings !== '' ? { siblings: Number(d.siblings) } : {}),
    ...(d.talent ? { talent: d.talent, talentLevel: d.prodigy ? 'prodigy' : 'gift' } : {}),
    ...(d.gifts.length ? { gifts: d.gifts } : {}),
    ...(d.background !== 'none' ? { background: d.background } : {}),
  };
  if (d.first.trim()) opts.first = d.first.trim();
  if (d.last.trim()) opts.last = d.last.trim();
  if (d.city) opts.city = d.city;
  const n = Number(d.seed);
  return d.seed.trim() && Number.isFinite(n) ? { opts, seed: Math.abs(Math.floor(n)) } : { opts };
}

export function useNewLife(): [Draft, (patch: Partial<Draft> | ((d: Draft) => Draft)) => void] {
  const [d, setD] = useState<Draft>(() => ({ ...START, look: rollLook('nonbinary') }));
  const update = (patch: Partial<Draft> | ((d: Draft) => Draft)): void =>
    setD((cur) => (typeof patch === 'function' ? patch(cur) : { ...cur, ...patch }));
  return [d, update];
}

/** The face the life will start with: yours if you shaped it, else the one the seed rolls. */
export function shownLook(d: Draft): Look {
  const { opts, seed } = toOptions(d);
  if (d.lookSet || seed === undefined) return d.look;
  try {
    return newLife(opts, seed).player.look;
  } catch {
    return d.look;
  }
}
