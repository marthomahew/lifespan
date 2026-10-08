import { CATALOGUE_VEHICLES } from '../../content/vehicles';
import { SKILLS } from '../../content/skills';
import type { Ctx } from '../ctx';
import { formatMoney, money } from '../economy';
import { pickFresh } from '../fresh';
import { addStat } from '../stats';
import type { GameState, Npc } from '../types';
import { productPhrase, vehicleOffer } from './assets';
import { addSkill } from './skills';

/**
 * A childhood that depends on the family you're born into: the home, the school, pocket
 * money, lessons and holidays, hard years for the poor, and a send-off at 17–18 (a car, a
 * trust fund) paid from what your parents actually have.
 */
export type School = 'state' | 'private' | 'boarding';
export type Upbringing = { school: School; home: string };
type Tier = GameState['player']['wealth'];

/** Countries that say flat, garden and holiday; the rest get American English. */
const BRITISH = ['uk', 'ie', 'au', 'nz', 'za', 'in'];
const british = (s: GameState): boolean => BRITISH.includes(s.player.country);
const say = (s: GameState, uk: string, us: string): string => (british(s) ? uk : us);

const HOMES: Record<Tier, [uk: string, us: string][]> = {
  poor: [
    [
      'a cramped flat where you share a room with everyone',
      'a cramped apartment where you share a room with everyone',
    ],
    ['a damp rented flat above a takeaway', 'a damp rented apartment above a laundromat'],
    ['a caravan on a site at the edge of town', 'a trailer at the edge of town'],
  ],
  working: [
    ['a small terraced house with a yard', 'a small row house with a yard'],
    [
      'a council flat with a view of the car park',
      'an apartment in the projects with a view of the parking lot',
    ],
    ['a semi on an estate', 'a duplex on a busy street'],
  ],
  middle: [
    ['a suburban house with a garden', 'a suburban house with a backyard'],
    ['a three-bedroom semi near the park', 'a three-bedroom ranch house near the park'],
    ['a family house on a quiet street', 'a family house on a quiet cul-de-sac'],
  ],
  comfortable: [
    ['a big house with a garden and a trampoline', 'a big house with a pool and a trampoline'],
    ['a detached house with a playroom', 'a colonial with a finished basement'],
    ['a townhouse in the smart part of town', 'a brownstone in the nice part of town'],
  ],
  rich: [
    ['a mansion with a housekeeper and a pool', 'a mansion with a housekeeper and a pool'],
    ['a country house with stables', 'an estate with stables and a tennis court'],
    ['a penthouse with a nanny’s flat', 'a penthouse with a nanny’s suite'],
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
  const [uk, us] = r.pick(HOMES[t]);
  s.upbringing = { school, home: british(s) ? uk : us };
}

/** A private education is worth a few points on every report (smaller classes, more help). */
export const privateSchoolBonus = (s: GameState): number =>
  s.upbringing && s.upbringing.school !== 'state' ? 6 : 0;

const parents = (s: GameState): Npc[] =>
  s.npcs.filter((n) => n.alive && (n.roles.includes('mother') || n.roles.includes('father')));

const spare = (n: Npc): number => Math.max(0, n.money) + Math.max(0, n.invest ?? 0);

/** Take money from the parents, each in proportion to what they have (cash first). */
function fromParents(s: GameState, want: number): number {
  const ps = parents(s);
  const total = ps.reduce((a, n) => a + spare(n), 0);
  if (total <= 0 || want <= 0) return 0;
  const take = Math.min(want, total);
  let got = 0;
  for (const p of ps) {
    let part = (take * spare(p)) / total;
    const cash = Math.min(Math.max(0, p.money), part);
    p.money -= cash;
    part -= cash;
    const inv = Math.min(Math.max(0, p.invest ?? 0), part);
    p.invest = (p.invest ?? 0) - inv;
    got += cash + inv;
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

function holidayLine(s: GameState, t: Tier): string[] {
  const y = s.year;
  const fly = y >= 1975;
  if (t === 'rich')
    return [
      '✈️ A family holiday somewhere warm, flown in comfort. You have been to more countries than most of your teachers.',
      '🛥️ A summer on a chartered yacht. You learn to say “starboard” and to be bored in great luxury.',
      '🏔️ Christmas in a chalet with its own chef. You ski badly and are told you ski beautifully.',
      `🗽 A week in ${s.player.country === 'us' ? 'Paris' : 'New York'}: a suite, a show, a shop that measures you for shoes.`,
      '🏝️ An island resort where every kid in the kids’ club also has a nanny.',
    ];
  if (t === 'comfortable')
    return [
      say(
        s,
        `⛷️ A family holiday ${fly ? 'abroad' : 'in the mountains'}: skiing, or a villa with a pool. You come back with a tan and a souvenir keyring.`,
        '⛷️ A family vacation: skiing out west, or a beach house for two weeks. You come back with a tan and a souvenir keyring.',
      ),
      '🏛️ A city break full of museums. You complain at every one and remember all of them.',
      say(
        s,
        '🚤 A fortnight on a lake with a boat for hire.',
        '🚤 Two weeks at a lake house with a boat.',
      ),
      fly
        ? '🌴 A package resort with a waterslide you go down forty times.'
        : '🏖️ A seaside hotel with a ballroom and a strict dress code at dinner.',
    ];
  if (t === 'middle')
    return [
      say(
        s,
        '🚗 A family holiday: a long drive, a rented cottage, and one perfect beach day.',
        '🚗 A family road trip: a long drive, a rented cabin, and one perfect beach day.',
      ),
      '⛺ Camping by a lake. Somebody forgets the tent pegs; it is still great.',
      say(
        s,
        '🏨 A week in a seaside hotel with a pool that is mostly for the photos.',
        '🎢 A trip to a theme park and a motel with a pool.',
      ),
      '👵 A week at the grandparents’, which turns out to be the best holiday of all.',
    ];
  return [
    say(
      s,
      '🏕️ A week at a caravan park by the sea. It rains, and it is still the best week of the year.',
      '🏕️ A weekend camping at a state park. It rains, and it is still the best weekend of the year.',
    ),
    '🚌 A day trip to the seaside on a crowded coach, with sandwiches from home.',
    '🎡 A day at the fair, counted out in tokens, worth every one.',
  ];
}

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
          `🪙 You start getting pocket money: about ${formatMoney(s, got)} a year.`,
        );
    }
  }
  // School: the first day, and boarding from eleven (grades: privateSchoolBonus).
  if (u.school !== 'state' && p.age === 6)
    ctx.log(
      'school',
      u.school === 'boarding'
        ? '🏫 You start at a private prep school; at eleven you’ll board.'
        : say(
            s,
            '🏫 You start at a private school, in a blazer two sizes too big.',
            '🏫 You start at a private school, in a uniform two sizes too big.',
          ),
      true,
    );
  if (u.school === 'boarding' && p.age === 11)
    ctx.log(
      'school',
      '🧳 You leave for boarding school with a trunk, a tuck box and a name tape on every sock. The first night is the longest of your life.',
      true,
    );
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
      if (r.chance(0.15)) {
        const what = k.label.toLowerCase();
        ctx.log(
          'activity',
          pickFresh(ctx, [
            `🎓 Weekly ${what} lessons, paid for by your parents. You complain, and improve.`,
            `🎓 Your ${what} teacher says you’re ready for the next grade, and means it.`,
            `🎓 A summer course in ${what}. You come back better and slightly insufferable about it.`,
            `🎓 You perform at the end-of-term ${what} show. Your parents film the whole thing.`,
            `🎓 Saturday mornings are ${what} lessons now. You stop minding by spring.`,
          ]),
        );
      }
    }
  }
  // Holidays: the further up, the further away.
  const away = { rich: 0.9, comfortable: 0.7, middle: 0.4, working: 0.2, poor: 0 }[t];
  if (p.age >= 4 && r.chance(away)) {
    addStat(s, 'happiness', t === 'rich' ? 4 : 3);
    if (r.chance(0.25)) ctx.log('family', pickFresh(ctx, holidayLine(s, t)));
  }
  // Hard years: money worries reach children too.
  if ((t === 'poor' && r.chance(0.35)) || (t === 'working' && r.chance(0.12))) {
    addStat(s, 'happiness', -2);
    addStat(s, 'stress', 3);
    if (r.chance(0.35))
      ctx.log(
        'family',
        pickFresh(ctx, [
          'The heating goes off to save money and you do your homework in a coat.',
          'Your shoes are hand-me-downs again, and they pinch.',
          'You hear your parents arguing about bills through the wall.',
          say(
            s,
            'You get free school meals and pretend not to mind the separate queue.',
            'You get free school lunch and pretend not to mind the separate line.',
          ),
          'Dinner is toast again. Your mum says she isn’t hungry.',
          'A school trip letter comes home. You throw it away before anyone sees.',
        ]),
      );
  }
  // Leaving home: a car at 17 (if the family can), a trust fund or a gift at 18.
  if (p.age === 17 && (t === 'rich' || (t === 'comfortable' && r.chance(0.6)))) firstCar(ctx);
  if (p.age === 18 && !p.flags.includes('send_off')) sendOff(ctx);
}

