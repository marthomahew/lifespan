/** Kinds of business you can found (SPEC §5.6 money, extended). Amounts are reference dollars. */
export type BusinessKind = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  /** What it costs to open. */
  startCost: number;
  /** Profit in a steady year at the first level (more at each level up). */
  profit: number;
  /** How wildly a year can swing (0.2 steady, 0.6 a coin toss). */
  volatility: number;
  /** A skill that helps it thrive. */
  skill?: string;
  /** Worth more as a story than as a cash machine (startups): value grows faster than profit. */
  growth?: boolean;
  /** Ideas for a name; {last} is your surname. */
  names: string[];
};

export const BUSINESS_KINDS: BusinessKind[] = [
  {
    id: 'cafe',
    label: 'Café',
    emoji: '☕',
    description:
      'Good coffee, a cake you are famous for, and regulars who think they own the corner table.',
    startCost: 60000,
    profit: 24000,
    volatility: 0.25,
    skill: 'cooking',
    names: ['The Corner Cup', 'Bean There', '{last}’s', 'The Daily Grind', 'Second Breakfast'],
  },
  {
    id: 'shop',
    label: 'Shop',
    emoji: '🛍️',
    description:
      'Shelves you chose yourself, a bell over the door, and a cat that came with the lease.',
    startCost: 50000,
    profit: 20000,
    volatility: 0.25,
    skill: 'art',
    names: ['{last} & Daughters', 'Odds and Ends', 'The Little Shop', 'Hidden Gem', 'Paper Moon'],
  },
  {
    id: 'restaurant',
    label: 'Restaurant',
    emoji: '🍽️',
    description: 'Long nights, a hot kitchen, and the best room in town when it all goes right.',
    startCost: 150000,
    profit: 55000,
    volatility: 0.35,
    skill: 'cooking',
    names: ['{last}’s Kitchen', 'The Long Table', 'Salt & Smoke', 'Olive Grove', 'The Copper Pot'],
  },
  {
    id: 'tech',
    label: 'Tech startup',
    emoji: '💻',
    description:
      'Two laptops, one big idea, and investors who want a hockey-stick graph by spring.',
    startCost: 40000,
    profit: 10000,
    volatility: 0.6,
    skill: 'programming',
    growth: true,
    names: ['Loopwise', 'Brightstack', 'Northlight Labs', 'Kitebird', 'Fieldnote'],
  },
  {
    id: 'builders',
    label: 'Building firm',
    emoji: '🏗️',
    description: 'Vans, ladders, a yard full of materials, and clients who want it done by Friday.',
    startCost: 80000,
    profit: 40000,
    volatility: 0.3,
    names: ['{last} & Sons Builders', 'Solid Ground', 'Keystone Construction', 'Level Best'],
  },
  {
    id: 'studio',
    label: 'Design studio',
    emoji: '🎨',
    description: 'Big windows, bigger ideas, and clients who want it “more pop”.',
    startCost: 30000,
    profit: 18000,
    volatility: 0.3,
    skill: 'art',
    names: ['Studio {last}', 'Fold & Form', 'Good Eye', 'Blank Page', 'Hue & Cry'],
  },
  {
    id: 'farm',
    label: 'Farm',
    emoji: '🚜',
    description: 'Fields, weather, early mornings and the long patience of land.',
    startCost: 200000,
    profit: 32000,
    volatility: 0.3,
    names: ['{last} Farm', 'Hollow Brook Farm', 'Long Meadow', 'Windrow Acres'],
  },
  {
    id: 'firm',
    label: 'Accounting firm',
    emoji: '💼',
    description:
      'Spreadsheets, deadlines, and clients who bring their receipts in a shoebox in April.',
    startCost: 70000,
    profit: 45000,
    volatility: 0.2,
    names: ['{last} & Partners', 'Ledger & Line', 'Balance Sheet Co.', 'True North Accounts'],
  },
];

export const BUSINESS_BY_ID: Record<string, BusinessKind> = Object.fromEntries(
  BUSINESS_KINDS.map((k) => [k.id, k]),
);

/** Profit multiplier at each level (1 = one site, 5 = a chain). */
export const LEVEL_MULT = [1, 2.2, 4, 7, 12];
export const LEVEL_NAMES = ['One site', 'Growing', 'Established', 'Regional', 'A household name'];
