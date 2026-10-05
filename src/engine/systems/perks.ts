import { JOB_BY_ID } from '../../content/jobs';
import { PERK_RULES, type PerkEffect } from '../../content/perks';
import { formatMoney } from '../economy';
import type { GameState } from '../types';

/** Each perk of a job with what it actually does (null for pure flavour). */
export function perkNotes(jobId: string): { perk: string; note: string | null }[] {
  return (JOB_BY_ID[jobId]?.perks ?? []).map((perk) => ({
    perk,
    note: PERK_RULES.find((r) => r.pattern.test(perk))?.note ?? null,
  }));
}

/** The combined effect of the current full-time job's perks. */
export function perkEffect(s: GameState): Required<PerkEffect> {
  const out = { medical: 1, pension: 1, bonus: 0, stress: 0, happiness: 0 };
  const job = s.career.jobId ? JOB_BY_ID[s.career.jobId] : undefined;
  if (!job || s.legal.prison) return out;
  const seen = new Set<string>();
  for (const perk of job.perks) {
    const rule = PERK_RULES.find((r) => r.pattern.test(perk));
    // Two pension lines on one job don't stack.
    if (!rule || seen.has(rule.note)) continue;
    seen.add(rule.note);
    const e = rule.effect;
    if (e.medical) out.medical = Math.min(out.medical, e.medical);
    if (e.pension) out.pension = Math.max(out.pension, e.pension);
    if (e.bonus) out.bonus = Math.max(out.bonus, e.bonus);
    out.stress += e.stress ?? 0;
    out.happiness += e.happiness ?? 0;
  }
  return out;
}

/** This year's performance bonus: nothing below 40 performance, the full share at 100. */
export function perkBonus(s: GameState): number {
  const b = perkEffect(s).bonus;
  if (!b || !s.career.jobId) return 0;
  return Math.round(s.career.salary * b * Math.max(0, (s.career.performance - 40) / 60));
}

/** The log line for a bonus, worded for the kind of perk it came from. */
export function bonusLine(s: GameState, amount: number): string {
  const perks = (JOB_BY_ID[s.career.jobId ?? '']?.perks ?? []).join(' ').toLowerCase();
  const sum = formatMoney(s, amount);
  if (/stock options/.test(perks)) return `Your stock options vest: ${sum} this year.`;
  if (/commission/.test(perks)) return `Commission adds ${sum} to your year.`;
  if (/\btips?\b|tip jar/.test(perks)) return `Tips add up to ${sum} this year.`;
  return `Your bonus this year comes to ${sum}.`;
}
