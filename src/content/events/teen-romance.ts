import type { EventDef } from '../../engine/events/types';
import type { GameState } from '../../engine/types';
import { all, notInPrison } from './conditions';

/** Has a teenage boyfriend or girlfriend. */
const goingOut = (s: GameState): boolean =>
  s.npcs.some((n) => n.alive && n.roles.includes('sweetheart'));
const single = (s: GameState): boolean => !goingOut(s);

// A classmate or friend of about your age (the system checks the two-year gap and attraction).
const peer = { minAge: 14, maxAge: 17, nearAge: 2, fitsAttraction: true } as const;

/**
 * Teenage relationships between peers, 14–17: crushes, dances, notes, heartbreak. Nothing
 * physical is described. At 18 together it can become an adult relationship (tr_eighteen).
 */
export const TEEN_ROMANCE_EVENTS: EventDef[] = [
  {
    id: 'tr_crush',
    kind: 'choice',
    category: 'social',
    ages: [14, 17],
    weight: 9,
    cooldownYears: 2,
    when: all(single, notInPrison),
    bind: { cm: { role: 'classmate', ...peer } },
    text: 'You have started noticing exactly where {cm.first} sits in every lesson. There is a school dance in three weeks.',
    choices: [
      {
        id: 'ask',
        label: 'Ask {cm.first} to the dance',
        outcomes: [
          {
            chance: (s) =>
              Math.min(
                0.85,
                0.35 + (s.player.stats.looks - 50) / 150 + (s.player.stats.happiness - 50) / 300,
              ),
            text: '{cm.first} goes pink, says yes, and then says yes again in case you didn’t hear. You float home.',
            effects: [
              { status: 'sweetheart', with: 'cm' },
              { stat: 'happiness', delta: 8 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: '{cm.first} says, very kindly, that they are going with friends. You survive. It takes about a week.',
            effects: [
              { rel: 'cm', delta: 2, memory: 'the time you asked them to the dance' },
              { stat: 'happiness', delta: -5 },
            ],
          },
        ],
      },
      {
        id: 'note',
        label: 'Leave an anonymous note in their locker',
        outcomes: [
          {
            chance: 0.5,
            text: 'They work out it was you from the handwriting in about four minutes, and find you at lunch to say thanks. It turns into a whole afternoon of talking.',
            effects: [
              { status: 'sweetheart', with: 'cm' },
              { stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The note is read aloud to the whole form by someone else entirely. You develop a sudden interest in the library.',
            effects: [
              { stat: 'happiness', delta: -6 },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'nothing',
        label: 'Keep it to yourself',
        outcomes: [
          {
            chance: 1,
            text: 'You go to the dance with friends and spend the whole night not looking at {cm.first}. It is, oddly, a lovely night anyway.',
            effects: [{ stat: 'happiness', delta: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'tr_friend_to_more',
    kind: 'choice',
    category: 'social',
    ages: [14, 17],
    weight: 6,
    cooldownYears: 3,
    when: all(single, notInPrison),
    bind: { pal: { role: 'friend', ...peer, minRelationship: 60 } },
    text: 'You and {pal.first} have been friends for ages. Lately, walking home, it has started to feel like something else.',
    choices: [
      {
        id: 'say',
        label: 'Say something',
        outcomes: [
          {
            chance: 0.55,
            text: '{pal.first} stops at the corner and says “me too,” very fast, before you can take it back.',
            effects: [
              { status: 'sweetheart', with: 'pal' },
              { stat: 'happiness', delta: 8 },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: '{pal.first} says they love you, as a friend, and means it. It is awkward for a fortnight, then it isn’t.',
            effects: [
              { rel: 'pal', delta: -3, memory: 'the walk home when you said something' },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'keep',
        label: 'Keep the friendship as it is',
        outcomes: [
          {
            chance: 1,
            text: 'You decide the friendship is too good to risk. Some days you are sure you were right.',
            effects: [{ rel: 'pal', delta: 3, memory: 'all those walks home' }],
          },
        ],
      },
    ],
  },
  {
    id: 'tr_dance_night',
    kind: 'choice',
    category: 'social',
    ages: [14, 17],
    weight: 9,
    cooldownYears: 2,
    when: all(goingOut, notInPrison),
    bind: { sw: { role: 'sweetheart', minAge: 14, maxAge: 17 } },
    text: 'The end-of-year dance. {sw.first} looks nervous in clothes that are slightly too smart, which is exactly how you feel.',
    choices: [
      {
        id: 'dance',
        label: 'Dance, badly and proudly',
        outcomes: [
          {
            chance: 1,
            text: 'You dance to every song, including the ones you hate. The photo from that night ends up on a fridge for years.',
            effects: [
              { rel: 'sw', delta: 6, memory: 'dancing badly at the end-of-year dance' },
              { stat: 'happiness', delta: 7 },
            ],
          },
        ],
      },
      {
        id: 'talk',
        label: 'Sneak out to talk on the steps',
        outcomes: [
          {
            chance: 1,
            text: 'You sit on the cold steps outside and talk about everything until a teacher sends you back in. You remember none of the music and all of the conversation.',
            effects: [
              { rel: 'sw', delta: 7, memory: 'talking on the steps outside the dance' },
              { stat: 'happiness', delta: 5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'tr_meet_family',
    kind: 'choice',
    category: 'family',
    ages: [14, 17],
    weight: 7,
    once: true,
    when: all(goingOut, notInPrison),
    bind: { sw: { role: 'sweetheart', minAge: 14, maxAge: 17 } },
    text: 'Your family insist on having {sw.first} round for Sunday lunch. Your relatives have been briefed. You have not.',
    choices: [
      {
        id: 'brave',
        label: 'Get through it together',
        outcomes: [
          {
            chance: 0.6,
            text: 'Someone brings out the baby photos. {sw.first} laughs at the right moments and helps with the washing up. Your family now prefer them to you.',
            effects: [
              { rel: 'sw', delta: 6, memory: 'the Sunday lunch with your family' },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'An uncle asks {sw.first} about their plans for life, at length. You apologise all the way to the bus stop.',
            effects: [
              { rel: 'sw', delta: 2, memory: 'surviving your uncle’s questions' },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'dodge',
        label: 'Invent a revision session',
        outcomes: [
          {
            chance: 1,
            text: 'You claim a revision session nobody believes in. Your family are offended for exactly one week.',
            effects: [{ stat: 'stress', delta: -1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'tr_friends_jealous',
    kind: 'choice',
    category: 'social',
    ages: [14, 17],
    weight: 6,
    cooldownYears: 3,
    when: all(goingOut, notInPrison),
    bind: { pal: { role: 'friend', minAge: 13, maxAge: 18, minRelationship: 40 } },
    text: 'Your best friend {pal.first} says, not quite joking, that you have not been out with them in a month.',
    choices: [
      {
        id: 'friend_day',
        label: 'Make a friends-only day of it',
        outcomes: [
          {
            chance: 1,
            text: 'A whole Saturday of the old routine: chips, the park, the same jokes. {pal.first} forgives you by lunchtime.',
            effects: [
              { rel: 'pal', delta: 8, memory: 'the Saturday you kept for them' },
              { stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'shrug',
        label: 'Say they’ll understand one day',
        outcomes: [
          {
            chance: 1,
            text: '{pal.first} says “sure,” in the voice that means the opposite. You see less of each other after that.',
            effects: [{ rel: 'pal', delta: -8, memory: 'when you were too busy for them' }],
          },
        ],
      },
    ],
  },
  {
    id: 'tr_breakup',
    kind: 'choice',
    category: 'social',
    ages: [14, 17],
    weight: 7,
    cooldownYears: 2,
    when: all(goingOut, notInPrison),
    bind: { sw: { role: 'sweetheart', minAge: 14, maxAge: 17 } },
    text: '{sw.first} has gone quiet. Messages come back shorter; the walks home have stopped. It is fairly clear where this is going.',
    choices: [
      {
        id: 'talk',
        label: 'Talk about it honestly',
        outcomes: [
          {
            chance: 0.5,
            text: 'It turns out exams are crushing them and they thought you were bored. You sort it out on a bench in the rain.',
            effects: [
              { rel: 'sw', delta: 6, memory: 'the talk on the bench in the rain' },
              { stat: 'happiness', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'You agree, kindly, that it has run its course. You cry on the bus home, which nobody needs to know about.',
            effects: [
              { status: 'sweetheart_end', with: 'sw' },
              { stat: 'happiness', delta: -10 },
            ],
          },
        ],
      },
      {
        id: 'end',
        label: 'End it before they do',
        outcomes: [
          {
            chance: 1,
            text: 'You end it first, by the lockers, and immediately wish you hadn’t. The first heartbreak, it turns out, is the loud one.',
            effects: [
              { status: 'sweetheart_end', with: 'sw' },
              { rel: 'sw', delta: -10, memory: 'how it ended, by the lockers' },
              { stat: 'happiness', delta: -8 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'tr_eighteen',
    kind: 'choice',
    category: 'romance',
    adultsOnly: true,
    ages: [18, 21],
    weight: 1,
    chainOnly: true,
    bind: { sw: { role: 'sweetheart', minAge: 18 } },
    text: 'You and {sw.first} have been together since school. Now you are both eighteen, and everything is about to change: jobs, courses, cities.',
    choices: [
      {
        id: 'together',
        label: 'Stay together, as grown-ups',
        outcomes: [
          {
            chance: 1,
            text: 'You decide to keep going, eyes open. Your school friends place bets. You intend to win them.',
            effects: [
              { status: 'meet', with: 'sw' },
              { stat: 'happiness', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'apart',
        label: 'Go your separate ways, as friends',
        outcomes: [
          {
            chance: 1,
            text: 'You go your separate ways with a hug at the station and a promise to keep in touch, which you mostly keep.',
            effects: [
              { status: 'sweetheart_end', with: 'sw' },
              { rel: 'sw', delta: 2, memory: 'the hug at the station' },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'tr_old_flame',
    kind: 'choice',
    category: 'romance',
    adultsOnly: true,
    ages: [24, 50],
    weight: 5,
    once: true,
    when: (s) =>
      !s.npcs.some((n) => n.alive && (n.roles.includes('partner') || n.roles.includes('spouse'))),
    bind: { old: { role: 'friend', flag: 'ex_sweetheart', minAge: 22, fitsAttraction: true } },
    text: 'Years later you run into {old.first}, your school sweetheart, in a queue at the post office. They laugh the same way.',
    choices: [
      {
        id: 'coffee',
        label: 'Suggest a coffee',
        outcomes: [
          {
            chance: 0.5,
            text: 'One coffee becomes three hours. It is like no time has passed, and also like all of it has, in a good way.',
            effects: [
              { status: 'meet', with: 'old' },
              { stat: 'happiness', delta: 8 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'It is lovely to catch up, and very clear that you are different people now. You part as old friends.',
            effects: [{ rel: 'old', delta: 4, memory: 'the coffee years later' }],
          },
        ],
      },
      {
        id: 'wave',
        label: 'Just wave',
        outcomes: [
          {
            chance: 1,
            text: 'You wave and smile and let the past stay the past. It is a good memory to have.',
            effects: [{ stat: 'happiness', delta: 1 }],
          },
        ],
      },
    ],
  },
];
