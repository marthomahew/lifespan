import { netWorthRef } from '../../engine/networth';
import type { GameState } from '../../engine';

/** The best of every life you've lived on this machine (kept beside the settings). */
export type RecordMark = { value: number; who: string };
export type Records = {
  lives: number;
  oldest?: RecordMark;
  richest?: RecordMark;
  mostChildren?: RecordMark;
  mostAchievements?: RecordMark;
};

const KEY = 'lifespan.records';

export function loadRecords(): Records {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Records>;
    return { ...v, lives: typeof v.lives === 'number' ? v.lives : 0 };
  } catch {
    return { lives: 0 };
  }
}

/** Fold a finished life into the records. */
export function recordLife(g: GameState): Records {
  const r = loadRecords();
  const who = `${g.player.first} ${g.player.last}`;
  const better = (cur: RecordMark | undefined, value: number): RecordMark | undefined =>
    !cur || value > cur.value ? { value, who } : cur;
  const kids = g.npcs.filter((n) => n.roles.includes('child')).length;
  const next: Records = {
    lives: r.lives + 1,
    oldest: better(r.oldest, g.player.age),
    richest: better(r.richest, Math.round(netWorthRef(g))),
    mostChildren: kids > 0 ? better(r.mostChildren, kids) : r.mostChildren,
    mostAchievements: better(r.mostAchievements, g.player.achievements.length),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable: records simply aren't kept.
  }
  return next;
}
