import { TRAIT_BY_ID } from '../../content/traits';
import type { Ctx } from '../ctx';
import { die } from '../death';
import { money as refMoney } from '../economy';
import { remember } from '../npc';
import { addStat } from '../stats';
import { awardAchievement } from '../systems/achievements';
import { applyCareerEffect } from '../systems/career-effects';
import { applySystemEffect } from '../systems/system-effects';
import { addIllness, cureIllness } from '../systems/illness';
import { applyCrimeEffect } from '../systems/legal-effects';
import { applyStatusEffect } from '../systems/status-effects';
import { addSkill } from '../systems/skills';
import type { ChainPayload, Npc } from '../types';
import { clampStat } from '../util';
import { renderText } from './tokens';
import type { Effect, EventDef, MoneyAmount, OutcomeDef } from './types';
import { addInjury } from '../systems/injuries';

export function outcomeChance(ctx: Ctx, o: OutcomeDef, payload: ChainPayload = {}): number {
  const c = typeof o.chance === 'function' ? o.chance(ctx.s, payload) : o.chance;
  return Number.isFinite(c) ? Math.max(0, c) : 0;
}

/** Weighted outcome draw; the force-success cheat restricts it to success outcomes. */
export function pickOutcome(
  ctx: Ctx,
  outcomes: OutcomeDef[],
  payload: ChainPayload = {},
): OutcomeDef | undefined {
  let pool = outcomes;
  if (ctx.s.cheats.forceSuccess) {
    const ok = outcomes.filter((o) => o.success);
    if (ok.length) pool = ok;
  }
  return ctx.rng.weighted(pool, (o) => outcomeChance(ctx, o, payload)) ?? pool[0];
}

export function resolveMoney(ctx: Ctx, amount: MoneyAmount, payload: ChainPayload): number {
  if (typeof amount === 'number') return amount;
  const v = payload[amount.payload];
  return typeof v === 'number' ? v * (amount.mult ?? 1) : 0;
}

function boundNpc(ctx: Ctx, name: string, bindings: Record<string, number>): Npc | undefined {
  const id = bindings[name];
  return id === undefined ? undefined : ctx.s.npcs.find((n) => n.id === id);
}

export function applyEffect(
  ctx: Ctx,
  e: Effect,
  bindings: Record<string, number>,
  payload: ChainPayload,
  source: string,
): void {
  const s = ctx.s;
  const p = s.player;
  if ('stat' in e && 'delta' in e && !('npcStat' in e)) {
    addStat(s, e.stat, e.delta);
  } else if ('money' in e) {
    const ref = resolveMoney(ctx, e.money, payload);
    s.money.cash += refMoney(s, ref, e.kind ?? 'price');
  } else if ('rel' in e) {
    const n = boundNpc(ctx, e.rel, bindings);
    if (n) remember(s, n, renderText(s, e.memory ?? source, bindings, payload), e.delta);
  } else if ('npcStat' in e) {
    const n = boundNpc(ctx, e.npcStat, bindings);
    if (n) n.stats[e.stat] = clampStat(n.stats[e.stat] + e.delta);
  } else if ('npcFlag' in e) {
    const n = boundNpc(ctx, e.npcFlag, bindings);
    if (n && !n.flags.includes(e.flag)) n.flags.push(e.flag);
  } else if ('flag' in e) {
    if (!p.flags.includes(e.flag)) p.flags.push(e.flag);
  } else if ('unflag' in e) {
    p.flags = p.flags.filter((f) => f !== e.unflag);
  } else if ('addTrait' in e) {
    const t = TRAIT_BY_ID[e.addTrait];
    if (t && !p.traits.includes(t.id)) {
      p.traits = p.traits.filter((x) => !t.excludes.includes(x));
      p.traits.push(t.id);
      ctx.log('system', `${t.emoji} You've become ${t.label.toLowerCase()}.`);
    }
  } else if ('removeTrait' in e) {
    if (p.traits.includes(e.removeTrait)) {
      p.traits = p.traits.filter((x) => x !== e.removeTrait);
      const t = TRAIT_BY_ID[e.removeTrait];
      if (t) ctx.log('system', `You're no longer ${t.label.toLowerCase()}.`);
    }
  } else if ('skill' in e) {
    addSkill(s, e.skill, e.delta);
  } else if ('illness' in e) {
    addIllness(ctx, e.illness);
  } else if ('cure' in e) {
    cureIllness(ctx, e.cure);
  } else if ('injury' in e) {
    addInjury(ctx, e.injury);
  } else if ('vice' in e) {
    s.vices.levels[e.vice] = clampStat(s.vices.levels[e.vice] + e.delta);
    if (e.delta > 0) s.vices.lastUse[e.vice] = s.year;
  } else if ('crime' in e) {
    applyCrimeEffect(ctx, e.crime, e.arrest === true);
  } else if ('job' in e) {
    const fromPayload = typeof payload['jobId'] === 'string' ? payload['jobId'] : undefined;
    applyCareerEffect(ctx, e.job, e.jobId ?? fromPayload);
  } else if ('system' in e) {
    applySystemEffect(ctx, e.system, e.arg, payload);
  } else if ('performance' in e) {
    s.career.performance = clampStat(s.career.performance + e.performance);
  } else if ('status' in e) {
    applyStatusEffect(ctx, e.status, e.with ? boundNpc(ctx, e.with, bindings) : undefined, e.role);
  } else if ('schedule' in e) {
    const [lo, hi] = typeof e.inYears === 'number' ? [e.inYears, e.inYears] : e.inYears;
    s.chains.push({
      eventId: e.schedule,
      dueYear: s.year + ctx.rng.int(lo, hi),
      payload: { ...payload, ...(e.payload ?? {}) },
      bindings: { ...bindings },
    });
  } else if ('death' in e) {
    if (!s.cheats.immortal) die(ctx, e.death);
  } else if ('achievement' in e) {
    awardAchievement(ctx, e.achievement);
  } else if ('fame' in e) {
    addStat(s, 'fame', e.fame);
  } else if ('notoriety' in e) {
    addStat(s, 'notoriety', e.notoriety);
  } else if ('conduct' in e) {
    if (s.military) s.military.conduct = clampStat(s.military.conduct + e.conduct);
  }
}

/** Apply an outcome: log its text, run its effects, schedule its follow-up. */
export function applyOutcome(
  ctx: Ctx,
  def: EventDef,
  o: OutcomeDef,
  bindings: Record<string, number>,
  payload: ChainPayload,
  isNotice: boolean,
  choiceLabel?: string,
): void {
  const s = ctx.s;
  const text = renderText(s, o.text, bindings, payload);
  const prompt = renderText(s, def.text, bindings, payload);
  if (isNotice) ctx.log(def.category, `${prompt} ${text}`.trim());
  else
    ctx.log(def.category, text, false, {
      prompt,
      chose: renderText(s, choiceLabel ?? '', bindings, payload),
    });
  for (const e of o.effects) {
    if (s.death) break;
    applyEffect(ctx, e, bindings, payload, def.id.replace(/_/g, ' '));
  }
  if (o.next && !s.death) {
    const [lo, hi] =
      typeof o.next.inYears === 'number' ? [o.next.inYears, o.next.inYears] : o.next.inYears;
    s.chains.push({
      eventId: o.next.eventId,
      dueYear: s.year + Math.max(1, ctx.rng.int(lo, hi)),
      payload: { ...payload, ...(o.next.payload ?? {}) },
      bindings: { ...bindings },
    });
  }
}
