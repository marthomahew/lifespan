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
import { JOB_BY_ID } from '../../content/jobs';
import type { Ctx } from '../ctx';
import { countryOf, formatMoney, money } from '../economy';
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
  // The speculative coin fund stays simulated (SPEC): following bitcoin's real history would
  // hand its growth to anyone, when bitcoin itself only reaches those who hear about it.
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
  { id: 'BTC', name: 'Bitcoin', emoji: '₿', listed: 2009 },
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

/** Close enough to computers to notice things early: code, or a job in tech. */
export const techSavvy = (s: GameState): boolean =>
  (s.player.skills['programming'] ?? 0) >= 30 ||
  JOB_BY_ID[s.career.jobId ?? '']?.field === 'technology';

/** Flags that mean someone has told you about bitcoin. */
export const HEARD_BITCOIN = [
  'heard_bitcoin',
  'ignored_bitcoin',
  'early_miner',
  'early_buyer',
  'bitcoin_dabbler',
];

/**
 * Shares are listed for anyone, but bitcoin is not on most people's radar: you see it if
 * you're close to computers, someone has told you about it, you already hold some, or
 * (from 2021) when it's in adverts everywhere.
 */
export function onRadar(s: GameState, id: string): boolean {
  if (id !== 'BTC') return true;
  return (
    techSavvy(s) ||
    (s.money.shares?.['BTC'] ?? 0) > 0 ||
    s.player.flags.some((f) => HEARD_BITCOIN.includes(f)) ||
    s.year >= 2021
  );
}

/**
 * Bitcoin's early market, roughly: dollars traded in the whole year, and coins that existed
 * by its end. In 2009 there was no exchange, only a few forum trades worth pocket money.
 */
const BTC_MARKET: Record<number, [volumeUsd: number, supply: number]> = {
  2009: [30, 1_600_000],
  2010: [1_000_000, 5_000_000],
  2011: [150_000_000, 8_000_000],
  2012: [300_000_000, 10_600_000],
  2013: [10_000_000_000, 12_200_000],
  2014: [20_000_000_000, 13_700_000],
  2015: [20_000_000_000, 15_000_000],
  2016: [40_000_000_000, 16_100_000],
};
/** The share of a year's trading one buyer can take before the price notices them. */
const QUIET_SHARE = 0.05;

/**
 * Coins you can still buy this year without moving the price (Infinity once the market is
 * deep enough that no one person matters): a twentieth of the year's trading, and never
 * more than a fiftieth of the coins in existence.
 */
export function btcAllowance(s: GameState): number {
  const m = BTC_MARKET[s.year];
  const price = priceUsd(s, 'BTC');
  if (!m || !price) return Infinity;
  const cap = Math.min((m[0] * QUIET_SHARE) / price, m[1] * 0.02);
  const bought = s.usage.year === s.year ? (s.usage.used['btc_coins'] ?? 0) : 0;
  return Math.max(0, cap - bought);
}

/**
 * Why you can't invest right now, or null. A child invests through a custodial account a
 * parent or guardian opens in their name, so they need one alive to sign the forms.
 */
export function investBlock(s: GameState): string | null {
  if (s.legal.prison) return 'not from prison';
  if (s.player.age >= 18) return null;
  const guardian = s.npcs.some(
    (n) =>
      n.alive && n.roles.some((r) => ['mother', 'father', 'stepparent', 'grandparent'].includes(r)),
  );
  return guardian ? null : 'a child needs a parent or guardian to open the account';
}

/** Buy or sell shares: buy by local amount (or by count with `units`), sell by count. */
export function tradeShares(
  ctx: Ctx,
  id: string,
  op: 'buy' | 'sell',
  amount: number,
  units = false,
): void {
  const s = ctx.s;
  const price = priceLocal(s, id);
  if (price === null) throw new EngineError('not trading yet');
  const blocked = investBlock(s);
  if (blocked) throw new EngineError(blocked);
  const held = (s.money.shares ??= {});
  if (op === 'buy') {
    if (!onRadar(s, id)) throw new EngineError('you have never heard of it');
    const left = id === 'BTC' ? btcAllowance(s) : Infinity;
    if (left <= 0) throw new EngineError('the market is too thin to buy more this year');
    // By count: exactly that many (or as many as you can afford and the market will sell).
    const want = units ? Math.min(amount, left, Math.max(0, s.money.cash) / price) : 0;
    const spend = units
      ? Math.round(want * price * 100) / 100
      : Math.min(Math.round(amount), Math.max(0, s.money.cash), Math.ceil(left * price));
    if (spend <= 0) throw new EngineError('enter an amount you have');
    s.money.cash -= spend;
    const coins = units ? want : Math.min(left, spend / price);
    held[id] = (held[id] ?? 0) + coins;
    if (id === 'BTC' && left < Infinity) {
      if (s.usage.year !== s.year) s.usage = { year: s.year, used: {} };
      s.usage.used['btc_coins'] = (s.usage.used['btc_coins'] ?? 0) + coins;
    }
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

/**
 * Share effects from events, arg "ID:n": buy n reference dollars' worth (if you have it),
 * sell or lose a fraction n of what you hold, or receive n shares (coins you mined).
 */
export function sharesEffect(ctx: Ctx, kind: string, arg: string): void {
  const s = ctx.s;
  const [id = '', raw = '0'] = arg.split(':');
  const n = raw === 'mine' ? minedCoins(s.year) : Number(raw);
  if (!Number.isFinite(n)) return;
  const held = (s.money.shares ??= {});
  const have = held[id] ?? 0;
  // Coins mined before anyone traded them have no price yet, but they are still yours.
  if (kind === 'grant_shares') {
    held[id] = have + n;
    return;
  }
  const price = priceLocal(s, id);
  if (price === null) return;
  if (kind === 'buy_shares') {
    const spend = Math.min(money(s, n, 'price'), Math.max(0, s.money.cash));
    if (spend <= 0) return;
    s.money.cash -= spend;
    held[id] = have + spend / price;
  } else if (have > 0) {
    const part = have * Math.min(1, Math.max(0, n));
    held[id] = have - part;
    if (kind === 'sell_shares') {
      const got = Math.round(part * price);
      s.money.cash += got;
      ctx.log('money', `You sell for ${formatMoney(s, got)}.`);
    }
    if (held[id] <= 1e-9) delete held[id];
  }
}

/**
 * Coins a home computer left mining for a few months makes: thousands in the first year,
 * when hardly anyone mined, then fewer as the network crowds in.
 */
export function minedCoins(year: number): number {
  if (year <= 2009) return 2500;
  if (year === 2010) return 300;
  if (year === 2011) return 40;
  if (year === 2012) return 10;
  return 1;
}

/** Holding at least this much of something (local money), for event conditions. */
export function holdingValue(s: GameState, id: string): number {
  return (s.money.shares?.[id] ?? 0) * (priceLocal(s, id) ?? 0);
}
