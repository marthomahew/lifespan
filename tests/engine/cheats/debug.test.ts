import { describe, expect, it } from 'vitest';
import { newLife, runCheat, serialize } from '../../../src/engine';

const base = newLife({}, 15);

describe('debug cheats (M3.6)', () => {
  it("'state.replace' accepts valid edited JSON and refuses invalid JSON", () => {
    const edited = JSON.parse(serialize(base)) as { player: { first: string } };
    edited.player.first = 'Edited';
    expect(
      runCheat(base, 'state.replace', { json: JSON.stringify(edited) }).state.player.first,
    ).toBe('Edited');
    const bad = JSON.parse(serialize(base)) as { player: { stats: { health: number } } };
    bad.player.stats.health = -5;
    expect(() => runCheat(base, 'state.replace', { json: JSON.stringify(bad) })).toThrow();
    expect(() => runCheat(base, 'state.replace', { json: '{nope' })).toThrow();
  });

  it("'state.size' reports the save size", () => {
    expect(runCheat(base, 'state.size', {}).message).toMatch(/KB/);
  });

  it("'deathbot' plays the rest of the life", () => {
    const r = runCheat(base, 'deathbot', {});
    expect(r.state.death).not.toBeNull();
    expect(r.message).toMatch(/Died at/);
  });
});
