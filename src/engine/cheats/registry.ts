import { Ctx, type Step } from '../ctx';
import { EngineError } from '../errors';
import { applyLocks } from '../stats';
import { prunePending } from '../events/select';
import type { GameState } from '../types';
import { cloneState } from '../util';
import type { CheatDef, ParamDef, ParamValues } from './types';
import { CHARACTER_CHEATS } from './character';
import { MONEY_CHEATS } from './money';
import { WORLD_CHEATS } from './world';
import { EVENT_CHEATS } from './events';
import { DEBUG_CHEATS } from './debug';
import { HEALTH_CHEATS } from './health';
import { RELATIONSHIP_CHEATS } from './relationships';
import { CAREER_CHEATS } from './career';
import { ASSET_CHEATS } from './assets';

export class CheatError extends Error {}

export const CHEATS: CheatDef[] = [
  ...CHARACTER_CHEATS,
  ...MONEY_CHEATS,
  ...ASSET_CHEATS,
  ...RELATIONSHIP_CHEATS,
  ...CAREER_CHEATS,
  ...HEALTH_CHEATS,
  ...EVENT_CHEATS,
  ...WORLD_CHEATS,
  ...DEBUG_CHEATS,
];
export const CHEAT_BY_ID: Record<string, CheatDef> = Object.fromEntries(
  CHEATS.map((c) => [c.id, c]),
);

function coerce(s: GameState, p: ParamDef, raw: unknown): string | number | boolean | undefined {
  if (raw === undefined || raw === '' || raw === null) {
    if (p.default !== undefined) return p.default;
    if (p.optional) return undefined;
    throw new CheatError(`missing ${p.name}`);
  }
  switch (p.type) {
    case 'int':
    case 'number': {
      const n = typeof raw === 'number' ? raw : Number(String(raw).replace(/[,_]/g, ''));
      if (!Number.isFinite(n)) throw new CheatError(`${p.name} must be a number`);
      const v = p.type === 'int' ? Math.round(n) : n;
      if (p.min !== undefined && v < p.min)
        throw new CheatError(`${p.name} must be at least ${p.min}`);
      if (p.max !== undefined && v > p.max)
        throw new CheatError(`${p.name} must be at most ${p.max}`);
      return v;
    }
    case 'bool': {
      if (typeof raw === 'boolean') return raw;
      const t = String(raw).toLowerCase();
      if (['on', 'true', 'yes', '1'].includes(t)) return true;
      if (['off', 'false', 'no', '0'].includes(t)) return false;
      throw new CheatError(`${p.name} must be on or off`);
    }
    case 'string': {
      const t = String(raw).trim();
      if (!t) throw new CheatError(`${p.name} can't be empty`);
      return t.slice(0, p.maxLength ?? 200);
    }
    case 'enum': {
      const t = String(raw);
      const opts = p.options(s);
      const hit =
        opts.find((o) => o.value === t) ??
        opts.find((o) => o.value.toLowerCase() === t.toLowerCase());
      if (!hit) throw new CheatError(`unknown ${p.name} "${t}"`);
      return hit.value;
    }
  }
}

export function validateParams(
  s: GameState,
  def: CheatDef,
  raw: Record<string, unknown>,
): ParamValues {
  const out: ParamValues = {};
  for (const p of def.params) out[p.name] = coerce(s, p, raw[p.name]);
  return out;
}

export type CheatStep = Step & { message: string };

/** Run a cheat by id (SPEC §9.3 runCheat). Marks the life as cheated. */
export function runCheat(
  input: GameState,
  id: string,
  rawParams: Record<string, unknown> = {},
): CheatStep {
  const def = CHEAT_BY_ID[id];
  if (!def) throw new CheatError(`unknown cheat ${id}`);
  const params = validateParams(input, def, rawParams);
  const ctx = new Ctx(cloneState(input));
  let message: string;
  try {
    message = def.run(ctx, params);
  } catch (e) {
    if (e instanceof EngineError) throw new CheatError(e.message);
    throw e;
  }
  ctx.s.cheats.used = true;
  prunePending(ctx.s);
  applyLocks(ctx.s);
  return { ...ctx.finish(), message };
}

type Token = { lit: string } | { param: string };
function syntaxTokens(def: CheatDef): Token[] {
  return def.syntax
    .split(/\s+/)
    .map((t) => (t.startsWith('{') ? { param: t.slice(1, -1) } : { lit: t }));
}

