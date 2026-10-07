import type { Ctx } from '../ctx';
import { countryOf, formatMoney } from '../economy';
import { addStat } from '../stats';
import type { GameState } from '../types';

/**
 * The record business: genres whose moment comes and goes, chart peaks, sales that follow the
 * era (records and CDs, the download slump, streaming), certifications, awards and royalties.
 */
export type Genre = 'pop' | 'rock' | 'hiphop' | 'country' | 'electronic' | 'rnb' | 'jazz' | 'folk';

export const GENRES: { id: Genre; label: string }[] = [
  { id: 'pop', label: 'Pop' },
  { id: 'rock', label: 'Rock' },
  { id: 'hiphop', label: 'Hip-hop' },
  { id: 'rnb', label: 'R&B and soul' },
  { id: 'country', label: 'Country' },
  { id: 'electronic', label: 'Electronic' },
  { id: 'folk', label: 'Folk and singer-songwriter' },
  { id: 'jazz', label: 'Jazz' },
];

/** How much the world wants this genre this year (about 0.5 to 1.3). */
export function genreMoment(g: Genre, year: number): number {
  const bump = (peak: number, width: number, top: number, floor: number): number =>
    floor + (top - floor) * Math.exp(-(((year - peak) / width) ** 2));
  switch (g) {
    case 'pop':
      return 1.15;
    case 'rock':
      return bump(1978, 22, 1.3, 0.6);
    case 'hiphop':
      return year < 1979 ? 0.4 : bump(2012, 20, 1.3, 0.6);
    case 'rnb':
      return bump(1975, 30, 1.15, 0.85);
    case 'country':
      return 0.95;
    case 'electronic':
      return year < 1975 ? 0.5 : bump(2010, 15, 1.2, 0.65);
    case 'folk':
      return bump(1966, 12, 1.15, 0.7);
    case 'jazz':
      return bump(1955, 12, 1.2, 0.5);
  }
}

/**
 * What an artist earns per unit sold, by era (today's dollars): a royalty on a record or CD,
 * then on a download, then on an album's worth of streams (1,500 of them).
 */
const perUnit = (year: number): number => (year < 2000 ? 2 : 1.2);

/** A star's pull: the famous sell many times more of a hit (up to about twelve times). */
const starPower = (fame: number): number => 1 + 11 * (fame / 100) ** 3;

/** chart: the peak position (0: didn't chart). */
export type ReleaseResult = { chart: number; sales: number; cert?: string; pay: number };

/** How a release does: a chart peak, sales, a certification, and the money. */
export function releaseResult(ctx: Ctx, quality: number, signed: boolean): ReleaseResult {
  const s = ctx.s;
  const fame = s.player.stats.fame;
  const g = s.music.genre ?? 'pop';
  const pull =
    (quality / 100) * genreMoment(g, s.year) * (0.6 + fame / 100) * (signed ? 1.25 : 0.7);
  // A strong pull charts high; most records never chart at all.
  const score = pull * 100 + ctx.rng.normal(0, 8);
  const chart = score >= 40 ? Math.max(1, Math.round(101 - score * 1.0)) : 0;
  // Sales (units: records and CDs, then downloads, then streams' equivalent).
  const era = s.year < 2000 ? 1 : s.year < 2015 ? 0.55 : 0.8;
  const sales = Math.round(
    (chart ? (400000 / Math.sqrt(chart)) * starPower(fame) : 2000 + pull * 20000) *
      era *
      (0.7 + ctx.rng.next() * 0.6),
  );
  const cert =
    sales >= 1000000
      ? sales >= 2000000
        ? `${Math.floor(sales / 1000000)}× platinum`
        : 'platinum'
      : sales >= 500000
        ? 'gold'
        : undefined;
  // Stars negotiate a bigger royalty; going it alone keeps far more of each sale.
  const deal = signed ? (fame >= 80 ? 1.5 : 1) : 2.5;
  const pay = Math.round(
    sales * perUnit(s.year) * s.inflation * countryOf(s).currency.perUsd * deal,
  );
  return { chart, sales, ...(cert ? { cert } : {}), pay };
}

/** A sentence about a release's run (charts, sales, streams). */
export function releaseLine(s: GameState, r: ReleaseResult): string {
  const units =
    s.year >= 2015
      ? `${Math.round((r.sales * 1500) / 1_000_000)} million streams`
      : `${r.sales.toLocaleString('en-US')} copies`;
  const chart = r.chart
    ? r.chart === 1
      ? 'It goes to number one'
      : `It peaks at number ${r.chart}`
    : 'It doesn’t chart';
  return `${chart}: ${units}${r.cert ? `, certified ${r.cert}` : ''}.`;
}

/** Big records get nominated for the big music awards; some win. */
export function awardSeason(ctx: Ctx, title: string, quality: number, chart: number): void {
  const s = ctx.s;
  if (!chart || chart > 10 || quality < 75 || !ctx.rng.chance(0.6)) return;
  const won = ctx.rng.chance(0.25 + (quality - 75) / 100);
  const m = s.music;
  m.awards = [...(m.awards ?? []), `${won ? 'won' : 'nominated'}: “${title}” (${s.year})`];
  addStat(s, 'fame', won ? 8 : 3);
  if (won) addStat(s, 'happiness', 10);
  ctx.log(
    'fame',
    won
      ? `🏆 “${title}” wins at the big music awards. You thank everyone, forget your manager, and remember them on the stairs.`
      : `🎟️ “${title}” is nominated at the big music awards. You lose to a ballad, gracefully.`,
    true,
  );
}

/** Royalties from the back catalogue: older hits still sell, a little, every year. */
export function catalogueRoyalties(s: GameState): number {
  return Math.round(
    s.music.releases.reduce((t, r) => {
      const sold = r.sales ?? 0;
      const age = Math.max(1, s.year - r.year);
      return t + (sold * perUnit(s.year) * 0.05) / Math.sqrt(age);
    }, 0) *
      s.inflation *
      countryOf(s).currency.perUsd,
  );
}

export const royaltiesLine = (s: GameState, pay: number): string =>
  `Royalties from your records this year: ${formatMoney(s, pay)}.`;

/**
 * What a tour pays you after crew, venues and the band (today's dollars). A club act clears
 * thousands; a stadium star clears tens of millions (the biggest real tours gross $500M to $2B).
 * Ticket prices rose much faster than inflation from the late 1990s, and fans who saw you last
 * year are slower to buy again.
 */
export function tourTake(s: GameState, fame: number, lastTour: number | null): number {
  const era = s.year < 1980 ? 0.3 : s.year < 2000 ? 0.55 : 1;
  const star = 100_000_000 * (fame / 100) ** 5 * era;
  const latest = s.music.releases[s.music.releases.length - 1];
  const album = latest && latest.year >= s.year - 2 ? 0.7 + latest.quality / 200 : 0.7;
  const tired = lastTour !== null && lastTour >= s.year - 1 ? 0.5 : 1;
  return (20000 + fame * 3000 + star * album) * tired;
}
