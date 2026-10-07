import { JOB_BY_ID } from '../../content/jobs';
import { PARTY_BY_ID, POLICY_BY_ID, officeTitles, type PartyId } from '../../content/politics';
import type { Ctx } from '../ctx';
import { formatMoney, money } from '../economy';
import { EngineError } from '../errors';
import { addStat } from '../stats';
import type { GameState } from '../types';
import { clampStat } from '../util';
import { workTime } from './activities';
import { endJob, hire } from './careers';
import { inRecession } from './markets';
import { markUsed, usedThisYear } from './usage';

/** A political career: party, approval, terms and elections, bills, leadership. */
export type PoliticsRecord = {
  party: PartyId;
  /** 0..100: how voters rate you. */
  approval: number;
  /** The year your current term ends (your next election). */
  termEnds: number;
  /** Campaign money raised (today's dollars). */
  fund: number;
  /** Your party is in government. */
  inGovernment: boolean;
  /** You lead your party. */
  leader?: boolean;
  /** Standing for this office at the next election. */
  target?: number;
  elections: { year: number; office: string; won: boolean; share: number }[];
  bills: { year: number; area: string; passed: boolean }[];
};

export type PoliticsAction =
  | { op: 'campaign' }
  | { op: 'fundraise' }
  | { op: 'bill'; area: string }
  | { op: 'run_higher' }
  | { op: 'run_leader' }
  | { op: 'switch_party'; party: PartyId }
  | { op: 'stand_down' }
  | { op: 'run_again' };

export const isPolitician = (s: GameState): boolean => s.career.jobId === 'politician';
export const officeName = (s: GameState, level: number): string =>
  officeTitles(s.player.country)[Math.min(4, Math.max(0, level))] ?? 'Politician';

const TERM = 4;
/** General elections come round every four years, everywhere (a simplification). */
const generalElection = (year: number): boolean => year % 4 === 0;

/** Start in politics: a party that suits you, a first term, a seat on the council. */
export function initPolitics(ctx: Ctx): PoliticsRecord {
  const s = ctx.s;
  const t = s.player.traits;
  const party: PartyId =
    t.includes('generous') || t.includes('honest')
      ? 'progressive'
      : t.includes('frugal') || t.includes('cautious')
        ? 'conservative'
        : ctx.rng.pick(['progressive', 'centrist', 'conservative'] as PartyId[]);
  const prev = s.politics;
  const rec: PoliticsRecord = {
    party: prev?.party ?? party,
    approval: 55,
    termEnds: s.year + TERM,
    fund: 0,
    inGovernment: prev?.inGovernment ?? ctx.rng.chance(0.5),
    elections: prev?.elections ?? [],
    bills: prev?.bills ?? [],
  };
  s.politics = rec;
  return rec;
}

/** Why you can't do this now, or null. */
export function politicsReason(s: GameState, a: PoliticsAction): string | null {
  if (s.legal.prison) return 'not from prison';
  const p = s.politics;
  if (a.op === 'run_again') {
    if (isPolitician(s)) return 'you are in office';
    if (s.career.jobId === 'professional_athlete') return 'not while playing professionally';
    if (s.player.age < 21) return 'from 21';
    if (usedThisYear(s, 'pol:run_again') > 0) return 'once a year';
    return null;
  }
  if (!isPolitician(s) || !p) return 'not in politics';
  const level = s.career.level;
  if (a.op === 'switch_party') return a.party === p.party ? 'already your party' : null;
  if (a.op === 'stand_down') return null;
  if (a.op === 'run_higher') {
    if (level >= 2) return 'next: run for party leader';
    if (p.target !== undefined) return 'already standing';
    return null;
  }
  if (a.op === 'run_leader') {
    if (p.party === 'independent') return 'independents have no party to lead';
    if (level < 2) return `first win a seat as ${officeName(s, 2)}`;
    if (p.leader) return 'you lead the party';
    if (p.approval < 55) return 'needs approval of 55';
    if (usedThisYear(s, 'pol:run_leader') > 0) return 'once a year';
  }
  if (a.op === 'bill') {
    if (!POLICY_BY_ID[a.area]) return 'unknown policy';
    if (usedThisYear(s, 'pol:bill') >= 2) return 'two bills a year';
    if (usedThisYear(s, `pol:bill:${a.area}`) > 0) return 'one try a year';
  }
  if (a.op === 'campaign' && usedThisYear(s, 'pol:campaign') >= 2) return 'twice a year';
  if (a.op === 'fundraise' && usedThisYear(s, 'pol:fundraise') >= 2) return 'twice a year';
  if (s.settings.freeTime !== false && workTime(s).left <= 0) return 'no work time left this year';
  return null;
}

function retitle(ctx: Ctx): void {
  const s = ctx.s;
  const rec = s.career.history.at(-1);
  if (rec) rec.title = officeName(s, s.career.level);
}

