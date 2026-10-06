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
    const { seen } = play(worker(70), 20, { xr_package: 'stay' });
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
