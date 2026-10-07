import { describe, expect, it } from 'vitest';
import { act, ageUp, newLife, runCheat, type GameState } from '../../src/engine';

const landlord = (seed = 2600): GameState => {
  let s = runCheat(newLife({ birthYear: 1980, country: 'us' }, seed), 'age.set', { age: 40 }).state;
  s = runCheat({ ...s, pending: [] }, 'asset.spawn', { asset: 'home:house' }).state;
  s = runCheat({ ...s, pending: [] }, 'asset.spawn', { asset: 'home:apartment' }).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true, noBadEvents: true } };
};

describe('letting out a home', () => {
  it('a home you do not live in can be let; rent arrives with the year', () => {
    const s = landlord();
    const flat = s.assets.homes.find((h) => !h.livingIn)!;
    const home = s.assets.homes.find((h) => h.livingIn)!;
    expect(() => act(s, { type: 'let_home', id: home.id, on: true })).toThrow(/live there/);
    const let1 = act(s, { type: 'let_home', id: flat.id, on: true }).state;
    expect(let1.assets.homes.find((h) => h.id === flat.id)?.let?.rent).toBeGreaterThan(0);
    const next = ageUp(let1).state;
    expect(next.log.some((l) => /Rent this year/.test(l.text))).toBe(true);
    expect(next.money.last?.otherIncome ?? 0).toBeGreaterThan(0);
  });

  it('moving into a let home ends the tenancy', () => {
    const s = landlord(2601);
    const flat = s.assets.homes.find((h) => !h.livingIn)!;
    const let1 = act(s, { type: 'let_home', id: flat.id, on: true }).state;
    const moved = act(let1, { type: 'move_home', id: flat.id }).state;
    expect(moved.assets.homes.find((h) => h.id === flat.id)?.let ?? null).toBeNull();
  });

  it('doing up a tired place adds more value than touching up a tidy one', () => {
    const s = landlord(2602);
    const flat = s.assets.homes.find((h) => !h.livingIn)!;
    const tired = {
      ...s,
      money: { ...s.money, cash: 10_000_000 },
      assets: {
        ...s.assets,
        homes: s.assets.homes.map((h) => (h.id === flat.id ? { ...h, condition: 30 } : h)),
      },
    };
    const tidy = {
      ...tired,
      assets: {
        ...tired.assets,
        homes: tired.assets.homes.map((h) => (h.id === flat.id ? { ...h, condition: 90 } : h)),
      },
    };
    const gain = (x: GameState): number => {
      const before = x.assets.homes.find((h) => h.id === flat.id)!.value;
      return (
        act(x, { type: 'renovate', id: flat.id }).state.assets.homes.find((h) => h.id === flat.id)!
          .value - before
      );
    };
    expect(gain(tired)).toBeGreaterThan(gain(tidy));
  });
});
