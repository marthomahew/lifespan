import { describe, expect, it } from 'vitest';
import { Rng, seedRng } from '../../src/engine/rng';

describe('rng', () => {
  it('is deterministic for a seed', () => {
    const a = new Rng(seedRng(42));
    const b = new Rng(seedRng(42));
    const xs = Array.from({ length: 50 }, () => a.next());
    const ys = Array.from({ length: 50 }, () => b.next());
    expect(xs).toEqual(ys);
  });

  it('differs between seeds and stays in [0,1)', () => {
    const a = new Rng(seedRng(1));
    const b = new Rng(seedRng(2));
    let same = 0;
    for (let i = 0; i < 1000; i++) {
      const x = a.next();
      const y = b.next();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
      if (x === y) same++;
    }
    expect(same).toBe(0);
  });

  it('has a roughly uniform mean and int range', () => {
    const r = new Rng(seedRng(7));
    let sum = 0;
    const counts = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 60000; i++) {
      sum += r.next();
      const k = r.int(0, 5);
      counts[k] = (counts[k] ?? 0) + 1;
    }
    expect(sum / 60000).toBeGreaterThan(0.49);
    expect(sum / 60000).toBeLessThan(0.51);
    for (const c of counts) expect(c).toBeGreaterThan(9500);
  });

  it('does not mutate the state it was constructed from', () => {
    const st = seedRng(3);
    const copy = [...st];
    const r = new Rng(st);
    r.next();
    expect(st).toEqual(copy);
    expect(r.state).not.toEqual(copy);
  });

  it('weighted pick respects zero weights', () => {
    const r = new Rng(seedRng(9));
    for (let i = 0; i < 200; i++) {
      expect(r.weighted(['a', 'b', 'c'], (x) => (x === 'b' ? 0 : 1))).not.toBe('b');
    }
    expect(r.weighted(['a'], () => 0)).toBeUndefined();
  });
});
