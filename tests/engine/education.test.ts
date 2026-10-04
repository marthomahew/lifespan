import { describe, expect, it } from 'vitest';
import { act, newLife, runCheat, type GameState } from '../../src/engine';
import { MAJORS, GRAD_PROGRAMS } from '../../src/content/education';
import { tuitionFor } from '../../src/engine/systems/education';
import { clone } from '../../src/engine/util';
import { playYears } from '../helpers';

const life = (seed: number, country = 'us'): GameState => {
  const s = newLife({ country, birthYear: 1995 }, seed);
  return { ...s, cheats: { ...s.cheats, immortal: true } };
};
const forced = (s: GameState): GameState => ({ ...s, cheats: { ...s.cheats, forceSuccess: true } });

describe('school (M6.1)', () => {
  it('runs primary and secondary automatically with grades from smarts and discipline', () => {
    const s = playYears(life(1), 18);
    expect(s.log.some((l) => l.text.startsWith('You start primary school'))).toBe(true);
    expect(s.log.some((l) => l.text.startsWith('You start secondary school'))).toBe(true);
    expect(s.education.degrees.some((d) => d.level === 'high_school')).toBe(true);
    const smart = clone(life(2));
    smart.player.stats.smarts = 95;
    smart.player.genes.smarts = 95;
    smart.player.stats.discipline = 90;
    const dull = clone(life(2));
    dull.player.stats.smarts = 10;
    dull.player.genes.smarts = 20;
    dull.player.stats.discipline = 10;
    const g1 = playYears(smart, 15).education.grade;
    const g2 = playYears(dull, 15).education.grade;
    expect(g1).toBeGreaterThan(g2 + 15);
  });

  it('studying raises grades', () => {
    let a = playYears(life(3), 10);
    let b = a;
    for (let i = 0; i < 5; i++) {
      a = playYears(act(a, { type: 'activity', id: 'study' }).state, 1);
      b = playYears(b, 1);
    }
    expect(a.education.grade).toBeGreaterThanOrEqual(b.education.grade);
    expect(a.player.stats.smarts).toBeGreaterThan(b.player.stats.smarts);
  });

  it('allows dropping out only at the school-leaving age', () => {
    const at14 = runCheat(life(4), 'age.set', { age: 14 }).state;
    expect(() => act(at14, { type: 'drop_out' })).toThrow(/school-leaving age here is 16/);
    const at16 = runCheat(life(4), 'age.set', { age: 16 }).state;
    const out = act(at16, { type: 'drop_out' }).state;
    expect(out.education.droppedOut).toBe(true);
    expect(playYears(out, 3).education.degrees.some((d) => d.level === 'high_school')).toBe(false);
  });
});

describe('university (M6.2)', () => {
  const grad18 = (seed: number, country = 'us'): GameState =>
    runCheat(life(seed, country), 'age.set', { age: 18 }).state;

  it('has 12+ majors and 4 graduate programs', () => {
    expect(MAJORS.length).toBeGreaterThanOrEqual(12);
    expect(GRAD_PROGRAMS.map((g) => g.id).sort()).toEqual(['law', 'mba', 'medicine', 'phd']);
  });

  it('acceptance depends on smarts and grades', () => {
    let smartIn = 0;
    let dullIn = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const smart = clone(grad18(seed));
      smart.player.stats.smarts = 90;
      smart.education.grade = 90;
      const dull = clone(grad18(seed));
      dull.player.stats.smarts = 25;
      dull.education.grade = 30;
      if (
        act(smart, { type: 'enroll', kind: 'university', programId: 'physics' }).state.education
          .enrollment
      )
        smartIn++;
      try {
        if (
          act(dull, { type: 'enroll', kind: 'university', programId: 'physics' }).state.education
            .enrollment
        )
          dullIn++;
      } catch (e) {
        expect((e as Error).message).toMatch(/school average/);
      }
    }
    expect(smartIn).toBeGreaterThan(dullIn + 10);
  });

  it('universities want a passing school average; community colleges take anyone', () => {
    const weak = clone(grad18(12));
    weak.education.grade = 40;
    expect(() => act(weak, { type: 'enroll', kind: 'university', programId: 'history' })).toThrow(
      /school average/,
    );
    expect(
      act(weak, { type: 'enroll', kind: 'community', programId: 'history' }).state.education
        .enrollment?.kind,
    ).toBe('community');
  });

  it('costs follow the country: free in Germany, expensive in the US', () => {
    expect(tuitionFor(grad18(5, 'de'), 'university', 'history')).toBe(0);
    expect(tuitionFor(grad18(5, 'us'), 'university', 'history')).toBeGreaterThan(15000);
    expect(tuitionFor(grad18(5, 'us'), 'community', 'history')).toBeLessThan(
      tuitionFor(grad18(5, 'us'), 'university', 'history'),
    );
  });

  it('gives scholarships for high smarts and student loans when you cannot pay', () => {
    const genius = clone(grad18(6));
    genius.player.stats.smarts = 99;
    genius.education.grade = 95;
    let sch = 0;
    for (let i = 0; i < 10; i++) {
      const g = clone(genius);
      g.rng = [i + 1, i + 2, i + 3, i + 4];
      const r = act(forced(g), { type: 'enroll', kind: 'university', programId: 'history' }).state;
      if (r.education.enrollment?.scholarship) sch++;
    }
    expect(sch).toBeGreaterThan(0);
    const broke = clone(grad18(7));
    broke.player.stats.smarts = 60;
    broke.money.cash = 0;
    for (const n of broke.npcs) n.money = 0;
    let s = act(forced(broke), { type: 'enroll', kind: 'university', programId: 'history' }).state;
    s = { ...s, cheats: { ...s.cheats, forceSuccess: false } };
    s = playYears(s, 1);
    expect(s.money.loans.some((l) => l.kind === 'student')).toBe(true);
  });

  it('runs four years and graduates with a GPA; community college is two', () => {
    let s = act(forced(grad18(8)), {
      type: 'enroll',
      kind: 'university',
      programId: 'economics',
    }).state;
    s = { ...s, cheats: { ...s.cheats, forceSuccess: false, noBadEvents: true } };
    s = playYears(s, 4);
    const deg = s.education.degrees.find((d) => d.level === 'bachelor');
    expect(deg?.field).toBe('economics');
    expect(deg?.gpa).toBeGreaterThan(0);
    expect(deg?.gpa).toBeLessThanOrEqual(4);
    let c = act(runCheat(grad18(9), 'stat.set', { stat: 'smarts', value: 70 }).state, {
      type: 'enroll',
      kind: 'community',
      programId: 'business',
    }).state;
    c = playYears(c, 2);
    expect(c.education.degrees.some((d) => d.level === 'associate')).toBe(true);
  });
});

