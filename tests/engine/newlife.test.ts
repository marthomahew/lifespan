import { describe, expect, it } from 'vitest';
import { newLife } from '../../src/engine';
import { COUNTRIES } from '../../src/content/countries';
import { TRAIT_BY_ID } from '../../src/content/traits';

describe('newLife (M1.3)', () => {
  it('rolls a complete random life', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const s = newLife({}, seed);
      const p = s.player;
      expect(p.first.length).toBeGreaterThan(0);
      expect(p.last.length).toBeGreaterThan(0);
      expect(['male', 'female', 'nonbinary']).toContain(p.gender);
      expect(['men', 'women', 'everyone']).toContain(p.attraction);
      const c = COUNTRIES.find((x) => x.id === p.country);
      expect(c).toBeDefined();
      expect(c?.cities).toContain(p.city);
      expect(p.age).toBe(0);
      expect(s.year).toBe(p.birthYear);
      expect(p.traits.length).toBeGreaterThanOrEqual(2);
      expect(p.traits.length).toBeLessThanOrEqual(3);
      for (const t of p.traits) {
        expect(TRAIT_BY_ID[t]).toBeDefined();
        for (const o of p.traits) expect(TRAIT_BY_ID[t]?.excludes).not.toContain(o);
      }
      expect(s.log.length).toBeGreaterThan(0);
    }
  });

  it('honours every custom field', () => {
    const s = newLife(
      {
        first: 'Ottilie',
        last: 'Marchetti',
        gender: 'nonbinary',
        attraction: 'everyone',
        country: 'jp',
        city: 'Kobe',
        birthYear: 1975,
        appearance: '🏾',
        traits: ['bookish', 'funny', 'calm'],
        stats: { happiness: 11, health: 22, smarts: 33, looks: 44 },
        wealth: 'rich',
      },
      42,
    );
    const p = s.player;
    expect(p.first).toBe('Ottilie');
    expect(p.last).toBe('Marchetti');
    expect(p.gender).toBe('nonbinary');
    expect(p.attraction).toBe('everyone');
    expect(p.country).toBe('jp');
    expect(p.city).toBe('Kobe');
    expect(p.birthYear).toBe(1975);
    expect(s.year).toBe(1975);
    expect(p.appearance).toBe('🏾');
    expect(p.traits).toEqual(['bookish', 'funny', 'calm']);
    expect(p.stats.happiness).toBe(11);
    expect(p.stats.health).toBe(22);
    expect(p.stats.smarts).toBe(33);
    expect(p.stats.looks).toBe(44);
    expect(p.wealth).toBe('rich');
  });

  it('drops conflicting traits and clamps stats', () => {
    const s = newLife(
      { traits: ['lazy', 'ambitious', 'funny'], stats: { happiness: 500, health: -4 } },
      1,
    );
    expect(s.player.traits).toEqual(['lazy', 'funny']);
    expect(s.player.stats.happiness).toBe(100);
    expect(s.player.stats.health).toBe(0);
  });

  it('generates a family at birth', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const s = newLife({}, seed);
      expect(s.npcs.filter((n) => n.roles.includes('mother'))).toHaveLength(1);
      expect(s.npcs.filter((n) => n.roles.includes('father'))).toHaveLength(1);
      const sibs = s.npcs.filter((n) => n.roles.includes('sibling'));
      expect(sibs.length).toBeLessThanOrEqual(3);
      const ids = s.npcs.map((n) => n.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('the same seed gives the same life', () => {
    expect(newLife({}, 9)).toEqual(newLife({}, 9));
  });
});
