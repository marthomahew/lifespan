import { describe, expect, it } from 'vitest';
import { act, ageUp, newLife, runCheat, type GameState } from '../../src/engine';

const hired = (
  job: string,
  birthYear: number,
  country = 'us',
  seed = 5000,
  age = 30,
): GameState => {
  let s = runCheat(newLife({ birthYear, country }, seed), 'age.set', { age }).state;
  s = runCheat({ ...s, pending: [] }, 'job.set', { job }).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true } };
};
const years = (s: GameState, n: number): GameState => {
  let t = s;
  for (let i = 0; i < n; i++) t = { ...ageUp({ ...t, pending: [] }).state, pending: [] };
  return t;
};

describe('careers measured in what you did', () => {
  it('an astronaut trains, flies era-appropriate missions and rises with flights; 1960s crews can walk on the Moon', () => {
    // Born 1940, hired at 26 (1966): training, then the Apollo and Skylab years.
    let s = years(hired('astronaut', 1940, 'us', 5000, 26), 14);
    expect(s.missions?.org).toBe('NASA');
    expect(s.missions?.log.length ?? 0).toBeGreaterThanOrEqual(2);
    expect(s.career.level).toBeGreaterThanOrEqual(2);
    expect(s.missions?.log.some((x) => /Gemini|Apollo|Skylab|Mercury/.test(x.what))).toBe(true);
    s = years(hired('astronaut', 1980, 'us', 5001), 12);
    expect(s.missions?.log.some((x) => /ISS|Soyuz|Dragon|Artemis/.test(x.what))).toBe(true);
    expect(s.missions?.days ?? 0).toBeGreaterThan(100);
  });

  it('a spy runs operations abroad that build heat; lying low cools it', () => {
    let s = years(hired('intelligence_officer', 1980), 3);
    expect(s.career.level).toBeGreaterThanOrEqual(1);
    s = act(s, { type: 'mission', id: 'operation' }).state;
    expect(s.missions?.log.length ?? 0).toBeGreaterThan(0);
    const heat = s.missions?.heat ?? 0;
    s = act(s, { type: 'mission', id: 'lie_low' }).state;
    expect(s.missions?.heat ?? 0).toBeLessThan(heat);
  });

  it('a diplomat is posted abroad, moves every three years, and negotiates', () => {
    let s = years(hired('diplomat', 1980, 'uk'), 1);
    const first = s.missions?.post;
    expect(first).toBeDefined();
    s = act(s, { type: 'mission', id: 'negotiate' }).state;
    expect(s.missions?.log.some((x) => /treaty|talks/.test(x.what))).toBe(true);
    s = years(s, 3);
    expect(
      s.missions?.log.filter((x) => x.what.startsWith('posted to')).length,
    ).toBeGreaterThanOrEqual(2);
  });
});
