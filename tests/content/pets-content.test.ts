import { describe, expect, it } from 'vitest';
import { EVENTS } from '../../src/content/events';
import { PET_KINDS } from '../../src/content/pets';
import { act, newLife, runCheat, type GameState } from '../../src/engine';
import { tokensIn } from '../../src/engine/events/tokens';
import { PET_TOKENS } from '../../scripts/content-lib';

const texts = (e: (typeof EVENTS)[number]): string[] => [
  e.text,
  ...(e.choices ?? []).flatMap((c) => [c.label, ...c.outcomes.map((o) => o.text)]),
  ...(e.outcomes ?? []).map((o) => o.text),
];
const petTokens = (e: (typeof EVENTS)[number]): string[] =>
  texts(e)
    .flatMap((t) => tokensIn(t))
    .filter((t) => PET_TOKENS.has(t));

const base = (age: number): GameState => {
  const s = runCheat(newLife({ country: 'us', birthYear: 1970 }, 61), 'age.set', { age }).state;
  return runCheat({ ...s, pending: [] }, 'money.add', { amount: 1_000_000 }).state;
};

describe('pet events', () => {
  const users = EVENTS.filter((e) => petTokens(e).length > 0);

  it('there is a pet pack, and every event that names a pet needs one', () => {
    expect(users.length).toBeGreaterThanOrEqual(18);
    for (const age of [10, 30, 70]) {
      const s = base(age);
      for (const e of users)
        expect(e.when?.(s) ?? true, `${e.id} at ${age} with no pet`).toBe(false);
    }
  });

  it('a kind token is only used when that kind of animal is there', () => {
    for (const kind of PET_KINDS) {
      const others = PET_KINDS.filter((k) => k.id !== kind.id && k.id !== 'hamster').slice(0, 1);
      for (const other of others) {
        let s = base(30);
        s = act(s, { type: 'activity', id: 'adopt_pet', params: { kind: other.id } }).state;
        for (const e of users.filter((x) => petTokens(x).includes(kind.id)))
          expect(e.when?.(s) ?? true, `${e.id} with only a ${other.id}`).toBe(false);
      }
    }
  });
});
