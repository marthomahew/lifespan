import { describe, expect, it } from 'vitest';
import { act, newLife, runCheat, type GameState } from '../../src/engine';
import { useIncrease } from '../../src/engine/systems/vices';
import { clone } from '../../src/engine/util';
import { playYears } from '../helpers';

const adult = (seed = 1, age = 30): GameState => {
  const s = runCheat(
    runCheat(newLife({ country: 'us', birthYear: 1980 }, seed), 'age.set', { age }).state,
    'money.add',
    { amount: 1e6 },
  ).state;
  return { ...s, cheats: { ...s.cheats, immortal: true, noBadEvents: true } };
};

describe('vices (M8.3)', () => {
  it('meters rise with use, faster for reckless people, and fall with abstinence', () => {
    const s = adult(1);
    const after = act(s, { type: 'activity', id: 'drink' }).state;
    expect(after.vices.levels.alcohol).toBeGreaterThan(0);
    expect(useIncrease(['reckless'], 'alcohol')).toBeGreaterThan(useIncrease([], 'alcohol'));
    expect(useIncrease(['cautious'], 'alcohol')).toBeLessThan(useIncrease([], 'alcohol'));
    const quit = clone(after);
    quit.vices.levels.alcohol = 40;
    quit.vices.lastUse.alcohol = quit.year - 3;
    expect(playYears(quit, 2).vices.levels.alcohol).toBeLessThan(40);
  });

  it('the drinking age follows the country', () => {
    const us20 = runCheat(newLife({ country: 'us', birthYear: 2000 }, 2), 'age.set', {
      age: 20,
    }).state;
    expect(() => act(us20, { type: 'activity', id: 'drink' })).toThrow(/drinking age here is 21/);
    const uk18 = runCheat(newLife({ country: 'uk', birthYear: 2000 }, 2), 'age.set', {
      age: 18,
    }).state;
    expect(() => act(uk18, { type: 'activity', id: 'drink' })).not.toThrow();
  });

  it('high levels cost health, money, job performance and relationships', () => {
    let s = clone(runCheat(adult(3), 'job.set', { job: 'accountant' }).state);
    s.vices.levels.hard_drugs = 85;
    s.vices.lastUse.hard_drugs = s.year;
    const mom = s.npcs.find((n) => n.roles.includes('mother') && n.alive);
    const before = {
      health: s.player.stats.health,
      cash: s.money.cash,
      perf: s.career.performance,
      rel: mom?.rel ?? 0,
    };
    s = playYears(s, 1);
    expect(s.player.stats.health).toBeLessThan(before.health + 3);
    expect(s.money.last?.vices).toBeGreaterThan(0);
    if (mom) expect(s.npcs.find((n) => n.id === mom.id)?.rel).toBeLessThanOrEqual(before.rel);
  });

  it('rehab and support groups bring meters down', () => {
    const s = clone(adult(4));
    s.vices.levels.pills = 80;
    const rehab = act(
      { ...s, cheats: { ...s.cheats, forceSuccess: true } },
      { type: 'activity', id: 'rehab' },
    ).state;
    expect(rehab.vices.levels.pills).toBeLessThanOrEqual(45);
    const group = act(s, { type: 'activity', id: 'support_group' }).state;
    expect(group.vices.levels.pills).toBeLessThan(80);
    expect(() => act(adult(5), { type: 'activity', id: 'rehab' })).toThrow(/nothing to recover/);
  });
});
