import type { GameState } from './types';

/** One line on what the player is doing with their days. */
export function occupationLabel(s: GameState): string {
  const age = s.player.age;
  if (s.death) return 'Deceased';
  if (s.legal.prison) return 'In prison';
  if (s.legal.fugitive && !s.career.jobId && !s.career.partTimeId) return 'On the run';
  if (s.military?.active) return `Serving in the ${s.military.branch}`;
  if (s.career.jobId) return s.career.history.at(-1)?.title ?? 'Working';
  if (s.business?.hands === 'self') return `Running ${s.business.name}`;
  if (s.education.enrollment) return 'At university';
  if (age < 3) return 'Being a baby';
  if (age < 6) return 'Preschool';
  if (age <= 17 && !s.education.droppedOut) return age < 12 ? 'Primary school' : 'Secondary school';
  if (s.career.retired) return 'Retired';
  if (s.career.partTimeId) return 'Part-time work';
  return age < 18 ? 'Out of school' : 'Unemployed';
}
