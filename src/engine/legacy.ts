import { ACHIEVEMENTS } from '../content/achievements';
import { PARENT_JOB_LINK } from '../content/family';
import { takeOverJob } from './systems/careers';
import { article, lowerTitle } from './text';
import { formatMoney } from './economy';
import { npcLook, toneOf } from './look';
import { COUNTRY_BY_ID } from '../content/countries';
import { TRAIT_BY_ID } from '../content/traits';
import { Ctx } from './ctx';
import { EngineError } from './errors';
import { emptyState } from './life';
import { randomTraits } from './npc';
import { Rng } from './rng';
import { recordStatHistory } from './stats';
import { PLAYER_ID, type GameState, type GenerationRecord, type Npc, type Role } from './types';
import { clampStat, clone } from './util';
import { CHALLENGE_BY_ID } from '../content/challenges';

export type HeirOption = { id: number; name: string; age: number; rel: number; money: number };

/** Living children who can carry the family on (SPEC §5.15). */
export function heirOptions(s: GameState): HeirOption[] {
  if (!s.death) return [];
  return s.npcs
    .filter((n) => n.alive && n.roles.includes('child'))
    .map((n) => ({
      id: n.id,
      name: `${n.first} ${n.last}`,
      age: n.age,
      rel: n.rel,
      money: n.money,
    }))
    .sort((a, b) => b.age - a.age);
}

const FRIENDLY_ROLES = new Set<Role>([
  'friend',
  'coworker',
  'classmate',
  'boss',
  'enemy',
  'cellmate',
  'teacher',
  'bandmate',
  'acquaintance',
  'ex',
  'partner',
]);

/** Relabel an NPC from the late player's point of view to the heir's. */
function remapRoles(n: Npc, heir: Npc, oldPlayerId: number): Role[] | null {
  const r = new Set(n.roles);
  if (heir.parentIds.includes(n.id)) return [n.gender === 'female' ? 'mother' : 'father'];
  if (r.has('spouse')) return ['stepparent'];
  if (r.has('child'))
    // Their parent ids still name the late player as 0 at this point.
    return n.parentIds.some(
      (p) => heir.parentIds.includes(p) || p === oldPlayerId || p === PLAYER_ID,
    )
      ? ['sibling']
      : ['acquaintance'];
  // The late player's grandchildren are the heir's children, or nephews and nieces.
  if (r.has('grandchild')) return n.parentIds.includes(heir.id) ? ['child'] : ['nibling'];
  if (r.has('mother') || r.has('father')) return ['grandparent'];
  if (r.has('grandparent')) return ['great_grandparent'];
  if (r.has('great_grandparent')) return null;
  if (r.has('sibling')) return ['aunt_uncle'];
  if (r.has('stepparent')) return ['acquaintance'];
  if ([...r].every((x) => FRIENDLY_ROLES.has(x))) return null;
  return ['acquaintance'];
}

