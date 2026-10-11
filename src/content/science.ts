import type { GameState } from '../engine/types';
import { COUNTRY_BY_ID } from './countries';

/**
 * Science as a pursuit: the fields a research life can be in, the projects it works on, the
 * journals it hopes to get into, who pays for it, and the prizes at the end of the corridor.
 */
export type ScienceField = 'life' | 'chem' | 'physics' | 'eng' | 'cs' | 'social' | 'humanities';

export const FIELD_LABEL: Record<ScienceField, string> = {
  life: 'life sciences',
  chem: 'chemistry',
  physics: 'physics',
  eng: 'engineering',
  cs: 'computer science',
  social: 'social sciences',
  humanities: 'the humanities',
};

/** Degree majors (and graduate programmes) to a field of research. */
export const MAJOR_FIELD: Record<string, ScienceField> = {
  biology: 'life',
  nursing: 'life',
  medicine: 'life',
  chemistry: 'chem',
  physics: 'physics',
  engineering: 'eng',
  computer_science: 'cs',
  psychology: 'social',
  economics: 'social',
  political_science: 'social',
  business: 'social',
  accounting: 'social',
  education: 'social',
  history: 'humanities',
  english: 'humanities',
  journalism: 'humanities',
  fine_art: 'humanities',
};

/** Research questions, by field. `{y}` is never used: titles are era-neutral unless dated. */
export const PROJECTS: Record<ScienceField, { title: string; from?: number }[]> = {
  life: [
    { title: 'why some cells forget to die' },
    { title: 'how a flatworm regrows its own head' },
    { title: 'the gut bacteria of long-lived mice' },
    { title: 'a protein that folds itself wrong on purpose' },
    { title: 'how bees decide where to live' },
    { title: 'the immune memory of a common cold' },
    { title: 'a gene that switches on only at night' },
    { title: 'what the olm does with its 100-year life' },
    { title: 'mapping a genome one stubborn stretch at a time', from: 1990 },
    { title: 'how tardigrades survive being boiled' },
    { title: 'the sense of smell in salmon finding home' },
    { title: 'a blood test for an early cancer', from: 1985 },
    { title: 'why some trees talk through their roots' },
    { title: 'the bacteria that live in clouds' },
    { title: 'how the brain files away a memory overnight' },
    { title: 'editing a gene with CRISPR without breaking its neighbours', from: 2013 },
    { title: 'a messenger-RNA vaccine that keeps in an ordinary fridge', from: 2005 },
    { title: 'how antibiotics stop working' },
  ],
  chem: [
    { title: 'a catalyst that does in minutes what took a week' },
    { title: 'a plastic that eats itself after a year' },
    { title: 'a cheaper way to split water' },
    { title: 'crystals that change colour under pressure' },
    { title: 'the chemistry of a better battery', from: 1985 },
    { title: 'pulling carbon dioxide out of thin air' },
    { title: 'a glue inspired by mussels' },
    { title: 'molecules shaped like tiny cages' },
    { title: 'why one wine ages and another turns' },
    { title: 'a greener route to an old painkiller' },
  ],
  physics: [
    { title: 'the faint glow left over from the Big Bang' },
    { title: 'a laser cold enough to stop atoms' },
    { title: 'how sand flows like a liquid and then does not' },
    { title: 'the magnetism of very thin films' },
    { title: 'neutrinos, and why they keep changing their minds' },
    { title: 'a superconductor that works a little warmer' },
    { title: 'the turbulence in a cup of coffee' },
    { title: 'two photons that behave as one', from: 1980 },
    { title: 'gravitational waves from colliding black holes', from: 1995 },
    { title: 'a qubit that stays a qubit for longer', from: 1998 },
  ],
  eng: [
    { title: 'a bridge that tells you when it is tired' },
    { title: 'a wing that changes shape in flight' },
    { title: 'a pump with no moving parts' },
    { title: 'concrete that heals its own cracks' },
    { title: 'a quieter jet engine' },
    { title: 'a prosthetic hand that can feel', from: 1985 },
    { title: 'a wind turbine for a city roof' },
    { title: 'a chip that runs on a hundredth of the power', from: 1975 },
    { title: 'a robot that can open any door', from: 1990 },
    { title: 'a solar cell printed like a newspaper', from: 2000 },
  ],
  cs: [
    { title: 'a faster way to sort very large lists' },
    { title: 'proving a program does what it says' },
    { title: 'a compiler that explains its own errors' },
    { title: 'routing messages around a broken network', from: 1970 },
    { title: 'teaching a computer to read handwriting', from: 1970 },
    { title: 'a database that never loses a write', from: 1975 },
    { title: 'searching the whole web in a blink', from: 1995 },
    { title: 'a neural network that knows when it does not know', from: 2010 },
    { title: 'a cipher a quantum computer cannot break', from: 1995 },
    { title: 'finding bugs before they find you' },
  ],
  social: [
    { title: 'why people save less than they mean to' },
    { title: 'how a rumour moves through a village' },
    { title: 'the long shadow of a recession on school-leavers' },
    { title: 'why some cities trust their neighbours' },
    { title: 'how children learn to share' },
    { title: 'what makes a protest grow' },
    { title: 'the price of a good night’s sleep' },
    { title: 'the economics of small family vineyards' },
    { title: 'why we keep choosing the middle option' },
    { title: 'how a second language changes the way you argue' },
  ],
  humanities: [
    { title: 'a forgotten diarist of the 1840s' },
    { title: 'the letters of a provincial printer' },
    { title: 'how a folk song travelled across three borders' },
    { title: 'the lost first draft of a famous poem' },
    { title: 'who really wrote a medieval recipe book' },
    { title: 'the language of shop signs in a port town' },
    { title: 'a painter everybody knew and nobody bought' },
    { title: 'the history of the weekend' },
    { title: 'border towns and the words they borrow' },
    { title: 'how a nation tells the story of its own founding' },
  ],
};

