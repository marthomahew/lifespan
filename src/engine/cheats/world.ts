import { ageUpInPlace } from '../age';
import type { Ctx } from '../ctx';
import { EngineError } from '../errors';
import { chooseInPlace, currentPopup } from '../events/choose';
import { Rng, seedRng } from '../rng';
import { restoreSnapshot } from '../snapshots';
import { catchUpSystems } from '../systems/catchup';
import type { GameState } from '../types';
import type { CheatDef } from './types';
import { countryOptions } from './options';
import { emigrate } from '../systems/emigration';

/** Answer every pending popup with its first available choice. */
export function autoResolve(ctx: Ctx): void {
  for (let i = 0; i < 50 && ctx.s.pending.length > 0 && !ctx.s.death; i++) {
    const popup = currentPopup(ctx.s);
    const c = popup?.choices.find((x) => x.enabled);
    if (!c) {
      ctx.s.pending = ctx.s.pending.slice(1);
      continue;
    }
    chooseInPlace(ctx, c.id);
  }
}

/** Jump the clock without simulating the years in between. */
export function shiftAge(ctx: Ctx, target: number): void {
  const s = ctx.s;
  const from = s.player.age;
  const d = target - from;
  if (d === 0) return;
  // Going back in time is what rewind is for; a backwards jump would strand adult relationships on a minor.
  if (d < 0) throw new EngineError('age set only moves forward; use rewind to go back');
  s.pending = [];
  s.player.age = target;
  s.year += d;
  s.inflation = Math.max(0.01, s.inflation * Math.pow(1 + 0.025 * s.inflationMult, d));
  for (const n of s.npcs) {
    if (!n.alive) continue;
    n.age = Math.max(0, n.age + d);
    if (n.age > 110 && d > 0) {
      n.alive = false;
      n.deathYear = s.year;
      n.deathCause = 'Old age';
    }
  }
  for (const c of s.chains) {
    c.dueYear += d;
    if (c.firstDue !== undefined) c.firstDue += d;
  }
  catchUpSystems(ctx, from, target);
  ctx.log('system', `🎩 Time jumps to age ${target}.`);
}

const toggle = (
  id: string,
  syntax: string,
  label: string,
  key: 'immortal' | 'forceSuccess' | 'noBadEvents',
  help: string,
): CheatDef => ({
  id,
  group: 'world',
  label,
  syntax: `${syntax} {on}`,
  help,
  params: [{ name: 'on', type: 'bool', optional: true }],
  isOn: (s: GameState) => s.cheats[key],
  run: (ctx, p) => {
    const on = p['on'] === undefined ? !ctx.s.cheats[key] : Boolean(p['on']);
    ctx.s.cheats[key] = on;
    return `${label} ${on ? 'on' : 'off'}`;
  },
});

export const WORLD_CHEATS: CheatDef[] = [
  {
    id: 'age.set',
    group: 'world',
    label: 'Set age',
    syntax: 'age set {age}',
    help: 'Jump straight to an age (everyone else ages with you). Example: age set 40',
    params: [{ name: 'age', type: 'int', min: 0, max: 130 }],
    run: (ctx, p) => {
      shiftAge(ctx, Number(p['age']));
      return `You are ${ctx.s.player.age} in ${ctx.s.year}`;
    },
  },
  {
    id: 'skip',
    group: 'world',
    label: 'Skip years',
    syntax: 'skip {years}',
    help: 'Live N years at once, taking the first option in every popup.',
    params: [{ name: 'years', type: 'int', min: 1, max: 100 }],
    run: (ctx, p) => {
      const n = Number(p['years']);
      autoResolve(ctx);
      let done = 0;
      for (; done < n && !ctx.s.death; done++) {
        ageUpInPlace(ctx);
        autoResolve(ctx);
      }
      return ctx.s.death ? `You died after ${done} years` : `Skipped ${done} years`;
    },
  },
  toggle(
    'immortal',
    'immortal',
    'Immortality',
    'immortal',
    'Toggle immortality: no natural death, no fatal outcomes.',
  ),
  toggle(
    'forcesuccess',
    'forcesuccess',
    'Force success',
    'forceSuccess',
    'Skill checks, applications, dates, and crimes all succeed.',
  ),
  toggle(
    'nobadevents',
    'nobadevents',
    'No bad events',
    'noBadEvents',
    'Purely bad notices stop happening.',
  ),
  {
    id: 'rewind',
    group: 'world',
    label: 'Rewind years',
    syntax: 'rewind {years}',
    help: 'Go back N years from the snapshot ring (last 20 years).',
    params: [{ name: 'years', type: 'int', min: 1, max: 20 }],
    run: (ctx, p) => {
      const n = Number(p['years']);
      const restored = restoreSnapshot(ctx.s, n);
      if (!restored) return `Can only rewind ${Math.max(0, ctx.s.snapshots.length - 1)} years`;
      const draft = ctx.s as unknown as Record<string, unknown>;
      for (const k of Object.keys(draft)) delete draft[k];
      Object.assign(draft, restored);
      ctx.rng.state = [...restored.rng];
      return `Rewound to age ${restored.player.age} (${restored.year})`;
    },
  },
  {
    id: 'emigrate.now',
    group: 'world',
    label: 'Emigrate instantly',
    syntax: 'emigrate {country} {city}',
    help: 'Move to any country now, no visa, no cost. Example: emigrate jp',
    params: [
      { name: 'country', type: 'enum', options: countryOptions },
      { name: 'city', type: 'string', optional: true },
    ],
    run: (ctx, p) => {
      if (String(p['country']) === ctx.s.player.country) return 'You already live there';
      emigrate(
        ctx,
        String(p['country']),
        p['city'] === undefined ? undefined : String(p['city']),
        true,
      );
      return `You live in ${ctx.s.player.city} now`;
    },
  },
  {
    id: 'inflation',
    group: 'world',
    label: 'Inflation multiplier',
    syntax: 'inflation {mult}',
    help: 'Scale yearly inflation (1 is normal, 0 freezes prices).',
    params: [{ name: 'mult', type: 'number', min: 0, max: 20 }],
    run: (ctx, p) => {
      ctx.s.inflationMult = Number(p['mult']);
      return `Inflation ×${ctx.s.inflationMult}`;
    },
  },
  {
    id: 'seed',
    group: 'world',
    label: 'Set RNG seed',
    syntax: 'seed {seed}',
    help: 'Reseed the random number generator from here on.',
    params: [{ name: 'seed', type: 'int', min: 0, max: 2 ** 31 - 1 }],
    run: (ctx, p) => {
      const seed = Number(p['seed']);
      ctx.s.seed = seed;
      const fresh = new Rng(seedRng(seed));
      ctx.rng.state = fresh.state;
      return `Seed set to ${seed}`;
    },
  },
];
