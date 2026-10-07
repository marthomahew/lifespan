import { EVENT_BY_ID } from '../../content/events';
import type { Ctx } from '../ctx';
import { fireEvent } from '../events/select';
import { remember } from '../npc';
import type { GameState, Npc } from '../types';
import { fitsAttraction } from './partners';

/**
 * Teenage relationships: two peers, 14 to 17 and at most two years apart, going out.
 * Nothing physical is ever described; it ends when one of them turns 18 before the other,
 * and at 18 together it can become a real (adult) relationship.
 */
export const sweetheartOf = (s: GameState): Npc | undefined =>
  s.npcs.find((n) => n.alive && n.roles.includes('sweetheart'));

const teen = (age: number): boolean => age >= 14 && age <= 17;

export function canGoOut(s: GameState, n: Npc): boolean {
  const p = s.player;
  const age = s.year - n.birthYear;
  return (
    teen(p.age) &&
    teen(age) &&
    Math.abs(age - p.age) <= 2 &&
    fitsAttraction(p.attraction, n.gender) &&
    !sweetheartOf(s)
  );
}

export function teenRomance(ctx: Ctx, kind: 'sweetheart' | 'sweetheart_end', npc?: Npc): void {
  const s = ctx.s;
  if (kind === 'sweetheart') {
    if (!npc || !npc.alive || !canGoOut(s, npc)) return;
    npc.roles.push('sweetheart');
    npc.rel = Math.max(npc.rel, 65);
    remember(s, npc, 'the day you started going out', 6);
    ctx.log(
      'social',
      `💌 You and ${npc.first} are going out. Everyone at school knows by lunchtime.`,
      true,
    );
    return;
  }
  const sw = npc && npc.roles.includes('sweetheart') ? npc : sweetheartOf(s);
  if (!sw) return;
  endSweetheart(sw);
}

function endSweetheart(n: Npc): void {
  n.roles = n.roles.filter((r) => r !== 'sweetheart');
  if (!n.roles.includes('friend')) n.roles.push('friend');
  if (!n.flags.includes('ex_sweetheart')) n.flags.push('ex_sweetheart');
}

/** Yearly: an age gap that crosses 18 ends it gently; 18 together brings the big question. */
export function teenRomanceTick(ctx: Ctx): void {
  const s = ctx.s;
  const sw = sweetheartOf(s);
  if (!sw || s.death) return;
  const p = s.player;
  // Ages from birth years: this runs before the NPCs' ages tick over for the year.
  const theirAge = s.year - sw.birthYear;
  const adults = (p.age >= 18 ? 1 : 0) + (theirAge >= 18 ? 1 : 0);
  if (adults === 1) {
    endSweetheart(sw);
    ctx.log(
      'social',
      `${sw.first} ${p.age >= 18 ? 'stays behind at school' : 'leaves school for the wider world'}, and you agree, kindly, to stay friends.`,
    );
    return;
  }
  if (adults === 2) {
    const def = EVENT_BY_ID['tr_eighteen'];
    if (def) fireEvent(ctx, def, 'system', {}, { sw: sw.id });
    else endSweetheart(sw);
  }
}
