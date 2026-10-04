/** Shapes for content data modules. Engine code reads these; content never imports engine logic. */

export type TaxBand = {
  /** Upper bound of the band in reference dollars of income; null = no cap. */ upTo: number | null;
  rate: number;
};

export type Country = {
  id: string;
  name: string;
  flag: string;
  demonym: string;
  currency: {
    code: string;
    symbol: string;
    /** Local units per US dollar. */ perUsd: number;
    decimals: 0 | 2;
  };
  /** Prices relative to the US (1.0). */
  priceLevel: number;
  /** Wages relative to the US (1.0). */
  wageLevel: number;
  taxBands: TaxBand[];
  ages: {
    drinking: number;
    driving: number;
    marriage: number;
    voting: number;
    schoolLeaving: number;
    enlist: number;
    retirement: number;
  };
  conscription: { required: boolean; years: number; minAge: number; maxAge: number };
  university: {
    model: 'free' | 'cheap' | 'expensive';
    /** Yearly tuition in reference dollars. */ tuition: number;
  };
  healthcare: {
    model: 'public' | 'mixed' | 'private';
    /** Multiplier on treatment costs. */ costMult: number;
  };
  /** Multiplier on prison sentences. */
  sentencing: number;
  /** Base mortgage rate. */
  mortgageRate: number;
  /** Yearly state pension per year worked, in reference dollars. */
  pensionPerYear: number;
  languages: string[];
  cities: string[];
  names: { male: string[]; female: string[]; last: string[] };
};

export type StatKeyC =
  | 'happiness'
  | 'health'
  | 'smarts'
  | 'looks'
  | 'karma'
  | 'discipline'
  | 'fertility'
  | 'stress'
  | 'fame'
  | 'notoriety';

/** Success-odds domains that traits and skills can modify. */
export type OddsKey =
  'social' | 'romance' | 'work' | 'study' | 'crime' | 'creative' | 'athletic' | 'money';

export type CategoryC =
  | 'family'
  | 'school'
  | 'social'
  | 'romance'
  | 'work'
  | 'money'
  | 'health'
  | 'crime'
  | 'military'
  | 'fame'
  | 'travel'
  | 'world'
  | 'random';

export type Trait = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  /** Yearly stat drift added to the baseline pull. */
  drift: Partial<Record<StatKeyC, number>>;
  /** Event-weight multipliers by category. */
  eventWeight: Partial<Record<CategoryC, number>>;
  /** Additive success-odds modifiers (0.1 = +10 points). */
  odds: Partial<Record<OddsKey, number>>;
  /** Traits that can't coexist with this one. */
  excludes: string[];
};

export type AchievementDef = {
  id: string;
  label: string;
  emoji: string;
  description: string;
};

export type Treatment =
  'doctor' | 'specialist' | 'surgery' | 'alternative' | 'therapy' | 'medication';

export type IllnessDef = {
  id: string;
  label: string;
  emoji: string;
  /** What you notice: "A cough that won't quit." */
  symptom: string;
  /** Starting severity range 0..100. */
  severity: [number, number];
  chronic: boolean;
  mental?: boolean;
  onset: {
    ages: [number, number];
    /** Base yearly chance of onset. */
    base: number;
    /** Multipliers from vices, low health, stress, and family history. */
    vice?: {
      key: 'alcohol' | 'smoking' | 'gambling' | 'party_drugs' | 'pills' | 'hard_drugs';
      mult: number;
    };
    lowHealth?: number;
    stress?: number;
    hereditary?: number;
  };
  /** Severity added each year untreated (negative means it fades on its own). */
  progression: number;
  /** Mortality multiplier at severity 100: hazard × (1 + deathFactor × severity / 100). */
  deathFactor: number;
  /** Success odds per treatment, 0..1; missing means it doesn't help. */
  treatments: Partial<Record<Treatment, number>>;
  /** Cost of a treatment in reference dollars (before the country's healthcare multiplier). */
  cost: number;
  /** Yearly stat effects while active. */
  effects: { happiness?: number; health?: number; looks?: number; smarts?: number };
};
