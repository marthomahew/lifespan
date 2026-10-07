import {
  LIFESTYLE_BY_ID,
  TIERS,
  type LifestyleDef,
  type WealthTier,
} from '../../content/lifestyle';
import type { OddsKey } from '../../content/types';
import type { Ctx } from '../ctx';
import { countryOf, formatMoney } from '../economy';
import { EngineError } from '../errors';
import { netWorthRef } from '../networth';
import { addStat } from '../stats';
import type { GameState } from '../types';

/** Something the good life gave you: kept (a jet), kept up (staff), or a bet in play. */
export type LifestyleItem = {
  key: number;
  id: string;
  since: number;
  /** Owned things: what it's worth now (local money). */
  value?: number;
  /** Start-up bets: the year they come good, or don't, and what went in. */
  payout?: number;
  stake?: number;
};

/** Today's dollars to local money, at this year's prices (luxury is a global market). */
const usd = (s: GameState, ref: number): number =>
  Math.round(ref * s.inflation * countryOf(s).currency.perUsd);

export const owned = (s: GameState): LifestyleItem[] => s.lifestyle ?? [];
const has = (s: GameState, id: string): boolean => owned(s).some((x) => x.id === id);

/** The highest tier your net worth reaches (null below the first). */
export function wealthTier(s: GameState): WealthTier | null {
  const nw = netWorthRef(s);
  let tier: WealthTier | null = null;
  for (const t of TIERS) if (nw >= t.netWorth) tier = t.id;
  return tier;
}

const TIER_RANK: Record<WealthTier, number> = { well_off: 0, rich: 1, wealthy: 2, ultra: 3 };

/** What it costs now, in local money. */
export const lifestyleCost = (s: GameState, def: LifestyleDef): number => usd(s, def.cost);
export const lifestyleUpkeep = (s: GameState, def: LifestyleDef): number => usd(s, def.upkeep);

export function lifestyleReason(s: GameState, id: string): string | null {
  const def = LIFESTYLE_BY_ID[id];
  if (!def) return 'unknown';
  if (s.death) return 'the life is over';
  if (s.legal.prison) return 'not from prison';
  if (s.player.age < 18) return 'from age 18';
  if (def.fromYear && s.year < def.fromYear) return `from ${def.fromYear}`;
  const tier = wealthTier(s);
  const need = TIERS.find((t) => t.id === def.tier);
  if (!tier || TIER_RANK[tier] < TIER_RANK[def.tier])
    return `needs a net worth of ${formatMoney(s, usd(s, need?.netWorth ?? 0))}`;
  if (!def.repeat && has(s, id)) return def.kind === 'once' ? 'done' : 'you already have it';
  const first = lifestyleCost(s, def) + (def.kind === 'service' ? lifestyleUpkeep(s, def) : 0);
  if (s.money.cash < first) return `needs ${formatMoney(s, first)} in cash`;
  return null;
}

/** Buy it, start it, or do it. */
export function buyLifestyle(ctx: Ctx, id: string): void {
  const s = ctx.s;
  const why = lifestyleReason(s, id);
  if (why) throw new EngineError(why);
  const def = LIFESTYLE_BY_ID[id] as LifestyleDef;
  const cost = lifestyleCost(s, def);
  s.money.cash -= cost;
  const list = (s.lifestyle ??= []);
  const key = (list.reduce((m, x) => Math.max(m, x.key), 0) ?? 0) + 1;
  if (def.special === 'angel')
    list.push({ key, id, since: s.year, payout: s.year + 5 + ctx.rng.int(0, 3), stake: cost });
  else if (def.kind !== 'once' || def.id === 'pledge')
    list.push({ key, id, since: s.year, ...(def.kind === 'own' ? { value: cost } : {}) });
  const n = def.now;
  if (n?.happiness) addStat(s, 'happiness', n.happiness);
  if (n?.fame) addStat(s, 'fame', n.fame);
  if (n?.karma) addStat(s, 'karma', n.karma);
  if (n?.stress) addStat(s, 'stress', n.stress);
  ctx.log(
    'money',
    `${def.emoji} ${def.description}${cost ? ` (${formatMoney(s, cost)})` : ''}`,
    true,
  );
}

