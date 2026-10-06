import { COUNTRIES, COUNTRY_BY_ID } from '../content/countries';
import { FAMILY_WEALTH, PARENT_JOBS, SKIN_TONES } from '../content/family';
import { TRAIT_BY_ID } from '../content/traits';
import { Ctx } from './ctx';
import { addNpc, randomName, randomSurname, randomTraits } from './npc';
import { seedRng } from './rng';
import { applyLocks } from './stats';
import {
  SCHEMA_VERSION,
  type Attraction,
  type Gender,
  type Npc,
  type GameState,
  type Stats,
  type VisibleStat,
  type WealthTier,
  type Look,
  type ParentSetup,
} from './types';
import { clampStat } from './util';
import { refToLocal } from './economy';
import { cleanLook, DEFAULT_LOOK, lookRng, randomLook, skinsForTone, toneOf } from './look';
import { SKILL_BY_ID } from '../content/skills';
import { CHALLENGE_BY_ID } from '../content/challenges';

export type NewLifeOptions = {
  first?: string;
  last?: string;
  gender?: Gender;
  attraction?: Attraction;
  country?: string;
  city?: string;
  birthYear?: number;
  /** Skin-tone modifier ('' for the default yellow). */
  appearance?: string;
  traits?: string[];
  stats?: Partial<Record<VisibleStat, number>>;
  wealth?: WealthTier;
  popupsPerYear?: number;
  /** Any features picked in the builder; the rest are rolled. */
  look?: Partial<Look>;
  /** A skill you were born with a gift for. */
  talent?: string;
  /** Who raised you. */
  parents?: ParentSetup;
  /** 0–4 older siblings and younger ones still to come are rolled as usual. */
  siblings?: number;
  /** Start as a challenge (its setup is merged in by the caller). */
  challenge?: string;
};

const HEREDITARY = [
  'heart_disease',
  'type_2_diabetes',
  'high_blood_pressure',
  'asthma',
  'migraines',
  'depression',
  'arthritis',
];

export const WEALTH_TIERS: WealthTier[] = ['poor', 'working', 'middle', 'comfortable', 'rich'];
export const MIN_BIRTH_YEAR = 1940;
export const MAX_BIRTH_YEAR = 2030;

export function emptyState(seed: number): GameState {
  return {
    schemaVersion: SCHEMA_VERSION,
    lifeId: '',
    seed,
    rng: seedRng(seed),
    year: 2000,
    inflation: 1,
    inflationMult: 1,
    player: {
      first: '',
      last: '',
      gender: 'female',
      attraction: 'men',
      appearance: '',
      look: DEFAULT_LOOK,
      talent: null,
      age: 0,
      birthYear: 2000,
      birthCountry: 'us',
      birthCity: '',
      country: 'us',
      city: '',
      wealth: 'middle',
      traits: [],
      stats: {
        happiness: 80,
        health: 90,
        smarts: 20,
        looks: 50,
        karma: 50,
        discipline: 50,
        fertility: 0,
        stress: 10,
        fame: 0,
        notoriety: 0,
      },
      skills: {},
      skillPractice: {},
      languages: {},
      flags: [],
      achievements: [],
      aspirations: [],
      parentIds: [],
      genes: { looks: 50, smarts: 50, health: 80 },
    },
    npcs: [],
    pets: [],
    nextNpcId: 1,
    log: [],
    pending: [],
    chains: [],
    events: { lastFired: {}, counts: {}, categoryLast: {}, popupsThisYear: 0, noticesThisYear: 0 },
    money: {
      cash: 0,
      savings: 0,
      savingsRate: 0.02,
      holdings: { bonds: 0, index: 0, growth: 0, coin: 0 },
      loans: [],
      nextLoanId: 1,
      lifestyle: 'normal',
      last: null,
      history: [],
      alimony: [],
    },
    education: {
      grade: 60,
      inSchool: false,
      droppedOut: false,
      enrollment: null,
      degrees: [],
      residency: 0,
      veteranBenefit: false,
      studyYear: -1,
    },
    career: {
      jobId: null,
      level: 0,
      since: 0,
      performance: 50,
      salary: 0,
      partTimeId: null,
      history: [],
      retired: false,
      pension: 0,
      yearsWorked: 0,
      workedHarder: -1,
      appliedThisYear: [],
      freelanceYear: -1,
    },
    military: null,
    music: { stage: 0, act: null, label: null, releases: [], touring: false, lastWork: -1 },
    health: {
      illnesses: [],
      lastDoctor: -1,
      injuries: 0,
      injuryList: [],
      surgeryCount: 0,
      lowHappyYears: 0,
      highStressYears: 0,
      gymYear: -1,
      dietYear: -1,
    },
    vices: {
      levels: { alcohol: 0, smoking: 0, gambling: 0, party_drugs: 0, pills: 0, hard_drugs: 0 },
      lastUse: {
        alcohol: -1,
        smoking: -1,
        gambling: -1,
        party_drugs: -1,
        pills: -1,
        hard_drugs: -1,
      },
      rehab: 0,
      sober: 0,
    },
    legal: { record: [], sealed: false, case: null, prison: null, probation: 0, escapes: 0 },
    assets: {
      homes: [],
      vehicles: [],
      possessions: [],
      listings: [],
      listingsYear: -1,
      nextAssetId: 1,
      licence: false,
      housing: 'parents',
      rent: 0,
    },
    will: { heirs: [], written: null },
    family: { pregnancy: null, adoptions: 0, custodyLost: [] },
    usage: { year: 0, used: {} },
    statHistory: { happiness: [], health: [], smarts: [], looks: [] },
    totals: { happinessSum: 0, years: 0, popups: 0, maxNetWorthRef: 0 },
    settings: { popupsPerYear: 3 },
    cheats: {
      used: false,
      locks: {},
      immortal: false,
      forceSuccess: false,
      noBadEvents: false,
      infiniteMoney: false,
      disabledCategories: [],
    },
    snapshots: [],
    death: null,
    dynasty: [],
    generation: 1,
    challenge: null,
  };
}

