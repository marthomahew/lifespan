import { EVENT_BY_ID } from '../../content/events';
import {
  BRANCHES,
  ENLISTED_PAY,
  ENLISTED_RANKS,
  MEDALS,
  OFFICER_PAY,
  OFFICER_RANKS,
  SPECIALTY_BY_ID,
} from '../../content/military';
import type { Ctx } from '../ctx';
import { countryOf, money } from '../economy';
import { EngineError } from '../errors';
import { fireEvent } from '../events/select';
import { addStat } from '../stats';
import type { GameState } from '../types';
import { clampStat } from '../util';
import { endJob, hasEducation } from './careers';
import { leaveEnrollment } from './education';
import { addSkill } from './skills';

export function rankTitle(s: GameState): string {
  const m = s.military;
  if (!m) return '';
  const list = m.officer ? OFFICER_RANKS : ENLISTED_RANKS;
  return list[Math.min(m.rank, list.length - 1)] ?? '';
}

export function militaryPay(s: GameState): number {
  const m = s.military;
  if (!m?.active || s.legal.prison) return 0;
  const table = m.officer ? OFFICER_PAY : ENLISTED_PAY;
  return money(
    s,
    (table[Math.min(m.rank, table.length - 1)] ?? 24000) * (m.deployed ? 1.15 : 1),
    'wage',
  );
}

export function enlistReason(s: GameState, officer: boolean): string | null {
  const c = countryOf(s);
  if (s.military?.active) return 'already serving';
  if (s.player.age < c.ages.enlist) return `enlistment age here is ${c.ages.enlist}`;
  if (s.player.age > 40) return 'the recruiter says you are over the age limit';
  if (s.legal.prison) return 'not from prison';
  if (s.military?.discharge === 'dishonorable') return 'not after a dishonorable discharge';
  if (s.player.stats.health < 40) return 'you fail the medical';
  if (officer && !hasEducation(s, 'bachelor')) return 'officers need a degree';
  return null;
}

/** Enlist (or commission as an officer with a degree) in a branch and specialty (SPEC §5.4). */
export function enlist(
  ctx: Ctx,
  branch: string,
  specialty: string,
  officer: boolean,
  how: 'volunteer' | 'conscript' | 'cheat' = 'volunteer',
): void {
  const conscript = how === 'conscript';
  const s = ctx.s;
  const why = enlistReason(s, officer);
  if (why && how === 'volunteer') throw new EngineError(why);
  if (!(BRANCHES as readonly string[]).includes(branch))
    throw new EngineError(`unknown branch ${branch}`);
  if (!SPECIALTY_BY_ID[specialty]) throw new EngineError(`unknown specialty ${specialty}`);
  if (s.career.jobId) endJob(ctx, 'enlisted');
  if (s.education.enrollment) leaveEnrollment(s);
  s.military = {
    branch,
    specialty,
    officer,
    rank: 0,
    since: s.year,
    deployed: false,
    deployments: 0,
    medals: [],
    conduct: 65,
    discharge: null,
    active: true,
    years: 0,
  };
  if (conscript) s.player.flags.push('conscript');
  if (!s.player.flags.includes('ever_served')) s.player.flags.push('ever_served');
  s.assets.housing = 'barracks';
  ctx.log(
    'military',
    `You ${conscript ? 'report for national service' : how === 'cheat' ? 'appear in uniform' : officer ? 'take your commission' : 'enlist'} in the ${branch} as ${officer ? 'a Second Lieutenant' : 'a Private'}, specialty ${SPECIALTY_BY_ID[specialty]?.label}. Your hair is gone by lunch.`,
    true,
  );
}

