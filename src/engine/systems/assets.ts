import {
  HOME_TYPE_BY_ID,
  HOME_TYPES,
  POSSESSION_BY_ID,
  VEHICLE_BY_ID,
  productName,
  onSale,
} from '../../content/assets';
import type { Ctx } from '../ctx';
import { countryOf, formatMoney, money } from '../economy';
import { EngineError } from '../errors';
import { addStat } from '../stats';
import type { GameState, Home } from '../types';
import { clampStat } from '../util';
import { hasAdultRecord } from './careers';
import { addLoan, annuityPayment } from './loans';
import { addSkill } from './skills';
import { article, lowerLabel, withArticle } from '../text';
import { addInjury } from './injuries';

const conditionMult = (c: number): number => 0.6 + c / 250;

/** Fresh listings each year: type × condition × the country's price level (SPEC §5.7). */
export function refreshListings(ctx: Ctx): void {
  const s = ctx.s;
  if (s.player.age < 18 || s.assets.listingsYear === s.year) return;
  const r = ctx.rng;
  s.assets.listings = r
    .shuffle(HOME_TYPES)
    .slice(0, 5)
    .map((t) => {
      const condition = r.int(25, 100);
      return {
        type: t.id,
        name: r.pick(t.names),
        condition,
        price: Math.round(money(s, (t.price * conditionMult(condition) * r.int(85, 115)) / 100)),
      };
    });
  s.assets.listingsYear = s.year;
}

/** Mortgage rates sit between 3% and 8% and move with the economy (the drifting savings rate). */
export function mortgageRate(s: GameState): number {
  return Math.min(
    0.08,
    Math.max(0.03, countryOf(s).mortgageRate + (s.money.savingsRate - 0.025) * 1.5),
  );
}

export type Financing = { kind: 'cash' } | { kind: 'mortgage'; years: 15 | 30; down: number };

export type MortgageQuote = {
  /** Cash paid now: the deposit, or the full price. */
  down: number;
  principal: number;
  rate: number;
  yearly: number;
  /** Why the purchase would be refused, or null. */
  problem: string | null;
};

/** What buying a home at this price would cost now and each year (the buy dialog's preview). */
export function mortgageQuote(s: GameState, price: number, financing: Financing): MortgageQuote {
  if (financing.kind === 'cash')
    return {
      down: price,
      principal: 0,
      rate: 0,
      yearly: 0,
      problem: s.money.cash < price ? `you need ${formatMoney(s, price)} in cash` : null,
    };
  const down = Math.round(price * Math.min(0.9, Math.max(0.05, financing.down)));
  const principal = price - down;
  const rate = mortgageRate(s);
  const yearly = Math.round(annuityPayment(principal, rate, financing.years));
  const income = s.career.salary + (s.military?.active ? 1 : 0) + s.career.pension;
  let problem: string | null = null;
  if (s.money.cash < down) problem = `the deposit is ${formatMoney(s, down)}`;
  else if (hasAdultRecord(s) && s.legal.record.some((r) => s.year - r.year < 7))
    problem = 'the bank declines: recent criminal record';
  else if (income * 0.5 < yearly && s.money.cash < price)
    problem = 'the bank says your income is too low for that mortgage';
  return { down, principal, rate, yearly, problem };
}

