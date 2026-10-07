import { describe, expect, it } from 'vitest';
import { act, ageUp, newLife, runCheat, type GameState } from '../../src/engine';
import { inRecession, marketReturn, priceIndex, priceUsd } from '../../src/engine/systems/markets';
import { mortgageRate } from '../../src/engine/systems/assets';

const at = (birthYear: number, age: number, seed = 2900): GameState => {
  let s = runCheat(newLife({ birthYear, country: 'us' }, seed), 'age.set', { age }).state;
  s = runCheat({ ...s, pending: [] }, 'money.set', { amount: 1_000_000 }).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true, noBadEvents: true } };
};

describe('markets that follow history', () => {
  it('prices, rates and returns are those of the year', () => {
    expect(priceIndex(1980)).toBeCloseTo(82.4 / 330, 3);
    expect(marketReturn(2008, 'index')).toBeCloseTo(-0.37, 2);
    expect(marketReturn(1999, 'growth')).toBeCloseTo(0.856, 2);
    expect(inRecession(2009)).toBe(true);
    expect(inRecession(2017)).toBe(false);
    const in1981 = at(1955, 26);
    expect(in1981.year).toBe(1981);
    expect(mortgageRate(in1981)).toBeGreaterThan(0.14);
    expect(mortgageRate(at(1990, 31))).toBeLessThan(0.05);
  });

  it('a life born in 1960 sees 1960s prices', () => {
    const s = newLife({ birthYear: 1960, country: 'us' }, 2901);
    expect(s.inflation).toBeLessThan(0.12);
    expect(newLife({ birthYear: 2020, country: 'us' }, 2902).inflation).toBeGreaterThan(0.75);
  });

  it('Nvidia bought in 2015 is worth a fortune by 2024; Apple doesn’t exist in 1975', () => {
    expect(priceUsd(at(1950, 25), 'AAPL')).toBeNull();
    let s = at(1985, 30);
    expect(s.year).toBe(2015);
    s = act(s, { type: 'shares', id: 'NVDA', op: 'buy', amount: 10000 }).state;
    for (let i = 0; i < 9; i++) s = ageUp({ ...s, pending: [] }).state;
    expect(s.year).toBe(2024);
    const n = s.money.shares?.['NVDA'] ?? 0;
    expect(n * (priceUsd(s, 'NVDA') ?? 0)).toBeGreaterThan(1_000_000);
  });

  it('after the record ends, prices keep moving', () => {
    let s = at(2000, 25);
    expect(s.year).toBe(2025);
    s = ageUp(s).state;
    s = ageUp({ ...s, pending: [] }).state;
    expect(priceUsd(s, 'AAPL')).not.toBe(priceUsd(at(2000, 25), 'AAPL'));
    expect(priceUsd(s, 'AAPL') ?? 0).toBeGreaterThan(0);
  });

  it('an early miner holds coins that become a fortune, unless the drive goes in the bin', async () => {
    const { choose, currentPopup } = await import('../../src/engine');
    let s = runCheat(at(1985, 25), 'skill.set', { skill: 'programming', value: 60 }).state;
    expect(s.year).toBe(2010);
    s = runCheat({ ...s, pending: [] }, 'event.fire', { event: 'mk_btc_forum', force: 'on' }).state;
    expect(currentPopup(s)?.eventId).toBe('mk_btc_forum');
    s = choose(s, 'mine').state;
    expect(s.money.shares?.['BTC']).toBe(300);
    expect(s.chains.some((c) => c.eventId === 'mk_btc_drive')).toBe(true);
    const binned = runCheat(s, 'event.fire', { event: 'mk_btc_drive', force: 'on' }).state;
    expect(choose(binned, 'bin').state.money.shares?.['BTC'] ?? 0).toBe(0);
  });

  it('mining in 2009 makes thousands of coins; later, anyone can hear about bitcoin', async () => {
    const { choose, currentPopup } = await import('../../src/engine');
    let s = runCheat(at(1990, 19), 'skill.set', { skill: 'programming', value: 35 }).state;
    expect(s.year).toBe(2009);
    s = runCheat({ ...s, pending: [] }, 'event.fire', { event: 'mk_btc_forum', force: 'on' }).state;
    s = choose(s, 'mine').state;
    expect(s.money.shares?.['BTC']).toBe(2500);
    let anyone: GameState = { ...at(1980, 33), pending: [] };
    expect(anyone.year).toBe(2013);
    anyone = { ...anyone, money: { ...anyone.money, cash: 5000 } };
    anyone = runCheat(anyone, 'event.fire', { event: 'mk_btc_word', force: 'on' }).state;
    expect(currentPopup(anyone)?.eventId).toBe('mk_btc_word');
    anyone = choose(anyone, 'big').state;
    expect(anyone.money.shares?.['BTC'] ?? 0).toBeGreaterThan(0);
  });

  it('anyone can buy bitcoin from 2009, but only a little a year while it is young', () => {
    const plain = runCheat(at(1980, 29), 'money.add', { amount: 1_000_000 }).state;
    expect(plain.year).toBe(2009);
    const bought = act(plain, { type: 'shares', id: 'BTC', op: 'buy', amount: 1_000_000 }).state;
    expect(bought.money.shares?.['BTC']).toBeCloseTo(100, 5);
    expect(plain.money.cash - bought.money.cash).toBeLessThan(10);
    expect(() => act(bought, { type: 'shares', id: 'BTC', op: 'buy', amount: 100 })).toThrow(
      /nobody will sell/,
    );
    const coder = runCheat(plain, 'skill.set', { skill: 'programming', value: 35 }).state;
    expect(
      act(coder, { type: 'shares', id: 'BTC', op: 'buy', amount: 1_000_000 }).state.money.shares?.[
        'BTC'
      ],
    ).toBeCloseTo(1000, 5);
    const later = runCheat(at(1980, 38), 'money.add', { amount: 1_000_000 }).state;
    expect(later.year).toBe(2018);
    const big = act(later, { type: 'shares', id: 'BTC', op: 'buy', amount: 500_000 }).state;
    expect(later.money.cash - big.money.cash).toBe(500_000);
  });

  it('a child invests through an account a parent opens in their name', () => {
    const kid = runCheat(at(2000, 12), 'money.add', { amount: 5000 }).state;
    const after = act(kid, { type: 'shares', id: 'AAPL', op: 'buy', amount: 1000 }).state;
    expect(after.money.shares?.['AAPL'] ?? 0).toBeGreaterThan(0);
    const fund = act(kid, {
      type: 'money',
      action: { op: 'invest', key: 'index', amount: 1000 },
    }).state;
    expect(fund.money.holdings.index).toBe(1000);
    const orphan = {
      ...kid,
      npcs: kid.npcs.map((n) =>
        n.roles.some((r) => ['mother', 'father', 'stepparent', 'grandparent'].includes(r))
          ? { ...n, alive: false }
          : n,
      ),
    };
    expect(() => act(orphan, { type: 'shares', id: 'AAPL', op: 'buy', amount: 1000 })).toThrow(
      /guardian/,
    );
  });

  it('the speculative coin fund stays simulated, not a back door into bitcoin’s history', () => {
    for (const y of [2011, 2013, 2017, 2020]) expect(marketReturn(y, 'coin')).toBeNull();
    expect(marketReturn(2017, 'index')).not.toBeNull();
  });
});
