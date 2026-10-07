import { describe, expect, it } from 'vitest';
import { act, newLife, runCheat, type GameState } from '../../src/engine';
import { joinReason } from '../../src/engine/systems/underworld';

const crook = (seed = 5300): GameState => {
  const s = runCheat(newLife({ birthYear: 1980, country: 'us' }, seed), 'age.set', {
    age: 25,
  }).state;
  return {
    ...s,
    pending: [],
    player: { ...s.player, stats: { ...s.player.stats, notoriety: 30 } },
  };
};
const fresh = (s: GameState): GameState => ({ ...s, pending: [], usage: { year: 0, used: {} } });

describe('the underworld', () => {
  it('only people with a record or reputation are approached', () => {
    const clean = runCheat(newLife({ birthYear: 1980 }, 5301), 'age.set', { age: 25 }).state;
    expect(joinReason(clean)).toMatch(/record or a reputation/);
    expect(joinReason(crook())).toBeNull();
  });

  it('jobs pay and build respect toward rank; heat rises; bigger jobs need rank', () => {
    let s = act(crook(), { type: 'underworld', action: { op: 'join' } }).state;
    expect(() => act(fresh(s), { type: 'underworld', action: { op: 'job', id: 'bank' } })).toThrow(
      /rank/,
    );
    let paid = 0;
    for (let i = 0; i < 12 && !s.legal.case && !s.legal.prison; i++) {
      const before = s.money.cash;
      s = act(fresh({ ...s, cheats: { ...s.cheats, forceSuccess: true } }), {
        type: 'underworld',
        action: { op: 'job', id: 'hijack' },
      }).state;
      if (s.money.cash > before) paid++;
    }
    expect(paid).toBeGreaterThan(0);
    expect(s.underworld!.respect).toBeGreaterThan(0);
    expect(s.underworld!.rank).toBeGreaterThanOrEqual(1);
  });

  it('turning informant ends it, with a new name', () => {
    let s = act(crook(5302), { type: 'underworld', action: { op: 'join' } }).state;
    const name = s.player.last;
    s = act(s, { type: 'underworld', action: { op: 'inform' } }).state;
    expect(s.underworld?.informant).toBe(true);
    expect(s.player.last).not.toBe(name);
    expect(joinReason(s)).toMatch(/informant/);
  });
});
