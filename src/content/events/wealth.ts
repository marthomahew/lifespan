import type { EventDef } from '../../engine/events/types';
import { all, notInPrison, worthAtLeast, officeJob } from './conditions';

/** When you have real money, real decisions: the stakes scale with what you are worth. */
export const WEALTH_EVENTS: EventDef[] = [
  {
    id: 'wl_family_house',
    kind: 'choice',
    category: 'family',
    ages: [32, 85],
    weight: 7,
    cooldownYears: 10,
    when: all(worthAtLeast(250_000), notInPrison),
    bind: { sib: { role: 'sibling', minAge: 25, minRelationship: 20 } },
    text: '{sib.first} has found a house, the right house, for {sib.their} family. The bank wants a deposit {sib.they} will never save in time. {sib.They} ask{sib.s}, not quite looking at you.',
    choices: [
      {
        id: 'gift',
        label: 'Give the deposit outright',
        outcomes: [
          {
            chance: 1,
            text: 'You transfer it before you can overthink it. At the housewarming, {sib.first} gives a speech that you will remember for the rest of your life.',
            effects: [
              { wealth: -0.08 },
              { rel: 'sib', delta: 18, memory: 'the house deposit you gave' },
              { stat: 'happiness', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'loan',
        label: 'Lend it, properly, with paperwork',
        outcomes: [
          {
            chance: 0.6,
            text: 'Monthly payments arrive on the first of every month, with a little note each time. It takes years, and it all comes back.',
            effects: [{ rel: 'sib', delta: 6, memory: 'the loan for the house' }],
          },
          {
            chance: 0.4,
            text: 'The payments stop after a year. Nobody mentions it at Christmas, which is its own kind of mention.',
            effects: [
              { wealth: -0.05 },
              { rel: 'sib', delta: -10, memory: 'the loan nobody talks about' },
            ],
            next: { eventId: 'wl_loan_return', inYears: [4, 9] },
          },
        ],
      },
      {
        id: 'no',
        label: 'Say you can’t',
        outcomes: [
          {
            chance: 1,
            text: '{sib.first} says {sib.they} understand{sib.s}. The new address, when it finally comes, is a rented flat across town.',
            effects: [{ rel: 'sib', delta: -14, memory: 'the time you said no about the house' }],
          },
        ],
      },
    ],
  },
  {
    id: 'wl_friend_startup',
    kind: 'choice',
    category: 'money',
    ages: [28, 75],
    weight: 6,
    cooldownYears: 8,
    when: all(worthAtLeast(150_000), notInPrison),
    bind: { pal: { role: 'friend', minAge: 22 } },
    text: '{pal.first} is starting a company and wants you as the first investor. The deck has a hockey-stick graph and a logo that took longer than the business plan.',
    choices: [
      {
        id: 'big',
        label: 'Back it seriously',
        outcomes: [
          {
            chance: (s) => 0.3 + s.player.stats.smarts / 400,
            text: 'The company takes off faster than anyone dared hope, and a bigger one buys it. Your share comes back several times over, and {pal.first} sends you a bottle of something very old.',
            effects: [
              { wealth: 0.25 },
              { rel: 'pal', delta: 12, memory: 'backing the company early' },
              { stat: 'happiness', delta: 8 },
            ],
            success: true,
          },
          {
            chance: (s) => 0.7 - s.player.stats.smarts / 400,
            text: 'The company runs out of money in month nineteen. {pal.first} apologises for a long time. You lose a lot, and keep the friend.',
            effects: [
              { wealth: -0.12 },
              { rel: 'pal', delta: 4, memory: 'the company that didn’t make it' },
              { stat: 'happiness', delta: -6 },
            ],
          },
        ],
      },
      {
        id: 'small',
        label: 'Put in something you can afford to lose',
        outcomes: [
          {
            chance: 0.4,
            text: 'It does well enough. A small cheque, a big thank-you, and a framed copy of the first invoice.',
            effects: [
              { wealth: 0.03 },
              { rel: 'pal', delta: 6, memory: 'investing in the company' },
            ],
            success: true,
          },
          {
            chance: 0.6,
            text: 'It folds. You lose exactly what you decided you could lose, which turns out to be a very good rule.',
            effects: [
              { wealth: -0.02 },
              { rel: 'pal', delta: 3, memory: 'investing in the company' },
            ],
          },
        ],
      },
      {
        id: 'no',
        label: 'Wish them luck and keep your money',
        outcomes: [
          {
            chance: 1,
            text: '{pal.first} takes it well, mostly. You find yourself checking the news for the company name every few months.',
            effects: [{ rel: 'pal', delta: -4, memory: 'saying no to the company' }],
            next: { eventId: 'wl_startup_news', inYears: [3, 6] },
          },
        ],
      },
    ],
  },
  {
    id: 'wl_foundation',
    kind: 'choice',
    category: 'money',
    ages: [40, 95],
    weight: 5,
    once: true,
    when: all(worthAtLeast(1_500_000), notInPrison),
    text: 'A financial adviser, a charity director and your conscience all say the same thing in the same month: you could give a real amount away, and it would change something.',
    choices: [
      {
        id: 'found',
        label: 'Set up a foundation with a fifth of everything',
        outcomes: [
          {
            chance: 1,
            text: 'A small office, three staff, and a scholarship with your name on it. The first letter from a student who got one goes on your fridge.',
            effects: [
              { wealth: -0.2 },
              { stat: 'happiness', delta: 12 },
              { stat: 'karma', delta: 15 },
              { fame: 4 },
              { flag: 'philanthropist' },
            ],
          },
        ],
      },
      {
        id: 'quiet',
        label: 'Give a twentieth, quietly',
        outcomes: [
          {
            chance: 1,
            text: 'No plaque, no gala. A food bank gets a new van and a hospice gets a garden. You tell nobody, and it feels better that way.',
            effects: [
              { wealth: -0.05 },
              { stat: 'happiness', delta: 6 },
              { stat: 'karma', delta: 8 },
            ],
          },
        ],
      },
      {
        id: 'no',
        label: 'Not yet',
        outcomes: [
          {
            chance: 1,
            text: 'There will be time. You put the brochure in a drawer with the others.',
            effects: [{ stat: 'karma', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'wl_lawsuit',
    kind: 'choice',
    category: 'money',
    ages: [30, 80],
    weight: 5,
    cooldownYears: 15,
    when: all(worthAtLeast(400_000), officeJob, notInPrison),
    text: 'A letter from a law firm: a former client says a decision of yours cost them dearly. Their lawyer has clearly looked up what you are worth.',
    choices: [
      {
        id: 'settle',
        label: 'Settle quietly',
        outcomes: [
          {
            chance: 1,
            text: 'You sign a confidentiality agreement and a large cheque. It is over in a month, and it stings for a year.',
            effects: [{ wealth: -0.06 }, { stat: 'stress', delta: 4 }],
          },
        ],
      },
      {
        id: 'fight',
        label: 'Fight it in court',
        outcomes: [
          {
            chance: (s) => 0.5 + (s.player.stats.smarts - 50) / 200,
            text: 'Two years of letters, one day in court, and a judge who dismisses the whole thing in under an hour. Vindication, and costs.',
            effects: [
              { wealth: -0.01 },
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: 8 },
            ],
            success: true,
          },
          {
            chance: (s) => 0.5 + -(s.player.stats.smarts - 50) / 200,
            text: 'You lose, and pay their lawyers as well as yours. You learn a great deal about the word "costs".',
            effects: [
              { wealth: -0.15 },
              { stat: 'happiness', delta: -8 },
              { stat: 'stress', delta: 12 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'wl_holiday_home',
    kind: 'choice',
    category: 'money',
    ages: [35, 85],
    weight: 5,
    once: true,
    when: all(worthAtLeast(800_000), notInPrison),
    text: 'A cottage by the sea, white shutters and a crooked gate, is for sale in the village where you once had the best holiday of your life.',
    choices: [
      {
        id: 'buy',
        label: 'Buy it',
        outcomes: [
          {
            chance: 1,
            text: 'You spend every summer there from now on. The village slowly decides you are allowed to stay. The gate stays crooked.',
            effects: [
              { system: 'holiday_home' },
              { stat: 'happiness', delta: 10 },
              { stat: 'stress', delta: -6 },
              { flag: 'holiday_home' },
            ],
          },
        ],
      },
      {
        id: 'no',
        label: 'Keep it as a memory',
        outcomes: [
          {
            chance: 1,
            text: 'You walk past it one more time on the last day of a holiday, and leave it where it belongs: in the good past.',
            effects: [{ stat: 'happiness', delta: 1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'wl_loan_return',
    kind: 'choice',
    category: 'family',
    ages: [32, 95],
    weight: 1,
    chainOnly: true,
    bind: { sib: { role: 'sibling', minAge: 25 } },
    text: '{sib.first} turns up on your doorstep with an envelope and a face that has clearly rehearsed this. It is the rest of the house loan, years late, every penny.',
    choices: [
      {
        id: 'take',
        label: 'Take it, and hug them',
        outcomes: [
          {
            chance: 1,
            text: 'You take the envelope and then you take {sib.first}, and neither of you lets go for a while. Christmas is easier after that.',
            effects: [
              { wealth: 0.04 },
              { rel: 'sib', delta: 16, memory: 'paying back the loan, finally' },
              { stat: 'happiness', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'keep',
        label: 'Tell them to keep it for the kids',
        outcomes: [
          {
            chance: 1,
            text: '{sib.first} argues, then cries, then puts the envelope back in {sib.their} coat. A university fund is opened that week in {sib.their} children’s names.',
            effects: [
              { rel: 'sib', delta: 22, memory: 'the loan you told me to keep' },
              { stat: 'karma', delta: 6 },
              { stat: 'happiness', delta: 6 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'wl_startup_news',
    kind: 'notice',
    category: 'money',
    ages: [28, 95],
    weight: 1,
    chainOnly: true,
    bind: { pal: { role: 'friend', minAge: 22 } },
    text: 'The company you said no to is in the news.',
    outcomes: [
      {
        chance: 0.35,
        text: 'It has sold for a figure with a great many zeros. {pal.first} sends you a kind message and, you suspect, a slightly smug one. You do the sums once and then make yourself stop.',
        effects: [
          { stat: 'happiness', delta: -5 },
          { rel: 'pal', delta: 2, memory: 'the company that sold without you' },
        ],
      },
      {
        chance: 0.65,
        text: 'It has quietly closed. {pal.first} is fine, already on to the next thing, and admits over a drink that you were right not to put money in.',
        effects: [
          { stat: 'happiness', delta: 2 },
          { rel: 'pal', delta: 4, memory: 'admitting you were right about the company' },
        ],
      },
    ],
  },
];
