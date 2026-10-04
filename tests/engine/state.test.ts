import { describe, expect, it } from 'vitest';
import {
  ageUp,
  choose,
  currentPopup,
  newLife,
  serialize,
  deserialize,
  stateHash,
  SCHEMA_VERSION,
} from '../../src/engine';
import { deepFreeze, playYears } from '../helpers';

describe('GameState (M1.1)', () => {
  it('is plain JSON data with a schemaVersion', () => {
    const s = playYears(newLife({}, 11), 30);
    expect(s.schemaVersion).toBe(SCHEMA_VERSION);
    expect(JSON.parse(JSON.stringify(s))).toEqual(s);
  });

  it('engine functions never mutate their input', () => {
    let s = newLife({}, 5);
    for (let i = 0; i < 120 && !s.death; i++) {
      const before = JSON.stringify(s);
      deepFreeze(s);
      const popup = currentPopup(s);
      const next = popup ? choose(s, popup.choices[0]?.id ?? '').state : ageUp(s).state;
      expect(JSON.stringify(s)).toBe(before);
      expect(next).not.toBe(s);
      s = next;
    }
  });

  it('newLife and deserialize return fresh objects', () => {
    const s = newLife({}, 3);
    const json = serialize(s);
    const a = deserialize(json);
    const b = deserialize(json);
    expect(a).not.toBe(b);
    expect(stateHash(a)).toBe(stateHash(b));
  });
});
