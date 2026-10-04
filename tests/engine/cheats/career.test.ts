import { describe, expect, it } from 'vitest';
import { newLife, runCheat, type GameState } from '../../../src/engine';

const adult = (): GameState =>
  runCheat(newLife({ country: 'us', birthYear: 1990 }, 40), 'age.set', { age: 30 }).state;

describe('career and education cheats (M6.9)', () => {
  it("'degree.grant' adds any degree", () => {
    const s = runCheat(adult(), 'degree.grant', { level: 'doctorate', field: 'phd' }).state;
    expect(s.education.degrees.some((d) => d.level === 'doctorate')).toBe(true);
    const b = runCheat(adult(), 'degree.grant', { level: 'bachelor', field: 'nursing' }).state;
    expect(b.education.degrees.find((d) => d.level === 'bachelor')?.field).toBe('nursing');
  });

  it("'job.set', 'job.promote', 'job.demote' and 'job.quit'", () => {
    let s = runCheat(adult(), 'job.set', { job: 'software_engineer', level: 2 }).state;
    expect(s.career.jobId).toBe('software_engineer');
    expect(s.career.level).toBe(2);
    s = runCheat(s, 'job.promote', {}).state;
    expect(s.career.level).toBe(3);
    s = runCheat(s, 'job.demote', {}).state;
    expect(s.career.level).toBe(2);
    s = runCheat(s, 'job.quit', {}).state;
    expect(s.career.jobId).toBeNull();
  });

  it("'performance.set' sets job performance", () => {
    const s = runCheat(runCheat(adult(), 'job.set', { job: 'nurse' }).state, 'performance.set', {
      value: 3,
    }).state;
    expect(s.career.performance).toBe(3);
  });

  it("'military.set' and 'discharge.set'", () => {
    let s = runCheat(adult(), 'military.set', {
      branch: 'Navy',
      specialty: 'medical',
      rank: 4,
    }).state;
    expect(s.military).toMatchObject({
      active: true,
      branch: 'Navy',
      specialty: 'medical',
      rank: 4,
      officer: false,
    });
    const o = runCheat(adult(), 'military.set', {
      branch: 'Air Force',
      specialty: 'aviation',
      rank: 11,
    }).state;
    expect(o.military).toMatchObject({ officer: true, rank: 2 });
    s = runCheat(s, 'discharge.set', { type: 'general' }).state;
    expect(s.military).toMatchObject({ active: false, discharge: 'general' });
    expect(s.education.veteranBenefit).toBe(true);
  });

  it("'retire.now' retires with a pension", () => {
    let s = runCheat(
      runCheat(adult(), 'job.set', { job: 'accountant' }).state,
      'immortal',
      {},
    ).state;
    s = { ...s, career: { ...s.career, yearsWorked: 20 } };
    s = runCheat(s, 'retire.now', {}).state;
    expect(s.career.retired).toBe(true);
    expect(s.career.jobId).toBeNull();
    expect(s.career.pension).toBeGreaterThan(0);
  });
});
