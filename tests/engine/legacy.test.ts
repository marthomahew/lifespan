import { describe, expect, it } from 'vitest';
import {
  continueAsChild,
  deserialize,
  heirOptions,
  legacyScore,
  newLife,
  runCheat,
  serialize,
  type GameState,
  type Npc,
} from '../../src/engine';
import { familyTree } from '../../src/engine/family-tree';
import { checkState } from '../../src/engine/bot/invariants';
import { playYears } from '../helpers';

/** A life with a spouse, two children (one with a child of their own), then death. */
function deadParent(): { s: GameState; heir: Npc; sibling: Npc } {
  let s = runCheat(newLife({ country: 'us', birthYear: 1950, first: 'Elspeth' }, 3), 'age.set', {
    age: 28,
  }).state;
  s = runCheat(s, 'npc.spawn', { role: 'spouse' }).state;
  s = runCheat(s, 'baby.now', {}).state;
  s = runCheat(s, 'baby.now', {}).state;
  s = runCheat(s, 'immortal', { on: true }).state;
  s = playYears(s, 30);
  const kids = s.npcs.filter((n) => n.roles.includes('child') && n.alive);
  s = runCheat(s, 'immortal', { on: false }).state;
  s = runCheat(s, 'deathbot', {}).state;
  const alive = s.npcs.filter((n) => n.roles.includes('child') && n.alive);
  const heir = alive[0] ?? kids[0];
  const sibling = alive[1] ?? kids[1];
  if (!heir || !sibling) throw new Error('setup');
  return { s, heir, sibling };
}

describe('continue as a child (M11.1)', () => {
  it('lists living children as heirs only after death', () => {
    const { s } = deadParent();
    expect(heirOptions(s).length).toBeGreaterThan(0);
    expect(heirOptions(newLife({}, 1))).toEqual([]);
  });

  it('the heir becomes the player with their inheritance; family and history carry over', () => {
    const { s, heir } = deadParent();
    const inherited = s.npcs.find((n) => n.id === heir.id)?.money ?? 0;
    const next = continueAsChild(s, heir.id);
    expect(next.death).toBeNull();
    expect(next.player.first).toBe(heir.first);
    expect(next.player.age).toBe(heir.age);
    expect(next.money.cash).toBe(Math.round(inherited));
    expect(next.generation).toBe(s.generation + 1);
    expect(next.dynasty).toEqual(s.dynasty);
    expect(next.lifeId).toMatch(/-g2$/);
    // The late player is now a (dead) parent; the other children are siblings.
    const parent = next.npcs.find((n) => n.flags.includes('previous_generation'));
    expect(parent?.first).toBe('Elspeth');
    expect(parent?.alive).toBe(false);
    expect(next.player.parentIds).toContain(parent?.id);
    expect(next.npcs.find((n) => n.roles.includes('sibling'))).toBeDefined();
    // The family tree still reaches back to the old generation's parents.
    const tree = familyTree(next);
    expect(tree.find((t) => t.id === parent?.id)?.gen).toBe(-1);
    expect(tree.some((t) => t.gen === -2)).toBe(true);
    expect(checkState(next, null)).toEqual([]);
    expect(deserialize(serialize(next))).toEqual(next);
  });

  it('refuses a dead or non-child heir', () => {
    const { s } = deadParent();
    const mother = s.npcs.find((n) => n.roles.includes('mother'));
    expect(() => continueAsChild(s, mother?.id ?? -1)).toThrow();
    expect(() => continueAsChild(newLife({}, 1), 5)).toThrow(/not over/);
  });

  it('the next generation plays on normally', () => {
    const { s, heir } = deadParent();
    const next = playYears(
      { ...continueAsChild(s, heir.id), cheats: { ...s.cheats, immortal: true } },
      5,
    );
    expect(next.player.age).toBe(heir.age + 5);
  });
});

describe('dynasty (M11.2)', () => {
  it('records each generation and scores the legacy', () => {
    const { s } = deadParent();
    expect(s.dynasty).toHaveLength(1);
    expect(s.dynasty[0]).toMatchObject({ first: 'Elspeth', birthYear: 1950 });
    const score = legacyScore(s.dynasty);
    expect(score).toBeGreaterThan(0);
    const richer = legacyScore([
      { ...s.dynasty[0]!, netWorthRef: 1e8, achievements: 30, fame: 80, children: 6 },
    ]);
    expect(richer).toBeGreaterThan(score);
    expect(Math.abs(legacyScore([...s.dynasty, ...s.dynasty]) - score * 2)).toBeLessThanOrEqual(1);
  });
});
