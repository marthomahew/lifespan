import { npcNetWorth } from './npc-economy';
import { productPhrase } from './assets';
import type { Ctx } from '../ctx';
import { formatMoney, money } from '../economy';
import { POSSESSION_BY_ID } from '../../content/assets';

const HEIRLOOMS = ['gold_watch', 'diamond_ring', 'oil_painting', 'rare_stamps', 'violin'];
import { netWorth } from '../networth';
import type { GameState, Npc } from '../types';

const isChildOf = (n: Npc, parentId: number): boolean => n.parentIds.includes(parentId);

/** When someone close dies, they may leave you money by relation and relationship (SPEC §5.1). */
export function inheritFrom(ctx: Ctx, dead: Npc): void {
  const s = ctx.s;
  // The estate is everything: savings, investments and the house, less what they owed.
  dead.money = Math.max(0, npcNetWorth(dead));
  dead.invest = 0;
  dead.home = 0;
  dead.mortgage = 0;
  dead.debt = 0;
  if (dead.money <= 0 || dead.rel < 15) return;
  let share = 0;
  if (dead.roles.includes('spouse')) share = 1;
  else if (dead.roles.includes('mother') || dead.roles.includes('father')) {
    const otherParent = s.npcs.find(
      (n) =>
        n.alive &&
        n.id !== dead.id &&
        (n.roles.includes('mother') || n.roles.includes('father')) &&
        n.flags.includes('parents_happy'),
    );
    const heirs =
      1 +
      s.npcs.filter((n) => n.alive && n.roles.includes('sibling') && isChildOf(n, dead.id)).length;
    share = (otherParent ? 0.5 : 1) / heirs;
  } else if (dead.roles.includes('grandparent')) share = 0.15;
  else if (dead.roles.includes('child') && dead.age >= 18) share = 0.3;
  else if (dead.roles.includes('sibling')) share = 0.1;
  else if (dead.roles.includes('friend') && dead.rel > 80) share = 0.05;
  if (share <= 0) return;
  // Warmer relationships get a bigger slice.
  const amount = Math.round(dead.money * share * (0.5 + dead.rel / 200));
  if (amount <= 0) return;
  dead.money -= amount;
  s.money.cash += amount;
  // A token sum reads as a keepsake, not a windfall.
  ctx.log(
    'money',
    amount < money(s, 100)
      ? `${dead.first}'s will leaves you a token ${formatMoney(s, amount)}, and the thought.`
      : `${dead.first}'s will leaves you ${formatMoney(s, amount)}.`,
    amount >= money(s, 100),
  );
  // Older relatives sometimes leave an heirloom too.
  if (
    (dead.roles.includes('grandparent') ||
      dead.roles.includes('mother') ||
      dead.roles.includes('father')) &&
    ctx.rng.chance(0.3)
  ) {
    const item = ctx.rng.pick(HEIRLOOMS);
    const def = POSSESSION_BY_ID[item];
    if (def) {
      s.assets.possessions.push({
        id: s.assets.nextAssetId++,
        item,
        value: money(s, def.price),
        paid: 0,
        condition: ctx.rng.int(50, 90),
        bought: s.year,
      });
      ctx.log('family', `${dead.first} also leaves you ${productPhrase(def, s.year)}.`);
    }
  }
}

export type EstateShare = { npcId: number; amount: number };

/** Who gets the player's estate: the will if there is one, otherwise spouse half and children the rest. */
export function estatePlan(s: GameState): EstateShare[] {
  const estate = Math.max(0, netWorth(s));
  const alive = (id: number): boolean => s.npcs.some((n) => n.id === id && n.alive);
  const heirs = s.will.heirs.filter((h) => alive(h.npcId) && h.share > 0);
  if (heirs.length) {
    const total = heirs.reduce((t, h) => t + h.share, 0);
    return heirs.map((h) => ({ npcId: h.npcId, amount: Math.round((estate * h.share) / total) }));
  }
  const spouse = s.npcs.find((n) => n.alive && n.roles.includes('spouse'));
  const kids = s.npcs.filter((n) => n.alive && n.roles.includes('child'));
  const out: EstateShare[] = [];
  if (spouse) out.push({ npcId: spouse.id, amount: Math.round(kids.length ? estate / 2 : estate) });
  const rest = spouse ? (kids.length ? estate / 2 : 0) : estate;
  for (const k of kids) out.push({ npcId: k.id, amount: Math.round(rest / kids.length) });
  return out;
}

/** At death, hand the estate to the heirs (they keep it as their own money). */
export function settleEstate(s: GameState): EstateShare[] {
  const plan = estatePlan(s);
  for (const share of plan) {
    const n = s.npcs.find((x) => x.id === share.npcId);
    if (n) n.money += share.amount;
  }
  return plan;
}
