import { pickFresh } from '../fresh';
import { PET_BY_ID, PET_KINDS, type PetKindDef } from '../../content/pets';
import type { Ctx } from '../ctx';
import { formatMoney, refToLocal } from '../economy';
import { EngineError } from '../errors';
import { addStat } from '../stats';
import type { GameState, Pet } from '../types';
import { clampStat } from '../util';
import { markUsed, usedThisYear } from './usage';

export const MAX_PETS = 4;
export type PetActionId = 'play' | 'walk' | 'vet' | 'rehome';

export const livingPets = (s: GameState): Pet[] => s.pets.filter((p) => p.alive);

/** The pet events talk about: the one you are closest to, of a kind if asked. */
export function favouritePet(s: GameState, kind?: string): Pet | undefined {
  return livingPets(s)
    .filter((p) => !kind || p.kind === kind)
    .sort((a, b) => b.bond - a.bond || a.id - b.id)[0];
}

export function petLabel(p: Pet): string {
  return `${p.name} the ${(PET_BY_ID[p.kind]?.label ?? p.kind).toLowerCase()}`;
}

/** Why you can't bring this animal home now, or null. */
export function adoptReason(s: GameState, kind: string): string | null {
  const def = PET_BY_ID[kind];
  if (!def) return 'unknown animal';
  if (s.death) return 'the life is over';
  if (s.legal.prison) return 'not from prison';
  if (s.player.age < 6) return 'from age 6';
  const living = livingPets(s).length;
  if (s.player.age < 18) {
    // Children ask; parents pay, but only for something small, and only one.
    if (living >= 1) return 'your parents say one is plenty';
    if (def.adoptCost > 300) return 'your parents say absolutely not';
    return null;
  }
  if (living >= MAX_PETS) return 'your home is full of animals already';
  if (s.money.cash < refToLocal(s, def.adoptCost))
    return `costs ${formatMoney(s, refToLocal(s, def.adoptCost))}`;
  return null;
}

export function adoptPet(ctx: Ctx, kind: string, name?: string): Pet {
  const s = ctx.s;
  const why = adoptReason(s, kind);
  if (why) throw new EngineError(`Adopt: ${why}`);
  const def = PET_BY_ID[kind] as PetKindDef;
  if (s.player.age >= 18) s.money.cash -= refToLocal(s, def.adoptCost);
  const pet = givePet(ctx, kind, name, true);
  if (!pet) throw new EngineError('Adopt: no room');
  return pet;
}

/** A new animal joins you (an event's dog, an adoption). Null if the house is already full. */
export function givePet(ctx: Ctx, kind: string, name?: string, announce = false): Pet | null {
  const s = ctx.s;
  const def = PET_BY_ID[kind];
  if (!def || livingPets(s).length >= MAX_PETS) return null;
  const taken = new Set(livingPets(s).map((p) => p.name));
  const chosen = (name ?? '').trim().slice(0, 30);
  const free = def.names.filter((n) => !taken.has(n));
  const [lo, hi] = def.lifespan;
  const pet: Pet = {
    id: s.pets.reduce((m, p) => Math.max(m, p.id), 0) + 1,
    kind,
    name: chosen || ctx.rng.pick(free.length ? free : def.names),
    age: kind === 'tortoise' || kind === 'parrot' ? ctx.rng.int(1, 8) : ctx.rng.int(0, 2),
    bond: 55,
    health: 90,
    lifespan: Math.round(lo + (hi - lo) * Math.min(1, Math.max(0, ctx.rng.normal(0.35, 0.3)))),
    adoptedYear: s.year,
    alive: true,
    lastPlay: s.year,
  };
  s.pets.push(pet);
  if (!s.player.flags.includes('had_pet')) s.player.flags.push('had_pet');
  if (!announce) return pet;
  addStat(s, 'happiness', 6);
  ctx.log(
    'family',
    `${def.emoji} ${s.player.age < 18 ? 'After weeks of asking, you' : 'You'} bring home ${pet.name}, a ${def.label.toLowerCase()}${pet.age > 0 ? ` aged ${pet.age}` : ''}.`,
    true,
  );
  return pet;
}

export function petActionReason(s: GameState, pet: Pet, id: PetActionId): string | null {
  if (!pet.alive) return `${pet.name} is gone`;
  if (s.legal.prison) return 'not from prison';
  const def = PET_BY_ID[pet.kind];
  if (id === 'walk' && !def?.walks) return `${def?.label ?? 'They'}s do not go for walks`;
  if (id === 'vet') {
    const cost = vetCost(s, pet);
    if (s.player.age >= 18 && s.money.cash < cost) return `costs ${formatMoney(s, cost)}`;
  }
  if (id !== 'rehome' && usedThisYear(s, `pet:${pet.id}:${id}`) >= 1) return 'done this year';
  return null;
}

