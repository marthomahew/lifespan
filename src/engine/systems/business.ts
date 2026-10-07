import { inRecession } from './markets';
import { luck } from './luck';
import {
  BUSINESS_BY_ID,
  LEVEL_MULT,
  LEVEL_NAMES,
  type BusinessKind,
} from '../../content/businesses';
import type { Ctx } from '../ctx';
import { formatMoney, money } from '../economy';
import { EngineError } from '../errors';
import { pickFresh } from '../fresh';
import { addStat } from '../stats';
import type { GameState } from '../types';
import { clampStat } from '../util';

/** A business you founded (or were handed). One at a time. */
export type Business = {
  kind: string;
  name: string;
  founded: number;
  country: string;
  /** 1 (one site) to 5 (a household name). */
  level: number;
  /** Momentum, 0..100: reputation, customers, cash flow. Below 5 and it folds. */
  health: number;
  /** What it would sell for, in local money. */
  value: number;
  /** Last year's profit (or loss), in local money. */
  lastProfit: number;
  /** Running it yourself counts as a full-time job; a manager frees you, for a cut. */
  hands: 'self' | 'manager';
};

export type BusinessOp =
  | { op: 'start'; kind: string; name?: string }
  | { op: 'expand' }
  | { op: 'invest' }
  | { op: 'hands'; hands: 'self' | 'manager' }
  | { op: 'sell' }
  | { op: 'close' };

export const businessOf = (s: GameState): Business | null => s.business ?? null;
export const kindOf = (b: Business): BusinessKind | undefined => BUSINESS_BY_ID[b.kind];
export const runsBusiness = (s: GameState): boolean => businessOf(s)?.hands === 'self';
export const levelName = (b: Business): string => LEVEL_NAMES[b.level - 1] ?? '';

/** What a sale fetches: nine-tenths of its value (more with the Midas touch). */
export function sellPrice(s: GameState, b: Business): number {
  return Math.round(b.value * (0.9 + 0.4 * luck(s, 'business')));
}

/** What the next level costs, or null at the top. */
export function expandCost(s: GameState, b: Business): number | null {
  const k = kindOf(b);
  if (!k || b.level >= LEVEL_MULT.length) return null;
  return money(s, k.startCost * 1.5 * 2 ** (b.level - 1), 'wage');
}
/** Money in: new equipment, marketing, a refit. */
export function investCost(s: GameState, b: Business): number {
  return money(s, (kindOf(b)?.startCost ?? 50000) * 0.2 * b.level, 'wage');
}

export function startReason(s: GameState, kindId: string): string | null {
  const k = BUSINESS_BY_ID[kindId];
  if (!k) return 'unknown kind of business';
  if (s.player.age < 18) return 'from age 18';
  if (s.legal.prison) return 'not from prison';
  if (s.legal.fugitive) return 'not while on the run';
  if (s.business) return 'you already run one';
  const cost = money(s, k.startCost, 'wage');
  if (s.money.cash < cost) return `costs ${formatMoney(s, cost)}`;
  return null;
}

function valueOf(s: GameState, b: Business): number {
  const k = kindOf(b);
  if (!k) return 0;
  const base = k.startCost * 0.6 * b.level;
  const earnings = Math.max(0, k.profit * (LEVEL_MULT[b.level - 1] ?? 1)) * (b.health / 50);
  // A startup is valued on its story: momentum squared.
  const v = k.growth ? base + k.startCost * b.level * (b.health / 30) ** 2 : base + earnings * 4;
  return money(s, v, 'wage');
}

