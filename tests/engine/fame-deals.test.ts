import { describe, expect, it } from 'vitest';
import { act, newLife, runCheat, type GameState } from '../../src/engine';
import { fameDealPay, fameDealReason, laneBonus } from '../../src/engine/systems/fame-deals';
import { workTime } from '../../src/engine/systems/activities';

const star = (fame: number, crowned = false): GameState => {
  let s = runCheat(newLife({ birthYear: 1990, country: 'us' }, 4100), 'age.set', { age: 30 }).state;
  s = { ...s, pending: [] };
  return {
    ...s,
    player: { ...s.player, stats: { ...s.player.stats, fame } },
    chess: {
      rating: 2820,
      best: 2820,
      title: 'GM',
      imNorms: 3,
      gmNorms: 3,
      events: 80,
      wins: 30,
      recent: [],
      ...(crowned ? { crowns: [2018] } : {}),
    },
  };
};

describe('cashing in on fame', () => {
  it('needs fame and something to be known for', () => {
    const nobody = runCheat(newLife({}, 4101), 'age.set', { age: 30 }).state;
    expect(fameDealReason(nobody, 'sponsor')).toMatch(/known for/);
    expect(fameDealReason(star(20), 'sponsor')).toMatch(/known for/);
    expect(fameDealReason(star(60), 'sponsor')).toBeNull();
  });

  it('a world champion is worth twice as much, and a deal takes no pips', () => {
    const plain = star(80);
    const champ = star(80, true);
    expect(
      Math.abs(fameDealPay(champ, 'sponsor') - 2 * fameDealPay(plain, 'sponsor')),
    ).toBeLessThan(3);
    const after = act(champ, { type: 'fame_deal', id: 'sponsor' }).state;
    expect(after.money.cash - champ.money.cash).toBe(fameDealPay(champ, 'sponsor'));
    // Deals take no pips: a famous player can play and still cash in.
    expect(workTime(after).left).toBe(workTime(champ).left);
    expect(after.log.some((l) => /world chess champion/.test(l.text))).toBe(true);
    expect(() => act(after, { type: 'fame_deal', id: 'sponsor' })).toThrow(/done this year/);
  });

  it('a memoir is once every five years', () => {
    const s = act(star(70), { type: 'fame_deal', id: 'book' }).state;
    expect(
      fameDealReason({ ...s, year: s.year + 2, usage: { year: 0, used: {} } }, 'book'),
    ).toMatch(/again in 3 years/);
    expect(
      fameDealReason({ ...s, year: s.year + 5, usage: { year: 0, used: {} } }, 'book'),
    ).toBeNull();
  });

  it('pays modestly for a local name and enormously at the top; each kind of fame has its market', () => {
    // star() is a grandmaster: a champion of the mind earns more for talks and books.
    const top = star(100);
    expect(fameDealPay(top, 'sponsor')).toBeGreaterThan(20_000_000);
    expect(fameDealPay(star(40), 'sponsor')).toBeLessThan(100_000);
    expect(laneBonus(top, 'book')).toBeGreaterThan(1);
    expect(laneBonus(top, 'sponsor')).toBe(1);
    const athlete: GameState = {
      ...top,
      chess: null,
      player: { ...top.player, flags: [...top.player.flags, 'olympic_gold'] },
    };
    expect(laneBonus(athlete, 'sponsor')).toBeGreaterThan(1);
    expect(fameDealPay(athlete, 'sponsor')).toBeGreaterThan(fameDealPay(top, 'sponsor'));
  });
});
