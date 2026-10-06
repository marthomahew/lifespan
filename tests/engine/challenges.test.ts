import { describe, expect, it } from 'vitest';
import {
  ageUp,
  continueAsChild,
  heirOptions,
  newLife,
  obituary,
  runCheat,
  type GameState,
} from '../../src/engine';
import { CHALLENGES } from '../../src/content/challenges';
import { challengeOptions } from '../../src/engine/systems/challenge';
import { migrate } from '../../src/engine/save';
import { clone } from '../../src/engine/util';

const start = (id: string, seed = 3): GameState => newLife(challengeOptions(id), seed);

describe('challenges', () => {
  it('a catalogue of distinct challenges, each starting with its setup', () => {
    expect(CHALLENGES.length).toBeGreaterThanOrEqual(10);
    expect(new Set(CHALLENGES.map((c) => c.id)).size).toBe(CHALLENGES.length);
    const s = start('rags_to_riches');
    expect(s.player.wealth).toBe('poor');
    expect(s.challenge).toEqual({ id: 'rags_to_riches', status: 'active', year: s.year });
    expect(s.npcs.find((n) => n.roles.includes('father'))?.flags).toContain('absent_parent');
    // The player's own picks fill what the challenge leaves open.
    expect(newLife(challengeOptions('centenarian', { first: 'Ilse' }), 4).player.first).toBe(
      'Ilse',
    );
  });

  it('won when the goal is met, announced once', () => {
    let s = runCheat(start('rags_to_riches'), 'age.set', { age: 30 }).state;
    s = runCheat({ ...s, pending: [] }, 'money.add', { amount: 2_000_000 }).state;
    const step = ageUp({ ...s, pending: [] });
    expect(step.state.challenge?.status).toBe('won');
    expect(step.toasts.some((t) => /Challenge complete/.test(t.text))).toBe(true);
    const later = ageUp({ ...step.state, pending: [] }).state;
    expect(later.log.filter((e) => /Challenge complete/.test(e.text))).toHaveLength(1);
  });

  it('missed when the deadline passes, or when the life ends first', () => {
    const s = runCheat(start('polyglot'), 'age.set', { age: 50 }).state;
    const after = ageUp({ ...s, pending: [], cheats: { ...s.cheats, immortal: true } }).state;
    expect(after.challenge?.status).toBe('lost');
    const dead = runCheat(start('centenarian'), 'deathbot', {}).state;
    expect(dead.challenge?.status).toBe('lost');
    expect(
      obituary(dead)?.summary.some((l) => /One Hundred Candles challenge, and fell short/.test(l)),
    ).toBe(true);
  });

  it('a family challenge passes to the heir and is won in the third generation', () => {
    let s = clone(runCheat(start('dynasty', 5), 'age.set', { age: 40 }).state);
    s = runCheat({ ...s, pending: [] }, 'baby.now', {}).state;
    s = runCheat({ ...s, pending: [] }, 'deathbot', {}).state;
    expect(s.challenge?.status).toBe('active');
    const heir = heirOptions(s)[0];
    if (!heir) throw new Error('no heir');
    let g2 = continueAsChild(s, heir.id);
    expect(g2.challenge?.status).toBe('active');
    // The heir may already be past 40 if their parent lived long.
    if (g2.player.age < 40) g2 = runCheat({ ...g2, pending: [] }, 'age.set', { age: 40 }).state;
    g2 = runCheat({ ...g2, pending: [] }, 'baby.now', {}).state;
    g2 = runCheat({ ...g2, pending: [] }, 'deathbot', {}).state;
    const heir2 = heirOptions(g2)[0];
    if (!heir2) throw new Error('no heir');
    const g3 = continueAsChild(g2, heir2.id);
    expect(ageUp({ ...g3, pending: [] }).state.challenge?.status).toBe('won');
  });

  it('old saves load without a challenge', () => {
    const raw = JSON.parse(JSON.stringify(newLife({}, 9))) as Record<string, unknown>;
    delete raw['challenge'];
    raw['schemaVersion'] = 4;
    expect((migrate(raw) as unknown as GameState).challenge).toBeNull();
  });
});
