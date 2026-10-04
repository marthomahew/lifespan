import { describe, expect, it } from 'vitest';
import { EVENTS } from '../../src/content/events';
import { chainParents, reasonFor, runCoverage } from '../../scripts/coverage-lib';
import { PERSONAS } from '../../src/engine/bot/persona';

describe('event coverage across personas (M10.5)', () => {
  it('a reduced run (30 lives per persona) already fires 85%+ of events, with reasons for the rest', () => {
    const r = runCoverage(30);
    expect(r.errors).toEqual([]);
    expect(Object.keys(r.perPersona).sort()).toEqual([...PERSONAS].sort());
    const fired = EVENTS.filter((e) => (r.fired.get(e.id) ?? 0) > 0).length;
    expect(fired / EVENTS.length).toBeGreaterThanOrEqual(0.85);
    const parents = chainParents();
    for (const e of EVENTS.filter((x) => !r.fired.get(x.id)))
      expect(reasonFor(e, r, parents).length).toBeGreaterThan(10);
  }, 120_000);
});