/** Where results go. Tier 0 is the very top; tier 3 takes almost anything sound. */
export const VENUES: Record<ScienceField, [string, string, string, string]> = {
  life: ['Nature', 'Cell', 'a respected field journal', 'an open-access journal'],
  chem: [
    'Science',
    'the Journal of the American Chemical Society',
    'a respected field journal',
    'an open-access journal',
  ],
  physics: [
    'Nature',
    'Physical Review Letters',
    'a respected field journal',
    'an open-access journal',
  ],
  eng: ['Science', 'Nature Materials', 'a respected field journal', 'a conference proceedings'],
  cs: ['Nature', 'a top conference', 'a respected field journal', 'a workshop at a big conference'],
  social: [
    'Science',
    'the leading journal in your field',
    'a respected field journal',
    'an open-access journal',
  ],
  humanities: [
    'a university press monograph',
    'the leading journal in your field',
    'a respected field journal',
    'an edited volume',
  ],
};

export const VENUE_TIER_LABEL = ['The very top', 'Top of the field', 'Solid journal', 'Sure thing'];

/** Who pays for research. Amounts are reference dollars a year; `intl` amounts are euros a year, as set in Brussels. */
export type Funder = {
  id: string;
  /** The funder's name in this life's country and year, or null when it isn't open to you. */
  name: (s: GameState, field: ScienceField) => string | null;
  /** What the money is called once you have it. */
  kind: string;
  amount: [number, number];
  years: number;
  odds: number;
  minRep: number;
  intl?: boolean;
  /** Pays you a stipend directly instead of funding a lab (Slovenia's young researchers). */
  stipend?: boolean;
  blurb: string;
};

const country = (s: GameState): string => s.player.country;
const nameOf = (s: GameState): string => COUNTRY_BY_ID[country(s)]?.name ?? 'your country';

