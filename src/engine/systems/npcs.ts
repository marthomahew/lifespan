import { pickFreshTemplate } from '../fresh';
import type { Ctx } from '../ctx';
import { baseHazard, healthMultiplier } from '../mortality';
import { addNpc, relLabel, remember } from '../npc';
import { money } from '../economy';
import { addStat, fertilityBaseline } from '../stats';
import type { Npc } from '../types';
import { clampStat } from '../util';
import { inheritFrom } from './inheritance';
import { killNpc } from './partners';
import { npcMilestones } from './npc-lives';

const FAMILY = [
  'mother',
  'father',
  'sibling',
  'grandparent',
  'great_grandparent',
  'child',
  'grandchild',
  'nibling',
  'aunt_uncle',
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
      // Who they were to you, first: "Your husband Tom Reyes dies…".
      const who = relLabel(n);
      ctx.log(
        'family',
        `${who.charAt(0).toUpperCase()}${who.slice(1)} ${n.first} ${n.last} dies ${n.deathCause ?? ''}, aged ${n.age}.`.replace(
          /\s+,/,
          ',',
        ),
        true,
      );
      const partner = n.roles.includes('spouse') || n.roles.includes('partner');
      addStat(
        s,
        'happiness',
        -(partner ? ctx.rng.int(18, 28) : isFamily(n) ? ctx.rng.int(6, 15) : ctx.rng.int(3, 7)),
      );
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
    !mother.flags.includes('absent_parent') &&
    !father.flags.includes('absent_parent') &&
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
      else if (n.age === 18 && n.roles.includes('child'))
        ctx.log('family', `${n.first} turns 18 and moves out, taking most of your mugs.`);
    }
    // (Leaving school, work, promotions and retirement: npc-careers.)
    // Women's fertility follows the same curve as the player's and ends in the mid-forties.
    n.fertility = clampStat(
      n.gender === 'female'
        ? n.age > 46
          ? 0
          : Math.min(n.fertility, fertilityBaseline(n.age, 'female') + 10)
        : n.age > 45
          ? n.fertility - 4
          : n.fertility,
    );
    // Savings keep pace with prices, and working adults put a little away (the people whose
    // finances npc-economy follows do their saving there).
    if (n.pay === undefined)
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
    // Distance makes it harder: people who moved away fade a little faster.
    if (n.flags.includes('moved_away') && !n.roles.includes('enemy')) n.rel = clampStat(n.rel - 1);
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
    ctx.log(
      'school',
      pickFreshTemplate(
        ctx,
        [
          '{n} joins your class and sits next to you.',
          'A new kid, {n}, arrives mid-term with a lunchbox shaped like a bus.',
          '{n} transfers in and is seated next to you because of the alphabet.',
          'The teacher introduces {n}, who waves at the wrong half of the room.',
          '{n} starts at your school and immediately knows where everything is.',
        ],
        `${n.first} ${n.last}`,
      ),
    );
  }
  for (const n of classmates) {
    if (!n.roles.includes('friend') && n.rel >= 60 && r.chance(0.5)) {
      n.roles.push('friend');
      remember(s, n, 'becoming friends at school', 5);
      ctx.log(
        'social',
        pickFreshTemplate(
          ctx,
          [
            'You and {n} are friends now. It happened somewhere between lunch and detention.',
            '{n} saves you a seat three days running. That settles it: friends.',
            'You and {n} invent a secret handshake with eleven steps. Friendship is official.',
            '{n} shares the good crisps with you. Nobody shares the good crisps.',
            'You and {n} get told off for talking in class, together. A friendship is born.',
          ],
          n.first,
        ),
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
  npcMilestones(ctx);
  pruneNpcs(ctx);
}
