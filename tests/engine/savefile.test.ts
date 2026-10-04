import { describe, expect, it } from 'vitest';
import { makeSaveFile, newLife, parseSaveFile, serialize } from '../../src/engine';
import { playYears } from '../helpers';

describe('save files', () => {
  it('wrap the state with a summary and round-trip', () => {
    const s = playYears(newLife({ first: 'Ada' }, 3), 10);
    const json = makeSaveFile(s, 'My life', 1234);
    const { summary, state } = parseSaveFile(json);
    expect(state).toEqual(s);
    expect(summary).toMatchObject({
      name: 'My life',
      first: 'Ada',
      age: 10,
      savedAt: 1234,
      dead: false,
    });
  });

  it('accept a bare state export', () => {
    const s = newLife({}, 4);
    expect(parseSaveFile(serialize(s)).state).toEqual(s);
  });

  it('reject damaged files', () => {
    expect(() => parseSaveFile('{')).toThrow();
    expect(() =>
      parseSaveFile(JSON.stringify({ format: 'lifespan-save', state: { nope: 1 } })),
    ).toThrow();
  });
});