/** Split a console line, keeping "quoted strings" together. */
export function tokenize(line: string): string[] {
  const out: string[] = [];
  for (const m of line.matchAll(/"([^"]*)"|(\S+)/g)) out.push(m[1] ?? m[2] ?? '');
  return out;
}

export type ParsedCommand =
  | { kind: 'help'; topic: string | null }
  | { kind: 'cheat'; id: string; params: Record<string, unknown> };

/** Parse a console line against every cheat's syntax. The last param soaks up remaining words. */
export function parseCommand(line: string): ParsedCommand {
  const words = tokenize(line.trim());
  if (!words.length) throw new CheatError('type a command, or help');
  if (words[0]?.toLowerCase() === 'help')
    return { kind: 'help', topic: words.slice(1).join(' ') || null };
  let best: { def: CheatDef; params: Record<string, unknown>; lits: number } | null = null;
  for (const def of CHEATS) {
    const toks = syntaxTokens(def);
    const params: Record<string, unknown> = {};
    let ok = true;
    let lits = 0;
    let wi = 0;
    for (let ti = 0; ti < toks.length; ti++) {
      const t = toks[ti] as Token;
      const w = words[wi];
      if ('lit' in t) {
        if (w?.toLowerCase() !== t.lit) {
          ok = false;
          break;
        }
        lits++;
        wi++;
      } else {
        const isLast = ti === toks.length - 1;
        if (w === undefined) continue;
        params[t.param] = isLast ? words.slice(wi).join(' ') : w;
        wi = isLast ? words.length : wi + 1;
      }
    }
    if (!ok || wi < words.length) continue;
    if (!best || lits > best.lits) best = { def, params, lits };
  }
  if (!best) throw new CheatError(`unknown command "${words[0]}". Try help.`);
  return { kind: 'cheat', id: best.def.id, params: best.params };
}

export function helpText(topic: string | null): string {
  if (!topic) {
    return ['Commands (help <command> for details):', ...CHEATS.map((c) => `  ${c.syntax}`)].join(
      '\n',
    );
  }
  const t = topic.toLowerCase();
  const hits = CHEATS.filter(
    (c) => c.syntax.startsWith(t) || c.id === t || c.syntax.split(' ')[0] === t,
  );
  if (!hits.length) return `No command matches "${topic}".`;
  return hits.map((c) => `${c.syntax}\n  ${c.help}`).join('\n');
}

/** Autocomplete: syntax lines and enum values that continue what's typed. */
export function suggest(s: GameState, line: string, limit = 8): string[] {
  const typed = line.replace(/^\s+/, '');
  const words = tokenize(typed);
  const trailing = /\s$/.test(typed);
  const out: string[] = [];
  const cmds = ['help', ...CHEATS.map((c) => c.syntax)];
  for (const syn of cmds) {
    const toks = syn.split(/\s+/);
    let ok = true;
    const done = trailing ? words.length : words.length - 1;
    for (let i = 0; i < done; i++) {
      const t = toks[i];
      if (t === undefined) {
        ok = false;
        break;
      }
      if (!t.startsWith('{') && t !== words[i]?.toLowerCase()) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    const next = toks[done];
    const partial = trailing ? '' : (words[words.length - 1] ?? '').toLowerCase();
    const prefix = words.slice(0, done).join(' ');
    if (next === undefined) continue;
    if (!next.startsWith('{')) {
      if (next.startsWith(partial)) out.push(`${prefix ? `${prefix} ` : ''}${next}`);
      continue;
    }
    const def = CHEATS.find((c) => c.syntax === syn);
    const p = def?.params.find((x) => x.name === next.slice(1, -1));
    if (p?.type === 'enum') {
      for (const o of p.options(s))
        if (o.value.toLowerCase().startsWith(partial))
          out.push(`${prefix ? `${prefix} ` : ''}${o.value}`);
    } else if (!partial) out.push(syn);
    if (out.length >= limit * 3) break;
  }
  return [...new Set(out)].slice(0, limit);
}

/** Run a console line. */
export function runConsole(s: GameState, line: string): CheatStep {
  const cmd = parseCommand(line);
  if (cmd.kind === 'help') return { state: s, log: [], toasts: [], message: helpText(cmd.topic) };
  return runCheat(s, cmd.id, cmd.params);
}
