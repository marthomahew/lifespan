import { describe, expect, it } from 'vitest';
import { act, ageUp, newLife, runCheat, type GameState } from '../../src/engine';
import { unmetRequirements } from '../../src/engine/systems/careers';
import { JOB_BY_ID } from '../../src/content/jobs';

const adult = (seed = 2700): GameState => {
  const s = runCheat(newLife({ birthYear: 1990, country: 'us' }, seed), 'age.set', {
    age: 22,
  }).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true, noBadEvents: true } };
};

describe('careers that are not ladders', () => {
  it('a pro athlete needs a sport, and their standing follows their form', () => {
    const s = adult();
    const pro = JOB_BY_ID['professional_athlete']!;
    expect(unmetRequirements(s, pro).join()).toMatch(/national youth/);
    let p = runCheat(s, 'job.set', { job: 'professional_athlete' }).state;
    p = {
      ...p,
      pending: [],
      sport: {
        sport: 'football',
        level: 4,
        best: 4,
        form: 90,
        seasons: 8,
        honours: [],
        active: true,
      },
    };
    p = { ...p, player: { ...p.player, skills: { ...p.player.skills, athletics: 99 } } };
    const after = ageUp(p).state;
    expect(after.career.jobId).toBe('professional_athlete');
    const f = after.sport?.form ?? 0;
    expect(after.career.level).toBe(f >= 88 ? 4 : f >= 76 ? 3 : f >= 63 ? 2 : f >= 50 ? 1 : 0);
    // Boots hung up: the playing career ends.
    const retired = ageUp({
      ...after,
      pending: [],
      sport: { ...after.sport!, active: false },
    }).state;
    expect(retired.career.jobId).toBeNull();
  });

  it('actors and politicians cannot simply ask for a promotion', () => {
    const actor = runCheat(adult(2701), 'job.set', { job: 'film_actor' }).state;
    expect(() => act({ ...actor, pending: [] }, { type: 'career', id: 'ask_promotion' })).toThrow(
      /parts you land/,
    );
    const mp = runCheat(adult(2702), 'job.set', { job: 'politician' }).state;
    expect(() => act({ ...mp, pending: [] }, { type: 'career', id: 'ask_raise' })).toThrow(
      /voters/,
    );
  });
});
