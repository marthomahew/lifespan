import { describe, expect, it } from 'vitest';
import {
  act,
  ageUp,
  choose,
  currentPopup,
  newLife,
  runCheat,
  type GameState,
} from '../../src/engine';
import type { NewLifeOptions } from '../../src/engine/life';

const child = (seed: number, age: number, opts: NewLifeOptions = {}): GameState => {
  const s = runCheat(newLife({ birthYear: 2000, country: 'us', ...opts }, seed), 'age.set', {
    age,
  }).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true, noBadEvents: true } };
};
/** Age up, answering prodigy popups with `pick` and the rest with their first choice. */
function grow(
  s: GameState,
  n: number,
  pick: Record<string, string> = {},
): { s: GameState; seen: string[] } {
  let t = s;
  const seen: string[] = [];
  for (let i = 0; i < n; i++) {
    t = ageUp({ ...t, pending: [] }).state;
    for (let k = 0; k < 10 && t.pending.length; k++) {
      const p = currentPopup(t);
      if (!p) break;
      if (p.eventId.startsWith('pr_')) seen.push(p.eventId);
      const id = pick[p.eventId] ?? p.choices.find((c) => c.enabled)?.id;
      if (!id) break;
      t = choose(t, id).state;
    }
    for (const l of t.log.filter(
      (x) => x.year === t.year && /^(At the library|The federation|A third)/.test(x.text),
    ))
      if (!seen.includes(l.text)) seen.push(l.text.slice(0, 20));
  }
  return { s: { ...t, pending: [] }, seen };
}

describe('child prodigies', () => {
  it('a chess prodigy with a focus climbs from the library club to grandmaster', () => {
    let s = child(900, 5, { talent: 'chess', talentLevel: 'prodigy' });
    s = act(s, { type: 'focus', target: 'chess' }).state;
    const { s: out, seen } = grow(s, 14, { pr_chess_junior: 'enter', pr_chess_master: 'train' });
    expect(out.player.flags).toContain('pm:chess_club');
    expect(seen).toContain('pr_chess_junior');
    expect(seen).toContain('pr_chess_master');
    expect(out.player.flags).toContain('chess_gm');
    expect(out.player.achievements.includes('grandmaster')).toBe(true);
    expect(out.player.achievements.includes('wunderkind')).toBe(true);
  });

  it('a music prodigy is offered the conservatory, an orchestra debut, and a premiere', () => {
    let s = child(901, 4, { talent: 'instrument', talentLevel: 'prodigy' });
    s = act(s, { type: 'focus', target: 'instrument' }).state;
    const { s: out, seen } = grow(s, 14, {
      pr_music_conservatory: 'audition',
      pr_music_debut: 'play',
      pr_burnout: 'break',
    });
    expect(out.player.flags).toContain('pm:music_recital');
    expect(seen).toContain('pr_music_conservatory');
    expect(seen).toContain('pr_music_debut');
    expect(out.player.flags).toContain('pm:music_composer');
    expect(out.player.flags).toContain('young_composer');
  });

  it('an ordinary childhood stays ordinary: no prodigy stories without the practice', () => {
    for (const seed of [902, 903, 904]) {
      const { s } = grow(child(seed, 4), 14);
      expect(s.player.flags.some((f) => f.startsWith('pm:'))).toBe(false);
    }
  });

  it('giving it up ends the focus; chess tournaments pay by strength', () => {
    let s = child(905, 12, { talent: 'chess', talentLevel: 'prodigy' });
    s = {
      ...s,
      player: { ...s.player, flags: [...s.player.flags, 'prodigy_noticed'], focus: 'chess' },
    };
    s = runCheat(s, 'event.fire', { event: 'pr_burnout', force: 'on' }).state;
    expect(choose(s, 'quit').state.player.focus).toBeNull();
    let pro = runCheat(child(906, 30), 'skill.set', { skill: 'chess', value: 90 }).state;
    pro = { ...pro, pending: [], cheats: { ...pro.cheats, forceSuccess: true } };
    const cash = pro.money.cash;
    const after = act(pro, { type: 'activity', id: 'chess_tournament' }).state;
    expect(after.money.cash).toBeGreaterThan(cash);
    expect(() => act(child(907, 30), { type: 'activity', id: 'chess_tournament' })).toThrow(
      /chess 15/,
    );
  });
});
