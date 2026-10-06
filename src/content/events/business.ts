import type { EventDef } from '../../engine/events/types';
import { all, hasBusiness, notInPrison, runsOwnBusiness } from './conditions';

const own = all(hasBusiness(), notInPrison);

/** Owning a business: the good years, the bad ones, and the offers (needs a business). */
export const BUSINESS_EVENTS: EventDef[] = [
  {
    id: 'biz_big_order',
    kind: 'choice',
    category: 'money',
    ages: [18, 90],
    weight: 8,
    cooldownYears: 4,
    when: own,
    text: 'The biggest order {business} has ever seen lands on a Tuesday: twice your usual year’s work, due in three months.',
    choices: [
      {
        id: 'take',
        label: 'Take it, and hire to deliver',
        outcomes: [
          {
            chance: 0.7,
            text: 'Three months of chaos, temporary staff and pizza at midnight. You deliver a day early, and they sign up for next year.',
            effects: [
              { system: 'biz_health', arg: '18' },
              { stat: 'stress', delta: 8 },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'You deliver late and over budget. They pay, eventually, and do not call again.',
            effects: [
              { system: 'biz_health', arg: '-10' },
              { stat: 'stress', delta: 10 },
            ],
          },
        ],
      },
      {
        id: 'pass',
        label: 'Turn it down: you can’t do it well',
        outcomes: [
          {
            chance: 1,
            text: 'You say no politely. Your regulars never know how close they came to being neglected.',
            effects: [{ stat: 'stress', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'biz_rival',
    kind: 'choice',
    category: 'money',
    ages: [18, 90],
    weight: 8,
    cooldownYears: 6,
    when: own,
    text: 'A big chain opens across the street from {business}, with a launch offer you cannot possibly match.',
    choices: [
      {
        id: 'price',
        label: 'Cut your prices',
        outcomes: [
          {
            chance: 0.4,
            text: 'You win the price war by a whisker. The chain quietly moves on after a year. Your margins take longer to recover.',
            effects: [
              { system: 'biz_health', arg: '5' },
              { money: -5000, kind: 'wage' },
            ],
            success: true,
          },
          {
            chance: 0.6,
            text: 'They can lose money for longer than you can. You lose customers and money both.',
            effects: [
              { system: 'biz_health', arg: '-15' },
              { money: -5000, kind: 'wage' },
            ],
          },
        ],
      },
      {
        id: 'niche',
        label: 'Be the thing they can’t be',
        outcomes: [
          {
            chance: 1,
            text: 'You lean into what makes you yours: names remembered, the odd specialty, a dog bowl by the door. The customers who matter stay.',
            effects: [{ system: 'biz_health', arg: '8' }],
            success: true,
          },
        ],
      },
      {
        id: 'ignore',
        label: 'Carry on as you are',
        outcomes: [
          {
            chance: 1,
            text: 'You carry on. It is a slow bleed, and you only notice it at the end of the year.',
            effects: [{ system: 'biz_health', arg: '-10' }],
          },
        ],
      },
    ],
  },
  {
    id: 'biz_viral',
    kind: 'notice',
    category: 'money',
    ages: [18, 90],
    weight: 5,
    cooldownYears: 8,
    when: own,
    text: 'Someone famous mentions {business} to a very large audience, completely unprompted.',
    outcomes: [
      {
        chance: 1,
        text: 'By the weekend there are queues round the block and strangers taking photographs of your sign. You hire two people on the spot.',
        effects: [
          { system: 'biz_health', arg: '20' },
          { stat: 'happiness', delta: 6 },
        ],
      },
    ],
  },
  {
    id: 'biz_theft',
    kind: 'choice',
    category: 'money',
    ages: [18, 90],
    weight: 6,
    cooldownYears: 8,
    when: own,
    text: 'The numbers at {business} haven’t added up for months. It turns out your longest-serving employee has been taking a little every week.',
    choices: [
      {
        id: 'police',
        label: 'Call the police',
        outcomes: [
          {
            chance: 1,
            text: 'Some of it comes back. The rest of the staff are very punctual for a while.',
            effects: [
              { money: 3000, kind: 'wage' },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'chance',
        label: 'Talk to them, and give them a second chance',
        outcomes: [
          {
            chance: 0.6,
            text: 'There is a sick parent and a pile of debt behind it. They pay it back in small envelopes, and become the most loyal person you employ.',
            effects: [
              { stat: 'karma', delta: 6 },
              { system: 'biz_health', arg: '5' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'It happens again. You were kind and they were not. You let them go.',
            effects: [
              { money: -2000, kind: 'wage' },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'biz_buyout',
    kind: 'choice',
    category: 'money',
    ages: [18, 90],
    weight: 5,
    cooldownYears: 10,
    when: (s) => own(s) && (s.business?.health ?? 0) >= 60,
    text: 'A larger company wants to buy {business}. Their offer is well above what you think it is worth, and comes with a pen.',
    choices: [
      {
        id: 'sell',
        label: 'Sell',
        outcomes: [
          {
            chance: 1,
            text: 'You sign. The money arrives on a Thursday. On Friday you do not know what to do with your hands.',
            effects: [
              { system: 'biz_sell', arg: '1.5' },
              { stat: 'happiness', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'keep',
        label: 'It isn’t for sale',
        outcomes: [
          {
            chance: 1,
            text: 'You turn them down. That evening you walk round the place after closing, turning off the lights one by one, very pleased with yourself.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { system: 'biz_health', arg: '3' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'biz_next_door',
    kind: 'choice',
    category: 'money',
    ages: [18, 90],
    weight: 5,
    cooldownYears: 8,
    when: (s) => own(s) && (s.business?.level ?? 5) < 5,
    text: 'The unit next to {business} comes up, cheap, from a landlord who likes you. Knock through and you could double in size.',
    choices: [
      {
        id: 'grow',
        label: 'Take it',
        outcomes: [
          {
            chance: 1,
            text: 'Builders, dust and a very long month. Then you open the bigger place, and it fills.',
            effects: [
              { money: -15000, kind: 'wage' },
              { system: 'biz_expand' },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'no',
        label: 'Stay the size you are',
        outcomes: [
          {
            chance: 1,
            text: 'You say no. Small is a choice, and you made it.',
            effects: [{ stat: 'stress', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'biz_eating_life',
    kind: 'choice',
    category: 'money',
    ages: [18, 90],
    weight: 6,
    cooldownYears: 6,
    when: all(hasBusiness(), runsOwnBusiness),
    text: 'Seven days a week at {business}. You eat standing up, your phone never stops, and someone you love says they miss you.',
    choices: [
      {
        id: 'manager',
        label: 'Hire a manager',
        outcomes: [
          {
            chance: 1,
            text: 'You hand over the keys to someone sensible. It costs you a cut and gives you back your Sundays.',
            effects: [
              { system: 'biz_manager' },
              { stat: 'stress', delta: -12 },
              { stat: 'happiness', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'push',
        label: 'Push on: it’s nearly there',
        outcomes: [
          {
            chance: 1,
            text: 'You keep going. The business thrives. You are less sure about yourself.',
            effects: [
              { system: 'biz_health', arg: '8' },
              { stat: 'stress', delta: 10 },
              { stat: 'health', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'biz_inspection',
    kind: 'choice',
    category: 'money',
    ages: [18, 90],
    weight: 6,
    cooldownYears: 5,
    when: all(hasBusiness('cafe', 'restaurant'), notInPrison),
    text: 'A health inspector arrives at {business} unannounced, with a clipboard and the face of someone who has seen things.',
    choices: [
      {
        id: 'show',
        label: 'Show them everything',
        outcomes: [
          {
            chance: (s) => Math.min(0.9, 0.5 + (s.player.skills['cooking'] ?? 0) / 200),
            text: 'Top marks. You frame the certificate and put it where the queue can see it.',
            effects: [{ system: 'biz_health', arg: '8' }],
            success: true,
          },
          {
            chance: 0.3,
            text: 'A fridge two degrees too warm and a mop in the wrong bucket. A middling grade goes in the window, and you buy a new fridge.',
            effects: [
              { system: 'biz_health', arg: '-8' },
              { money: -2000, kind: 'wage' },
            ],
          },
        ],
      },
      {
        id: 'charm',
        label: 'Offer them coffee and a slice of cake',
        outcomes: [
          {
            chance: 1,
            text: 'They decline the cake, inspect everything twice, and write “attempted to offer inducement” in very neat handwriting.',
            effects: [{ system: 'biz_health', arg: '-6' }],
          },
        ],
      },
    ],
  },
];
