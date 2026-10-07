import { EVENT_BY_ID } from '../../content/events';
import type { Ctx } from '../ctx';
import { countryOf, formatMoney, money } from '../economy';
import { EngineError } from '../errors';
import { fireEvent } from '../events/select';
import { addStat } from '../stats';
import type { GameState } from '../types';
import { addSkill } from './skills';
import { workTime } from './activities';
import { markUsed, usedThisYear } from './usage';

/** Your chess record: an Elo rating earned by results, titles, and norms toward them. */
export type ChessRecord = {
  rating: number;
  best: number;
  title: ChessTitle | null;
  imNorms: number;
  gmNorms: number;
  events: number;
  wins: number;
  /** The last few tournaments, newest last. */
  recent: { year: number; tier: string; score: number; change: number; place: string }[];
  /** The Candidates year you have qualified for (World Cup podium, a big open, or rating). */
  candQual?: number;
  /** The year you won the Candidates and earned a title match. */
  challenger?: number;
  /** Years you won or defended the world title. */
  crowns?: number[];
  /** The year you lost the title in a match (you are champion until then). */
  dethroned?: number;
  /** World Cup, Candidates and title-match results, newest last. */
  majors?: { year: number; id: string; result: string }[];
};
export type ChessTitle = 'CM' | 'FM' | 'IM' | 'GM';
export const TITLE_NAMES: Record<ChessTitle, string> = {
  CM: 'Candidate Master',
  FM: 'FIDE Master',
  IM: 'International Master',
  GM: 'Grandmaster',
};

/** Tournaments by level: who you play, what it pays the winner, and what it takes to enter. */
export type ChessTier = {
  id: string;
  label: string;
  field: number;
  minRating: number;
  /** First prize in reference (today's US) dollars; second and third get half. */
  prize: number;
  /** Strong enough fields count toward norms. */
  norms: boolean;
  /** Paid from an international prize fund: dollars, not scaled to local wages. */
  global?: boolean;
};
export const CHESS_TIERS: ChessTier[] = [
  { id: 'local', label: 'A weekend congress', field: 1250, minRating: 0, prize: 600, norms: false },
  {
    id: 'national',
    label: 'The national open',
    field: 1850,
    minRating: 1500,
    prize: 6000,
    norms: false,
  },
  {
    id: 'international',
    label: 'An international open',
    field: 2350,
    minRating: 2050,
    prize: 20000,
    norms: true,
    global: true,
  },
  {
    id: 'elite',
    label: 'An elite invitational',
    field: 2700,
    minRating: 2600,
    prize: 100000,
    norms: true,
    global: true,
  },
];
const ROUNDS = 9;

/**
 * What an elite invitation pays just for sitting down: organisers pay for names, so the fee
 * climbs steeply with rating (about $60k at 2700, $140k at 2800).
 */
export function appearanceFee(rating: number): number {
  return Math.max(10000, 20000 + (rating - 2650) * 800);
}
export const PER_YEAR = 6;

/**
 * "Conditions" at an open: organisers pay strong grandmasters to come (fee and hotel), about
 * $2,500 at 2600, $7,500 at 2700 and $12,500 at 2800.
 */
export function openConditions(rating: number): number {
  return rating >= 2600 ? Math.round((rating - 2550) * 50) : 0;
}

export const chessOf = (s: GameState): ChessRecord | null => s.chess ?? null;

/** How strong you play today: your skill (100 is the world number one, about 2850), your age (sharpest at 20–45), and a charmed life. */
export function playingStrength(s: GameState): number {
  const skill = s.player.skills['chess'] ?? 0;
  const age = s.player.age;
  const ageMod = age < 12 ? -(12 - age) * 25 : age > 45 ? -(age - 45) * 8 : 0;
  // A charmed life plays a little above itself.
  return Math.round(600 + skill * 22.5 + ageMod + 40 * charmed(s));
}
const charmed = (s: GameState): number => ((s.player.gifts ?? []).includes('charmed') ? 1 : 0);

/** Roughly where a rating sits in the world. */
export function worldRank(rating: number): string {
  const table: [number, number][] = [
    [2800, 1],
    [2750, 10],
    [2700, 40],
    [2650, 120],
    [2600, 300],
    [2500, 1500],
    [2400, 5000],
    [2300, 12000],
    [2200, 30000],
    [2000, 90000],
    [1800, 200000],
  ];
  for (let i = 0; i < table.length; i++) {
    const [r, rank] = table[i] as [number, number];
    if (rating >= r) {
      const prev = table[i - 1];
      if (!prev) return 'world number 1';
      const frac = (rating - r) / (prev[0] - r);
      return `around world number ${Math.round(rank - frac * (rank - prev[1])).toLocaleString('en-GB')}`;
    }
  }
  return 'a club player';
}

