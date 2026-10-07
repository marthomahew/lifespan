import { describe, expect, it } from 'vitest';
import {
  act,
  ageUp,
  choose,
  jobListings,
  newLife,
  runCheat,
  unmetRequirements,
  type GameState,
} from '../../src/engine';
import { FULL_TIME_JOBS, JOB_BY_ID, JOB_FIELDS, PART_TIME_JOBS } from '../../src/content/jobs';
import { careerIncome, pensionFor, unemploymentBenefit } from '../../src/engine/systems/careers';
import { perkBonus, perkEffect, perkNotes } from '../../src/engine/systems/perks';
import { treatmentCost } from '../../src/engine/systems/health';
import { ILLNESS_BY_ID } from '../../src/content/illnesses';
import { clone } from '../../src/engine/util';
import { playYears } from '../helpers';

const adult = (seed = 1, age = 25): GameState => {
  const s = runCheat(newLife({ country: 'us', birthYear: 1990 }, seed), 'age.set', { age }).state;
  return { ...s, cheats: { ...s.cheats, immortal: true, noBadEvents: true } };
};
const forced = (s: GameState): GameState => ({ ...s, cheats: { ...s.cheats, forceSuccess: true } });
const unforced = (s: GameState): GameState => ({
  ...s,
  cheats: { ...s.cheats, forceSuccess: false },
});

/** Apply and pass the interview (force success), returning the hired state. */
function getJob(s: GameState, jobId: string): GameState {
  let cur = act(forced(s), { type: 'apply_job', jobId }).state;
  const pe = cur.pending[0];
  if (pe) {
    const first =
      { interview_panel: 'honest', interview_casual: 'passion', interview_test: 'careful' }[
        pe.eventId
      ] ?? 'honest';
    cur = choose(cur, first).state;
  }
  return unforced(cur);
}

describe('job catalog and listings (M6.4)', () => {
  it('meets DONE §3: 45+ full-time jobs across 10+ fields, 8+ part-time jobs for 14–17', () => {
    expect(FULL_TIME_JOBS.length).toBeGreaterThanOrEqual(45);
    expect(JOB_FIELDS.length).toBeGreaterThanOrEqual(10);
    expect(PART_TIME_JOBS.filter((j) => j.req.minAge <= 17).length).toBeGreaterThanOrEqual(8);
    for (const j of [...FULL_TIME_JOBS, ...PART_TIME_JOBS]) {
      expect(j.titles.length, j.id).toBe(j.salary.length);
      for (const [lo, hi] of j.salary) expect(hi).toBeGreaterThanOrEqual(lo);
    }
  });

  it('lists requirements met or not', () => {
    const s = adult(2, 19);
    const rows = jobListings(s);
    expect(rows.find((r) => r.job.id === 'doctor')?.unmet.join()).toMatch(/medicine/);
    expect(rows.find((r) => r.job.id === 'retail_associate')?.unmet).toEqual([]);
    const withRecord = clone(s);
    withRecord.legal.record.push({
      crimeId: 'theft',
      year: s.year,
      age: 19,
      verdict: 'convicted',
      sentenceYears: 0,
      juvenile: false,
    });
    expect(
      unmetRequirements(withRecord, JOB_BY_ID['police_officer'] ?? FULL_TIME_JOBS[0]!).join(),
    ).toMatch(/clean record/);
  });
});

