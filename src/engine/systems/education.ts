import { pickFresh } from '../fresh';
import { GRAD_BY_ID, MAJOR_BY_ID, MAJORS } from '../../content/education';
import type { Ctx } from '../ctx';
import { countryOf, formatMoney, money } from '../economy';
import { EngineError } from '../errors';
import { addStat } from '../stats';
import { addNpc } from '../npc';
import type { Degree, GameState } from '../types';
import { clampStat } from '../util';
import { hasEducation } from './careers';
import { borrowForStudy, startStudentRepayment } from './loans';
import { playerOdds } from './odds';

export const UNIVERSITY_MIN_GRADE = 72;

export const inSchoolAge = (s: GameState): boolean =>
  s.player.age >= 6 && s.player.age <= 17 && !s.education.droppedOut;

/** Smarts a typical child has at this age (it grows through the school years). */
export function expectedSmarts(age: number): number {
  return 20 + 1.6 * Math.min(age, 22);
}

/** Grades compare you with your classmates, not with adults: an average child earns a C. */
function gradeTarget(s: GameState): number {
  const st = s.player.stats;
  const studied = s.education.studyYear === s.year - 1 || s.education.studyYear === s.year;
  return (
    60 +
    (st.smarts - expectedSmarts(s.player.age)) * 1.1 +
    (st.discipline - 50) * 0.3 +
    (studied ? 12 : 0) +
    playerOdds(s, 'study') * 60 -
    Math.max(0, st.stress - 70) * 0.3 -
    // Serious training (county level and up) takes hours that homework would have had.
    (s.sport?.active && s.sport.level >= 2 ? 5 : 0)
  );
}

export function letterGrade(g: number): string {
  return g >= 90 ? 'A+' : g >= 80 ? 'A' : g >= 70 ? 'B' : g >= 60 ? 'C' : g >= 50 ? 'D' : 'F';
}

/** Primary (6–11) and secondary (12–17) happen automatically; grades come from Smarts, Discipline, and study. */
export function schoolTick(ctx: Ctx): void {
  const s = ctx.s;
  const e = s.education;
  const age = s.player.age;
  if (age === 6 && !e.droppedOut) {
    e.inSchool = true;
    ctx.log(
      'school',
      'You start primary school with a new backpack and a firm opinion about lunch.',
      true,
    );
    newTeacher(ctx);
  }
  if (age === 12 && !e.droppedOut) {
    ctx.log(
      'school',
      'You start secondary school. The corridors are enormous and so are the older kids.',
      true,
    );
    newTeacher(ctx);
  }
  if (inSchoolAge(s) && !s.legal.prison) {
    e.grade = clampStat(e.grade + (gradeTarget(s) - e.grade) * 0.4 + ctx.rng.int(-5, 5));
    // Report cards at 9, 12 and 15: not on the first day of school.
    if (age % 3 === 0 && age > 6) ctx.log('school', reportCard(ctx));
  }
  // Inside at 18, there's no graduation: the prison diploma course is the way.
  if (
    age === 18 &&
    !s.legal.prison &&
    !e.droppedOut &&
    !e.degrees.some((d) => d.level === 'high_school')
  )
    graduateHighSchool(ctx);
  if (age > 17) e.inSchool = false;
}

/** The three-yearly report card: the letter, the trend since last time, and a varied reaction. */
function reportCard(ctx: Ctx): string {
  const s = ctx.s;
  const e = s.education;
  const now = letterGrade(e.grade);
  const before = e.reportGrade === undefined ? null : letterGrade(e.reportGrade);
  e.reportGrade = e.grade;
  const parent =
    s.npcs.find((n) => n.alive && (n.roles.includes('mother') || n.roles.includes('father')))
      ?.first ?? 'Someone';
  const rank = (l: string): number => ['F', 'D', 'C', 'B', 'A', 'A+'].indexOf(l);
  const trend =
    before && before !== now ? `, ${rank(now) > rank(before) ? 'up' : 'down'} from ${before}` : '';
  const lines =
    e.grade >= 80
      ? [
          'It goes on the fridge.',
          `${parent} photographs it for the family group chat.`,
          'You read it twice to make sure it is yours.',
        ]
      : e.grade >= 60
        ? [
            'It goes in the recycling, eventually.',
            'The comments say "steady", which is both a compliment and not.',
            'Nobody frames it. Nobody shouts about it either.',
          ]
        : [
            'It goes in a drawer.',
            'Your teacher writes "capable of more, if the library ever sees you."',
            `You reach the post before ${parent} does. The report card does not survive the journey.`,
          ];
  return `Your report card says ${now}${trend}. ${pickFresh(ctx, lines, 200)}`;
}

