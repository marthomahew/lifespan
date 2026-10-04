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
    });
  }
  return nodes.sort((a, b) => a.gen - b.gen || b.age - a.age);
}
