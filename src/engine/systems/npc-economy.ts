import { PARENT_JOBS } from '../../content/family';
import type { Ctx } from '../ctx';
import { formatMoney, money } from '../economy';
import type { GameState, Npc } from '../types';
import { houseReturn, inRecession, marketReturn } from './markets';

/**
 * Other people's money: an education, pay from their job, savings that follow the markets,
 * a home bought with a mortgage when they can, debts, and a pension. Calibrated so a life
 * of ordinary work lands near real medians (US 2022: about $39k under 35, $135k at 35–44,
 * $250k at 45–54, $365k at 55–64), with wide spread either side.
 */
export type Edu = 'none' | 'school' | 'college' | 'degree' | 'postgrad';
export const EDU_LABEL: Record<Edu, string> = {
  none: 'left school early',
  school: 'finished school',
  college: 'a college diploma',
  degree: 'a university degree',
  postgrad: 'a postgraduate degree',
};

const NOT_WORKING = ['At school', 'At university', 'Retired', 'Unemployed'];
type Tier = keyof typeof PARENT_JOBS;
const TIERS: Tier[] = ['poor', 'working', 'middle', 'comfortable', 'rich'];

/** Yearly pay (today's dollars) for jobs typical of each tier. */
const PAY: Record<Tier, [number, number]> = {
  poor: [20000, 32000],
  working: [32000, 55000],
  middle: [55000, 95000],
  comfortable: [95000, 220000],
  rich: [220000, 1200000],
};
/** Share of pay saved, by tier (the comfortable save more, the poor can't). */
const SAVE: Record<Tier, number> = {
  poor: 0.01,
  working: 0.05,
  middle: 0.1,
  comfortable: 0.16,
  rich: 0.25,
};

export function jobTier(job: string | null): Tier | null {
  if (!job || NOT_WORKING.includes(job)) return null;
  for (const t of TIERS) if ((PARENT_JOBS[t] as readonly string[]).includes(job)) return t;
  return 'middle';
}

/** Their net worth: cash and savings, investments, home equity, less debts. */
export function npcNetWorth(n: Npc): number {
  return Math.round(n.money + (n.invest ?? 0) + (n.home ?? 0) - (n.mortgage ?? 0) - (n.debt ?? 0));
}

/** An adult's starting finances, from their job, age and smarts (and a family's tier). */
export function settleFinances(ctx: Ctx, n: Npc, tier?: Tier): void {
  const s = ctx.s;
  const r = ctx.rng;
  if (n.age < 18 || n.edu) return;
  const t = tier ?? jobTier(n.job) ?? 'working';
  const rank = TIERS.indexOf(t);
  const smart = n.stats.smarts;
  n.edu =
    rank >= 3 || smart > 80
      ? r.chance(0.35)
        ? 'postgrad'
        : 'degree'
      : rank === 2 || smart > 60
        ? r.chance(0.6)
          ? 'degree'
          : 'college'
        : rank === 1
          ? r.chance(0.3)
            ? 'college'
            : 'school'
          : r.chance(0.3)
            ? 'none'
            : 'school';
  const [lo, hi] = PAY[t];
  n.pay = jobTier(n.job) ? money(s, r.int(lo, hi), 'wage') : 0;
  // What a working life would have built by now, roughly: savings, and a home for most.
  const years = Math.max(0, Math.min(40, n.age - 22));
  const saved = n.pay * SAVE[t] * years * (1 + years / 30);
  n.invest = Math.round(saved * 0.7);
  n.money = Math.max(n.money, Math.round(saved * 0.3));
  const owns = n.age >= 28 && r.chance([0.15, 0.45, 0.7, 0.85, 0.95][rank] ?? 0.6);
  if (owns) {
    // About four to six years' pay, as homes cost in most places (a table for those without).
    const price =
      (n.pay ? n.pay * 5 : money(s, [120000, 220000, 400000, 900000, 3000000][rank] ?? 400000)) *
      (0.7 + r.next() * 0.6);
    n.home = Math.round(price);
    n.mortgage = Math.round(price * Math.max(0, 0.8 - years * 0.025));
  }
  if (rank <= 1 && r.chance(0.4)) n.debt = money(s, r.int(2000, 25000));
}

/** People whose finances we follow (the rest are background). */
function followed(s: GameState, n: Npc): boolean {
  if (!n.alive || n.age < 18) return false;
  return (
    n.roles.some((x) =>
      [
        'mother',
        'father',
        'sibling',
        'child',
        'grandparent',
        'spouse',
        'partner',
        'friend',
        'ex',
      ].includes(x),
    ) || n.rel >= 50
  );
}