/** Stop a service, or sell something you own (90% of its value). */
export function endLifestyle(ctx: Ctx, key: number): void {
  const s = ctx.s;
  const item = owned(s).find((x) => x.key === key);
  if (!item) throw new EngineError('nothing to stop');
  const def = LIFESTYLE_BY_ID[item.id];
  if (item.value !== undefined) {
    const got = Math.round(item.value * 0.9);
    s.money.cash += got;
    ctx.log('money', `You sell ${def?.label.toLowerCase() ?? 'it'} for ${formatMoney(s, got)}.`);
  } else ctx.log('money', `You stop: ${def?.label.toLowerCase() ?? 'that'}.`);
  s.lifestyle = owned(s).filter((x) => x.key !== key);
}

/** Extra free time the good life buys (staff, a jet). */
export function lifestyleFreeTime(s: GameState): number {
  let n = 0;
  for (const id of new Set(owned(s).map((x) => x.id))) n += LIFESTYLE_BY_ID[id]?.freeTime ?? 0;
  return n;
}

/** Odds tilts from the good life (a club, a yacht). */
export function lifestyleOdds(s: GameState, key: OddsKey): number {
  let t = 0;
  for (const id of new Set(owned(s).map((x) => x.id))) t += LIFESTYLE_BY_ID[id]?.perks?.[key] ?? 0;
  return t;
}

/** Investment returns with a family office: a couple of points better than the market. */
export const familyOfficeBonus = (s: GameState): number => (has(s, 'family_office') ? 0.02 : 0);

/** What everything you own here is worth (for net worth). */
export const lifestyleValue = (s: GameState): number =>
  owned(s).reduce((t, x) => t + (x.value ?? 0), 0);

/** The year of the good life: upkeep, effects, values, races, start-ups, giving. */
export function lifestyleTick(ctx: Ctx): number {
  const s = ctx.s;
  if (!owned(s).length || s.death) return 0;
  let upkeep = 0;
  const seen = new Set<string>();
  for (const item of [...owned(s)]) {
    const def = LIFESTYLE_BY_ID[item.id];
    if (!def) continue;
    upkeep += lifestyleUpkeep(s, def);
    if (def.growth && item.value !== undefined)
      item.value = Math.max(
        0,
        Math.round(item.value * (1 + ctx.rng.normal(def.growth[0], def.growth[1]))),
      );
    if (!seen.has(item.id)) {
      seen.add(item.id);
      const y = def.yearly;
      if (y?.happiness) addStat(s, 'happiness', y.happiness);
      if (y?.stress) addStat(s, 'stress', y.stress);
      if (y?.health) addStat(s, 'health', y.health);
      if (y?.fame) addStat(s, 'fame', y.fame);
    }
    if (def.special === 'racehorse' && ctx.rng.chance(0.25)) {
      const purse = usd(s, ctx.rng.int(200000, 2000000));
      s.money.cash += purse;
      ctx.log(
        'money',
        `🐎 Your horse wins a big race, in your colours. The purse: ${formatMoney(s, purse)}.`,
        true,
      );
      addStat(s, 'happiness', 5);
    }
    if (def.special === 'team' && ctx.rng.chance(0.1)) {
      ctx.log(
        'money',
        '🏆 Your team wins the championship. You lift the trophy with the players and cry on television.',
        true,
      );
      addStat(s, 'fame', 5);
      addStat(s, 'happiness', 10);
      if (item.value) item.value = Math.round(item.value * 1.1);
    }
    if (def.special === 'angel' && item.payout === s.year) {
      const r = ctx.rng.next();
      const mult = r < 0.05 ? 50 : r < 0.3 ? 3 : r < 0.5 ? 1 : 0;
      const back = Math.round((item.stake ?? 0) * mult);
      s.money.cash += back;
      ctx.log(
        'money',
        mult >= 50
          ? `🚀 One of your start-ups becomes a household name. Your small cheque is now ${formatMoney(s, back)}.`
          : mult > 1
            ? `🚀 Two of your start-ups are bought. You get back ${formatMoney(s, back)}.`
            : mult === 1
              ? '🚀 Your start-up bets come out about even: some failed, one sold for a little.'
              : '🚀 Every one of your start-ups folds. The founders send lovely farewell emails.',
        mult > 1,
      );
      s.lifestyle = owned(s).filter((x) => x.key !== item.key);
    }
    if (item.id === 'pledge') {
      // Half your fortune, over the years: a slice of your cash goes to good causes.
      const give = Math.round(Math.max(0, s.money.cash) * 0.05);
      if (give > 0) {
        s.money.cash -= give;
        addStat(s, 'karma', 2);
        ctx.log('money', `🎁 This year's giving: ${formatMoney(s, give)} to causes you chose.`);
      }
    }
  }
  s.money.cash -= upkeep;
  return upkeep;
}
