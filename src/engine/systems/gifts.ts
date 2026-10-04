import { POSSESSION_BY_ID } from '../../content/assets';
import type { Ctx } from '../ctx';
import { formatMoney, money } from '../economy';
import { EngineError } from '../errors';
import type { GameState, Npc } from '../types';

/** A gift is a small bought present by default, or money, or something you own (SPEC §5.1). */
export type GiftParams = { money?: number; possessionId?: number };

/** Base present price in reference dollars. */
export const PRESENT_REF = 60;

/** Better odds for a more generous gift: up to +10 points at 100× a small present. */
export function giftBonus(s: GameState, value: number): number {
  const ratio = value / Math.max(1, money(s, PRESENT_REF));
  return ratio <= 1 ? 0 : Math.min(0.1, Math.log10(ratio) * 0.05);
}

/** The local value of the gift, checking the player can actually give it. */
export function giftValue(s: GameState, g: GiftParams | undefined): number {
  if (g?.possessionId !== undefined) {
    const p = s.assets.possessions.find((x) => x.id === g.possessionId);
    if (!p) throw new EngineError('Give a gift: that item is not yours to give');
    return p.value;
  }
  if (g?.money !== undefined) {
    const amount = Math.round(g.money);
    if (!Number.isFinite(amount) || amount < money(s, 10))
      throw new EngineError(`Give a gift: at least ${formatMoney(s, money(s, 10))}`);
    if (amount > s.money.cash) throw new EngineError('Give a gift: you cannot afford that much');
    return amount;
  }
  return money(s, PRESENT_REF);
}

/** Hand the gift over: money moves to them, an item leaves your possessions. */
export function handOver(ctx: Ctx, n: Npc, g: GiftParams | undefined): void {
  const s = ctx.s;
  if (g?.possessionId !== undefined) {
    const p = s.assets.possessions.find((x) => x.id === g.possessionId);
    if (!p) return;
    s.assets.possessions = s.assets.possessions.filter((x) => x !== p);
    const label = POSSESSION_BY_ID[p.item]?.label.toLowerCase() ?? 'a keepsake';
    ctx.log('social', `You give ${n.first} your ${label}.`);
  } else if (g?.money !== undefined) {
    const amount = Math.round(g.money);
    s.money.cash -= amount;
    n.money += amount;
    ctx.log('money', `You give ${n.first} ${formatMoney(s, amount)}.`);
  } else {
    s.money.cash -= money(s, PRESENT_REF);
  }
}
