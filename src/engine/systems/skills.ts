import type { GameState } from '../types';
import { clampStat } from '../util';
import { COUNTRY_BY_ID } from '../../content/countries';
import { GIFT_BY_ID } from '../../content/gifts';

/**
 * How fast you learn right now: children soak things up (double under 12, half as much again
 * in the teens), a gift for the skill adds half again (a prodigy's triples it), and a quick
 * study doubles everything.
 */
export function learnRate(s: GameState, skill?: string): number {
  const age = s.player.age;
  const young = age < 12 ? 2 : age < 18 ? 1.5 : 1;
  const gift =
    skill && s.player.talent === skill ? (s.player.talentLevel === 'prodigy' ? 3 : 1.5) : 1;
  const quick = (s.player.gifts ?? []).reduce((m, g) => m * (GIFT_BY_ID[g]?.learn ?? 1), 1);
  // A born athlete takes to sport, a golden ear to music.
  const lucky =
    (skill === 'athletics' && s.player.gifts?.includes('sport_luck')) ||
    ((skill === 'instrument' || skill === 'voice') && s.player.gifts?.includes('music_luck'))
      ? 1.5
      : 1;
  return young * gift * quick * lucky;
}

/**
 * How much a skill can still grow this year, from every source together. The base is 12
 * points (a gift 18, a prodigy 25, more for a quick study), and it shrinks near the top:
 * 60% from 50, a quarter from 70, a fifth from 90 (still 2–5 points a year at the very top). So the best start young and still take
 * years: a chess prodigy who starts at six reaches grandmaster strength at about twelve.
 */
export function skillYearRoom(s: GameState, id: string, freshYear = false): number {
  const cur = s.player.skills[id] ?? 0;
  const talent = s.player.talent === id ? (s.player.talentLevel === 'prodigy' ? 25 : 18) : 12;
  const quick = (s.player.gifts ?? []).reduce((m, g) => m * (GIFT_BY_ID[g]?.learn ?? 1), 1);
  const band = cur >= 90 ? 0.2 : cur >= 70 ? 0.25 : cur >= 50 ? 0.6 : 1;
  const gained = !freshYear && s.usage.year === s.year ? (s.usage.used[`sk:${id}`] ?? 0) : 0;
  return Math.max(0, talent * quick * band - gained);
}

/** Add to a skill (0..100). Positive deltas count as practice this year, at your learning rate. */
export function addSkill(s: GameState, id: string, delta: number): void {
  const cur = s.player.skills[id] ?? 0;
  // The top is hard: above 80 gains shrink, and above 90 a small one can round to nothing.
  // 100 is the best in the world.
  const slow = cur >= 90 ? 0.35 : cur >= 80 ? 0.6 : 1;
  const raw = delta * learnRate(s, id) * slow;
  // Practice always counts for something; the yearly room below sets how much.
  let d = delta > 0 ? Math.max(1, Math.round(raw)) : delta;
  if (d > 0) {
    // However many sources pile in (focus, practice, tournaments), a year only holds so much.
    d = Math.min(d, Math.floor(skillYearRoom(s, id)));
    if (s.usage.year !== s.year) s.usage = { year: s.year, used: {} };
    s.usage.used[`sk:${id}`] = (s.usage.used[`sk:${id}`] ?? 0) + d;
  }
  s.player.skills[id] = clampStat(cur + d);
  if (delta > 0) s.player.skillPractice[id] = s.year;
}

/** Add to a language (0..100), at your learning rate; it counts as practice. */
export function addLanguage(s: GameState, id: string, delta: number): void {
  const cur = s.player.languages[id] ?? 0;
  s.player.languages[id] = clampStat(cur + Math.max(1, Math.round(delta * learnRate(s))));
  s.player.skillPractice[`lang:${id}`] = s.year;
}

/** Skills decay slowly without practice (SPEC §5.12); foreign languages fade too. */
export function skillDecay(s: GameState): void {
  for (const [id, lvl] of Object.entries(s.player.skills)) {
    const last = s.player.skillPractice[id] ?? -100;
    // Rust is slow, and the young don't rust at all: from 30, after four idle years, a point a year.
    if (lvl > 0 && s.player.age >= 30 && s.year - last > 4)
      s.player.skills[id] = clampStat(lvl - 1);
  }
  const native = new Set(COUNTRY_BY_ID[s.player.country]?.languages ?? []);
  for (const [id, lvl] of Object.entries(s.player.languages)) {
    if (native.has(id) || id === COUNTRY_BY_ID[s.player.birthCountry]?.languages[0]) continue;
    const last = s.player.skillPractice[`lang:${id}`] ?? -100;
    if (lvl > 0 && s.year - last > 3) s.player.languages[id] = clampStat(lvl - 1);
  }
}
