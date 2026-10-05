import { relLabel } from './npc';
import { PLAYER_ID, type GameState, type Npc } from './types';

export type TreeNode = {
  id: number;
  name: string;
  label: string;
  gen: number;
  alive: boolean;
  age: number;
  parentIds: number[];
  isPlayer: boolean;
  /** A partner or (ex-)spouse of the player. */
  partner: boolean;
};

/** Three generations up and down from the player (SPEC §5.1). Generation 0 is the player's own. */
export function familyTree(s: GameState): TreeNode[] {
  const byId = new Map(s.npcs.map((n) => [n.id, n]));
  const gen = new Map<number, number>([[PLAYER_ID, 0]]);
  const up = (ids: number[], g: number): void => {
    if (g < -3) return;
    for (const id of ids) {
      const n = byId.get(id);
      if (!n || gen.has(id)) continue;
      gen.set(id, g);
      up(n.parentIds, g - 1);
    }
  };
  up(s.player.parentIds, -1);
  for (const n of s.npcs) {
    if (n.roles.includes('sibling')) gen.set(n.id, 0);
    if (n.roles.includes('spouse') || n.roles.includes('partner') || n.flags.includes('was_spouse'))
      gen.set(n.id, 0);
  }
  // Descendants: anyone whose parent is the player or a known descendant.
  for (let g = 1; g <= 3; g++) {
    for (const n of s.npcs) {
      if (gen.has(n.id)) continue;
      if (
        n.parentIds.some(
          (p) => (p === PLAYER_ID && g === 1) || (gen.get(p) === g - 1 && g > 1 && p !== PLAYER_ID),
        )
      )
        gen.set(n.id, g);
    }
  }
  const nodes: TreeNode[] = [
    {
      id: PLAYER_ID,
      name: `${s.player.first} ${s.player.last}`,
      label: 'you',
      gen: 0,
      alive: s.death === null,
      age: s.player.age,
      parentIds: s.player.parentIds,
      isPlayer: true,
      partner: false,
    },
  ];
  for (const [id, g] of gen) {
    if (id === PLAYER_ID) continue;
    const n = byId.get(id) as Npc;
    nodes.push({
      id,
      name: `${n.first} ${n.last}`,
      label: relLabel(n).replace(/^your /, ''),
      gen: g,
      alive: n.alive,
      age: n.age,
      parentIds: n.parentIds,
      isPlayer: false,
      partner:
        n.roles.includes('spouse') || n.roles.includes('partner') || n.flags.includes('was_spouse'),
    });
  }
  return nodes.sort((a, b) => a.gen - b.gen || b.age - a.age);
}

export type TreeLayout = {
  /** Generations top to bottom, each ordered left to right. */
  rows: { gen: number; nodes: TreeNode[] }[];
  /** [child id, parent id] for every parent shown in the tree. */
  edges: [number, number][];
};

const mean = (xs: number[]): number =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : Number.POSITIVE_INFINITY;

/**
 * Orders each generation so lines stay short: partners sit beside you, children sit under
 * their parents, and ancestors sit above the people they're parents of.
 */
export function treeLayout(nodes: TreeNode[]): TreeLayout {
  const ids = new Set(nodes.map((n) => n.id));
  const gens = [...new Set(nodes.map((n) => n.gen))].sort((a, b) => a - b);
  const rows = new Map<number, TreeNode[]>(gens.map((g) => [g, nodes.filter((n) => n.gen === g)]));
  const indexIn = (g: number): Map<number, number> =>
    new Map((rows.get(g) ?? []).map((n, i) => [n.id, i]));
  const sortBy = (g: number, key: (n: TreeNode) => number): void => {
    const row = rows.get(g) ?? [];
    const keyed = row.map((n, i) => ({ n, k: key(n), i }));
    keyed.sort((a, b) => a.k - b.k || a.i - b.i);
    rows.set(
      g,
      keyed.map((x) => x.n),
    );
  };

  // Your generation: you with your partners right beside you, siblings either side by age.
  const own = rows.get(0) ?? [];
  const me = own.find((n) => n.isPlayer);
  if (me) {
    const partners = own.filter((n) => n.partner);
    const others = own.filter((n) => !n.isPlayer && !n.partner);
    const older = others.filter((n) => n.age > me.age);
    const younger = others.filter((n) => n.age <= me.age);
    rows.set(0, [...older, me, ...partners, ...younger]);
  }
  // Ancestors line up over their children, nearest generation first.
  for (const g of gens.filter((x) => x < 0).sort((a, b) => b - a)) {
    const below = indexIn(g + 1);
    const kids = (n: TreeNode): number[] =>
      (rows.get(g + 1) ?? [])
        .filter((c) => c.parentIds.includes(n.id))
        .map((c) => below.get(c.id) ?? 0);
    sortBy(g, (n) => mean(kids(n)));
  }
  // Descendants sit under their parents.
  for (const g of gens.filter((x) => x > 0)) {
    const above = indexIn(g - 1);
    sortBy(g, (n) => mean(n.parentIds.filter((p) => above.has(p)).map((p) => above.get(p) ?? 0)));
  }
  const edges: [number, number][] = [];
  for (const n of nodes) for (const p of n.parentIds) if (ids.has(p)) edges.push([n.id, p]);
  return { rows: gens.map((g) => ({ gen: g, nodes: rows.get(g) ?? [] })), edges };
}
