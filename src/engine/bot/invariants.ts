import { ALL_STATS, type GameState } from '../types';
import { popupView } from '../events/choose';
import { debtCeiling } from '../systems/loans';

/** Paths whose type allows null (DONE §4.1 deep scan). Array indices are written as []. */
const NULLABLE: RegExp[] = [
  /^\$\.military$/,
  /^\$\.death$/,
  /^\$\.career\.(jobId|partTimeId)$/,
  /^\$\.career\.history\[\]\.to$/,
  /^\$\.education\.enrollment$/,
  /^\$\.legal\.(case|prison)$/,
  /^\$\.legal\.case\.lawyer$/,
  /^\$\.music\.(act|label)$/,
  /^\$\.military\.discharge$/,
  /^\$\.will\.written$/,
  /^\$\.npcs\[\]\.job$/,
  /^\$\.money\.last$/,
  /^\$\.family\.pregnancy$/,
];
const nullable = (path: string): boolean => {
  const p = path.replace(/\[\d+\]/g, '[]');
  return NULLABLE.some((re) => re.test(p));
};

export const TOKEN_RE = /\{[^}]*\}/;

/** Deep scan: finite numbers, no undefined, null only where the type allows. */
export function scanValues(v: unknown, path: string, _key: string, out: string[]): void {
  if (out.length > 5) return;
  if (v === undefined) {
    out.push(`${path} is undefined`);
    return;
  }
  if (v === null) {
    if (!nullable(path)) out.push(`${path} is null`);
    return;
  }
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) out.push(`${path} is ${v}`);
    return;
  }
  if (Array.isArray(v)) {
    v.forEach((x, i) => scanValues(x, `${path}[${i}]`, _key, out));
    return;
  }
  if (typeof v === 'object') {
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) {
      if (k === 'snapshots') continue;
      scanValues(x, `${path}.${k}`, k, out);
    }
  }
}

/** Per-year invariants (DONE §4.1). Returns violations; empty means OK. */
export function checkState(s: GameState, prevAge: number | null, logFrom = 0): string[] {
  const v: string[] = [];
  const p = s.player;
  for (const k of ALL_STATS) {
    const x = p.stats[k];
    if (!Number.isInteger(x) || x < 0 || x > 100) v.push(`stat ${k}=${x}`);
  }
  for (const [k, x] of Object.entries(s.vices.levels))
    if (!Number.isInteger(x) || x < 0 || x > 100) v.push(`vice ${k}=${x}`);
  scanValues(s, '$', '$', v);
  if (prevAge !== null && p.age !== prevAge + 1) v.push(`age went ${prevAge} -> ${p.age}`);
  if (p.age > 120 && !s.cheats.immortal) v.push(`alive past 120 (${p.age})`);
  for (let i = logFrom; i < s.log.length; i++) {
    const e = s.log[i];
    if (!e || !e.text.trim()) v.push(`empty log entry ${i}`);
    else if (TOKEN_RE.test(e.text)) v.push(`unresolved token in log: ${e.text}`);
  }
  // Unsecured debt ends in bankruptcy rather than compounding forever (slack for mid-year inflation).
  const debt = s.money.loans.find((l) => l.kind === 'debt');
  if (prevAge !== null && debt && debt.balance > 1.5 * debtCeiling(s, s.money.last?.salary ?? 0))
    v.push(`runaway debt ${debt.balance}`);
  const ids = new Set<number>();
  for (const n of s.npcs) {
    if (ids.has(n.id)) v.push(`duplicate npc id ${n.id}`);
    ids.add(n.id);
    if (n.alive && n.age > 120) v.push(`npc ${n.id} alive at ${n.age}`);
    if (n.rel < 0 || n.rel > 100 || !Number.isInteger(n.rel)) v.push(`npc ${n.id} rel ${n.rel}`);
    if (n.romance && (n.age < 18 || p.age < 18))
      v.push(`romance with minor: npc ${n.id} (${n.age}) player ${p.age}`);
    if ((n.roles.includes('spouse') || n.roles.includes('partner')) && (n.age < 18 || p.age < 18))
      v.push(`partner/spouse under 18: npc ${n.id}`);
    if (n.memory.length > 30) v.push(`npc ${n.id} memory ${n.memory.length}`);
  }
  for (const pe of s.pending) {
    const view = popupView(s, pe);
    if (!view) v.push(`pending ${pe.eventId} is not a known choice event`);
    else {
      if (!view.text.trim()) v.push(`pending ${pe.eventId} has empty text`);
      if (TOKEN_RE.test(view.text)) v.push(`unresolved token in popup ${pe.eventId}: ${view.text}`);
      if (!view.choices.some((c) => c.enabled))
        v.push(`pending ${pe.eventId} has no selectable choice`);
      for (const c of view.choices) {
        if (!c.label.trim() || TOKEN_RE.test(c.label))
          v.push(`bad choice label in ${pe.eventId}: ${c.label}`);
      }
    }
    for (const [b, id] of Object.entries(pe.bindings)) {
      const n = s.npcs.find((x) => x.id === id);
      if (!n) v.push(`pending ${pe.eventId} binds missing npc ${b}=${id}`);
      else if (!n.alive) v.push(`pending ${pe.eventId} binds dead npc ${b}=${id}`);
    }
  }
  const preg = s.family.pregnancy;
  if (preg) {
    if (p.age < 18) v.push('pregnancy with a player under 18');
    const other = s.npcs.find((n) => n.id === preg.partnerId);
    if (preg.partnerId > 0 && (!other || other.age < 18))
      v.push(`pregnancy partner missing or under 18 (${preg.partnerId})`);
  }
  return v;
}
