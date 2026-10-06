import { describe, expect, it } from 'vitest';
import { ageUp, choose, currentPopup, newLife, runCheat, type GameState } from '../../src/engine';

const worker = (seed: number): GameState => {
  let s = runCheat(newLife({ birthYear: 1980, country: 'us' }, seed), 'age.set', { age: 30 }).state;
  s = runCheat({ ...s, pending: [] }, 'job.set', { job: 'accountant' }).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true, noBadEvents: true } };
};

/** Play years, answering crossroads with a pick and anything else with the first choice. */
function play(
  s: GameState,
  years: number,
  pick: Record<string, string>,
): { s: GameState; seen: string[] } {
  const seen: string[] = [];
  let t = s;
  for (let y = 0; y < years; y++) {
    t = ageUp({ ...t, pending: [] }).state;
    for (let i = 0; i < 10 && t.pending.length; i++) {
      const p = currentPopup(t);
      if (!p) break;
      if (p.eventId.startsWith('xr_')) seen.push(p.eventId);
      const id = pick[p.eventId] ?? p.choices.find((c) => c.enabled)?.id;
      if (!id) break;
      t = choose(t, id).state;
    }
  }
  return { s: { ...t, pending: [] }, seen };
}

describe('career crossroads', () => {
  it('a long stretch in one job brings a fork in the road every five to eight years', () => {
    const { seen } = play(worker(70), 20, { xr_package: 'stay', mid_chapter: 'stay' });
    expect(seen.length).toBeGreaterThanOrEqual(2);
    expect(seen.length).toBeLessThanOrEqual(5);
  });

  it('taking the poacher’s offer pays more; the package ends the job with a year’s pay', () => {
    const s = worker(71);
    const salary = s.career.salary;
    const poached = runCheat(s, 'event.fire', { event: 'xr_poached', force: 'on' }).state;
    const after = choose(poached, 'go').state;
    expect(after.career.salary).toBeGreaterThan(salary);
    const pkg = runCheat(s, 'event.fire', { event: 'xr_package', force: 'on' }).state;
    const left = choose(pkg, 'take').state;
    expect(left.career.jobId).toBeNull();
    expect(left.money.cash - s.money.cash).toBeGreaterThanOrEqual(Math.round(salary * 0.9));
  });
});

describe('the crossroads clock', () => {
  it('no crossroads in a job’s first three years, and promotions don’t reset the clock', async () => {
    const { Ctx } = await import('../../src/engine/ctx');
    const { crossroadsTick } = await import('../../src/engine/systems/crossroads');
    const s = structuredClone(worker(72));
    for (let y = 0; y < 3; y++) {
      const ctx = new Ctx(s);
      crossroadsTick(ctx);
      expect(s.pending.some((p) => p.eventId.startsWith('xr_'))).toBe(false);
      s.year += 1;
    }
    // Ten years in, with a promotion last year: the fork still comes.
    s.year += 7;
    s.career.since = s.year - 1;
    crossroadsTick(new Ctx(s));
    expect(s.pending.some((p) => p.eventId.startsWith('xr_'))).toBe(true);
  });
});

describe('promotions from events', () => {
  it('taking the team updates the title, the history and the log, like a normal promotion', async () => {
    const { JOB_BY_ID } = await import('../../src/content/jobs');
    const s = worker(73);
    const fired = runCheat(s, 'event.fire', { event: 'xr_manage', force: 'on' }).state;
    const after = choose(fired, 'manage').state;
    const title = JOB_BY_ID['accountant']!.titles[after.career.level];
    expect(after.career.level).toBe(s.career.level + 1);
    expect(after.career.history.at(-1)?.title).toBe(title);
    expect(after.log.some((l) => l.text === `Promoted to ${title}.`)).toBe(true);
  });
});
