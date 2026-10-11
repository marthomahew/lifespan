import { jobTier } from './npc-economy';
import { lowerTitle } from '../text';
import { pickFresh } from '../fresh';
import { COUNTRIES } from '../../content/countries';
import { jobExists, PARENT_JOBS } from '../../content/family';
import type { Ctx } from '../ctx';
import { formatMoney, money } from '../economy';
import { pronouns, relLabel } from '../npc';
import type { Npc } from '../types';
import { clampStat } from '../util';

/** At most this many pieces of other people's news a year, closest people first. */
export const MILESTONE_CAP = 3;

const FAMILY = ['mother', 'father', 'sibling', 'child', 'grandparent'] as const;
const NOT_WORKING = ['At school', 'At university', 'Retired', 'Unemployed'];

/** People whose news reaches you: family and friends you're on terms with. */
function matters(ctx: Ctx, n: Npc): boolean {
  const s = ctx.s;
  if (!n.alive || n.age < 18 || n.flags.includes('cut_off')) return false;
  if (s.family.custodyLost.includes(n.id)) return false;
  if (n.roles.some((r) => r === 'partner' || r === 'spouse' || r === 'ex' || r === 'enemy'))
    return false;
  if (n.roles.some((r) => (FAMILY as readonly string[]).includes(r))) return n.rel >= 15;
  return n.roles.includes('friend') ? n.rel >= 35 : n.rel >= 55;
}

const Cap = (t: string): string => t.charAt(0).toUpperCase() + t.slice(1);
const who = (n: Npc): string => `${Cap(relLabel(n))} ${n.first}`;
const working = (n: Npc): boolean => n.job !== null && !NOT_WORKING.includes(n.job);

type Milestone = {
  kind: string;
  /** Yearly chance when eligible. */
  chance: number;
  when: (ctx: Ctx, n: Npc) => boolean;
  /** Change the person and return the log line. */
  run: (ctx: Ctx, n: Npc) => string;
};

