import type { GradProgramDef, MajorDef } from './types';

/** University majors (SPEC §5.2). */
export const MAJORS: MajorDef[] = [
  {
    id: 'computer_science',
    label: 'Computer Science',
    field: 'technology',
    smarts: 60,
    description: 'Algorithms, all-nighters, and a lot of yellow sticky notes.',
  },
  {
    id: 'engineering',
    label: 'Engineering',
    field: 'technology',
    smarts: 65,
    description: 'Bridges, circuits, and calculators with a lot of buttons.',
  },
  {
    id: 'business',
    label: 'Business',
    field: 'finance',
    smarts: 45,
    description: 'Case studies, group projects, and a startling number of lanyards.',
  },
  {
    id: 'economics',
    label: 'Economics',
    field: 'finance',
    smarts: 55,
    description: 'Supply, demand, and arguing about both.',
  },
  {
    id: 'accounting',
    label: 'Accounting',
    field: 'finance',
    smarts: 50,
    description: 'Ledgers that balance and jokes that do not.',
  },
  {
    id: 'nursing',
    label: 'Nursing',
    field: 'healthcare',
    smarts: 50,
    description: 'Twelve-hour placements and a lifelong skill with veins.',
  },
  {
    id: 'biology',
    label: 'Biology',
    field: 'science',
    smarts: 55,
    description: 'Cells, fruit flies, and the smell of formaldehyde.',
  },
  {
    id: 'chemistry',
    label: 'Chemistry',
    field: 'science',
    smarts: 60,
    description: 'Things that change colour and things that must never be mixed.',
  },
  {
    id: 'physics',
    label: 'Physics',
    field: 'science',
    smarts: 70,
    description: 'The universe, explained with very small and very large numbers.',
  },
  {
    id: 'psychology',
    label: 'Psychology',
    field: 'healthcare',
    smarts: 50,
    description: 'Why people do what they do, and why you just did that.',
  },
  {
    id: 'education',
    label: 'Education',
    field: 'education',
    smarts: 45,
    description: 'How to explain fractions to thirty people at once.',
  },
  {
    id: 'political_science',
    label: 'Political Science',
    field: 'law',
    smarts: 55,
    description: 'Constitutions, debates, and a very loud student society.',
  },
  {
    id: 'english',
    label: 'English Literature',
    field: 'arts',
    smarts: 45,
    description: 'Long books, longer essays, and opinions about semicolons.',
  },
  {
    id: 'journalism',
    label: 'Journalism',
    field: 'arts',
    smarts: 45,
    description: 'Deadlines, sources, and the inverted pyramid.',
  },
  {
    id: 'fine_art',
    label: 'Fine Art',
    field: 'arts',
    smarts: 35,
    description: 'Studios, critiques, and paint in places paint should not be.',
  },
  {
    id: 'history',
    label: 'History',
    field: 'education',
    smarts: 45,
    description: 'What happened, why, and why everyone disagrees.',
  },
];

export const MAJOR_BY_ID: Record<string, MajorDef> = Object.fromEntries(
  MAJORS.map((m) => [m.id, m]),
);

/** Graduate programs (SPEC §5.2): law 3 years, medicine 4 + residency, business 2, PhD 5. */
export const GRAD_PROGRAMS: GradProgramDef[] = [
  {
    id: 'law',
    label: 'Law School',
    degree: 'law',
    years: 3,
    residency: 0,
    smarts: 65,
    majors: [],
    workYears: 0,
    tuition: 45000,
    description: 'Three years of case law and a bar exam at the end.',
  },
  {
    id: 'medicine',
    label: 'Medical School',
    degree: 'medicine',
    years: 4,
    residency: 3,
    smarts: 75,
    majors: ['biology', 'chemistry', 'nursing', 'psychology', 'physics'],
    workYears: 0,
    tuition: 55000,
    description: 'Four years of medicine, then a residency measured in coffee.',
  },
  {
    id: 'mba',
    label: 'Business School (MBA)',
    degree: 'mba',
    years: 2,
    residency: 0,
    smarts: 55,
    majors: [],
    workYears: 2,
    tuition: 60000,
    description: 'Two years of networking with a degree attached.',
  },
  {
    id: 'phd',
    label: 'Doctorate (PhD)',
    degree: 'doctorate',
    years: 5,
    residency: 0,
    smarts: 70,
    majors: [],
    workYears: 0,
    tuition: 8000,
    description: 'Five years, one very narrow topic, and a thesis nobody reads.',
  },
];

export const GRAD_BY_ID: Record<string, GradProgramDef> = Object.fromEntries(
  GRAD_PROGRAMS.map((g) => [g.id, g]),
);
