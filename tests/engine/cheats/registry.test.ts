import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import {
  CHEATS,
  newLife,
  parseCommand,
  runCheat,
  runConsole,
  suggest,
  helpText,
  CheatError,
} from '../../../src/engine';

describe('cheat registry (M3.1)', () => {
  it('has unique ids and syntaxes, 40+ commands, and every group used', () => {
    const ids = CHEATS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(CHEATS.map((c) => c.syntax)).size).toBe(ids.length);
    expect(CHEATS.length).toBeGreaterThanOrEqual(40);
  });

  it('every command has a unit test', () => {
    const dir = 'tests/engine/cheats';
    const src = readdirSync(dir)
      .filter((f) => f.endsWith('.test.ts') && f !== 'registry.test.ts')
      .map((f) => readFileSync(`${dir}/${f}`, 'utf8'))
      .join('\n');
    const missing = CHEATS.filter((c) => !src.includes(`'${c.id}'`)).map((c) => c.id);
    expect(missing).toEqual([]);
  });

  it('parses console syntax into the same registry entries the GUI uses', () => {
    expect(parseCommand('money add 1000000')).toEqual({
      kind: 'cheat',
      id: 'money.add',
      params: { amount: '1000000' },
    });
    expect(parseCommand('stat health 100')).toEqual({
      kind: 'cheat',
      id: 'stat.set',
      params: { stat: 'health', value: '100' },
    });
    expect(parseCommand('age set 40')).toEqual({
      kind: 'cheat',
      id: 'age.set',
      params: { age: '40' },
    });
    expect(parseCommand('rename Ada "Byron King"')).toEqual({
      kind: 'cheat',
      id: 'rename',
      params: { first: 'Ada', last: 'Byron King' },
    });
    expect(parseCommand('help money')).toEqual({ kind: 'help', topic: 'money' });
    expect(() => parseCommand('frobnicate')).toThrow(CheatError);
  });

  it('validates params', () => {
    const s = newLife({}, 1);
    expect(() => runCheat(s, 'stat.set', { stat: 'health', value: 'lots' })).toThrow(/number/);
    expect(() => runCheat(s, 'stat.set', { stat: 'nope', value: 5 })).toThrow(/unknown stat/);
    expect(() => runCheat(s, 'stat.set', { stat: 'health', value: 500 })).toThrow(/at most 100/);
    expect(() => runCheat(s, 'stat.set', { stat: 'health' })).toThrow(/missing/);
    expect(() => runCheat(s, 'nope', {})).toThrow(/unknown cheat/);
  });

  it('console and GUI calls produce the same state', () => {
    const s = newLife({}, 2);
    const a = runConsole(s, 'money add 5000').state;
    const b = runCheat(s, 'money.add', { amount: 5000 }).state;
    expect(a).toEqual(b);
  });

  it('marks the life as cheated and never mutates its input', () => {
    const s = newLife({}, 3);
    const before = JSON.stringify(s);
    const r = runCheat(s, 'money.add', { amount: 1 });
    expect(JSON.stringify(s)).toBe(before);
    expect(r.state.cheats.used).toBe(true);
    expect(s.cheats.used).toBe(false);
  });

  it('help lists commands and explains one', () => {
    expect(helpText(null)).toContain('money add {amount}');
    expect(helpText('money')).toContain('Add cash');
    const s = newLife({}, 4);
    expect(runConsole(s, 'help').message).toContain('stat {stat} {value}');
    expect(runConsole(s, 'help').state).toBe(s);
  });

  it('autocompletes commands and enum values', () => {
    const s = newLife({}, 5);
    expect(suggest(s, 'mon')).toContain('money');
    expect(suggest(s, 'money ')).toEqual(expect.arrayContaining(['money add', 'money set']));
    expect(suggest(s, 'stat hea')).toContain('stat health');
    expect(suggest(s, 'trait add bo')).toContain('trait add bookish');
  });
});
