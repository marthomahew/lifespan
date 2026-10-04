import { describe, expect, it } from 'vitest';
import { newLife, runCheat, act, type GameState, type Npc } from '../../src/engine';
import { playYears } from '../helpers';
import { clone } from '../../src/engine/util';
import { MEMORY_MAX, remember } from '../../src/engine/npc';

const immortal = (s: GameState): GameState => ({ ...s, cheats: { ...s.cheats, immortal: true } });

describe('family at birth (M5.1)', () => {
  it('gives parents with ages, jobs, wealth and how they get along; 0–3 siblings; grandparents by age', () => {
    let gpAlive = 0;
    let gpYoungAlive = 0;
    let gpOldAlive = 0;
    let gpYoung = 0;
    let gpOld = 0;
    const sibCounts = new Set<number>();
    for (let seed = 1; seed <= 200; seed++) {
      const s = newLife({}, seed);
      const mom = s.npcs.find((n) => n.roles.includes('mother')) as Npc;
      const dad = s.npcs.find((n) => n.roles.includes('father')) as Npc;
      expect(mom.age).toBeGreaterThanOrEqual(18);
      expect(dad.age).toBeGreaterThanOrEqual(18);
      expect(
        mom.flags.some((f) => ['parents_happy', 'parents_rocky', 'parents_split'].includes(f)),
      ).toBe(true);
      expect(mom.money).toBeGreaterThanOrEqual(0);
      sibCounts.add(s.npcs.filter((n) => n.roles.includes('sibling')).length);
      for (const p of [mom, dad]) {
        for (const gpId of p.parentIds) {
          const gp = s.npcs.find((n) => n.id === gpId) as Npc;
          expect(gp.roles).toContain('grandparent');
          expect(gp.birthYear).toBeLessThan(p.birthYear - 15);
          if (gp.alive) gpAlive++;
          // Three generations up: every grandparent has two great-grandparents on record.
          expect(gp.parentIds.map((id) => s.npcs.find((x) => x.id === id)?.roles[0])).toEqual([
            'great_grandparent',
            'great_grandparent',
          ]);
        }
      }
      // Older parents mean fewer living grandparents.
      const n = mom.parentIds.filter((id) => s.npcs.find((x) => x.id === id)?.alive).length;
      if (mom.age < 25) {
        gpYoung += 2;
        gpYoungAlive += n;
      } else if (mom.age > 35) {
        gpOld += 2;
        gpOldAlive += n;
      }
    }
    expect([...sibCounts].sort()).toEqual([0, 1, 2, 3]);
    expect(gpAlive).toBeGreaterThan(300);
    expect(gpYoungAlive / gpYoung).toBeGreaterThan(gpOldAlive / gpOld);
  });

  it('richer families start with more money', () => {
    const avg = (wealth: 'poor' | 'rich'): number => {
      let t = 0;
      for (let seed = 1; seed <= 20; seed++) {
        const s = newLife({ wealth, country: 'us' }, seed);
        t += s.npcs
          .filter((n) => n.roles.includes('mother') || n.roles.includes('father'))
          .reduce((a, n) => a + n.money, 0);
      }
      return t / 20;
    };
    expect(avg('rich')).toBeGreaterThan(avg('poor') * 50);
  });
});

describe('NPC records and lifecycle (M5.2)', () => {
  it('records traits, stats, relationship and up to 30 memory lines', () => {
    const s = clone(newLife({}, 3));
    const n = s.npcs[0] as Npc;
    expect(n.traits.length).toBeGreaterThan(0);
    expect(Object.keys(n.stats).sort()).toEqual(['happiness', 'health', 'looks', 'smarts']);
    for (let i = 0; i < 40; i++) remember(s, n, `moment ${i}`, 1);
    expect(n.memory).toHaveLength(MEMORY_MAX);
    expect(n.memory[0]?.text).toBe('moment 10');
  });

  it('NPCs age every year and eventually die', () => {
    const s0 = immortal(newLife({ birthYear: 1990 }, 4));
    const s = playYears(s0, 60);
    const mom0 = s0.npcs.find((n) => n.roles.includes('mother')) as Npc;
    const mom = s.npcs.find((n) => n.id === mom0.id) as Npc;
    if (mom.alive) expect(mom.age).toBe(mom0.age + 60);
    const gps = s.npcs.filter((n) => n.roles.includes('grandparent'));
    expect(gps.every((g) => !g.alive)).toBe(true);
    expect(gps.every((g) => typeof g.deathCause === 'string' && (g.deathYear ?? 0) > 1990)).toBe(
      true,
    );
    expect(s.npcs.every((n) => !n.alive || n.age <= 120)).toBe(true);
  });
});

describe('friends (M5.4)', () => {
  it('come from school, and some classmates become friends', () => {
    let classmates = 0;
    let friends = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const s = playYears(immortal(newLife({}, seed)), 15);
      classmates += s.npcs.filter((n) => n.roles.includes('classmate')).length;
      friends += s.npcs.filter((n) => n.roles.includes('friend')).length;
    }
    expect(classmates).toBeGreaterThan(40);
    expect(friends).toBeGreaterThan(5);
  });

  it('come from activities', () => {
    let s = runCheat(immortal(newLife({}, 9)), 'age.set', { age: 30 }).state;
    s = { ...s, cheats: { ...s.cheats, forceSuccess: false } };
    let made = 0;
    for (let i = 0; i < 12; i++) {
      const before = s.npcs.filter((n) => n.roles.includes('friend')).length;
      s = act(s, { type: 'activity', id: 'join_club' }).state;
      if (s.npcs.filter((n) => n.roles.includes('friend')).length > before) made++;
      s = runCheat(s, 'skip', { years: 1 }).state;
    }
    expect(made).toBeGreaterThan(0);
  });

  it('fade 3–6 points a year without contact; family fades more slowly', () => {
    let s = runCheat(immortal(newLife({}, 10)), 'age.set', { age: 30 }).state;
    s = runCheat(s, 'npc.spawn', { role: 'friend' }).state;
    const friend = s.npcs[s.npcs.length - 1] as Npc;
    const mom = s.npcs.find((n) => n.roles.includes('mother') && n.alive) as Npc;
    s = clone(s);
    const f = s.npcs.find((n) => n.id === friend.id) as Npc;
    f.rel = 80;
    f.lastContact = s.year - 3;
    const m = s.npcs.find((n) => n.id === mom.id) as Npc;
    m.rel = 80;
    m.lastContact = s.year - 3;
    const later = playYears({ ...s, cheats: { ...s.cheats, noBadEvents: true } }, 1);
    const f2 = later.npcs.find((n) => n.id === friend.id) as Npc;
    const m2 = later.npcs.find((n) => n.id === mom.id) as Npc;
    const fDrop = 80 - f2.rel;
    expect(fDrop).toBeGreaterThanOrEqual(3);
    expect(80 - m2.rel).toBeLessThan(fDrop + 1);
  });
});
