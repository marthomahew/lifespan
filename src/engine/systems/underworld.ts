import { COUNTRY_BY_ID } from '../../content/countries';
import type { Ctx } from '../ctx';
import { formatMoney, money } from '../economy';
import { EngineError } from '../errors';
import { addStat } from '../stats';
import type { GameState } from '../types';
import { clampStat } from '../util';
import { workTime } from './activities';
import { openCase } from './crime';
import { luck } from './luck';
import { markUsed, usedThisYear } from './usage';

/**
 * Organised crime: a crew, a rank, respect and heat. Jobs pay well and build respect; heat
 * brings the police. You can lie low, and you can turn informant and disappear.
 */
export type UnderworldRecord = {
  crew: string;
  rank: number;
  respect: number;
  heat: number;
  jobs: { year: number; job: string; ok: boolean; take: number }[];
  /** Turned informant: out of the life for good. */
  informant?: boolean;
};

export const RANKS = ['Associate', 'Soldier', 'Enforcer', 'Lieutenant', 'Boss'];
const RESPECT_FOR = [0, 20, 45, 75, 110];

export type CrewJob = {
  id: string;
  label: string;
  emoji: string;
  minRank: number;
  /** Take in today's dollars, the base success odds, and the charge if it goes wrong. */
  take: [number, number];
  odds: number;
  crime: string;
  respect: number;
  heat: number;
};

export const CREW_JOBS: CrewJob[] = [
  {
    id: 'racket',
    label: 'Run a protection racket',
    emoji: '🧾',
    minRank: 0,
    take: [5000, 20000],
    odds: 0.75,
    crime: 'fraud',
    respect: 4,
    heat: 8,
  },
  {
    id: 'hijack',
    label: 'Hijack a lorry',
    emoji: '🚚',
    minRank: 0,
    take: [15000, 60000],
    odds: 0.6,
    crime: 'car_theft',
    respect: 6,
    heat: 14,
  },
  {
    id: 'warehouse',
    label: 'Clear out a warehouse',
    emoji: '📦',
    minRank: 1,
    take: [40000, 150000],
    odds: 0.55,
    crime: 'burglary',
    respect: 9,
    heat: 18,
  },
  {
    id: 'bank',
    label: 'Rob a bank',
    emoji: '🏦',
    minRank: 2,
    take: [150000, 900000],
    odds: 0.4,
    crime: 'armed_robbery',
    respect: 16,
    heat: 35,
  },
  {
    id: 'casino',
    label: 'Skim a casino',
    emoji: '🎰',
    minRank: 3,
    take: [500000, 3000000],
    odds: 0.5,
    crime: 'embezzlement',
    respect: 20,
    heat: 25,
  },
];

const CREWS = [
  'the Harbour Boys',
  'the Corsini family',
  'the Night Market crew',
  'the Lindqvist outfit',
  'the Steel Street firm',
];

export const underworldOf = (s: GameState): UnderworldRecord | null => s.underworld ?? null;

export function joinReason(s: GameState): string | null {
  if (s.underworld && !s.underworld.informant) return 'already in a crew';
  if (s.underworld?.informant) return 'you turned informant: no crew will have you';
  if (s.player.age < 18) return 'from 18';
  if (s.legal.prison) return 'not from prison';
  const record = s.legal.record.length > 0 || s.player.stats.notoriety >= 20;
  return record ? null : 'they only trust people with a record or a reputation';
}

export function jobReason(s: GameState, id: string): string | null {
  const u = s.underworld;
  const j = CREW_JOBS.find((x) => x.id === id);
  if (!u || u.informant) return 'not in a crew';
  if (!j) return 'unknown job';
  if (s.legal.prison || s.legal.case) return 'not with the police involved';
  if (u.rank < j.minRank) return `needs the rank of ${RANKS[j.minRank]}`;
  if (usedThisYear(s, 'uw:jobs') >= 2) return 'two jobs a year';
  if (s.settings.freeTime !== false && workTime(s).left <= 0) return 'no work time left this year';
  return null;
}

export type UnderworldAction =
  { op: 'join' } | { op: 'job'; id: string } | { op: 'lie_low' } | { op: 'inform' };

