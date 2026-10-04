import type { Ctx } from '../ctx';

/** Job changes from events (the full career system arrives with M6). */
export function applyCareerEffect(
  ctx: Ctx,
  kind: 'fire' | 'promote' | 'demote' | 'raise' | 'hire',
  jobId?: string,
): void {
  const c = ctx.s.career;
  if (kind === 'fire') {
    if (!c.jobId) return;
    const rec = c.history.at(-1);
    if (rec && rec.to === null) {
      rec.to = ctx.s.year;
      rec.reason = 'fired';
    }
    c.jobId = null;
    c.salary = 0;
    c.level = 0;
    ctx.log('work', 'You are out of a job.', true);
  } else if (kind === 'promote' && c.jobId) {
    c.level += 1;
    c.salary = Math.round(c.salary * 1.15);
  } else if (kind === 'demote' && c.jobId) {
    c.level = Math.max(0, c.level - 1);
    c.salary = Math.round(c.salary * 0.88);
  } else if (kind === 'raise' && c.jobId) {
    c.salary = Math.round(c.salary * 1.08);
  } else if (kind === 'hire' && jobId) {
    c.jobId = jobId;
  }
}
