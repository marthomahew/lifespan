/**
 * Prodigy milestones: when a child's skill runs far ahead of their age, the world notices.
 * Each fires its event once (flag `pm:<id>`); the prodigy system checks one a year.
 */
export type ProdigyMilestone = {
  id: string;
  /** The skill measured (the best of them, for music). */
  skills: string[];
  minLevel: number;
  /** Too old by now and it's just talent, not a prodigy. */
  maxAge: number;
  minAge?: number;
  /** An earlier milestone this one follows. */
  after?: string;
  /** Only for someone born with the gift (hard work alone gets you close, not here). */
  gifted?: boolean;
  event: string;
};

const MUSIC = ['instrument', 'voice'];

export const PRODIGY_MILESTONES: ProdigyMilestone[] = [
  {
    id: 'chess_club',
    skills: ['chess'],
    minLevel: 35,
    maxAge: 12,
    minAge: 5,
    event: 'pr_chess_club',
  },
  {
    id: 'chess_junior',
    skills: ['chess'],
    minLevel: 55,
    maxAge: 15,
    after: 'chess_club',
    event: 'pr_chess_junior',
  },
  {
    id: 'chess_master',
    skills: ['chess'],
    minLevel: 75,
    maxAge: 17,
    after: 'chess_junior',
    event: 'pr_chess_master',
  },
  {
    id: 'chess_gm',
    gifted: true,
    skills: ['chess'],
    minLevel: 90,
    maxAge: 30,
    after: 'chess_master',
    event: 'pr_chess_grandmaster',
  },
  {
    id: 'music_recital',
    skills: MUSIC,
    minLevel: 35,
    maxAge: 11,
    minAge: 4,
    event: 'pr_music_recital',
  },
  {
    id: 'music_conservatory',
    skills: MUSIC,
    minLevel: 55,
    maxAge: 14,
    after: 'music_recital',
    event: 'pr_music_conservatory',
  },
  {
    id: 'music_debut',
    skills: MUSIC,
    minLevel: 75,
    maxAge: 16,
    after: 'music_conservatory',
    event: 'pr_music_debut',
  },
  {
    id: 'music_composer',
    gifted: true,
    skills: MUSIC,
    minLevel: 88,
    maxAge: 19,
    after: 'music_debut',
    event: 'pr_music_composer',
  },
  { id: 'art', skills: ['art'], minLevel: 60, maxAge: 14, minAge: 6, event: 'pr_art_exhibit' },
  {
    id: 'athletics',
    skills: ['athletics'],
    minLevel: 60,
    maxAge: 14,
    minAge: 8,
    event: 'pr_sport_academy',
  },
  {
    id: 'programming',
    skills: ['programming'],
    minLevel: 60,
    maxAge: 15,
    minAge: 9,
    event: 'pr_code_app',
  },
  {
    id: 'writing',
    skills: ['writing'],
    minLevel: 60,
    maxAge: 15,
    minAge: 8,
    event: 'pr_young_author',
  },
  {
    id: 'cooking',
    skills: ['cooking'],
    minLevel: 60,
    maxAge: 14,
    minAge: 8,
    event: 'pr_junior_chef',
  },
];
