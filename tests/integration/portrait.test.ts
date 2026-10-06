import { describe, expect, it } from 'vitest';
import { DEFAULT_LOOK, LOOK_PARTS, SKIN_COLORS, TOP_COLORS } from '../../src/engine/look';
import type { Look } from '../../src/engine/types';
import { hairHex, portraitShapes, stageOf } from '../../src/renderer/portrait/parts';

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
