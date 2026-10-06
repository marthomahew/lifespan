import { GIFT_BY_ID } from '../../content/gifts';
import { SKILL_BY_ID } from '../../content/skills';
import { TRAIT_BY_ID } from '../../content/traits';
import type { OddsKey } from '../../content/types';
import type { GameState } from '../types';
import type { EventDef, OutcomeDef } from './types';

/** Which talent an event's category tests, and which visible stat helps. */
const DOMAIN: Record<string, { key: OddsKey; stat?: 'smarts' | 'looks' | 'happiness' | 'health' }> =
  {
    school: { key: 'study', stat: 'smarts' },
    work: { key: 'work', stat: 'smarts' },
    romance: { key: 'romance', stat: 'looks' },
    social: { key: 'social', stat: 'happiness' },
    family: { key: 'social', stat: 'happiness' },
    crime: { key: 'crime', stat: 'smarts' },
    money: { key: 'money', stat: 'smarts' },
    fame: { key: 'creative' },
    health: { key: 'athletic', stat: 'health' },
    military: { key: 'athletic', stat: 'health' },
  };

const STAT_LABEL = { smarts: 'Smarts', looks: 'Looks', happiness: 'Happiness', health: 'Health' };
const MAX = 0.25;

export type Edge = { bonus: number; best: string | null; worst: string | null };

/** How much who you are tilts this event's success outcomes, and the biggest reasons why. */
export function eventEdge(s: GameState, def: EventDef): Edge {
  const d = DOMAIN[def.category];
  if (!d) return { bonus: 0, best: null, worst: null };
  const parts: [string, number][] = [];
  for (const id of s.player.traits) {
    const t = TRAIT_BY_ID[id];
    const v = t?.odds[d.key] ?? 0;
    if (t && v) parts.push([`Being ${t.label}`, v]);
  }
  for (const [id, lvl] of Object.entries(s.player.skills)) {
    const k = SKILL_BY_ID[id];
    const v = ((k?.odds[d.key] ?? 0) * lvl) / 100;
    if (k && v) parts.push([`Your ${k.label.toLowerCase()}`, v]);
  }
  // Luck (a picked gift) can push past the usual cap.
  let luckBonus = 0;
  for (const id of s.player.gifts ?? []) {
    const g = GIFT_BY_ID[id];
    const v = g?.odds?.[d.key] ?? 0;
    if (g && v) {
      parts.push([g.label, v]);
      luckBonus += v;
    }
  }
  if (d.stat) {
    const v = (s.player.stats[d.stat] - 50) / 300;
    if (Math.abs(v) >= 0.02) parts.push([`${v > 0 ? 'High' : 'Low'} ${STAT_LABEL[d.stat]}`, v]);
  }
  const bonus = Math.max(
    -MAX,
    Math.min(
      MAX + luckBonus,
      parts.reduce((t, [, v]) => t + v, 0),
    ),
  );
  const sorted = [...parts].sort((a, b) => b[1] - a[1]);
  const best = sorted[0] && sorted[0][1] > 0 ? sorted[0][0] : null;
  const last = sorted.at(-1);
  const worst = last && last[1] < 0 ? last[0] : null;
  return { bonus, best, worst };
}

/**
 * Shift weight toward the success outcomes by the player's edge (a skill check).
 * Choices with no marked success, or only successes, are left alone.
 */
export function tiltWeights(weights: number[], outcomes: OutcomeDef[], bonus: number): number[] {
  const total = weights.reduce((a, b) => a + b, 0);
  const ok = outcomes.reduce((t, o, i) => t + (o.success ? (weights[i] ?? 0) : 0), 0);
  if (!bonus || total <= 0 || ok <= 0 || ok >= total) return weights;
  const p = ok / total;
  const q = Math.min(0.97, Math.max(0.03, p + bonus));
  return weights.map((w, i) => (outcomes[i]?.success ? (w * q) / p : (w * (1 - q)) / (1 - p)));
}

/** A short reason for the result card, when the edge was big enough to matter. */
export function edgeReason(
  s: GameState,
  def: EventDef,
  outcomes: OutcomeDef[],
  got: OutcomeDef,
): string | null {
  if (!outcomes.some((o) => o.success) || outcomes.every((o) => o.success)) return null;
  const e = eventEdge(s, def);
  if (got.success && e.bonus >= 0.08 && e.best) return `${e.best} helped.`;
  if (!got.success && e.bonus <= -0.08 && e.worst) return `${e.worst} didn't help.`;
  return null;
}
