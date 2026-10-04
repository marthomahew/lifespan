import { PARENT_JOBS } from '../../content/family';
import type { Ctx } from '../ctx';
import { baseHazard, healthMultiplier } from '../mortality';
import { addNpc, remember } from '../npc';
import { money } from '../economy';
import { addStat } from '../stats';
import type { Npc } from '../types';
import { clampStat } from '../util';
import { inheritFrom } from './inheritance';
import { killNpc } from './partners';

const FAMILY = [
  'mother',
  'father',
  'sibling',
  'grandparent',
  'great_grandparent',
  'child',
  'grandchild',
  'spouse',
  'stepparent',
];
const CLOSE = [...FAMILY, 'partner'];
const isFamily = (n: Npc): boolean => n.roles.some((r) => FAMILY.includes(r));
const isClose = (n: Npc): boolean =>
  n.roles.some((r) => CLOSE.includes(r)) || (n.roles.includes('friend') && n.rel >= 40);

const DEATH_CAUSES_OLD = [
  'in their sleep',
  'after a short illness',
  'of heart failure',
  'peacefully, surrounded by family',
];
const DEATH_CAUSES_YOUNG = [
  'in a car accident',
  'after a sudden illness',
  'of a heart condition nobody knew about',
];

/** NPC deaths: the same mortality model, simplified (SPEC §5.1). */
function npcDeaths(ctx: Ctx): void {
  const s = ctx.s;
  for (const n of s.npcs) {
    if (!n.alive) continue;
    let q = baseHazard(n.age) * healthMultiplier(n.stats.health);
    if (n.age < 40) q = Math.min(q, 0.002);
    if (n.age >= 110) q = 1;
    if (!ctx.rng.chance(q)) continue;
    const cause = ctx.rng.pick(n.age >= 70 ? DEATH_CAUSES_OLD : DEATH_CAUSES_YOUNG);
    killNpc(
      ctx,
      n,
      cause.replace('their', n.gender === 'male' ? 'his' : n.gender === 'female' ? 'her' : 'their'),
    );
    if (isClose(n)) {
      ctx.log(
        'family',
        `${n.first} ${n.last} dies ${n.deathCause ?? ''}, aged ${n.age}.`.replace(/\s+,/, ','),
        true,
      );
      addStat(s, 'happiness', -(isFamily(n) ? ctx.rng.int(6, 15) : ctx.rng.int(3, 7)));
      addStat(s, 'stress', 4);
    }
    inheritFrom(ctx, n);
    if (n.roles.includes('spouse')) {
      n.flags.push('was_spouse');
      if (!s.player.flags.includes('widowed')) s.player.flags.push('widowed');
    }
  }
}

/** Younger siblings, grandchildren, and great-grandchildren arrive over the years. */
function npcBirths(ctx: Ctx): void {
  const s = ctx.s;
  const r = ctx.rng;
  const mother = s.npcs.find((n) => n.alive && n.roles.includes('mother'));
  const father = s.npcs.find((n) => n.alive && n.roles.includes('father'));
  const sibs = s.npcs.filter((n) => n.roles.includes('sibling')).length;
  if (
    mother &&
    father &&
    mother.age <= 43 &&
    s.player.age < 16 &&
    sibs < 4 &&
    !mother.flags.includes('parents_split') &&
    r.chance(0.07)
  ) {
    const kid = addNpc(ctx, {
      role: 'sibling',
      age: 0,
      last: s.player.last,
      rel: r.int(55, 80),
      parentIds: [mother.id, father.id],
    });
    ctx.log(
      'family',
      `A new ${kid.gender === 'male' ? 'brother' : kid.gender === 'female' ? 'sister' : 'sibling'} arrives: ${kid.first}.`,
      true,
    );
  }
  // Descendants: adult children and grandchildren have kids of their own.
  for (const parent of s.npcs.filter(
    (n) =>
      n.alive &&
      (n.roles.includes('child') || n.roles.includes('grandchild')) &&
      n.age >= 23 &&
      n.age <= 42,
  )) {
    const kids = s.npcs.filter((k) => k.parentIds.includes(parent.id)).length;
    if (kids >= 3 || !r.chance(0.07)) continue;
    const baby = addNpc(ctx, {
      role: 'grandchild',
      age: 0,
      last: parent.last,
      rel: r.int(60, 90),
      parentIds: [parent.id],
    });
    const great = parent.roles.includes('grandchild');
    if (great) baby.flags.push('great_grandchild');
    ctx.log(
      'family',
      `${parent.first} has a baby, ${baby.first}. You are a ${great ? 'great-' : ''}grandparent${kids ? ' again' : ''}.`,
      true,
    );
    addStat(s, 'happiness', 5);
  }
}

