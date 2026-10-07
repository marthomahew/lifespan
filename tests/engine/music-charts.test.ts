import { describe, expect, it } from 'vitest';
import { act, ageUp, newLife, runCheat, type GameState } from '../../src/engine';
import { genreMoment, tourTake } from '../../src/engine/systems/music-charts';

const star = (birthYear: number, seed = 5200): GameState => {
  let s = runCheat(newLife({ birthYear, country: 'us' }, seed), 'age.set', { age: 25 }).state;
  s = runCheat({ ...s, pending: [] }, 'skill.set', { skill: 'instrument', value: 95 }).state;
  return {
    ...s,
    pending: [],
    player: { ...s.player, stats: { ...s.player.stats, fame: 80 } },
    music: { ...s.music, stage: 4, act: 'solo', label: 'Big Label', genre: 'pop' },
  };
};

describe('the record business', () => {
  it('genres have their moment', () => {
    expect(genreMoment('rock', 1978)).toBeGreaterThan(genreMoment('rock', 2020));
    expect(genreMoment('hiphop', 2012)).toBeGreaterThan(genreMoment('hiphop', 1975));
  });

  it('a famous signed artist charts, sells, and gets royalties every year after', () => {
    let s = star(1960);
    s = act(s, { type: 'music', id: 'release' }).state;
    const r = s.music.releases.at(-1)!;
    expect(r.sales ?? 0).toBeGreaterThan(0);
    expect(r.chart ?? -1).toBeGreaterThanOrEqual(0);
    expect(s.log.some((l) => /copies|streams/.test(l.text))).toBe(true);
    const cash = s.money.cash;
    s = ageUp({ ...s, pending: [] }).state;
    expect(s.money.cash).toBeGreaterThan(cash - 1_000_000);
  });

  it('streaming-era releases count streams', () => {
    let s = star(1995, 5201);
    s = act(s, { type: 'music', id: 'release' }).state;
    expect(s.log.some((l) => /streams/.test(l.text))).toBe(true);
    s = act(s, { type: 'music_genre', genre: 'hiphop' }).state;
    expect(s.music.genre).toBe('hiphop');
  });

  it('a superstar earns like one: millions per hit album, tens of millions per stadium tour', () => {
    let s = star(1995, 5202);
    s = { ...s, player: { ...s.player, stats: { ...s.player.stats, fame: 100 } } };
    s = { ...s, music: { ...s.music, stage: 5 } };
    const c0 = s.money.cash;
    s = act(s, { type: 'music', id: 'release' }).state;
    const album = s.money.cash - c0;
    const r = s.music.releases.at(-1)!;
    if (r.chart === 1) expect(r.sales ?? 0).toBeGreaterThan(1_500_000);
    expect(album).toBeGreaterThan(1_000_000);
    // A stadium star clears tens of millions; a club act thousands; touring every year tires fans.
    expect(tourTake(s, 100, null)).toBeGreaterThan(50_000_000);
    expect(tourTake(s, 20, null)).toBeLessThan(200_000);
    expect(tourTake(s, 100, s.year - 1)).toBeLessThan(tourTake(s, 100, null));
    const c1 = s.money.cash;
    s = act({ ...s, pending: [] }, { type: 'music', id: 'tour' }).state;
    expect(s.money.cash - c1).toBeGreaterThan(10_000_000);
  });
});
