import type { Gender } from './types';

/** Emoji avatar by age and gender, with a skin-tone modifier and (teens and adults) a hairstyle. */
export function avatarEmoji(age: number, gender: Gender, tone: string, dead = false): string {
  if (dead) return '🪦';
  if (age <= 2) return '👶' + tone;
  if (age <= 12) return (gender === 'male' ? '👦' : gender === 'female' ? '👧' : '🧒') + tone;
  if (age >= 65) return (gender === 'male' ? '👴' : gender === 'female' ? '👵' : '🧓') + tone;
  return (gender === 'male' ? '👨' : gender === 'female' ? '👩' : '🧑') + tone;
}