/** Age every NPC, drift their stats, and update what they're doing. */
function npcAging(ctx: Ctx): void {
  const s = ctx.s;
  const r = ctx.rng;
  for (const n of s.npcs) {
    if (!n.alive) continue;
    n.age = s.year - n.birthYear;
    n.stats.health = clampStat(
      n.stats.health -
        (n.age > 60 ? r.int(0, 3) : n.age > 35 ? r.int(0, 1) : 0) +
        (n.age < 30 ? r.int(0, 1) : 0),
    );
    n.stats.happiness = clampStat(n.stats.happiness + r.int(-3, 3));
    if (
      n.roles.includes('child') ||
      n.roles.includes('grandchild') ||
      n.roles.includes('sibling')
    ) {
      if (n.age === 5) n.job = 'At school';
      else if (n.age === 18 && n.roles.includes('child')) {
        n.job = r.chance(0.5) ? 'At university' : r.pick(PARENT_JOBS.working);
        ctx.log('family', `${n.first} turns 18 and moves out, taking most of your mugs.`);
      } else if (n.age === 22 && n.job === 'At university') n.job = r.pick(PARENT_JOBS.middle);
    }
    if (n.age === 66 && n.job && !['At school', 'At university'].includes(n.job)) n.job = 'Retired';
    n.fertility = clampStat(n.age > 45 ? n.fertility - 4 : n.fertility);
    // Savings keep pace with prices, and working adults put a little away.
    n.money = Math.round(
      n.money * 1.025 +
        (n.age >= 22 && n.age < 66 && n.job && !['At school', 'At university'].includes(n.job)
          ? money(s, 1500, 'wage')
          : 0),
    );
  }
}

/** Friendships fade without contact (3–6 a year); family more slowly (SPEC §5.1). */
export function relationshipDecay(ctx: Ctx): void {
  const s = ctx.s;
  const r = ctx.rng;
  for (const n of s.npcs) {
    if (!n.alive || n.flags.includes('cut_off')) continue;
    if (n.lastContact >= s.year - 1) continue;
    if (n.roles.includes('enemy')) {
      n.rel = clampStat(n.rel + (n.rel < 25 ? 1 : -1));
    } else if (
      n.roles.includes('friend') ||
      n.roles.includes('classmate') ||
      n.roles.includes('coworker')
    ) {
      n.rel = clampStat(n.rel - r.int(3, 6));
    } else if (n.roles.includes('partner') || n.roles.includes('spouse')) {
      n.rel = clampStat(n.rel - r.int(1, 4));
    } else if (isFamily(n)) {
      n.rel = clampStat(n.rel - r.int(0, 2));
    } else n.rel = clampStat(n.rel - r.int(2, 5));
  }
}

/** School brings classmates; some become friends (SPEC §5.1, M5.4). */
function schoolFriends(ctx: Ctx): void {
  const s = ctx.s;
  const r = ctx.rng;
  const age = s.player.age;
  const inSchool = age >= 5 && age <= 17 && !s.education.droppedOut && !s.legal.prison;
  const classmates = s.npcs.filter((n) => n.alive && n.roles.includes('classmate'));
  if (inSchool && classmates.length < 6 && r.chance(0.55)) {
    const n = addNpc(ctx, {
      role: 'classmate',
      age: Math.max(4, age + r.int(-1, 1)),
      rel: r.int(30, 60),
    });
    ctx.log('school', `${n.first} ${n.last} joins your class and sits next to you.`);
  }
  for (const n of classmates) {
    if (!n.roles.includes('friend') && n.rel >= 60 && r.chance(0.5)) {
      n.roles.push('friend');
      remember(s, n, 'becoming friends at school', 5);
      ctx.log(
        'social',
        `You and ${n.first} are friends now. It happened somewhere between lunch and detention.`,
      );
    }
    // Shared classes count as contact, and people you see every day grow on you (or don't).
    if (inSchool) {
      n.lastContact = s.year;
      n.rel = clampStat(n.rel + r.int(-3, 7));
    }
  }
  // Coworkers you get on with become friends too.
  for (const n of s.npcs.filter(
    (x) => x.alive && x.roles.includes('coworker') && !x.roles.includes('friend'),
  )) {
    if (n.rel >= 65 && r.chance(0.35)) {
      n.roles.push('friend');
      remember(s, n, 'becoming friends at work', 4);
      ctx.log('social', `${n.first} from work is officially a friend: you have a group chat.`);
    }
  }
}

/** Keep the cast manageable: drop faded acquaintances nobody needs any more. */
function pruneNpcs(ctx: Ctx): void {
  const s = ctx.s;
  const bound = new Set<number>();
  for (const p of s.pending) for (const id of Object.values(p.bindings)) bound.add(id);
  for (const c of s.chains) for (const id of Object.values(c.bindings)) bound.add(id);
  for (const h of s.will.heirs) bound.add(h.npcId);
  for (const a of s.money.alimony) bound.add(a.npcId);
  const parents = new Set(s.npcs.flatMap((n) => n.parentIds));
  s.npcs = s.npcs.filter((n) => {
    if (bound.has(n.id) || parents.has(n.id) || isFamily(n) || n.roles.includes('partner'))
      return true;
    if (n.flags.includes('was_spouse')) return true;
    if (!n.alive) return s.year - (n.deathYear ?? s.year) < 5;
    const stale = s.year - n.lastContact;
    if (n.roles.includes('friend')) {
      if (n.rel <= 8 && stale >= 4) {
        n.roles = n.roles.filter((r) => r !== 'friend');
        if (!n.roles.length) n.roles.push('acquaintance');
      }
      return true;
    }
    if (n.roles.includes('classmate') && s.player.age > 18 && n.rel < 50) return false;
    if (n.roles.includes('acquaintance') && stale > 6) return false;
    if (n.roles.includes('ex') && stale > 15 && n.rel < 30) return false;
    return true;
  });
}

/** Step 4 of the year: the NPC lifecycle. */
export function npcLifecycle(ctx: Ctx): void {
  npcAging(ctx);
  npcDeaths(ctx);
  npcBirths(ctx);
  schoolFriends(ctx);
  pruneNpcs(ctx);
}