export function politicsAction(ctx: Ctx, a: PoliticsAction): void {
  const s = ctx.s;
  const why = politicsReason(s, a);
  if (why) throw new EngineError(why);
  if (a.op === 'run_again') {
    markUsed(s, 'pol:run_again');
    const st = s.player.stats;
    const share =
      45 +
      (st.fame - 20) / 10 +
      (st.karma - 50) / 15 +
      (st.smarts - 50) / 20 +
      ctx.rng.normal(0, 5);
    const again = !!s.politics;
    if (share > 50) {
      hire(ctx, 'politician', true, true);
      initPolitics(ctx);
      retitle(ctx);
      ctx.log(
        'work',
        again
          ? `🗳️ You run for the council again and win, ${share.toFixed(1)}% of the vote. Back in the game.`
          : `🗳️ You stand for the local council and win, ${share.toFixed(1)}% of the vote. A political career begins.`,
        true,
      );
    } else
      ctx.log(
        'work',
        `🗳️ You run for the council and lose with ${share.toFixed(1)}%. ${again ? 'Voters have long memories.' : 'Maybe next time.'}`,
      );
    return;
  }
  const p = s.politics as PoliticsRecord;
  if (!['switch_party', 'stand_down'].includes(a.op)) markUsed(s, 'w:total');
  if (a.op === 'campaign') {
    markUsed(s, 'pol:campaign');
    const gain = ctx.rng.int(3, 7);
    p.approval = clampStat(p.approval + gain);
    addStat(s, 'stress', 3);
    ctx.log(
      'work',
      `📣 Doorsteps, town halls and a local radio phone-in. Approval up ${gain}, to ${p.approval}.`,
    );
  } else if (a.op === 'fundraise') {
    markUsed(s, 'pol:fundraise');
    const raised = Math.round((10000 + s.career.level * 40000) * (0.6 + ctx.rng.next()));
    p.fund += raised;
    if (ctx.rng.chance(0.12)) {
      addStat(s, 'karma', -5);
      s.player.flags.push('dodgy_donor');
      ctx.log(
        'work',
        `💰 A dinner raises ${formatMoney(s, money(s, raised))} for the campaign. One donor’s money comes from somewhere you’d rather not look.`,
      );
    } else
      ctx.log(
        'work',
        `💰 A fundraising dinner: ${formatMoney(s, money(s, raised))} for the campaign, and a lot of rubber chicken.`,
      );
  } else if (a.op === 'bill') {
    markUsed(s, 'pol:bill');
    markUsed(s, `pol:bill:${a.area}`);
    const area = POLICY_BY_ID[a.area];
    if (!area) return;
    const odds =
      0.3 +
      (p.inGovernment ? 0.2 : 0) +
      s.career.level * 0.07 +
      (p.approval - 50) / 200 -
      area.difficulty;
    const passed = ctx.rng.chance(Math.max(0.05, Math.min(0.9, odds)));
    const lean = area.lean[p.party];
    p.approval = clampStat(p.approval + Math.round(passed ? lean * 6 : -1));
    if (passed) addStat(s, 'karma', area.karma);
    p.bills.push({ year: s.year, area: a.area, passed });
    ctx.log('work', `${area.emoji} ${passed ? area.passed : area.failed}`, passed);
  } else if (a.op === 'run_higher') {
    p.target = s.career.level + 1;
    ctx.log(
      'work',
      `🗳️ You announce you’ll stand for ${officeName(s, p.target)} when your term ends in ${p.termEnds}.`,
    );
  } else if (a.op === 'run_leader') {
    markUsed(s, 'pol:run_leader');
    const odds = 0.2 + (p.approval - 55) / 60 + s.player.stats.fame / 300;
    if (ctx.rng.chance(Math.max(0.1, Math.min(0.85, odds)))) {
      p.leader = true;
      addStat(s, 'fame', 6);
      ctx.log(
        'work',
        `👑 You win the leadership of the ${PARTY_BY_ID[p.party].label}. ${p.inGovernment ? 'Your party governs: the top job is yours.' : 'Now win the next general election.'}`,
        true,
      );
      if (p.inGovernment) {
        s.career.level = 4;
        retitle(ctx);
        ctx.log('work', `🏛️ You become ${officeName(s, 4)}.`, true);
      }
    } else {
      p.approval = clampStat(p.approval - 4);
      ctx.log(
        'work',
        '👑 You lose the leadership contest. The winner offers you a handshake and a job you can’t refuse.',
      );
    }
  } else if (a.op === 'switch_party') {
    const from = PARTY_BY_ID[p.party].label;
    p.party = a.party;
    p.leader = false;
    p.approval = clampStat(p.approval - 12);
    ctx.log(
      'work',
      `🔀 You cross the floor from the ${from} to the ${PARTY_BY_ID[a.party].label}. Former colleagues stop saying hello.`,
      true,
    );
  } else if (a.op === 'stand_down') {
    ctx.log(
      'work',
      '🎤 You announce you will not stand again. Both sides applaud, which is a first.',
      true,
    );
    s.player.flags.push('stood_down');
    endJob(ctx, 'stood down');
  }
}

