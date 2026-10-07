import { EVENT_BY_ID } from '../../content/events';
import type { Ctx } from '../ctx';
import { formatMoney, money } from '../economy';
import { EngineError } from '../errors';
import { fireEvent } from '../events/select';
import { addStat } from '../stats';
import type { GameState } from '../types';
import { addSkill } from './skills';
import { freeTime } from './activities';
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
  prize: number;
  /** Strong enough fields count toward norms. */
  norms: boolean;
};
export const CHESS_TIERS: ChessTier[] = [
  { id: 'local', label: 'A weekend congress', field: 1250, minRating: 0, prize: 300, norms: false },
  {
    id: 'national',
    label: 'The national open',
    field: 1850,
    minRating: 1500,
    prize: 3000,
    norms: false,
  },
  {
    id: 'international',
    label: 'An international open',
    field: 2350,
    minRating: 2050,
    prize: 12000,
    norms: true,
  },
  {
    id: 'elite',
    label: 'An elite invitational',
    field: 2700,
    minRating: 2600,
    prize: 80000,
    norms: true,
  },
];
const ROUNDS = 9;
const PER_YEAR = 3;

export const chessOf = (s: GameState): ChessRecord | null => s.chess ?? null;

/** How strong you play today: your skill (100 is world-class, about 2700), your age (sharpest at 20–45), and a charmed life. */
export function playingStrength(s: GameState): number {
  const skill = s.player.skills['chess'] ?? 0;
  const age = s.player.age;
  const ageMod = age < 12 ? -(12 - age) * 25 : age > 45 ? -(age - 45) * 8 : 0;
  // A charmed life plays a little above itself.
  return Math.round(600 + skill * 21 + ageMod + 40 * charmed(s));
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
  if (s.settings.freeTime !== false && freeTime(s).left <= 0) return 'no free time left this year';
  return null;
}

const expected = (me: number, them: number): number => 1 / (1 + 10 ** ((them - me) / 400));

/** Play a tournament: nine rounds against the field, rating, norms, titles, and a prize. */
export function playTournament(ctx: Ctx, tierId: string): void {
  const s = ctx.s;
  const why = tournamentReason(s, tierId);
  if (why) throw new EngineError(why);
  const t = CHESS_TIERS.find((x) => x.id === tierId) as ChessTier;
  markUsed(s, 'chess:events');
  markUsed(s, 'a:total');
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
    const e = expected(me, opp);
    exp += expected(rec.rating, opp);
    const draw = Math.min(0.55, 0.15 + Math.min(me, opp) / 6000);
    const r = ctx.rng.next();
    const winP = Math.max(0, e - draw / 2);
    score += r < winP ? 1 : r < winP + draw ? 0.5 : 0;
  }
  const k = rec.rating < 2300 ? (s.player.age < 18 ? 40 : 20) : 10;
  const change = Math.round(k * (score - exp));
  rec.rating = Math.max(100, rec.rating + change);
  rec.best = Math.max(rec.best, rec.rating);
  rec.events += 1;
  addSkill(s, 'chess', 2);
  // Performance: what a rating that scored like this would be.
  const frac = score / ROUNDS;
  const perf = Math.round(
    t.field + 400 * Math.log10(Math.max(0.01, frac) / Math.max(0.01, 1 - frac)),
  );
  const place =
    score >= 7.5
      ? 'first'
      : score >= 6.5
        ? 'in the top three'
        : score >= 4.5
          ? 'mid-table'
          : 'near the bottom';
  if (place === 'first') rec.wins += 1;
  const prize =
    place === 'first' ? t.prize : place === 'in the top three' ? Math.round(t.prize * 0.35) : 0;
  const pay = prize ? money(s, prize, 'wage') : 0;
  s.money.cash += pay;
  rec.recent = [...rec.recent, { year: s.year, tier: t.id, score, change, place }].slice(-6);
  const head = `♟️ ${t.label}: ${fmtScore(score)}/${ROUNDS}, finishing ${place}. Rating ${rec.rating} (${change >= 0 ? '+' : ''}${change}).${pay ? ` Prize: ${formatMoney(s, pay)}.` : ''}`;
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
