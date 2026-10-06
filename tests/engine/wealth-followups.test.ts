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
});