/** A share of the vote for you, against your main rival. */
function voteShare(ctx: Ctx, p: PoliticsRecord, standingFor: number): number {
  const s = ctx.s;
  const st = s.player.stats;
  const fundBoost = Math.min(6, (p.fund / (20000 + standingFor * 60000)) * 3);
  const charisma = (st.looks + st.smarts - 100) / 25;
  const independent = p.party === 'independent' ? -6 : 0;
  const climbing = standingFor > s.career.level ? -3 : 2;
  return (
    46 +
    (p.approval - 50) * 0.45 +
    fundBoost +
    charisma +
    independent +
    climbing +
    ctx.rng.normal(0, 4)
  );
}

/** The political year: approval drifts, terms end in elections, governments change. */
export function politicsTick(ctx: Ctx): void {
  const s = ctx.s;
  if (!isPolitician(s)) return;
  const p = s.politics ?? initPolitics(ctx);
  const c = s.career;
  // Approval: your record, your fame, the economy (a recession hurts whoever governs).
  const drift =
    (52 - p.approval) * 0.15 +
    (c.performance - 60) / 12 +
    s.player.stats.fame / 60 -
    (inRecession(s.year) && p.inGovernment ? 6 : 0) +
    (s.player.flags.includes('dodgy_donor') && ctx.rng.chance(0.15) ? -10 : 0) +
    ctx.rng.normal(0, 4);
  p.approval = clampStat(Math.round(p.approval + drift));
  // General election: does your party govern? If you lead it, it's your name on the ballot.
  if (generalElection(s.year)) {
    const wins = ctx.rng.chance(
      Math.max(
        0.1,
        Math.min(
          0.9,
          0.45 +
            (p.leader ? (p.approval - 50) / 80 : 0) +
            (p.inGovernment && inRecession(s.year) ? -0.15 : 0),
        ),
      ),
    );
    const was = p.inGovernment;
    p.inGovernment = p.party !== 'independent' && wins;
    const party = PARTY_BY_ID[p.party].label;
    if (p.leader && p.inGovernment && c.level < 4) {
      c.level = 4;
      retitle(ctx);
      addStat(s, 'fame', 10);
      ctx.log(
        'work',
        `🏛️ General election night: the ${party} wins, and you become ${officeName(s, 4)}.`,
        true,
      );
    } else if (p.leader && !p.inGovernment && c.level === 4) {
      c.level = 2;
      retitle(ctx);
      ctx.log(
        'work',
        `🗳️ The ${party} loses the general election. You go from ${officeName(s, 4)} to leading the opposition.`,
        true,
      );
    } else if (p.party !== 'independent' && was !== p.inGovernment)
      ctx.log(
        'work',
        p.inGovernment
          ? `🗳️ The ${party} wins the general election and forms the government.`
          : `🗳️ The ${party} loses the general election and goes into opposition.`,
      );
    // Ministers serve while their party governs; a strong legislator gets the call.
    if (c.level === 3 && !p.inGovernment) {
      c.level = 2;
      retitle(ctx);
      ctx.log(
        'work',
        'With your party out of government, you lose your ministry and go back to the benches.',
      );
    } else if (
      c.level === 2 &&
      !p.leader &&
      p.inGovernment &&
      p.approval >= 55 &&
      ctx.rng.chance(0.5)
    ) {
      c.level = 3;
      retitle(ctx);
      addStat(s, 'fame', 4);
      ctx.log('work', `📞 The new government calls: you're appointed ${officeName(s, 3)}.`, true);
    }
  }
  // Your own seat comes up when the term ends.
  if (s.year >= p.termEnds) {
    const standingFor = p.target ?? Math.min(c.level, 2);
    const share = voteShare(ctx, p, standingFor);
    const office = officeName(s, standingFor);
    const won = share > 50;
    p.elections.push({ year: s.year, office, won, share: Math.round(share * 10) / 10 });
    p.fund = 0;
    delete p.target;
    if (won) {
      if (standingFor > c.level) {
        c.level = standingFor;
        retitle(ctx);
        addStat(s, 'fame', 3);
      }
      p.termEnds = s.year + TERM;
      ctx.log(
        'work',
        `🗳️ Election night: you win as ${office}, ${share.toFixed(1)}% to ${(100 - share).toFixed(1)}%.`,
        true,
      );
      addStat(s, 'happiness', 6);
    } else {
      ctx.log(
        'work',
        `🗳️ Election night: you lose the race for ${office}, ${share.toFixed(1)}% to ${(100 - share).toFixed(1)}%. You can run again another year.`,
        true,
      );
      addStat(s, 'happiness', -8);
      p.leader = false;
      endJob(ctx, 'lost the election');
    }
  }
  if (c.jobId)
    c.salary = Math.max(
      c.salary,
      money(s, JOB_BY_ID['politician']?.salary[c.level]?.[0] ?? 30000, 'wage'),
    );
}
