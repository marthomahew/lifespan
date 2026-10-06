import { TRAITS } from '../../content/traits';
import type { Ctx } from '../ctx';
import { formatMoney, money } from '../economy';
import { addLoan } from './loans';
import { addNpc, remember } from '../npc';
import { addStat } from '../stats';
import type { Npc } from '../types';
import { clampStat } from '../util';
import { currentPartner } from './partners';

export const WEDDING_COST: Record<'small' | 'medium' | 'large', number> = {
  small: 3000,
  medium: 15000,
  large: 45000,
};

function setRoles(n: Npc, drop: string[], add: Npc['roles'][number]): void {
  n.roles = n.roles.filter((r) => !drop.includes(r));
  if (!n.roles.includes(add)) n.roles.unshift(add);
}

export function marry(ctx: Ctx, n: Npc, prenup: boolean): void {
  const s = ctx.s;
  setRoles(n, ['partner'], 'spouse');
  n.romance = { stage: 'married', since: s.year, prenup };
  if (!s.player.flags.includes('ever_married')) s.player.flags.push('ever_married');
  // Married people set up home together, not in their old bedroom.
  if (s.assets.housing === 'parents' && s.player.age >= 18) s.assets.housing = 'renting';
}

/** Divorce: split assets (prenup-aware), set alimony, decide custody (SPEC §5.1). */
export function divorce(ctx: Ctx, n: Npc): void {
  const s = ctx.s;
  const prenup = n.romance?.prenup ?? false;
  const years = Math.max(0, s.year - (n.romance?.since ?? s.year));
  const share = prenup ? 0.1 : 0.5;
  const liquid =
    Math.max(0, s.money.cash) +
    s.money.savings +
    Object.values(s.money.holdings).reduce((a, b) => a + b, 0);
  const equity =
    s.assets.homes.reduce((t, h) => t + h.value, 0) -
    s.money.loans.filter((l) => l.kind === 'mortgage').reduce((t, l) => t + l.balance, 0);
  const owed = Math.round(share * (liquid + Math.max(0, equity)));
  // Pay from savings and investments first, then cash (which may go negative and become debt).
  let left = owed;
  const take = (have: number): number => {
    const t = Math.min(have, left);
    left -= t;
    return have - t;
  };
  s.money.savings = take(s.money.savings);
  for (const k of ['bonds', 'index', 'growth', 'coin'] as const)
    s.money.holdings[k] = take(s.money.holdings[k]);
  const fromCash = Math.min(left, Math.max(0, s.money.cash));
  s.money.cash -= fromCash;
  left -= fromCash;
  if (left > 0) {
    addLoan(s, 'personal', left, 0.03, 10);
    ctx.log(
      'money',
      `The court orders a property settlement of ${formatMoney(s, left)}, payable over ten years.`,
    );
  }
  n.money += owed;
  // Alimony flows from the higher earner (a negative amount is paid to the player).
  const exIncome = n.job && n.job !== 'Unemployed' ? money(s, 45000, 'wage') : 0;
  const gap = s.career.salary - exIncome;
  if (!prenup && years >= 3 && Math.abs(gap) > money(s, 10000, 'wage')) {
    s.money.alimony.push({
      npcId: n.id,
      amount: Math.round(gap * 0.2),
      years: Math.min(10, Math.ceil(years / 2)),
    });
  }
  for (const kid of s.npcs.filter(
    (k) => k.alive && k.roles.includes('child') && k.age < 18 && k.parentIds.includes(n.id),
  )) {
    if (ctx.rng.chance(s.legal.prison ? 1 : 0.5)) {
      s.family.custodyLost.push(kid.id);
      remember(s, kid, 'moving out with your ex', -8);
    }
  }
  n.flags.push('was_spouse');
  setRoles(n, ['spouse', 'partner'], 'ex');
  delete n.romance;
  // A baby the player is carrying still arrives; one the ex is carrying leaves with them.
  if (s.family.pregnancy?.partnerId === n.id && s.family.pregnancy.carrier === 'partner')
    s.family.pregnancy = null;
  ctx.log(
    'romance',
    `The divorce is final. ${n.first} walks away with ${prenup ? 'what the prenup allows' : 'half of what you built'}.`,
    true,
  );
}

/** A breakup. A pregnancy already under way still ends in a birth. */
export function breakUp(_ctx: Ctx, n: Npc): void {
  setRoles(n, ['partner'], 'ex');
  delete n.romance;
}

