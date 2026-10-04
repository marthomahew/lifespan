import { ageUp, type GameState } from '../src/engine';

/** Deep-freeze so any mutation of an engine input throws in strict mode. */
export function deepFreeze<T>(v: T): T {
  if (v && typeof v === 'object' && !Object.isFrozen(v)) {
    Object.freeze(v);
    for (const x of Object.values(v as object)) deepFreeze(x);
  }
  return v;
}

/** Advance one step: answer a pending popup with its first choice, or Age Up. */
export function advance(s: GameState): GameState {
  if (s.pending.length > 0) throw new Error('pending events need a bot (added with M4)');
  return ageUp(s).state;
}

export function playYears(s: GameState, years: number): GameState {
  let cur = s;
  const target = cur.player.age + years;
  while (!cur.death && cur.player.age < target) cur = advance(cur);
  return cur;
}

export function playToDeath(s: GameState, maxSteps = 5000): GameState {
  let cur = s;
  for (let i = 0; i < maxSteps && !cur.death; i++) cur = advance(cur);
  return cur;
}
