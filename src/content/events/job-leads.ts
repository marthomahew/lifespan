import type { EventDef } from '../../engine/events/types';
import { all, needsWork, outOfWork } from './conditions';
import type { GameState } from '../../engine/types';

const atLeast = (age: number) => (s: GameState) => s.player.age >= age;

/** Out of work, life still knocks: concrete jobs you can say yes to on the spot. */
export const JOB_LEAD_EVENTS: EventDef[] = [
  {
    id: 'lead_shop_sign',
    kind: 'choice',
    category: 'work',
    ages: [19, 58],
    weight: 14,
    cooldownYears: 3,
    when: all(outOfWork, needsWork),
    text: 'A handwritten sign in the corner shop window says STAFF WANTED, NO EXPERIENCE, MUST LIKE PEOPLE (MOSTLY). The owner is restocking the crisps and looks up hopefully.',
    choices: [
      {
        id: 'take',
        label: 'Ask for the job',
        outcomes: [
          {
            chance: 1,
            text: 'She hands you a tabard and a pricing gun before you have finished the sentence. You start Monday.',
            effects: [
              { system: 'hire', arg: 'retail_associate' },
              { stat: 'happiness', delta: 3 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'better',
        label: 'Hold out for something better',
        outcomes: [
          {
            chance: 1,
            text: 'You buy a newspaper for the job pages instead. The owner sells it to you with a slightly wounded look.',
            effects: [{ stat: 'stress', delta: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'lead_site_foreman',
    kind: 'choice',
    category: 'work',
    ages: [19, 55],
    weight: 14,
    cooldownYears: 3,
    when: all(outOfWork, needsWork),
    text: 'A foreman with a clipboard and a voice built for motorways shouts across the building site fence: a labourer has quit, and you look like you can carry things.',
    choices: [
      {
        id: 'take',
        label: 'Climb through the gap in the fence',
        outcomes: [
          {
            chance: 1,
            text: 'You are handed a hard hat two sizes too big and a list of things not to touch. By lunch you have touched none of them.',
            effects: [
              { system: 'hire', arg: 'construction_worker' },
              { stat: 'happiness', delta: 3 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'pass',
        label: 'Say your back has opinions',
        outcomes: [
          {
            chance: 1,
            text: 'He shrugs and shouts the same offer at the next person walking past, who takes it.',
            effects: [{ stat: 'happiness', delta: -1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'lead_garden_round',
    kind: 'choice',
    category: 'work',
    ages: [19, 62],
    weight: 12,
    cooldownYears: 3,
    when: all(outOfWork, needsWork),
    text: 'Your neighbour’s gardening round has grown too big for one van. He asks if you would like half of it: twelve gardens, one temperamental hedge trimmer, cash every Friday.',
    choices: [
      {
        id: 'take',
        label: 'Take half the round',
        outcomes: [
          {
            chance: 1,
            text: 'By the end of the first month you know every gate code and every dog by name. The hedge trimmer still hates you.',
            effects: [
              { system: 'hire', arg: 'landscaper' },
              { stat: 'health', delta: 2 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'pass',
        label: 'Say you are waiting on an interview',
        outcomes: [
          {
            chance: 1,
            text: 'There is no interview. You spend the afternoon looking for one so it becomes true.',
            effects: [{ stat: 'stress', delta: 3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'lead_bar_shift',
    kind: 'choice',
    category: 'work',
    ages: [21, 50],
    weight: 12,
    cooldownYears: 3,
    when: all(outOfWork, needsWork, atLeast(21)),
    text: 'The bar on the corner is a person down for the weekend rush. The manager asks if you can pour a pint without making it look like a crime scene.',
    choices: [
      {
        id: 'take',
        label: 'Pour one to prove it',
        outcomes: [
          {
            chance: 0.7,
            text: 'The head is a perfect finger-width. The manager nods once, which you learn later is the highest praise available.',
            effects: [
              { system: 'hire', arg: 'bartender' },
              { stat: 'happiness', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'It is mostly foam. The manager hires you anyway, on the grounds that you clearly need the practice.',
            effects: [
              { system: 'hire', arg: 'bartender' },
              { stat: 'stress', delta: 1 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'pass',
        label: 'Say nights are not for you',
        outcomes: [
          {
            chance: 1,
            text: 'You walk home past the bar at eleven. It is loud, warm and full of people having a better time than you.',
            effects: [{ stat: 'happiness', delta: -2 }],
          },
        ],
      },
    ],
  },
];
