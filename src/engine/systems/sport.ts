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
import { workTime } from './activities';
import { markUsed } from './usage';
import { draftPick } from './sport-pro';
import { PRO_LEAGUES } from '../../content/sport-pro';
import { athleticScholarship } from './education';
import { hasEducation } from './careers';

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
  /** Extra training sessions this year (each lifts the coming season). */
  extra?: number;
  /** Your position or event (quarterback, sprinter...), from the sport's pro league. */
  position?: string;
};
export const SPORT_COST = 1;

export const sportOf = (s: GameState): SportRecord | null => s.sport ?? null;
export const sportDef = (r: SportRecord): SportDef | undefined => SPORT_BY_ID[r.sport];
/** The rung's name for someone this age: adults at the bottom play in an adult league. */
export function rungLabel(def: SportDef, level: number, age: number): string {
  if (level === 0 && age >= 18) return def.adult;
  return def.levels[level] ?? '';
}
export const levelLabel = (r: SportRecord, age = 18): string => {
  const def = sportDef(r);
  return def ? rungLabel(def, r.level, age) : '';
};

/** The highest rung someone this age can be on (no college football at 13). */
export function topRungFor(def: SportDef, age: number): number {
  let top = 0;
  def.ages.forEach((a, i) => {
    if (age >= a) top = i;
  });
  return top;
}

/** School-age rungs end with school: past 18 they lead to college or to adult leagues. */
function schoolRung(def: SportDef, level: number): boolean {
  const first = def.recruited?.[0];
  return first !== undefined && level > 0 && level < first;
}

export function takeUpReason(s: GameState, id: string): string | null {
  if (!SPORT_BY_ID[id]) return 'unknown sport';
  if (s.player.age < 6) return 'from age 6';
  if (s.player.age > 45) return 'your knees disagree';
  if (s.legal.prison) return 'not from prison';
  return null;
}

/** Take up a sport (or switch: you start again at the bottom), or hang up your boots (null). */
export function takeUpSport(ctx: Ctx, id: string | null, position?: string): void {
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
  const positions = PRO_LEAGUES[id]?.positions ?? [];
  const pos =
    positions.find((x) => x.id === position)?.id ??
    (positions.length ? ctx.rng.pick(positions).id : undefined);
  s.sport = {
    sport: id,
    level: 0,
    best: 0,
    form: 50,
    seasons: 0,
    honours: [],
    active: true,
    ...(pos ? { position: pos } : {}),
  };
  ctx.log(
    'activity',
    `${def.emoji} You take up ${def.label.toLowerCase()}: ${rungLabel(def, 0, s.player.age)} first.`,
  );
}

export const EXTRA_TRAINING = 2;

/**
 * Athletic scholarships (in the US, where they exist): a strong school athlete finishing high
 * school is offered a university place with the fees paid. Once.
 */
function scholarshipOffer(ctx: Ctx, def: SportDef, r: SportRecord, band: string): void {
  const s = ctx.s;
  const age = s.player.age;
  if (
    s.player.country !== 'us' ||
    age < 17 ||
    age > 19 ||
    r.level < 2 ||
    band === 'bad' ||
    r.form < 50 ||
    s.education.enrollment ||
    !hasEducation(s, 'high_school') ||
    s.career.jobId === 'professional_athlete' ||
    s.player.flags.includes('scholarship_offered')
  )
    return;
  s.player.flags.push('scholarship_offered');
  const ev = EVENT_BY_ID['sport_scholarship'];
  if (ev) fireEvent(ctx, ev, 'system', { sport: def.label.toLowerCase() });
}

/** Accepting: university with the fees paid, and (in college sports) a place on the team. */
export function acceptScholarship(ctx: Ctx, programId: string): void {
  const s = ctx.s;
  const r = s.sport;
  if (!athleticScholarship(ctx, programId) || !r?.active) return;
  const def = sportDef(r);
  const first = def?.recruited?.[0];
  if (def && first !== undefined && r.level < first) {
    const star = r.form >= 88 && def.recruited?.includes(first + 1);
    r.level = star ? first + 1 : first;
    r.best = Math.max(r.best, r.level);
    const where = def.levels[r.level] ?? '';
    r.honours.push(`${where} (${s.year})`);
    ctx.log('activity', `${def.emoji} You join ${where} on scholarship.`, true);
  }
}

/** Why you can't put in extra training now, or null. */
export function trainReason(s: GameState): string | null {
  const r = s.sport;
  if (!r?.active) return 'not on a team';
  if (s.legal.prison) return 'not from prison';
  if ((r.extra ?? 0) >= EXTRA_TRAINING) return `${EXTRA_TRAINING} extra sessions a year`;
  if (s.settings.freeTime !== false && workTime(s).left <= 0) return 'no work time left this year';
  return null;
}

