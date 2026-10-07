import { describe, expect, it } from 'vitest';
import {
  act,
  ageUp,
  choose,
  currentPopup,
  freeTime,
  newLife,
  runCheat,
  type GameState,
} from '../../src/engine';
import { SPECIAL_PATHS } from '../../src/content/special-paths';
import { SPORT_BY_ID } from '../../src/content/sports';
import { JOB_BY_ID } from '../../src/content/jobs';
import { salaryFor, titleFor } from '../../src/engine/systems/careers';
import { Ctx } from '../../src/engine/ctx';
import { seedRng } from '../../src/engine/rng';

const kid = (seed: number, opts: Parameters<typeof newLife>[0] = {}): GameState => {
  const s = runCheat(newLife({ birthYear: 2000, country: 'us', ...opts }, seed), 'age.set', {
    age: 7,
  }).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true, noBadEvents: true } };
};
function seasons(s: GameState, n: number, pick: Record<string, string> = {}): GameState {
  let t = s;
  for (let i = 0; i < n; i++) {
    t = ageUp({ ...t, pending: [] }).state;
    for (let k = 0; k < 10 && t.pending.length; k++) {
      const p = currentPopup(t);
      const id = (p && pick[p.eventId]) ?? p?.choices.find((c) => c.enabled)?.id;
      if (!id) break;
      t = choose(t, id).state;
    }
  }
  return { ...t, pending: [] };
}

describe('sport, season by season', () => {
  it('a child can take up a sport; it takes a pip of free time', () => {
    const s = kid(2400);
    const before = freeTime(s).total;
    const playing = act(s, { type: 'sport', sport: 'football' }).state;
    expect(playing.sport?.level).toBe(0);
    expect(freeTime(playing).total).toBe(before - 1);
    const toddler = { ...newLife({ birthYear: 2000 }, 2404), pending: [] };
    expect(() => act(toddler, { type: 'sport', sport: 'tennis' })).toThrow(/age 6/);
  });

  it('a gifted, dedicated young athlete is picked for higher levels; an unfit one is not', () => {
    let star = kid(2401, { talent: 'athletics', talentLevel: 'prodigy', gifts: ['sport_luck'] });
    star = act(star, { type: 'sport', sport: 'athletics' }).state;
    star = act(star, { type: 'focus', target: 'athletics' }).state;
    star = seasons(star, 12, { sport_pro_offer: 'amateur' });
    expect(star.sport?.best ?? 0).toBeGreaterThanOrEqual(3);
    let slow = kid(2402);
    slow = act(slow, { type: 'sport', sport: 'swimming' }).state;
    slow = { ...slow, player: { ...slow.player, stats: { ...slow.player.stats, health: 30 } } };
    slow = seasons(slow, 6);
    expect(slow.sport?.best ?? 0).toBeLessThan(3);
  });

  it('only a national-team athlete in an Olympic sport is selected for the Games', () => {
    const olympics = SPECIAL_PATHS.find((p) => p.id === 'olympics');
    const base = runCheat(kid(2403), 'age.set', { age: 22 }).state;
    const fit = {
      ...base,
      player: { ...base.player, skills: { ...base.player.skills, athletics: 99 } },
    };
    expect(olympics?.when(fit)).toBe(false);
    const national = {
      ...fit,
      sport: {
        sport: 'swimming',
        level: 4,
        best: 4,
        form: 80,
        seasons: 10,
        honours: [],
        active: true,
      },
    };
    expect(olympics?.when(national)).toBe(true);
  });

  it('each sport pays its own way: a cycling leader earns far less than an NBA starter', () => {
    const pro = (sport: string, level: number, country = 'us'): GameState => {
      const s = runCheat(kid(2410 + level, { country }), 'age.set', { age: 26 }).state;
      const playing = {
        ...s,
        sport: { sport, level: 4, best: 4, form: 90, seasons: 12, honours: [], active: true },
      };
      const hired = runCheat(playing, 'job.set', { job: 'professional_athlete' }).state;
      return { ...hired, career: { ...hired.career, level } };
    };
    const cyclist = pro('cycling', 3);
    expect(titleFor(cyclist, JOB_BY_ID['professional_athlete']!, 3)).toBe('Team Leader');
    const nba = pro('basketball', 3);
    expect(titleFor(nba, JOB_BY_ID['professional_athlete']!, 3)).toBe('NBA Starter');
    const pay = (s: GameState, level: number): number[] =>
      Array.from({ length: 20 }, (_, i) =>
        salaryFor(
          new Ctx({ ...s, rng: seedRng(i + 1) }),
          JOB_BY_ID['professional_athlete']!,
          level,
        ),
      );
    const usdPay = (s: GameState, level: number): number =>
      Math.max(...pay(s, level)) / s.inflation;
    expect(usdPay(cyclist, 3)).toBeLessThanOrEqual(3_000_001);
    expect(Math.min(...pay(nba, 3)) / nba.inflation).toBeGreaterThanOrEqual(11_999_999);
    // Stars are paid in a global market: the same dollars in Nigeria as in the US.
    const ngStar = pro('football', 4, 'ng');
    const ng = Math.min(...pay(ngStar, 4)) / (ngStar.inflation * 1500);
    expect(ng).toBeGreaterThanOrEqual(19_999_000);
  });

  it('American football is a sport you can take up', () => {
    const s = act(kid(2420), { type: 'sport', sport: 'american_football' }).state;
    expect(s.sport?.sport).toBe('american_football');
    expect(SPORT_BY_ID['american_football']?.pro.titles[0]).toBe('Practice Squad Player');
  });

  it('each sport has its own way in: no teenager is drafted into American football', () => {
    const star = (age: number, sport: string): GameState => {
      const s = runCheat(kid(2430 + age), 'age.set', { age }).state;
      return {
        ...s,
        pending: [],
        sport: { sport, level: 4, best: 4, form: 95, seasons: 10, honours: [], active: true },
        player: { ...s.player, skills: { ...s.player.skills, athletics: 100 } },
      };
    };
    const offers = (s: GameState): string[] => {
      const seen: string[] = [];
      let t = s;
      for (let i = 0; i < 8; i++) {
        t = ageUp({ ...t, pending: [] }).state;
        seen.push(...t.pending.map((p) => p.eventId).filter((id) => id.startsWith('sport_pro')));
        t = { ...t, sport: { ...t.sport!, level: 4, form: 95 } };
      }
      return seen;
    };
    // Eight seasons from 13: still too young for the draft at 20.
    expect(offers(star(12, 'american_football'))).toEqual([]);
    expect(offers(star(21, 'american_football'))).toContain('sport_pro_draft');
    expect(offers(star(17, 'tennis'))).toContain('sport_pro_tour');
    expect(offers(star(20, 'cycling'))).toContain('sport_pro_team');
    expect(SPORT_BY_ID['football']?.route).toEqual({ kind: 'club', age: 17 });
  });

  it('an offer that would take you away from your job says so', () => {
    let s = runCheat(kid(2440), 'age.set', { age: 24 }).state;
    s = runCheat({ ...s, pending: [] }, 'job.set', { job: 'accountant' }).state;
    s = runCheat({ ...s, pending: [] }, 'event.fire', {
      event: 'sp_screen_test',
      force: 'on',
    }).state;
    const test = currentPopup(s)?.choices.find((c) => c.id === 'test');
    expect(test?.note).toMatch(/leave your job as/);
    expect(currentPopup(s)?.choices.find((c) => c.id === 'decline')?.note).toBeUndefined();
  });
});
