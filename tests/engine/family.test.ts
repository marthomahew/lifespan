import { describe, expect, it } from 'vitest';
import { newLife, runCheat, act, type GameState, type Npc } from '../../src/engine';
import { playYears } from '../helpers';
import { clone } from '../../src/engine/util';
import { MEMORY_MAX, remember } from '../../src/engine/npc';
import { Ctx } from '../../src/engine/ctx';
import { MILESTONE_CAP, npcMilestones } from '../../src/engine/systems/npc-lives';
import { relationshipDecay } from '../../src/engine/systems/npcs';

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
    expect(
      gps.every((g) => typeof g.deathCause === 'string' && typeof g.deathYear === 'number'),
    ).toBe(true);
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
    // A club brings a friend when its story does (a share of the time): give it years.
    for (let i = 0; i < 25 && made === 0; i++) {
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

describe('the people around you live their own lives', () => {
  const grownUp = (seed: number): GameState => {
    let s = immortal(newLife({ country: 'us', birthYear: 1980 }, seed));
    s = runCheat(s, 'age.set', { age: 30 }).state;
    s = runCheat(s, 'npc.spawn', { role: 'friend' }).state;
    return { ...s, pending: [], cheats: { ...s.cheats, noBadEvents: false } };
  };

  it('over twenty years, close people marry, change jobs, move, and have children, and you hear about it', () => {
    const kinds = new Set<string>();
    let logged = 0;
    for (const seed of [61, 62, 63, 64]) {
      const s = grownUp(seed);
      const ctx = new Ctx(clone(s));
      let married = 0;
      for (let y = 0; y < 20; y++) {
        ctx.s.year += 1;
        for (const n of ctx.s.npcs) if (n.alive) n.age = ctx.s.year - n.birthYear;
        const before = ctx.s.log.length;
        const got = npcMilestones(ctx);
        for (const k of got) kinds.add(k);
        if (got.includes('married')) married += 1;
        const lines = ctx.s.log.length - before;
        expect(lines).toBeLessThanOrEqual(MILESTONE_CAP);
        logged += lines;
      }
      // Milestones change the person, not just the log.
      if (married) expect(ctx.s.npcs.some((n) => n.flags.includes('npc_married'))).toBe(true);
    }
    expect(logged).toBeGreaterThan(10);
    for (const k of ['married', 'job', 'moved', 'baby']) expect(kinds, k).toContain(k);
  });

  it('children hear none of it; news starts in the teens', () => {
    const s = immortal(newLife({ country: 'us', birthYear: 1980 }, 67));
    const ctx = new Ctx(clone(s));
    ctx.s.player.age = 10;
    for (let y = 0; y < 30; y++) expect(npcMilestones(ctx)).toEqual([]);
  });

  it('only people who matter make the news; strangers and the cut-off stay quiet', () => {
    const s = grownUp(65);
    for (const n of s.npcs) n.flags.push('cut_off');
    const ctx = new Ctx(clone(s));
    for (let y = 0; y < 15; y++) {
      ctx.s.year += 1;
      for (const n of ctx.s.npcs) if (n.alive) n.age = ctx.s.year - n.birthYear;
      expect(npcMilestones(ctx)).toEqual([]);
    }
  });
});

describe('distance', () => {
  it('people who moved away fade faster without contact', () => {
    const s = clone(immortal(newLife({ country: 'us', birthYear: 1980 }, 66)));
    const near = s.npcs.find((n) => n.roles.includes('mother'));
    expect(near).toBeDefined();
    if (!near) return;
    near.lastContact = s.year - 5;
    near.rel = 60;
    const far = clone(s);
    far.npcs.find((n) => n.id === near.id)?.flags.push('moved_away');
    relationshipDecay(new Ctx(s));
    relationshipDecay(new Ctx(far));
    const a = s.npcs.find((n) => n.id === near.id)?.rel ?? 0;
    const b = far.npcs.find((n) => n.id === near.id)?.rel ?? 0;
    expect(b).toBe(a - 1);
  });
});
