import { takeUpSport } from './sport';
import { SPORT_BY_ID } from '../../content/sports';
import { JOB_BY_ID } from '../../content/jobs';
import { MAJORS } from '../../content/education';
import { COUNTRY_BY_ID } from '../../content/countries';
import { enroll, enrollReason } from './education';
import { applyCareerEffect } from './career-effects';
import { BRANCHES, SPECIALTIES } from '../../content/military';
import type { Ctx } from '../ctx';
import { remember } from '../npc';
import { addStat } from '../stats';
import type { ChainPayload } from '../types';
import { hire, retire } from './careers';
import { discharge, enlist } from './military';
import { signRecordDeal } from './music';
import { caseStep, recapture } from './crime';
import { scaleSalary, takePackage } from './crossroads';
import { illnessPlan } from './illness';
import { addHolidayHome, downsizeHome } from './assets';
import { addLoan, payFromLiquid } from './loans';
import { money } from '../economy';
import { businessEffect } from './business';
import { backgroundEffect } from './backgrounds';
import { sharesEffect } from './markets';
import { COUNTRIES } from '../../content/countries';
import { emigrate } from './emigration';
import { canMoveAbroad } from '../../content/events/conditions';

/** Real record labels, each from the year it was founded. */
const LABELS: { name: string; from: number }[] = [
  { name: 'Columbia Records', from: 1889 },
  { name: 'Decca Records', from: 1929 },
  { name: 'Atlantic Records', from: 1947 },
  { name: 'Motown', from: 1959 },
  { name: 'Island Records', from: 1959 },
  { name: 'Def Jam Recordings', from: 1984 },
  { name: 'Sub Pop', from: 1986 },
  { name: 'XL Recordings', from: 1989 },
  { name: 'Warp Records', from: 1989 },
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
    case 'retrain': {
      // Back to college for a new field: the old job ends, a two-year course begins.
      const major = arg ?? ctx.rng.pick(MAJORS).id;
      if (s.career.jobId) applyCareerEffect(ctx, 'fire');
      if (!enrollReason(s, 'community', major)) enroll(ctx, 'community', major);
      return;
    }
    case 'move_city': {
      // A fresh start in another city of the same country.
      const cities =
        COUNTRY_BY_ID[s.player.country]?.cities.filter((c) => c !== s.player.city) ?? [];
      if (!cities.length) return;
      s.player.city = ctx.rng.pick(cities);
      ctx.log(
        'family',
        `You move to ${s.player.city}. New streets, new neighbours, the same you.`,
        true,
      );
      return;
    }
    case 'biz_health':
    case 'biz_sell':
    case 'biz_expand':
    case 'biz_manager':
      businessEffect(ctx, kind, Number(arg ?? 0));
      return;
    case 'buy_shares':
    case 'sell_shares':
    case 'lose_shares':
    case 'grant_shares':
      sharesEffect(ctx, kind, arg ?? '');
      return;
    case 'lockdown': {
      // The pandemic year: shops, bars and stages close; desks move home; school goes remote.
      const field = s.career.jobId ? JOB_BY_ID[s.career.jobId]?.field : undefined;
      if (field && ['hospitality', 'retail', 'arts'].includes(field) && ctx.rng.chance(0.45)) {
        applyCareerEffect(ctx, 'fire');
        ctx.log(
          'work',
          'Your workplace closes its doors “for now”. Now turns out to mean for good.',
          true,
        );
      } else if (s.career.jobId)
        ctx.log('work', 'Your job moves to the kitchen table, along with everyone’s.');
      if (s.player.age >= 5 && s.player.age <= 22)
        s.education.grade = Math.max(0, s.education.grade - 4);
      addStat(s, 'happiness', -5);
      addStat(s, 'stress', 6);
      if (!s.player.flags.includes('lived_through_pandemic'))
        s.player.flags.push('lived_through_pandemic');
      return;
    }
    case 'take_fambiz':
    case 'sell_fambiz':
    case 'birth_parent':
      backgroundEffect(ctx, kind);
      return;
    case 'focus_off':
      s.player.focus = null;
      return;
    case 'retire':
      if (s.career.jobId) retire(ctx);
      return;
    case 'near_family': {
      // Moving to be near the family: to the eldest child's country if they live abroad,
      // otherwise to a new city at home. The children and grandchildren see a lot more of you.
      const eldest = s.npcs
        .filter((n) => n.alive && n.roles.includes('child'))
        .sort((a, b) => b.age - a.age)[0];
      if (eldest && eldest.country !== s.player.country && canMoveAbroad(s))
        emigrate(ctx, eldest.country, undefined, true);
      else applySystemEffect(ctx, 'move_city', undefined, payload);
      for (const n of s.npcs)
        if (n.alive && (n.roles.includes('child') || n.roles.includes('grandchild')))
          remember(s, n, 'you moving to be nearby', n.roles.includes('child') ? 10 : 6);
      return;
    }
    case 'downsize':
      downsizeHome(ctx);
      return;
    case 'holiday_home': {
      // A cottage's price, not a share of everything you own: paid from what you can reach,
      // and anything short goes on a mortgage against it.
      const price = money(s, ctx.rng.int(250000, 550000));
      const owed = payFromLiquid(s, price);
      addHolidayHome(ctx, price);
      if (owed > 0) addLoan(s, 'mortgage', owed, 0.05, 20, s.assets.nextAssetId - 1);
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
    case 'take_up_sport': {
      // Making a team means playing the sport for real (unless you already play one).
      if (arg && !s.sport?.active && SPORT_BY_ID[arg]) takeUpSport(ctx, arg);
      return;
    }
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
      signRecordDeal(
        ctx,
        arg ?? ctx.rng.pick(LABELS.filter((l) => l.from <= s.year).map((l) => l.name)),
      );
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
      // 'warm': somewhere sunny to retire to, and not back where you started.
      const warm = options.filter((c) => c.id in WARM && c.id !== s.player.birthCountry);
      const to =
        options.find((c) => c.id === arg) ??
        ctx.rng.pick(arg === 'warm' && warm.length ? warm : options);
      const sunny = arg === 'warm' ? (WARM[to.id] ?? to.cities) : [];
      emigrate(ctx, to.id, sunny.length ? ctx.rng.pick(sunny) : undefined, true);
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

/** Where people go to retire in the sun: the country, and its warm cities (null: all of them). */
const WARM: Record<string, string[] | null> = {
  mx: null,
  br: null,
  au: ['Sydney', 'Brisbane', 'Perth', 'Darwin', 'Adelaide'],
  fr: ['Marseille', 'Montpellier', 'Toulouse'],
};
