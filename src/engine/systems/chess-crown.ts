import type { Ctx } from '../ctx';
import { countryOf, formatMoney } from '../economy';
import { EngineError } from '../errors';
import { addStat } from '../stats';
import type { GameState } from '../types';
import { freeTime } from './activities';
import { PER_YEAR, chessOf, expected, game, playingStrength, type ChessRecord } from './chess';
import { markUsed, usedThisYear } from './usage';

/**
 * The world title cycle, above the invitationals: the World Rapid & Blitz every year, the
 * World Cup in odd years (its podium qualifies for the Candidates), the Candidates in even
 * years, and the title match that follows. Money in today's dollars, at real levels.
 */
export type MajorId = 'rapid' | 'worldcup' | 'candidates' | 'title';
export type Major = { id: MajorId; label: string; pay: string };
export const MAJORS: Major[] = [
  { id: 'rapid', label: 'World Rapid & Blitz', pay: 'About $60,000 to the winner.' },
  {
    id: 'worldcup',
    label: 'The World Cup',
    pay: 'A knockout of 128: about $110,000 to the winner, and the podium goes to the Candidates.',
  },
  {
    id: 'candidates',
    label: 'The Candidates',
    pay: 'Eight players, fourteen rounds: the winner challenges for the world title.',
  },
  {
    id: 'title',
    label: 'World Championship match',
    pay: 'Fourteen games for a fund of about $2.5 million: 60% to the winner.',
  },
];

const usd = (s: GameState, ref: number): number =>
  Math.round(ref * s.inflation * countryOf(s).currency.perUsd);

/** World champion now: you won or defended the title within the last two years. */
export function isChampion(s: GameState): boolean {
  const last = s.chess?.crowns?.at(-1);
  return last !== undefined && s.year - last <= 2;
}

const playedThisYear = (rec: ChessRecord | null, id: string, year: number): boolean =>
  (rec?.majors ?? []).some((m) => m.id === id && m.year === year);

/** Why you can't play this major now, or null. */
export function majorReason(s: GameState, id: MajorId): string | null {
  if (s.death) return 'the life is over';
  if (s.legal.prison) return 'not from prison';
  const rec = chessOf(s);
  const rating = rec?.rating ?? 0;
  if (playedThisYear(rec, id, s.year)) return 'once a year';
  if (id === 'rapid') {
    if (s.year < 2012) return 'from 2012';
    if (rating < 2500) return 'needs a rating of 2500';
  } else if (id === 'worldcup') {
    if (s.year < 2005 || s.year % 2 === 0) return 'odd years only';
    if (rating < 2600) return 'needs a rating of 2600';
  } else if (id === 'candidates') {
    if (s.year % 2 !== 0) return 'even years only';
    if (isChampion(s)) return 'the champion waits for the winner';
    const qualified = rec?.candQual === s.year || rating >= 2780;
    if (!qualified) return 'qualify via the World Cup podium, a big open, or a 2780 rating';
  } else {
    if (s.year % 2 !== 0) return 'even years only';
    const champ = isChampion(s);
    if (!champ && rec?.challenger !== s.year) return 'win the Candidates first';
    if (champ && rec?.crowns?.at(-1) === s.year) return 'already decided this year';
  }
  if (usedThisYear(s, 'chess:events') >= PER_YEAR) return `${PER_YEAR} tournaments a year`;
  if (s.settings.freeTime !== false && freeTime(s).left <= 0) return 'no free time left this year';
  return null;
}

/** A best-of-two (or longer) match decided in rapid tiebreaks: did you win it? */
function match(ctx: Ctx, me: number, opp: number, games: number): { won: boolean; score: number } {
  let score = 0;
  for (let i = 0; i < games; i++) score += game(ctx, me, opp);
  if (score !== games / 2) return { won: score > games / 2, score };
  // Rapid tiebreaks: quicker chess, so the gap counts for a little less.
  return { won: ctx.rng.chance(expected(me * 0.8 + 520, opp * 0.8 + 520)), score };
}

function rate(rec: ChessRecord, score: number, exp: number): number {
  const change = Math.round(10 * (score - exp));
  rec.rating = Math.max(100, rec.rating + change);
  rec.best = Math.max(rec.best, rec.rating);
  return change;
}

