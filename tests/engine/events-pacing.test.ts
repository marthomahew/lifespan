import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/content/events', async () => {
  const { FIXTURE_EVENTS } = await import('./fixtures/events');
  return {
    EVENTS: FIXTURE_EVENTS,
    EVENT_BY_ID: Object.fromEntries(FIXTURE_EVENTS.map((e) => [e.id, e])),
  };
});

const { ageUp, choose, currentPopup, newLife, runCheat } = await import('../../src/engine');
const { eligibility, eventWeight } = await import('../../src/engine/events/select');
const { EVENT_BY_ID } = await import('../../src/content/events');
type GameState = import('../../src/engine').GameState;

function live(seed: number, popups = 3): GameState {
  const s = newLife({ country: 'us', birthYear: 1990, popupsPerYear: popups }, seed);
  return { ...s, cheats: { ...s.cheats, immortal: true } };
}

/** Age up, recording what the year produced, then answer every popup. */
function year(s: GameState): { s: GameState; popups: string[]; notices: number } {
  const before = s.log.length;
  const step = ageUp(s);
  let cur = step.state;
  const popups = cur.pending.map((p) => p.eventId);
  const notices = cur.log.slice(before).filter((l) => l.cat !== 'system').length;
  for (let p = currentPopup(cur); p; p = currentPopup(cur))
    cur = choose(cur, p.choices.find((c) => c.enabled)?.id ?? '').state;
  return { s: cur, popups, notices };
}

describe('selection and pacing (M4.2)', () => {
  for (const cap of [1, 3, 5]) {
    it(`never exceeds the popup cap of ${cap}`, () => {
      let s = live(cap, cap);
      let max = 0;
      for (let i = 0; i < 80; i++) {
        const r = year(s);
        max = Math.max(max, r.popups.length);
        expect(r.popups.length).toBeLessThanOrEqual(cap);
        s = r.s;
      }
      expect(max).toBe(cap);
    });
  }

  it('caps notices at 6 a year and they do not count toward the popup cap', () => {
    let s = live(2);
    let sawNotice = false;
    for (let i = 0; i < 80; i++) {
      const r = year(s);
      expect(r.s.events.noticesThisYear).toBeLessThanOrEqual(6);
      if (r.s.events.noticesThisYear > 0) sawNotice = true;
      s = r.s;
    }
    expect(sawNotice).toBe(true);
  });

  it('respects cooldowns and never repeats one-time events', () => {
    let s = live(4);
    const fired: Record<string, number[]> = {};
    for (let i = 0; i < 100; i++) {
      const r = year(s);
      for (const id of r.popups) (fired[id] ??= []).push(r.s.year);
      s = r.s;
    }
    expect(fired['fx_once']?.length ?? 0).toBeLessThanOrEqual(1);
    const cd = fired['fx_cooldown5'] ?? [];
    expect(cd.length).toBeGreaterThan(1);
    for (let i = 1; i < cd.length; i++)
      expect((cd[i] ?? 0) - (cd[i - 1] ?? 0)).toBeGreaterThanOrEqual(5);
    expect(s.events.counts['fx_once']).toBeLessThanOrEqual(1);
  });

  it('weights by traits, flags, and a category cooldown factor', () => {
    const s = live(5);
    const def = EVENT_BY_ID['fx_social'];
    if (!def) throw new Error('fixture');
    const base = eventWeight(
      { ...s, player: { ...s.player, traits: [] }, events: { ...s.events, categoryLast: {} } },
      def,
    );
    const charming = eventWeight(
      {
        ...s,
        player: { ...s.player, traits: ['charming'] },
        events: { ...s.events, categoryLast: {} },
      },
      def,
    );
    expect(charming).toBeCloseTo(base * 1.2, 6);
    const flagged = eventWeight(
      {
        ...s,
        player: { ...s.player, traits: [], flags: ['popular'] },
        events: { ...s.events, categoryLast: {} },
      },
      def,
    );
    expect(flagged).toBeCloseTo(base * 3, 6);
    const recent = eventWeight(
      {
        ...s,
        player: { ...s.player, traits: [] },
        events: { ...s.events, categoryLast: { social: s.year } },
      },
      def,
    );
    expect(recent).toBeLessThan(base);
  });

  it('never binds dead NPCs and explains ineligibility', () => {
    const s = live(6);
    const def = EVENT_BY_ID['fx_mother'];
    if (!def) throw new Error('fixture');
    expect(eligibility(s, def).ok).toBe(true);
    const dead = {
      ...s,
      npcs: s.npcs.map((n) => (n.roles.includes('mother') ? { ...n, alive: false } : n)),
    };
    const e = eligibility(dead, def);
    expect(e.ok).toBe(false);
    expect(e.reason).toMatch(/nobody fits \{mother\}/);
  });

  it('keeps adults-only events away from minors', () => {
    const s = live(7);
    const def = EVENT_BY_ID['fx_romance'];
    if (!def) throw new Error('fixture');
    expect(eligibility(s, def).reason).toBe('adults only');
    const grown = runCheat(s, 'age.set', { age: 25 }).state;
    expect(eligibility(grown, def).ok).toBe(true);
  });

  it('hides a choice whose requirement fails and skips events with none left', () => {
    const s = live(8);
    const def = EVENT_BY_ID['fx_costly'];
    if (!def) throw new Error('fixture');
    expect(eligibility(s, def).ok).toBe(false);
    const rich = { ...s, money: { ...s.money, cash: 1e9 } };
    expect(eligibility(rich, def).ok).toBe(true);
  });
});
