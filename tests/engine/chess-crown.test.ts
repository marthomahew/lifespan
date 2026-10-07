import { describe, expect, it } from 'vitest';
import { act, newLife, runCheat, type GameState } from '../../src/engine';
import { isChampion, majorReason } from '../../src/engine/systems/chess-crown';
import type { ChessRecord } from '../../src/engine/systems/chess';

const star = (year: number, rating: number, seed = 3100, extra: Partial<ChessRecord> = {}) => {
  let s = runCheat(newLife({ birthYear: year - 30, country: 'us' }, seed), 'age.set', {
    age: 30,
  }).state;
  s = runCheat({ ...s, pending: [] }, 'skill.set', { skill: 'chess', value: 100 }).state;
  const chess: ChessRecord = {
    rating,
    best: rating,
    title: 'GM',
    imNorms: 3,
    gmNorms: 3,
    events: 60,
    wins: 20,
    recent: [],
    ...extra,
  };
  return {
    ...s,
    pending: [],
    settings: { ...s.settings, freeTime: false },
    cheats: { ...s.cheats, immortal: true },
    chess,
  } as GameState;
};

describe('the world title cycle', () => {
  it('each major has its own calendar and entry bar', () => {
    expect(majorReason(star(2016, 2700), 'worldcup')).toMatch(/odd years/);
    expect(majorReason(star(2017, 2550), 'worldcup')).toMatch(/2600/);
    expect(majorReason(star(2017, 2700), 'worldcup')).toBeNull();
    expect(majorReason(star(2016, 2700), 'candidates')).toMatch(/qualify/);
    expect(majorReason(star(2016, 2700, 3100, { candQual: 2016 }), 'candidates')).toBeNull();
    expect(majorReason(star(2016, 2790), 'candidates')).toBeNull();
    expect(majorReason(star(2016, 2850), 'title')).toMatch(/Candidates first/);
    expect(majorReason(star(2010, 2700), 'rapid')).toMatch(/2012/);
  });

  it('a World Cup podium earns a Candidates place; the world #1 usually gets there', () => {
    let podiums = 0;
    // Knockouts are cruel, but the world #1 reaches the podium more often than not.
    for (let i = 0; i < 20; i++) {
      const s = star(2017, 2850, 3200 + i);
      const after = act(s, { type: 'chess_major', id: 'worldcup' }).state;
      if (after.chess?.candQual === 2018) podiums++;
      expect(after.money.cash).toBeGreaterThan(s.money.cash);
    }
    expect(podiums).toBeGreaterThanOrEqual(7);
    expect(podiums).toBeLessThanOrEqual(18);
  });

  it('the title match pays millions, crowns a champion who must defend every two years', () => {
    let crowned: GameState | null = null;
    for (let i = 0; i < 10 && !crowned; i++) {
      const s = star(2016, 2850, 3300 + i, { challenger: 2016 });
      const after = act(s, { type: 'chess_major', id: 'title' }).state;
      const won = after.money.cash - s.money.cash;
      // Even a heavy loss pays the loser over half a million (2024 terms).
      expect(won).toBeGreaterThanOrEqual(Math.round(500_000 * s.inflation) - 1);
      if (after.chess?.crowns?.includes(2016)) crowned = after;
    }
    expect(crowned).not.toBeNull();
    const c = crowned as GameState;
    expect(isChampion(c)).toBe(true);
    expect(majorReason(c, 'candidates')).toMatch(/champion waits/);
    const due = { ...c, year: 2018 };
    expect(isChampion(due)).toBe(true);
    expect(majorReason(due, 'title')).toBeNull();
    // Nobody has beaten you: you're still champion years later, until you lose a match.
    expect(isChampion({ ...c, year: 2023 })).toBe(true);
    const lost = { ...c, chess: { ...c.chess!, dethroned: 2018 } };
    expect(isChampion({ ...lost, year: 2019 })).toBe(false);
  });
});
