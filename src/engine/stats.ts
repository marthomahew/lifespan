import { TRAIT_BY_ID } from '../content/traits';
import type { Ctx } from './ctx';
import { ALL_STATS, VISIBLE_STATS, type GameState, type StatKey } from './types';
import { clamp, clampStat } from './util';
import { refToLocal } from './economy';

/** Add a delta to a stat with clamping (locks are re-applied after every step). */
export function addStat(s: GameState, key: StatKey, delta: number): void {
  s.player.stats[key] = clampStat(s.player.stats[key] + delta);
}

export function setStat(s: GameState, key: StatKey, value: number): void {
  s.player.stats[key] = clampStat(value);
}

/** Locked stats (cheat) snap back to their lock value. */
export function applyLocks(s: GameState): void {
  if (s.cheats.infiniteMoney) s.money.cash = Math.max(s.money.cash, Math.round(refToLocal(s, 1e9)));
  for (const [k, v] of Object.entries(s.cheats.locks)) {
    if (v !== undefined) s.player.stats[k as StatKey] = clampStat(v);
  }
}

/** Sum of every trait's drift for a stat. */
export function traitDrift(s: GameState, key: StatKey): number {
  let d = 0;
  for (const id of s.player.traits) d += TRAIT_BY_ID[id]?.drift[key] ?? 0;
  return d;
}

/** Where Health tends at this age, given genes. Declines slowly from 30, faster after 60. */
export function healthBaseline(age: number, gene: number): number {
  const base = 70 + gene * 0.25;
  return (
    base - Math.max(0, age - 30) * 0.35 - Math.max(0, age - 60) * 1.1 - Math.max(0, age - 80) * 1.2
  );
}

/** Looks peak around 20–35. */
export function looksBaseline(age: number, gene: number): number {
  if (age < 13) return gene * 0.85;
  if (age < 20) return gene * (0.85 + ((age - 13) / 7) * 0.15);
  if (age <= 35) return gene;
  return gene - (age - 35) * 0.45 - Math.max(0, age - 60) * 0.4;
}

export function fertilityBaseline(age: number, gender: string): number {
  if (age < 15) return 0;
  if (age <= 25) return 60 + (age - 15) * 3;
  if (gender === 'female') {
    if (age <= 30) return 90 - (age - 25) * 2;
    if (age <= 45) return 80 - (age - 30) * 5;
    return 0;
  }
  if (age <= 40) return 90 - (age - 25);
  return Math.max(10, 75 - (age - 40) * 1.5);
}

export type Circumstances = {
  /** 0..1 how heavy debts feel relative to income. */
  debtLoad: number;
  inPrison: boolean;
  /** Average relationship with close people (family and partner), or 50 if none. */
  closeRel: number;
  /** Work stress 0..100 if employed. */
  jobStress: number;
  /** Lifestyle happiness shift. */
  lifestyle: number;
  /** Whether the player studied this year (school-age smarts growth). */
  studied: boolean;
  inEducation: boolean;
};

/** Yearly drift (SPEC §3.2). Each stat moves part of the way toward a baseline. */
export function driftStats(ctx: Ctx, c: Circumstances): void {
  const s = ctx.s;
  const p = s.player;
  const age = p.age;
  const st = p.stats;
  const r = ctx.rng;
  const noise = (n: number): number => (r.next() - 0.5) * 2 * n;
  const pull = (cur: number, target: number, rate: number): number => cur + (target - cur) * rate;

  // Health.
  let hTarget = healthBaseline(age, p.genes.health) + traitDrift(s, 'health') * 3;
  hTarget -= Math.max(0, st.stress - 60) * 0.25;
  st.health = clampStat(pull(st.health, hTarget, 0.2) + noise(2));

  // Looks.
  const lTarget = looksBaseline(age, p.genes.looks) + traitDrift(s, 'looks') * 3;
  st.looks = clampStat(pull(st.looks, lTarget, 0.25) + noise(1.5));

  // Smarts grows through the school years, faster with study; stalls without it; slips late.
  let dSmarts = 0;
  if (age >= 3 && age <= 22) {
    const cap = 40 + p.genes.smarts * 0.6;
    if (st.smarts < cap) dSmarts += c.inEducation ? 1.5 : 0.5;
    if (c.studied) dSmarts += 2;
  } else if (c.studied) {
    dSmarts += 1;
  }
  if (age > 70) dSmarts -= 0.6;
  st.smarts = clampStat(st.smarts + dSmarts + traitDrift(s, 'smarts') * 0.5 + noise(1));

  // Stress.
  let sTarget = 25 + c.debtLoad * 35 + c.jobStress * 0.35 + (c.inPrison ? 35 : 0);
  sTarget += traitDrift(s, 'stress') * 4;
  st.stress = clampStat(pull(st.stress, sTarget, 0.3) + noise(3));

  // Happiness.
  let hapTarget = 55 + (c.closeRel - 50) * 0.3 - (st.stress - 30) * 0.35 + c.lifestyle;
  hapTarget += (st.health - 60) * 0.15 + traitDrift(s, 'happiness') * 4;
  if (c.inPrison) hapTarget -= 20;
  st.happiness = clampStat(pull(st.happiness, hapTarget, 0.3) + noise(4));

  // Hidden stats.
  st.karma = clampStat(pull(st.karma, 50, 0.03) + traitDrift(s, 'karma'));
  st.discipline = clampStat(
    pull(st.discipline, 50 + traitDrift(s, 'discipline') * 10, 0.08) + noise(1),
  );
  st.fertility = clampStat(pull(st.fertility, fertilityBaseline(age, p.gender), 0.5));
  st.notoriety = clampStat(st.notoriety - 2);
  for (const k of ALL_STATS) st[k] = clamp(st[k], 0, 100);
  applyLocks(s);
}

/** Keep the last 20 years of visible stats for sparklines. */
export function recordStatHistory(s: GameState): void {
  for (const k of VISIBLE_STATS) {
    const h = s.statHistory[k];
    h.push(s.player.stats[k]);
    if (h.length > 20) h.splice(0, h.length - 20);
  }
}
