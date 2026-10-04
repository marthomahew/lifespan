import type { ActivityDef } from './types';

/** Activities (SPEC §5.13), grouped and gated by age. Each has at least three outcome texts. */
export const ACTIVITIES: ActivityDef[] = [
  {
    id: 'find_date',
    label: 'Find a date',
    emoji: '🌹',
    group: 'love',
    ages: [18, 100],
    adultsOnly: true,
    limitPerYear: 2,
    special: 'meet',
    description: 'Ask around, say yes to a set-up, hope for the best.',
    outcomes: [
      {
        chance: 0.5,
        success: true,
        text: 'A friend of a friend turns out to be more than that. You swap numbers before the bill arrives.',
        effects: [{ status: 'meet' }, { stat: 'happiness', delta: 5 }],
      },
      {
        chance: 0.3,
        text: 'Your date spends the evening explaining a cryptocurrency you will never buy.',
        effects: [{ stat: 'happiness', delta: -2 }],
      },
      {
        chance: 0.2,
        text: 'You get stood up and eat both portions of dessert with dignity.',
        effects: [{ stat: 'happiness', delta: -4 }],
      },
    ],
  },
  {
    id: 'dating_app',
    label: 'Dating app',
    emoji: '📱',
    group: 'love',
    ages: [18, 90],
    adultsOnly: true,
    minYear: 2012,
    limitPerYear: 2,
    special: 'meet',
    description: 'Swipe until your thumb files a complaint.',
    outcomes: [
      {
        chance: 0.45,
        success: true,
        text: 'A match who writes in full sentences. You meet for coffee and stay for dinner.',
        effects: [{ status: 'meet' }, { stat: 'happiness', delta: 5 }],
      },
      {
        chance: 0.35,
        text: 'Forty matches, three conversations, zero dates. The app congratulates you on your activity.',
        effects: [{ stat: 'happiness', delta: -2 }],
      },
      {
        chance: 0.2,
        text: 'Your match looks nothing like the photos, which were apparently of a cousin.',
        effects: [{ stat: 'happiness', delta: -3 }],
      },
    ],
  },
  {
    id: 'nightlife',
    label: 'Night out',
    emoji: '🪩',
    group: 'social',
    ages: [18, 80],
    adultsOnly: true,
    cost: 60,
    limitPerYear: 3,
    special: 'meet',
    description: 'Dancing, questionable decisions, a kebab at 2 a.m.',
    outcomes: [
      {
        chance: 0.25,
        success: true,
        text: 'Someone laughs at your terrible dance move and asks you to teach it to them. You keep talking until closing.',
        effects: [{ status: 'meet' }, { stat: 'happiness', delta: 6 }],
      },
      {
        chance: 0.3,
        text: 'You end the night with a new best friend whose name you are only fairly sure of.',
        effects: [{ status: 'friend' }, { stat: 'happiness', delta: 5 }],
      },
      {
        chance: 0.3,
        text: 'A great night. Your feet disagree.',
        effects: [
          { stat: 'happiness', delta: 6 },
          { stat: 'health', delta: -1 },
        ],
      },
      {
        chance: 0.15,
        text: 'The queue takes an hour, the club takes your coat, and the night takes your dignity.',
        effects: [{ stat: 'happiness', delta: -3 }],
      },
    ],
  },
  {
    id: 'fertility_clinic',
    label: 'Fertility clinic',
    emoji: '🧬',
    group: 'love',
    ages: [21, 55],
    adultsOnly: true,
    cost: 12000,
    limitPerYear: 1,
    special: 'fertility',
    description: 'Science, appointments, waiting rooms, hope.',
    outcomes: [
      {
        chance: 0.55,
        success: true,
        text: 'The call comes on a Tuesday: it worked. You sit on the kitchen floor and laugh.',
        effects: [{ stat: 'happiness', delta: 10 }],
      },
      {
        chance: 0.3,
        text: 'Not this round. The nurse is kind. You book the next appointment anyway.',
        effects: [
          { stat: 'happiness', delta: -6 },
          { stat: 'stress', delta: 6 },
        ],
      },
      {
        chance: 0.15,
        text: "The doctor suggests a break. You take it, and each other's hands.",
        effects: [{ stat: 'happiness', delta: -4 }],
      },
    ],
  },
  {
    id: 'adopt',
    label: 'Adopt a child',
    emoji: '🧸',
    group: 'love',
    ages: [21, 65],
    adultsOnly: true,
    cost: 8000,
    limitPerYear: 1,
    special: 'adopt',
    description: 'Paperwork, home visits, and one very important introduction.',
    outcomes: [
      {
        chance: 0.7,
        success: true,
        text: 'After a year of forms, a small person walks into your home and inspects the fridge. Family.',
        effects: [{ stat: 'happiness', delta: 12 }],
      },
      {
        chance: 0.2,
        text: 'The agency needs more paperwork. Then more. You keep going.',
        effects: [{ stat: 'stress', delta: 5 }],
      },
      {
        chance: 0.1,
        text: 'The match falls through at the last minute. It hurts more than you expected.',
        effects: [{ stat: 'happiness', delta: -8 }],
      },
    ],
  },
  {
    id: 'write_will',
    label: 'Write a will',
    emoji: '📜',
    group: 'admin',
    ages: [18, 120],
    limitPerYear: 3,
    special: 'will',
    description: 'Decide who gets what. Leave the lamp to someone who deserves it.',
    outcomes: [
      {
        chance: 0.4,
        success: true,
        text: 'The solicitor reads it back in a voice usually reserved for eulogies. It is done.',
        effects: [{ stat: 'stress', delta: -2 }],
      },
      {
        chance: 0.3,
        success: true,
        text: 'You sign the will with a pen that runs out mid-signature. It counts.',
        effects: [{ stat: 'stress', delta: -2 }],
      },
      {
        chance: 0.3,
        success: true,
        text: 'Writing a will is grim for an hour and oddly calming afterwards.',
        effects: [{ stat: 'stress', delta: -3 }],
      },
    ],
  },
  {
    id: 'volunteer',
    label: 'Volunteer',
    emoji: '🤲',
    group: 'social',
    ages: [12, 100],
    limitPerYear: 1,
    description: 'Soup kitchens, beach clean-ups, reading to people who appreciate it.',
    outcomes: [
      {
        chance: 0.4,
        text: 'You spend Saturday at the food bank and leave lighter than you arrived.',
        effects: [
          { stat: 'karma', delta: 5 },
          { stat: 'happiness', delta: 4 },
        ],
      },
      {
        chance: 0.3,
        text: 'You meet someone sorting tins who becomes a real friend.',
        effects: [{ stat: 'karma', delta: 4 }, { status: 'friend' }],
      },
      {
        chance: 0.3,
        text: 'The beach clean-up finds a shopping trolley, a tyre, and your faith in people, partly.',
        effects: [
          { stat: 'karma', delta: 4 },
          { stat: 'health', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'join_club',
    label: 'Join a club',
    emoji: '♟️',
    group: 'social',
    ages: [8, 100],
    limitPerYear: 1,
    description: 'Chess, choir, birdwatching, five-a-side: people with a shared obsession.',
    outcomes: [
      {
        chance: 0.45,
        text: 'The chess club is mostly snacks and arguing. You fit right in and make a friend.',
        effects: [{ status: 'friend' }, { stat: 'happiness', delta: 4 }],
      },
      {
        chance: 0.3,
        text: 'You join a walking group and learn the names of eleven birds and two people.',
        effects: [
          { stat: 'health', delta: 2 },
          { stat: 'happiness', delta: 3 },
        ],
      },
      {
        chance: 0.25,
        text: 'The club is an hour of minutes, motions, and a fierce debate about biscuits. You do not go back.',
        effects: [{ stat: 'happiness', delta: -1 }],
      },
    ],
  },
];

export const ACTIVITY_BY_ID: Record<string, ActivityDef> = Object.fromEntries(
  ACTIVITIES.map((a) => [a.id, a]),
);
