import { ILLNESS_BY_ID, ILLNESSES } from '../../content/illnesses';
import type { IllnessDef, Treatment } from '../../content/types';
import type { Ctx } from '../ctx';
import { countryOf, formatMoney, money } from '../economy';
import { EngineError } from '../errors';
import type { RiskFactor } from '../mortality';
import { addStat } from '../stats';
import type { GameState } from '../types';
import { clampStat } from '../util';
import { addIllness } from './illness';
import { lowerLabel } from '../text';
import { perkEffect } from './perks';
import { injuryTick } from './injuries';

/** Whether a parent had (or has) this illness: recorded on the NPC as a flag. */
function familyHistory(s: GameState, id: string): boolean {
  return s.npcs.some(
    (n) =>
      (n.roles.includes('mother') || n.roles.includes('father')) && n.flags.includes(`had_${id}`),
  );
}

export function onsetChance(s: GameState, def: IllnessDef): number {
  const age = s.player.age;
  const o = def.onset;
  if (age < o.ages[0] || age > o.ages[1]) return 0;
  // Chronic conditions are calibrated a little rarer than the catalog's raw rates.
  // Colds and the like still happen, just not so often that they drown out the story.
  let p = o.base * (def.chronic ? 0.7 : isMinorIllness(def) ? 0.5 : 1);
  if (o.vice && s.vices.levels[o.vice.key] > 30)
    p *= 1 + ((o.vice.mult - 1) * s.vices.levels[o.vice.key]) / 100;
  if (o.lowHealth && s.player.stats.health < 40) p *= o.lowHealth;
  if (
    o.stress &&
    (s.player.stats.stress > 70 ||
      (def.mental && (s.health.highStressYears >= 2 || s.health.lowHappyYears >= 2)))
  )
    p *= o.stress;
  if (o.hereditary && familyHistory(s, def.id)) p *= o.hereditary;
  if (s.player.traits.includes('athletic') && !def.mental) p *= 0.8;
  return Math.min(0.5, p);
}

/** Step 4: new illnesses, progression of untreated ones, their yearly effects (SPEC §5.8). */
export function healthTick(ctx: Ctx): void {
  const s = ctx.s;
  injuryTick(ctx);
  const h = s.health;
  const st = s.player.stats;
  h.lowHappyYears = st.happiness < 30 ? h.lowHappyYears + 1 : 0;
  h.highStressYears = st.stress > 75 ? h.highStressYears + 1 : 0;
  for (const ill of [...h.illnesses]) {
    const def = ILLNESS_BY_ID[ill.id];
    if (!def) continue;
    const treatedRecently = s.year - ill.treated <= 1;
    // Chronic conditions plateau: past severity 60 they worsen only some years.
    const stall = def.progression > 0 && ill.severity > 60 && !ctx.rng.chance(0.3);
    const step = stall
      ? 0
      : treatedRecently && def.progression > 0
        ? Math.round(def.progression / 3)
        : def.progression;
    ill.severity = clampStat(ill.severity + step + ctx.rng.int(-2, 2));
    // Drift pulls stats back each year, so a yearly effect shifts the equilibrium by about 5× its size; keep it modest.
    for (const [k, v] of Object.entries(def.effects))
      if (v) addStat(s, k as 'health', Math.round((v * Math.max(30, ill.severity)) / 150));
    if (ill.severity <= 0 && !def.chronic) {
      h.illnesses = h.illnesses.filter((x) => x !== ill);
      // Minor bugs pass quietly; recovering from anything worse is news.
      if (!isMinorIllness(def))
        ctx.log('health', `${def.emoji} The ${def.label.toLowerCase()} clears up on its own.`);
    }
  }
  if (s.cheats.noBadEvents) return;
  // At most one new diagnosis a year.
  const candidates = ILLNESSES.filter((d) => !h.illnesses.some((i) => i.id === d.id));
  for (const def of ctx.rng.shuffle(candidates)) {
    if (ctx.rng.chance(onsetChance(s, def))) {
      addIllness(ctx, def.id);
      break;
    }
  }
}

export function treatmentCost(s: GameState, def: IllnessDef, method: Treatment): number {
  const mult =
    method === 'surgery'
      ? 3
      : method === 'specialist'
        ? 1.6
        : method === 'alternative'
          ? 0.4
          : method === 'therapy'
            ? 0.8
            : 1;
  // Health insurance from work cuts the bill.
  return money(s, def.cost * mult * countryOf(s).healthcare.costMult * perkEffect(s).medical);
}

