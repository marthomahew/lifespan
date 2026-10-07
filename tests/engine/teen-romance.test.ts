import { describe, expect, it } from 'vitest';
import { ageUp, choose, currentPopup, newLife, runCheat, type GameState } from '../../src/engine';
import { validateEvents } from '../../scripts/content-lib';
import type { EventDef } from '../../src/engine/events/types';

const teen = (age: number, seed = 2000): GameState => {
  const s = runCheat(
    newLife({ birthYear: 2000, country: 'us', gender: 'female', attraction: 'men' }, seed),
    'age.set',
    { age },
  ).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true } };
};
const peer = (s: GameState, age: number) => {
  const t = runCheat(s, 'npc.spawn', { role: 'friend' }).state;
  const n = t.npcs.at(-1)!;
  return {
    ...t,
    pending: [],
    npcs: t.npcs.map((x) =>
      x.id === n.id ? { ...x, age, birthYear: t.year - age, gender: 'male' as const } : x,
    ),
  };
};

describe('teenage relationships', () => {
  it('only between peers 14–17, at most two years apart, and never with an adult', async () => {
    const { Ctx } = await import('../../src/engine/ctx');
    const { teenRomance, sweetheartOf } = await import('../../src/engine/systems/teen-romance');
    const tryWith = (playerAge: number, otherAge: number): boolean => {
      const s = structuredClone(peer(teen(playerAge), otherAge));
      teenRomance(new Ctx(s), 'sweetheart', s.npcs.at(-1));
      return !!sweetheartOf(s);
    };
    expect(tryWith(15, 16)).toBe(true);
    expect(tryWith(15, 18)).toBe(false);
    expect(tryWith(14, 17)).toBe(false);
    expect(tryWith(13, 14)).toBe(false);
    expect(tryWith(17, 19)).toBe(false);
  });

  it('ends gently when one turns 18 first; at 18 together it can become a real relationship', async () => {
    const { Ctx } = await import('../../src/engine/ctx');
    const { teenRomance, sweetheartOf } = await import('../../src/engine/systems/teen-romance');
    const a = structuredClone(peer(teen(16), 17));
    teenRomance(new Ctx(a), 'sweetheart', a.npcs.at(-1));
    const older = ageUp(a).state;
    expect(sweetheartOf(older)).toBeUndefined();
    const b = structuredClone(peer(teen(17), 17));
    teenRomance(new Ctx(b), 'sweetheart', b.npcs.at(-1));
    let t = ageUp(b).state;
    for (let k = 0; k < 10 && t.pending.length && currentPopup(t)?.eventId !== 'tr_eighteen'; k++)
      t = choose(t, currentPopup(t)!.choices.find((c) => c.enabled)!.id).state;
    expect(currentPopup(t)?.eventId).toBe('tr_eighteen');
    const together = choose(t, 'together').state;
    const n = together.npcs.find((x) => x.id === b.npcs.at(-1)!.id);
    expect(n?.roles).toContain('partner');
    expect(n?.roles).not.toContain('sweetheart');
  });

  it('the content check keeps sweetheart events for teens and binds only teens', () => {
    const bad: EventDef = {
      id: 'bad_sweet',
      kind: 'notice',
      category: 'social',
      ages: [14, 30],
      weight: 1,
      bind: { x: { role: 'friend', minAge: 14 } },
      text: 'Something happens with {x.first}.',
      outcomes: [{ chance: 1, text: 'It does.', effects: [{ status: 'sweetheart', with: 'x' }] }],
    };
    const msgs = validateEvents([bad])
      .map((f) => f.msg)
      .join('\n');
    expect(msgs).toMatch(/teen social events/);
    expect(msgs).toMatch(/needs ages 14–17/);
  });
});
