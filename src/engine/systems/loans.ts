import type { Ctx } from '../ctx';
import { formatMoney } from '../economy';
import { addStat } from '../stats';
import type { GameState, Loan, LoanKind } from '../types';

/** Standard amortized yearly payment: P·r / (1 − (1 + r)^−n). Zero-rate loans split evenly. */
export function annuityPayment(principal: number, rate: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  if (rate === 0) return principal / years;
  return (principal * rate) / (1 - Math.pow(1 + rate, -years));
}

/** Balance after k payments of an amortized loan. */
export function balanceAfter(principal: number, rate: number, years: number, k: number): number {
  const pay = annuityPayment(principal, rate, years);
  let b = principal;
  for (let i = 0; i < k; i++) b = b * (1 + rate) - pay;
  return Math.max(0, b);
}

export function addLoan(
  s: GameState,
  kind: LoanKind,
  principal: number,
  rate: number,
  termYears: number,
  collateral?: number,
): Loan {
  const loan: Loan = {
    id: s.money.nextLoanId++,
    kind,
    principal: Math.round(principal),
    balance: Math.round(principal),
    rate,
    termYears,
    payment: Math.round(annuityPayment(principal, rate, termYears)),
    yearsPaid: 0,
    missed: 0,
  };
  if (collateral !== undefined) loan.collateral = collateral;
  s.money.loans.push(loan);
  return loan;
}

/** Student loans grow while you study (payment 0) and amortize over 10 years after. */
export function borrowForStudy(s: GameState, amount: number): void {
  const open = s.money.loans.find((l) => l.kind === 'student' && l.payment === 0);
  if (open) {
    open.principal += Math.round(amount);
    open.balance += Math.round(amount);
  } else {
    const l = addLoan(s, 'student', amount, 0.055, 10);
    l.payment = 0;
  }
}

/** Start repaying student loans (on graduating or leaving). */
export function startStudentRepayment(s: GameState): void {
  for (const l of s.money.loans) {
    if (l.kind === 'student' && l.payment === 0 && l.balance > 0) {
      l.principal = l.balance;
      l.termYears = 10;
      l.yearsPaid = 0;
      l.payment = Math.round(annuityPayment(l.balance, l.rate, 10));
    }
  }
}

/**
 * One year of loan service. Returns total paid. Missed payments bring a penalty, then
 * repossession of collateral after three, plus Stress and Happiness hits (SPEC §5.6).
 */
export function serviceLoans(ctx: Ctx): number {
  const s = ctx.s;
  let paid = 0;
  for (const l of s.money.loans) {
    if (l.payment === 0 && l.kind === 'student') {
      l.balance = Math.round(l.balance * (1 + l.rate));
      continue;
    }
    const interest = l.balance * l.rate;
    // The last scheduled payment clears whatever rounding has left over.
    const owed = Math.round(l.balance + interest);
    const due = l.yearsPaid + 1 >= l.termYears ? owed : Math.min(l.payment, owed);
    if (l.kind === 'debt') {
      // Overdraft debt takes whatever cash there is; the rest rolls on with interest.
      const pay = Math.min(due, Math.max(0, s.money.cash));
      s.money.cash -= pay;
      paid += pay;
      l.balance = Math.max(0, Math.round(l.balance + interest - pay));
      l.yearsPaid += 1;
    } else if (s.money.cash >= due) {
      s.money.cash -= due;
      paid += due;
      l.balance = Math.max(0, Math.round(l.balance + interest - due));
      l.yearsPaid += 1;
    } else {
      l.missed += 1;
      l.balance = Math.round((l.balance + interest) * 1.05);
      // Re-spread what's owed over the remaining term so the loan still ends.
      l.payment = Math.round(
        annuityPayment(l.balance, l.rate, Math.max(1, l.termYears - l.yearsPaid)),
      );
      addStat(s, 'stress', 10);
      addStat(s, 'happiness', -6);
      ctx.log(
        'money',
        `You miss a ${l.kind} payment of ${formatMoney(s, due)}. The letters get redder.`,
      );
      if (l.missed >= 3 && l.collateral !== undefined) repossess(ctx, l);
    }
  }
  s.money.loans = s.money.loans.filter((l) => l.balance > 0);
  return paid;
}

function repossess(ctx: Ctx, l: Loan): void {
  const s = ctx.s;
  const home = s.assets.homes.find((h) => h.id === l.collateral);
  const car = s.assets.vehicles.find((v) => v.id === l.collateral);
  // The bank sells at a discount, takes what it's owed, and hands back the rest.
  const sale = Math.round((home?.value ?? car?.value ?? 0) * 0.8);
  if (home) {
    s.assets.homes = s.assets.homes.filter((h) => h.id !== home.id);
    if (home.livingIn) s.assets.housing = 'renting';
    ctx.log('money', `The bank repossesses ${home.name}. You watch a man change the locks.`, true);
  } else if (car) {
    s.assets.vehicles = s.assets.vehicles.filter((v) => v.id !== car.id);
    ctx.log('money', `A tow truck takes the ${car.model} in the night.`, true);
  }
  const left = sale - l.balance;
  if (left > 0) {
    s.money.cash += left;
    ctx.log('money', `After the sale, ${formatMoney(s, left)} of equity comes back to you.`);
  }
  l.balance = Math.max(0, -left);
  if (l.balance > 0) {
    delete l.collateral;
    l.kind = 'debt';
  }
  addStat(s, 'happiness', -12);
}

/** Pay a loan off early in full (or as much as cash allows). */
export function payOffLoan(s: GameState, id: number): number {
  const l = s.money.loans.find((x) => x.id === id);
  if (!l) return 0;
  const pay = Math.min(l.balance, Math.max(0, s.money.cash));
  s.money.cash -= pay;
  l.balance -= pay;
  if (l.balance <= 0) s.money.loans = s.money.loans.filter((x) => x.id !== id);
  return pay;
}
