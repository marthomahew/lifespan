import type { Ctx } from './ctx';

/** Pick a line, preferring ones the log hasn't shown lately, so yearly actions don't read the same. */
export function pickFresh(ctx: Ctx, lines: readonly string[], lookback = 60): string {
  // Log lines may carry an emoji in front, so look for the line inside each recent entry.
  const recent = ctx.s.log.slice(-lookback).map((e) => e.text);
  const fresh = lines.filter((l) => !recent.some((r) => r.includes(l)));
  return ctx.rng.pick(fresh.length ? fresh : lines);
}

/** The same for templates with a {n} name slot: skips ones whose wording the log has shown lately. */
export function pickFreshTemplate(
  ctx: Ctx,
  templates: readonly string[],
  name: string,
  lookback = 60,
): string {
  const recent = ctx.s.log.slice(-lookback).map((e) => e.text);
  const seen = (t: string): boolean => {
    const parts = t.split('{n}').filter((p) => p.trim().length > 3);
    return recent.some((r) => parts.every((p) => r.includes(p)));
  };
  const fresh = templates.filter((t) => !seen(t));
  return ctx.rng
    .pick(fresh.length ? fresh : templates)
    .split('{n}')
    .join(name);
}
