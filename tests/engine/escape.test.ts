import { describe, expect, it } from 'vitest';
import { act, newLife, runCheat, type GameState } from '../../src/engine';
import { escapeMap, simulate, solve, type Dir } from '../../src/engine/systems/escape';

const jailed = (seed: number): GameState => {
  const s = runCheat(newLife({ birthYear: 1980 }, seed), 'age.set', { age: 30 }).state;
  return {
    ...s,
    pending: [],
    legal: {
      ...s.legal,
      prison: { years: 10, served: 1, crimeId: 'armed_robbery', behaviour: 50 },
    },
  };
};

describe('the escape mini-game', () => {
  it('every yard has a way out, and the same life and year give the same yard', () => {
    for (let seed = 1; seed <= 15; seed++) {
      const s = jailed(seed);
      const map = escapeMap(s);
      expect(map).toEqual(escapeMap(s));
      const route = solve(map);
      expect(route, `seed ${seed}`).not.toBeNull();
      expect(simulate(map, route ?? []).status).toBe('escaped');
      expect(map.guards.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('guards see ahead of them; walking into one is getting caught; dawn ends the night', () => {
    const map = escapeMap(jailed(3));
    const g = map.guards[0] ?? [];
    // Walk to the first guard's cell the slow way: keep stepping towards it.
    const moves: Dir[] = [];
    let st = simulate(map, moves);
    for (let i = 0; i < 40 && st.status === 'running'; i++) {
      const target = g[0] ?? map.exit;
      const dx = target[0] - st.pos[0];
      const dy = target[1] - st.pos[1];
      moves.push(dx > 0 ? 'R' : dx < 0 ? 'L' : dy > 0 ? 'D' : dy < 0 ? 'U' : 'W');
      st = simulate(map, moves);
    }
    expect(['caught', 'dawn']).toContain(st.status);
    expect(simulate(map, Array<Dir>(map.maxTurns).fill('W')).status).not.toBe('escaped');
  });

  it('a planned route decides the outcome: out as a fugitive, caught with more time, or back to bed', () => {
    const s = jailed(5);
    const route = solve(escapeMap(s)) ?? [];
    const free = act(s, {
      type: 'activity',
      id: 'prison_escape',
      params: { moves: route.join('') },
    }).state;
    expect(free.legal.prison).toBeNull();
    expect(free.player.flags).toContain('fugitive');

    const map = escapeMap(s);
    const g0 = map.guards[0]?.[0] ?? [4, 3];
    // Straight into a guard's patch: caught, two more years.
    const bad: Dir[] = [];
    let st = simulate(map, bad);
    while (st.status === 'running' && bad.length < 40) {
      bad.push(st.pos[0] < g0[0] ? 'R' : st.pos[1] < g0[1] ? 'D' : st.pos[1] > g0[1] ? 'U' : 'W');
      st = simulate(map, bad);
    }
    const after = act(s, {
      type: 'activity',
      id: 'prison_escape',
      params: { moves: bad.join('') },
    }).state;
    if (st.status === 'caught') expect(after.legal.prison?.years).toBe(12);
    const bed = act(s, { type: 'activity', id: 'prison_escape', params: { moves: '' } }).state;
    expect(bed.legal.prison?.years).toBe(10);
    expect(() =>
      act(s, { type: 'activity', id: 'prison_escape', params: { moves: 'XYZ' } }),
    ).toThrow();
  });
});

describe('on the run', () => {
  const escaped = (seed: number): GameState => {
    const s = jailed(seed);
    const route = solve(escapeMap(s)) ?? [];
    return act(s, { type: 'activity', id: 'prison_escape', params: { moves: route.join('') } })
      .state;
  };

  it('an escape leaves years owed, no papers for a job, and none of the release events', async () => {
    const s = escaped(21);
    expect(s.legal.fugitive?.owed).toBe(10 - 1 + 3);
    const { jobListings } = await import('../../src/engine');
    const listing = jobListings(s).find((l) => l.unmet.length > 0);
    expect(listing?.unmet.join(' ')).toMatch(/on the run/);
    const { exCon } = await import('../../src/content/events/conditions');
    expect(exCon(s)).toBe(false);
    expect(s.log.some((l) => /plastic bag of belongings/.test(l.text))).toBe(false);
  });

  it('turning yourself in takes two years off; otherwise the knock comes, or the file goes cold', async () => {
    const { ageUp } = await import('../../src/engine');
    const s = escaped(22);
    const owed = s.legal.fugitive?.owed ?? 0;
    const back = act(s, { type: 'activity', id: 'turn_yourself_in' }).state;
    expect(back.legal.prison?.years).toBe(owed - 2);
    expect(back.legal.fugitive).toBeNull();
    expect(back.player.flags).not.toContain('fugitive');

    let t = s;
    for (let i = 0; i < 25 && t.legal.fugitive; i++)
      t = ageUp({ ...t, pending: [], cheats: { ...t.cheats, immortal: true } }).state;
    expect(t.legal.fugitive ?? null).toBeNull();
    expect(t.legal.prison !== null || t.log.some((l) => /Nobody is looking/.test(l.text))).toBe(
      true,
    );
  });
});

describe('achievements for the new games', () => {
  it('escaping earns Over the Fence; a natural earns Twenty-One', async () => {
    const s = jailed(23);
    const route = solve(escapeMap(s)) ?? [];
    const out = act(s, {
      type: 'activity',
      id: 'prison_escape',
      params: { moves: route.join('') },
    }).state;
    expect(out.player.achievements).toContain('great_escape');
    const { shoeFor, playSession, betOptions } = await import('../../src/engine/systems/blackjack');
    const { money } = await import('../../src/engine/economy');
    // Find a visit whose first hand is a natural, then cash out.
    let t = runCheat(newLife({ country: 'us', birthYear: 1980 }, 24), 'age.set', { age: 30 }).state;
    t = runCheat({ ...t, pending: [] }, 'money.add', { amount: 100000 }).state;
    for (let year = 0; year < 40; year++) {
      const shoe = shoeFor(t);
      if (playSession(shoe, '').hands[0]?.status === 'blackjack') {
        const bet = betOptions(t, (r) => money(t, r))[0] ?? 0;
        const after = act(t, { type: 'activity', id: 'casino', params: { plan: '', bet } }).state;
        expect(after.player.achievements).toContain('natural');
        return;
      }
      t = { ...t, year: t.year + 1 };
    }
  });
});

describe('no papers', () => {
  it('a fugitive can’t sign on for benefits or be hired into a proper job', async () => {
    const { unemploymentBenefit } = await import('../../src/engine/systems/careers');
    const s = jailed(25);
    const route = solve(escapeMap(s)) ?? [];
    const out = act(s, {
      type: 'activity',
      id: 'prison_escape',
      params: { moves: route.join('') },
    }).state;
    expect(unemploymentBenefit(out)).toBe(0);
    const { Ctx } = await import('../../src/engine/ctx');
    const { hire } = await import('../../src/engine/systems/careers');
    const ctx = new Ctx(structuredClone(out));
    hire(ctx, 'accountant');
    expect(ctx.s.career.jobId).toBeNull();
    // The cheat menu still overrides everything.
    expect(
      runCheat({ ...out, pending: [] }, 'job.set', { job: 'accountant' }).state.career.jobId,
    ).toBe('accountant');
  });
});