export function businessAction(ctx: Ctx, a: BusinessOp): void {
  const s = ctx.s;
  if (a.op === 'start') {
    const why = startReason(s, a.kind);
    if (why) throw new EngineError(why);
    const k = BUSINESS_BY_ID[a.kind] as BusinessKind;
    s.money.cash -= money(s, k.startCost, 'wage');
    const name =
      a.name?.trim().slice(0, 40) || ctx.rng.pick(k.names).replace('{last}', s.player.last);
    const b: Business = {
      kind: k.id,
      name,
      founded: s.year,
      country: s.player.country,
      level: 1,
      health: 50,
      value: 0,
      lastProfit: 0,
      hands: s.career.jobId || s.military?.active ? 'manager' : 'self',
    };
    b.value = valueOf(s, b);
    s.business = b;
    s.player.flags = [
      ...s.player.flags.filter((f) => f !== 'founded_business'),
      'founded_business',
    ];
    ctx.log(
      'work',
      `${k.emoji} You open ${name}. ${b.hands === 'self' ? 'You will run it yourself, which means every hour you have.' : 'A manager runs the day to day while you keep your job.'}`,
      true,
    );
    return;
  }
  const b = businessOf(s);
  if (!b) throw new EngineError('you have no business');
  const k = kindOf(b);
  // From a cell, or from the other side of the world, the business runs without you.
  if (s.legal.prison && a.op !== 'sell' && a.op !== 'close')
    throw new EngineError('not from prison');
  if (b.country !== s.player.country && a.op !== 'sell' && a.op !== 'close')
    throw new EngineError('it is back in the old country');
  switch (a.op) {
    case 'expand': {
      const cost = expandCost(s, b);
      if (cost === null) throw new EngineError('it is as big as it gets');
      if (b.health < 40) throw new EngineError('steady it first: growth needs momentum');
      if (s.money.cash < cost) throw new EngineError(`costs ${formatMoney(s, cost)}`);
      s.money.cash -= cost;
      b.level += 1;
      b.health = clampStat(b.health - 10);
      b.value = valueOf(s, b);
      ctx.log(
        'work',
        `${k?.emoji ?? '🏢'} ${b.name} grows: ${levelName(b).toLowerCase()} now.`,
        true,
      );
      return;
    }
    case 'invest': {
      const cost = investCost(s, b);
      if (s.money.cash < cost) throw new EngineError(`costs ${formatMoney(s, cost)}`);
      s.money.cash -= cost;
      b.health = clampStat(b.health + 15);
      b.value = valueOf(s, b);
      ctx.log(
        'work',
        `You put ${formatMoney(s, cost)} into ${b.name}: a refit, new stock, a proper website.`,
      );
      return;
    }
    case 'hands':
      if (a.hands === 'self' && s.career.jobId)
        throw new EngineError('quit your job to run it yourself');
      if (a.hands === 'self' && s.military?.active) throw new EngineError('not while serving');
      b.hands = a.hands;
      ctx.log(
        'work',
        a.hands === 'self'
          ? `You take back the keys to ${b.name}. Your name over the door, your hours behind the counter.`
          : `You hire a manager for ${b.name}. They take a cut, and you get your evenings back.`,
      );
      return;
    case 'sell':
    case 'close': {
      // The Midas touch finds buyers who pay over the odds.
      const got = a.op === 'sell' ? sellPrice(s, b) : 0;
      s.money.cash += got;
      s.business = null;
      s.player.flags.push(a.op === 'sell' ? 'sold_business' : 'closed_business');
      ctx.log(
        'work',
        a.op === 'sell'
          ? `You sell ${b.name} for ${formatMoney(s, got)}. You walk past it a week later and someone has moved the sign.`
          : `You close ${b.name} for good and hand back the keys.`,
        true,
      );
      return;
    }
  }
}

/**
 * The year in business, before finances: momentum drifts with your skill, your hours and
 * your luck; profit follows momentum; a business that loses all of it folds.
 * Returns the profit (taxed as income) or zero; losses come straight out of cash.
 */
export function businessYear(ctx: Ctx): number {
  const s = ctx.s;
  const b = businessOf(s);
  if (!b || s.death) return 0;
  const k = kindOf(b);
  if (!k) return 0;
  // Abroad, or inside: the business is sold or handed to a manager.
  if (b.country !== s.player.country) {
    const got = Math.round(b.value * 0.7);
    s.money.cash += got;
    s.business = null;
    ctx.log(
      'work',
      `From abroad you sell ${b.name}, quickly and cheaply: ${formatMoney(s, got)}.`,
      true,
    );
    return 0;
  }
  if (s.legal.prison && b.hands === 'self') {
    b.hands = 'manager';
    ctx.log('work', `With you inside, a manager takes over ${b.name}.`);
  }
  const skill = k.skill ? (s.player.skills[k.skill] ?? 0) : 30;
  const target =
    40 +
    skill / 4 +
    (s.player.stats.smarts - 50) / 8 +
    (b.hands === 'self' ? 10 : -4) +
    (s.player.stats.discipline - 50) / 10 +
    businessLuck(s) -
    (inRecession(s.year) ? 10 : 0);
  b.health = clampStat(b.health + (target - b.health) * 0.3 + ctx.rng.normal(0, 30 * k.volatility));
  if (b.health <= 5) {
    s.business = null;
    s.player.flags.push('business_failed');
    addStat(s, 'happiness', -15);
    addStat(s, 'stress', 15);
    ctx.log(
      'work',
      `${k.emoji} ${b.name} runs out of money and customers in the same month. It closes.`,
      true,
    );
    return 0;
  }
  const mult = LEVEL_MULT[b.level - 1] ?? 1;
  const cut = b.hands === 'manager' ? 0.7 : 1;
  const ref = k.profit * mult * ((b.health - 30) / 30) * cut * (0.85 + ctx.rng.next() * 0.3);
  const profit = money(s, ref, 'wage');
  b.lastProfit = profit;
  b.value = valueOf(s, b);
  if (b.hands === 'self') addStat(s, 'stress', 3);
  ctx.log('work', yearLine(ctx, b, k, profit));
  if (profit < 0) {
    s.money.cash += profit;
    return 0;
  }
  return profit;
}

