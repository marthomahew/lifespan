import { SKILL_BY_ID } from '../../content/skills';
import type { ActivityDef } from '../../content/types';
import type { GameState } from '../types';
import { learnRate } from './skills';

const STAT_ICON: Record<string, string> = {
  happiness: '😊',
  health: '❤️',
  smarts: '🧠',
  looks: '✨',
  stress: '😣',
  discipline: '🎯',
  karma: '☯️',
};

const range = (lo: number, hi: number): string => {
  const f = (n: number): string => (n > 0 ? `+${n}` : `${n}`);
  if (lo === hi) return f(lo);
  if (lo === 0) return `up to ${f(hi)}`;
  if (hi === 0) return `down to ${f(lo)}`;
  return `${f(lo)} to ${f(hi)}`;
};

/**
 * What an activity is likely to do, before you pick it: the range of each stat and skill
 * change across its outcomes (at your learning rate), and the odds it goes well.
 */
export function activityPreview(s: GameState, def: ActivityDef): string {
  const span: Record<string, [number, number]> = {};
  const add = (key: string, d: number): void => {
    const cur = span[key];
    span[key] = cur ? [Math.min(cur[0], d), Math.max(cur[1], d)] : [d, d];
  };
  const total = def.outcomes.reduce((t, o) => t + (typeof o.chance === 'number' ? o.chance : 0), 0);
  for (const o of def.outcomes) {
    const seen = new Set<string>();
    for (const e of o.effects) {
      if ('stat' in e && 'delta' in e && !('npcStat' in e)) {
        add(e.stat, e.delta);
        seen.add(e.stat);
      } else if ('skill' in e) {
        add(`skill:${e.skill}`, Math.max(1, Math.round(e.delta * learnRate(s, e.skill))));
        seen.add(`skill:${e.skill}`);
      }
    }
    // An outcome that leaves a stat alone counts as 0 for that stat's range.
    for (const k of Object.keys(span)) if (!seen.has(k)) add(k, 0);
  }
  const parts = Object.entries(span)
    .filter(([, [lo, hi]]) => lo !== 0 || hi !== 0)
    .map(([k, [lo, hi]]) => {
      if (k.startsWith('skill:')) {
        const sk = SKILL_BY_ID[k.slice(6)];
        return `${sk?.emoji ?? ''} ${sk?.label ?? k.slice(6)} ${range(lo, hi)}`;
      }
      return `${STAT_ICON[k] ?? ''} ${range(lo, hi)}`;
    });
  // Activities whose effect is their own system say what it is.
  if (def.special === 'practice') {
    parts.push(
      `🎯 the skill you pick: about +${Math.max(1, Math.round(8 * learnRate(s)))} (less as you improve)`,
    );
  } else if (def.special === 'language') {
    parts.push(`🗣️ the language you pick: about +${Math.max(2, Math.round(12 * learnRate(s)))}`);
  } else if (def.special === 'club') parts.push('the club’s skill +1 to +4, maybe a friend');
  else if (def.special === 'chess') parts.push('♟️ prize money if you win');
  const good = def.outcomes.reduce(
    (t, o) => t + (o.success && typeof o.chance === 'number' ? o.chance : 0),
    0,
  );
  const odds =
    total > 0 && good > 0
      ? ` · goes well about ${Math.round((100 * good) / total)}% of the time`
      : '';
  return parts.length ? `${parts.join(' · ')}${odds}` : '';
}
