import { describe, expect, it } from 'vitest';
import {
  newLife,
  serialize,
  deserialize,
  stateHash,
  SaveError,
  SCHEMA_VERSION,
} from '../../src/engine';
import { migrate } from '../../src/engine/save';
import { playYears } from '../helpers';

describe('save round trip (M1.8)', () => {
  it('serialize then deserialize is deep-equal', () => {
    for (const seed of [1, 2, 3]) {
      const s = playYears(newLife({}, seed), 35);
      expect(deserialize(serialize(s))).toEqual(s);
    }
  });

  it('continuing from a loaded save matches an uninterrupted run', () => {
    const start = newLife({}, 21);
    const straight = playYears(start, 60);
    const half = playYears(start, 25);
    const resumed = playYears(deserialize(serialize(half)), 35);
    expect(stateHash(resumed)).toBe(stateHash(straight));
  });

  it('rejects garbage and invalid states', () => {
    expect(() => deserialize('not json')).toThrow(SaveError);
    expect(() => deserialize('[]')).toThrow(SaveError);
    const s = newLife({}, 1);
    const broken = JSON.parse(serialize(s)) as { player: { stats: { health: number } } };
    broken.player.stats.health = 140;
    expect(() => deserialize(JSON.stringify(broken))).toThrow(/health/);
    const future = { ...JSON.parse(serialize(s)), schemaVersion: SCHEMA_VERSION + 1 };
    expect(() => deserialize(JSON.stringify(future))).toThrow(/newer/);
  });

  it('runs migrations in order through the hook', () => {
    const migrations = {
      0: (r: Record<string, unknown>) => ({ ...r, a: 1 }),
      1: (r: Record<string, unknown>) => ({ ...r, b: (r['a'] as number) + 1 }),
    };
    const out = migrate({ schemaVersion: 0 }, migrations, 2);
    expect(out).toEqual({ schemaVersion: 2, a: 1, b: 2 });
    expect(() => migrate({ schemaVersion: 0 }, {}, 1)).toThrow(/no migration/);
  });
});
