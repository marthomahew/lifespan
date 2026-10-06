import { describe, expect, it } from 'vitest';
import { newLife, runCheat } from '../../src/engine';
import {
  exCon,
  hasRecord,
  inField,
  isJob,
  jobLevelAtLeast,
  livesAbroad,
} from '../../src/content/events/conditions';

describe('career conditions for events', () => {
  it('match the current job, its field, and its level', () => {
    const idle = runCheat(newLife({ country: 'us', birthYear: 1990 }, 3), 'age.set', {
      age: 30,
    }).state;
    expect(inField('healthcare')(idle)).toBe(false);
    const nurse = runCheat(idle, 'job.set', { job: 'nurse', level: 2 }).state;
    expect(inField('healthcare')(nurse)).toBe(true);
    expect(inField('law')(nurse)).toBe(false);
    expect(isJob('doctor', 'nurse')(nurse)).toBe(true);
    expect(isJob('doctor')(nurse)).toBe(false);
    expect(jobLevelAtLeast(2)(nurse)).toBe(true);
    expect(jobLevelAtLeast(3)(nurse)).toBe(false);
  });

  it('know when you live abroad, have a record, or have served time', () => {
    const s = runCheat(newLife({ country: 'us', birthYear: 1990 }, 4), 'age.set', {
      age: 30,
    }).state;
    expect(livesAbroad(s)).toBe(false);
    expect(livesAbroad({ ...s, player: { ...s.player, country: 'ca' } })).toBe(true);
    expect(hasRecord(s)).toBe(false);
    const rec = {
      ...s,
      legal: {
        ...s.legal,
        record: [
          {
            crimeId: 'burglary',
            year: s.year,
            age: 30,
            verdict: 'convicted' as const,
            sentenceYears: 2,
            juvenile: false,
          },
        ],
      },
    };
    expect(hasRecord(rec)).toBe(true);
    expect(exCon(s)).toBe(false);
    expect(exCon({ ...s, player: { ...s.player, flags: [...s.player.flags, 'ex_con'] } })).toBe(
      true,
    );
  });
});

describe('eras', () => {
  it('a video-call event can’t happen in 1995', async () => {
    const { EVENT_BY_ID } = await import('../../src/content/events');
    const { eligibility } = await import('../../src/engine/events/select');
    const { newLife, runCheat } = await import('../../src/engine');
    const e = EVENT_BY_ID['wld2_general_strike'];
    if (!e) throw new Error('missing');
    const old = runCheat(newLife({ birthYear: 1960 }, 3), 'age.set', { age: 35 }).state;
    expect(eligibility(old, e).reason).toMatch(/not until/);
  });
});
