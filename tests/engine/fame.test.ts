import { describe, expect, it } from 'vitest';
import { newLife } from '../../src/engine';
import { knownFor, knownForLine } from '../../src/engine/fame';

describe('fame, and what for', () => {
  it('names what you are known for, most notable first', () => {
    const s = newLife({ birthYear: 1980 }, 2500);
    expect(knownFor(s)).toEqual([]);
    const famous = {
      ...s,
      player: {
        ...s.player,
        flags: [...s.player.flags, 'nobel_laureate'],
        stats: { ...s.player.stats, fame: 60 },
      },
      chess: {
        rating: 2510,
        best: 2520,
        title: 'GM' as const,
        imNorms: 0,
        gmNorms: 3,
        events: 40,
        wins: 9,
        recent: [],
      },
      projects: { books: 2, novel: null },
    };
    expect(knownFor(famous)[0]).toBe('your Nobel prize');
    expect(knownForLine(famous)).toBe(
      'Known for your Nobel prize, chess (Grandmaster) and your novels.',
    );
  });
});
