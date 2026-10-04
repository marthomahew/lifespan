import { EVENT_BY_ID, EVENTS } from '../../content/events';
import { eligibility, eventWeight, fireEvent } from '../events/select';
import type { Category, GameState } from '../types';
import type { CheatDef } from './types';
import { categoryOptions, eventOptions } from './options';

export type EventRow = {
  id: string;
  kind: string;
  category: string;
  eligible: boolean;
  reason: string;
  weight: number;
  share: number;
};

/** Every event, whether it could fire now and why not, and its share of this year's draw (Events tab, Debug odds view). */
export function eventTable(s: GameState): EventRow[] {
  const rows = EVENTS.map((d) => {
    const e = eligibility(s, d);
    const w = e.ok && !d.chainOnly ? eventWeight(s, d) : 0;
    return {
      id: d.id,
      kind: d.kind,
      category: d.category,
      eligible: e.ok,
      reason: e.reason,
      weight: w,
      share: 0,
    };
  });
  for (const kind of ['choice', 'notice']) {
    const total = rows.filter((r) => r.kind === kind).reduce((t, r) => t + r.weight, 0);
    for (const r of rows) if (r.kind === kind && total > 0) r.share = r.weight / total;
  }
  return rows;
}

export const EVENT_CHEATS: CheatDef[] = [
  {
    id: 'event.fire',
    group: 'events',
    label: 'Fire an event',
    syntax: 'event fire {event} {force}',
    help: 'Fire any event now. Add "on" to ignore its conditions. Example: event fire teen_party_parents_away',
    params: [
      { name: 'event', type: 'enum', options: eventOptions },
      { name: 'force', type: 'bool', optional: true },
    ],
    run: (ctx, p) => {
      const def = EVENT_BY_ID[String(p['event'])];
      if (!def) return 'No such event';
      const force = p['force'] === true;
      if (!force && def.chainOnly)
        return `${def.id} only fires as a follow-up; add "on" to force it`;
      const e = eligibility(ctx.s, def, { ignoreConditions: force, chain: force });
      if (!e.ok) return `Can't fire ${def.id}: ${e.reason}`;
      const ok = fireEvent(ctx, def, 'cheat');
      return ok ? `Fired ${def.id}` : `Couldn't bind ${def.id}`;
    },
  },
  {
    id: 'event.reroll',
    group: 'events',
    label: 'Reroll the current popup',
    syntax: 'event reroll',
    help: 'Swap the current popup for another eligible one.',
    params: [],
    run: (ctx) => {
      const s = ctx.s;
      const cur = s.pending[0];
      if (!cur) return 'No popup to reroll';
      s.pending = s.pending.slice(1);
      const pool = EVENTS.filter(
        (d) => d.kind === 'choice' && !d.chainOnly && d.id !== cur.eventId && eligibility(s, d).ok,
      );
      const def = ctx.rng.weighted(pool, (d) => eventWeight(s, d));
      if (!def) return 'Nothing else is eligible right now';
      const before = s.pending.length;
      fireEvent(ctx, def, 'cheat');
      // Put the new popup first.
      const added = s.pending.splice(before);
      s.pending = [...added, ...s.pending];
      return `Rerolled into ${def.id}`;
    },
  },
  {
    id: 'category.toggle',
    group: 'events',
    label: 'Switch a category on or off',
    syntax: 'category {category} {on}',
    help: 'Stop (off) or allow (on) random events of a category. Example: category romance off',
    params: [
      { name: 'category', type: 'enum', options: categoryOptions },
      { name: 'on', type: 'bool', optional: true },
    ],
    run: (ctx, p) => {
      const c = p['category'] as Category;
      const disabled = ctx.s.cheats.disabledCategories;
      const on = p['on'] === undefined ? disabled.includes(c) : Boolean(p['on']);
      ctx.s.cheats.disabledCategories = on
        ? disabled.filter((x) => x !== c)
        : [...new Set([...disabled, c])];
      return `${c} events ${on ? 'on' : 'off'}`;
    },
  },
  {
    id: 'chains.list',
    readOnly: true,
    group: 'events',
    label: 'List pending chain steps',
    syntax: 'chains',
    help: 'Show scheduled follow-ups and when they are due.',
    params: [],
    run: (ctx) => {
      const c = ctx.s.chains;
      if (!c.length) return 'No chain steps scheduled';
      return c.map((x, i) => `${i}: ${x.eventId} due ${x.dueYear}`).join('\n');
    },
  },
  {
    id: 'chain.fire',
    group: 'events',
    label: 'Fire a chain step now',
    syntax: 'chain fire {index}',
    help: 'Fire a scheduled follow-up immediately (index from chains).',
    params: [{ name: 'index', type: 'int', min: 0 }],
    run: (ctx, p) => {
      const i = Number(p['index']);
      const step = ctx.s.chains[i];
      if (!step) return `No chain step ${i}`;
      const def = EVENT_BY_ID[step.eventId];
      ctx.s.chains = ctx.s.chains.filter((_, j) => j !== i);
      if (!def) return `Unknown event ${step.eventId}`;
      const ok = fireEvent(ctx, def, 'chain', step.payload, step.bindings);
      return ok ? `Fired ${def.id}` : `Couldn't fire ${def.id} (someone involved is gone)`;
    },
  },
  {
    id: 'events.list',
    readOnly: true,
    group: 'events',
    label: 'List eligible events',
    syntax: 'events {filter}',
    help: 'List events eligible right now, optionally filtered by id text.',
    params: [{ name: 'filter', type: 'string', optional: true }],
    run: (ctx, p) => {
      const f = String(p['filter'] ?? '').toLowerCase();
      const rows = eventTable(ctx.s).filter((r) => r.eligible && (!f || r.id.includes(f)));
      return rows.length
        ? rows
            .slice(0, 40)
            .map((r) => `${r.id} (${r.kind}, ${(r.share * 100).toFixed(1)}%)`)
            .join('\n')
        : 'Nothing eligible';
    },
  },
];