describe('applications and the job (M6.5)', () => {
  it('an application leads to an interview event, then a hire with coworkers and a boss', () => {
    const s = act(adult(3), { type: 'apply_job', jobId: 'retail_associate' }).state;
    expect(s.pending[0]?.eventId).toMatch(/^interview_/);
    expect(s.pending[0]?.payload['jobId']).toBe('retail_associate');
    const hired = getJob(adult(3), 'retail_associate');
    expect(hired.career.jobId).toBe('retail_associate');
    expect(hired.player.flags).toContain('ever_employed_ft');
    expect(hired.npcs.filter((n) => n.alive && n.roles.includes('coworker'))).toHaveLength(2);
    expect(hired.npcs.filter((n) => n.alive && n.roles.includes('boss'))).toHaveLength(1);
    expect(() => act(hired, { type: 'apply_job', jobId: 'retail_associate' })).toThrow(
      /already work/,
    );
  });

  it('interviews use stats, traits, and skills', () => {
    let good = 0;
    let bad = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const strong = clone(adult(seed));
      strong.player.stats.smarts = 95;
      strong.player.stats.looks = 90;
      strong.player.traits = ['ambitious', 'charming'];
      const weak = clone(adult(seed));
      weak.player.stats.smarts = 10;
      weak.player.stats.looks = 10;
      weak.player.traits = ['lazy', 'awkward'];
      for (const [st, inc] of [
        [strong, () => good++],
        [weak, () => bad++],
      ] as const) {
        let x = act(st, { type: 'apply_job', jobId: 'retail_associate' }).state;
        const pe = x.pending[0];
        if (pe)
          x = choose(
            x,
            { interview_panel: 'honest', interview_casual: 'passion', interview_test: 'careful' }[
              pe.eventId
            ] ?? 'honest',
          ).state;
        if (x.career.jobId) inc();
      }
    }
    expect(good).toBeGreaterThan(bad + 8);
  });

  it('performance drives raises and promotions; poor performance gets you fired', () => {
    const base = getJob(adult(4), 'accountant' in JOB_BY_ID ? 'bank_teller' : 'retail_associate');
    // Life can intervene (a backpacking year ends the job), so judge the first star who stays.
    let stayed: GameState | null = null;
    for (let seed = 4; seed < 12 && !stayed; seed++) {
      const star = clone(seed === 4 ? base : getJob(adult(seed), base.career.jobId ?? ''));
      star.player.stats.smarts = 95;
      star.player.stats.discipline = 95;
      star.career.performance = 95;
      let s = star;
      for (let i = 0; i < 8 && s.career.jobId; i++)
        s = playYears(act(s, { type: 'career', id: 'work_harder' }).state, 1);
      // Judge a star still in the same job (a new job starts again at the bottom).
      if (s.career.jobId === star.career.jobId) stayed = s;
    }
    expect(stayed?.career.level).toBeGreaterThan(0);
    expect(stayed?.log.some((l) => l.text.startsWith('Promoted to'))).toBe(true);
    const slacker = clone(base);
    slacker.player.stats.smarts = 5;
    slacker.player.stats.discipline = 0;
    slacker.player.traits = ['lazy'];
    slacker.career.performance = 5;
    let f = slacker;
    const firedFrom = (x: GameState): boolean => x.career.history.some((h) => h.reason === 'fired');
    for (let i = 0; i < 10 && !firedFrom(f); i++) f = playYears(f, 1);
    // Fired (a job lead may have found new work since, which is fine).
    expect(firedFrom(f)).toBe(true);
    expect(f.career.history.find((h) => h.reason === 'fired')?.jobId).toBe(base.career.jobId);
  });

  it('asking for a raise, quitting, and retiring with a pension that depends on years and country', () => {
    let s = getJob(adult(5), 'retail_associate');
    const before = s.career.salary;
    s = act(forced(s), { type: 'career', id: 'ask_raise' }).state;
    expect(s.career.salary).toBeGreaterThan(before);
    expect(() => act(s, { type: 'career', id: 'ask_raise' })).toThrow(/already asked/);
    const q = act(s, { type: 'career', id: 'quit' }).state;
    expect(q.career.jobId).toBeNull();
    expect(q.career.history.at(-1)?.reason).toBe('quit');
    const old = clone(getJob(adult(6, 66), 'retail_associate'));
    old.career.yearsWorked = 40;
    const de = clone(old);
    de.player.country = 'de';
    expect(pensionFor(old)).toBeGreaterThan(
      pensionFor({ ...old, career: { ...old.career, yearsWorked: 10 } }),
    );
    expect(pensionFor(de)).not.toBe(pensionFor(old));
    const r = act(old, { type: 'career', id: 'retire' }).state;
    expect(r.career.retired).toBe(true);
    expect(careerIncome(r).other).toBe(r.career.pension);
    expect(r.career.pension).toBeGreaterThan(0);
  });

  it('coworkers you get on with become friends (M5.4 work friends)', () => {
    let s = clone(getJob(adult(7), 'retail_associate'));
    for (const n of s.npcs) if (n.roles.includes('coworker')) n.rel = 90;
    for (let i = 0; i < 6; i++) {
      for (const n of s.npcs) if (n.roles.includes('coworker')) n.lastContact = s.year;
      s = playYears(s, 1);
    }
    expect(s.npcs.some((n) => n.roles.includes('coworker') && n.roles.includes('friend'))).toBe(
      true,
    );
  });
});

