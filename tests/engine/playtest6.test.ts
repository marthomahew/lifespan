import { describe, expect, it } from 'vitest';
import { act, ageUp, newLife, runCheat, type GameState } from '../../src/engine';
import { COUNTRY_BY_ID } from '../../src/content/countries';

const at = (age: number, opts: Parameters<typeof newLife>[0] = {}, seed = 1900): GameState => {
  const s = runCheat(newLife({ birthYear: 1970, country: 'us', ...opts }, seed), 'age.set', {
    age,
  }).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true } };
};

describe('fixes from the sixth playtest (new systems)', () => {
  it('a parent around in name only is never the one in the scene', async () => {
    const { matches } = await import('../../src/engine/events/select');
    const s = newLife({ background: 'grandparents' }, 1901);
    const mum = s.npcs.find((n) => n.roles.includes('mother'));
    if (!mum) throw new Error('no mother');
    expect(matches(s, mum, { role: 'mother' }, false)).toBe(false);
    expect(matches(s, mum, { role: 'mother', flag: 'absent_parent' }, false)).toBe(true);
  });

  it('new arrivals carry names from the old country', () => {
    const s = newLife({ country: 'us', background: 'immigrant_family' }, 1902);
    const from = COUNTRY_BY_ID[s.player.backgroundData?.['heritage'] ?? ''];
    const mum = s.npcs.find((n) => n.roles.includes('mother'));
    expect(from?.names.female).toContain(mum?.first);
    expect(from?.names.last).toContain(s.player.last);
  });

  it('a holiday cottage costs a cottage, not a share of a fortune', async () => {
    const { Ctx } = await import('../../src/engine/ctx');
    const { applySystemEffect } = await import('../../src/engine/systems/system-effects');
    const s = structuredClone(runCheat(at(50), 'money.set', { amount: 40_000_000 }).state);
    const cash = s.money.cash;
    applySystemEffect(new Ctx(s), 'holiday_home', undefined, {});
    expect(cash - s.money.cash).toBeLessThan(1_000_000);
  });

  it('a pension remembers your best pay if you are between jobs', async () => {
    const { pensionFor } = await import('../../src/engine/systems/careers');
    const s = at(66);
    const working = {
      ...s,
      career: { ...s.career, yearsWorked: 35, salary: 80000, peakSalary: 80000 },
    };
    const between = { ...working, career: { ...working.career, salary: 0, jobId: null } };
    expect(pensionFor(between)).toBeGreaterThan(pensionFor(working) * 0.7);
  });

  it('nothing is bought from a cell; the always-moving family moves', () => {
    const inside = runCheat(at(40), 'money.set', { amount: 100000 }).state;
    const jailed = {
      ...inside,
      pending: [],
      legal: { ...inside.legal, prison: { years: 5, served: 1, crimeId: 'theft', behaviour: 50 } },
    };
    expect(() => act(jailed, { type: 'buy_item', item: 'violin' })).toThrow(/prison/);
    let kid = { ...newLife({ background: 'moving_family' }, 1903), pending: [] } as GameState;
    const cities = new Set<string>([kid.player.city]);
    for (let y = 0; y < 15; y++) {
      kid = ageUp({ ...kid, pending: [] }).state;
      cities.add(kid.player.city);
    }
    expect(cities.size).toBeGreaterThanOrEqual(3);
  });
});
