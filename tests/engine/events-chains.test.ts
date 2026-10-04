import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/content/events', async () => {
  const { FIXTURE_EVENTS } = await import('./fixtures/events');
  return {
    EVENTS: FIXTURE_EVENTS,
    EVENT_BY_ID: Object.fromEntries(FIXTURE_EVENTS.map((e) => [e.id, e])),
  };
});

const { ageUp, choose, newLife, runCheat, serialize, deserialize, stateHash } =
  await import('../../src/engine');
type GameState = import('../../src/engine').GameState;

function started(): GameState {
  let s = newLife({ country: 'us', birthYear: 1990 }, 21);
  s = runCheat(s, 'age.set', { age: 30 }).state;
  s = runCheat(s, 'category.toggle', { category: 'random', on: false }).state;
  for (const c of ['world', 'family', 'social', 'money', 'romance'] as const)
    s = runCheat(s, 'category.toggle', { category: c, on: false }).state;
  s = runCheat(s, 'event.fire', { event: 'fx_chain_start', force: true }).state;
  return choose(s, 'lend').state;
}

function untilChain(s: GameState): GameState {
  let cur = s;
  for (let i = 0; i < 5; i++) {
    cur = ageUp(cur).state;
    if (cur.pending.some((p) => p.eventId === 'fx_chain_end')) return cur;
  }
  throw new Error('chain step never fired');
}

describe('chain steps (M4.4)', () => {
  it('are stored in state with the payload and bindings, and fire when due', () => {
    const s = started();
    expect(s.chains).toHaveLength(1);
    const step = s.chains[0];
    expect(step?.eventId).toBe('fx_chain_end');
    expect(step?.dueYear).toBe(s.year + 2);
    expect(step?.payload).toEqual({ amount: 3000 });
    const fired = untilChain(s);
    expect(fired.year).toBe(s.year + 2);
    expect(fired.chains).toEqual([]);
    const cash = fired.money.cash;
    const paid = choose(fired, 'take').state;
    expect(paid.money.cash - cash).toBeGreaterThan(2000);
    expect(paid.log.at(-1)?.text).toBe('You take the money.');
  });

  it('survive a save and load', () => {
    const s = started();
    const loaded = deserialize(serialize(s));
    expect(loaded.chains).toEqual(s.chains);
    expect(stateHash(untilChain(loaded))).toBe(stateHash(untilChain(s)));
  });

  it('survive a rewind', () => {
    const s = ageUp(started()).state;
    const fired = untilChain(s);
    const later = ageUp(choose(fired, 'forgive').state).state;
    expect(later.chains).toEqual([]);
    const back = runCheat(later, 'rewind', { years: 2 }).state;
    expect(back.year).toBe(s.year);
    expect(back.chains).toHaveLength(1);
    expect(back.chains[0]?.eventId).toBe('fx_chain_end');
    expect(untilChain(back).pending.some((p) => p.eventId === 'fx_chain_end')).toBe(true);
  });

  it('are skipped when a bound NPC has died', () => {
    const s = started();
    const dead = {
      ...s,
      npcs: s.npcs.map((n) => (n.roles.includes('mother') ? { ...n, alive: false } : n)),
    };
    let cur = dead;
    for (let i = 0; i < 4; i++) cur = ageUp(cur).state;
    expect(cur.pending.some((p) => p.eventId === 'fx_chain_end')).toBe(false);
  });
});
