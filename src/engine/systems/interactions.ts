import { INTERACTION_BY_ID, INTERACTIONS } from '../../content/interactions';
import type { InteractionDef } from '../../content/types';
import type { Ctx } from '../ctx';
import { countryOf, formatMoney, money } from '../economy';
import { EngineError } from '../errors';
import { renderText } from '../events/tokens';
import { remember } from '../npc';
import { addStat } from '../stats';
import type { GameState, Npc } from '../types';
import { clampStat } from '../util';
import { clampOdds, memorySentiment, npcOdds, playerOdds } from './odds';
import { breakUp, divorce, marry, WEDDING_COST } from './romance';
import { markUsed, usedThisYear } from './usage';
import { giftBonus, giftValue, handOver, type GiftParams } from './gifts';

export type InteractionView = {
  id: string;
  label: string;
  emoji: string;
  enabled: boolean;
  reason: string;
  cost: number;
};

const isPartner = (n: Npc): boolean => n.roles.includes('partner') || n.roles.includes('spouse');

function targetOk(def: InteractionDef, n: Npc): string | null {
  switch (def.target) {
    case 'partner':
      if (!isPartner(n)) return 'only with a partner';
      if (
        def.special === 'propose' &&
        (n.roles.includes('spouse') || n.romance?.stage === 'engaged')
      )
        return 'already engaged or married';
      if (def.special === 'propose' && n.romance?.stage === 'dating')
        return 'too soon: you are only dating';
      if (def.special === 'breakup' && n.roles.includes('spouse'))
        return 'married couples divorce instead';
      return null;
    case 'spouse':
      return n.roles.includes('spouse') ? null : 'only with a spouse';
    case 'engaged':
      return n.romance?.stage === 'engaged' ? null : 'only once engaged';
    case 'not_partner':
      return isPartner(n) ? 'try date night instead' : null;
    case 'family':
      return n.roles.some((r) =>
        ['mother', 'father', 'sibling', 'grandparent', 'child', 'grandchild'].includes(r),
      )
        ? null
        : 'family only';
    default:
      return null;
  }
}

/** Whether an interaction is available with an NPC right now, and why not. */
export function interactionReason(s: GameState, n: Npc, def: InteractionDef): string | null {
  const p = s.player;
  if (s.death) return 'the life is over';
  if (!n.alive) return `${n.first} has died`;
  if (
    s.legal.prison &&
    !['conversation', 'apologize', 'ask_advice', 'reconnect', 'cut_off'].includes(def.id)
  )
    return 'not from prison';
  if (p.age < def.minPlayerAge) return `from age ${def.minPlayerAge}`;
  if (n.age < def.minNpcAge) return `${n.first} is too young`;
  if (def.adultsOnly && (p.age < 18 || n.age < 18)) return 'adults only';
  const cut = n.flags.includes('cut_off');
  if (def.special === 'reconnect') {
    if (!cut && !(n.rel < 25 && s.year - n.lastContact >= 3)) return 'nothing to patch up';
  } else if (cut) return 'you cut them off';
  if (def.special === 'cut_off' && isPartner(n)) return 'break up instead';
  const t = targetOk(def, n);
  if (t) return t;
  if (usedThisYear(s, `i:${n.id}:${def.id}`) >= def.limitPerYear) return 'done this year';
  if (def.special === 'baby') {
    if (s.family.pregnancy) return 'a baby is already on the way';
    if (n.flags.includes('no_kids')) return `${n.first} doesn't want children`;
    if (p.gender !== 'female' && n.gender !== 'female')
      return 'try the fertility clinic or adoption';
  }
  if (def.special === 'wedding' && p.age < countryOf(s).ages.marriage)
    return `marriage age is ${countryOf(s).ages.marriage}`;
  const cost = def.special === 'wedding' ? WEDDING_COST.small : (def.cost ?? 0);
  if (cost && s.money.cash < money(s, cost)) return `costs ${formatMoney(s, money(s, cost))}`;
  return null;
}

export function interactionsFor(s: GameState, n: Npc): InteractionView[] {
  return INTERACTIONS.map((def) => {
    const why = interactionReason(s, n, def);
    return {
      id: def.id,
      label: def.label,
      emoji: def.emoji,
      enabled: why === null,
      reason: why ?? '',
      cost: def.cost ? money(s, def.cost) : 0,
    };
  });
}

/** Success chance: relationship, both sides' traits, the NPC's memory of you, then RNG. */
export function interactionOdds(s: GameState, n: Npc, def: InteractionDef): number {
  let p = def.base + def.relWeight * (n.rel - 50);
  if (def.base < 1) {
    p += playerOdds(s, def.odds) + npcOdds(n, 'social') * 0.5 + memorySentiment(n);
    if (def.special === 'propose') {
      const together = s.year - (n.romance?.since ?? s.year);
      p += Math.min(0.2, together * 0.05) + (n.romance?.stage === 'serious' ? 0.1 : -0.1);
    }
  }
  return clampOdds(p);
}

export type InteractParams = {
  size?: 'small' | 'medium' | 'large';
  prenup?: boolean;
  gift?: GiftParams;
};

