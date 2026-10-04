import { describe, expect, it } from 'vitest';
import { newLife, ALL_STATS, type GameState } from '../../src/engine';
import {
  addStat,
  driftStats,
  healthBaseline,
  looksBaseline,
  type Circumstances,
} from '../../src/engine/stats';
import { Ctx } from '../../src/engine/ctx';
import { playYears } from '../helpers';
import { clone } from '../../src/engine/util';

function immortal(seed: number): GameState {
  const s = newLife({ country: 'us', birthYear: 1990 }, seed);
  return { ...s, cheats: { ...s.cheats, immortal: true } };
}

describe('stats (M1.4)', () => {
  it('clamps to integers in 0..100', () => {
    const s = clone(newLife({}, 1));
    addStat(s, 'happiness', 1000);
    expect(s.player.stats.happiness).toBe(100);
    addStat(s, 'health', -1000);
    expect(s.player.stats.health).toBe(0);
    addStat(s, 'smarts', 0.4);
    expect(Number.isInteger(s.player.stats.smarts)).toBe(true);
  });

  it('stays in range every year', () => {
    let s = immortal(3);
    for (let i = 0; i < 100; i++) {
      s = playYears(s, 1);
      for (const k of ALL_STATS) {
        const v = s.player.stats[k];
        expect(Number.isInteger(v)).toBe(true);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      }
    }
  });

  it('health declines slowly from 30 and faster after 60', () => {
    expect(healthBaseline(30, 80) - healthBaseline(40, 80)).toBeCloseTo(3.5, 5);
    expect(healthBaseline(70, 80) - healthBaseline(80, 80)).toBeGreaterThan(10);
    // On average across lives.
    const avg = (age: number): number => {
      let t = 0;
      for (let seed = 1; seed <= 40; seed++)
        t += playYears(immortal(seed), age).player.stats.health;
      return t / 40;
    };
    const h25 = avg(25);
    const h55 = avg(55);
    const h80 = avg(80);
    expect(h25).toBeGreaterThan(h55);
    expect(h55 - h80).toBeGreaterThan(h25 - h55);
  });

  it('looks peak around 20–35', () => {
    expect(looksBaseline(28, 80)).toBe(80);
    expect(looksBaseline(10, 80)).toBeLessThan(80);
    expect(looksBaseline(60, 80)).toBeLessThan(70);
  });

  it('smarts grows through the school years', () => {
    let t5 = 0;
    let t18 = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const s = immortal(seed);
      t5 += playYears(s, 5).player.stats.smarts;
      t18 += playYears(s, 18).player.stats.smarts;
    }
    expect(t18 / 20).toBeGreaterThan(t5 / 20 + 15);
  });

  it('debt raises stress', () => {
    let calm = 0;
    let stressed = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const base = playYears(immortal(seed), 30);
      calm += playYears(base, 3).player.stats.stress;
      const indebted = clone(base);
      indebted.money.loans.push({
        id: 99,
        kind: 'personal',
        principal: 1e6,
        balance: 1e6,
        rate: 0,
        termYears: 30,
        payment: 0,
        yearsPaid: 0,
        missed: 0,
      });
      stressed += playYears(indebted, 3).player.stats.stress;
    }
    expect(stressed).toBeGreaterThan(calm);
  });

  it('prison raises Stress and lowers Happiness; close relationships lift Happiness', () => {
    const c: Circumstances = {
      debtLoad: 0,
      inPrison: false,
      closeRel: 50,
      jobStress: 0,
      lifestyle: 0,
      studied: false,
      inEducation: false,
    };
    const drift = (over: Partial<Circumstances>): GameState => {
      const s = clone(immortal(21));
      s.player.age = 35;
      driftStats(new Ctx(s), { ...c, ...over });
      return s;
    };
    const free = drift({});
    const jailed = drift({ inPrison: true });
    expect(jailed.player.stats.stress).toBeGreaterThan(free.player.stats.stress);
    expect(jailed.player.stats.happiness).toBeLessThan(free.player.stats.happiness);
    expect(drift({ closeRel: 95 }).player.stats.happiness).toBeGreaterThan(
      drift({ closeRel: 10 }).player.stats.happiness,
    );
  });

  it('locked stats stay at their lock', () => {
    const s = immortal(4);
    const locked = { ...s, cheats: { ...s.cheats, locks: { happiness: 13 } } };
    const after = playYears(locked, 20);
    expect(after.player.stats.happiness).toBe(13);
  });
});
