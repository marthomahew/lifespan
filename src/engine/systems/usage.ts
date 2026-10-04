import type { GameState } from '../types';

/** Uses of an activity or interaction so far this year. */
export function usedThisYear(s: GameState, key: string): number {
  return s.usage.year === s.year ? (s.usage.used[key] ?? 0) : 0;
}

export function markUsed(s: GameState, key: string): void {
  if (s.usage.year !== s.year) s.usage = { year: s.year, used: {} };
  s.usage.used[key] = (s.usage.used[key] ?? 0) + 1;
}