function validTraits(ids: string[]): string[] {
  const out: string[] = [];
  for (const id of ids) {
    const t = TRAIT_BY_ID[id];
    if (!t || out.includes(id) || out.some((o) => t.excludes.includes(o))) continue;
    out.push(id);
  }
  return out.slice(0, 3);
}

/** Create a new life (SPEC §3.1). Anything not specified is rolled from the seed. */
export function newLife(opts: NewLifeOptions, seed: number): GameState {
  const ctx = new Ctx(emptyState(seed));
  const s = ctx.s;
  const r = ctx.rng;
  const p = s.player;

  const country = opts.country && COUNTRY_BY_ID[opts.country] ? opts.country : r.pick(COUNTRIES).id;
  const c = COUNTRY_BY_ID[country];
  if (!c) throw new Error('country');
  const birthYear = Math.round(
    Math.min(MAX_BIRTH_YEAR, Math.max(MIN_BIRTH_YEAR, opts.birthYear ?? r.int(1980, 2008))),
  );
  s.year = birthYear;
  // Prices before 2026 follow the default 2.5% a year.
  s.inflation = Math.pow(1.025, birthYear - 2026);

  p.gender = opts.gender ?? (r.chance(0.04) ? 'nonbinary' : r.chance(0.5) ? 'male' : 'female');
  p.attraction =
    opts.attraction ??
    (r.chance(0.07)
      ? 'everyone'
      : p.gender === 'male'
        ? r.chance(0.05)
          ? 'men'
          : 'women'
        : p.gender === 'female'
          ? r.chance(0.05)
            ? 'women'
            : 'men'
          : r.chance(0.5)
            ? 'men'
            : 'women');
  p.first = (opts.first ?? '').trim().slice(0, 40) || randomName(ctx, country, p.gender);
  p.last = (opts.last ?? '').trim().slice(0, 40) || randomSurname(ctx, country);
  p.country = country;
  p.birthCountry = country;
  p.city = opts.city && c.cities.includes(opts.city) ? opts.city : r.pick(c.cities);
  p.birthCity = p.city;
  p.birthYear = birthYear;
  p.appearance =
    opts.appearance !== undefined && SKIN_TONES.includes(opts.appearance)
      ? opts.appearance
      : r.pick(SKIN_TONES);
  p.wealth =
    opts.wealth ??
    r.pick([
      'poor',
      'working',
      'working',
      'middle',
      'middle',
      'middle',
      'comfortable',
      'rich',
    ] as const);
  // One draw from the life's RNG seeds the face, so the rest of the life rolls as before.
  const lookSalt = r.int(0, 2 ** 30);
  const skinGuess = lookRng(seed, lookSalt).pick(skinsForTone(p.appearance));
  p.look = cleanLook(
    opts.look ?? {},
    randomLook(lookRng(seed, lookSalt + 1), p.gender, opts.look?.skin ?? skinGuess),
  );
  p.appearance = toneOf(p.look);
  if (opts.talent && SKILL_BY_ID[opts.talent]) {
    p.talent = opts.talent;
    p.skills[opts.talent] = 8;
  }
  const chosen = opts.traits ? validTraits(opts.traits) : [];
  p.traits = chosen.length ? chosen : randomTraits(ctx, r.int(2, 3));
  // SPEC §3.1: 2–3 traits at birth. Top up a single pick with a compatible random one.
  if (p.traits.length < 2) {
    for (const t of randomTraits(ctx, 6)) {
      const tr = TRAIT_BY_ID[t];
      if (p.traits.length >= 2) break;
      if (
        !tr ||
        p.traits.includes(t) ||
        p.traits.some((o) => tr.excludes.includes(o) || TRAIT_BY_ID[o]?.excludes.includes(t))
      )
        continue;
      p.traits.push(t);
    }
  }
  // Native language(s) at full fluency.
  for (const lang of c.languages) p.languages[lang] = lang === c.languages[0] ? 100 : 40;

  p.genes = { looks: r.int(20, 95), smarts: r.int(25, 95), health: r.int(50, 100) };
  const st: Stats = p.stats;
  st.happiness = clampStat(opts.stats?.happiness ?? r.int(70, 95));
  st.health = clampStat(opts.stats?.health ?? r.int(75, 100));
  st.smarts = clampStat(opts.stats?.smarts ?? r.int(5, 30));
  st.looks = clampStat(opts.stats?.looks ?? Math.round(p.genes.looks * 0.85));
  if (opts.stats?.smarts !== undefined) p.genes.smarts = Math.max(p.genes.smarts, st.smarts);
  if (opts.stats?.looks !== undefined) p.genes.looks = clampStat(st.looks / 0.85);
  if (opts.stats?.health !== undefined) p.genes.health = st.health;
  st.karma = r.int(40, 60);
  st.discipline = r.int(30, 70);
  st.stress = r.int(0, 15);
  if (opts.popupsPerYear !== undefined)
    s.settings.popupsPerYear = Math.min(5, Math.max(1, Math.round(opts.popupsPerYear)));

  generateFamily(ctx, opts);
  if (opts.challenge && CHALLENGE_BY_ID[opts.challenge])
    s.challenge = { id: opts.challenge, status: 'active', year: s.year };
  s.lifeId = `${p.first.toLowerCase().replace(/[^a-z0-9]/g, '') || 'life'}-${(seed >>> 0).toString(36)}-${r.int(0, 1679615).toString(36)}`;

  const parents = s.npcs.filter((n) => n.roles.includes('mother') || n.roles.includes('father'));
  const parentText = parents.map((n) => `${n.first} (${n.job ?? 'unemployed'})`).join(' and ');
  const solo = parents.find(
    (n) =>
      !n.flags.includes('absent_parent') && parents.some((o) => o.flags.includes('absent_parent')),
  );
  ctx.log(
    'family',
    solo
      ? `You are born in ${p.city}, ${c.name}, and raised by your ${solo.roles.includes('mother') ? 'mother' : 'father'}, ${solo.first} (${solo.job ?? 'unemployed'}).`
      : `You are born in ${p.city}, ${c.name}, to ${parentText || 'a family that loves you'}.`,
    true,
  );
  if (p.talent && SKILL_BY_ID[p.talent])
    ctx.log(
      'system',
      `⭐ You have a gift for ${SKILL_BY_ID[p.talent]?.label.toLowerCase()}. It will come easily, with practice.`,
    );
  for (const t of p.traits) {
    const tr = TRAIT_BY_ID[t];
    if (tr)
      ctx.log('system', `${tr.emoji} You came out ${tr.label.toLowerCase()}. ${tr.description}`);
  }
  for (const k of ['happiness', 'health', 'smarts', 'looks'] as const) s.statHistory[k].push(st[k]);
  applyLocks(s);
  return ctx.finish().state;
}

