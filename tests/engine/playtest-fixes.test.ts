import { describe, expect, it } from 'vitest';
import { newLife, runCheat, type GameState } from '../../src/engine';
import { botStep, newBotMemory } from '../../src/engine/bot/persona';
import { Rng, seedRng } from '../../src/engine/rng';

/** Play a whole life with a sim persona. */
function play(seed: number, persona: 'family' | 'default' | 'chaos' = 'family'): GameState {
  let s = newLife({}, seed);
  const r = new Rng(seedRng(seed * 7));
  const mem = newBotMemory();
  for (let i = 0; i < 3000 && !s.death; i++) s = botStep(s, persona, r, mem);
  return s;
}

describe('fixes from the playtest', () => {
  it('nobody new shares a first name with you or your family', () => {
    for (const seed of [404, 606, 909, 101]) {
      const s = play(seed);
      const family = s.npcs.filter((n) =>
        n.roles.some((r) =>
          ['mother', 'father', 'sibling', 'child', 'grandparent', 'spouse'].includes(r),
        ),
      );
      const names = family.map((n) => n.first);
      const dupes = names.filter((n, i) => names.indexOf(n) !== i);
      expect(dupes, `seed ${seed}`).toEqual([]);
      expect(names, `seed ${seed}`).not.toContain(s.player.first);
    }
  });

  it('no births to a mother past her mid-forties', () => {
    for (const seed of [909, 910, 911, 912]) {
      const s = play(seed);
      for (const kid of s.npcs.filter((n) => n.roles.includes('child'))) {
        const mum = [
          s.player.gender === 'female'
            ? { age: s.player.age, birthYear: s.player.birthYear }
            : null,
        ]
          .concat(s.npcs.filter((n) => kid.parentIds.includes(n.id) && n.gender === 'female'))
          .filter(Boolean)[0];
        if (!mum || kid.flags.includes('adopted')) continue;
        expect(kid.birthYear - mum.birthYear, `seed ${seed} ${kid.first}`).toBeLessThanOrEqual(47);
      }
    }
  });

  it('a 60-year-old woman cannot conceive, whoever her partner is', () => {
    const s = runCheat(newLife({ gender: 'female', birthYear: 1950 }, 3), 'age.set', {
      age: 60,
    }).state;
    expect(s.player.stats.fertility).toBe(0);
  });
});

describe('named strangers', () => {
  it('when an outcome names a new friend, the friend gets that name', async () => {
    const { EVENTS } = await import('../../src/content/events');
    for (const e of EVENTS)
      for (const o of [...(e.choices ?? []).flatMap((c) => c.outcomes), ...(e.outcomes ?? [])]) {
        const m = o.text.match(/(?:named|called) ([A-Z][a-z]+)/);
        const st = o.effects.find(
          (x) => 'status' in x && (x.status === 'friend' || x.status === 'enemy') && !x.with,
        );
        if (m && st && 'status' in st) expect(st.first, `${e.id}: ${m[0]}`).toBe(m[1]);
      }
  });
});

describe('wealth titles', () => {
  it('a modest fortune in yen or won is not "rich beyond reason"', async () => {
    const { LIFE_TITLES } = await import('../../src/content/achievements');
    const { refToLocal } = await import('../../src/engine/economy');
    const rich = LIFE_TITLES.filter((t) => /rich|million/i.test(t.title));
    expect(rich.length).toBeGreaterThan(0);
    for (const country of ['jp', 'kr']) {
      let s = runCheat(newLife({ country, birthYear: 1980 }, 5), 'age.set', { age: 40 }).state;
      s = { ...s, pending: [], money: { ...s.money, cash: refToLocal(s, 48_000) } };
      for (const t of rich) expect(t.when(s), `${t.title} in ${country}`).toBe(false);
    }
  });
});

describe('the family dog', () => {
  it('"Get a dog" really brings home a dog', async () => {
    const { choose } = await import('../../src/engine');
    let s = runCheat(newLife({ country: 'us', birthYear: 1970, gender: 'female' }, 8), 'age.set', {
      age: 30,
    }).state;
    s = runCheat({ ...s, pending: [] }, 'baby.now', {}).state;
    s = runCheat({ ...s, pending: [] }, 'age.set', { age: 40 }).state;
    s = runCheat({ ...s, pending: [] }, 'money.add', { amount: 10000 }).state;
    s = runCheat({ ...s, pending: [] }, 'event.fire', {
      event: 'par_older_pet',
      force: 'on',
    }).state;
    expect(s.pending[0]?.eventId).toBe('par_older_pet');
    s = choose(s, 'dog').state;
    expect(s.pets.map((p) => `${p.name}:${p.kind}`)).toContain('Biscuit:dog');
  });
});

