import { describe, expect, it } from 'vitest';
import { act, avatarEmoji, newLife, runCheat, type GameState } from '../../src/engine';
import { migrate } from '../../src/engine/save';
import { HAIR_STYLES } from '../../src/engine/avatar';

describe('character customization', () => {
  it('hair shows on teen and adult avatars, with the skin tone, and not on babies', () => {
    expect(avatarEmoji(30, 'female', '🏽', false, 'red')).toBe('👩🏽‍🦰');
    expect(avatarEmoji(30, 'male', '', false, 'blond')).toBe('👱‍♂️');
    expect(avatarEmoji(30, 'nonbinary', '🏿', false, 'curly')).toBe('🧑🏿‍🦱');
    expect(avatarEmoji(20, 'male', '', false, 'bald')).toBe('👨‍🦲');
    expect(avatarEmoji(1, 'female', '', false, 'red')).toBe('👶');
    expect(avatarEmoji(70, 'female', '', false, 'red')).toBe('👵');
    expect(avatarEmoji(30, 'female', '', false, 'default')).toBe('👩');
    expect(HAIR_STYLES.length).toBeGreaterThanOrEqual(6);
  });

  it('family background: parents together or apart, a single parent, and a chosen number of siblings', () => {
    const together = newLife({ parents: 'together', siblings: 3 }, 5);
    const parents = together.npcs.filter(
      (n) => n.roles.includes('mother') || n.roles.includes('father'),
    );
    expect(parents.every((n) => !n.flags.includes('parents_split'))).toBe(true);
    expect(together.npcs.filter((n) => n.roles.includes('sibling'))).toHaveLength(3);
    const solo = newLife({ parents: 'mother', siblings: 0 }, 5);
    const dad = solo.npcs.find((n) => n.roles.includes('father'));
    const mum = solo.npcs.find((n) => n.roles.includes('mother'));
    expect(dad?.flags).toContain('absent_parent');
    expect(dad?.flags).toContain('parents_split');
    expect((dad?.rel ?? 100) < (mum?.rel ?? 0)).toBe(true);
    expect(solo.npcs.filter((n) => n.roles.includes('sibling'))).toHaveLength(0);
    expect(solo.log[0]?.text).toMatch(/raised by your mother/);
    const apart = newLife({ parents: 'apart' }, 5);
    expect(apart.npcs.find((n) => n.roles.includes('father'))?.flags).toContain('parents_split');
  });

  it('a starting talent begins higher and grows faster with practice', () => {
    const gifted = newLife({ talent: 'instrument', birthYear: 2000 }, 6);
    expect(gifted.player.talent).toBe('instrument');
    expect(gifted.player.skills['instrument']).toBeGreaterThan(0);
    const plain = { ...newLife({ birthYear: 2000 }, 6) };
    const practise = (s: GameState): number => {
      let t = runCheat(s, 'age.set', { age: 12 }).state;
      t = { ...t, pending: [], player: { ...t.player, skills: { instrument: 20 } } };
      const after = act(t, {
        type: 'activity',
        id: 'practice_skill',
        params: { skill: 'instrument' },
      }).state;
      return (after.player.skills['instrument'] ?? 0) - 20;
    };
    expect(practise(gifted)).toBeGreaterThan(practise(plain));
  });

  it('a new look and a new name, during life', () => {
    let s = runCheat(newLife({ birthYear: 1990, first: 'Ada', last: 'Byrne' }, 7), 'age.set', {
      age: 30,
    }).state;
    s = runCheat({ ...s, pending: [] }, 'money.add', { amount: 5000 }).state;
    s = act(s, { type: 'activity', id: 'new_look', params: { hair: 'curly' } }).state;
    expect(s.player.hair).toBe('curly');
    s = act(s, {
      type: 'activity',
      id: 'change_name',
      params: { first: 'Adeline', last: 'Byrne-Okafor' },
    }).state;
    expect(s.player.first).toBe('Adeline');
    expect(s.player.last).toBe('Byrne-Okafor');
    expect(() =>
      act(s, { type: 'activity', id: 'change_name', params: { first: '  ', last: '' } }),
    ).toThrow();
  });

  it('old saves load with default hair and no talent', () => {
    const s = newLife({}, 8);
    const raw = JSON.parse(JSON.stringify(s)) as Record<string, unknown> & {
      player: Record<string, unknown>;
    };
    delete raw.player['hair'];
    delete raw.player['talent'];
    raw['schemaVersion'] = 3;
    const up = migrate(raw) as unknown as GameState;
    expect(up.player.hair).toBe('default');
    expect(up.player.talent).toBeNull();
  });
});
