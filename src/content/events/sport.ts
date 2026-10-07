import type { EventDef } from '../../engine/events/types';

/** Sport as a career: the offer that turns a talent into a living (fired by the sport system). */
export const SPORT_EVENTS: EventDef[] = [
  {
    id: 'sport_pro_offer',
    kind: 'choice',
    category: 'work',
    emoji: '✍️',
    ages: [16, 40],
    weight: 1,
    chainOnly: true,
    text: 'A professional {sport} club has been watching. Their offer is on the kitchen table: a contract, a salary, and a training schedule that leaves room for very little else.',
    choices: [
      {
        id: 'sign',
        label: 'Sign it',
        outcomes: [
          {
            chance: 1,
            text: 'You sign at the training ground with a photographer in the room. From Monday, {sport} is your job.',
            effects: [
              { system: 'hire', arg: 'professional_athlete' },
              { stat: 'happiness', delta: 10 },
              { flag: 'pro_athlete' },
            ],
          },
        ],
      },
      {
        id: 'amateur',
        label: 'Stay amateur and keep your options open',
        outcomes: [
          {
            chance: 1,
            text: 'You turn it down politely. You keep playing for the love of it, and keep your evenings for everything else.',
            effects: [{ stat: 'stress', delta: -3 }],
          },
        ],
      },
    ],
  },
];
