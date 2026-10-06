import { describe, expect, it } from 'vitest';
import { act, ageUp, newLife, runCheat, type GameState } from '../../src/engine';
import { POSSESSION_BY_ID, VEHICLE_BY_ID, productName } from '../../src/content/assets';
import { vehicleName } from '../../src/engine/systems/assets';

const adult = (birthYear: number, seed = 1400): GameState => {
  let s = runCheat(newLife({ birthYear, country: 'us' }, seed), 'age.set', { age: 30 }).state;
  s = runCheat({ ...s, pending: [] }, 'money.set', { amount: 500000 }).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true } };
};

describe('real products, by era', () => {
  it('the model on sale is the one of its time', () => {
    const hatch = VEHICLE_BY_ID['pelican_runabout'];
    const console = POSSESSION_BY_ID['game_console'];
    if (!hatch || !console) throw new Error('missing');
    expect(productName(hatch, 1965)).toBe('Austin Mini');
    expect(productName(hatch, 1980)).toBe('Volkswagen Golf');
    expect(productName(console, 1986)).toBe('Nintendo Entertainment System');
    expect(productName(console, 2021)).toBe('PlayStation 5');
  });

  it('no electric car or games console before they existed', () => {
    const s = adult(1945);
    expect(s.year).toBeLessThan(1977);
    expect(() => act(s, { type: 'buy_vehicle', model: 'volta_e2', financed: false })).toThrow(
      /not on sale/,
    );
    expect(() => act(s, { type: 'buy_item', item: 'game_console' })).toThrow(/not on sale/);
  });

  it('a car you bought keeps its name as the years go by', () => {
    let s = act(adult(1950), {
      type: 'buy_vehicle',
      model: 'pelican_runabout',
      financed: false,
    }).state;
    expect(s.log.some((l) => /You buy a Volkswagen Golf\./.test(l.text))).toBe(true);
    for (let i = 0; i < 20; i++) s = ageUp({ ...s, pending: [] }).state;
    const car = s.assets.vehicles[0];
    if (car) expect(vehicleName(car)).toBe('Volkswagen Golf');
  });

  it('record deals are with real labels that existed at the time', async () => {
    const { Ctx } = await import('../../src/engine/ctx');
    const { applySystemEffect } = await import('../../src/engine/systems/system-effects');
    const s = structuredClone(adult(1940));
    applySystemEffect(new Ctx(s), 'sign_label', undefined, {});
    expect([
      'Columbia Records',
      'Decca Records',
      'Atlantic Records',
      'Motown',
      'Island Records',
    ]).toContain(s.music.label);
  });
});
