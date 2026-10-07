import { describe, expect, it } from 'vitest';
import { newLife, type GameState } from '../../src/engine';
import { npcMoneyLine, npcNetWorth } from '../../src/engine/systems/npc-economy';
import { playYears } from '../helpers';

const immortal = (s: GameState): GameState => ({ ...s, cheats: { ...s.cheats, immortal: true } });
const median = (xs: number[]): number =>
  [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] ?? 0;

describe('NPCs with lives of their own', () => {
  it('working parents earn, save, invest and mostly own homes by middle age', () => {
    const worths: number[] = [];
    let owners = 0;
    let parents = 0;
    for (let seed = 1; seed <= 12; seed++) {
      const s = playYears(immortal(newLife({ wealth: 'middle', birthYear: 1990 }, seed)), 20);
      for (const n of s.npcs.filter(
        (x) => x.alive && (x.roles.includes('mother') || x.roles.includes('father')),
      )) {
        parents++;
        if (n.home) owners++;
        worths.push(npcNetWorth(n) / s.inflation);
        expect(npcMoneyLine(s, n)).toContain('net worth');
      }
    }
    expect(owners / parents).toBeGreaterThan(0.5);
    // Middle-class parents around 45–60: a few hundred thousand, as in real surveys.
    const m = median(worths);
    expect(m).toBeGreaterThan(80_000);
    expect(m).toBeLessThan(2_000_000);
  });

  it('a parent’s whole estate (home equity included) is what gets passed on', () => {
    const s0 = immortal(newLife({ wealth: 'comfortable', birthYear: 1960 }, 12));
    let s = playYears(s0, 30);
    const parents = s0.npcs.filter((n) => n.roles.includes('mother') || n.roles.includes('father'));
    s = playYears(s, 40);
    const dead = s.npcs.filter((n) => parents.some((p) => p.id === n.id) && !n.alive);
    expect(dead.length).toBeGreaterThan(0);
    for (const n of dead) {
      expect(n.home ?? 0).toBe(0);
      expect(n.invest ?? 0).toBe(0);
    }
    expect(s.log.some((l) => /inherit|leaves you|estate/i.test(l.text))).toBe(true);
  });
});
