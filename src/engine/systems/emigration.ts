import { COUNTRY_BY_ID } from '../../content/countries';
import type { Ctx } from '../ctx';
import { countryOf, formatMoney, money } from '../economy';
import { EngineError } from '../errors';
import { remember } from '../npc';
import { addStat } from '../stats';
import type { GameState } from '../types';
import { endJob } from './careers';
import { leaveEnrollment } from './education';

export const MOVE_COST = 6000;

export function speaksLocal(s: GameState, countryId = s.player.country): boolean {
  const c = COUNTRY_BY_ID[countryId];
  return !!c && c.languages.some((l) => (s.player.languages[l] ?? 0) >= 50);
}

/** A serious recent conviction blocks visas. */
export function blockingRecord(s: GameState): boolean {
  return s.legal.record.some(
    (r) =>
      !r.juvenile &&
      (r.verdict === 'convicted' || r.verdict === 'plea') &&
      r.sentenceYears >= 2 &&
      s.year - r.year < 10,
  );
}

export function emigrateReason(s: GameState, countryId: string): string | null {
  if (!COUNTRY_BY_ID[countryId]) return 'unknown country';
  if (countryId === s.player.country) return 'you already live here';
  if (s.player.age < 18) return 'adults only';
  if (s.legal.prison) return 'not from prison';
  if (s.legal.fugitive && !s.player.flags.includes('false_papers'))
    return 'no passport you can show at a border';
  if (s.legal.case) return 'not with a case pending';
  if (s.legal.probation > 0) return 'not while on probation';
  if (blockingRecord(s)) return 'your criminal record blocks the visa';
  if (s.military?.active) return 'not while serving';
  if (s.money.cash < money(s, MOVE_COST))
    return `moving costs ${formatMoney(s, money(s, MOVE_COST))}`;
  return null;
}

/** Convert every amount of money in the state from one currency to another. */
function convertCurrency(s: GameState, ratio: number): void {
  const r = (v: number): number => Math.round(v * ratio);
  const m = s.money;
  m.cash = r(m.cash);
  m.savings = r(m.savings);
  for (const k of Object.keys(m.holdings) as (keyof typeof m.holdings)[])
    m.holdings[k] = r(m.holdings[k]);
  for (const l of m.loans) {
    l.balance = r(l.balance);
    l.principal = r(l.principal);
    l.payment = r(l.payment);
  }
  for (const a of m.alimony) a.amount = r(a.amount);
  m.history = m.history.map(([y, nw, ref]) => [y, r(nw), ref]);
  for (const h of s.assets.homes) {
    h.value = r(h.value);
    h.paid = r(h.paid);
  }
  for (const v of s.assets.vehicles) {
    v.value = r(v.value);
    v.paid = r(v.paid);
  }
  for (const p of s.assets.possessions) {
    p.value = r(p.value);
    p.paid = r(p.paid);
  }
  s.assets.rent = r(s.assets.rent);
  if (m.last) {
    const l = m.last;
    for (const k of [
      'salary',
      'otherIncome',
      'tax',
      'living',
      'housing',
      'loanPayments',
      'interest',
      'investReturn',
      'maintenance',
      'vices',
      'net',
    ] as const)
      l[k] = r(l[k]);
  }
  s.assets.listings = [];
  s.assets.listingsYear = -1;
  s.career.salary = r(s.career.salary);
  s.career.pension = r(s.career.pension);
  if (s.legal.case) s.legal.case.bail = r(s.legal.case.bail);
  for (const n of s.npcs) n.money = r(n.money);
}

/** Move to another country (SPEC §5.11). The cheat version skips the requirements and the cost. */
export function emigrate(
  ctx: Ctx,
  countryId: string,
  city: string | undefined,
  instant = false,
): void {
  const s = ctx.s;
  if (!instant) {
    const why = emigrateReason(s, countryId);
    if (why) throw new EngineError(why);
  }
  const from = countryOf(s);
  const to = COUNTRY_BY_ID[countryId];
  if (!to) throw new EngineError('unknown country');
  if (!instant) s.money.cash -= money(s, MOVE_COST);
  convertCurrency(s, to.currency.perUsd / from.currency.perUsd);
  if (!s.player.flags.includes(`lived:${from.id}`)) s.player.flags.push(`lived:${from.id}`);
  s.player.country = to.id;
  s.player.city = city && to.cities.includes(city) ? city : ctx.rng.pick(to.cities);
  if (!s.player.flags.includes('emigrated')) s.player.flags.push('emigrated');
  if (s.career.jobId) endJob(ctx, 'emigrated');
  s.career.partTimeId = null;
  if (s.education.enrollment) leaveEnrollment(s);
  for (const h of s.assets.homes) h.livingIn = false;
  if (s.assets.housing === 'owning' || s.assets.housing === 'parents') s.assets.housing = 'renting';
  // Your household comes with you; friendships strain across the distance.
  for (const n of s.npcs) {
    if (!n.alive) continue;
    const household =
      n.roles.includes('spouse') ||
      n.roles.includes('partner') ||
      (n.roles.includes('child') && n.age < 18);
    if (household) n.country = to.id;
    else if (n.roles.includes('friend')) remember(s, n, 'the move abroad', -12);
  }
  const local = speaksLocal(s);
  if (!local) addStat(s, 'happiness', -6);
  ctx.log(
    'travel',
    `You move to ${s.player.city}, ${to.name}.${local ? '' : ` You don't speak the language yet, which makes buying bread an adventure.`}`,
    true,
  );
}

/** Yearly: not speaking the local language wears on you (and on interviews). */
export function languageTick(ctx: Ctx): void {
  const s = ctx.s;
  if (s.player.age >= 18 && !speaksLocal(s)) {
    addStat(s, 'happiness', -2);
    // Living there teaches you something.
    const lang = countryOf(s).languages[0];
    if (lang)
      s.player.languages[lang] = Math.min(100, (s.player.languages[lang] ?? 0) + ctx.rng.int(2, 6));
  }
}
