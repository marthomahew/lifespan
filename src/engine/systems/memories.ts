import { EVENT_BY_ID } from '../../content/events';
import type { Ctx } from '../ctx';
import { fireEvent } from '../events/select';

/**
 * People act on what they remember: every few years someone with a strong memory of you
 * (a kindness, or a wound) brings it back.
 */
export function memoryTick(ctx: Ctx): void {
  const s = ctx.s;
  if (s.player.age < 14 || s.legal.prison || s.pending.length) return;
  const last = Math.max(
    s.events.lastFired['mem_gratitude'] ?? -99,
    s.events.lastFired['mem_grudge'] ?? -99,
  );
  if (s.year - last < 6 || !ctx.rng.chance(0.2)) return;
  let best: { id: number; text: string; delta: number } | null = null;
  for (const n of s.npcs) {
    // Not the people you live with: they bring things up at breakfast, not out of the blue.
    if (!n.alive || n.age < 10 || n.roles.some((r) => r === 'spouse' || r === 'partner')) continue;
    // Nor the family you grow up with, while you still live under their roof.
    if (
      s.player.age < 18 &&
      (n.roles.some((r) => r === 'mother' || r === 'father' || r === 'sibling') ||
        n.flags.includes('raising_grandparent'))
    )
      continue;
    // Someone with a story already in motion (a loan coming back) doesn't turn up twice.
    if (s.chains.some((c) => Object.values(c.bindings).includes(n.id))) continue;
    for (const m of n.memory)
      if (
        s.year - m.year >= 3 &&
        Math.abs(m.delta) >= 10 &&
        (!best || Math.abs(m.delta) > Math.abs(best.delta))
      )
        best = { id: n.id, text: m.text, delta: m.delta };
  }
  if (!best) return;
  const def = EVENT_BY_ID[best.delta > 0 ? 'mem_gratitude' : 'mem_grudge'];
  if (!def || !fireEvent(ctx, def, 'system', { memory: best.text }, { who: best.id })) return;
  // Once it's been brought back, it's settled: it won't come round again.
  const n = s.npcs.find((x) => x.id === best.id);
  const m = n?.memory.find((x) => x.text === best.text && x.delta === best.delta);
  if (m) m.delta = Math.sign(m.delta) * 4;
}
