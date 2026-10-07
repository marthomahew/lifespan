import { describe, expect, it } from 'vitest';
import { act, activitiesFor, newLife, runCheat, type GameState } from '../../src/engine';
import { crimeOdds, crimeReason } from '../../src/engine/systems/crime';

const adult = (year = 1990, seed = 2800): GameState => {
  const s = runCheat(newLife({ birthYear: year, country: 'us' }, seed), 'age.set', {
    age: 30,
  }).state;
  return { ...s, pending: [] };
};

describe('who you are shapes what you can do', () => {
  it('hacking needs programming and a world with computers; forgery needs art; a con needs a face', () => {
    const s = adult();
    expect(crimeReason(s, 'hacking')).toMatch(/programming 40/);
    const coder = runCheat(s, 'skill.set', { skill: 'programming', value: 70 }).state;
    expect(crimeReason(coder, 'hacking')).toBeNull();
    expect(
      crimeReason(
        runCheat(adult(1930), 'skill.set', { skill: 'programming', value: 70 }).state,
        'hacking',
      ),
    ).toMatch(/not until 1985/);
    expect(crimeReason(s, 'forgery')).toMatch(/art 45/);
    const plain = {
      ...s,
      player: { ...s.player, stats: { ...s.player.stats, looks: 30 }, traits: [] },
    };
    expect(crimeReason(plain, 'con')).toMatch(/looks/);
    // The better you are at it, the better your odds.
    const expert = runCheat(s, 'skill.set', { skill: 'programming', value: 95 }).state;
    expect(crimeOdds(expert, 'hacking')).toBeGreaterThan(crimeOdds(coder, 'hacking'));
  });

  it('every skill has an activity of its own', () => {
    const ids = activitiesFor(adult()).map((a) => a.id);
    for (const id of [
      'code_project',
      'art_class',
      'cooking_lessons',
      'singing_lessons',
      'instrument_lessons',
      'write_stories',
      'chess_study',
      'go_running',
    ])
      expect(ids).toContain(id);
    const s = act(runCheat(adult(), 'money.add', { amount: 5000 }).state, {
      type: 'activity',
      id: 'chess_study',
    }).state;
    expect(s.player.skills['chess'] ?? 0).toBeGreaterThan(0);
  });
});
