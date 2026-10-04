import { describe, expect, it } from 'vitest';
import {
  act,
  ageUp,
  formatMoney,
  money,
  newLife,
  runCheat,
  type GameState,
} from '../../src/engine';
import {
  annuityPayment,
  balanceAfter,
  addLoan,
  serviceLoans,
} from '../../src/engine/systems/loans';
import { INVESTMENTS, runFinances } from '../../src/engine/systems/finance';
import { Ctx } from '../../src/engine/ctx';
import { Rng, seedRng } from '../../src/engine/rng';
import { stepInflation } from '../../src/engine/age';
import { refToLocal } from '../../src/engine/economy';
import { clone } from '../../src/engine/util';
import { COUNTRY_BY_ID } from '../../src/content/countries';
import { playYears } from '../helpers';

const adult = (seed = 1, country = 'us'): GameState => {
  const s = runCheat(newLife({ country, birthYear: 1996 }, seed), 'age.set', { age: 30 }).state;
  return { ...s, cheats: { ...s.cheats, immortal: true, noBadEvents: true } };
};

describe('annual finances (M7.1)', () => {
  it('pays salary, then tax, living costs, loans, interest and returns, and records the breakdown', () => {
    const s = clone(
      runCheat(runCheat(adult(1), 'job.set', { job: 'accountant' }).state, 'money.set', {
        amount: 50000,
      }).state,
    );
    s.assets.housing = 'renting';
    s.money.savings = 10000;
    s.money.holdings.index = 10000;
    const ctx = new Ctx(s);
    runFinances(ctx, { salary: s.career.salary, other: 0 });
    const r = s.money.last;
    expect(r?.salary).toBe(s.career.salary);
    expect(r?.tax).toBeGreaterThan(0);
    expect(r?.living).toBeGreaterThan(0);
    expect(r?.housing).toBeGreaterThan(0);
    expect(r?.interest).toBeGreaterThan(0);
    expect(r?.investReturn).not.toBe(0);
    expect(s.money.history.at(-1)?.[0]).toBe(s.year);
  });

  it('lavish living costs more than frugal', () => {
    const run = (lifestyle: 'frugal' | 'lavish'): number => {
      const s = clone(adult(2));
      s.assets.housing = 'renting';
      s.money.lifestyle = lifestyle;
      runFinances(new Ctx(s), { salary: 0, other: 0 });
      return s.money.last?.living ?? 0;
    };
    expect(run('lavish')).toBeGreaterThan(run('frugal') * 2);
  });

  it('turns negative cash into high-interest debt', () => {
    const s = clone(adult(3));
    s.money.cash = -5000;
    s.assets.housing = 'parents';
    runFinances(new Ctx(s), { salary: 0, other: 0 });
    expect(s.money.cash).toBe(0);
    const debt = s.money.loans.find((l) => l.kind === 'debt');
    expect(debt?.balance).toBe(5000);
    expect(debt?.rate).toBeGreaterThan(0.15);
  });
});

describe('inflation and local currency (M7.2)', () => {
  it('averages about 2.5% with ±1.5 points of seeded noise and never goes negative', () => {
    const s = clone(adult(4));
    const ctx = new Ctx(s);
    const rates: number[] = [];
    for (let i = 0; i < 2000; i++) {
      const before = s.inflation;
      stepInflation(ctx);
      rates.push(s.inflation / before - 1);
      s.inflation = 1;
    }
    const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
    expect(mean).toBeGreaterThan(0.023);
    expect(mean).toBeLessThan(0.027);
    expect(Math.min(...rates)).toBeGreaterThanOrEqual(0.01 - 1e-9);
    expect(Math.max(...rates)).toBeLessThanOrEqual(0.04 + 1e-9);
    s.inflationMult = 0;
    stepInflation(ctx);
    expect(s.inflation).toBe(1);
  });

  it('shows money in the local currency at the current price level', () => {
    const us = adult(5, 'us');
    const jp = adult(5, 'jp');
    const ng = adult(5, 'ng');
    expect(formatMoney(us, money(us, 1000))).toMatch(/^\$/);
    expect(formatMoney(jp, money(jp, 1000))).toMatch(/^¥/);
    expect(refToLocal(ng, 1000) / refToLocal(us, 1000)).toBeGreaterThan(100);
    const later = playYears(us, 10);
    expect(money(later, 1000)).toBeGreaterThan(money(us, 1000));
  });
});

