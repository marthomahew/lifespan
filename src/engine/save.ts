import { z } from 'zod';
import { SCHEMA_VERSION, type GameState } from './types';

const num = z.number().finite();
const int = z.number().int();
const stat = int.min(0).max(100);

const statsSchema = z.object({
  happiness: stat,
  health: stat,
  smarts: stat,
  looks: stat,
  karma: stat,
  discipline: stat,
  fertility: stat,
  stress: stat,
  fame: stat,
  notoriety: stat,
});

const playerSchema = z.looseObject({
  first: z.string().min(1).max(80),
  last: z.string().min(1).max(80),
  gender: z.enum(['male', 'female', 'nonbinary']),
  attraction: z.enum(['men', 'women', 'everyone']),
  age: int.min(0).max(200),
  birthYear: int,
  country: z.string(),
  city: z.string(),
  traits: z.array(z.string()),
  stats: statsSchema,
  skills: z.record(z.string(), num),
  languages: z.record(z.string(), num),
  flags: z.array(z.string()),
  achievements: z.array(z.string()),
});

const npcSchema = z.looseObject({
  id: int.min(1),
  first: z.string(),
  last: z.string(),
  gender: z.enum(['male', 'female', 'nonbinary']),
  age: int.min(0),
  alive: z.boolean(),
  roles: z.array(z.string()),
  rel: stat,
  traits: z.array(z.string()),
  memory: z.array(z.object({ year: int, text: z.string(), delta: num })).max(30),
});

export const stateSchema = z.looseObject({
  schemaVersion: z.literal(SCHEMA_VERSION),
  lifeId: z.string().min(1),
  seed: num,
  rng: z.tuple([int, int, int, int]),
  year: int,
  inflation: num.positive(),
  inflationMult: num.min(0),
  player: playerSchema,
  npcs: z.array(npcSchema),
  nextNpcId: int,
  log: z.array(z.looseObject({ age: int, year: int, cat: z.string(), text: z.string().min(1) })),
  pending: z.array(z.looseObject({ eventId: z.string(), bindings: z.record(z.string(), int) })),
  chains: z.array(z.looseObject({ eventId: z.string(), dueYear: int })),
  events: z.looseObject({}),
  money: z.looseObject({
    cash: num,
    savings: num,
    loans: z.array(z.looseObject({ balance: num })),
  }),
  education: z.looseObject({}),
  career: z.looseObject({}),
  military: z.looseObject({}).nullable(),
  music: z.looseObject({}),
  health: z.looseObject({ illnesses: z.array(z.looseObject({ id: z.string() })) }),
  vices: z.looseObject({}),
  legal: z.looseObject({}),
  assets: z.looseObject({}),
  will: z.looseObject({}),
  statHistory: z.looseObject({}),
  totals: z.looseObject({}),
  settings: z.looseObject({ popupsPerYear: int.min(1).max(5) }),
  cheats: z.looseObject({ used: z.boolean() }),
  snapshots: z.array(z.looseObject({ year: int, json: z.string() })),
  death: z.looseObject({ cause: z.string() }).nullable(),
  dynasty: z.array(z.looseObject({})),
  generation: int,
});

type Raw = Record<string, unknown> & { schemaVersion?: unknown };
/** Migration hook: MIGRATIONS[n] upgrades a version-n save to n+1. */
export const MIGRATIONS: Record<number, (raw: Raw) => Raw> = {
  // v2: injuries became records (health.injuryList).
  1: (raw) => {
    const health = (raw['health'] ?? {}) as Record<string, unknown>;
    return { ...raw, health: { ...health, injuryList: health['injuryList'] ?? [] } };
  },
  // v3: life goals (player.aspirations).
  2: (raw) => {
    const player = (raw['player'] ?? {}) as Record<string, unknown>;
    return { ...raw, player: { ...player, aspirations: player['aspirations'] ?? [] } };
  },
  // v4: character customization (hair, a starting talent).
  3: (raw) => {
    const player = (raw['player'] ?? {}) as Record<string, unknown>;
    return {
      ...raw,
      player: { ...player, hair: player['hair'] ?? 'default', talent: player['talent'] ?? null },
    };
  },
};

export class SaveError extends Error {}

export function migrate(raw: Raw, migrations = MIGRATIONS, target = SCHEMA_VERSION): Raw {
  let cur = raw;
  let v = typeof cur.schemaVersion === 'number' ? cur.schemaVersion : 0;
  if (v > target) throw new SaveError(`save is from a newer version (${v})`);
  while (v < target) {
    const m = migrations[v];
    if (!m) throw new SaveError(`no migration from schema ${v}`);
    cur = { ...m(cur), schemaVersion: v + 1 };
    v++;
  }
  return cur;
}

/** Every number must be finite (no NaN or Infinity sneaking in through imports). */
export function findNonFinite(v: unknown, path = '$'): string | null {
  if (typeof v === 'number') return Number.isFinite(v) ? null : path;
  if (Array.isArray(v)) {
    for (let i = 0; i < v.length; i++) {
      const r = findNonFinite(v[i], `${path}[${i}]`);
      if (r) return r;
    }
    return null;
  }
  if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) {
      const r = findNonFinite(x, `${path}.${k}`);
      if (r) return r;
    }
  }
  return null;
}

/** Fixed-shape sections must carry every key a fresh life has (dynamic records are skipped). */
const DYNAMIC = new Set([
  'skills',
  'skillPractice',
  'languages',
  'lastFired',
  'counts',
  'categoryLast',
  'locks',
]);
export function missingKeys(
  template: unknown,
  value: unknown,
  path = '$',
  depth = 0,
  out: string[] = [],
): string[] {
  if (depth > 2 || !template || typeof template !== 'object' || Array.isArray(template)) return out;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    out.push(path);
    return out;
  }
  const v = value as Record<string, unknown>;
  for (const [k, t] of Object.entries(template as Record<string, unknown>)) {
    if (!(k in v)) {
      out.push(`${path}.${k}`);
      continue;
    }
    if (DYNAMIC.has(k) || t === null || v[k] === null) continue;
    missingKeys(t, v[k], `${path}.${k}`, depth + 1, out);
  }
  return out;
}

let templateCache: GameState | null = null;
export function setSaveTemplate(t: GameState): void {
  templateCache = t;
}

export function serialize(s: GameState): string {
  return JSON.stringify(s);
}

/** Parse, migrate and validate a save. Throws SaveError with a readable message. */
export function deserialize(json: string): GameState {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new SaveError('not valid JSON');
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new SaveError('not a save file');
  const migrated = migrate(raw as Raw);
  const res = stateSchema.safeParse(migrated);
  if (!res.success) {
    const issue = res.error.issues[0];
    throw new SaveError(
      `invalid save at ${issue?.path.join('.') ?? '?'}: ${issue?.message ?? 'unknown'}`,
    );
  }
  if (templateCache) {
    const missing = missingKeys(templateCache, migrated);
    if (missing.length)
      throw new SaveError(`invalid save: missing ${missing.slice(0, 3).join(', ')}`);
  }
  // JSON cannot carry NaN, but keep the deep check for objects built in memory.
  const bad = findNonFinite(migrated);
  if (bad) throw new SaveError(`non-finite number at ${bad}`);
  return migrated as unknown as GameState;
}
