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
  {
    id: 'hl_treatment_rethink',
    kind: 'choice',
    category: 'health',
    ages: [10, 120],
    weight: 1,
    chainOnly: true,
    text: 'Two rounds of treatment for the {$label} and nothing to show for it. Your doctor leans back and says it might be time to try something else.',
    choices: [
      {
        id: 'specialist',
        label: 'See the best specialist you can find',
        outcomes: [
          {
            chance: 1,
            text: 'A long train journey, a waiting room full of framed certificates, and a woman who listens for forty minutes before she says anything. Then she says something that helps.',
            effects: [{ system: 'illness_plan', arg: 'specialist' }],
          },
        ],
      },
      {
        id: 'switch',
        label: 'Try a different approach',
        outcomes: [
          {
            chance: 1,
            text: 'New tablets, a new routine, a new leaflet on the fridge. It is not a miracle, but the bad days come further apart.',
            effects: [{ system: 'illness_plan', arg: 'switch' }],
          },
        ],
      },
      {
        id: 'live',
        label: 'Learn to live with it',
        outcomes: [
          {
            chance: 1,
            text: 'You stop treating it as a fight and start treating it as weather. It is still there. You are still here, and that turns out to matter more.',
            effects: [{ system: 'illness_plan', arg: 'live' }],
          },
        ],
      },
    ],
  },
];
