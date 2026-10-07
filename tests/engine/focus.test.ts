import { describe, expect, it } from 'vitest';
import { FOCUS_COST } from '../../src/engine/systems/focus';
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
import { learnRate } from '../../src/engine/systems/skills';
import type { NewLifeOptions } from '../../src/engine/life';

const life = (seed: number, age: number, opts: NewLifeOptions = {}): GameState => {
  const s = runCheat(newLife({ birthYear: 1990, country: 'us', ...opts }, seed), 'age.set', {
    age,
  }).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true, noBadEvents: true } };
};
/** Age up n years, answering any popup with its first choice. */
function years(s: GameState, n: number): GameState {
  let t = s;
  for (let i = 0; i < n; i++) {
    t = ageUp({ ...t, pending: [] }).state;
    for (let k = 0; k < 10 && t.pending.length; k++) {
      const id = currentPopup(t)?.choices.find((c) => c.enabled)?.id;
      if (!id) break;
      t = choose(t, id).state;
    }
  }
  return { ...t, pending: [] };
}

describe('a focus, and how fast you learn', () => {
  it('children learn faster; a gift adds half again, a prodigy triples, a quick study doubles', () => {
    const kid = life(1, 8, { talent: 'instrument' });
    const teen = life(1, 15);
    const adult = life(1, 30);
    expect(learnRate(adult, 'art')).toBe(1);
    expect(learnRate(teen, 'art')).toBe(1.5);
    expect(learnRate(kid, 'art')).toBe(2);
    expect(learnRate(kid, 'instrument')).toBe(3);
    const prodigy = life(2, 30, { talent: 'instrument', talentLevel: 'prodigy' });
    expect(learnRate(prodigy, 'instrument')).toBe(3);
    expect(prodigy.player.skills['instrument']).toBeGreaterThanOrEqual(15);
    const quick = life(3, 30, { gifts: ['quick_study'] });
    expect(learnRate(quick, 'art')).toBe(2);
  });

  it('a focus costs free time and brings an ordinary adult to a solid level in seven years', () => {
    let s = life(4, 25);
    const before = freeTime(s).total;
    s = act(s, { type: 'focus', target: 'instrument' }).state;
    expect(s.player.focus).toBe('instrument');
    expect(freeTime(s).total).toBe(before - FOCUS_COST);
    s = years(s, 7);
    // Steady to 50, slower after: good, not world-class.
    expect(s.player.skills['instrument'] ?? 0).toBeGreaterThanOrEqual(60);
    expect(s.player.skills['instrument'] ?? 0).toBeLessThan(80);
  });

  it('a child prodigy who focuses masters it in about a decade, and keeps it while focused', () => {
    let s = life(5, 5, { talent: 'instrument', talentLevel: 'prodigy' });
    s = act(s, { type: 'focus', target: 'instrument' }).state;
    s = years(s, 1);
    // Fast, but not overnight: 25 points a calendar year (the first birthday can straddle two).
    expect(s.player.skills['instrument']).toBeLessThanOrEqual(50);
    s = years(s, 4);
    // Strong after five years, but the top takes far longer.
    expect(s.player.skills['instrument']).toBeGreaterThanOrEqual(65);
    expect(s.player.skills['instrument']).toBeLessThan(95);
    s = years(s, 8);
    expect(s.player.skills['instrument']).toBe(100);
    s = years(s, 3);
    expect(s.log.filter((l) => /mastered it/.test(l.text))).toHaveLength(1);
    expect(s.player.skills['instrument']).toBe(100);
    expect(s.player.focus).toBe('instrument');
  });

  it('languages can be the focus too; fluent ones and toddlers can’t', () => {
    let s = life(6, 20);
    s = act(s, { type: 'focus', target: 'lang:japanese' }).state;
    s = years(s, 3);
    expect(s.player.languages['japanese'] ?? 0).toBeGreaterThan(40);
    expect(() => act(s, { type: 'focus', target: 'lang:english' })).toThrow(/nothing to focus on/);
    expect(() => act(life(7, 2), { type: 'focus', target: 'art' })).toThrow(/from age 4/);
    const off = act(s, { type: 'focus', target: null }).state;
    expect(off.player.focus).toBeNull();
  });
});
