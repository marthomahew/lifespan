import { describe, expect, it } from 'vitest';
import {
  act,
  interactionOdds,
  interactionsFor,
  newLife,
  runCheat,
  type GameState,
  type Npc,
} from '../../src/engine';
import { INTERACTIONS, INTERACTION_BY_ID } from '../../src/content/interactions';
import { clone } from '../../src/engine/util';

function adult(seed = 1): GameState {
  let s = newLife({ country: 'us', birthYear: 1990 }, seed);
  s = runCheat(s, 'age.set', { age: 30 }).state;
  s = runCheat(s, 'money.add', { amount: 100000 }).state;
  s = runCheat(s, 'npc.spawn', { role: 'friend' }).state;
  return { ...s, cheats: { ...s.cheats, immortal: true } };
}
const friendOf = (s: GameState): Npc =>
  s.npcs.filter((n) => n.roles.includes('friend')).at(-1) as Npc;

describe('relationship interactions (M5.3)', () => {
  it('has at least 12 interactions, each with texts for success and failure', () => {
    expect(INTERACTIONS.length).toBeGreaterThanOrEqual(12);
    for (const i of INTERACTIONS) {
      expect(i.success.texts.length).toBeGreaterThanOrEqual(2);
      expect(i.failure.texts.length).toBeGreaterThanOrEqual(2);
      expect(i.success.memory.length).toBeGreaterThan(3);
      expect(i.failure.memory.length).toBeGreaterThan(3);
    }
  });

  it('every interaction writes a memory line and changes the log', () => {
    const base = adult(2);
    const f = friendOf(base);
    for (const id of [
      'spend_time',
      'conversation',
      'compliment',
      'insult',
      'argue',
      'gift',
      'ask_money',
      'apologize',
      'hug',
      'prank',
      'ask_advice',
    ]) {
      const r = act(base, { type: 'interact', npcId: f.id, id });
      const n = r.state.npcs.find((x) => x.id === f.id) as Npc;
      expect(n.memory.length, id).toBe(f.memory.length + 1);
      expect(r.log.length, id).toBeGreaterThan(0);
      expect(r.log[0]?.text).not.toMatch(/\{/);
    }
  });

  it('odds depend on the relationship, traits and memory', () => {
    const s = adult(3);
    const f = friendOf(s);
    const def = INTERACTION_BY_ID['spend_time'];
    if (!def) throw new Error('def');
    const low = interactionOdds(s, { ...f, rel: 10 }, def);
    const high = interactionOdds(s, { ...f, rel: 90 }, def);
    expect(high).toBeGreaterThan(low);
    const charming = interactionOdds(
      { ...s, player: { ...s.player, traits: ['charming'] } },
      f,
      def,
    );
    const awkward = interactionOdds({ ...s, player: { ...s.player, traits: ['awkward'] } }, f, def);
    expect(charming).toBeGreaterThan(awkward);
    const sour = interactionOdds(
      s,
      {
        ...f,
        memory: Array.from({ length: 5 }, (_, i) => ({
          year: 2000 + i,
          text: 'the insult',
          delta: -15,
        })),
      },
      def,
    );
    const sweet = interactionOdds(
      s,
      {
        ...f,
        memory: Array.from({ length: 5 }, (_, i) => ({
          year: 2000 + i,
          text: 'the gift',
          delta: 10,
        })),
      },
      def,
    );
    expect(sweet).toBeGreaterThan(sour);
  });

  it('outcomes vary with the RNG', () => {
    const results = new Set<string>();
    for (let seed = 1; seed <= 12; seed++) {
      const s = adult(seed);
      const f = friendOf(s);
      const r = act(s, { type: 'interact', npcId: f.id, id: 'prank' });
      results.add((r.state.npcs.find((n) => n.id === f.id)?.memory.at(-1)?.text ?? '') as string);
    }
    expect(results.size).toBeGreaterThan(1);
  });

  it('limits repeats per year and blocks romance with minors', () => {
    const s = adult(4);
    const f = friendOf(s);
    const once = act(s, { type: 'interact', npcId: f.id, id: 'gift' }).state;
    expect(() => act(once, { type: 'interact', npcId: f.id, id: 'gift' })).toThrow(
      /done this year/,
    );
    const kid = newLife({}, 5);
    const sib = clone(kid).npcs.find((n) => n.roles.includes('mother')) as Npc;
    const views = interactionsFor(kid, sib);
    expect(views.find((v) => v.id === 'date_night')?.enabled).toBe(false);
  });

  it('gifts cost money and asking for money can pay out', () => {
    const s = adult(6);
    const f = friendOf(s);
    expect(act(s, { type: 'interact', npcId: f.id, id: 'gift' }).state.money.cash).toBeLessThan(
      s.money.cash,
    );
    const rich = clone(s);
    const rf = friendOf(rich);
    rf.money = 1e7;
    rf.rel = 100;
    const forced = { ...rich, cheats: { ...rich.cheats, forceSuccess: true } };
    expect(
      act(forced, { type: 'interact', npcId: rf.id, id: 'ask_money' }).state.money.cash,
    ).toBeGreaterThan(rich.money.cash);
  });

  it('cutting someone off and reaching out again', () => {
    const s = adult(7);
    const f = friendOf(s);
    const cut = act(s, { type: 'interact', npcId: f.id, id: 'cut_off' }).state;
    const n = cut.npcs.find((x) => x.id === f.id) as Npc;
    expect(n.flags).toContain('cut_off');
    expect(n.rel).toBe(0);
    expect(interactionsFor(cut, n).find((v) => v.id === 'spend_time')?.reason).toBe(
      'you cut them off',
    );
    const back = act(
      { ...cut, cheats: { ...cut.cheats, forceSuccess: true } },
      { type: 'interact', npcId: f.id, id: 'reconnect' },
    ).state;
    expect(back.npcs.find((x) => x.id === f.id)?.flags).not.toContain('cut_off');
  });
});