export function graduateHighSchool(ctx: Ctx): void {
  const s = ctx.s;
  s.education.degrees.push({
    level: 'high_school',
    field: 'general',
    gpa: Math.round((s.education.grade / 25) * 100) / 100,
    year: s.year,
  });
  s.education.inSchool = false;
  ctx.log(
    'school',
    `You graduate from high school with ${/^[AF]/.test(letterGrade(s.education.grade)) ? 'an' : 'a'} ${letterGrade(s.education.grade)} average. Your family cheers slightly too loudly.`,
    true,
  );
}

export function dropOut(ctx: Ctx): void {
  const s = ctx.s;
  const e = s.education;
  if (e.enrollment) {
    ctx.log(
      'school',
      `You drop out of ${e.enrollment.kind === 'grad' ? 'your graduate program' : 'university'}. Your mother takes the news about as well as expected.`,
      true,
    );
    e.enrollment = null;
    startStudentRepayment(s);
    return;
  }
  if (!inSchoolAge(s)) throw new EngineError('you are not in school');
  const leave = countryOf(s).ages.schoolLeaving;
  if (s.player.age < leave) throw new EngineError(`the school-leaving age here is ${leave}`);
  e.droppedOut = true;
  e.inSchool = false;
  addStat(s, 'happiness', 3);
  ctx.log(
    'school',
    'You drop out of school. The first Monday morning in bed feels incredible.',
    true,
  );
}

/** Yearly tuition in local currency: the country's model, or a fraction of it for community college. */
export function tuitionFor(
  s: GameState,
  kind: 'university' | 'community' | 'grad',
  programId: string,
): number {
  const c = countryOf(s);
  let ref = c.university.model === 'free' ? 0 : c.university.tuition;
  if (kind === 'community') ref *= 0.35;
  if (kind === 'grad')
    ref = Math.max(
      ref,
      (GRAD_BY_ID[programId]?.tuition ?? 20000) *
        (c.university.model === 'free' ? 0.05 : c.university.model === 'cheap' ? 0.4 : 1),
    );
  return money(s, ref);
}

export function enrollReason(
  s: GameState,
  kind: 'university' | 'community' | 'grad',
  programId: string,
): string | null {
  const e = s.education;
  if (s.player.age < 17) return 'from age 17';
  if (e.enrollment) return 'already enrolled';
  if (s.legal.prison) return 'not from prison';
  if (s.military?.active) return 'not while serving';
  if (!e.degrees.some((d) => d.level === 'high_school')) return 'needs a high school diploma';
  if (kind === 'grad') {
    const g = GRAD_BY_ID[programId];
    if (!g) return 'unknown program';
    if (!hasEducation(s, 'bachelor')) return 'needs a bachelor degree';
    if (
      g.majors.length &&
      !e.degrees.some((d) => d.level === 'bachelor' && g.majors.includes(d.field))
    )
      return `needs a degree in ${g.majors.join('/')}`;
    if (e.degrees.some((d) => d.level === g.degree)) return 'you already have this degree';
    if (s.career.yearsWorked < g.workYears) return `needs ${g.workYears} years of work`;
    if (s.player.stats.smarts < g.smarts - 10) return `needs smarts around ${g.smarts}`;
  } else {
    const major = MAJOR_BY_ID[programId];
    if (!major) return 'unknown major';
    // Universities want a passing high-school average; community colleges take anyone.
    if (s.legal.fugitive && !s.player.flags.includes('false_papers'))
      return 'enrolment needs papers you cannot show while on the run';
    if (kind === 'university' && e.grade < UNIVERSITY_MIN_GRADE && !e.veteranBenefit)
      return `needs a school average of ${UNIVERSITY_MIN_GRADE}; yours is ${Math.round(e.grade)} (try community college)`;
    if (
      e.degrees.some(
        (d) =>
          d.field === programId &&
          (d.level === 'bachelor' || (kind === 'community' && d.level === 'associate')),
      )
    )
      return 'you already studied this';
  }
  return null;
}

