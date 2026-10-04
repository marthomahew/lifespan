import { describe, expect, it } from 'vitest';
import { EVENTS } from '../../src/content/events';
import {
  countChains,
  eventStage,
  validateCountries,
  validateEvents,
} from '../../scripts/content-lib';
import type { EventDef } from '../../src/engine/events/types';

const ok = (id: string, over: Partial<EventDef> = {}): EventDef => ({
  id,
  kind: 'choice',
  category: 'random',
  ages: [20, 30],
  weight: 5,
  text: `A perfectly ordinary thing happens for ${id}.`,
  choices: [
    {
      id: 'a',
      label: 'Do it',
      outcomes: [{ chance: 1, text: `You did it for ${id}.`, effects: [] }],
    },
    {
      id: 'b',
      label: "Don't",
      outcomes: [{ chance: 1, text: `You didn't for ${id}.`, effects: [] }],
    },
  ],
  ...over,
});

const msgs = (events: EventDef[]): string =>
  validateEvents(events)
    .map((f) => f.msg)
    .join('\n');

describe('content:check (M4.5)', () => {
  it('passes the shipped content', () => {
    expect(validateEvents(EVENTS)).toEqual([]);
    expect(validateCountries()).toEqual([]);
  });

  it('accepts a valid event', () => {
    expect(validateEvents([ok('fine_one')])).toEqual([]);
  });

  it('catches schema problems', () => {
    expect(msgs([ok('Bad-Id')])).toMatch(/snake_case/);
    expect(msgs([ok('dup'), ok('dup', { text: 'Another text entirely here.' })])).toMatch(
      /duplicate id/,
    );
    expect(msgs([ok('one_choice', { choices: ok('x').choices?.slice(0, 1) })])).toMatch(
      /2–4 choices/,
    );
    expect(msgs([ok('long_text', { text: 'x'.repeat(281) })])).toMatch(/max 280/);
    expect(msgs([ok('bad_cat', { category: 'nope' as never })])).toMatch(/unknown category/);
    expect(msgs([{ ...ok('notice_with_choices'), kind: 'notice' }])).toMatch(
      /notices have no choices/,
    );
  });

  it('catches unresolved tokens', () => {
    expect(msgs([ok('tok1', { text: 'Hello {mystery} there friend.' })])).toMatch(
      /unresolved token \{mystery\}/,
    );
    expect(msgs([ok('tok2', { text: 'Hello {pal.first} there friend.' })])).toMatch(
      /no binding or role named pal/,
    );
    expect(msgs([ok('tok3', { text: 'Hello {mother.shoe} there friend.' })])).toMatch(
      /unknown field shoe/,
    );
    expect(msgs([ok('tok4', { text: 'You owe {money:$amount} to someone.' })])).toMatch(
      /payload token/,
    );
    expect(
      msgs([ok('tok5', { text: '{mother.first} remembers {mother.memory} fondly.' })]),
    ).toMatch(/hasMemory/);
  });

  it('catches broken references', () => {
    const withEffect = (effects: EventDef['choices']): EventDef => ok('refs', { choices: effects });
    const one = (effect: object): EventDef['choices'] => [
      {
        id: 'a',
        label: 'Go',
        outcomes: [{ chance: 1, text: 'Something happens to you.', effects: [effect as never] }],
      },
      {
        id: 'b',
        label: 'Stay',
        outcomes: [{ chance: 1, text: 'Nothing happens to you.', effects: [] }],
      },
    ];
    expect(msgs([withEffect(one({ addTrait: 'telepathic' }))])).toMatch(/unknown trait/);
    expect(msgs([withEffect(one({ illness: 'space_flu' }))])).toMatch(/unknown illness/);
    expect(msgs([withEffect(one({ stat: 'charisma', delta: 1 }))])).toMatch(/unknown stat/);
    expect(msgs([withEffect(one({ rel: 'mother', delta: 4 }))])).toMatch(/memory line/);
    expect(msgs([withEffect(one({ schedule: 'nowhere', inYears: 2 }))])).toMatch(/unknown event/);
    expect(msgs([withEffect(one({ crime: 'jaywalking_spree' }))])).toMatch(/unknown crime/);
    const chained = ok('chained', {
      choices: [
        {
          id: 'a',
          label: 'Go',
          outcomes: [
            {
              chance: 1,
              text: 'Off you go then.',
              effects: [],
              next: { eventId: 'ghost', inYears: 0 },
            },
          ],
        },
        { id: 'b', label: 'Stay', outcomes: [{ chance: 1, text: 'You stay put.', effects: [] }] },
      ],
    });
    const m = msgs([chained]);
    expect(m).toMatch(/chain to unknown event ghost/);
    expect(m).toMatch(/at least 1 year/);
  });

  it('enforces the adults-only rule', () => {
    expect(msgs([ok('rom1', { category: 'romance' })])).toMatch(/adultsOnly/);
    expect(msgs([ok('rom2', { category: 'romance', adultsOnly: true, ages: [16, 30] })])).toMatch(
      /ages starting at 18/,
    );
    expect(
      msgs([
        ok('rom3', {
          category: 'romance',
          adultsOnly: true,
          ages: [20, 30],
          bind: { p: { role: 'friend' } },
          text: 'You and {p.first} share a look.',
        }),
      ]),
    ).toMatch(/minAge >= 18/);
    const meetKid = ok('rom4', {
      ages: [12, 15],
      choices: [
        {
          id: 'a',
          label: 'Go',
          outcomes: [{ chance: 1, text: 'A meeting happens here.', effects: [{ status: 'meet' }] }],
        },
        {
          id: 'b',
          label: 'Stay',
          outcomes: [{ chance: 1, text: 'You stay in tonight.', effects: [] }],
        },
      ],
    });
    expect(msgs([meetKid])).toMatch(/adults-only event/);
  });

  it('catches duplicate texts across events', () => {
    const a = ok('dup_a');
    const b = ok('dup_b', { text: a.text.toUpperCase() });
    expect(msgs([a, b])).toMatch(/duplicate text/);
  });

  it('counts stages by midpoint and chains by linked groups', () => {
    expect(eventStage(ok('s', { ages: [3, 9] }))).toBe('child');
    expect(eventStage(ok('s', { ages: [13, 17] }))).toBe('teen');
    expect(eventStage(ok('s', { ages: [36, 50] }))).toBe('adult');
    expect(eventStage(ok('s', { ages: [40, 60] }))).toBe('middle_age');
    expect(eventStage(ok('s', { ages: [18, 90] }))).toBeNull();
    const start = ok('c_start', {
      choices: [
        {
          id: 'a',
          label: 'Go',
          outcomes: [
            {
              chance: 1,
              text: 'Started a thing.',
              effects: [],
              next: { eventId: 'c_end', inYears: 2 },
            },
          ],
        },
        {
          id: 'b',
          label: 'Stay',
          outcomes: [{ chance: 1, text: 'Did not start it.', effects: [] }],
        },
      ],
    });
    expect(countChains([start, ok('c_end', { chainOnly: true })])).toBe(1);
  });
});