describe('graduate programs (M6.3)', () => {
  it('enforce their requirements and lead to their degrees', () => {
    let s = runCheat(life(10), 'age.set', { age: 22 }).state;
    expect(() => act(s, { type: 'enroll', kind: 'grad', programId: 'law' })).toThrow(/bachelor/);
    s = runCheat(s, 'degree.grant', { level: 'bachelor', field: 'english' }).state;
    expect(() => act(s, { type: 'enroll', kind: 'grad', programId: 'medicine' })).toThrow(
      /biology|chemistry/,
    );
    expect(() => act(s, { type: 'enroll', kind: 'grad', programId: 'mba' })).toThrow(
      /2 years of work/,
    );
    s = runCheat(s, 'stat.set', { stat: 'smarts', value: 95 }).state;
    let law = act(forced(s), { type: 'enroll', kind: 'grad', programId: 'law' }).state;
    expect(law.education.enrollment?.length).toBe(3);
    law = playYears(
      { ...law, cheats: { ...law.cheats, forceSuccess: false, noBadEvents: true } },
      3,
    );
    expect(law.education.degrees.some((d) => d.level === 'law')).toBe(true);
    const med = runCheat(
      runCheat(s, 'degree.grant', { level: 'bachelor', field: 'biology' }).state,
      'stat.set',
      { stat: 'smarts', value: 95 },
    ).state;
    const m = act(forced(med), { type: 'enroll', kind: 'grad', programId: 'medicine' }).state;
    expect(m.education.enrollment?.length).toBe(4);
    const phd = act(forced(s), { type: 'enroll', kind: 'grad', programId: 'phd' }).state;
    expect(phd.education.enrollment?.length).toBe(5);
  });

  it('medicine leads to a residency before full doctor pay', () => {
    let s = runCheat(life(11), 'age.set', { age: 27 }).state;
    s = runCheat(s, 'degree.grant', { level: 'medicine', field: 'medicine' }).state;
    s = runCheat(s, 'stat.set', { stat: 'smarts', value: 90 }).state;
    s = runCheat(s, 'stat.set', { stat: 'health', value: 90 }).state;
    s = act(s, { type: 'apply_job', jobId: 'doctor' }).state;
    expect(s.pending[0]?.eventId).toMatch(/^interview_/);
    s = forced(s);
    const { choose } = require_choose();
    s = choose(
      s,
      s.pending[0]?.eventId === 'interview_test'
        ? 'careful'
        : s.pending[0]?.eventId === 'interview_casual'
          ? 'passion'
          : 'honest',
    ).state;
    expect(s.career.jobId).toBe('doctor');
    expect(s.education.residency).toBe(3);
    expect(() => act(s, { type: 'career', id: 'ask_promotion' })).toThrow(/residency/);
  });
});

import * as engine from '../../src/engine';
function require_choose(): { choose: typeof engine.choose } {
  return { choose: engine.choose };
}
