import { describe, expect, it } from 'vitest';
import { act, ageUp, choose, newLife, runCheat, type GameState, type Npc } from '../../src/engine';
import { EVENTS } from '../../src/content/events';
import { checkState } from '../../src/engine/bot/invariants';
import { hasEducation } from '../../src/engine/systems/careers';
import { clone } from '../../src/engine/util';
import { playYears } from '../helpers';

const adult = (seed = 1, age = 30, extra: Parameters<typeof newLife>[0] = {}): GameState => {
  const s = runCheat(newLife({ country: 'us', birthYear: 1990, ...extra }, seed), 'age.set', {
    age,
  }).state;
  return { ...s, cheats: { ...s.cheats, immortal: true, noBadEvents: true } };
};
const forced = (s: GameState): GameState => ({ ...s, cheats: { ...s.cheats, forceSuccess: true } });

describe('adults-only and family safety', () => {
  it('age set never moves backwards (rewind does that)', () => {
    expect(() => runCheat(adult(), 'age.set', { age: 10 })).toThrow(/rewind/);
  });

  it('romance cheats refuse relatives', () => {
    const s = adult(2);
    const mom = s.npcs.find((n) => n.roles.includes('mother')) as Npc;
    expect(runCheat(s, 'romance.force', { id: String(mom.id) }).message).toBe('Not with family');
    expect(runCheat(s, 'marry.now', { id: String(mom.id) }).message).toBe('Not with family');
  });

  it('the invariant checker flags a pregnancy involving a minor', () => {
    const s = clone(newLife({}, 3));
    s.family.pregnancy = { due: s.year + 1, partnerId: -1, carrier: 'player' };
    expect(checkState(s, null).join()).toMatch(/pregnancy with a player under 18/);
  });
});

describe('money and education fixes', () => {
  it('divorce keeps a pregnancy the player is carrying', () => {
    let s = runCheat(adult(4, 30, { gender: 'female', attraction: 'men' }), 'npc.spawn', {
      role: 'spouse',
    }).state;
    const sp = s.npcs.find((n) => n.roles.includes('spouse')) as Npc;
    s = clone(s);
    s.family.pregnancy = { due: s.year + 1, partnerId: sp.id, carrier: 'player' };
    s = runCheat(s, 'divorce.now', {}).state;
    expect(s.family.pregnancy?.carrier).toBe('player');
  });

  it('tuition never wipes out existing debt', () => {
    let s = act(forced(runCheat(adult(5, 18), 'stat.set', { stat: 'smarts', value: 80 }).state), {
      type: 'enroll',
      kind: 'university',
      programId: 'history',
    }).state;
    s = clone(s);
    s.money.cash = -10000;
    for (const n of s.npcs) n.money = 0;
    const next = ageUp({ ...s, cheats: { ...s.cheats, forceSuccess: false } }).state;
    const debt = next.money.loans.find((l) => l.kind === 'debt');
    expect(debt?.balance ?? 0).toBeGreaterThanOrEqual(10000);
  });

  it('enlisting mid-degree starts student loan repayment', () => {
    let s = act(forced(runCheat(adult(6, 19), 'stat.set', { stat: 'smarts', value: 80 }).state), {
      type: 'enroll',
      kind: 'university',
      programId: 'history',
    }).state;
    s = clone(s);
    s.money.loans.push({
      id: 99,
      kind: 'student',
      principal: 20000,
      balance: 20000,
      rate: 0.055,
      termYears: 10,
      payment: 0,
      yearsPaid: 0,
      missed: 0,
    });
    s = act(s, { type: 'enlist', branch: 'Army', specialty: 'logistics', officer: false }).state;
    expect(s.education.enrollment).toBeNull();
    expect(s.money.loans.find((l) => l.id === 99)?.payment).toBeGreaterThan(0);
  });

  it('a major requirement must be met by the same degree', () => {
    const s = clone(adult(7));
    s.education.degrees = [
      { level: 'bachelor', field: 'history', gpa: 3, year: 2010 },
      { level: 'associate', field: 'nursing', gpa: 3, year: 2012 },
    ];
    expect(hasEducation(s, 'bachelor', ['nursing'])).toBe(false);
    s.education.degrees.push({ level: 'bachelor', field: 'nursing', gpa: 3, year: 2014 });
    expect(hasEducation(s, 'bachelor', ['nursing'])).toBe(true);
  });

  it('pensions start at retirement age even without a job', () => {
    let s = clone(adult(8, 66));
    s.career.yearsWorked = 35;
    s = playYears(s, 2);
    expect(s.career.retired).toBe(true);
    expect(s.career.pension).toBeGreaterThan(0);
  });

  it('a large wedding checks the large price', () => {
    let s = runCheat(adult(9), 'npc.spawn', { role: 'partner' }).state;
    s = clone(s);
    const p = s.npcs.find((n) => n.roles.includes('partner')) as Npc;
    p.romance = { stage: 'engaged', since: s.year - 2, prenup: false };
    s.money.cash = 5000;
    expect(() =>
      act(s, { type: 'interact', npcId: p.id, id: 'plan_wedding', params: { size: 'large' } }),
    ).toThrow(/costs/);
  });
});

