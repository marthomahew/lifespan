/**
 * Backgrounds: where you start, and the story threads that come with it. Off unless chosen
 * (or rolled, when the setting allows); an ordinary upbringing has none of their events.
 */
export type BackgroundDef = { id: string; label: string; emoji: string; description: string };

export const BACKGROUNDS: BackgroundDef[] = [
  {
    id: 'family_business',
    label: 'Family business',
    emoji: '🏪',
    description: 'Your family runs a business, and everyone assumes you will one day.',
  },
  {
    id: 'pushy_parents',
    label: 'Parents with plans',
    emoji: '📋',
    description: 'Your parents have your future mapped out: the lessons, the grades, the degree.',
  },
  {
    id: 'famous_parent',
    label: 'A famous parent',
    emoji: '🌟',
    description:
      'One of your parents is famous. Doors open; cameras follow; comparisons never stop.',
  },
  {
    id: 'moving_family',
    label: 'Always moving',
    emoji: '📦',
    description:
      'A parent’s job moves the family every few years: new cities, new schools, new friends.',
  },
  {
    id: 'immigrant_family',
    label: 'New arrivals',
    emoji: '🧳',
    description:
      'Your parents came from another country. Two languages, two kitchens, two ways of being.',
  },
  {
    id: 'grandparents',
    label: 'Raised by a grandparent',
    emoji: '👵',
    description:
      'Your parents are not around. A grandparent brings you up, in their own old-fashioned way.',
  },
  {
    id: 'twin',
    label: 'A twin',
    emoji: '👯',
    description: 'You arrive with company: a twin, for better and for worse, for life.',
  },
  {
    id: 'adopted',
    label: 'Adopted',
    emoji: '🏡',
    description: 'You were adopted as a baby. One day you might want to know where you came from.',
  },
];

export const BACKGROUND_BY_ID: Record<string, BackgroundDef> = Object.fromEntries(
  BACKGROUNDS.map((b) => [b.id, b]),
);

/** How often a random life gets a background, by the setting. */
export const BACKGROUND_ODDS = { off: 0, rare: 0.1, common: 0.33 } as const;
export type BackgroundFrequency = keyof typeof BACKGROUND_ODDS;
