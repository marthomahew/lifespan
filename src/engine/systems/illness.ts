import { clampStat } from '../util';
import { addStat } from '../stats';
import { money } from '../economy';
import { fireEvent } from '../events/select';
import { EVENT_BY_ID } from '../../content/events';
import { ILLNESS_BY_ID } from '../../content/illnesses';
import type { Ctx } from '../ctx';
import { lowerLabel } from '../text';

const AGAIN = [
  'You recognise it at once, like an old enemy at a party.',
  'Same as last time, only you are older and less patient about it.',
  'Back for another round. You know where the good blanket is.',
  'You were hoping you had seen the last of it.',
];

/** Add an illness; `decide` (a real diagnosis, not a cheat) offers the treatment decision. */
export function addIllness(ctx: Ctx, id: string, decide = false): void {
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
  // A serious diagnosis is a decision, not just news.
  if (
    decide &&
    def.deathFactor >= 1 &&
    !def.mental &&
    !again &&
    s.player.age >= 16 &&
    !s.legal.prison
  ) {
    const ev = EVENT_BY_ID['hl_serious_diagnosis'];
    if (ev) fireEvent(ctx, ev, 'system', { illness: id, label: def.label.toLowerCase() });
  }
}

/** How you take on a serious illness: hard and fast, gently, or with a second opinion. */
export function illnessPlan(ctx: Ctx, plan: string, illnessId: string): void {
  const s = ctx.s;
  const ill = s.health.illnesses.find((i) => i.id === illnessId);
  if (!ill) return;
  const minor = s.player.age < 18;
  const pay = (ref: number): void => {
    if (!minor) s.money.cash -= money(s, ref);
  };
  if (plan === 'aggressive') {
    pay(4000);
    ill.severity = clampStat(ill.severity - 35);
    ill.treated = s.year;
    addStat(s, 'health', -6);
    addStat(s, 'stress', 10);
    if (s.career.jobId) s.career.performance = clampStat(s.career.performance - 10);
  } else if (plan === 'gentle') {
    pay(800);
    ill.severity = clampStat(ill.severity - 12);
    ill.treated = s.year;
    addStat(s, 'happiness', 2);
  } else if (plan === 'specialist') {
    pay(2500);
    ill.severity = clampStat(ill.severity - 20);
    ill.treated = s.year;
    addStat(s, 'stress', 3);
  } else if (plan === 'switch') {
    pay(500);
    ill.severity = clampStat(ill.severity - 10);
    ill.treated = s.year;
  } else if (plan === 'live') {
    addStat(s, 'stress', -5);
    addStat(s, 'happiness', 2);
  } else if (plan === 'second') {
    pay(300);
    if (ctx.rng.chance(0.45)) {
      ill.severity = clampStat(ill.severity - 15);
      ctx.log(
        'health',
        'The second specialist reads the scans differently. It is real, but smaller than feared.',
      );
    } else {
      addStat(s, 'stress', 5);
      ctx.log(
        'health',
        'The second opinion agrees with the first, word for word. At least now you know.',
      );
    }
  }
  if (ill.severity <= 0) cureIllness(ctx, illnessId);
}

export function cureIllness(ctx: Ctx, id: string): void {
  const s = ctx.s;
  const had = s.health.illnesses.find((i) => i.id === id);
  if (!had) return;
  s.health.illnesses = s.health.illnesses.filter((i) => i.id !== id);
  const def = ILLNESS_BY_ID[id];
  if (def) ctx.log('health', `${def.emoji} Your ${lowerLabel(def.label)} is gone.`);
}
