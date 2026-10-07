import { describe, expect, it } from 'vitest';
import { ageUp, newLife, runCheat } from '../../src/engine';
import { EVENT_BY_ID } from '../../src/content/events';

describe('office life is for office jobs', () => {
  it('a pro athlete or film actor never gets the office-fridge event; an accountant can', () => {
    const at = (job: string) => {
      const s = runCheat(newLife({ birthYear: 1990, country: 'us' }, 4200), 'age.set', {
        age: 24,
      }).state;
      return { ...runCheat({ ...s, pending: [] }, 'job.set', { job }).state, pending: [] };
    };
    const fridge = EVENT_BY_ID['work_ya_fridge_yogurt']!;
    expect(fridge.when?.(at('accountant'))).toBe(true);
    expect(fridge.when?.(at('professional_athlete'))).toBe(false);
    expect(fridge.when?.(at('film_actor'))).toBe(false);
  });

  it('a famous actor climbs the billing a rung a year', () => {
    let s = runCheat(newLife({ birthYear: 1990, country: 'us' }, 4300), 'age.set', {
      age: 25,
    }).state;
    s = runCheat({ ...s, pending: [] }, 'job.set', { job: 'film_actor' }).state;
    s = { ...s, pending: [], player: { ...s.player, stats: { ...s.player.stats, fame: 96 } } };
    for (let i = 0; i < 4; i++) {
      s = ageUp({ ...s, pending: [] }).state;
      s = { ...s, player: { ...s.player, stats: { ...s.player.stats, fame: 96 } } };
    }
    expect(s.career.jobId).toBe('film_actor');
    expect(s.career.level).toBeGreaterThanOrEqual(3);
  });
});