/** EU membership, by year joined (and left). */
const EU: Record<string, [number, number?]> = {
  de: [1958],
  fr: [1958],
  it: [1958],
  nl: [1958],
  ie: [1973],
  uk: [1973, 2020],
  es: [1986],
  se: [1995],
  pl: [2004],
  si: [2004],
};
export function inEu(s: GameState): boolean {
  const e = EU[country(s)];
  return !!e && s.year >= e[0] && (e[1] === undefined || s.year < e[1]);
}

/** Slovenia's research funder through the years. */
function slovenianAgency(y: number): string {
  if (y < 1991) return 'the Research Community of Slovenia';
  if (y < 2004) return 'the Ministry of Science and Technology';
  if (y < 2023) return 'ARRS, the Slovenian Research Agency';
  return 'ARIS, the Slovenian Research and Innovation Agency';
}

function nationalFunder(s: GameState, f: ScienceField): string {
  const y = s.year;
  switch (country(s)) {
    case 'us':
      if (f === 'life') return 'the National Institutes of Health';
      if (f === 'humanities')
        return y >= 1965 ? 'the National Endowment for the Humanities' : 'a university fund';
      return y >= 1951 ? 'the National Science Foundation' : 'the Office of Naval Research';
    case 'uk':
      if (y >= 2018) return 'UKRI';
      return f === 'life'
        ? 'the Medical Research Council'
        : f === 'humanities'
          ? 'the British Academy'
          : f === 'social'
            ? 'the Social Science Research Council'
            : 'the Science Research Council';
    case 'si':
      return slovenianAgency(y);
    case 'de':
      return 'the DFG';
    case 'fr':
      return y >= 2005 ? 'the ANR' : 'the CNRS';
    case 'ca':
      return f === 'life' ? 'the Medical Research Council of Canada' : 'NSERC';
    case 'au':
      return 'the Australian Research Council';
    case 'jp':
      return 'JSPS';
    case 'se':
      return 'the Swedish Research Council';
    case 'nl':
      return 'NWO';
    case 'ie':
      return y >= 2000 ? 'Science Foundation Ireland' : 'the Irish research council';
    default:
      return `${nameOf(s)}'s national research council`;
  }
}

