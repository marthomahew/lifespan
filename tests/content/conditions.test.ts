import { describe, expect, it } from 'vitest';
import { newLife, runCheat } from '../../src/engine';
import { inField, isJob, jobLevelAtLeast } from '../../src/content/events/conditions';

describe('career conditions for events', () => {
  it('match the current job, its field, and its level', () => {
    const idle = runCheat(newLife({ country: 'us', birthYear: 1990 }, 3), 'age.set', { age: 30 }).state;
    expect(inField('healthcare')(idle)).toBe(false);
    const nurse = runCheat(idle, 'job.set', { job: 'nurse', level: 2 }).state;
    expect(inField('healthcare')(nurse)).toBe(true);
    expect(inField('law')(nurse)).toBe(false);
    expect(isJob('doctor', 'nurse')(nurse)).toBe(true);
    expect(isJob('doctor')(nurse)).toBe(false);
    expect(jobLevelAtLeast(2)(nurse)).toBe(true);
    expect(jobLevelAtLeast(3)(nurse)).toBe(false);
  });
});