/** Play one of the majors. */
export function playMajor(ctx: Ctx, id: MajorId): void {
  const s = ctx.s;
  const why = majorReason(s, id);
  if (why) throw new EngineError(why);
  const rec = s.chess as ChessRecord;
  markUsed(s, 'chess:events');
  markUsed(s, 'a:total');
  rec.events += 1;
  const me = playingStrength(s);
  let result: string;
  let prize: number;
  if (id === 'rapid') {
    // Faster chess: more upsets, so every gap is squeezed.
    const fast = (r: number): number => r * 0.7 + 800;
    let score = 0;
    let rival = 0;
    let exp = 0;
    for (let i = 0; i < 13; i++) {
      const opp = 2650 + ctx.rng.int(-80, 80);
      score += game(ctx, fast(me), fast(opp));
      exp += expected(rec.rating, opp);
      rival += game(ctx, fast(2790), fast(opp));
    }
    const first = score > rival || (score === rival && ctx.rng.chance(0.5));
    prize = first ? 60000 : score >= rival - 1 ? 25000 : 0;
    const change = rate(rec, score, exp);
    result = first
      ? 'world rapid champion'
      : score >= rival - 1
        ? 'on the podium'
        : 'outside the prizes';
    ctx.log(
      'activity',
      `⚡ World Rapid & Blitz: ${result} (rating ${rec.rating}, ${change >= 0 ? '+' : ''}${change}).`,
      first,
    );
    if (first) addStat(s, 'fame', 3);
  } else if (id === 'worldcup') {
    const ladder = [2450, 2550, 2620, 2670, 2700, 2730, 2750, 2770];
    const prizes = [6000, 10000, 16000, 25000, 35000];
    let round = 0;
    let score = 0;
    let exp = 0;
    for (; round < 6; round++) {
      const opp = ladder[round] ?? 2700;
      const m = match(ctx, me, opp, 2);
      score += m.score;
      exp += 2 * expected(rec.rating, opp);
      if (!m.won) break;
    }
    if (round < 6) {
      prize = prizes[Math.min(round, 4)] ?? 6000;
      result = round >= 4 ? 'out in the quarter-finals' : `out in round ${round + 1}`;
    } else {
      // The final four: a semi-final, then the final or the match for third.
      const semi = match(ctx, me, ladder[6] ?? 2750, 2).won;
      const last = match(ctx, me, ladder[7] ?? 2770, 2).won;
      result = semi ? (last ? 'World Cup winner' : 'runner-up') : last ? 'third' : 'fourth';
      prize = semi ? (last ? 110000 : 80000) : last ? 60000 : 50000;
      if (result !== 'fourth') {
        rec.candQual = s.year + 1;
        result += `, qualified for the ${s.year + 1} Candidates`;
      }
    }
    const change = rate(rec, score, exp);
    ctx.log(
      'activity',
      `🏆 The World Cup: ${result} (rating ${rec.rating}, ${change >= 0 ? '+' : ''}${change}).`,
      prize >= 60000,
    );
    if (prize >= 60000) addStat(s, 'fame', 4);
  } else if (id === 'candidates') {
    let score = 0;
    let exp = 0;
    let rival = 0;
    for (let i = 0; i < 14; i++) {
      const opp = 2760 + ctx.rng.int(-30, 30);
      score += game(ctx, me, opp);
      exp += expected(rec.rating, opp);
      rival += game(ctx, 2790, 2760 + ctx.rng.int(-30, 30));
    }
    const won = score > rival || (score === rival && ctx.rng.chance(0.5));
    prize = won ? 55000 : score >= rival - 1 ? 40000 : 15000;
    const change = rate(rec, score, exp);
    if (won) rec.challenger = s.year;
    result = won ? 'winner: challenger for the world title' : `${score}/14, not enough`;
    ctx.log(
      'activity',
      `👑 The Candidates: ${result} (rating ${rec.rating}, ${change >= 0 ? '+' : ''}${change}).`,
      won,
    );
    if (won) addStat(s, 'fame', 6);
  } else {
    const champ = isChampion(s);
    // The reigning champion is the best in the world; a challenger is the next best.
    const opp = champ ? 2785 : 2830;
    const m = match(ctx, me, opp, 14);
    rate(rec, m.score, 14 * expected(rec.rating, opp));
    prize = m.won ? 1500000 : 1000000;
    if (m.won) rec.crowns = [...(rec.crowns ?? []), s.year];
    result = m.won
      ? champ
        ? 'title defended'
        : 'world champion'
      : champ
        ? 'title lost'
        : 'lost the match';
    ctx.log(
      'activity',
      m.won
        ? champ
          ? `👑 You defend the world title, ${m.score}–${14 - m.score}${m.score === 7 ? ' and the tiebreaks' : ''}.`
          : `👑 You are the world chess champion, ${m.score}–${14 - m.score}${m.score === 7 ? ' after the tiebreaks' : ''}.`
        : `The world title match ends ${m.score}–${14 - m.score}${m.score === 7 ? ' and is lost in the tiebreaks' : ''}.`,
      true,
    );
    addStat(s, 'fame', m.won ? 15 : 5);
    addStat(s, 'happiness', m.won ? 15 : -8);
  }
  const pay = prize ? usd(s, prize) : 0;
  s.money.cash += pay;
  if (pay) ctx.log('money', `Prize money: ${formatMoney(s, pay)}.`);
  rec.majors = [...(rec.majors ?? []), { year: s.year, id, result }].slice(-12);
}
