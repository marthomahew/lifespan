import type { GameState } from '../types';

/** Extra yearly death risk from a dangerous job, as a fraction (0.5 = ×1.5). Filled in by careers (M6). */
export function jobRisk(_s: GameState): number {
  return 0;
}
