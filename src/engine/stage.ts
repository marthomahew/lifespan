import type { Stage } from './types';

export function stageOf(age: number): Stage {
  if (age <= 2) return 'infant';
  if (age <= 12) return 'child';
  if (age <= 17) return 'teen';
  if (age <= 29) return 'young_adult';
  if (age <= 49) return 'adult';
  if (age <= 64) return 'middle_age';
  return 'senior';
}

export const STAGE_LABEL: Record<Stage, string> = {
  infant: 'Infant',
  child: 'Child',
  teen: 'Teen',
  young_adult: 'Young adult',
  adult: 'Adult',
  middle_age: 'Middle age',
  senior: 'Senior',
};
