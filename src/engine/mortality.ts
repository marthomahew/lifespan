import type { Ctx } from './ctx';
import type { GameState } from './types';
import { illnessRisks } from './systems/health-risk';
import { jobRisk } from './systems/job-risk';

/** Gompertz base hazard (SPEC §3.5). Tuned against the DONE §4.2 bands. */
export const MORTALITY_A = 5e-5;
export const MORTALITY_B = 0.085;

export function baseHazard(age: number): number {
  return Math.min(0.9, MORTALITY_A * Math.exp(MORTALITY_B * age));
}

/** ×1 at Health 60–89, rising linearly to ×4 at 0, ×0.85 at 90+. */
export function healthMultiplier(health: number): number {
  if (health >= 90) return 0.85;
  if (health >= 60) return 1;
  return 1 + (3 * (60 - health)) / 60;
}

export type RiskFactor = { cause: string; mult: number };

/** Every multiplier on the base hazard beyond Health, with the cause it would record. */
export function riskFactors(s: GameState): RiskFactor[] {
  const out: RiskFactor[] = [];
  out.push(...illnessRisks(s));
  const v = s.vices.levels;
  if (v.alcohol > 40)
    out.push({
      cause: 'Liver failure after years of heavy drinking',
      mult: 1 + (v.alcohol - 40) / 60,
    });
  if (v.smoking > 30)
    out.push({ cause: 'Lung cancer after a lifetime of smoking', mult: 1 + (v.smoking - 30) / 70 });
  if (v.hard_drugs > 20) out.push({ cause: 'An overdose', mult: 1 + (v.hard_drugs - 20) / 25 });
  if (v.pills > 40) out.push({ cause: 'An accidental overdose', mult: 1 + (v.pills - 40) / 50 });
  if (v.party_drugs > 50)
    out.push({ cause: 'Heart failure at a party', mult: 1 + (v.party_drugs - 50) / 80 });
  if (s.legal.prison) out.push({ cause: 'A fight in the prison yard', mult: 1.6 });
  if (s.military?.deployed) out.push({ cause: 'Killed in action while deployed', mult: 3 });
  const risk = jobRisk(s);
  if (risk > 0) out.push({ cause: 'An accident at work', mult: 1 + risk });
  if (s.player.stats.stress > 85) out.push({ cause: 'A stress-induced heart attack', mult: 1.3 });
  return out;
}

export function deathProbability(s: GameState): number {
  const age = s.player.age;
  let q = baseHazard(age) * healthMultiplier(s.player.stats.health);
  for (const f of riskFactors(s)) q *= f.mult;
  // Infants and children: health hazard only if health is very low.
  if (age < 18) q = Math.min(q, s.player.stats.health < 15 ? 0.2 : 0.004);
  if (age >= 120) return 1;
  return Math.min(0.95, q);
}

/** Pick the recorded cause from the biggest contributing factor. */
export function causeOfDeath(ctx: Ctx): string {
  const s = ctx.s;
  const factors = riskFactors(s).filter((f) => f.mult > 1.2);
  if (factors.length && ctx.rng.chance(0.75)) {
    let best = factors[0];
    for (const f of factors) if (best && f.mult > best.mult) best = f;
    if (best) return best.cause;
  }
  const age = s.player.age;
  if (age >= 120) return 'Old age, at a record-breaking 120';
  if (age < 18)
    return ctx.rng.pick([
      'A sudden illness',
      'Complications from a fever',
      'A rare heart condition',
    ]);
  if (s.player.stats.health < 25)
    return ctx.rng.pick(['Organ failure', 'Complications from poor health', 'Pneumonia']);
  if (age >= 80)
    return ctx.rng.pick([
      'Old age, peacefully',
      'Heart failure',
      'Old age, in their sleep',
      'Pneumonia',
    ]);
  return ctx.rng.pick([
    'A heart attack',
    'A stroke',
    'An aneurysm',
    'Heart failure',
    'Kidney failure',
  ]);
}

/** Roll the yearly mortality check. Returns true if the player died. */
export function rollMortality(ctx: Ctx): boolean {
  const s = ctx.s;
  if (s.cheats.immortal) return false;
  if (s.player.age >= 120) return true;
  return ctx.rng.chance(deathProbability(s));
}
