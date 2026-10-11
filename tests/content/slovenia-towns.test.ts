import { describe, expect, it } from 'vitest';
import { slovenia } from '../../src/content/countries/slovenia';
import { SLOVENIA_TOWNS } from '../../src/content/countries/slovenia-towns';

const REGIONS = [
  'Osrednjeslovenska',
  'Gorenjska',
  'Štajerska',
  'Koroška',
  'Savinjska',
  'Zasavje',
  'Posavje',
  'Dolenjska',
  'Bela krajina',
  'Notranjska',
  'Goriška',
  'Primorska',
  'Obala',
  'Prekmurje',
];

describe('Slovenian towns in depth', () => {
  it('has a town entry for every city, and no entry that is not a city', () => {
    expect(slovenia.towns).toBe(SLOVENIA_TOWNS);
    for (const city of slovenia.cities) expect(SLOVENIA_TOWNS[city], city).toBeDefined();
    for (const name of Object.keys(SLOVENIA_TOWNS)) expect(slovenia.cities, name).toContain(name);
  });

  it('gives every river town its river', () => {
    for (const [name, t] of Object.entries(SLOVENIA_TOWNS))
      if (t.tags.includes('river')) expect(t.river, name).toBeTruthy();
  });

  it('describes every town fully', () => {
    for (const [name, t] of Object.entries(SLOVENIA_TOWNS)) {
      expect(t.landmarks.length, name).toBeGreaterThanOrEqual(2);
      expect(t.landmarks.length, name).toBeLessThanOrEqual(4);
      expect(REGIONS, name).toContain(t.region);
      expect(t.housing, name).toBeGreaterThanOrEqual(0.5);
      expect(t.housing, name).toBeLessThanOrEqual(2);
      expect(t.blurb.trim(), name).not.toBe('');
      expect(t.quirk.trim(), name).not.toBe('');
      expect(t.food.trim(), name).not.toBe('');
      expect(t.population, name).toBeGreaterThan(0);
    }
  });

  it('puts Slovenj Gradec in Koroška, on the Mislinja', () => {
    const sg = SLOVENIA_TOWNS['Slovenj Gradec'];
    expect(sg?.region).toBe('Koroška');
    expect(sg?.river).toBe('Mislinja');
    expect(sg?.famous).toContain('Hugo Wolf');
  });
});