describe('savings and investments (M7.3)', () => {
  it('savings earn 1–4%', () => {
    let s = clone(adult(6));
    s.money.savings = 100000;
    for (let i = 0; i < 20; i++) {
      s = ageUp({ ...s, pending: [] }).state;
      expect(s.money.savingsRate).toBeGreaterThanOrEqual(0.01);
      expect(s.money.savingsRate).toBeLessThanOrEqual(0.04);
    }
    expect(s.money.savings).toBeGreaterThan(100000);
  });

  it('four vehicles with their own seeded volatility, and the coin can crash', () => {
    expect(Object.keys(INVESTMENTS)).toEqual(['bonds', 'index', 'growth', 'coin']);
    const r = new Rng(seedRng(1));
    const sample = (k: keyof typeof INVESTMENTS): number[] =>
      Array.from({ length: 4000 }, () => r.normal(INVESTMENTS[k].mean, INVESTMENTS[k].sd));
    const sd = (xs: number[]): number => {
      const m = xs.reduce((a, b) => a + b, 0) / xs.length;
      return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length);
    };
    expect(sd(sample('bonds'))).toBeLessThan(sd(sample('growth')));
    let crashed = false;
    let s = clone(adult(7));
    s.money.holdings.coin = 1e6;
    for (let i = 0; i < 60 && !crashed; i++) {
      const before = s.money.holdings.coin;
      s = ageUp({ ...s, pending: [] }).state;
      if (s.money.holdings.coin <= before * 0.12) crashed = true;
    }
    expect(crashed).toBe(true);
  });

  it('buys and sells any amount', () => {
    let s = runCheat(adult(8), 'money.set', { amount: 10000 }).state;
    s = act(s, { type: 'money', action: { op: 'invest', key: 'index', amount: 4000 } }).state;
    expect(s.money.holdings.index).toBe(4000);
    expect(s.money.cash).toBe(6000);
    s = act(s, { type: 'money', action: { op: 'divest', key: 'index', amount: 1500 } }).state;
    expect(s.money.holdings.index).toBe(2500);
    s = act(s, { type: 'money', action: { op: 'deposit', amount: 7500 } }).state;
    expect(s.money.savings).toBe(7500);
    s = act(s, { type: 'money', action: { op: 'withdraw', amount: 500 } }).state;
    expect(s.money.cash).toBe(500);
  });
});

describe('loans (M7.4)', () => {
  it('amortizes correctly against known values', () => {
    expect(annuityPayment(100000, 0.05, 30)).toBeCloseTo(6505.14, 2);
    expect(annuityPayment(200000, 0.06, 15)).toBeCloseTo(20592.55, 2);
    expect(annuityPayment(12000, 0, 4)).toBe(3000);
    expect(balanceAfter(100000, 0.05, 30, 30)).toBeCloseTo(0, 6);
    // Closed form: P(1+r)^k − pay·((1+r)^k − 1)/r = 81,068.43.
    expect(balanceAfter(100000, 0.05, 30, 10)).toBeCloseTo(81068.43, 1);
  });

  it('missed payments bring penalties, stress, and repossession of collateral', () => {
    const s = clone(runCheat(adult(9), 'asset.spawn', { asset: 'home:house' }).state);
    const home = s.assets.homes[0];
    if (!home) throw new Error('home');
    addLoan(s, 'mortgage', 300000, 0.05, 30, home.id);
    s.money.cash = 0;
    const stress = s.player.stats.stress;
    const ctx = new Ctx(s);
    for (let i = 0; i < 3; i++) serviceLoans(ctx);
    expect(s.player.stats.stress).toBeGreaterThan(stress);
    expect(s.assets.homes).toHaveLength(0);
    expect(s.log.some((l) => l.text.includes('repossesses'))).toBe(true);
  });

  it('personal loans and early payoff', () => {
    let s = runCheat(adult(10), 'job.set', { job: 'accountant' }).state;
    s = act(s, { type: 'money', action: { op: 'borrow', amount: 5000 } }).state;
    const loan = s.money.loans.find((l) => l.kind === 'personal');
    expect(loan?.balance).toBe(5000);
    s = runCheat(s, 'money.add', { amount: 10000 }).state;
    s = act(s, { type: 'money', action: { op: 'payoff', loanId: loan?.id ?? 0 } }).state;
    expect(s.money.loans.find((l) => l.kind === 'personal')).toBeUndefined();
  });
});

