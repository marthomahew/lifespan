import { describe, expect, it } from 'vitest';
import { choose, newLife, runCheat, type GameState } from '../../src/engine';
import { EVENT_BY_ID } from '../../src/content/events';
import { validateEvents } from '../../scripts/content-lib';
import type { EventDef } from '../../src/engine/events/types';

const adult = (seed: number, age = 30, gender: 'male' | 'female' = 'male'): GameState => {
  const s = runCheat(newLife({ birthYear: 1975, country: 'us', gender }, seed), 'age.set', {
    age,
  }).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true } };
};

describe('fixes from the fifth transcript playtest', () => {
  it('caught for something new while on the run: the old years come due and the run ends', async () => {
    const { Ctx } = await import('../../src/engine/ctx');
    const { imprison } = await import('../../src/engine/systems/crime');
    const s = structuredClone(adult(800));
    s.legal.fugitive = { since: s.year - 3, owed: 4, crimeId: 'theft' };
    s.player.flags.push('fugitive', 'false_papers');
    imprison(new Ctx(s), 'theft', 2);
    expect(s.legal.fugitive).toBeNull();
    expect(s.legal.prison?.years).toBe(6);
    expect(s.player.flags).not.toContain('fugitive');
    // Cellmates share the player's gender.
    expect(s.npcs.find((n) => n.roles.includes('cellmate'))?.gender).toBe('male');
    const w = structuredClone(adult(801, 30, 'female'));
    imprison(new Ctx(w), 'theft', 2);
    expect(w.npcs.find((n) => n.roles.includes('cellmate'))?.gender).toBe('female');
  });

  it('a friend or enemy the story names is that person', async () => {
    const { Ctx } = await import('../../src/engine/ctx');
    const { applyStatusEffect } = await import('../../src/engine/systems/status-effects');
    const tomasz = EVENT_BY_ID['school_p_new_kid']?.choices
      ?.find((c) => c.id === 'invite')
      ?.outcomes[0]?.effects.find((e) => 'status' in e);
    expect(tomasz).toMatchObject({ status: 'friend', first: 'Tomasz', gender: 'male' });
    const s = structuredClone(adult(802));
    const pal = s.npcs[0]!;
    const before = s.npcs.length;
    applyStatusEffect(new Ctx(s), 'enemy', pal);
    expect(s.npcs.length).toBe(before);
    expect(pal.roles).toContain('enemy');
    expect(pal.rel).toBeLessThanOrEqual(25);
  });

  it('the content check catches "watch{x.s}"', () => {
    const bad: EventDef = {
      id: 'bad_verb',
      kind: 'notice',
      category: 'random',
      ages: [20, 30],
      weight: 1,
      bind: { kid: { role: 'friend' } },
      text: 'You stand there while {kid.first} watch{kid.s} the kettle.',
      outcomes: [{ chance: 1, text: 'It boils.', effects: [] }],
    };
    expect(
      validateEvents([bad])
        .map((f) => f.msg)
        .join('\n'),
    ).toMatch(/without its -es/);
  });

  it('a sibling married from afar stays married; marrying moves you out of your parents’', async () => {
    const wed = EVENT_BY_ID['prison2_sibling_wedding'];
    expect(wed?.bind?.['sib']?.notFlag).toBe('npc_married');
    for (const c of wed?.choices ?? [])
      for (const o of c.outcomes)
        expect(o.effects).toContainEqual({ npcFlag: 'sib', flag: 'npc_married' });
    let s = runCheat(adult(803, 24), 'npc.spawn', { role: 'partner' }).state;
    s = { ...s, pending: [], assets: { ...s.assets, housing: 'parents' } };
    const pt = s.npcs.find((n) => n.roles.includes('partner'));
    s = runCheat(s, 'marry.now', { id: String(pt?.id) }).state;
    expect(s.assets.housing).toBe('renting');
    // Nothing to deposit: no "You put $0 in savings."
    const { act } = await import('../../src/engine');
    const broke = { ...s, pending: [], money: { ...s.money, cash: 0 } };
    const after = act(broke, { type: 'money', action: { op: 'deposit', amount: 100 } }).state;
    expect(after.log.some((l) => / 0 in savings/.test(l.text))).toBe(false);
  });

  it('an ordinary job covers an ordinary life in every country; pensions stay below pay', async () => {
    const { ageUp } = await import('../../src/engine');
    const { pensionFor } = await import('../../src/engine/systems/careers');
    for (const country of ['us', 'ng', 'mx', 'br', 'se', 'in']) {
      let s = runCheat(newLife({ birthYear: 1990, country }, 5), 'age.set', { age: 30 }).state;
      s = runCheat({ ...s, pending: [] }, 'job.set', { job: 'retail_associate' }).state;
      s = {
        ...s,
        pending: [],
        assets: { ...s.assets, housing: 'renting' },
        cheats: { ...s.cheats, immortal: true, noBadEvents: true },
      };
      const next = ageUp(s).state;
      expect(next.money.last?.net ?? -1, country).toBeGreaterThan(0);
      const veteran = { ...s, career: { ...s.career, yearsWorked: 45 } };
      expect(pensionFor(veteran), country).toBeLessThan(s.career.salary);
    }
  });

  it('a simple operation is not a dilemma, and a chronic condition is managed, not cured', async () => {
    const { Ctx } = await import('../../src/engine/ctx');
    const { addIllness, illnessPlan } = await import('../../src/engine/systems/illness');
    const s = structuredClone(adult(810));
    addIllness(new Ctx(s), 'appendicitis', true);
    expect(s.pending.some((p) => p.eventId === 'hl_serious_diagnosis')).toBe(false);
    const c = structuredClone(adult(811, 60));
    addIllness(new Ctx(c), 'copd', false);
    const ill = c.health.illnesses.find((i) => i.id === 'copd');
    if (ill) ill.severity = 10;
    illnessPlan(new Ctx(c), 'aggressive', 'copd');
    expect(c.health.illnesses.some((i) => i.id === 'copd')).toBe(true);
  });

  it('every record gets its own title; office stories need an office; bosses stay put', async () => {
    const { act } = await import('../../src/engine');
    let s = structuredClone(adult(812, 25));
    s.player.skills['voice'] = 90;
    s.music = { ...s.music, stage: 3, act: 'solo' };
    s.settings = { ...s.settings, freeTime: false };
    for (let i = 0; i < 12; i++) {
      s = act({ ...s, pending: [] }, { type: 'music', id: 'release' }).state;
      s = { ...s, usage: { year: s.year, used: {} } };
    }
    const titles = s.music.releases.map((r) => r.title);
    expect(new Set(titles).size).toBe(titles.length);
    const laborer = runCheat(adult(813), 'job.set', { job: 'construction_worker' }).state;
    for (const id of ['work_ad_moonshot', 'work_ad_reply_all_storm', 'work_sr_knowledge'])
      expect(EVENT_BY_ID[id]?.when?.(laborer), id).toBe(false);
  });

  it('retiring somewhere warm means a warm city', () => {
    const warm: Record<string, string[] | null> = {
      mx: null,
      br: null,
      au: ['Sydney', 'Brisbane', 'Perth', 'Darwin', 'Adelaide'],
      fr: ['Marseille', 'Montpellier', 'Toulouse'],
    };
    let seen = 0;
    for (let seed = 820; seed < 840; seed++) {
      let s = runCheat(adult(seed, 68), 'money.add', { amount: 200000 }).state;
      s = runCheat({ ...s, pending: [] }, 'event.fire', {
        event: 'late_chapter',
        force: 'on',
      }).state;
      const sun = s.pending.length ? s : null;
      if (!sun) continue;
      let after: GameState;
      try {
        after = choose(sun, 'sun').state;
      } catch {
        continue;
      }
      const cities = warm[after.player.country];
      expect(after.player.country in warm).toBe(true);
      if (cities) expect(cities).toContain(after.player.city);
      seen++;
    }
    expect(seen).toBeGreaterThan(3);
  });
});