export const FUNDERS: Funder[] = [
  {
    id: 'seed',
    name: () => 'your own institution',
    kind: 'seed grant',
    amount: [8000, 25000],
    years: 1,
    odds: 0.65,
    minRep: 0,
    blurb: 'Small money for a first idea. Easy to get, and it gets you started.',
  },
  {
    id: 'young',
    name: (s) =>
      country(s) === 'si' && s.year >= 1985 && s.education.enrollment?.programId === 'phd'
        ? slovenianAgency(s.year)
        : null,
    kind: 'young researcher post',
    amount: [40000, 44000],
    years: 4,
    odds: 0.55,
    minRep: 0,
    stipend: true,
    blurb:
      'Slovenia pays its PhD students as employees: a salary, a desk and a mentor for four years.',
  },
  {
    id: 'national',
    name: (s, f) => nationalFunder(s, f),
    kind: 'project grant',
    amount: [120000, 400000],
    years: 3,
    odds: 0.24,
    minRep: 5,
    blurb: 'The bread and butter of a research life: three years of a small team.',
  },
  {
    id: 'programme',
    name: (s) => (country(s) === 'si' && s.year >= 1999 ? slovenianAgency(s.year) : null),
    kind: 'research programme',
    amount: [250000, 500000],
    years: 6,
    odds: 0.3,
    minRep: 40,
    blurb:
      'Six years of core funding for a whole group: the closest Slovenia has to tenure for a lab.',
  },
  {
    id: 'erc_starting',
    name: (s) =>
      inEu(s) && s.year >= 2007 && s.player.age <= 40 ? 'the European Research Council' : null,
    kind: 'Starting Grant',
    amount: [290000, 310000],
    years: 5,
    odds: 0.12,
    minRep: 25,
    intl: true,
    blurb: 'Europe’s big prize for young scientists: €1.5 million and five years of freedom.',
  },
  {
    id: 'erc_consolidator',
    name: (s) =>
      inEu(s) && s.year >= 2013 && s.player.age >= 36 && s.player.age <= 52
        ? 'the European Research Council'
        : null,
    kind: 'Consolidator Grant',
    amount: [390000, 410000],
    years: 5,
    odds: 0.13,
    minRep: 35,
    intl: true,
    blurb: '€2 million to build the group you always talked about over conference dinners.',
  },
  {
    id: 'erc_advanced',
    name: (s) =>
      inEu(s) && s.year >= 2008 && s.player.age >= 45 ? 'the European Research Council' : null,
    kind: 'Advanced Grant',
    amount: [490000, 510000],
    years: 5,
    odds: 0.12,
    minRep: 70,
    intl: true,
    blurb: '€2.5 million for a leader in the field with one more big idea.',
  },
  {
    id: 'eu_consortium',
    name: (s) => (inEu(s) && s.year >= 1984 ? 'an EU research consortium' : null),
    kind: 'EU consortium share',
    amount: [90000, 220000],
    years: 4,
    odds: 0.22,
    minRep: 15,
    intl: true,
    blurb:
      'Eleven partners in nine countries and a kick-off meeting in Brussels. Your share is real money.',
  },
  {
    id: 'foundation',
    name: (s, f) =>
      f === 'life'
        ? country(s) === 'uk'
          ? 'the Wellcome Trust'
          : country(s) === 'us' && s.year >= 1978
            ? 'the Howard Hughes Medical Institute'
            : 'a medical research charity'
        : f === 'humanities' || f === 'social'
          ? 'a private foundation'
          : 'a science philanthropy',
    kind: 'foundation grant',
    amount: [80000, 250000],
    years: 3,
    odds: 0.28,
    minRep: 20,
    blurb: 'Private money with fewer forms, and a donor who likes a good story.',
  },
  {
    id: 'industry',
    name: (_s, f) =>
      f === 'life'
        ? 'a pharmaceutical company'
        : f === 'chem'
          ? 'a chemicals firm'
          : f === 'cs'
            ? 'a technology company'
            : f === 'eng' || f === 'physics'
              ? 'an engineering firm'
              : null,
    kind: 'industry contract',
    amount: [60000, 300000],
    years: 2,
    odds: 0.35,
    minRep: 10,
    blurb: 'A company pays for work it can use. Good money, and a consulting fee for you.',
  },
];

export const FUNDER_BY_ID: Record<string, Funder> = Object.fromEntries(
  FUNDERS.map((f) => [f.id, f]),
);

/** The national science prize, the academy, and the big international one, as this life sees them. */
export function nationalPrize(s: GameState): string {
  switch (country(s)) {
    case 'si':
      return s.year < 1991 ? 'the Kidrič Award' : 'the Zois Award';
    case 'us':
      return s.year >= 1962 ? 'the National Medal of Science' : 'a national science medal';
    case 'uk':
      return 'a Royal Society medal';
    default:
      return `${nameOf(s)}'s national science prize`;
  }
}

export function academy(s: GameState): string {
  switch (country(s)) {
    case 'si':
      return 'the Slovenian Academy of Sciences and Arts';
    case 'us':
      return 'the National Academy of Sciences';
    case 'uk':
      return 'the Royal Society';
    default:
      return `${nameOf(s)}'s academy of sciences`;
  }
}

/** The top of the field: a Nobel where there is one. */
export function topPrize(s: GameState, f: ScienceField): string | null {
  if (f === 'life') return 'the Nobel Prize in Physiology or Medicine';
  if (f === 'chem') return 'the Nobel Prize in Chemistry';
  if (f === 'physics') return 'the Nobel Prize in Physics';
  if (f === 'social') return s.year >= 1969 ? 'the Nobel Prize in Economics' : null;
  if (f === 'cs') return s.year >= 1966 ? 'the Turing Award' : null;
  if (f === 'eng') return s.year >= 2013 ? 'the Queen Elizabeth Prize for Engineering' : null;
  return s.year >= 1961 ? 'the Balzan Prize' : null;
}

