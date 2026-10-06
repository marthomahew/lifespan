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
      hands: s.career.jobId ? 'manager' : 'self',
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
      const got = a.op === 'sell' ? Math.round(b.value * 0.9) : 0;
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
    businessLuck(s);
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
    const got = Math.round(b.value * (n || 1));
    s.money.cash += got;
    s.business = null;
    s.player.flags.push('sold_business');
    ctx.log('work', `${b.name} changes hands for ${formatMoney(s, got)}.`, true);
    return;
  }
  b.value = valueOf(s, b);
}

/** Luck in business, from gifts (none yet: business luck arrives with the luck traits). */
export function businessLuck(_s: GameState): number {
  return 0;
}

function yearLine(ctx: Ctx, b: Business, k: BusinessKind, profit: number): string {
  const s = ctx.s;
  const p = formatMoney(s, Math.abs(profit));
  if (profit < 0)
    return `${k.emoji} ${pickFresh(ctx, [
      `A hard year at ${b.name}: a loss of ${p}. You cover the wages from your own account.`,
      `${b.name} loses ${p} this year. You lie awake doing sums.`,
      `Quiet tills and a leaking roof: ${b.name} is ${p} down on the year.`,
    ])}`;
  if (b.health >= 75)
    return `${k.emoji} ${pickFresh(ctx, [
      `A booming year at ${b.name}: ${p} in profit and a waiting list.`,
      `${b.name} has its best year yet: ${p} profit, and people queue.`,
      `Everything goes right at ${b.name}: ${p} profit, and a feature in the local paper.`,
    ])}`;
  return `${k.emoji} ${pickFresh(ctx, [
    `A steady year at ${b.name}: ${p} profit.`,
    `${b.name} turns ${p} profit. Not glamorous; yours.`,
    `${b.name} ticks along: ${p} after costs, and a regular who brings you biscuits.`,
  ])}`;
}
