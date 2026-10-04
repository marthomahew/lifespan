import { describe, expect, it } from 'vitest';
import { newLife, runCheat, type GameState } from '../../../src/engine';

const adult = (): GameState =>
  runCheat(newLife({ country: 'us', birthYear: 1990 }, 50), 'age.set', { age: 30 }).state;

describe('money and asset cheats (M7.7)', () => {
  it("'asset.spawn' adds any home, vehicle, or item", () => {
    let s = runCheat(adult(), 'asset.spawn', { asset: 'home:villa' }).state;
    s = runCheat(s, 'asset.spawn', { asset: 'vehicle:meridian_gt' }).state;
    s = runCheat(s, 'asset.spawn', { asset: 'item:oil_painting' }).state;
    expect(s.assets.homes).toHaveLength(1);
    expect(s.assets.vehicles[0]?.model).toBe('meridian_gt');
    expect(s.assets.possessions[0]?.item).toBe('oil_painting');
  });

  it("'asset.value' and 'asset.condition' edit an asset", () => {
    let s = runCheat(adult(), 'asset.spawn', { asset: 'vehicle:brisk_sedan' }).state;
    const id = String(s.assets.vehicles[0]?.id);
    s = runCheat(s, 'asset.value', { id, amount: 123 }).state;
    s = runCheat(s, 'asset.condition', { id, value: 7 }).state;
    expect(s.assets.vehicles[0]).toMatchObject({ value: 123, condition: 7 });
  });

  it("'invest.set' sets a holding", () => {
    expect(
      runCheat(adult(), 'invest.set', { fund: 'growth', amount: 5000 }).state.money.holdings.growth,
    ).toBe(5000);
  });

  it("'salary.set' sets the salary of the current job", () => {
    const s = runCheat(runCheat(adult(), 'job.set', { job: 'nurse' }).state, 'salary.set', {
      amount: 999999,
    }).state;
    expect(s.career.salary).toBe(999999);
    expect(runCheat(adult(), 'salary.set', { amount: 1 }).message).toBe('You have no job');
  });
});
