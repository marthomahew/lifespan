import type { ActivityDef } from './types';
import { MORE_ACTIVITIES } from './activities-more';
import { SKILL_ACTIVITIES } from './activities-skills';

/** Activities (SPEC §5.13), grouped and gated by age. Each has at least three outcome texts. */
const BASE_ACTIVITIES: ActivityDef[] = [
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
        texts: [
          'A stranger at the bar settles your argument about the best crisp flavour, wrongly, and charmingly. You swap numbers before last orders.',
          'You both reach for the last stool and both refuse it. By the time the lights come up, you have talked through three bands.',
          'Someone compliments your jacket, which you bought by mistake. The conversation that follows is the best of your year.',
          'Out on the terrace, a stranger asks if you are also hiding from the DJ. You are, and you hide together until closing.',
        ],
        effects: [{ status: 'meet' }, { stat: 'happiness', delta: 6 }],
      },
      {
        chance: 0.3,
        text: 'You end the night with a new best friend whose name you are only fairly sure of.',
        texts: [
          'You and a stranger share a taxi, a portion of chips and a full life story. You save them in your phone as ‘Chips’.',
          'Somewhere between the second club and the night bus, you gain a best friend. They text the next morning to check you got home.',
          'A stranger rescues you from a terrible conversation, and you rescue them back. By two a.m. you are planning a holiday together.',
          'You meet someone in the bathroom queue who agrees with every opinion you have. Friendship is sealed over a shared hair tie.',
        ],
        effects: [{ status: 'friend' }, { stat: 'happiness', delta: 5 }],
      },
      {
        chance: 0.3,
        text: 'A great night. Your feet disagree.',
        texts: [
          'You dance until the floor is sticky and your shirt is a rumour. Tomorrow you will walk like a newborn deer, happily.',
          'Every song is your song tonight. Your calves file a formal complaint in the morning.',
          'A night of loud music and louder laughing. Your ears ring all the way home, which feels like applause.',
          'You get home as the birds start up, grinning. Your body charges you interest for the next two days.',
        ],
        effects: [
          { stat: 'happiness', delta: 6 },
          { stat: 'health', delta: -1 },
        ],
      },
      {
        chance: 0.15,
        text: 'The queue takes an hour, the club takes your coat, and the night takes your dignity.',
        texts: [
          'The bouncer turns you away for your shoes. The next place lets you in, then plays the same song four times.',
          'You spend the whole night trying to find your friends, who have gone home. The kebab is cold and so is the walk.',
          'Drinks cost more than your shoes, the DJ hates joy, and you lose a sock somehow. You were wearing shoes.',
          'You fall asleep in the corner booth at eleven and wake up to the cleaners. They are kinder than you deserve.',
        ],
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
        chance: 0.35,
        success: true,
        text: 'After a year of forms, a small person walks into your home and inspects the fridge. Family.',
        effects: [{ stat: 'happiness', delta: 12 }],
      },
      {
        chance: 0.5,
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
    id: 'study',
    label: 'Study at the library',
    emoji: '📖',
    group: 'mind_body',
    ages: [6, 100],
    limitPerYear: 1,
    special: 'study',
    description: 'Quiet, radiators, and the smell of old paper. Grades and smarts go up.',
    outcomes: [
      {
        chance: 0.45,
        text: 'You study for hours and something finally clicks.',
        texts: [
          'Halfway through your third page of notes, the whole topic suddenly makes sense. You sit back, smug and slightly dizzy.',
          'You work until the librarian dims the lights, and leave understanding something you did not this morning.',
          'Your pen runs out, you borrow another, and keep going. By closing time the hard chapter feels almost easy.',
          'You explain the topic out loud to an empty chair and the chair, for once, would be convinced.',
        ],
        effects: [
          { stat: 'smarts', delta: 3 },
          { stat: 'discipline', delta: 2 },
        ],
      },
      {
        chance: 0.35,
        text: 'You read the same page eleven times and then, on the twelfth, it makes sense.',
        texts: [
          'You underline everything, which means nothing is underlined. By evening one stubborn idea finally sticks.',
          'The radiator ticks, the clock ticks, and eventually something in your head ticks too. Slow progress, but progress.',
          'You make flashcards, lose them, and make them again. The second batch is better, and so is your memory.',
          'Your notes look like a crime scene, but the answer is in there somewhere. You find most of it by home time.',
        ],
        effects: [
          { stat: 'smarts', delta: 2 },
          { stat: 'discipline', delta: 1 },
        ],
      },
      {
        chance: 0.2,
        text: 'You fall asleep on a textbook and wake up with a diagram printed on your cheek.',
        texts: [
          'You open the book, read the first line, and blink. It is suddenly dark outside and you have learned one word.',
          'You spend more time rearranging your highlighters than reading. They look fantastic. You look tired.',
          'The person at the next table eats crisps very slowly for three hours. You absorb almost nothing but rage.',
          'You doodle a small, detailed castle in the margin of every page. Your revision covers the first paragraph.',
        ],
        effects: [
          { stat: 'smarts', delta: 1 },
          { stat: 'happiness', delta: -1 },
        ],
      },
    ],
  },
  {
    id: 'driving_test',
    label: 'Take the driving test',
    emoji: '🚦',
    group: 'admin',
    ages: [15, 90],
    cost: 120,
    limitPerYear: 2,
    special: 'driving_test',
    description: 'Mirror, signal, manoeuvre, panic quietly.',
    outcomes: [
      {
        chance: 0.6,
        success: true,
        text: 'The examiner says "well done" in the tone of someone who has seen things. You pass.',
        effects: [{ stat: 'happiness', delta: 6 }],
      },
      {
        chance: 0.25,
        text: 'You fail for rolling through a stop sign that you maintain was barely a sign.',
        effects: [{ stat: 'happiness', delta: -4 }],
      },
      {
        chance: 0.15,
        text: "You reverse into the examiner's own car. The test ends early.",
        effects: [
          { stat: 'happiness', delta: -6 },
          { stat: 'stress', delta: 4 },
        ],
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
    emoji: '🤝',
    group: 'social',
    ages: [8, 100],
    limitPerYear: 1,
    special: 'club',
    description:
      'Chess, running, a choir, drama, books, code, an allotment: people with a shared obsession.',
    // The club tells its own story (content/clubs.ts); these only set how the year goes.
    outcomes: [
      { chance: 0.5, success: true, text: 'A good year at the club.', effects: [] },
      { chance: 0.35, text: 'A middling year at the club.', effects: [] },
      { chance: 0.15, text: 'A poor year at the club.', effects: [] },
    ],
  },
];

/** Health, vice, fun, and prison activities live in their own module. */
export const ACTIVITIES: ActivityDef[] = [
  ...BASE_ACTIVITIES,
  ...MORE_ACTIVITIES,
  ...SKILL_ACTIVITIES,
];

export const ACTIVITY_BY_ID: Record<string, ActivityDef> = Object.fromEntries(
  ACTIVITIES.map((a) => [a.id, a]),
);
