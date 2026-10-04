import {
  deserialize,
  newLife,
  netWorthRef,
  serialize,
  stateHash,
  type GameState,
} from '../src/engine';
import { checkState } from '../src/engine/bot/invariants';
import { botStep, type PersonaId } from '../src/engine/bot/persona';
import { Rng, seedRng } from '../src/engine/rng';

/** Bands are enforced once M10.6 (balance) lands; until then the report shows them. */
export const ENFORCE_BANDS = false;

export type LifeResult = {
  seed: number;
  ageAtDeath: number;
  reached18: boolean;
  degree: boolean;
  reached25: boolean;
  employed: boolean;
  reached30: boolean;
  married: boolean;
  reached40: boolean;
  children: boolean;
  imprisoned: boolean;
  netWorthRef: number;
  meanHappiness: number;
  popupCounts: Record<string, number>;
  firedEvents: string[];
};

export type Metrics = {
  lives: number;
  medianAge: number;
  reached18: number;
  degree: number;
  employed: number;
  married: number;
  children: number;
  imprisoned: number;
  medianNetWorth: number;
  meanHappiness: number;
  topEventShare: number;
  popups: number;
};

export const BANDS = {
  medianAge: [60, 92],
  reached18: [0.9, 1],
  degree: [0.15, 0.75],
  employed: [0.7, 1],
  married: [0.3, 0.85],
  children: [0.3, 0.85],
  imprisoned: [0, 0.25],
  meanHappiness: [35, 75],
  topEventShare: [0, 0.03],
  runtime: [0, 180],
} as const;

const MAX_STEPS = 20000;

function playLife(
  seed: number,
  persona: PersonaId,
  checkpointAges: Set<number> | null,
  violations: string[],
): { s: GameState; popups: Record<string, number> } {
  let s = newLife({}, seed);
  const bot = new Rng(seedRng(seed * 7919 + 13));
  const popups: Record<string, number> = {};
  const checkedAges = new Set<number>();
  const v0 = checkState(s, null);
  for (const v of v0) violations.push(`seed ${seed} birth: ${v}`);
  for (let i = 0; i < MAX_STEPS && !s.death; i++) {
    const prevAge = s.player.age;
    const prevPending = s.pending.length;
    const logFrom = s.log.length;
    try {
      s = botStep(s, persona, bot);
    } catch (e) {
      violations.push(`seed ${seed} age ${prevAge}: exception ${(e as Error).stack ?? String(e)}`);
      break;
    }
    const aged = s.player.age !== prevAge;
    if (aged) for (const pe of s.pending) popups[pe.eventId] = (popups[pe.eventId] ?? 0) + 1;
    else if (s.pending.length > prevPending)
      for (const pe of s.pending.slice(prevPending))
        popups[pe.eventId] = (popups[pe.eventId] ?? 0) + 1;
    const vs = checkState(s, aged ? prevAge : null, logFrom);
    if (!aged && s.player.age !== prevAge) vs.push('age changed outside Age Up');
    for (const v of vs) violations.push(`seed ${seed} age ${s.player.age}: ${v}`);
    if (vs.length > 0) break;
    if (
      checkpointAges &&
      aged &&
      checkpointAges.has(s.player.age) &&
      !checkedAges.has(s.player.age)
    ) {
      checkedAges.add(s.player.age);
      s = deserialize(serialize(s));
    }
  }
  if (!s.death) violations.push(`seed ${seed}: life did not end (age ${s.player.age})`);
  if (s.player.age > 120) violations.push(`seed ${seed}: died at ${s.player.age}`);
  return { s, popups };
}

export function runLife(
  seed: number,
  persona: PersonaId,
  checkpoints: number,
  violations: string[],
): LifeResult {
  const { s, popups } = playLife(seed, persona, null, violations);
  if (checkpoints > 0) {
    const r = new Rng(seedRng(seed + 1000003));
    const ages = new Set<number>();
    const span = Math.max(1, s.player.age);
    for (let i = 0; i < checkpoints; i++) ages.add(r.int(0, span));
    const replay = playLife(seed, persona, ages, []);
    if (stateHash(replay.s) !== stateHash(s))
      violations.push(`seed ${seed}: save/load checkpoints changed the final state hash`);
  }
  const p = s.player;
  const reached = (a: number): boolean => (s.death?.age ?? p.age) >= a;
  return {
    seed,
    ageAtDeath: s.death?.age ?? p.age,
    reached18: reached(18),
    degree: s.education.degrees.some((d) => d.level !== 'high_school'),
    reached25: reached(25),
    employed: p.flags.includes('ever_employed_ft'),
    reached30: reached(30),
    married: p.flags.includes('ever_married'),
    reached40: reached(40),
    children: s.npcs.some((n) => n.roles.includes('child')),
    imprisoned: p.flags.includes('ever_imprisoned'),
    netWorthRef: netWorthRef(s),
    meanHappiness: s.totals.years ? s.totals.happinessSum / s.totals.years : p.stats.happiness,
    popupCounts: popups,
    firedEvents: Object.keys(s.events.counts),
  };
}

