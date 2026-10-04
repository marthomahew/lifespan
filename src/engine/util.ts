/** Small pure helpers shared across the engine. */

export function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

/**
 * Clone a game state for a new step. The log and snapshot ring are append-only with
 * immutable entries, so they are copied shallowly; everything else is deep-copied.
 */
export function cloneState<T extends { log: unknown[]; snapshots: unknown[] }>(s: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(s)) {
    if (k === 'log' || k === 'snapshots') out[k] = (v as unknown[]).slice();
    else out[k] = v !== null && typeof v === 'object' ? JSON.parse(JSON.stringify(v)) : v;
  }
  return out as T;
}

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Clamp to an integer stat in [0, 100]. */
export function clampStat(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return clamp(Math.round(v), 0, 100);
}

/** Round money to whole local units, guarding against NaN and infinities. */
export function roundMoney(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.round(v);
}

/** cyrb53: a fast, well-distributed 53-bit string hash. */
export function hashString(str: string, seed = 0): string {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const n = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return n.toString(16).padStart(14, '0');
}

export function sum(xs: readonly number[]): number {
  let t = 0;
  for (const x of xs) t += x;
  return t;
}

export function uniq<T>(xs: readonly T[]): T[] {
  return [...new Set(xs)];
}
