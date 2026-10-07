import type { Ctx } from '../ctx';
import { formatMoney } from '../economy';
import { EngineError } from '../errors';
import { pickFresh } from '../fresh';
import { randomName } from '../npc';
import type { GameState, Home } from '../types';
import { clampStat } from '../util';

/** A tenancy on a home you own but don't live in. */
export type Tenancy = { tenant: string; since: number; rent: number };

/** What a home lets for in a year: a share of its value, more for a home in good repair. */
export function rentFor(h: { value: number; condition: number }): number {
  return Math.round(h.value * 0.045 * (0.6 + h.condition / 250));
}

export function letReason(s: GameState, h: Home | undefined): string | null {
  if (!h) return 'no such home';
  if (h.livingIn) return 'you live there';
  if (h.let) return 'already let';
  if (h.country !== s.player.country) return 'it is in another country';
  return null;
}

/** Let a home out (or end the tenancy). */
export function letHome(ctx: Ctx, homeId: number, on: boolean): void {
  const s = ctx.s;
  const h = s.assets.homes.find((x) => x.id === homeId);
  if (!on) {
    if (!h?.let) throw new EngineError('it is not let');
    ctx.log('money', `${h.let.tenant} moves out of ${h.name}. It is yours to use again.`);
    h.let = null;
    return;
  }
  const why = letReason(s, h);
  if (why || !h) throw new EngineError(why ?? 'no such home');
  const tenant = randomName(ctx, s.player.country, ctx.rng.chance(0.5) ? 'male' : 'female');
  h.let = { tenant, since: s.year, rent: rentFor(h) };
  ctx.log(
    'money',
    `You let ${h.name} to ${tenant} for ${formatMoney(s, h.let.rent)} a year (an agent takes a tenth).`,
  );
}

/**
 * The year's rent from every let home, before finances (it is taxed as income). Tenants are
 * people: most pay, some pay late, a few leave the place worse than they found it.
 */
export function rentYear(ctx: Ctx): number {
  const s = ctx.s;
  if (s.death) return 0;
  let total = 0;
  for (const h of s.assets.homes) {
    const t = h.let;
    if (!t) continue;
    // Rents follow the home's value, at each renewal.
    t.rent = rentFor(h);
    let got = Math.round(t.rent * 0.9);
    const r = ctx.rng.next();
    if (r < 0.1) {
      got = Math.round(got * 0.5);
      ctx.log(
        'money',
        `${t.tenant} pays the rent on ${h.name} late, and only half of it. The agent sends letters.`,
      );
    } else if (r < 0.16) {
      h.condition = clampStat(h.condition - 15);
      ctx.log(
        'money',
        pickFresh(ctx, [
          `${t.tenant} leaves ${h.name} with a broken boiler and a carpet that has seen things.`,
          `A leak at ${h.name} that ${t.tenant} didn't mention for a month. The ceiling comes down.`,
        ]),
      );
    } else if (r < 0.2) {
      ctx.log('money', `${h.name} sits empty for three months between tenants.`);
      got = Math.round(got * 0.75);
      h.let = {
        ...t,
        tenant: randomName(ctx, s.player.country, ctx.rng.chance(0.5) ? 'male' : 'female'),
        since: s.year,
      };
    }
    total += got;
  }
  if (total > 0)
    ctx.log('money', `🏘️ Rent this year: ${formatMoney(s, total)} after the agent's cut.`);
  return total;
}
