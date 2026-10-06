import type { EventDef } from '../../engine/events/types';
import { canAfford, hasJob, livesAbroad, oddsBy } from './conditions';

export const TRAVEL_EVENTS_2: EventDef[] = [
  // ---------------------------------------------------------------- living abroad
  {
    id: 'trv2_abroad_food_from_home',
    kind: 'choice',
    category: 'travel',
    ages: [18, 57],
    weight: 8,
    cooldownYears: 5,
    when: livesAbroad,
    text: 'It hits you in a supermarket aisle in {city}: a craving so specific it has a smell. The dish your family made on cold evenings, and nobody in {countryThe} has heard of it.',
    choices: [
      {
        id: 'cook',
        label: 'Try to cook it from memory',
        outcomes: [
          {
            chance: 0.55,
            success: true,
            text: 'Three substitutions and one small fire later, it tastes almost right. Almost is enough to make you sit on the kitchen floor and eat it from the pan.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { skill: 'cooking', delta: 3 },
            ],
          },
          {
            chance: 0.45,
            text: 'The result is brown, confident and wrong. You eat it anyway, out of loyalty to the idea of it.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { skill: 'cooking', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'import',
        label: 'Order the ingredients from home',
        requires: canAfford(150),
        outcomes: [
          {
            chance: 1,
            text: 'The parcel costs more than the meal should, and customs opens it twice. The first bite is a small, private homecoming.',
            effects: [
              { money: -150 },
              { stat: 'happiness', delta: 8 },
              { stat: 'stress', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'local',
        label: 'Find the local version instead',
        outcomes: [
          {
            chance: 1,
            text: 'A stall-holder points you to a cousin of the dish, made with different spices and the same idea. It is not home, but it is a good neighbour.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'trv2_abroad_language_mixup',
    kind: 'choice',
    category: 'travel',
    ages: [18, 57],
    weight: 7,
    cooldownYears: 6,
    when: livesAbroad,
    text: 'At a neighbour\'s birthday in {city}, you confidently tell the host her cake is wonderful. The room goes silent. Apparently one vowel turned "wonderful" into something about her husband.',
    choices: [
      {
        id: 'laugh',
        label: 'Laugh at yourself first',
        outcomes: [
          {
            chance: oddsBy('happiness', 0.6),
            success: true,
            text: 'Your laugh breaks the spell. By midnight the mistake is a party legend and three guests have taught you worse words on purpose.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'smarts', delta: 2 },
            ],
          },
          {
            chance: 0.3,
            text: 'The host laughs. Her husband does not. You spend the rest of the evening near the coats.',
            effects: [{ stat: 'stress', delta: 4 }],
          },
        ],
      },
      {
        id: 'explain',
        label: 'Explain the grammar at length',
        outcomes: [
          {
            chance: 1,
            text: 'Your lecture on vowel length makes it worse with every clause. Someone kindly hands you a plate of cake to stop you talking.',
            effects: [
              { stat: 'stress', delta: 3 },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'classes',
        label: 'Sign up for proper lessons the next day',
        requires: canAfford(400),
        outcomes: [
          {
            chance: 1,
            text: 'The evening class meets in a draughty school hall. Within months your vowels behave and you can finally eavesdrop on the bus.',
            effects: [{ money: -400 }, { stat: 'smarts', delta: 5 }, { stat: 'stress', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'trv2_abroad_permit_maze',
    kind: 'choice',
    category: 'travel',
    ages: [18, 57],
    weight: 7,
    once: true,
    when: livesAbroad,
    text: 'Your residence permit is up for renewal. The form wants a document that only exists once you have the permit, and the office in {city} answers the phone on alternate Thursdays.',
    choices: [
      {
        id: 'queue',
        label: 'Queue in person at dawn',
        outcomes: [
          {
            chance: 1,
            text: 'You take a numbered ticket, a flask and a book. Seven hours later a clerk stamps four pages and says the decision will follow by post.',
            effects: [
              { stat: 'stress', delta: 5 },
              { stat: 'health', delta: -1 },
            ],
            next: { eventId: 'trv2_abroad_feels_like_home', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'lawyer',
        label: 'Pay an immigration adviser',
        requires: canAfford(1200),
        outcomes: [
          {
            chance: 1,
            text: 'The adviser has a stapler shaped like a fish and an alarming calm. She files everything in an afternoon and tells you to forget about it until the letter comes.',
            effects: [{ money: -1200 }, { stat: 'stress', delta: -3 }],
            next: { eventId: 'trv2_abroad_feels_like_home', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'ignore',
        label: 'Put the form in a drawer for now',
        outcomes: [
          {
            chance: 1,
            text: 'The drawer does not process forms. A reminder arrives in red ink, and you spend a frantic fortnight doing it all at once.',
            effects: [{ stat: 'stress', delta: 9 }],
            next: { eventId: 'trv2_abroad_feels_like_home', inYears: [1, 3] },
          },
        ],
      },
    ],
  },
  {
    id: 'trv2_abroad_first_local_friend',
    kind: 'choice',
    category: 'travel',
    ages: [18, 57],
    weight: 8,
    once: true,
    when: livesAbroad,
    text: 'The woman who runs the repair shop on your street in {city} has started saving you the last pastry and asking about your week. Today she invites you to her family lunch on Sunday.',
    choices: [
      {
        id: 'go',
        label: 'Go, and bring something',
        outcomes: [
          {
            chance: 1,
            success: true,
            text: 'Lunch lasts six hours. Her grandmother interrogates you about your intentions in {countryThe}, then hands you leftovers in a tub you are expected to return. You have a friend here now.',
            effects: [{ stat: 'happiness', delta: 9 }, { status: 'friend' }],
          },
        ],
      },
      {
        id: 'nervous',
        label: 'Say yes, then nearly cancel',
        outcomes: [
          {
            chance: 0.6,
            text: 'You stand outside her door for five minutes rehearsing small talk. Nobody needed it. You leave late, full, and invited back.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { status: 'friend' },
              { stat: 'stress', delta: -2 },
            ],
          },
          {
            chance: 0.4,
            text: 'You text a weak excuse. On Monday she still saves you the pastry, which somehow makes it worse.',
            effects: [
              { stat: 'happiness', delta: -3 },
              { stat: 'karma', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Politely decline',
        outcomes: [
          {
            chance: 1,
            text: 'She shrugs and says the offer stands. Your weekend is quiet in the way that only a city where nobody expects you can be.',
            effects: [{ stat: 'happiness', delta: -4 }],
          },
        ],
      },
    ],
  },
  {
    id: 'trv2_abroad_parent_ageing',
    fromYear: 2008,
    kind: 'choice',
    category: 'travel',
    ages: [25, 64],
    weight: 7,
    cooldownYears: 6,
    when: livesAbroad,
    bind: { parent: { role: 'mother', minAge: 60, hasMemory: true } },
    text: 'On the video call, {parent.first} holds the phone too close and asks you to repeat things twice. {parent.They} still bring{parent.s} up {parent.memory}, but {parent.they} look{parent.s} smaller than you remember.',
    choices: [
      {
        id: 'visit',
        label: 'Fly home for a long visit',
        requires: canAfford(1500),
        outcomes: [
          {
            chance: 1,
            text: 'Two weeks of fixing shelves, sitting in the garden and being told you are too thin. When you leave, {parent.first} waves until the car turns the corner.',
            effects: [
              { money: -1500 },
              { rel: 'parent', delta: 10, memory: 'the long visit home' },
              { npcStat: 'parent', stat: 'happiness', delta: 8 },
              { stat: 'happiness', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'calls',
        label: 'Set up a weekly call, same time',
        outcomes: [
          {
            chance: 1,
            text: 'Sunday at seven becomes sacred. Some weeks you talk for an hour; some weeks you both just watch the same weather forecast.',
            effects: [
              { rel: 'parent', delta: 6, memory: 'the Sunday calls' },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'later',
        label: 'Tell yourself there is plenty of time',
        outcomes: [
          {
            chance: 1,
            text: 'You hang up and stare at the wall for a while. There is time, probably. The thought keeps you awake.',
            effects: [
              { stat: 'stress', delta: 5 },
              { rel: 'parent', delta: -3, memory: 'the calls you kept cutting short' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'trv2_abroad_really_from',
    kind: 'choice',
    category: 'travel',
    ages: [18, 57],
    weight: 6,
    cooldownYears: 7,
    when: livesAbroad,
    text: 'A man at a work drinks in {city} asks where you are from. You tell him. He nods slowly and asks, "No, but where are you really from?"',
    choices: [
      {
        id: 'patient',
        label: 'Answer patiently',
        outcomes: [
          {
            chance: 1,
            text: 'You give him the full family map. He seems satisfied, and you feel oddly tired, like you filled in a form you never applied for.',
            effects: [
              { stat: 'stress', delta: 3 },
              { stat: 'karma', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'deadpan',
        label: 'Say "the kitchen, mostly"',
        outcomes: [
          {
            chance: 0.7,
            success: true,
            text: 'It lands. The woman next to him snorts into her drink and spends the rest of the night telling you better stories than his.',
            effects: [{ stat: 'happiness', delta: 5 }],
          },
          {
            chance: 0.3,
            text: 'He does not get it and asks again, slower. You excuse yourself to look at a very interesting fire exit.',
            effects: [{ stat: 'stress', delta: 2 }],
          },
        ],
      },
      {
        id: 'turn',
        label: 'Ask where he is really from',
        outcomes: [
          {
            chance: 1,
            text: 'He begins proudly, then discovers he has no idea where his grandmother was born. He goes quiet and thoughtful, which is a start.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'trv2_abroad_feels_like_home',
    kind: 'notice',
    category: 'travel',
    ages: [19, 60],
    weight: 0,
    chainOnly: true,
    when: livesAbroad,
    text: 'The permit card finally arrives, your photo on it looking like a startled owl. Weeks later, flying back from a trip, the plane banks over {city} and you catch yourself thinking "nearly home."',
    outcomes: [
      {
        chance: 1,
        text: 'You notice the word only after you have said it. Later, a tourist asks you for directions in the street, and you give them without checking your phone.',
        effects: [
          { stat: 'happiness', delta: 8 },
          { stat: 'stress', delta: -4 },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- travel for anyone
  {
    id: 'trv2_missed_connection',
    kind: 'choice',
    category: 'travel',
    ages: [18, 57],
    weight: 7,
    cooldownYears: 6,
    text: 'Your first flight lands forty minutes late, and you sprint the length of a terminal to watch your connection pull away from the gate. The next one leaves at 6 a.m.',
    choices: [
      {
        id: 'floor',
        label: 'Camp on the terminal floor',
        outcomes: [
          {
            chance: 0.6,
            text: 'You make a bed of coats behind a pillar. A cleaner wakes you at four with a coffee and a story about her son, and you board oddly fond of the place.',
            effects: [
              { stat: 'health', delta: -2 },
              { stat: 'happiness', delta: 2 },
            ],
          },
          {
            chance: 0.4,
            text: 'A floor polisher circles you all night like a patient shark. You arrive at your destination with a crick in your neck that lasts a week.',
            effects: [
              { stat: 'health', delta: -3 },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'hotel',
        label: 'Pay for the airport hotel',
        requires: canAfford(220),
        outcomes: [
          {
            chance: 1,
            text: 'The Runway Rest Inn charges a fortune for a room that shakes with every takeoff. Still, there is a shower, and a bed, and nobody vacuuming round your feet.',
            effects: [{ money: -220 }, { stat: 'stress', delta: -2 }],
          },
        ],
      },
      {
        id: 'complain',
        label: 'Argue your way to a voucher',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.45),
            success: true,
            text: 'You quote the small print back at the desk agent until she sighs and prints a meal voucher and a hotel pass. You feel like a lawyer in a good film.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'stress', delta: -1 },
            ],
          },
          {
            chance: 0.5,
            text: 'The agent listens politely and offers you a bottle of water. You drink it on the floor, defeated.',
            effects: [{ stat: 'stress', delta: 4 }],
          },
        ],
      },
    ],
  },
  {
    id: 'trv2_solo_trip',
    fromYear: 2008,
    kind: 'choice',
    category: 'travel',
    ages: [20, 59],
    weight: 7,
    cooldownYears: 7,
    text: 'Everyone you asked is busy, broke or "maybe next year." The coastal town you have been looking at online is still there, with one cheap room left above a bakery.',
    choices: [
      {
        id: 'go',
        label: 'Go alone',
        requires: canAfford(900),
        outcomes: [
          {
            chance: 0.7,
            success: true,
            text: 'You eat dinner at the bar with a book, swim before breakfast and talk to strangers because there is nobody else. You come back slightly more yourself.',
            effects: [
              { money: -900 },
              { stat: 'happiness', delta: 9 },
              { stat: 'stress', delta: -7 },
            ],
            next: { eventId: 'trv2_holiday_disaster', inYears: [1, 3] },
          },
          {
            chance: 0.3,
            text: 'It rains for five days. You learn every inch of the bakery and the plot of a local soap opera, and it is still somehow restful.',
            effects: [
              { money: -900 },
              { stat: 'happiness', delta: 3 },
              { stat: 'stress', delta: -4 },
            ],
            next: { eventId: 'trv2_holiday_disaster', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'wait',
        label: 'Wait until someone can come',
        outcomes: [
          {
            chance: 1,
            text: 'Next year comes and the room above the bakery is gone. You look at the photos sometimes and wonder.',
            effects: [{ stat: 'happiness', delta: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'trv2_backpacking_year',
    group: 'gap_year',
    kind: 'choice',
    category: 'travel',
    ages: [18, 30],
    weight: 8,
    once: true,
    text: 'A battered rucksack, a one-way ticket and a list of places scribbled on a beer mat. If you are ever going to spend a whole year wandering, it is probably now.',
    choices: [
      {
        id: 'go',
        label: 'Take the year',
        requires: canAfford(6000),
        outcomes: [
          {
            chance: 1,
            success: true,
            text: 'You sleep in hostels, on night buses and once on a fishing boat. You come back tanned, broke, and carrying a phone full of numbers from five continents.',
            effects: [
              { money: -6000 },
              { stat: 'happiness', delta: 10 },
              { stat: 'smarts', delta: 4 },
              { stat: 'stress', delta: -6 },
            ],
          },
        ],
      },
      {
        id: 'short',
        label: 'Do three months instead',
        requires: canAfford(2000),
        outcomes: [
          {
            chance: 1,
            text: 'Three months is enough to get lost properly twice and found once. You come home with a sunburn shaped like a map strap.',
            effects: [
              { money: -2000 },
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'stay',
        label: 'Keep the beer mat for later',
        outcomes: [
          {
            chance: 1,
            text: 'You pin the beer mat above your desk. It fades a little each summer, but you never quite throw it away.',
            effects: [{ stat: 'happiness', delta: -2 }, { money: 300 }],
          },
        ],
      },
    ],
  },
  {
    id: 'trv2_holiday_disaster',
    kind: 'notice',
    category: 'travel',
    ages: [21, 62],
    weight: 0,
    chainOnly: true,
    text: 'Emboldened by going solo, you book something bigger. It goes wrong in every direction at once: the villa is a building site, the rental car is a lawnmower with doors, and a seagull steals your passport photo.',
    outcomes: [
      {
        chance: 0.7,
        text: 'By the third disaster you are laughing too hard to be angry. Years later it is the trip you tell at every dinner party, and it gets better each time.',
        effects: [{ stat: 'happiness', delta: 5 }, { money: -400 }],
      },
      {
        chance: 0.3,
        text: 'At the time it is simply awful and expensive. The funny version takes a year to arrive, but it does arrive.',
        effects: [{ stat: 'stress', delta: 6 }, { money: -700 }],
      },
    ],
  },
  {
    id: 'trv2_parent_dream_trip',
    kind: 'choice',
    category: 'travel',
    ages: [28, 64],
    weight: 7,
    once: true,
    bind: { parent: { role: 'father', minAge: 55, minRelationship: 20 } },
    text: "For forty years {parent.first} has talked about seeing the northern lights 'one day.' {parent.They} mention{parent.s} it again over dinner, then laugh{parent.s} it off as a silly old dream.",
    choices: [
      {
        id: 'book',
        label: 'Book the trip and take them',
        requires: canAfford(4000),
        outcomes: [
          {
            chance: 0.7,
            success: true,
            text: 'On the fourth night the sky turns green and moving. {parent.first} stands in the snow saying nothing at all, then grips your hand so hard it hurts.',
            effects: [
              { money: -4000 },
              { rel: 'parent', delta: 15, memory: 'the night under the northern lights' },
              { npcStat: 'parent', stat: 'happiness', delta: 15 },
              { stat: 'happiness', delta: 10 },
            ],
          },
          {
            chance: 0.3,
            text: 'Cloud every single night. You drink hot chocolate in the lodge and {parent.first} says it was the best week in years anyway, and seems to mean it.',
            effects: [
              { money: -4000 },
              { rel: 'parent', delta: 10, memory: 'the cloudy week in the snow lodge' },
              { npcStat: 'parent', stat: 'happiness', delta: 8 },
              { stat: 'happiness', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'chip',
        label: 'Start a savings jar for it together',
        outcomes: [
          {
            chance: 1,
            text: 'You label an old jam jar "Sky Fund." {parent.first} pretends it is silly and then drops in coins every time you visit.',
            effects: [{ rel: 'parent', delta: 5, memory: 'the Sky Fund jar' }, { money: -200 }],
          },
        ],
      },
      {
        id: 'agree',
        label: 'Agree it sounds lovely',
        outcomes: [
          {
            chance: 1,
            text: 'You nod and change the subject. The dream goes back on the shelf, a little dustier.',
            effects: [{ stat: 'karma', delta: -1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'trv2_work_trip_afternoon',
    kind: 'choice',
    category: 'travel',
    ages: [22, 61],
    weight: 7,
    cooldownYears: 4,
    when: hasJob,
    text: 'The conference wraps up early, and you have a free afternoon in a city you have never seen before your flight home. Your laptop has eleven unread messages.',
    choices: [
      {
        id: 'explore',
        label: 'Wander with no plan',
        outcomes: [
          {
            chance: 1,
            text: 'You find a tiny museum of buttons, a café run by twins and a view you take nine photos of. The messages wait, as messages can.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'work',
        label: 'Clear the inbox at the hotel',
        outcomes: [
          {
            chance: 1,
            text: 'You reply to all eleven from a beige room with a view of a car park. Your boss is impressed; the city remains a rumour.',
            effects: [{ performance: 4 }, { stat: 'stress', delta: 2 }],
          },
        ],
      },
      {
        id: 'dinner',
        label: 'Treat yourself to a long dinner',
        requires: canAfford(150),
        outcomes: [
          {
            chance: 1,
            text: 'A three-course meal alone at a window table, the waiter recommending everything with total conviction. You expense none of it and regret nothing.',
            effects: [
              { money: -150 },
              { stat: 'happiness', delta: 5 },
              { stat: 'stress', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
];
