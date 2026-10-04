import { FULL_TIME_JOBS, JOB_FIELDS, PART_TIME_JOBS, JOBS } from '../src/content/jobs';
import { GRAD_PROGRAMS, MAJORS } from '../src/content/education';
import { SPECIALTIES } from '../src/content/military';
import { INTERACTIONS } from '../src/content/interactions';
import { ACTIVITIES } from '../src/content/activities';
import { TRAITS } from '../src/content/traits';
import { SKILLS } from '../src/content/skills';
import { ACHIEVEMENTS } from '../src/content/achievements';
import { ILLNESSES } from '../src/content/illnesses';
import { CRIMES } from '../src/content/crimes';
import { LIFE_TITLES } from '../src/content/achievements';
import { HOME_TYPES, POSSESSIONS, VEHICLES } from '../src/content/assets';
import { CHEATS } from '../src/engine/cheats/registry';

/** Catalogs beyond events that content:check validates and counts (DONE §3). */
export type ExtraContent = {
  crimes: Set<string>;
  jobs: Set<string>;
  thresholds: { key: string; label: string; value: number; min: number }[];
};

export function extraContent(): ExtraContent {
  return {
    crimes: new Set(CRIMES.map((c) => c.id)),
    jobs: new Set(JOBS.map((j) => j.id)),
    thresholds: [
      {
        key: 'jobs',
        label: 'Full-time jobs (excl. military and music)',
        value: FULL_TIME_JOBS.length,
        min: 45,
      },
      { key: 'jobs', label: 'Job fields', value: JOB_FIELDS.length, min: 10 },
      {
        key: 'jobs',
        label: 'Part-time jobs for ages 14–17',
        value: PART_TIME_JOBS.filter((j) => j.req.minAge <= 17).length,
        min: 8,
      },
      { key: 'majors', label: 'University majors', value: MAJORS.length, min: 12 },
      { key: 'majors', label: 'Graduate programs', value: GRAD_PROGRAMS.length, min: 4 },
      { key: 'military', label: 'Military specialties', value: SPECIALTIES.length, min: 6 },
      {
        key: 'interactions',
        label: 'Relationship interactions',
        value: INTERACTIONS.length,
        min: 12,
      },
      {
        key: 'activities',
        label: 'Activities with 3+ outcome texts',
        value: ACTIVITIES.filter((a) => a.outcomes.length >= 3).length,
        min: 25,
      },
      { key: 'illnesses', label: 'Illnesses', value: ILLNESSES.length, min: 20 },
      { key: 'traits', label: 'Traits', value: TRAITS.length, min: 15 },
      { key: 'traits', label: 'Skills', value: SKILLS.length, min: 6 },
      { key: 'achievements', label: 'Achievements', value: ACHIEVEMENTS.length, min: 30 },
      { key: 'crimes', label: 'Crimes', value: CRIMES.length, min: 10 },
      { key: 'achievements', label: 'Life titles', value: LIFE_TITLES.length, min: 12 },
      { key: 'assets', label: 'Vehicles', value: VEHICLES.length, min: 12 },
      { key: 'assets', label: 'Possessions', value: POSSESSIONS.length, min: 10 },
      { key: 'assets', label: 'Home types', value: HOME_TYPES.length, min: 6 },
      { key: 'cheats', label: 'Cheat commands', value: CHEATS.length, min: 40 },
      {
        key: 'crimes',
        label: 'Prison activities',
        value: ACTIVITIES.filter((a) => a.group === 'prison').length,
        min: 6,
      },
    ],
  };
}
