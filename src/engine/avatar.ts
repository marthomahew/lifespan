import type { Gender, HairStyle } from './types';

export const HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: 'default', label: 'Dark' },
  { id: 'blond', label: 'Blond' },
  { id: 'red', label: 'Red' },
  { id: 'curly', label: 'Curly' },
  { id: 'white', label: 'White' },
  { id: 'bald', label: 'Bald' },
];

const ZWJ = '\u200d';
const HAIR_MARK: Record<HairStyle, string> = {
  default: '',
  blond: '',
  red: '🦰',
  curly: '🦱',
  white: '🦳',
  bald: '🦲',
};

/** Emoji avatar by age and gender, with a skin-tone modifier and (teens and adults) a hairstyle. */
export function avatarEmoji(
  age: number,
  gender: Gender,
  tone: string,
  dead = false,
  hair: HairStyle = 'default',
): string {
  if (dead) return '🪦';
  if (age <= 2) return '👶' + tone;
  if (age <= 12) return (gender === 'male' ? '👦' : gender === 'female' ? '👧' : '🧒') + tone;
  if (age >= 65) return (gender === 'male' ? '👴' : gender === 'female' ? '👵' : '🧓') + tone;
  if (hair === 'blond')
    return '👱' + tone + (gender === 'male' ? ZWJ + '♂️' : gender === 'female' ? ZWJ + '♀️' : '');
  const base = gender === 'male' ? '👨' : gender === 'female' ? '👩' : '🧑';
  const mark = HAIR_MARK[hair];
  return base + tone + (mark ? ZWJ + mark : '');
}
