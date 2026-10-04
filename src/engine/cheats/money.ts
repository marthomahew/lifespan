import { formatMoney } from '../economy';
import type { CheatDef } from './types';

const amount = { name: 'amount', type: 'number', min: -1e15, max: 1e15 } as const;

export const MONEY_CHEATS: CheatDef[] = [
  {
    id: 'money.add',
    group: 'money',
    label: 'Add cash',
    syntax: 'money add {amount}',
    help: 'Add cash in the local currency. Example: money add 1000000',
    params: [amount],
    run: (ctx, p) => {
      ctx.s.money.cash = Math.round(ctx.s.money.cash + Number(p['amount']));
      return `Cash: ${formatMoney(ctx.s, ctx.s.money.cash)}`;
    },
  },
  {
    id: 'money.set',
    group: 'money',
    label: 'Set cash',
    syntax: 'money set {amount}',
    help: 'Set cash to an exact amount in the local currency.',
    params: [amount],
    run: (ctx, p) => {
      ctx.s.money.cash = Math.round(Number(p['amount']));
      return `Cash: ${formatMoney(ctx.s, ctx.s.money.cash)}`;
    },
  },
  {
    id: 'money.infinite',
    group: 'money',
    label: 'Infinite money',
    syntax: 'money infinite {on}',
    help: 'Toggle infinite money: cash never drops below a billion.',
    params: [{ name: 'on', type: 'bool', optional: true }],
    isOn: (s) => s.cheats.infiniteMoney,
    run: (ctx, p) => {
      const on = p['on'] === undefined ? !ctx.s.cheats.infiniteMoney : Boolean(p['on']);
      ctx.s.cheats.infiniteMoney = on;
      if (on) ctx.s.money.cash = Math.max(ctx.s.money.cash, 1e9);
      return `Infinite money ${on ? 'on' : 'off'}`;
    },
  },
  {
    id: 'debts.payoff',
    group: 'money',
    label: 'Pay off all debts',
    syntax: 'debts payoff',
    help: 'Every loan disappears. The bank is mysteriously fine with it.',
    params: [],
    run: (ctx) => {
      const n = ctx.s.money.loans.length;
      ctx.s.money.loans = [];
      return `Cleared ${n} loan${n === 1 ? '' : 's'}`;
    },
  },
];
