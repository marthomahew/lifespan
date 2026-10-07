import { SKILL_BY_ID } from '../../content/skills';
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
  const young = age < 12 ? 1.5 : age < 18 ? 1.25 : 1;
  const gift =
    skill && s.player.talent === skill ? (s.player.talentLevel === 'prodigy' ? 2.5 : 1.5) : 1;
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
 * How much one session is worth at your level: everything counts, but the top is slow.
 * Full value below 30, then 35% from 30, 20% from 50, 12% from 70, 10% from 85, 9% from 90
 * and 7% from 95: near the top a few sessions still move you a point, just not many.
 */
export function levelFactor(cur: number): number {
  return cur >= 95
    ? 0.07
    : cur >= 90
      ? 0.09
      : cur >= 85
        ? 0.1
        : cur >= 70
          ? 0.12
          : cur >= 50
            ? 0.2
            : cur >= 30
              ? 0.35
              : 1;
}

/**
 * Where a gain comes from: study and practice (at your learning rate), your focus (the same),
 * or plain experience from competing (a point or two, however young or gifted you are).
 */
export type SkillPool = 'focus' | 'practice' | 'experience';

/** Add to a skill (0..100). There's no yearly limit: more practice is always more skill. */
export function addSkill(
  s: GameState,
  id: string,
  delta: number,
  pool: SkillPool = 'practice',
): void {
  const cur = s.player.skills[id] ?? 0;
  if (delta <= 0) {
    s.player.skills[id] = clampStat(cur + delta);
    return;
  }
  // Competing teaches a little whatever your age; study and practice go at your learning rate.
  const rate = pool === 'experience' ? 1 : learnRate(s, id);
  // Gains add up exactly, fractions included: near the top a session moves you part of a point.
  const frac = (s.player.skillFrac ??= {});
  const total = (frac[id] ?? 0) + delta * rate * levelFactor(cur);
  const whole = Math.floor(total);
  frac[id] = total - whole;
  s.player.skills[id] = clampStat(cur + whole);
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
  const age = s.player.age;
  for (const [id, lvl] of Object.entries(s.player.skills)) {
    const last = s.player.skillPractice[id] ?? -100;
    // Rust is slow, and the young don't rust at all: from 30, after four idle years, a point a year.
    let loss = lvl > 0 && age >= 30 && s.year - last > 4 ? 1 : 0;
    // Age itself: athletes slow in their thirties; cooks and writers hold on into old age.
    const decline = SKILL_BY_ID[id]?.ageDecline;
    if (decline && age >= decline.from && lvl > 0) {
      const practised = s.year - last <= 1;
      const frac = (s.player.skillFrac ??= {});
      const key = `age:${id}`;
      const total =
        (frac[key] ?? 0) + decline.rate * (practised ? 0.5 : 1) * (1 + (age - decline.from) / 20);
      const whole = Math.floor(total);
      frac[key] = total - whole;
      loss += whole;
    }
    if (loss > 0) s.player.skills[id] = clampStat(lvl - loss);
  }
  if (s.settings.languageDecay === false) return;
  const native = new Set(COUNTRY_BY_ID[s.player.country]?.languages ?? []);
  for (const [id, lvl] of Object.entries(s.player.languages)) {
    if (native.has(id) || id === COUNTRY_BY_ID[s.player.birthCountry]?.languages[0]) continue;
    const last = s.player.skillPractice[`lang:${id}`] ?? -100;
    // Fluency stays with you, and nobody under 30 loses a language they once learned.
    if (lvl >= 80 || s.player.age < 30) continue;
    if (lvl > 0 && s.year - last > 4) s.player.languages[id] = clampStat(lvl - 1);
  }
}
