import { describe, expect, it } from 'vitest';
import { act, newLife, runCheat, type GameState } from '../../src/engine';
import { ILLNESSES, ILLNESS_BY_ID } from '../../src/content/illnesses';
import { deathProbability } from '../../src/engine/mortality';
import { onsetChance, treatmentCost } from '../../src/engine/systems/health';
import { clone } from '../../src/engine/util';
import { playYears } from '../helpers';

const adult = (seed = 1, age = 40, country = 'us'): GameState => {
  const s = runCheat(
    runCheat(newLife({ country, birthYear: 1980 }, seed), 'age.set', { age }).state,
    'money.add',
    { amount: 1e7 },
  ).state;
  return { ...s, cheats: { ...s.cheats, immortal: true } };
};
const forced = (s: GameState): GameState => ({ ...s, cheats: { ...s.cheats, forceSuccess: true } });

describe('illness catalog (M8.1)', () => {
  it('has 20+ illnesses with onset, symptoms, treatments, progression, and a death factor', () => {
    expect(ILLNESSES.length).toBeGreaterThanOrEqual(20);
    for (const i of ILLNESSES) {
      expect(i.symptom.length).toBeGreaterThan(10);
      expect(Object.keys(i.treatments).length).toBeGreaterThan(0);
      expect(i.treatments.alternative ?? 0).toBeLessThan(0.3);
      expect(Number.isFinite(i.progression)).toBe(true);
      expect(i.deathFactor).toBeGreaterThan(0);
    }
    expect(ILLNESSES.some((i) => i.chronic)).toBe(true);
    expect(ILLNESSES.filter((i) => i.mental).length).toBeGreaterThanOrEqual(2);
  });

  it('onset depends on age, lifestyle, stress and family history', () => {
    const copd = ILLNESS_BY_ID['copd'];
    const dementia = ILLNESS_BY_ID['dementia'];
    const depression = ILLNESS_BY_ID['depression'];
    if (!copd || !dementia || !depression) throw new Error('catalog');
    const s = clone(adult(1, 50));
    expect(onsetChance({ ...s, player: { ...s.player, age: 30 } }, dementia)).toBe(0);
    const base = onsetChance(s, copd);
    const smoker = clone(s);
    smoker.vices.levels.smoking = 90;
    expect(onsetChance(smoker, copd)).toBeGreaterThan(base * 2);
    const stressed = clone(s);
    stressed.player.stats.stress = 90;
    expect(onsetChance(stressed, depression)).toBeGreaterThan(onsetChance(s, depression));
    const fam = clone(s);
    for (const n of fam.npcs) if (n.roles.includes('mother')) n.flags.push('had_depression');
    expect(onsetChance(fam, depression)).toBeGreaterThan(onsetChance(s, depression));
  });

  it('untreated illnesses progress and raise the death risk; treatment helps', () => {
    let s = runCheat(adult(2, 60), 'illness.add', { illness: 'heart_disease' }).state;
    const q0 = deathProbability({
      ...s,
      health: { ...s.health, illnesses: [] },
      cheats: { ...s.cheats, immortal: false },
    });
    const q1 = deathProbability({ ...s, cheats: { ...s.cheats, immortal: false } });
    expect(q1).toBeGreaterThan(q0 * 1.2);
    const sev0 = s.health.illnesses[0]?.severity ?? 0;
    s = playYears(s, 3);
    expect(s.health.illnesses.find((i) => i.id === 'heart_disease')?.severity ?? 0).toBeGreaterThan(
      sev0,
    );
    const treated = act(forced(s), {
      type: 'treat',
      illness: 'heart_disease',
      method: 'surgery',
    }).state;
    expect(
      treated.health.illnesses.find((i) => i.id === 'heart_disease')?.severity ?? 0,
    ).toBeLessThan(s.health.illnesses.find((i) => i.id === 'heart_disease')?.severity ?? 0);
    // Curable illnesses go away.
    const flu = act(forced(runCheat(adult(3), 'illness.add', { illness: 'flu' }).state), {
      type: 'treat',
      illness: 'flu',
      method: 'doctor',
    }).state;
    expect(flu.health.illnesses).toEqual([]);
    expect(() =>
      act(runCheat(adult(3), 'illness.add', { illness: 'flu' }).state, {
        type: 'treat',
        illness: 'flu',
        method: 'surgery',
      }),
    ).toThrow(/doesn't help/);
  });

  it('treatment costs follow the country healthcare model', () => {
    const def = ILLNESS_BY_ID['appendicitis'];
    if (!def) throw new Error('catalog');
    const us = adult(4, 40, 'us');
    const uk = adult(4, 40, 'uk');
    expect(treatmentCost(uk, def, 'surgery') / uk.inflation / 0.79).toBeLessThan(
      treatmentCost(us, def, 'surgery') / us.inflation,
    );
  });

  it('long stretches of stress can bring depression or anxiety', () => {
    let hits = 0;
    for (let seed = 1; seed <= 40; seed++) {
      let s = clone(adult(seed, 30));
      s.health.highStressYears = 3;
      s = runCheat(s, 'stat.lock', { stat: 'stress', value: 95 }).state;
      s = playYears(s, 10);
      if (s.health.illnesses.some((i) => ILLNESS_BY_ID[i.id]?.mental)) hits++;
    }
    expect(hits).toBeGreaterThan(3);
  });
});

describe('health activities (M8.2)', () => {
  it('doctor visits treat the worst illness; gym, diet and meditation help', () => {
    const sick = runCheat(adult(5), 'illness.add', { illness: 'strep_throat' }).state;
    const after = act(forced(sick), { type: 'activity', id: 'doctor_visit' }).state;
    expect(after.health.illnesses.find((i) => i.id === 'strep_throat')).toBeUndefined();
    let s = clone(adult(6));
    s.player.stats.stress = 80;
    const st = s.player.stats.stress;
    s = act(s, { type: 'activity', id: 'meditate' }).state;
    expect(s.player.stats.stress).toBeLessThan(st);
    const a0 = s.player.skills['athletics'] ?? 0;
    expect(
      act(forced(s), { type: 'activity', id: 'gym' }).state.player.skills['athletics'] ?? 0,
    ).toBeGreaterThanOrEqual(a0);
    expect(() => act(s, { type: 'activity', id: 'diet' })).not.toThrow();
  });

  it('therapy treats mental illness; plastic surgery can go wrong', () => {
    let s = runCheat(adult(7), 'illness.add', { illness: 'depression' }).state;
    const sev = s.health.illnesses[0]?.severity ?? 0;
    s = act(forced(s), { type: 'activity', id: 'therapy' }).state;
    expect(s.health.illnesses.find((i) => i.id === 'depression')?.severity ?? 0).toBeLessThan(sev);
    let worse = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const b = adult(seed);
      if (
        act(b, { type: 'activity', id: 'plastic_surgery' }).state.player.stats.looks <
        b.player.stats.looks
      )
        worse++;
    }
    expect(worse).toBeGreaterThan(0);
    expect(() =>
      act(runCheat(newLife({}, 1), 'age.set', { age: 15 }).state, {
        type: 'activity',
        id: 'plastic_surgery',
      }),
    ).toThrow();
  });
});
