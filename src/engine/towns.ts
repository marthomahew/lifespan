import { COUNTRY_BY_ID } from '../content/countries';
import type { TownInfo, TownTag } from '../content/types';
import type { Ctx } from './ctx';
import { formatMoney, money } from './economy';
import { EngineError } from './errors';
import { markUsed } from './systems/usage';
import type { GameState } from './types';

/** The town you live in, in depth, where the country has the detail (Slovenia does). */
export function townOf(
  s: GameState,
  city = s.player.city,
  country = s.player.country,
): TownInfo | null {
  return COUNTRY_BY_ID[country]?.towns?.[city] ?? null;
}

/** Event conditions: living somewhere with one of these tags, or in one of these regions or towns. */
export const inTownWith =
  (...tags: TownTag[]) =>
  (s: GameState): boolean =>
    tags.some((t) => townOf(s)?.tags.includes(t) ?? false);
export const inRegion =
  (...regions: string[]) =>
  (s: GameState): boolean =>
    regions.includes(townOf(s)?.region ?? '');
export const inTown =
  (...names: string[]) =>
  (s: GameState): boolean =>
    names.includes(s.player.city) && townOf(s) !== null;

export const TOWN_FIELDS = ['region', 'landmark', 'food', 'river', 'famous', 'quirk'] as const;

/** {town:landmark} and friends: null when this town has no such detail (the event can't run). */
export function townToken(s: GameState, field: string): string | null {
  const t = townOf(s);
  if (!t) return null;
  switch (field) {
    case 'region':
      return t.region;
    case 'landmark':
      // Steady within a year, so one event's text and outcome name the same place.
      return t.landmarks[(s.year + s.player.age) % Math.max(1, t.landmarks.length)] ?? null;
    case 'food':
      return t.food;
    case 'river':
      return t.river ?? null;
    case 'famous':
      return t.famous ?? null;
    case 'quirk':
      return t.quirk;
    default:
      return null;
  }
}

/** Moving within the country: a removal van, a deposit, and a new town to learn. */
export function moveTownReason(s: GameState, city: string): string | null {
  const c = COUNTRY_BY_ID[s.player.country];
  if (s.player.age < 18) return 'from 18';
  if (s.legal.prison) return 'not from prison';
  if (!c?.cities.includes(city)) return 'no such town';
  if (city === s.player.city) return 'you live there';
  if (s.usage.year === s.year && (s.usage.used['move_town'] ?? 0) > 0) return 'once a year';
  if (s.money.cash < moveCost(s)) return `needs ${formatMoney(s, moveCost(s))}`;
  return null;
}
export const moveCost = (s: GameState): number => money(s, 2500);

export function moveTown(ctx: Ctx, city: string): void {
  const s = ctx.s;
  const why = moveTownReason(s, city);
  if (why) throw new EngineError(why);
  markUsed(s, 'move_town');
  s.money.cash -= moveCost(s);
  s.player.city = city;
  const t = townOf(s);
  ctx.log(
    'family',
    t
      ? `🚚 You move to ${city}, in ${t.region}. ${t.blurb}`
      : `🚚 You move to ${city}. New streets, new neighbours, the same you.`,
    true,
  );
}
