import type { EventDef } from '../../engine/events/types';
import type { GameState } from '../../engine/types';
import { JOB_BY_ID } from '../jobs';
import { holdingValue } from '../../engine/systems/markets';
import { money } from '../../engine/economy';

/** Close enough to computers to notice things early: code, or a job in tech. */
const techSavvy = (s: GameState): boolean =>
  (s.player.skills['programming'] ?? 0) >= 40 ||
  JOB_BY_ID[s.career.jobId ?? '']?.field === 'technology';
const adult = (s: GameState): boolean => s.player.age >= 18 && !s.legal.prison;
const holds =
  (id: string, ref = 1) =>
  (s: GameState): boolean =>
    holdingValue(s, id) >= money(s, ref, 'price');

/** Moments in the markets: the hunches, the bubbles, and the coins. Real years. */
export const MARKET_EVENTS: EventDef[] = [
  {
    id: 'mk_internet_1997',
    kind: 'choice',
    category: 'money',
    emoji: '🌐',
    ages: [18, 80],
    weight: 9,
    once: true,
    fromYear: 1996,
    toYear: 1998,
    when: (s) => adult(s) && (techSavvy(s) || s.player.stats.smarts >= 70),
    text: 'A friend who works with computers shows you a website that sells books, any book, delivered. “This internet thing,” they say, “is going to eat everything.”',
    choices: [
      {
        id: 'amazon',
        label: 'Put a few thousand into that bookshop’s shares',
        outcomes: [
          {
            chance: 1,
            text: 'You buy shares in the internet bookshop. Your bank manager raises an eyebrow you will remember for years.',
            effects: [{ system: 'buy_shares', arg: 'AMZN:3000' }],
          },
        ],
      },
      {
        id: 'microsoft',
        label: 'Back the software company everyone already uses',
        outcomes: [
          {
            chance: 1,
            text: 'You buy into the company whose logo is on every office computer. It feels like the safe bet.',
            effects: [{ system: 'buy_shares', arg: 'MSFT:3000' }],
          },
        ],
      },
      {
        id: 'pass',
        label: 'It’s a fad',
        outcomes: [
          {
            chance: 1,
            text: 'You tell your friend it is a fad, like CB radio. You will think about this conversation again.',
            effects: [{ flag: 'doubted_internet' }],
          },
        ],
      },
    ],
  },
  {
    id: 'mk_dotcom_1999',
    kind: 'choice',
    category: 'money',
    emoji: '🫧',
    ages: [18, 85],
    weight: 9,
    once: true,
    fromYear: 1999,
    toYear: 2000,
    when: (s) => adult(s) && s.money.cash > money(s, 5000, 'price'),
    text: 'Everyone at work is suddenly an investor. A colleague doubled their money on a company that sells pet food over the internet and has never made a profit.',
    choices: [
      {
        id: 'chase',
        label: 'Get in on tech before it’s too late',
        outcomes: [
          {
            chance: 1,
            text: 'You buy tech shares at the top of the most famous bubble in a generation, which you will learn in about eighteen months.',
            effects: [
              { system: 'buy_shares', arg: 'MSFT:5000' },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'sit',
        label: 'Something about this feels wrong',
        outcomes: [
          {
            chance: 1,
            text: 'You keep your money where it is and are called a dinosaur at two separate dinner parties.',
            effects: [{ flag: 'skipped_bubble' }],
          },
        ],
      },
    ],
  },
  {
    id: 'mk_btc_forum',
    kind: 'choice',
    category: 'money',
    emoji: '₿',
    ages: [14, 80],
    weight: 12,
    once: true,
    fromYear: 2010,
    toYear: 2012,
    when: (s) => !s.legal.prison && techSavvy(s),
    text: 'On a programming forum, someone has posted about a new digital money that nobody controls. You can make it at home with a spare computer, or buy it for pennies from strangers.',
    choices: [
      {
        id: 'mine',
        label: 'Leave a computer mining it',
        outcomes: [
          {
            chance: 1,
            text: 'An old computer hums in the corner for months, running up the electricity bill and filling a little file with coins. You mostly forget about it.',
            effects: [
              { system: 'grant_shares', arg: 'BTC:180' },
              { money: -400, kind: 'price' },
              { flag: 'early_miner' },
            ],
            next: { eventId: 'mk_btc_drive', inYears: [2, 4] },
          },
        ],
      },
      {
        id: 'buy',
        label: 'Buy a hundred dollars’ worth, for fun',
        outcomes: [
          {
            chance: 1,
            text: 'You send a hundred dollars to a stranger on the internet and receive a string of letters that is, apparently, money.',
            effects: [{ system: 'buy_shares', arg: 'BTC:100' }, { flag: 'early_buyer' }],
            next: { eventId: 'mk_btc_drive', inYears: [2, 4] },
          },
        ],
      },
      {
        id: 'ignore',
        label: 'Internet money. Sure.',
        outcomes: [
          {
            chance: 1,
            text: 'You close the tab. Somewhere, a pizza is bought for ten thousand of these coins.',
            effects: [{ flag: 'ignored_bitcoin' }],
          },
        ],
      },
    ],
  },
  {
    id: 'mk_btc_drive',
    kind: 'choice',
    category: 'money',
    emoji: '💾',
    ages: [14, 90],
    weight: 1,
    chainOnly: true,
    when: holds('BTC', 1),
    text: 'Clearing out a cupboard, you find the old computer that holds your digital coins. It makes a clicking sound when you turn it on, which is not a good sound.',
    choices: [
      {
        id: 'recover',
        label: 'Pay a specialist to rescue the drive',
        outcomes: [
          {
            chance: 0.8,
            text: 'The specialist hands back a memory stick and a large invoice. You write the keys down on paper and put it in a fire safe.',
            effects: [{ money: -1500, kind: 'price' }, { flag: 'keys_safe' }],
            success: true,
          },
          {
            chance: 0.2,
            text: 'Nothing can be saved. Your coins are still out there, forever, unreachable. You try not to look at the price.',
            effects: [
              { money: -1500, kind: 'price' },
              { system: 'lose_shares', arg: 'BTC:1' },
              { stat: 'happiness', delta: -6 },
            ],
          },
        ],
      },
      {
        id: 'bin',
        label: 'It’s just old junk',
        outcomes: [
          {
            chance: 1,
            text: 'The computer goes to the tip. Years later you will lie awake doing a sum you wish you had never done.',
            effects: [{ system: 'lose_shares', arg: 'BTC:1' }, { flag: 'binned_bitcoin' }],
          },
        ],
      },
    ],
  },
  {
    id: 'mk_btc_exchange',
    kind: 'choice',
    category: 'money',
    emoji: '🏦',
    ages: [18, 90],
    weight: 12,
    once: true,
    fromYear: 2013,
    toYear: 2013,
    when: holds('BTC', 200),
    text: 'Your coins sit on a big exchange in Tokyo, which is convenient. A friend who knows these things says you should hold the keys yourself.',
    choices: [
      {
        id: 'own',
        label: 'Move them to a wallet you control',
        outcomes: [
          {
            chance: 1,
            text: 'It takes an evening and a lot of nervous checking. The coins sit in a wallet only you can open.',
            effects: [{ flag: 'self_custody' }],
          },
        ],
      },
      {
        id: 'leave',
        label: 'Leave them where they are',
        outcomes: [
          {
            chance: 1,
            text: 'You leave them on the exchange. It is very convenient, right up until it isn’t.',
            effects: [{ flag: 'on_exchange' }],
            next: { eventId: 'mk_exchange_collapse', inYears: 1 },
          },
        ],
      },
    ],
  },
  {
    id: 'mk_exchange_collapse',
    kind: 'notice',
    category: 'money',
    emoji: '💥',
    ages: [18, 90],
    weight: 1,
    chainOnly: true,
    text: 'The exchange holding your coins stops letting anyone withdraw, then announces that most of the coins have simply vanished.',
    outcomes: [
      {
        chance: 1,
        text: 'You lose most of what you had there. The letters from the liquidators will keep coming for a decade.',
        effects: [
          { system: 'lose_shares', arg: 'BTC:0.75' },
          { stat: 'happiness', delta: -8 },
          { stat: 'stress', delta: 8 },
        ],
      },
    ],
  },
  {
    id: 'mk_btc_mania',
    kind: 'choice',
    category: 'money',
    emoji: '🚀',
    ages: [18, 95],
    weight: 12,
    cooldownYears: 3,
    fromYear: 2013,
    when: (s) => [2013, 2017, 2021, 2024].includes(s.year) && holds('BTC', 20000)(s),
    text: 'Bitcoin is on the evening news again. The coins you hold are worth more than you ever expected to have, and your relatives have Opinions at dinner.',
    choices: [
      {
        id: 'half',
        label: 'Sell half and sleep at night',
        outcomes: [
          {
            chance: 1,
            text: 'You sell half. It feels responsible, which is a strange feeling to have about internet money.',
            effects: [
              { system: 'sell_shares', arg: 'BTC:0.5' },
              { stat: 'stress', delta: -6 },
            ],
          },
        ],
      },
      {
        id: 'all',
        label: 'Sell everything',
        outcomes: [
          {
            chance: 1,
            text: 'You cash out completely and watch what happens next from the sidelines, with a mixture of relief and dread.',
            effects: [{ system: 'sell_shares', arg: 'BTC:1' }],
          },
        ],
      },
      {
        id: 'hold',
        label: 'Hold. It’s going higher.',
        outcomes: [
          {
            chance: 1,
            text: 'You hold, and practise saying “it’s a long-term thing” to your relatives.',
            effects: [{ stat: 'stress', delta: 4 }],
          },
        ],
      },
    ],
  },
  {
    id: 'mk_iphone_2007',
    kind: 'choice',
    category: 'money',
    emoji: '📱',
    ages: [18, 85],
    weight: 9,
    once: true,
    fromYear: 2007,
    toYear: 2008,
    when: (s) => adult(s) && s.money.cash > money(s, 3000, 'price'),
    text: 'A friend lets you hold the first touchscreen phone from the computer company with the fruit logo. You scroll a map with one finger and something clicks.',
    choices: [
      {
        id: 'buy',
        label: 'Buy the company’s shares',
        outcomes: [
          {
            chance: 1,
            text: 'You buy a few thousand worth. Then the financial crisis arrives and you nearly sell them all. You don’t.',
            effects: [{ system: 'buy_shares', arg: 'AAPL:3000' }],
          },
        ],
      },
      {
        id: 'pass',
        label: 'Just buy the phone',
        outcomes: [
          {
            chance: 1,
            text: 'You buy the phone instead, which is also, in its way, a decision you live with daily.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { money: -500, kind: 'price' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mk_gpu_2016',
    kind: 'choice',
    category: 'money',
    emoji: '🧠',
    ages: [18, 85],
    weight: 10,
    once: true,
    fromYear: 2015,
    toYear: 2018,
    when: (s) => adult(s) && techSavvy(s),
    text: 'At work, the people building artificial intelligence keep ordering gaming graphics cards by the crate. Nobody outside the field seems to have noticed.',
    choices: [
      {
        id: 'buy',
        label: 'Buy shares in the graphics chip company',
        outcomes: [
          {
            chance: 1,
            text: 'You buy some shares in the company that makes the chips. Your gamer cousin is baffled.',
            effects: [{ system: 'buy_shares', arg: 'NVDA:5000' }],
          },
        ],
      },
      {
        id: 'pass',
        label: 'It’s a niche',
        outcomes: [
          {
            chance: 1,
            text: 'You decide it is a niche. You will see that company’s name on the front page of every paper a few years later.',
            effects: [],
          },
        ],
      },
    ],
  },
];
