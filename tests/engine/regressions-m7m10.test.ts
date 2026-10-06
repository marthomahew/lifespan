import { describe, expect, it } from 'vitest';
import { act, newLife, runCheat, type GameState } from '../../src/engine';
import { Ctx } from '../../src/engine/ctx';
import { addLoan, annuityPayment, serviceLoans } from '../../src/engine/systems/loans';
import { illnessRisks } from '../../src/engine/systems/health';
import { runFinances } from '../../src/engine/systems/finance';
import { clone } from '../../src/engine/util';

const adult = (seed = 1, country = 'us'): GameState => {
  const s = runCheat(
    runCheat(newLife({ country, birthYear: 1990 }, seed), 'age.set', { age: 30 }).state,
    'money.set',
    { amount: 100000 },
  ).state;
  return { ...s, cheats: { ...s.cheats, immortal: true } };
};

describe('money fixes', () => {
  it('a 30-year mortgage serviced yearly ends in year 30 and costs about 30 payments', () => {
    const s = clone(adult(1));
    s.money.cash = 1e9;
    const loan = addLoan(s, 'mortgage', 300000, 0.05, 30);
    const ctx = new Ctx(s);
    let paid = 0;
    let years = 0;
    while (s.money.loans.some((l) => l.id === loan.id) && years < 40) {
      paid += serviceLoans(ctx);
      years++;
    }
    expect(years).toBe(30);
    expect(paid / (30 * annuityPayment(300000, 0.05, 30))).toBeCloseTo(1, 2);
  });

  it('overdraft debt re-amortizes and is paid only from cash', () => {
    const s = clone(adult(2));
    s.money.cash = -10000;
    s.assets.housing = 'parents';
    // Under 23, a room at your parents' is free, which keeps this about the debt alone.
    s.player.age = 21;
    runFinances(new Ctx(s), { salary: 0, other: 0 });
    s.money.cash = -20000;
    runFinances(new Ctx(s), { salary: 0, other: 0 });
    const debt = s.money.loans.find((l) => l.kind === 'debt');
    expect(debt?.payment).toBe(Math.round(annuityPayment(debt?.balance ?? 0, 0.19, 5)));
    expect(s.money.cash).toBe(0);
  });

  it('repossession pays back the equity', () => {
    const s = clone(runCheat(adult(3), 'asset.spawn', { asset: 'home:house' }).state);
    const home = s.assets.homes[0];
    if (!home) throw new Error('home');
    home.value = 500000;
    addLoan(s, 'mortgage', 50000, 0.05, 30, home.id);
    s.money.cash = 0;
    const ctx = new Ctx(s);
    for (let i = 0; i < 3; i++) serviceLoans(ctx);
    expect(s.assets.homes).toHaveLength(0);
    expect(s.money.cash).toBeGreaterThan(300000);
    expect(s.money.loans.find((l) => l.kind === 'mortgage')).toBeUndefined();
  });

  it('casino money matches the outcome text and loses on average; the lottery is a bad bet', () => {
    let net = 0;
    for (let seed = 1; seed <= 300; seed++) {
      const s = runCheat(adult(seed), 'money.set', { amount: 10000 }).state;
      const r = act(s, { type: 'activity', id: 'casino' });
      net += r.state.money.cash - 10000;
      const text = r.log.find((l) => l.cat === 'activity')?.text ?? '';
      const money = r.log.find((l) => l.cat === 'money')?.text ?? '';
      if (/love you tonight/.test(text)) expect(money).toMatch(/up/);
      if (/lose steadily/.test(text)) expect(money).toMatch(/lighter/);
      if (/exactly what you came in with/.test(text)) expect(money).toBe('');
    }
    expect(net).toBeLessThan(0);
    let lottery = 0;
    for (let seed = 1; seed <= 200; seed++) {
      const s = runCheat(adult(seed), 'money.set', { amount: 1000 }).state;
      lottery += act(s, { type: 'activity', id: 'lottery' }).state.money.cash - 1000;
    }
    expect(lottery).toBeLessThan(0);
  });

  it('emigration converts last year’s breakdown too', () => {
    const s = clone(runCheat(adult(4), 'job.set', { job: 'accountant' }).state);
    runFinances(new Ctx(s), { salary: s.career.salary, other: 0 });
    const salary = s.money.last?.salary ?? 0;
    const moved = act(s, { type: 'emigrate', country: 'jp' }).state;
    expect((moved.money.last?.salary ?? 0) / salary).toBeGreaterThan(100);
  });
});

describe('content safety and gates', () => {
  it('mental illness never counts toward death', () => {
    const s = runCheat(
      runCheat(adult(5), 'illness.add', { illness: 'depression' }).state,
      'illness.add',
      { illness: 'anxiety_disorder' },
    ).state;
    expect(illnessRisks(s)).toEqual([]);
  });

  it('smoking waits until 18; bail renders as money', () => {
    const teen = runCheat(newLife({ country: 'uk', birthYear: 2000 }, 6), 'age.set', {
      age: 16,
    }).state;
    expect(() => act(teen, { type: 'activity', id: 'smoke' })).toThrow(/18/);
    let s = adult(7);
    for (let i = 0; i < 40 && !s.pending.some((p) => p.eventId === 'legal_arrest'); i++) {
      s = act(
        { ...s, pending: [], legal: { ...s.legal, case: null } },
        { type: 'crime', id: 'armed_robbery' },
      ).state;
    }
    const pe = s.pending.find((p) => p.eventId === 'legal_arrest');
    expect(pe).toBeDefined();
    const { popupView } = require_popup();
    expect(popupView(s, pe!)?.text).toMatch(/Bail is set at \$[\d,]+\./);
  });
});

import * as choose from '../../src/engine/events/choose';
function require_popup(): { popupView: typeof choose.popupView } {
  return { popupView: choose.popupView };
}
