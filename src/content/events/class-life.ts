import type { EventDef } from '../../engine/events/types';
import type { GameState } from '../../engine/types';
import { netWorthRef } from '../../engine/networth';
import { all, canAfford, hasJob, hasKidAged, ownsVehicle, single } from './conditions';

const nw = (s: GameState): number => netWorthRef(s);
const adult = (s: GameState): boolean => s.player.age >= 18 && !s.legal.prison;
const poor = (s: GameState): boolean => adult(s) && nw(s) < 15000;
const working = (s: GameState): boolean => adult(s) && nw(s) >= 15000 && nw(s) < 150000;
const middle = (s: GameState): boolean => adult(s) && nw(s) >= 150000 && nw(s) < 1_000_000;
const rich = (s: GameState): boolean => adult(s) && nw(s) >= 10_000_000;
const ultra = (s: GameState): boolean => adult(s) && nw(s) >= 1_000_000_000;

/** Everyday life, by class: the same week looks very different at different bank balances. */
export const CLASS_LIFE_EVENTS: EventDef[] = [
  // ---------- Poor ----------
  {
    id: 'cl_poor_car_repair',
    kind: 'choice',
    category: 'money',
    emoji: '🔧',
    ages: [18, 90],
    weight: 7,
    cooldownYears: 5,
    when: all(poor, ownsVehicle),
    text: 'The car makes a noise like a drawer of cutlery falling down stairs, then stops. The garage quote is more than you have, written in pencil, as if even they are embarrassed.',
    choices: [
      {
        id: 'credit',
        label: 'Put it on the credit card',
        outcomes: [
          {
            chance: 1,
            text: 'The car runs again. The card balance now has a life of its own and sends you letters about it.',
            effects: [
              { money: -1400, kind: 'price' },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'mate',
        label: 'Ask {friend.first}, who “knows engines”',
        outcomes: [
          {
            chance: 0.55,
            text: '{friend.first} lies under it for a Sunday afternoon, swears at a bolt, and gets it going for the price of a part and a takeaway.',
            effects: [
              { money: -150, kind: 'price' },
              { rel: 'friend', delta: 8, memory: 'fixing your car on a Sunday' },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: '{friend.first} fixes the original problem and invents two new ones. The garage quote, when you go back, has grown.',
            effects: [
              { money: -1700, kind: 'price' },
              { rel: 'friend', delta: -3, memory: 'the car repair that went sideways' },
              { stat: 'stress', delta: 7 },
            ],
          },
        ],
      },
      {
        id: 'bus',
        label: 'Leave it on the drive and take the bus',
        outcomes: [
          {
            chance: 1,
            text: 'Two buses each way and a lot of standing in the rain. You get to know the drivers, and a very talkative man called Ossie.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { stat: 'health', delta: 2 },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cl_poor_two_bills',
    kind: 'choice',
    category: 'money',
    emoji: '🧾',
    ages: [18, 90],
    weight: 8,
    cooldownYears: 3,
    when: poor,
    text: 'Two red envelopes on the mat: the electricity and the water. You have the money for one of them, if you skip the big shop.',
    choices: [
      {
        id: 'power',
        label: 'Pay the electricity',
        outcomes: [
          {
            chance: 1,
            text: 'The lights stay on. The water company sends a firmer letter in a slightly darker red.',
            effects: [
              { money: -280, kind: 'price' },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'water',
        label: 'Pay the water',
        outcomes: [
          {
            chance: 1,
            text: 'You switch to a meter that eats coins and learn exactly how long a kettle takes. It is the longest winter in years.',
            effects: [
              { money: -240, kind: 'price' },
              { stat: 'happiness', delta: -5 },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'ring',
        label: 'Ring them both and plead',
        outcomes: [
          {
            chance: (s) => 0.4 + s.player.stats.smarts / 300,
            text: 'Forty minutes of hold music and one kind woman in a call centre later, both bills are on a payment plan you can actually manage.',
            effects: [
              { money: -90, kind: 'price' },
              { stat: 'stress', delta: -3 },
              { stat: 'happiness', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'Neither company can help, but both are sorry to hear it. You pay one, late, with a fee for the privilege.',
            effects: [
              { money: -320, kind: 'price' },
              { stat: 'stress', delta: 7 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cl_poor_eviction',
    kind: 'choice',
    category: 'money',
    emoji: '📄',
    ages: [18, 90],
    weight: 6,
    cooldownYears: 8,
    when: poor,
    text: 'A notice is taped to your door, which seems unnecessary since it was also posted through it. Two months of arrears, and four weeks to leave.',
    choices: [
      {
        id: 'clinic',
        label: 'Take it to the free legal clinic',
        outcomes: [
          {
            chance: (s) => 0.35 + s.player.stats.smarts / 300,
            text: 'A volunteer solicitor in a cardigan finds three mistakes in the paperwork. The notice is void, and you get a year to catch up on the arrears.',
            effects: [
              { stat: 'stress', delta: -6 },
              { stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
          {
            chance: 0.6,
            text: 'The paperwork is, sadly, perfect. The clinic buys you six extra weeks and the number of a removals man who does it cheap.',
            effects: [
              { stat: 'stress', delta: 8 },
              { stat: 'happiness', delta: -6 },
              { flag: 'evicted' },
            ],
          },
        ],
      },
      {
        id: 'pay',
        label: 'Scrape together what you can and plead',
        outcomes: [
          {
            chance: 0.5,
            text: 'You hand over everything in the jar and the landlord, to everyone’s surprise, softens. You stay, on probation, like a teenager.',
            effects: [
              { money: -900, kind: 'price' },
              { stat: 'stress', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The landlord takes the money and keeps the date. You pack your life into bin bags and a borrowed suitcase.',
            effects: [
              { money: -900, kind: 'price' },
              { stat: 'happiness', delta: -10 },
              { stat: 'stress', delta: 10 },
              { flag: 'evicted' },
            ],
          },
        ],
      },
      {
        id: 'go',
        label: 'Leave quietly before it gets worse',
        outcomes: [
          {
            chance: 1,
            text: 'You are out in three weeks, sleeping on a sofa that is not long enough. At least you leave on your own terms, mostly.',
            effects: [
              { stat: 'happiness', delta: -7 },
              { stat: 'stress', delta: 6 },
              { flag: 'evicted' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cl_poor_heating',
    kind: 'choice',
    category: 'money',
    emoji: '🥶',
    ages: [18, 90],
    weight: 6,
    cooldownYears: 5,
    when: poor,
    text: 'The heating has been broken since October. The landlord says a man is coming. The man, like the heat, does not come. You can see your breath in the kitchen.',
    choices: [
      {
        id: 'council',
        label: 'Report the landlord to the council',
        outcomes: [
          {
            chance: 0.6,
            text: 'An inspector with a clipboard and a thermometer visits, tuts at length, and the heating is fixed within the week. Your landlord stops saying hello.',
            effects: [
              { stat: 'health', delta: 3 },
              { stat: 'happiness', delta: 5 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The council has a backlog until spring. When spring comes, so does the heat, outside.',
            effects: [
              { stat: 'health', delta: -3 },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'heater',
        label: 'Buy a cheap oil heater',
        outcomes: [
          {
            chance: 1,
            text: 'You move your whole life into the one warm room and the electricity bill grows teeth. The heater becomes, in a sense, a flatmate.',
            effects: [
              { money: -120, kind: 'price' },
              { stat: 'happiness', delta: 2 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'layers',
        label: 'Wear three jumpers and wait',
        outcomes: [
          {
            chance: 1,
            text: 'You sleep in a hat until March and catch every cold going. You are an expert on hot water bottles now, against your will.',
            effects: [
              { stat: 'health', delta: -5 },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cl_poor_school_trip',
    kind: 'choice',
    category: 'family',
    emoji: '🚌',
    ages: [24, 70],
    weight: 7,
    cooldownYears: 4,
    when: all(poor, hasKidAged(7, 16)),
    bind: { kid: { role: 'child', minAge: 7, maxAge: 16 } },
    text: '{kid.first} hands you a letter about a school trip to the coast, then says, too quickly, that {kid.they} didn’t want to go anyway.',
    choices: [
      {
        id: 'find',
        label: 'Find the money somewhere',
        outcomes: [
          {
            chance: 1,
            text: 'You skip lunches for a month and sell the good coat. {kid.first} comes back sunburnt with a stick of rock and a story that lasts all winter.',
            effects: [
              { money: -350, kind: 'price' },
              { rel: 'kid', delta: 12, memory: 'the school trip to the coast' },
              { stat: 'happiness', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'fund',
        label: 'Ask the school about a hardship fund',
        outcomes: [
          {
            chance: 0.65,
            text: 'The office has a quiet fund for exactly this, and nobody in the class ever knows. {kid.first} goes, and so does your pride, a little.',
            effects: [
              { rel: 'kid', delta: 8, memory: 'the school trip someone else paid for' },
              { stat: 'happiness', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.35,
            text: 'The fund is used up for the year. The secretary is sorry. {kid.first} spends trip day in the library with two other kids.',
            effects: [
              { rel: 'kid', delta: -4, memory: 'the day in the library during the trip' },
              { stat: 'happiness', delta: -5 },
            ],
          },
        ],
      },
      {
        id: 'truth',
        label: 'Tell {kid.first} the truth',
        outcomes: [
          {
            chance: 1,
            text: '{kid.first} nods like a small adult and goes upstairs. You hear nothing for an hour, and that is the worst part.',
            effects: [
              { rel: 'kid', delta: -6, memory: 'the trip they could not go on' },
              { stat: 'happiness', delta: -6 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cl_poor_neighbour',
    kind: 'choice',
    category: 'social',
    emoji: '🛍️',
    ages: [18, 90],
    weight: 6,
    cooldownYears: 6,
    when: poor,
    text: 'There is a bag of shopping on your doorstep: pasta, tins, a box of good teabags and a note that just says “Spare. Don’t be daft.” The handwriting is from next door.',
    choices: [
      {
        id: 'thank',
        label: 'Knock and say thank you',
        outcomes: [
          {
            chance: 1,
            text: 'Mrs Abernathy from next door waves it away and makes you stay for a cup of tea that lasts two hours. You leave with a friend and half a cake.',
            effects: [
              { stat: 'happiness', delta: 7 },
              { status: 'friend', first: 'Mrs Abernathy', age: 74 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'repay',
        label: 'Repay it by fixing their wobbly gate',
        outcomes: [
          {
            chance: 1,
            text: 'You spend a Saturday on the gate with a borrowed screwdriver. It still wobbles, but kindly, and the bags keep coming now and then.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'karma', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'proud',
        label: 'Leave it on their step with a note',
        outcomes: [
          {
            chance: 1,
            text: 'Your note says you are fine, really. You eat toast for tea and the good teabags haunt you all week.',
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
    id: 'cl_poor_scratchcard',
    kind: 'choice',
    category: 'money',
    emoji: '🎟️',
    ages: [18, 90],
    weight: 6,
    cooldownYears: 3,
    when: poor,
    text: 'At the corner shop, the scratch cards glint under the counter like they know your name. The top prize would change everything. The odds would rather not discuss it.',
    choices: [
      {
        id: 'buy',
        label: 'Buy one and let yourself dream',
        outcomes: [
          {
            chance: 0.03,
            text: 'Three golden horseshoes in a row. You check it eleven times, then sit down on the pavement. It is not millions, but it is a new start.',
            effects: [
              { money: 10000, kind: 'price' },
              { stat: 'happiness', delta: 15 },
            ],
            success: true,
          },
          {
            chance: 0.22,
            text: 'You win back double what you spent, which feels like a sign. You decide it is a sign to stop.',
            effects: [
              { money: 6, kind: 'price' },
              { stat: 'happiness', delta: 3 },
            ],
          },
          {
            chance: 0.75,
            text: 'Two out of three cherries. It is always two out of three cherries. You enjoyed the ninety seconds when it might have been the third.',
            effects: [
              { money: -3, kind: 'price' },
              { vice: 'gambling', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'no',
        label: 'Buy milk and walk out',
        outcomes: [
          {
            chance: 1,
            text: 'You walk home with the milk and the small, sensible satisfaction of not being had.',
            effects: [{ stat: 'happiness', delta: 1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'cl_poor_payday',
    kind: 'choice',
    category: 'money',
    emoji: '💷',
    ages: [18, 90],
    weight: 7,
    cooldownYears: 3,
    when: all(poor, hasJob),
    text: 'Payday. For about six hours the account looks like it belongs to someone doing all right. Everything already wants a piece of it.',
    choices: [
      {
        id: 'arrears',
        label: 'Clear the oldest debt first',
        outcomes: [
          {
            chance: 1,
            text: 'One envelope fewer in the drawer. It is a dull, grown-up victory, and you sleep better for it.',
            effects: [
              { money: -300, kind: 'price' },
              { stat: 'stress', delta: -6 },
            ],
          },
        ],
      },
      {
        id: 'fridge',
        label: 'Fill the fridge properly for once',
        outcomes: [
          {
            chance: 1,
            text: 'Fresh fruit, real coffee and a chicken that is not reduced. For a week you eat like the people in adverts.',
            effects: [
              { money: -150, kind: 'price' },
              { stat: 'health', delta: 3 },
              { stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'night',
        label: 'Have one good night out',
        outcomes: [
          {
            chance: 1,
            text: 'You dance, you buy a round you cannot afford, and for one evening money is not the main character. The rest of the month is beans.',
            effects: [
              { money: -120, kind: 'price' },
              { stat: 'happiness', delta: 7 },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cl_poor_holiday_shift',
    kind: 'choice',
    category: 'money',
    emoji: '🎄',
    ages: [18, 90],
    weight: 6,
    cooldownYears: 4,
    when: all(poor, hasJob),
    text: 'Your manager asks who wants a double shift on the bank holiday, at time and a half. Everyone looks at their shoes except you, because you are doing sums.',
    choices: [
      {
        id: 'take',
        label: 'Take the double',
        outcomes: [
          {
            chance: 1,
            text: 'Sixteen hours, a sandwich at four in the afternoon, and a pay packet that finally covers the gas bill. You miss the whole day, and your feet file a complaint.',
            effects: [
              { money: 380, kind: 'wage' },
              { stat: 'health', delta: -2 },
              { stat: 'happiness', delta: -3 },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'family',
        label: 'Keep the day for your people',
        outcomes: [
          {
            chance: 1,
            text: 'A cheap roast, a board game with missing pieces, and a long walk with nowhere to be. The gas bill can wait a week. Probably.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
    ],
  },

  // ---------- Working class ----------
  {
    id: 'cl_work_overtime',
    kind: 'choice',
    category: 'money',
    emoji: '⏱️',
    ages: [18, 70],
    weight: 7,
    cooldownYears: 4,
    when: all(working, hasJob),
    text: 'Overtime is on offer: every Saturday until the end of the quarter. It is a holiday, a new sofa or a dent in the mortgage, depending on who you ask at home.',
    choices: [
      {
        id: 'yes',
        label: 'Sign up for every Saturday',
        outcomes: [
          {
            chance: 1,
            text: 'Twelve Saturdays in a row. The money is real, the tiredness is realer, and you fall asleep during a film you were enjoying.',
            effects: [
              { money: 3500, kind: 'wage' },
              { stat: 'stress', delta: 6 },
              { stat: 'health', delta: -2 },
              { performance: 4 },
            ],
          },
        ],
      },
      {
        id: 'some',
        label: 'Do every other week',
        outcomes: [
          {
            chance: 1,
            text: 'Half the money, half the tiredness, and you still get to see daylight on a weekend. It feels like having it both ways, nearly.',
            effects: [
              { money: 1700, kind: 'wage' },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'no',
        label: 'Keep your weekends',
        outcomes: [
          {
            chance: 1,
            text: 'You spend Saturdays doing nothing in particular, which turns out to be exactly what you needed.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'stress', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cl_work_union_vote',
    kind: 'choice',
    category: 'money',
    emoji: '🗳️',
    ages: [18, 70],
    weight: 6,
    cooldownYears: 6,
    when: all(working, hasJob),
    bind: { mate: { role: 'coworker' } },
    text: 'The union is balloting on a strike over pay. {mate.first} has been handing out leaflets in the canteen and saving you a seat at every meeting.',
    choices: [
      {
        id: 'strike',
        label: 'Vote to strike, and walk out',
        outcomes: [
          {
            chance: 0.55,
            text: 'Three cold weeks on the picket line, a lot of flasks of soup, and a deal that is better than anyone expected. {mate.first} hugs you in the car park.',
            effects: [
              { money: 2000, kind: 'wage' },
              { rel: 'mate', delta: 10, memory: 'standing on the picket line together' },
              { stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'The strike drags on and settles for a little more than was offered at the start. You lost a month of wages to win a few coins an hour.',
            effects: [
              { money: -1500, kind: 'wage' },
              { rel: 'mate', delta: 5, memory: 'the long strike' },
              { stat: 'stress', delta: 8 },
            ],
          },
        ],
      },
      {
        id: 'against',
        label: 'Vote against and keep working',
        outcomes: [
          {
            chance: 1,
            text: 'The vote passes anyway. You cross the line on the first morning, and {mate.first} looks straight through you.',
            effects: [
              { rel: 'mate', delta: -14, memory: 'the morning you crossed the picket line' },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'abstain',
        label: 'Spoil your ballot',
        outcomes: [
          {
            chance: 1,
            text: 'You draw a small boat on the ballot paper and post it. The vote is close, and you never quite stop wondering about the boat.',
            effects: [
              { rel: 'mate', delta: -3, memory: 'the ballot you would not talk about' },
              { stat: 'happiness', delta: -1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cl_work_boiler',
    kind: 'choice',
    category: 'money',
    emoji: '🔥',
    ages: [20, 90],
    weight: 7,
    cooldownYears: 6,
    when: working,
    text: 'The boiler dies on the coldest night of the year with a sad little click. The engineer can come Thursday, and his price has a comma in it.',
    choices: [
      {
        id: 'pay',
        label: 'Pay for a new boiler',
        requires: canAfford(2500),
        outcomes: [
          {
            chance: 1,
            text: 'A new boiler, a ten-year guarantee and hot water like a hotel. You stand in the shower far too long, on principle.',
            effects: [
              { money: -2500, kind: 'price' },
              { stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'mate',
        label: 'Ring {friend.first}, who knows a bloke',
        outcomes: [
          {
            chance: 0.6,
            text: 'The bloke turns up on Saturday with a bag of parts and a radio. Cash in hand, a third of the price, and it purrs.',
            effects: [
              { money: -800, kind: 'price' },
              { rel: 'friend', delta: 5, memory: 'sorting out the boiler man' },
              { stat: 'happiness', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The bloke gets it working for exactly nine days. Then you pay for the proper engineer anyway, and he has questions.',
            effects: [
              { money: -3000, kind: 'price' },
              { rel: 'friend', delta: -3, memory: 'the boiler man who was not a boiler man' },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'kettle',
        label: 'Boil kettles and wait for payday',
        outcomes: [
          {
            chance: 1,
            text: 'You wash in instalments for three weeks. It builds character, mostly the grumpy kind.',
            effects: [
              { stat: 'happiness', delta: -5 },
              { stat: 'health', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cl_work_van',
    kind: 'choice',
    category: 'family',
    emoji: '🚚',
    ages: [20, 70],
    weight: 6,
    cooldownYears: 6,
    when: working,
    bind: { sib: { role: 'sibling', minAge: 18 } },
    text: '{sib.first} is moving flats on Saturday and has borrowed a van from a man at work. {sib.first} has never driven a van. Your phone rings at eight in the morning.',
    choices: [
      {
        id: 'help',
        label: 'Drive the van and lift the sofa',
        outcomes: [
          {
            chance: 0.7,
            text: 'Four trips, one wardrobe that does not fit the stairs, and fish and chips on the floor of the new place. {sib.first} gets weepy over the ketchup.',
            effects: [
              { rel: 'sib', delta: 10, memory: 'the moving day with the borrowed van' },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'The sofa wins. Your back makes a decision on the second landing that it holds to for a month.',
            effects: [
              { rel: 'sib', delta: 7, memory: 'the sofa that beat you on the stairs' },
              { injury: 4 },
            ],
          },
        ],
      },
      {
        id: 'pay',
        label: 'Chip in for proper movers',
        outcomes: [
          {
            chance: 1,
            text: 'Two men in matching shirts do it in three hours. {sib.first} is grateful, and slightly disappointed you did not come in person.',
            effects: [
              { money: -350, kind: 'price' },
              { rel: 'sib', delta: 4, memory: 'paying for the movers' },
            ],
          },
        ],
      },
      {
        id: 'excuse',
        label: 'Invent a prior commitment',
        outcomes: [
          {
            chance: 1,
            text: 'Your prior commitment is the sofa and a long film. {sib.first} sends a photo of the van wedged under a low bridge.',
            effects: [
              { rel: 'sib', delta: -8, memory: 'the moving day you skipped' },
              { stat: 'karma', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cl_work_raffle',
    kind: 'choice',
    category: 'social',
    emoji: '🎫',
    ages: [18, 90],
    weight: 5,
    cooldownYears: 4,
    when: working,
    text: 'The social club is running its yearly raffle. First prize is a weekend in a caravan by the sea; second prize is a meat hamper of legendary size.',
    choices: [
      {
        id: 'strip',
        label: 'Buy a whole strip',
        outcomes: [
          {
            chance: 0.25,
            text: 'Your number is called for the meat hamper. You carry it home like a newborn and your freezer is full until spring.',
            effects: [
              { money: -20, kind: 'price' },
              { stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
          {
            chance: 0.1,
            text: 'The caravan weekend is yours. It rains for both days and it is the best weekend of the year.',
            effects: [
              { money: -20, kind: 'price' },
              { stat: 'happiness', delta: 9 },
              { stat: 'stress', delta: -5 },
            ],
            success: true,
          },
          {
            chance: 0.65,
            text: 'You win a bottle of bubble bath that someone else donated last year. The club is, at least, one new roof closer.',
            effects: [
              { money: -20, kind: 'price' },
              { stat: 'karma', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'skip',
        label: 'Pass on the raffle',
        outcomes: [
          {
            chance: 1,
            text: 'The man selling tickets remembers your face for a year, with mild disappointment.',
            effects: [{ stat: 'happiness', delta: -1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'cl_work_payrise',
    kind: 'choice',
    category: 'money',
    emoji: '🤝',
    ages: [20, 70],
    weight: 6,
    cooldownYears: 5,
    when: all(working, hasJob),
    bind: { gaffer: { role: 'boss' } },
    text: 'Prices have gone up three times this year and your wage has not moved once. You have rehearsed the speech in the car. {gaffer.first} has a free ten minutes after lunch.',
    choices: [
      {
        id: 'ask',
        label: 'Ask for it plainly, with numbers',
        outcomes: [
          {
            chance: (s) => 0.35 + s.player.stats.smarts / 300,
            text: '{gaffer.first} listens, nods, and says “fair enough” in a voice that means the numbers did it. It is in your next payslip.',
            effects: [
              { job: 'raise' },
              { rel: 'gaffer', delta: 3, memory: 'the pay talk with the numbers' },
              { stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: '{gaffer.first} says budgets are tight and things will look different next year. Things, it turns out, are always about to look different.',
            effects: [
              { rel: 'gaffer', delta: -2, memory: 'the pay talk that went nowhere' },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'hint',
        label: 'Drop hints about the cost of living',
        outcomes: [
          {
            chance: 1,
            text: '{gaffer.first} agrees that everything is expensive and offers you a biscuit. You take the biscuit.',
            effects: [{ stat: 'happiness', delta: -2 }],
          },
        ],
      },
      {
        id: 'leverage',
        label: 'Mention another firm is interested',
        outcomes: [
          {
            chance: 0.45,
            text: '{gaffer.first} goes pale and comes back an hour later with an offer. You did not, strictly, have another offer.',
            effects: [
              { job: 'raise' },
              { rel: 'gaffer', delta: -3, memory: 'the rival offer you mentioned' },
              { stat: 'karma', delta: -2 },
            ],
            success: true,
          },
          {
            chance: 0.55,
            text: '{gaffer.first} wishes you the very best with the other firm. Now you have to find one.',
            effects: [
              { rel: 'gaffer', delta: -8, memory: 'the bluff about another job' },
              { stat: 'stress', delta: 8 },
              { performance: -4 },
            ],
          },
        ],
      },
    ],
  },

  // ---------- Middle class ----------
  {
    id: 'cl_mid_catchment',
    kind: 'choice',
    category: 'family',
    emoji: '🏫',
    ages: [25, 60],
    weight: 6,
    cooldownYears: 8,
    when: all(middle, hasKidAged(2, 10)),
    text: 'The good school’s catchment area ends, according to a map you have studied like a general, exactly two streets from your front door.',
    choices: [
      {
        id: 'move',
        label: 'Move two streets over',
        outcomes: [
          {
            chance: 1,
            text: 'You pay a premium for a smaller house with a worse kitchen and a better postcode. The school letter arrives and you frame it, nearly.',
            effects: [
              { wealth: -0.04 },
              { stat: 'stress', delta: 5 },
              { stat: 'happiness', delta: 3 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'fib',
        label: 'Borrow your aunt’s address',
        outcomes: [
          {
            chance: 0.5,
            text: 'It works. Every school run past your aunt’s house you feel like a spy in a very low-budget film.',
            effects: [
              { stat: 'karma', delta: -5 },
              { stat: 'stress', delta: 4 },
              { flag: 'catchment_fib' },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The council checks the electoral roll. The place is withdrawn, and the story goes round the school gates in a day.',
            effects: [
              { stat: 'karma', delta: -5 },
              { stat: 'happiness', delta: -6 },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'local',
        label: 'Go and visit the local school properly',
        outcomes: [
          {
            chance: 1,
            text: 'The head teacher is funny, the art on the walls is wild, and nobody there has heard of the league tables. You stop worrying, mostly.',
            effects: [
              { stat: 'stress', delta: -5 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cl_mid_kitchen',
    kind: 'choice',
    category: 'family',
    emoji: '🍳',
    ages: [25, 80],
    weight: 6,
    cooldownYears: 10,
    when: middle,
    bind: { sp: { role: 'spouse', minAge: 18 } },
    text: 'The new kitchen has become a debate. {sp.first} wants an island. You want to be able to open the oven without moving it. The designer is trying very hard to look neutral.',
    choices: [
      {
        id: 'island',
        label: 'Let {sp.first} have the island',
        outcomes: [
          {
            chance: 1,
            text: 'The island goes in. It is beautiful, and you walk around it four hundred times a day. {sp.first} hosts a dinner just to lean on it.',
            effects: [
              { wealth: -0.03 },
              { rel: 'sp', delta: 8, memory: 'getting the kitchen island' },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'mine',
        label: 'Hold out for a practical layout',
        outcomes: [
          {
            chance: 1,
            text: 'You win, and the kitchen works perfectly. Every so often {sp.first} looks at the empty middle of the room and sighs.',
            effects: [
              { wealth: -0.025 },
              { rel: 'sp', delta: -5, memory: 'the island they did not get' },
            ],
          },
        ],
      },
      {
        id: 'shelve',
        label: 'Paint the old cupboards instead',
        outcomes: [
          {
            chance: 1,
            text: 'One weekend, three tins of sage green, and a new tap. It is not a new kitchen, but you did it together and nobody cried.',
            effects: [
              { money: -400, kind: 'price' },
              { rel: 'sp', delta: 4, memory: 'painting the kitchen together' },
              { stat: 'happiness', delta: 3 },
            ],
            success: true,
          },
        ],
      },
    ],
  },
  {
    id: 'cl_mid_timeshare',
    kind: 'choice',
    category: 'money',
    emoji: '🏝️',
    ages: [25, 85],
    weight: 5,
    cooldownYears: 8,
    when: middle,
    text: 'On holiday, a tanned man with excellent teeth offers you a free breakfast and a “short presentation” about owning a week a year in paradise, forever.',
    choices: [
      {
        id: 'sign',
        label: 'Sign up for your week in paradise',
        outcomes: [
          {
            chance: 1,
            text: 'You now own the second week of October in a flat with a view of the car park. The maintenance fees arrive with the reliability of the tides.',
            effects: [{ wealth: -0.03 }, { stat: 'happiness', delta: -3 }, { flag: 'timeshare' }],
          },
        ],
      },
      {
        id: 'breakfast',
        label: 'Eat the breakfast, then leave',
        outcomes: [
          {
            chance: 0.6,
            text: 'You eat four croissants and say “we’ll think about it” nine times. You walk out into the sun victorious and slightly sick.',
            effects: [{ stat: 'happiness', delta: 4 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The short presentation lasts three hours and involves a second, sadder man. You escape, but the day is gone.',
            effects: [
              { stat: 'stress', delta: 5 },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'no',
        label: 'Keep walking',
        outcomes: [
          {
            chance: 1,
            text: 'You keep walking. Behind you, he is already smiling at the next family with a pushchair.',
            effects: [{ stat: 'stress', delta: -1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'cl_mid_extension',
    kind: 'choice',
    category: 'social',
    emoji: '🏗️',
    ages: [25, 90],
    weight: 6,
    cooldownYears: 8,
    when: middle,
    text: 'The neighbours have applied to build a two-storey extension. From the plans, your garden will be in its shadow from lunchtime until roughly the end of time.',
    choices: [
      {
        id: 'object',
        label: 'Object to the planning committee',
        outcomes: [
          {
            chance: 0.5,
            text: 'You speak for three minutes about light and dignity. The committee shrinks it to one storey. The neighbours now prune their hedge in your direction.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'stress', delta: 4 },
              { status: 'enemy', first: 'Clive', age: 52 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The extension is approved in four minutes flat. You are now known on the street as the one who objected, and you still lose the sun.',
            effects: [
              { stat: 'happiness', delta: -5 },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'talk',
        label: 'Go round with a bottle and talk',
        outcomes: [
          {
            chance: 1,
            text: 'Over the bottle, they agree to move it a metre and add a skylight. You end up mates, and the builders let you use their skip.',
            effects: [
              { money: -30, kind: 'price' },
              { stat: 'happiness', delta: 4 },
              { stat: 'karma', delta: 3 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'own',
        label: 'Plan an extension of your own',
        outcomes: [
          {
            chance: 1,
            text: 'Fine: two can play at building. A year of dust later you have a garden room, a lighter bank account and a cold war conducted entirely in skips.',
            effects: [
              { wealth: -0.05 },
              { stat: 'happiness', delta: 3 },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cl_mid_dinner_party',
    kind: 'choice',
    category: 'social',
    emoji: '🍷',
    ages: [25, 85],
    weight: 6,
    cooldownYears: 5,
    when: middle,
    bind: { pal: { role: 'friend', minAge: 22 } },
    text: '{pal.first} served a seven-course dinner last month, with a sorbet between courses “to cleanse the palate”. It is your turn to host. The sorbet is looking at you.',
    choices: [
      {
        id: 'match',
        label: 'Match it, course for course',
        outcomes: [
          {
            chance: 0.5,
            text: 'You cook for two days and plate things with tweezers. It is magnificent. {pal.first} asks for the recipe, and you feel taller.',
            effects: [
              { money: -500, kind: 'price' },
              { rel: 'pal', delta: 6, memory: 'the seven-course rematch' },
              { stat: 'happiness', delta: 6 },
              { skill: 'cooking', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The soufflé collapses, the sorbet melts and the smoke alarm joins the conversation. Everyone is very kind about it, which is worse.',
            effects: [
              { money: -500, kind: 'price' },
              { rel: 'pal', delta: 2, memory: 'the dinner with the smoke alarm' },
              { stat: 'stress', delta: 7 },
            ],
          },
        ],
      },
      {
        id: 'curry',
        label: 'Order a big curry and own it',
        outcomes: [
          {
            chance: 1,
            text: 'Foil trays on the table, good beer, nobody in the kitchen. It is the most relaxed evening the group has had in years, and {pal.first} quietly admits it.',
            effects: [
              { money: -120, kind: 'price' },
              { rel: 'pal', delta: 5, memory: 'the curry night that beat the dinner parties' },
              { stat: 'happiness', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'busy',
        label: 'Discover you are busy for months',
        outcomes: [
          {
            chance: 1,
            text: 'The invitations stop coming quite so often. You are not sure whether that is relief or loss, and decide not to look too closely.',
            effects: [
              { rel: 'pal', delta: -5, memory: 'the dinner you never hosted' },
              { stat: 'happiness', delta: -1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cl_mid_adviser',
    kind: 'choice',
    category: 'money',
    emoji: '📈',
    ages: [28, 85],
    weight: 6,
    cooldownYears: 6,
    when: middle,
    text: 'A financial adviser with a firm handshake and a glossy folder recommends a “managed growth product”. The fees are on page eleven, in a font for ants.',
    choices: [
      {
        id: 'buy',
        label: 'Buy the product',
        outcomes: [
          {
            chance: 0.35,
            text: 'The markets have a good few years and the product rides along. The fees take their slice, but you are ahead, and the folder was nice.',
            effects: [{ wealth: 0.02 }, { stat: 'happiness', delta: 2 }],
            success: true,
          },
          {
            chance: 0.65,
            text: 'Five years later the product has grown at exactly the rate of its fees. The adviser has a new car.',
            effects: [{ wealth: -0.02 }, { stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'fees',
        label: 'Ask what page eleven means',
        outcomes: [
          {
            chance: 1,
            text: 'The adviser’s smile does a brief, interesting thing. You leave with your money and a sudden interest in reading small print.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { stat: 'happiness', delta: 2 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'diy',
        label: 'Put it in a plain index fund yourself',
        outcomes: [
          {
            chance: 1,
            text: 'It is the dullest decision of your life. Over the years it is also one of the best.',
            effects: [{ wealth: 0.01 }, { stat: 'stress', delta: -2 }],
          },
        ],
      },
    ],
  },

  // ---------- Rich ----------
  {
    id: 'cl_rich_admirer',
    kind: 'choice',
    category: 'social',
    emoji: '🥂',
    ages: [18, 90],
    weight: 6,
    cooldownYears: 6,
    adultsOnly: true,
    when: all(rich, single),
    text: 'At a party, a strikingly attractive stranger laughs at all your jokes, including the one about tax. By the end of the night they know your boat’s name and you do not know their surname.',
    choices: [
      {
        id: 'see',
        label: 'See where it goes',
        outcomes: [
          {
            chance: 0.4,
            text: 'Against your accountant’s expectations, they turn out to like you more than the boat. It is a slow, lovely surprise.',
            effects: [{ status: 'meet' }, { stat: 'happiness', delta: 8 }],
            success: true,
          },
          {
            chance: 0.6,
            text: 'Six expensive months of weekends away end with a request to fund their “creative studio”. When you say no, they leave with the good watch.',
            effects: [
              { wealth: -0.005 },
              { stat: 'happiness', delta: -7 },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'test',
        label: 'Say you are just the boat’s skipper',
        outcomes: [
          {
            chance: 0.35,
            text: 'They are disappointed for exactly one drink, then ask about the sea. When you confess, they laugh until they cry. You keep seeing each other.',
            effects: [{ status: 'meet' }, { stat: 'happiness', delta: 7 }],
            success: true,
          },
          {
            chance: 0.65,
            text: 'Their interest evaporates mid-sentence. They suddenly remember an early start, and you have your answer.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'polite',
        label: 'Keep it charming and go home alone',
        outcomes: [
          {
            chance: 1,
            text: 'You say goodnight at the door. It is the sensible choice, and sensible choices are lonely company in a very large house.',
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
    id: 'cl_rich_gala',
    kind: 'choice',
    category: 'social',
    emoji: '🎩',
    ages: [25, 90],
    weight: 6,
    cooldownYears: 4,
    when: rich,
    text: 'A charity gala, a ballroom of black ties, and an auctioneer selling a week in a lighthouse. Across the room a property developer you cannot stand raises a paddle.',
    choices: [
      {
        id: 'war',
        label: 'Outbid the developer, whatever it costs',
        outcomes: [
          {
            chance: 1,
            text: 'The bidding gets silly, then historic. You win a week in a lighthouse for the price of a lighthouse, and the room applauds you and the charity.',
            effects: [
              { wealth: -0.01 },
              { fame: 3 },
              { stat: 'karma', delta: 4 },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'quiet',
        label: 'Skip the auction and write a cheque',
        outcomes: [
          {
            chance: 1,
            text: 'You find the director by the coats and hand over a cheque that funds the whole programme for a year. The developer gets the lighthouse and none of the credit.',
            effects: [
              { wealth: -0.008 },
              { stat: 'karma', delta: 8 },
              { stat: 'happiness', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'bar',
        label: 'Spend the evening at the bar',
        outcomes: [
          {
            chance: 1,
            text: 'The canapés are tiny and the speeches are long. A gossip column notes that you “clapped politely and gave nothing”.',
            effects: [{ fame: -1 }, { stat: 'karma', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'cl_rich_offshore',
    kind: 'choice',
    category: 'money',
    emoji: '🏝️',
    ages: [25, 90],
    weight: 6,
    cooldownYears: 10,
    when: rich,
    text: 'Your accountant draws a diagram of boxes and arrows ending on a sunny island. “Entirely legal,” she says, and then, after a beat, “for now.”',
    choices: [
      {
        id: 'do',
        label: 'Set up the structure',
        outcomes: [
          {
            chance: 1,
            text: 'Papers are signed in three countries. Your tax bill shrinks dramatically, and a small, stubborn part of you files a complaint.',
            effects: [
              { wealth: 0.03 },
              { stat: 'karma', delta: -8 },
              { flag: 'offshore_structure' },
            ],
            next: { eventId: 'cl_rich_offshore_leak', inYears: [3, 8] },
          },
        ],
      },
      {
        id: 'pay',
        label: 'Pay what you owe at home',
        outcomes: [
          {
            chance: 1,
            text: 'You pay in full, with a slightly self-righteous signature. The accountant shrugs and bills you for the diagram.',
            effects: [
              { stat: 'karma', delta: 6 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'dull',
        label: 'Ask for something legal and boring',
        outcomes: [
          {
            chance: 1,
            text: 'Pensions, donations and an ordinary trust. You save a decent amount and never once have to look up an island’s flag.',
            effects: [{ wealth: 0.01 }, { stat: 'stress', delta: -2 }],
            success: true,
          },
        ],
      },
    ],
  },
  {
    id: 'cl_rich_offshore_leak',
    kind: 'notice',
    category: 'money',
    emoji: '📰',
    ages: [25, 95],
    weight: 1,
    chainOnly: true,
    text: 'A newspaper gets hold of a hard drive full of offshore paperwork.',
    outcomes: [
      {
        chance: 0.45,
        text: 'Your name is on page six, between a footballer and a bishop. Everything was legal; nobody cares. You give a large donation and a short, sorry statement.',
        effects: [
          { fame: 3 },
          { stat: 'karma', delta: -3 },
          { stat: 'stress', delta: 10 },
          { wealth: -0.02 },
          { unflag: 'offshore_structure' },
        ],
      },
      {
        chance: 0.55,
        text: 'Your boxes and arrows are buried too deep to make the story. You read the coverage over breakfast with a feeling you decide to call relief.',
        effects: [{ stat: 'stress', delta: 4 }],
      },
    ],
  },
  {
    id: 'cl_rich_paparazzi',
    kind: 'choice',
    category: 'social',
    emoji: '📸',
    ages: [25, 90],
    weight: 5,
    cooldownYears: 5,
    when: rich,
    text: 'Halfway through a quiet birthday dinner, the maître d’ leans over to murmur that there are photographers outside. Someone in the kitchen has been chatty.',
    choices: [
      {
        id: 'wave',
        label: 'Walk out the front and smile',
        outcomes: [
          {
            chance: 1,
            text: 'You give them a good photo and a polite nod. The picture runs with a caption that calls you “relaxed”, which you are not.',
            effects: [{ fame: 2 }, { stat: 'stress', delta: 2 }],
          },
        ],
      },
      {
        id: 'kitchen',
        label: 'Leave through the kitchen',
        outcomes: [
          {
            chance: 0.7,
            text: 'You slip out past the bins, thank the dishwasher, and leave a tip that becomes legend among the kitchen staff.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'karma', delta: 2 },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'There is a photographer by the bins, too. The picture of you crouched behind a wheelie bin is the best-selling one of the week.',
            effects: [{ fame: 3 }, { stat: 'happiness', delta: -5 }],
          },
        ],
      },
      {
        id: 'confront',
        label: 'Have words with them',
        outcomes: [
          {
            chance: 1,
            text: 'Your words are captured from several angles. A clip of you saying “Do you not have homes?” has a long and successful life without you.',
            effects: [{ fame: 4 }, { notoriety: 2 }, { stat: 'stress', delta: 6 }],
          },
        ],
      },
    ],
  },
  {
    id: 'cl_rich_relative',
    kind: 'choice',
    category: 'family',
    emoji: '💼',
    ages: [30, 95],
    weight: 6,
    cooldownYears: 6,
    when: rich,
    bind: { kin: { role: 'nibling', minAge: 20 } },
    text: '{kin.first} arrives with a laptop and a business idea: subscription socks for dogs. It is described as an investment opportunity, not a favour. It is a favour.',
    choices: [
      {
        id: 'invest',
        label: 'Back the dog socks',
        outcomes: [
          {
            chance: 0.25,
            text: 'Against all reason, the dog socks catch on. {kin.first} pays you back with interest and a framed first pair.',
            effects: [
              { wealth: 0.003 },
              { rel: 'kin', delta: 14, memory: 'backing the dog socks' },
              { stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
          {
            chance: 0.75,
            text: 'The dogs, it turns out, do not want socks. {kin.first} is mortified, and you tell them it was the best money you ever lost.',
            effects: [
              { wealth: -0.004 },
              { rel: 'kin', delta: 8, memory: 'the dog socks that did not sell' },
            ],
          },
        ],
      },
      {
        id: 'mentor',
        label: 'Offer advice and introductions, not money',
        outcomes: [
          {
            chance: 1,
            text: 'You spend an afternoon tearing the plan apart kindly. {kin.first} leaves deflated, and comes back a year later with a better idea.',
            effects: [
              { rel: 'kin', delta: 4, memory: 'the afternoon of hard questions' },
              { stat: 'karma', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'no',
        label: 'Say no, firmly',
        outcomes: [
          {
            chance: 1,
            text: 'The family hears about it by dinner. You are described, at three separate tables, as having “changed”.',
            effects: [
              { rel: 'kin', delta: -10, memory: 'the time you would not back them' },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cl_rich_staff',
    kind: 'choice',
    category: 'family',
    emoji: '🧑‍🍳',
    ages: [25, 95],
    weight: 5,
    cooldownYears: 5,
    when: rich,
    text: 'Your chef and your housekeeper are no longer speaking. The cold war began over a saucepan and has now spread to the laundry room and the garden.',
    choices: [
      {
        id: 'mediate',
        label: 'Sit them both down and mediate',
        outcomes: [
          {
            chance: (s) => 0.4 + s.player.stats.smarts / 300,
            text: 'An hour at the kitchen table, two apologies and one new saucepan. Peace returns, and so does the good bread.',
            effects: [
              { stat: 'stress', delta: -4 },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The meeting becomes a forty-minute history of the saucepan. Both of them hand in their notice by Friday.',
            effects: [
              { stat: 'stress', delta: 7 },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'raise',
        label: 'Give everyone a pay rise and a holiday',
        outcomes: [
          {
            chance: 1,
            text: 'Generosity papers over the saucepan. Everyone comes back tanned and surprisingly civil to each other.',
            effects: [
              { wealth: -0.001 },
              { stat: 'karma', delta: 3 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'stay_out',
        label: 'Stay out of it entirely',
        outcomes: [
          {
            chance: 1,
            text: 'You eat out for a month to avoid the kitchen. The saucepan, meanwhile, goes missing for good.',
            effects: [{ stat: 'stress', delta: 3 }],
          },
        ],
      },
    ],
  },

  // ---------- Absurdly rich ----------
  {
    id: 'cl_ultra_campaign',
    kind: 'choice',
    category: 'money',
    emoji: '🏛️',
    ages: [30, 95],
    weight: 6,
    cooldownYears: 6,
    when: ultra,
    text: 'A candidate for high office would like twenty minutes of your time, and rather more of your money. Their adviser says the word “access” like it is a gift.',
    choices: [
      {
        id: 'fund',
        label: 'Fund the campaign',
        outcomes: [
          {
            chance: 0.5,
            text: 'They win. Your calls get returned faster, and you start getting invited to things with flags. Nobody calls it a favour, out loud.',
            effects: [
              { wealth: -0.002 },
              { fame: 3 },
              { stat: 'karma', delta: -3 },
              { flag: 'political_donor' },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'They lose, badly, and the winner remembers who paid for the posters. Your next planning application takes a very long time.',
            effects: [
              { wealth: -0.002 },
              { stat: 'stress', delta: 6 },
              { flag: 'political_donor' },
            ],
          },
        ],
      },
      {
        id: 'both',
        label: 'Quietly fund both sides',
        outcomes: [
          {
            chance: 1,
            text: 'Whoever wins, you have a friend. It is very clever, and you find you cannot quite look at yourself while shaving.',
            effects: [
              { wealth: -0.004 },
              { stat: 'karma', delta: -7 },
              { flag: 'political_donor' },
            ],
          },
        ],
      },
      {
        id: 'no',
        label: 'Keep out of politics',
        outcomes: [
          {
            chance: 1,
            text: 'You send your regards and nothing else. The adviser looks at you like an unsolved puzzle.',
            effects: [{ stat: 'karma', delta: 3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'cl_ultra_sovereign',
    kind: 'choice',
    category: 'money',
    emoji: '🌐',
    ages: [30, 95],
    weight: 5,
    cooldownYears: 8,
    when: ultra,
    text: 'A sovereign wealth fund wants a stake in your holdings. The meeting is in a glass tower, the coffee is gold-leafed, and the country behind the fund has a human rights record your lawyers describe as “complex”.',
    choices: [
      {
        id: 'take',
        label: 'Take their money',
        outcomes: [
          {
            chance: 1,
            text: 'The deal closes in a week. Your fortune swells and a columnist writes that you have sold your soul at a fair valuation.',
            effects: [{ wealth: 0.05 }, { stat: 'karma', delta: -6 }, { fame: 2 }],
          },
        ],
      },
      {
        id: 'haggle',
        label: 'Negotiate hard for a smaller stake',
        outcomes: [
          {
            chance: (s) => 0.35 + s.player.stats.smarts / 300,
            text: 'You give them less and get more. The fund’s negotiator sends a gold-leafed note of grudging respect.',
            effects: [
              { wealth: 0.03 },
              { stat: 'karma', delta: -3 },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'They walk, politely, and buy a stake in your nearest rival instead. You watch your rival get a very nice coffee.',
            effects: [{ stat: 'stress', delta: 5 }],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Decline, gracefully',
        outcomes: [
          {
            chance: 1,
            text: 'You thank them for the coffee and leave the tower. Your board is furious for a quarter and proud of you after a decade.',
            effects: [
              { stat: 'karma', delta: 6 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cl_ultra_mooring',
    kind: 'choice',
    category: 'social',
    emoji: '🛥️',
    ages: [30, 95],
    weight: 5,
    cooldownYears: 6,
    when: ultra,
    text: 'You arrive at the marina to find a larger superyacht in your mooring. Its owner, a shipping magnate with an enormous hat, says it is his mooring, actually.',
    choices: [
      {
        id: 'yield',
        label: 'Anchor out in the bay instead',
        outcomes: [
          {
            chance: 1,
            text: 'You anchor in the bay, swim off the back every morning, and have the best week of the summer. The magnate spends his on the phone to lawyers.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: -4 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'lawyers',
        label: 'Set the lawyers on him',
        outcomes: [
          {
            chance: 1,
            text: 'Two firms, eleven letters and a harbourmaster close to tears. You win the mooring the week the season ends.',
            effects: [
              { wealth: -0.0005 },
              { stat: 'stress', delta: 6 },
              { status: 'enemy', first: 'Aurelio', age: 64 },
            ],
          },
        ],
      },
      {
        id: 'buy',
        label: 'Buy the marina',
        outcomes: [
          {
            chance: 1,
            text: 'By lunchtime you own the marina. By teatime his yacht has been moved, very courteously, to the fuel dock. The local paper calls it pettiness on a historic scale.',
            effects: [
              { wealth: -0.01 },
              { fame: 4 },
              { stat: 'happiness', delta: 5 },
              { stat: 'karma', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cl_ultra_commencement',
    kind: 'choice',
    category: 'social',
    emoji: '🎓',
    ages: [35, 95],
    weight: 5,
    once: true,
    when: ultra,
    text: 'A grand old university asks you to give the commencement speech, along with an honorary doctorate and a gown that makes you look like a disappointed owl.',
    choices: [
      {
        id: 'honest',
        label: 'Tell them how much luck was involved',
        outcomes: [
          {
            chance: 0.6,
            text: 'You talk about luck, the people who helped, and the ones who did not get the breaks. A graduate in the front row cries, and the clip is quoted for years.',
            effects: [{ fame: 4 }, { stat: 'karma', delta: 5 }, { stat: 'happiness', delta: 7 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You mean it, but it comes out as a billionaire telling broke graduates that money is not everything. The applause is thin and careful.',
            effects: [{ fame: 1 }, { stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'script',
        label: 'Read the speech your team wrote',
        outcomes: [
          {
            chance: 1,
            text: 'You say “follow your passion” three times and get through it without incident. Nobody remembers a word by the car park.',
            effects: [{ fame: 1 }],
          },
        ],
      },
      {
        id: 'cheque',
        label: 'Decline, and pay off the class’s debts',
        outcomes: [
          {
            chance: 1,
            text: 'You send a short letter and a very long cheque. The class never hears you speak, and never forgets your name.',
            effects: [
              { wealth: -0.005 },
              { fame: 6 },
              { stat: 'karma', delta: 12 },
              { stat: 'happiness', delta: 8 },
            ],
            success: true,
          },
        ],
      },
    ],
  },
  {
    id: 'cl_ultra_security',
    kind: 'choice',
    category: 'family',
    emoji: '🛡️',
    ages: [25, 95],
    weight: 5,
    cooldownYears: 6,
    when: ultra,
    text: 'Your head of security asks for a quiet word. A man has been photographing your gate, your car and, last Tuesday, your dentist’s waiting room.',
    choices: [
      {
        id: 'double',
        label: 'Double the security team',
        outcomes: [
          {
            chance: 1,
            text: 'The man is found, warned and gone within a fortnight. You now cannot buy a newspaper without four people and a van.',
            effects: [
              { wealth: -0.001 },
              { stat: 'stress', delta: -3 },
              { stat: 'happiness', delta: -2 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'carry_on',
        label: 'Carry on as normal',
        outcomes: [
          {
            chance: 0.7,
            text: 'He turns out to be a hopeful biographer with no publisher. You let him have one interview and he goes away happy.',
            effects: [{ stat: 'stress', delta: 2 }],
            success: true,
          },
          {
            chance: 0.3,
            text: 'One evening he is waiting by your car. Your driver steps in, there is a scuffle, and you spend a long night giving statements.',
            effects: [
              { injury: 3 },
              { stat: 'stress', delta: 12 },
              { stat: 'happiness', delta: -6 },
            ],
          },
        ],
      },
      {
        id: 'away',
        label: 'Take the family abroad for a season',
        outcomes: [
          {
            chance: 1,
            text: 'Six months on an island with no road signs. The threat fades, everyone learns to sail, and you forget, briefly, what you are worth.',
            effects: [
              { wealth: -0.002 },
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: -6 },
            ],
          },
        ],
      },
    ],
  },
];