export function underworldAction(ctx: Ctx, a: UnderworldAction): void {
  const s = ctx.s;
  if (a.op === 'join') {
    const why = joinReason(s);
    if (why) throw new EngineError(why);
    const crew = ctx.rng.pick(CREWS);
    s.underworld = { crew, rank: 0, respect: 0, heat: 0, jobs: [] };
    addStat(s, 'karma', -5);
    ctx.log(
      'crime',
      `🕴️ A man in a good coat buys you a drink and says ${crew} could use someone like you. You say yes before you finish it.`,
      true,
    );
    return;
  }
  const u = s.underworld;
  if (!u || u.informant) throw new EngineError('not in a crew');
  if (a.op === 'lie_low') {
    if (usedThisYear(s, 'uw:low') > 0) throw new EngineError('once a year');
    markUsed(s, 'uw:low');
    u.heat = clampStat(u.heat - 30);
    ctx.log(
      'crime',
      '🕶️ You lie low: a straight job, early nights, a new haircut. The heat cools.',
    );
    return;
  }
  if (a.op === 'inform') {
    u.informant = true;
    s.player.flags.push('witness_protection');
    addStat(s, 'karma', 15);
    addStat(s, 'stress', 15);
    ctx.log(
      'crime',
      `🛡️ You turn informant. Your testimony puts half of ${u.crew} away, and the government gives you a new name, a new town and strict instructions never to call home.`,
      true,
    );
    s.legal.case = null;
    // A new name to go with the new life.
    const names = COUNTRY_BY_ID[s.player.country]?.names.last ?? [];
    const fresh = names.filter((n) => n !== s.player.last);
    if (fresh.length) s.player.last = ctx.rng.pick(fresh);
    return;
  }
  const why = jobReason(s, a.id);
  if (why) throw new EngineError(why);
  const j = CREW_JOBS.find((x) => x.id === a.id) as CrewJob;
  markUsed(s, 'uw:jobs');
  markUsed(s, 'w:total');
  const odds =
    j.odds +
    u.rank * 0.04 +
    (s.player.stats.smarts - 50) / 200 +
    0.2 * luck(s, 'crime') -
    u.heat / 250;
  const ok = ctx.roll(Math.max(0.1, Math.min(0.92, odds)));
  addStat(s, 'karma', -3);
  if (!s.player.flags.includes('ever_crime')) s.player.flags.push('ever_crime');
  if (ok) {
    // The crew takes its cut; a higher rank keeps more of the take.
    const take = money(s, ctx.rng.int(j.take[0], j.take[1]) * (0.3 + u.rank * 0.15));
    s.money.cash += take;
    u.respect += j.respect;
    u.heat = clampStat(u.heat + j.heat);
    u.jobs.push({ year: s.year, job: j.label, ok: true, take });
    addStat(s, 'notoriety', Math.round(j.respect / 3));
    ctx.log(
      'crime',
      `${j.emoji} ${j.label}: it goes smoothly. Your cut is ${formatMoney(s, take)}.`,
      true,
    );
    while (u.rank < RANKS.length - 1 && u.respect >= (RESPECT_FOR[u.rank + 1] ?? 999)) {
      u.rank += 1;
      ctx.log(
        'crime',
        `🕴️ ${u.crew} make you ${RANKS[u.rank]?.toLowerCase()}. People stand up when you walk in now.`,
        true,
      );
    }
  } else {
    u.heat = clampStat(u.heat + j.heat / 2);
    u.jobs.push({ year: s.year, job: j.label, ok: false, take: 0 });
    ctx.log(
      'crime',
      `${j.emoji} ${j.label}: it goes wrong from the first minute. Sirens, a back alley, a lot of running.`,
      true,
    );
  }
  // Heat brings the police: the hotter you are, the likelier the knock on the door.
  if (ctx.rng.chance((ok ? 0.05 : 0.35) + u.heat / 300)) {
    ctx.log('crime', '🚔 Detectives have been watching. They pick you up at dawn.', true);
    openCase(ctx, j.crime);
  }
}

/** The underworld's year: heat cools a little, and a crew's boss collects tribute. */
export function underworldTick(ctx: Ctx): void {
  const s = ctx.s;
  const u = s.underworld;
  if (!u || u.informant || s.death) return;
  u.heat = clampStat(u.heat - 10);
  if (u.rank >= 3 && !s.legal.prison) {
    const tribute = money(
      s,
      u.rank === 4 ? ctx.rng.int(300000, 1200000) : ctx.rng.int(50000, 200000),
    );
    s.money.cash += tribute;
    ctx.log(
      'crime',
      `💼 Your share of ${u.crew}'s business this year: ${formatMoney(s, tribute)}, in envelopes.`,
    );
  }
}
