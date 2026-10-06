import { describe, expect, it } from 'vitest';
import { DEFAULT_LOOK, LOOK_PARTS, SKIN_COLORS, TOP_COLORS } from '../../src/engine/look';
import type { Look } from '../../src/engine/types';
import { hairHex, moodOf, portraitShapes, stageOf } from '../../src/renderer/portrait/parts';

const draw = (l: Partial<Look>, age = 30): string =>
  portraitShapes({ ...DEFAULT_LOOK, ...l }, age, 'male')
    .map((s) => `${s.layer}|${s.d}|${s.fill ?? ''}|${s.stroke ?? ''}|${s.sw ?? ''}`)
    .join('\n');

describe('portraits', () => {
  it('every option of every part draws something different, with clean paths', () => {
    for (const [part, opts] of Object.entries(LOOK_PARTS)) {
      const seen = new Set<string>();
      for (const o of opts) {
        const pic = draw({ facialHair: 'none', [part]: o.id } as Partial<Look>);
        expect(pic).not.toMatch(/NaN|undefined|Infinity/);
        seen.add(pic);
      }
      expect(seen.size, part).toBe(opts.length);
    }
    for (let i = 0; i < SKIN_COLORS.length; i++)
      expect(draw({ skin: i })).toContain(SKIN_COLORS[i]?.hex);
    for (let i = 0; i < TOP_COLORS.length; i++)
      expect(draw({ topColor: i })).toContain(TOP_COLORS[i]);
  });

  it('ages: babies and children get no beard or glasses; hair greys; lines come late', () => {
    const l = { facialHair: 'beard', glasses: 'round', hairColor: 'black' } as const;
    const layers = (age: number): string[] =>
      portraitShapes({ ...DEFAULT_LOOK, ...l }, age, 'male').map((s) => s.layer);
    expect(layers(1)).not.toContain('glasses');
    expect(layers(1)).not.toContain('facialHair');
    expect(layers(8)).not.toContain('facialHair');
    expect(layers(30)).toContain('facialHair');
    expect(layers(30)).toContain('glasses');
    expect(layers(30)).not.toContain('lines');
    expect(layers(70)).toContain('lines');
    expect(hairHex({ ...DEFAULT_LOOK, hairColor: 'black' }, 30)).toBe('#1f1a17');
    expect(hairHex({ ...DEFAULT_LOOK, hairColor: 'black' }, 75)).not.toBe('#1f1a17');
    expect(hairHex({ ...DEFAULT_LOOK, hairColor: 'blue' }, 75)).toBe('#3d6fd8');
    expect([0, 5, 15, 40, 80].map(stageOf)).toEqual(['baby', 'child', 'teen', 'adult', 'senior']);
  });
});

describe('expressions', () => {
  it('the face follows happiness and health', () => {
    const at = (mood: 'glad' | 'fine' | 'low' | 'sad', ill = false): string =>
      portraitShapes({ ...DEFAULT_LOOK, mouth: 'grin' }, 30, 'female', { mood, ill })
        .map((s) => `${s.layer}|${s.d}|${s.fill ?? ''}`)
        .join('\n');
    expect(at('fine')).toBe(at('glad'));
    expect(at('low')).not.toBe(at('fine'));
    expect(at('sad')).not.toBe(at('low'));
    expect(at('sad')).toContain('tired');
    expect(at('fine', true)).toContain('tired');
    expect(at('fine', true)).not.toContain(SKIN_COLORS[DEFAULT_LOOK.skin]?.hex);
    expect([5, 30, 60, 90].map(moodOf)).toEqual(['sad', 'low', 'fine', 'glad']);
  });
});

describe('accessories', () => {
  it('hats tuck tall hair away, a headscarf hides it and the earrings, babies wear neither', () => {
    const layers = (l: Partial<Look>, age = 30): string[] =>
      portraitShapes({ ...DEFAULT_LOOK, ...l }, age, 'female').map((s) => s.layer);
    expect(layers({ hat: 'beanie' })).toContain('hat');
    expect(layers({ hat: 'beanie' }, 1)).not.toContain('hat');
    expect(layers({ earrings: 'hoops' })).toContain('earrings');
    expect(layers({ earrings: 'hoops' }, 3)).not.toContain('earrings');
    expect(layers({ earrings: 'hoops', hat: 'headscarf' })).not.toContain('earrings');
    expect(draw({ hat: 'cap', hair: 'mohawk' })).toBe(draw({ hat: 'cap', hair: 'short' }));
    expect(draw({ hat: 'headscarf', hair: 'long' })).toBe(draw({ hat: 'headscarf', hair: 'afro' }));
  });
});

describe('pets, drawn', () => {
  it('every animal draws cleanly in more than one coat', async () => {
    const { coatOf, petShapes } = await import('../../src/renderer/portrait/PetPortrait');
    const { PET_KINDS } = await import('../../src/content/pets');
    for (const k of PET_KINDS) {
      const coats = new Set([1, 2, 3, 4, 5, 6, 7, 8].map((id) => coatOf(k.id, id)));
      expect(coats.size, k.id).toBeGreaterThan(1);
      for (const c of coats) expect(c).toMatch(/^#[0-9a-f]{6}$/);
      const pic = petShapes(k.id, coatOf(k.id, 1))
        .map((s) => s.d)
        .join(' ');
      expect(pic).not.toMatch(/NaN|undefined/);
      expect(petShapes(k.id, '#808080').length).toBeGreaterThan(4);
    }
  });
});
