import { inRecession } from './markets';
import { JOBS } from '../../content/jobs';
import { SPECIALTY_BY_ID } from '../../content/military';
import type { EducationLevel, JobDef } from '../../content/types';
import { money } from '../economy';
import type { GameState } from '../types';
import { luck } from './luck';
import { clampOdds, playerOdds } from './odds';
import { speaksLocal } from './emigration';

/** Who can apply for what, and how an interview is likely to go (SPEC §5.3). */
const RANK: Record<EducationLevel, number> = {
  none: 0,
  high_school: 1,
  associate: 2,
  bachelor: 3,
  master: 4,
  mba: 5,
  law: 5,
  medicine: 5,
  doctorate: 5,
};

export function hasEducation(s: GameState, need: EducationLevel, majors?: string[]): boolean {
  const degs = s.education.degrees;
  const ok = (lvl: string): boolean => {
    if (need === 'none') return true;
    if (['law', 'medicine', 'mba', 'doctorate'].includes(need)) return lvl === need;
    if (need === 'master') return ['master', 'mba', 'doctorate'].includes(lvl);
    return (RANK[lvl as EducationLevel] ?? 0) >= RANK[need];
  };
  // Level and major must be satisfied by the same degree.
  const needsMajor = Boolean(majors?.length) && RANK[need] >= 2;
  if (needsMajor && RANK[need] >= 5)
    return degs.some((d) => ok(d.level)) && degs.some((d) => (majors ?? []).includes(d.field));
  return degs.some((d) => ok(d.level) && (!needsMajor || (majors ?? []).includes(d.field)));
}

export const hasAdultRecord = (s: GameState): boolean =>
  s.legal.record.some((r) => !r.juvenile && (r.verdict === 'convicted' || r.verdict === 'plea'));
/** A juvenile record counts against you until it is sealed at 18. */
export const hasOpenJuvenileRecord = (s: GameState): boolean =>
  !s.legal.sealed &&
  s.legal.record.some((r) => r.juvenile && (r.verdict === 'convicted' || r.verdict === 'plea'));
export const isVeteran = (s: GameState): boolean =>
  s.military !== null &&
  !s.military.active &&
  (s.military.discharge === 'honorable' || s.military.discharge === 'general');

/** Requirements the player doesn't meet for a job (empty = eligible). */
export function unmetRequirements(s: GameState, job: JobDef): string[] {
  const r = job.req;
  const p = s.player;
  const out: string[] = [];
  const vet = isVeteran(s) && r.veteranBonus;
  if (s.legal.fugitive && !p.flags.includes('false_papers'))
    out.push('papers you cannot show while on the run');
  if (job.fromYear && s.year < job.fromYear)
    out.push(`a job that won’t exist until about ${job.fromYear}`);
  if (p.age < r.minAge) out.push(`age ${r.minAge}+`);
  if (r.education && !vet && !hasEducation(s, r.education, r.majors))
    out.push(
      r.majors?.length
        ? `${r.education.replace('_', ' ')} in ${r.majors.join('/')}`
        : `${r.education.replace('_', ' ')} degree`,
    );
  if (r.smarts && p.stats.smarts < r.smarts) out.push(`smarts ${r.smarts}`);
  if (r.looks && p.stats.looks < r.looks) out.push(`looks ${r.looks}`);
  if (r.health && p.stats.health < r.health) out.push(`health ${r.health}`);
  for (const [k, v] of Object.entries(r.skills ?? {}))
    if ((p.skills[k] ?? 0) < v) out.push(`${k} ${v}`);
  if (r.cleanRecord && (hasAdultRecord(s) || hasOpenJuvenileRecord(s))) out.push('clean record');
  if (r.licence && !s.assets.licence) out.push("driver's licence");
  if (r.countries?.length && !r.countries.includes(p.country))
    out.push('not available in this country');
  if (job.id === 'professional_athlete' && !(s.sport?.active && s.sport.level >= 3))
    out.push('a sport played at national youth level or better (Pursuits)');
  if (s.legal.prison) out.push('not from prison');
  if (s.military?.active) out.push('not while serving');
  return out;
}

export type Listing = { job: JobDef; unmet: string[]; salary: number; current: boolean };

export function jobListings(s: GameState): Listing[] {
  // Special careers find you; they are listed only while you hold one.
  // Special careers find you (listed only while you hold one); jobs years from existing are hidden.
  return JOBS.filter(
    (j) => (!j.special || s.career.jobId === j.id) && !(j.fromYear && s.year < j.fromYear - 5),
  ).map((job) => ({
    job,
    unmet: unmetRequirements(s, job),
    salary: money(s, ((job.salary[0]?.[0] ?? 0) + (job.salary[0]?.[1] ?? 0)) / 2, 'wage'),
    current: s.career.jobId === job.id || s.career.partTimeId === job.id,
  }));
}

/** Interview odds from stats, traits, and skills, plus veteran and record effects. */
export function interviewOdds(s: GameState, job: JobDef): number {
  const p = s.player.stats;
  let o =
    0.5 +
    (p.smarts - 50) * 0.005 +
    (p.looks - 50) * 0.002 +
    playerOdds(s, 'work') +
    playerOdds(s, 'social') * 0.5 +
    // Scouts notice a born athlete.
    (job.field === 'sports' ? 0.4 * luck(s, 'sport') : 0) -
    // In a recession, every opening has a queue.
    (inRecession(s.year) ? 0.15 : 0);
  for (const [k, v] of Object.entries(job.req.skills ?? {}))
    o += Math.min(0.15, ((s.player.skills[k] ?? 0) - v) * 0.005);
  if (
    isVeteran(s) &&
    (job.req.veteranBonus ||
      SPECIALTY_BY_ID[s.military?.specialty ?? '']?.civilianFields.includes(job.field))
  )
    o += 0.15;
  if (hasAdultRecord(s)) o -= 0.25;
  if (s.player.age >= 18 && !speaksLocal(s)) o -= 0.15;
  if (s.career.jobId) o += 0.05;
  return clampOdds(o);
}