/** Extra training: a work-time pip for a better season (and a little athletics). */
export function trainExtra(ctx: Ctx): void {
  const s = ctx.s;
  const why = trainReason(s);
  if (why) throw new EngineError(why);
  const r = s.sport as SportRecord;
  r.extra = (r.extra ?? 0) + 1;
  markUsed(s, 'w:total');
  addSkill(s, 'athletics', 4);
  const def = sportDef(r);
  ctx.log(
    'activity',
    `${def?.emoji ?? '🏅'} Extra sessions: early mornings, drills and video. The coaches notice.`,
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
  // Nobody is on a rung beyond their age (older saves could be).
  r.level = Math.min(r.level, topRungFor(def, age));
  const ath = s.player.skills['athletics'] ?? 0;
  const ageMod = age < 14 ? 0 : age <= 30 ? 6 : -(age - 30) * 3;
  const gift = s.player.talent === 'athletics' ? (s.player.talentLevel === 'prodigy' ? 14 : 7) : 0;
  const perf =
    ath * 0.7 +
    (s.player.stats.health - 50) * 0.25 +
    (s.player.stats.discipline - 50) * 0.15 +
    gift +
    ageMod +
    18 * luck(s, 'sport') +
    7 * (r.extra ?? 0) +
    ctx.rng.normal(0, 10);
  r.extra = 0;
  r.form = Math.max(0, Math.min(100, Math.round(perf)));
  r.seasons += 1;
  addSkill(s, 'athletics', 2, 'experience');
  addStat(s, 'health', 1);
  // What each level asks of you.
  const need = [0, 25, 42, 58, 72][r.level + 1] ?? 999;
  const keep = [0, 15, 32, 48, 62][r.level] ?? 0;
  const band = perf >= need ? 'good' : perf >= keep ? 'fair' : 'bad';
  ctx.log('activity', `${def.emoji} ${pickFresh(ctx, def[band])}`);
  // A senior with good form hears from colleges first (before school sport ends).
  scholarshipOffer(ctx, def, r, band);
  const next = r.level + 1;
  if (age > 19 && schoolRung(def, r.level) && !s.education.enrollment) {
    // School is over and no college called: an adult league from here.
    r.level = 0;
    ctx.log(
      'activity',
      `${def.emoji} School sport ends, and no college calls. You play on in ${def.adult}.`,
    );
  } else if (
    band === 'good' &&
    next < def.levels.length &&
    age >= (def.ages[next] ?? 99) &&
    // College teams are reached by a scholarship (below), not by being picked.
    !(def.recruited?.includes(next) && !def.recruited.includes(r.level))
  ) {
    r.level = next;
    // A school star can be recruited straight into a major programme.
    const jump =
      def.recruited?.includes(next) &&
      def.recruited.includes(next + 1) &&
      r.form >= 88 &&
      age >= (def.ages[next + 1] ?? 99);
    if (jump) r.level = next + 1;
    r.best = Math.max(r.best, r.level);
    const where = def.levels[r.level] ?? '';
    const wasRecruited = def.recruited?.includes(r.level);
    ctx.log(
      'activity',
      wasRecruited
        ? def.recruited?.includes(r.level - 1) && !jump
          ? `${def.emoji} After a season like that you transfer to ${where}.`
          : `${def.emoji} Recruiters come calling: you sign with ${where}.`
        : `${def.emoji} You are picked for ${where}.`,
      true,
    );
    if (r.level >= 3) r.honours.push(`${where} (${s.year})`);
    addStat(s, 'happiness', 6);
    addStat(s, 'fame', r.level >= 4 ? 4 : r.level >= 3 ? 1 : 0);
  } else if (band === 'bad' && r.level > 0 && !def.recruited?.includes(r.level)) {
    r.level -= 1;
    ctx.log('activity', `${def.emoji} You are dropped back to ${rungLabel(def, r.level, age)}.`);
    addStat(s, 'happiness', -4);
  } else if (band === 'bad' && def.recruited?.includes(r.level)) {
    ctx.log(
      'activity',
      `${def.emoji} A season on the bench. You keep your scholarship, just about.`,
    );
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
    // The best are always wanted; others get a look about half the time.
    (promoted || r.level >= def.levels.length - 1 || r.form >= 75 || ctx.rng.chance(0.5))
  ) {
    s.player.flags.push(`pro_offer:${s.year}`);
    const ev =
      EVENT_BY_ID[def.route.kind === 'club' ? 'sport_pro_offer' : `sport_pro_${def.route.kind}`];
    const draft = def.route.kind === 'draft' ? draftPick(ctx) : null;
    if (ev)
      fireEvent(ctx, ev, 'system', {
        sport: def.label.toLowerCase(),
        ...(draft ? { pick: draft.pick, draftline: draft.line } : {}),
      });
  }
  // College sport lasts as long as college does (the draft above gets its chance first).
  if (def.recruited?.includes(r.level) && !s.education.enrollment && age > 18) {
    r.level = 0;
    ctx.log(
      'activity',
      `${def.emoji} Your college playing days are over. You play on in ${def.adult}.`,
    );
  }
  // Contact sports and long seasons bring knocks (a born athlete shrugs off most).
  if (ctx.rng.chance(0.08 * (1 - 0.6 * Math.min(1, luck(s, 'sport')))))
    addInjury(ctx, ctx.rng.int(8, 18), [`${def.label}: a bad fall in a match, on your knee.`]);
}

/** The sport's name, for event text ({sport}). */
export const sportToken = (s: GameState): string | null =>
  s.sport ? (SPORT_BY_ID[s.sport.sport]?.label.toLowerCase() ?? null) : null;
