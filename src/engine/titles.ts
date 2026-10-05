import { LIFE_TITLES } from '../content/achievements';
import type { GameState } from './types';

/** The life title shown on the obituary (SPEC §5.14): the first that fits the record. */
export function lifeTitle(s: GameState): string {
  return LIFE_TITLES.find((t) => t.when(s))?.title ?? 'Ordinary, in the Best Way';
}
