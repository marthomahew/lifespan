import { describe, expect, it } from 'vitest';
import { newLife, runCheat, type GameState, type Npc } from '../../../src/engine';

const adult = (): GameState =>
  runCheat(newLife({ country: 'us', birthYear: 1990 }, 30), 'age.set', { age: 30 }).state;
const kid = (): GameState =>
  runCheat(newLife({ country: 'us', birthYear: 1990 }, 31), 'age.set', { age: 12 }).state;
const mom = (s: GameState): Npc => s.npcs.find((n) => n.roles.includes('mother')) as Npc;
const last = (s: GameState): Npc => s.npcs.at(-1) as Npc;

describe('relationship cheats (M5.9)', () => {
  it("'npc.list' lists everyone with ids", () => {
    const s = adult();
    expect(runCheat(s, 'npc.list', {}).message).toContain(`${mom(s).id}: ${mom(s).first}`);
  });

  it("'npc.rel' sets a relationship", () => {
    const s = adult();
    expect(mom(runCheat(s, 'npc.rel', { id: String(mom(s).id), value: 3 }).state).rel).toBe(3);
  });

  it("'npc.kill' and 'npc.revive'", () => {
    const s = adult();
    const dead = runCheat(s, 'npc.kill', { id: String(mom(s).id) }).state;
    expect(mom(dead).alive).toBe(false);
    expect(mom(runCheat(dead, 'npc.revive', { id: String(mom(s).id) }).state).alive).toBe(true);
  });

  it("'npc.spawn' adds an NPC by role with chosen traits", () => {
    const s = runCheat(adult(), 'npc.spawn', { role: 'friend', traits: 'funny,loyal' }).state;
    expect(last(s).roles).toContain('friend');
    expect(last(s).traits).toEqual(['funny', 'loyal']);
    for (const role of ['partner', 'child', 'sibling', 'father']) {
      const r = runCheat(adult(), 'npc.spawn', { role }).state;
      expect(r.npcs.some((n) => n.roles.includes(role as Npc['roles'][number]))).toBe(true);
    }
    expect(runCheat(kid(), 'npc.spawn', { role: 'partner' }).message).toMatch(/adults only/i);
  });

  it("'romance.force' starts dating an adult only", () => {
    const s = runCheat(adult(), 'npc.spawn', { role: 'coworker' }).state;
    const c = last(s);
    const r = runCheat(s, 'romance.force', { id: String(c.id) }).state;
    expect(r.npcs.find((n) => n.id === c.id)?.romance?.stage).toBe('dating');
    const k = runCheat(kid(), 'npc.spawn', { role: 'friend' }).state;
    expect(runCheat(k, 'romance.force', { id: String(last(k).id) }).message).toBe('Adults only');
  });

  it("'marry.now' and 'divorce.now'", () => {
    const s = runCheat(adult(), 'npc.spawn', { role: 'coworker' }).state;
    const c = last(s);
    const m = runCheat(s, 'marry.now', { id: String(c.id) }).state;
    expect(m.npcs.find((n) => n.id === c.id)?.roles).toContain('spouse');
    expect(m.player.flags).toContain('ever_married');
    const d = runCheat(m, 'divorce.now', {}).state;
    expect(d.npcs.find((n) => n.id === c.id)?.roles).toContain('ex');
  });

  it("'baby.now' is adults only", () => {
    const s = runCheat(adult(), 'baby.now', {}).state;
    expect(s.npcs.filter((n) => n.roles.includes('child'))).toHaveLength(1);
    expect(runCheat(kid(), 'baby.now', {}).message).toBe('Adults only');
  });

  it("'npc.stat' and 'npc.trait' edit an NPC", () => {
    const s = adult();
    const id = String(mom(s).id);
    expect(mom(runCheat(s, 'npc.stat', { id, stat: 'smarts', value: 99 }).state).stats.smarts).toBe(
      99,
    );
    const t = runCheat(s, 'npc.trait', { id, trait: 'reckless' }).state;
    expect(mom(t).traits).toContain('reckless');
    expect(mom(runCheat(t, 'npc.trait', { id, trait: 'reckless' }).state).traits).not.toContain(
      'reckless',
    );
  });
});
