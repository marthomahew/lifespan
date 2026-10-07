import { describe, expect, it } from 'vitest';
import {
  act,
  ageUp,
  choose,
  currentPopup,
  freeTime,
  newLife,
  runCheat,
  type GameState,
} from '../../src/engine';
import { SPECIAL_PATHS } from '../../src/content/special-paths';

const kid = (seed: number, opts: Parameters<typeof newLife>[0] = {}): GameState => {
  const s = runCheat(newLife({ birthYear: 2000, country: 'us', ...opts }, seed), 'age.set', {
    age: 7,
  }).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true, noBadEvents: true } };
};
function seasons(s: GameState, n: number, pick: Record<string, string> = {}): GameState {
  let t = s;
  for (let i = 0; i < n; i++) {
    t = ageUp({ ...t, pending: [] }).state;
    for (let k = 0; k < 10 && t.pending.length; k++) {
      const p = currentPopup(t);
      const id = (p && pick[p.eventId]) ?? p?.choices.find((c) => c.enabled)?.id;
      if (!id) break;
      t = choose(t, id).state;
    }
  }
  return { ...t, pending: [] };
}

describe('sport, season by season', () => {
  it('a child can take up a sport; it takes a pip of free time', () => {
    const s = kid(2400);
    const before = freeTime(s).total;
    const playing = act(s, { type: 'sport', sport: 'football' }).state;
    expect(playing.sport?.level).toBe(0);
    expect(freeTime(playing).total).toBe(before - 1);
    const toddler = { ...newLife({ birthYear: 2000 }, 2404), pending: [] };
    expect(() => act(toddler, { type: 'sport', sport: 'tennis' })).toThrow(/age 6/);
  });

  it('a gifted, dedicated young athlete is picked for higher levels; an unfit one is not', () => {
    let star = kid(2401, { talent: 'athletics', talentLevel: 'prodigy', gifts: ['sport_luck'] });
    star = act(star, { type: 'sport', sport: 'athletics' }).state;
    star = act(star, { type: 'focus', target: 'athletics' }).state;
    star = seasons(star, 12, { sport_pro_offer: 'amateur' });
    expect(star.sport?.best ?? 0).toBeGreaterThanOrEqual(3);
    let slow = kid(2402);
    slow = act(slow, { type: 'sport', sport: 'swimming' }).state;
    slow = { ...slow, player: { ...slow.player, stats: { ...slow.player.stats, health: 30 } } };
    slow = seasons(slow, 6);
    expect(slow.sport?.best ?? 0).toBeLessThan(3);
  });

  it('only a national-team athlete in an Olympic sport is selected for the Games', () => {
    const olympics = SPECIAL_PATHS.find((p) => p.id === 'olympics');
    const base = runCheat(kid(2403), 'age.set', { age: 22 }).state;
    const fit = {
      ...base,
      player: { ...base.player, skills: { ...base.player.skills, athletics: 99 } },
    };
    expect(olympics?.when(fit)).toBe(false);
    const national = {
      ...fit,
      sport: {
        sport: 'swimming',
        level: 4,
        best: 4,
        form: 80,
        seasons: 10,
        honours: [],
        active: true,
      },
    };
    expect(olympics?.when(national)).toBe(true);
  });
});
