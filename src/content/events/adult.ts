import type { EventDef } from '../../engine/events/types';
import { canAfford, hasJob, oddsBy } from './conditions';

export const ADULT_EVENTS: EventDef[] = [
  {
    id: 'adult_mother_fall',
    kind: 'choice',
    category: 'family',
    ages: [32, 49],
    weight: 8,
    cooldownYears: 10,
    bind: { mother: { role: 'mother', minAge: 55 } },
    text: '{mother.first} slipped on the back step and spent a night in hospital. {mother.They} insist{mother.s} it was nothing, while holding a walking stick {mother.they} clearly hate{mother.s}.',
    choices: [
      {
        id: 'aide',
        label: 'Pay for a home aide',
        requires: canAfford(4000),
        outcomes: [
          {
            chance: 1,
            text: 'The aide is brisk, kind, and wins every argument with {mother.first}. Your phone stops ringing at 2 a.m.',
            effects: [
              { money: -4000 },
              { rel: 'mother', delta: 6, memory: 'the aide you hired after the fall' },
              { npcStat: 'mother', stat: 'health', delta: 5 },
              { stat: 'stress', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'visit',
        label: 'Stay with her for a week',
        outcomes: [
          {
            chance: 0.7,
            text: 'You fix the step, label every pill bottle, and hear the same three stories about your birth. It is oddly lovely.',
            effects: [
              { rel: 'mother', delta: 9, memory: 'the week you moved in to help' },
              { stat: 'happiness', delta: 4 },
              { stat: 'stress', delta: 3 },
            ],
          },
          {
            chance: 0.3,
            text: 'By day four you are both reorganising the kitchen out of spite. You leave with the step fixed and the peace less so.',
            effects: [
              { rel: 'mother', delta: -3, memory: 'the great kitchen standoff' },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'call',
        label: 'Send flowers and call daily',
        outcomes: [
          {
            chance: 1,
            text: 'The flowers arrive. The calls get shorter. {mother.first} says {mother.they} {mother.is} fine in a voice that suggests otherwise.',
            effects: [
              { rel: 'mother', delta: -2, memory: 'the flowers instead of a visit' },
              { stat: 'karma', delta: -1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'adult_sibling_food_truck',
    kind: 'choice',
    category: 'money',
    ages: [30, 45],
    weight: 7,
    once: true,
    bind: { sib: { role: 'sibling', minAge: 21 } },
    text: '{sib.first} wants to open a food truck that only sells soup in bread bowls. {sib.They} need{sib.s} {money:5000} and {sib.has} already bought the bread.',
    choices: [
      {
        id: 'lend',
        label: 'Lend the money',
        requires: canAfford(5000),
        outcomes: [
          {
            chance: 1,
            text: '{sib.first} hugs you so hard your glasses go crooked and promises a payment plan by spring.',
            effects: [
              { money: -5000 },
              { rel: 'sib', delta: 10, memory: 'the soup truck loan' },
              { stat: 'karma', delta: 2 },
            ],
            next: {
              eventId: 'adult_sibling_food_truck_verdict',
              inYears: [1, 3],
              payload: { amount: 5000 },
            },
          },
        ],
      },
      {
        id: 'advice',
        label: 'Offer a spreadsheet instead',
        outcomes: [
          {
            chance: 1,
            text: 'You build a twelve-tab cost model. {sib.first} reads one tab and calls you a joy vampire.',
            effects: [
              { rel: 'sib', delta: -4, memory: 'the soup spreadsheet' },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'refuse',
        label: 'Say no, kindly',
        outcomes: [
          {
            chance: 1,
            text: '{sib.first} takes it well at dinner and badly in the family group chat.',
            effects: [{ rel: 'sib', delta: -6, memory: 'the time you said no to the soup truck' }],
          },
        ],
      },
    ],
  },
  {
    id: 'adult_sibling_food_truck_verdict',
    kind: 'choice',
    category: 'money',
    ages: [31, 49],
    weight: 10,
    chainOnly: true,
    bind: { sib: { role: 'sibling' } },
    text: 'The soup truck has had a year. {sib.first} turns up on your doorstep with a bread bowl, a nervous smile, and an envelope that may or may not contain your {money:$amount}.',
    choices: [
      {
        id: 'open',
        label: 'Open the envelope',
        outcomes: [
          {
            chance: 0.5,
            text: 'The full amount, plus interest, plus a lifetime soup pass. The truck is a hit with the office-lunch crowd.',
            effects: [
              { money: { payload: 'amount', mult: 1.2 } },
              { rel: 'sib', delta: 8, memory: 'paying back the soup loan with interest' },
              { stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'Inside is a handwritten apology and a coupon for one free soup. The truck now belongs to a man named Dov.',
            effects: [
              { rel: 'sib', delta: -3, memory: 'the coupon instead of the money' },
              { stat: 'happiness', delta: -5 },
            ],
          },
        ],
      },
      {
        id: 'forgive',
        label: 'Tell them to keep it',
        outcomes: [
          {
            chance: 1,
            text: 'You hand the envelope back unopened. {sib.first} cries into the bread bowl, which holds up surprisingly well.',
            effects: [
              { rel: 'sib', delta: 14, memory: 'the loan you forgave on the doorstep' },
              { stat: 'karma', delta: 5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'adult_child_science_fair',
    kind: 'choice',
    category: 'family',
    ages: [30, 49],
    weight: 9,
    cooldownYears: 5,
    bind: { kid: { role: 'child', minAge: 7, maxAge: 13 } },
    text: "The science fair is tomorrow. {kid.first} has just remembered, and {kid.their} project is 'something with a potato'.",
    choices: [
      {
        id: 'allnighter',
        label: 'Build a potato battery together',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.6),
            text: 'At 1 a.m. the potato lights a tiny bulb and you both scream. {kid.first} takes third place and a lot of credit.',
            effects: [
              { rel: 'kid', delta: 9, memory: 'the midnight potato battery' },
              { npcStat: 'kid', stat: 'smarts', delta: 3 },
              { stat: 'happiness', delta: 5 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The potato produces no electricity and one alarming smell. Effort is noted on the judging sheet.',
            effects: [
              { rel: 'kid', delta: 4, memory: 'the potato that refused to glow' },
              { stat: 'health', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'lesson',
        label: 'Let them face the music',
        outcomes: [
          {
            chance: 1,
            text: "{kid.first} presents a potato on a plate titled 'Potato'. The judges are speechless. So is {kid.first}, at you, for a week.",
            effects: [
              { rel: 'kid', delta: -5, memory: 'the night you would not help with the project' },
              { npcStat: 'kid', stat: 'happiness', delta: -3 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'adult_work_reply_all',
    kind: 'choice',
    category: 'work',
    ages: [30, 49],
    weight: 8,
    cooldownYears: 6,
    when: hasJob,
    bind: { cw: { role: 'coworker' } },
    text: "{cw.first} has replied-all to the entire company with a message clearly meant for you: 'can you BELIEVE this meeting'. The meeting was led by the CEO.",
    choices: [
      {
        id: 'cover',
        label: 'Reply-all claiming it was a test',
        outcomes: [
          {
            chance: 0.5,
            text: 'IT backs you up out of sheer confusion. {cw.first} owes you, and says so in a strictly private message.',
            effects: [{ rel: 'cw', delta: 12, memory: 'the reply-all rescue' }, { performance: 2 }],
            success: true,
          },
          {
            chance: 0.5,
            text: 'Now there are two of you in the CEO’s calendar under the heading "Chat".',
            effects: [
              { rel: 'cw', delta: 6, memory: 'going down together over the email' },
              { performance: -6 },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'silent',
        label: 'Say nothing and look busy',
        outcomes: [
          {
            chance: 1,
            text: 'You type furiously at nothing for forty minutes. {cw.first} gets a talking-to and a new nickname.',
            effects: [{ rel: 'cw', delta: -3, memory: 'how quiet you went after the email' }],
          },
        ],
      },
      {
        id: 'distance',
        label: "Reply-all: 'Not me!'",
        outcomes: [
          {
            chance: 1,
            text: 'Your one-line alibi becomes the second most-forwarded email of the year. {cw.first} does not wave at you anymore.',
            effects: [
              { rel: 'cw', delta: -10, memory: "your 'Not me!' email" },
              { stat: 'karma', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'adult_boss_weekend',
    kind: 'choice',
    category: 'work',
    ages: [30, 49],
    weight: 8,
    cooldownYears: 4,
    when: hasJob,
    bind: { boss: { role: 'boss' } },
    text: "{boss.first} leans on your desk on Friday at 4:55. 'Quick one. Could you come in Saturday? Sunday too, ideally. It is a tiny emergency.'",
    choices: [
      {
        id: 'yes',
        label: 'Cancel your plans and come in',
        outcomes: [
          {
            chance: 1,
            text: 'The tiny emergency is a spreadsheet nobody has opened since 2019. {boss.first} brings doughnuts on Monday and remembers your name in the next review.',
            effects: [
              { performance: 6 },
              { rel: 'boss', delta: 6, memory: 'the weekend you saved the spreadsheet' },
              { stat: 'stress', delta: 6 },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'saturday',
        label: 'Offer Saturday morning only',
        outcomes: [
          {
            chance: 1,
            text: 'Three hours, one coffee, problem contained. {boss.first} calls it a reasonable compromise in a tone that is almost reasonable.',
            effects: [
              { performance: 2 },
              { rel: 'boss', delta: 1, memory: 'the half-Saturday you gave' },
            ],
          },
        ],
      },
      {
        id: 'no',
        label: 'Say you have a family thing',
        outcomes: [
          {
            chance: 0.7,
            text: 'You spend the weekend outside like a person. {boss.first} finds someone else and only mentions it twice.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'stress', delta: -4 },
              { performance: -2 },
            ],
          },
          {
            chance: 0.3,
            text: '{boss.first} sees your hiking photos on Sunday. The Monday meeting is short and very cold.',
            effects: [
              { rel: 'boss', delta: -8, memory: 'the hiking photos from the family thing' },
              { performance: -5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'adult_father_new_hobby',
    kind: 'notice',
    category: 'family',
    ages: [30, 49],
    weight: 6,
    once: true,
    bind: { dad: { role: 'father', minAge: 55 } },
    text: '{dad.first} has retired into competitive birdwatching.',
    outcomes: [
      {
        chance: 0.6,
        text: '{dad.They} now phone{dad.s} you to report sightings by Latin name and {dad.has} bought a jacket with nineteen pockets. {dad.They} sound{dad.s} happier than you have heard in years.',
        effects: [
          { npcStat: 'dad', stat: 'happiness', delta: 8 },
          { rel: 'dad', delta: 3, memory: 'the bird reports' },
        ],
      },
      {
        chance: 0.4,
        text: 'A rivalry with a neighbour over a disputed heron has escalated to letters. You are asked to serve as a witness.',
        effects: [
          { npcStat: 'dad', stat: 'health', delta: 2 },
          { stat: 'stress', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'adult_back_sock',
    kind: 'choice',
    category: 'health',
    ages: [33, 49],
    weight: 7,
    cooldownYears: 8,
    text: 'You bend down to pick up a sock and your lower back makes a decision without consulting you. You are now shaped like a question mark.',
    choices: [
      {
        id: 'physio',
        label: 'Book a physiotherapist',
        requires: canAfford(600),
        outcomes: [
          {
            chance: 1,
            text: 'Six sessions of being folded by a cheerful stranger. You leave with a printed sheet of stretches and a straight spine.',
            effects: [
              { money: -600 },
              { stat: 'health', delta: 5 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'ignore',
        label: 'Walk it off',
        outcomes: [
          {
            chance: 0.5,
            text: 'It eases after a week of groaning every time you sit. You blame the sock.',
            effects: [{ stat: 'health', delta: -2 }],
          },
          {
            chance: 0.5,
            text: 'Walking it off turns out to be the opposite of what backs want. Two weeks flat on the living-room floor.',
            effects: [{ injury: 6 }, { stat: 'happiness', delta: -5 }],
          },
        ],
      },
      {
        id: 'yoga',
        label: 'Take up yoga, finally',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.55),
            text: 'You stick with it. By spring you can touch your toes and are slightly insufferable about it.',
            effects: [
              { stat: 'health', delta: 7 },
              { stat: 'stress', delta: -5 },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'You buy the mat, attend one class, and use the mat to block a draught under the door.',
            effects: [{ money: -60 }, { stat: 'health', delta: 1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'adult_friend_old_story',
    kind: 'choice',
    category: 'social',
    ages: [30, 49],
    weight: 8,
    cooldownYears: 6,
    bind: { pal: { role: 'friend', minRelationship: 25, hasMemory: true } },
    text: 'At a barbecue, {pal.first} raises a glass and tells a crowd of strangers about {pal.memory}. In {pal.their} version, you come off considerably worse.',
    choices: [
      {
        id: 'laugh',
        label: 'Laugh and add details',
        outcomes: [
          {
            chance: 1,
            text: 'Your additions make it even worse and much funnier. Three strangers ask for your number to hear more.',
            effects: [
              { rel: 'pal', delta: 6, memory: 'the barbecue retelling' },
              { stat: 'happiness', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'correct',
        label: 'Set the record straight',
        outcomes: [
          {
            chance: 0.5,
            text: 'You present your side calmly. The crowd sides with you. {pal.first} sulks into the coleslaw.',
            effects: [
              { rel: 'pal', delta: -4, memory: 'being fact-checked at the barbecue' },
              { stat: 'karma', delta: 1 },
            ],
          },
          {
            chance: 0.5,
            text: 'Your correction somehow confirms the worst part. Everyone nods slowly.',
            effects: [
              { stat: 'looks', delta: -1 },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'revenge',
        label: 'Tell one about them',
        outcomes: [
          {
            chance: 1,
            text: 'You counter with the night {pal.first} got stuck in a revolving door. It becomes a war of anecdotes. Nobody eats.',
            effects: [
              { rel: 'pal', delta: 2, memory: 'the revolving door story you told' },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'adult_world_blackout',
    kind: 'notice',
    category: 'world',
    ages: [30, 49],
    weight: 5,
    cooldownYears: 12,
    text: 'A storm knocks out power across {city} for three days.',
    outcomes: [
      {
        chance: 0.6,
        text: 'You meet more neighbours by candlelight than in the previous decade, and someone teaches you a card game with no clear rules.',
        effects: [{ stat: 'happiness', delta: 4 }, { status: 'friend' }],
      },
      {
        chance: 0.4,
        text: 'Everything in the freezer becomes a single beige problem. You eat crackers and contemplate the fragility of modern life.',
        effects: [{ money: -200 }, { stat: 'stress', delta: 4 }],
      },
    ],
  },
  {
    id: 'adult_found_wallet',
    kind: 'choice',
    category: 'random',
    ages: [30, 49],
    weight: 6,
    cooldownYears: 10,
    text: 'You find a wallet on the bus containing a large stack of cash, a library card, and a laminated photo of a ferret in a tiny hat.',
    choices: [
      {
        id: 'return',
        label: 'Track down the owner',
        outcomes: [
          {
            chance: 1,
            text: 'The owner, a retired accountant, weeps with relief and gives you a reward and a second ferret photo. You did not ask for either.',
            effects: [{ money: 150 }, { stat: 'karma', delta: 6 }, { stat: 'happiness', delta: 3 }],
          },
        ],
      },
      {
        id: 'keep',
        label: 'Keep the cash',
        outcomes: [
          {
            chance: 1,
            text: 'You pocket the money and post the wallet to the address inside. The ferret stares at you from your memory for weeks.',
            effects: [{ money: 400 }, { stat: 'karma', delta: -7 }, { stat: 'stress', delta: 2 }],
          },
        ],
      },
      {
        id: 'driver',
        label: 'Hand it to the driver',
        outcomes: [
          {
            chance: 1,
            text: 'The driver takes it with the weary nod of someone who has been handed a thousand wallets. You feel only mildly heroic.',
            effects: [{ stat: 'karma', delta: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'adult_solo_trip',
    kind: 'choice',
    category: 'travel',
    ages: [30, 49],
    weight: 6,
    cooldownYears: 7,
    text: 'You have not taken a real holiday in years, and a fare sale has just appeared like a sign from a minor travel god.',
    choices: [
      {
        id: 'lisbon',
        label: 'Two weeks in Lisbon',
        requires: canAfford(3000),
        outcomes: [
          {
            chance: 0.8,
            text: 'Hills, tiles, custard tarts, and one long dinner with strangers who feel like old friends by dessert. You come home a slightly different shape.',
            effects: [
              { money: -3000 },
              { stat: 'happiness', delta: 10 },
              { stat: 'stress', delta: -8 },
            ],
            success: true,
          },
          {
            chance: 0.2,
            text: 'Your luggage takes its own holiday somewhere in Frankfurt. You spend the trip in one shirt and surprising peace.',
            effects: [{ money: -3200 }, { stat: 'happiness', delta: 4 }],
          },
        ],
      },
      {
        id: 'cabin',
        label: 'A cheap cabin with no signal',
        requires: canAfford(500),
        outcomes: [
          {
            chance: 1,
            text: 'Five days, one lake, zero notifications. You read three books and have a long conversation with a duck.',
            effects: [{ money: -500 }, { stat: 'stress', delta: -6 }, { stat: 'smarts', delta: 2 }],
          },
        ],
      },
      {
        id: 'skip',
        label: 'Maybe next year',
        outcomes: [
          {
            chance: 1,
            text: 'You close the tab. Next year looks a lot like this year, only with more emails.',
            effects: [
              { stat: 'stress', delta: 3 },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'adult_anniversary_forgotten',
    kind: 'choice',
    category: 'romance',
    adultsOnly: true,
    ages: [30, 49],
    weight: 7,
    cooldownYears: 5,
    bind: { sp: { role: 'spouse', minAge: 18 } },
    text: "It is 6 p.m. and {sp.first} has just said 'happy anniversary' with a meaningful look. You had absolutely no idea.",
    choices: [
      {
        id: 'honest',
        label: 'Confess you forgot',
        outcomes: [
          {
            chance: 0.6,
            text: '{sp.first} is hurt, then laughs, then makes you cook. Over burnt pasta you talk properly for the first time in months. The door closes on the rest of the evening.',
            effects: [
              { rel: 'sp', delta: 4, memory: 'the anniversary you owned up to forgetting' },
              { stat: 'karma', delta: 2 },
            ],
          },
          {
            chance: 0.4,
            text: '{sp.first} goes to bed early with a book and a very loud page-turning technique.',
            effects: [
              { rel: 'sp', delta: -6, memory: 'the forgotten anniversary' },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'bluff',
        label: "Pretend you planned a 'surprise'",
        outcomes: [
          {
            chance: oddsBy('smarts', 0.45),
            text: 'You improvise a candlelit picnic on the living-room floor in eleven minutes. {sp.first} is genuinely charmed. The candles burn down; the story fades to black.',
            effects: [
              { rel: 'sp', delta: 8, memory: 'the living-room picnic' },
              { stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
          {
            chance: 0.55,
            text: "The 'surprise' turns out to be a petrol-station bouquet with the price still on. {sp.first} sees right through you.",
            effects: [
              { rel: 'sp', delta: -8, memory: 'the petrol-station bouquet' },
              { stat: 'karma', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'dinner',
        label: 'Book the fanciest table in town',
        requires: canAfford(400),
        outcomes: [
          {
            chance: 1,
            text: 'Money cannot buy memory, but it can buy a last-minute table and very good wine. The evening ends somewhere you will both keep to yourselves.',
            effects: [
              { money: -400 },
              { rel: 'sp', delta: 5, memory: 'the rescue dinner on your anniversary' },
              { stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
    ],
  },
];
