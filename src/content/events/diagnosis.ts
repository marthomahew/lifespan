import type { EventDef } from '../../engine/events/types';

/** A serious diagnosis comes with a decision (fired by the illness system). */
export const DIAGNOSIS_EVENTS: EventDef[] = [
  {
    id: 'hl_serious_diagnosis',
    kind: 'choice',
    category: 'health',
    ages: [16, 120],
    weight: 1,
    chainOnly: true,
    text: 'The specialist turns the screen towards you and says the words: {$label}. Then she lays out the options, slowly, as if there is all the time in the world.',
    choices: [
      {
        id: 'hard',
        label: 'Go hard and fast: the strongest treatment',
        outcomes: [
          {
            chance: 1,
            text: 'Months of appointments, a body that feels borrowed, and time off work you will never get back. But the numbers start moving the right way.',
            effects: [{ system: 'illness_plan', arg: 'aggressive' }],
          },
        ],
      },
      {
        id: 'gentle',
        label: 'Take the gentler route and keep living your life',
        outcomes: [
          {
            chance: 1,
            text: 'Tablets, check-ups, and a life that looks mostly like your old one. You will be watching this for a long while.',
            effects: [{ system: 'illness_plan', arg: 'gentle' }],
          },
        ],
      },
      {
        id: 'second',
        label: 'Get a second opinion first',
        outcomes: [
          {
            chance: 1,
            text: 'Another waiting room, another kind face, the same scans on a different screen.',
            effects: [{ system: 'illness_plan', arg: 'second' }],
          },
        ],
      },
    ],
  },
];
