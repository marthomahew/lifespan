import { formatMoney, money } from '../economy';
import { countryOf } from '../economy';
import { pronouns, relLabel } from '../npc';
import type { ChainPayload, GameState, Npc } from '../types';

const TOKEN = /\{([^{}]+)\}/g;

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** The memory an NPC brings up: the strongest one. */
export function strongestMemory(n: Npc): string | null {
  let best: { text: string; delta: number } | null = null;
  for (const m of n.memory) if (!best || Math.abs(m.delta) >= Math.abs(best.delta)) best = m;
  return best ? best.text : null;
}

function npcToken(n: Npc, field: string): string | null {
  const p = pronouns(n.gender);
  switch (field) {
    case 'first':
      return n.first;
    case 'last':
      return n.last;
    case 'full':
      return `${n.first} ${n.last}`;
    case 'they':
      return p.they;
    case 'They':
      return cap(p.they);
    case 'them':
      return p.them;
    case 'Them':
      return cap(p.them);
    case 'their':
      return p.their;
    case 'Their':
      return cap(p.their);
    case 'rel':
      return relLabel(n);
    case 'Rel':
      return cap(relLabel(n));
    case 'age':
      return String(n.age);
    case 'job':
      return n.job ?? 'between jobs';
    case 'memory':
      return strongestMemory(n);
    case 'is':
      return n.gender === 'nonbinary' ? 'are' : 'is';
    case 'has':
      return n.gender === 'nonbinary' ? 'have' : 'has';
    case 's':
      return n.gender === 'nonbinary' ? '' : 's';
    default:
      return null;
  }
}

/** Resolve one token, or null if it can't be. */
export function resolveToken(
  s: GameState,
  token: string,
  bindings: Record<string, number>,
  payload: ChainPayload,
): string | null {
  const p = s.player;
  if (token.startsWith('money:')) {
    const arg = token.slice(6);
    let ref: number;
    if (arg.startsWith('$')) {
      const v = payload[arg.slice(1)];
      if (typeof v !== 'number') return null;
      ref = v;
    } else {
      ref = Number(arg);
      if (!Number.isFinite(ref)) return null;
    }
    return formatMoney(s, money(s, ref));
  }
  if (token.startsWith('$')) {
    const v = payload[token.slice(1)];
    return v === undefined ? null : String(v);
  }
  switch (token) {
    case 'first':
      return p.first;
    case 'last':
      return p.last;
    case 'age':
      return String(p.age);
    case 'city':
      return p.city;
    case 'country':
      return countryOf(s).name;
    case 'year':
      return String(s.year);
  }
  const dot = token.indexOf('.');
  if (dot > 0) {
    const name = token.slice(0, dot);
    const field = token.slice(dot + 1);
    const id = bindings[name];
    const n = id === undefined ? undefined : s.npcs.find((x) => x.id === id);
    if (!n) return null;
    return npcToken(n, field);
  }
  return null;
}

/** Render a text; unresolved tokens are left in place so checks can catch them. */
export function renderText(
  s: GameState,
  text: string,
  bindings: Record<string, number> = {},
  payload: ChainPayload = {},
): string {
  return text.replace(
    TOKEN,
    (whole, tok: string) => resolveToken(s, tok, bindings, payload) ?? whole,
  );
}

/** Binding names a text refers to ({mother.first} → mother). */
export function tokenNames(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(TOKEN)) {
    const t = m[1] ?? '';
    const dot = t.indexOf('.');
    if (dot > 0 && !t.startsWith('money:')) out.push(t.slice(0, dot));
  }
  return out;
}

export function tokensIn(text: string): string[] {
  return [...text.matchAll(TOKEN)].map((m) => m[1] ?? '');
}
