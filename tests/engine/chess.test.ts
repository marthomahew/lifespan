import { describe, expect, it } from 'vitest';
import {
  act,
  ageUp,
  choose,
  currentPopup,
  newLife,
  runCheat,
  type GameState,
} from '../../src/engine';
import { playingStrength, worldRank } from '../../src/engine/systems/chess';

const player = (skill: number, age = 25, seed = 2300): GameState => {
  let s = runCheat(newLife({ birthYear: 1990, country: 'us' }, seed), 'age.set', { age }).state;
  s = runCheat({ ...s, pending: [] }, 'skill.set', { skill: 'chess', value: skill }).state;
  return {
    ...s,
    pending: [],
    settings: { ...s.settings, freeTime: false },
    cheats: { ...s.cheats, immortal: true, noBadEvents: true },
  };
};
/** A year of chess: up to three tournaments at the highest level you can enter, then a birthday. */
function season(s: GameState): GameState {
  let t = s;
  for (let i = 0; i < 3; i++) {
    const tier = ['elite', 'international', 'national', 'local'].find((x) => {
      try {
        act(t, { type: 'chess', tier: x });
        return true;
      } catch {
        return false;
      }
    });
    if (!tier) break;
    t = act(t, { type: 'chess', tier }).state;
    for (let k = 0; k < 5 && t.pending.length; k++)
      t = choose(t, currentPopup(t)!.choices[0]!.id).state;
  }
  t = ageUp({ ...t, pending: [] }).state;
  for (let k = 0; k < 10 && t.pending.length; k++) {
    const id = currentPopup(t)?.choices.find((c) => c.enabled)?.id;
    if (!id) break;
    t = choose(t, id).state;
  }
  return {
    ...t,
    pending: [],
    player: { ...t.player, skills: { ...t.player.skills, chess: s.player.skills['chess'] ?? 0 } },
  };
}

describe('chess, over the board', () => {
  it('a strong player wins weekend congresses; a beginner mostly does not', () => {
    let strong = player(80);
    let weak = player(20, 25, 2301);
    for (let i = 0; i < 3; i++) {
      strong = act(strong, { type: 'chess', tier: 'local' }).state;
      weak = act(weak, { type: 'chess', tier: 'local' }).state;
    }
    expect(strong.chess?.wins ?? 0).toBeGreaterThanOrEqual(2);
    expect(weak.chess?.wins ?? 0).toBeLessThanOrEqual(1);
    expect(strong.chess?.rating ?? 0).toBeGreaterThan(weak.chess?.rating ?? 0);
    // Three tournaments a year.
    expect(() => act(strong, { type: 'chess', tier: 'local' })).toThrow(/3 tournaments/);
  });

  it('stronger events need the rating to enter', () => {
    expect(() => act(player(40), { type: 'chess', tier: 'international' })).toThrow(
      /rating of 2050/,
    );
  });

  it('a world-class player climbs to grandmaster through norms, over a few seasons', () => {
    let s = player(100, 22, 2302);
    for (let y = 0; y < 8 && s.chess?.title !== 'GM'; y++) s = season(s);
    expect(s.chess?.title).toBe('GM');
    expect(s.chess?.gmNorms ?? 0).toBeGreaterThanOrEqual(3);
    expect(s.player.flags).toContain('chess_gm');
  });

  it('playing strength follows skill and age, and the world ranking reads sensibly', () => {
    expect(playingStrength(player(100, 30))).toBeGreaterThan(playingStrength(player(50, 30)));
    expect(playingStrength(player(100, 8))).toBeLessThan(playingStrength(player(100, 25)));
    expect(worldRank(2850)).toBe('world number 1');
    expect(worldRank(1200)).toBe('a club player');
  });
});
