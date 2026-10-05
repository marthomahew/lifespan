import { ILLNESS_BY_ID } from '../../content/illnesses';
import type { Ctx } from '../ctx';
import { lowerLabel } from '../text';

const AGAIN = [
  'You recognise it at once, like an old enemy at a party.',
  'Same as last time, only you are older and less patient about it.',
  'Back for another round. You know where the good blanket is.',
  'You were hoping you had seen the last of it.',
];

export function addIllness(ctx: Ctx, id: string): void {
  const s = ctx.s;
  const def = ILLNESS_BY_ID[id];
  if (!def || s.health.illnesses.some((i) => i.id === id)) return;
  s.health.illnesses.push({
    id,
    since: s.year,
    severity: ctx.rng.int(def.severity[0], def.severity[1]),
    treated: -10,
  });
  // Only serious or lasting conditions are milestones; colds just go in the log.
  // Second time round, it's an old acquaintance rather than news.
  const first = `${def.emoji} Diagnosed: ${def.label}.`;
  const again = s.log.some((e) => e.text.startsWith(first));
  ctx.log(
    'health',
    again ? `${def.emoji} ${def.label} again. ${ctx.rng.pick(AGAIN)}` : `${first} ${def.symptom}`,
    def.chronic || def.deathFactor >= 1,
  );
}

export function cureIllness(ctx: Ctx, id: string): void {
  const s = ctx.s;
  const had = s.health.illnesses.find((i) => i.id === id);
  if (!had) return;
  s.health.illnesses = s.health.illnesses.filter((i) => i.id !== id);
  const def = ILLNESS_BY_ID[id];
  if (def) ctx.log('health', `${def.emoji} Your ${lowerLabel(def.label)} is gone.`);
}
