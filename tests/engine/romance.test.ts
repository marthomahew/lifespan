import { describe, expect, it } from 'vitest';
import {
  act,
  newLife,
  runCheat,
  interactionsFor,
  type GameState,
  type Npc,
} from '../../src/engine';
import { estatePlan } from '../../src/engine/systems/inheritance';
import { clone } from '../../src/engine/util';
import { playYears } from '../helpers';

function adult(seed = 1, extra: Partial<Parameters<typeof newLife>[0]> = {}): GameState {
  let s = newLife(
    { country: 'us', birthYear: 1985, gender: 'female', attraction: 'men', ...extra },
    seed,
  );
  s = runCheat(s, 'age.set', { age: 28 }).state;
  s = runCheat(s, 'money.add', { amount: 500000 }).state;
  return { ...s, cheats: { ...s.cheats, immortal: true, noBadEvents: true } };
}
const forced = (s: GameState): GameState => ({ ...s, cheats: { ...s.cheats, forceSuccess: true } });
const partner = (s: GameState): Npc | undefined =>
  s.npcs.find((n) => n.alive && (n.roles.includes('partner') || n.roles.includes('spouse')));

describe('romance (M5.5)', () => {
  it('meets people through activities; the dating app only exists from 2012', () => {
    const s = act(forced(adult(1)), { type: 'activity', id: 'find_date' }).state;
    expect(partner(s)?.romance?.stage).toBe('dating');
    expect(partner(s)?.age).toBeGreaterThanOrEqual(18);
    const old = newLife({ birthYear: 1960 }, 2);
    const at25 = runCheat(old, 'age.set', { age: 25 }).state;
    expect(() => act(at25, { type: 'activity', id: 'dating_app' })).toThrow(/2012/);
    const kid = newLife({}, 3);
    expect(() => act(kid, { type: 'activity', id: 'find_date' })).toThrow(/age 18|adults/);
  });

  it('moves from dating to serious to engaged to married', () => {
    let s = act(forced(adult(4)), { type: 'activity', id: 'find_date' }).state;
    const p = partner(s) as Npc;
    s = runCheat(s, 'npc.rel', { id: String(p.id), value: 90 }).state;
    for (let i = 0; i < 6 && partner(s)?.romance?.stage === 'dating'; i++) {
      s = runCheat(s, 'npc.rel', { id: String(p.id), value: 90 }).state;
      s = playYears(s, 1);
    }
    expect(partner(s)?.romance?.stage).toBe('serious');
    s = act(forced(s), { type: 'interact', npcId: p.id, id: 'propose' }).state;
    expect(partner(s)?.romance?.stage).toBe('engaged');
    const cash = s.money.cash;
    s = act(s, {
      type: 'interact',
      npcId: p.id,
      id: 'plan_wedding',
      params: { size: 'large', prenup: true },
    }).state;
    expect(partner(s)?.roles).toContain('spouse');
    expect(partner(s)?.romance).toMatchObject({ stage: 'married', prenup: true });
    expect(s.player.flags).toContain('ever_married');
    expect(cash - s.money.cash).toBeGreaterThan(30000);
  });

  it('proposals can fail', () => {
    let fails = 0;
    for (let seed = 1; seed <= 20; seed++) {
      let s = act(forced(adult(seed)), { type: 'activity', id: 'find_date' }).state;
      s = { ...s, cheats: { ...s.cheats, forceSuccess: false } };
      const p = partner(s) as Npc;
      s = runCheat(s, 'npc.rel', { id: String(p.id), value: 30 }).state;
      const r = act(s, { type: 'interact', npcId: p.id, id: 'propose' }).state;
      if (partner(r)?.romance?.stage !== 'engaged') fails++;
    }
    expect(fails).toBeGreaterThan(5);
  });

  it('divorce splits assets, and a prenup protects them', () => {
    const married = (prenup: boolean): GameState => {
      let s = act(forced(adult(7)), { type: 'activity', id: 'find_date' }).state;
      const p = partner(s) as Npc;
      s = clone(s);
      const pp = partner(s) as Npc;
      pp.romance = { stage: 'engaged', since: s.year - 4, prenup: false };
      s = act(s, {
        type: 'interact',
        npcId: p.id,
        id: 'plan_wedding',
        params: { size: 'small', prenup },
      }).state;
      return s;
    };
    for (const prenup of [false, true]) {
      const s = married(prenup);
      const sp = partner(s) as Npc;
      const before = s.money.cash + s.money.savings;
      const after = act(s, { type: 'interact', npcId: sp.id, id: 'divorce' }).state;
      const lost = before - (after.money.cash + after.money.savings);
      expect(after.npcs.find((n) => n.id === sp.id)?.roles).toContain('ex');
      expect(lost / before).toBeCloseTo(prenup ? 0.1 : 0.5, 1);
    }
  });

  it('affairs can surface years later through a chain', () => {
    let s = runCheat(adult(8), 'npc.spawn', { role: 'partner' }).state;
    const p = s.npcs.at(-1) as Npc;
    s = runCheat(s, 'marry.now', { id: String(p.id) }).state;
    s = runCheat(s, 'npc.spawn', { role: 'coworker' }).state;
    s = runCheat(s, 'event.fire', { event: 'rom_affair_temptation' }).state;
    expect(s.pending[0]?.eventId).toBe('rom_affair_temptation');
    const { choose } = await_choose();
    s = choose(s, 'go').state;
    expect(s.chains.some((c) => c.eventId === 'rom_affair_discovered')).toBe(true);
    let found = false;
    for (let i = 0; i < 6 && !found; i++) {
      s = playYearsUntilPending(s, 'rom_affair_discovered');
      found = s.pending.some((x) => x.eventId === 'rom_affair_discovered');
    }
    expect(found).toBe(true);
  });
});

