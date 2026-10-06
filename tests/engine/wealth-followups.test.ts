import { describe, expect, it } from 'vitest';
import { ageUp, choose, currentPopup, newLife, runCheat, type GameState } from '../../src/engine';

const rich = (seed: number, role: 'friend' | 'sibling'): GameState => {
  let s = runCheat(newLife({ birthYear: 1970, country: 'us' }, seed), 'age.set', { age: 40 }).state;
  s = runCheat({ ...s, pending: [] }, 'money.set', { amount: 600_000 }).state;
  s = runCheat({ ...s, pending: [] }, 'npc.spawn', { role }).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true, noBadEvents: true } };
};
/** Age up until a chained event comes due, answering anything else with its first choice. */
function until(s: GameState, id: string, years: number): GameState {
  let t = s;
  for (let y = 0; y < years; y++) {
    t = ageUp({ ...t, pending: [] }).state;
    for (let i = 0; i < 10 && t.pending.length; i++) {
      const p = currentPopup(t);
      if (!p || p.eventId === id) return t;
      const c = p.choices.find((x) => x.enabled)?.id;
      if (!c) break;
      t = choose(t, c).state;
    }
    if (t.log.some((l) => l.year === t.year && l.text.startsWith('The company you said no to')))
      return t;
  }
  return t;
}

describe('money decisions come back around', () => {
  it('turning down the startup brings news of how it went, a few years on', () => {
    const s = runCheat(rich(500, 'friend'), 'event.fire', {
      event: 'wl_friend_startup',
      force: 'on',
    }).state;
    const no = choose(s, 'no').state;
    expect(no.chains.some((c) => c.eventId === 'wl_startup_news')).toBe(true);
    const later = until(no, 'wl_startup_news', 8);
    expect(later.log.some((l) => l.text.startsWith('The company you said no to'))).toBe(true);
  });

  it('a sibling who stopped paying the loan can turn up with it years later', () => {
    let found = false;
    for (let seed = 510; seed < 540 && !found; seed++) {
      const s = runCheat(rich(seed, 'sibling'), 'event.fire', {
        event: 'wl_family_house',
        force: 'on',
      }).state;
      if (currentPopup(s)?.eventId !== 'wl_family_house') continue;
      const lent = choose(s, 'loan').state;
      if (!lent.chains.some((c) => c.eventId === 'wl_loan_return')) continue;
      const later = until(lent, 'wl_loan_return', 10);
      expect(currentPopup(later)?.eventId).toBe('wl_loan_return');
      const id = later.pending[0]?.bindings['sib'];
      const sib = (t: GameState) => t.npcs.find((n) => n.id === id)?.rel ?? 0;
      expect(sib(choose(later, 'keep').state)).toBeGreaterThan(sib(later));
      found = true;
    }
    expect(found).toBe(true);
  });

  it('a loss comes out of savings and investments before any overdraft, never the house', async () => {
    const { Ctx } = await import('../../src/engine/ctx');
    const { applyEffect } = await import('../../src/engine/events/apply');
    const s = structuredClone(rich(520, 'friend'));
    s.money.cash = 10_000;
    s.money.savings = 50_000;
    s.money.holdings.index = 200_000;
    s.assets.homes.push({
      id: 999,
      type: 'house',
      name: 'the house',
      value: 9_000_000,
      paid: 9_000_000,
      condition: 90,
      bought: s.year,
      city: s.player.city,
      country: s.player.country,
      livingIn: true,
    });
    applyEffect(new Ctx(s), { wealth: -0.12 }, {}, {}, 'test');
    // 12% of the 260k you can reach, not of the 9m house.
    expect(s.money.cash).toBe(0);
    expect(s.money.savings + s.money.holdings.index).toBeCloseTo(260_000 * 0.88, -1);
    expect(s.money.loans).toHaveLength(0);
  });

  it('debt that savings and investments can cover is paid off, not taken to court', async () => {
    const { Ctx } = await import('../../src/engine/ctx');
    const { bankruptcyCheck } = await import('../../src/engine/systems/loans');
    const s = structuredClone(rich(521, 'friend'));
    s.money.cash = 0;
    s.money.holdings.index = 900_000;
    s.money.loans = [
      {
        id: 1,
        kind: 'debt',
        principal: 300_000,
        balance: 300_000,
        rate: 0.19,
        termYears: 0,
        payment: 0,
        yearsPaid: 0,
        missed: 0,
      },
    ];
    bankruptcyCheck(new Ctx(s), 0);
    expect(s.player.flags).not.toContain('bankrupt');
    expect(s.money.loans).toHaveLength(0);
    expect(s.money.holdings.index).toBe(600_000);
  });
});
