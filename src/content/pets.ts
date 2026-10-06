/** Animals you can share a life with. Costs are 2026 reference dollars. */
export type PetKindDef = {
  id: string;
  label: string;
  emoji: string;
  /** Typical lifespan in years, [usual, longest]. */
  lifespan: [number, number];
  adoptCost: number;
  upkeep: number;
  /** How much of your mood they lift when the bond is strong. */
  joy: number;
  /** Takes daily walks (a little health for you). */
  walks: boolean;
  names: string[];
  blurb: string;
};

export const PET_KINDS: PetKindDef[] = [
  {
    id: 'dog',
    label: 'Dog',
    emoji: '🐕',
    lifespan: [12, 16],
    adoptCost: 300,
    upkeep: 1400,
    joy: 3,
    walks: true,
    names: [
      'Biscuit',
      'Juniper',
      'Moose',
      'Pepper',
      'Otis',
      'Waffles',
      'Hazel',
      'Rufus',
      'Mabel',
      'Kip',
    ],
    blurb: 'Loyal, loud and always pleased to see you. Needs walks, whatever the weather.',
  },
  {
    id: 'cat',
    label: 'Cat',
    emoji: '🐈',
    lifespan: [13, 19],
    adoptCost: 150,
    upkeep: 900,
    joy: 2,
    walks: false,
    names: [
      'Miso',
      'Clementine',
      'Ziggy',
      'Tofu',
      'Professor',
      'Nutmeg',
      'Luna',
      'Gus',
      'Pickle',
      'Saffron',
    ],
    blurb: 'Affection on their own terms. Will sit on whatever you are reading.',
  },
  {
    id: 'rabbit',
    label: 'Rabbit',
    emoji: '🐇',
    lifespan: [8, 12],
    adoptCost: 80,
    upkeep: 600,
    joy: 2,
    walks: false,
    names: ['Thumper', 'Clover', 'Dandelion', 'Pip', 'Barnaby', 'Mochi', 'Flopsy', 'Bramble'],
    blurb: 'Soft, curious and quietly destroying every cable in the house.',
  },
  {
    id: 'hamster',
    label: 'Hamster',
    emoji: '🐹',
    lifespan: [2, 3],
    adoptCost: 25,
    upkeep: 150,
    joy: 1,
    walks: false,
    names: ['Nibbles', 'Peanut', 'Hercules', 'Button', 'Squeak', 'Doughnut'],
    blurb: 'A tiny friend who runs a marathon every night, right by your bed.',
  },
  {
    id: 'parrot',
    label: 'Parrot',
    emoji: '🦜',
    lifespan: [30, 60],
    adoptCost: 900,
    upkeep: 700,
    joy: 2,
    walks: false,
    names: ['Captain', 'Kiwi', 'Mango', 'Sergeant', 'Polly', 'Rio', 'Admiral'],
    blurb: 'Bright, loud and long-lived. May outlive you, and will repeat what you say.',
  },
  {
    id: 'fish',
    label: 'Goldfish',
    emoji: '🐠',
    lifespan: [5, 12],
    adoptCost: 20,
    upkeep: 100,
    joy: 1,
    walks: false,
    names: ['Bubbles', 'Goldie', 'Captain Fin', 'Sushi', 'Admiral Splash', 'Gill'],
    blurb: 'Calm, cheap and surprisingly good company at three in the morning.',
  },
  {
    id: 'tortoise',
    label: 'Tortoise',
    emoji: '🐢',
    lifespan: [50, 90],
    adoptCost: 400,
    upkeep: 300,
    joy: 1,
    walks: false,
    names: ['Sheldon', 'Methuselah', 'Speedy', 'Gertrude', 'Atlas', 'Bartholomew'],
    blurb: 'Slow, patient and very likely to be left to someone in your will.',
  },
  {
    id: 'horse',
    label: 'Horse',
    emoji: '🐎',
    lifespan: [25, 32],
    adoptCost: 6000,
    upkeep: 9000,
    joy: 3,
    walks: true,
    names: ['Duchess', 'Thunder', 'Biscuit', 'Maverick', 'Willow', 'Comet'],
    blurb:
      'A big animal with a big appetite and a bigger personality. Needs a stable and a budget.',
  },
];

export const PET_BY_ID: Record<string, PetKindDef> = Object.fromEntries(
  PET_KINDS.map((p) => [p.id, p]),
);
