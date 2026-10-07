import { SKILLS } from '../../content/skills';
import type { Ctx } from '../ctx';
import { formatMoney, money } from '../economy';
import { addStat } from '../stats';
import type { GameState, Npc } from '../types';
import { addSkill } from './skills';

/**
 * A childhood that depends on the family you're born into: the home, the school, pocket
 * money, lessons and holidays, hard years for the poor, and a send-off at 17–18 (a car, a
 * trust fund) paid from what your parents actually have.
 */
export type School = 'state' | 'private' | 'boarding';
export type Upbringing = { school: School; home: string };
type Tier = GameState['player']['wealth'];

const HOMES: Record<Tier, string[]> = {
  poor: [
    'a cramped flat where you share a room with everyone',
    'a damp rented flat above a takeaway',
    'a caravan on a site at the edge of town',
  ],
  working: [
    'a small terraced house with a yard',
    'a council flat with a view of the car park',
    'a semi on an estate',
  ],
  middle: [
    'a suburban house with a garden',
    'a three-bedroom semi near the park',
    'a family house on a quiet street',
  ],
  comfortable: [
    'a big house with a garden and a trampoline',
    'a detached house with a playroom',
    'a townhouse in the smart part of town',
  ],
  rich: [
    'a mansion with a housekeeper and a pool',
    'a country house with stables',
    'a penthouse with a nanny’s flat',
  ],
};

/** Who goes to private school (rough real shares: under 10% overall, most of the rich). */
const PRIVATE: Record<Tier, number> = {
  poor: 0,
  working: 0.02,
  middle: 0.08,
  comfortable: 0.4,
  rich: 0.75,
};

export function startUpbringing(ctx: Ctx): void {
  const s = ctx.s;
  const t = s.player.wealth;
  const r = ctx.rng;
  const priv = r.chance(PRIVATE[t]);
  const school: School = priv ? (t === 'rich' && r.chance(0.3) ? 'boarding' : 'private') : 'state';
  s.upbringing = { school, home: r.pick(HOMES[t]) };
}

const parents = (s: GameState): Npc[] =>
  s.npcs.filter((n) => n.alive && (n.roles.includes('mother') || n.roles.includes('father')));

/** Take money from the parents (cash first, then investments); returns what they could spare. */
function fromParents(s: GameState, want: number): number {
  let got = 0;
  for (const p of parents(s)) {
    if (got >= want) break;
    const cash = Math.min(Math.max(0, p.money), want - got);
    p.money -= cash;
    got += cash;
    if (got < want) {
      const inv = Math.min(Math.max(0, p.invest ?? 0), want - got);
      p.invest = (p.invest ?? 0) - inv;
      got += inv;
    }
  }
  return Math.round(got);
}

/** Pocket money a year (today's dollars), ages 8–17. */
const ALLOWANCE: Record<Tier, number> = {
  poor: 0,
  working: 250,
  middle: 700,
  comfortable: 1800,
  rich: 6000,
};

