import { describe, expect, it } from 'vitest';
import { act, newLife, runCheat, interviewOdds, type GameState } from '../../src/engine';
import { COUNTRIES } from '../../src/content/countries';
import { TRAITS } from '../../src/content/traits';
import { LANGUAGE_BY_ID, SKILLS } from '../../src/content/skills';
import { SAME_SEX_MARRIAGE } from '../../src/content/history/norms';
import { EVENTS } from '../../src/content/events';
import { JOB_BY_ID } from '../../src/content/jobs';
import { validateCountries } from '../../scripts/content-lib';
import { skillModifiers, traitModifiers } from '../../src/engine/describe';
import { applyEffect } from '../../src/engine/events/apply';
import { Ctx } from '../../src/engine/ctx';
import { clone } from '../../src/engine/util';
import { netWorth } from '../../src/engine/networth';
import { playYears } from '../helpers';

const adult = (seed = 1, country = 'us', age = 30): GameState => {
  const s = runCheat(
    runCheat(newLife({ country, birthYear: 1980 }, seed), 'age.set', { age }).state,
    'money.add',
    { amount: 100000 },
  ).state;
  return { ...s, cheats: { ...s.cheats, immortal: true, noBadEvents: true } };
};

describe('countries (M9.1)', () => {
  it('has 12+ countries with names, cities, economy and law data', () => {
    expect(COUNTRIES.length).toBeGreaterThanOrEqual(12);
    expect(validateCountries()).toEqual([]);
    expect(new Set(COUNTRIES.flatMap((c) => c.languages)).size).toBeGreaterThanOrEqual(8);
  });

  it('every country speaks known languages, has a marriage law, and can be born into', () => {
    for (const c of COUNTRIES) {
      for (const l of c.languages) expect(LANGUAGE_BY_ID[l], `${c.id} ${l}`).toBeDefined();
      expect(c.id in SAME_SEX_MARRIAGE, c.id).toBe(true);
      const s = newLife({ country: c.id }, 7);
      expect(s.player.country).toBe(c.id);
      expect(c.cities).toContain(s.player.city);
      expect(s.player.languages[c.languages[0] ?? '']).toBe(100);
    }
  });

  it('newborns speak their native language fluently', () => {
    const s = newLife({ country: 'jp' }, 1);
    expect(s.player.languages['japanese']).toBe(100);
  });
});

describe('emigration (M9.2)', () => {
  it('requires an adult with money and no active sentence', () => {
    expect(() =>
      act(runCheat(newLife({ country: 'us' }, 2), 'age.set', { age: 15 }).state, {
        type: 'emigrate',
        country: 'ca',
      }),
    ).toThrow(/adults only/);
    const broke = runCheat(adult(2), 'money.set', { amount: 0 }).state;
    expect(() => act(broke, { type: 'emigrate', country: 'ca' })).toThrow(/moving costs/);
    const probation = { ...adult(3), legal: { ...adult(3).legal, probation: 2 } };
    expect(() => act(probation, { type: 'emigrate', country: 'ca' })).toThrow(/probation/);
    const record = clone(adult(4));
    record.legal.record.push({
      crimeId: 'fraud',
      year: record.year - 1,
      age: 29,
      verdict: 'convicted',
      sentenceYears: 4,
      juvenile: false,
    });
    expect(() => act(record, { type: 'emigrate', country: 'ca' })).toThrow(/record/);
  });

  it('converts the currency, costs money, ends the job, strains friendships, and brings the household', () => {
    let s = runCheat(runCheat(adult(5), 'job.set', { job: 'accountant' }).state, 'npc.spawn', {
      role: 'spouse',
    }).state;
    s = runCheat(s, 'npc.spawn', { role: 'friend' }).state;
    const friend = s.npcs.at(-1);
    const nwUsd = netWorth(s);
    const moved = act(s, { type: 'emigrate', country: 'jp', city: 'Kobe' }).state;
    expect(moved.player.country).toBe('jp');
    expect(moved.player.city).toBe('Kobe');
    expect(moved.career.jobId).toBeNull();
    const nwYen = netWorth(moved);
    expect(nwYen / nwUsd).toBeGreaterThan(100);
    expect(nwYen / nwUsd).toBeLessThan(150);
    expect(moved.npcs.find((n) => n.roles.includes('spouse'))?.country).toBe('jp');
    expect(moved.npcs.find((n) => n.id === friend?.id)?.rel).toBeLessThan(friend?.rel ?? 0);
  });

  it('a language barrier lowers happiness and interview odds until you learn it', () => {
    const s = adult(6);
    const moved = act(s, { type: 'emigrate', country: 'de' }).state;
    const job = JOB_BY_ID['retail_associate'];
    if (!job) throw new Error('job');
    expect(interviewOdds(moved, job)).toBeLessThan(interviewOdds(s, job));
    let fluent = clone(moved);
    fluent.player.languages['german'] = 80;
    expect(interviewOdds(fluent, job)).toBeGreaterThan(interviewOdds(moved, job));
    fluent = playYears(moved, 3);
    expect(fluent.player.languages['german'] ?? 0).toBeGreaterThan(0);
  });
});

