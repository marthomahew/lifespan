import { describe, expect, it } from 'vitest';
import { newLife, runCheat, type GameState } from '../../src/engine';
import { EVENTS, EVENT_BY_ID } from '../../src/content/events';
import { prunePending } from '../../src/engine/events/select';

const adult = (seed: number, age = 40): GameState => {
  const s = runCheat(newLife({ birthYear: 1970, country: 'us' }, seed), 'age.set', { age }).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true } };
};

describe('fixes from the fourth transcript playtest', () => {
  it('a queued popup whose condition a choice has undone is dropped', () => {
    const s = structuredClone(adult(700));
    s.career.jobId = null;
    const needsJob = EVENTS.find((e) => e.when && !e.bind && !e.when(s) && e.id === 'wl_lawsuit');
    expect(needsJob).toBeDefined();
    s.pending = [
      { eventId: 'wl_lawsuit', bindings: {}, payload: {}, source: 'random' },
      { eventId: 'wl_lawsuit', bindings: {}, payload: {}, source: 'chain' },
    ];
    prunePending(s);
    expect(s.pending.map((p) => p.source)).toEqual(['chain']);
  });

  it('events that need a situation wait for it', () => {
    const when = (id: string, s: GameState): boolean => {
      const def = EVENT_BY_ID[id];
      return !def?.when || def.when(s);
    };
    const s = structuredClone(adult(701, 55));
    // A living parent: the family home isn't empty.
    expect(s.npcs.some((n) => n.alive && n.roles.includes('mother'))).toBe(true);
    expect(when('mid2_family_home', s)).toBe(false);
    for (const n of s.npcs)
      if (n.roles.includes('mother') || n.roles.includes('father')) n.alive = false;
    expect(when('mid2_family_home', s)).toBe(true);
    // Never partnered: no dating "again".
    expect(s.npcs.some((n) => n.roles.includes('ex'))).toBe(false);
    expect(when('rom2_dating_again_later', s)).toBe(false);
    // Living with a partner: no flatmates.
    const young = runCheat(structuredClone(adult(702, 22)), 'npc.spawn', { role: 'partner' }).state;
    expect(
      when('ya2_bad_flatmate', { ...young, assets: { ...young.assets, housing: 'renting' } }),
    ).toBe(false);
    // The baby-name event belongs to a real newborn granddaughter.
    expect(EVENT_BY_ID['mid2_baby_name']?.bind?.['baby']).toMatchObject({
      role: 'grandchild',
      maxAge: 0,
    });
  });
});