/** Where a research job is, for the record. */
export function institutionFor(s: GameState, job: string, seed: number): string {
  const c = country(s);
  const y = s.year;
  if (c === 'si') {
    if (job === 'research_scientist' || job === 'chemist')
      return seed % 3 === 2 && job === 'chemist' && y >= 1946
        ? 'the National Institute of Chemistry'
        : 'the Jožef Stefan Institute';
    const unis = ['the University of Ljubljana'];
    if (y >= 1975) unis.push('the University of Maribor');
    if (y >= 2003) unis.push('the University of Primorska');
    if (y >= 2006) unis.push('the University of Nova Gorica');
    return unis[seed % unis.length] ?? 'the University of Ljubljana';
  }
  if (job === 'professor' || job === 'phd') return 'your university';
  if (job === 'doctor') return 'your teaching hospital';
  if (job === 'environmental_scientist') return 'your environmental agency';
  return 'your institute';
}

/** Lab life: one of these when a year's research goes by. */
export const LAB_LINES = [
  'The centrifuge makes a noise like a dying goose, and you keep going anyway.',
  'You spend a week on one figure and the reviewers will spend a minute on it.',
  'A student asks a question you cannot answer, which is the best kind.',
  'The data refuse to say anything interesting for months, then say it all at once.',
  'You rewrite the same paragraph nine times and keep the second version.',
  'The coffee machine breaks and research slows to a crawl until it is fixed.',
  'A collaborator’s email arrives at 2 a.m. with the subject line “wait”.',
  'You find a mistake in your own code before anyone else does. A small, private victory.',
];

/** What Reviewer 2 says. */
export const REVIEWER_TWO = [
  'Reviewer 2 asks why you did not do an entirely different study.',
  'Reviewer 2 suggests citing eleven papers, nine of them by Reviewer 2.',
  'Reviewer 2 finds the conclusions “premature” and the font “distracting”.',
  'Reviewer 2 writes one line: “I am not convinced.” Nothing else.',
  'Reviewer 2 wants more experiments, a bigger sample and, implicitly, a time machine.',
];

/** The journal for a tier, as the era had it: open access is a 2000s idea, and so are some titles. */
export function venueFor(s: GameState, f: ScienceField, tier: number): string {
  const v = VENUES[f][tier] ?? 'a journal';
  if (v === 'an open-access journal' && s.year < 2000) return 'a smaller journal';
  if (v === 'Nature Materials' && s.year < 2002) return 'a leading materials journal';
  if (v === 'a top conference' && s.year < 1980) return 'the leading journal in your field';
  return v;
}

export const PROPOSAL_LINES = [
  'You send a proposal to {name}: forty pages, a budget that adds up, and a title you are proud of.',
  'A proposal goes off to {name} at 11:58 p.m., two minutes before the portal closes.',
  'You and a colleague spend a month on a proposal to {name}, and agree on the title in the last hour.',
  'Your proposal to {name} has a figure so good you almost frame it.',
  'You send {name} a proposal after the department’s grant office reads it and changes every comma.',
];
export const SEED_LINES = [
  'You ask {name} for a little money to try an idea: two pages and a hopeful paragraph.',
  'A short application to {name}: enough for a student’s summer and some reagents.',
  'You fill in {name}’s one-page form for pilot money, and attach a very confident diagram.',
];
export const REJECT_LINES = [
  'The panel scored it “excellent”, which this year was not enough.',
  'One reviewer loved it; the other thought it was about something else entirely.',
  'It came close: just below the line, the letter says, in a sentence clearly written for many people.',
  'The money went to fewer projects than ever this year.',
];
export const LECTURE_LINES = [
  'You give a public lecture on {field}. A child in the front row asks the best question of the night.',
  'You talk about {field} on the radio and are recognised the next day by the woman at the bakery.',
  'A lecture on {field} in a packed library hall. Someone asks whether it will be on the test.',
  'You explain {field} at a science festival using a balloon, a torch and great confidence.',
  'A school invites you to talk about {field}. Thirty hands go up at once, all asking about explosions.',
];