export function interact(ctx: Ctx, npcId: number, id: string, params: InteractParams = {}): void {
  const s = ctx.s;
  const def = INTERACTION_BY_ID[id];
  const n = s.npcs.find((x) => x.id === npcId);
  if (!def || !n) throw new EngineError('unknown interaction or person');
  const why = interactionReason(s, n, def);
  if (why) throw new EngineError(`${def.label}: ${why}`);
  const size = params.size ?? 'small';
  const gift = def.special === 'gift' ? giftValue(s, params.gift) : 0;
  const cost =
    def.special === 'wedding' ? WEDDING_COST[size] : def.special === 'gift' ? 0 : (def.cost ?? 0);
  if (cost && s.money.cash < money(s, cost))
    throw new EngineError(`${def.label}: costs ${formatMoney(s, money(s, cost))}`);
  markUsed(s, `i:${n.id}:${def.id}`);
  if (cost) s.money.cash -= money(s, cost);
  if (def.special === 'gift') handOver(ctx, n, params.gift);

  let ok = ctx.roll(clampOdds(interactionOdds(s, n, def) + giftBonus(s, gift)));
  // Some people just aren't the marrying kind.
  if (def.special === 'propose' && n.flags.includes('no_marriage') && !s.cheats.forceSuccess)
    ok = false;
  if (def.special === 'baby') {
    // The one who would carry the baby counts most; nobody past it has a chance.
    const pf = s.player.stats.fertility;
    const carrier =
      s.player.gender === 'female'
        ? Math.max(pf, n.gender === 'female' ? n.fertility : 0)
        : n.fertility;
    const other = carrier === pf ? n.fertility : pf;
    const fert = carrier <= 0 ? 0 : (carrier * 0.7 + other * 0.3) / 100;
    ok = ctx.roll(Math.min(0.9, fert * 0.85));
  }
  if (def.special === 'wedding')
    ok = ctx.roll(size === 'large' ? 0.9 : size === 'medium' ? 0.85 : 0.75);
  const out = ok ? def.success : def.failure;
  const [lo, hi] = out.rel;
  const delta = ctx.rng.int(lo, hi);
  // From prison, a talk happens across a visiting-room table or down a phone line.
  const inside = s.legal.prison && def.id === 'conversation' && ok && !n.roles.includes('cellmate');
  const text = renderText(s, ctx.rng.pick(inside ? PRISON_TALK : out.texts), { npc: n.id });
  ctx.log(def.adultsOnly ? 'romance' : 'social', text);
  remember(s, n, out.memory, delta);
  if (out.happiness) addStat(s, 'happiness', out.happiness);

  switch (def.special) {
    case 'ask_money':
      if (ok && n.money <= 0) {
        ctx.log('money', `${n.first} turns out pockets that are genuinely empty.`);
      } else if (ok) {
        const amount = Math.max(money(s, 50), Math.min(Math.round(n.money * 0.1), money(s, 2500)));
        const paid = Math.min(amount, n.money);
        n.money = Math.max(0, n.money - paid);
        s.money.cash += paid;
        ctx.log('money', `${n.first} gives you ${formatMoney(s, paid)}.`);
      }
      break;
    case 'advice':
      if (ok) {
        addStat(s, 'smarts', 1);
        addStat(s, 'stress', -4);
      }
      break;
    case 'propose':
      if (ok && n.romance) n.romance.stage = 'engaged';
      else if (!ok && ctx.rng.chance(0.3)) {
        breakUp(ctx, n);
        ctx.log('romance', `${n.first} decides the relationship has run its course.`, true);
      }
      break;
    case 'wedding':
      marry(ctx, n, params.prenup === true);
      if (params.prenup) {
        remember(s, n, 'the prenup', -4);
        ctx.log('romance', "The prenup is signed in a lawyer's office that smells of toner.");
      }
      ctx.log('romance', `You marry ${n.first}.`, true);
      break;
    case 'baby':
      if (ok) {
        const carrier = s.player.gender === 'female' ? 'player' : 'partner';
        s.family.pregnancy = { due: s.year + 1, partnerId: n.id, carrier };
        ctx.log(
          'family',
          carrier === 'player' ? 'You are pregnant.' : `${n.first} is pregnant.`,
          true,
        );
      }
      break;
    case 'breakup':
      breakUp(ctx, n);
      break;
    case 'divorce':
      divorce(ctx, n);
      break;
    case 'cut_off':
      if (ok) {
        n.rel = 0;
        if (!n.flags.includes('cut_off')) n.flags.push('cut_off');
      }
      break;
    case 'reconnect':
      if (ok) n.flags = n.flags.filter((f) => f !== 'cut_off');
      break;
  }
  n.rel = clampStat(n.rel);
}

const PRISON_TALK = [
  '{npc.first} visits. You talk across the bolted table until the guard calls time, and it is the best hour of the month.',
  'A phone call with {npc.first}, eleven minutes long. You save up things to tell {npc.them} all week.',
  '{npc.first} writes back, three pages, mostly about the neighbours. You read it four times.',
];
