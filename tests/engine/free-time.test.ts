import { describe, expect, it } from 'vitest';
import { act, ageUp, newLife, runCheat, type GameState } from '../../src/engine';
import { freeTime } from '../../src/engine/systems/activities';
import { clone } from '../../src/engine/util';

const adult = (seed = 2): GameState => {
  const s = runCheat(newLife({ country: 'us', birthYear: 1990 }, seed), 'age.set', {
    age: 30,
  }).state;
  return clone({ ...s, pending: [], money: { ...s.money, cash: 1_000_000 } });
};

describe('free time', () => {
  it('depends on your life: work and small children take it, retirement gives it back', () => {
    const idle = adult();
    expect(freeTime(idle).total).toBe(7);
    const worker = runCheat(idle, 'job.set', { job: 'accountant' }).state;
    expect(freeTime(worker).total).toBe(4);
    const parent = runCheat(worker, 'baby.now', {}).state;
    expect(freeTime(parent).total).toBe(3);
    const retired = clone(idle);
    retired.career.retired = true;
    expect(freeTime(retired).total).toBe(8);
    expect(freeTime(newLife({}, 3)).total).toBe(4);
  });

  it('activities use it up; health care and admin do not; a new year refills it', () => {
    let s = runCheat(adult(4), 'job.set', { job: 'accountant' }).state;
    for (const id of ['gym', 'meditate', 'nightlife', 'volunteer'])
      s = act(s, { type: 'activity', id }).state;
    expect(freeTime(s).left).toBe(0);
    expect(() => act(s, { type: 'activity', id: 'join_club' })).toThrow(/free time/);
    // Seeing a doctor and writing a will still work.
    s = act(s, { type: 'activity', id: 'doctor_visit' }).state;
    s = act(s, { type: 'activity', id: 'write_will', params: {} }).state;
    s = ageUp({ ...s, pending: [] }).state;
    expect(freeTime(s).left).toBe(freeTime(s).total);
  });
});
