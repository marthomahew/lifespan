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
