import { LANGUAGE_BY_ID, SKILL_BY_ID } from '../../content/skills';
import type { Ctx } from '../ctx';
import { EngineError } from '../errors';
import type { GameState } from '../types';
import { addLanguage, addSkill, learnRate } from './skills';

/**
 * A focus: the thing you give your free time to, year after year. Worth about three
 * practice sessions a year (at your learning rate), for two pips of free time.
 */
export const FOCUS_COST = 2;
const SESSIONS = 3;
/** The most a focus can add in a year: hard work, a gift, or a prodigy's gift. */
export function yearCap(s: GameState, skill: string): number {
  // Languages aren't gifts: steady work gets you fluent in five years or so.
  if (skill.startsWith('lang:')) return 20;
  if (s.player.talent !== skill) return 12;
  return s.player.talentLevel === 'prodigy' ? 25 : 18;
}

export type FocusOption = { id: string; label: string; level: number };

export function focusLabel(id: string): string {
  if (id.startsWith('lang:')) return LANGUAGE_BY_ID[id.slice(5)]?.label ?? id.slice(5);
  // Mid-sentence: "your free time goes to chess" (languages keep their capital).
  return (SKILL_BY_ID[id]?.label ?? id).toLowerCase();
}

export function focusLevel(s: GameState, id: string): number {
  return id.startsWith('lang:')
    ? (s.player.languages[id.slice(5)] ?? 0)
    : (s.player.skills[id] ?? 0);
}

/** Everything you could devote yourself to: every skill, and every language not yet fluent. */
export function focusOptions(s: GameState): FocusOption[] {
  const skills = Object.values(SKILL_BY_ID).map((k) => ({
    id: k.id,
    label: `${k.emoji} ${k.label}`,
    level: s.player.skills[k.id] ?? 0,
  }));
  const langs = Object.values(LANGUAGE_BY_ID)
    .filter((l) => (s.player.languages[l.id] ?? 0) < 100 || s.player.focus === `lang:${l.id}`)
    .map((l) => ({
      id: `lang:${l.id}`,
      label: `🗣️ ${l.label}`,
      level: s.player.languages[l.id] ?? 0,
    }));
  return [...skills, ...langs];
}

export function focusReason(s: GameState): string | null {
  if (s.death) return 'the life is over';
  if (s.player.age < 4) return 'from age 4';
  return null;
}

/** Choose a focus (or none). */
export function setFocus(ctx: Ctx, target: string | null): void {
  const s = ctx.s;
  if (target === null) {
    if (s.player.focus)
      ctx.log('activity', `🎯 You stop focusing on ${focusLabel(s.player.focus)}.`);
    s.player.focus = null;
    return;
  }
  const why = focusReason(s);
  if (why) throw new EngineError(why);
  if (!focusOptions(s).some((o) => o.id === target)) throw new EngineError('nothing to focus on');
  s.player.focus = target;
  ctx.log('activity', `🎯 From now on, your free time goes to ${focusLabel(target)}.`);
}

/** The year's devoted practice, on your birthday. Prison pauses it. */
export function focusTick(ctx: Ctx): void {
  const s = ctx.s;
  const f = s.player.focus;
  if (!f || s.death || s.legal.prison || s.player.age < 4) return;
  const before = focusLevel(s, f);
  const label = focusLabel(f);
  const mastered = (): void => {
    if (s.player.flags.includes(`mastered:${f}`)) return;
    s.player.flags.push(`mastered:${f}`);
    ctx.log('activity', `🏆 Years devoted to ${label}, and you have mastered it: 100/100.`, true);
  };
  // Mastered: the hours now keep it there.
  if (before >= 100) {
    s.player.skillPractice[f] = s.year;
    mastered();
    return;
  }
  for (let i = 0; i < SESSIONS; i++) {
    const cur = focusLevel(s, f);
    if (cur >= 100) break;
    if (f.startsWith('lang:')) addLanguage(s, f.slice(5), Math.max(2, Math.round((100 - cur) / 8)));
    else addSkill(s, f, Math.max(1, Math.round((100 - cur) / 12)));
  }
  // Even a prodigy needs a few years.
  const after = Math.min(focusLevel(s, f), before + yearCap(s, f));
  if (f.startsWith('lang:')) s.player.languages[f.slice(5)] = after;
  else s.player.skills[f] = after;
  if (after >= 100) mastered();
  else ctx.log('activity', `🎯 A year devoted to ${label}: ${before} → ${after}.`);
}

/** About how much a year of this focus would add now (your age, your gift, the cap). */
export function focusForecast(s: GameState, id: string): number {
  const lang = id.startsWith('lang:');
  const rate = learnRate(s, lang ? undefined : id);
  const start = focusLevel(s, id);
  let cur = start;
  for (let i = 0; i < SESSIONS && cur < 100; i++) {
    // The same steps the year itself takes (focusTick, then addSkill's learning rate).
    const g = lang
      ? Math.max(2, Math.round((100 - cur) / 8))
      : Math.max(1, Math.round((100 - cur) / 12));
    cur = Math.min(100, cur + Math.max(1, Math.round(g * rate)));
  }
  return Math.min(cur, start + yearCap(s, id)) - start;
}
