import { EVENTS } from '../src/content/events';
import { newLife, type GameState } from '../src/engine';
import { botStep, newBotMemory, PERSONAS, type PersonaId } from '../src/engine/bot/persona';
import { eligibility } from '../src/engine/events/select';
import { Rng, seedRng } from '../src/engine/rng';
import type { EventDef } from '../src/engine/events/types';

export type CoverageResult = {
  lives: number;
  fired: Map<string, number>;
  eligibleSeen: Set<string>;
  perPersona: Record<string, { lives: number; medianAge: number }>;
  errors: string[];
};

const allOutcomes = (e: EventDef) => [
  ...(e.outcomes ?? []),
  ...(e.choices ?? []).flatMap((c) => c.outcomes),
];

/** Parents of each chain follow-up. */
export function chainParents(): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const e of EVENTS) {
    for (const o of allOutcomes(e)) {
      const ts = [
        o.next?.eventId,
        ...o.effects.map((x) => ('schedule' in x ? x.schedule : undefined)),
      ].filter((x): x is string => !!x);
      for (const t of ts) out.set(t, [...(out.get(t) ?? []), e.id]);
    }
  }
  return out;
}

/** Play lives across personas, counting every event that fires (popups and notices). */
export function runCoverage(
  livesPerPersona: number,
  sampleEvery = 8,
  seedBase = 10000,
): CoverageResult {
  const fired = new Map<string, number>();
  const eligibleSeen = new Set<string>();
  const perPersona: CoverageResult['perPersona'] = {};
  const errors: string[] = [];
  let lives = 0;
  PERSONAS.forEach((persona, pi) => {
    const ages: number[] = [];
    for (let i = 0; i < livesPerPersona; i++) {
      const seed = seedBase + pi * 100000 + i;
      let s: GameState = newLife({}, seed);
      const bot = new Rng(seedRng(seed * 31 + 7));
      const mem = newBotMemory();
      const sample = i % sampleEvery === 0;
      let lastYear = -1;
      try {
        for (let step = 0; step < 30000 && !s.death; step++) {
          s = botStep(s, persona as PersonaId, bot, mem);
          if (sample && s.year !== lastYear) {
            lastYear = s.year;
            for (const e of EVENTS)
              if (
                !fired.has(e.id) &&
                !eligibleSeen.has(e.id) &&
                !e.chainOnly &&
                eligibility(s, e).ok
              )
                eligibleSeen.add(e.id);
          }
        }
      } catch (e) {
        errors.push(`${persona} seed ${seed}: ${(e as Error).message}`);
      }
      for (const [id, n] of Object.entries(s.events.counts))
        fired.set(id, (fired.get(id) ?? 0) + n);
      ages.push(s.death?.age ?? s.player.age);
      lives++;
    }
    ages.sort((a, b) => a - b);
    perPersona[persona] = {
      lives: livesPerPersona,
      medianAge: ages[Math.floor(ages.length / 2)] ?? 0,
    };
  });
  return { lives, fired, eligibleSeen, perPersona, errors };
}

/** Why an event never fired, from what we know about it. */
export function reasonFor(e: EventDef, r: CoverageResult, parents: Map<string, string[]>): string {
  if (e.chainOnly) {
    const ps = parents.get(e.id) ?? [];
    if (!ps.length)
      return 'fired only by a system (no event schedules it); its system path was not reached';
    const pf = ps.map((p) => `${p} ×${r.fired.get(p) ?? 0}`).join(', ');
    return `follow-up of ${pf}; the triggering outcome or its bindings did not line up`;
  }
  if (r.eligibleSeen.has(e.id))
    return 'eligible in sampled years but never drawn (low weight or long cooldown)';
  const bits: string[] = [];
  if (e.ages) bits.push(`ages ${e.ages[0]}–${e.ages[1]}`);
  if (e.when) bits.push('has a condition');
  if (e.bind)
    bits.push(
      `needs ${Object.values(e.bind)
        .map((q) => q.role)
        .join(', ')}`,
    );
  if (e.adultsOnly) bits.push('adults only');
  return `never eligible in sampled years (${bits.join('; ') || 'no obvious gate'})`;
}
