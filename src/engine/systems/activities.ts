import { ACTIVITIES, ACTIVITY_BY_ID } from '../../content/activities';
import type { ActivityDef } from '../../content/types';
import type { Ctx } from '../ctx';
import { countryOf, formatMoney, money } from '../economy';
import { EngineError } from '../errors';
import { applyEffect, pickOutcome } from '../events/apply';
import { renderText } from '../events/tokens';
import type { GameState } from '../types';
import { addChild } from './romance';
import { currentPartner, partnerOf } from './partners';
import { markUsed, usedThisYear } from './usage';
import { runSpecial, specialReason } from './activity-specials';
import { escapeMap, parseMoves, simulate } from './escape';
import { betOptions, parsePlan, playSession, shoeFor } from './blackjack';
import { dateCandidates } from './dating';
import { clampOdds, playerOdds } from './odds';

/** Under 18, your parents pay for health care, lessons and the like; holidays are theirs to plan. */
export function parentsPay(s: GameState, def: ActivityDef): boolean {
  return s.player.age < 18 && def.group !== 'travel' && !s.legal.prison;
}

export type ActivityView = {
  id: string;
  label: string;
  emoji: string;
  group: string;
  description: string;
  enabled: boolean;
  reason: string;
  cost: number;
  /** A child's parents cover the cost. */
  parentsPay: boolean;
};

/** Groups and specials that never cost free time: paperwork, prison life and health care. */
const FREE_GROUPS = new Set(['admin', 'prison']);
const FREE_SPECIALS = new Set(['doctor', 'therapy', 'rehab', 'support', 'will']);

export function costsFreeTime(def: ActivityDef): boolean {
  return !FREE_GROUPS.has(def.group) && !(def.special && FREE_SPECIALS.has(def.special));
}

/**
 * How many activities fit in a year. Work, service and small children take time;
 * retirement and being out of work give it back.
 */
export function freeTime(s: GameState): { total: number; left: number; why: string[] } {
  const why: string[] = [];
  let total = s.player.age < 13 ? 4 : 6;
  if (s.player.age >= 18) {
    if (s.career.jobId || s.military?.active) {
      total -= 2;
      why.push('full-time work');
    } else if (s.career.partTimeId) {
      total -= 1;
      why.push('a part-time job');
    } else if (s.career.retired) {
      total += 2;
      why.push('retired');
    } else if (s.education.enrollment) {
      total -= 1;
      why.push('studies');
    } else {
      total += 1;
      why.push('no job');
    }
    if (s.npcs.some((n) => n.alive && n.roles.includes('child') && n.age < 5)) {
      total -= 1;
      why.push('small children');
    }
  }
  total = Math.max(2, total);
  return { total, left: Math.max(0, total - usedThisYear(s, 'a:total')), why };
}

/** Why an activity can't be done now, or null. */
export function activityReason(s: GameState, def: ActivityDef): string | null {
  const age = s.player.age;
  if (s.death) return 'the life is over';
  if (age < def.ages[0]) return `from age ${def.ages[0]}`;
  if (age > def.ages[1]) return `up to age ${def.ages[1]}`;
  if (def.adultsOnly && age < 18) return 'adults only';
  if (def.minYear && s.year < def.minYear) return `not invented until ${def.minYear}`;
  if (def.group === 'prison' && !s.legal.prison) return 'only in prison';
  if (s.legal.prison && def.group !== 'admin' && def.group !== 'prison') return 'not from prison';
  const special = specialReason(s, def);
  if (special) return special;
  if (usedThisYear(s, `a:${def.id}`) >= def.limitPerYear) return 'done enough this year';
  if (costsFreeTime(def) && freeTime(s).left <= 0) return 'no free time left this year';
  if (def.special === 'meet' && def.group === 'love' && partnerOf(s))
    return 'you are already seeing someone';
  if (def.special === 'fertility' && s.family.pregnancy) return 'a baby is already on the way';
  if (def.special === 'driving_test') {
    if (s.assets.licence) return 'you already have a licence';
    const min = countryOf(s).ages.driving;
    if (age < min) return `driving age here is ${min}`;
  }
  if (def.group === 'travel' && age < 18) return 'your family plans the holidays';
  if (def.cost && !parentsPay(s, def) && s.money.cash < money(s, def.cost))
    return `costs ${formatMoney(s, money(s, def.cost))}`;

  return null;
}

export function activitiesFor(s: GameState): ActivityView[] {
  return ACTIVITIES.map((def) => {
    const why = activityReason(s, def);
    return {
      id: def.id,
      label: def.label,
      emoji: def.emoji,
      group: def.group,
      description: def.description,
      enabled: why === null,
      reason: why ?? '',
      cost: def.cost && !parentsPay(s, def) ? money(s, def.cost) : 0,
      parentsPay: !!def.cost && parentsPay(s, def),
    };
  });
}

export type WillParams = { heirs?: { npcId: number; share: number }[] };

