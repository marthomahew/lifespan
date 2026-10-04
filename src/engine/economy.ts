import { COUNTRY_BY_ID } from '../content/countries';
import type { Country } from '../content/types';
import type { GameState } from './types';

export function countryOf(s: GameState, id = s.player.country): Country {
  const c = COUNTRY_BY_ID[id];
  if (!c) throw new Error(`unknown country ${id}`);
  return c;
}

/** Reference dollars (2026 US purchasing power) to local nominal currency at prices. */
export function refToLocal(
  s: GameState,
  ref: number,
  kind: 'price' | 'wage' = 'price',
  countryId?: string,
): number {
  const c = countryOf(s, countryId);
  const level = kind === 'price' ? c.priceLevel : c.wageLevel;
  return ref * level * s.inflation * c.currency.perUsd;
}

/** Local nominal currency to reference dollars (inflation and price adjusted). */
export function localToRef(s: GameState, local: number, countryId?: string): number {
  const c = countryOf(s, countryId);
  return local / (c.priceLevel * s.inflation * c.currency.perUsd);
}

/** Rounded local amount for a reference-dollar figure. */
export function money(s: GameState, ref: number, kind: 'price' | 'wage' = 'price'): number {
  return Math.round(refToLocal(s, ref, kind));
}

function groupThousands(n: number): string {
  const str = Math.abs(Math.round(n)).toString();
  let out = '';
  for (let i = 0; i < str.length; i++) {
    if (i > 0 && (str.length - i) % 3 === 0) out += ',';
    out += str[i];
  }
  return out;
}

/** Format a local amount with the country's currency symbol. */
export function formatMoney(s: GameState, local: number, countryId?: string): string {
  const c = countryOf(s, countryId);
  const sign = local < 0 ? '-' : '';
  const sym = c.currency.symbol;
  const body = groupThousands(local);
  return /^[A-Za-z]/.test(sym) ? `${sign}${sym} ${body}` : `${sign}${sym}${body}`;
}

/** Compact format for headers: 1.2M, 34K. */
export function formatMoneyShort(s: GameState, local: number): string {
  const c = countryOf(s);
  const abs = Math.abs(local);
  const sign = local < 0 ? '-' : '';
  const sym = c.currency.symbol;
  const sep = /^[A-Za-z]/.test(sym) ? ' ' : '';
  if (abs >= 1e9) return `${sign}${sym}${sep}${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}${sym}${sep}${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e4) return `${sign}${sym}${sep}${Math.round(abs / 1e3)}K`;
  return formatMoney(s, local);
}

/** Progressive income tax in local currency. Bands are written in reference dollars of income. */
export function incomeTax(s: GameState, localIncome: number): number {
  if (localIncome <= 0) return 0;
  const c = countryOf(s);
  const toLocal = c.wageLevel * s.inflation * c.currency.perUsd;
  let tax = 0;
  let lower = 0;
  for (const band of c.taxBands) {
    const upper = band.upTo === null ? Infinity : band.upTo * toLocal;
    if (localIncome > lower) tax += (Math.min(localIncome, upper) - lower) * band.rate;
    lower = upper;
    if (localIncome <= upper) break;
  }
  return Math.round(tax);
}
