import type { EventDef } from '../../../src/engine/events/types';
import { canAfford } from '../../../src/content/events/conditions';

const two = (id: string): EventDef['choices'] => [
  {
    id: 'a',
    label: 'Option A',
    outcomes: [
      { chance: 1, text: `${id} went with A.`, effects: [{ stat: 'happiness', delta: 1 }] },
    ],
  },
  {
    id: 'b',
    label: 'Option B',
    outcomes: [
      { chance: 1, text: `${id} went with B.`, effects: [{ stat: 'happiness', delta: -1 }] },
    ],
  },
];

export const FIXTURE_EVENTS: EventDef[] = [
  ...Array.from({ length: 12 }, (_, i): EventDef => ({
    id: `fx_filler_${i}`,
    kind: 'choice',
    category: 'random',
    weight: 10,
    cooldownYears: 1,
    text: `Filler ${i} happens.`,
    choices: two(`filler ${i}`),
  })),
  {
    id: 'fx_once',
    kind: 'choice',
    category: 'world',
    weight: 30,
    once: true,
    text: 'Once only.',
    choices: two('once'),
  },
  {
    id: 'fx_cooldown5',
    kind: 'choice',
    category: 'family',
    weight: 40,
    cooldownYears: 5,
    text: 'Every five years at most.',
    choices: two('cooldown'),
  },
  {
    id: 'fx_social',
    kind: 'choice',
    category: 'social',
    weight: 10,
    weightMods: [{ flag: 'popular', mult: 3 }],
    text: 'A social thing.',
    choices: two('social'),
  },
  {
    id: 'fx_mother',
    kind: 'choice',
    category: 'family',
    weight: 5,
    text: '{mother.first} calls.',
    choices: two('mother'),
  },
  {
    id: 'fx_romance',
    kind: 'choice',
    category: 'romance',
    adultsOnly: true,
    ages: [18, 90],
    weight: 1,
    text: 'Someone winks.',
    choices: two('romance'),
  },
  {
    id: 'fx_costly',
    kind: 'choice',
    category: 'money',
    weight: 1,
    text: 'A pricey opportunity.',
    choices: [
      {
        id: 'pay',
        label: 'Pay',
        requires: canAfford(100000),
        outcomes: [{ chance: 1, text: 'Paid.', effects: [{ money: -100000 }] }],
      },
      {
        id: 'pay2',
        label: 'Pay more',
        requires: canAfford(200000),
        outcomes: [{ chance: 1, text: 'Paid more.', effects: [{ money: -200000 }] }],
      },
    ],
  },
  ...Array.from({ length: 10 }, (_, i): EventDef => ({
    id: `fx_notice_${i}`,
    kind: 'notice',
    category: 'random',
    weight: 10,
    cooldownYears: 1,
    text: `Notice ${i}.`,
    outcomes: [{ chance: 1, text: `It passes ${i}.`, effects: [] }],
  })),
  {
    id: 'fx_chain_start',
    kind: 'choice',
    category: 'money',
    weight: 0,
    text: '{friend.first} asks for {money:3000}.',
    bind: { friend: { role: 'mother' } },
    choices: [
      {
        id: 'lend',
        label: 'Lend it',
        outcomes: [
          {
            chance: 1,
            text: '{friend.first} thanks you.',
            effects: [{ rel: 'friend', delta: 5, memory: 'the loan' }],
            next: { eventId: 'fx_chain_end', inYears: [2, 2], payload: { amount: 3000 } },
          },
        ],
      },
      { id: 'no', label: 'Refuse', outcomes: [{ chance: 1, text: 'You refuse.', effects: [] }] },
    ],
  },
  {
    id: 'fx_chain_end',
    kind: 'choice',
    category: 'money',
    weight: 0,
    chainOnly: true,
    bind: { friend: { role: 'mother' } },
    text: '{friend.first} pays back {money:$amount}.',
    choices: [
      {
        id: 'take',
        label: 'Take it',
        outcomes: [
          {
            chance: 1,
            text: 'You take the money.',
            effects: [{ money: { payload: 'amount', mult: 1 } }],
          },
        ],
      },
      {
        id: 'forgive',
        label: 'Forgive the debt',
        outcomes: [
          {
            chance: 1,
            text: 'You wave it away.',
            effects: [{ rel: 'friend', delta: 10, memory: 'the forgiven loan' }],
          },
        ],
      },
    ],
  },
];
