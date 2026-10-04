import type { LanguageDef, SkillDef } from './types';

export const SKILLS: SkillDef[] = [
  {
    id: 'instrument',
    label: 'Instrument',
    emoji: '🎸',
    description: 'Playing something with strings, keys, or a mouthpiece.',
    odds: { creative: 0.25 },
  },
  {
    id: 'voice',
    label: 'Voice',
    emoji: '🎤',
    description: 'Singing on purpose, in tune.',
    odds: { creative: 0.25, social: 0.05 },
  },
  {
    id: 'athletics',
    label: 'Athletics',
    emoji: '🏅',
    description: 'Running, jumping, catching, not falling over.',
    odds: { athletic: 0.3 },
  },
  {
    id: 'programming',
    label: 'Programming',
    emoji: '💻',
    description: 'Telling computers what to do, then why they did something else.',
    odds: { work: 0.15 },
  },
  {
    id: 'cooking',
    label: 'Cooking',
    emoji: '🍳',
    description: 'Turning groceries into dinner instead of smoke.',
    odds: { social: 0.05, romance: 0.05 },
  },
  {
    id: 'art',
    label: 'Art',
    emoji: '🖌️',
    description: 'Drawing, painting, and explaining what it means.',
    odds: { creative: 0.2 },
  },
  {
    id: 'writing',
    label: 'Writing',
    emoji: '✍️',
    description: 'Sentences that people finish reading.',
    odds: { creative: 0.15, work: 0.05 },
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
];

export const LANGUAGE_BY_ID: Record<string, LanguageDef> = Object.fromEntries(
  LANGUAGES.map((l) => [l.id, l]),
);
