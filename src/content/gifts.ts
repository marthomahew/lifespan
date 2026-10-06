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
];

export const GIFT_BY_ID: Record<string, GiftDef> = Object.fromEntries(GIFTS.map((g) => [g.id, g]));
