import { describe, expect, it } from 'vitest';
import { ageUp, newLife, runCheat, type GameState } from '../../src/engine';
import { clone } from '../../src/engine/util';
import { playYears } from '../helpers';

/** A busy 70-year-old: 40 living NPCs, a long log, a full snapshot ring (SPEC §9.9). */
function busySeventy(): GameState {
  let s = runCheat(newLife({ country: 'us', birthYear: 1950 }, 99), 'immortal', { on: true }).state;
  s = playYears(s, 50);
  s = runCheat(s, 'age.set', { age: 70 }).state;
  for (let i = 0; s.npcs.filter((n) => n.alive).length < 40 && i < 80; i++)
    s = runCheat(s, 'npc.spawn', { role: i % 3 ? 'friend' : 'sibling' }).state;
  s = playYears(s, 1);
  const c = clone(s);
  // Pad the log toward the 5,000-entry budget.
  while (c.log.length < 5000)
    c.log.push({
      age: c.player.age,
      year: c.year,
      cat: 'random',
      text: `Filler line ${c.log.length}.`,
    });
  return { ...c, pending: [] };
}

describe('performance budgets (M11.7)', () => {
  it('ageUp takes under 50 ms for a 70-year-old with 40 NPCs', () => {
    const s = busySeventy();
    expect(s.npcs.filter((n) => n.alive).length).toBeGreaterThanOrEqual(40);
    expect(s.player.age).toBeGreaterThanOrEqual(70);
    for (let i = 0; i < 5; i++) ageUp(s); // warm up
    const runs = 30;
    const t0 = performance.now();
    for (let i = 0; i < runs; i++) ageUp(s);
    const avg = (performance.now() - t0) / runs;
    expect(avg).toBeLessThan(50);
  });
});