import { validateActivities, validateInteractions } from '../../scripts/content-lib';
import { INTERACTIONS } from '../../src/content/interactions';
import { ACTIVITIES } from '../../src/content/activities';

describe('interaction and activity rules (DONE §3)', () => {
  it('passes the shipped catalogs', () => {
    expect(validateInteractions(INTERACTIONS)).toEqual([]);
    expect(validateActivities(ACTIVITIES)).toEqual([]);
  });

  it('enforces adults-only romance and resolvable tokens', () => {
    const base = INTERACTIONS.find((i) => i.id === 'date_night');
    if (!base) throw new Error('date_night');
    expect(
      validateInteractions([{ ...base, minNpcAge: 16 }])
        .map((f) => f.msg)
        .join(),
    ).toMatch(/18\+/);
    expect(
      validateInteractions([{ ...base, success: { ...base.success, texts: ['Hi {pal.first}'] } }])
        .map((f) => f.msg)
        .join(),
    ).toMatch(/unresolved/);
    const act = ACTIVITIES.find((a) => a.id === 'find_date');
    if (!act) throw new Error('find_date');
    expect(
      validateActivities([{ ...act, ages: [16, 90] }])
        .map((f) => f.msg)
        .join(),
    ).toMatch(/18/);
    expect(
      validateActivities([{ ...act, outcomes: act.outcomes.slice(0, 2) }])
        .map((f) => f.msg)
        .join(),
    ).toMatch(/3 outcome/);
  });
});

import { ENFORCED, failedThresholds, thresholds } from '../../scripts/content-lib';

describe('DONE §3 thresholds (M10.1, M10.2, M10.4)', () => {
  it('every threshold is enforced and met', () => {
    const ts = thresholds(ENFORCED);
    expect(ts.filter((t) => !t.enforced).map((t) => t.label)).toEqual([]);
    expect(failedThresholds(ts)).toEqual([]);
    const byLabel = Object.fromEntries(ts.map((t) => [t.label, t.value]));
    expect(byLabel['Events in total']).toBeGreaterThanOrEqual(250);
    expect(byLabel['Event chains']).toBeGreaterThanOrEqual(15);
    expect(byLabel['Activities with 3+ outcome texts']).toBeGreaterThanOrEqual(25);
  });
});
