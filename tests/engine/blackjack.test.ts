import { describe, expect, it } from 'vitest';
import { act, newLife, runCheat, type GameState } from '../../src/engine';
import { money } from '../../src/engine/economy';
import {
  betOptions,
  handValue,
  playSession,
  shoeFor,
  type Card,
} from '../../src/engine/systems/blackjack';

const c = (rank: number): Card => ({ rank, suit: 0 });
const adult = (seed = 70): GameState => {
  const s = runCheat(newLife({ country: 'us', birthYear: 1980 }, seed), 'age.set', {
    age: 30,
  }).state;
  return runCheat({ ...s, pending: [] }, 'money.add', { amount: 50000 }).state;
};

describe('blackjack', () => {
  it('counts hands the usual way: aces are 1 or 11, faces are 10', () => {
    expect(handValue([c(1), c(13)]).total).toBe(21);
    expect(handValue([c(1), c(1), c(9)]).total).toBe(21);
    expect(handValue([c(10), c(12), c(5)]).total).toBe(25);
    expect(handValue([c(1), c(6)]).soft).toBe(true);
  });

  it('a stacked shoe plays out as the rules say', () => {
    // You: 10, 7. Dealer: 9, 8. Stand: 17 v 17, a push. Then you: 10, 5, hit a 6 for 21; dealer 10, 6, draws 10: bust.
    const shoe = [c(10), c(7), c(9), c(8), c(10), c(5), c(10), c(6), c(6), c(10)];
    const s = playSession(shoe, 'S|HS');
    expect(s.hands.map((h) => h.status)).toEqual(['push', 'win']);
    expect(s.net).toBe(1);
    expect(playSession(shoe, 'S|H').waiting).toBe(false);
    expect(playSession(shoe, 'S|').waiting).toBe(true);
    // A natural pays 3 to 2.
    expect(playSession([c(1), c(13), c(9), c(8)], 'S').net).toBe(1.5);
    // Doubling doubles the stake and takes exactly one card.
    const dbl = playSession([c(5), c(6), c(10), c(7), c(10)], 'D');
    expect(dbl.hands[0]?.cards).toHaveLength(3);
    expect(dbl.net).toBe(2);
  });

  it('the cards you played decide the money; an unfinished hand is refused', () => {
    const s = adult();
    const shoe = shoeFor(s);
    const bet = betOptions(s, (r) => money(s, r))[1] ?? 0;
    expect(bet).toBeGreaterThan(0);
    const plan = 'S|S|S';
    const net = Math.round(playSession(shoe, plan).net * bet);
    const after = act(s, { type: 'activity', id: 'casino', params: { plan, bet } }).state;
    expect(after.money.cash - s.money.cash).toBe(net);
    expect(() => act(s, { type: 'activity', id: 'casino', params: { plan: 'S|', bet } })).toThrow(
      /finish/,
    );
    expect(() => act(s, { type: 'activity', id: 'casino', params: { plan: 'S', bet: 7 } })).toThrow(
      /table/,
    );
    // Same visit, same shoe; the next visit is shuffled again.
    expect(shoeFor(s)).toEqual(shoe);
    expect(shoeFor(after)).not.toEqual(shoe);
  });
});
