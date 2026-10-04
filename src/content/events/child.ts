import type { EventDef } from '../../engine/events/types';

export const CHILD_EVENTS: EventDef[] = [
  {
    id: 'child_crayon_wall',
    kind: 'choice',
    category: 'family',
    ages: [3, 6],
    weight: 10,
    once: true,
    text: 'You have drawn a mural of the family dog across the hallway wall. In permanent marker. It is, honestly, a good likeness.',
    choices: [
      {
        id: 'confess',
        label: 'Confess',
        outcomes: [
          {
            chance: 0.7,
            text: '{mother.first} sighs, photographs it, then scrubs for an hour.',
            effects: [
              { rel: 'mother', delta: 3, memory: 'the hallway mural' },
              { stat: 'karma', delta: 2 },
            ],
          },
          {
            chance: 0.3,
            text: 'No dessert for a week. Art has a price.',
            effects: [{ stat: 'happiness', delta: -4 }],
          },
        ],
      },
      {
        id: 'blame',
        label: 'Blame the dog',
        outcomes: [
          {
            chance: 0.4,
            text: 'Somehow, it works. The dog is unbothered.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'karma', delta: -3 },
            ],
          },
          {
            chance: 0.6,
            text: 'The dog cannot hold a marker. Everyone knows this.',
            effects: [
              { rel: 'mother', delta: -4, memory: 'the time you blamed the dog' },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
];
