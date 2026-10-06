import type { OddsKey } from './types';

/**
 * Gifts: picked at the start of a life, never rolled. They are frankly generous: for lives where
 * you want things to go your way. (Luck in particular areas joins them later.)
 */
export type GiftDef = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  /** Multiplies every skill and language gain. */
  learn?: number;
  /** Success-odds tilt, like a trait's. */
  odds?: Partial<Record<OddsKey, number>>;
};

export const GIFTS: GiftDef[] = [
  {
    id: 'quick_study',
    label: 'Quick study',
    emoji: '⚡',
    description: 'Every skill and every language comes twice as fast.',
    learn: 2,
  },
  {
    id: 'money_luck',
    label: 'Lucky with money',
    emoji: '🍀',
    description: 'Investments beat the market, windfalls find you, and risky bets tend to land.',
    odds: { money: 0.3 },
  },
  {
    id: 'career_luck',
    label: 'Charmed career',
    emoji: '📈',
    description:
      'Raises and promotions come easily, interviews go well, and the axe always misses.',
    odds: { work: 0.3 },
  },
  {
    id: 'sport_luck',
    label: 'Born athlete',
    emoji: '🏆',
    description: 'Scouts notice, injuries pass you by, and the big games go your way.',
    odds: { athletic: 0.3 },
  },
  {
    id: 'music_luck',
    label: 'Golden ear',
    emoji: '🎶',
    description: 'Records land, labels call early, and tours sell out without a hitch.',
    odds: { creative: 0.3 },
  },
  {
    id: 'crime_luck',
    label: 'Never caught',
    emoji: '🎭',
    description: 'The police are rarely interested, and when they are, the case falls apart.',
    odds: { crime: 0.35 },
  },
  {
    id: 'business_luck',
    label: 'Midas touch',
    emoji: '💰',
    description:
      'Businesses you start thrive: customers, momentum, and buyers who pay over the odds.',
    odds: { money: 0.15 },
  },
  {
    id: 'charmed',
    label: 'Charmed life',
    emoji: '✨',
    description: 'A little luck in everything: love, work, money, health and the rest.',
    odds: {
      social: 0.12,
      romance: 0.12,
      work: 0.12,
      study: 0.12,
      crime: 0.12,
      creative: 0.12,
      athletic: 0.12,
      money: 0.12,
    },
  },
];

export const GIFT_BY_ID: Record<string, GiftDef> = Object.fromEntries(GIFTS.map((g) => [g.id, g]));