/** A child is born or adopted: inherits some traits and stats (SPEC §5.1). */
export function addChild(ctx: Ctx, otherParent: Npc | undefined, adopted: boolean, age = 0): Npc {
  const s = ctx.s;
  const r = ctx.rng;
  const traits: string[] = [];
  const pool = [...s.player.traits, ...(otherParent?.traits ?? [])];
  if (!adopted && pool.length && r.chance(0.7)) traits.push(r.pick(pool));
  for (const t of r.shuffle(TRAITS)) {
    if (traits.length >= 2) break;
    if (traits.includes(t.id) || traits.some((x) => t.excludes.includes(x))) continue;
    traits.push(t.id);
  }
  const child = addNpc(ctx, {
    role: 'child',
    age,
    last: s.player.last,
    rel: r.int(80, 95),
    parentIds: otherParent ? [0, otherParent.id] : [0],
    traits,
  });
  if (!adopted) {
    const avg = (a: number, b: number): number => clampStat((a + b) / 2 + r.int(-12, 12));
    child.stats.smarts = avg(s.player.genes.smarts, otherParent?.stats.smarts ?? 50);
    child.stats.looks = avg(s.player.genes.looks, otherParent?.stats.looks ?? 50);
    child.stats.health = avg(s.player.genes.health, otherParent?.stats.health ?? 70);
  } else child.flags.push('adopted');
  child.job = age >= 5 ? 'At school' : null;
  return child;
}

/** Yearly romance and family upkeep: stages, pregnancies, alimony, partners giving up. */
export function romanceTick(ctx: Ctx): void {
  const s = ctx.s;
  const r = ctx.rng;
  const p = currentPartner(ctx);
  if (p && p.romance) {
    const together = s.year - p.romance.since;
    // The longer and warmer it goes, the likelier it gets serious; years at "dating" are rare.
    const serious = Math.min(0.95, 0.35 + together * 0.15 + (p.rel - 55) * 0.005);
    if (p.romance.stage === 'dating' && together >= 1 && p.rel >= 55 && r.chance(serious)) {
      p.romance.stage = 'serious';
      ctx.log(
        'romance',
        `Things with ${p.first} are getting serious. ${p.first} leaves a toothbrush at yours.`,
      );
    }
    if (p.romance.stage === 'engaged' && together >= 4 && r.chance(0.3))
      remember(s, p, 'the endless engagement', -6);
    if (p.rel < 15 && r.chance(p.romance.stage === 'married' ? 0.25 : 0.4)) {
      if (p.romance.stage === 'married') {
        ctx.log('romance', `${p.first} files for divorce.`, true);
        divorce(ctx, p);
      } else {
        ctx.log(
          'romance',
          `${p.first} ends things. ${p.first} says it has been over for a while.`,
          true,
        );
        breakUp(ctx, p);
        remember(s, p, 'the breakup', -15);
      }
      addStat(s, 'happiness', -8);
    }
  }
  // Births arrive the year after a pregnancy begins.
  const preg = s.family.pregnancy;
  if (preg && preg.due <= s.year) {
    s.family.pregnancy = null;
    const other = s.npcs.find((n) => n.id === preg.partnerId);
    const kid = addChild(ctx, other, false);
    ctx.log(
      'family',
      `${kid.first} is born. Everyone agrees ${kid.gender === 'male' ? 'he' : kid.gender === 'female' ? 'she' : 'the baby'} has your ${r.pick(['nose', 'frown', 'ears', 'timing'])}.`,
      true,
    );
    addStat(s, 'happiness', 10);
    if (other?.alive) remember(s, other, `the day ${kid.first} was born`, 8);
  }
  // Alimony.
  for (const a of s.money.alimony) {
    if (a.years <= 0) continue;
    s.money.cash -= a.amount;
    a.years -= 1;
  }
  // Child support for children living with an ex; they also see you less.
  const away = s.npcs.filter((k) => k.alive && s.family.custodyLost.includes(k.id) && k.age < 18);
  if (away.length) {
    s.money.cash -= money(s, 4000 * away.length, 'wage');
    for (const k of away) k.rel = Math.max(0, k.rel - ctx.rng.int(1, 3));
  }
  s.family.custodyLost = s.family.custodyLost.filter((id) =>
    s.npcs.some((k) => k.id === id && k.alive && k.age < 18),
  );
  s.money.alimony = s.money.alimony.filter((a) => a.years > 0);
}