/** Your parents, while together, live in one home (whichever of them holds it). */
function sharesHome(s: GameState, n: Npc): boolean {
  const parent = (x: Npc): boolean => x.roles.includes('mother') || x.roles.includes('father');
  if (!parent(n) || n.flags.includes('parents_split')) return false;
  return s.npcs.some((o) => o.id !== n.id && o.alive && parent(o) && (o.home ?? 0) > 0);
}

/** The year in other people's money: pay, savings, markets, homes, debts, pensions. */
export function npcEconomy(ctx: Ctx): void {
  const s = ctx.s;
  const r = ctx.rng;
  const idx = marketReturn(s.year, 'index') ?? r.normal(0.06, 0.15);
  const homes = houseReturn(s.year) ?? 0.03;
  const living = money(s, 26000, 'wage');
  for (const n of s.npcs) {
    if (!followed(s, n)) continue;
    if (!n.edu) settleFinances(ctx, n);
    const t = jobTier(n.job);
    // Pay: a raise most years; a recession costs some people their job for a while.
    if (t) {
      if (!n.pay) n.pay = money(s, r.int(PAY[t][0], PAY[t][1]), 'wage');
      n.pay = Math.round(n.pay * (1 + Math.max(0, r.normal(0.03, 0.02))));
      if (inRecession(s.year) && r.chance(0.05)) {
        n.flags.push(`laid_off:${s.year}`);
        n.pay = Math.round(n.pay * 0.4);
      }
    } else if (n.job === 'Retired') n.pay = Math.round((n.pay ?? 0) * 1.02);
    else n.pay = 0;
    const tier = t ?? 'working';
    // Savings: what's left after living, at the tier's habit; the rest goes to the house.
    const spare = Math.max(0, (n.pay ?? 0) - living) * SAVE[tier];
    // Wealth gets spent as well as saved: a few percent a year on the life it buys (more once
    // retired), so fortunes grow with the markets but don't run away.
    const draw = n.job === 'Retired' ? 0.05 : 0.03;
    n.invest = Math.round(((n.invest ?? 0) + spare * 0.7) * (1 + idx - draw));
    n.money = Math.round(n.money * (1.02 - draw) + spare * 0.3);
    if (n.home) {
      n.home = Math.round(n.home * (1 + homes));
      n.mortgage = Math.max(
        0,
        Math.round((n.mortgage ?? 0) - Math.max(n.home * 0.03, (n.pay ?? 0) * 0.12)),
      );
    } else if (n.age >= 26 && n.age <= 55 && (n.pay ?? 0) > 0 && !sharesHome(s, n)) {
      // First home: a deposit of a fifth.
      // About five years' pay.
      const price = Math.round((n.pay ?? 0) * (4 + r.next() * 2));
      const deposit = price * 0.2;
      if (n.money + (n.invest ?? 0) >= deposit * 1.2 && r.chance(0.35)) {
        const fromInvest = Math.max(0, deposit - n.money);
        n.money = Math.max(0, n.money - deposit);
        n.invest = Math.max(0, (n.invest ?? 0) - fromInvest);
        n.home = Math.round(price);
        n.mortgage = Math.round(price * 0.8);
        n.flags.push(`bought_home:${s.year}`);
      }
    }
    // Debts: interest, then repayments that always beat it (more when there's cash to hand).
    if (n.debt) {
      const owed = n.debt * 1.06;
      const pay = Math.max((n.pay ?? 0) * 0.08, owed * 0.12, Math.min(n.money * 0.5, owed));
      if (pay > owed * 0.12) n.money = Math.max(0, n.money - Math.min(n.money * 0.5, owed));
      n.debt = Math.max(0, Math.round(owed - pay));
      if (n.debt < money(s, 100)) delete n.debt;
    }
  }
}

/** For the profile: "earns about $62,000 · net worth about $310,000 · owns a home". */
export function npcMoneyLine(s: GameState, n: Npc): string {
  if (n.age < 18) return '';
  const parts: string[] = [];
  if (n.pay && n.job !== 'Retired')
    parts.push(`earns about ${formatMoney(s, Math.round(n.pay / 1000) * 1000)} a year`);
  else if (n.job === 'Retired' && n.pay)
    parts.push(`a pension of about ${formatMoney(s, Math.round(n.pay / 1000) * 1000)}`);
  const nw = npcNetWorth(n);
  parts.push(`net worth about ${formatMoney(s, Math.round(nw / 1000) * 1000)}`);
  parts.push(
    n.home ? (n.mortgage ? 'owns a home (with a mortgage)' : 'owns a home outright') : 'rents',
  );
  if (n.debt && n.debt > 0) parts.push(`owes ${formatMoney(s, Math.round(n.debt / 100) * 100)}`);
  return parts.join(' · ');
}
