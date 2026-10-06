import { refToLocal } from '../../engine/economy';
import type { GameState } from '../../engine/types';
import { JOB_BY_ID } from '../jobs';

/** Small pure predicates for event `when`, `weight` and choice `requires` functions. */
export const canAfford =
  (ref: number) =>
  (s: GameState): boolean =>
    s.money.cash >= refToLocal(s, ref);
export const hasFlag =
  (f: string) =>
  (s: GameState): boolean =>
    s.player.flags.includes(f);
export const lacksFlag =
  (f: string) =>
  (s: GameState): boolean =>
    !s.player.flags.includes(f);
export const hasTrait =
  (t: string) =>
  (s: GameState): boolean =>
    s.player.traits.includes(t);
export const statAtLeast =
  (k: keyof GameState['player']['stats'], v: number) =>
  (s: GameState): boolean =>
    s.player.stats[k] >= v;
export const statBelow =
  (k: keyof GameState['player']['stats'], v: number) =>
  (s: GameState): boolean =>
    s.player.stats[k] < v;
export const hasJob = (s: GameState): boolean => s.career.jobId !== null;
/** Working full-time in a job field (healthcare, law, trades...). */
export const inField =
  (field: string) =>
  (s: GameState): boolean =>
    s.career.jobId !== null && JOB_BY_ID[s.career.jobId]?.field === field;
/** Working full-time as one particular job. */
export const isJob =
  (...ids: string[]) =>
  (s: GameState): boolean =>
    s.career.jobId !== null && ids.includes(s.career.jobId);
/** Career level (0 = entry title) at least n. */
export const jobLevelAtLeast =
  (n: number) =>
  (s: GameState): boolean =>
    s.career.jobId !== null && s.career.level >= n;
export const noJob = (s: GameState): boolean => s.career.jobId === null;
export const inSchool = (s: GameState): boolean =>
  s.player.age >= 5 && s.player.age <= 17 && !s.education.droppedOut;
export const atUniversity = (s: GameState): boolean => s.education.enrollment !== null;
export const hasPartner = (s: GameState): boolean =>
  s.npcs.some((n) => n.alive && (n.roles.includes('partner') || n.roles.includes('spouse')));
export const single = (s: GameState): boolean => !hasPartner(s);
export const isMarried = (s: GameState): boolean =>
  s.npcs.some((n) => n.alive && n.roles.includes('spouse'));
export const hasChildren = (s: GameState): boolean =>
  s.npcs.some((n) => n.alive && n.roles.includes('child'));
export const ownsHome = (s: GameState): boolean => s.assets.homes.length > 0;
export const ownsVehicle = (s: GameState): boolean => s.assets.vehicles.length > 0;
export const notInPrison = (s: GameState): boolean => s.legal.prison === null;
/** Living somewhere other than the country you were born in. */
export const livesAbroad = (s: GameState): boolean => s.player.country !== s.player.birthCountry;
/** An adult out of work: no job, not studying, retired, serving or inside. */
export const outOfWork = (s: GameState): boolean =>
  s.player.age >= 19 &&
  s.player.age <= 62 &&
  s.career.jobId === null &&
  !s.career.retired &&
  s.education.enrollment === null &&
  s.legal.prison === null &&
  !s.military?.active;
/** Free to relocate: an adult with no prison, case, or probation holding you here. */
export const canMoveAbroad = (s: GameState): boolean =>
  s.player.age >= 18 && s.legal.prison === null && s.legal.case === null && s.legal.probation === 0;
/** Out of prison after serving time. */
export const exCon = (s: GameState): boolean =>
  s.legal.prison === null && s.player.flags.includes('ex_con');
/** A conviction or plea on record (sealed juvenile records don't count). */
export const hasRecord = (s: GameState): boolean =>
  s.legal.record.some(
    (r) => (r.verdict === 'convicted' || r.verdict === 'plea') && !(r.juvenile && s.legal.sealed),
  );
export const inPrison = (s: GameState): boolean => s.legal.prison !== null;
export const hasSkill =
  (id: string, v: number) =>
  (s: GameState): boolean =>
    (s.player.skills[id] ?? 0) >= v;
export const all =
  (...ps: ((s: GameState) => boolean)[]) =>
  (s: GameState): boolean =>
    ps.every((p) => p(s));
export const any =
  (...ps: ((s: GameState) => boolean)[]) =>
  (s: GameState): boolean =>
    ps.some((p) => p(s));
/** Outcome odds that rise with a stat: base + (stat − 50) × slope, clamped to [0.05, 0.95]. */
export const oddsBy =
  (k: keyof GameState['player']['stats'], base: number, slope = 0.006) =>
  (s: GameState): number =>
    Math.min(0.95, Math.max(0.05, base + (s.player.stats[k] - 50) * slope));
export const serving = (s: GameState): boolean => s.military?.active === true;
export const deployed = (s: GameState): boolean => s.military?.deployed === true;
export const famous =
  (min: number) =>
  (s: GameState): boolean =>
    s.player.stats.fame >= min;
export const hasKidAged =
  (lo: number, hi: number) =>
  (s: GameState): boolean =>
    s.npcs.some((n) => n.alive && n.roles.includes('child') && n.age >= lo && n.age <= hi);

/** You have a living pet (of a kind, if given). */
export const hasPet =
  (kind?: string) =>
  (s: GameState): boolean =>
    s.pets.some((p) => p.alive && (!kind || p.kind === kind));

/** Early days: a partner of at most a few years, with no children together yet. */
export const newCouple =
  (maxYears: number) =>
  (s: GameState): boolean =>
    s.npcs.some(
      (n) =>
        n.alive &&
        n.roles.includes('partner') &&
        !n.roles.includes('spouse') &&
        n.romance !== undefined &&
        s.year - n.romance.since <= maxYears &&
        !s.npcs.some((k) => k.roles.includes('child') && k.parentIds.includes(n.id)),
    );
