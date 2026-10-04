import { describe, expect, it } from 'vitest';
import { act, choose, newLife, runCheat, type GameState } from '../../src/engine';
import { SPECIALTIES, BRANCHES } from '../../src/content/military';
import { deathProbability } from '../../src/engine/mortality';
import { unmetRequirements } from '../../src/engine/systems/careers';
import { JOB_BY_ID } from '../../src/content/jobs';
import { clone } from '../../src/engine/util';
import { playYears } from '../helpers';

const at = (age: number, seed = 1, country = 'us'): GameState => {
  const s = runCheat(newLife({ country, birthYear: 1990 }, seed), 'age.set', { age }).state;
  return { ...s, cheats: { ...s.cheats, immortal: true, noBadEvents: true } };
};

describe('military (M6.7)', () => {
  it('has four branches and six specialties with risk, skills, and civilian bonuses', () => {
    expect([...BRANCHES]).toEqual(['Army', 'Navy', 'Air Force', 'Marines']);
    expect(SPECIALTIES.map((s) => s.id)).toEqual([
      'infantry',
      'intelligence',
      'aviation',
      'medical',
      'engineering',
      'logistics',
    ]);
    for (const s of SPECIALTIES) expect(s.civilianFields.length).toBeGreaterThan(0);
  });

  it('enlists at the country age; officers need a degree', () => {
    expect(() =>
      act(at(16), { type: 'enlist', branch: 'Army', specialty: 'infantry', officer: false }),
    ).toThrow(/enlistment age/);
    const s = act(at(18), {
      type: 'enlist',
      branch: 'Marines',
      specialty: 'infantry',
      officer: false,
    }).state;
    expect(s.military).toMatchObject({ active: true, branch: 'Marines', rank: 0, officer: false });
    expect(() =>
      act(at(23), { type: 'enlist', branch: 'Navy', specialty: 'aviation', officer: true }),
    ).toThrow(/degree/);
    const grad = runCheat(at(23), 'degree.grant', {
      level: 'bachelor',
      field: 'engineering',
    }).state;
    expect(
      act(grad, { type: 'enlist', branch: 'Navy', specialty: 'aviation', officer: true }).state
        .military?.officer,
    ).toBe(true);
  });

  it('promotes over time, deploys, and awards medals; deployment raises death risk', () => {
    let s = act(at(18, 2), {
      type: 'enlist',
      branch: 'Army',
      specialty: 'infantry',
      officer: false,
    }).state;
    let deployedRisk = 0;
    let homeRisk = 0;
    let deployments = 0;
    for (let i = 0; i < 12; i++) {
      s = playYears(s, 1);
      const q = deathProbability({ ...s, cheats: { ...s.cheats, immortal: false } });
      if (s.military?.deployed)
        deployedRisk = Math.max(
          deployedRisk,
          q /
            deathProbability({
              ...s,
              military: s.military ? { ...s.military, deployed: false } : null,
            }),
        );
      else homeRisk = 1;
      deployments = s.military?.deployments ?? 0;
    }
    expect(s.military?.rank).toBeGreaterThan(0);
    expect(deployments).toBeGreaterThan(0);
    expect(deployedRisk).toBeGreaterThan(1.5);
    expect(homeRisk).toBe(1);
  });

  it('discharge type follows conduct; honorable grants the veteran education benefit and job perks', () => {
    const s = act(at(18, 3), {
      type: 'enlist',
      branch: 'Army',
      specialty: 'logistics',
      officer: false,
    }).state;
    expect(() => act(s, { type: 'discharge' })).toThrow(/four years/);
    const served = clone(playYears(s, 5));
    if (served.military) served.military.conduct = 80;
    const out = act(served, { type: 'discharge' }).state;
    expect(out.military?.discharge).toBe('honorable');
    expect(out.education.veteranBenefit).toBe(true);
    const bad = clone(playYears(s, 5));
    if (bad.military) bad.military.conduct = 5;
    expect(act(bad, { type: 'discharge' }).state.military?.discharge).toBe('dishonorable');
    // The benefit pays tuition.
    const uni = act(
      { ...out, cheats: { ...out.cheats, forceSuccess: true } },
      { type: 'enroll', kind: 'university', programId: 'history' },
    ).state;
    expect(uni.education.enrollment?.tuition).toBe(0);
    // Veteran perks: veteran-friendly jobs waive the education requirement.
    const police = JOB_BY_ID['police_officer'];
    if (police?.req.education) {
      const civ = clone(at(25, 4));
      civ.education.degrees = [];
      expect(unmetRequirements(civ, police).join()).toMatch(/high school/);
      const vet = clone(out);
      vet.education.degrees = [];
      expect(unmetRequirements(vet, police).join()).not.toMatch(/high school/);
    }
  });

  it('conscription calls you up in countries that have it', () => {
    const kr = runCheat(newLife({ country: 'kr', birthYear: 1990 }, 5), 'age.set', {
      age: 17,
    }).state;
    let s = kr;
    let notice = false;
    for (let i = 0; i < 2 && !notice; i++) {
      const r = playYearsKeepPending(s);
      notice = r.pending.some((p) => p.eventId === 'military_conscription_notice');
      s = r;
    }
    expect(notice).toBe(true);
    const pe = s.pending.findIndex((p) => p.eventId === 'military_conscription_notice');
    const first = {
      ...s,
      pending: [s.pending[pe] ?? s.pending[0]!, ...s.pending.filter((_, i) => i !== pe)],
    };
    const served = choose(first, 'army').state;
    expect(served.military).toMatchObject({ active: true, branch: 'Army' });
    expect(served.player.flags).toContain('conscript');
    const done = playYears(served, 3);
    expect(done.military?.active).toBe(false);
    expect(done.military?.discharge).toBe('honorable');
    const us = playYears(at(17, 6, 'us'), 2);
    expect(us.military).toBeNull();
  });
});

import { ageUp } from '../../src/engine';
/** Age up once, dropping unrelated popups first, and keep whatever the new year brings. */
function playYearsKeepPending(s: GameState): GameState {
  return ageUp({ ...s, pending: [] }).state;
}
