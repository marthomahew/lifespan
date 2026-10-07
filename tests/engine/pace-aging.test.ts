import { describe, expect, it } from 'vitest';
import { ageUp, newLife, runCheat, type GameState } from '../../src/engine';
import { freeTime, workTime } from '../../src/engine/systems/activities';

const adult = (age: number, seed = 5100): GameState => {
  const s = runCheat(newLife({ birthYear: 1950, country: 'us' }, seed), 'age.set', { age }).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true } };
};
const years = (s: GameState, n: number): GameState => {
  let t = s;
  for (let i = 0; i < n; i++) t = { ...ageUp({ ...t, pending: [] }).state, pending: [] };
  return t;
};

describe('pace and aging', () => {
  it('the pace setting gives more or fewer pips', () => {
    const s = adult(30);
    const std = freeTime(s).total;
    const relaxed = { ...s, settings: { ...s.settings, pace: 'relaxed' as const } };
    const hard = { ...s, settings: { ...s.settings, pace: 'challenging' as const } };
    expect(freeTime(relaxed).total).toBe(std + 3);
    expect(freeTime(hard).total).toBe(Math.max(2, std - 2));
    expect(workTime(relaxed).total).toBe(9);
    expect(workTime(hard).total).toBe(4);
  });

  it('athletics fades through the thirties while cooking holds into old age', () => {
    let s = adult(32);
    s = {
      ...s,
      player: { ...s.player, skills: { ...s.player.skills, athletics: 90, cooking: 90 } },
    };
    s = years(s, 15);
    expect(s.player.skills['athletics'] ?? 0).toBeLessThan(75);
    // Cooking only rusts from disuse (a point a year after four idle years).
    expect(s.player.skills['cooking'] ?? 0).toBeGreaterThan(s.player.skills['athletics'] ?? 0);
  });

  it('language decay can be switched off', () => {
    let s = adult(40, 5101);
    s = { ...s, player: { ...s.player, languages: { ...s.player.languages, japanese: 60 } } };
    const off = years({ ...s, settings: { ...s.settings, languageDecay: false } }, 10);
    expect(off.player.languages['japanese']).toBe(60);
    const on = years(s, 10);
    expect(on.player.languages['japanese'] ?? 0).toBeLessThan(60);
  });
});
