import { EVENT_BY_ID, EVENTS } from '../../content/events';
import { TRAIT_BY_ID } from '../../content/traits';
import type { Ctx } from '../ctx';
import type { Category, ChainPayload, GameState, Npc, PendingEvent, Role } from '../types';
import { tokenNames } from './tokens';
import type { ChoiceDef, Effect, EventDef, NpcQuery } from './types';
import { applyOutcome, pickOutcome } from './apply';

export const ROLES: Role[] = [
  'mother',
  'father',
  'sibling',
  'grandparent',
  'child',
  'partner',
  'spouse',
  'ex',
  'friend',
  'enemy',
  'coworker',
  'classmate',
  'cellmate',
  'teacher',
  'boss',
  'bandmate',
  'stepparent',
  'grandchild',
  'acquaintance',
];
const ROLE_SET = new Set<string>(ROLES);
export const DEFAULT_COOLDOWN = 8;

function effectNames(effects: Effect[]): string[] {
  const out: string[] = [];
  for (const e of effects) {
    if ('rel' in e) out.push(e.rel);
    else if ('npcStat' in e) out.push(e.npcStat);
    else if ('npcFlag' in e) out.push(e.npcFlag);
    else if ('status' in e && e.with) out.push(e.with);
  }
  return out;
}

/** Every binding name the event's texts and effects refer to. */
export function referencedNames(def: EventDef): string[] {
  const names = new Set<string>(Object.keys(def.bind ?? {}));
  const texts = [def.text];
  const outs = [...(def.outcomes ?? []), ...(def.choices ?? []).flatMap((c) => c.outcomes)];
  for (const c of def.choices ?? []) texts.push(c.label);
  for (const o of outs) {
    texts.push(o.text);
    for (const n of effectNames(o.effects)) names.add(n);
  }
  for (const t of texts) for (const n of tokenNames(t)) names.add(n);
  return [...names];
}

/** Explicit bindings plus implicit ones for bare role names ({mother.first}). */
const queryCache = new Map<EventDef, Record<string, NpcQuery>>();
export function bindingQueries(def: EventDef): Record<string, NpcQuery> {
  const hit = queryCache.get(def);
  if (hit) return hit;
  const q: Record<string, NpcQuery> = { ...(def.bind ?? {}) };
  for (const n of referencedNames(def)) if (!q[n] && ROLE_SET.has(n)) q[n] = { role: n as Role };
  queryCache.set(def, q);
  return q;
}

export function matches(s: GameState, n: Npc, q: NpcQuery, adultsOnly: boolean): boolean {
  if (!n.alive || !n.roles.includes(q.role)) return false;
  if (q.minRelationship !== undefined && n.rel < q.minRelationship) return false;
  if (q.maxRelationship !== undefined && n.rel > q.maxRelationship) return false;
  if (q.minAge !== undefined && n.age < q.minAge) return false;
  if (q.maxAge !== undefined && n.age > q.maxAge) return false;
  if (adultsOnly && n.age < 18) return false;
  if (q.sameCountry && n.country !== s.player.country) return false;
  if (q.gender && n.gender !== q.gender) return false;
  if (q.hasMemory && n.memory.length === 0) return false;
  if (q.flag && !n.flags.includes(q.flag)) return false;
  if (q.notFlag && n.flags.includes(q.notFlag)) return false;
  return true;
}

export function selectableChoices(s: GameState, def: EventDef): ChoiceDef[] {
  return (def.choices ?? []).filter((c) => !c.requires || c.requires(s));
}

export type Eligibility = { ok: boolean; reason: string };

/** Whether an event could fire right now, and why not (cheat panel uses the reason). */
export function eligibility(
  s: GameState,
  def: EventDef,
  opts: { ignoreConditions?: boolean; chain?: boolean } = {},
): Eligibility {
  const age = s.player.age;
  const adultsOnly = def.adultsOnly === true || def.category === 'romance';
  if (s.death) return { ok: false, reason: 'the life is over' };
  if (adultsOnly && age < 18) return { ok: false, reason: 'adults only' };
  if (!opts.ignoreConditions) {
    if (def.chainOnly && !opts.chain) return { ok: false, reason: 'only fires as a follow-up' };
    if (def.ages && (age < def.ages[0] || age > def.ages[1]))
      return { ok: false, reason: `ages ${def.ages[0]}–${def.ages[1]}` };
    if (!opts.chain) {
      if (def.once && (s.events.counts[def.id] ?? 0) > 0)
        return { ok: false, reason: 'already happened (once only)' };
      const last = s.events.lastFired[def.id];
      const cd = def.cooldownYears ?? DEFAULT_COOLDOWN;
      if (last !== undefined && s.year - last < cd)
        return { ok: false, reason: `cooling down until ${last + cd}` };
      if (s.cheats.disabledCategories.includes(def.category))
        return { ok: false, reason: 'category switched off' };
    }
    if (def.when && !def.when(s)) return { ok: false, reason: 'its conditions are not met' };
  }
  for (const [name, q] of Object.entries(bindingQueries(def))) {
    if (!s.npcs.some((n) => matches(s, n, q, adultsOnly)))
      return { ok: false, reason: `nobody fits {${name}} (${q.role})` };
  }
  if (def.kind === 'choice' && selectableChoices(s, def).length === 0)
    return { ok: false, reason: 'no choice is available' };
  return { ok: true, reason: 'eligible' };
}