export function buyHome(ctx: Ctx, index: number, financing: Financing): Home {
  const s = ctx.s;
  if (s.player.age < 18) throw new EngineError('adults only');
  refreshListings(ctx);
  const l = s.assets.listings[index];
  if (!l) throw new EngineError('that listing is gone');
  let loanId: number | undefined;
  const id = s.assets.nextAssetId++;
  const q = mortgageQuote(s, l.price, financing);
  if (q.problem && !(s.cheats.forceSuccess && q.problem.includes('income')))
    throw new EngineError(q.problem);
  s.money.cash -= q.down;
  if (financing.kind === 'mortgage')
    loanId = addLoan(s, 'mortgage', q.principal, q.rate, financing.years, id).id;
  const home: Home = {
    id,
    type: l.type,
    name: l.name,
    value: l.price,
    paid: l.price,
    condition: l.condition,
    bought: s.year,
    city: s.player.city,
    country: s.player.country,
    livingIn: false,
  };
  s.assets.homes.push(home);
  s.assets.listings.splice(index, 1);
  ctx.log(
    'money',
    `You buy ${l.name} for ${formatMoney(s, l.price)}${loanId ? ' with a mortgage' : ' outright'}. The keys are on a novelty keyring.`,
    true,
  );
  if (!s.assets.homes.some((h) => h.livingIn)) moveInto(ctx, home.id);
  addStat(s, 'happiness', 8);
  return home;
}

export function moveInto(ctx: Ctx, homeId: number): void {
  const s = ctx.s;
  const h = s.assets.homes.find((x) => x.id === homeId);
  if (!h) throw new EngineError('no such home');
  // Moving into a let home ends the tenancy.
  if (h.let) h.let = null;
  for (const x of s.assets.homes) x.livingIn = x.id === homeId;
  if (!s.legal.prison && !s.military?.active) s.assets.housing = 'owning';
}

export function sellHome(ctx: Ctx, homeId: number): number {
  const s = ctx.s;
  const h = s.assets.homes.find((x) => x.id === homeId);
  if (!h) throw new EngineError('no such home');
  const proceeds = Math.round(h.value * 0.95);
  s.money.cash += proceeds;
  for (const l of s.money.loans) {
    if (l.collateral === h.id) {
      s.money.cash -= l.balance;
      l.balance = 0;
    }
  }
  s.money.loans = s.money.loans.filter((l) => l.balance > 0);
  s.assets.homes = s.assets.homes.filter((x) => x.id !== homeId);
  if (h.livingIn) s.assets.housing = s.assets.homes.length ? 'owning' : 'renting';
  if (s.assets.homes.length && !s.assets.homes.some((x) => x.livingIn)) {
    const first = s.assets.homes[0];
    if (first) first.livingIn = true;
  }
  ctx.log('money', `You sell ${h.name} for ${formatMoney(s, proceeds)} after fees.`, true);
  return proceeds;
}

export function renovate(ctx: Ctx, homeId: number): void {
  const s = ctx.s;
  const h = s.assets.homes.find((x) => x.id === homeId);
  if (!h) throw new EngineError('no such home');
  const cost = Math.round(h.value * 0.05);
  if (s.money.cash < cost) throw new EngineError(`renovating costs ${formatMoney(s, cost)}`);
  s.money.cash -= cost;
  // Value follows repair: a tired place done up gains more than a tidy one touched up.
  const before = h.condition;
  h.condition = clampStat(h.condition + 35);
  h.value = Math.round(h.value * (1 + ((h.condition - before) / 100) * 0.3));
  ctx.log(
    'money',
    `You renovate ${h.name}. Builders find something alarming behind a wall, then fix it.`,
  );
}

export function buyVehicle(ctx: Ctx, modelId: string, financed: boolean): void {
  const s = ctx.s;
  const v = VEHICLE_BY_ID[modelId];
  if (!v) throw new EngineError('unknown vehicle');
  if (!onSale(v, s.year)) throw new EngineError(`not on sale until ${v.from}`);
  if (s.legal.prison) throw new EngineError('not from prison');
  if (s.player.age < 16) throw new EngineError('from age 16');
  const price = money(s, v.price);
  const id = s.assets.nextAssetId++;
  if (financed) {
    const down = Math.round(price * 0.1);
    if (s.money.cash < down) throw new EngineError(`the deposit is ${formatMoney(s, down)}`);
    if (s.player.age < 18) throw new EngineError('car loans are for adults');
    s.money.cash -= down;
    addLoan(s, 'personal', price - down, 0.08, 5, id);
  } else {
    if (s.money.cash < price) throw new EngineError(`you need ${formatMoney(s, price)}`);
    s.money.cash -= price;
  }
  s.assets.vehicles.push({
    id,
    model: v.id,
    value: price,
    paid: price,
    condition: 100,
    bought: s.year,
  });
  ctx.log('money', `You buy ${productPhrase(v, s.year)}. ${v.description}`, true);
  addStat(s, 'happiness', 5);
}

