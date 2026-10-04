import { describe, expect, it } from 'vitest';
import { runLives, evaluateBands } from '../../scripts/sim-lib';
import { checkState } from '../../src/engine/bot/invariants';
import { newLife } from '../../src/engine';
import { clone } from '../../src/engine/util';

describe('sim harness (M1.7)', () => {
  it('plays seeded lives to death with no invariant violations', () => {
    const r = runLives({ seeds: [1, 2, 3, 4, 5, 6, 7, 8], persona: 'default', checkpoints: 10 });
    expect(r.violations).toEqual([]);
    expect(r.lives).toHaveLength(8);
    for (const l of r.lives) expect(l.ageAtDeath).toBeLessThanOrEqual(120);
    expect(evaluateBands(r.metrics, 1).length).toBe(11);
  });

  it('the invariant checker catches violations', () => {
    const s = clone(newLife({}, 1));
    expect(checkState(s, null)).toEqual([]);
    const bad = clone(s);
    bad.player.stats.health = 101;
    expect(checkState(bad, null).join()).toMatch(/health/);
    const nan = clone(s);
    nan.money.cash = Number.NaN;
    expect(checkState(nan, null).join()).toMatch(/NaN/);
    const undef = clone(s) as unknown as { player: { city: unknown } };
    undef.player.city = undefined;
    expect(checkState(undef as never, null).join()).toMatch(/undefined/);
    const nul = clone(s) as unknown as { player: { city: unknown } };
    nul.player.city = null;
    expect(checkState(nul as never, null).join()).toMatch(/null/);
    expect(checkState(s, 5).join()).toMatch(/age went/);
    const tok = clone(s);
    tok.log.push({ age: 0, year: s.year, cat: 'random', text: 'Hello {friend.first}' });
    expect(checkState(tok, null).join()).toMatch(/token/);
    const dup = clone(s);
    const first = dup.npcs[0];
    if (first) dup.npcs.push({ ...first });
    expect(checkState(dup, null).join()).toMatch(/duplicate/);
    const minor = clone(s);
    const sib = minor.npcs[0];
    if (sib) sib.romance = { stage: 'dating', since: s.year, prenup: false };
    expect(checkState(minor, null).join()).toMatch(/minor/);
    const old = clone(s);
    if (old.npcs[0]) old.npcs[0].age = 121;
    expect(checkState(old, null).join()).toMatch(/alive at 121/);
    const deadBind = clone(s);
    if (deadBind.npcs[0]) deadBind.npcs[0].alive = false;
    deadBind.pending.push({
      eventId: 'x',
      bindings: { m: deadBind.npcs[0]?.id ?? 1 },
      payload: {},
      source: 'random',
    });
    expect(checkState(deadBind, null).join()).toMatch(/dead npc/);
  });
});

import { ENFORCE_BANDS, BANDS } from '../../scripts/sim-lib';

describe('balance bands (M10.6)', () => {
  it('are enforced by npm run sim', () => {
    expect(ENFORCE_BANDS).toBe(true);
    expect(BANDS.medianAge).toEqual([60, 92]);
    expect(BANDS.topEventShare).toEqual([0, 0.03]);
  });
});