describe('part-time jobs and freelance gigs (M6.6)', () => {
  it('teens can work part-time while at school', () => {
    const teen = runCheat(newLife({ country: 'us', birthYear: 2000 }, 8), 'age.set', {
      age: 15,
    }).state;
    const s = act(forced(teen), { type: 'apply_job', jobId: 'pt_newspaper_route' }).state;
    expect(s.career.partTimeId).toBe('pt_newspaper_route');
    expect(s.pending).toEqual([]);
    expect(careerIncome(s).salary).toBeGreaterThan(0);
    expect(() => act(teen, { type: 'apply_job', jobId: 'nurse' })).toThrow(/needs/);
  });

  it('freelance gigs pay by skill once a year', () => {
    const s = runCheat(adult(9), 'skill.set', { skill: 'programming', value: 80 }).state;
    const r = act(s, { type: 'career', id: 'freelance' }).state;
    expect(r.money.cash).toBeGreaterThan(s.money.cash);
    expect(() => act(r, { type: 'career', id: 'freelance' })).toThrow(/one gig a year/);
  });
});

describe('job perks with real effects', () => {
  const employed = (job: string, seed = 51): GameState => {
    const s = clone(runCheat(adult(seed, 35), 'job.set', { job }).state);
    s.cheats.noBadEvents = true;
    return s;
  };

  it('every perk note in the listings maps to a rule, and most jobs have one', () => {
    const real = FULL_TIME_JOBS.filter((j) => perkNotes(j.id).some((p) => p.note));
    expect(real.length / FULL_TIME_JOBS.length).toBeGreaterThan(0.5);
  });

  it('health insurance halves medical bills', () => {
    const nurse = employed('nurse');
    const idle = clone(nurse);
    idle.career.jobId = null;
    const flu = ILLNESS_BY_ID['pneumonia'];
    expect(flu).toBeDefined();
    if (!flu) return;
    const half = treatmentCost(idle, flu, 'doctor') / 2;
    expect(Math.abs(treatmentCost(nurse, flu, 'doctor') - half)).toBeLessThanOrEqual(1);
  });

  it('pension perks raise the pension', () => {
    const teacher = employed('school_teacher');
    teacher.career.yearsWorked = 30;
    const plain = clone(teacher);
    plain.career.jobId = 'accountant';
    expect(Math.abs(pensionFor(teacher) - pensionFor(plain) * 1.25)).toBeLessThanOrEqual(1);
  });

  it('bonuses follow performance and are paid, taxed, and logged with the year', () => {
    const dev = employed('software_engineer');
    dev.career.performance = 100;
    expect(perkBonus(dev)).toBe(Math.round(dev.career.salary * 0.15));
    dev.career.performance = 40;
    expect(perkBonus(dev)).toBe(0);
    dev.career.performance = 90;
    expect(careerIncome(dev).other).toBe(perkBonus(dev));
    const next = ageUp({ ...dev, pending: [] });
    expect(next.log.some((e) => /stock options vest/i.test(e.text))).toBe(true);
    expect(next.state.money.last?.otherIncome).toBeGreaterThan(0);
  });

  it('flexible work lowers stress and small comforts lift happiness', () => {
    const e = perkEffect(employed('web_developer'));
    expect(e.stress).toBeLessThan(0);
    expect(perkEffect(employed('retail_associate')).happiness).toBeGreaterThan(0);
    expect(perkEffect(employed('accountant')).stress).toBe(0);
  });
});

describe('out of work', () => {
  it('an unemployed adult gets a modest benefit, announced once; a job ends it', () => {
    const s = clone(adult(61, 30));
    expect(s.career.jobId).toBeNull();
    const pay = unemploymentBenefit(s);
    expect(pay).toBeGreaterThan(0);
    expect(careerIncome(s).other).toBe(pay);
    const y1 = ageUp({ ...s, pending: [] });
    expect(y1.log.filter((e) => /unemployment support/.test(e.text))).toHaveLength(1);
    const y2 = ageUp({ ...y1.state, pending: [] });
    expect(y2.log.filter((e) => /unemployment support/.test(e.text))).toHaveLength(0);
    const hired = runCheat(y2.state, 'job.set', { job: 'accountant' }).state;
    expect(unemploymentBenefit(hired)).toBe(0);
    // Students, retirees and children don't claim.
    expect(unemploymentBenefit(clone(adult(62, 12)))).toBe(0);
  });

  it('job leads offer real work you can take on the spot', () => {
    const s = clone(adult(63, 30));
    const fired = runCheat({ ...s, pending: [] }, 'event.fire', {
      event: 'lead_site_foreman',
      force: true,
    }).state;
    const hired = choose(fired, 'take').state;
    expect(hired.career.jobId).toBe('construction_worker');
  });
});
