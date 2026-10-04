import { describe, expect, it } from 'vitest';
import { ageUp, newLife, stageOf, EngineError } from '../../src/engine';
import { readFileSync } from 'node:fs';
import { playYears } from '../helpers';

describe('ageUp (M1.5)', () => {
  it('adds one year to age and world year and moves inflation', () => {
    const s = newLife({ birthYear: 2000 }, 1);
    const step = ageUp(s);
    expect(step.state.player.age).toBe(1);
    expect(step.state.year).toBe(2001);
    expect(step.state.inflation).toBeGreaterThanOrEqual(s.inflation);
  });

  it('returns the new log entries for the year', () => {
    let s = newLife({}, 2);
    let total = 0;
    for (let i = 0; i < 20; i++) {
      s = { ...s, pending: [] };
      const step = ageUp(s);
      expect(step.state.log.slice(s.log.length)).toEqual(step.log);
      total += step.log.length;
      s = step.state;
    }
    expect(total).toBeGreaterThan(0);
  });

  it('switches life stages at the SPEC ages and logs each one', () => {
    const bounds: [number, string][] = [
      [2, 'infant'],
      [3, 'child'],
      [12, 'child'],
      [13, 'teen'],
      [17, 'teen'],
      [18, 'young_adult'],
      [29, 'young_adult'],
      [30, 'adult'],
      [49, 'adult'],
      [50, 'middle_age'],
      [64, 'middle_age'],
      [65, 'senior'],
    ];
    for (const [age, stage] of bounds) expect(stageOf(age)).toBe(stage);
    let s = newLife({}, 3);
    s = { ...s, cheats: { ...s.cheats, immortal: true } };
    s = playYears(s, 66);
    const stageLines = s.log.filter((l) => l.text.startsWith('You are now'));
    expect(stageLines.map((l) => l.age)).toEqual([3, 13, 18, 30, 50, 65]);
  });

  it('refuses to age up a finished life', () => {
    const s = newLife({}, 4);
    const dead = { ...s, death: { year: s.year, age: 0, cause: 'x', title: 'y' } };
    expect(() => ageUp(dead)).toThrow(EngineError);
  });

  it('runs the year in the SPEC §3.4 order', () => {
    const src = readFileSync('src/engine/systems/index.ts', 'utf8');
    const order = [
      '// 2. Finances',
      '// 3. Drift',
      '// 4. System ticks',
      '// 5. Chain steps',
      '// 6. Random events',
    ];
    const idx = order.map((o) => src.indexOf(o));
    for (const i of idx) expect(i).toBeGreaterThan(-1);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
    const age = readFileSync('src/engine/age.ts', 'utf8');
    expect(age.indexOf('// 1. Age')).toBeLessThan(age.indexOf('runYearSystems(ctx'));
    expect(age.indexOf('runYearSystems(ctx')).toBeLessThan(age.indexOf('// 7. Mortality'));
    expect(age.indexOf('// 7. Mortality')).toBeLessThan(age.indexOf('// 8. Records'));
  });
});
