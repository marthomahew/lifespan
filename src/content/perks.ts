/**
 * Job perks with real effects (the rest are flavour). Matched against each job's perk text.
 * medical: multiplier on medical bills; pension: multiplier on the pension;
 * bonus: share of salary paid as a bonus at top performance; stress: job stress shift;
 * happiness: shift in the yearly happiness target.
 */
export type PerkEffect = {
  medical?: number;
  pension?: number;
  bonus?: number;
  stress?: number;
  happiness?: number;
};

export type PerkRule = { pattern: RegExp; effect: PerkEffect; note: string };

export const PERK_RULES: PerkRule[] = [
  {
    pattern: /health insurance|union benefits|team physio|free flu shots/i,
    effect: { medical: 0.5 },
    note: 'medical bills half price',
  },
  { pattern: /pension/i, effect: { pension: 1.25 }, note: 'pension +25%' },
  {
    pattern: /stock options/i,
    effect: { bonus: 0.15 },
    note: 'up to 15% of salary a year, if you perform',
  },
  {
    pattern: /bonus|commission/i,
    effect: { bonus: 0.1 },
    note: 'up to 10% of salary a year, if you perform',
  },
  { pattern: /\btips?\b|tip jar/i, effect: { bonus: 0.08 }, note: 'up to 8% extra in tips' },
  {
    pattern: /remote work|flexible hours|three-day weeks|summers off|sabbaticals/i,
    effect: { stress: -8 },
    note: 'less job stress',
  },
  {
    pattern:
      /free snacks|on the house|employee discount|comfortable chair|unlimited|dog affection|golf on weekdays/i,
    effect: { happiness: 2 },
    note: 'a little happier',
  },
];
