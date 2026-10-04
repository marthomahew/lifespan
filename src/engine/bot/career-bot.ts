import type { act } from '../actions';
import type { Rng } from '../rng';
import type { GameState } from '../types';
import type { PersonaId } from './persona';

type TryAct = (s: GameState, a: Parameters<typeof act>[1]) => GameState;

/** University and job decisions (filled in with M6). */
export function botCareer(
  s: GameState,
  _persona: PersonaId,
  _rng: Rng,
  _tryAct: TryAct,
): GameState {
  return s;
}
