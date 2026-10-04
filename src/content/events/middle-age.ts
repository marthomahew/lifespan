import type { EventDef } from '../../engine/events/types';
import { canAfford, hasJob, hasPartner, oddsBy } from './conditions';

export const MIDDLE_AGE_EVENTS: EventDef[] = [
  {
    id: 'mid_reading_glasses',
    kind: 'choice',
    category: 'health',
    ages: [50, 58],
    weight: 9,
    once: true,
    text: 'You are holding the restaurant menu at arm’s length and it is still not far enough. The waiter has started describing dishes to you out of pity.',
    choices: [
      {
        id: 'optician',
        label: 'See an optician',
        requires: canAfford(250),
        outcomes: [
          {
            chance: 1,
            text: 'The new glasses reveal that your kitchen has always been this dusty. Knowledge is a burden.',
            effects: [
              { money: -250 },
              { stat: 'smarts', delta: 2 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'pharmacy',
        label: 'Grab a pharmacy pair',
        outcomes: [
          {
            chance: 0.6,
            text: 'They work fine. You buy six more and lose all six within a month.',
            effects: [{ money: -40 }, { stat: 'happiness', delta: 2 }],
          },
          {
            chance: 0.4,
            text: 'Wrong strength. You spend a week with a mild headache and a squint that frightens children.',
            effects: [{ money: -20 }, { stat: 'health', delta: -2 }, { stat: 'looks', delta: -1 }],
          },
        ],
      },
      {
        id: 'deny',
        label: 'Insist the print got smaller',
        outcomes: [
          {
            chance: 1,
            text: 'You order something that turns out to be a soup made of eel. You eat it with quiet dignity.',
            effects: [
              { stat: 'happiness', delta: -3 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mid_back_twinge',
    kind: 'choice',
    category: 'health',
    ages: [50, 64],
    weight: 8,
    cooldownYears: 5,
    text: 'You bend down to pick up a sock and your lower back files a formal complaint. You are now living at a slight angle.',
    choices: [
      {
        id: 'physio',
        label: 'Book a physiotherapist',
        requires: canAfford(400),
        outcomes: [
          {
            chance: 1,
            text: 'Six sessions and a sheet of stretches later, you can stand upright and lecture others about core strength.',
            effects: [
              { money: -400 },
              { stat: 'health', delta: 5 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'rest',
        label: 'Lie on the floor for a week',
        outcomes: [
          {
            chance: 0.6,
            text: 'It eases up. The ceiling, you discover, has a crack shaped like a duck.',
            effects: [
              { stat: 'health', delta: 1 },
              { stat: 'happiness', delta: -1 },
            ],
          },
          {
            chance: 0.4,
            text: 'It does not ease up. You become an expert in which chairs are lying to you.',
            effects: [{ injury: 4 }, { stat: 'stress', delta: 3 }],
          },
        ],
      },
      {
        id: 'ignore',
        label: 'Carry on gardening anyway',
        outcomes: [
          {
            chance: oddsBy('health', 0.35),
            success: true,
            text: 'Your back grumbles but holds. The hedges have never looked so well disciplined.',
            effects: [{ stat: 'happiness', delta: 3 }],
          },
          {
            chance: 0.6,
            text: 'Something goes ping. You finish the hedge on your knees, out of spite.',
            effects: [{ injury: 7 }, { stat: 'happiness', delta: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'mid_checkup_numbers',
    kind: 'notice',
    category: 'health',
    ages: [52, 64],
    weight: 7,
    cooldownYears: 6,
    text: 'Your annual check-up comes with a printout of numbers you were not aware you had.',
    outcomes: [
      {
        chance: 0.5,
        text: 'All of them are fine. The doctor seems almost disappointed.',
        effects: [
          { stat: 'happiness', delta: 3 },
          { stat: 'stress', delta: -2 },
        ],
      },
      {
        chance: 0.35,
        text: 'Your cholesterol has opinions. You are handed a leaflet about oats.',
        effects: [
          { stat: 'health', delta: -2 },
          { stat: 'stress', delta: 2 },
        ],
      },
      {
        chance: 0.15,
        text: 'One result needs a second scan. It comes back clear, after a long fortnight of waiting.',
        effects: [
          { stat: 'stress', delta: 6 },
          { stat: 'happiness', delta: -2 },
        ],
      },
    ],
  },
  {
    id: 'mid_child_moves_back',
    kind: 'choice',
    category: 'family',
    ages: [50, 62],
    weight: 9,
    cooldownYears: 8,
    bind: { kid: { role: 'child', minAge: 20 } },
    text: '{kid.first} turns up with three bin bags and a houseplant and announces {kid.they} {kid.is} moving back in, “just for a few months.”',
    choices: [
      {
        id: 'welcome',
        label: 'Make up the old room',
        outcomes: [
          {
            chance: 0.6,
            text: 'It is surprisingly lovely. {kid.first} cooks twice a week and only borrows the car without asking once.',
            effects: [
              { rel: 'kid', delta: 8, memory: 'the summer you took them back in' },
              { stat: 'happiness', delta: 4 },
            ],
          },
          {
            chance: 0.4,
            text: 'A few months becomes two years. The houseplant thrives. Your patience does not.',
            effects: [
              { rel: 'kid', delta: 3, memory: 'living in their childhood bedroom at 30' },
              { stat: 'stress', delta: 5 },
              { money: -1500 },
            ],
          },
        ],
      },
      {
        id: 'rent',
        label: 'Agree, but charge rent',
        outcomes: [
          {
            chance: 1,
            text: '{kid.first} pays on time and calls you “landlord” in a tone you choose to find affectionate.',
            effects: [
              { rel: 'kid', delta: -2, memory: 'paying you rent for their old room' },
              { money: 1800 },
              { stat: 'karma', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'refuse',
        label: 'Gently say no',
        outcomes: [
          {
            chance: 1,
            text: '{kid.first} finds a flat-share with four strangers and a rota. You both pretend it was the plan all along.',
            effects: [
              { rel: 'kid', delta: -7, memory: 'the night you turned them away' },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mid_parent_driving',
    kind: 'choice',
    category: 'family',
    ages: [50, 64],
    weight: 8,
    once: true,
    bind: { parent: { role: 'mother', minAge: 75 } },
    text: '{parent.first} has reversed into the same lamppost twice this month and insists the lamppost is new.',
    choices: [
      {
        id: 'talk',
        label: 'Have the talk about the car keys',
        outcomes: [
          {
            chance: oddsBy('karma', 0.45),
            success: true,
            text: 'It is the hardest conversation you have had in years. {parent.first} hands over the keys and asks you to drive {parent.them} to the shops on Thursdays.',
            effects: [
              { rel: 'parent', delta: 4, memory: 'the day you took the car keys' },
              { stat: 'karma', delta: 3 },
              { stat: 'stress', delta: 3 },
            ],
          },
          {
            chance: 0.5,
            text: '{parent.first} tells you {parent.they} drove before you were born and will drive after you are dead. The call ends there.',
            effects: [
              { rel: 'parent', delta: -8, memory: 'you trying to take the car keys' },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'sibling',
        label: 'Get a sibling to do it',
        outcomes: [
          {
            chance: 1,
            text: 'Your sibling says it would sound better coming from you. Nobody says anything, and the lamppost takes a third hit.',
            effects: [
              { stat: 'karma', delta: -2 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'lessons',
        label: 'Pay for a refresher course',
        requires: canAfford(300),
        outcomes: [
          {
            chance: 1,
            text: 'The instructor sends you a report that just says “Brave.” {parent.first} passes, narrowly, and is very smug about it.',
            effects: [
              { money: -300 },
              { rel: 'parent', delta: 5, memory: 'the driving course you paid for' },
              { npcStat: 'parent', stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mid_sibling_inheritance',
    kind: 'choice',
    category: 'family',
    ages: [52, 64],
    weight: 6,
    cooldownYears: 10,
    bind: { sib: { role: 'sibling', minAge: 40, hasMemory: true } },
    text: 'Clearing out the family loft, you and {sib.first} both reach for the same carriage clock. {sib.They} immediately bring{sib.s} up {sib.memory}.',
    choices: [
      {
        id: 'give',
        label: 'Let {sib.first} have it',
        outcomes: [
          {
            chance: 1,
            text: 'The clock goes home with {sib.first}. It does not even work, which makes your generosity feel cheaper but your conscience lighter.',
            effects: [
              { rel: 'sib', delta: 6, memory: 'the carriage clock you gave up' },
              { stat: 'karma', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'fight',
        label: 'Argue your claim',
        outcomes: [
          {
            chance: 0.5,
            text: 'You win, mostly by remembering the exact Christmas it was promised to you. The clock sits on your mantel, smugly silent.',
            effects: [
              { rel: 'sib', delta: -6, memory: 'the carriage clock row' },
              { stat: 'happiness', delta: 2 },
            ],
          },
          {
            chance: 0.5,
            text: 'Old grievances surface in alphabetical order. You leave the loft with nothing but dust and a headache.',
            effects: [
              { rel: 'sib', delta: -10, memory: 'everything you said in the loft' },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'flip',
        label: 'Toss a coin for it',
        outcomes: [
          {
            chance: 1,
            text: 'Heads. Neither of you can remember who called heads. You both laugh for the first time in a while.',
            effects: [
              { rel: 'sib', delta: 4, memory: 'the coin toss in the loft' },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mid_young_manager',
    kind: 'choice',
    category: 'work',
    ages: [50, 64],
    weight: 8,
    cooldownYears: 6,
    when: hasJob,
    text: 'Your new manager is twenty-six, calls meetings “syncs,” and has asked whether you would be open to “reverse-mentoring” on spreadsheets.',
    choices: [
      {
        id: 'mentor',
        label: 'Teach them the old ways',
        outcomes: [
          {
            chance: 0.7,
            success: true,
            text: 'You show {boss.first} a keyboard shortcut and gain a lifelong admirer. Your performance review glows.',
            effects: [
              { performance: 8 },
              { rel: 'boss', delta: 6, memory: 'the shortcut lesson' },
              { stat: 'happiness', delta: 2 },
            ],
          },
          {
            chance: 0.3,
            text: 'It turns out the old ways were replaced for a reason. You quietly learn the new ones at night.',
            effects: [
              { stat: 'smarts', delta: 3 },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'grumble',
        label: 'Grumble in the kitchen',
        outcomes: [
          {
            chance: 1,
            text: 'You find a fellow sufferer by the kettle. Morale improves; productivity does not.',
            effects: [{ stat: 'happiness', delta: 3 }, { performance: -5 }],
          },
        ],
      },
      {
        id: 'adapt',
        label: 'Start saying “sync” unironically',
        outcomes: [
          {
            chance: 1,
            text: 'You blend in perfectly. Something small inside you has died, but your calendar is beautiful.',
            effects: [
              { performance: 4 },
              { stat: 'happiness', delta: -2 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mid_pension_letter',
    kind: 'choice',
    category: 'money',
    ages: [53, 64],
    weight: 9,
    once: true,
    text: 'A pension statement arrives with a chart. The line goes up, but much less than you hoped, and it ends with the words “estimated monthly income.”',
    choices: [
      {
        id: 'adviser',
        label: 'Pay a financial adviser',
        requires: canAfford(800),
        outcomes: [
          {
            chance: 1,
            text: 'Her name is Odile Brask and she uses the word “runway” forty times. You leave with a plan and a calmer pulse.',
            effects: [{ money: -800 }, { stat: 'stress', delta: -5 }, { stat: 'smarts', delta: 2 }],
            next: { eventId: 'mid_pension_followup', inYears: [3, 5], payload: { amount: 6000 } },
          },
        ],
      },
      {
        id: 'cut_back',
        label: 'Cancel every subscription',
        outcomes: [
          {
            chance: 1,
            text: 'You cancel nine services, three of which you had never heard of. Your savings rate improves noticeably.',
            effects: [
              { money: 600 },
              { stat: 'discipline', delta: 4 },
              { stat: 'happiness', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'drawer',
        label: 'Put it in the drawer',
        outcomes: [
          {
            chance: 1,
            text: 'The drawer accepts it alongside the other unopened futures. You sleep fine, mostly.',
            effects: [
              { stat: 'stress', delta: 3 },
              { stat: 'discipline', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mid_pension_followup',
    kind: 'notice',
    category: 'money',
    chainOnly: true,
    weight: 1,
    text: 'Odile Brask sends a cheerful email with the subject line “Runway update!”',
    outcomes: [
      {
        chance: 0.7,
        text: 'The plan has worked. Your investments are up by {money:$amount}, and you briefly consider learning to sail.',
        effects: [
          { money: { payload: 'amount' } },
          { stat: 'happiness', delta: 5 },
          { stat: 'stress', delta: -3 },
        ],
      },
      {
        chance: 0.3,
        text: 'The markets wobbled, but the plan held. You are up a modest sum and Odile calls it “resilient.”',
        effects: [{ money: { payload: 'amount', mult: 0.3 } }, { stat: 'stress', delta: -1 }],
      },
    ],
  },
  {
    id: 'mid_reunion',
    kind: 'choice',
    category: 'social',
    ages: [50, 60],
    weight: 7,
    cooldownYears: 10,
    text: 'An invitation arrives for your school’s reunion. Someone has made a website with a countdown clock and a photo of you in a terrible jumper.',
    choices: [
      {
        id: 'go',
        label: 'Go, wearing your best jacket',
        outcomes: [
          {
            chance: 0.6,
            text: 'You reconnect with a former lab partner, Thessaly Moor, who remembers you fondly and inaccurately.',
            effects: [{ status: 'friend' }, { stat: 'happiness', delta: 6 }],
          },
          {
            chance: 0.4,
            text: 'Everyone talks about their knees. You leave at nine and eat chips in the car, oddly content.',
            effects: [
              { stat: 'happiness', delta: 1 },
              { stat: 'health', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'skip',
        label: 'Skip it and check the photos later',
        outcomes: [
          {
            chance: 1,
            text: 'The photos confirm everyone has aged except, somehow, the head boy. You find this deeply suspicious.',
            effects: [
              { stat: 'happiness', delta: -1 },
              { stat: 'stress', delta: -1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mid_mystery_box',
    kind: 'notice',
    category: 'random',
    ages: [50, 64],
    weight: 6,
    cooldownYears: 8,
    text: 'A parcel addressed to you arrives from a company you have never heard of, Halloway & Tine.',
    outcomes: [
      {
        chance: 0.5,
        text: 'Inside is a single, very expensive garden gnome. Nobody claims responsibility. You name him Gerald.',
        effects: [{ stat: 'happiness', delta: 3 }],
      },
      {
        chance: 0.3,
        text: 'It is a set of kitchen knives you apparently ordered at two in the morning. You keep them; they are excellent.',
        effects: [{ money: -150 }, { skill: 'cooking', delta: 2 }],
      },
      {
        chance: 0.2,
        text: 'It is meant for your neighbour, who thanks you with a jar of chutney potent enough to strip paint.',
        effects: [
          { stat: 'karma', delta: 2 },
          { stat: 'happiness', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'mid_milestone_trip',
    kind: 'choice',
    category: 'travel',
    ages: [50, 64],
    weight: 7,
    cooldownYears: 7,
    adultsOnly: true,
    when: hasPartner,
    bind: { love: { role: 'partner', minAge: 18 } },
    text: '{love.first} slides a brochure across the breakfast table. It shows a clifftop hotel in Portugal and the words “you only turn this age once.”',
    choices: [
      {
        id: 'book',
        label: 'Book the clifftop hotel',
        requires: canAfford(4000),
        outcomes: [
          {
            chance: 1,
            text: 'Long dinners, a sunburn you will deny, and a late night on the balcony that is nobody else’s business. You come home years younger.',
            effects: [
              { money: -4000 },
              { rel: 'love', delta: 10, memory: 'the clifftop trip in Portugal' },
              { stat: 'happiness', delta: 8 },
              { stat: 'stress', delta: -6 },
            ],
          },
        ],
      },
      {
        id: 'staycation',
        label: 'Suggest a weekend nearby',
        outcomes: [
          {
            chance: 0.6,
            text: 'You find a guesthouse two hours away with a lake and a deeply judgemental swan. It is perfect.',
            effects: [
              { money: -500 },
              { rel: 'love', delta: 5, memory: 'the weekend with the swan' },
              { stat: 'happiness', delta: 4 },
            ],
          },
          {
            chance: 0.4,
            text: 'It rains the entire weekend. You play cards and {love.first} wins every hand, which {love.they} will mention for years.',
            effects: [
              { money: -400 },
              { rel: 'love', delta: 2, memory: 'beating you at cards all weekend' },
              { stat: 'happiness', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Say money is too tight',
        outcomes: [
          {
            chance: 1,
            text: '{love.first} puts the brochure back in the drawer without a word. It stays there, conspicuously.',
            effects: [
              { rel: 'love', delta: -5, memory: 'the trip you said no to' },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
];
