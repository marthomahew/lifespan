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
  return young * gift * quick;
}

/** Add to a skill (0..100). Positive deltas count as practice this year, at your learning rate. */
export function addSkill(s: GameState, id: string, delta: number): void {
  const cur = s.player.skills[id] ?? 0;
  const d = delta > 0 ? Math.max(1, Math.round(delta * learnRate(s, id))) : delta;
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
    if (lvl > 0 && s.year - last > 2) s.player.skills[id] = clampStat(lvl - (lvl > 60 ? 2 : 1));
  }
  const native = new Set(COUNTRY_BY_ID[s.player.country]?.languages ?? []);
  for (const [id, lvl] of Object.entries(s.player.languages)) {
    if (native.has(id) || id === COUNTRY_BY_ID[s.player.birthCountry]?.languages[0]) continue;
    const last = s.player.skillPractice[`lang:${id}`] ?? -100;
    if (lvl > 0 && s.year - last > 3) s.player.languages[id] = clampStat(lvl - 1);
  }
}