/** Pick NPCs for every binding (distinct NPCs per event). Preset ids are kept when still valid. */
export function bindNpcs(
  ctx: Ctx,
  def: EventDef,
  preset: Record<string, number> = {},
): Record<string, number> | null {
  const s = ctx.s;
  const adultsOnly = def.adultsOnly === true || def.category === 'romance';
  const out: Record<string, number> = {};
  const used = new Set<number>();
  for (const [name, q] of Object.entries(bindingQueries(def))) {
    const pre = preset[name];
    const preNpc = pre === undefined ? undefined : s.npcs.find((n) => n.id === pre);
    if (preNpc && preNpc.alive && (!adultsOnly || preNpc.age >= 18)) {
      out[name] = preNpc.id;
      used.add(preNpc.id);
      continue;
    }
    if (pre !== undefined) return null;
    const cands = s.npcs.filter((n) => !used.has(n.id) && matches(s, n, q, adultsOnly));
    if (!cands.length) return null;
    const pick = ctx.rng.pick(cands);
    out[name] = pick.id;
    used.add(pick.id);
  }
  return out;
}

/** An event is "bad" when every outcome leaves you worse off (no-bad-events cheat). */
export function isBadEvent(def: EventDef): boolean {
  if (def.kind !== 'notice') return false;
  const outs = def.outcomes ?? [];
  return (
    outs.length > 0 &&
    outs.every((o) => {
      let net = 0;
      for (const e of o.effects) {
        if ('stat' in e && (e.stat === 'happiness' || e.stat === 'health')) net += e.delta;
        if ('death' in e || 'illness' in e || ('injury' in e && e.injury > 0)) net -= 20;
        if ('money' in e && typeof e.money === 'number') net += e.money < 0 ? -3 : 3;
      }
      return net < 0;
    })
  );
}

export function eventWeight(s: GameState, def: EventDef): number {
  let w = typeof def.weight === 'function' ? def.weight(s) : def.weight;
  if (!Number.isFinite(w) || w <= 0) return 0;
  for (const t of s.player.traits) w *= TRAIT_BY_ID[t]?.eventWeight[def.category] ?? 1;
  for (const m of def.weightMods ?? []) {
    if (m.flag && s.player.flags.includes(m.flag)) w *= m.mult;
    if (m.trait && s.player.traits.includes(m.trait)) w *= m.mult;
  }
  const lastCat = s.events.categoryLast[def.category];
  if (lastCat !== undefined) {
    const gap = s.year - lastCat;
    if (gap <= 0) w *= 0.35;
    else if (gap === 1) w *= 0.7;
  }
  if (s.cheats.noBadEvents && isBadEvent(def)) return 0;
  return w;
}

function markFired(s: GameState, def: EventDef): void {
  s.events.lastFired[def.id] = s.year;
  s.events.counts[def.id] = (s.events.counts[def.id] ?? 0) + 1;
  s.events.categoryLast[def.category as Category] = s.year;
}

/** Fire an event: queue a popup, or resolve a notice straight into the log. */
export function fireEvent(
  ctx: Ctx,
  def: EventDef,
  source: PendingEvent['source'],
  payload: ChainPayload = {},
  preset: Record<string, number> = {},
): boolean {
  const bindings = bindNpcs(ctx, def, preset);
  if (!bindings) return false;
  markFired(ctx.s, def);
  if (def.kind === 'choice') {
    ctx.s.pending.push({ eventId: def.id, bindings, payload, source });
    ctx.s.totals.popups += 1;
    ctx.s.events.popupsThisYear += 1;
  } else {
    const outcome = pickOutcome(ctx, def.outcomes ?? []);
    if (outcome) applyOutcome(ctx, def, outcome, bindings, payload, true);
    ctx.s.events.noticesThisYear += 1;
  }
  return true;
}

const POPUP_ATTEMPT = [0.8, 0.45, 0.3, 0.2, 0.15];
const NOTICE_ATTEMPT = [0.6, 0.35, 0.2, 0.12, 0.06, 0.04];
export const NOTICE_CAP = 6;

/** Step 5: chain steps due this year. */
export function runDueChains(ctx: Ctx): void {
  const s = ctx.s;
  const due = s.chains.filter((c) => c.dueYear <= s.year);
  s.chains = s.chains.filter((c) => c.dueYear > s.year);
  for (const step of due) {
    const def = EVENT_BY_ID[step.eventId];
    if (!def || s.death) continue;
    if (!eligibility(s, def, { chain: true }).ok) continue;
    fireEvent(ctx, def, 'chain', step.payload, step.bindings);
  }
}

/** Step 6: random events up to the popup cap and the notice cap (SPEC §4.3). */
export function drawRandomEvents(ctx: Ctx): void {
  const s = ctx.s;
  const cap = s.settings.popupsPerYear;
  const pool = EVENTS.filter((d) => !d.chainOnly);
  for (const kind of ['choice', 'notice'] as const) {
    const attempts = kind === 'choice' ? POPUP_ATTEMPT : NOTICE_ATTEMPT;
    for (let i = 0; i < attempts.length; i++) {
      if (s.death) return;
      if (kind === 'choice' && s.events.popupsThisYear >= cap) break;
      if (kind === 'notice' && s.events.noticesThisYear >= NOTICE_CAP) break;
      if (!ctx.rng.chance(attempts[i] ?? 0)) break;
      const eligible = pool.filter((d) => d.kind === kind && eligibility(s, d).ok);
      const def = ctx.rng.weighted(eligible, (d) => eventWeight(s, d));
      if (!def) break;
      fireEvent(ctx, def, 'random');
    }
  }
}
