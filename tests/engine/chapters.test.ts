import { describe, expect, it } from 'vitest';
import { ageUp, choose, currentPopup, newLife, runCheat, type GameState } from '../../src/engine';

const midlife = (seed: number): GameState => {
  let s = runCheat(newLife({ birthYear: 1975, country: 'us' }, seed), 'age.set', { age: 45 }).state;
  s = runCheat({ ...s, pending: [] }, 'job.set', { job: 'accountant' }).state;
  s = runCheat({ ...s, pending: [] }, 'money.add', { amount: 200000 }).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true } };
};
const fire = (s: GameState, id: string): GameState =>
  runCheat(s, 'event.fire', { event: id, force: 'on' }).state;

describe('a mid-life chapter', () => {
  it('retraining ends the job and starts a course; moving changes the city; downshifting cuts pay', () => {
    const s = midlife(100);
    const re = choose(fire(s, 'mid_chapter'), 'retrain').state;
    expect(re.career.jobId).toBeNull();
    expect(re.education.enrollment?.kind).toBe('community');
    const moved = choose(fire(s, 'mid_chapter'), 'move').state;
    expect(moved.player.city !== s.player.city || moved.player.country !== s.player.country).toBe(
      true,
    );
    const slow = choose(fire(s, 'mid_chapter'), 'downshift').state;
    expect(slow.career.salary).toBeLessThan(s.career.salary);
  });

  it('comes round every six years or so between 38 and 62', () => {
    let s = runCheat(newLife({ birthYear: 1975, country: 'us' }, 101), 'age.set', { age: 38 }).state;
    s = { ...s, pending: [], cheats: { ...s.cheats, immortal: true } };
    let seen = 0;
    for (let y = 0; y < 25; y++) {
      s = ageUp({ ...s, pending: [] }).state;
      if (s.pending.some((p) => p.eventId === 'mid_chapter')) seen++;
    }
    expect(seen).toBeGreaterThanOrEqual(1);
    expect(seen).toBeLessThanOrEqual(4);
  });
});

describe('university for a child', () => {
  it('who pays now shapes the graduation four years on', () => {
    let s = midlife(102);
    s = runCheat(s, 'baby.now', {}).state;
    const kid = s.npcs.find((n) => n.roles.includes('child'))!;
    s = {
      ...s,
      pending: [],
      npcs: s.npcs.map((n) => (n.id === kid.id ? { ...n, age: 18, job: 'At university' } : n)),
    };
    s = fire(s, 'par_uni_fees');
    expect(currentPopup(s)?.eventId).toBe('par_uni_fees');
    let paid = choose(s, 'all').state;
    expect(paid.chains.some((c) => c.eventId === 'par_uni_grad')).toBe(true);
    for (let y = 0; y < 5; y++) paid = ageUp({ ...paid, pending: [] }).state;
    expect(paid.log.some((l) => /without a debt in the world/.test(l.text))).toBe(true);
  });
});
