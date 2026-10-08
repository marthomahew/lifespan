import { describe, expect, it } from 'vitest';
import { ageUp, newLife, runCheat, type GameState } from '../../src/engine';
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

describe('inheriting the family home', () => {
  it('a share that covers the house brings the house itself', () => {
    let got = false;
    for (let seed = 1; seed <= 6 && !got; seed++) {
      let s = runCheat(
        immortal(newLife({ wealth: 'middle', birthYear: 1960, siblings: 0 }, seed)),
        'age.set',
        {
          age: 40,
        },
      ).state;
      s = {
        ...s,
        pending: [],
        npcs: s.npcs.map((n) =>
          n.roles.includes('mother')
            ? {
                ...n,
                birthYear: s.year - 97,
                age: 97,
                rel: 95,
                home: 600000,
                mortgage: 0,
                stats: { ...n.stats, health: 0 },
              }
            : n.roles.includes('father')
              ? { ...n, alive: false, deathYear: s.year - 5 }
              : n,
        ),
      };
      for (let i = 0; i < 8 && !got; i++) {
        s = { ...ageUp({ ...s, pending: [] }).state, pending: [] };
        const mum = s.npcs.find((n) => n.roles.includes('mother'))!;
        if (!mum.alive) {
          got = s.assets.homes.some((h) => h.name.startsWith(`${mum.first}'s`));
          expect(got).toBe(true);
        }
      }
    }
    expect(got).toBe(true);
  });
});