export type EnrollResult = { accepted: boolean; scholarship: boolean; tuition: number };

/** Apply to university, community college, or a graduate program (SPEC §5.2). */
export function enroll(
  ctx: Ctx,
  kind: 'university' | 'community' | 'grad',
  programId: string,
): EnrollResult {
  const s = ctx.s;
  const why = enrollReason(s, kind, programId);
  if (why) throw new EngineError(why);
  const st = s.player.stats;
  const grade = s.education.grade;
  let odds = 1;
  if (kind === 'university') {
    const major = MAJOR_BY_ID[programId];
    odds = 0.35 + (st.smarts - (major?.smarts ?? 50)) * 0.02 + (grade - 74) * 0.012;
  } else if (kind === 'grad') {
    const g = GRAD_BY_ID[programId];
    odds = 0.3 + (st.smarts - (g?.smarts ?? 60)) * 0.025 + (grade - 60) * 0.005;
  }
  const name =
    kind === 'grad'
      ? (GRAD_BY_ID[programId]?.label ?? programId)
      : `${MAJOR_BY_ID[programId]?.label ?? programId}${kind === 'community' ? ' at community college' : ''}`;
  // Community colleges take everyone with a diploma.
  if (kind !== 'community' && !ctx.roll(Math.min(0.97, Math.max(0.03, odds)))) {
    ctx.log('school', `The rejection letter for ${name} is polite and very brief.`, true);
    addStat(s, 'happiness', -5);
    return { accepted: false, scholarship: false, tuition: 0 };
  }
  const length =
    kind === 'community' ? 2 : kind === 'grad' ? (GRAD_BY_ID[programId]?.years ?? 2) : 4;
  const tuition = tuitionFor(s, kind, programId);
  const scholarship = kind !== 'community' && st.smarts >= 80 && grade >= 75 && ctx.rng.chance(0.6);
  s.education.enrollment = {
    kind,
    programId,
    year: 0,
    length,
    gradeSum: 0,
    tuition: scholarship || s.education.veteranBenefit ? 0 : tuition,
    scholarship,
  };
  const help = parentalHelp(s, s.education.enrollment.tuition * length);
  if (help > 0) {
    s.money.cash += help;
    ctx.log(
      'family',
      `Your parents chip in ${formatMoney(s, help)} towards your studies, with a speech about it.`,
    );
  }
  ctx.log(
    'school',
    `You're accepted to study ${name}.${scholarship ? ' A scholarship covers the fees.' : s.education.veteranBenefit ? ' Your veteran benefit pays the tuition.' : tuition ? ` Tuition is ${formatMoney(s, tuition)} a year.` : ' Tuition is free here.'}`,
    true,
  );
  addStat(s, 'happiness', 6);
  return { accepted: true, scholarship, tuition };
}

/**
 * An athletic scholarship: a university place with the fees paid, in return for playing.
 * Coaches get their recruits in, grades or no grades (a diploma is still needed).
 */
export function athleticScholarship(ctx: Ctx, programId: string): boolean {
  const s = ctx.s;
  if (s.education.enrollment || !hasEducation(s, 'high_school') || !MAJOR_BY_ID[programId])
    return false;
  s.education.enrollment = {
    kind: 'university',
    programId,
    year: 0,
    length: 4,
    gradeSum: 0,
    tuition: 0,
    scholarship: true,
  };
  s.player.flags.push('athletic_scholarship');
  ctx.log(
    'school',
    `You start university on a full athletic scholarship, studying ${MAJOR_BY_ID[programId]?.label.toLowerCase() ?? programId}. The fees are paid; the training schedule is not optional.`,
    true,
  );
  addStat(s, 'happiness', 8);
  return true;
}

