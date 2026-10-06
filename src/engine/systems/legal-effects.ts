import { luck } from './luck';
import { CRIME_BY_ID } from '../../content/crimes';
import type { Ctx } from '../ctx';
import { addStat } from '../stats';
import { openCase } from './crime';

/** A crime from an event: notoriety and karma, and with `arrest` a case that goes to court. */
export function applyCrimeEffect(ctx: Ctx, crimeId: string, arrest: boolean): void {
  const s = ctx.s;
  const def = CRIME_BY_ID[crimeId];
  if (!s.player.flags.includes('ever_crime')) s.player.flags.push('ever_crime');
  if (def) {
    addStat(s, 'notoriety', Math.ceil(def.notoriety / 2));
    addStat(s, 'karma', Math.ceil(def.karma / 2));
  }
  // Never caught: even a story that ends in handcuffs usually doesn't, for the lucky.
  if (arrest && !ctx.rng.chance(0.75 * Math.min(1, luck(s, 'crime')))) openCase(ctx, crimeId);
}
