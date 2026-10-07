import { describe, expect, it } from 'vitest';
import { act, ageUp, newLife, runCheat, type GameState } from '../../src/engine';
import { freeTime } from '../../src/engine/systems/activities';
import { lifestyleReason, wealthTier } from '../../src/engine/systems/lifestyle';
import { netWorth } from '../../src/engine/networth';

const worth = (usd: number, seed = 4600): GameState => {
  const s = runCheat(newLife({ birthYear: 1980, country: 'us' }, seed), 'age.set', {
    age: 40,
  }).state;
  const add = Math.round(usd * s.inflation);
  return { ...runCheat({ ...s, pending: [] }, 'money.add', { amount: add }).state, pending: [] };
};

describe('the good life', () => {
  it('tiers open with net worth', () => {
    expect(wealthTier(worth(500_000))).toBeNull();
    expect(wealthTier(worth(2_000_000))).toBe('well_off');
    expect(wealthTier(worth(50_000_000))).toBe('rich');
    expect(wealthTier(worth(500_000_000))).toBe('wealthy');
    expect(wealthTier(worth(5_000_000_000))).toBe('ultra');
    expect(lifestyleReason(worth(2_000_000), 'staff')).toMatch(/net worth/);
    expect(lifestyleReason(worth(50_000_000), 'staff')).toBeNull();
  });

  it('staff buy you free time; upkeep is paid every year', () => {
    const s = worth(50_000_000);
    const before = freeTime(s).total;
    const staffed = act(s, { type: 'lifestyle', id: 'staff' }).state;
    expect(freeTime(staffed).total).toBe(before + 2);
    const next = ageUp({ ...staffed, pending: [] }).state;
    expect(next.money.last?.maintenance ?? 0).toBeGreaterThan(290_000 * staffed.inflation);
  });

  it('owned things count toward net worth; a jet loses value, art tends to gain', () => {
    let s = worth(600_000_000);
    const nw = netWorth(s);
    s = act(s, { type: 'lifestyle', id: 'private_jet' }).state;
    expect(Math.abs(netWorth(s) - nw)).toBeLessThan(nw * 0.01);
    s = act(s, { type: 'lifestyle', id: 'art' }).state;
    const jet0 = s.lifestyle!.find((x) => x.id === 'private_jet')!.value!;
    for (let i = 0; i < 5; i++) s = ageUp({ ...s, pending: [] }).state;
    expect(s.lifestyle!.find((x) => x.id === 'private_jet')!.value!).toBeLessThan(jet0);
  });

  it('angel bets settle years later, one way or another', () => {
    let s = worth(50_000_000, 4601);
    s = act(s, { type: 'lifestyle', id: 'angel' }).state;
    const bet = s.lifestyle!.find((x) => x.id === 'angel')!;
    expect(bet.payout).toBeGreaterThanOrEqual(s.year + 5);
    for (let i = 0; i < 9; i++) s = ageUp({ ...s, pending: [] }).state;
    expect(s.lifestyle!.some((x) => x.id === 'angel')).toBe(false);
    expect(s.log.some((l) => /start-up/.test(l.text))).toBe(true);
  });
});
