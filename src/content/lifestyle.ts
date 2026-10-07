import type { OddsKey } from './types';

/**
 * What money buys once you have a lot of it: four tiers by net worth (today's dollars), each
 * opening things the tier below can't touch. Costs and upkeep in today's dollars.
 */
export type WealthTier = 'well_off' | 'rich' | 'wealthy' | 'ultra';

export const TIERS: { id: WealthTier; label: string; netWorth: number; blurb: string }[] = [
  {
    id: 'well_off',
    label: 'Well off',
    netWorth: 1_000_000,
    blurb: 'Comfort with a little ceremony: clubs, cellars, trainers and the front of the plane.',
  },
  {
    id: 'rich',
    label: 'Rich',
    netWorth: 10_000_000,
    blurb: 'Other people run your errands: staff, charters, racehorses and the auction room.',
  },
  {
    id: 'wealthy',
    label: 'Wealthy',
    netWorth: 100_000_000,
    blurb: 'Your own jet, your own yacht, and people whose job is managing your money.',
  },
  {
    id: 'ultra',
    label: 'Absurdly rich',
    netWorth: 1_000_000_000,
    blurb: 'Teams, spaceflight, and giving away fortunes most people never see.',
  },
];

export type LifestyleDef = {
  id: string;
  tier: WealthTier;
  label: string;
  emoji: string;
  /** Up-front cost and yearly upkeep, today's dollars. */
  cost: number;
  upkeep: number;
  description: string;
  /** 'own': a thing you keep (and can sell); 'service': kept up yearly until you stop; 'once': an experience or a gift. */
  kind: 'own' | 'service' | 'once';
  /** Owned things: yearly change in value (mean, spread). */
  growth?: [number, number];
  /** Each year you have it. */
  yearly?: { happiness?: number; stress?: number; health?: number; fame?: number };
  /** On buying (or doing it). */
  now?: { happiness?: number; fame?: number; karma?: number; stress?: number };
  /** Extra free-time pips while you have it (staff, a jet). */
  freeTime?: number;
  /** Odds tilts while you have it. */
  perks?: Partial<Record<OddsKey, number>>;
  /** Not before this year. */
  fromYear?: number;
  /** Can be done more than once (charters, auctions, pledges are once). */
  repeat?: boolean;
  /** Something engine-side: investment returns, races, start-up bets, titles. */
  special?: 'family_office' | 'racehorse' | 'angel' | 'team';
};

