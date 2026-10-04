import { describe, expect, it } from 'vitest';
import { eventTable, newLife, runCheat } from '../../../src/engine';

const base = runCheat(newLife({}, 13), 'age.set', { age: 4 }).state;

describe('event cheats (M3.4)', () => {
  it("'event.fire' fires any event now, optionally ignoring conditions", () => {
    const s = runCheat(base, 'event.fire', { event: 'child_crayon_wall' }).state;
    expect(s.pending[0]?.eventId).toBe('child_crayon_wall');
    const old = runCheat(base, 'age.set', { age: 40 }).state;
    expect(runCheat(old, 'event.fire', { event: 'child_crayon_wall' }).message).toMatch(
      /Can't fire/,
    );
    expect(
      runCheat(old, 'event.fire', { event: 'child_crayon_wall', force: true }).state.pending,
    ).toHaveLength(1);
  });

  it("'event.reroll' replaces the current popup when something else is eligible", () => {
    const s = runCheat(base, 'event.fire', { event: 'child_crayon_wall' }).state;
    const r = runCheat(s, 'event.reroll', {});
    expect(r.message.length).toBeGreaterThan(0);
    expect(runCheat(base, 'event.reroll', {}).message).toMatch(/No popup/);
  });

  it("'category.toggle' switches a category off and on", () => {
    const off = runCheat(base, 'category.toggle', { category: 'family', on: false }).state;
    expect(off.cheats.disabledCategories).toContain('family');
    expect(eventTable(off).find((r) => r.id === 'child_crayon_wall')?.reason).toMatch(
      /switched off/,
    );
    expect(
      runCheat(off, 'category.toggle', { category: 'family', on: true }).state.cheats
        .disabledCategories,
    ).not.toContain('family');
  });

  it("'chains.list' and 'chain.fire' show and fire scheduled steps", () => {
    const s = {
      ...base,
      chains: [{ eventId: 'child_crayon_wall', dueYear: base.year + 3, payload: {}, bindings: {} }],
    };
    expect(runCheat(s, 'chains.list', {}).message).toContain('child_crayon_wall');
    const fired = runCheat(s, 'chain.fire', { index: 0 }).state;
    expect(fired.chains).toEqual([]);
    expect(fired.pending[0]?.eventId).toBe('child_crayon_wall');
  });

  it("'events.list' lists eligible events with their odds", () => {
    expect(runCheat(base, 'events.list', {}).message).toContain('child_crayon_wall');
    const t = eventTable(base);
    expect(t.every((r) => r.reason.length > 0)).toBe(true);
  });
});
