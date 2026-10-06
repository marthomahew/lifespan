import type { EventDef } from '../../engine/events/types';
import { inPrison } from './conditions';
import type { GameState } from '../../engine/types';

const longStretch = (s: GameState): boolean =>
  s.legal.prison !== null && s.legal.prison.years - s.legal.prison.served >= 2;

/** Life inside (SPEC §5.10). Only these, the court events and prison activities happen in prison. */
export const PRISON_EVENTS: EventDef[] = [
  {
    id: 'prison_visiting_day',
    kind: 'choice',
    category: 'family',
    ages: [16, 100],
    weight: 10,
    cooldownYears: 4,
    inPrison: true,
    when: inPrison,
    bind: { visitor: { role: 'mother', minRelationship: 25 } },
    text: '{visitor.first} comes on visiting day and sits across the scratched table with a bag of vending-machine crisps, the only gift the guards allow.',
    choices: [
      {
        id: 'honest',
        label: 'Tell the truth about how it is',
        outcomes: [
          {
            chance: 1,
            text: '{visitor.first} listens without flinching and holds your hand until the buzzer goes.',
            effects: [
              { rel: 'visitor', delta: 8, memory: 'the visiting-room table' },
              { stat: 'stress', delta: -6 },
            ],
          },
        ],
      },
      {
        id: 'brave',
        label: 'Say everything is fine',
        outcomes: [
          {
            chance: 1,
            text: '{visitor.first} pretends to believe you. You both get very good at it.',
            effects: [
              { rel: 'visitor', delta: 2, memory: 'the brave face on visiting day' },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'sendaway',
        label: 'Ask them not to come again',
        outcomes: [
          {
            chance: 1,
            text: 'You say it is easier this way. {visitor.first} leaves the crisps and goes without arguing, which hurts more.',
            effects: [
              { rel: 'visitor', delta: -12, memory: 'being told not to visit' },
              { stat: 'happiness', delta: -6 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'prison_letter_partner',
    kind: 'choice',
    category: 'romance',
    ages: [18, 100],
    weight: 8,
    cooldownYears: 4,
    adultsOnly: true,
    inPrison: true,
    when: inPrison,
    bind: { love: { role: 'partner', minAge: 18 } },
    text: 'A letter from {love.first}, four pages, the handwriting getting smaller towards the end as if running out of room or nerve.',
    choices: [
      {
        id: 'write',
        label: 'Write back every week',
        outcomes: [
          {
            chance: 0.7,
            text: 'The letters become a rhythm. You learn more about each other on paper than you ever did out loud.',
            effects: [
              { rel: 'love', delta: 10, memory: 'the letters from inside' },
              { stat: 'happiness', delta: 5 },
            ],
          },
          {
            chance: 0.3,
            text: 'The replies get shorter, then stop. The last one says {love.first} needs to live a life, too.',
            effects: [
              { status: 'breakup', with: 'love' },
              { stat: 'happiness', delta: -10 },
            ],
          },
        ],
      },
      {
        id: 'release',
        label: 'Tell them not to wait',
        outcomes: [
          {
            chance: 1,
            text: 'You write the kindest thing you can manage, which is goodbye. It takes eleven drafts.',
            effects: [
              { status: 'breakup', with: 'love' },
              { stat: 'karma', delta: 4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'prison_cellmate_story',
    kind: 'choice',
    category: 'social',
    ages: [16, 100],
    weight: 9,
    cooldownYears: 5,
    inPrison: true,
    when: inPrison,
    bind: { mate: { role: 'cellmate' } },
    text: 'After lights out, {mate.first} starts talking about a daughter {mate.first} hasn’t seen in six years, and doesn’t seem to want an answer.',
    choices: [
      {
        id: 'listen',
        label: 'Just listen',
        outcomes: [
          {
            chance: 1,
            text: 'You say nothing useful and that turns out to be the right thing. Breakfast is easier the next morning.',
            effects: [
              { rel: 'mate', delta: 10, memory: 'the night you listened' },
              { stat: 'karma', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'share',
        label: 'Tell them your own story',
        outcomes: [
          {
            chance: 0.7,
            text: 'You trade regrets until the small hours. Neither of you mentions it again, but something has shifted.',
            effects: [
              { rel: 'mate', delta: 12, memory: 'trading regrets after lights out' },
              { stat: 'stress', delta: -4 },
            ],
          },
          {
            chance: 0.3,
            text: 'By the weekend half the wing knows your story. {mate.first} swears to have kept quiet.',
            effects: [
              { rel: 'mate', delta: -8, memory: 'your story getting around the wing' },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'sleep',
        label: 'Pretend to be asleep',
        outcomes: [
          {
            chance: 1,
            text: 'The talking trails off. You lie awake anyway, staring at the bunk above.',
            effects: [{ rel: 'mate', delta: -3, memory: 'pretending to sleep' }],
          },
        ],
      },
    ],
  },
  {
    id: 'prison_kitchen_job',
    kind: 'choice',
    category: 'work',
    ages: [18, 75],
    weight: 9,
    cooldownYears: 4,
    inPrison: true,
    when: inPrison,
    text: 'A spot opens in the prison kitchen. It pays pennies an hour, starts at five, and comes with the right to wear a hairnet.',
    choices: [
      {
        id: 'take',
        label: 'Take the job',
        outcomes: [
          {
            chance: 1,
            text: 'You learn to make porridge for four hundred. The cook says you have “a feel for volume”.',
            effects: [
              { skill: 'cooking', delta: 8 },
              { stat: 'discipline', delta: 5 },
              { money: 150 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'pass',
        label: 'Keep your mornings',
        outcomes: [
          {
            chance: 1,
            text: 'Someone else gets the hairnet. You get another year of the same four walls.',
            effects: [{ stat: 'happiness', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'prison_contraband_offer',
    kind: 'choice',
    category: 'crime',
    ages: [18, 80],
    weight: 7,
    cooldownYears: 4,
    inPrison: true,
    when: inPrison,
    text: 'A man from the next wing offers you a cut if you keep a small parcel in your cell for a week. He doesn’t say what is in it.',
    choices: [
      {
        id: 'refuse',
        label: 'Refuse',
        outcomes: [
          {
            chance: 0.8,
            text: 'He shrugs and finds someone else. A week later that someone is in solitary.',
            effects: [{ stat: 'karma', delta: 3 }],
          },
          {
            chance: 0.2,
            text: 'He takes it personally. Meals get tense for a while.',
            effects: [{ stat: 'stress', delta: 6 }, { status: 'enemy' }],
          },
        ],
      },
      {
        id: 'accept',
        label: 'Hide the parcel',
        outcomes: [
          {
            chance: 0.6,
            text: 'The week passes. Your cut arrives as a stack of phone cards and a nod in the yard.',
            effects: [
              { money: 400 },
              { stat: 'notoriety', delta: 4 },
              { stat: 'karma', delta: -5 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'A cell search finds it in under a minute. The disciplinary report goes in your file.',
            effects: [
              { stat: 'stress', delta: 10 },
              { stat: 'notoriety', delta: 6 },
              { stat: 'karma', delta: -5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'prison_education_class',
    kind: 'choice',
    category: 'school',
    ages: [16, 85],
    weight: 8,
    cooldownYears: 4,
    inPrison: true,
    when: inPrison,
    text: 'A volunteer from the community college starts an evening class in the chapel. The sign-up sheet has two names on it.',
    choices: [
      {
        id: 'write',
        label: 'Join the writing class',
        outcomes: [
          {
            chance: 1,
            text: 'Your first story is about a vending machine with a grudge. The volunteer reads it twice and laughs both times.',
            effects: [
              { skill: 'writing', delta: 10 },
              { stat: 'smarts', delta: 3 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'art',
        label: 'Join the art class',
        outcomes: [
          {
            chance: 1,
            text: 'You draw the view from the yard forty times. The fortieth is actually good.',
            effects: [
              { skill: 'art', delta: 10 },
              { stat: 'stress', delta: -5 },
            ],
          },
        ],
      },
      {
        id: 'skip',
        label: 'Leave the sheet alone',
        outcomes: [
          {
            chance: 1,
            text: 'The class folds after a month for lack of interest. Evenings stay long.',
            effects: [{ stat: 'smarts', delta: -1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'prison_parole_board',
    kind: 'choice',
    category: 'crime',
    ages: [18, 100],
    weight: 6,
    cooldownYears: 5,
    inPrison: true,
    when: longStretch,
    text: 'Three people behind a long table want to know who you are now. One of them is already writing before you speak.',
    choices: [
      {
        id: 'remorse',
        label: 'Speak about what you did',
        outcomes: [
          {
            chance: 1,
            text: 'You don’t make excuses. The woman in the middle puts her pen down to listen.',
            effects: [
              { stat: 'karma', delta: 5 },
              { stat: 'stress', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'innocent',
        label: 'Insist you were wronged',
        outcomes: [
          {
            chance: 1,
            text: 'They have heard this one before. The pen keeps moving.',
            effects: [{ stat: 'stress', delta: 6 }],
          },
        ],
      },
    ],
  },
  {
    id: 'prison_birthday_card',
    kind: 'notice',
    category: 'family',
    ages: [16, 100],
    weight: 6,
    cooldownYears: 5,
    inPrison: true,
    when: inPrison,
    bind: { kin: { role: 'sibling', minRelationship: 20 } },
    text: 'A birthday card from {kin.first} arrives two weeks late and opened by the mailroom.',
    outcomes: [
      {
        chance: 1,
        text: 'Inside: a drawing of a cake and the words “still family, idiot”. You tape it above the bunk.',
        effects: [
          { rel: 'kin', delta: 6, memory: 'the late birthday card' },
          { stat: 'happiness', delta: 4 },
        ],
      },
    ],
  },
  {
    id: 'prison_lockdown',
    kind: 'notice',
    category: 'crime',
    ages: [16, 100],
    weight: 7,
    cooldownYears: 5,
    inPrison: true,
    when: inPrison,
    text: 'Something happens on another wing and the whole prison goes into lockdown for nine days.',
    outcomes: [
      {
        chance: 0.6,
        text: 'You read the same paperback three times and invent a card game with no cards.',
        effects: [{ stat: 'stress', delta: 6 }],
      },
      {
        chance: 0.4,
        text: 'Meals come on trays through the door and nobody tells you anything. You sleep badly for weeks after.',
        effects: [
          { stat: 'stress', delta: 9 },
          { stat: 'health', delta: -2 },
        ],
      },
    ],
  },
  {
    id: 'prison_yard_sunlight',
    kind: 'notice',
    category: 'health',
    ages: [16, 100],
    weight: 6,
    cooldownYears: 4,
    inPrison: true,
    when: inPrison,
    text: 'The yard schedule changes and your hour outside moves to mid-afternoon.',
    outcomes: [
      {
        chance: 1,
        text: 'For the first time in ages you feel sun on your face for a whole hour. You make it last.',
        effects: [
          { stat: 'happiness', delta: 4 },
          { stat: 'health', delta: 1 },
        ],
      },
    ],
  },
];
