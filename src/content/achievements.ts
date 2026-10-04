import type { AchievementDef } from './types';

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_words',
    label: 'First Words',
    emoji: '🗣️',
    description: 'Said something. It was mostly vowels.',
  },
];

export const ACHIEVEMENT_BY_ID: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);
