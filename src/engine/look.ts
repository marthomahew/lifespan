import { Rng, seedRng } from './rng';
import type {
  BrowShape,
  Earrings,
  Headwear,
  EyeColor,
  EyeShape,
  FaceShape,
  FacialHair,
  GameState,
  Gender,
  Glasses,
  HairColor,
  HairCut,
  Look,
  MouthShape,
  NoseShape,
  Npc,
  TopStyle,
} from './types';

type Opt<T> = { id: T; label: string };

/** Skin colours, lightest first, with the emoji tone they map to. */
export const SKIN_COLORS: { hex: string; shade: string; tone: string }[] = [
  { hex: '#f6dccb', shade: '#e8bfa7', tone: '🏻' },
  { hex: '#efc9ac', shade: '#dcab8a', tone: '🏻' },
  { hex: '#e2b48d', shade: '#cc966d', tone: '🏼' },
  { hex: '#cf9a6c', shade: '#b47f53', tone: '🏽' },
  { hex: '#b47c51', shade: '#99633c', tone: '🏽' },
  { hex: '#93603a', shade: '#7a4b2a', tone: '🏾' },
  { hex: '#714527', shade: '#5b361d', tone: '🏾' },
  { hex: '#4f2f1b', shade: '#3e2414', tone: '🏿' },
];

export const FACES: Opt<FaceShape>[] = [
  { id: 'oval', label: 'Oval' },
  { id: 'round', label: 'Round' },
  { id: 'square', label: 'Square' },
  { id: 'long', label: 'Long' },
  { id: 'heart', label: 'Heart' },
];

export const HAIR_CUTS: Opt<HairCut>[] = [
  { id: 'buzz', label: 'Buzz cut' },
  { id: 'short', label: 'Short' },
  { id: 'side', label: 'Side part' },
  { id: 'quiff', label: 'Quiff' },
  { id: 'curly', label: 'Curls' },
  { id: 'afro', label: 'Afro' },
  { id: 'bob', label: 'Bob' },
  { id: 'long', label: 'Long' },
  { id: 'ponytail', label: 'Ponytail' },
  { id: 'bun', label: 'Bun' },
  { id: 'braids', label: 'Braids' },
  { id: 'mohawk', label: 'Mohawk' },
  { id: 'bald', label: 'Bald' },
];

export const HAIR_COLORS: (Opt<HairColor> & { hex: string; natural: boolean })[] = [
  { id: 'black', label: 'Black', hex: '#1f1a17', natural: true },
  { id: 'darkbrown', label: 'Dark brown', hex: '#3b2619', natural: true },
  { id: 'brown', label: 'Brown', hex: '#6b4429', natural: true },
  { id: 'auburn', label: 'Auburn', hex: '#8a3b1e', natural: true },
  { id: 'red', label: 'Red', hex: '#c0522b', natural: true },
  { id: 'blond', label: 'Blond', hex: '#d9b25f', natural: true },
  { id: 'platinum', label: 'Platinum', hex: '#ece0bf', natural: true },
  { id: 'grey', label: 'Grey', hex: '#9a9a9a', natural: false },
  { id: 'white', label: 'White', hex: '#e9e9e6', natural: false },
  { id: 'blue', label: 'Blue', hex: '#3d6fd8', natural: false },
  { id: 'pink', label: 'Pink', hex: '#e7719f', natural: false },
  { id: 'green', label: 'Green', hex: '#3e9f62', natural: false },
  { id: 'purple', label: 'Purple', hex: '#7a4fc4', natural: false },
];

export const EYE_SHAPES: Opt<EyeShape>[] = [
  { id: 'round', label: 'Round' },
  { id: 'almond', label: 'Almond' },
  { id: 'narrow', label: 'Narrow' },
  { id: 'wide', label: 'Wide' },
  { id: 'hooded', label: 'Hooded' },
];

