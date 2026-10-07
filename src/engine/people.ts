import { TRAIT_BY_ID } from '../content/traits';
import type { GameState, Npc } from './types';

const has = (n: Npc, ...roles: string[]): boolean => n.roles.some((r) => roles.includes(r));

/**
 * The people closest to you, in order: whoever you're with, the parents (or grandparent)
 * who raised you, your children, a sibling or two, and your best friend. Six at most.
 */
export function closestPeople(s: GameState): Npc[] {
  const alive = s.npcs.filter((n) => n.alive);
  const out: Npc[] = [];
  const push = (xs: Npc[]): void => {
    for (const n of xs) if (!out.includes(n) && out.length < 6) out.push(n);
  };
  const byRel = (a: Npc, b: Npc): number => b.rel - a.rel;
  push(alive.filter((n) => has(n, 'spouse', 'partner', 'sweetheart')));
  push(alive.filter((n) => n.flags.includes('raising_grandparent')));
  push(alive.filter((n) => has(n, 'mother', 'father') && !n.flags.includes('absent_parent')));
  push(
    alive
      .filter((n) => has(n, 'child'))
      .sort((a, b) => b.age - a.age)
      .slice(0, 3),
  );
  push(
    alive
      .filter((n) => has(n, 'sibling'))
      .sort(byRel)
      .slice(0, 2),
  );
  push(
    alive
      .filter((n) => has(n, 'friend'))
      .sort(byRel)
      .slice(0, 1),
  );
  return out;
}

/** How they feel about you, in a few words. */
export function closeness(n: Npc): string {
  if (n.rel >= 85) return 'adores you';
  if (n.rel >= 65) return 'close to you';
  if (n.rel >= 45) return 'on good terms';
  if (n.rel >= 25) return 'a little distant';
  return 'barely speaks to you';
}

/** A one-line sketch: their nature, what they do, and how they feel about you. */
export function npcSketch(n: Npc): string {
  const nature = n.traits
    .map((t) => TRAIT_BY_ID[t]?.label.toLowerCase())
    .filter(Boolean)
    .slice(0, 2)
    .join(' and ');
  const job = n.job && n.job !== 'At school' ? n.job.toLowerCase() : null;
  const parts = [nature ? nature.charAt(0).toUpperCase() + nature.slice(1) : '', job ?? '']
    .filter(Boolean)
    .join(', ');
  return `${parts ? `${parts}; ` : ''}${closeness(n)}.`;
}
