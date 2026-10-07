import { describe, expect, it } from 'vitest';
import { newLife, runCheat, type GameState } from '../../src/engine';
import { jobListings } from '../../src/engine/systems/careers';
import { marriageLegal } from '../../src/engine/systems/interactions';
import { generationOf } from '../../src/content/history/norms';

const life = (
  birthYear: number,
  age: number,
  opts: Parameters<typeof newLife>[0] = {},
): GameState => {
  const s = runCheat(newLife({ birthYear, country: 'uk', ...opts }, 3000), 'age.set', {
    age,
  }).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true } };
};

describe('the times you live in', () => {
  it('jobs exist in their era', () => {
    expect(jobListings(life(1955, 25)).some((l) => l.job.id === 'web_developer')).toBe(false);
    const web = jobListings(life(1975, 25)).find((l) => l.job.id === 'web_developer');
    expect(web).toBeDefined();
  });

  it('same-sex couples can marry where and when the law allowed', () => {
    const s = life(1980, 30, { gender: 'male', attraction: 'men' });
    const partner = { ...s.npcs[0]!, gender: 'male' as const };
    expect(s.year).toBe(2010);
    expect(marriageLegal(s, partner)).toBe(false);
    expect(marriageLegal({ ...s, year: 2014 }, partner)).toBe(true);
    expect(
      marriageLegal({ ...s, year: 2030, player: { ...s.player, country: 'jp' } }, partner),
    ).toBe(false);
  });

  it('every life belongs to a generation, and the obituary says so', async () => {
    expect(generationOf(1955)).toBe('a Baby Boomer');
    expect(generationOf(1990)).toBe('a Millennial');
    const { obituary } = await import('../../src/engine');
    const s = runCheat(life(1990, 40), 'deathbot', {}).state;
    expect(obituary(s)?.summary.join(' ')).toMatch(/Born in 1990, a Millennial/);
  });

  it('the 2020 lockdown hits a bartender harder than an accountant', async () => {
    const { Ctx } = await import('../../src/engine/ctx');
    const { applySystemEffect } = await import('../../src/engine/systems/system-effects');
    let lost = 0;
    for (let seed = 3100; seed < 3120; seed++) {
      const bar = structuredClone(
        runCheat(newLife({ birthYear: 1990 }, seed), 'job.set', { job: 'bartender' }).state,
      );
      applySystemEffect(new Ctx(bar), 'lockdown', undefined, {});
      if (!bar.career.jobId) lost++;
      const desk = structuredClone(
        runCheat(newLife({ birthYear: 1990 }, seed), 'job.set', { job: 'accountant' }).state,
      );
      applySystemEffect(new Ctx(desk), 'lockdown', undefined, {});
      expect(desk.career.jobId).toBe('accountant');
    }
    expect(lost).toBeGreaterThan(3);
  });

  it('a life born in 1958 lives through the moon landing, the Wall coming down and the pandemic', async () => {
    const { ageUp, choose, currentPopup } = await import('../../src/engine');
    let s = { ...newLife({ birthYear: 1958, country: 'us' }, 3200), pending: [] } as GameState;
    s = { ...s, cheats: { ...s.cheats, immortal: true } };
    while (s.year < 2022) {
      s = ageUp({ ...s, pending: [] }).state;
      for (let k = 0; k < 10 && s.pending.length; k++) {
        const id = currentPopup(s)?.choices.find((c) => c.enabled)?.id;
        if (!id) break;
        s = choose(s, id).state;
      }
    }
    const seen = Object.keys(s.events.counts).filter((id) => id.startsWith('hist_'));
    expect(seen).toContain('hist_moon_landing_1969');
    expect(seen).toContain('hist_pandemic_2020');
    expect(seen.length).toBeGreaterThanOrEqual(10);
  });
});
