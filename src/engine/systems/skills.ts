import type { GameState } from '../types';
import { clampStat } from '../util';

/** Add to a skill (0..100). Positive deltas count as practice this year. */
export function addSkill(s: GameState, id: string, delta: number): void {
  const cur = s.player.skills[id] ?? 0;
  s.player.skills[id] = clampStat(cur + delta);
  if (delta > 0) s.player.skillPractice[id] = s.year;
}
