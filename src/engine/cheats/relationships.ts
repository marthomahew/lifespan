import { TRAIT_BY_ID } from '../../content/traits';
import type { Ctx } from '../ctx';
import { addNpc, remember } from '../npc';
import { addChild, divorce, marry } from '../systems/romance';
import { partnerGender, partnerOf } from '../systems/partners';
import type { Npc, Role } from '../types';
import { clampStat } from '../util';
import type { CheatDef } from './types';
import { npcOptions, traitOptions } from './options';

const npcParam = { name: 'id', type: 'enum', options: npcOptions } as const;

function npc(ctx: Ctx, id: unknown): Npc {
  const n = ctx.s.npcs.find((x) => String(x.id) === String(id));
  if (!n) throw new Error(`no NPC ${String(id)}`);
  return n;
}

const RELATIVES = [
  'mother',
  'father',
  'sibling',
  'grandparent',
  'child',
  'grandchild',
  'stepparent',
];
const isRelative = (n: Npc): boolean => n.roles.some((r) => RELATIVES.includes(r));

const SPAWN_ROLES = [
  'friend',
  'partner',
  'spouse',
  'child',
  'sibling',
  'mother',
  'father',
  'enemy',
  'coworker',
];

export const RELATIONSHIP_CHEATS: CheatDef[] = [
  {
    id: 'npc.list',
    readOnly: true,
    group: 'relationships',
    label: 'List NPCs',
    syntax: 'npcs',
    help: 'List everyone in your life with their ids.',
    params: [],
    run: (ctx) =>
      ctx.s.npcs
        .map(
          (n) =>
            `${n.id}: ${n.first} ${n.last}, ${n.roles.join('/')}, ${n.age}${n.alive ? '' : ' (dead)'}, rel ${n.rel}`,
        )
        .join('\n') || 'Nobody yet',
  },
  {
    id: 'npc.rel',
    group: 'relationships',
    label: 'Set relationship',
    syntax: 'npc {id} rel {value}',
    help: 'Set how an NPC feels about you (0–100). Example: npc 12 rel 100',
    params: [npcParam, { name: 'value', type: 'int', min: 0, max: 100 }],
    run: (ctx, p) => {
      const n = npc(ctx, p['id']);
      n.rel = clampStat(Number(p['value']));
      return `${n.first}: ${n.rel}`;
    },
  },
  {
    id: 'npc.kill',
    group: 'relationships',
    label: 'Kill an NPC',
    syntax: 'npc {id} kill',
    help: 'They die. No questions.',
    params: [npcParam],
    run: (ctx, p) => {
      const n = npc(ctx, p['id']);
      n.alive = false;
      n.deathYear = ctx.s.year;
      n.deathCause = 'a cheat';
      return `${n.first} is dead`;
    },
  },
  {
    id: 'npc.revive',
    group: 'relationships',
    label: 'Revive an NPC',
    syntax: 'npc {id} revive',
    help: 'Bring someone back, aged as if they never left.',
    params: [npcParam],
    run: (ctx, p) => {
      const n = npc(ctx, p['id']);
      n.alive = true;
      delete n.deathYear;
      delete n.deathCause;
      n.age = Math.min(119, ctx.s.year - n.birthYear);
      n.stats.health = Math.max(n.stats.health, 60);
      return `${n.first} is back`;
    },
  },
  {
    id: 'npc.spawn',
    group: 'relationships',
    label: 'Spawn an NPC by role',
    syntax: 'spawn {role} {traits}',
    help: 'Add a friend, partner, spouse, child, sibling, parent, enemy, or coworker. Traits are comma-separated.',
    params: [
      {
        name: 'role',
        type: 'enum',
        options: () => SPAWN_ROLES.map((r) => ({ value: r, label: r })),
      },
      { name: 'traits', type: 'string', optional: true },
    ],
    run: (ctx, p) => {
      const s = ctx.s;
      const role = String(p['role']) as Role;
      const traits = String(p['traits'] ?? '')
        .split(',')
        .map((t) => t.trim())
        .filter((t) => TRAIT_BY_ID[t]);
      if ((role === 'partner' || role === 'spouse') && s.player.age < 18)
        return 'Partners are for adults only';
      if (role === 'child') {
        if (s.player.age < 18) return 'Only adults can have children';
        const kid = addChild(ctx, partnerOf(s), false);
        if (traits.length) kid.traits = traits.slice(0, 3);
        return `Spawned ${kid.first} (${kid.id})`;
      }
      const age =
        role === 'mother' || role === 'father'
          ? s.player.age + ctx.rng.int(20, 35)
          : role === 'partner' || role === 'spouse'
            ? Math.max(18, s.player.age + ctx.rng.int(-4, 4))
            : Math.max(1, s.player.age + ctx.rng.int(-3, 3));
      if ((role === 'partner' || role === 'spouse') && partnerOf(s))
        return 'You already have a partner';
      const gender =
        role === 'mother'
          ? 'female'
          : role === 'father'
            ? 'male'
            : role === 'partner' || role === 'spouse'
              ? partnerGender(ctx)
              : undefined;
      const n = addNpc(ctx, {
        role,
        age,
        rel: ctx.rng.int(55, 85),
        ...(gender ? { gender } : {}),
        ...(traits.length ? { traits } : {}),
      });
      if (role === 'partner') n.romance = { stage: 'dating', since: s.year, prenup: false };
      if (role === 'spouse') marry(ctx, n, false);
      return `Spawned ${n.first} ${n.last} (${n.id})`;
    },
  },
  {
    id: 'romance.force',
    group: 'relationships',
    label: 'Force romantic interest',
    syntax: 'romance {id}',
    help: 'An adult NPC falls for you and you start dating (adults only).',
    params: [npcParam],
    run: (ctx, p) => {
      const n = npc(ctx, p['id']);
      if (ctx.s.player.age < 18 || n.age < 18) return 'Adults only';
      if (isRelative(n)) return 'Not with family';
      if (!n.alive) return `${n.first} is dead`;
      const cur = partnerOf(ctx.s);
      if (cur && cur.id !== n.id) return `You're with ${cur.first}`;
      if (!n.roles.includes('partner') && !n.roles.includes('spouse')) n.roles.unshift('partner');
      n.romance ??= { stage: 'dating', since: ctx.s.year, prenup: false };
      remember(ctx.s, n, 'the sudden spark', 20);
      return `${n.first} is smitten`;
    },
  },
  {
    id: 'marry.now',
    group: 'relationships',
    label: 'Instant marriage',
    syntax: 'marry {id}',
    help: 'Marry an adult NPC right now (adults only).',
    params: [npcParam],
    run: (ctx, p) => {
      const n = npc(ctx, p['id']);
      if (ctx.s.player.age < 18 || n.age < 18) return 'Adults only';
      if (isRelative(n)) return 'Not with family';
      const cur = partnerOf(ctx.s);
      if (cur && cur.id !== n.id) return `You're with ${cur.first}`;
      marry(ctx, n, false);
      ctx.log('romance', `🎩 You and ${n.first} are married. Nobody remembers the ceremony.`, true);
      return `Married ${n.first}`;
    },
  },
  {
    id: 'divorce.now',
    group: 'relationships',
    label: 'Instant divorce',
    syntax: 'divorce now',
    help: 'End your marriage immediately (assets split as usual).',
    params: [],
    run: (ctx) => {
      const sp = ctx.s.npcs.find((n) => n.alive && n.roles.includes('spouse'));
      if (!sp) return 'You are not married';
      divorce(ctx, sp);
      return `Divorced ${sp.first}`;
    },
  },
  {
    id: 'baby.now',
    group: 'relationships',
    label: 'Have a baby now',
    syntax: 'baby now',
    help: 'A baby arrives today (adults only).',
    params: [],
    run: (ctx) => {
      if (ctx.s.player.age < 18) return 'Adults only';
      const kid = addChild(ctx, partnerOf(ctx.s), false);
      ctx.log('family', `🎩 ${kid.first} arrives, ahead of schedule by about nine months.`, true);
      return `Welcome, ${kid.first}`;
    },
  },
  {
    id: 'npc.stat',
    group: 'relationships',
    label: 'Edit NPC stats',
    syntax: 'npc {id} stat {stat} {value}',
    help: "Set an NPC's health, happiness, smarts, or looks.",
    params: [
      npcParam,
      {
        name: 'stat',
        type: 'enum',
        options: () =>
          ['health', 'happiness', 'smarts', 'looks'].map((k) => ({ value: k, label: k })),
      },
      { name: 'value', type: 'int', min: 0, max: 100 },
    ],
    run: (ctx, p) => {
      const n = npc(ctx, p['id']);
      const k = String(p['stat']) as keyof Npc['stats'];
      n.stats[k] = clampStat(Number(p['value']));
      return `${n.first} ${k}: ${n.stats[k]}`;
    },
  },
  {
    id: 'npc.trait',
    group: 'relationships',
    label: 'Toggle an NPC trait',
    syntax: 'npc {id} trait {trait}',
    help: 'Add a trait to an NPC, or remove it if they have it.',
    params: [npcParam, { name: 'trait', type: 'enum', options: traitOptions }],
    run: (ctx, p) => {
      const n = npc(ctx, p['id']);
      const t = String(p['trait']);
      n.traits = n.traits.includes(t)
        ? n.traits.filter((x) => x !== t)
        : [...n.traits.filter((x) => !TRAIT_BY_ID[t]?.excludes.includes(x)), t];
      return `${n.first}: ${n.traits.join(', ')}`;
    },
  },
];