import { ageUp, choose as engineChoose, currentPopup } from '../../src/engine';
function await_choose(): { choose: typeof engineChoose } {
  return { choose: engineChoose };
}
function playYearsUntilPending(s: GameState, id: string): GameState {
  let cur = ageUp(s).state;
  if (cur.pending.some((p) => p.eventId === id)) {
    const rest = cur.pending.filter((p) => p.eventId === id);
    return { ...cur, pending: rest };
  }
  for (let p = currentPopup(cur); p; p = currentPopup(cur))
    cur = engineChoose(cur, p.choices.find((c) => c.enabled)?.id ?? '').state;
  return cur;
}

describe('children (M5.6)', () => {
  it('pregnancy by trying (adults only) gives a birth the next year, with inherited traits', () => {
    let s = runCheat(adult(10), 'npc.spawn', { role: 'spouse' }).state;
    const sp = partner(s) as Npc;
    s = act(forced(s), { type: 'interact', npcId: sp.id, id: 'try_for_baby' }).state;
    expect(s.family.pregnancy?.due).toBe(s.year + 1);
    s = playYears({ ...s, cheats: { ...s.cheats, forceSuccess: false } }, 1);
    const kids = s.npcs.filter((n) => n.roles.includes('child'));
    expect(kids).toHaveLength(1);
    expect(kids[0]?.age).toBe(0);
    expect(kids[0]?.parentIds).toEqual([0, sp.id]);
    // Children age, go to school, and have their own events through role 'child'.
    const later = playYears(s, 8);
    const kid = later.npcs.find((n) => n.id === kids[0]?.id) as Npc;
    expect(kid.age).toBe(8);
    expect(kid.job).toBe('At school');
  });

  it('same-sex couples use the clinic or adoption; adoption adds a child', () => {
    let s = runCheat(adult(11, { gender: 'male', attraction: 'men' }), 'npc.spawn', {
      role: 'spouse',
    }).state;
    const sp = partner(s) as Npc;
    expect(interactionsFor(s, sp).find((v) => v.id === 'try_for_baby')?.reason).toMatch(
      /clinic|adoption/,
    );
    s = act(forced(s), { type: 'activity', id: 'adopt' }).state;
    expect(
      s.npcs.filter((n) => n.roles.includes('child') && n.flags.includes('adopted')),
    ).toHaveLength(1);
    const clinic = act(forced(s), { type: 'activity', id: 'fertility_clinic' }).state;
    expect(clinic.family.pregnancy).not.toBeNull();
  });

  it('minors can never become pregnant or have partners', () => {
    const kid = runCheat(newLife({}, 12), 'age.set', { age: 15 }).state;
    expect(runCheat(kid, 'baby.now', {}).message).toBe('Adults only');
    expect(runCheat(kid, 'npc.spawn', { role: 'partner' }).message).toMatch(/adults only/i);
    expect(() => act(kid, { type: 'activity', id: 'fertility_clinic' })).toThrow();
  });
});

describe('wills and inheritance (M5.7)', () => {
  it('you inherit when a parent dies', () => {
    let s = clone(adult(13));
    const mom = s.npcs.find((n) => n.roles.includes('mother')) as Npc;
    mom.money = 1_000_000;
    mom.rel = 90;
    mom.stats.health = 0;
    mom.age = 105;
    mom.birthYear = s.year - 105;
    const cash = s.money.cash;
    for (let i = 0; i < 10 && s.npcs.find((n) => n.id === mom.id)?.alive; i++) s = playYears(s, 1);
    expect(s.npcs.find((n) => n.id === mom.id)?.alive).toBe(false);
    expect(s.money.cash).toBeGreaterThan(cash + 100000);
    expect(s.log.some((l) => l.text.includes('will leaves you'))).toBe(true);
  });

  it('your will decides who gets your estate; without one, spouse and children share', () => {
    let s = runCheat(adult(14), 'npc.spawn', { role: 'spouse' }).state;
    s = runCheat(s, 'baby.now', {}).state;
    s = runCheat(s, 'baby.now', {}).state;
    const sp = partner(s) as Npc;
    const kids = s.npcs.filter((n) => n.roles.includes('child'));
    const plan = estatePlan(s);
    expect(plan.find((p) => p.npcId === sp.id)?.amount).toBeGreaterThan(0);
    expect(plan.filter((p) => kids.some((k) => k.id === p.npcId))).toHaveLength(2);
    const k0 = kids[0] as Npc;
    s = act(s, {
      type: 'activity',
      id: 'write_will',
      params: { heirs: [{ npcId: k0.id, share: 1 }] },
    }).state;
    expect(s.will.heirs).toEqual([{ npcId: k0.id, share: 100 }]);
    const dead = runCheat(s, 'deathbot', {}).state;
    expect(dead.death?.estate).toEqual([{ npcId: k0.id, amount: expect.any(Number) }]);
  });
});