/** Continue as a child: they become the player, with their inheritance and the family's history (SPEC §5.15). */
export function continueAsChild(input: GameState, heirId: number): GameState {
  const s = clone(input);
  if (!s.death) throw new EngineError('the life is not over');
  const heir = s.npcs.find((n) => n.id === heirId && n.alive && n.roles.includes('child'));
  if (!heir) throw new EngineError('that child cannot carry on');
  const old = s.player;
  const rng = new Rng(s.rng);
  rng.next();
  const next = emptyState(s.seed + s.generation * 7919);
  next.rng = rng.state;
  next.year = s.year;
  next.inflation = s.inflation;
  next.inflationMult = s.inflationMult;
  next.settings = { ...s.settings };
  next.cheats = { ...s.cheats, locks: {} };
  next.dynasty = s.dynasty;
  next.generation = s.generation + 1;
  // A family challenge passes to the heir along with everything else.
  if (s.challenge && CHALLENGE_BY_ID[s.challenge.id]?.spansGenerations)
    next.challenge = { ...s.challenge };
  next.nextNpcId = s.nextNpcId + 1;
  const oldId = s.nextNpcId;

  // The late player becomes an NPC: the heir's parent.
  const parentNpc: Npc = {
    id: oldId,
    first: old.first,
    last: old.last,
    gender: old.gender,
    age: s.death.age,
    birthYear: old.birthYear,
    alive: false,
    deathYear: s.death.year,
    deathCause: s.death.cause,
    roles: [old.gender === 'female' ? 'mother' : 'father'],
    rel: heir.rel,
    traits: old.traits.slice(0, 2),
    stats: {
      health: old.stats.health,
      smarts: old.stats.smarts,
      looks: old.stats.looks,
      happiness: old.stats.happiness,
    },
    job: s.career.history.at(-1)?.title ?? null,
    country: old.country,
    memory: [],
    flags: ['previous_generation'],
    parentIds: old.parentIds,
    lastContact: s.year,
    money: 0,
    attraction: old.attraction,
    fertility: 0,
  };
  const heirParents = heir.parentIds.map((p) => (p === PLAYER_ID ? oldId : p));
  const heirView = { ...heir, parentIds: heirParents };
  const npcs: Npc[] = [parentNpc];
  for (const n of s.npcs) {
    if (n.id === heir.id) continue;
    const roles = remapRoles(n, heirView, oldId);
    if (!roles) continue;
    const parentIds = n.parentIds.map((p) =>
      p === PLAYER_ID ? oldId : p === heir.id ? PLAYER_ID : p,
    );
    const copy: Npc = { ...n, roles, parentIds, memory: [], lastContact: s.year };
    delete copy.romance;
    if (roles[0] === 'sibling') copy.rel = clampStat(50 + rng.int(-10, 20));
    npcs.push(copy);
  }
  next.npcs = npcs;
  // The animals stay with the family.
  next.pets = s.pets.filter((x) => x.alive).map((x) => ({ ...x, lastPlay: s.year }));

  const c = COUNTRY_BY_ID[heir.country] ?? COUNTRY_BY_ID[old.country];
  const p = next.player;
  p.first = heir.first;
  p.last = heir.last;
  p.gender = heir.gender;
  p.attraction = heir.attraction;
  // The heir keeps the face they had as your child.
  p.look = npcLook(s, heir);
  p.appearance = toneOf(p.look);
  p.age = heir.age;
  p.birthYear = heir.birthYear;
  p.birthCountry = old.country;
  p.birthCity = old.city;
  p.country = c?.id ?? old.country;
  p.city = c?.cities.includes(old.city) ? old.city : (c?.cities[0] ?? old.city);
  p.parentIds = heirParents;
  p.traits = heir.traits.filter((t) => TRAIT_BY_ID[t]);
  const ctx = new Ctx(next);
  if (p.traits.length < 2)
    for (const t of randomTraits(ctx, 4))
      if (
        p.traits.length < 2 &&
        !p.traits.includes(t) &&
        !p.traits.some((x) => TRAIT_BY_ID[x]?.excludes.includes(t))
      )
        p.traits.push(t);
  p.stats = {
    ...p.stats,
    happiness: clampStat(heir.stats.happiness - 10),
    health: heir.stats.health,
    smarts: heir.stats.smarts,
    looks: heir.stats.looks,
    fertility: 50,
    stress: 30,
  };
  p.genes = {
    looks: heir.stats.looks,
    smarts: Math.max(heir.stats.smarts, 40),
    health: Math.max(heir.stats.health, 60),
  };
  for (const lang of c?.languages ?? []) p.languages[lang] = lang === c?.languages[0] ? 100 : 40;
  for (const [lang, lvl] of Object.entries(old.languages))
    if (lvl >= 50 && !(lang in p.languages)) p.languages[lang] = 50;
  p.wealth = heir.money > 1_000_000 ? 'rich' : heir.money > 100_000 ? 'comfortable' : 'middle';
  next.money.cash = Math.max(0, Math.round(heir.money));
  // The heir's school record, consistent with the GPA the diploma shows.
  next.education.grade = clampStat(60 + (heir.stats.smarts - 50) * 0.8);
  if (p.age >= 18) {
    next.education.degrees.push({
      level: 'high_school',
      field: 'general',
      gpa: Math.round((next.education.grade / 25) * 100) / 100,
      year: s.year - (p.age - 18),
    });
    next.assets.housing = 'renting';
  }
  next.lifeId = `${input.lifeId.replace(/-g\d+$/, '').slice(0, 50)}-g${next.generation}`;
  ctx.log(
    'family',
    `You are ${p.first} ${p.last}, ${p.age}, and the family story is yours now. ${parentNpc.first} is gone, but not forgotten.`,
    true,
  );
  if (next.money.cash > 0)
    ctx.log(
      'money',
      `Your share of ${parentNpc.first}’s estate arrives: ${formatMoney(next, next.money.cash)}.`,
    );
  // An adult heir already had a working life; they keep it.
  const link = heir.job ? PARENT_JOB_LINK[heir.job] : undefined;
  if (link && p.age >= 22 && p.age < 66) {
    takeOverJob(ctx, link[0], link[1]);
    const title = lowerTitle(next.career.history.at(-1)?.title ?? 'worker');
    ctx.log('work', `You still work as ${article(title)} ${title}. Monday comes whatever happens.`);
  }
  // What the heir already did in the years before (first words, school, a diploma) is credited quietly.
  for (const a of ACHIEVEMENTS)
    if (!p.achievements.includes(a.id) && a.check?.(next)) p.achievements.push(a.id);
  recordStatHistory(next);
  return ctx.finish().state;
}

/** Legacy score: achievements, wealth, fame, and family size across every generation (SPEC §5.15). */
export function legacyScore(gens: GenerationRecord[]): number {
  return Math.round(
    gens.reduce(
      (t, g) =>
        t +
        g.achievements * 10 +
        Math.log10(Math.max(1, g.netWorthRef)) * 20 +
        g.fame +
        g.children * 5,
      0,
    ),
  );
}
