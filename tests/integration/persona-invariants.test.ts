import { describe, expect, it } from 'vitest';
import { runLives } from '../../scripts/sim-lib';
import { PERSONAS, botStep, newBotMemory } from '../../src/engine/bot/persona';
import { newLife } from '../../src/engine';
import { Rng, seedRng } from '../../src/engine/rng';

/** DONE §4.1 invariants hold for every bot persona, not just the default one in `npm run sim`. */
describe('invariants across personas', () => {
  for (const persona of PERSONAS.filter((p) => p !== 'default')) {
    it(`${persona}: 12 lives with save/load checkpoints and no violations`, () => {
      const r = runLives({
        seeds: Array.from({ length: 12 }, (_, i) => 500 + i),
        persona,
        checkpoints: 2,
      });
      expect(r.violations).toEqual([]);
    }, 60_000);
  }

  it('home-owning personas actually own homes, so mortgages and upkeep are exercised', () => {
    let owners = 0;
    let mortgaged = 0;
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      let s = newLife({}, seed);
      const bot = new Rng(seedRng(seed * 7919 + 13));
      const mem = newBotMemory();
      let owned = false;
      for (let i = 0; i < 20000 && !s.death; i++) {
        s = botStep(s, 'careerist', bot, mem);
        if (s.assets.homes.length) owned = true;
        if (s.money.loans.some((l) => l.kind === 'mortgage')) mortgaged += 1;
      }
      if (owned) owners += 1;
    }
    expect(owners).toBeGreaterThanOrEqual(5);
    expect(mortgaged).toBeGreaterThan(0);
  });
});
