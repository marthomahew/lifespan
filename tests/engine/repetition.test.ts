import { describe, expect, it } from 'vitest';
import { newLife, runCheat } from '../../src/engine';
import { EVENT_BY_ID } from '../../src/content/events';
import { eligibility, fireEvent } from '../../src/engine/events/select';
import { addIllness } from '../../src/engine/systems/illness';
import { Ctx } from '../../src/engine/ctx';
import { clone } from '../../src/engine/util';

const adult = () =>
  clone(runCheat(newLife({ country: 'us', birthYear: 1990 }, 5), 'age.set', { age: 30 }).state);

describe('the same thing is not told twice', () => {
  it('a notice shows each of its outcomes at most once, then retires', () => {
    const def = EVENT_BY_ID['wld2_heatwave'];
    expect(def?.kind).toBe('notice');
    if (!def) return;
    const n = def.outcomes?.length ?? 0;
    expect(n).toBeGreaterThanOrEqual(2);
    for (let seed = 1; seed <= 10; seed++) {
      const s = adult();
      s.rng = clone(newLife({}, seed)).rng;
      const ctx = new Ctx(s);
      const texts: string[] = [];
      for (let i = 0; i < n; i++) {
        const from = s.log.length;
        fireEvent(ctx, def, 'random');
        texts.push(s.log[from]?.text ?? '');
      }
      expect(new Set(texts).size).toBe(n);
      s.events.lastFired[def.id] = -100;
      expect(eligibility(s, def).ok).toBe(false);
    }
  });

  it('catching the same bug again reads differently', () => {
    const s = adult();
    const ctx = new Ctx(s);
    addIllness(ctx, 'flu');
    s.health.illnesses = [];
    addIllness(ctx, 'flu');
    const flu = s.log.filter((e) => /flu/i.test(e.text));
    expect(flu).toHaveLength(2);
    expect(flu[0]?.text).not.toBe(flu[1]?.text);
    expect(flu[1]?.text).toMatch(/again/i);
  });
});
