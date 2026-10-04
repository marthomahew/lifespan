import type { GameState } from '../types';
import type { RiskFactor } from '../mortality';

/** Illness contributions to mortality; filled in by the illness catalog (M8.1). */
export function illnessRisks(_s: GameState): RiskFactor[] {
  return [];
}
