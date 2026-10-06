import { COUNTRY_BY_ID } from '../content/countries';
import { TRAITS } from '../content/traits';
import type { Ctx } from './ctx';
import type { Attraction, Gender, GameState, Memory, Npc, Role } from './types';
import { fertilityBaseline } from './stats';
import { clampStat } from './util';

export const MEMORY_MAX = 30;

export type NpcSpec = {
  role: Role;
  gender?: Gender;
  age: number;
  last?: string;
  first?: string;
  country?: string;
  rel?: number;
  parentIds?: number[];
  traits?: string[];
  money?: number;
  job?: string | null;
  lookSeed?: number;
};

export function randomName(ctx: Ctx, countryId: string, gender: Gender): string {
  const c = COUNTRY_BY_ID[countryId] ?? COUNTRY_BY_ID['us'];
  if (!c) throw new Error('no countries');
  const pool =
    gender === 'male'
      ? c.names.male
      : gender === 'female'
        ? c.names.female
        : ctx.rng.chance(0.5)
          ? c.names.male
          : c.names.female;
  // Nobody new shares a first name with you, your family, or anyone still in your life.
  const s = ctx.s;
  const taken = new Set<string>([s.player.first]);
  for (const n of s.npcs)
    if (n.alive || n.roles.some((r) => FAMILY_ROLES.has(r))) taken.add(n.first);
  const free = pool.filter((x) => !taken.has(x));
  return ctx.rng.pick(free.length ? free : pool);
}

const FAMILY_ROLES = new Set(['mother', 'father', 'sibling', 'child', 'grandparent', 'spouse']);

export function randomSurname(ctx: Ctx, countryId: string): string {
  const c = COUNTRY_BY_ID[countryId] ?? COUNTRY_BY_ID['us'];
  if (!c) throw new Error('no countries');
  return ctx.rng.pick(c.names.last);
}

export function randomTraits(ctx: Ctx, n: number): string[] {
  const out: string[] = [];
  for (const t of ctx.rng.shuffle(TRAITS)) {
    if (out.length >= n) break;
    if (out.some((o) => t.excludes.includes(o) || o === t.id)) continue;
    out.push(t.id);
  }
  return out;
}

function randomAttraction(ctx: Ctx, gender: Gender): Attraction {
  const r = ctx.rng.next();
  if (r < 0.06) return 'everyone';
  if (gender === 'nonbinary') return ctx.rng.chance(0.5) ? 'men' : 'women';
  if (r < 0.1) return gender === 'male' ? 'men' : 'women';
  return gender === 'male' ? 'women' : 'men';
}

export function addNpc(ctx: Ctx, spec: NpcSpec): Npc {
  const s = ctx.s;
  const country = spec.country ?? s.player.country;
  const gender: Gender = spec.gender ?? (ctx.rng.chance(0.5) ? 'male' : 'female');
  const r = ctx.rng;
  const npc: Npc = {
    id: s.nextNpcId++,
    first: spec.first ?? randomName(ctx, country, gender),
    last: spec.last ?? randomSurname(ctx, country),
    gender,
    age: spec.age,
    birthYear: s.year - spec.age,
    alive: true,
    roles: [spec.role],
    rel: clampStat(spec.rel ?? 50),
    traits: spec.traits ?? randomTraits(ctx, 2),
    stats: {
      health: clampStat(r.int(55, 95) - Math.max(0, spec.age - 50) * 0.6),
      smarts: r.int(20, 90),
      looks: r.int(20, 90),
      happiness: r.int(35, 85),
    },
    job: spec.job ?? null,
    country,
    memory: [],
    flags: [],
    parentIds: spec.parentIds ?? [],
    lastContact: s.year,
    money: Math.max(0, Math.round(spec.money ?? 0)),
    attraction: randomAttraction(ctx, gender),
    fertility: startFertility(r.int(40, 90), spec.age, gender),
  };
  if (spec.lookSeed !== undefined) npc.lookSeed = spec.lookSeed;
  s.npcs.push(npc);
  return npc;
}

export function npcById(s: GameState, id: number): Npc | undefined {
  return s.npcs.find((n) => n.id === id);
}

export function hasRole(n: Npc, role: Role): boolean {
  return n.roles.includes(role);
}

export function npcsWithRole(s: GameState, role: Role, aliveOnly = true): Npc[] {
  return s.npcs.filter((n) => n.roles.includes(role) && (!aliveOnly || n.alive));
}

/** Change an NPC's relationship and record a memory line (capped at 30). */
export function remember(s: GameState, npc: Npc, text: string, delta: number): void {
  npc.rel = clampStat(npc.rel + delta);
  const m: Memory = { year: s.year, text, delta: Math.round(delta) };
  npc.memory.push(m);
  if (npc.memory.length > MEMORY_MAX) npc.memory.splice(0, npc.memory.length - MEMORY_MAX);
  npc.lastContact = s.year;
}

export function pronouns(g: Gender): { they: string; them: string; their: string } {
  if (g === 'male') return { they: 'he', them: 'him', their: 'his' };
  if (g === 'female') return { they: 'she', them: 'her', their: 'her' };
  return { they: 'they', them: 'them', their: 'their' };
}

/** "your sister", "your friend". */
export function relLabel(n: Npc): string {
  // Who they are to you first: a coworker you're dating is your partner.
  const role =
    (['spouse', 'partner', 'ex'] as const).find((r) => n.roles.includes(r)) ??
    n.roles[0] ??
    'acquaintance';
  const g = n.gender;
  const pick = (m: string, f: string, x: string): string =>
    g === 'male' ? m : g === 'female' ? f : x;
  switch (role) {
    case 'mother':
      return 'your mother';
    case 'father':
      return 'your father';
    case 'sibling':
      return pick('your brother', 'your sister', 'your sibling');
    case 'grandparent':
      return pick('your grandfather', 'your grandmother', 'your grandparent');
    case 'great_grandparent':
      return pick('your great-grandfather', 'your great-grandmother', 'your great-grandparent');
    case 'child':
      return pick('your son', 'your daughter', 'your child');
    case 'grandchild':
      return pick('your grandson', 'your granddaughter', 'your grandchild');
    case 'nibling':
      return pick('your nephew', 'your niece', 'your sibling’s child');
    case 'aunt_uncle':
      return pick('your uncle', 'your aunt', 'your parent’s sibling');
    case 'partner':
      return pick('your boyfriend', 'your girlfriend', 'your partner');
    case 'spouse':
      return pick('your husband', 'your wife', 'your spouse');
    case 'ex':
      return 'your ex';
    case 'stepparent':
      return pick('your stepfather', 'your stepmother', 'your stepparent');
    default:
      return `your ${role}`;
  }
}

/** Women past their mid-forties start at zero, like the yearly curve. */
function startFertility(roll: number, age: number, gender: Gender): number {
  if (gender !== 'female') return roll;
  if (age > 46) return 0;
  return Math.min(roll, fertilityBaseline(age, 'female') + 10);
}
