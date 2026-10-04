import type { GameState } from './types';

/** The life title shown on the obituary; the full catalog arrives with M10.3. */
export function lifeTitle(s: GameState): string {
  if (s.player.age < 18) return 'Gone Too Soon';
  return 'Ordinary, In The Best Way';
}
