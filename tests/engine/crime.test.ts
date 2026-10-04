import { describe, expect, it } from 'vitest';
import { act, choose, newLife, runCheat, type GameState } from '../../src/engine';
import { CRIMES } from '../../src/content/crimes';
import { ACTIVITIES } from '../../src/content/activities';
import { JOB_BY_ID } from '../../src/content/jobs';
import { crimeOdds } from '../../src/engine/systems/crime';
import { EVENTS } from '../../src/content/events';
import { eligibility } from '../../src/engine/events/select';
import { unmetRequirements } from '../../src/engine/systems/careers';
import { clone } from '../../src/engine/util';
import { playYears } from '../helpers';

const adult = (seed = 1, age = 30, country = 'us'): GameState => {
  const s = runCheat(
    runCheat(newLife({ country, birthYear: 1980 }, seed), 'age.set', { age }).state,
    'money.add',
    { amount: 1e6 },
  ).state;
  return { ...s, cheats: { ...s.cheats, immortal: true, noBadEvents: true } };
};

/** Commit a crime until an arrest happens (bounded), returning the arrested state. */
function getArrested(s: GameState, crime = 'burglary'): GameState {
  let cur = s;
  for (let i = 0; i < 40; i++) {
    cur = act({ ...cur, pending: [] }, { type: 'crime', id: crime }).state;
    if (cur.pending.some((p) => p.eventId === 'legal_arrest')) return cur;
    cur = { ...cur, legal: { ...cur.legal, case: null }, usage: { year: -1, used: {} } };
  }
  throw new Error('never arrested');
}

function throughCourt(
  s: GameState,
  bail: 'pay' | 'wait',
  lawyer: 'public' | 'standard' | 'elite',
  plea: 'plea' | 'trial',
): GameState {
  let cur = choose(s, bail).state;
  expect(cur.pending[0]?.eventId).toBe('legal_lawyer');
  cur = choose(cur, lawyer).state;
  expect(cur.pending[0]?.eventId).toBe('legal_plea');
  return choose(cur, plea).state;
}

describe('crimes (M8.4)', () => {
  it('has 10+ crimes with abstract texts, loot, odds and notoriety', () => {
    expect(CRIMES.length).toBeGreaterThanOrEqual(10);
    for (const c of CRIMES) {
      expect(c.texts.success.length).toBeGreaterThanOrEqual(2);
      expect(c.texts.caught.length).toBeGreaterThanOrEqual(2);
      expect(c.sentence[1]).toBeGreaterThanOrEqual(c.sentence[0]);
    }
    expect(CRIMES.find((c) => c.id === 'embezzlement')?.needsJob).toBe(true);
  });

  it('odds depend on traits and notoriety; success brings loot and notoriety', () => {
    const s = clone(adult(1));
    const base = crimeOdds(s, 'shoplifting');
    expect(
      crimeOdds({ ...s, player: { ...s.player, traits: ['cunning'] } }, 'shoplifting'),
    ).toBeGreaterThan(base);
    expect(
      crimeOdds(
        { ...s, player: { ...s.player, stats: { ...s.player.stats, notoriety: 90 } } },
        'shoplifting',
      ),
    ).toBeLessThan(base);
    const done = act(
      { ...s, cheats: { ...s.cheats, forceSuccess: true } },
      { type: 'crime', id: 'burglary' },
    ).state;
    expect(done.money.cash).toBeGreaterThan(s.money.cash);
    expect(done.player.stats.notoriety).toBeGreaterThan(s.player.stats.notoriety);
    expect(done.pending).toEqual([]);
    expect(() => act(s, { type: 'crime', id: 'embezzlement' })).toThrow(/job/);
  });
});

describe('justice (M8.5)', () => {
  it('arrest, bail, lawyer, plea, sentence scaled by the country', () => {
    const arrested = getArrested(adult(2));
    expect(arrested.legal.case?.stage).toBe('arrested');
    const done = throughCourt(arrested, 'pay', 'public', 'plea');
    expect(done.legal.case).toBeNull();
    const rec = done.legal.record.at(-1);
    expect(rec?.verdict).toBe('plea');
    expect(done.player.flags).toContain('ever_arrested');
    // Sentencing scales by country: compare many US and Swedish convictions.
    const total = (country: string): number => {
      let t = 0;
      for (let seed = 1; seed <= 12; seed++) {
        const a = getArrested(adult(seed, 30, country), 'armed_robbery');
        t += throughCourt(a, 'wait', 'public', 'plea').legal.record.at(-1)?.sentenceYears ?? 0;
      }
      return t;
    };
    expect(total('us')).toBeGreaterThan(total('se'));
  });

  it('trials can acquit, more often with a better lawyer', () => {
    let pub = 0;
    let elite = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const a = getArrested(adult(seed), 'shoplifting');
      if (throughCourt(a, 'pay', 'public', 'trial').legal.record.at(-1)?.verdict === 'acquitted')
        pub++;
      if (throughCourt(a, 'pay', 'elite', 'trial').legal.record.at(-1)?.verdict === 'acquitted')
        elite++;
    }
    expect(elite).toBeGreaterThan(pub);
  });

  it('juvenile records seal at 18 and do not block jobs', () => {
    let teen = runCheat(newLife({ country: 'us', birthYear: 2000 }, 5), 'age.set', {
      age: 15,
    }).state;
    teen = { ...teen, cheats: { ...teen.cheats, immortal: true } };
    const done = throughCourt(getArrested(teen, 'vandalism'), 'wait', 'public', 'plea');
    expect(done.legal.record.at(-1)?.juvenile).toBe(true);
    let adultNow = playYears(
      {
        ...done,
        legal: { ...done.legal, prison: null },
        assets: { ...done.assets, housing: 'parents' },
      },
      3,
    );
    expect(adultNow.legal.sealed).toBe(true);
    adultNow = runCheat(adultNow, 'degree.grant', { level: 'high_school' }).state;
    const police = JOB_BY_ID['police_officer'];
    if (!police) throw new Error('police_officer job missing');
    expect(unmetRequirements(adultNow, police).join()).not.toMatch(/clean record/);
    // Before sealing, the juvenile record does count against clean-record jobs.
    const lifeguard =
      Object.values(JOB_BY_ID).find((j) => j.partTime && j.req.cleanRecord) ?? police;
    const unsealed = { ...done, legal: { ...done.legal, prison: null, sealed: false } };
    expect(unmetRequirements(unsealed, lifeguard).join()).toMatch(/clean record/);
    const sealed = { ...unsealed, legal: { ...unsealed.legal, sealed: true } };
    expect(unmetRequirements(sealed, lifeguard).join()).not.toMatch(/clean record/);
  });

  it('an adult record blocks clean-record jobs and loans', () => {
    const s = throughCourt(getArrested(adult(6), 'fraud'), 'pay', 'public', 'plea');
    const out = {
      ...s,
      legal: { ...s.legal, prison: null },
      assets: { ...s.assets, housing: 'renting' as const },
    };
    const banker = JOB_BY_ID['bank_teller'];
    if (banker) expect(unmetRequirements(out, banker).join()).toMatch(/clean record/);
    expect(() =>
      act(runCheat(out, 'job.set', { job: 'retail_associate' }).state, {
        type: 'money',
        action: { op: 'borrow', amount: 1000 },
      }),
    ).toThrow(/criminal record/);
  });
});