const MILESTONES: Milestone[] = [
  {
    kind: 'married',
    chance: 0.06,
    when: (_c, n) =>
      n.age >= 22 &&
      n.age <= 60 &&
      !n.flags.includes('npc_married') &&
      !n.roles.includes('mother') &&
      !n.roles.includes('father') &&
      !n.roles.includes('grandparent'),
    run: (ctx, n) => {
      n.flags.push('npc_married');
      n.flags = n.flags.filter((f) => f !== 'npc_divorced');
      n.stats.happiness = clampStat(n.stats.happiness + 15);
      n.rel = clampStat(n.rel + 2);
      return pickFresh(ctx, [
        `${who(n)} gets married in a barn with fairy lights. You cry at the vows and deny it at the buffet.`,
        `${who(n)} marries at the town hall on a Tuesday, then takes everyone for chips. It is perfect.`,
        `${who(n)} gets married. The speeches run long, the band runs out of songs, and nobody wants to leave.`,
      ]);
    },
  },
  {
    kind: 'divorced',
    chance: 0.015,
    when: (_c, n) => n.flags.includes('npc_married') && n.age < 70,
    run: (ctx, n) => {
      n.flags = n.flags.filter((f) => f !== 'npc_married');
      n.flags.push('npc_divorced');
      n.stats.happiness = clampStat(n.stats.happiness - 15);
      return pickFresh(ctx, [
        `${who(n)} is getting divorced. The phone call is long, and mostly quiet.`,
        `${who(n)}'s marriage ends. There is a lot of paperwork and one very sad dog.`,
      ]);
    },
  },
  {
    kind: 'job',
    chance: 0.02,
    // Bosses and coworkers are defined by the job you share: they don't drift off-stage.
    when: (_c, n) =>
      n.age >= 22 &&
      n.age <= 62 &&
      n.job !== 'At school' &&
      n.job !== 'Retired' &&
      !n.roles.includes('boss') &&
      !n.roles.includes('coworker') &&
      // A background's parent (the family business, the famous one) keeps that life.
      !n.flags.includes('business_parent') &&
      !n.flags.includes('famous_parent'),
    run: (ctx, n) => {
      const was = n.job;
      const left = n.flags.find((f) => f.startsWith('left_job:'))?.slice(9);
      // A fresh start at the same level of work (promotions are npc-careers' business).
      const tier = jobTier(was) ?? 'working';
      const pool = [...PARENT_JOBS[tier === 'poor' ? 'working' : tier]].filter(
        (j) => j !== was && j !== left && !NOT_WORKING.includes(j) && jobExists(j, ctx.s.year),
      );
      n.job = ctx.rng.pick(pool);
      n.flags = n.flags.filter((f) => !f.startsWith('left_job:'));
      if (was) n.flags.push(`left_job:${was}`);
      n.stats.happiness = clampStat(n.stats.happiness + 5);
      return was && working({ ...n, job: was })
        ? `${who(n)} leaves the job as ${withA(was)} and starts over as ${withA(n.job)}.`
        : `${who(n)} lands a job as ${withA(n.job)} and sends you a photo of the lanyard.`;
    },
  },
  {
    kind: 'promotion',
    chance: 0.04,
    when: (_c, n) => n.age >= 25 && n.age <= 62 && working(n),
    run: (ctx, n) => {
      n.money += money(ctx.s, ctx.rng.int(3000, 12000), 'wage');
      n.stats.happiness = clampStat(n.stats.happiness + 6);
      return pickFresh(ctx, [
        `${who(n)} gets promoted and is unbearable about it for exactly one dinner.`,
        `${who(n)} is made a manager and immediately buys a better coat.`,
      ]);
    },
  },
  {
    kind: 'moved',
    chance: 0.02,
    when: (ctx, n) =>
      n.age >= 20 &&
      n.age <= 70 &&
      n.country === ctx.s.player.country &&
      !n.flags.includes('moved_away'),
    run: (ctx, n) => {
      n.flags.push('moved_away');
      if (ctx.rng.chance(0.25)) {
        const abroad = COUNTRIES.filter((c) => c.id !== ctx.s.player.country);
        const c = ctx.rng.pick(abroad);
        n.country = c.id;
        return `${who(n)} moves to ${ctx.rng.pick(c.cities)}, ${c.name}. ${ctx.s.year >= 2005 ? 'The video calls start at strange hours.' : 'The phone calls start at strange hours.'}`;
      }
      const cities = COUNTRIES.find((c) => c.id === ctx.s.player.country)?.cities ?? [];
      const others = cities.filter((x) => x !== ctx.s.player.city);
      const city = others.length ? ctx.rng.pick(others) : 'the other side of the country';
      return ctx.s.legal.prison
        ? `${who(n)} moves to ${city}. You hear about it in a letter.`
        : `${who(n)} moves to ${city}. You help carry a sofa down four flights of stairs.`;
    },
  },
  {
    kind: 'baby',
    chance: 0.07,
    when: (ctx, n) =>
      n.age >= 24 &&
      n.age <= 42 &&
      !n.roles.includes('child') &&
      (n.roles.includes('sibling') || n.roles.includes('friend')) &&
      n.flags.filter((f) => f === 'npc_kid').length < 3 &&
      (n.flags.includes('npc_married') || ctx.rng.chance(0.3)),
    run: (ctx, n) => {
      n.flags.push('npc_kid');
      const baby = ctx.rng.pick([
        'a girl',
        'a boy',
        'twins',
        'a very loud boy',
        'a girl with a full head of hair',
      ]);
      return n.roles.includes('sibling')
        ? `${who(n)} has ${baby}. You are officially ${ctx.s.player.gender === 'male' ? 'an uncle' : ctx.s.player.gender === 'female' ? 'an aunt' : 'the cool relative'}, and you take the job seriously.`
        : `${who(n)} has ${baby}. The group chat fills with photos of something very small and very cross.`;
    },
  },
  {
    kind: 'health_scare',
    chance: 0.025,
    when: (_c, n) => n.age >= 45,
    run: (ctx, n) => {
      n.stats.health = clampStat(n.stats.health - ctx.rng.int(8, 18));
      return pickFresh(ctx, [
        `${who(n)} spends a week in hospital after a scare with ${pronouns(n.gender).their} heart. ${Cap(pronouns(n.gender).they)} ${n.gender === 'nonbinary' ? 'are' : 'is'} home now, and grumpy about the diet.`,
        ctx.s.legal.prison
          ? `${who(n)} has an operation that goes well. You hear on the prison phone, and are more relieved than you expected.`
          : `${who(n)} has an operation that goes well. You bring grapes; ${pronouns(n.gender).they} eat${n.gender === 'nonbinary' ? '' : 's'} all of them.`,
      ]);
    },
  },
  {
    kind: 'windfall',
    chance: 0.004,
    when: (_c, n) => n.age >= 21 && !n.flags.includes('npc_windfall'),
    run: (ctx, n) => {
      n.flags.push('npc_windfall');
      const amount = money(ctx.s, ctx.rng.int(20000, 200000));
      n.money += amount;
      n.stats.happiness = clampStat(n.stats.happiness + 10);
      return `${who(n)} comes into ${formatMoney(ctx.s, amount)} from a great-aunt nobody had met. ${Cap(pronouns(n.gender).they)} ${n.gender === 'nonbinary' ? 'buy' : 'buys'} a boat ${pronouns(n.gender).they} cannot steer.`;
    },
  },
];

function withA(job: string): string {
  const j = lowerTitle(job);
  return `${/^[aeiou]/i.test(j) ? 'an' : 'a'} ${j}`;
}

/** Yearly news from other people's lives (marriages, jobs, moves, babies...). Returns the kinds that happened. */
export function npcMilestones(ctx: Ctx): string[] {
  const s = ctx.s;
  // Other people's news is told the way a teen or adult hears it.
  if (s.player.age < 14) return [];
  // A cellmate's news reaches you face to face, not by photo; they're left out while you're inside.
  const people = s.npcs
    .filter((n) => matters(ctx, n) && !(s.legal.prison && n.roles.includes('cellmate')))
    .sort((a, b) => b.rel - a.rel || a.id - b.id);
  const happened: string[] = [];
  for (const n of people) {
    if (happened.length >= MILESTONE_CAP) break;
    for (const m of MILESTONES) {
      if (!m.when(ctx, n) || !ctx.rng.chance(m.chance)) continue;
      const line = m.run(ctx, n);
      ctx.log(n.roles.includes('friend') ? 'social' : 'family', line);
      happened.push(m.kind);
      // One piece of news per person per year.
      break;
    }
  }
  return happened;
}
