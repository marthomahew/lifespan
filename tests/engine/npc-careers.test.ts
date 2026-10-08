import { describe, expect, it } from 'vitest';
import { newLife, type GameState } from '../../src/engine';
import { playYears } from '../helpers';

const immortal = (s: GameState): GameState => ({ ...s, cheats: { ...s.cheats, immortal: true } });

describe('other people’s working lives', () => {
  it('siblings leave school for university or work; graduates get jobs that fit; parents retire', () => {
    let leftSchool = 0;
    let graduates = 0;
    let retired = 0;
    let stuck = 0;
    for (let seed = 1; seed <= 10; seed++) {
      const s = playYears(
        immortal(newLife({ wealth: 'middle', birthYear: 1970, siblings: 2 }, seed)),
        40,
      );
      for (const n of s.npcs.filter((x) => x.alive)) {
        if (n.roles.includes('sibling') && n.age >= 25) {
          if (n.job === 'At school') stuck++;
          else leftSchool++;
          if (n.edu === 'degree' || n.edu === 'postgrad') graduates++;
        }
        if ((n.roles.includes('mother') || n.roles.includes('father')) && n.age >= 71)
          expect(n.job).toBe('Retired');
        if (n.job === 'Retired') retired++;
      }
    }
    expect(stuck).toBe(0);
    expect(leftSchool).toBeGreaterThan(5);
    expect(graduates).toBeGreaterThan(0);
    expect(retired).toBeGreaterThan(0);
  });

  it('careers move: promotions and new jobs show up in the family log', () => {
    let moves = 0;
    for (let seed = 1; seed <= 8; seed++) {
      const s = playYears(
        immortal(newLife({ wealth: 'working', birthYear: 1975, siblings: 3 }, seed)),
        45,
      );
      moves += s.log.filter((l) =>
        /moves up in the world|graduates and starts work/.test(l.text),
      ).length;
    }
    expect(moves).toBeGreaterThan(2);
  });
});
