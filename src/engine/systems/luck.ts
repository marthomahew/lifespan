import type { GameState } from '../types';

export type LuckArea = 'money' | 'career' | 'sport' | 'music' | 'crime' | 'business';

/**
 * How lucky you are in an area: 1 with that area's luck gift, plus a little more for the
 * all-round charmed life. Gifts are picked, never rolled, and frankly generous.
 */
export function luck(s: GameState, area: LuckArea): number {
  const g = s.player.gifts ?? [];
  return (g.includes(`${area}_luck`) ? 1 : 0) + (g.includes('charmed') ? 0.35 : 0);
}
