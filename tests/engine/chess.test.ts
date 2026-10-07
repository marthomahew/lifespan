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
import {
  CHESS_TIERS,
  appearanceFee,
  openConditions,
  chessMoney,
  playingStrength,
  worldRank,
} from '../../src/engine/systems/chess';
import { COUNTRY_BY_ID } from '../../src/content/countries';

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
/**
 * A year of chess: some tournaments (three by default, of six allowed) at the highest level you
 * can enter, then a birthday. With the default, the chess skill is held steady to isolate rating.
 */
function season(s: GameState, events = 3): GameState {
  let t = s;
  for (let i = 0; i < events; i++) {
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
  if (events !== 3) return { ...t, pending: [] };
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
    for (let i = 0; i < 6; i++) {
      strong = act(strong, { type: 'chess', tier: 'local' }).state;
      weak = act(weak, { type: 'chess', tier: 'local' }).state;
    }
    expect(strong.chess?.wins ?? 0).toBeGreaterThanOrEqual(4);
    expect(weak.chess?.wins ?? 0).toBeLessThanOrEqual(1);
    expect(strong.chess?.rating ?? 0).toBeGreaterThan(weak.chess?.rating ?? 0);
    // Six tournaments a year.
    expect(() => act(strong, { type: 'chess', tier: 'local' })).toThrow(/6 tournaments/);
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

  it('international prize funds are paid in dollars, the same in every country', () => {
    const at = (country: string): GameState => {
      let s = runCheat(newLife({ birthYear: 1990, country }, 2390), 'age.set', { age: 30 }).state;
      s = runCheat({ ...s, pending: [] }, 'skill.set', { skill: 'chess', value: 70 }).state;
      return { ...s, pending: [] };
    };
    const us = CHESS_TIERS.find((x) => x.id === 'international')!;
    const usd = (s: GameState): number =>
      chessMoney(s, us, 20000) / COUNTRY_BY_ID[s.player.country]!.currency.perUsd;
    expect(usd(at('in'))).toBeCloseTo(usd(at('us')), 0);
    // A local congress still pays in local terms.
    const local = CHESS_TIERS.find((x) => x.id === 'local')!;
    expect(chessMoney(at('in'), local, 600) / 83).toBeLessThan(chessMoney(at('us'), local, 600));
  });

  it('elite invitations pay an appearance fee that climbs with rating', () => {
    expect(appearanceFee(2700)).toBe(60000);
    expect(appearanceFee(2800)).toBe(140000);
    expect(appearanceFee(2500)).toBe(10000);
    const s = player(100, 30);
    const elite = {
      ...s,
      chess: {
        rating: 2750,
        best: 2750,
        title: 'GM' as const,
        imNorms: 3,
        gmNorms: 3,
        events: 40,
        wins: 10,
        recent: [],
      },
    };
    const after = act(elite, { type: 'chess', tier: 'elite' }).state;
    expect(after.money.cash - elite.money.cash).toBeGreaterThanOrEqual(
      Math.round(appearanceFee(2750 - 40) * elite.inflation) - 1,
    );
  });

  it('a chess prodigy who starts at six can be a record-young grandmaster, not a toddler one', () => {
    let s = runCheat(
      newLife({ birthYear: 2000, country: 'us', talent: 'chess', talentLevel: 'prodigy' }, 7001),
      'age.set',
      { age: 6 },
    ).state;
    s = { ...s, pending: [], cheats: { ...s.cheats, immortal: true, noBadEvents: true } };
    s = act(s, { type: 'focus', target: 'chess' }).state;
    let gm = 0;
    for (let y = 0; y < 14 && !gm; y++) {
      s = season(s, 6);
      if (s.chess?.title === 'GM') gm = s.player.age;
    }
    // With focus, practice and six events a year: around the real record (12), a little under.
    expect(gm).toBeGreaterThanOrEqual(9);
    expect(gm).toBeLessThanOrEqual(14);
  });

  it('top grandmasters are paid to play opens, and gain little rating beating weaker fields', () => {
    expect(openConditions(2500)).toBe(0);
    expect(openConditions(2700)).toBe(7500);
    const s = player(100, 30);
    const gm = {
      ...s,
      chess: {
        rating: 2750,
        best: 2750,
        title: 'GM' as const,
        imNorms: 3,
        gmNorms: 3,
        events: 40,
        wins: 10,
        recent: [],
      },
    };
    const after = act(gm, { type: 'chess', tier: 'international' }).state;
    expect(after.money.cash - gm.money.cash).toBeGreaterThanOrEqual(
      Math.round(openConditions(2750) * gm.inflation) - 1,
    );
    // K = 10 at this level: even a perfect score moves the rating by no more than 10 points.
    expect(Math.abs((after.chess?.rating ?? 0) - 2750)).toBeLessThanOrEqual(12);
  });
});
