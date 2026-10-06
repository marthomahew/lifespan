import { Rng, seedRng } from '../rng';
import type { GameState } from '../types';
import { usedThisYear } from './usage';

/** Blackjack at the casino: a seeded shoe, your choices, and the house rules (dealer stands on 17). */
export type Card = { rank: number; suit: number };
export type Move = 'H' | 'S' | 'D';
export type HandView = {
  cards: Card[];
  dealer: Card[];
  /** Dealer's second card stays face down until the hand is done. */
  hidden: boolean;
  status: 'playing' | 'bust' | 'blackjack' | 'win' | 'lose' | 'push';
  doubled: boolean;
  /** Chips won or lost on this hand, in bets. */
  result: number;
};
export type Session = { hands: HandView[]; net: number; waiting: boolean };

export const MAX_HANDS = 5;
export const SUITS = ['♠', '♥', '♦', '♣'];
export const RANKS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

/** Six decks, shuffled from the life's seed, this year and this visit. */
export function shoeFor(s: GameState): Card[] {
  const visit = usedThisYear(s, 'a:casino');
  const r = new Rng(seedRng((Math.imul(s.seed, 97) + s.year * 13 + visit * 7919) >>> 0));
  const cards: Card[] = [];
  for (let d = 0; d < 6; d++)
    for (let suit = 0; suit < 4; suit++)
      for (let rank = 1; rank <= 13; rank++) cards.push({ rank, suit });
  return r.shuffle(cards);
}

export function handValue(cards: Card[]): { total: number; soft: boolean } {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    total += c.rank === 1 ? 11 : Math.min(10, c.rank);
    if (c.rank === 1) aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return { total, soft: aces > 0 };
}

const natural = (cards: Card[]): boolean => cards.length === 2 && handValue(cards).total === 21;

/**
 * Play a plan: hands separated by "|", each a run of H (hit), S (stand) and D (double).
 * The last hand may be unfinished, which leaves the session waiting for your next move.
 */
export function playSession(shoe: Card[], plan: string): Session {
  let i = 0;
  const draw = (): Card => shoe[i++ % shoe.length] as Card;
  const hands: HandView[] = [];
  const parts = plan.split('|').slice(0, MAX_HANDS);
  for (let h = 0; h < parts.length; h++) {
    const moves = parts[h] ?? '';
    const cards = [draw(), draw()];
    const dealer = [draw(), draw()];
    let doubled = false;
    let done = natural(cards) || natural(dealer);
    for (const m of moves) {
      if (done) break;
      if (m === 'H') cards.push(draw());
      if (m === 'D' && cards.length === 2) {
        doubled = true;
        cards.push(draw());
        done = true;
      }
      if (m === 'S') done = true;
      if (handValue(cards).total >= 21) done = true;
    }
    const isLast = h === parts.length - 1;
    // A hand you moved on from without finishing counts as a stand.
    if (!done && !isLast) done = true;
    if (!done) {
      hands.push({ cards, dealer, hidden: true, status: 'playing', doubled, result: 0 });
      return { hands, net: sum(hands), waiting: true };
    }
    const mine = handValue(cards).total;
    let status: HandView['status'];
    if (natural(cards) && !natural(dealer)) status = 'blackjack';
    else if (natural(dealer) && !natural(cards)) status = 'lose';
    else if (natural(cards) && natural(dealer)) status = 'push';
    else if (mine > 21) status = 'bust';
    else {
      while (handValue(dealer).total < 17) dealer.push(draw());
      const theirs = handValue(dealer).total;
      status = theirs > 21 || mine > theirs ? 'win' : mine < theirs ? 'lose' : 'push';
    }
    const stake = doubled ? 2 : 1;
    const result =
      status === 'blackjack' ? 1.5 : status === 'win' ? stake : status === 'push' ? 0 : -stake;
    hands.push({ cards, dealer, hidden: false, status, doubled, result });
  }
  return { hands, net: sum(hands), waiting: false };
}

function sum(hands: HandView[]): number {
  return hands.reduce((t, h) => t + h.result, 0);
}

export function parsePlan(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw.length > 120 || !/^[HSD|]*$/.test(raw)) return null;
  return raw;
}

/** The table limits on offer, in local money, capped by what you have. */
export function betOptions(s: GameState, toLocal: (ref: number) => number): number[] {
  return [25, 100, 500, 2500].map(toLocal).filter((b) => b * 2 <= Math.max(0, s.money.cash));
}
