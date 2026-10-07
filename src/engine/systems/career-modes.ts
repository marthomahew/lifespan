import type { JobDef } from '../../content/types';
import type { Ctx } from '../ctx';
import { formatMoney } from '../economy';
import { addStat } from '../stats';
import { endJob, salaryFor, titleFor } from './careers';

/**
 * Careers that aren't ladders. An athlete's standing follows their form, season by season;
 * an actor's work comes and goes; a politician rises by elections (events), not reviews.
 * Returns true when the job was handled here (no performance promotions).
 */
export const RESULTS_JOBS = ['professional_athlete', 'film_actor', 'politician'];
/** Why you can't just ask (shown on the buttons). */
export const RESULTS_REASON: Record<string, string> = {
  professional_athlete: 'your standing follows your form on the pitch',
  film_actor: 'your billing follows the parts you land',
  politician: 'only the voters can promote you',
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
    const level = sp.form >= 88 ? 4 : sp.form >= 76 ? 3 : sp.form >= 63 ? 2 : sp.form >= 50 ? 1 : 0;
    if (level !== c.level) {
      const up = level > c.level;
      c.level = level;
      c.since = s.year;
      c.salary = salaryFor(ctx, job, level);
      const title = titleFor(s, job, level);
      const rec = c.history.at(-1);
      if (rec) rec.title = title;
      ctx.log(
        'work',
        up
          ? `A season like that changes your standing: ${title.toLowerCase()} now, on ${formatMoney(s, c.salary)} a year.`
          : `Your form dips and your new contract says so: ${title.toLowerCase()}, on ${formatMoney(s, c.salary)}.`,
        up,
      );
    }
    return true;
  }
  if (job.id === 'film_actor') {
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
    return true;
  }
  // Politicians: elections decide (the campaign events), not the annual review.
  return job.id === 'politician';
}
