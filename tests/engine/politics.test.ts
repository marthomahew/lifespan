import { describe, expect, it } from 'vitest';
import { act, ageUp, newLife, runCheat, type GameState } from '../../src/engine';
import { Ctx } from '../../src/engine/ctx';
import { clone } from '../../src/engine/util';
import { initPolitics, officeName } from '../../src/engine/systems/politics';

const politician = (country = 'uk', seed = 4900, approval = 70): GameState => {
  let s = runCheat(newLife({ birthYear: 1970, country }, seed), 'age.set', { age: 35 }).state;
  s = runCheat({ ...s, pending: [] }, 'job.set', { job: 'politician' }).state;
  const ctx = new Ctx(clone({ ...s, pending: [] }));
  initPolitics(ctx);
  ctx.s.politics!.approval = approval;
  return { ...ctx.s, cheats: { ...ctx.s.cheats, immortal: true } };
};

describe('a political career', () => {
  it('offices are named for the country', () => {
    expect(officeName(politician('us'), 4)).toBe('President');
    expect(officeName(politician('uk'), 4)).toBe('Prime Minister');
    expect(officeName(politician('us'), 2)).toBe('Member of Congress');
  });

  it('a term ends in an election with a vote share; a popular councillor standing for mayor wins', () => {
    let s = politician('uk', 4901, 85);
    s = act(s, { type: 'politics', action: { op: 'run_higher' } }).state;
    const end = s.politics!.termEnds;
    while (s.year < end) {
      s = ageUp({ ...s, pending: [] }).state;
      if (s.politics) s.politics.approval = 85;
    }
    const e = s.politics!.elections.at(-1);
    expect(e?.office).toBe('Mayor');
    expect(e?.won).toBe(true);
    expect(s.career.level).toBe(1);
    expect(s.log.some((l) => /Election night: you win as Mayor, \d+\.\d%/.test(l.text))).toBe(true);
  });

  it('an unpopular politician loses their seat, and can run again', () => {
    let s = politician('uk', 4902, 5);
    for (let i = 0; i < 5 && s.career.jobId === 'politician'; i++) {
      s = ageUp({ ...s, pending: [] }).state;
      if (s.politics) s.politics.approval = 5;
    }
    expect(s.career.jobId).not.toBe('politician');
    expect(s.politics?.elections.at(-1)?.won).toBe(false);
    expect(() =>
      act({ ...s, pending: [] }, { type: 'politics', action: { op: 'run_again' } }),
    ).not.toThrow();
  });

  it('bills pass or fail; a leader whose party governs takes the top job', () => {
    let s = politician('uk', 4903, 80);
    s = {
      ...s,
      career: { ...s.career, level: 2 },
      politics: { ...s.politics!, inGovernment: true },
    };
    s = act(s, { type: 'politics', action: { op: 'bill', area: 'schools' } }).state;
    expect(s.politics!.bills).toHaveLength(1);
    let led = s;
    for (let i = 0; i < 10 && !led.politics?.leader; i++) {
      const tryIt = act(
        { ...led, usage: { year: 0, used: {} } },
        { type: 'politics', action: { op: 'run_leader' } },
      ).state;
      led = tryIt;
    }
    expect(led.politics?.leader).toBe(true);
    expect(led.career.level).toBe(4);
    expect(led.career.history.at(-1)?.title).toBe('Prime Minister');
  });
});

describe('entering politics', () => {
  it('anyone from 21 can stand for the council; a well-liked candidate often wins', () => {
    let wins = 0;
    for (let seed = 0; seed < 12; seed++) {
      let s = runCheat(newLife({ birthYear: 1980, country: 'us' }, 4950 + seed), 'age.set', {
        age: 30,
      }).state;
      s = {
        ...s,
        pending: [],
        player: { ...s.player, stats: { ...s.player.stats, fame: 40, karma: 80, smarts: 80 } },
      };
      const after = act(s, { type: 'politics', action: { op: 'run_again' } }).state;
      if (after.career.jobId === 'politician') wins++;
    }
    expect(wins).toBeGreaterThanOrEqual(6);
  });
});
