import type { Gender } from './types';

/** Emoji avatar by age and gender, with an optional skin-tone modifier. */
export function avatarEmoji(age: number, gender: Gender, tone: string, dead = false): string {
  if (dead) return '🪦';
  let base: string;
  if (age <= 2) base = '👶';
  else if (age <= 12) base = gender === 'male' ? '👦' : gender === 'female' ? '👧' : '🧒';
  else if (age < 65) base = gender === 'male' ? '👨' : gender === 'female' ? '👩' : '🧑';
  else base = gender === 'male' ? '👴' : gender === 'female' ? '👵' : '🧓';
  return base + tone;
}
