import { SPORT_BY_ID, type SportDef } from '../../content/sports';
import { EVENT_BY_ID } from '../../content/events';
import type { Ctx } from '../ctx';
import { EngineError } from '../errors';
import { fireEvent } from '../events/select';
import { pickFresh } from '../fresh';
import { addStat } from '../stats';
import type { GameState } from '../types';
import { addInjury } from './injuries';
import { luck } from './luck';
import { addSkill } from './skills';

/** A sport you play, season by season: the level you have reached, your form, your honours. */
export type SportRecord = {
  sport: string;
  /** Index into the sport's levels: 0 school, 1 club, 2 county/regional, 3 national youth, 4 national. */
  level: number;
  best: number;
  /** 0..100: last season's form. */
  form: number;
  seasons: number;
  honours: string[];
  /** Still playing (false once you hang up your boots). */
  active: boolean;
};
export const SPORT_COST = 1;

export const sportOf = (s: GameState): SportRecord | null => s.sport ?? null;
export const sportDef = (r: SportRecord): SportDef | undefined => SPORT_BY_ID[r.sport];
export const levelLabel = (r: SportRecord): string => sportDef(r)?.levels[r.level] ?? '';

export function takeUpReason(s: GameState, id: string): string | null {
  if (!SPORT_BY_ID[id]) return 'unknown sport';
  if (s.player.age < 6) return 'from age 6';
  if (s.player.age > 45) return 'your knees disagree';
  if (s.legal.prison) return 'not from prison';
  return null;
}

/** Take up a sport (or switch: you start again at the bottom), or hang up your boots (null). */
export function takeUpSport(ctx: Ctx, id: string | null): void {
  const s = ctx.s;
  if (id === null) {
    if (s.sport?.active) {
      s.sport.active = false;
      ctx.log('activity', `${sportDef(s.sport)?.emoji ?? '🏅'} You hang up your boots.`, true);
    }
    return;
  }
  const why = takeUpReason(s, id);
  if (why) throw new EngineError(why);
  const def = SPORT_BY_ID[id] as SportDef;
  s.sport = { sport: id, level: 0, best: 0, form: 50, seasons: 0, honours: [], active: true };
  ctx.log(
    'activity',
    `${def.emoji} You take up ${def.label.toLowerCase()}: ${def.levels[0]} first.`,
  );
}

/**
 * A season, on your birthday. How well you play: athletics, health, a gift for it, form,
 * and luck. A strong season moves you up a level (selection); a poor one can drop you.
 * The top rungs need youth on your side.
 */
export function sportTick(ctx: Ctx): void {
  const s = ctx.s;
  const r = s.sport;
  if (!r?.active || s.death || s.legal.prison) return;
  const def = sportDef(r);
  if (!def) return;
  const age = s.player.age;
  if (age > 40) {
    r.active = false;
    ctx.log('activity', `${def.emoji} At ${age}, you play your last competitive season.`);
    return;
  }
  const ath = s.player.skills['athletics'] ?? 0;
  const ageMod = age < 14 ? 0 : age <= 30 ? 6 : -(age - 30) * 3;
  const gift = s.player.talent === 'athletics' ? (s.player.talentLevel === 'prodigy' ? 14 : 7) : 0;
  const perf =
    ath * 0.55 +
    (s.player.stats.health - 50) * 0.25 +
    (s.player.stats.discipline - 50) * 0.15 +
    gift +
    ageMod +
    18 * luck(s, 'sport') +
    ctx.rng.normal(0, 10);
  r.form = Math.max(0, Math.min(100, Math.round(perf)));
  r.seasons += 1;
  addSkill(s, 'athletics', 2);
  addStat(s, 'health', 1);
  // What each level asks of you.
  const need = [0, 25, 42, 58, 72][r.level + 1] ?? 999;
  const keep = [0, 15, 32, 48, 62][r.level] ?? 0;
  const band = perf >= need ? 'good' : perf >= keep ? 'fair' : 'bad';
  ctx.log('activity', `${def.emoji} ${pickFresh(ctx, def[band])}`);
  if (band === 'good' && r.level < def.levels.length - 1 && !(r.level >= 3 && age < 16)) {
    r.level += 1;
    r.best = Math.max(r.best, r.level);
    ctx.log('activity', `${def.emoji} You are picked for ${def.levels[r.level]}.`, true);
    if (r.level >= 3) r.honours.push(`${def.levels[r.level]} (${s.year})`);
    addStat(s, 'happiness', 6);
    addStat(s, 'fame', r.level >= 4 ? 4 : r.level >= 3 ? 1 : 0);
  } else if (band === 'bad' && r.level > 0) {
    r.level -= 1;
    ctx.log('activity', `${def.emoji} You are dropped back to ${def.levels[r.level]}.`);
    addStat(s, 'happiness', -4);
  }
  // A professional career, for the best of them, by the sport's own route and at its own
  // age: a club contract at 17, the draft after college, a sponsor's deal, a team's offer.
  const promoted = band === 'good';
  if (
    r.level >= 3 &&
    age >= def.route.age &&
    band !== 'bad' &&
    s.career.jobId !== 'professional_athlete' &&
    !s.player.flags.includes(`pro_offer:${s.year}`) &&
    (promoted || ctx.rng.chance(0.5))
  ) {
    s.player.flags.push(`pro_offer:${s.year}`);
    const ev =
      EVENT_BY_ID[def.route.kind === 'club' ? 'sport_pro_offer' : `sport_pro_${def.route.kind}`];
    if (ev) fireEvent(ctx, ev, 'system', { sport: def.label.toLowerCase() });
  }
  // Contact sports and long seasons bring knocks (a born athlete shrugs off most).
  if (ctx.rng.chance(0.08 * (1 - 0.6 * Math.min(1, luck(s, 'sport')))))
    addInjury(ctx, ctx.rng.int(8, 18), [`${def.label}: a bad fall in a match, on your knee.`]);
}

/** The sport's name, for event text ({sport}). */
export const sportToken = (s: GameState): string | null =>
  s.sport ? (SPORT_BY_ID[s.sport.sport]?.label.toLowerCase() ?? null) : null;
