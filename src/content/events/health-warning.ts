import type { EventDef } from '../../engine/events/types';

/** Fired by the health system when the yearly risk of dying turns serious (never at random). */
export const HEALTH_WARNING_EVENTS: EventDef[] = [
  {
    id: 'late_health_warning',
    kind: 'choice',
    category: 'health',
    weight: 0,
    chainOnly: true,
    text: 'The doctor takes off her glasses before she speaks, which is never a good sign. She does not use the word "serious", but she says everything around it. The main worry is {$worry}.',
    choices: [
      {
        id: 'serious',
        label: 'Take it seriously',
        outcomes: [
          {
            chance: 1,
            text: 'You get the tests, take the pills, eat the vegetables and walk every day. It is dull and it is working.',
            effects: [
              { stat: 'health', delta: 8 },
              { stat: 'happiness', delta: -2 },
              { flag: 'taking_care' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'bucket',
        label: 'Write a bucket list',
        outcomes: [
          {
            chance: 1,
            text: 'You sit at the kitchen table and write the list you always meant to write. It is longer than you expected, and better.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: -4 },
              { flag: 'bucket_list' },
            ],
          },
        ],
      },
      {
        id: 'carry_on',
        label: 'Carry on as if nothing was said',
        outcomes: [
          {
            chance: 1,
            text: 'You thank her, buy a cake on the way home, and do not mention it to anyone. The cake is excellent.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
];
