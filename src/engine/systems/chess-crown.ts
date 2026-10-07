import type { Ctx } from '../ctx';
import { countryOf, formatMoney } from '../economy';
import { EngineError } from '../errors';
import { addStat } from '../stats';
import type { GameState } from '../types';
import { workTime } from './activities';
import { addSkill } from './skills';
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
    pay: 'Eight players, fourteen rounds: about $52,000 to the winner plus $3,800 a half-point, and a shot at the world title.',
  },
  {
    id: 'title',
    label: 'World Championship match',
    pay: 'Fourteen games for $2.5 million: $200,000 for each game won, the rest shared.',
  },
];

const usd = (s: GameState, ref: number): number =>
  Math.round(ref * s.inflation * countryOf(s).currency.perUsd);

/** World champion now: you won the title and nobody has beaten you in a match since. */
export function isChampion(s: GameState): boolean {
  const rec = s.chess;
  const last = rec?.crowns?.at(-1);
  return last !== undefined && !(rec?.dethroned !== undefined && rec.dethroned >= last);
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
    if (champ && rec?.majors?.some((m) => m.id === 'title' && m.year === s.year))
      return 'already decided this year';
  }
  if (usedThisYear(s, 'chess:events') >= PER_YEAR) return `${PER_YEAR} tournaments a year`;
  if (s.settings.freeTime !== false && workTime(s).left <= 0) return 'no work time left this year';
  return null;
}

/** A best-of-two (or longer) match decided in rapid tiebreaks: did you win it? */
function match(
  ctx: Ctx,
  me: number,
  opp: number,
  games: number,
): { won: boolean; score: number; wins: number; losses: number; tiebreak: boolean } {
  let score = 0;
  let wins = 0;
  let losses = 0;
  for (let i = 0; i < games; i++) {
    const g = game(ctx, me, opp);
    score += g;
    if (g === 1) wins++;
    else if (g === 0) losses++;
  }
  if (score !== games / 2) return { won: score > games / 2, score, wins, losses, tiebreak: false };
  // Rapid tiebreaks: the best classical players are usually the best at rapid too.
  return { won: ctx.rng.chance(expected(me, opp)), score, wins, losses, tiebreak: true };
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
  markUsed(s, 'w:total');
  rec.events += 1;
  // Top-level chess is the best practice there is.
  addSkill(s, 'chess', 1, 'experience');
  s.player.skillPractice['chess'] = s.year;
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
    // The top seed's path: weaker opponents early, the elite from the quarter-finals.
    const ladder = [2380, 2480, 2560, 2620, 2670, 2700, 2730, 2750];
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
      const semi = match(ctx, me, ladder[6] ?? 2730, 2).won;
      const last = match(ctx, me, ladder[7] ?? 2750, 2).won;
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
      const opp = 2750 + ctx.rng.int(-30, 30);
      score += game(ctx, me, opp);
      exp += expected(rec.rating, opp);
      rival += game(ctx, 2780, 2750 + ctx.rng.int(-30, 30));
    }
    const won = score > rival || (score === rival && ctx.rng.chance(0.5));
    // 2024 terms: €48k / €36k / €24k for the top three, plus €3,500 a half-point for everyone.
    const place = won ? 52000 : score >= rival - 1 ? 39000 : score >= rival - 2 ? 26000 : 0;
    prize = place + score * 2 * 3800;
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
    const opp = champ ? 2785 : 2800;
    const m = match(ctx, me, opp, 14);
    rate(rec, m.score, 14 * expected(rec.rating, opp));
    // 2024 terms: $200k per game won, the rest of $2.5M split evenly; a tiebreak is 1.3M / 1.2M.
    prize = m.tiebreak
      ? m.won
        ? 1300000
        : 1200000
      : 200000 * m.wins + (2500000 - 200000 * (m.wins + m.losses)) / 2;
    if (m.won) rec.crowns = [...(rec.crowns ?? []), s.year];
    else if (champ) rec.dethroned = s.year;
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
