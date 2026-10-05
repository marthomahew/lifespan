import { describe, expect, it } from 'vitest';
import { ageUp, act, newLife, runCheat } from '../../src/engine';
import { ACHIEVEMENTS, LIFE_TITLES } from '../../src/content/achievements';
import { lifeTitle } from '../../src/engine/titles';
import { clone } from '../../src/engine/util';
import { playYears } from '../helpers';

describe('achievements and life titles (M10.3)', () => {
  it('has 30+ achievements and 12+ life titles with unique ids', () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(30);
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length);
    expect(LIFE_TITLES.length).toBeGreaterThanOrEqual(12);
    expect(new Set(LIFE_TITLES.map((t) => t.title)).size).toBe(LIFE_TITLES.length);
  });

  it('achievements still count in a cheated life (SPEC §8.4)', () => {
    let s = runCheat(newLife({ country: 'us', birthYear: 1990 }, 3), 'age.set', { age: 30 }).state;
    s = runCheat(s, 'money.add', { amount: 2_000_000 }).state;
    expect(s.cheats.used).toBe(true);
    s = playYears({ ...s, cheats: { ...s.cheats, immortal: true } }, 1);
    expect(s.player.achievements).toContain('millionaire');
  });

  it('awards once, with a toast and a log line', () => {
    const s = { ...newLife({}, 1), pending: [] };
    const step = ageUp(s);
    expect(step.state.player.achievements).toContain('first_words');
    expect(
      step.toasts.some((t) => t.kind === 'achievement' && t.text.includes('First Words')),
    ).toBe(true);
    expect(step.log.some((l) => l.cat === 'achievement')).toBe(true);
    const again = playYears(step.state, 2);
    expect(again.player.achievements.filter((a) => a === 'first_words')).toHaveLength(1);
  });

  it('actions trigger achievements immediately', () => {
    let s = runCheat(
      runCheat(newLife({ country: 'us', birthYear: 1990 }, 2), 'age.set', { age: 30 }).state,
      'money.add',
      { amount: 5e6 },
    ).state;
    s = playYears({ ...s, cheats: { ...s.cheats, immortal: true } }, 1);
    const bought = act(s, { type: 'buy_home', index: 0, financing: { kind: 'cash' } });
    expect(bought.state.player.achievements).toContain('homeowner');
    expect(bought.toasts.some((t) => t.text.includes('Homeowner'))).toBe(true);
  });

  it('the life title is chosen from the record', () => {
    const kid = clone(newLife({}, 3));
    kid.player.age = 10;
    expect(lifeTitle(kid)).toBe('Gone Too Soon');
    const star = clone(kid);
    star.player.age = 60;
    star.player.stats.fame = 85;
    expect(lifeTitle(star)).toBe('Famous for Being Famous, Eventually');
    const plain = clone(kid);
    plain.player.age = 70;
    plain.player.flags.push('ever_employed_ft');
    plain.player.stats.karma = 50;
    expect(lifeTitle(plain)).toBe('Ordinary, in the Best Way');
    // A career in the forces is a career, not unemployment.
    const vet = clone(kid);
    vet.player.age = 65;
    vet.player.stats.karma = 50;
    vet.military = {
      branch: 'Army',
      specialty: 'infantry',
      officer: false,
      rank: 5,
      since: 1990,
      deployed: false,
      deployments: 3,
      medals: [],
      conduct: 70,
      discharge: 'honorable',
      active: false,
      years: 20,
    };
    expect(lifeTitle(vet)).toBe('A Life in Uniform');
    vet.military.years = 6;
    expect(lifeTitle(vet)).not.toBe('Gainfully Unemployed');
    const titles = new Set<string>();
    for (let seed = 1; seed <= 25; seed++)
      titles.add(runCheat(newLife({}, seed), 'deathbot', {}).state.death?.title ?? '');
    expect(titles.size).toBeGreaterThan(2);
  });
});