export function buyPossession(ctx: Ctx, itemId: string): void {
  const s = ctx.s;
  const p = POSSESSION_BY_ID[itemId];
  if (!p) throw new EngineError('unknown item');
  if (!onSale(p, s.year)) throw new EngineError(`not on sale until ${p.from}`);
  if (s.legal.prison) throw new EngineError('not from prison');
  const price = money(s, p.price);
  if (s.money.cash < price) throw new EngineError(`you need ${formatMoney(s, price)}`);
  s.money.cash -= price;
  s.assets.possessions.push({
    id: s.assets.nextAssetId++,
    item: p.id,
    value: price,
    paid: price,
    condition: 100,
    bought: s.year,
  });
  ctx.log('money', `You buy ${productPhrase(p, s.year)}. ${p.description}`);
  addStat(s, 'happiness', 3);
}

export function sellAsset(ctx: Ctx, id: number): number {
  const s = ctx.s;
  if (s.assets.homes.some((h) => h.id === id)) return sellHome(ctx, id);
  const v = s.assets.vehicles.find((x) => x.id === id);
  const p = s.assets.possessions.find((x) => x.id === id);
  const it = v ?? p;
  if (!it) throw new EngineError('no such asset');
  const proceeds = Math.round(it.value * 0.9);
  s.money.cash += proceeds;
  for (const l of s.money.loans) {
    if (l.collateral === id) {
      s.money.cash -= l.balance;
      l.balance = 0;
    }
  }
  s.money.loans = s.money.loans.filter((l) => l.balance > 0);
  s.assets.vehicles = s.assets.vehicles.filter((x) => x.id !== id);
  s.assets.possessions = s.assets.possessions.filter((x) => x.id !== id);
  const label = v ? vehicleName(v) : p ? itemName(p) : 'item';
  ctx.log('money', `You sell the ${label} for ${formatMoney(s, proceeds)}.`);
  return proceeds;
}

/** Yearly: appreciation, maintenance, decay, depreciation, practice from instruments, accidents. */
export function assetsTick(ctx: Ctx): void {
  const s = ctx.s;
  const r = ctx.rng;
  refreshListings(ctx);
  let maintenance = 0;
  for (const h of s.assets.homes) {
    h.value = Math.max(0, Math.round(h.value * (1 + r.normal(0.03, 0.06))));
    // Maintenance (paid below) keeps wear slow; a renovation is for the big jobs.
    h.condition = clampStat(h.condition - r.int(0, 2));
    const m = Math.round(h.value * 0.01);
    maintenance += m;
    if (h.condition < 25) h.value = Math.round(h.value * 0.97);
  }
  for (const v of s.assets.vehicles) {
    v.value = Math.max(0, Math.round(v.value * (1 - r.normal(0.15, 0.03))));
    v.condition = clampStat(v.condition - r.int(4, 10));
    maintenance += money(s, 400 + (100 - v.condition) * 15);
  }
  for (const p of s.assets.possessions) {
    const def = POSSESSION_BY_ID[p.item];
    p.value = Math.max(
      0,
      Math.round(p.value * (1 + (def?.depreciation ?? -0.1) + r.normal(0, 0.03))),
    );
    p.condition = clampStat(p.condition - r.int(0, 4));
    if (def?.skill) addSkill(s, def.skill, 1);
  }
  if (maintenance) {
    s.money.cash -= maintenance;
    if (s.money.last) s.money.last.maintenance += maintenance;
  }
  vehicleAccidents(ctx);
}

