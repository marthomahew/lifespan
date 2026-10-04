import { FULL_TIME_JOBS } from '../../content/jobs';
import { MAJORS } from '../../content/education';
import type { act } from '../actions';
import type { Rng } from '../rng';
import { unmetRequirements } from '../systems/careers';
import { enrollReason, parentalHelp, tuitionFor } from '../systems/education';
import type { GameState } from '../types';
import type { PersonaId } from './persona';

type TryAct = (s: GameState, a: Parameters<typeof act>[1]) => GameState;

/**
 * Default persona (DONE §4): enrolls in university when eligible and able to pay with 60%
 * probability; applies for a random eligible job each year it's an unemployed adult with 80%.
 */
export function botCareer(s: GameState, _persona: PersonaId, rng: Rng, tryAct: TryAct): GameState {
  let cur = s;
  const p = cur.player;
  if (
    p.age >= 18 &&
    p.age <= 30 &&
    !cur.education.enrollment &&
    !cur.career.jobId &&
    !cur.education.degrees.some((d) => d.level === 'bachelor')
  ) {
    const major = rng.pick(MAJORS);
    if (!enrollReason(cur, 'university', major.id)) {
      const yearly = tuitionFor(cur, 'university', major.id);
      const canPay = yearly === 0 || cur.money.cash + parentalHelp(cur, yearly * 4, true) >= yearly;
      if (canPay && rng.chance(0.6))
        cur = tryAct(cur, { type: 'enroll', kind: 'university', programId: major.id });
    }
  }
  if (
    cur.player.age >= 18 &&
    !cur.career.jobId &&
    !cur.career.retired &&
    !cur.education.enrollment &&
    !cur.military?.active &&
    rng.chance(0.8)
  ) {
    const eligible = FULL_TIME_JOBS.filter(
      (j) => unmetRequirements(cur, j).length === 0 && !cur.career.appliedThisYear.includes(j.id),
    );
    if (eligible.length) cur = tryAct(cur, { type: 'apply_job', jobId: rng.pick(eligible).id });
  }
  return cur;
}
