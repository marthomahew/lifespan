import { CHALLENGE_BY_ID } from '../../content/challenges';
import type { Ctx } from '../ctx';
import type { NewLifeOptions } from '../life';
import { addStat } from '../stats';

/** New-life options for a challenge: its setup, with the player's own picks for anything it leaves open. */
export function challengeOptions(id: string, own: NewLifeOptions = {}): NewLifeOptions {
  const def = CHALLENGE_BY_ID[id];
  if (!def) return own;
  return { ...own, ...def.setup, challenge: id };
}

/** Won when the goal is met; lost when the deadline passes (checked yearly and after actions). */
export function checkChallenge(ctx: Ctx): void {
  const s = ctx.s;
  const c = s.challenge;
  if (!c || c.status !== 'active') return;
  const def = CHALLENGE_BY_ID[c.id];
  if (!def) return;
  if (def.done(s)) {
    c.status = 'won';
    c.year = s.year;
    addStat(s, 'happiness', 12);
    ctx.toast({ kind: 'achievement', text: `${def.emoji} Challenge complete: ${def.title}` });
    ctx.log('achievement', `${def.emoji} Challenge complete: ${def.title}. ${def.goal}`, true);
    return;
  }
  if (def.byAge !== undefined && s.player.age > def.byAge) failChallenge(ctx, 'time ran out');
}

/** A life that ends with the goal unmet (multi-generation challenges carry on instead). */
export function challengeAtDeath(ctx: Ctx): void {
  const c = ctx.s.challenge;
  if (!c || c.status !== 'active') return;
  if (CHALLENGE_BY_ID[c.id]?.spansGenerations) return;
  failChallenge(ctx, 'the life ended first');
}

function failChallenge(ctx: Ctx, why: string): void {
  const s = ctx.s;
  const c = s.challenge;
  const def = c ? CHALLENGE_BY_ID[c.id] : undefined;
  if (!c || !def) return;
  c.status = 'lost';
  c.year = s.year;
  ctx.log('achievement', `${def.emoji} Challenge missed: ${def.title} (${why}).`, true);
}
