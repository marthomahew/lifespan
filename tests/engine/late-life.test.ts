import { describe, expect, it } from 'vitest';
import { act, ageUp, choose, newLife, obituary, runCheat, type GameState } from '../../src/engine';
import { deathProbability } from '../../src/engine/mortality';
import { healthWarning } from '../../src/engine/systems/health-warning';
import { Ctx } from '../../src/engine/ctx';
import { clone } from '../../src/engine/util';

const old = (age: number, seed = 3): GameState => {
  const s = runCheat(newLife({ country: 'us', birthYear: 1950 }, seed), 'age.set', { age }).state;
  return clone({ ...s, pending: [], cheats: { ...s.cheats, immortal: true } });
};

describe('late life', () => {
  it('when the risk turns serious, you get a warning and a choice, at most every six years', () => {
    const s = old(72);
    s.player.stats.health = 15;
    expect(deathProbability(s)).toBeGreaterThan(0.07);
    const ctx = new Ctx(s);
    healthWarning(ctx);
    expect(s.pending[0]?.eventId).toBe('late_health_warning');
    const again = new Ctx(s);
    s.year += 3;
    s.pending = [];
    healthWarning(again);
    expect(s.pending).toHaveLength(0);
    // A healthy 40-year-old hears nothing.
    const fine = old(40);
    healthWarning(new Ctx(fine));
    expect(fine.pending).toHaveLength(0);
  });

  it('a bucket list: from 55, once a year, and five ticks earn an achievement', () => {
    let s = old(60);
    s.money.cash = 1_000_000;
    expect(() => act(old(40), { type: 'activity', id: 'bucket_list' })).toThrow();
    for (let i = 0; i < 5; i++) {
      s = act({ ...s, pending: [] }, { type: 'activity', id: 'bucket_list' }).state;
      expect(() => act({ ...s, pending: [] }, { type: 'activity', id: 'bucket_list' })).toThrow();
      s = ageUp({ ...s, pending: [] }).state;
    }
    expect(s.player.flags.filter((f) => f === 'bucket_item')).toHaveLength(5);
    expect(s.player.achievements).toContain('bucket_list');
    const dead = runCheat(s, 'deathbot', {}).state;
    expect(obituary(dead)?.summary.some((l) => /5 things off the bucket list/.test(l))).toBe(true);
  });

  it('choosing the bucket list after a warning is remembered', () => {
    const s = old(75);
    s.player.stats.health = 12;
    healthWarning(new Ctx(s));
    const next = choose(s, 'bucket').state;
    expect(next.player.flags).toContain('bucket_list');
  });
});
