import type { GameState } from './types';
import { hashString } from './util';

/** Hash of the full state (determinism checks). */
export function stateHash(s: GameState): string {
  return hashString(JSON.stringify(s));
}

/**
 * Hash of the life itself: everything except the snapshot ring and the cheat-used marker.
 * Rewind compares this to the hash recorded when the snapshot year was first lived.
 */
export function lifeHash(s: GameState): string {
  const { snapshots: _s, cheats, ...rest } = s;
  return hashString(JSON.stringify({ ...rest, cheats: { ...cheats, used: false } }));
}
