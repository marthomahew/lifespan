import { institutionFor, MAJOR_FIELD, type ScienceField } from '../../content/science';
import type { GameState } from '../types';
import { clampStat } from '../util';

/**
 * Science as a pursuit: a research project you push along with work time, papers that pick
 * up citations year after year, grant applications decided on your next birthday, and the
 * prizes that come to the very best. Open to anyone in a research job or doing a PhD.
 */
export type Paper = {
  year: number;
  title: string;
  venue: string;
  tier: number;
  quality: number;
  cites: number;
  breakthrough?: boolean;
};
export type Grant = {
  funder: string;
  name: string;
  kind: string;
  /** Local money a year. */
  perYear: number;
  from: number;
  years: number;
  stipend?: boolean;
};
export type ScienceRecord = {
  field: ScienceField;
  institution: string;
  /** Standing in the field, 0..100. */
  rep: number;
  project: { title: string; progress: number; quality: number; tried: number[] } | null;
  papers: Paper[];
  grants: Grant[];
  /** Applications awaiting a decision on your next birthday. */
  pending: { funder: string; name: string; year: number; odds: number }[];
  /** Rejections so far, by funder: each one makes the next proposal sharper. */
  rejected: Record<string, number>;
  prizes: string[];
  /** Your research group: PhD students and postdocs (NPC ids). */
  lab?: LabMember[];
  /** People met at conferences who now work with you: each lifts a new project's quality. */
  collaborators?: number;
  patents?: Patent[];
  /** Professors: the year tenure was granted (or denied: -year). */
  tenure?: number;
  sabbatical?: number;
};
export type LabMember = { id: number; role: 'phd' | 'postdoc'; since: number };
export type Patent = { title: string; from: number; licensed: boolean | null; royalty: number };

export const RESEARCH_JOBS = [
  'research_scientist',
  'professor',
  'chemist',
  'environmental_scientist',
  'data_scientist',
  'doctor',
];
export const RESEARCH_PIPS = 3;
export const cap = (x: string): string => x.charAt(0).toUpperCase() + x.slice(1);

/** Standing gets harder to add to the higher it is: the last few points take a career. */
export function addRep(sc: ScienceRecord, n: number): void {
  sc.rep = clampStat(
    sc.rep + Math.max(n >= 2 ? 1 : 0, Math.round(n * Math.max(0.15, 1 - sc.rep / 95))),
  );
}
export const doingPhd = (s: GameState): boolean => s.education.enrollment?.programId === 'phd';
/** Jobs (and the PhD) where research is the work itself: projects move along every year. */
const FULL_TIME = ['research_scientist', 'professor'];
export const fullTime = (s: GameState): boolean =>
  FULL_TIME.includes(s.career.jobId ?? '') || doingPhd(s);

/** Can this life do research at all, and why not. */
export function scienceOpen(s: GameState): boolean {
  if (s.death || s.legal.prison || s.player.age < 20) return false;
  return RESEARCH_JOBS.includes(s.career.jobId ?? '') || doingPhd(s);
}

export function fieldFor(s: GameState): ScienceField {
  if (s.career.jobId === 'doctor') return 'life';
  if (s.career.jobId === 'data_scientist') return 'cs';
  for (const d of [...s.education.degrees].reverse()) {
    const f = MAJOR_FIELD[d.field] ?? MAJOR_FIELD[d.level];
    if (f) return f;
  }
  return 'life';
}

export function ensure(s: GameState): ScienceRecord {
  const job = s.career.jobId ?? 'phd';
  const inst = institutionFor(s, job, s.seed >>> 0);
  if (!s.science)
    s.science = {
      field: fieldFor(s),
      institution: inst,
      // A doctorate and a senior post count for something on day one.
      rep: Math.min(
        40,
        (s.education.degrees.some((d) => d.level === 'doctorate') ? 8 : 0) +
          (RESEARCH_JOBS.includes(job) ? s.career.level * 6 : 0),
      ),
      project: null,
      papers: [],
      grants: [],
      pending: [],
      rejected: {},
      prizes: [],
    };
  if (RESEARCH_JOBS.includes(job)) s.science.institution = inst;
  return s.science;
}

export function hIndex(papers: readonly Paper[]): number {
  const c = papers.map((p) => p.cites).sort((a, b) => b - a);
  let h = 0;
  while (h < c.length && (c[h] ?? 0) >= h + 1) h++;
  return h;
}
export const citations = (papers: readonly Paper[]): number =>
  papers.reduce((t, p) => t + p.cites, 0);

export const activeGrants = (s: GameState): Grant[] =>
  (s.science?.grants ?? []).filter((g) => s.year < g.from + g.years);

/** Extra progress a pip of research makes with money and people behind it. */
export const labBoost = (s: GameState): number =>
  Math.min(30, activeGrants(s).filter((g) => !g.stipend).length * 12) +
  Math.min(24, (s.science?.lab?.length ?? 0) * 6);
