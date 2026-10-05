import type { NewLifeOptions } from '../engine/life';
import type { GameState } from '../engine/types';

/** A life with a premise and a goal: replay value with a reason (S19). */
export type ChallengeDef = {
  id: string;
  title: string;
  emoji: string;
  /** How the life starts (anything not set is rolled as usual). */
  setup: NewLifeOptions;
  premise: string;
  goal: string;
  /** 1–3 */
  difficulty: 1 | 2 | 3;
  done: (s: GameState) => boolean;
  /** Missed if not done by this age. */
  byAge?: number;
  /** Carried on to the heir instead of ending with this life. */
  spansGenerations?: boolean;
};

const realNetWorth = (s: GameState): number => {
  const m = s.money;
  const a = s.assets;
  const local =
    m.cash +
    m.savings +
    Object.values(m.holdings).reduce((x, y) => x + y, 0) +
    [...a.homes, ...a.vehicles, ...a.possessions].reduce((x, y) => x + y.value, 0) -
    m.loans.reduce((x, l) => x + l.balance, 0);
  return local / Math.max(1e-9, s.inflation);
};
const kids = (s: GameState): number => s.npcs.filter((n) => n.roles.includes('child')).length;
const flag = (s: GameState, f: string): boolean => s.player.flags.includes(f);

export const CHALLENGES: ChallengeDef[] = [
  {
    id: 'rags_to_riches',
    title: 'Rags to Riches',
    emoji: '💸',
    setup: { wealth: 'poor', parents: 'mother' },
    premise: 'Born poor, raised by a single mother who works two jobs.',
    goal: 'Become a millionaire (in today’s money).',
    difficulty: 2,
    done: (s) => realNetWorth(s) >= 1_000_000,
  },
  {
    id: 'doctor_from_nowhere',
    title: 'The Doctor from Nowhere',
    emoji: '🩺',
    setup: { wealth: 'poor', stats: { smarts: 30 } },
    premise: 'A poor family, an ordinary start, and nobody in the house has a degree.',
    goal: 'Practise as a doctor by 40.',
    difficulty: 3,
    done: (s) => s.career.jobId === 'doctor' && s.career.level >= 1,
    byAge: 40,
  },
  {
    id: 'big_family',
    title: 'Full House',
    emoji: '👨‍👩‍👧‍👦',
    setup: { siblings: 0 },
    premise: 'An only child who always wanted a noisy house.',
    goal: 'Raise five children.',
    difficulty: 2,
    done: (s) => kids(s) >= 5,
  },
  {
    id: 'centenarian',
    title: 'One Hundred Candles',
    emoji: '🎂',
    setup: {},
    premise: 'An ordinary life, lived for as long as possible.',
    goal: 'Live to 100.',
    difficulty: 3,
    done: (s) => s.player.age >= 100,
  },
  {
    id: 'globetrotter',
    title: 'Citizen of Everywhere',
    emoji: '🌍',
    setup: { country: 'ng' },
    premise: 'Born in Lagos with a passport and a restless streak.',
    goal: 'Live in three different countries.',
    difficulty: 2,
    done: (s) =>
      new Set([
        s.player.birthCountry,
        ...s.player.flags.filter((f) => f.startsWith('lived:')).map((f) => f.slice(6)),
        s.player.country,
      ]).size >= 3,
  },
  {
    id: 'rock_star',
    title: 'Rock Star',
    emoji: '🎸',
    setup: { talent: 'instrument', traits: ['musical'] },
    premise: 'A natural musician from the first saucepan.',
    goal: 'Sign a record deal and reach fame 70.',
    difficulty: 2,
    done: (s) => s.music.label !== null && s.player.stats.fame >= 70,
  },
  {
    id: 'second_act',
    title: 'Second Act',
    emoji: '🔑',
    setup: { wealth: 'working' },
    premise: 'Some people get one chance. You will need two.',
    goal: 'Serve time in prison, then reach senior level (level 3) in a career.',
    difficulty: 3,
    done: (s) => flag(s, 'ex_con') && s.career.jobId !== null && s.career.level >= 3,
  },
  {
    id: 'polyglot',
    title: 'Polyglot',
    emoji: '🗣️',
    setup: { country: 'se', traits: ['bookish'] },
    premise: 'A Swedish childhood and a talent for other people’s words.',
    goal: 'Speak four languages at 60 or better by 50.',
    difficulty: 2,
    done: (s) => Object.values(s.player.languages).filter((v) => v >= 60).length >= 4,
    byAge: 50,
  },
  {
    id: 'early_out',
    title: 'The Early Out',
    emoji: '🏖️',
    setup: { wealth: 'middle', traits: ['frugal'] },
    premise: 'A sensible middle-class start and a hatred of alarm clocks.',
    goal: 'Retire before 55 with a net worth of a million.',
    difficulty: 3,
    done: (s) => s.career.retired && s.player.age < 55 && realNetWorth(s) >= 1_000_000,
    byAge: 55,
  },
  {
    id: 'saint',
    title: 'Saint',
    emoji: '😇',
    setup: { traits: ['generous', 'honest'] },
    premise: 'A kind child with a strong sense of right and wrong.',
    goal: 'Reach karma 90 and never be convicted of anything.',
    difficulty: 1,
    done: (s) =>
      s.player.stats.karma >= 90 &&
      !s.legal.record.some((r) => r.verdict === 'convicted' || r.verdict === 'plea'),
  },
  {
    id: 'decorated',
    title: 'Decorated',
    emoji: '🎖️',
    setup: { traits: ['athletic'] },
    premise: 'Strong, stubborn, and drawn to a uniform.',
    goal: 'Earn two military medals and leave with an honourable discharge.',
    difficulty: 2,
    done: (s) => (s.military?.medals.length ?? 0) >= 2 && s.military?.discharge === 'honorable',
  },
  {
    id: 'dynasty',
    title: 'Dynasty',
    emoji: '👑',
    setup: { wealth: 'comfortable' },
    premise: 'The first of a family line worth remembering.',
    goal: 'Carry the family on to a third generation.',
    difficulty: 2,
    done: (s) => s.generation >= 3,
    spansGenerations: true,
  },
];

export const CHALLENGE_BY_ID: Record<string, ChallengeDef> = Object.fromEntries(
  CHALLENGES.map((c) => [c.id, c]),
);
