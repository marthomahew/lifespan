import { localToRef } from './economy';
import type { GameState } from './types';
import { sum } from './util';
import { sharesValue } from './systems/markets';
import { lifestyleValue } from './systems/lifestyle';

export function netWorth(s: GameState): number {
  const m = s.money;
  const a = s.assets;
  const assets =
    m.cash +
    m.savings +
    sum(Object.values(m.holdings)) +
    sum(a.homes.map((h) => h.value)) +
    sum(a.vehicles.map((v) => v.value)) +
    sum(a.possessions.map((p) => p.value)) +
    (s.business?.value ?? 0) +
    sharesValue(s) +
    lifestyleValue(s);
  const debts = sum(m.loans.map((l) => l.balance));
  return Math.round(assets - debts);
}

/** Net worth in reference (inflation and price adjusted) dollars. */
export function netWorthRef(s: GameState): number {
  return localToRef(s, netWorth(s));
}