export function tournamentReason(s: GameState, tierId: string): string | null {
  const t = CHESS_TIERS.find((x) => x.id === tierId);
  if (!t) return 'unknown tournament';
  if (s.death) return 'the life is over';
  if (s.legal.prison) return 'not from prison';
  if (s.player.age < 6) return 'from age 6';
  if ((s.player.skills['chess'] ?? 0) < 5) return 'learn the moves first (practise chess)';
  const rating = chessOf(s)?.rating ?? 0;
  if (rating < t.minRating) return `needs a rating of ${t.minRating}`;
  if (usedThisYear(s, 'chess:events') >= PER_YEAR) return `${PER_YEAR} tournaments a year`;
  if (s.settings.freeTime !== false && workTime(s).left <= 0) return 'no work time left this year';
  return null;
}

export const expected = (me: number, them: number): number => 1 / (1 + 10 ** ((them - me) / 400));

/** A tier's money in local currency: international funds in dollars, others by local wages. */
export function chessMoney(s: GameState, t: ChessTier, ref: number): number {
  return t.global
    ? Math.round(ref * s.inflation * countryOf(s).currency.perUsd)
    : money(s, ref, 'wage');
}

/** What a tier pays, in words, for its button. */
export function tierPayLine(s: GameState, t: ChessTier): string {
  const first = formatMoney(s, chessMoney(s, t, t.prize));
  if (t.id === 'international')
    return `Prize funds vary: first is often around ${first}, up to four times that at the biggest opens.${
      openConditions(s.chess?.rating ?? 0)
        ? ` As a top grandmaster you're also paid about ${formatMoney(s, chessMoney(s, t, openConditions(s.chess?.rating ?? 0)))} to come.`
        : ''
    }`;
  if (t.id === 'elite') {
    const fee = formatMoney(s, chessMoney(s, t, appearanceFee(s.chess?.rating ?? t.minRating)));
    return `An appearance fee of about ${fee} just to play, and ${first} to the winner.`;
  }
  return `The winner takes ${first}.`;
}

/**
 * One game: 1, ½ or 0. Strong players draw more with each other, but a big rating gap leaves
 * little room for a draw: the stronger side usually just wins.
 */
export function game(ctx: Ctx, me: number, opp: number): number {
  const e = expected(me, opp);
  const close = Math.max(0.15, 1 - Math.abs(me - opp) / 450);
  const draw = Math.min(0.55, 0.15 + Math.min(me, opp) / 6000) * close;
  const winP = Math.max(0, e - draw / 2);
  const r = ctx.rng.next();
  return r < winP ? 1 : r < winP + draw ? 0.5 : 0;
}

/** Play a tournament: nine rounds against the field, rating, norms, titles, and a prize. */
export function playTournament(ctx: Ctx, tierId: string): void {
  const s = ctx.s;
  const why = tournamentReason(s, tierId);
  if (why) throw new EngineError(why);
  const t = CHESS_TIERS.find((x) => x.id === tierId) as ChessTier;
  markUsed(s, 'chess:events');
  markUsed(s, 'w:total');
  const rec: ChessRecord = (s.chess ??= {
    rating: Math.max(800, Math.min(1400, playingStrength(s) - 150)),
    best: 0,
    title: null,
    imNorms: 0,
    gmNorms: 0,
    events: 0,
    wins: 0,
    recent: [],
  });
  const me = playingStrength(s);
  // Each round: an opponent near the field's strength; strong players draw more.
  let score = 0;
  let exp = 0;
  for (let i = 0; i < ROUNDS; i++) {
    const opp = t.field + ctx.rng.int(-120, 120);
    exp += expected(rec.rating, opp);
    score += game(ctx, me, opp);
  }
  // The strongest rival in the field plays the same nine rounds; to win, outscore them.
  const rivalStrength = t.field + (t.id === 'elite' ? 70 : 250);
  let rival = 0;
  for (let i = 0; i < ROUNDS; i++)
    rival += game(ctx, rivalStrength, t.field + ctx.rng.int(-120, 120));
  // FIDE's K-factors: 40 for juniors under 2300, 10 once you have ever reached 2400, else 20.
  const k =
    s.player.age < 18 && rec.rating < 2300 ? 40 : Math.max(rec.best, rec.rating) >= 2400 ? 10 : 20;
  const change = Math.round(k * (score - exp));
  rec.rating = Math.max(100, rec.rating + change);
  rec.best = Math.max(rec.best, rec.rating);
  rec.events += 1;
  addSkill(s, 'chess', 1, 'experience');
  // Performance: what a rating that scored like this would be.
  const frac = score / ROUNDS;
  const perf = Math.round(
    t.field + 400 * Math.log10(Math.max(0.01, frac) / Math.max(0.01, 1 - frac)),
  );
  const place =
    score > rival || (score === rival && ctx.rng.chance(0.5))
      ? 'first'
      : score >= rival - 1
        ? 'in the top three'
        : score >= ROUNDS / 2
          ? 'mid-table'
          : 'near the bottom';
  if (place === 'first') rec.wins += 1;
  // International opens vary: most are modest, a few (the big Swiss events) pay four times more.
  const fund = t.id === 'international' ? (ctx.rng.chance(0.12) ? 4 : 0.5 + ctx.rng.next()) : 1;
  const prize =
    place === 'first' ? t.prize * fund : place === 'in the top three' ? t.prize * fund * 0.5 : 0;
  // Winning one of the big opens (the Grand Swiss) earns a place in the next Candidates.
  if (t.id === 'international' && fund === 4 && place === 'first') {
    rec.candQual = s.year % 2 === 0 ? s.year + 2 : s.year + 1;
    ctx.log(
      'activity',
      `🎟️ Winning the big open earns you a place in the ${rec.candQual} Candidates.`,
      true,
    );
  }
  const before = rec.rating - change;
  const fee =
    t.id === 'elite'
      ? appearanceFee(before)
      : t.id === 'international'
        ? openConditions(before)
        : 0;
  const toLocal = (ref: number): number => chessMoney(s, t, ref);
  const pay = prize ? toLocal(prize) : 0;
  const feePaid = fee ? toLocal(fee) : 0;
  s.money.cash += pay + feePaid;
  rec.recent = [...rec.recent, { year: s.year, tier: t.id, score, change, place }].slice(-6);
  const head = `♟️ ${t.label}: ${fmtScore(score)}/${ROUNDS}, finishing ${place}. Rating ${rec.rating} (${change >= 0 ? '+' : ''}${change}).${feePaid ? ` ${t.id === 'elite' ? 'Appearance fee' : 'Conditions (fee and hotel)'}: ${formatMoney(s, feePaid)}.` : ''}${pay ? ` Prize: ${formatMoney(s, pay)}.` : ''}`;
  ctx.log('activity', head, place === 'first');
  if (place === 'first') addStat(s, 'happiness', 5);
  if (t.norms && perf >= 2600) rec.gmNorms += 1;
  else if (t.norms && perf >= 2450) rec.imNorms += 1;
  if (t.norms && perf >= 2450)
    ctx.log(
      'activity',
      `📜 A ${perf >= 2600 ? 'grandmaster' : 'international master'} norm (performance ${perf}).`,
    );
  titles(ctx, rec);
}

function fmtScore(n: number): string {
  return Number.isInteger(n) ? String(n) : `${Math.floor(n)}½`;
}

/** Titles at the real thresholds: CM 2200, FM 2300, IM 2400 and three norms, GM 2500 and three. */
function titles(ctx: Ctx, rec: ChessRecord): void {
  const s = ctx.s;
  const order: ChessTitle[] = ['CM', 'FM', 'IM', 'GM'];
  const earned = (t: ChessTitle): boolean =>
    t === 'CM'
      ? rec.best >= 2200
      : t === 'FM'
        ? rec.best >= 2300
        : t === 'IM'
          ? rec.best >= 2400 && rec.imNorms + rec.gmNorms >= 3
          : rec.best >= 2500 && rec.gmNorms >= 3;
  for (const t of order) {
    const have = rec.title ? order.indexOf(rec.title) : -1;
    if (order.indexOf(t) <= have || !earned(t)) continue;
    rec.title = t;
    if (t === 'GM') {
      const def = EVENT_BY_ID['pr_chess_grandmaster'];
      if (def) fireEvent(ctx, def, 'system');
      else if (!s.player.flags.includes('chess_gm')) s.player.flags.push('chess_gm');
    } else ctx.log('activity', `🏅 You are now a ${TITLE_NAMES[t]}.`, true);
  }
}