/** A business event's effect: momentum, a sale at a price, cheap growth, or a manager. */
export function businessEffect(ctx: Ctx, kind: string, n: number): void {
  const s = ctx.s;
  const b = businessOf(s);
  if (!b) return;
  if (kind === 'biz_health') b.health = clampStat(b.health + n);
  else if (kind === 'biz_manager') b.hands = 'manager';
  else if (kind === 'biz_expand' && b.level < LEVEL_MULT.length) b.level += 1;
  else if (kind === 'biz_sell') {
    const got = Math.round(b.value * (n || 1) * (1 + 0.3 * luck(s, 'business')));
    s.money.cash += got;
    s.business = null;
    s.player.flags.push('sold_business');
    ctx.log('work', `${b.name} changes hands for ${formatMoney(s, got)}.`, true);
    return;
  }
  b.value = valueOf(s, b);
}

/** Luck in business: the Midas touch lifts momentum (and a charmed life, a little). */
export function businessLuck(s: GameState): number {
  return 25 * luck(s, 'business');
}

function yearLine(ctx: Ctx, b: Business, k: BusinessKind, profit: number): string {
  const s = ctx.s;
  const p = formatMoney(s, Math.abs(profit));
  const band = profit < 0 ? 'bad' : b.health >= 68 ? 'good' : 'fair';
  const detail = pickFresh(ctx, DETAIL[k.id]?.[band] ?? DETAIL['shop']?.[band] ?? ['']);
  const head =
    band === 'bad'
      ? pickFresh(ctx, [
          `A hard year at ${b.name}: a loss of ${p}.`,
          `${b.name} loses ${p} this year.`,
          `${b.name} is ${p} down on the year.`,
        ])
      : band === 'good'
        ? pickFresh(ctx, [
            `A booming year at ${b.name}: ${p} in profit.`,
            `${b.name} has its best year yet: ${p} profit.`,
            `Everything goes right at ${b.name}: ${p} profit.`,
          ])
        : pickFresh(ctx, [
            `A steady year at ${b.name}: ${p} profit.`,
            `${b.name} turns ${p} profit. Not glamorous; yours.`,
            `${b.name} ticks along: ${p} after costs.`,
          ]);
  return `${k.emoji} ${head} ${detail}`.trim();
}

/** What a year looks like in each kind of business, good, fair and bad. */
const DETAIL: Record<string, Record<'good' | 'fair' | 'bad', string[]>> = {
  cafe: {
    good: [
      'There is a queue for the window seats.',
      'The cake you are known for sells out by eleven.',
    ],
    fair: ['A regular brings you biscuits.', 'The coffee machine needs a new seal, again.'],
    bad: ['Rain all summer and an empty terrace.', 'The rent goes up and the footfall goes down.'],
  },
  shop: {
    good: ['The window display stops people in the street.', 'You reorder twice before Christmas.'],
    fair: [
      'The bell over the door rings often enough.',
      'The cat that came with the lease sleeps in the window.',
    ],
    bad: [
      'Quiet tills and a leaking roof.',
      'Half the high street has a sale on; you cannot match it.',
    ],
  },
  restaurant: {
    good: [
      'Every table is booked a month ahead.',
      'A food writer comes in unannounced and loves it.',
    ],
    fair: ['Friday nights are full; Tuesdays are thin.', 'The new menu works, mostly.'],
    bad: ['The walk-in freezer dies in August.', 'Two cooks leave in the same week.'],
  },
  tech: {
    good: ['Users double; investors call you first.', 'A big client signs a three-year contract.'],
    fair: [
      'The roadmap slips a quarter, as roadmaps do.',
      'You ship the update everyone asked for.',
    ],
    bad: [
      'The servers cost more than the customers pay.',
      'Your best engineer leaves for a bigger name.',
    ],
  },
  builders: {
    good: [
      'The order book is full until next spring.',
      'A housing estate contract keeps every van busy.',
    ],
    fair: ['The weather costs you three weeks.', 'One client pays late and one pays early.'],
    bad: ['Materials go up by a third overnight.', 'A job runs over and the penalty clause bites.'],
  },
  studio: {
    good: [
      'Your work wins an award and the phone rings.',
      'A national brand hires you for a rebrand.',
    ],
    fair: [
      'Steady clients, and one who wants it more blue.',
      'A long project finally gets signed off.',
    ],
    bad: ['Two clients go under owing you money.', 'Everyone wants it cheaper, and faster.'],
  },
  farm: {
    good: ['A golden harvest, in on time.', 'Prices at market are the best in years.'],
    fair: [
      'A middling harvest and a broken tractor.',
      'The weather does its usual best to ruin things.',
    ],
    bad: ['A wet spring and a dry summer.', 'Prices at market fall through the floor.'],
  },
  firm: {
    good: ['Three new clients come by word of mouth.', 'The tax-season rush pays for the year.'],
    fair: [
      'April is chaos; the rest of the year is calm.',
      'A client brings receipts in a shoebox, again.',
    ],
    bad: ['A big client moves to a cheaper firm.', 'New software eats a month of everyone’s time.'],
  },
};
