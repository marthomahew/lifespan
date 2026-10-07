import {
  BITCOIN,
  CPI,
  HOUSES,
  LAST_REAL_YEAR,
  MORTGAGE,
  NASDAQ,
  RECESSIONS,
  SP500,
  STOCK_BY_ID,
  STOCKS,
  fromAnchors,
} from '../../content/history/markets';
import type { Ctx } from '../ctx';
import { countryOf, formatMoney } from '../economy';
import { EngineError } from '../errors';
import type { GameState } from '../types';

/** Simulated markets after the real data runs out: prices carried year to year. */
export type MarketSim = { year: number; prices: Record<string, number> };

/** Price level of a year relative to 2026 (real US prices up to the present). */
export function priceIndex(year: number): number | null {
  const a = fromAnchors(CPI, year);
  const now = fromAnchors(CPI, 2026);
  return a && now ? a / now : null;
}

/** Was (or is) this year a recession? After the real record: one year in eight, by the year. */
export function inRecession(year: number): boolean {
  if (year <= LAST_REAL_YEAR) return RECESSIONS.has(year);
  return ((year * 2654435761) >>> 0) % 8 === 0;
}

/** This year's return for a kind of investment, as a fraction (null: simulate as before). */
export function marketReturn(year: number, kind: string): number | null {
  if (year > LAST_REAL_YEAR) return null;
  if (kind === 'index') return SP500[year] !== undefined ? (SP500[year] ?? 0) / 100 : null;
  if (kind === 'growth') {
    const n = NASDAQ[year];
    if (n !== undefined) return n / 100;
    const sp = SP500[year];
    return sp !== undefined ? (sp * 1.25) / 100 : null;
  }
  if (kind === 'coin') {
    const a = BITCOIN[year - 1];
    const b = BITCOIN[year];
    return a && b ? b / a - 1 : null;
  }
  return null;
}

/** House prices this year, as a fraction (history where it was notable, else typical). */
export function houseReturn(year: number): number | null {
  if (year > LAST_REAL_YEAR) return null;
  return (HOUSES[year] ?? 4) / 100;
}

/** The mortgage rate on offer this year: the US rate of the day, shifted by the country's. */
export function historicalMortgage(s: GameState): number | null {
  const us = fromAnchors(MORTGAGE, s.year);
  if (us === null || s.year > LAST_REAL_YEAR) return null;
  const shift = countryOf(s).mortgageRate - (countryOf(s, 'us').mortgageRate ?? 0.05);
  return Math.max(0.01, us / 100 + shift);
}

/** Things you can buy shares in: the companies, and bitcoin. */
export type Tradable = { id: string; name: string; emoji: string; listed: number };
export const TRADABLES: Tradable[] = [
  ...STOCKS.map((x) => ({ id: x.id, name: x.name, emoji: x.emoji, listed: x.listed })),
  { id: 'BTC', name: 'Bitcoin', emoji: '₿', listed: 2010 },
];

/** A share's price in US dollars this year (or null before it existed). */
export function priceUsd(s: GameState, id: string): number | null {
  const t = TRADABLES.find((x) => x.id === id);
  if (!t || s.year < t.listed) return null;
  if (s.year <= LAST_REAL_YEAR) {
    return id === 'BTC'
      ? (fromAnchors(BITCOIN, s.year) ?? null)
      : fromAnchors(STOCK_BY_ID[id]?.prices ?? {}, s.year);
  }
  return s.market?.prices[id] ?? null;
}

/** In your own currency (shares are priced in dollars; converted at today's rate). */
export function priceLocal(s: GameState, id: string): number | null {
  const p = priceUsd(s, id);
  return p === null ? null : p * countryOf(s).currency.perUsd;
}

/** Yearly: after the real record ends, prices walk on from where history left them. */
export function marketsTick(ctx: Ctx): void {
  const s = ctx.s;
  // The news, when the economy turns.
  if (s.player.age >= 12) {
    if (inRecession(s.year) && !inRecession(s.year - 1))
      ctx.log(
        'world',
        '📉 The economy tips into recession. Jobs get scarce and everyone gets careful.',
        true,
      );
    else if (!inRecession(s.year) && inRecession(s.year - 1))
      ctx.log(
        'world',
        '📈 The recession is officially over, which most people only believe a year later.',
      );
  }
  if (s.year <= LAST_REAL_YEAR) return;
  const sim: MarketSim = (s.market ??= { year: LAST_REAL_YEAR, prices: {} });
  if (sim.year >= s.year) return;
  for (const t of TRADABLES) {
    const last =
      sim.prices[t.id] ??
      (t.id === 'BTC' ? BITCOIN[LAST_REAL_YEAR] : STOCK_BY_ID[t.id]?.prices[LAST_REAL_YEAR]) ??
      1;
    const def = STOCK_BY_ID[t.id];
    const drift = def?.drift ?? 0.05;
    const swing = def?.swing ?? 0.6;
    const crash = inRecession(s.year) ? -0.2 : 0;
    sim.prices[t.id] = Math.max(0.01, last * Math.exp(drift + crash + ctx.rng.normal(0, swing)));
  }
  sim.year = s.year;
}

/** Buy or sell shares, by local amount (buy) or share count (sell). */
export function tradeShares(ctx: Ctx, id: string, op: 'buy' | 'sell', amount: number): void {
  const s = ctx.s;
  const price = priceLocal(s, id);
  if (price === null) throw new EngineError('not trading yet');
  if (s.legal.prison) throw new EngineError('not from prison');
  if (s.player.age < 18) throw new EngineError('from age 18');
  const held = (s.money.shares ??= {});
  if (op === 'buy') {
    const spend = Math.min(Math.round(amount), Math.max(0, s.money.cash));
    if (spend <= 0) throw new EngineError('enter an amount you have');
    s.money.cash -= spend;
    held[id] = (held[id] ?? 0) + spend / price;
    ctx.log('money', `You buy ${formatMoney(s, spend)} of ${nameOf(id)}.`);
  } else {
    const have = held[id] ?? 0;
    const n = Math.min(have, Math.max(0, amount));
    if (n <= 0) throw new EngineError('you have none to sell');
    const got = Math.round(n * price);
    s.money.cash += got;
    held[id] = have - n;
    if (held[id] <= 1e-9) delete held[id];
    ctx.log('money', `You sell ${nameOf(id)} for ${formatMoney(s, got)}.`);
  }
}

const nameOf = (id: string): string => TRADABLES.find((x) => x.id === id)?.name ?? id;

/** What your shares are worth now, in local money. */
export function sharesValue(s: GameState): number {
  if (!s.money.shares) return 0;
  let v = 0;
  for (const [id, n] of Object.entries(s.money.shares ?? {})) v += n * (priceLocal(s, id) ?? 0);
  return Math.round(v);
}
