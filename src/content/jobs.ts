import { JOBS_A } from './jobs-a';
import { JOBS_B, PART_TIME_JOBS } from './jobs-b';
import type { JobDef } from './types';
import { SPECIAL_JOBS } from './jobs-special';
export { SPECIAL_JOBS };

/** Full-time jobs (DONE §3: 45+ across 10+ fields) and part-time jobs for ages 14–17. */
export const FULL_TIME_JOBS: JobDef[] = [...JOBS_A, ...JOBS_B];
export { PART_TIME_JOBS };
export const JOBS: JobDef[] = [...FULL_TIME_JOBS, ...PART_TIME_JOBS, ...SPECIAL_JOBS];
export const JOB_BY_ID: Record<string, JobDef> = Object.fromEntries(JOBS.map((j) => [j.id, j]));
export const JOB_FIELDS: string[] = [...new Set(FULL_TIME_JOBS.map((j) => j.field))].sort();
