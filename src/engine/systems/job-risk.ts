import type { GameState } from '../types';
import { currentJobRisk } from './careers';

/** Extra yearly death risk from a dangerous job, as a fraction (0.5 = ×1.5). */
export function jobRisk(s: GameState): number {
  return currentJobRisk(s);
}