describe('prison (M8.6)', () => {
  const jailed = (): GameState => {
    let s = throughCourt(getArrested(adult(7), 'armed_robbery'), 'wait', 'public', 'plea');
    if (!s.legal.prison) s = runCheat(s, 'sentence.set', { years: 6 }).state;
    if (!s.legal.prison) {
      s = clone(s);
      s.legal.prison = { years: 6, served: 0, crimeId: 'armed_robbery', behaviour: 50 };
      s.assets.housing = 'prison';
    }
    return s;
  };

  it('has 6+ prison activities that only work inside', () => {
    expect(ACTIVITIES.filter((a) => a.group === 'prison').length).toBeGreaterThanOrEqual(6);
    expect(() => act(adult(8), { type: 'activity', id: 'prison_workout' })).toThrow(
      /only in prison/,
    );
    const s = jailed();
    expect(s.player.flags).toContain('ever_imprisoned');
    for (const id of ['prison_workout', 'prison_library', 'prison_allies', 'prison_fight']) {
      expect(() => act(s, { type: 'activity', id }), id).not.toThrow();
    }
    expect(() => act(s, { type: 'activity', id: 'gym' })).toThrow(/not from prison/);
  });

  it('inside, only prison-compatible events fire; outside chain steps wait for release', () => {
    const s = clone(jailed());
    s.cheats.immortal = true;
    const outside = EVENTS.filter((d) => !d.inPrison);
    const inside = EVENTS.filter((d) => d.inPrison && !d.chainOnly);
    expect(inside.length).toBeGreaterThanOrEqual(6);
    for (const d of outside) expect(eligibility(s, d).ok, d.id).toBe(false);
    expect(inside.some((d) => eligibility(s, d).ok)).toBe(true);
    // Free people never see prison events.
    const free = adult(9);
    for (const d of inside) expect(eligibility(free, d).ok, d.id).toBe(false);
    // A chain step due inside is kept for later, not lost.
    const step = {
      eventId: outside.find((d) => d.chainOnly && !d.bind)?.id ?? '',
      dueYear: s.year + 1,
      payload: {},
      bindings: {},
    };
    s.chains.push(step);
    if (s.legal.prison) s.legal.prison.years = s.legal.prison.served + 5;
    let t: GameState = s;
    const logStart = s.log.length;
    for (let i = 0; i < 3; i++) t = playYears(t, 1);
    expect(t.legal.prison).not.toBeNull();
    expect(t.chains.some((c) => c.eventId === step.eventId)).toBe(true);
    for (const e of t.log.slice(logStart))
      expect(e.text).not.toMatch(/commute|office party|email/i);
  });

  it('appeals, escapes, parole and release', () => {
    const s = jailed();
    const appeal = act(
      { ...s, cheats: { ...s.cheats, forceSuccess: true } },
      { type: 'activity', id: 'prison_appeal' },
    ).state;
    expect(appeal.legal.prison?.years ?? 0).toBeLessThan(s.legal.prison?.years ?? 0);
    const escaped = act(
      { ...s, cheats: { ...s.cheats, forceSuccess: true } },
      { type: 'activity', id: 'prison_escape' },
    ).state;
    expect(escaped.legal.prison).toBeNull();
    expect(escaped.player.flags).toContain('fugitive');
    const good = clone(s);
    if (good.legal.prison) good.legal.prison.behaviour = 95;
    let released = good;
    // Parole is a yearly roll from the halfway point; the full term is the latest release.
    const term = good.legal.prison?.years ?? 0;
    for (let i = 0; i < term && released.legal.prison; i++) released = playYears(released, 1);
    expect(released.legal.prison).toBeNull();
    expect(released.player.flags).toContain('ex_con');
    expect(released.assets.housing).not.toBe('prison');
  });
});
