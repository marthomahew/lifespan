import { describe, expect, it } from 'vitest';
import { act, newLife, runCheat, type GameState } from '../../src/engine';
import { hustleReason, strapped } from '../../src/engine/systems/hustle';

const broke = (): GameState => {
  const s = runCheat(newLife({ birthYear: 1990, country: 'us' }, 4800), 'age.set', {
    age: 25,
  }).state;
  return { ...s, pending: [], money: { ...s.money, cash: 200, savings: 0 } };
};

describe('making ends meet', () => {
  it('is open when money is tight, closed when it isn’t', () => {
    expect(strapped(broke())).toBe(true);
    const comfy = runCheat(broke(), 'money.add', { amount: 500_000 }).state;
    expect(hustleReason(comfy, 'gig')).toMatch(/money is tight/);
  });

  it('gig work pays, a payday loan comes with a debt, each once a year', () => {
    let s = broke();
    const cash = s.money.cash;
    s = act(s, { type: 'hustle', id: 'gig' }).state;
    expect(s.money.cash).toBeGreaterThan(cash);
    expect(() => act(s, { type: 'hustle', id: 'gig' })).toThrow(/done this year/);
    s = act(s, { type: 'hustle', id: 'payday' }).state;
    expect(s.money.loans.some((l) => l.kind === 'debt' && l.rate >= 1)).toBe(true);
  });
});
