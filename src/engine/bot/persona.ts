import { ageUp } from '../age';
import { choose, currentPopup } from '../events/choose';
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
  const popup = currentPopup(s);
  if (popup) {
    const enabled = popup.choices.filter((c) => c.enabled);
    if (!enabled.length) throw new Error(`popup ${popup.eventId} has no selectable choice`);
    return choose(s, rng.pick(enabled).id).state;
  }
  return ageUp(s).state;
}
