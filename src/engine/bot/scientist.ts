import type { act } from '../actions';
import type { Rng } from '../rng';
import { enrollReason } from '../systems/education';
import { unmetRequirements } from '../systems/careers';
import { JOB_BY_ID } from '../../content/jobs';
import { FUNDERS } from '../../content/science';
import { grantReason, publishReason, acceptOdds, scienceOpen } from '../systems/science';
import { hireReason, labReason, patentable } from '../systems/science-lab';
import type { GameState } from '../types';

type TryAct = (s: GameState, a: Parameters<typeof act>[1]) => GameState;

const MAJORS = ['biology', 'chemistry', 'physics', 'computer_science', 'engineering'];
const JOBS = ['research_scientist', 'professor', 'chemist', 'environmental_scientist'];

/** A third of careerists (by seed) go into science: a science degree, a PhD, a research job. */
export const isScientist = (s: GameState): boolean => s.seed % 3 === 0;

export function scientistStudies(s: GameState, rng: Rng, tryAct: TryAct): GameState {
  let cur = s;
  if (cur.player.age < 17 || cur.education.enrollment) return cur;
  const degrees = cur.education.degrees;
  if (!degrees.some((d) => d.level === 'bachelor')) {
    const major = rng.pick(MAJORS);
    if (!enrollReason(cur, 'university', major))
      cur = tryAct(cur, { type: 'enroll', kind: 'university', programId: major });
  } else if (!degrees.some((d) => d.level === 'doctorate') && cur.player.age < 34) {
    if (!enrollReason(cur, 'grad', 'phd'))
      cur = tryAct(cur, { type: 'enroll', kind: 'grad', programId: 'phd' });
  }
  return cur;
}

export function scientistJob(s: GameState): string | undefined {
  return JOBS.find((id) => {
    const j = JOB_BY_ID[id];
    return j && unmetRequirements(s, j).length === 0 && !s.career.appliedThisYear.includes(id);
  });
}

/** A year at the bench: research, publish where it will likely land, apply, hire, the round. */
export function scienceYear(s: GameState, tryAct: TryAct): GameState {
  let cur = s;
  if (!scienceOpen(cur)) return cur;
  for (const what of ['conference', 'teach', 'review', 'sabbatical'] as const)
    if (!labReason(cur, what)) cur = tryAct(cur, { type: 'science', id: 'lab', what });
  for (let i = 0; i < 2; i++) cur = tryAct(cur, { type: 'science', id: 'research' });
  for (const tier of [1, 2, 3])
    if (!publishReason(cur, tier) && (tier === 3 || acceptOdds(cur, tier) >= 0.4))
      cur = tryAct(cur, { type: 'science', id: 'publish', tier });
  for (const f of FUNDERS)
    if (!grantReason(cur, f.id)) cur = tryAct(cur, { type: 'science', id: 'apply', funder: f.id });
  if (!hireReason(cur)) cur = tryAct(cur, { type: 'science', id: 'hire', role: 'phd' });
  const p = patentable(cur)[0];
  if (p !== undefined) cur = tryAct(cur, { type: 'science', id: 'patent', paper: p });
  if ((cur.science?.rep ?? 0) >= 25) cur = tryAct(cur, { type: 'science', id: 'talk' });
  return cur;
}
