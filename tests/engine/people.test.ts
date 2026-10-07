import { describe, expect, it } from 'vitest';
import { newLife, runCheat } from '../../src/engine';
import { closestPeople, npcSketch } from '../../src/engine/people';

describe('your people', () => {
  it('puts your partner, parents and children first, six at most, each with a sketch', () => {
    let s = runCheat(newLife({ birthYear: 1980, country: 'us' }, 2200), 'age.set', {
      age: 35,
    }).state;
    s = runCheat({ ...s, pending: [] }, 'npc.spawn', { role: 'spouse' }).state;
    s = runCheat({ ...s, pending: [] }, 'baby.now', {}).state;
    const people = closestPeople(s);
    expect(people.length).toBeLessThanOrEqual(6);
    expect(people[0]?.roles).toContain('spouse');
    expect(people.some((n) => n.roles.includes('child'))).toBe(true);
    for (const n of people) expect(npcSketch(n)).toMatch(/\.$/);
  });
});
