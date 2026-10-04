import type { Ctx } from '../ctx';

/** A crime from an event: a record entry, or an arrest that opens a case (M8.5 runs the trial). */
export function applyCrimeEffect(ctx: Ctx, crimeId: string, arrest: boolean): void {
  const s = ctx.s;
  if (arrest) {
    if (!s.legal.case && !s.legal.prison)
      s.legal.case = { crimeId, bail: 0, stage: 'arrested', lawyer: null };
    if (!s.player.flags.includes('ever_arrested')) s.player.flags.push('ever_arrested');
    return;
  }
  s.legal.record.push({
    crimeId,
    year: s.year,
    age: s.player.age,
    verdict: 'convicted',
    sentenceYears: 0,
    juvenile: s.player.age < 18,
  });
}
