import { describe, expect, it } from 'vitest';
import { act, deserialize, newLife, runCheat, serialize, type GameState } from '../../src/engine';
import { Ctx } from '../../src/engine/ctx';
import {
  addInjury,
  injuryPenalty,
  injuryTick,
  injuryOptions,
} from '../../src/engine/systems/injuries';
import { clone } from '../../src/engine/util';
import { migrate } from '../../src/engine/save';

const adult = (seed = 1): GameState => {
  const s = runCheat(newLife({ country: 'us', birthYear: 1990 }, seed), 'age.set', {
    age: 30,
  }).state;
  return clone({ ...s, pending: [], cheats: { ...s.cheats, immortal: true } });
};

describe('injuries (SPEC §5.8)', () => {
  it('an injury is recorded with a kind that fits how bad it was', () => {
    const s = adult(1);
    const ctx = new Ctx(s);
    const h0 = s.player.stats.health;
    addInjury(ctx, 8);
    addInjury(ctx, 25);
    expect(s.health.injuries).toBe(2);
    expect(s.health.injuryList).toHaveLength(2);
    expect(s.health.injuryList[0]?.tier).toBe('minor');
    expect(s.health.injuryList[1]?.tier).toBe('serious');
    expect(s.player.stats.health).toBeLessThan(h0);
    // A bruise is just a bruise.
    addInjury(ctx, 3);
    expect(s.health.injuryList).toHaveLength(2);
  });

  it('injuries drag on health while they heal, then heal or linger', () => {
    let lingering = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const s = adult(seed);
      const ctx = new Ctx(s);
      addInjury(ctx, 15);
      expect(injuryPenalty(s)).toBeGreaterThan(0);
      for (let y = 0; y < 4; y++) {
        s.year += 1;
        injuryTick(ctx);
      }
      const left = s.health.injuryList;
      expect(left.every((i) => i.lingering)).toBe(true);
      lingering += left.length;
    }
    expect(lingering).toBeGreaterThan(0);
    expect(lingering).toBeLessThan(25);
  });

  it('physio speeds healing; surgery fixes an old injury; both cost money', () => {
    const s = adult(3);
    s.money.cash = 100000;
    const ctx = new Ctx(s);
    addInjury(ctx, 15);
    const before = s.health.injuryList[0]?.healsIn ?? 0;
    const opts = injuryOptions(s, 0).map((o) => o.method);
    expect(opts).toContain('physio');
    let t = act(s, { type: 'treat_injury', index: 0, method: 'physio' }).state;
    expect(t.health.injuryList[0]?.healsIn ?? 0).toBeLessThan(before);
    expect(t.money.cash).toBeLessThan(s.money.cash);
    expect(() => act(t, { type: 'treat_injury', index: 0, method: 'physio' })).toThrow(/this year/);
    // An injury that lingers can be operated on.
    const old = clone(t);
    const inj = old.health.injuryList[0];
    if (inj) Object.assign(inj, { lingering: true, healsIn: 0 });
    old.cheats.forceSuccess = true;
    expect(injuryOptions(old, 0).map((o) => o.method)).toContain('surgery');
    t = act(old, { type: 'treat_injury', index: 0, method: 'surgery' }).state;
    expect(t.health.injuryList).toHaveLength(0);
  });

  it('cure all clears injuries; old saves load with no injury records', () => {
    const s = adult(4);
    addInjury(new Ctx(s), 18);
    expect(runCheat(s, 'cure.all', {}).state.health.injuryList).toEqual([]);
    const raw = JSON.parse(serialize(s)) as Record<string, unknown> & {
      health: Record<string, unknown>;
    };
    delete raw.health['injuryList'];
    raw['schemaVersion'] = 1;
    const up = migrate(raw) as unknown as GameState;
    expect(up.health.injuryList).toEqual([]);
    expect(deserialize(JSON.stringify(up)).health.injuryList).toEqual([]);
  });
});
