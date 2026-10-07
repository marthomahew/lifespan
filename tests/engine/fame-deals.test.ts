import { describe, expect, it } from 'vitest';
import { act, newLife, runCheat, type GameState } from '../../src/engine';
import { fameDealPay, fameDealReason } from '../../src/engine/systems/fame-deals';
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

  it('a world champion is worth twice as much, and a deal uses work time', () => {
    const plain = star(80);
    const champ = star(80, true);
    expect(
      Math.abs(fameDealPay(champ, 'sponsor') - 2 * fameDealPay(plain, 'sponsor')),
    ).toBeLessThan(3);
    const after = act(champ, { type: 'fame_deal', id: 'sponsor' }).state;
    expect(after.money.cash - champ.money.cash).toBe(fameDealPay(champ, 'sponsor'));
    expect(workTime(after).left).toBe(workTime(champ).left - 1);
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
});
