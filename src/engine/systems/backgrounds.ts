import { BACKGROUND_BY_ID } from '../../content/backgrounds';
import { BUSINESS_BY_ID } from '../../content/businesses';
import { COUNTRIES, COUNTRY_BY_ID } from '../../content/countries';
import type { Ctx } from '../ctx';
import { formatMoney, money } from '../economy';
import { addNpc } from '../npc';
import type { GameState, Npc } from '../types';
import { clampStat } from '../util';

const FAMILY_KINDS = ['cafe', 'shop', 'restaurant', 'farm', 'builders', 'firm'];
const FAMOUS_JOBS = ['Actor', 'Singer', 'Television presenter', 'Footballer', 'Novelist'];

export const backgroundOf = (s: GameState): string | null => s.player.background ?? null;
const parents = (s: GameState): Npc[] =>
  s.npcs.filter((n) => n.roles.includes('mother') || n.roles.includes('father'));

/** Set up a background at birth (after the family is generated). */
export function setupBackground(ctx: Ctx, id: string): void {
  const s = ctx.s;
  const p = s.player;
  if (!BACKGROUND_BY_ID[id]) return;
  p.background = id;
  const data: Record<string, string> = {};
  const ps = parents(s).filter((n) => !n.flags.includes('absent_parent'));
  const one = ctx.rng.pick(ps.length ? ps : parents(s));
  switch (id) {
    case 'family_business': {
      const kind = ctx.rng.pick(FAMILY_KINDS);
      const k = BUSINESS_BY_ID[kind];
      data['kind'] = kind;
      data['business'] = (ctx.rng.pick(k?.names ?? ['{last}’s']) ?? '').replace('{last}', p.last);
      if (one) {
        one.flags.push('business_parent');
        one.job = `Runs ${data['business']}`;
      }
      break;
    }
    case 'pushy_parents':
      for (const n of ps) n.flags.push('pushy_parent');
      break;
    case 'famous_parent':
      if (one) {
        one.flags.push('famous_parent');
        one.job = ctx.rng.pick(FAMOUS_JOBS);
        data['job'] = one.job.toLowerCase();
      }
      p.stats.fame = Math.max(p.stats.fame, 15);
      break;
    case 'moving_family':
      if (one) {
        one.flags.push('mover_parent');
        one.job = ctx.rng.pick(['Diplomat', 'Army officer', 'Oil engineer']);
      }
      break;
    case 'immigrant_family': {
      const from = ctx.rng.pick(COUNTRIES.filter((c) => c.id !== p.country));
      data['heritage'] = from.id;
      for (const n of s.npcs)
        if (n.roles.some((r) => r === 'mother' || r === 'father' || r === 'grandparent'))
          n.country = from.id;
      for (const n of ps) n.flags.push('heritage_parent');
      const lang = from.languages[0];
      if (lang) p.languages[lang] = Math.max(p.languages[lang] ?? 0, 60);
      break;
    }
    case 'grandparents': {
      for (const n of parents(s)) {
        if (!n.flags.includes('absent_parent')) n.flags.push('absent_parent');
        n.rel = Math.min(n.rel, 25);
      }
      const living = s.npcs.filter((n) => n.alive && n.roles.includes('grandparent'));
      const gp = living.sort((a, b) => a.age - b.age)[0];
      if (gp) {
        gp.flags.push('raising_grandparent');
        gp.rel = 92;
      }
      break;
    }
    case 'twin': {
      const twin = addNpc(ctx, {
        role: 'sibling',
        age: 0,
        last: p.last,
        rel: 85,
        parentIds: [...p.parentIds],
      });
      twin.flags.push('twin');
      data['twin'] = twin.first;
      break;
    }
    case 'adopted':
      p.flags.push('adopted');
      break;
  }
  p.backgroundData = data;
}

/** Text for a background's token: {fambiz}, {heritage}. */
export function backgroundToken(s: GameState, token: string): string | null {
  const d = s.player.backgroundData ?? {};
  if (token === 'fambiz') return d['business'] ?? null;
  if (token === 'heritage') return COUNTRY_BY_ID[d['heritage'] ?? '']?.name ?? null;
  return null;
}

/** System effects from background events. */
export function backgroundEffect(ctx: Ctx, kind: string): void {
  const s = ctx.s;
  const d = s.player.backgroundData ?? {};
  if (kind === 'take_fambiz') {
    // The family business becomes yours to run: a going concern, a few levels in.
    const k = BUSINESS_BY_ID[d['kind'] ?? 'shop'];
    if (!k || s.business) return;
    s.business = {
      kind: k.id,
      name: d['business'] ?? `${s.player.last}’s`,
      founded: s.year,
      country: s.player.country,
      level: 2,
      health: 60,
      value: money(s, k.startCost * 1.5, 'wage'),
      lastProfit: 0,
      hands: s.career.jobId ? 'manager' : 'self',
    };
    if (!s.player.flags.includes('founded_business')) s.player.flags.push('founded_business');
    ctx.log('work', `${k.emoji} ${s.business.name} is yours now.`, true);
  } else if (kind === 'sell_fambiz') {
    const k = BUSINESS_BY_ID[d['kind'] ?? 'shop'];
    const share = money(s, (k?.startCost ?? 50000) * 0.8, 'wage');
    s.money.cash += share;
    ctx.log('money', `Your share of the sale: ${formatMoney(s, share)}.`);
  } else if (kind === 'birth_parent') {
    const n = addNpc(ctx, {
      role: 'acquaintance',
      gender: 'female',
      age: clampStat(s.player.age + ctx.rng.int(17, 30)),
      rel: 45,
    });
    n.flags.push('birth_parent');
    ctx.log('family', `${n.first} is your birth mother.`, true);
  }
}

/** The line in the birth log that tells you where you're starting. */
export const BACKGROUND_LINES: Record<string, (s: GameState) => string> = {
  family_business: (s) =>
    `🏪 Your family runs ${backgroundToken(s, 'fambiz') ?? 'a business'}, and you are born into it.`,
  pushy_parents: () => '📋 Your parents already have plans for you. Big ones.',
  famous_parent: (s) => {
    const n = s.npcs.find((x) => x.flags.includes('famous_parent'));
    return `🌟 Your ${n?.roles.includes('mother') ? 'mother' : 'father'} is a famous ${s.player.backgroundData?.['job'] ?? 'star'}. There are photographers at the hospital.`;
  },
  moving_family: () =>
    '📦 Your family never stays anywhere long. The boxes are never quite unpacked.',
  immigrant_family: (s) =>
    `🧳 Your parents came here from ${backgroundToken(s, 'heritage') ?? 'far away'}. You will grow up with two languages.`,
  grandparents: (s) => {
    const n = s.npcs.find((x) => x.flags.includes('raising_grandparent'));
    return `👵 Your parents can’t look after you. ${n ? `Your ${n.gender === 'male' ? 'grandfather' : 'grandmother'} ${n.first}` : 'A grandparent'} takes you home instead.`;
  },
  twin: (s) =>
    `👯 You are not alone: your twin, ${s.player.backgroundData?.['twin'] ?? 'your twin'}, arrives eleven minutes later.`,
  adopted: () => '🏡 You are adopted as a baby, into a family that very much wanted you.',
};
