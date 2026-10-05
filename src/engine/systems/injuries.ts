import type { Ctx } from '../ctx';
import { countryOf, formatMoney, money } from '../economy';
import { EngineError } from '../errors';
import { addStat } from '../stats';
import type { GameState, Injury, InjuryTier } from '../types';
import { perkEffect } from './perks';

/** What each kind of injury can be, how long it takes to heal, and how often it lingers. */
const TIERS: Record<
  InjuryTier,
  { kinds: string[]; heal: number; linger: number; penalty: number }
> = {
  minor: {
    kinds: ['sprained ankle', 'pulled hamstring', 'cracked rib', 'sprained wrist'],
    heal: 1,
    linger: 0.06,
    penalty: 3,
  },
  major: {
    kinds: ['broken arm', 'broken leg', 'torn knee ligament', 'back injury', 'dislocated shoulder'],
    heal: 2,
    linger: 0.25,
    penalty: 7,
  },
  serious: {
    kinds: ['fractured pelvis', 'serious head injury', 'crushed hand', 'spinal injury'],
    heal: 3,
    linger: 0.45,
    penalty: 12,
  },
};

/** An injury that never quite healed: a small, permanent drag until surgery fixes it. */
const LINGER_PENALTY = 4;

export const injuryLabel = (i: Injury): string => (i.lingering ? `old ${i.kind}` : i.kind);

/** Record an injury from an event, an accident, a fight, or a deployment. Under 6 is just a bruise. */
export function addInjury(ctx: Ctx, amount: number): void {
  const s = ctx.s;
  const n = Math.abs(amount);
  addStat(s, 'health', -n);
  s.health.injuries += 1;
  if (n < 6) return;
  const tier: InjuryTier = n >= 20 ? 'serious' : n >= 12 ? 'major' : 'minor';
  const t = TIERS[tier];
  s.health.injuryList.push({
    kind: ctx.rng.pick(t.kinds),
    tier,
    year: s.year,
    healsIn: t.heal,
    lingering: false,
    physioYear: -1,
  });
}

/** How much current injuries pull the yearly Health target down. */
export function injuryPenalty(s: GameState): number {
  return s.health.injuryList.reduce(
    (t, i) => t + (i.lingering ? LINGER_PENALTY : TIERS[i.tier].penalty),
    0,
  );
}

/** Yearly healing: each injury gets a year closer; at the end it heals or settles in for good. */
export function injuryTick(ctx: Ctx): void {
  const s = ctx.s;
  const keep: Injury[] = [];
  for (const i of s.health.injuryList) {
    if (i.lingering || i.year >= s.year) {
      keep.push(i);
      continue;
    }
    i.healsIn -= 1;
    if (i.healsIn > 0) {
      keep.push(i);
      continue;
    }
    // Physio in the last stretch halves the chance it never quite heals.
    const linger = TIERS[i.tier].linger * (s.year - i.physioYear <= 2 ? 0.5 : 1);
    if (ctx.rng.chance(linger)) {
      i.lingering = true;
      keep.push(i);
      ctx.log('health', `Your ${i.kind} never quite heals. It aches when the weather turns.`);
    } else ctx.log('health', `Your ${i.kind} has healed.`);
  }
  s.health.injuryList = keep;
}

export type InjuryOption = { method: 'physio' | 'surgery'; cost: number; odds: number };

/** Treatments for one injury: physio while healing, surgery for bad or lingering ones. */
export function injuryOptions(s: GameState, index: number): InjuryOption[] {
  const i = s.health.injuryList[index];
  if (!i) return [];
  const mult = countryOf(s).healthcare.costMult * perkEffect(s).medical;
  const out: InjuryOption[] = [];
  if (!i.lingering) out.push({ method: 'physio', cost: money(s, 800 * mult), odds: 1 });
  if (i.lingering || i.tier !== 'minor')
    out.push({ method: 'surgery', cost: money(s, 12000 * mult), odds: i.lingering ? 0.7 : 0.85 });
  return out;
}

export function treatInjury(ctx: Ctx, index: number, method: 'physio' | 'surgery'): void {
  const s = ctx.s;
  const i = s.health.injuryList[index];
  if (!i) throw new EngineError('no such injury');
  const opt = injuryOptions(s, index).find((o) => o.method === method);
  if (!opt) throw new EngineError(`${method} won't help a ${injuryLabel(i)}`);
  if (method === 'physio' && i.physioYear === s.year)
    throw new EngineError('you have already done physio this year');
  if (s.money.cash < opt.cost) throw new EngineError(`${method} costs ${formatMoney(s, opt.cost)}`);
  s.money.cash -= opt.cost;
  if (method === 'physio') {
    i.physioYear = s.year;
    i.healsIn = Math.max(1, i.healsIn - 1);
    ctx.log(
      'health',
      `Physio for your ${i.kind}: elastic bands, small humiliations, real progress.`,
    );
    return;
  }
  s.health.surgeryCount += 1;
  if (ctx.roll(opt.odds)) {
    s.health.injuryList = s.health.injuryList.filter((x) => x !== i);
    addStat(s, 'happiness', 4);
    ctx.log(
      'health',
      `Surgery on your ${injuryLabel(i)} works. You walk out of recovery lighter.`,
      true,
    );
  } else {
    addStat(s, 'health', -3);
    ctx.log(
      'health',
      `The surgery on your ${injuryLabel(i)} doesn't take. Months of recovery, little to show.`,
    );
  }
}
