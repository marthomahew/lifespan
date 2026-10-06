import type { EventDef } from '../../engine/events/types';

/** Someone acts on what they remember (fired by the memory system with {who} and the memory). */
export const MEMORY_EVENTS: EventDef[] = [
  {
    id: 'mem_gratitude',
    kind: 'choice',
    category: 'social',
    ages: [14, 120],
    weight: 1,
    chainOnly: true,
    bind: { who: { role: 'acquaintance', anyRole: true } },
    text: '{who.first} turns up out of the blue. {who.They} still think{who.s} about {$memory}, and want{who.s} you to know it mattered. {who.They} would like to do something for you.',
    choices: [
      {
        id: 'accept',
        label: 'Let {who.first} do something for you',
        outcomes: [
          {
            chance: 1,
            text: '{who.first} fixes the thing you’ve been putting off for a year and refuses all payment except tea. Kindness, it turns out, compounds.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: -4 },
              { rel: 'who', delta: 6, memory: 'paying back an old kindness' },
            ],
          },
        ],
      },
      {
        id: 'wave',
        label: 'Say there’s nothing owed',
        outcomes: [
          {
            chance: 1,
            text: 'You tell {who.first} it was nothing. {who.They} insist{who.s} it wasn’t, and the argument about it is the nicest one you’ve had all year.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { rel: 'who', delta: 4, memory: 'arguing about who owes whom' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mem_grudge',
    kind: 'choice',
    category: 'social',
    ages: [14, 120],
    weight: 1,
    chainOnly: true,
    bind: { who: { role: 'acquaintance', anyRole: true } },
    text: 'Years on, {who.first} brings up {$memory} again, quietly and at the worst moment, as if it happened last week. For {who.them}, it did.',
    choices: [
      {
        id: 'sorry',
        label: 'Apologise properly, without excuses',
        outcomes: [
          {
            chance: 0.7,
            text: 'You say sorry and mean it. {who.first} is quiet for a long time, then nods. Something heavy goes out of the room.',
            effects: [
              { rel: 'who', delta: 14, memory: 'the apology, finally' },
              { stat: 'stress', delta: -4 },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'It is too late, or not enough. {who.first} thanks you for saying it and does not say anything else.',
            effects: [{ rel: 'who', delta: 3, memory: 'an apology that came late' }],
          },
        ],
      },
      {
        id: 'stand',
        label: 'Stand by what you did',
        outcomes: [
          {
            chance: 1,
            text: 'You explain why you did it. {who.first} explains why it still hurts. Neither of you is wrong, and that is the worst part.',
            effects: [
              { rel: 'who', delta: -8, memory: 'the argument about the old thing' },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'change',
        label: 'Change the subject',
        outcomes: [
          {
            chance: 1,
            text: 'You talk about the weather with great determination. It works, today. It will come up again.',
            effects: [{ rel: 'who', delta: -3, memory: 'changing the subject' }],
          },
        ],
      },
    ],
  },
];
