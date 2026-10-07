import { describe, expect, it } from 'vitest';
import { act, activitiesFor, ageUp, newLife, runCheat, type GameState } from '../../src/engine';
import { focusForecast } from '../../src/engine/systems/focus';

const life = (age: number, seed = 2100): GameState => {
  const s = runCheat(newLife({ birthYear: 1990, country: 'us' }, seed), 'age.set', { age }).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true, noBadEvents: true } };
};

describe('seeing what a choice will do', () => {
  it('activities show the range of their effects and how often they go well', () => {
    const gym = activitiesFor(life(30)).find((a) => a.id === 'gym');
    expect(gym?.preview).toMatch(/❤️ (up to )?\+\d/);
    const practice = activitiesFor(life(30)).find((a) => a.id === 'practice_skill');
    expect(practice?.preview).toMatch(/the skill you pick/);
  });

  it('the focus forecast is what the year then brings', () => {
    let s = act(life(20), { type: 'focus', target: 'cooking' }).state;
    const forecast = focusForecast(s, 'cooking');
    const before = s.player.skills['cooking'] ?? 0;
    s = ageUp(s).state;
    // (Events in the year can add a point or two of their own.)
    expect((s.player.skills['cooking'] ?? 0) - before).toBeGreaterThanOrEqual(forecast);
    expect((s.player.skills['cooking'] ?? 0) - before).toBeLessThanOrEqual(forecast + 6);
  });

  it('clubs are real clubs: the one you pick, with its own skill', () => {
    let s = life(30);
    s = act(s, { type: 'activity', id: 'join_club', params: { club: 'chess' } }).state;
    expect(s.log.at(-1)?.text.startsWith('♟️') || s.log.some((l) => l.text.startsWith('♟️'))).toBe(
      true,
    );
    expect(s.player.skills['chess'] ?? 0).toBeGreaterThan(0);
  });
});