describe('wording', () => {
  it('crimes are charged as nouns, and survivors are named with who they were', async () => {
    const { CRIMES } = await import('../../src/content/crimes');
    for (const c of CRIMES)
      expect(c.charge, c.id).not.toMatch(
        /^(commit|burgle|steal|deal|evade|shoplift|pickpocket|vandalise|embezzle|assault someone)\b/,
      );
    const { obituary } = await import('../../src/engine');
    let s = runCheat(newLife({ birthYear: 1960, gender: 'female' }, 12), 'age.set', {
      age: 30,
    }).state;
    s = runCheat({ ...s, pending: [] }, 'baby.now', {}).state;
    s = runCheat({ ...s, pending: [] }, 'deathbot', {}).state;
    const ob = obituary(s);
    for (const line of ob?.survivors ?? [])
      expect(line).toMatch(/^(son|daughter|child|husband|wife|spouse|partner)\b/);
  });

  it('a chronic condition reads as routine after the first treatment', async () => {
    const s0 = runCheat(newLife({ birthYear: 1980, country: 'us' }, 13), 'age.set', {
      age: 40,
    }).state;
    let s = runCheat({ ...s0, pending: [] }, 'illness.add', { illness: 'migraines' }).state;
    s = runCheat({ ...s, pending: [] }, 'money.add', { amount: 100000 }).state;
    const { act, ageUp } = await import('../../src/engine');
    const lines: string[] = [];
    for (let i = 0; i < 6; i++) {
      s = { ...s, pending: [], cheats: { ...s.cheats, forceSuccess: true } };
      const r = act(s, { type: 'treat', illness: 'migraines', method: 'doctor' });
      lines.push(r.state.log.at(-1)?.text ?? '');
      s = ageUp({ ...r.state, pending: [] }).state;
    }
    expect(lines.filter((l) => l.includes('under control')).length).toBeLessThanOrEqual(1);
  });
});

describe('life inside comes back outside', () => {
  it('each thing you built in prison has an event after release', async () => {
    const { EVENT_BY_ID } = await import('../../src/content/events');
    const base = runCheat(newLife({ birthYear: 1970 }, 14), 'age.set', { age: 40 }).state;
    const pairs: [string, string][] = [
      ['prison_degree', 'rel2_degree_interview'],
      ['prison_garden', 'rel2_allotment'],
      ['prison_mentor', 'rel2_mentee_call'],
      ['prison_list', 'rel2_first_things'],
      ['prison_trade_cert', 'rel2_trade_trial'],
    ];
    for (const [flag, id] of pairs) {
      const s = {
        ...base,
        player: { ...base.player, flags: [...base.player.flags, 'ex_con', flag] },
      };
      const e = EVENT_BY_ID[id];
      expect(e?.when?.(s), id).toBe(true);
      expect(e?.when?.(base), `${id} without the flag`).toBe(false);
    }
  });
});

describe('school grades', () => {
  it('an ordinary child earns ordinary grades, not an F from day one', async () => {
    const { ageUp } = await import('../../src/engine');
    const grades: number[] = [];
    const firstDay: string[] = [];
    for (let seed = 30; seed < 50; seed++) {
      let s = newLife({ birthYear: 2000 }, seed);
      for (let a = 0; a < 12; a++) s = ageUp({ ...s, pending: [] }).state;
      grades.push(s.education.grade);
      firstDay.push(
        ...s.log.filter((l) => l.age === 6 && /report card/.test(l.text)).map((l) => l.text),
      );
    }
    const mean = grades.reduce((a, b) => a + b, 0) / grades.length;
    expect(mean).toBeGreaterThan(52);
    expect(mean).toBeLessThan(78);
    expect(grades.filter((g) => g >= 55).length).toBeGreaterThan(grades.length / 2);
    expect(firstDay).toEqual([]);
  });
});

describe('heirs', () => {
  it('an adult heir keeps the job they had, and their diploma matches their grades', async () => {
    const { continueAsChild } = await import('../../src/engine');
    let s = runCheat(newLife({ birthYear: 1950, gender: 'female' }, 15), 'age.set', {
      age: 30,
    }).state;
    s = runCheat({ ...s, pending: [] }, 'baby.now', {}).state;
    s = runCheat({ ...s, pending: [] }, 'age.set', { age: 70 }).state;
    const kid = s.npcs.find((n) => n.roles.includes('child'));
    if (!kid) throw new Error('no child');
    s = {
      ...s,
      pending: [],
      npcs: s.npcs.map((n) => (n.id === kid.id ? { ...n, job: 'Nurse' } : n)),
    };
    s = runCheat(s, 'deathbot', {}).state;
    const heir = s.npcs.find((n) => n.id === kid.id);
    if (!heir?.alive) return;
    const next = continueAsChild(s, kid.id);
    const { PARENT_JOB_LINK } = await import('../../src/content/family');
    const link = heir.job ? PARENT_JOB_LINK[heir.job] : undefined;
    if (link && next.player.age >= 22 && next.player.age < 66)
      expect(next.career.jobId).toBe(link[0]);
    const hs = next.education.degrees.find((d) => d.level === 'high_school');
    if (hs) expect(hs.gpa).toBeCloseTo(next.education.grade / 25, 1);
  });
});

describe('a child’s costs', () => {
  it('parents pay for the doctor and lessons; holidays are theirs to plan', async () => {
    const { act, activitiesFor } = await import('../../src/engine');
    let kid = runCheat(newLife({ birthYear: 2000, country: 'us' }, 16), 'age.set', {
      age: 9,
    }).state;
    kid = { ...kid, pending: [], money: { ...kid.money, cash: 0 } };
    const views = activitiesFor(kid);
    const doc = views.find((a) => a.id === 'doctor_visit');
    expect(doc?.enabled).toBe(true);
    expect(doc?.parentsPay).toBe(true);
    expect(views.find((a) => a.id === 'vacation')?.reason).toMatch(/family plans/);
    const after = act(kid, { type: 'activity', id: 'doctor_visit' }).state;
    expect(after.money.cash).toBe(0);
  });
});
