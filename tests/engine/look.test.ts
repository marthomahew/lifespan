import { describe, expect, it } from 'vitest';
import {
  act,
  continueAsChild,
  newLife,
  runCheat,
  type GameState,
  type Npc,
} from '../../src/engine';
import {
  cleanLook,
  DEFAULT_LOOK,
  LOOK_PARTS,
  lookRng,
  npcLook,
  randomLook,
  SKIN_COLORS,
  toneOf,
} from '../../src/engine/look';
import { migrate } from '../../src/engine/save';

const features = (l: object): string[] => Object.entries(l).map(([k, v]) => `${k}:${String(v)}`);
const shared = (a: object, b: object): number => {
  const fb = new Set(features(b));
  return features(a).filter((f) => fb.has(f)).length;
};

describe('looks', () => {
  it('every builder part has several options, and a random look only uses real ones', () => {
    for (const opts of Object.values(LOOK_PARTS)) expect(opts.length).toBeGreaterThanOrEqual(5);
    for (let i = 0; i < 200; i++) {
      const l = randomLook(lookRng(i, 1), i % 2 ? 'male' : 'female');
      expect(cleanLook(l, DEFAULT_LOOK)).toEqual(l);
      if (i % 2 === 0) expect(l.facialHair).toBe('none');
    }
  });

  it('cleanLook keeps what is valid and drops the rest', () => {
    const l = cleanLook(
      { hair: 'afro', hairColor: 'teal', skin: 99, glasses: 'round' },
      DEFAULT_LOOK,
    );
    expect(l.hair).toBe('afro');
    expect(l.glasses).toBe('round');
    expect(l.hairColor).toBe(DEFAULT_LOOK.hairColor);
    expect(l.skin).toBe(DEFAULT_LOOK.skin);
  });

  it('a new life takes the picked features, rolls the rest, and keeps the emoji tone in step', () => {
    const s = newLife({ look: { hair: 'braids', eyeColor: 'green', skin: 6 } }, 21);
    expect(s.player.look).toMatchObject({ hair: 'braids', eyeColor: 'green', skin: 6 });
    expect(s.player.appearance).toBe(SKIN_COLORS[6]?.tone);
    expect(newLife({}, 21).player.look).toEqual(newLife({}, 21).player.look);
    const tone = newLife({ appearance: '🏿' }, 22);
    expect(toneOf(tone.player.look)).toBe('🏿');
  });

  it('family resembles you; strangers are just themselves, and the same every time', () => {
    let s: GameState = newLife({ birthYear: 1990 }, 30);
    const relatives = s.npcs.filter(
      (n) => n.roles.includes('mother') || n.roles.includes('sibling'),
    );
    expect(relatives.length).toBeGreaterThan(0);
    for (const n of relatives) {
      expect(npcLook(s, n)).toEqual(npcLook(s, n));
      const diff = Math.abs(npcLook(s, n).skin - s.player.look.skin);
      expect(diff).toBeLessThanOrEqual(7);
    }
    // Over many lives, a sibling shares more features with you than a stranger does.
    let sib = 0;
    let stranger = 0;
    for (let seed = 1; seed <= 60; seed++) {
      s = newLife({ siblings: 1, birthYear: 1990 }, seed);
      const b = s.npcs.find((n) => n.roles.includes('sibling'));
      if (!b) continue;
      const fake: Npc = { ...b, id: 9999, roles: ['friend'] };
      sib += shared(npcLook(s, b), s.player.look);
      stranger += shared(npcLook(s, fake), s.player.look);
    }
    expect(sib).toBeGreaterThan(stranger * 1.5);
  });

  it('an heir keeps the face they had as your child', () => {
    let s = runCheat(newLife({ birthYear: 1970, gender: 'female' }, 31), 'age.set', {
      age: 30,
    }).state;
    s = runCheat({ ...s, pending: [] }, 'baby.now', {}).state;
    const kid = s.npcs.find((n) => n.roles.includes('child'));
    if (!kid) throw new Error('no child');
    const face = npcLook(s, kid);
    s = runCheat({ ...s, pending: [] }, 'deathbot', {}).state;
    const next = continueAsChild(s, kid.id);
    expect(next.player.look).toEqual(face);
  });

  it('v5 saves get a portrait from their old hair and tone', () => {
    const raw = JSON.parse(JSON.stringify(newLife({}, 32))) as Record<string, unknown> & {
      player: Record<string, unknown>;
    };
    delete raw.player['look'];
    raw.player['hair'] = 'red';
    raw.player['appearance'] = '🏼';
    raw['schemaVersion'] = 5;
    const up = migrate(raw) as unknown as GameState;
    expect(up.player.look.hairColor).toBe('red');
    expect(toneOf(up.player.look)).toBe('🏼');
    expect('hair' in up.player).toBe(false);
  });
});

describe('cosmetic surgery', () => {
  it('a good result gives the face you picked; complications pick a nose for you', () => {
    const seen = new Set<string>();
    for (let seed = 40; seed < 70; seed++) {
      let s = runCheat(newLife({ birthYear: 1980, country: 'us' }, seed), 'age.set', {
        age: 35,
      }).state;
      s = runCheat({ ...s, pending: [] }, 'money.add', { amount: 50000 }).state;
      const before = s.player.look;
      const wanted = { nose: before.nose === 'roman' ? 'button' : 'roman', face: 'heart' };
      const after = act(s, { type: 'activity', id: 'plastic_surgery', params: wanted }).state;
      const text = after.log
        .slice(s.log.length)
        .map((e) => e.text)
        .join(' ');
      const l = after.player.look;
      if (/mirror is kind/.test(text)) {
        expect(l).toMatchObject(wanted);
        seen.add('good');
      } else if (/long nap/.test(text)) {
        expect(l).toEqual(before);
        seen.add('none');
      } else if (/opinions of its own/.test(text)) {
        expect(l.face).toBe('heart');
        seen.add('bad');
      }
      // Hair is not a surgeon's job.
      expect(l.hair).toBe(before.hair);
    }
    expect(seen.has('good') && seen.has('none')).toBe(true);
  });
});
