import type { IllnessDef } from './types';

/** The illness catalog (SPEC §5.8). */
export const ILLNESSES: IllnessDef[] = [
  {
    id: 'flu',
    label: 'Flu',
    emoji: '🤒',
    symptom: 'Everything aches, including your opinions.',
    severity: [15, 35],
    chronic: false,
    onset: { ages: [0, 120], base: 0.05 },
    progression: -15,
    deathFactor: 0.6,
    treatments: { doctor: 0.9, alternative: 0.3 },
    cost: 150,
    effects: { happiness: -4, health: -3 },
  },
];

export const ILLNESS_BY_ID: Record<string, IllnessDef> = Object.fromEntries(
  ILLNESSES.map((i) => [i.id, i]),
);
