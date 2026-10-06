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
import { rollBackground } from '../../src/renderer/store/background-roll';
import { POSSESSION_BY_ID, VEHICLE_BY_ID, productName } from '../../src/content/assets';
import { COUNTRY_BY_ID } from '../../src/content/countries';
import type { NewLifeOptions } from '../../src/engine/life';

const at = (age: number, opts: NewLifeOptions = {}, seed = 1500): GameState => {
  const s = runCheat(newLife({ birthYear: 1980, country: 'us', ...opts }, seed), 'age.set', {
    age,
  }).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true, noBadEvents: true } };
};
function years(s: GameState, n: number, pick: Record<string, string> = {}): GameState {
  let t = s;
  for (let i = 0; i < n && !t.death; i++) {
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

describe('fixes from the S73–S78 review', () => {
  it('a business moves currency with you when you emigrate', () => {
    let s = runCheat(at(30, { country: 'jp' }), 'money.set', { amount: 50_000_000 }).state;
    s = act(
      { ...s, pending: [] },
      { type: 'business', action: { op: 'start', kind: 'cafe' } },
    ).state;
    const yen = s.business?.value ?? 0;
    s = act(s, { type: 'emigrate', country: 'us' }).state;
    const ratio =
      (COUNTRY_BY_ID['us']?.currency.perUsd ?? 1) / (COUNTRY_BY_ID['jp']?.currency.perUsd ?? 1);
    expect(s.business?.value).toBe(Math.round(yen * ratio));
  });

  it('a random life rolls a background as often as the setting says, and never when off', () => {
    let rare = 0;
    for (let seed = 1; seed <= 2000; seed++) {
      expect(rollBackground(seed, 'off')).toBeUndefined();
      if (rollBackground(seed, 'rare')) rare++;
    }
    expect(rare).toBeGreaterThan(120);
    expect(rare).toBeLessThan(280);
  });

  it('hard work makes a good player; only the gifted become grandmasters', () => {
    let plain = act(at(4, {}, 1510), { type: 'focus', target: 'chess' }).state;
    plain = years(plain, 14, { pr_chess_junior: 'enter', pr_chess_master: 'train' });
    expect(plain.player.flags).not.toContain('chess_gm');
    expect(plain.player.skills['chess'] ?? 0).toBeGreaterThan(60);
  });

  it('the family business falls to you when its parent dies', () => {
    let s = at(25, { background: 'family_business' }, 1520);
    s = {
      ...s,
      npcs: s.npcs.map((n) => (n.flags.includes('business_parent') ? { ...n, alive: false } : n)),
    };
    s = ageUp(s).state;
    let found = false;
    for (let k = 0; k < 10 && s.pending.length; k++) {
      const p = currentPopup(s);
      if (p?.eventId === 'bgf_biz_inherit') {
        s = choose(s, 'keep').state;
        found = true;
        break;
      }
      const id = p?.choices.find((c) => c.enabled)?.id;
      if (!id) break;
      s = choose(s, id).state;
    }
    expect(found).toBe(true);
    expect(s.business?.name).toBe(s.player.backgroundData?.['business']);
  });

  it('never caught also covers the stories that end in an arrest', async () => {
    const { Ctx } = await import('../../src/engine/ctx');
    const { applyCrimeEffect } = await import('../../src/engine/systems/legal-effects');
    let lucky = 0;
    let plain = 0;
    for (let seed = 1530; seed < 1560; seed++) {
      const a = structuredClone(at(30, { gifts: ['crime_luck'] }, seed));
      applyCrimeEffect(new Ctx(a), 'shoplifting', true);
      if (a.legal.case) lucky++;
      const b = structuredClone(at(30, {}, seed));
      applyCrimeEffect(new Ctx(b), 'shoplifting', true);
      if (b.legal.case) plain++;
    }
    expect(plain).toBe(30);
    expect(lucky).toBeLessThan(15);
  });

  it('grandparents, new arrivals and famous parents set up consistently', () => {
    for (let seed = 1600; seed < 1640; seed++) {
      const g = newLife({ background: 'grandparents' }, seed);
      expect(g.npcs.some((n) => n.alive && n.flags.includes('raising_grandparent'))).toBe(true);
      expect(g.log.some((l) => /born in .* to /.test(l.text))).toBe(false);
      const im = newLife({ country: 'us', background: 'immigrant_family' }, seed);
      const from = COUNTRY_BY_ID[im.player.backgroundData?.['heritage'] ?? ''];
      expect(from?.languages[0]).not.toBe('english');
      const f = newLife({ wealth: 'poor', background: 'famous_parent' }, seed);
      expect(f.player.wealth).toBe('comfortable');
    }
  });

  it('plain things read lower-case; nothing carries a brand from before it existed', async () => {
    const { itemName } = await import('../../src/engine/systems/assets');
    expect(itemName({ item: 'oil_painting', bought: 2000 })).toBe('oil painting');
    const hatch = VEHICLE_BY_ID['pelican_runabout'];
    const watch = POSSESSION_BY_ID['gold_watch'];
    if (!hatch || !watch) throw new Error('missing');
    expect(productName(hatch, 1956)).toBe('Small hatchback');
    expect(productName(watch, 1940)).toBe('Gold watch');
  });

  it('a business can’t be run from prison', () => {
    let s = runCheat(at(30), 'money.set', { amount: 500000 }).state;
    s = act(
      { ...s, pending: [] },
      { type: 'business', action: { op: 'start', kind: 'shop' } },
    ).state;
    const inside = {
      ...s,
      legal: { ...s.legal, prison: { years: 3, served: 0, crimeId: 'theft', behaviour: 50 } },
    };
    expect(() => act(inside, { type: 'business', action: { op: 'invest' } })).toThrow(/prison/);
  });
});