/** A year of university: pay (or borrow) tuition, perform, graduate (SPEC §5.2). */
export function universityTick(ctx: Ctx): void {
  const s = ctx.s;
  const en = s.education.enrollment;
  if (!en || s.legal.prison) return;
  if (en.tuition > 0) {
    // Pay what cash covers; borrow the rest. Existing debt (negative cash) is left alone.
    const pay = Math.max(0, Math.min(s.money.cash, en.tuition));
    s.money.cash -= pay;
    if (en.tuition - pay > 0) borrowForStudy(s, en.tuition - pay);
  }
  const st = s.player.stats;
  const studied = s.education.studyYear >= s.year - 1;
  const perf = clampStat(
    st.smarts * 0.6 +
      st.discipline * 0.3 +
      (studied ? 12 : 0) +
      playerOdds(s, 'study') * 50 +
      ctx.rng.int(-10, 10),
  );
  en.gradeSum += perf;
  en.year += 1;
  addStat(s, 'smarts', 2);
  if (perf < 25 && ctx.rng.chance(0.25)) {
    ctx.log('school', 'Your grades are bad enough that the university asks you to leave.', true);
    s.education.enrollment = null;
    startStudentRepayment(s);
    return;
  }
  // A hard year makes some students leave for work instead (not everyone who starts finishes).
  if (perf < 40 && en.year < en.length && ctx.rng.chance(0.15)) {
    ctx.log('school', 'A hard year, and you leave your course to start earning instead.', true);
    s.education.enrollment = null;
    startStudentRepayment(s);
    return;
  }
  if (en.year >= en.length) graduate(ctx);
}

function graduate(ctx: Ctx): void {
  const s = ctx.s;
  const en = s.education.enrollment;
  if (!en) return;
  const gpa = Math.round(Math.min(4, (en.gradeSum / en.length / 100) * 4.3) * 100) / 100;
  let deg: Degree;
  if (en.kind === 'grad') {
    const g = GRAD_BY_ID[en.programId];
    deg = { level: g?.degree ?? 'master', field: en.programId, gpa, year: s.year };
  } else
    deg = {
      level: en.kind === 'community' ? 'associate' : 'bachelor',
      field: en.programId,
      gpa,
      year: s.year,
    };
  s.education.degrees.push(deg);
  s.education.enrollment = null;
  startStudentRepayment(s);
  const label =
    en.kind === 'grad'
      ? (GRAD_BY_ID[en.programId]?.label ?? en.programId)
      : (MAJOR_BY_ID[en.programId]?.label ?? en.programId);
  ctx.log(
    'school',
    `You graduate${en.kind === 'grad' ? ` from ${label}` : ` in ${label}`} with a ${gpa.toFixed(2)} GPA. The hat goes up; it does not come down where you threw it.`,
    true,
  );
  addStat(s, 'happiness', 8);
}

/** After a time jump past 18, award the diploma the player would have earned. */
export function educationCatchUp(ctx: Ctx, from: number, to: number): void {
  const s = ctx.s;
  if (
    from < 18 &&
    to >= 18 &&
    !s.education.droppedOut &&
    !s.education.degrees.some((d) => d.level === 'high_school')
  ) {
    s.education.grade = clampStat(
      Math.max(s.education.grade, gradeTarget({ ...s, player: { ...s.player, age: 17 } })),
    );
    graduateHighSchool(ctx);
  }
}

export const majorOptions = (): { id: string; label: string }[] =>
  MAJORS.map((m) => ({ id: m.id, label: m.label }));

/** Parents with savings help pay for university (taken from their own money). */
export function parentalHelp(s: GameState, total: number, dryRun = false): number {
  if (total <= 0 || s.player.age > 30) return 0;
  let paid = 0;
  for (const n of s.npcs) {
    if (!n.alive || !(n.roles.includes('mother') || n.roles.includes('father')) || n.rel < 30)
      continue;
    // Savings and investments both count (they sell some to help).
    const liquid = Math.max(0, n.money) + Math.max(0, n.invest ?? 0);
    const give = Math.min(liquid * 0.5, total / 2);
    if (!dryRun) {
      const fromCash = Math.min(Math.max(0, n.money), give);
      n.money -= fromCash;
      if (give > fromCash) n.invest = Math.max(0, (n.invest ?? 0) - (give - fromCash));
    }
    paid += give;
  }
  return Math.round(paid);
}

/** Leave university or graduate school (any reason): student loans start repaying. */
export function leaveEnrollment(s: GameState): void {
  s.education.enrollment = null;
  startStudentRepayment(s);
}

/** A teacher for this stage of school (the previous one becomes an acquaintance). */
function newTeacher(ctx: Ctx): void {
  for (const n of ctx.s.npcs)
    if (n.roles.includes('teacher'))
      n.roles = n.roles.map((r) => (r === 'teacher' ? 'acquaintance' : r));
  const t = addNpc(ctx, { role: 'teacher', age: ctx.rng.int(26, 60), rel: ctx.rng.int(45, 70) });
  t.job = 'Teacher';
}
