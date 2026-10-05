import { describe, expect, it } from 'vitest';
import { newLife, runCheat } from '../../src/engine';
import { familyTree, treeLayout } from '../../src/engine/family-tree';
import { PLAYER_ID } from '../../src/engine/types';

describe('family tree layout', () => {
  const family = () => {
    let s = newLife({ country: 'us', birthYear: 1970, gender: 'female', attraction: 'men' }, 81);
    s = runCheat(s, 'age.set', { age: 40 }).state;
    s = runCheat(s, 'npc.spawn', { role: 'partner' }).state;
    const partner = s.npcs.filter((n) => n.roles.includes('partner')).at(-1);
    s = runCheat(s, 'marry.now', { id: partner?.id ?? 0 }).state;
    s = runCheat(s, 'baby.now', {}).state;
    s = runCheat(s, 'baby.now', {}).state;
    return { s, partnerId: partner?.id ?? -1 };
  };

  it('puts your partner beside you and draws an edge for every shown parent', () => {
    const { s, partnerId } = family();
    const layout = treeLayout(familyTree(s));
    const own = layout.rows.find((r) => r.gen === 0)?.nodes ?? [];
    const me = own.findIndex((n) => n.id === PLAYER_ID);
    expect(own[me + 1]?.id).toBe(partnerId);
    const shown = new Set(layout.rows.flatMap((r) => r.nodes.map((n) => n.id)));
    for (const [child, parent] of layout.edges) {
      expect(shown.has(child)).toBe(true);
      expect(shown.has(parent)).toBe(true);
    }
    // Your children connect to both you and your spouse.
    const kids = layout.rows.find((r) => r.gen === 1)?.nodes ?? [];
    expect(kids.length).toBe(2);
    for (const k of kids) {
      expect(layout.edges).toContainEqual([k.id, PLAYER_ID]);
      expect(layout.edges).toContainEqual([k.id, partnerId]);
    }
    // Your parents connect to you.
    for (const p of s.player.parentIds) expect(layout.edges).toContainEqual([PLAYER_ID, p]);
  });

  it('ancestors sit over the children they belong to', () => {
    const { s } = family();
    const layout = treeLayout(familyTree(s));
    const parents = layout.rows.find((r) => r.gen === -1)?.nodes ?? [];
    const grand = layout.rows.find((r) => r.gen === -2)?.nodes ?? [];
    // Each grandparent couple is contiguous: grandparents of the left parent come first.
    const sideOf = (gid: number): number => parents.findIndex((p) => p.parentIds.includes(gid));
    const sides = grand.map((g) => sideOf(g.id)).filter((x) => x >= 0);
    expect(sides.length).toBeGreaterThan(1);
    expect([...sides].sort((a, b) => a - b)).toEqual(sides);
  });
});
