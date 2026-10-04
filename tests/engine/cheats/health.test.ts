import { describe, expect, it } from 'vitest';
import { newLife, runCheat, type GameState } from '../../../src/engine';

const base = runCheat(newLife({}, 14), 'age.set', { age: 30 }).state;
const jailed: GameState = {
  ...base,
  legal: {
    ...base.legal,
    prison: { years: 5, served: 1, crimeId: 'burglary', behaviour: 50 },
    probation: 3,
  },
};

describe('health and legal cheats', () => {
  it("'illness.add' and 'cure.all'", () => {
    const sick = runCheat(base, 'illness.add', { illness: 'flu' }).state;
    expect(sick.health.illnesses.map((i) => i.id)).toEqual(['flu']);
    expect(runCheat(sick, 'cure.all', {}).state.health.illnesses).toEqual([]);
  });

  it("'addiction.set' sets a meter", () => {
    expect(
      runCheat(base, 'addiction.set', { vice: 'smoking', value: 70 }).state.vices.levels.smoking,
    ).toBe(70);
  });

  it("'record.clear' wipes the record", () => {
    const rec: GameState = {
      ...base,
      legal: {
        ...base.legal,
        record: [
          {
            crimeId: 'x',
            year: 1,
            age: 20,
            verdict: 'convicted',
            sentenceYears: 1,
            juvenile: false,
          },
        ],
      },
    };
    expect(runCheat(rec, 'record.clear', {}).state.legal.record).toEqual([]);
  });

  it("'prison.release', 'sentence.set' and 'probation.end'", () => {
    expect(runCheat(jailed, 'prison.release', {}).state.legal.prison).toBeNull();
    expect(runCheat(jailed, 'sentence.set', { years: 10 }).state.legal.prison?.years).toBe(11);
    expect(runCheat(jailed, 'sentence.set', { years: 0 }).state.legal.prison).toBeNull();
    expect(runCheat(jailed, 'probation.end', {}).state.legal.probation).toBe(0);
  });
});
