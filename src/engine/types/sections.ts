import type { Tenancy } from '../systems/lettings';
import type { Category, ViceKey } from './core';

export type Lifestyle = 'frugal' | 'normal' | 'lavish';
export type Housing = 'parents' | 'renting' | 'owning' | 'prison' | 'barracks';

export type LoanKind = 'student' | 'mortgage' | 'personal' | 'debt';
export type Loan = {
  id: number;
  kind: LoanKind;
  principal: number;
  balance: number;
  /** Annual rate, e.g. 0.05. */
  rate: number;
  termYears: number;
  payment: number;
  yearsPaid: number;
  missed: number;
  /** Asset id the loan is secured against. */
  collateral?: number;
};

export type InvestKey = 'bonds' | 'index' | 'growth' | 'coin';

export type FinanceReport = {
  year: number;
  salary: number;
  otherIncome: number;
  tax: number;
  living: number;
  housing: number;
  loanPayments: number;
  interest: number;
  investReturn: number;
  maintenance: number;
  vices: number;
  net: number;
};

export type MoneyState = {
  /** All money is local currency, nominal. */
  cash: number;
  savings: number;
  savingsRate: number;
  holdings: Record<InvestKey, number>;
  loans: Loan[];
  nextLoanId: number;
  lifestyle: Lifestyle;
  last: FinanceReport | null;
  /** [year, net worth local, net worth in reference dollars]. */
  history: [number, number, number][];
  /** Court-ordered yearly payments to an ex (local currency). */
  alimony: { npcId: number; amount: number; years: number }[];
};

export type Degree = {
  level:
    'high_school' | 'associate' | 'bachelor' | 'master' | 'doctorate' | 'law' | 'medicine' | 'mba';
  field: string;
  gpa: number;
  year: number;
};

export type Enrollment = {
  kind: 'university' | 'community' | 'grad';
  programId: string;
  year: number;
  length: number;
  gradeSum: number;
  tuition: number;
  scholarship: boolean;
};

export type EducationState = {
  /** 0..100 rolling school grade. */
  grade: number;
  /** The grade on the last report card, for the trend. */
  reportGrade?: number;
  inSchool: boolean;
  droppedOut: boolean;
  enrollment: Enrollment | null;
  degrees: Degree[];
  residency: number;
  veteranBenefit: boolean;
  studyYear: number;
};

export type JobRecord = {
  jobId: string;
  title: string;
  from: number;
  to: number | null;
  reason: string;
};

export type CareerState = {
  jobId: string | null;
  level: number;
  since: number;
  performance: number;
  salary: number;
  /** The best full-time pay you have had (pensions use it if you're between jobs). */
  peakSalary?: number;
  partTimeId: string | null;
  history: JobRecord[];
  retired: boolean;
  pension: number;
  yearsWorked: number;
  workedHarder: number;
  appliedThisYear: string[];
  freelanceYear: number;
  /** The last career crossroads (absent in older saves). */
  crossroadsYear?: number;
};

export type MilitaryState = {
  branch: string;
  specialty: string;
  officer: boolean;
  rank: number;
  since: number;
  deployed: boolean;
  deployments: number;
  medals: string[];
  conduct: number;
  discharge: string | null;
  active: boolean;
  /** Years served (frozen at discharge). */
  years: number;
};

export type MusicState = {
  stage: number;
  act: 'solo' | 'band' | null;
  label: string | null;
  releases: { year: number; title: string; quality: number }[];
  touring: boolean;
  lastWork: number;
};

export type Illness = {
  id: string;
  since: number;
  severity: number;
  treated: number;
  /** Treatments in a row that didn't work (absent in older saves). */
  fails?: number;
};

export type InjuryTier = 'minor' | 'major' | 'serious';
export type Injury = {
  kind: string;
  tier: InjuryTier;
  year: number;
  /** Years of healing left. */
  healsIn: number;
  /** Healed badly: a small permanent drag until surgery. */
  lingering: boolean;
  physioYear: number;
};

export type HealthState = {
  illnesses: Illness[];
  lastDoctor: number;
  /** Lifetime count, bruises included. */
  injuries: number;
  injuryList: Injury[];
  surgeryCount: number;
  lowHappyYears: number;
  highStressYears: number;
  gymYear: number;
  dietYear: number;
};

export type ViceState = {
  levels: Record<ViceKey, number>;
  lastUse: Record<ViceKey, number>;
  rehab: number;
  sober: number;
};

export type CrimeRecord = {
  crimeId: string;
  year: number;
  age: number;
  verdict: 'convicted' | 'acquitted' | 'plea' | 'dropped';
  sentenceYears: number;
  juvenile: boolean;
};

export type LegalCase = {
  crimeId: string;
  bail: number;
  stage: 'arrested' | 'charged';
  lawyer: 'public' | 'standard' | 'elite' | null;
};

export type LegalState = {
  record: CrimeRecord[];
  sealed: boolean;
  case: LegalCase | null;
  prison: { years: number; served: number; crimeId: string; behaviour: number } | null;
  probation: number;
  escapes: number;
  /** On the run after an escape: the years still owed. */
  fugitive?: { since: number; owed: number; crimeId: string } | null;
  /** The year you last walked out through the gate (not over the fence). */
  releasedYear?: number;
};

export type Home = {
  id: number;
  type: string;
  name: string;
  value: number;
  paid: number;
  condition: number;
  bought: number;
  city: string;
  country: string;
  livingIn: boolean;
  /** Let to a tenant (a home you own but don't live in). */
  let?: Tenancy | null;
};
export type Vehicle = {
  id: number;
  model: string;
  value: number;
  paid: number;
  condition: number;
  bought: number;
};
export type Possession = {
  id: number;
  item: string;
  value: number;
  paid: number;
  condition: number;
  bought: number;
};
export type HomeListing = { type: string; name: string; price: number; condition: number };

export type AssetState = {
  homes: Home[];
  vehicles: Vehicle[];
  possessions: Possession[];
  listings: HomeListing[];
  listingsYear: number;
  nextAssetId: number;
  licence: boolean;
  housing: Housing;
  rent: number;
};

export type Will = { heirs: { npcId: number; share: number }[]; written: number | null };

export type EventMeta = {
  lastFired: Record<string, number>;
  counts: Record<string, number>;
  categoryLast: Partial<Record<Category, number>>;
  popupsThisYear: number;
  noticesThisYear: number;
};

export type Pregnancy = { due: number; partnerId: number; carrier: 'player' | 'partner' };

export type FamilyState = {
  pregnancy: Pregnancy | null;
  adoptions: number;
  /** Children whose primary home is with an ex after a divorce. */
  custodyLost: number[];
};

/** How often activities and interactions have been used this year (limits per year). */
export type UsageState = { year: number; used: Record<string, number> };
