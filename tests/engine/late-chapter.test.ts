import { describe, expect, it } from 'vitest';
import { ageUp, choose, currentPopup, newLife, runCheat, type GameState } from '../../src/engine';

const retiree = (seed: number): GameState => {
  let s = runCheat(newLife({ birthYear: 1950, country: 'us' }, seed), 'age.set', { age: 68 }).state;
  s = runCheat({ ...s, pending: [] }, 'asset.spawn', { asset: 'home:house' }).state;
  s = runCheat({ ...s, pending: [] }, 'baby.now', {}).state;
  const kid = s.npcs.find((n) => n.roles.includes('child'));
  return {
    ...s,
    pending: [],
    npcs: s.npcs.map((n) => (n.id === kid?.id ? { ...n, age: 40, rel: 50 } : n)),
    cheats: { ...s.cheats, immortal: true },
  };
};
const fire = (s: GameState): GameState =>
  runCheat(s, 'event.fire', { event: 'late_chapter', force: 'on' }).state;

describe('the later-life chapter', () => {
  it('downsizing sells the house, buys a flat outright, and leaves money over', () => {
    const s = fire(retiree(600));
    expect(currentPopup(s)?.eventId).toBe('late_chapter');
    const house = s.assets.homes.find((h) => h.livingIn);
    const after = choose(s, 'downsize').state;
    const home = after.assets.homes.find((h) => h.livingIn);
    expect(home?.type).toBe('apartment');
    expect(home?.paid).toBe(home?.value);
    expect(after.money.cash - s.money.cash).toBeGreaterThan((house?.value ?? 0) * 0.4);
    // Already in a flat: the option is closed.
    const again = fire({ ...after, pending: [] });
    expect(currentPopup(again)?.choices.find((c) => c.id === 'downsize')?.enabled).toBe(false);
  });

  it('moving near the family changes city and warms the children', () => {
    const s = fire(retiree(601));
    const after = choose(s, 'near').state;
    expect(after.player.city).not.toBe(s.player.city);
    const kid = after.npcs.find((n) => n.roles.includes('child'));
    expect(kid?.rel).toBeGreaterThan(50);
  });

  it('retiring abroad means somewhere warm, not home, and ends the job', () => {
    for (const seed of [603, 604, 605, 606]) {
      let s = runCheat(retiree(seed), 'job.set', { job: 'accountant' }).state;
      s = runCheat({ ...s, pending: [] }, 'money.add', { amount: 100000 }).state;
      const p = fire({ ...s, pending: [] });
      if (!currentPopup(p)?.choices.find((c) => c.id === 'sun')?.enabled) continue;
      const after = choose(p, 'sun').state;
      expect(['mx', 'au', 'br', 'fr']).toContain(after.player.country);
      expect(after.player.country).not.toBe(after.player.birthCountry);
      expect(after.career.jobId).toBeNull();
      return;
    }
    throw new Error('no seed could retire abroad');
  });

  it('comes round every eight years or so after 66', () => {
    let s = retiree(602);
    const years: number[] = [];
    for (let y = 0; y < 18; y++) {
      s = ageUp({ ...s, pending: [] }).state;
      for (let i = 0; i < 10 && s.pending.length; i++) {
        const p = currentPopup(s);
        if (!p) break;
        if (p.eventId === 'late_chapter') years.push(s.player.age);
        const id = p.eventId === 'late_chapter' ? 'stay' : p.choices.find((c) => c.enabled)?.id;
        if (!id) break;
        s = choose(s, id).state;
      }
    }
    expect(years.length).toBeGreaterThanOrEqual(1);
    for (let i = 1; i < years.length; i++)
      expect((years[i] ?? 0) - (years[i - 1] ?? 0)).toBeGreaterThanOrEqual(8);
  });
});