export function vetCost(s: GameState, pet: Pet): number {
  return refToLocal(s, pet.kind === 'horse' ? 900 : pet.kind === 'dog' ? 350 : 180);
}

export function petAction(ctx: Ctx, petId: number, id: PetActionId): void {
  const s = ctx.s;
  const pet = s.pets.find((p) => p.id === petId);
  if (!pet) throw new EngineError(`unknown pet ${petId}`);
  const why = petActionReason(s, pet, id);
  if (why) throw new EngineError(why);
  markUsed(s, `pet:${pet.id}:${id}`);
  const def = PET_BY_ID[pet.kind];
  const r = ctx.rng;
  switch (id) {
    case 'play':
      pet.bond = clampStat(pet.bond + r.int(7, 12));
      pet.lastPlay = s.year;
      addStat(s, 'happiness', r.int(2, 4));
      ctx.log(
        'family',
        `${def?.emoji ?? '🐾'} ${pickFresh(
          ctx,
          (PLAY_LINES[pet.kind] ?? PLAY_LINES['any'] ?? ['']).map((l) =>
            l.split('{name}').join(pet.name),
          ),
        )}`
          .split('{name}')
          .join(pet.name),
      );
      break;
    case 'walk':
      pet.bond = clampStat(pet.bond + r.int(5, 9));
      pet.health = clampStat(pet.health + 3);
      pet.lastPlay = s.year;
      addStat(s, 'health', 2);
      addStat(s, 'happiness', 1);
      ctx.log(
        'family',
        `${def?.emoji ?? '🐾'} ${pickFresh(
          ctx,
          WALK_LINES.map((l) => l.split('{name}').join(pet.name)),
        )}`,
      );
      break;
    case 'vet': {
      const cost = vetCost(s, pet);
      if (s.player.age >= 18) s.money.cash -= cost;
      pet.health = clampStat(pet.health + 25);
      pet.bond = clampStat(pet.bond - 2);
      ctx.log(
        'health',
        `🩺 ${pet.name} has a check-up and gives the vet a look of deep betrayal. A clean bill of health, mostly.`,
      );
      break;
    }
    case 'rehome':
      endPet(ctx, pet, 'rehomed');
      addStat(s, 'happiness', pet.bond > 70 ? -8 : -3);
      ctx.log(
        'family',
        `🏡 You find ${pet.name} a new home. It is the right thing, and it does not feel like it.`,
      );
      break;
  }
}

function endPet(ctx: Ctx, pet: Pet, fate: string): void {
  pet.alive = false;
  pet.fate = fate;
  pet.endYear = ctx.s.year;
}

/** The year for every animal: ageing, the bond, upkeep, joy, and sometimes goodbye. */
export function petsTick(ctx: Ctx): void {
  const s = ctx.s;
  const r = ctx.rng;
  let joy = 0;
  for (const pet of livingPets(s)) {
    const def = PET_BY_ID[pet.kind];
    if (!def) continue;
    pet.age += 1;
    // Prison means someone else has to take them.
    if (s.legal.prison) {
      endPet(ctx, pet, 'rehomed');
      ctx.log(
        'family',
        `${def.emoji} With you inside, ${pet.name} goes to live with a friend of the family.`,
      );
      continue;
    }
    if (pet.lastPlay < s.year - 1) pet.bond = clampStat(pet.bond - 6);
    if (s.player.age >= 18) s.money.cash -= refToLocal(s, def.upkeep);
    const old = pet.age / pet.lifespan;
    if (old > 0.75) pet.health = clampStat(pet.health - r.int(6, 16));
    // Past their years the odds rise fast, and nothing lives far beyond its span.
    const odds =
      pet.age >= Math.ceil(pet.lifespan * 1.2) + 1
        ? 1
        : pet.age >= pet.lifespan
          ? 0.45
          : old > 0.8 && pet.health < 30
            ? 0.25
            : pet.health < 10
              ? 0.3
              : 0.008;
    if (r.chance(odds)) {
      endPet(ctx, pet, 'died');
      addStat(s, 'happiness', -(4 + Math.round(pet.bond / 10)));
      s.player.flags.push('pet_died');
      ctx.log(
        'family',
        `💔 ${pet.name}, your ${def.label.toLowerCase()}, dies at ${pet.age}${pet.age >= pet.lifespan ? ', after a long and well-loved life' : ''}. The house is very quiet.`,
        true,
      );
      continue;
    }
    if ((pet.kind === 'cat' || pet.kind === 'dog') && pet.bond < 20 && r.chance(0.15)) {
      endPet(ctx, pet, 'ran off');
      ctx.log(
        'family',
        `${def.emoji} ${pet.name} slips out one evening and does not come back. A neighbour says they look happy two streets away.`,
      );
      continue;
    }
    joy += (def.joy * pet.bond) / 100;
  }
  if (joy >= 1) addStat(s, 'happiness', Math.min(4, Math.round(joy)));
}

