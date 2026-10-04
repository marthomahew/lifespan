import { describe, expect, it } from 'vitest';
import { newLife, runCheat } from '../../../src/engine';
import { playYears } from '../../helpers';
import { refToLocal } from '../../../src/engine/economy';

const base = newLife({ country: 'us' }, 11);

describe('money cheats', () => {
  it("'money.add' and 'money.set' change cash", () => {
    const s = runCheat(base, 'money.add', { amount: 1000000 }).state;
    expect(s.money.cash).toBe(1000000);
    expect(runCheat(s, 'money.set', { amount: 42 }).state.money.cash).toBe(42);
  });

  it("'money.infinite' keeps cash topped up", () => {
    const s = runCheat(base, 'money.infinite', {}).state;
    expect(s.cheats.infiniteMoney).toBe(true);
    const later = playYears(s, 3);
    expect(later.money.cash).toBeGreaterThanOrEqual(Math.round(refToLocal(later, 1e9)));
    expect(runCheat(s, 'money.infinite', { on: false }).state.cheats.infiniteMoney).toBe(false);
  });

  it("'debts.payoff' clears every loan", () => {
    const withLoan = {
      ...base,
      money: {
        ...base.money,
        loans: [
          {
            id: 1,
            kind: 'personal' as const,
            principal: 10,
            balance: 10,
            rate: 0.1,
            termYears: 5,
            payment: 2,
            yearsPaid: 0,
            missed: 0,
          },
        ],
      },
    };
    expect(runCheat(withLoan, 'debts.payoff', {}).state.money.loans).toEqual([]);
  });
});