describe('homes (M7.5)', () => {
  it('generates listings by type, condition, and country price level', () => {
    const us = playYears(adult(11, 'us'), 1);
    const ng = playYears(adult(11, 'ng'), 1);
    expect(us.assets.listings.length).toBe(5);
    for (const l of us.assets.listings) expect(l.condition).toBeGreaterThanOrEqual(25);
    const avg = (s: GameState): number =>
      s.assets.listings.reduce((t, l) => t + refToLocalInverse(s, l.price), 0) /
      s.assets.listings.length;
    expect(avg(ng)).toBeLessThan(avg(us));
  });

  it('buys with cash or a mortgage, sells, appreciates, and costs maintenance', () => {
    let s = runCheat(
      runCheat(playYears(adult(12), 1), 'money.set', { amount: 1e7 }).state,
      'job.set',
      { job: 'lawyer' },
    ).state;
    const price = s.assets.listings[0]?.price ?? 0;
    const cashBuy = act(s, { type: 'buy_home', index: 0, financing: { kind: 'cash' } }).state;
    expect(cashBuy.assets.homes).toHaveLength(1);
    expect(cashBuy.money.cash).toBe(1e7 - price);
    expect(cashBuy.assets.housing).toBe('owning');
    const mort = act(s, {
      type: 'buy_home',
      index: 0,
      financing: { kind: 'mortgage', years: 30, down: 0.1 },
    }).state;
    const loan = mort.money.loans.find((l) => l.kind === 'mortgage');
    expect(loan?.balance).toBe(price - Math.round(price * 0.1));
    expect(loan?.collateral).toBe(mort.assets.homes[0]?.id);
    expect(loan?.rate).toBeGreaterThanOrEqual(0.03);
    expect(loan?.rate).toBeLessThanOrEqual(0.08);
    const sold = act(mort, { type: 'sell_asset', id: mort.assets.homes[0]?.id ?? 0 }).state;
    expect(sold.assets.homes).toHaveLength(0);
    expect(sold.money.loans.find((l) => l.kind === 'mortgage')).toBeUndefined();
    // Appreciation over decades, maintenance and condition decay.
    s = cashBuy;
    const v0 = s.assets.homes[0]?.value ?? 0;
    const c0 = s.assets.homes[0]?.condition ?? 0;
    s = playYears(s, 20);
    expect(s.assets.homes[0]?.value).toBeGreaterThan(v0);
    expect(s.assets.homes[0]?.condition).toBeLessThan(c0);
    expect(s.money.last?.maintenance).toBeGreaterThan(0);
    s = act(s, { type: 'renovate', id: s.assets.homes[0]?.id ?? 0 }).state;
    expect(s.assets.homes[0]?.condition).toBeGreaterThan(c0 - 40);
  });
});

/** Local currency to US dollars at the fixed exchange rate. */
function refToLocalInverse(s: GameState, local: number): number {
  return (
    ((local / refToLocal(s, 1, 'price', s.player.country)) *
      refToLocal(s, 1, 'price', s.player.country)) /
    (COUNTRY_BY_ID[s.player.country]?.currency.perUsd ?? 1) /
    s.inflation
  );
}

describe('vehicles, possessions, licence (M7.6)', () => {
  it('vehicles depreciate about 15% a year and lose condition; possessions too', () => {
    let s = runCheat(adult(13), 'money.set', { amount: 1e6 }).state;
    s = act(s, { type: 'buy_vehicle', model: 'brisk_sedan', financed: false }).state;
    s = act(s, { type: 'buy_item', item: 'gaming_laptop' }).state;
    s = act(s, { type: 'buy_item', item: 'acoustic_guitar' }).state;
    const v0 = s.assets.vehicles[0]?.value ?? 0;
    const l0 = s.assets.possessions[0]?.value ?? 0;
    const g0 = s.player.skills['instrument'] ?? 0;
    const next = playYears(s, 1);
    const ratio = (next.assets.vehicles[0]?.value ?? 0) / v0;
    expect(ratio).toBeGreaterThan(0.75);
    expect(ratio).toBeLessThan(0.95);
    expect(next.assets.vehicles[0]?.condition).toBeLessThan(100);
    expect(next.assets.possessions[0]?.value).toBeLessThan(l0);
    expect(next.player.skills['instrument']).toBeGreaterThan(g0);
  });

  it('accidents are tied to driving and condition', () => {
    let crashes = 0;
    for (let seed = 1; seed <= 40; seed++) {
      let s = clone(
        runCheat(adult(seed), 'asset.spawn', { asset: 'vehicle:ridgeback_motorbike' }).state,
      );
      const v = s.assets.vehicles[0];
      if (v) v.condition = 5;
      s.player.traits = ['reckless'];
      s = playYears(s, 3);
      if (s.log.some((l) => /crash|scrape/.test(l.text))) crashes++;
    }
    expect(crashes).toBeGreaterThan(3);
  });

  it('the driving test is available from the country driving age', () => {
    const at15 = runCheat(newLife({ country: 'us', birthYear: 2000 }, 14), 'age.set', {
      age: 15,
    }).state;
    expect(() => act(at15, { type: 'activity', id: 'driving_test' })).toThrow(
      /driving age here is 16/,
    );
    const at16 = runCheat({ ...at15, cheats: { ...at15.cheats, forceSuccess: true } }, 'age.set', {
      age: 16,
    }).state;
    expect(
      act(runCheat(at16, 'money.add', { amount: 1000 }).state, {
        type: 'activity',
        id: 'driving_test',
      }).state.assets.licence,
    ).toBe(true);
    const uk = runCheat(newLife({ country: 'uk', birthYear: 2000 }, 14), 'age.set', {
      age: 16,
    }).state;
    expect(() =>
      act(runCheat(uk, 'money.add', { amount: 1000 }).state, {
        type: 'activity',
        id: 'driving_test',
      }),
    ).toThrow(/17/);
  });
});
