import type { Ctx } from '../ctx';
import { countryOf, formatMoney, money } from '../economy';
import { EngineError } from '../errors';
import { netWorthRef } from '../networth';
import { addStat } from '../stats';
import type { GameState } from '../types';
import { workTime } from './activities';
import { addLoan } from './loans';
import { markUsed, usedThisYear } from './usage';

/**
 * Making ends meet: what people do when money is tight. Open while you're short (net worth
 * under $25,000 in today's money, or cash under $2,000); each is once a year.
 */
export type HustleId = 'gig' | 'plasma' | 'food_bank' | 'payday' | 'ask_family';
export type Hustle = { id: HustleId; label: string; emoji: string; blurb: string };

export const HUSTLES: Hustle[] = [
  {
    id: 'gig',
    label: 'Pick up gig work',
    emoji: '🛵',
    blurb:
      'Deliveries and rides on your own time (odd jobs before the apps). Uses a work-time pip.',
  },
  {
    id: 'plasma',
    label: 'Sell plasma',
    emoji: '🩸',
    blurb: 'Twice a week at the clinic by the bus station. A little money, a little woozy.',
  },
  {
    id: 'food_bank',
    label: 'Use the food bank',
    emoji: '🥫',
    blurb: 'A box of tins, pasta and something unexpected. It stretches the money for weeks.',
  },
  {
    id: 'payday',
    label: 'Take a payday loan',
    emoji: '💸',
    blurb: '$1,000 today, at an interest rate that should be illegal (and is, in some places).',
  },
  {
    id: 'ask_family',
    label: 'Ask family for help',
    emoji: '🤲',
    blurb: 'Swallow your pride and ask. They may help; they may also have opinions.',
  },
];

/** Money is tight: the options here are open. */
export function strapped(s: GameState): boolean {
  return netWorthRef(s) < 25000 || s.money.cash < money(s, 2000);
}

export function hustleReason(s: GameState, id: HustleId): string | null {
  if (s.death) return 'the life is over';
  if (s.legal.prison) return 'not from prison';
  if (s.player.age < 18) return 'from age 18';
  if (!strapped(s)) return 'only when money is tight';
  if (usedThisYear(s, `h:${id}`) > 0) return 'done this year';
  if (id === 'gig' && s.settings.freeTime !== false && workTime(s).left <= 0)
    return 'no work time left this year';
  if (id === 'plasma' && s.player.stats.health < 40) return 'not well enough';
  if (id === 'ask_family' && !family(s).length) return 'no family to ask';
  return null;
}

const family = (s: GameState) =>
  s.npcs.filter(
    (n) =>
      n.alive && n.roles.some((r) => ['mother', 'father', 'sibling', 'grandparent'].includes(r)),
  );

export function doHustle(ctx: Ctx, id: HustleId): void {
  const s = ctx.s;
  const why = hustleReason(s, id);
  if (why) throw new EngineError(why);
  markUsed(s, `h:${id}`);
  const c = countryOf(s);
  if (id === 'gig') {
    markUsed(s, 'w:total');
    const pay = money(s, ctx.rng.int(3000, 9000), 'wage');
    s.money.cash += pay;
    addStat(s, 'stress', 4);
    ctx.log(
      'money',
      s.year >= 2012
        ? `🛵 Evenings and weekends delivering dinners and driving strangers home: ${formatMoney(s, pay)} this year, and a sore back.`
        : `🔧 Odd jobs all year: gardens, removals, a fence or two. ${formatMoney(s, pay)}, cash in hand.`,
    );
  } else if (id === 'plasma') {
    const pay = money(s, 2400, 'wage');
    s.money.cash += pay;
    addStat(s, 'health', -1);
    ctx.log(
      'money',
      `🩸 A year of plasma donations at the clinic: ${formatMoney(s, pay)} and a lot of free orange juice.`,
    );
  } else if (id === 'food_bank') {
    const saved = money(s, 1500);
    s.money.cash += saved;
    addStat(s, 'happiness', -1);
    ctx.log(
      'money',
      `🥫 The volunteers at the food bank are kind and don’t ask questions. It saves you about ${formatMoney(s, saved)} this year.`,
    );
  } else if (id === 'payday') {
    const amt = money(s, 1000);
    s.money.cash += amt;
    // Repaid over a year at a crushing rate.
    addLoan(s, 'debt', amt, c.id === 'us' ? 3.0 : 1.0, 1);
    addStat(s, 'stress', 6);
    ctx.log(
      'money',
      `💸 ${formatMoney(s, amt)} in your hand by lunchtime. The paperwork says you'll pay back a great deal more.`,
    );
  } else {
    const kin = ctx.rng.pick(family(s));
    const helps = ctx.rng.chance(0.65);
    if (helps && kin) {
      const gift = money(s, ctx.rng.int(1000, 8000));
      s.money.cash += gift;
      kin.rel = Math.max(0, kin.rel - 3);
      ctx.log(
        'money',
        `🤲 ${kin.first} sends ${formatMoney(s, gift)}, along with some advice you didn’t ask for.`,
      );
    } else {
      addStat(s, 'happiness', -3);
      ctx.log(
        'money',
        `🤲 ${kin?.first ?? 'Your family'} can’t help right now. It stings more than you expected.`,
      );
    }
  }
}
