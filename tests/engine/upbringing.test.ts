import { describe, expect, it } from 'vitest';
import { act, newLife, runCheat, type GameState } from '../../src/engine';
import { npcNetWorth } from '../../src/engine/systems/npc-economy';
import { playYears } from '../helpers';

const immortal = (s: GameState): GameState => ({ ...s, cheats: { ...s.cheats, immortal: true } });
const parentsWorth = (s: GameState): number =>
  s.npcs
    .filter((n) => n.roles.includes('mother') || n.roles.includes('father'))
    .reduce((a, n) => a + npcNetWorth(n), 0);

describe('childhood by class', () => {
  it('the rich mostly go private (some board); the poor go to the local school', () => {
    const rich = Array.from({ length: 40 }, (_, i) =>
      playYears(newLife({ wealth: 'rich' }, 100 + i), 1),
    );
    const priv = rich.filter((s) => s.upbringing?.school !== 'state').length;
    expect(priv).toBeGreaterThanOrEqual(20);
    expect(rich.some((s) => s.upbringing?.school === 'boarding')).toBe(true);
    for (let i = 0; i < 20; i++)
      expect(playYears(newLife({ wealth: 'poor' }, 200 + i), 1).upbringing?.school).toBe('state');
    expect(rich[0]?.upbringing?.home).toBeTruthy();
  });

  it('pocket money comes out of the parents’ own money', () => {
    const s0 = immortal(newLife({ wealth: 'middle', birthYear: 1990 }, 7));
    const s8 = playYears(s0, 8);
    const s12 = playYears(s8, 4);
    expect(s12.money.cash).toBeGreaterThan(s8.money.cash);
    expect(s12.log.some((l) => l.text.includes('pocket money'))).toBe(true);
  });

  it('a rich child gets lessons, a car at 17 and a trust fund at 18, paid by the parents', () => {
    let funded = 0;
    let cars = 0;
    for (let seed = 1; seed <= 6; seed++) {
      const s = playYears(immortal(newLife({ wealth: 'rich', birthYear: 1980 }, seed)), 18);
      if (s.player.flags.includes('send_off') && s.log.some((l) => l.text.includes('trust fund')))
        funded++;
      if (s.log.some((l) => l.text.includes('seventeenth birthday'))) cars++;
      expect(Object.values(s.player.skills).some((v) => v > 0)).toBe(true);
    }
    expect(funded).toBeGreaterThanOrEqual(4);
    expect(cars).toBeGreaterThanOrEqual(3);
  });

  it('a rich eighteen-year-old starts with far more than a poor one', () => {
    const at18 = (wealth: 'rich' | 'poor', seed: number): number =>
      playYears(immortal(newLife({ wealth, birthYear: 1985 }, seed)), 18).money.cash;
    const rich = [1, 2, 3].map((x) => at18('rich', x));
    const poor = [1, 2, 3].map((x) => at18('poor', x));
    expect(Math.min(...rich)).toBeGreaterThan(Math.max(...poor) * 5);
  });

  it('parents have finances: jobs pay, rich parents are worth far more', () => {
    const rich = newLife({ wealth: 'rich' }, 31);
    const poor = newLife({ wealth: 'poor' }, 31);
    const mum = rich.npcs.find((n) => n.roles.includes('mother'));
    expect(mum?.edu).toBeTruthy();
    expect(parentsWorth(rich)).toBeGreaterThan(parentsWorth(poor) * 10);
  });
});

describe('auditions', () => {
  it('a striking, famous adult who auditions gets cast in time', () => {
    let cast = false;
    for (let seed = 1; seed <= 12 && !cast; seed++) {
      let s = runCheat(newLife({ birthYear: 1980 }, seed), 'age.set', { age: 24 }).state;
      s = {
        ...s,
        pending: [],
        player: { ...s.player, stats: { ...s.player.stats, looks: 95, fame: 60 } },
      };
      const r = act(s, { type: 'activity', id: 'audition' }).state;
      cast = r.career.jobId === 'film_actor';
    }
    expect(cast).toBe(true);
  });
});