export const LIFESTYLE: LifestyleDef[] = [
  // Well off
  {
    id: 'country_club',
    tier: 'well_off',
    label: 'Country club membership',
    emoji: '⛳',
    cost: 25000,
    upkeep: 20000,
    kind: 'service',
    description:
      'Golf, tennis, a dining room with a dress code, and the useful people who eat in it.',
    yearly: { happiness: 2 },
    perks: { social: 0.05, work: 0.03 },
  },
  {
    id: 'trainer',
    tier: 'well_off',
    label: 'Personal trainer and nutritionist',
    emoji: '🏋️',
    cost: 0,
    upkeep: 30000,
    kind: 'service',
    description: 'Someone who shows up at six in the morning and won’t take no for an answer.',
    yearly: { health: 2, happiness: 1 },
  },
  {
    id: 'wine_cellar',
    tier: 'well_off',
    label: 'A wine cellar',
    emoji: '🍷',
    cost: 60000,
    upkeep: 2000,
    kind: 'own',
    growth: [0.04, 0.05],
    description: 'Racks of good years, a thermometer you check like a baby monitor.',
    yearly: { happiness: 1 },
  },
  {
    id: 'first_class',
    tier: 'well_off',
    label: 'Travel first class',
    emoji: '🛫',
    cost: 0,
    upkeep: 40000,
    kind: 'service',
    description: 'Flat beds, real cutlery, and arriving rested for once.',
    yearly: { happiness: 2, stress: -2 },
  },
  // Rich
  {
    id: 'staff',
    tier: 'rich',
    label: 'Household staff',
    emoji: '🤵',
    cost: 0,
    upkeep: 300000,
    kind: 'service',
    description:
      'A housekeeper, a chef and a driver: the hours you used to spend on errands are yours again.',
    yearly: { stress: -4, happiness: 2 },
    freeTime: 2,
  },
  {
    id: 'yacht_charter',
    tier: 'rich',
    label: 'Charter a yacht for a summer',
    emoji: '🛥️',
    cost: 250000,
    upkeep: 0,
    kind: 'once',
    repeat: true,
    description: 'A crew of twelve, a different cove every morning, and no emails.',
    now: { happiness: 8, fame: 1, stress: -6 },
  },
  {
    id: 'jet_card',
    tier: 'rich',
    label: 'A private-jet card',
    emoji: '🛩️',
    cost: 0,
    upkeep: 250000,
    kind: 'service',
    description: 'Hours on other people’s jets, booked a day ahead. No queues, no shoes off.',
    yearly: { stress: -2 },
    freeTime: 1,
  },
  {
    id: 'racehorse',
    tier: 'rich',
    label: 'A racehorse',
    emoji: '🐎',
    cost: 500000,
    upkeep: 80000,
    kind: 'own',
    growth: [-0.05, 0.2],
    special: 'racehorse',
    description: 'A thoroughbred, a trainer, and a box at the races in your own colours.',
    yearly: { happiness: 2 },
    perks: { social: 0.03 },
  },
  {
    id: 'art',
    tier: 'rich',
    label: 'A painting at auction',
    emoji: '🖼️',
    cost: 2000000,
    upkeep: 20000,
    kind: 'own',
    repeat: true,
    growth: [0.06, 0.15],
    description: 'You raise a paddle at an evening sale and a famous canvas comes home with you.',
    now: { happiness: 4, fame: 2 },
  },
  {
    id: 'angel',
    tier: 'rich',
    label: 'Angel-invest in start-ups',
    emoji: '🚀',
    cost: 500000,
    upkeep: 0,
    kind: 'once',
    repeat: true,
    special: 'angel',
    description: 'Ten small cheques to founders with decks and dreams. Most fail; one might not.',
    now: { stress: 2 },
  },
  {
    id: 'donor',
    tier: 'rich',
    label: 'Become a big political donor',
    emoji: '🏛️',
    cost: 1000000,
    upkeep: 0,
    kind: 'once',
    description: 'Dinners with candidates, and calls that get returned.',
    now: { fame: 2 },
    perks: { work: 0.05 },
  },
  // Wealthy
  {
    id: 'family_office',
    tier: 'wealthy',
    label: 'A family office',
    emoji: '🏦',
    cost: 0,
    upkeep: 1500000,
    kind: 'service',
    special: 'family_office',
    description:
      'A team whose only job is your money: tax, trusts, and better returns than the market.',
    yearly: { stress: -2 },
  },
  {
    id: 'private_jet',
    tier: 'wealthy',
    label: 'Your own private jet',
    emoji: '✈️',
    cost: 30000000,
    upkeep: 2500000,
    kind: 'own',
    growth: [-0.07, 0.03],
    description: 'A long-range jet with your initials on the tail and a crew on call.',
    yearly: { stress: -3, happiness: 2 },
    freeTime: 1,
    now: { fame: 2 },
  },
  {
    id: 'superyacht',
    tier: 'wealthy',
    label: 'A superyacht',
    emoji: '🛳️',
    cost: 45000000,
    upkeep: 4500000,
    kind: 'own',
    growth: [-0.06, 0.03],
    description: 'Eighty metres, a helipad, a crew of thirty, and a name you agonised over.',
    yearly: { happiness: 3, fame: 1 },
    perks: { romance: 0.08, social: 0.06 },
    now: { fame: 3 },
  },
  {
    id: 'island',
    tier: 'wealthy',
    label: 'A private island',
    emoji: '🏝️',
    cost: 30000000,
    upkeep: 1000000,
    kind: 'own',
    growth: [0.03, 0.05],
    description: 'White sand, one jetty, and a staff who know which coconut you prefer.',
    yearly: { happiness: 2, stress: -3 },
  },
  {
    id: 'museum_wing',
    tier: 'wealthy',
    label: 'Fund a museum wing',
    emoji: '🏛️',
    cost: 25000000,
    upkeep: 0,
    kind: 'once',
    description: 'Your name carved over a doorway in a building that will outlast you.',
    now: { fame: 8, karma: 10, happiness: 6 },
  },
  {
    id: 'newspaper',
    tier: 'wealthy',
    label: 'Buy a newspaper',
    emoji: '📰',
    cost: 80000000,
    upkeep: 5000000,
    kind: 'own',
    growth: [-0.05, 0.05],
    description:
      'A famous old title, losing money with great dignity. Editors now take your calls.',
    yearly: { fame: 2 },
    perks: { work: 0.04, social: 0.03 },
  },
  // Absurdly rich
  {
    id: 'sports_team',
    tier: 'ultra',
    label: 'Buy a professional sports team',
    emoji: '🏟️',
    cost: 2500000000,
    upkeep: 0,
    kind: 'own',
    growth: [0.08, 0.06],
    special: 'team',
    description:
      'A franchise, a stadium box, and a city that will blame you personally for every loss.',
    yearly: { fame: 3, stress: 2 },
    now: { fame: 10 },
  },
  {
    id: 'space_suborbital',
    tier: 'rich',
    label: 'A suborbital spaceflight',
    emoji: '🚀',
    cost: 450000,
    upkeep: 0,
    kind: 'once',
    fromYear: 2021,
    description: 'Ten minutes, four of them weightless, and the curve of the Earth in the window.',
    now: { happiness: 15, fame: 3 },
  },
  {
    id: 'space_orbit',
    tier: 'ultra',
    label: 'A week in orbit',
    emoji: '🛰️',
    cost: 55000000,
    upkeep: 0,
    kind: 'once',
    fromYear: 2022,
    description:
      'Training, a launch that shakes your teeth, and a week looking down at everything.',
    now: { happiness: 25, fame: 12 },
  },
  {
    id: 'pledge',
    tier: 'ultra',
    label: 'Pledge to give away half your fortune',
    emoji: '🎁',
    cost: 0,
    upkeep: 0,
    kind: 'once',
    fromYear: 2010,
    description:
      'You sign the pledge publicly. Half of everything goes to good causes, over time and on your terms.',
    now: { fame: 10, karma: 30, happiness: 10 },
  },
];

export const LIFESTYLE_BY_ID: Record<string, LifestyleDef> = Object.fromEntries(
  LIFESTYLE.map((l) => [l.id, l]),
);
