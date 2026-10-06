import { BRANCHES, SPECIALTIES } from '../../content/military';
import type { Ctx } from '../ctx';
import { addStat } from '../stats';
import type { ChainPayload } from '../types';
import { hire } from './careers';
import { discharge, enlist } from './military';
import { signRecordDeal } from './music';
import { caseStep, recapture } from './crime';
import { scaleSalary, takePackage } from './crossroads';
import { illnessPlan } from './illness';
import { addHolidayHome } from './assets';
import { netWorth } from '../networth';
import { COUNTRIES } from '../../content/countries';
import { emigrate } from './emigration';
import { canMoveAbroad } from '../../content/events/conditions';

const LABELS = [
  'Gravel Hill Records',
  'Lanternfish Music',
  'Northbound Sound',
  'Pocket Moon Records',
  'Tin Roof Recordings',
];

/** Effects that hand off to a system: hiring after an interview, conscription, record deals... */
export function applySystemEffect(
  ctx: Ctx,
  kind: string,
  arg: string | undefined,
  payload: ChainPayload,
): void {
  const s = ctx.s;
  switch (kind) {
    case 'recapture':
      recapture(ctx);
      return;
    case 'holiday_home': {
      // Bought with a share of what you're worth; it stays on the books as a home.
      const price = Math.round(Math.max(0, netWorth(s)) * 0.15);
      s.money.cash -= price;
      addHolidayHome(ctx, price);
      return;
    }
    case 'illness_plan':
      if (typeof payload['illness'] === 'string')
        illnessPlan(ctx, arg ?? 'gentle', payload['illness']);
      return;
    case 'salary_mult':
      scaleSalary(ctx, Number(arg ?? 1));
      return;
    case 'severance':
      takePackage(ctx, Number(arg ?? 1));
      return;
    case 'move_out':
      if (s.assets.housing === 'parents') s.assets.housing = 'renting';
      return;
    case 'hire': {
      const jobId = arg ?? (typeof payload['jobId'] === 'string' ? payload['jobId'] : undefined);
      if (jobId) hire(ctx, jobId);
      return;
    }
    case 'conscript': {
      const branch =
        arg && (BRANCHES as readonly string[]).includes(arg) ? arg : ctx.rng.pick(BRANCHES);
      enlist(ctx, branch, ctx.rng.pick(SPECIALTIES).id, false, 'conscript');
      return;
    }
    case 'sign_label':
      signRecordDeal(ctx, arg ?? ctx.rng.pick(LABELS));
      return;
    case 'dishonorable':
      if (s.military?.active) discharge(ctx, 'dishonorable');
      return;
    case 'injury_discharge':
      if (s.military?.active) discharge(ctx, 'honorable');
      return;
    case 'case_bail':
    case 'case_lawyer':
    case 'case_plea':
      caseStep(ctx, kind, arg);
      return;
    case 'move_abroad': {
      // Move with your partner: to the country in arg, or anywhere else at random.
      if (!canMoveAbroad(s)) return;
      const options = COUNTRIES.filter((c) => c.id !== s.player.country);
      const to = options.find((c) => c.id === arg) ?? ctx.rng.pick(options);
      emigrate(ctx, to.id, undefined, true);
      for (const n of s.npcs)
        if (n.alive && (n.roles.includes('partner') || n.roles.includes('spouse')))
          n.country = to.id;
      return;
    }
    case 'therapy':
      addStat(s, 'stress', -12);
      addStat(s, 'happiness', 5);
      return;
  }
}
