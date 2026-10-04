import type { GameState, Snapshot } from './types';

export const SNAPSHOT_MAX = 20;

/** Serialize the state without its snapshots or log (the log is append-only; we keep its length). */
export function snapshotOf(s: GameState): Snapshot {
  const { snapshots: _snap, log: _log, ...rest } = s;
  return { year: s.year, age: s.player.age, logLength: s.log.length, json: JSON.stringify(rest) };
}

export function pushSnapshot(s: GameState): void {
  s.snapshots.push(snapshotOf(s));
  if (s.snapshots.length > SNAPSHOT_MAX) s.snapshots.splice(0, s.snapshots.length - SNAPSHOT_MAX);
}

/** Restore the snapshot taken `years` Age Ups ago. Returns null if the buffer doesn't reach. */
export function restoreSnapshot(s: GameState, years: number): GameState | null {
  const idx = s.snapshots.length - 1 - years;
  const snap = s.snapshots[idx];
  if (!snap || years < 1) return null;
  const rest = JSON.parse(snap.json) as Omit<GameState, 'snapshots' | 'log'>;
  // Key order matches the original state so serialization and hashes line up.
  const restored = {
    ...rest,
    log: s.log.slice(0, snap.logLength),
    snapshots: s.snapshots.slice(0, idx + 1),
  } as GameState;
  return reorder(restored, s);
}

function reorder(v: GameState, like: GameState): GameState {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(like)) out[k] = (v as unknown as Record<string, unknown>)[k];
  return out as GameState;
}