/** Discharge type follows conduct unless an event already decided it. */
export function discharge(ctx: Ctx, type?: string): void {
  const s = ctx.s;
  const m = s.military;
  if (!m?.active) throw new EngineError('you are not serving');
  const served = s.year - m.since;
  const conscript = s.player.flags.includes('conscript');
  if (!type && served < 4 && !conscript) throw new EngineError('your contract runs four years');
  const t =
    type ??
    (m.conduct >= 60
      ? 'honorable'
      : m.conduct >= 40
        ? 'general'
        : m.conduct >= 20
          ? 'other than honorable'
          : 'dishonorable');
  m.active = false;
  m.deployed = false;
  m.discharge = t;
  s.assets.housing = s.assets.homes.some((h) => h.livingIn) ? 'owning' : 'renting';
  if (t === 'honorable' || t === 'general') s.education.veteranBenefit = true;
  ctx.log(
    'military',
    `You leave the ${m.branch} with ${t === 'honorable' ? 'an honorable' : t === 'general' ? 'a general' : t === 'other than honorable' ? 'an other-than-honorable' : 'a dishonorable'} discharge after ${served} ${served === 1 ? 'year' : 'years'}.${t === 'honorable' || t === 'general' ? ' The veteran benefit will pay for school.' : ''}`,
    true,
  );
  s.player.flags = s.player.flags.filter((f) => f !== 'conscript');
}

/** A year in uniform: promotion, deployment, medals, combat stress (SPEC §5.4). */
export function militaryTick(ctx: Ctx): void {
  const s = ctx.s;
  const m = s.military;
  const r = ctx.rng;
  // Conscription: countries that have it call you up unless you're studying or serving.
  const c = countryOf(s);
  if (
    !m &&
    c.conscription.required &&
    s.player.age === c.conscription.minAge &&
    !s.education.enrollment &&
    !s.legal.prison &&
    !s.player.flags.includes('called_up')
  ) {
    s.player.flags.push('called_up');
    const def = EVENT_BY_ID['military_conscription_notice'];
    if (def)
      fireEvent(ctx, def, 'system', {
        years: c.conscription.years,
        term: `${c.conscription.years} ${c.conscription.years === 1 ? 'year' : 'years'}`,
      });
  }
  if (!m?.active || s.legal.prison) return;
  m.years += 1;
  const served = s.year - m.since;
  if (m.deployed) {
    m.deployed = false;
    addStat(s, 'stress', r.int(5, 15));
    if (r.chance(0.25)) {
      const medal = r.pick(MEDALS.slice(0, m.deployments > 2 ? MEDALS.length : 3));
      m.medals.push(medal);
      m.conduct = clampStat(m.conduct + 8);
      ctx.log('military', `You are awarded the ${medal}.`, true);
    }
    ctx.log('military', 'You come home from deployment. The quiet takes some getting used to.');
  }
  const spec = SPECIALTY_BY_ID[m.specialty];
  for (const [k, v] of Object.entries(spec?.skills ?? {})) addSkill(s, k, v);
  addStat(s, 'discipline', 3);
  m.conduct = clampStat(
    m.conduct + r.int(-4, 6) + (s.player.traits.includes('hot_headed') ? -3 : 0),
  );
  const maxRank = (m.officer ? OFFICER_RANKS : ENLISTED_RANKS).length - 1;
  if (
    m.rank < maxRank &&
    served >= 1 &&
    r.chance(Math.min(0.6, 0.15 + m.conduct / 250 + served * 0.01))
  ) {
    m.rank += 1;
    ctx.log('military', `Promoted to ${rankTitle(s)}.`, true);
  }
  if (r.chance(s.player.flags.includes('conscript') ? 0.1 : 0.25)) {
    m.deployed = true;
    m.deployments += 1;
    ctx.log(
      'military',
      `Your unit deploys overseas. You write a letter you hope nobody has to open.`,
      true,
    );
    const pool = [
      'military_deployment_patrol',
      'military_deployment_convoy',
      'military_deployment_letter',
      'military_deployment_medic',
    ].filter((id) => EVENT_BY_ID[id]);
    const def = pool.length ? EVENT_BY_ID[r.pick(pool)] : undefined;
    if (def) fireEvent(ctx, def, 'system');
  }
  if (s.player.flags.includes('conscript') && served >= c.conscription.years)
    discharge(ctx, 'honorable');
}

export function militaryRisk(s: GameState): number {
  const m = s.military;
  if (!m?.active || !m.deployed) return 0;
  return SPECIALTY_BY_ID[m.specialty]?.risk ?? 0.5;
}
