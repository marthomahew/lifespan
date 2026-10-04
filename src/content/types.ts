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

export type SkillDef = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  /** Odds domains the skill boosts at 100 (scaled linearly). */
  odds: Partial<Record<OddsKey, number>>;
};

export type LanguageDef = { id: string; label: string };

export type InteractionOutcome = {
  /** One is picked at random; {npc.*} tokens refer to the other person. */
  texts: string[];
  rel: [number, number];
  memory: string;
  happiness?: number;
};

export type InteractionDef = {
  id: string;
  label: string;
  emoji: string;
  /** Who it applies to. */
  target: 'anyone' | 'family' | 'partner' | 'spouse' | 'engaged' | 'not_partner';
  minPlayerAge: number;
  minNpcAge: number;
  adultsOnly?: boolean;
  /** Base success chance at relationship 50. */
  base: number;
  /** Added per relationship point above 50 (negative below). */
  relWeight: number;
  /** Trait/skill odds domain that shifts the chance. */
  odds: 'social' | 'romance';
  /** Cost in reference dollars. */
  cost?: number;
  limitPerYear: number;
  success: InteractionOutcome;
  failure: InteractionOutcome;
  /** Engine behaviour beyond relationship and memory. */
  special?:
    | 'ask_money'
    | 'advice'
    | 'propose'
    | 'wedding'
    | 'therapy'
    | 'baby'
    | 'breakup'
    | 'divorce'
    | 'cut_off'
    | 'reconnect';
};

export type ActivityGroup =
  'mind_body' | 'social' | 'love' | 'money' | 'fun' | 'crime' | 'travel' | 'admin';

/** An activity outcome: a weighted text plus event-style effects (see src/engine/events/types.ts Effect). */
export type ActivityOutcome = {
  chance: number;
  text: string;
  /** Effects in the same shape as event effects. */
  effects: import('../engine/events/types').Effect[];
  success?: boolean;
};

export type ActivityDef = {
  id: string;
  label: string;
  emoji: string;
  group: ActivityGroup;
  description: string;
  ages: [number, number];
  adultsOnly?: boolean;
  /** Earliest world year (the dating app arrives in 2012). */
  minYear?: number;
  /** Cost in reference dollars. */
  cost?: number;
  limitPerYear: number;
  /** At least three outcome texts. */
  outcomes: ActivityOutcome[];
  /** Engine behaviour on top of the outcome (meeting people, wills, ...). */
  special?: string;
};

export type EducationLevel =
  | 'none'
  | 'high_school'
  | 'associate'
  | 'bachelor'
  | 'master'
  | 'doctorate'
  | 'law'
  | 'medicine'
  | 'mba';

export type JobRequirements = {
  minAge: number;
  /** Minimum education; 'bachelor' is met by any higher degree too. law/medicine/mba/doctorate are specific. */
  education?: EducationLevel;
  /** If set, the degree must be in one of these major ids. */
  majors?: string[];
  smarts?: number;
  looks?: number;
  health?: number;
  /** Skill id -> minimum level. */
  skills?: Record<string, number>;
  /** No adult criminal record. */
  cleanRecord?: boolean;
  /** Needs a driving licence. */
  licence?: boolean;
  /** Veterans get priority (counts as met for veterans even without the education). */
  veteranBonus?: boolean;
};

export type JobDef = {
  id: string;
  field: string;
  /** One title per level, lowest first (3–5 levels). */
  titles: string[];
  /** Yearly salary range per level in reference dollars, same length as titles. */
  salary: [number, number][];
  req: JobRequirements;
  /** 0..100 */
  stress: number;
  /** Extra yearly death risk while employed, as a fraction (0.3 = ×1.3). Most jobs 0. */
  risk: number;
  perks: string[];
  description: string;
  /** Part-time jobs for ages 14–17 (and anyone who wants one). */
  partTime?: boolean;
};

export type MajorDef = {
  id: string;
  label: string;
  field: string;
  smarts: number;
  description: string;
};

export type GradProgramDef = {
  id: 'law' | 'medicine' | 'mba' | 'phd';
  label: string;
  degree: 'law' | 'medicine' | 'mba' | 'doctorate';
  years: number;
  /** Medicine adds residency years after graduating. */
  residency: number;
  smarts: number;
  /** Bachelor majors accepted (empty = any). */
  majors: string[];
  /** Years of work experience needed (MBA). */
  workYears: number;
  /** Yearly tuition in reference dollars before the country's university model. */
  tuition: number;
  description: string;
};

export type MilitarySpecialtyDef = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  /** Extra death risk when deployed (fraction). */
  risk: number;
  /** Skills gained per year of service. */
  skills: Record<string, number>;
  /** Civilian job fields this specialty helps you get into. */
  civilianFields: string[];
};