export const EYE_COLORS: (Opt<EyeColor> & { hex: string })[] = [
  { id: 'darkbrown', label: 'Dark brown', hex: '#2e1d12' },
  { id: 'brown', label: 'Brown', hex: '#5b3a1f' },
  { id: 'hazel', label: 'Hazel', hex: '#7d6a2c' },
  { id: 'green', label: 'Green', hex: '#3f7a4a' },
  { id: 'blue', label: 'Blue', hex: '#3b6db3' },
  { id: 'grey', label: 'Grey', hex: '#6f7b86' },
];

export const BROWS: Opt<BrowShape>[] = [
  { id: 'soft', label: 'Soft' },
  { id: 'straight', label: 'Straight' },
  { id: 'arched', label: 'Arched' },
  { id: 'thick', label: 'Thick' },
  { id: 'thin', label: 'Thin' },
  { id: 'angled', label: 'Angled' },
];

export const NOSES: Opt<NoseShape>[] = [
  { id: 'button', label: 'Button' },
  { id: 'straight', label: 'Straight' },
  { id: 'wide', label: 'Wide' },
  { id: 'long', label: 'Long' },
  { id: 'roman', label: 'Roman' },
  { id: 'small', label: 'Small' },
];

export const MOUTHS: Opt<MouthShape>[] = [
  { id: 'smile', label: 'Smile' },
  { id: 'grin', label: 'Grin' },
  { id: 'neutral', label: 'Neutral' },
  { id: 'smirk', label: 'Smirk' },
  { id: 'full', label: 'Full lips' },
];

export const FACIAL_HAIR: Opt<FacialHair>[] = [
  { id: 'none', label: 'None' },
  { id: 'stubble', label: 'Stubble' },
  { id: 'moustache', label: 'Moustache' },
  { id: 'goatee', label: 'Goatee' },
  { id: 'beard', label: 'Beard' },
  { id: 'longbeard', label: 'Long beard' },
];

export const GLASSES: Opt<Glasses>[] = [
  { id: 'none', label: 'None' },
  { id: 'round', label: 'Round' },
  { id: 'square', label: 'Square' },
  { id: 'cateye', label: 'Cat-eye' },
  { id: 'sunglasses', label: 'Sunglasses' },
];

export const TOPS: Opt<TopStyle>[] = [
  { id: 'tee', label: 'T-shirt' },
  { id: 'hoodie', label: 'Hoodie' },
  { id: 'shirt', label: 'Collared shirt' },
  { id: 'sweater', label: 'Sweater' },
  { id: 'vneck', label: 'V-neck' },
];

export const EARRINGS: Opt<Earrings>[] = [
  { id: 'none', label: 'None' },
  { id: 'studs', label: 'Studs' },
  { id: 'hoops', label: 'Hoops' },
  { id: 'drops', label: 'Drops' },
  { id: 'gems', label: 'Gems' },
];

export const HEADWEAR: Opt<Headwear>[] = [
  { id: 'none', label: 'None' },
  { id: 'beanie', label: 'Beanie' },
  { id: 'cap', label: 'Cap' },
  { id: 'bucket', label: 'Bucket hat' },
  { id: 'fedora', label: 'Fedora' },
  { id: 'headscarf', label: 'Headscarf' },
];

export const TOP_COLORS = [
  '#3b6db3',
  '#c2453d',
  '#3e8e5a',
  '#e0a43a',
  '#7a4fc4',
  '#2f3a4a',
  '#d9d4c7',
  '#d0679a',
  '#2c8c8c',
  '#8a5a3b',
];

/** Every pickable feature, with its options: the builder walks this list. */
export const LOOK_PARTS = {
  face: FACES,
  hair: HAIR_CUTS,
  hairColor: HAIR_COLORS,
  eyes: EYE_SHAPES,
  eyeColor: EYE_COLORS,
  brows: BROWS,
  nose: NOSES,
  mouth: MOUTHS,
  facialHair: FACIAL_HAIR,
  glasses: GLASSES,
  top: TOPS,
  earrings: EARRINGS,
  hat: HEADWEAR,
} as const;