export function doActivity(ctx: Ctx, id: string, params: Record<string, unknown> = {}): void {
  const s = ctx.s;
  const def = ACTIVITY_BY_ID[id];
  if (!def) throw new EngineError(`unknown activity ${id}`);
  const why = activityReason(s, def);
  if (why) throw new EngineError(`${def.label}: ${why}`);
  // Tonight's dates are drawn for this outing, so read them before it is counted.
  if (def.special === 'meet' && params['pick'] !== undefined) {
    const pick = dateCandidates(s, def.id)[Number(params['pick'])];
    if (!pick) throw new EngineError(`${def.label}: pick someone`);
    ctx.meet = pick;
  }
  // The casino shoe is shuffled for this visit, so read it before the visit is counted.
  const shoe = def.special === 'casino' && params['plan'] !== undefined ? shoeFor(s) : null;
  markUsed(s, `a:${def.id}`);
  if (costsFreeTime(def)) markUsed(s, 'a:total');
  if (def.cost && !parentsPay(s, def)) s.money.cash -= money(s, def.cost);

  let outcomes = def.outcomes;
  if (def.special === 'meet') {
    const partnered = currentPartner(ctx) !== undefined;
    // Partnered players don't meet new people (that's what affairs in events are for).
    if (partnered)
      outcomes = outcomes.filter(
        (o) => !o.effects.some((e) => 'status' in e && e.status === 'meet'),
      );
    // Looks and romance odds tilt the dice.
    const boost =
      clampOdds(0.5 + (s.player.stats.looks - 50) * 0.006 + playerOdds(s, 'romance')) / 0.5;
    outcomes = outcomes.map((o) => (o.success ? { ...o, chance: o.chance * boost } : o));
  }
  if (def.special === 'driving_test') {
    const tilt =
      0.6 +
      (s.player.stats.discipline - 50) * 0.008 +
      (s.player.stats.smarts - 50) * 0.004 +
      (s.player.traits.includes('reckless') ? -0.15 : 0);
    outcomes = outcomes.map((o) => (o.success ? { ...o, chance: Math.max(0.1, tilt) } : o));
  }
  // Blackjack: the hands you played decide the night.
  if (shoe) {
    const plan = parsePlan(params['plan']);
    const bet = Number(params['bet']);
    if (plan === null) throw new EngineError('Casino: that is not how cards work');
    if (!betOptions(s, (r) => money(s, r)).includes(bet))
      throw new EngineError('Casino: pick a table');
    const session = playSession(shoe, plan);
    if (session.waiting) throw new EngineError('Casino: finish the hand first');
    if (
      session.hands.some((h) => h.status === 'blackjack') &&
      !s.player.flags.includes('natural_blackjack')
    )
      s.player.flags.push('natural_blackjack');
    const net = Math.round(session.net * bet);
    params = { ...params, net };
    const pick = net > 0 ? 0 : net < 0 ? 1 : 2;
    outcomes = [
      { ...(def.outcomes[pick] ?? def.outcomes[0]), chance: 1 } as (typeof outcomes)[number],
    ];
  }
  // A planned escape is decided by the route you took, not a dice roll.
  if (def.special === 'prison:escape' && params['moves'] !== undefined) {
    const moves = parseMoves(params['moves']);
    if (!moves) throw new EngineError('Escape: that route makes no sense');
    const end = simulate(escapeMap(s), moves).status;
    const pick = end === 'escaped' ? 0 : end === 'caught' ? 1 : 2;
    outcomes = [
      { ...(def.outcomes[pick] ?? def.outcomes[0]), chance: 1 } as (typeof outcomes)[number],
    ];
  }
  const o = pickOutcome(ctx, outcomes);
  if (!o) return;
  ctx.log('activity', `${def.emoji} ${renderText(s, o.text)}`);
  for (const e of o.effects) applyEffect(ctx, e, {}, {}, def.id);

  if (def.special === 'fertility' && o.success) {
    const partner = currentPartner(ctx);
    s.family.pregnancy = {
      due: s.year + 1,
      partnerId: partner?.id ?? -1,
      carrier: s.player.gender === 'female' ? 'player' : 'partner',
    };
  }
  if (def.special === 'adopt' && o.success) {
    const kid = addChild(ctx, currentPartner(ctx), true, ctx.rng.int(0, 8));
    s.family.adoptions += 1;
    ctx.log(
      'family',
      `${kid.first}, ${kid.age === 0 ? 'a baby' : `aged ${kid.age}`}, is now part of your family.`,
      true,
    );
  }
  if (def.special === 'will') writeWill(ctx, (params as WillParams).heirs);
  if (def.special === 'study') s.education.studyYear = s.year;
  runSpecial(
    ctx,
    def,
    o.success === true,
    params,
    def.outcomes.findIndex((x) => x.text === o.text),
  );
  if (def.special === 'driving_test' && o.success) {
    s.assets.licence = true;
    ctx.log('system', 'You have a driving licence.', true);
  }
}

/** Record a will. Shares are normalised; with no heirs given, spouse and children share equally. */
export function writeWill(ctx: Ctx, heirs?: { npcId: number; share: number }[]): void {
  const s = ctx.s;
  const valid = (heirs ?? []).filter(
    (h) =>
      s.npcs.some((n) => n.id === h.npcId && n.alive) && Number.isFinite(h.share) && h.share > 0,
  );
  let list = valid;
  if (!list.length) {
    const fam = s.npcs.filter(
      (n) => n.alive && (n.roles.includes('spouse') || n.roles.includes('child')),
    );
    // No spouse or children: the two people you are closest to.
    const close = fam.length
      ? fam
      : s.npcs
          .filter((n) => n.alive && n.rel >= 50 && !n.roles.includes('enemy'))
          .sort((a, b) => b.rel - a.rel || a.id - b.id)
          .slice(0, 2);
    list = close.map((n) => ({ npcId: n.id, share: 1 }));
  }
  const total = list.reduce((t, h) => t + h.share, 0) || 1;
  s.will = {
    heirs: list.map((h) => ({ npcId: h.npcId, share: Math.round((100 * h.share) / total) })),
    written: s.year,
  };
  const names = s.will.heirs.map((h) => {
    const n = s.npcs.find((x) => x.id === h.npcId);
    return `${n?.first ?? '?'} ${h.share}%`;
  });
  ctx.log(
    'money',
    names.length
      ? `Your will: ${names.join(', ')}.`
      : 'You write a will, but there is nobody to leave it to. It will all go to the state.',
  );
}
