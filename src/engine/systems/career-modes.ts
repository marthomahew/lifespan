import type { JobDef } from '../../content/types';
import type { Ctx } from '../ctx';
import { addStat } from '../stats';
import { endJob, salaryFor, titleFor } from './careers';
import { proSeason } from './sport-pro';
import { politicsTick } from './politics';
import { MISSION_JOBS, missionYear } from './missions';

/**
 * Careers that aren't ladders. An athlete's standing follows their form, season by season;
 * an actor's work comes and goes; a politician rises by elections (events), not reviews.
 * Returns true when the job was handled here (no performance promotions).
 */
export const RESULTS_JOBS = [
  'professional_athlete',
  'film_actor',
  'politician',
  'astronaut',
  'intelligence_officer',
  'diplomat',
];
/** Why you can't just ask (shown on the buttons). */
export const RESULTS_REASON: Record<string, string> = {
  professional_athlete: 'your standing follows your form on the pitch',
  film_actor: 'your billing follows the parts you land',
  politician: 'only the voters can promote you',
  astronaut: 'you rise by the missions you fly',
  intelligence_officer: 'you rise by the operations you run',
  diplomat: 'you rise with each posting',
};

export function resultsCareerTick(ctx: Ctx, job: JobDef): boolean {
  const s = ctx.s;
  const c = s.career;
  if (job.id === 'professional_athlete') {
    const sp = s.sport;
    // Boots hung up (or never laced): the playing career is over.
    if (!sp?.active) {
      ctx.log(
        'work',
        'You retire from professional sport. The last match is the hardest to leave.',
        true,
      );
      endJob(ctx, 'retired from playing');
      return true;
    }
    proSeason(ctx);
    return true;
  }
  if (job.id === 'film_actor') {
    // Billing follows your name: fame most of all, then the work you put in, then your face.
    const st = s.player.stats;
    // Years in the business count too: people learn your name, slowly.
    const seasons = Math.min(15, s.year - (c.history.at(-1)?.from ?? s.year));
    const score = st.fame * 0.5 + c.performance * 0.4 + st.looks * 0.1 + seasons;
    const NEED = [0, 30, 48, 66, 82];
    const target = NEED.filter((n) => score >= n).length - 1;
    if (target > c.level) {
      c.level += 1;
      c.since = s.year;
      const title = titleFor(s, job, c.level);
      const rec = c.history.at(-1);
      if (rec) rec.title = title;
      ctx.log(
        'work',
        `🎬 Your agent calls with the news: casting directors want you now. You're a ${title.toLowerCase()}.`,
        true,
      );
      addStat(s, 'happiness', 6);
    } else if (c.level > 0 && score < (NEED[c.level] ?? 0) - 15) {
      c.level -= 1;
      const title = titleFor(s, job, c.level);
      const rec = c.history.at(-1);
      if (rec) rec.title = title;
      ctx.log('work', `🎬 The offers thin out. You're billed as a ${title.toLowerCase()} again.`);
    }
    // Parts come and go: a year's fee swings with the work, around what your billing commands.
    const base = salaryFor(ctx, job, c.level);
    const year = ctx.rng.next();
    c.salary = year < 0.25 ? Math.round(base * 0.25) : year < 0.75 ? base : Math.round(base * 1.8);
    ctx.log(
      'work',
      year < 0.25
        ? 'A quiet year: auditions, callbacks, one advert. You learn to love the word “pencilled”.'
        : year < 0.75
          ? 'A steady year of work: a part you are proud of and one you did for the money.'
          : 'A big year: two films, a press tour and your face on the side of a bus.',
    );
    if (year < 0.25) addStat(s, 'happiness', -3);
    // Work on screen makes you known; a big year makes you famous.
    addStat(s, 'fame', year < 0.25 ? 0 : year < 0.75 ? 1 + c.level : 3 + c.level * 2);
    return true;
  }
  if (MISSION_JOBS.includes(job.id)) {
    missionYear(ctx);
    return true;
  }
  // Politicians: elections decide, not the annual review.
  if (job.id === 'politician') {
    politicsTick(ctx);
    return true;
  }
  return false;
}
