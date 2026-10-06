import { describe, expect, it } from 'vitest';
import { choose, currentPopup, newLife, runCheat, type GameState } from '../../src/engine';
import { TEEN_PARENTING_EVENTS } from '../../src/content/events/parenting-teens';

/** A parent of 45 with one fifteen-year-old and money in the bank. */
const parent = (seed: number): GameState => {
  let s = runCheat(newLife({ birthYear: 1975, country: 'us' }, seed), 'age.set', { age: 45 }).state;
  s = runCheat({ ...s, pending: [] }, 'money.add', { amount: 50000 }).state;
  s = runCheat({ ...s, pending: [] }, 'baby.now', {}).state;
  const kid = s.npcs.find((n) => n.roles.includes('child'));
  return {
    ...s,
    pending: [],
    npcs: s.npcs.map((n) => (n.id === kid?.id ? { ...n, age: 15, rel: 60 } : n)),
    cheats: { ...s.cheats, immortal: true },
  };
};
const kidRel = (s: GameState): number => s.npcs.find((n) => n.roles.includes('child'))?.rel ?? -1;

describe('raising a teenager', () => {
  it('every teen event binds the child and every choice resolves, moving the relationship', () => {
    const base = parent(400);
    for (const def of TEEN_PARENTING_EVENTS) {
      const s = runCheat(base, 'event.fire', { event: def.id, force: 'on' }).state;
      const p = currentPopup(s);
      expect(p?.eventId, def.id).toBe(def.id);
      expect(p?.text, def.id).not.toMatch(/\{/);
      for (const c of p?.choices.filter((x) => x.enabled) ?? []) {
        const after = choose(s, c.id).state;
        expect(after.log.at(-1)?.text, `${def.id}/${c.id}`).not.toMatch(/\{/);
        expect(kidRel(after), `${def.id}/${c.id}`).not.toBe(-1);
      }
    }
  });

  it('banning the friends costs more trust than feeding them', () => {
    const s = runCheat(parent(401), 'event.fire', {
      event: 'part_friend_trouble',
      force: 'on',
    }).state;
    expect(kidRel(choose(s, 'ban').state)).toBeLessThan(kidRel(choose(s, 'welcome').state));
  });
});
