import { describe, expect, it } from 'vitest';
import { act, ageUp, newLife, runCheat, type GameState } from '../../src/engine';
import { VEHICLE_BY_ID } from '../../src/content/assets';
import { CATALOGUE_VEHICLES } from '../../src/content/vehicles';
import { serviceCost, vehicleOffer } from '../../src/engine/systems/assets';

const rich = (birthYear: number, age = 40): GameState => {
  const s0 = newLife({ birthYear, country: 'us' }, 4500);
  // Immortal, so a test's few years can't end in a heart attack.
  const s = runCheat({ ...s0, cheats: { ...s0.cheats, immortal: true } }, 'age.set', { age }).state;
  return {
    ...runCheat({ ...s, pending: [] }, 'money.add', { amount: 50_000_000 }).state,
    pending: [],
  };
};

describe('the car catalogue', () => {
  it('has categories, real models and plenty of Porsches', () => {
    expect(CATALOGUE_VEHICLES.length).toBeGreaterThanOrEqual(60);
    expect(
      CATALOGUE_VEHICLES.filter((v) => v.label.startsWith('Porsche')).length,
    ).toBeGreaterThanOrEqual(12);
    expect(CATALOGUE_VEHICLES.every((v) => v.category)).toBe(true);
  });

  it('models are new only in their years; collectors’ cars are found used, at rising prices', () => {
    const f40 = VEHICLE_BY_ID['ferrari_f40']!;
    expect(vehicleOffer(f40, 1980)).toEqual({ fresh: null, used: null });
    expect(vehicleOffer(f40, 1990).fresh).toBe(450000);
    const later = vehicleOffer(f40, 2024);
    expect(later.fresh).toBeNull();
    expect(later.used ?? 0).toBeGreaterThan(2_000_000);
    const golf = VEHICLE_BY_ID['vw_golf']!;
    expect(vehicleOffer(golf, 2020).used).toBe(Math.round(golf.price * 0.55));
  });

  it('a used car costs less; a collector’s car gains value while a new one loses it', () => {
    let s = rich(1960, 50);
    expect(s.year).toBe(2010);
    s = act(s, { type: 'buy_vehicle', model: 'porsche_911', financed: false, used: true }).state;
    s = act(s, { type: 'buy_vehicle', model: 'porsche_959', financed: false, used: true }).state;
    const [p911, p959] = s.assets.vehicles;
    expect(p911?.condition).toBeLessThan(100);
    const before = { a: p911!.value, b: p959!.value };
    for (let i = 0; i < 5; i++) s = ageUp({ ...s, pending: [] }).state;
    const after911 = s.assets.vehicles.find((v) => v.model === 'porsche_911')!.value;
    const after959 = s.assets.vehicles.find((v) => v.model === 'porsche_959')!.value;
    expect(after911).toBeLessThan(before.a);
    expect(after959).toBeGreaterThan(before.b);
  });

  it('a service puts a worn car back to perfect condition, and wear is gentle when it is kept up', () => {
    let s = rich(1960, 50);
    s = act(s, { type: 'buy_vehicle', model: 'porsche_911', financed: false, used: true }).state;
    const car = s.assets.vehicles[0]!;
    expect(car.condition).toBeLessThan(100);
    const cost = serviceCost(s, car.id);
    expect(cost).toBeGreaterThan(0);
    const cash = s.money.cash;
    s = act(s, { type: 'service_vehicle', id: car.id }).state;
    expect(s.assets.vehicles[0]!.condition).toBe(100);
    expect(cash - s.money.cash).toBe(cost);
    expect(() => act(s, { type: 'service_vehicle', id: car.id })).toThrow(/perfect/);
    s = ageUp({ ...s, pending: [] }).state;
    const crashed = s.log.some((l) => /You crash|You scrape/.test(l.text));
    if (!crashed) expect(s.assets.vehicles[0]!.condition).toBeGreaterThanOrEqual(96);
  });
});
