import { ageUp } from '../age';
import { Rng } from '../rng';
import type { GameState } from '../types';

export type PersonaId =
  'default' | 'careerist' | 'criminal' | 'family' | 'military' | 'musician' | 'emigrant' | 'chaos';
export const PERSONAS: PersonaId[] = [
  'default',
  'careerist',
  'criminal',
  'family',
  'military',
  'musician',
  'emigrant',
  'chaos',
];

/**
 * A bot makes the player's decisions with its own RNG (player input, not game randomness).
 * Returns the next state after one decision or one Age Up.
 */
export function botStep(s: GameState, persona: PersonaId, rng: Rng): GameState {
  void persona;
  void rng;
  return ageUp(s).state;
}
