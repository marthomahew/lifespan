import { describe, expect, it } from 'vitest';
import { act, newLife, runCheat, type GameState } from '../../src/engine';
import { npcLook } from '../../src/engine/look';
import { dateCandidates } from '../../src/engine/systems/dating';

const single = (seed: number): GameState => {
  const s = runCheat(
    newLife({ birthYear: 1990, attraction: 'women', country: 'us' }, seed),
    'age.set',
    {
      age: 27,
    },
  ).state;
  return { ...s, pending: [], cheats: { ...s.cheats, forceSuccess: true } };
};

describe('dating: choosing who to ask out', () => {
  it('offers three people who fit your attraction, the same ones until you go', () => {
    const s = single(40);
    const c = dateCandidates(s, 'find_date');
    expect(c).toHaveLength(3);
    expect(c.every((x) => x.gender === 'female' && x.age >= 18)).toBe(true);
    expect(dateCandidates(s, 'find_date')).toEqual(c);
    expect(new Set(c.map((x) => x.first)).size).toBe(3);
  });

  it('the one you pick is who you start seeing, with the stance on children the card showed', () => {
    const s = single(41);
    const c = dateCandidates(s, 'find_date');
    const pick = c[1];
    if (!pick) throw new Error('no candidates');
    const after = act(s, { type: 'activity', id: 'find_date', params: { pick: 1 } }).state;
    const partner = after.npcs.find((n) => n.roles.includes('partner') && n.alive);
    expect(partner?.first).toBe(pick.first);
    expect(partner?.flags.includes('no_kids')).toBe(!pick.wantsKids);
    // The face on the card is the face you get.
    if (partner) expect(partner.lookSeed).toBe(pick.lookSeed);
    expect(npcLook(after, partner ?? after.npcs[0]!)).toBeDefined();
    expect(() => act(s, { type: 'activity', id: 'find_date', params: { pick: 7 } })).toThrow(
      /pick/,
    );
  });
});