/** Parents, 0–3 siblings and grandparents alive by their ages (SPEC §5.1). */
function generateFamily(ctx: Ctx, opts: NewLifeOptions = {}): void {
  const s = ctx.s;
  const r = ctx.rng;
  const p = s.player;
  const tier = p.wealth;
  const [lo, hi] = FAMILY_WEALTH[tier];
  const familyMoney = refToLocal(s, r.int(lo, hi));

  const motherAge = r.int(19, 40);
  const fatherAge = Math.max(18, motherAge + r.int(-4, 8));
  const setup = opts.parents;
  const together =
    setup === undefined ? r.chance(tier === 'poor' ? 0.6 : 0.8) : setup === 'together';
  const mother = addNpc(ctx, {
    role: 'mother',
    gender: 'female',
    age: motherAge,
    last: p.last,
    rel: r.int(65, 95),
    job: r.chance(0.8) ? r.pick(PARENT_JOBS[tier]) : null,
    money: familyMoney / 2,
  });
  const father = addNpc(ctx, {
    role: 'father',
    gender: 'male',
    age: fatherAge,
    last: together ? p.last : r.chance(0.5) ? p.last : randomSurname(ctx, p.country),
    rel: r.int(55, 95),
    job: r.chance(0.85) ? r.pick(PARENT_JOBS[tier]) : null,
    money: familyMoney / 2,
  });
  const relFlag = together ? (r.chance(0.75) ? 'parents_happy' : 'parents_rocky') : 'parents_split';
  mother.flags.push(relFlag);
  father.flags.push(relFlag);
  // A single parent: the other one is around in name only.
  const absent = setup === 'mother' ? father : setup === 'father' ? mother : null;
  if (absent) {
    absent.flags.push('absent_parent');
    absent.rel = r.int(10, 30);
  }
  p.parentIds = [mother.id, father.id];
  // Family history: some parents carry a condition that runs in families.
  for (const parent of [mother, father]) {
    if (r.chance(0.35)) parent.flags.push(`had_${r.pick(HEREDITARY)}`);
  }

  const siblings =
    opts.siblings !== undefined
      ? Math.max(0, Math.min(4, Math.round(opts.siblings)))
      : (r.weighted([0, 1, 2, 3], (n) => [30, 40, 20, 10][n] ?? 0) ?? 0);
  for (let i = 0; i < siblings; i++) {
    const age = r.int(1, Math.max(1, Math.min(14, motherAge - 18)));
    addNpc(ctx, {
      role: 'sibling',
      age,
      last: p.last,
      rel: r.int(45, 85),
      parentIds: [mother.id, father.id],
    });
  }

  for (const parent of [mother, father]) {
    const gAge = parent.age + r.int(20, 36);
    for (const g of ['female', 'male'] as const) {
      const age = gAge + (g === 'male' ? r.int(-2, 5) : 0);
      // Alive at the player's birth with a chance that falls with age.
      const alive =
        age < 60
          ? r.chance(0.95)
          : age < 75
            ? r.chance(0.8)
            : age < 85
              ? r.chance(0.55)
              : r.chance(0.2);
      const gp = addNpc(ctx, {
        role: 'grandparent',
        gender: g,
        age,
        last:
          g === 'male' ? parent.last : r.chance(0.6) ? parent.last : randomSurname(ctx, p.country),
        rel: r.int(50, 90),
        money: alive ? familyMoney * r.next() * 0.3 : 0,
      });
      parent.parentIds.push(gp.id);
      if (!alive)
        markDeadBefore(
          gp,
          s.year - r.int(1, 15),
          r.pick(['Old age', 'Heart failure', 'A long illness']),
        );
      // Great-grandparents: remembered names in the family tree (SPEC §5.1: three generations up).
      for (const gg of ['female', 'male'] as const) {
        const ggp = addNpc(ctx, {
          role: 'great_grandparent',
          gender: gg,
          age: age + r.int(20, 34),
          last: gg === 'male' ? gp.last : randomSurname(ctx, p.country),
          rel: 50,
        });
        markDeadBefore(
          ggp,
          s.year - r.int(1, 30),
          r.pick(['Old age', 'Heart failure', 'Pneumonia', 'A long illness']),
        );
        gp.parentIds.push(ggp.id);
      }
    }
  }
}

function markDeadBefore(n: Npc, year: number, cause: string): void {
  n.alive = false;
  n.deathYear = year;
  n.deathCause = cause;
  n.age = Math.max(0, year - n.birthYear);
}
