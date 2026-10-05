import { describe, expect, it } from 'vitest';
import { newLife, runCheat } from '../../src/engine';
import { edgeReason, eventEdge, tiltWeights } from '../../src/engine/events/skill-check';
import { pickOutcome } from '../../src/engine/events/apply';
import type { EventDef, OutcomeDef } from '../../src/engine/events/types';
import { Ctx } from '../../src/engine/ctx';
import { clone } from '../../src/engine/util';

const social: EventDef = {
  id: 'test_social',
  kind: 'choice',
  category: 'social',
  weight: 1,
  text: 'A party.',
  choices: [],
};
const outcomes: OutcomeDef[] = [
  { chance: 0.5, text: 'It goes well.', effects: [], success: true },
  { chance: 0.5, text: 'It goes badly.', effects: [] },
];

const person = (traits: string[], happiness = 50) => {
  const s = clone(
    runCheat(newLife({ country: 'us', birthYear: 1990 }, 2), 'age.set', { age: 25 }).state,
  );
  s.player.traits = traits;
  s.player.skills = {};
  s.player.stats.happiness = happiness;
  return s;
};

describe('who you are tilts the odds (skill checks)', () => {
  it('traits and the relevant stat move the success share, with reasons', () => {
    const charming = eventEdge(person(['charming', 'funny'], 80), social);
    expect(charming.bonus).toBeGreaterThan(0.2);
    expect(charming.best).toBe('Being Charming');
    const awkward = eventEdge(person(['awkward', 'anxious'], 30), social);
    expect(awkward.bonus).toBeLessThan(-0.2);
    expect(awkward.worst).toMatch(/Awkward|Anxious|Low Happiness/);
    expect(eventEdge(person([]), { ...social, category: 'travel' }).bonus).toBe(0);
  });

  it('the tilt is capped, keeps probabilities valid, and leaves unmarked choices alone', () => {
    const w = tiltWeights([0.5, 0.5], outcomes, 0.25);
    expect((w[0] ?? 0) / ((w[0] ?? 0) + (w[1] ?? 0))).toBeCloseTo(0.75, 5);
    expect(tiltWeights([0.5, 0.5], outcomes, -0.9)[0]).toBeGreaterThan(0);
    const unmarked = outcomes.map((o) => ({ ...o, success: undefined }));
    expect(tiltWeights([0.5, 0.5], unmarked, 0.25)).toEqual([0.5, 0.5]);
  });

  it('over many rolls, a charming person wins the social moment far more often', () => {
    const rate = (traits: string[], h: number): number => {
      let wins = 0;
      for (let seed = 1; seed <= 400; seed++) {
        const s = person(traits, h);
        s.rng = clone(newLife({}, seed)).rng;
        if (pickOutcome(new Ctx(s), outcomes, {}, social)?.success) wins += 1;
      }
      return wins / 400;
    };
    const good = rate(['charming', 'funny'], 80);
    const bad = rate(['awkward', 'anxious'], 30);
    expect(good - bad).toBeGreaterThan(0.3);
  });
});

describe('the reason is told', () => {
  it('a charming person winning a social moment is told why', () => {
    const def: EventDef = { ...social, choices: [{ id: 'go', label: 'Go', outcomes }] };
    const s = person(['charming', 'funny'], 80);
    expect(edgeReason(s, def, outcomes, outcomes[0] as OutcomeDef)).toBe('Being Charming helped.');
    expect(edgeReason(s, def, outcomes, outcomes[1] as OutcomeDef)).toBeNull();
    const a = person(['awkward', 'anxious'], 30);
    expect(edgeReason(a, def, outcomes, outcomes[1] as OutcomeDef)).toMatch(/didn't help/);
  });
});
