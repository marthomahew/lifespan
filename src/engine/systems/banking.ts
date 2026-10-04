import type { Ctx } from '../ctx';
import { formatMoney, money } from '../economy';
import { EngineError } from '../errors';
import type { InvestKey, Lifestyle } from '../types';
import { hasAdultRecord } from './careers';
import { INVESTMENTS } from './finance';
import { addLoan, payOffLoan } from './loans';

export type MoneyAction =
  | { op: 'deposit' | 'withdraw'; amount: number }
  | { op: 'invest' | 'divest'; key: InvestKey; amount: number }
  | { op: 'borrow'; amount: number }
  | { op: 'payoff'; loanId: number }
  | { op: 'lifestyle'; lifestyle: Lifestyle }
  | { op: 'move_out' | 'live_with_parents' };

const positive = (n: number): number => {
  if (!Number.isFinite(n) || n <= 0) throw new EngineError('enter an amount above zero');
  return Math.round(n);
};

/** Banking, investing, borrowing, lifestyle and housing choices (SPEC §5.6). */
export function moneyAction(ctx: Ctx, a: MoneyAction): void {
  const s = ctx.s;
  const m = s.money;
  switch (a.op) {
    case 'deposit': {
      const n = Math.min(positive(a.amount), Math.max(0, m.cash));
      m.cash -= n;
      m.savings += n;
      ctx.log('money', `You put ${formatMoney(s, n)} in savings.`);
      return;
    }
    case 'withdraw': {
      const n = Math.min(positive(a.amount), m.savings);
      m.savings -= n;
      m.cash += n;
      ctx.log('money', `You take ${formatMoney(s, n)} out of savings.`);
      return;
    }
    case 'invest': {
      if (s.player.age < 18) throw new EngineError('investing is for adults');
      const n = Math.min(positive(a.amount), Math.max(0, m.cash));
      if (n <= 0) throw new EngineError('you have no cash to invest');
      m.cash -= n;
      m.holdings[a.key] += n;
      ctx.log(
        'money',
        `You invest ${formatMoney(s, n)} in the ${INVESTMENTS[a.key].label.toLowerCase()}.`,
      );
      return;
    }
    case 'divest': {
      const n = Math.min(positive(a.amount), m.holdings[a.key]);
      m.holdings[a.key] -= n;
      m.cash += n;
      ctx.log(
        'money',
        `You sell ${formatMoney(s, n)} of the ${INVESTMENTS[a.key].label.toLowerCase()}.`,
      );
      return;
    }
    case 'borrow': {
      if (s.player.age < 18) throw new EngineError('loans are for adults');
      const n = positive(a.amount);
      const income = s.career.salary + s.career.pension;
      if (hasAdultRecord(s) && !s.cheats.forceSuccess)
        throw new EngineError('the bank declines: criminal record');
      if (n > Math.max(money(s, 2000), income * 0.6) && !s.cheats.forceSuccess)
        throw new EngineError(
          `the bank will lend at most ${formatMoney(s, Math.max(money(s, 2000), Math.round(income * 0.6)))}`,
        );
      const rate = income > 0 ? 0.09 + (50 - Math.min(50, s.player.stats.discipline)) / 1000 : 0.14;
      addLoan(s, 'personal', n, rate, 5);
      m.cash += n;
      ctx.log(
        'money',
        `The bank lends you ${formatMoney(s, n)} at ${(rate * 100).toFixed(1)}% over five years.`,
      );
      return;
    }
    case 'payoff': {
      const paid = payOffLoan(s, a.loanId);
      if (paid <= 0) throw new EngineError('nothing to pay with');
      ctx.log('money', `You pay ${formatMoney(s, paid)} off a loan early.`);
      return;
    }
    case 'lifestyle':
      m.lifestyle = a.lifestyle;
      ctx.log(
        'money',
        a.lifestyle === 'frugal'
          ? 'You switch to frugal living: own-brand cereal, cold showers, smug feelings.'
          : a.lifestyle === 'lavish'
            ? 'You switch to lavish living. Everything is now "artisanal".'
            : 'You settle into a normal lifestyle.',
      );
      return;
    case 'move_out':
      if (s.player.age < 18) throw new EngineError('from age 18');
      if (s.assets.housing === 'renting') throw new EngineError('you already rent');
      s.assets.housing = s.assets.homes.length ? 'owning' : 'renting';
      ctx.log(
        'money',
        s.assets.housing === 'owning'
          ? 'You move into your own place.'
          : 'You move into a rented flat with one radiator and a lot of character.',
        true,
      );
      return;
    case 'live_with_parents': {
      const parent = s.npcs.find(
        (n) => n.alive && (n.roles.includes('mother') || n.roles.includes('father')) && n.rel >= 40,
      );
      if (!parent) throw new EngineError('no parent will take you in');
      s.assets.housing = 'parents';
      for (const h of s.assets.homes) h.livingIn = false;
      ctx.log('family', `You move back in with ${parent.first}. Your old bedroom is now a gym.`);
      return;
    }
  }
}
