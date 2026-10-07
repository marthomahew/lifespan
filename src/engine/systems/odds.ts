import { POSSESSION_BY_ID, VEHICLE_BY_ID } from '../../content/assets';
import { GIFT_BY_ID } from '../../content/gifts';
import { SKILL_BY_ID } from '../../content/skills';
import { TRAIT_BY_ID } from '../../content/traits';
import type { OddsKey } from '../../content/types';
import type { GameState, Npc } from '../types';
import { lifestyleOdds } from './lifestyle';

/** Sum of the player's trait and skill modifiers for an odds domain (SPEC §5.12). */
export function playerOdds(s: GameState, key: OddsKey): number {
  let t = 0;
  for (const id of s.player.traits) t += TRAIT_BY_ID[id]?.odds[key] ?? 0;
  for (const [id, lvl] of Object.entries(s.player.skills))
    t += ((SKILL_BY_ID[id]?.odds[key] ?? 0) * lvl) / 100;
  for (const id of s.player.gifts ?? []) t += GIFT_BY_ID[id]?.odds?.[key] ?? 0;
  // Things you own that open doors (once per kind: two sports cars don't double the effect).
  const kinds = new Set([
    ...s.assets.vehicles.map((v) => `v:${v.model}`),
    ...s.assets.possessions.map((p) => `p:${p.item}`),
  ]);
  for (const k of kinds) {
    const def = k.startsWith('v:') ? VEHICLE_BY_ID[k.slice(2)] : POSSESSION_BY_ID[k.slice(2)];
    t += def?.perks?.[key] ?? 0;
  }
  return t + lifestyleOdds(s, key);
}

export function npcOdds(n: Npc, key: OddsKey): number {
  let t = 0;
  for (const id of n.traits) t += TRAIT_BY_ID[id]?.odds[key] ?? 0;
  return t;
}

/** How an NPC feels about recent shared history: the average delta of their last five memories, scaled. */
export function memorySentiment(n: Npc): number {
  const recent = n.memory.slice(-5);
  if (!recent.length) return 0;
  return recent.reduce((t, m) => t + m.delta, 0) / recent.length / 100;
}

export function clampOdds(p: number): number {
  return Math.min(0.97, Math.max(0.03, p));
}