describe('traits (M9.3)', () => {
  it('has 15+ traits with explicit modifiers for tooltips', () => {
    expect(TRAITS.length).toBeGreaterThanOrEqual(15);
    for (const t of TRAITS) expect(traitModifiers(t).length).toBeGreaterThan(0);
  });

  it('traits are gained and lost through events', () => {
    const effects = EVENTS.flatMap((e) => [
      ...(e.outcomes ?? []),
      ...(e.choices ?? []).flatMap((c) => c.outcomes),
    ]).flatMap((o) => o.effects);
    expect(effects.filter((x) => 'addTrait' in x).length).toBeGreaterThanOrEqual(3);
    const s = clone(newLife({ traits: ['calm', 'funny'] }, 7));
    const ctx = new Ctx(s);
    applyEffect(ctx, { addTrait: 'hot_headed' }, {}, {}, 'test');
    expect(s.player.traits).toContain('hot_headed');
    expect(s.player.traits).not.toContain('calm');
    applyEffect(ctx, { removeTrait: 'funny' }, {}, {}, 'test');
    expect(s.player.traits).not.toContain('funny');
  });
});

describe('skills and languages (M9.4)', () => {
  it('skill tooltips show the actual modifier at the current level', () => {
    const music = SKILLS.find((k) => k.id === 'instrument');
    expect(music).toBeDefined();
    if (!music) return;
    // instrument gives creative +25% at 100, so +12% at 48.
    expect(skillModifiers(music, 48)).toContain('Creative success +12% (up to +25% at 100)');
    expect(skillModifiers(music, 48).join(' ')).toMatch(/fades/);
    for (const k of SKILLS) expect(skillModifiers(k, 50).length).toBeGreaterThan(1);
  });

  it('has 6+ skills; practice has diminishing returns', () => {
    expect(SKILLS.length).toBeGreaterThanOrEqual(6);
    const gain = (start: number): number => {
      const s = runCheat(adult(8), 'skill.set', { skill: 'cooking', value: start }).state;
      return (
        (act(s, { type: 'activity', id: 'practice_skill', params: { skill: 'cooking' } }).state
          .player.skills['cooking'] ?? 0) - start
      );
    };
    expect(gain(5)).toBeGreaterThan(gain(85));
  });

  it('skills decay slowly without practice', () => {
    let s = runCheat(adult(9), 'skill.set', { skill: 'art', value: 70 }).state;
    s = playYears(s, 6);
    expect(s.player.skills['art']).toBeLessThan(70);
    expect(s.player.skills['art']).toBeGreaterThan(55);
  });

  it('skills gate jobs and lift odds; languages have fluency', () => {
    const chef = JOB_BY_ID['chef'];
    expect(chef?.req.skills?.['cooking']).toBeGreaterThan(0);
    const cook = runCheat(adult(10), 'degree.grant', { level: 'high_school' }).state;
    expect(() => act(cook, { type: 'apply_job', jobId: 'chef' })).toThrow(/cooking/);
    expect(() =>
      act(runCheat(cook, 'skill.set', { skill: 'cooking', value: 90 }).state, {
        type: 'apply_job',
        jobId: 'chef',
      }),
    ).not.toThrow();
    const s = act(adult(11), {
      type: 'activity',
      id: 'learn_language',
      params: { language: 'korean' },
    }).state;
    expect(s.player.languages['korean']).toBeGreaterThan(0);
  });
});
