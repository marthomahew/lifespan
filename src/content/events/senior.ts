import type { EventDef } from '../../engine/events/types';
import { canAfford, isMarried, oddsBy } from './conditions';

export const SENIOR_EVENTS: EventDef[] = [
  {
    id: 'senior_grandchild_tablet',
    kind: 'choice',
    category: 'world',
    ages: [65, 95],
    weight: 9,
    cooldownYears: 6,
    bind: { kid: { role: 'grandchild', minAge: 8 } },
    text: '{kid.first} sets up a video-calling tablet for you and leaves a sticky note that just says "PRESS THE GREEN ONE." There are four green ones.',
    choices: [
      {
        id: 'learn',
        label: 'Make them teach you properly',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.6),
            text: 'Two patient afternoons later you can call, mute and, alarmingly, send stickers of a dancing walrus.',
            effects: [
              { stat: 'smarts', delta: 3 },
              { rel: 'kid', delta: 6, memory: 'the tablet lessons' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You end every call by staring into the camera until it gives up. {kid.first} calls this your "goodbye face."',
            effects: [
              { stat: 'happiness', delta: 2 },
              { rel: 'kid', delta: 3, memory: 'your goodbye face' },
            ],
          },
        ],
      },
      {
        id: 'drawer',
        label: 'Put it in the drawer with the other gadgets',
        outcomes: [
          {
            chance: 1,
            text: 'It joins a pager, two remote controls and a heart-rate watch still in its box. You phone people the old way.',
            effects: [
              { stat: 'stress', delta: -2 },
              { rel: 'kid', delta: -2, memory: 'the tablet in the drawer' },
            ],
          },
        ],
      },
      {
        id: 'repurpose',
        label: 'Use it as a very expensive recipe stand',
        outcomes: [
          {
            chance: 1,
            text: 'It props up your soup book beautifully. Occasionally it lights up and shows you a face, which is a bonus.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { skill: 'cooking', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'senior_balance_class',
    kind: 'choice',
    category: 'health',
    ages: [65, 100],
    weight: 9,
    cooldownYears: 5,
    text: 'After you wobble on a kerb, your doctor hands you a leaflet for a balance class at the community hall. The cover shows a man smiling on one leg like it is nothing.',
    choices: [
      {
        id: 'go',
        label: 'Go to the class',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.65),
            text: 'By week six you can stand on one leg while holding a teacup. Your knees file no complaints.',
            effects: [
              { stat: 'health', delta: 6 },
              { stat: 'discipline', delta: 2 },
            ],
            success: true,
          },
          {
            chance: 0.35,
            text: 'You mostly go for the biscuits afterwards, but even biscuit-adjacent exercise counts for something.',
            effects: [
              { stat: 'health', delta: 2 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'walk',
        label: 'Walk the long way to the shops instead',
        outcomes: [
          {
            chance: 0.7,
            text: 'The long way passes a bakery, which is either the point or the problem. Your legs get stronger anyway.',
            effects: [{ stat: 'health', delta: 3 }],
          },
          {
            chance: 0.3,
            text: 'Another kerb ambushes you. Nothing broken, just a bruise the colour of an aubergine.',
            effects: [{ injury: 4 }, { stat: 'happiness', delta: -2 }],
          },
        ],
      },
      {
        id: 'ignore',
        label: 'Tell the doctor you have been wobbling for years',
        outcomes: [
          {
            chance: 1,
            text: 'The doctor writes something down and does not show you. You suspect it says "stubborn."',
            effects: [
              { stat: 'health', delta: -3 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'senior_urgent_caller',
    kind: 'choice',
    category: 'money',
    ages: [65, 100],
    weight: 8,
    cooldownYears: 6,
    text: 'A very polite stranger phones to say your bank account has been "compromised" and needs you to move everything somewhere safer. Today. Within the hour.',
    choices: [
      {
        id: 'hang_up',
        label: 'Hang up and call the bank yourself',
        outcomes: [
          {
            chance: 1,
            text: 'The bank has never heard of the problem, or of the stranger. You feel sharp as a tack all afternoon.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { stat: 'happiness', delta: 3 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'waste_time',
        label: 'Keep them talking for as long as possible',
        outcomes: [
          {
            chance: 1,
            text: 'You describe your cat in forensic detail for forty minutes. They hang up on you. A victory.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'karma', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'comply',
        label: 'Do what they say',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.4),
            text: 'Halfway through, something in their voice sounds wrong. You stop just in time and change every password you own.',
            effects: [{ stat: 'stress', delta: 5 }],
          },
          {
            chance: 0.6,
            text: 'The money leaves and does not come back. The bank is sympathetic in a way that pays for nothing.',
            effects: [
              { money: -6000 },
              { stat: 'happiness', delta: -8 },
              { stat: 'stress', delta: 8 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'senior_old_friend_lunch',
    kind: 'choice',
    category: 'social',
    ages: [65, 95],
    weight: 9,
    cooldownYears: 5,
    bind: { pal: { role: 'friend', minRelationship: 30, hasMemory: true } },
    text: '{pal.first} rings out of nowhere to suggest lunch, then spends the first five minutes laughing about {pal.memory}.',
    choices: [
      {
        id: 'lunch',
        label: 'Go to lunch',
        outcomes: [
          {
            chance: 0.75,
            text: 'Three hours, two desserts, and a fierce debate about which of you was more trouble. You both win.',
            effects: [
              { stat: 'happiness', delta: 7 },
              { rel: 'pal', delta: 8, memory: 'the three-hour lunch' },
            ],
          },
          {
            chance: 0.25,
            text: 'You spend most of lunch comparing medications. It is oddly the best conversation you have had all month.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { rel: 'pal', delta: 5, memory: 'comparing pill organisers over soup' },
            ],
          },
        ],
      },
      {
        id: 'correct',
        label: 'Insist that is not how it happened',
        outcomes: [
          {
            chance: 1,
            text: 'Neither of you remembers it the same way, and neither will ever back down. It is the most alive you have felt in ages.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { rel: 'pal', delta: 2, memory: 'the argument about who started it' },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Say you are too busy',
        outcomes: [
          {
            chance: 1,
            text: 'You are not busy. You spend the afternoon reorganising a drawer and wondering why you said that.',
            effects: [
              { stat: 'happiness', delta: -3 },
              { rel: 'pal', delta: -4, memory: 'the lunch you dodged' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'senior_river_cruise',
    kind: 'choice',
    category: 'travel',
    ages: [65, 90],
    weight: 7,
    cooldownYears: 8,
    text: 'A glossy brochure for a river cruise arrives, full of people your age laughing at wine glasses. The price is printed in very small type.',
    choices: [
      {
        id: 'book',
        label: 'Book a cabin',
        requires: canAfford(4000),
        outcomes: [
          {
            chance: 0.7,
            text: 'Ten days of castles, slow water and a quiz night you win by a landslide. You come home a little smug.',
            effects: [
              { money: -4000 },
              { stat: 'happiness', delta: 10 },
              { stat: 'stress', delta: -6 },
            ],
          },
          {
            chance: 0.3,
            text: 'A stomach bug sweeps the ship. You see the castles through a porthole, between naps.',
            effects: [
              { money: -4000 },
              { stat: 'health', delta: -3 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'local',
        label: 'Take the ferry across the local river instead',
        outcomes: [
          {
            chance: 1,
            text: 'Twenty minutes each way, a paper cup of tea, a gull that tries to take your sandwich. Honestly, not bad.',
            effects: [{ money: -20 }, { stat: 'happiness', delta: 4 }],
          },
        ],
      },
      {
        id: 'recycle',
        label: 'Recycle it',
        outcomes: [
          {
            chance: 1,
            text: 'Into the bin it goes. Two more arrive the following week, as if they know.',
            effects: [{ stat: 'stress', delta: 1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'senior_child_spare_room',
    kind: 'choice',
    category: 'family',
    ages: [70, 105],
    weight: 8,
    cooldownYears: 8,
    bind: { kid: { role: 'child', minAge: 30 } },
    text: '{kid.first} gently suggests you might move into {kid.their} spare room "just to be closer." {kid.They} {kid.has} clearly rehearsed this.',
    choices: [
      {
        id: 'accept',
        label: 'Accept the offer',
        outcomes: [
          {
            chance: 0.6,
            text: 'You settle in and start quietly reorganising {kid.their} kitchen. Everyone pretends not to notice.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'stress', delta: -4 },
              { rel: 'kid', delta: 6, memory: 'the year you moved in' },
            ],
          },
          {
            chance: 0.4,
            text: 'Living together turns out to involve a lot of opinions about the thermostat. Love survives. Barely.',
            effects: [
              { stat: 'stress', delta: 4 },
              { rel: 'kid', delta: -2, memory: 'the thermostat wars' },
            ],
          },
        ],
      },
      {
        id: 'refuse',
        label: 'Say you are staying put',
        outcomes: [
          {
            chance: 1,
            text: 'You thank {kid.first}, then prove your independence by changing a lightbulb while {kid.they} watch{kid.s} nervously.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { rel: 'kid', delta: -1, memory: 'the lightbulb demonstration' },
            ],
          },
        ],
      },
      {
        id: 'compromise',
        label: 'Agree to Sunday dinners every week',
        outcomes: [
          {
            chance: 1,
            text: 'Sunday dinners become a fixture. You bring the same trifle every time and nobody has the heart to object.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { rel: 'kid', delta: 5, memory: 'your Sunday trifle' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'senior_kitchen_dance',
    kind: 'choice',
    category: 'family',
    ages: [65, 100],
    weight: 8,
    cooldownYears: 6,
    when: isMarried,
    text: 'A song from your courting days comes on the radio while {spouse.first} is washing up. {spouse.They} {spouse.is} already swaying a little.',
    choices: [
      {
        id: 'dance',
        label: 'Ask for a dance',
        outcomes: [
          {
            chance: 0.8,
            text: 'You dance around the kitchen in your slippers. The plates can wait. They have waited before.',
            effects: [
              { stat: 'happiness', delta: 8 },
              { rel: 'spouse', delta: 8, memory: 'the kitchen dance' },
            ],
          },
          {
            chance: 0.2,
            text: 'One ambitious twirl and your back reminds you of its opinions. You finish the song sitting down, still holding hands.',
            effects: [
              { injury: 2 },
              { rel: 'spouse', delta: 6, memory: 'the twirl that went wrong' },
            ],
          },
        ],
      },
      {
        id: 'sing',
        label: 'Sing along, badly',
        outcomes: [
          {
            chance: 1,
            text: 'You get the words wrong in exactly the way you always have. {spouse.first} corrects you, as always.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { rel: 'spouse', delta: 4, memory: 'your wrong lyrics' },
            ],
          },
        ],
      },
      {
        id: 'dry',
        label: 'Pick up a tea towel and help',
        outcomes: [
          {
            chance: 1,
            text: 'You dry, {spouse.first} washes, and neither of you says much. It is a very good kind of quiet.',
            effects: [
              { stat: 'stress', delta: -3 },
              { rel: 'spouse', delta: 3, memory: 'drying up together' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'senior_giant_marrow',
    kind: 'choice',
    category: 'random',
    ages: [65, 95],
    weight: 7,
    once: true,
    text: 'Something in your vegetable patch has grown into a marrow the size of a small dog. A neighbour leans over the fence and says the words "village show."',
    choices: [
      {
        id: 'enter',
        label: 'Enter it in the show',
        outcomes: [
          {
            chance: 1,
            text: 'You sign the form and start talking to the marrow every morning. It is, after all, a competitor now.',
            effects: [{ stat: 'happiness', delta: 4 }, { flag: 'senior_marrow_entered' }],
            next: { eventId: 'senior_marrow_judging', inYears: 1 },
          },
        ],
      },
      {
        id: 'eat',
        label: 'Cook it',
        outcomes: [
          {
            chance: 1,
            text: 'It feeds you for nine days. By day five you have invented a marrow crumble out of pure desperation.',
            effects: [
              { skill: 'cooking', delta: 3 },
              { stat: 'health', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'give',
        label: 'Give it to the neighbour',
        outcomes: [
          {
            chance: 1,
            text: 'The neighbour accepts it with the face of someone handed a baby they did not ask for. You feel generous and slightly wicked.',
            effects: [{ stat: 'karma', delta: 3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'senior_marrow_judging',
    kind: 'choice',
    category: 'random',
    ages: [65, 100],
    weight: 10,
    chainOnly: true,
    text: 'Judging day. Your marrow sits on the trestle table between a suspiciously glossy rival and a pumpkin that has its own fan club.',
    choices: [
      {
        id: 'polish',
        label: 'Give it a last polish with your sleeve',
        outcomes: [
          {
            chance: oddsBy('karma', 0.4),
            text: 'First prize. A rosette, a small cheque and your photo in the parish newsletter, holding the marrow like a newborn.',
            effects: [
              { money: 50 },
              { stat: 'happiness', delta: 10 },
              { unflag: 'senior_marrow_entered' },
            ],
            success: true,
          },
          {
            chance: 0.6,
            text: 'Highly commended, which is what they write when they like you but not your marrow. You keep the card anyway.',
            effects: [{ stat: 'happiness', delta: 3 }, { unflag: 'senior_marrow_entered' }],
          },
        ],
      },
      {
        id: 'accuse',
        label: "Loudly question the rival marrow's shine",
        outcomes: [
          {
            chance: 0.5,
            text: 'The judge investigates and finds furniture wax. Your rival is disqualified and you are not invited back next year.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'karma', delta: -2 },
              { status: 'enemy' },
              { unflag: 'senior_marrow_entered' },
            ],
          },
          {
            chance: 0.5,
            text: 'The shine is entirely natural. You spend the rest of the afternoon avoiding eye contact with the tombola stall.',
            effects: [{ stat: 'happiness', delta: -4 }, { unflag: 'senior_marrow_entered' }],
          },
        ],
      },
    ],
  },
  {
    id: 'senior_friend_passes',
    kind: 'notice',
    category: 'social',
    ages: [70, 105],
    weight: 5,
    cooldownYears: 10,
    bind: { pal: { role: 'friend', minAge: 70 } },
    text: 'A letter arrives in handwriting you do not recognise. {pal.full} has died.',
    outcomes: [
      {
        chance: 1,
        text: 'You go to the funeral and stand at the back. On the way home you find you still know {pal.their} phone number by heart.',
        effects: [
          { status: 'npc_dies', with: 'pal' },
          { stat: 'happiness', delta: -8 },
          { stat: 'stress', delta: 3 },
        ],
      },
    ],
  },
  {
    id: 'senior_pension_letter',
    kind: 'notice',
    category: 'money',
    ages: [65, 100],
    weight: 6,
    cooldownYears: 5,
    text: 'An official envelope announces a change to your pension, explained across six pages and two diagrams.',
    outcomes: [
      {
        chance: 0.5,
        text: 'After a second cup of tea and a magnifying glass, it turns out you are getting slightly more. You read it twice to be sure.',
        effects: [{ money: 600 }, { stat: 'happiness', delta: 3 }],
      },
      {
        chance: 0.5,
        text: 'The diagrams are a polite way of saying a little less. You write a stern letter you never post.',
        effects: [{ money: -300 }, { stat: 'stress', delta: 3 }],
      },
    ],
  },
  {
    id: 'senior_self_checkout',
    kind: 'notice',
    category: 'world',
    ages: [65, 100],
    weight: 6,
    cooldownYears: 6,
    text: 'The supermarket has replaced its last cashier with a row of machines that talk.',
    outcomes: [
      {
        chance: 0.5,
        text: 'One accuses you of an unexpected item in the bagging area. The item is your handbag. You leave without the milk.',
        effects: [
          { stat: 'stress', delta: 3 },
          { stat: 'happiness', delta: -2 },
        ],
      },
      {
        chance: 0.5,
        text: 'You beat the machine on your first try and a teenager behind you nods with respect. You will be talking about this for days.',
        effects: [{ stat: 'happiness', delta: 4 }],
      },
    ],
  },
];
