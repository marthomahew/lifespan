import type { Ctx } from '../ctx';
import { formatMoney, money } from '../economy';
import { addStat } from '../stats';
import { VICES, type ViceKey } from '../types';
import { clampStat } from '../util';

export const VICE_LABEL: Record<ViceKey, string> = {
  alcohol: 'Drinking',
  smoking: 'Smoking',
  gambling: 'Gambling',
  party_drugs: 'Party drugs',
  pills: 'Pills',
  hard_drugs: 'Hard drugs',
};

/** How much one use raises the meter, by vice; some traits make it stick faster. */
export function useIncrease(traits: string[], vice: ViceKey): number {
  const base = { alcohol: 8, smoking: 12, gambling: 9, party_drugs: 12, pills: 14, hard_drugs: 22 }[
    vice
  ];
  const mult =
    (traits.includes('reckless') ? 1.4 : 1) *
    (traits.includes('anxious') ? 1.2 : 1) *
    (traits.includes('cautious') ? 0.7 : 1);
  return Math.round(base * mult);
}

/** Use a vice once (activities and events). */
export function useVice(ctx: Ctx, vice: ViceKey): void {
  const s = ctx.s;
  s.vices.levels[vice] = clampStat(s.vices.levels[vice] + useIncrease(s.player.traits, vice));
  s.vices.lastUse[vice] = s.year;
}

/**
 * Step 3–4: meters fall with abstinence; high levels cost health, money, work, and relationships
 * (SPEC §5.9).
 */
export function vicesTick(ctx: Ctx): void {
  const s = ctx.s;
  const v = s.vices;
  let any = false;
  for (const k of VICES) {
    const lvl = v.levels[k];
    if (lvl <= 0) continue;
    if (v.lastUse[k] < s.year - 1) v.levels[k] = clampStat(lvl - (lvl > 60 ? 3 : 6));
    else if (lvl >= 40) v.levels[k] = clampStat(lvl + 2); // a habit feeds itself
    if (v.levels[k] < 50) continue;
    any = true;
    const heavy = v.levels[k];
    addStat(s, 'health', -Math.round((heavy - 40) / (k === 'hard_drugs' ? 6 : 12)));
    const drain = money(s, (k === 'gambling' ? 60 : k === 'hard_drugs' ? 40 : 15) * heavy);
    s.money.cash -= drain;
    if (s.money.last) s.money.last.vices += drain;
    if (s.career.jobId)
      s.career.performance = clampStat(s.career.performance - Math.round((heavy - 40) / 6));
    const close = s.npcs.filter(
      (n) =>
        n.alive &&
        n.roles.some((r) => ['spouse', 'partner', 'mother', 'father', 'child'].includes(r)),
    );
    for (const n of close) n.rel = clampStat(n.rel - ctx.rng.int(1, 3));
    if (ctx.rng.chance(0.2))
      ctx.log(
        'health',
        `${VICE_LABEL[k]} is costing you ${formatMoney(s, drain)} a year and more than money.`,
      );
  }
  if (any) addStat(s, 'stress', 4);
  v.sober = any ? 0 : v.sober + 1;
}

/** Rehab and support groups bring meters down (SPEC §5.9). */
export function treatAddiction(ctx: Ctx, strength: 'rehab' | 'support'): string | null {
  const s = ctx.s;
  let worst: ViceKey | null = null;
  for (const k of VICES) if (!worst || s.vices.levels[k] > s.vices.levels[worst]) worst = k;
  if (!worst || s.vices.levels[worst] < 10) return null;
  const drop = strength === 'rehab' ? ctx.rng.int(35, 70) : ctx.rng.int(8, 20);
  s.vices.levels[worst] = clampStat(s.vices.levels[worst] - drop);
  if (strength === 'rehab') s.vices.rehab += 1;
  return VICE_LABEL[worst];
}
