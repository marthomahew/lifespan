import type { JobDef } from '../../content/types';
import { money } from '../economy';
import type { GameState } from '../types';
import { clampOdds } from './odds';
import { interviewOdds, jobListings } from './careers';

/** A rung on a job's ladder: the title and its pay band, in local money. */
export type Rung = { title: string; low: number; high: number };

export type BoardRow = {
  job: JobDef;
  unmet: string[];
  current: boolean;
  /** What the first rung pays, middle of the band. */
  start: number;
  /** What the top rung can pay, top of the band. */
  top: number;
  topTitle: string;
  ladder: Rung[];
  /** Interview odds, when you could apply now. */
  odds: number | null;
  /** How well your life fits it: higher is better (degree, skills, odds). */
  fit: number;
};

export type BoardSort = 'fit' | 'start' | 'top';

/** The job board: every listing with its pay ladder, its ceiling, your odds and your fit. */
export function jobBoard(s: GameState): BoardRow[] {
  return jobListings(s).map((l) => {
    const ladder = l.job.titles.map((title, i) => {
      const [lo, hi] = l.job.salary[i] ?? [0, 0];
      return { title, low: money(s, lo, 'wage'), high: money(s, hi, 'wage') };
    });
    const last = ladder.at(-1);
    const odds = l.unmet.length ? null : clampOdds(interviewOdds(s, l.job));
    const r = l.job.req;
    const majorFit = r.majors?.length
      ? s.education.degrees.some((d) => r.majors?.includes(d.field))
      : false;
    const skillFit = Object.entries(r.skills ?? {}).reduce(
      (t, [k, v]) => t + Math.min(1, (s.player.skills[k] ?? 0) / Math.max(1, v)),
      0,
    );
    const fit =
      (odds ?? 0) * 3 + (majorFit ? 2 : 0) + skillFit - l.unmet.length * 1.5 + (l.current ? 5 : 0);
    return {
      job: l.job,
      unmet: l.unmet,
      current: l.current,
      start: l.salary,
      top: last?.high ?? l.salary,
      topTitle: last?.title ?? '',
      ladder,
      odds,
      fit,
    };
  });
}

export function sortBoard(rows: BoardRow[], by: BoardSort): BoardRow[] {
  const key = (r: BoardRow): number => (by === 'start' ? r.start : by === 'top' ? r.top : r.fit);
  return [...rows].sort((a, b) => key(b) - key(a));
}
