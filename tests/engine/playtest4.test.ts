import { describe, expect, it } from 'vitest';
import { newLife, runCheat, type GameState } from '../../src/engine';
import { EVENTS, EVENT_BY_ID } from '../../src/content/events';
import { prunePending } from '../../src/engine/events/select';

const adult = (seed: number, age = 40): GameState => {
  const s = runCheat(newLife({ birthYear: 1970, country: 'us' }, seed), 'age.set', { age }).state;
  return { ...s, pending: [], cheats: { ...s.cheats, immortal: true } };
};

describe('fixes from the fourth transcript playtest', () => {
  it('a queued popup whose condition a choice has undone is dropped', () => {
    const s = structuredClone(adult(700));
    s.career.jobId = null;
    const needsJob = EVENTS.find((e) => e.when && !e.bind && !e.when(s) && e.id === 'wl_lawsuit');
    expect(needsJob).toBeDefined();
    s.pending = [
      { eventId: 'wl_lawsuit', bindings: {}, payload: {}, source: 'random' },
      { eventId: 'wl_lawsuit', bindings: {}, payload: {}, source: 'chain' },
    ];
    prunePending(s);
    expect(s.pending.map((p) => p.source)).toEqual(['chain']);
  });

  it('events that need a situation wait for it', () => {
    const when = (id: string, s: GameState): boolean => {
      const def = EVENT_BY_ID[id];
      return !def?.when || def.when(s);
    };
    const s = structuredClone(adult(701, 55));
    // A living parent: the family home isn't empty.
    expect(s.npcs.some((n) => n.alive && n.roles.includes('mother'))).toBe(true);
    expect(when('mid2_family_home', s)).toBe(false);
    for (const n of s.npcs)
      if (n.roles.includes('mother') || n.roles.includes('father')) n.alive = false;
    expect(when('mid2_family_home', s)).toBe(true);
    // Never partnered: no dating "again".
    expect(s.npcs.some((n) => n.roles.includes('ex'))).toBe(false);
    expect(when('rom2_dating_again_later', s)).toBe(false);
    // Living with a partner: no flatmates.
    const young = runCheat(structuredClone(adult(702, 22)), 'npc.spawn', { role: 'partner' }).state;
    expect(
      when('ya2_bad_flatmate', { ...young, assets: { ...young.assets, housing: 'renting' } }),
    ).toBe(false);
    // The baby-name event belongs to a real newborn granddaughter.
    expect(EVENT_BY_ID['mid2_baby_name']?.bind?.['baby']).toMatchObject({
      role: 'grandchild',
      maxAge: 0,
    });
  });

  it('an injury is the one the story describes, and plural conditions get plural verbs', async () => {
    const { Ctx } = await import('../../src/engine/ctx');
    const { addInjury, injuryFromText } = await import('../../src/engine/systems/injuries');
    expect(injuryFromText('Your ankle goes like snapping celery.', 'minor')).toBe('sprained ankle');
    expect(injuryFromText('You break your wrist on the ice.', 'major')).toBe('broken wrist');
    const s = structuredClone(adult(703));
    addInjury(new Ctx(s), 14, 'You land badly and hear your wrist go.');
    expect(s.health.injuryList.at(-1)?.kind).toBe('broken wrist');
    // No body part in the story: the log says what it was.
    const before = s.log.length;
    addInjury(new Ctx(s), 8, 'It all goes wrong at once.');
    expect(s.log.slice(before).some((l) => l.text.startsWith('🩹 The damage:'))).toBe(true);
    const { ILLNESS_BY_ID } = await import('../../src/content/illnesses');
    expect(ILLNESS_BY_ID['migraines']?.plural).toBe(true);
  });

  it('a sealed juvenile record asks no questions; nobody graduates from a cell', async () => {
    const { Ctx } = await import('../../src/engine/ctx');
    const { schoolTick } = await import('../../src/engine/systems/education');
    const s = structuredClone(adult(704, 19));
    s.player.flags.push('ex_con');
    s.legal.releasedYear = s.year - 1;
    s.legal.record = [
      {
        crimeId: 'theft',
        year: s.year - 3,
        age: 16,
        verdict: 'convicted',
        sentenceYears: 2,
        juvenile: true,
      },
    ];
    s.career.jobId = null;
    s.legal.sealed = true;
    expect(EVENT_BY_ID['rel_interview_record']?.when?.(s)).toBe(false);
    expect(EVENT_BY_ID['rel_landlord_check']?.when?.(s)).toBe(false);
    s.legal.sealed = false;
    expect(EVENT_BY_ID['rel_interview_record']?.when?.(s)).toBe(true);
    // Eighteen and inside: no diploma ceremony.
    const kid = structuredClone(adult(705, 17));
    kid.education.degrees = kid.education.degrees.filter((d) => d.level !== 'high_school');
    kid.player.age = 18;
    kid.legal.prison = { years: 3, served: 1, crimeId: 'theft', behaviour: 50 };
    schoolTick(new Ctx(kid));
    expect(kid.education.degrees.some((d) => d.level === 'high_school')).toBe(false);
  });

  it('a story-made friend can be their own age; a stale follow-up is dropped after a long sentence', async () => {
    const { Ctx } = await import('../../src/engine/ctx');
    const { applyStatusEffect } = await import('../../src/engine/systems/status-effects');
    const { runDueChains } = await import('../../src/engine/events/select');
    const s = structuredClone(adult(706, 60));
    applyStatusEffect(new Ctx(s), 'friend', undefined, undefined, { first: 'Robin', age: 19 });
    expect(s.npcs.find((n) => n.first === 'Robin')?.age).toBe(19);
    expect(EVENT_BY_ID['prison2_new_arrival']?.once).toBe(true);
    s.legal.prison = { years: 20, served: 10, crimeId: 'theft', behaviour: 50 };
    s.chains = [
      {
        eventId: 'wl_startup_news',
        dueYear: s.year,
        firstDue: s.year - 6,
        payload: {},
        bindings: {},
      },
      { eventId: 'wl_startup_news', dueYear: s.year, payload: {}, bindings: {} },
    ];
    runDueChains(new Ctx(s));
    expect(s.chains).toHaveLength(1);
    expect(s.chains[0]?.firstDue).toBe(s.year);
  });

  it('office stories need an office; superstars don’t busk; nobody freelances from a cell', async () => {
    const { officeJob } = await import('../../src/content/events/conditions');
    const { musicReason } = await import('../../src/engine/systems/music');
    const { act } = await import('../../src/engine');
    const laborer = runCheat(adult(707), 'job.set', { job: 'construction_worker' }).state;
    const coder = runCheat(adult(707), 'job.set', { job: 'software_engineer' }).state;
    expect(officeJob(laborer)).toBe(false);
    expect(officeJob(coder)).toBe(true);
    expect(EVENT_BY_ID['work_ad_open_plan']?.when?.(laborer)).toBe(false);
    const star = structuredClone(adult(708));
    star.player.stats.fame = 90;
    star.player.skills['voice'] = 80;
    expect(musicReason(star, 'busk')).toMatch(/famous/);
    const inside = structuredClone(adult(709));
    inside.legal.prison = { years: 3, served: 1, crimeId: 'theft', behaviour: 50 };
    expect(() => act(inside, { type: 'career', id: 'freelance' })).toThrow(/prison/);
  });

  it('no trying for a baby past it, and no cutting off a toddler', async () => {
    const { interactionReason } = await import('../../src/engine/systems/interactions');
    const { INTERACTION_BY_ID } = await import('../../src/content/interactions');
    let s = runCheat(
      newLife({ birthYear: 1950, country: 'us', gender: 'female' }, 710),
      'age.set',
      {
        age: 65,
      },
    ).state;
    s = runCheat({ ...s, pending: [] }, 'npc.spawn', { role: 'spouse' }).state;
    s = { ...s, player: { ...s.player, stats: { ...s.player.stats, fertility: 0 } } };
    const sp = s.npcs.find((n) => n.roles.includes('spouse'));
    const baby = INTERACTION_BY_ID['try_for_baby'];
    if (sp && sp.gender === 'female') sp.fertility = 0;
    expect(sp && baby ? interactionReason(s, sp, baby) : null).toMatch(/too late|fertility clinic/);
    const p = runCheat(adult(711, 35), 'baby.now', {}).state;
    const kid = p.npcs.find((n) => n.roles.includes('child'));
    const cut = INTERACTION_BY_ID['cut_off'];
    expect(kid && cut ? interactionReason({ ...p, pending: [] }, kid, cut) : null).toMatch(
      /too young/,
    );
  });

  it('tax evasion needs an income to hide', async () => {
    const { crimeReason } = await import('../../src/engine/systems/crime');
    const idle = structuredClone(adult(712));
    idle.career.jobId = null;
    idle.career.pension = 0;
    expect(crimeReason(idle, 'tax_evasion')).toMatch(/no income/);
    expect(
      crimeReason(runCheat(adult(712), 'job.set', { job: 'accountant' }).state, 'tax_evasion'),
    ).toBeNull();
  });
});
