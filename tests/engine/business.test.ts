import { describe, expect, it } from 'vitest';
import {
  act,
  ageUp,
  choose,
  currentPopup,
  newLife,
  runCheat,
  type GameState,
} from '../../src/engine';
import { netWorth } from '../../src/engine/networth';
import { freeTime } from '../../src/engine';

const founder = (seed: number, cash = 500_000): GameState => {
  let s = runCheat(newLife({ birthYear: 1980, country: 'us' }, seed), 'age.set', { age: 30 }).state;
  s = runCheat({ ...s, pending: [] }, 'money.set', { amount: cash }).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true, noBadEvents: true } };
};
function years(s: GameState, n: number): GameState {
  let t = s;
  for (let i = 0; i < n && !t.death; i++) {
    t = ageUp({ ...t, pending: [] }).state;
    for (let k = 0; k < 10 && t.pending.length; k++) {
      const id = currentPopup(t)?.choices.find((c) => c.enabled)?.id;
      if (!id) break;
      t = choose(t, id).state;
    }
  }
  return { ...t, pending: [] };
}

describe('a business of your own', () => {
  it('costs money to open, counts as your job, shows in net worth and pays in good years', () => {
    const s = founder(1000);
    const opened = act(s, {
      type: 'business',
      action: { op: 'start', kind: 'cafe', name: 'Lumière' },
    }).state;
    expect(opened.business?.name).toBe('Lumière');
    expect(opened.business?.hands).toBe('self');
    expect(opened.money.cash).toBeLessThan(s.money.cash);
    expect(netWorth(opened)).toBe(
      netWorth({ ...opened, business: null }) + (opened.business?.value ?? 0),
    );
    expect(freeTime(opened).why).toContain('full-time work');
    expect(opened.player.achievements).toContain('founder');
    const later = years(opened, 6);
    // Momentum can fold a business; most cafés with an owner on the floor survive six years.
    expect(later.log.some((l) => /profit|loss|closes/.test(l.text))).toBe(true);
  });

  it('expanding needs momentum and money; selling pays its value; a job hands it to a manager', () => {
    let s = act(founder(1001, 5_000_000), {
      type: 'business',
      action: { op: 'start', kind: 'firm' },
    }).state;
    s = { ...s, business: s.business ? { ...s.business, health: 80 } : null };
    const big = act(s, { type: 'business', action: { op: 'expand' } }).state;
    expect(big.business?.level).toBe(2);
    const weak = { ...s, business: s.business ? { ...s.business, health: 20 } : null };
    expect(() => act(weak, { type: 'business', action: { op: 'expand' } })).toThrow(/momentum/);
    const job = runCheat(big, 'job.set', { job: 'accountant' }).state;
    expect(job.business?.hands).toBe('manager');
    const value = big.business?.value ?? 0;
    const sold = act(big, { type: 'business', action: { op: 'sell' } }).state;
    expect(sold.business).toBeNull();
    expect(sold.money.cash - big.money.cash).toBe(Math.round(value * 0.9));
  });

  it('a business with no momentum folds; you can’t open one you can’t afford or as a child', () => {
    let s = act(founder(1002), { type: 'business', action: { op: 'start', kind: 'tech' } }).state;
    s = { ...s, business: s.business ? { ...s.business, health: 1 } : null };
    // A hopeless startup: no skill, no momentum.
    let folded = false;
    // Folding is a yearly roll at rock-bottom health; fifteen years makes it near-certain.
    for (let i = 0; i < 15 && !folded; i++) {
      s = years({ ...s, business: s.business ? { ...s.business, health: 1 } : null }, 1);
      folded = s.player.flags.includes('business_failed') || !s.business;
    }
    expect(folded).toBe(true);
    expect(() =>
      act(founder(1003, 100), { type: 'business', action: { op: 'start', kind: 'restaurant' } }),
    ).toThrow(/costs/);
    const kid = runCheat(newLife({ birthYear: 2000 }, 1004), 'age.set', { age: 12 }).state;
    expect(() =>
      act({ ...kid, pending: [] }, { type: 'business', action: { op: 'start', kind: 'cafe' } }),
    ).toThrow(/18/);
  });

  it('business events need a business and use its name', () => {
    const s = act(founder(1005), {
      type: 'business',
      action: { op: 'start', kind: 'cafe', name: 'Lumière' },
    }).state;
    const fired = runCheat(s, 'event.fire', { event: 'biz_rival', force: 'on' }).state;
    expect(currentPopup(fired)?.text).toContain('Lumière');
    const before = fired.business?.health ?? 0;
    expect(choose(fired, 'niche').state.business?.health).toBeGreaterThan(before);
    const none = founder(1006);
    expect(runCheat(none, 'event.fire', { event: 'biz_rival' }).state.pending).toHaveLength(0);
  });
});
