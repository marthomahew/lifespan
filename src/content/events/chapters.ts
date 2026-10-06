import type { EventDef } from '../../engine/events/types';
import { canAfford, canMoveAbroad, hasJob } from './conditions';

/** The mid-life question, fired by the chapter system every six years or so between 38 and 62. */
export const CHAPTER_EVENTS: EventDef[] = [
  {
    id: 'mid_chapter',
    kind: 'choice',
    category: 'random',
    ages: [38, 62],
    weight: 1,
    chainOnly: true,
    text: 'A Sunday evening, nothing special about it, and the thought arrives fully formed: is this it? The next twenty years could look like the last ten, or not.',
    choices: [
      {
        id: 'retrain',
        label: 'Retrain for something new',
        outcomes: [
          {
            chance: 1,
            text: 'You hand in your notice, buy a backpack you are slightly too old for, and sit in the front row of a classroom full of twenty-year-olds. It is terrifying. It is wonderful.',
            effects: [
              { system: 'retrain' },
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: 6 },
              { flag: 'reinvented' },
            ],
          },
        ],
      },
      {
        id: 'downshift',
        label: 'Work less, live more',
        requires: hasJob,
        outcomes: [
          {
            chance: 1,
            text: 'You go to four days a week. The money is thinner and the Fridays are yours: long walks, a slow lunch, the allotment. Nobody at work notices, which is the point.',
            effects: [
              { system: 'salary_mult', arg: '0.75' },
              { stat: 'stress', delta: -15 },
              { stat: 'happiness', delta: 8 },
              { flag: 'downshifted' },
            ],
          },
        ],
      },
      {
        id: 'move',
        label: 'Start again somewhere new',
        outcomes: [
          {
            chance: (st) => (canMoveAbroad(st) ? 0.5 : 0),
            text: 'You sell almost everything and keep the important things: photographs, one good knife, the people who matter. A new language starts on the plane.',
            effects: [
              { system: 'move_abroad' },
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: 8 },
            ],
          },
          {
            chance: 0.5,
            text: 'Boxes, a van, and a new kitchen window with a different sky in it. You do not know anyone yet. You find, to your surprise, that you like that.',
            effects: [
              { system: 'move_city' },
              { stat: 'happiness', delta: 5 },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'stay',
        label: 'Decide that this is, actually, quite good',
        outcomes: [
          {
            chance: 1,
            text: 'You look around the kitchen: the chipped mug, the noise from upstairs, the life you built. Yes. This will do very nicely.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: -5 },
            ],
          },
        ],
      },
    ],
  },
];

const uniKid = (s: Parameters<typeof hasJob>[0]): boolean =>
  s.npcs.some(
    (n) =>
      n.alive &&
      n.roles.includes('child') &&
      n.age >= 18 &&
      n.age <= 19 &&
      n.job === 'At university',
  );

/** A child heads to university: who pays, and how it comes back four years on. */
export const UNI_EVENTS: EventDef[] = [
  {
    id: 'par_uni_fees',
    kind: 'choice',
    category: 'family',
    ages: [36, 75],
    weight: 9,
    cooldownYears: 2,
    when: uniKid,
    bind: { kid: { role: 'child', minAge: 18, maxAge: 19 } },
    text: '{kid.first} has a place at university. The letter is on the fridge. The fees and the rent are on the table, and so is the question nobody wants to ask first.',
    choices: [
      {
        id: 'all',
        label: 'Pay for all of it',
        requires: canAfford(30000),
        outcomes: [
          {
            chance: 1,
            text: 'You set up the payments and tell {kid.first} to spend the time learning, not working nights. {kid.They} hug{kid.s} you in the car park and pretend not to.',
            effects: [
              { money: -30000, kind: 'price' },
              { rel: 'kid', delta: 12, memory: 'you paying for university' },
              { schedule: 'par_uni_grad', inYears: 4, payload: { paid: 'all' } },
            ],
          },
        ],
      },
      {
        id: 'half',
        label: 'Pay half; the rest is theirs to earn',
        requires: canAfford(15000),
        outcomes: [
          {
            chance: 1,
            text: 'Half from you, half from a weekend job at the cinema. {kid.first} grumbles, then quietly gets very good at budgeting.',
            effects: [
              { money: -15000, kind: 'price' },
              { rel: 'kid', delta: 5, memory: 'splitting the university bill' },
              { schedule: 'par_uni_grad', inYears: 4, payload: { paid: 'half' } },
            ],
          },
        ],
      },
      {
        id: 'loans',
        label: 'They’ll take out loans, like everyone does',
        outcomes: [
          {
            chance: 1,
            text: '{kid.first} signs the forms at the kitchen table without saying much. The number at the bottom is very large, and entirely {kid.their}s.',
            effects: [
              { rel: 'kid', delta: -6, memory: 'the student loans' },
              { schedule: 'par_uni_grad', inYears: 4, payload: { paid: 'none' } },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'par_uni_grad',
    kind: 'notice',
    category: 'family',
    ages: [38, 90],
    weight: 1,
    chainOnly: true,
    bind: { kid: { role: 'child', minAge: 20 } },
    text: '{kid.first} graduates. You sit in a hot hall for two hours to watch {kid.them} cross a stage for nine seconds.',
    outcomes: [
      {
        chance: (_s, p) => (p['paid'] === 'all' ? 1 : 0),
        text: 'Afterwards {kid.first} says, out of nowhere, that {kid.they} know{kid.s} what it cost. {kid.They} {kid.is} starting out without a debt in the world, and {kid.they} won’t forget it.',
        effects: [
          { stat: 'happiness', delta: 10 },
          { rel: 'kid', delta: 8, memory: 'graduating debt-free' },
        ],
      },
      {
        chance: (_s, p) => (p['paid'] === 'half' ? 1 : 0),
        text: '{kid.first} graduates with a degree, a modest loan and very strong opinions about popcorn. You are both proud of the half each of you paid.',
        effects: [
          { stat: 'happiness', delta: 8 },
          { rel: 'kid', delta: 5, memory: 'the degree you shared the cost of' },
        ],
      },
      {
        chance: (_s, p) => (p['paid'] === 'none' ? 1 : 0),
        text: '{kid.first} throws the cap higher than anyone. The loan letters start in the spring. {kid.They} paid for every bit of it, and {kid.they} make{kid.s} sure you know it.',
        effects: [
          { stat: 'happiness', delta: 6 },
          { rel: 'kid', delta: 2, memory: 'graduating on their own' },
        ],
      },
    ],
  },
];
