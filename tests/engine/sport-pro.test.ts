import { describe, expect, it } from 'vitest';
import { ageUp, choose, newLife, runCheat, type GameState } from '../../src/engine';
import { Ctx } from '../../src/engine/ctx';
import { clone } from '../../src/engine/util';
import { seedRng } from '../../src/engine/rng';
import { draftPick, turnPro } from '../../src/engine/systems/sport-pro';

const prospect = (form: number, level = 4, seed = 4400, position = 'qb'): GameState => {
  const s = runCheat(newLife({ birthYear: 1993, country: 'us' }, seed), 'age.set', {
    age: 21,
  }).state;
  return {
    ...s,
    pending: [],
    cheats: { ...s.cheats, immortal: true },
    sport: {
      sport: 'american_football',
      level,
      best: level,
      form,
      seasons: 14,
      honours: [],
      active: true,
      position,
    },
    player: { ...s.player, skills: { ...s.player.skills, athletics: 100 } },
  };
};

describe('a professional career', () => {
  it('a 100-form star at a major programme goes near the top of the draft; a weaker one later', () => {
    const picks = (form: number, level: number): number[] =>
      Array.from({ length: 30 }, (_, i) => {
        const ctx = new Ctx({ ...clone(prospect(form, level)), rng: seedRng(i + 1) });
        return draftPick(ctx)?.pick ?? 999;
      });
    const star = picks(100, 4);
    const avg = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / xs.length;
    expect(avg(star)).toBeLessThan(15);
    expect(Math.min(...star)).toBeLessThanOrEqual(3);
    expect(avg(picks(70, 3))).toBeGreaterThan(60);
  });

  it('a first-overall pick signs a rookie deal near $10M and starts; undrafted means the practice squad', () => {
    const top = new Ctx(clone(prospect(100)));
    turnPro(top, 1);
    expect(top.s.career.jobId).toBe('professional_athlete');
    expect(top.s.career.salary / top.s.inflation).toBeGreaterThan(9_000_000);
    expect(top.s.career.level).toBe(2);
    expect(top.s.proSport?.contractYears).toBe(4);
    const undrafted = new Ctx(clone(prospect(60, 3, 4401)));
    turnPro(undrafted, 0);
    expect(undrafted.s.career.level).toBe(0);
    expect(undrafted.s.career.salary / undrafted.s.inflation).toBeLessThan(400_000);
  });

  it('pro seasons bring position statistics, honours and new contracts', () => {
    const ctx = new Ctx(clone(prospect(100)));
    turnPro(ctx, 3);
    let s = ctx.s;
    for (let i = 0; i < 6; i++) {
      s = ageUp({ ...s, pending: [] }).state;
      s = { ...s, sport: { ...s.sport!, form: 97 } };
    }
    expect(s.career.jobId).toBe('professional_athlete');
    expect(s.proSport?.last).toMatch(/passing yards/);
    expect(s.proSport?.honours.length ?? 0).toBeGreaterThan(0);
    expect(s.log.some((l) => /new deal|re-sign/.test(l.text))).toBe(true);
  });
});

describe('the end of a career', () => {
  it('an older pro is asked whether to retire; retiring ends the playing career', () => {
    const ctx = new Ctx(clone(prospect(70)));
    turnPro(ctx, 100);
    let s = runCheat(ctx.s, 'age.set', { age: 36 }).state;
    s = ageUp({ ...s, pending: [] }).state;
    const ask = s.pending.find((p) => p.eventId === 'sport_pro_retire');
    expect(ask).toBeDefined();
    s = { ...s, pending: [ask!] };
    s = choose(s, 'retire').state;
    expect(s.sport?.active).toBe(false);
    s = ageUp({ ...s, pending: [] }).state;
    expect(s.career.jobId).not.toBe('professional_athlete');
  });
});
