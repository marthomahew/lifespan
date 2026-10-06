import { describe, expect, it } from 'vitest';
import { newLife, runCheat } from '../../../src/engine';
import { playYears } from '../../helpers';

const base = newLife({ traits: ['bookish', 'calm'] }, 10);

describe('character cheats', () => {
  it("'stat.set' sets visible and hidden stats", () => {
    expect(runCheat(base, 'stat.set', { stat: 'health', value: 7 }).state.player.stats.health).toBe(
      7,
    );
    expect(
      runCheat(base, 'stat.set', { stat: 'stress', value: 99 }).state.player.stats.stress,
    ).toBe(99);
  });

  it("'stat.lock' and 'stat.unlock' pin and release a stat", () => {
    const locked = runCheat(base, 'stat.lock', { stat: 'happiness', value: 3 }).state;
    expect(playYears(locked, 15).player.stats.happiness).toBe(3);
    const unlocked = runCheat(locked, 'stat.unlock', { stat: 'happiness' }).state;
    expect(unlocked.cheats.locks.happiness).toBeUndefined();
    expect(playYears(unlocked, 15).player.stats.happiness).not.toBe(3);
  });

  it("'rename' changes both names", () => {
    const s = runCheat(base, 'rename', { first: 'Ada', last: 'Lovelace' }).state;
    expect([s.player.first, s.player.last]).toEqual(['Ada', 'Lovelace']);
  });

  it("'gender', 'attraction' and 'appearance' update the character", () => {
    expect(runCheat(base, 'gender', { gender: 'nonbinary' }).state.player.gender).toBe('nonbinary');
    expect(runCheat(base, 'attraction', { attraction: 'everyone' }).state.player.attraction).toBe(
      'everyone',
    );
    expect(runCheat(base, 'appearance', { tone: '5' }).state.player.appearance).toBe('🏿');
  });

  it("'trait.add' and 'trait.remove' respect exclusions", () => {
    const s = runCheat(base, 'trait.add', { trait: 'hot_headed' }).state;
    expect(s.player.traits).toContain('hot_headed');
    expect(s.player.traits).not.toContain('calm');
    expect(runCheat(s, 'trait.remove', { trait: 'bookish' }).state.player.traits).not.toContain(
      'bookish',
    );
  });

  it("'skill.set' and 'language.set' set levels", () => {
    expect(
      runCheat(base, 'skill.set', { skill: 'instrument', value: 80 }).state.player.skills[
        'instrument'
      ],
    ).toBe(80);
    expect(
      runCheat(base, 'language.set', { language: 'japanese', value: 90 }).state.player.languages[
        'japanese'
      ],
    ).toBe(90);
  });

  it("'grade.set' sets the school average", () => {
    expect(runCheat(base, 'grade.set', { value: 85 }).state.education.grade).toBe(85);
  });

  it("'fame.set', 'notoriety.set' and 'karma.set' set hidden stats", () => {
    expect(runCheat(base, 'fame.set', { value: 60 }).state.player.stats.fame).toBe(60);
    expect(runCheat(base, 'notoriety.set', { value: 40 }).state.player.stats.notoriety).toBe(40);
    expect(runCheat(base, 'karma.set', { value: 2 }).state.player.stats.karma).toBe(2);
  });
});
