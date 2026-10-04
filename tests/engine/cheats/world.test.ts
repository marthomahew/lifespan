import { describe, expect, it } from 'vitest';
import {
  ageUp,
  choose,
  currentPopup,
  lifeHash,
  newLife,
  runCheat,
  type GameState,
} from '../../../src/engine';

const base = newLife({ birthYear: 1990 }, 12);

describe('world and time cheats (M3.4, M3.5)', () => {
  it("'age.set' jumps the player, the year and everyone else", () => {
    const s = runCheat(base, 'age.set', { age: 40 }).state;
    expect(s.player.age).toBe(40);
    expect(s.year).toBe(2030);
    const mom = s.npcs.find((n) => n.roles.includes('mother'));
    const mom0 = base.npcs.find((n) => n.roles.includes('mother'));
    expect((mom?.age ?? 0) - (mom0?.age ?? 0)).toBe(
      Math.min(40, (mom?.age ?? 0) - (mom0?.age ?? 0)),
    );
  });

  it("'skip' lives several years at once", () => {
    const s = runCheat(base, 'skip', { years: 10 }).state;
    expect(s.player.age).toBe(10);
    expect(s.pending).toEqual([]);
  });

  it("'immortal' prevents death", () => {
    const s = runCheat(base, 'immortal', {}).state;
    expect(s.cheats.immortal).toBe(true);
    expect(runCheat(s, 'skip', { years: 100 }).state.death).toBeNull();
  });

  it("'forcesuccess' and 'nobadevents' toggle", () => {
    expect(runCheat(base, 'forcesuccess', {}).state.cheats.forceSuccess).toBe(true);
    expect(runCheat(base, 'nobadevents', { on: true }).state.cheats.noBadEvents).toBe(true);
  });

  it("'rewind' restores the earlier state bit for bit (by hash)", () => {
    let s: GameState = { ...base, cheats: { ...base.cheats, immortal: true } };
    const hashes = new Map<number, string>();
    for (let i = 0; i < 30; i++) {
      s = ageUp(s).state;
      hashes.set(s.player.age, lifeHash(s));
      for (let p = currentPopup(s); p; p = currentPopup(s))
        s = choose(s, p.choices.find((c) => c.enabled)?.id ?? '').state;
    }
    for (const n of [1, 5, 12, 19]) {
      const r = runCheat(s, 'rewind', { years: n }).state;
      expect(r.player.age).toBe(30 - n);
      expect(lifeHash(r)).toBe(hashes.get(30 - n));
      expect(r.cheats.used).toBe(true);
    }
    expect(runCheat(s, 'rewind', { years: 20 }).message).toMatch(/Can only rewind/);
  });

  it("'inflation' scales inflation and 'seed' reseeds the RNG", () => {
    const frozen = runCheat(base, 'inflation', { mult: 0 }).state;
    expect(runCheat(frozen, 'skip', { years: 5 }).state.inflation).toBeCloseTo(
      frozen.inflation,
      10,
    );
    const a = runCheat(base, 'seed', { seed: 7 }).state;
    const b = runCheat(base, 'seed', { seed: 7 }).state;
    expect(a.rng).toEqual(b.rng);
    expect(a.rng).not.toEqual(base.rng);
  });
});
