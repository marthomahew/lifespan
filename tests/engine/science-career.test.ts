import { describe, expect, it } from 'vitest';
import {
  act,
  ageUp,
  hireReason,
  labCapacity,
  labReason,
  moveTownReason,
  newLife,
  patentable,
  runCheat,
  type GameState,
  type ScienceRecord,
} from '../../src/engine';

const researcher = (job: string, country = 'us', seed = 8100, age = 32): GameState => {
  let s = runCheat(newLife({ birthYear: 1970, country }, seed), 'age.set', { age }).state;
  s = runCheat({ ...s, pending: [] }, 'job.set', { job }).state;
  return {
    ...s,
    pending: [],
    cheats: { ...s.cheats, immortal: true },
    player: { ...s.player, stats: { ...s.player.stats, smarts: 85 } },
  };
};
const record = (s: GameState, extra: Partial<ScienceRecord> = {}): ScienceRecord => ({
  field: 'chem',
  institution: 'your institute',
  rep: 40,
  project: null,
  papers: [],
  grants: [
    {
      funder: 'national',
      name: 'NSF',
      kind: 'project grant',
      perYear: 400000,
      from: s.year - 1,
      years: 6,
    },
  ],
  pending: [],
  rejected: {},
  prizes: [],
  ...extra,
});
const year = (s: GameState): GameState => ({ ...ageUp({ ...s, pending: [] }).state, pending: [] });

describe('the research career', () => {
  it('grants pay for a lab: students join, defend after five years, and leave when money ends', () => {
    let s = researcher('research_scientist');
    expect(hireReason({ ...s, science: record(s, { grants: [] }) })).toBe(
      'needs a grant to pay them',
    );
    s = { ...s, science: record(s) };
    expect(labCapacity(s)).toBeGreaterThanOrEqual(2);
    s = act(s, { type: 'science', id: 'hire', role: 'phd' }).state;
    s = act(s, { type: 'science', id: 'hire', role: 'postdoc' }).state;
    expect(s.science?.lab?.length).toBe(2);
    expect(s.npcs.filter((n) => n.roles.includes('labmate'))).toHaveLength(2);
    for (let i = 0; i < 5; i++) s = year(s);
    expect(s.log.some((e) => e.text.startsWith('🎓'))).toBe(true);
    expect(s.log.some((e) => /faculty job of their own/.test(e.text))).toBe(true);
    expect(s.science?.lab?.length ?? 0).toBe(0);
  });

  it('a professor faces tenure after six years: denied without papers, granted with them', () => {
    const base = researcher('professor', 'us', 8101, 33);
    let denied: GameState = {
      ...base,
      career: { ...base.career, level: 1, since: base.year - 6, performance: 0 },
    };
    denied = { ...denied, science: record(denied, { grants: [] }) };
    denied = year(denied);
    expect(denied.science?.tenure ?? 0).toBeLessThan(0);
    expect(denied.career.jobId).toBeNull();
    let granted: GameState = {
      ...base,
      career: { ...base.career, level: 1, since: base.year - 6, performance: 0 },
    };
    const papers = [0, 1, 2, 3].map((i) => ({
      year: granted.year - i,
      title: `p${i}`,
      venue: 'x',
      tier: 2,
      quality: 60,
      cites: 10,
    }));
    granted = { ...granted, science: record(granted, { papers }) };
    granted = year(granted);
    expect(granted.science?.tenure ?? 0).toBeGreaterThan(0);
    expect(granted.career.jobId).toBe('professor');
    expect(labReason(granted, 'sabbatical')).toBeNull();
    granted = act(granted, { type: 'science', id: 'lab', what: 'sabbatical' }).state;
    expect(labReason(granted, 'sabbatical')).toMatch(/next in/);
  });

  it('conferences, reviewing and teaching are once-a-year professional duties', () => {
    let s = researcher('professor');
    s = { ...s, science: record(s, { papers: [] }) };
    s = act(s, { type: 'science', id: 'lab', what: 'conference' }).state;
    expect(labReason(s, 'conference')).toBe('once a year');
    expect(labReason(s, 'review')).toBe('after two papers of your own');
    s = act(s, { type: 'science', id: 'lab', what: 'teach' }).state;
    expect(labReason(s, 'teach')).toBe('once a year');
    expect(labReason(researcher('chemist'), 'teach')).toBe('professors teach');
  });

  it('a strong applied paper can be patented, and a licence pays royalties', () => {
    let s = researcher('chemist', 'us', 8102);
    const paper = {
      year: s.year - 1,
      title: 'the chemistry of a better battery',
      venue: 'Science',
      tier: 0,
      quality: 90,
      cites: 50,
    };
    s = { ...s, money: { ...s.money, cash: 1e7 }, science: record(s, { papers: [paper] }) };
    expect(patentable(s)).toEqual([0]);
    s = act(s, { type: 'science', id: 'patent', paper: 0 }).state;
    expect(patentable(s)).toEqual([]);
    for (let i = 0; i < 3; i++) s = year(s);
    expect(s.science?.patents?.[0]?.licensed).not.toBeNull();
  });

  it('you can move to another town; Slovenian towns know their region', () => {
    let s = researcher('chemist', 'si', 8103);
    s = { ...s, money: { ...s.money, cash: 1e6 } };
    const to = s.player.city === 'Slovenj Gradec' ? 'Maribor' : 'Slovenj Gradec';
    expect(moveTownReason(s, to)).toBeNull();
    s = act(s, { type: 'move_town', city: to }).state;
    expect(s.player.city).toBe(to);
    expect(moveTownReason(s, 'Ljubljana')).toBe('once a year');
  });
});