/** Accidents tied to driving and condition (SPEC §5.7). */
function vehicleAccidents(ctx: Ctx): void {
  const s = ctx.s;
  const car = s.assets.vehicles[0];
  if (!car || s.legal.prison) return;
  const def = VEHICLE_BY_ID[car.model];
  let p = 0.03 + (100 - car.condition) / 1000;
  if (s.player.traits.includes('reckless')) p *= 2;
  if (s.player.traits.includes('cautious')) p *= 0.5;
  if (!s.assets.licence) p *= 1.5;
  if (s.vices.levels.alcohol > 50) p *= 1.8;
  if (!ctx.rng.chance(p)) return;
  const severe = ctx.rng.chance(0.3 * (1 - (def?.safety ?? 50) / 120));
  car.condition = clampStat(car.condition - (severe ? 60 : 25));
  car.value = Math.round(car.value * (severe ? 0.4 : 0.8));
  if (severe) {
    addInjury(ctx, ctx.rng.int(15, 35));
    ctx.log(
      'health',
      `You crash the ${vehicleName(car)} on a wet road. You wake up in hospital with a cast and a lot of paperwork.`,
      true,
    );
  } else
    ctx.log('random', `You scrape the ${vehicleName(car)} along a bollard. The bollard is fine.`);
  if (!s.assets.licence && ctx.rng.chance(0.5)) {
    s.money.cash -= money(s, 800);
    ctx.log('crime', 'The police note you have no licence. The fine is not small.');
  }
}

export const homeLabel = (h: Home): string => `${HOME_TYPE_BY_ID[h.type]?.emoji ?? '🏠'} ${h.name}`;

/** A second home bought outright from an event: it shows up in Assets and keeps its value. */
export function addHolidayHome(ctx: Ctx, price: number): void {
  const s = ctx.s;
  s.assets.homes.push({
    id: s.assets.nextAssetId++,
    type: 'cottage',
    name: 'the cottage by the sea',
    value: price,
    paid: price,
    condition: 80,
    bought: s.year,
    city: s.player.city,
    country: s.player.country,
    livingIn: false,
  });
}

/** Later life: sell the home you live in and buy a small flat outright; the difference is yours. */
export function downsizeHome(ctx: Ctx): void {
  const s = ctx.s;
  const h = s.assets.homes.find((x) => x.livingIn);
  if (!h || h.type === 'studio' || h.type === 'apartment') return;
  const before = s.money.cash;
  sellHome(ctx, h.id);
  // What the sale cleared after the mortgage; a flat costs at most two-fifths of it.
  const price = Math.round(Math.max(0, s.money.cash - before) * 0.4);
  if (price <= 0) return;
  s.money.cash -= price;
  for (const x of s.assets.homes) x.livingIn = false;
  s.assets.homes.push({
    id: s.assets.nextAssetId++,
    type: 'apartment',
    name: 'the flat with the balcony',
    value: price,
    paid: price,
    condition: 85,
    bought: s.year,
    city: s.player.city,
    country: s.player.country,
    livingIn: true,
  });
  s.assets.housing = 'owning';
}

/** An owned vehicle's model: the one on sale the year you bought it. */
export function vehicleName(v: { model: string; bought: number }): string {
  const def = VEHICLE_BY_ID[v.model];
  if (!def) return 'vehicle';
  const name = productName(def, v.bought);
  return name === def.label ? lowerLabel(name) : name;
}
/** An owned possession's make: the one on sale the year you got it. */
export function itemName(p: { item: string; bought: number }): string {
  const def = POSSESSION_BY_ID[p.item];
  if (!def) return 'item';
  const name = productName(def, p.bought);
  // A brand keeps its capitals; a plain thing ("oil painting") reads lower-case mid-sentence.
  return name === def.label ? lowerLabel(name) : name;
}

/** "a Volkswagen Golf" (a brand keeps its capitals), or "an oil painting" (a plain thing doesn't). */
export function productPhrase(
  def: { label: string; eras?: { from: number; name: string }[] },
  year: number,
): string {
  const name = productName(def, year);
  return name !== def.label ? `${article(name)} ${name}` : withArticle(name);
}
