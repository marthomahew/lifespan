import { describe, expect, it } from 'vitest';
import { act, choose, newLife, runCheat, type GameState } from '../../src/engine';
import { playYears } from '../helpers';

const musician = (skill: number, seed = 1): GameState => {
  let s = runCheat(newLife({ country: 'us', birthYear: 1995 }, seed), 'age.set', { age: 20 }).state;
  s = runCheat(s, 'skill.set', { skill: 'instrument', value: skill }).state;
  return { ...s, cheats: { ...s.cheats, immortal: true, noBadEvents: true } };
};

describe('music and fame (M6.8)', () => {
  it('requires an instrument or vocal skill', () => {
    const s = musician(0);
    expect(() => act(s, { type: 'music', id: 'busk' })).toThrow(/instrument or voice/);
  });

  it('runs busking, open mics, gigs, an act, releases, a record deal, and tours', () => {
    let s = musician(80, 2);
    s = act(s, { type: 'music', id: 'busk' }).state;
    expect(s.music.stage).toBe(1);
    s = act(s, { type: 'music', id: 'open_mic' }).state;
    expect(s.music.stage).toBe(2);
    expect(() => act(s, { type: 'music', id: 'tour' })).toThrow(/record deal/);
    s = act(s, { type: 'music', id: 'gig' }).state;
    expect(s.music.stage).toBe(3);
    s = act(s, { type: 'music', id: 'form_band' }).state;
    expect(s.npcs.filter((n) => n.roles.includes('bandmate'))).toHaveLength(2);
    let deal = false;
    for (let i = 0; i < 6 && !deal; i++) {
      s = act(s, { type: 'music', id: 'release' }).state;
      if (s.pending.some((p) => p.eventId === 'fame_record_deal_offer')) {
        s = choose(s, 'sign').state;
        deal = true;
      } else s = playYears(s, 1);
    }
    expect(deal).toBe(true);
    expect(s.music.label).not.toBeNull();
    expect(s.music.releases.length).toBeGreaterThan(0);
    expect(s.player.stats.fame).toBeGreaterThan(0);
    const cash = s.money.cash;
    s = act(s, { type: 'music', id: 'tour' }).state;
    expect(s.money.cash).toBeGreaterThan(cash);
    expect(s.music.stage).toBe(5);
  });

  it('release quality comes from skill plus RNG', () => {
    const q = (skill: number): number => {
      let t = 0;
      for (let seed = 1; seed <= 15; seed++) {
        let s = musician(skill, seed);
        s = { ...s, music: { ...s.music, stage: 3, act: 'solo' } };
        s = act(s, { type: 'music', id: 'release' }).state;
        t += s.music.releases[0]?.quality ?? 0;
      }
      return t / 15;
    };
    expect(q(95)).toBeGreaterThan(q(20) + 30);
  });

  it('fame decays without new work', () => {
    let s = runCheat(musician(50, 3), 'fame.set', { value: 60 }).state;
    s = { ...s, music: { ...s.music, lastWork: s.year - 5 } };
    expect(playYears(s, 3).player.stats.fame).toBeLessThan(60);
  });
});