describe('events fixes', () => {
  it('chain-only events need force to be fired by the cheat', () => {
    const s = adult(10);
    expect(runCheat(s, 'event.fire', { event: 'interview_panel' }).message).toMatch(/follow-up/);
  });

  it('a chain follow-up is skipped when the person no longer has that role', () => {
    let s = runCheat(adult(11), 'npc.spawn', { role: 'coworker' }).state;
    s = runCheat(s, 'npc.spawn', { role: 'spouse' }).state;
    s = runCheat(s, 'event.fire', { event: 'rom_affair_temptation' }).state;
    s = choose(s, 'go').state;
    s = runCheat(s, 'divorce.now', {}).state;
    let fired = false;
    for (let i = 0; i < 6; i++) {
      s = ageUp({ ...s, pending: [] }).state;
      if (s.pending.some((p) => p.eventId === 'rom_affair_discovered')) fired = true;
    }
    expect(fired).toBe(false);
  });

  it('read-only cheats do not mark the life', () => {
    const s = adult(12);
    expect(
      runCheat({ ...s, cheats: { ...s.cheats, used: false } }, 'npc.list', {}).state.cheats.used,
    ).toBe(false);
  });
});

describe('fame, custody, service', () => {
  it('fame changes happiness and brings endorsement income', () => {
    let s = runCheat(adult(13), 'fame.set', { value: 80 }).state;
    s = { ...s, music: { ...s.music, lastWork: s.year } };
    const cash = s.money.cash;
    s = ageUp(s).state;
    expect(s.money.cash).toBeGreaterThan(cash);
    expect(EVENTS.filter((e) => e.category === 'fame' && e.when).length).toBeGreaterThanOrEqual(10);
  });

  it('children who live with an ex cost child support', () => {
    let s = runCheat(adult(14), 'npc.spawn', { role: 'spouse' }).state;
    s = runCheat(s, 'baby.now', {}).state;
    s = clone(s);
    const kid = s.npcs.find((n) => n.roles.includes('child')) as Npc;
    s.family.custodyLost.push(kid.id);
    s.money.cash = 100000;
    const next = ageUp(s).state;
    expect(next.money.cash).toBeLessThan(100000);
  });

  it('conduct effects and injury discharges come from service events', () => {
    const svc = EVENTS.filter((e) => e.category === 'military');
    const effects = svc
      .flatMap((e) => [...(e.outcomes ?? []), ...(e.choices ?? []).flatMap((c) => c.outcomes)])
      .flatMap((o) => o.effects);
    expect(effects.some((x) => 'conduct' in x)).toBe(true);
    expect(effects.some((x) => 'system' in x && x.system === 'dishonorable')).toBe(true);
    expect(effects.some((x) => 'system' in x && x.system === 'injury_discharge')).toBe(true);
  });
});
