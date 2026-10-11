import { describe, expect, it } from 'vitest';
import {
  act,
  ageUp,
  citations,
  funderName,
  grantReason,
  hIndex,
  newLife,
  publishReason,
  runCheat,
  personalShare,
  scienceOpen,
  type GameState,
} from '../../src/engine';
import { FUNDER_BY_ID, institutionFor, nationalPrize } from '../../src/content/science';

const researcher = (
  job: string,
  birthYear: number,
  country = 'us',
  seed = 7100,
  age = 30,
): GameState => {
  let s = runCheat(newLife({ birthYear, country }, seed), 'age.set', { age }).state;
  s = runCheat({ ...s, pending: [] }, 'job.set', { job }).state;
  return {
    ...s,
    pending: [],
    cheats: { ...s.cheats, immortal: true },
    player: { ...s.player, stats: { ...s.player.stats, smarts: 85 } },
  };
};
const year = (s: GameState): GameState => ({ ...ageUp({ ...s, pending: [] }).state, pending: [] });
const tryAct = (s: GameState, a: Parameters<typeof act>[1]): GameState => {
  try {
    return act(s, a).state;
  } catch {
    return s;
  }
};
/** A year of a keen researcher: every pip on research, publish where it will be taken, apply wherever open. */
const keenYear = (s: GameState): GameState => {
  let t = s;
  for (let i = 0; i < 3; i++) t = tryAct(t, { type: 'science', id: 'research' });
  for (const tier of [1, 2, 3])
    if (!publishReason(t, tier)) t = tryAct(t, { type: 'science', id: 'publish', tier });
  for (const id of ['seed', 'national', 'foundation', 'industry'])
    if (!grantReason(t, id)) t = tryAct(t, { type: 'science', id: 'apply', funder: id });
  return year(t);
};

describe('science as a pursuit', () => {
  it('is open to research jobs and PhD students, not to everyone', () => {
    expect(scienceOpen(researcher('research_scientist', 1970))).toBe(true);
    expect(scienceOpen(researcher('professor', 1970))).toBe(true);
    expect(scienceOpen(researcher('accountant', 1970))).toBe(false);
  });

  it('research pips push a project to a finished paper, which picks up citations', () => {
    let s = researcher('research_scientist', 1960);
    s = act(s, { type: 'science', id: 'research' }).state;
    expect(s.science?.project?.title).toBeTruthy();
    for (let i = 0; i < 12; i++) s = keenYear(s);
    const papers = s.science?.papers ?? [];
    expect(papers.length).toBeGreaterThanOrEqual(4);
    expect(citations(papers)).toBeGreaterThan(0);
    expect(hIndex(papers)).toBeGreaterThanOrEqual(1);
    expect(s.science?.rep ?? 0).toBeGreaterThan(10);
    expect(s.log.some((e) => /Your paper on .* is published in/.test(e.text))).toBe(true);
  });

  it('grant applications are decided on the next birthday, and a win pays the lab and you', () => {
    let s = researcher('research_scientist', 1960);
    s = act(s, { type: 'science', id: 'apply', funder: 'seed' }).state;
    expect(s.science?.pending.length).toBe(1);
    expect(grantReason(s, 'seed')).toBe('waiting to hear back');
    s = year(s);
    expect(s.science?.pending.length).toBe(0);
    const decided = (s.science?.grants.length ?? 0) + (s.science?.rejected.seed ?? 0);
    expect(decided).toBe(1);
    for (let i = 0; i < 10; i++) s = keenYear(s);
    expect(s.science?.grants.length ?? 0).toBeGreaterThanOrEqual(2);
    expect(s.log.some((e) => e.text.startsWith('💰 Grant money'))).toBe(true);
  });

  it('a rejection makes the next proposal to that funder likelier', () => {
    const s = researcher('research_scientist', 1960);
    const sc = {
      field: 'physics' as const,
      institution: 'x',
      rep: 20,
      project: null,
      papers: [],
      grants: [],
      pending: [],
      rejected: {},
      prizes: [],
    };
    const before = { ...s, science: sc };
    const after = { ...s, science: { ...sc, rejected: { national: 2 } } };
    const f = FUNDER_BY_ID.national;
    if (!f) throw new Error('no national funder');
    expect(
      act(after, { type: 'science', id: 'apply', funder: 'national' }).state.science?.pending[0]
        ?.odds,
    ).toBeGreaterThan(
      act(before, { type: 'science', id: 'apply', funder: 'national' }).state.science?.pending[0]
        ?.odds ?? 1,
    );
  });

  it('Slovenia has its own funders, institutes and prizes, by era', () => {
    const ijs = researcher('research_scientist', 1960, 'si', 7101);
    expect(institutionFor(ijs, 'research_scientist', 0)).toBe('the Jožef Stefan Institute');
    const nat = FUNDER_BY_ID.national;
    const erc = FUNDER_BY_ID.erc_starting;
    if (!nat || !erc) throw new Error('funders missing');
    expect(funderName(ijs, nat)).toBe('the Research Community of Slovenia');
    expect(funderName(ijs, erc)).toBeNull();
    expect(nationalPrize(ijs)).toBe('the Kidrič Award');
    const modern = researcher('research_scientist', 1980, 'si', 7102, 32);
    expect(funderName(modern, nat)).toBe('ARRS, the Slovenian Research Agency');
    expect(funderName(modern, erc)).toBe('the European Research Council');
    expect(nationalPrize(modern)).toBe('the Zois Award');
    const later = researcher('research_scientist', 1990, 'si', 7103, 34);
    expect(funderName(later, nat)).toBe('ARIS, the Slovenian Research and Innovation Agency');
    // ERC money is in euros, the same wherever in Europe.
    expect(funderName(researcher('research_scientist', 1980, 'us', 7104, 32), erc)).toBeNull();
  });

  it('one ERC grant at a time, ERC money goes to the lab, and Slovenian names follow the generation', () => {
    const s = researcher('research_scientist', 1975, 'si', 7105, 38);
    const base = {
      field: 'physics' as const,
      institution: 'x',
      rep: 80,
      project: null,
      papers: [],
      grants: [
        {
          funder: 'erc_starting',
          name: 'ERC',
          kind: 'Starting Grant',
          perYear: 300000,
          from: s.year - 1,
          years: 5,
        },
      ],
      pending: [],
      rejected: {},
      prizes: [],
    };
    const t = { ...s, science: base };
    expect(grantReason(t, 'erc_consolidator')).toBe('one ERC grant at a time');
    expect(personalShare(t, { funder: 'erc_starting', perYear: 300000 })).toBe(0);
    expect(personalShare(t, { funder: 'national', perYear: 100000 })).toBeLessThan(5000);
    const old = newLife({ birthYear: 1935, country: 'si', gender: 'male' }, 7106);
    const young = newLife({ birthYear: 2010, country: 'si', gender: 'male' }, 7106);
    expect([
      'Janez',
      'Franc',
      'Jože',
      'Anton',
      'Ivan',
      'Stanislav',
      'Marjan',
      'Milan',
      'Alojz',
      'Stanko',
      'Rudolf',
      'Vinko',
      'Ciril',
      'Peter',
      'Andrej',
    ]).toContain(old.player.first);
    expect(['Janez', 'Franc', 'Jože', 'Alojz', 'Rudolf', 'Vinko', 'Ciril', 'Stanko']).not.toContain(
      young.player.first,
    );
  });
});
