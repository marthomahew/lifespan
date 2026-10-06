import { describe, expect, it } from 'vitest';
import { ageUp, choose, currentPopup, newLife, runCheat, type GameState } from '../../src/engine';

const married = (seed: number): GameState => {
  let s = runCheat(newLife({ birthYear: 1975, country: 'us' }, seed), 'age.set', { age: 30 }).state;
  s = runCheat({ ...s, pending: [] }, 'npc.spawn', { role: 'spouse' }).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true, noBadEvents: true } };
};
const spouse = (s: GameState) => s.npcs.find((n) => n.roles.includes('spouse'));

describe('a long marriage asks for attention', () => {
  it('checks in after seven years married, and not more than every eight years', () => {
    let s = married(300);
    const years: number[] = [];
    for (let y = 0; y < 30 && !s.death; y++) {
      s = ageUp({ ...s, pending: [] }).state;
      for (let i = 0; i < 10 && s.pending.length; i++) {
        const p = currentPopup(s);
        if (!p) break;
        if (p.eventId === 'mar_checkin') years.push(y);
        const id = p.eventId === 'mar_checkin' ? 'invest' : p.choices.find((c) => c.enabled)?.id;
        if (!id) break;
        s = choose(s, id).state;
      }
    }
    expect(years.length).toBeGreaterThanOrEqual(1);
    expect(years[0]).toBeGreaterThanOrEqual(6);
    for (let i = 1; i < years.length; i++)
      expect((years[i] ?? 0) - (years[i - 1] ?? 0)).toBeGreaterThanOrEqual(8);
  });

  it('tending it helps; coasting costs you', () => {
    let s = married(301);
    for (let y = 0; y < 30 && currentPopup(s)?.eventId !== 'mar_checkin'; y++) {
      s = ageUp({ ...s, pending: [] }).state;
      for (
        let i = 0;
        i < 10 && s.pending.length && currentPopup(s)?.eventId !== 'mar_checkin';
        i++
      ) {
        const id = currentPopup(s)?.choices.find((c) => c.enabled)?.id;
        if (!id) break;
        s = choose(s, id).state;
      }
    }
    expect(currentPopup(s)?.eventId).toBe('mar_checkin');
    const before = spouse(s)?.rel ?? 0;
    expect(spouse(choose(s, 'invest').state)?.rel ?? 0).toBeGreaterThan(before);
    expect(spouse(choose(s, 'coast').state)?.rel ?? 100).toBeLessThan(before);
  });
});