const median = (xs: number[]): number => {
  const a = [...xs].sort((x, y) => x - y);
  if (!a.length) return 0;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? (a[m] as number) : ((a[m - 1] as number) + (a[m] as number)) / 2;
};
const share = (
  xs: LifeResult[],
  pred: (l: LifeResult) => boolean,
  filter: (l: LifeResult) => boolean = () => true,
): number => {
  const pool = xs.filter(filter);
  return pool.length ? pool.filter(pred).length / pool.length : 0;
};

export function runLives(opts: { seeds: number[]; persona: PersonaId; checkpoints: number }): {
  lives: LifeResult[];
  violations: string[];
  metrics: Metrics;
  topEvents: [string, number][];
} {
  const violations: string[] = [];
  const lives = opts.seeds.map((seed) => runLife(seed, opts.persona, opts.checkpoints, violations));
  const counts: Record<string, number> = {};
  for (const l of lives)
    for (const [k, n] of Object.entries(l.popupCounts)) counts[k] = (counts[k] ?? 0) + n;
  const popups = Object.values(counts).reduce((a, b) => a + b, 0);
  const topEvents = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const metrics: Metrics = {
    lives: lives.length,
    medianAge: median(lives.map((l) => l.ageAtDeath)),
    reached18: share(lives, (l) => l.reached18),
    degree: share(lives, (l) => l.degree),
    employed: share(
      lives,
      (l) => l.employed,
      (l) => l.reached25,
    ),
    married: share(
      lives,
      (l) => l.married,
      (l) => l.reached30,
    ),
    children: share(
      lives,
      (l) => l.children,
      (l) => l.reached40,
    ),
    imprisoned: share(lives, (l) => l.imprisoned),
    medianNetWorth: median(lives.map((l) => l.netWorthRef)),
    meanHappiness: lives.reduce((t, l) => t + l.meanHappiness, 0) / Math.max(1, lives.length),
    topEventShare: popups ? (topEvents[0]?.[1] ?? 0) / popups : 0,
    popups,
  };
  return { lives, violations, metrics, topEvents };
}

export type BandResult = { label: string; display: string; band: string; pass: boolean };

export function evaluateBands(m: Metrics, runtime: number): BandResult[] {
  const pct = (x: number): string => `${(x * 100).toFixed(1)}%`;
  const inBand = (x: number, [lo, hi]: readonly [number, number]): boolean => x >= lo && x <= hi;
  return [
    {
      label: 'Median age at death',
      display: m.medianAge.toFixed(1),
      band: '60–92',
      pass: inBand(m.medianAge, BANDS.medianAge),
    },
    {
      label: 'Lives reaching 18',
      display: pct(m.reached18),
      band: '≥ 90%',
      pass: inBand(m.reached18, BANDS.reached18),
    },
    {
      label: 'Lives with a university degree',
      display: pct(m.degree),
      band: '15–75%',
      pass: inBand(m.degree, BANDS.degree),
    },
    {
      label: 'Ever employed full-time (reached 25)',
      display: pct(m.employed),
      band: '≥ 70%',
      pass: inBand(m.employed, BANDS.employed),
    },
    {
      label: 'Ever married (reached 30)',
      display: pct(m.married),
      band: '30–85%',
      pass: inBand(m.married, BANDS.married),
    },
    {
      label: 'Ever had children (reached 40)',
      display: pct(m.children),
      band: '30–85%',
      pass: inBand(m.children, BANDS.children),
    },
    {
      label: 'Ever imprisoned',
      display: pct(m.imprisoned),
      band: '≤ 25%',
      pass: inBand(m.imprisoned, BANDS.imprisoned),
    },
    {
      label: 'Median inflation-adjusted net worth at death',
      display: `$${Math.round(m.medianNetWorth).toLocaleString('en-US')}`,
      band: '> 0',
      pass: m.medianNetWorth > 0,
    },
    {
      label: 'Mean lifetime happiness',
      display: m.meanHappiness.toFixed(1),
      band: '35–75',
      pass: inBand(m.meanHappiness, BANDS.meanHappiness),
    },
    {
      label: 'Share of popups from the most common event',
      display: pct(m.topEventShare),
      band: '≤ 3%',
      pass: m.popups > 0 && inBand(m.topEventShare, BANDS.topEventShare),
    },
    {
      label: 'Runtime for 300 lives',
      display: `${runtime.toFixed(1)} s`,
      band: '< 180 s',
      pass: runtime < 180,
    },
  ];
}