export const DEFAULT_LOOK: Look = {
  skin: 2,
  face: 'oval',
  hair: 'short',
  hairColor: 'brown',
  eyes: 'almond',
  eyeColor: 'brown',
  brows: 'soft',
  nose: 'straight',
  mouth: 'smile',
  facialHair: 'none',
  glasses: 'none',
  freckles: false,
  top: 'tee',
  topColor: 0,
  earrings: 'none',
  hat: 'none',
};

const ids = <T>(o: Opt<T>[]): T[] => o.map((x) => x.id);

/** Natural hair colours that suit each skin colour, weighted towards the common ones. */
function naturalHair(r: Rng, skin: number): HairColor {
  if (skin >= 5) return r.pick(['black', 'black', 'black', 'darkbrown'] as const);
  if (skin >= 3) return r.pick(['black', 'black', 'darkbrown', 'darkbrown', 'brown'] as const);
  return r.pick([
    'darkbrown',
    'brown',
    'brown',
    'auburn',
    'red',
    'blond',
    'blond',
    'platinum',
    'black',
  ] as const);
}

/** A believable random look. Rolls only from the cursor it is given. */
export function randomLook(r: Rng, gender: Gender, skin?: number): Look {
  const s = skin ?? r.int(0, SKIN_COLORS.length - 1);
  const masc: HairCut[] = ['buzz', 'short', 'short', 'side', 'quiff', 'curly', 'afro', 'bald'];
  const fem: HairCut[] = ['long', 'long', 'bob', 'ponytail', 'bun', 'curly', 'braids', 'afro'];
  const cut = r.pick(gender === 'male' ? masc : gender === 'female' ? fem : [...masc, ...fem]);
  const beardOdds = gender === 'male' ? 0.35 : gender === 'nonbinary' ? 0.08 : 0;
  return {
    skin: s,
    face: r.pick(ids(FACES)),
    hair: cut === 'afro' && s < 3 ? 'curly' : cut,
    hairColor: naturalHair(r, s),
    eyes: r.pick(ids(EYE_SHAPES)),
    eyeColor:
      s >= 4 ? r.pick(['darkbrown', 'darkbrown', 'brown'] as const) : r.pick(ids(EYE_COLORS)),
    brows: r.pick(ids(BROWS)),
    nose: r.pick(ids(NOSES)),
    mouth: r.pick(ids(MOUTHS)),
    facialHair: r.chance(beardOdds)
      ? r.pick(['stubble', 'moustache', 'goatee', 'beard', 'beard', 'longbeard'] as const)
      : 'none',
    glasses: r.chance(0.18) ? r.pick(['round', 'square', 'cateye'] as const) : 'none',
    freckles: s <= 2 && r.chance(0.25),
    top: r.pick(ids(TOPS)),
    topColor: r.int(0, TOP_COLORS.length - 1),
    earrings: r.chance(gender === 'female' ? 0.35 : 0.08)
      ? r.pick(['studs', 'studs', 'hoops', 'drops'] as const)
      : 'none',
    hat: r.chance(0.06)
      ? r.pick(['beanie', 'cap', 'bucket', 'fedora', 'headscarf'] as const)
      : 'none',
  };
}

/** A fresh cursor for looks, so rolling a face never shifts the life's own RNG. */
export function lookRng(seed: number, salt: number): Rng {
  return new Rng(
    seedRng((Math.imul(seed >>> 0, 0x9e3779b1) ^ Math.imul(salt + 1, 0x85ebca6b)) >>> 0),
  );
}

const has = <T>(list: Opt<T>[], v: unknown): v is T => list.some((o) => o.id === v);

