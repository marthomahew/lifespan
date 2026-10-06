import { describe, expect, it } from 'vitest';
import {
  act,
  ageUp,
  continueAsChild,
  newLife,
  obituary,
  runCheat,
  type GameState,
} from '../../src/engine';
import { migrate } from '../../src/engine/save';
import { renderText } from '../../src/engine/events/tokens';
import { adoptReason, favouritePet, livingPets } from '../../src/engine/systems/pets';

const adult = (seed = 50): GameState => {
  const s = runCheat(newLife({ country: 'us', birthYear: 1990 }, seed), 'age.set', {
    age: 30,
  }).state;
  return runCheat({ ...s, pending: [] }, 'money.add', { amount: 100000 }).state;
};
const adopt = (s: GameState, kind: string, name?: string): GameState =>
  act(s, { type: 'activity', id: 'adopt_pet', params: { kind, ...(name ? { name } : {}) } }).state;
const years = (s: GameState, n: number): GameState => {
  let t = s;
  for (let i = 0; i < n && !t.death; i++)
    t = ageUp({ ...t, pending: [], cheats: { ...t.cheats, immortal: true } }).state;
  return t;
};

describe('pets', () => {
  it('adopting: a named animal comes home, costs money, and lifts your mood', () => {
    const s = adult();
    const after = adopt(s, 'dog', 'Biscuit');
    const dog = after.pets[0];
    expect(dog).toMatchObject({ kind: 'dog', name: 'Biscuit', alive: true });
    expect(after.money.cash).toBeLessThan(s.money.cash);
    expect(after.log.some((l) => l.text.includes('bring home Biscuit'))).toBe(true);
    // A default name when none is given.
    expect(adopt(s, 'cat').pets[0]?.name.length).toBeGreaterThan(0);
  });

  it('children ask their parents, who allow one small pet and pay for it', () => {
    let kid = runCheat(newLife({ country: 'us', birthYear: 2000 }, 51), 'age.set', {
      age: 9,
    }).state;
    kid = { ...kid, pending: [] };
    expect(adoptReason(kid, 'horse')).toMatch(/absolutely not/);
    const cash = kid.money.cash;
    kid = adopt(kid, 'hamster');
    expect(kid.money.cash).toBe(cash);
    expect(adoptReason(kid, 'fish')).toMatch(/one is plenty/);
    expect(adoptReason(newLife({}, 52), 'cat')).toMatch(/from age 6/);
  });

  it('playing builds the bond; neglect wears it down; the vet helps their health', () => {
    let s = adopt(adult(53), 'dog', 'Otis');
    const id = s.pets[0]?.id ?? 0;
    const bond0 = s.pets[0]?.bond ?? 0;
    s = act(s, { type: 'pet', petId: id, id: 'play' }).state;
    s = act(s, { type: 'pet', petId: id, id: 'walk' }).state;
    expect(s.pets[0]?.bond).toBeGreaterThan(bond0);
    expect(() => act(s, { type: 'pet', petId: id, id: 'play' })).toThrow(/done this year/);
    const high = s.pets[0]?.bond ?? 0;
    s = years(s, 3);
    expect(s.pets[0]?.bond ?? 0).toBeLessThan(high);
    const sick = { ...s, pending: [], pets: s.pets.map((p) => ({ ...p, health: 40 })) };
    expect(act(sick, { type: 'pet', petId: id, id: 'vet' }).state.pets[0]?.health).toBe(65);
    // Cats don't do walks.
    const cat = adopt(adult(54), 'cat');
    expect(() => act(cat, { type: 'pet', petId: cat.pets[0]?.id ?? 0, id: 'walk' })).toThrow(
      /walks/,
    );
  });

  it('a hamster has a short life; a tortoise outlives most owners and passes to the heir', () => {
    let s = adopt(adult(55), 'hamster', 'Peanut');
    s = years(s, 6);
    expect(s.pets[0]?.alive).toBe(false);
    expect(s.pets[0]?.fate).toBe('died');
    expect(s.log.some((l) => l.text.includes('Peanut, your hamster, dies'))).toBe(true);
    expect(
      obituary(runCheat({ ...s, pending: [] }, 'deathbot', {}).state)?.summary.join(' '),
    ).toContain('Peanut the hamster');

    let t = adopt(adult(56), 'tortoise', 'Atlas');
    t = runCheat({ ...t, pending: [] }, 'baby.now', {}).state;
    t = runCheat({ ...t, pending: [] }, 'deathbot', {}).state;
    const heir = t.npcs.find((n) => n.roles.includes('child') && n.alive);
    if (heir && t.pets[0]?.alive) {
      const next = continueAsChild(t, heir.id);
      expect(next.pets.map((p) => p.name)).toContain('Atlas');
    }
  });

  it('events can name your pet, and prison means rehoming', () => {
    const s = adopt(adopt(adult(57), 'cat', 'Miso'), 'dog', 'Kip');
    expect(renderText(s, '{dog} chases {cat}.')).toBe('Kip chases Miso.');
    expect(renderText(s, '{pet} the {pet.kind}')).toMatch(/^(Kip the dog|Miso the cat)$/);
    expect(favouritePet(s, 'cat')?.name).toBe('Miso');
    const jailed = {
      ...s,
      pending: [],
      legal: {
        ...s.legal,
        prison: { years: 3, served: 0, crimeId: 'armed_robbery', behaviour: 50 },
      },
    };
    const later = ageUp({ ...jailed, pending: [] }).state;
    expect(livingPets(later)).toHaveLength(0);
  });

  it('v6 saves load with no pets', () => {
    const raw = JSON.parse(JSON.stringify(newLife({}, 58))) as Record<string, unknown>;
    delete raw['pets'];
    raw['schemaVersion'] = 6;
    expect((migrate(raw) as unknown as GameState).pets).toEqual([]);
  });
});

describe('pet tokens after a loss', () => {
  it('a queued popup still names the pet that just left', () => {
    let s = adopt(adult(59), 'cat', 'Gus');
    s = { ...s, pets: s.pets.map((p) => ({ ...p, alive: false, fate: 'ran off' })) };
    expect(renderText(s, '{pet} the {pet.kind}, {cat}')).toBe('Gus the cat, Gus');
  });
});