/** Treat an illness: pay, roll the method's success odds; chronic illnesses are managed, not cured. */
export function treat(
  ctx: Ctx,
  illnessId: string,
  method: Treatment,
  opts: { free?: boolean } = {},
): void {
  const s = ctx.s;
  const ill = s.health.illnesses.find((i) => i.id === illnessId);
  const def = ILLNESS_BY_ID[illnessId];
  if (!ill || !def) throw new EngineError('you do not have that illness');
  const odds = def.treatments[method];
  if (odds === undefined)
    throw new EngineError(`${method} doesn't help with ${def.label.toLowerCase()}`);
  if (s.legal.prison && method !== 'doctor')
    throw new EngineError('the prison doctor is all there is');
  const cost = treatmentCost(s, def, method);
  if (!opts.free && s.money.cash < cost)
    throw new EngineError(`treatment costs ${formatMoney(s, cost)}`);
  if (!opts.free) s.money.cash -= cost;
  ill.treated = s.year;
  const label = def.label.toLowerCase();
  if (ctx.roll(odds)) {
    if (def.chronic) {
      ill.severity = clampStat(ill.severity - ctx.rng.int(20, 40));
      ctx.log(
        'health',
        `${def.emoji} The ${method} gets your ${label} under control. It is manageable now.`,
      );
    } else {
      s.health.illnesses = s.health.illnesses.filter((i) => i !== ill);
      if (/cancer|tumour/.test(def.id) && !s.player.flags.includes('survived_cancer'))
        s.player.flags.push('survived_cancer');
      ctx.log('health', `${def.emoji} The ${method} works. Your ${label} is gone.`, true);
    }
    addStat(s, 'happiness', 3);
  } else {
    ill.severity = clampStat(ill.severity + (method === 'surgery' ? 10 : 0));
    ctx.log(
      'health',
      method === 'alternative'
        ? `The healer's tea smells of moss and does nothing for your ${label}.`
        : `The ${method} doesn't help your ${label} this time.`,
    );
    addStat(s, 'happiness', -3);
  }
}

/** Short, curable, low-severity things (colds, flu, food poisoning). */
export function isMinorIllness(def: IllnessDef): boolean {
  return !def.chronic && !def.mental && def.severity[1] <= 35;
}

/** Calibrates catalog death factors against the DONE §4.2 age band. */
export const ILLNESS_RISK_SCALE = 0.15;

/** Illness contributions to mortality (hazard × (1 + deathFactor × severity / 100)). */
export function illnessRisks(s: GameState): RiskFactor[] {
  // Contributions add up rather than multiply, so several mild conditions don't compound wildly.
  let extra = 0;
  let worst: { label: string; part: number } | null = null;
  for (const ill of s.health.illnesses) {
    const def = ILLNESS_BY_ID[ill.id];
    if (!def || def.mental) continue;
    const managed = def.chronic && s.year - ill.treated <= 4 ? 0.5 : 1;
    const part = (def.deathFactor * ill.severity * managed * ILLNESS_RISK_SCALE) / 100;
    extra += part;
    if (!worst || part > worst.part) worst = { label: lowerLabel(def.label), part };
  }
  return worst ? [{ cause: `Complications of ${worst.label}`, mult: 1 + extra }] : [];
}

export type TreatmentView = {
  illness: string;
  label: string;
  emoji: string;
  severity: number;
  chronic: boolean;
  options: { method: Treatment; odds: number; cost: number }[];
};

export function treatmentsFor(s: GameState): TreatmentView[] {
  return s.health.illnesses.map((ill) => {
    const def = ILLNESS_BY_ID[ill.id];
    const options = Object.entries(def?.treatments ?? {}).map(([m, odds]) => ({
      method: m as Treatment,
      odds: odds ?? 0,
      cost: def ? treatmentCost(s, def, m as Treatment) : 0,
    }));
    return {
      illness: ill.id,
      label: def?.label ?? ill.id,
      emoji: def?.emoji ?? '🤒',
      severity: ill.severity,
      chronic: def?.chronic ?? false,
      options,
    };
  });
}
