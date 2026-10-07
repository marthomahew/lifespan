import { SPORT_BY_ID } from './sports';
import type { GameState } from '../engine/types';

/**
 * Lives that add up to something rare: a pilot with a science degree is asked to train as
 * an astronaut, a polyglot gets a quiet approach. Each path is offered once (flag `sp:<id>`),
 * one a year, by the special-paths system. Its event does the rest.
 */
export type SpecialPath = { id: string; event: string; when: (s: GameState) => boolean };

const degreeIn = (s: GameState, majors: string[]): boolean =>
  s.education.degrees.some((d) => majors.includes(d.field) || majors.includes(d.level));
const fluentIn = (s: GameState): number =>
  Object.values(s.player.languages).filter((v) => v >= 60).length;
const job = (s: GameState, ...ids: string[]): boolean => ids.includes(s.career.jobId ?? '');
const age = (s: GameState, lo: number, hi: number): boolean =>
  s.player.age >= lo && s.player.age <= hi;
const free = (s: GameState): boolean => !s.legal.prison && !s.legal.fugitive && !s.death;
const SCIENCE = [
  'physics',
  'engineering',
  'computer_science',
  'biology',
  'chemistry',
  'medicine',
  'phd',
];

export const SPECIAL_PATHS: SpecialPath[] = [
  {
    id: 'astronaut',
    event: 'sp_astronaut_invite',
    when: (s) =>
      free(s) &&
      age(s, 26, 46) &&
      s.player.stats.health >= 70 &&
      degreeIn(s, SCIENCE) &&
      // A flyer: a military aviator, or an airline pilot past training.
      ((s.military?.specialty === 'aviation' && (s.military.years ?? 0) >= 3) ||
        (job(s, 'airline_pilot') && s.career.level >= 1)),
  },
  {
    id: 'politics',
    event: 'sp_politics_ask',
    when: (s) =>
      free(s) &&
      age(s, 25, 65) &&
      !job(s, 'politician') &&
      (job(s, 'civil_servant', 'lawyer', 'school_teacher', 'school_principal', 'journalist') ||
        s.player.stats.fame >= 40 ||
        degreeIn(s, ['political_science', 'law'])) &&
      (s.player.stats.karma >= 55 || s.player.stats.fame >= 40),
  },
  {
    id: 'spy',
    event: 'sp_spy_approach',
    when: (s) =>
      free(s) &&
      age(s, 22, 45) &&
      fluentIn(s) >= 3 &&
      s.player.stats.smarts >= 65 &&
      s.player.stats.notoriety < 30,
  },
  {
    id: 'diplomat',
    event: 'sp_diplomat_offer',
    when: (s) =>
      free(s) &&
      age(s, 23, 50) &&
      fluentIn(s) >= 2 &&
      (job(s, 'civil_servant') ||
        degreeIn(s, ['political_science', 'law', 'history', 'economics'])),
  },
  {
    id: 'screen',
    event: 'sp_screen_test',
    when: (s) =>
      free(s) &&
      age(s, 16, 40) &&
      s.player.stats.looks >= 72 &&
      ((s.player.skills['voice'] ?? 0) >= 40 ||
        s.player.background === 'famous_parent' ||
        s.player.stats.fame >= 25),
  },
  {
    id: 'olympics',
    event: 'sp_olympics',
    // Only for someone already on the national team in an Olympic sport.
    when: (s) =>
      free(s) &&
      age(s, 17, 34) &&
      !!s.sport?.active &&
      s.sport.level >= 4 &&
      !!SPORT_BY_ID[s.sport.sport]?.olympic,
  },
  {
    id: 'michelin',
    event: 'sp_michelin',
    when: (s) =>
      free(s) &&
      (s.player.skills['cooking'] ?? 0) >= 80 &&
      ((job(s, 'chef') && s.career.level >= 2) || s.business?.kind === 'restaurant'),
  },
  {
    id: 'nobel',
    event: 'sp_nobel',
    when: (s) =>
      free(s) &&
      s.player.age >= 40 &&
      s.player.stats.smarts >= 88 &&
      job(s, 'research_scientist', 'professor', 'chemist', 'doctor') &&
      s.career.level >= 3,
  },
];