/** A first car, a model on sale this year, and the lessons to drive it. */
function firstCar(ctx: Ctx): void {
  const s = ctx.s;
  const rich = s.player.wealth === 'rich';
  if (s.assets.vehicles.length) return;
  const budget = rich ? 60000 : 25000;
  const onSale = (
    cats: string[] | null,
  ): { v: (typeof CATALOGUE_VEHICLES)[number]; price: number }[] =>
    CATALOGUE_VEHICLES.flatMap((v) => {
      const price = vehicleOffer(v, s.year).fresh;
      const fits =
        price !== null &&
        price <= budget &&
        price >= budget * 0.2 &&
        !['bike', 'van'].includes(v.category ?? '') &&
        (cats === null || cats.includes(v.category ?? ''));
      return fits ? [{ v, price }] : [];
    });
  // The kind of car the family would pick, or failing that whatever the showroom has.
  const preferred = onSale(
    rich ? ['luxury', 'sports', 'classic'] : ['economy', 'family', 'classic'],
  );
  const options = preferred.length ? preferred : onSale(null);
  if (!options.length) return;
  const { v, price } = ctx.rng.pick(options);
  const cost = money(s, price);
  if (fromParents(s, cost) < cost * 0.9) return;
  s.assets.vehicles.push({
    id: s.assets.nextAssetId++,
    model: v.id,
    value: cost,
    paid: cost,
    condition: 100,
    bought: s.year,
  });
  const licence = !s.assets.licence;
  s.assets.licence = true;
  ctx.log(
    'family',
    `🚗 For your seventeenth birthday your parents give you ${productPhrase(v, s.year)}${rich ? say(s, ', with a bow on the bonnet', ', with a bow on the hood') : ''}${licence ? ', and the driving lessons to go with it. You pass your test first time' : ''}.`,
    true,
  );
}

