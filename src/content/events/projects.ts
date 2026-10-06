import type { EventDef } from '../../engine/events/types';

/** The novel's life, fired by the project system (never at random). */
export const PROJECT_EVENTS: EventDef[] = [
  {
    id: 'proj_novel_finished',
    kind: 'choice',
    category: 'fame',
    ages: [10, 120],
    weight: 1,
    chainOnly: true,
    text: 'You type the last line of {novel} and sit very still. A whole book. Now what?',
    choices: [
      {
        id: 'send',
        label: 'Send it to literary agents',
        outcomes: [
          {
            chance: 1,
            text: 'Forty query letters, each one rewritten until it stops sounding desperate. You press send and then go for a long walk.',
            texts: [
              'You print the first chapter, read it aloud to an empty room, and send it to every agent who has ever said yes to anything like it.',
              'This time you know the drill: a short letter, a clean synopsis, and no exclamation marks. Send, and then do something else entirely for a month.',
              'You send it out with a note that mentions your last book, casually, as if you had not rewritten the sentence nine times.',
            ],
            effects: [{ novel: 'submit' }, { stat: 'stress', delta: 4 }],
          },
        ],
      },
      {
        id: 'revise',
        label: 'Spend another year making it better',
        outcomes: [
          {
            chance: 1,
            text: 'You print it out and attack it with a red pen. Whole chapters go. What is left is leaner, and braver.',
            effects: [{ novel: 'revise' }, { skill: 'writing', delta: 4 }],
          },
        ],
      },
      {
        id: 'drawer',
        label: 'Put it in a drawer',
        outcomes: [
          {
            chance: 1,
            text: 'It was never really for anyone else. You tie the pages with string, put them away, and feel oddly light.',
            effects: [{ novel: 'shelve' }, { stat: 'happiness', delta: 3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'proj_novel_rejection',
    kind: 'choice',
    category: 'fame',
    ages: [10, 120],
    weight: 1,
    chainOnly: true,
    text: 'Another year of polite emails about {novel}: "not quite right for our list", "a very crowded market", and one that just says "No." in the subject line. That makes {$rejections} rounds of no.',
    choices: [
      {
        id: 'again',
        label: 'Keep sending it out',
        // Eight rounds is everyone worth asking: after that, rewrite it, publish it, or let it rest.
        requires: (st) => (st.projects?.novel?.rejections ?? 0) < 7,
        outcomes: [
          {
            chance: 1,
            text: 'You make a spreadsheet of rejections and decide, defiantly, that it is a list of people who will regret this.',
            texts: [
              'You pin the rejections to a corkboard. It is a very full corkboard. You buy a second one.',
              'Somewhere out there is the right agent. You send it to twenty more and stop reading the replies before breakfast.',
            ],
            effects: [
              { novel: 'keep_trying' },
              { stat: 'happiness', delta: -3 },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'revise',
        label: 'Take the notes and rewrite',
        outcomes: [
          {
            chance: 1,
            text: 'One agent left a real note in the margin of her no. You take it seriously, and the book gets better because of it.',
            effects: [{ novel: 'revise' }, { skill: 'writing', delta: 3 }],
          },
        ],
      },
      {
        id: 'self',
        label: 'Publish it yourself',
        outcomes: [
          {
            chance: 1,
            text: 'You design the cover, upload the files and order a box of copies. Holding one is better than any email.',
            effects: [{ novel: 'selfpub' }, { stat: 'happiness', delta: 5 }],
          },
        ],
      },
      {
        id: 'drawer',
        label: 'Put it in a drawer and start something new',
        outcomes: [
          {
            chance: 1,
            text: 'You print it out, tie it with string and put it in the bottom drawer. It hurts for a week. Then a new idea arrives on the bus, and you are glad of the empty desk.',
            effects: [
              { novel: 'shelve' },
              { stat: 'happiness', delta: -2 },
              { skill: 'writing', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'proj_novel_offer',
    kind: 'choice',
    category: 'fame',
    ages: [10, 120],
    weight: 1,
    chainOnly: true,
    text: 'An agent rings about {novel}. She loves it. A publisher wants it. There is an offer on the table, and she thinks another house might go higher.',
    choices: [
      {
        id: 'accept',
        label: 'Take the offer',
        outcomes: [
          {
            chance: 1,
            text: 'You say yes before she finishes the sentence. Then you sit on the kitchen floor and laugh until you cry.',
            effects: [{ novel: 'accept' }, { stat: 'happiness', delta: 12 }],
          },
        ],
      },
      {
        id: 'hold',
        label: 'Hold out for more',
        outcomes: [
          {
            chance: 1,
            text: 'Your agent tells them you need time to think. It is the longest week of your life.',
            effects: [{ novel: 'holdout' }, { stat: 'stress', delta: 6 }],
          },
        ],
      },
    ],
  },
  {
    id: 'proj_novel_reviews_good',
    kind: 'notice',
    category: 'fame',
    ages: [10, 120],
    weight: 1,
    chainOnly: true,
    text: 'The reviews for {novel} are in.',
    outcomes: [
      {
        chance: 0.6,
        text: 'A national paper calls it "quietly devastating". A bookshop in your town gives it its own table. Strangers send you letters about their mothers.',
        effects: [{ fame: 6 }, { stat: 'happiness', delta: 10 }, { money: 3000, kind: 'wage' }],
      },
      {
        chance: 0.4,
        text: 'It is shortlisted for a prize you had to look up. You do not win, and you do not care: you were on the list.',
        effects: [{ fame: 8 }, { stat: 'happiness', delta: 8 }, { achievement: 'shortlisted' }],
      },
    ],
  },
  {
    id: 'proj_novel_reviews_mixed',
    kind: 'notice',
    category: 'fame',
    ages: [10, 120],
    weight: 1,
    chainOnly: true,
    text: 'A year after {novel} came out, you finally read what people made of it.',
    outcomes: [
      {
        chance: 0.6,
        text: 'One critic calls it "earnest". You look it up to make sure. A few hundred readers love it fiercely, which turns out to be enough.',
        effects: [
          { stat: 'happiness', delta: 2 },
          { money: 600, kind: 'wage' },
        ],
      },
      {
        chance: 0.4,
        text: 'It sinks without a ripple. You find a copy in a charity shop a year later and buy it back, for luck.',
        effects: [{ stat: 'happiness', delta: -4 }],
      },
    ],
  },
];