/** Fill a partial or untrusted look from a fallback, dropping anything unknown. */
export function cleanLook(raw: unknown, fallback: Look): Look {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const pick = <K extends keyof typeof LOOK_PARTS>(k: K): Look[K] =>
    (has(LOOK_PARTS[k] as Opt<unknown>[], o[k]) ? o[k] : fallback[k]) as Look[K];
  const num = (v: unknown, max: number, fb: number): number =>
    typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < max ? v : fb;
  return {
    skin: num(o['skin'], SKIN_COLORS.length, fallback.skin),
    face: pick('face'),
    hair: pick('hair'),
    hairColor: pick('hairColor'),
    eyes: pick('eyes'),
    eyeColor: pick('eyeColor'),
    brows: pick('brows'),
    nose: pick('nose'),
    mouth: pick('mouth'),
    facialHair: pick('facialHair'),
    glasses: pick('glasses'),
    freckles: typeof o['freckles'] === 'boolean' ? o['freckles'] : fallback.freckles,
    top: pick('top'),
    topColor: num(o['topColor'], TOP_COLORS.length, fallback.topColor),
    earrings: pick('earrings'),
    hat: pick('hat'),
  };
}

/** The emoji skin tone that goes with a look (for log lines and older screens). */
export function toneOf(look: Look): string {
  return SKIN_COLORS[look.skin]?.tone ?? '';
}

/** The skin indexes drawn for an emoji tone ('' means no preference). */
export function skinsForTone(tone: string): number[] {
  const out = SKIN_COLORS.flatMap((c, i) => (c.tone === tone ? [i] : []));
  return out.length ? out : SKIN_COLORS.map((_, i) => i);
}

/** The skin index closest to an emoji tone. */
export function skinFromTone(tone: string): number {
  return { '': 2, '🏻': 0, '🏼': 2, '🏽': 3, '🏾': 5, '🏿': 7 }[tone] ?? 2;
}

const BLOOD = new Set(['mother', 'father', 'sibling', 'child', 'grandparent']);

/** Mix two looks: a child takes each feature from one parent or the other. */
export function blendLooks(r: Rng, a: Look, b: Look, gender: Gender): Look {
  const fresh = randomLook(r, gender);
  const from = <K extends keyof Look>(k: K): Look[K] => (r.chance(0.5) ? a[k] : b[k]);
  const lo = Math.min(a.skin, b.skin);
  const hi = Math.max(a.skin, b.skin);
  return {
    ...fresh,
    skin: r.int(lo, hi),
    face: from('face'),
    hairColor: r.chance(0.85) ? from('hairColor') : fresh.hairColor,
    eyes: from('eyes'),
    eyeColor: from('eyeColor'),
    brows: from('brows'),
    nose: from('nose'),
    mouth: r.chance(0.7) ? from('mouth') : fresh.mouth,
    freckles: a.freckles || b.freckles ? r.chance(0.6) : false,
  };
}

/** Undyed hair: a dyed parent passes on the colour they were born with, roughly. */
function natural(l: Look): Look {
  const c = HAIR_COLORS.find((h) => h.id === l.hairColor);
  return c?.natural ? l : { ...l, hairColor: l.skin >= 3 ? 'black' : 'brown' };
}

/**
 * An NPC's look, worked out from the life's seed and their id, so it never needs saving.
 * Blood relatives resemble the player; your children take after you and their other parent.
 */
export function npcLook(s: GameState, npc: Npc, depth = 0): Look {
  const r = lookRng(s.seed, npc.lookSeed ?? npc.id);
  const own = randomLook(r, npc.gender);
  const isRelative = npc.roles.some((x) => BLOOD.has(x));
  if (!isRelative || depth > 1) return own;
  // The face you were born with: makeovers and surgery don't change your children's.
  const me = natural(s.player.birthLook ?? s.player.look);
  if (npc.roles.includes('child')) {
    const other = npc.parentIds.find((id) => id !== 0);
    const o = other !== undefined ? s.npcs.find((n) => n.id === other) : undefined;
    return blendLooks(r, me, o ? natural(npcLook(s, o, depth + 1)) : own, npc.gender);
  }
  return blendLooks(r, me, own, npc.gender);
}
