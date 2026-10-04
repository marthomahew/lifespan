import { describe, expect, it } from 'vitest';
import { newLife, serialize, deserialize, stateHash } from '../../src/engine';
import { Rng } from '../../src/engine/rng';
import { advance } from '../helpers';

function run80(seed: number, saveAt?: number): string {
  let s = newLife({ birthYear: 1990, country: 'us' }, seed);
  s = { ...s, cheats: { ...s.cheats, immortal: true } };
  for (let y = 0; y < 80; y++) {
    if (saveAt === y) s = deserialize(serialize(s));
    s = advance(s);
  }
  return stateHash(s);
}

describe('determinism (M1.2)', () => {
  it('the RNG state lives in GameState', () => {
    const s = newLife({}, 77);
    expect(s.rng).toHaveLength(4);
    const r = new Rng(s.rng);
    expect(r.next()).toBeGreaterThanOrEqual(0);
  });

  it('same seed and inputs give the same hash after 80 years', () => {
    expect(run80(1234)).toBe(run80(1234));
  });

  it('a save and load midway does not change the outcome', () => {
    expect(run80(99, 40)).toBe(run80(99));
    expect(run80(99, 3)).toBe(run80(99));
  });

  it('different seeds diverge', () => {
    expect(run80(1)).not.toBe(run80(2));
  });
});