/** Eighteen: a trust fund, a gift, or a keepsake, as the family can manage. */
function sendOff(ctx: Ctx): void {
  const s = ctx.s;
  const t = s.player.wealth;
  s.player.flags.push('send_off');
  const share = { poor: 0, working: 0.02, middle: 0.04, comfortable: 0.1, rich: 0.2 }[t];
  const wealth = parents(s).reduce((a, n) => a + spare(n), 0);
  const gift = fromParents(s, Math.round(wealth * share));
  if (gift >= money(s, 50)) {
    s.money.cash += gift;
    ctx.log(
      'family',
      t === 'rich' || t === 'comfortable'
        ? `🏦 At eighteen, a trust fund comes to you: ${formatMoney(s, gift)}. Your parents say “be sensible” three times.`
        : `🎁 Your parents give you ${formatMoney(s, gift)} to get you started. You know what it cost them.`,
      true,
    );
    return;
  }
  // No money to give: something else instead.
  ctx.log(
    'family',
    pickFresh(ctx, [
      '🎁 There’s no money for a send-off, so your mum gives you her old watch and tells you to be on time for things.',
      '🎁 Your parents can’t give you money, so they give you a packed lunch, the bus fare and a hug that lasts too long.',
      '🎁 Your dad hands you his toolbox. “Everything you need is in there,” he says, and he isn’t only talking about tools.',
    ]),
    true,
  );
  addStat(s, 'happiness', 3);
}
