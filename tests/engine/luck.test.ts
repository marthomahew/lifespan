import { describe, expect, it } from 'vitest';
import {
  act,
  ageUp,
  choose,
  currentPopup,
  newLife,
  runCheat,
  type GameState,
} from '../../src/engine';
import { luck } from '../../src/engine/systems/luck';
import { eventEdge } from '../../src/engine/events/skill-check';
import { EVENT_BY_ID } from '../../src/content/events';

const life = (seed: number, gifts: string[] = [], age = 30): GameState => {
  const s = runCheat(newLife({ birthYear: 1980, country: 'us', gifts }, seed), 'age.set', {
    age,
  }).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true, noBadEvents: true } };
};
function years(s: GameState, n: number, pick: Record<string, string> = {}): GameState {
  let t = s;
  for (let i = 0; i < n && !t.death; i++) {
    t = ageUp({ ...t, pending: [] }).state;
    for (let k = 0; k < 10 && t.pending.length; k++) {
      const p = currentPopup(t);
      const id = (p && pick[p.eventId]) ?? p?.choices.find((c) => c.enabled)?.id;
      if (!id) break;
      t = choose(t, id).state;
    }
  }
  return { ...t, pending: [] };
}

describe('luck', () => {
  it('is picked, never rolled, and charmed adds a little everywhere', () => {
    for (let seed = 1; seed < 30; seed++)
      expect(newLife({}, seed).player.gifts ?? []).toHaveLength(0);
    const s = life(1300, ['charmed', 'money_luck']);
    expect(luck(s, 'money')).toBeCloseTo(1.35);
    expect(luck(s, 'crime')).toBeCloseTo(0.35);
    expect(luck(life(1301), 'money')).toBe(0);
  });

  it('tilts event odds past the usual cap', () => {
    const def = EVENT_BY_ID['wl_friend_startup'];
    if (!def) throw new Error('missing event');
    const plain = eventEdge(life(1302), def).bonus;
    const lucky = eventEdge(life(1302, ['money_luck']), def).bonus;
    expect(lucky).toBeGreaterThan(plain + 0.25);
  });

  it('a charmed career climbs faster than an ordinary one', () => {
    const climb = (gifts: string[]): number => {
      let total = 0;
      for (const seed of [1310, 1311, 1312, 1313]) {
        const s = runCheat(life(seed, gifts, 25), 'job.set', { job: 'accountant' }).state;
        total += years({ ...s, pending: [] }, 10).career.level;
      }
      return total;
    };
    expect(climb(['career_luck'])).toBeGreaterThan(climb([]));
  });

  it('money luck beats the market; the Midas touch keeps a business booming', () => {
    const grow = (gifts: string[]): number => {
      let total = 0;
      for (const seed of [1320, 1321, 1322]) {
        let s = runCheat(life(seed, gifts), 'money.set', { amount: 400000 }).state;
        s = act(
          { ...s, pending: [] },
          { type: 'money', action: { op: 'invest', key: 'index', amount: 100000 } },
        ).state;
        total += years(s, 10).money.holdings.index;
      }
      return total;
    };
    expect(grow(['money_luck'])).toBeGreaterThan(grow([]) * 1.3);
    const momentum = (gifts: string[]): number => {
      let total = 0;
      for (const seed of [1330, 1331, 1332, 1333]) {
        let s = runCheat(life(seed, gifts), 'money.set', { amount: 200000 }).state;
        s = act(
          { ...s, pending: [] },
          { type: 'business', action: { op: 'start', kind: 'shop' } },
        ).state;
        total += years(s, 5, { biz_buyout: 'keep' }).business?.health ?? 0;
      }
      return total;
    };
    expect(momentum(['business_luck'])).toBeGreaterThan(momentum([]));
  });

  it('never caught: the police are rarely interested', () => {
    let caught = { lucky: 0, plain: 0 };
    for (let seed = 1340; seed < 1360; seed++) {
      for (const [k, gifts] of [
        ['lucky', ['crime_luck']],
        ['plain', []],
      ] as const) {
        const s = act(life(seed, [...gifts]), { type: 'crime', id: 'shoplifting' }).state;
        if (s.legal.case || s.legal.prison) caught = { ...caught, [k]: caught[k] + 1 };
      }
    }
    expect(caught.lucky).toBeLessThan(caught.plain);
  });
});
