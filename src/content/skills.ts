import type { LanguageDef, SkillDef } from './types';

export const SKILLS: SkillDef[] = [
  {
    id: 'instrument',
    label: 'Instrument',
    emoji: '🎸',
    description: 'Playing something with strings, keys, or a mouthpiece.',
    odds: { creative: 0.25 },
    ageDecline: { from: 70, rate: 0.5 },
  },
  {
    id: 'voice',
    label: 'Voice',
    emoji: '🎤',
    description: 'Singing on purpose, in tune.',
    odds: { creative: 0.25, social: 0.05 },
    ageDecline: { from: 60, rate: 0.7 },
  },
  {
    id: 'athletics',
    label: 'Athletics',
    emoji: '🏅',
    description: 'Running, jumping, catching, not falling over.',
    odds: { athletic: 0.3 },
    ageDecline: { from: 30, rate: 1.5 },
  },
  {
    id: 'programming',
    label: 'Programming',
    emoji: '💻',
    description: 'Telling computers what to do, then why they did something else.',
    odds: { work: 0.15 },
    ageDecline: { from: 70, rate: 0.5 },
  },
  {
    id: 'cooking',
    label: 'Cooking',
    emoji: '🍳',
    description: 'Turning groceries into dinner instead of smoke.',
    odds: { social: 0.05, romance: 0.05 },
    ageDecline: { from: 80, rate: 0.3 },
  },
  {
    id: 'art',
    label: 'Art',
    emoji: '🖌️',
    description: 'Drawing, painting, and explaining what it means.',
    odds: { creative: 0.2 },
    ageDecline: { from: 80, rate: 0.3 },
  },
  {
    id: 'writing',
    label: 'Writing',
    emoji: '✍️',
    description: 'Sentences that people finish reading.',
    odds: { creative: 0.15, work: 0.05 },
    ageDecline: { from: 82, rate: 0.25 },
  },
  {
    id: 'chess',
    label: 'Chess',
    emoji: '♟️',
    description: 'Seeing six moves ahead, and the trap in the fourth.',
    odds: { study: 0.15 },
    ageDecline: { from: 55, rate: 0.4 },
  },
];

export const SKILL_BY_ID: Record<string, SkillDef> = Object.fromEntries(
  SKILLS.map((s) => [s.id, s]),
);

export const LANGUAGES: LanguageDef[] = [
  { id: 'english', label: 'English' },
  { id: 'french', label: 'French' },
  { id: 'german', label: 'German' },
  { id: 'spanish', label: 'Spanish' },
  { id: 'portuguese', label: 'Portuguese' },
  { id: 'swedish', label: 'Swedish' },
  { id: 'japanese', label: 'Japanese' },
  { id: 'korean', label: 'Korean' },
  { id: 'hindi', label: 'Hindi' },
  { id: 'yoruba', label: 'Yoruba' },
  { id: 'italian', label: 'Italian' },
  { id: 'mandarin', label: 'Mandarin' },
  { id: 'dutch', label: 'Dutch' },
  { id: 'polish', label: 'Polish' },
  { id: 'slovene', label: 'Slovene' },
  { id: 'turkish', label: 'Turkish' },
  { id: 'filipino', label: 'Filipino' },
  { id: 'zulu', label: 'Zulu' },
  { id: 'arabic', label: 'Arabic' },
];

export const LANGUAGE_BY_ID: Record<string, LanguageDef> = Object.fromEntries(
  LANGUAGES.map((l) => [l.id, l]),
);
