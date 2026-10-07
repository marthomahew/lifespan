import type { Ctx } from '../ctx';
import { countryOf, formatMoney } from '../economy';
import { EngineError } from '../errors';
import { knownFor } from '../fame';
import { addStat } from '../stats';
import type { GameState } from '../types';
import { isChampion } from './chess-crown';
import { markUsed, usedThisYear } from './usage';

/**
 * Fame you can spend: once you're known for something, sponsors, publishers and promoters
 * pay for your name. Pay in today's dollars (a global market), growing with fame.
 */
export type FameDeal = {
  id: 'sponsor' | 'appearance' | 'book' | 'channel';
  label: string;
  emoji: string;
  /** How often: per year, or once every so many years. */
  perYear: number;
  everyYears?: number;
  fromYear?: number;
  /** Pay in reference dollars at a given fame (0..100). */
  pay: (fame: number) => number;
  blurb: string;
};

export const FAME_DEALS: FameDeal[] = [
  {
    id: 'sponsor',
    label: 'Sign a sponsorship deal',
    emoji: '🤝',
    perYear: 1,
    pay: (f) => Math.round(f * f * 30),
    blurb: 'A brand puts your face on its adverts.',
  },
  {
    id: 'appearance',
    label: 'Paid appearances',
    emoji: '🎤',
    perYear: 2,
    pay: (f) => Math.round(f * f * 10),
    blurb: 'Talks, openings, exhibitions: they pay to have you in the room.',
  },
  {
    id: 'book',
    label: 'Write a memoir',
    emoji: '📖',
    perYear: 1,
    everyYears: 5,
    pay: (f) => Math.round(f * f * 60),
    blurb: 'A publisher pays an advance for your story.',
  },
  {
    id: 'channel',
    label: 'Stream and post online',
    emoji: '📺',
    perYear: 1,
    fromYear: 2008,
    pay: (f) => Math.round(f * f * 15),
    blurb: 'A year of videos and streams about what you do.',
  },
];
export const FAME_DEAL_BY_ID = Object.fromEntries(FAME_DEALS.map((d) => [d.id, d])) as Record<
  FameDeal['id'],
  FameDeal
>;

/** The very top of a pursuit doubles what your name is worth. */
function pinnacle(s: GameState): boolean {
  return (
    isChampion(s) ||
    s.player.flags.includes('olympic_gold') ||
    s.player.flags.includes('nobel_laureate') ||
    (s.chess?.crowns?.length ?? 0) > 0
  );
}

/** What this deal would pay you now, in local money. */
export function fameDealPay(s: GameState, id: FameDeal['id']): number {
  const d = FAME_DEAL_BY_ID[id];
  const ref = d.pay(s.player.stats.fame) * (pinnacle(s) ? 2 : 1);
  return Math.round(ref * s.inflation * countryOf(s).currency.perUsd);
}

export function fameDealReason(s: GameState, id: FameDeal['id']): string | null {
  const d = FAME_DEAL_BY_ID[id];
  if (!d) return 'unknown deal';
  if (s.death) return 'the life is over';
  if (s.legal.prison) return 'not from prison';
  if (s.player.age < 16) return 'from age 16';
  if (s.player.stats.fame < 30 || knownFor(s).length === 0)
    return 'you need to be known for something';
  if (d.fromYear && s.year < d.fromYear) return `from ${d.fromYear}`;
  if (usedThisYear(s, `fame:${id}`) >= d.perYear) return 'done this year';
  const last = s.player.flags
    .filter((f) => f.startsWith(`fame_${id}:`))
    .map((f) => Number(f.split(':')[1]))
    .sort((a, b) => b - a)[0];
  if (d.everyYears && last !== undefined && s.year - last < d.everyYears)
    return `again in ${d.everyYears - (s.year - last)} ${d.everyYears - (s.year - last) === 1 ? 'year' : 'years'}`;
  return null;
}

/** Take a deal: the money, a little more fame, and a line about it. */
export function takeFameDeal(ctx: Ctx, id: FameDeal['id']): void {
  const s = ctx.s;
  const why = fameDealReason(s, id);
  if (why) throw new EngineError(why);
  const d = FAME_DEAL_BY_ID[id];
  const pay = fameDealPay(s, id);
  markUsed(s, `fame:${id}`);
  s.player.flags.push(`fame_${id}:${s.year}`);
  s.money.cash += pay;
  const what = knownFor(s)[0] ?? 'being you';
  const line: Record<FameDeal['id'], string> = {
    sponsor: `A brand signs you on the strength of ${what}. Your face appears on the side of a bus.`,
    appearance: `You turn up, smile, and talk about ${what} to a room that paid to hear it.`,
    book: `A publisher buys your memoir. The working title is about ${what}; the ghostwriter has questions.`,
    channel: `A year of videos about ${what}. The comments are mostly kind.`,
  };
  ctx.log('money', `${d.emoji} ${line[id]} ${formatMoney(s, pay)}.`, true);
  addStat(s, 'fame', 1);
}
