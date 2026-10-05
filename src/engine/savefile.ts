import { deserialize, SaveError } from './save';
import type { GameState } from './types';
import { JOB_BY_ID } from '../content/jobs';

export const SAVE_FORMAT = 'lifespan-save';

export type SaveSummary = {
  name: string;
  first: string;
  last: string;
  age: number;
  year: number;
  dead: boolean;
  cheated: boolean;
  generation: number;
  savedAt: number;
  /** For the Lives list; absent in older saves. */
  job?: string;
  place?: string;
};

export type SaveFile = { format: typeof SAVE_FORMAT; summary: SaveSummary; state: GameState };

export function summarize(s: GameState, name: string, savedAt: number): SaveSummary {
  return {
    name,
    first: s.player.first,
    last: s.player.last,
    age: s.player.age,
    year: s.year,
    dead: s.death !== null,
    cheated: s.cheats.used,
    generation: s.generation,
    savedAt,
    job: s.career.jobId
      ? (JOB_BY_ID[s.career.jobId]?.titles[s.career.level] ?? '')
      : s.career.retired
        ? 'Retired'
        : '',
    place: s.player.city,
  };
}

/** A save file wraps the state with a summary for the Lives screen. `savedAt` comes from the platform. */
export function makeSaveFile(s: GameState, name: string, savedAt: number): string {
  const file: SaveFile = { format: SAVE_FORMAT, summary: summarize(s, name, savedAt), state: s };
  return JSON.stringify(file);
}

/** Parse a save file (or a bare state export) and validate the state inside. */
export function parseSaveFile(json: string): { summary: SaveSummary; state: GameState } {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new SaveError('not valid JSON');
  }
  if (!raw || typeof raw !== 'object') throw new SaveError('not a save file');
  const obj = raw as Record<string, unknown>;
  if (obj['format'] === SAVE_FORMAT) {
    const state = deserialize(JSON.stringify(obj['state']));
    const sum = (obj['summary'] ?? {}) as Partial<SaveSummary>;
    const name =
      typeof sum.name === 'string' && sum.name.trim()
        ? sum.name.slice(0, 80)
        : `${state.player.first} ${state.player.last}`;
    const savedAt =
      typeof sum.savedAt === 'number' && Number.isFinite(sum.savedAt) ? sum.savedAt : 0;
    return { summary: summarize(state, name, savedAt), state };
  }
  const state = deserialize(json);
  return { summary: summarize(state, `${state.player.first} ${state.player.last}`, 0), state };
}
