import { describe, expect, it } from 'vitest';
import { ageUp, currentPopup, newLife, runCheat, type GameState } from '../../src/engine';

const withMemory = (delta: number, seed: number): GameState => {
  let s = runCheat(newLife({ birthYear: 1980, country: 'us' }, seed), 'age.set', { age: 35 }).state;
  s = { ...s, pending: [], cheats: { ...s.cheats, immortal: true } };
  const mum = s.npcs.find((n) => n.roles.includes('mother') && n.alive);
  if (!mum) throw new Error('no mother');
  const text = delta > 0 ? 'the night you drove her to hospital' : 'the wedding you missed';
  return {
    ...s,
    npcs: s.npcs.map((n) =>
      n.id === mum.id ? { ...n, memory: [...n.memory, { year: s.year - 6, text, delta }] } : n,
    ),
  };
};

describe('memories drive events', () => {
  for (const [delta, id] of [
    [20, 'mem_gratitude'],
    [-20, 'mem_grudge'],
  ] as const)
    it(`a strong memory comes back: ${id}`, () => {
      let s = withMemory(delta, 80);
      let seen = '';
      for (let y = 0; y < 15 && !seen; y++) {
        s = ageUp({ ...s, pending: [] }).state;
        for (const p of s.pending) if (p.eventId === id) seen = currentPopupText(s, id);
      }
      expect(seen).toMatch(delta > 0 ? /drove her to hospital/ : /wedding you missed/);
    });
});

function currentPopupText(s: GameState, id: string): string {
  const i = s.pending.findIndex((p) => p.eventId === id);
  const t = { ...s, pending: [s.pending[i]!, ...s.pending.filter((_, j) => j !== i)] };
  return currentPopup(t)?.text ?? '';
}

describe('settled memories', () => {
  it('once brought back, the same memory doesn’t come round again', () => {
    let s = withMemory(20, 81);
    let times = 0;
    for (let y = 0; y < 40; y++) {
      s = ageUp({ ...s, pending: [] }).state;
      times += s.pending.filter((p) => p.eventId === 'mem_gratitude').length;
    }
    expect(times).toBeLessThanOrEqual(1);
  });
});
