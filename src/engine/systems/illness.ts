import { ILLNESS_BY_ID } from '../../content/illnesses';
import type { Ctx } from '../ctx';

export function addIllness(ctx: Ctx, id: string): void {
  const s = ctx.s;
  const def = ILLNESS_BY_ID[id];
  if (!def || s.health.illnesses.some((i) => i.id === id)) return;
  s.health.illnesses.push({
    id,
    since: s.year,
    severity: ctx.rng.int(def.severity[0], def.severity[1]),
    treated: 0,
  });
  ctx.log('health', `${def.emoji} Diagnosed: ${def.label}. ${def.symptom}`, true);
}

export function cureIllness(ctx: Ctx, id: string): void {
  const s = ctx.s;
  const had = s.health.illnesses.find((i) => i.id === id);
  if (!had) return;
  s.health.illnesses = s.health.illnesses.filter((i) => i.id !== id);
  const def = ILLNESS_BY_ID[id];
  if (def) ctx.log('health', `${def.emoji} Your ${def.label.toLowerCase()} is gone.`);
}
