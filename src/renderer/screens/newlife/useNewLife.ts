import { useState } from 'react';
import { COUNTRIES } from '../../../content/countries';
import { SKIN_TONES } from '../../../content/family';
import { SKILLS } from '../../../content/skills';
import { TRAITS } from '../../../content/traits';
import {
  WEALTH_TIERS,
  type Attraction,
  type Gender,
  type NewLifeOptions,
  type WealthTier,
} from '../../../engine';
import { HAIR_STYLES } from '../../../engine/avatar';
import type { HairStyle, ParentSetup } from '../../../engine/types';

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
  tone: string;
  hair: HairStyle | '';
  traits: string[];
  stats: Record<StatKey, number>;
  wealth: WealthTier;
  parents: ParentSetup | '';
  siblings: string;
  talent: string;
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
  tone: '',
  hair: '',
  traits: [],
  stats: { happiness: 80, health: 90, smarts: 20, looks: 50 },
  wealth: 'middle',
  parents: '',
  siblings: '',
  talent: '',
  seed: '',
};

// The renderer can use the platform's randomness; only the engine must be seeded.
const pick = <T>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)] as T;
const int = (lo: number, hi: number): number => lo + Math.floor(Math.random() * (hi - lo + 1));

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
  look: (d: Draft): Draft => ({ ...d, tone: pick(SKIN_TONES), hair: pick(HAIR_STYLES).id }),
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
    appearance: d.tone,
    traits: d.traits,
    stats: d.stats,
    wealth: d.wealth,
    ...(d.gender ? { gender: d.gender } : {}),
    ...(d.attraction ? { attraction: d.attraction } : {}),
    ...(d.hair ? { hair: d.hair } : {}),
    ...(d.parents ? { parents: d.parents } : {}),
    ...(d.siblings !== '' ? { siblings: Number(d.siblings) } : {}),
    ...(d.talent ? { talent: d.talent } : {}),
  };
  if (d.first.trim()) opts.first = d.first.trim();
  if (d.last.trim()) opts.last = d.last.trim();
  if (d.city) opts.city = d.city;
  const n = Number(d.seed);
  return d.seed.trim() && Number.isFinite(n) ? { opts, seed: Math.abs(Math.floor(n)) } : { opts };
}

export function useNewLife(): [Draft, (patch: Partial<Draft> | ((d: Draft) => Draft)) => void] {
  const [d, setD] = useState<Draft>(START);
  const update = (patch: Partial<Draft> | ((d: Draft) => Draft)): void =>
    setD((cur) => (typeof patch === 'function' ? patch(cur) : { ...cur, ...patch }));
  return [d, update];
}
