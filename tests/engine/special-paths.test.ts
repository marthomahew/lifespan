import { describe, expect, it } from 'vitest';
import { ageUp, choose, currentPopup, newLife, runCheat, type GameState } from '../../src/engine';
import { SPECIAL_PATHS } from '../../src/content/special-paths';
import { EVENT_BY_ID } from '../../src/content/events';

const base = (seed: number, age: number): GameState => {
  const s = runCheat(newLife({ birthYear: 1980, country: 'us' }, seed), 'age.set', { age }).state;
  return {
    ...s,
    pending: [],
    cheats: { ...s.cheats, immortal: true, noBadEvents: true, forceSuccess: true },
  };
};
/** Age up until a special path's opening event arrives (or give up). */
function until(s: GameState, id: string, years = 8): GameState {
  let t = s;
  for (let y = 0; y < years; y++) {
    t = ageUp({ ...t, pending: [] }).state;
    for (let k = 0; k < 10 && t.pending.length; k++) {
      const p = currentPopup(t);
      if (!p || p.eventId === id) return t;
      const c = p.choices.find((x) => x.enabled)?.id;
      if (!c) break;
      t = choose(t, c).state;
    }
  }
  return t;
}

describe('special careers find you', () => {
  it('every path has its opening event', () => {
    for (const p of SPECIAL_PATHS) expect(EVENT_BY_ID[p.event], p.id).toBeDefined();
  });

  it('a pilot with a physics degree is asked to train as an astronaut, and can become one', () => {
    let s = runCheat(base(1800, 30), 'job.set', { job: 'airline_pilot' }).state;
    s = {
      ...s,
      pending: [],
      career: { ...s.career, level: 1 },
      education: {
        ...s.education,
        degrees: [
          ...s.education.degrees,
          { level: 'bachelor', field: 'physics', gpa: 3.6, year: 2002 },
        ],
      },
      player: { ...s.player, stats: { ...s.player.stats, health: 90, smarts: 85 } },
    };
    const t = until(s, 'sp_astronaut_invite');
    expect(currentPopup(t)?.eventId).toBe('sp_astronaut_invite');
    const first = currentPopup(t)?.choices.find((c) => c.enabled)?.id ?? '';
    const after = choose(t, first).state;
    expect(after.career.jobId).toBe('astronaut');
  });

  it('an ordinary office life is never asked', () => {
    let s = runCheat(base(1801, 30), 'job.set', { job: 'accountant' }).state;
    s = { ...s, pending: [] };
    for (let y = 0; y < 10; y++) s = until(s, 'none', 1);
    expect(s.player.flags.some((f) => f === 'sp:astronaut' || f === 'sp:spy')).toBe(false);
  });
});
