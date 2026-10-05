import { describe, expect, it } from 'vitest';
import { act, ageUp, newLife, obituary, runCheat, type GameState } from '../../src/engine';
import { ASPIRATIONS } from '../../src/content/aspirations';
import { migrate } from '../../src/engine/save';
import { clone } from '../../src/engine/util';

const teen = (age = 20, seed = 1): GameState => {
  const s = runCheat(newLife({ country: 'us', birthYear: 1990 }, seed), 'age.set', { age }).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true } };
};

describe('aspirations', () => {
  it('has a catalogue of distinct goals', () => {
    expect(ASPIRATIONS.length).toBeGreaterThanOrEqual(15);
    expect(new Set(ASPIRATIONS.map((a) => a.id)).size).toBe(ASPIRATIONS.length);
  });

  it('you pick up to three from 14; picking needs a real goal', () => {
    expect(() => act(teen(12), { type: 'aspiration', op: 'choose', id: 'marry' })).toThrow(/14/);
    let s = teen(20);
    for (const id of ['marry', 'doctor', 'abroad'])
      s = act(s, { type: 'aspiration', op: 'choose', id }).state;
    expect(s.player.aspirations.map((a) => a.id)).toEqual(['marry', 'doctor', 'abroad']);
    expect(() => act(s, { type: 'aspiration', op: 'choose', id: 'famous' })).toThrow(/three/);
    expect(() => act(s, { type: 'aspiration', op: 'choose', id: 'marry' })).toThrow(/already/);
    expect(() => act(teen(20), { type: 'aspiration', op: 'choose', id: 'nope' })).toThrow();
    s = act(s, { type: 'aspiration', op: 'drop', id: 'doctor' }).state;
    expect(s.player.aspirations.map((a) => a.id)).toEqual(['marry', 'abroad']);
  });

  it('reaching one is celebrated once, and the obituary remembers', () => {
    let s = act(teen(30), { type: 'aspiration', op: 'choose', id: 'abroad' }).state;
    const happy = s.player.stats.happiness;
    s = runCheat(s, 'emigrate.now', { country: 'ca' }).state;
    // Goals are checked at the end of each year and after actions, like achievements.
    const step = ageUp({ ...s, pending: [] });
    s = step.state;
    const goal = s.player.aspirations[0];
    expect(goal?.done).toBe(s.year);
    expect(step.toasts.some((t) => /Make a life abroad/.test(t.text))).toBe(true);
    expect(s.log.filter((e) => /goal reached: Make a life abroad/.test(e.text))).toHaveLength(1);
    expect(happy).toBeGreaterThan(0);
    const next = ageUp({ ...s, pending: [] }).state;
    expect(next.log.filter((e) => /goal reached: Make a life abroad/.test(e.text))).toHaveLength(1);
    // A fulfilled goal frees a slot.
    s = { ...s, pending: [] };
    for (const id of ['marry', 'doctor', 'famous'])
      s = act(s, { type: 'aspiration', op: 'choose', id }).state;
    expect(s.player.aspirations).toHaveLength(4);
    const dead = clone(runCheat(s, 'deathbot', {}).state);
    expect(
      obituary(dead)?.summary.some((l) =>
        /Fulfilled [1-4] of 4 life goals: make a life abroad/.test(l),
      ),
    ).toBe(true);
  });

  it('old saves load with no aspirations', () => {
    const s = teen(20);
    const raw = JSON.parse(JSON.stringify(s)) as Record<string, unknown> & {
      player: Record<string, unknown>;
    };
    delete raw.player['aspirations'];
    raw['schemaVersion'] = 2;
    expect((migrate(raw) as unknown as GameState).player.aspirations).toEqual([]);
  });

  it('you are told once, at 14, that goals are open', () => {
    let s = runCheat(newLife({ country: 'us', birthYear: 1990 }, 7), 'age.set', { age: 13 }).state;
    s = { ...s, pending: [], cheats: { ...s.cheats, immortal: true } };
    const a = ageUp(s).state;
    expect(a.log.filter((e) => /what you want from life/.test(e.text))).toHaveLength(1);
    const b = ageUp({ ...a, pending: [] }).state;
    expect(b.log.filter((e) => /what you want from life/.test(e.text))).toHaveLength(1);
  });
});
