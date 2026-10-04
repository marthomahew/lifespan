import type { Ctx } from '../ctx';
import { incomeTax, localToRef, money } from '../economy';
import { netWorth } from '../networth';
import type { FinanceReport, InvestKey } from '../types';
import { addLoan, annuityPayment, serviceLoans } from './loans';

/** Investment vehicles (SPEC §5.6): mean and sd of yearly returns, plus a crash chance. */
export const INVESTMENTS: Record<
  InvestKey,
  { label: string; mean: number; sd: number; crash: number }
> = {
  bonds: { label: 'Bond fund', mean: 0.035, sd: 0.06, crash: 0 },
  index: { label: 'Index fund', mean: 0.07, sd: 0.15, crash: 0 },
  growth: { label: 'Growth stocks', mean: 0.09, sd: 0.3, crash: 0 },
  coin: { label: 'Speculative coin', mean: 0.1, sd: 0.8, crash: 0.05 },
};

/** Living costs in reference dollars a year by housing, scaled by lifestyle. */
const LIVING: Record<string, number> = {
  parents: 0,
  renting: 14000,
  owning: 9000,
  prison: 0,
  barracks: 1500,
};
const LIFESTYLE_MULT = { frugal: 0.7, normal: 1, lavish: 1.8 } as const;
const RENT: Record<string, number> = { renting: 13000 };

/** Step 2 of the year (SPEC §5.6). Records last year's breakdown. */
export function runFinances(ctx: Ctx, income: { salary: number; other: number }): void {
  const s = ctx.s;
  const p = s.player;
  const m = s.money;
  const adult = p.age >= 18;
  const housing = adult ? s.assets.housing : 'parents';
  const report: FinanceReport = {
    year: s.year,
    salary: Math.round(income.salary),
    otherIncome: Math.round(income.other),
    tax: 0,
    living: 0,
    housing: 0,
    loanPayments: 0,
    interest: 0,
    investReturn: 0,
    maintenance: 0,
    vices: 0,
    net: 0,
  };
  const start = netWorth(s);
  m.cash += report.salary + report.otherIncome;
  report.tax = incomeTax(s, report.salary + report.otherIncome);
  m.cash -= report.tax;

  if (adult && !s.legal.prison) {
    report.living = money(s, (LIVING[housing] ?? 0) * LIFESTYLE_MULT[m.lifestyle]);
    if (housing === 'renting') report.housing = money(s, RENT['renting'] ?? 0);
    m.cash -= report.living + report.housing;
  }
  report.loanPayments = serviceLoans(ctx);

  // Savings interest: the rate wanders between 1% and 4%.
  m.savingsRate = Math.min(0.04, Math.max(0.01, m.savingsRate + (ctx.rng.next() - 0.5) * 0.01));
  report.interest = Math.round(m.savings * m.savingsRate);
  m.savings += report.interest;

  for (const k of Object.keys(INVESTMENTS) as InvestKey[]) {
    const v = m.holdings[k];
    if (v <= 0) continue;
    const def = INVESTMENTS[k];
    let r = ctx.rng.normal(def.mean, def.sd);
    if (def.crash && ctx.rng.chance(def.crash)) r = -0.9;
    r = Math.max(-0.95, r);
    const delta = Math.round(v * r);
    m.holdings[k] = Math.max(0, v + delta);
    report.investReturn += delta;
  }

  // Negative cash turns into high-interest personal debt (SPEC §5.6).
  if (m.cash < 0) {
    const debt = m.loans.find((l) => l.kind === 'debt');
    if (debt) {
      debt.balance += -m.cash;
      debt.principal = debt.balance;
      debt.yearsPaid = 0;
      debt.payment = Math.round(annuityPayment(debt.balance, debt.rate, 5));
    } else {
      const l = addLoan(s, 'debt', -m.cash, 0.19, 5);
      l.payment = Math.round(l.payment);
    }
    m.cash = 0;
  }
  report.net = netWorth(s) - start;
  m.last = report;
  const nw = netWorth(s);
  m.history.push([s.year, nw, Math.round(localToRef(s, nw))]);
  if (m.history.length > 130) m.history.splice(0, m.history.length - 130);
}