/** Each year of a childhood: pocket money, lessons, holidays, school, and hard times. */
export function upbringingTick(ctx: Ctx): void {
  const s = ctx.s;
  const p = s.player;
  // Started on the first birthday (saves from before childhoods by class get one too).
  if (!s.upbringing && p.age <= 18) startUpbringing(ctx);
  if (p.age < 3 || p.age > 18 || s.legal.prison) return;
  const u = s.upbringing as Upbringing;
  const t = p.wealth;
  const r = ctx.rng;
  if (!parents(s).length) return;
  // Pocket money.
  if (p.age >= 8 && p.age <= 17 && ALLOWANCE[t] > 0) {
    const want = money(s, ALLOWANCE[t] * (0.8 + r.next() * 0.4));
    const got = fromParents(s, want);
    if (got > 0) {
      s.money.cash += got;
      if (p.age === 8)
        ctx.log(
          'family',
          `💷 You start getting pocket money: about ${formatMoney(s, got)} a year.`,
        );
    }
  }
  // School: private school lifts grades a little each year (smaller classes, homework clubs).
  if (u.school !== 'state' && p.age >= 5 && s.education.inSchool) {
    s.education.grade = Math.min(100, s.education.grade + 2);
    if (p.age === 5)
      ctx.log(
        'school',
        u.school === 'boarding'
          ? '🏫 You start at a private school; at eleven you’ll board.'
          : '🏫 You start at a private school, in a blazer two sizes too big.',
        true,
      );
  }
  // Lessons: the comfortable and the rich pay for them; the middle sometimes.
  const lessons =
    t === 'rich' ? 2 : t === 'comfortable' ? 1 : t === 'middle' && r.chance(0.4) ? 1 : 0;
  if (p.age >= 6 && p.age <= 16 && lessons) {
    const pool = SKILLS.filter((k) =>
      ['instrument', 'athletics', 'art', 'chess', 'voice'].includes(k.id),
    );
    for (let i = 0; i < lessons; i++) {
      const k =
        p.talent && r.chance(0.6)
          ? (SKILLS.find((x) => x.id === p.talent) ?? r.pick(pool))
          : r.pick(pool);
      addSkill(s, k.id, r.int(3, 6));
      if (r.chance(0.25))
        ctx.log(
          'activity',
          `🎓 Weekly ${k.label.toLowerCase()} lessons, paid for by your parents. You complain, and improve.`,
        );
    }
  }
  // Holidays: the further up, the further away.
  if (
    p.age >= 4 &&
    r.chance(
      t === 'rich'
        ? 0.9
        : t === 'comfortable'
          ? 0.7
          : t === 'middle'
            ? 0.4
            : t === 'working'
              ? 0.2
              : 0,
    )
  ) {
    addStat(s, 'happiness', t === 'rich' ? 4 : 3);
    if (r.chance(0.3))
      ctx.log(
        'family',
        t === 'rich'
          ? '✈️ A family holiday somewhere warm, flown in comfort. You have been to more countries than most of your teachers.'
          : t === 'comfortable'
            ? '⛷️ A family holiday abroad: skiing, or a villa with a pool. You come back with a tan and a souvenir keyring.'
            : t === 'middle'
              ? '🚗 A family holiday: a long drive, a rented cottage, and one perfect beach day.'
              : '🏕️ A week at a caravan park by the sea. It rains, and it is still the best week of the year.',
      );
  }
  // Hard years: money worries reach children too.
  if ((t === 'poor' && r.chance(0.35)) || (t === 'working' && r.chance(0.12))) {
    addStat(s, 'happiness', -2);
    addStat(s, 'stress', 3);
    if (r.chance(0.4))
      ctx.log(
        'family',
        r.pick([
          'The heating goes off to save money and you do your homework in a coat.',
          'Your shoes are hand-me-downs again, and they pinch.',
          'You hear your parents arguing about bills through the wall.',
          'You get free school meals and pretend not to mind the separate queue.',
        ]),
      );
  }
  // Leaving home: a car at 17 (if the family can), a trust fund or a gift at 18.
  if (
    p.age === 17 &&
    (t === 'rich' || (t === 'comfortable' && r.chance(0.6))) &&
    !s.assets.vehicles.length
  ) {
    const price = money(s, t === 'rich' ? 45000 : 20000);
    if (fromParents(s, price) >= price * 0.9) {
      s.assets.vehicles.push({
        id: s.assets.nextAssetId++,
        model: t === 'rich' ? 'bmw_3' : 'vw_golf',
        value: price,
        paid: price,
        condition: 100,
        bought: s.year,
      });
      ctx.log(
        'family',
        `🚗 For your seventeenth birthday your parents give you a car${t === 'rich' ? ', with a bow on the bonnet' : ''}.`,
        true,
      );
    }
  }
  if (p.age === 18 && !p.flags.includes('send_off')) {
    p.flags.push('send_off');
    const share = { poor: 0, working: 0.02, middle: 0.04, comfortable: 0.1, rich: 0.2 }[t];
    const wealth = parents(s).reduce(
      (a, n) => a + Math.max(0, n.money) + Math.max(0, n.invest ?? 0),
      0,
    );
    const gift = fromParents(s, Math.round(wealth * share));
    if (gift > 0) {
      s.money.cash += gift;
      ctx.log(
        'family',
        t === 'rich' || t === 'comfortable'
          ? `🏦 At eighteen, a trust fund comes to you: ${formatMoney(s, gift)}. Your parents say “be sensible” three times.`
          : `🎁 Your parents give you ${formatMoney(s, gift)} to get you started. You know what it cost them.`,
        true,
      );
    }
  }
}
