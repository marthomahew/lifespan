import { describe, expect, it } from 'vitest';
import { newLife, runCheat, type GameState } from '../../src/engine';
import { BACKGROUNDS } from '../../src/content/backgrounds';

const born = (background: string | undefined, seed = 1100): GameState =>
  newLife({ birthYear: 1990, country: 'us', ...(background ? { background } : {}) }, seed);

describe('backgrounds', () => {
  it('an ordinary life has none, and is the same life it always was', () => {
    const a = born(undefined);
    expect(a.player.background ?? null).toBeNull();
    expect(JSON.stringify(born(undefined))).toBe(JSON.stringify(a));
  });

  it('every background sets itself up and says so at birth', () => {
    for (const b of BACKGROUNDS) {
      const s = born(b.id);
      expect(s.player.background, b.id).toBe(b.id);
      expect(
        s.log.some((l) => l.text.startsWith(b.emoji)),
        b.id,
      ).toBe(true);
    }
    const twin = born('twin');
    const t = twin.npcs.find((n) => n.flags.includes('twin'));
    expect(t?.age).toBe(0);
    expect(t?.roles).toContain('sibling');
    const fam = born('family_business');
    expect(fam.player.backgroundData?.['business']).toBeTruthy();
    expect(fam.npcs.some((n) => n.flags.includes('business_parent'))).toBe(true);
    const im = born('immigrant_family');
    const from = im.player.backgroundData?.['heritage'];
    expect(from).not.toBe('us');
    expect(im.npcs.find((n) => n.roles.includes('mother'))?.country).toBe(from);
    expect(Object.values(im.player.languages).filter((v) => v >= 60).length).toBeGreaterThanOrEqual(
      2,
    );
    const famous = born('famous_parent');
    expect(famous.player.stats.fame).toBeGreaterThanOrEqual(15);
    const gran = born('grandparents');
    expect(gran.npcs.some((n) => n.flags.includes('raising_grandparent'))).toBe(true);
  });

  it('taking over the family business makes it yours; the adoption search finds her', async () => {
    const { Ctx } = await import('../../src/engine/ctx');
    const { backgroundEffect } = await import('../../src/engine/systems/backgrounds');
    const s = structuredClone(runCheat(born('family_business'), 'age.set', { age: 22 }).state);
    backgroundEffect(new Ctx(s), 'take_fambiz');
    expect(s.business?.name).toBe(s.player.backgroundData?.['business']);
    expect(s.business?.level).toBe(2);
    const a = structuredClone(runCheat(born('adopted'), 'age.set', { age: 25 }).state);
    backgroundEffect(new Ctx(a), 'birth_parent');
    const bm = a.npcs.find((n) => n.flags.includes('birth_parent'));
    expect(bm?.age).toBeGreaterThan(a.player.age + 15);
  });

  it('each background’s stories turn up over a life, and never in an ordinary one', async () => {
    const { ageUp, choose, currentPopup } = await import('../../src/engine');
    const play = (s0: GameState): string[] => {
      let s = { ...s0, cheats: { ...s0.cheats, immortal: true } };
      const seen: string[] = [];
      for (let y = 0; y < 60; y++) {
        s = ageUp({ ...s, pending: [] }).state;
        for (let k = 0; k < 10 && s.pending.length; k++) {
          const p = currentPopup(s);
          if (!p) break;
          if (/^bg[fr]_/.test(p.eventId)) seen.push(p.eventId);
          const id = p.choices.find((c) => c.enabled)?.id;
          if (!id) break;
          s = choose(s, id).state;
        }
      }
      return seen;
    };
    for (const b of BACKGROUNDS) {
      const seen = new Set<string>();
      for (const seed of [1200, 1201, 1202]) for (const id of play(born(b.id, seed))) seen.add(id);
      expect(seen.size, b.id).toBeGreaterThanOrEqual(2);
    }
    expect(play(born(undefined, 1203))).toHaveLength(0);
  });
});
