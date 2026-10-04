import { describe, expect, it } from 'vitest';
import { newLife, obituary } from '../../src/engine';
import {
  baseHazard,
  deathProbability,
  healthMultiplier,
  MORTALITY_A,
  MORTALITY_B,
} from '../../src/engine/mortality';
import { playToDeath, playYears } from '../helpers';
import { clone } from '../../src/engine/util';

describe('mortality (M1.6)', () => {
  it('uses the Gompertz base hazard', () => {
    expect(baseHazard(50)).toBeCloseTo(MORTALITY_A * Math.exp(MORTALITY_B * 50), 12);
    expect(baseHazard(200)).toBe(0.9);
  });

  it('puts a healthy median near 83', () => {
    // Survival S(x) = exp(-sum q). Find the median analytically.
    let surv = 1;
    let age = 0;
    while (surv > 0.5) {
      surv *= 1 - baseHazard(age);
      age++;
    }
    expect(age).toBeGreaterThanOrEqual(80);
    expect(age).toBeLessThanOrEqual(86);
  });

  it('scales with health per SPEC §3.5', () => {
    expect(healthMultiplier(60)).toBe(1);
    expect(healthMultiplier(75)).toBe(1);
    expect(healthMultiplier(0)).toBe(4);
    expect(healthMultiplier(30)).toBeCloseTo(2.5, 10);
    expect(healthMultiplier(90)).toBe(0.85);
  });

  it('raises risk for prison, deployment and addiction', () => {
    const s = clone(newLife({}, 1));
    s.player.age = 50;
    s.player.stats.health = 70;
    const base = deathProbability(s);
    s.vices.levels.hard_drugs = 80;
    expect(deathProbability(s)).toBeGreaterThan(base * 2);
  });

  it('every life ends with a recorded cause by 120, with obituary data', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const s = playToDeath(newLife({}, seed));
      expect(s.death).not.toBeNull();
      expect(s.player.age).toBeLessThanOrEqual(120);
      expect(s.death?.cause.length).toBeGreaterThan(3);
      const ob = obituary(s);
      expect(ob?.cause).toBe(s.death?.cause);
      expect(ob?.title.length).toBeGreaterThan(0);
      expect(ob?.summary.length).toBeGreaterThan(0);
      expect(s.log.at(-1)?.cat).toBe('death');
      expect(s.dynasty).toHaveLength(1);
    }
  });

  it('immortality prevents death', () => {
    const s0 = newLife({}, 5);
    const s = { ...s0, cheats: { ...s0.cheats, immortal: true } };
    const cur = playYears(s, 130);
    expect(cur.death).toBeNull();
    expect(cur.player.age).toBe(130);
  });
});
