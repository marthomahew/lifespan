import type { MilitarySpecialtyDef } from './types';

export const BRANCHES = ['Army', 'Navy', 'Air Force', 'Marines'] as const;
export type Branch = (typeof BRANCHES)[number];

/** Military specialties (SPEC §5.4). */
export const SPECIALTIES: MilitarySpecialtyDef[] = [
  {
    id: 'infantry',
    label: 'Infantry',
    emoji: '🪖',
    description: 'On foot, in the mud, at the front.',
    risk: 1.2,
    skills: { athletics: 6 },
    civilianFields: ['public_service', 'trades'],
  },
  {
    id: 'intelligence',
    label: 'Intelligence and linguistics',
    emoji: '🛰️',
    description: 'Listening, translating, piecing it together.',
    risk: 0.3,
    skills: { programming: 3 },
    civilianFields: ['technology', 'public_service', 'law'],
  },
  {
    id: 'aviation',
    label: 'Aviation',
    emoji: '✈️',
    description: 'Flying, fixing, or directing things that fly.',
    risk: 0.8,
    skills: { athletics: 2 },
    civilianFields: ['transport', 'technology'],
  },
  {
    id: 'medical',
    label: 'Medical',
    emoji: '🩹',
    description: 'Field medicine under the worst conditions.',
    risk: 0.6,
    skills: {},
    civilianFields: ['healthcare'],
  },
  {
    id: 'engineering',
    label: 'Engineering',
    emoji: '🏗️',
    description: 'Bridges, roads, and keeping the lights on.',
    risk: 0.5,
    skills: {},
    civilianFields: ['trades', 'technology'],
  },
  {
    id: 'logistics',
    label: 'Logistics',
    emoji: '📦',
    description: 'Getting everything to everyone, on time.',
    risk: 0.25,
    skills: {},
    civilianFields: ['transport', 'retail', 'finance'],
  },
];

export const SPECIALTY_BY_ID: Record<string, MilitarySpecialtyDef> = Object.fromEntries(
  SPECIALTIES.map((s) => [s.id, s]),
);

export const ENLISTED_RANKS = [
  'Private',
  'Private First Class',
  'Specialist',
  'Sergeant',
  'Staff Sergeant',
  'Sergeant First Class',
  'Master Sergeant',
  'Sergeant Major',
  'Command Sergeant Major',
];
export const OFFICER_RANKS = [
  'Second Lieutenant',
  'First Lieutenant',
  'Captain',
  'Major',
  'Lieutenant Colonel',
  'Colonel',
];
export const MEDALS = [
  'Service Medal',
  'Commendation Medal',
  'Achievement Medal',
  'Purple Heart',
  'Bronze Star',
  'Silver Star',
];
export const DISCHARGES = ['honorable', 'general', 'other than honorable', 'dishonorable'] as const;

/** Yearly base pay in reference dollars by grade (E-1.. / O-1..). */
export const ENLISTED_PAY = [24000, 27000, 30000, 36000, 42000, 50000, 58000, 66000, 76000];
export const OFFICER_PAY = [48000, 58000, 70000, 85000, 100000, 120000];