/** Every animal you ever had, for the obituary. */
export function petsEver(s: GameState): string[] {
  return s.pets.map(petLabel);
}

export const PET_KIND_IDS = PET_KINDS.map((p) => p.id);

const WALK_LINES = [
  'You walk {name} around the park twice. {name} wants a third lap and is not shy about it.',
  'A long walk with {name} in the drizzle. You both come home muddy and pleased with yourselves.',
  '{name} meets eleven other dogs, two squirrels and a pigeon on the walk. A full social calendar.',
];

const PLAY_LINES: Record<string, string[]> = {
  dog: [
    'You throw the ball for {name} until your arm aches. {name} could do this forever.',
    '{name} learns to shake hands. You tell everyone, at length.',
    'A game of tug with a sock that used to be yours. {name} wins, as is traditional.',
    '{name} finds a stick roughly the length of a canoe and insists on bringing it home.',
    'You hide treats around the garden. {name} finds all of them, and one you lost in March.',
    '{name} falls asleep mid-zoomies, upside down, legs in the air. You take a photo for the archive.',
  ],
  cat: [
    '{name} graciously allows you to dangle a string. For four minutes. Then leaves.',
    '{name} falls asleep on your chest and you do not move for an hour.',
    '{name} discovers a cardboard box and is happier than with any toy you have ever bought.',
    'You and {name} watch the birds from the window together, both making the same small noise.',
    '{name} brings you a sock, places it at your feet and looks at you with enormous pride.',
    '{name} headbutts your hand until you stop working. You stop working.',
  ],
  parrot: [
    '{name} learns a new word. Unfortunately it is your ringtone.',
    '{name} sings along to the radio, badly and with feeling.',
    '{name} rides around the flat on your shoulder, commenting on everything.',
    '{name} dismantles a cardboard tube with the focus of a surgeon. It is very satisfying to watch.',
  ],
  horse: [
    'A long ride with {name} on a clear morning. Nothing else in the world for an hour.',
    'You brush {name} until the coat shines. {name} leans into it like a very large cat.',
    '{name} takes an apple from your palm with enormous, careful lips.',
    'A gallop along the edge of the field. You come back windswept and grinning.',
  ],
  rabbit: [
    '{name} does a sudden leap and twist in the air, which you learn is called a binky. It means joy.',
    'You build {name} a tunnel out of boxes. {name} runs through it forty times, thumping approval.',
    '{name} accepts a sprig of parsley from your fingers with great ceremony.',
    '{name} flops over sideways, utterly content. You lie on the floor beside them for a while.',
  ],
  hamster: [
    '{name} stuffs both cheeks with seeds until their face doubles in size, then looks at you, smug.',
    'You build {name} a cardboard maze. It is solved in eleven seconds and partly eaten in twelve.',
    '{name} runs a full marathon on the wheel at midnight. You are both very tired the next day.',
    '{name} sits in your cupped hands, tiny and warm, washing their whiskers.',
  ],
  fish: [
    '{name} follows your finger along the glass. You choose to believe this is friendship.',
    'You add a little plastic castle to the tank. {name} inspects it thoroughly and moves in.',
    'Feeding time: {name} meets you at the top of the water every single morning, right on time.',
    'You watch {name} drift through the weed for ten minutes. It is cheaper than meditation.',
  ],
  tortoise: [
    '{name} crosses the whole lawn in search of a dandelion. It takes all afternoon and is worth it.',
    'You hand-feed {name} a strawberry. Their whole face turns red and they look delighted.',
    '{name} basks under the lamp, eyes half shut, the very picture of a life well managed.',
    '{name} follows you around the garden, slowly, at their own pace, which is the only pace.',
  ],
  any: [
    'You spend an afternoon with {name}. Small, silly and the best part of the week.',
    '{name} does something adorable and you take forty photographs of it.',
    '{name} has a new favourite spot, which is wherever you are sitting.',
    'You build {name} something out of cardboard and tape. It is the best thing you have made all year.',
    'Ten quiet minutes watching {name}. Your shoulders come down from round your ears.',
    'You talk to {name} about your day. {name} is an excellent listener.',
  ],
};
