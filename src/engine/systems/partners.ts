import type { Ctx } from '../ctx';
import type { Attraction, GameState, Gender, Npc } from '../types';

/** Gender of someone the player is attracted to. */
export function partnerGender(ctx: Ctx): Gender {
  const a = ctx.s.player.attraction;
  if (a === 'men') return 'male';
  if (a === 'women') return 'female';
  return ctx.rng.chance(0.5) ? 'male' : 'female';
}

/** Whether someone of gender g fits who the player is attracted to. */
export function fitsAttraction(a: Attraction, g: Gender): boolean {
  if (a === 'everyone') return true;
  return a === 'men' ? g === 'male' : g === 'female';
}

export function partnerOf(s: GameState): Npc | undefined {
  return s.npcs.find((n) => n.alive && (n.roles.includes('spouse') || n.roles.includes('partner')));
}

export function currentPartner(ctx: Ctx): Npc | undefined {
  return partnerOf(ctx.s);
}

export function killNpc(ctx: Ctx, n: Npc, cause: string): void {
  if (!n.alive) return;
  n.alive = false;
  n.deathYear = ctx.s.year;
  n.deathCause = cause;
}
