import type { EventDef } from '../../engine/events/types';
import type { GameState } from '../../engine/types';

const tier =
  (...t: string[]) =>
  (s: GameState): boolean =>
    t.includes(s.player.wealth) && !s.legal.prison;
const poor = tier('poor');
const working = tier('working');
const middle = tier('middle');
const comfy = tier('comfortable');
const rich = tier('rich');
const school = (s: GameState): string | undefined => s.upbringing?.school;
const privateSchool = (s: GameState): boolean =>
  school(s) === 'private' || school(s) === 'boarding';
const boarding = (s: GameState): boolean => school(s) === 'boarding';

/** Growing up, by class: what a family's money looks like from three feet off the ground. */
export const CHILDHOOD_CLASS_EVENTS: EventDef[] = [
  // ---------- Poor ----------
  {
    id: 'cc_poor_free_meals',
    kind: 'choice',
    category: 'school',
    emoji: '🍽️',
    ages: [6, 15],
    weight: 7,
    cooldownYears: 5,
    when: poor,
    text: 'The free-lunch kids get a different coloured ticket. Everyone knows what the green ticket means, and today someone in the queue behind you says it out loud.',
    choices: [
      {
        id: 'stare',
        label: 'Turn round and stare until they look away',
        outcomes: [
          {
            chance: 0.6,
            text: 'They look away first. You eat your shepherd’s pie slowly, like a king.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'discipline', delta: 2 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'They laugh, and two friends join in. The pie tastes of nothing at all.',
            effects: [
              { stat: 'happiness', delta: -5 },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'skip',
        label: 'Leave the queue and skip lunch',
        outcomes: [
          {
            chance: 1,
            text: 'You spend lunch in the library pretending to read about volcanoes. By maths your stomach is louder than the teacher.',
            effects: [
              { stat: 'health', delta: -2 },
              { stat: 'smarts', delta: 1 },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cc_poor_hand_me_down_shoes',
    kind: 'notice',
    category: 'family',
    emoji: '👟',
    ages: [5, 12],
    weight: 6,
    cooldownYears: 4,
    when: poor,
    bind: { sib: { role: 'sibling' } },
    text: 'You inherit {sib.first}’s old school shoes. They are a size too big and have {sib.their} name inside in biro, which you cross out and write over.',
    outcomes: [
      {
        chance: 1,
        text: 'Two pairs of socks fix the size. Nothing fixes the name, which still shows through yours like a ghost.',
        effects: [
          { stat: 'happiness', delta: -2 },
          { rel: 'sib', delta: 2, memory: 'the shoes that went down the family' },
        ],
      },
    ],
  },
  {
    id: 'cc_poor_lights_out',
    kind: 'choice',
    category: 'family',
    emoji: '🕯️',
    ages: [5, 14],
    weight: 6,
    cooldownYears: 5,
    when: poor,
    bind: { mum: { role: 'mother' } },
    text: 'The electricity goes off mid-cartoon and does not come back. {mum.first} lights candles and says it is an adventure, in a voice that is trying very hard.',
    choices: [
      {
        id: 'play',
        label: 'Make it an adventure',
        outcomes: [
          {
            chance: 1,
            text: 'Shadow puppets, a tin of beans heated on the camping stove, everyone under one duvet. Years later it is somehow a good memory.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { rel: 'mum', delta: 5, memory: 'the candlelight night when the power went' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'ask',
        label: 'Ask why the lights went off',
        outcomes: [
          {
            chance: 1,
            text: '{mum.first} tells you the truth, gently. You understand more about bills than any eight-year-old should, and you stop asking for things for a while.',
            effects: [
              { stat: 'stress', delta: 5 },
              { stat: 'smarts', delta: 1 },
              { rel: 'mum', delta: 2, memory: 'telling you the truth about the bills' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cc_poor_two_jobs',
    kind: 'notice',
    category: 'family',
    emoji: '🌙',
    ages: [6, 16],
    weight: 6,
    cooldownYears: 5,
    when: poor,
    bind: { dad: { role: 'father' } },
    text: '{dad.first} has taken a second job. He leaves before you wake and comes in after you are asleep, and you learn him mostly from the cup left in the sink.',
    outcomes: [
      {
        chance: 1,
        text: 'On Sundays he sleeps until noon, and you sit on the end of the bed so you are the first thing he sees.',
        effects: [
          { stat: 'happiness', delta: -3 },
          { rel: 'dad', delta: 3, memory: 'the year of two jobs, and you waiting on Sundays' },
        ],
      },
    ],
  },
  {
    id: 'cc_poor_school_trip',
    kind: 'choice',
    category: 'school',
    emoji: '🚌',
    ages: [8, 15],
    weight: 6,
    cooldownYears: 4,
    when: poor,
    text: 'The letter about the residential trip comes home in your bag. There is a cost at the bottom, and a small box to tick if your family “would like to discuss support”.',
    choices: [
      {
        id: 'bin',
        label: 'Put the letter in the bin before anyone sees',
        outcomes: [
          {
            chance: 1,
            text: 'You tell everyone you didn’t want to go anyway. The week they are away the school is very quiet, and so are you.',
            effects: [
              { stat: 'happiness', delta: -5 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'box',
        label: 'Show it to your parents, box and all',
        outcomes: [
          {
            chance: 0.6,
            text: 'The box gets ticked. A fund nobody mentions out loud pays for it, and you come back muddy, sunburnt and with a new best friend.',
            effects: [{ stat: 'happiness', delta: 7 }, { status: 'friend' }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Your parents look at the letter for a long time. Even with help it can’t be done this year. They are sorrier than you are.',
            effects: [{ stat: 'happiness', delta: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'cc_poor_cheaper_flat',
    kind: 'notice',
    category: 'family',
    emoji: '📦',
    ages: [5, 16],
    weight: 5,
    cooldownYears: 6,
    when: poor,
    text: 'The family moves to a smaller flat across town. The new bedroom has a damp patch shaped like Italy and you share it now, but the man downstairs has a tortoise.',
    outcomes: [
      {
        chance: 1,
        text: 'You learn the tortoise is called Gerald and is older than your parents. It helps more than you would have guessed.',
        effects: [
          { stat: 'stress', delta: 4 },
          { stat: 'health', delta: -1 },
          { stat: 'happiness', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'cc_poor_teacher_sandwich',
    kind: 'choice',
    category: 'school',
    emoji: '🥪',
    ages: [6, 13],
    weight: 6,
    cooldownYears: 5,
    when: poor,
    text: 'Your teacher notices you have no lunch again. At break there is a cheese sandwich on your desk in a paper bag, and she is very busy looking out of the window.',
    choices: [
      {
        id: 'eat',
        label: 'Eat it and say nothing',
        outcomes: [
          {
            chance: 1,
            text: 'It is the best sandwich ever made. A sandwich appears most Tuesdays after that, and nobody ever mentions it.',
            effects: [
              { stat: 'health', delta: 2 },
              { stat: 'happiness', delta: 4 },
              { stat: 'karma', delta: 1 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'thank',
        label: 'Make her a thank-you card',
        outcomes: [
          {
            chance: 1,
            text: 'She keeps the card pinned behind her desk for the rest of her career. You don’t find that out for thirty years.',
            effects: [
              { stat: 'health', delta: 2 },
              { stat: 'happiness', delta: 3 },
              { stat: 'karma', delta: 3 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'proud',
        label: 'Leave it there; you’re not a charity case',
        outcomes: [
          {
            chance: 1,
            text: 'The sandwich sits there all afternoon, and so does your pride. Both are a bit stale by home time.',
            effects: [
              { stat: 'health', delta: -1 },
              { stat: 'discipline', delta: 2 },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cc_poor_market_stall',
    kind: 'choice',
    category: 'money',
    emoji: '🧺',
    ages: [8, 15],
    weight: 6,
    cooldownYears: 4,
    when: poor,
    bind: { mum: { role: 'mother' } },
    text: 'On Saturdays you help {mum.first} sell bric-a-brac at the market: chipped mugs, a lamp shaped like a swan, someone’s whole record collection. She says you have the face for it.',
    choices: [
      {
        id: 'patter',
        label: 'Do the patter',
        outcomes: [
          {
            chance: 0.6,
            text: 'You sell the swan lamp to a man who did not want a swan lamp. {mum.first} gives you a cut and calls you a natural.',
            effects: [
              { money: 15 },
              { stat: 'happiness', delta: 4 },
              { rel: 'mum', delta: 4, memory: 'you selling the swan lamp' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You talk a woman down to half price on a teapot by accident. {mum.first} laughs until she has to sit on the cool box.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { rel: 'mum', delta: 3, memory: 'the teapot you haggled the wrong way' },
            ],
          },
        ],
      },
      {
        id: 'mind',
        label: 'Mind the cash tin and read',
        outcomes: [
          {
            chance: 1,
            text: 'You read three library books in the shade of the stall and can add up change faster than the till at the bakery.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { rel: 'mum', delta: 1, memory: 'Saturdays at the market' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cc_poor_coat',
    kind: 'choice',
    category: 'school',
    emoji: '🧥',
    ages: [9, 15],
    weight: 6,
    cooldownYears: 4,
    when: poor,
    text: 'Your winter coat is from the charity shop and a girl in your class recognises it as the one she gave away. She tells everyone, loudly, at the coat pegs.',
    choices: [
      {
        id: 'own',
        label: '“It looks better on me”',
        outcomes: [
          {
            chance: 0.55,
            text: 'A couple of people laugh, with you this time. It is not quite a win but it is a long way from a loss.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { stat: 'looks', delta: 1 },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'Nobody laughs, and the nickname “Second-Hand” follows you around until the summer.',
            effects: [
              { stat: 'happiness', delta: -5 },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'hide',
        label: 'Leave the coat at home and go cold',
        outcomes: [
          {
            chance: 1,
            text: 'You shiver through December in a jumper. You also catch every cold going round, and some that weren’t.',
            effects: [
              { stat: 'health', delta: -4 },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
    ],
  },

  // ---------- Working class ----------
  {
    id: 'cc_work_night_shifts',
    kind: 'choice',
    category: 'family',
    emoji: '🌃',
    ages: [5, 14],
    weight: 6,
    cooldownYears: 5,
    when: working,
    bind: { mum: { role: 'mother' } },
    text: '{mum.first} is on nights this month. The whole house tiptoes all day, and the telly is on with the sound off and the subtitles on.',
    choices: [
      {
        id: 'quiet',
        label: 'Become the quietest child alive',
        outcomes: [
          {
            chance: 1,
            text: 'You master the silent biscuit and the stealth flush. {mum.first} wakes up rested and makes your favourite tea.',
            effects: [
              { stat: 'discipline', delta: 3 },
              { rel: 'mum', delta: 4, memory: 'the month you were silent for her' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'note',
        label: 'Leave her notes on the kitchen table',
        outcomes: [
          {
            chance: 1,
            text: 'Drawings, a joke, a list of what the cat did. She finds them at three in the morning and keeps every single one.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { skill: 'writing', delta: 2 },
              { rel: 'mum', delta: 6, memory: 'your notes on the kitchen table' },
            ],
            success: true,
          },
        ],
      },
    ],
  },
  {
    id: 'cc_work_caravan',
    kind: 'notice',
    category: 'family',
    emoji: '🏕️',
    ages: [5, 13],
    weight: 6,
    cooldownYears: 4,
    when: working,
    text: 'A week at a caravan park by the sea. It rains six days out of seven, the caravan smells of gas and wet dogs, and there is a clubhouse with a talent night.',
    outcomes: [
      {
        chance: 1,
        text: 'On the seventh day the sun comes out and you swim until your lips go blue. It is the best holiday anyone has ever had.',
        texts: [
          'You win a goldfish at the arcade and a plastic medal at the talent night, both for things you would not admit to now.',
        ],
        effects: [
          { stat: 'happiness', delta: 6 },
          { stat: 'health', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'cc_work_laid_off',
    kind: 'choice',
    category: 'family',
    emoji: '🏭',
    ages: [8, 17],
    weight: 5,
    cooldownYears: 6,
    when: working,
    bind: { dad: { role: 'father' } },
    text: 'The factory is closing. {dad.first} comes home at lunchtime on a Wednesday and sits in the car on the drive for twenty minutes before he comes in.',
    choices: [
      {
        id: 'sit',
        label: 'Go and sit in the car with him',
        outcomes: [
          {
            chance: 1,
            text: 'Neither of you says much. He puts the radio on, and you listen to a whole football phone-in about a team neither of you supports.',
            effects: [
              { stat: 'stress', delta: 3 },
              {
                rel: 'dad',
                delta: 7,
                memory: 'sitting with him in the car the day the factory shut',
              },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'savings',
        label: 'Offer him your savings',
        outcomes: [
          {
            chance: 1,
            text: 'He looks at the jam jar of coins for a long time, then puts it back in your hands. Something in his face settles.',
            effects: [
              { stat: 'karma', delta: 3 },
              { stat: 'stress', delta: 2 },
              { rel: 'dad', delta: 5, memory: 'the jam jar you offered him' },
            ],
          },
        ],
      },
      {
        id: 'keep_out',
        label: 'Stay in your room with the door shut',
        outcomes: [
          {
            chance: 1,
            text: 'You hear voices through the floor, low and tired, for most of the evening. You turn your music up.',
            effects: [{ stat: 'stress', delta: 6 }],
          },
        ],
      },
    ],
  },
  {
    id: 'cc_work_car_on_drive',
    kind: 'choice',
    category: 'family',
    emoji: '🔩',
    ages: [9, 17],
    weight: 6,
    cooldownYears: 4,
    when: working,
    bind: { dad: { role: 'father' } },
    text: '{dad.first} is under the car on the drive again and needs someone to pass the spanners. “The ten. No, the ten. That’s a twelve.”',
    choices: [
      {
        id: 'help',
        label: 'Get your hands dirty',
        outcomes: [
          {
            chance: 1,
            text: 'By dusk you know what a spark plug is and have oil in places soap won’t reach. He tells the neighbour you did the hard bit.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { stat: 'happiness', delta: 3 },
              { rel: 'dad', delta: 5, memory: 'passing the spanners on the drive' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'excuse',
        label: 'Say you have homework',
        outcomes: [
          {
            chance: 1,
            text: 'You do actually do the homework, which surprises everyone. The swearing from the drive is educational in its own way.',
            effects: [
              { stat: 'smarts', delta: 1 },
              { rel: 'dad', delta: -1, memory: 'the Saturday you were too busy' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cc_work_street_football',
    kind: 'choice',
    category: 'family',
    emoji: '⚽',
    ages: [6, 14],
    weight: 7,
    cooldownYears: 3,
    when: working,
    text: 'Football in the street until the lights come on: jumpers for posts, cars as defenders, and Mrs Okafor at number twelve, who keeps every ball over her fence.',
    choices: [
      {
        id: 'play',
        label: 'Play until you’re called in',
        outcomes: [
          {
            chance: 1,
            text: 'You score a goal off a parked van that you will describe for the rest of your life. Your knees are a map of the pavement.',
            effects: [
              { skill: 'athletics', delta: 3 },
              { stat: 'health', delta: 2 },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'ball',
        label: 'Knock on number twelve for the balls',
        outcomes: [
          {
            chance: 0.5,
            text: 'Mrs Okafor opens the shed: nine footballs and a frisbee. She hands them over with a lecture and a biscuit. You are a legend.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'karma', delta: 1 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'She opens the door, looks at you, and closes it again without a word. You run home and do not stop until you are inside.',
            effects: [{ stat: 'stress', delta: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'cc_work_saving_up',
    kind: 'choice',
    category: 'money',
    emoji: '🫙',
    ages: [7, 14],
    weight: 6,
    cooldownYears: 5,
    when: working,
    text: 'There is a bike in the shop window with gears and a bell, and you have decided it is yours. At your pocket-money rate you will have it in a little under a year.',
    choices: [
      {
        id: 'save',
        label: 'Save every penny',
        outcomes: [
          {
            chance: 1,
            text: 'Fifty weeks of no sweets later you walk into the shop with a jam jar. It is the best thing you have ever owned, because you own it.',
            effects: [
              { stat: 'discipline', delta: 5 },
              { stat: 'happiness', delta: 5 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'chores',
        label: 'Take on extra jobs for the neighbours',
        outcomes: [
          {
            chance: 1,
            text: 'You wash four cars and walk a dog with opinions. You get the bike by spring and a reputation as the hardest-working kid on the street.',
            effects: [
              { stat: 'discipline', delta: 3 },
              { stat: 'happiness', delta: 4 },
              { stat: 'karma', delta: 1 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'spend',
        label: 'Give up and buy sweets',
        outcomes: [
          {
            chance: 1,
            text: 'The sweets are excellent. The bike is sold to a boy from the year above, who rides it past your house slowly.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { stat: 'health', delta: -1 },
            ],
          },
        ],
      },
    ],
  },

  // ---------- Middle ----------
  {
    id: 'cc_mid_estate_car_trip',
    kind: 'choice',
    category: 'family',
    emoji: '🚗',
    ages: [5, 13],
    weight: 6,
    cooldownYears: 4,
    when: middle,
    bind: { dad: { role: 'father' } },
    text: 'Seven hours in the estate car to the coast, with a roof box, a cool bag of sandwiches and {dad.first}’s rule that you don’t stop until half-way.',
    choices: [
      {
        id: 'games',
        label: 'Run the car games',
        outcomes: [
          {
            chance: 1,
            text: 'Twenty questions, number-plate bingo and a song with too many verses. Even {dad.first} joins in by the motorway services.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { rel: 'dad', delta: 4, memory: 'the long drive to the coast' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'ask',
        label: 'Ask “are we nearly there” every ten minutes',
        outcomes: [
          {
            chance: 1,
            text: 'You are not nearly there. You are told so thirty-one times, with decreasing patience, and then made to count cows.',
            effects: [
              { stat: 'happiness', delta: 1 },
              { rel: 'dad', delta: -2, memory: 'thirty-one questions on the motorway' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cc_mid_piano',
    kind: 'choice',
    category: 'family',
    emoji: '🎹',
    ages: [6, 13],
    weight: 6,
    cooldownYears: 5,
    when: middle,
    bind: { mum: { role: 'mother' } },
    text: '{mum.first} has booked you piano lessons with a woman who smells of lavender and owns a metronome that sounds like a ticking bomb. You did not ask for this.',
    choices: [
      {
        id: 'practise',
        label: 'Practise properly',
        outcomes: [
          {
            chance: 1,
            text: 'Scales, then a minuet, then something you actually like. By the end of the year your hands know things your brain doesn’t.',
            effects: [
              { skill: 'instrument', delta: 6 },
              { stat: 'discipline', delta: 3 },
              { rel: 'mum', delta: 3, memory: 'the first recital' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'fake',
        label: 'Leave a recording playing and read comics',
        outcomes: [
          {
            chance: 0.5,
            text: 'It works for three weeks, until the tape plays the same mistake in the same place for the fifth time and {mum.first} opens the door.',
            effects: [
              { stat: 'happiness', delta: 1 },
              { rel: 'mum', delta: -3, memory: 'the fake piano practice' },
            ],
          },
          {
            chance: 0.5,
            text: 'Nobody notices. You get very good at comics and remain very bad at the piano, which seems fair.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { skill: 'instrument', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'quit',
        label: 'Ask to stop',
        outcomes: [
          {
            chance: 1,
            text: '{mum.first} sighs and agrees. When you are forty you will wish she hadn’t, and you will tell her so.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { rel: 'mum', delta: -1, memory: 'the piano you gave up' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cc_mid_birthday_party',
    kind: 'notice',
    category: 'family',
    emoji: '🎂',
    ages: [5, 10],
    weight: 6,
    cooldownYears: 4,
    when: middle,
    text: 'Your birthday party is in the back garden: a bouncy castle on a slope, party bags lined up on the patio, and a hired entertainer who is clearly having a hard week.',
    outcomes: [
      {
        chance: 1,
        text: 'Somebody is sick on the bouncy castle, the entertainer’s rabbit escapes into next door’s hedge, and it is perfect.',
        texts: [
          'The cake is a castle that collapses in the heat. You eat the rubble with your hands and nobody stops you.',
        ],
        effects: [{ stat: 'happiness', delta: 5 }],
      },
    ],
  },
  {
    id: 'cc_mid_school_worry',
    kind: 'choice',
    category: 'school',
    emoji: '🏫',
    ages: [9, 11],
    weight: 6,
    cooldownYears: 5,
    when: middle,
    bind: { mum: { role: 'mother' } },
    text: 'Your parents talk about secondary schools in the kitchen in serious voices: catchment areas, league tables, whether to rent a flat near the good one. You are the subject and nobody asks you.',
    choices: [
      {
        id: 'speak',
        label: 'Walk in and say where you want to go',
        outcomes: [
          {
            chance: 1,
            text: 'They stop and listen. You want the one your friends are going to. They don’t say yes, but they write it on the list.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { rel: 'mum', delta: 3, memory: 'you speaking up about schools' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'listen',
        label: 'Listen from the stairs',
        outcomes: [
          {
            chance: 1,
            text: 'You hear the word “future” eleven times. You go to bed worried about a test you didn’t know existed.',
            effects: [
              { stat: 'stress', delta: 4 },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cc_mid_scout_camp',
    kind: 'choice',
    category: 'family',
    emoji: '⛺',
    ages: [8, 14],
    weight: 6,
    cooldownYears: 4,
    when: middle,
    text: 'Scout camp in a field in the hills. Your tent has been pitched by eleven-year-olds and leans like it has had a long day.',
    choices: [
      {
        id: 'badge',
        label: 'Go for the fire-lighting badge',
        outcomes: [
          {
            chance: 0.6,
            text: 'One match, a bird’s nest of dry grass, and a small, proud flame. You cook a sausage on it that is black outside and raw inside, and eat the lot.',
            effects: [
              { stat: 'discipline', delta: 3 },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You get through a whole box of matches and the leader’s patience. The badge goes to a boy called Tobias who is insufferable about it.',
            effects: [{ stat: 'happiness', delta: -1 }],
          },
        ],
      },
      {
        id: 'midnight',
        label: 'Organise a midnight feast',
        outcomes: [
          {
            chance: 1,
            text: 'Crisps, a torch, and ghost stories until the tent collapses on everyone. You make a friend for life in the wreckage.',
            effects: [{ stat: 'happiness', delta: 5 }, { status: 'friend' }],
            success: true,
          },
        ],
      },
    ],
  },
  {
    id: 'cc_mid_first_computer',
    kind: 'choice',
    category: 'family',
    emoji: '🖥️',
    ages: [7, 15],
    weight: 6,
    cooldownYears: 6,
    once: true,
    fromYear: 1982,
    when: middle,
    bind: { dad: { role: 'father' } },
    text: 'The family computer arrives in a box the size of a fridge. {dad.first} reads the manual cover to cover before he will let anyone switch it on.',
    choices: [
      {
        id: 'program',
        label: 'Learn to make it do things',
        outcomes: [
          {
            chance: 1,
            text: 'You type a program from the back of a magazine. It takes a weekend and draws one wobbly star. You are hooked.',
            effects: [
              { skill: 'programming', delta: 5 },
              { stat: 'smarts', delta: 2 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'games',
        label: 'Play games on it',
        outcomes: [
          {
            chance: 1,
            text: 'There is one game, about a frog, and you play it until you dream in green squares. {dad.first} pretends not to want a go.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { rel: 'dad', delta: 2, memory: 'the frog game on the first computer' },
            ],
          },
        ],
      },
    ],
  },

  // ---------- Comfortable ----------
  {
    id: 'cc_comfy_ski_trip',
    kind: 'choice',
    category: 'family',
    emoji: '⛷️',
    ages: [7, 16],
    weight: 6,
    cooldownYears: 4,
    when: comfy,
    text: 'A week in the mountains with ski school every morning. Your instructor is a weathered man who calls everyone “champion” and means none of it.',
    choices: [
      {
        id: 'black',
        label: 'Follow the older kids down a harder run',
        outcomes: [
          {
            chance: 0.55,
            text: 'You come down mostly upright and entirely terrified. At the bottom the older kids nod at you, which is worth everything.',
            effects: [
              { skill: 'athletics', delta: 3 },
              { stat: 'happiness', delta: 5 },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'You come down in pieces: a ski here, a pole there, you somewhere in the middle. A sprained wrist and a cast everyone signs.',
            effects: [{ injury: 8 }, { stat: 'happiness', delta: -2 }],
          },
        ],
      },
      {
        id: 'class',
        label: 'Stick with ski school',
        outcomes: [
          {
            chance: 1,
            text: 'By Friday you can do a proper turn and get a little enamel badge. Hot chocolate every afternoon, with cream.',
            effects: [
              { skill: 'athletics', delta: 2 },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
        ],
      },
    ],
  },
  {
    id: 'cc_comfy_tutor',
    kind: 'choice',
    category: 'school',
    emoji: '📐',
    ages: [10, 17],
    weight: 6,
    cooldownYears: 4,
    when: comfy,
    text: 'Your parents hire a tutor for the exams, a postgraduate student who comes on Thursdays, drinks four cups of tea and is secretly much more fun than school.',
    choices: [
      {
        id: 'work',
        label: 'Put the work in',
        outcomes: [
          {
            chance: 1,
            text: 'Something about fractions finally clicks, then something about essays. Your grades go up and so, a little, does your opinion of yourself.',
            effects: [
              { stat: 'smarts', delta: 4 },
              { stat: 'discipline', delta: 2 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'chat',
        label: 'Get the tutor talking about anything else',
        outcomes: [
          {
            chance: 1,
            text: 'You learn a lot about university, bands and a breakup in Leeds. Your maths stays exactly where it was.',
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
    id: 'cc_comfy_venue_birthday',
    kind: 'choice',
    category: 'family',
    emoji: '🎉',
    ages: [8, 15],
    weight: 5,
    cooldownYears: 5,
    when: comfy,
    text: 'Your parents have booked a whole venue for your birthday: climbing wall, pizza, a DJ who plays songs nobody under forty knows. Your whole year is invited.',
    choices: [
      {
        id: 'enjoy',
        label: 'Be the birthday king or queen',
        outcomes: [
          {
            chance: 1,
            text: 'You reach the top of the climbing wall while the whole room sings at you. Your face hurts from smiling.',
            effects: [{ stat: 'happiness', delta: 6 }],
            success: true,
          },
        ],
      },
      {
        id: 'invite',
        label: 'Make sure the quiet kid in class comes',
        outcomes: [
          {
            chance: 1,
            text: 'You hand the invite over personally. They spend the party next to you, and the next ten years too.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'karma', delta: 3 },
              { status: 'friend' },
            ],
            success: true,
          },
        ],
      },
    ],
  },
  {
    id: 'cc_comfy_dinner_party',
    kind: 'choice',
    category: 'family',
    emoji: '🍷',
    ages: [8, 16],
    weight: 6,
    cooldownYears: 4,
    when: comfy,
    bind: { mum: { role: 'mother' } },
    text: '{mum.first} is throwing a dinner party and you are allowed to stay up for the starter, as long as you say something nice to the guests and don’t mention the extension.',
    choices: [
      {
        id: 'charm',
        label: 'Charm the guests',
        outcomes: [
          {
            chance: 1,
            text: 'You ask a dentist about teeth and a judge about murder. Both are delighted. You are described as “an old soul” over the cheese.',
            effects: [
              { stat: 'smarts', delta: 1 },
              { stat: 'happiness', delta: 3 },
              { rel: 'mum', delta: 3, memory: 'you charming the dinner guests' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'extension',
        label: 'Mention the extension',
        outcomes: [
          {
            chance: 1,
            text: 'It turns out the guests are the neighbours who objected to it. The starter is very long and very quiet.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { rel: 'mum', delta: -4, memory: 'the extension remark at dinner' },
            ],
          },
        ],
      },
      {
        id: 'stairs',
        label: 'Go to bed and listen from the stairs',
        outcomes: [
          {
            chance: 1,
            text: 'You learn three swear words, two secrets, and that the man from number nine is getting divorced. It is better than television.',
            effects: [
              { stat: 'smarts', delta: 1 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cc_comfy_camp_abroad',
    kind: 'choice',
    category: 'family',
    emoji: '🏞️',
    ages: [10, 16],
    weight: 5,
    cooldownYears: 5,
    when: comfy,
    text: 'Your parents send you to a summer camp abroad: a lake, cabins, and forty children from nine countries with one language in common, mostly made of gestures.',
    choices: [
      {
        id: 'mix',
        label: 'Throw yourself in',
        outcomes: [
          {
            chance: 1,
            text: 'You come home with a sunburn, a bracelet made of string and a pen pal in another country who writes for the next twenty years.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'smarts', delta: 1 },
              { status: 'friend' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'homesick',
        label: 'Write home every day',
        outcomes: [
          {
            chance: 1,
            text: 'Your letters arrive a week after you do. Your parents read them aloud at dinner, which is mortifying and somehow lovely.',
            effects: [
              { stat: 'happiness', delta: 1 },
              { skill: 'writing', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cc_comfy_pony',
    kind: 'choice',
    category: 'family',
    emoji: '🐴',
    ages: [6, 14],
    weight: 5,
    cooldownYears: 5,
    when: comfy,
    text: 'Riding lessons on Saturdays, on a short, round pony called Biscuit who has a strong preference for the gate and a powerful disrespect for children.',
    choices: [
      {
        id: 'persist',
        label: 'Win Biscuit over',
        outcomes: [
          {
            chance: 0.6,
            text: 'Weeks of apples and patience. One day Biscuit goes where you ask, at a trot. You have never felt so powerful.',
            effects: [
              { skill: 'athletics', delta: 2 },
              { stat: 'discipline', delta: 3 },
              { stat: 'happiness', delta: 5 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Biscuit takes the apples and gives nothing back. You land in a hedge twice. You love him anyway.',
            effects: [
              { stat: 'health', delta: -1 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'stop',
        label: 'Ask to stop',
        outcomes: [
          {
            chance: 1,
            text: 'Your Saturdays are your own again. Biscuit, you suspect, is just as relieved.',
            effects: [{ stat: 'happiness', delta: 1 }],
          },
        ],
      },
    ],
  },

  // ---------- Rich ----------
  {
    id: 'cc_rich_nanny',
    kind: 'choice',
    category: 'family',
    emoji: '🧸',
    ages: [5, 12],
    weight: 6,
    cooldownYears: 5,
    when: rich,
    text: 'Your nanny, Marisol, knows how you like your toast and which dreams are the bad ones. When she takes a week off you refuse to eat anything, in protest.',
    choices: [
      {
        id: 'tell',
        label: 'Tell her you love her',
        outcomes: [
          {
            chance: 1,
            text: 'She laughs and hugs you too hard. She keeps your drawing in her purse for years, next to her own children’s.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'karma', delta: 2 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'hide',
        label: 'Pretend you don’t care',
        outcomes: [
          {
            chance: 1,
            text: 'You are very cool about it until she comes back, at which point you run down the drive in your socks.',
            effects: [{ stat: 'happiness', delta: 3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'cc_rich_first_class',
    kind: 'notice',
    category: 'family',
    emoji: '✈️',
    ages: [5, 16],
    weight: 6,
    cooldownYears: 4,
    when: rich,
    text: 'You fly to the holiday in the front of the plane, in a seat that turns into a bed, with a menu. You assume, for some years, that this is how everyone flies.',
    outcomes: [
      {
        chance: 1,
        text: 'The island is lovely. The thing you remember is the warm cloth they give you before landing, and that nobody else seems to get one.',
        texts: [
          'You spend the whole flight pressing the button that makes the seat go flat. The holiday itself is a blur of pools.',
        ],
        effects: [
          { stat: 'happiness', delta: 4 },
          { stat: 'karma', delta: -1 },
        ],
      },
    ],
  },
  {
    id: 'cc_rich_chauffeur',
    kind: 'choice',
    category: 'school',
    emoji: '🚘',
    ages: [7, 15],
    weight: 6,
    cooldownYears: 4,
    when: rich,
    text: 'The family driver picks you up at the school gate in a long dark car, while the other kids walk home in a noisy pack. A few of them stare.',
    choices: [
      {
        id: 'walk',
        label: 'Ask to be dropped round the corner instead',
        outcomes: [
          {
            chance: 1,
            text: 'You walk the last stretch with the pack. They talk about cartoons and someone’s cousin. You feel, for ten minutes, ordinary, which is wonderful.',
            effects: [{ stat: 'happiness', delta: 4 }, { status: 'friend' }],
            success: true,
          },
        ],
      },
      {
        id: 'lift',
        label: 'Offer your friends a lift',
        outcomes: [
          {
            chance: 1,
            text: 'Four children in the back of a car with a minibar of fizzy water. It is the best afternoon of their week, and you become very popular, briefly.',
            effects: [{ stat: 'happiness', delta: 3 }],
          },
        ],
      },
      {
        id: 'ignore',
        label: 'Get in and look straight ahead',
        outcomes: [
          {
            chance: 1,
            text: 'The windows are tinted. You can see out, but they can’t see in, and somehow that is worse.',
            effects: [{ stat: 'happiness', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'cc_rich_summer_house',
    kind: 'choice',
    category: 'family',
    emoji: '🏖️',
    ages: [10, 17],
    weight: 6,
    cooldownYears: 4,
    when: rich,
    text: 'The summer house party: a long table under lights, a band on the lawn, and adults you half recognise from the news. Nobody is watching the children at all.',
    choices: [
      {
        id: 'explore',
        label: 'Lead the kids on an expedition',
        outcomes: [
          {
            chance: 1,
            text: 'You find the boathouse, the old rowing boat, and the stars. Nobody notices you were gone until the fireworks.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'discipline', delta: -1 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'adults',
        label: 'Sit at the grown-up table',
        outcomes: [
          {
            chance: 1,
            text: 'A woman who runs something large asks what you want to be. You say “a marine biologist”, and she gives you her card, very seriously.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cc_rich_big_house',
    kind: 'choice',
    category: 'family',
    emoji: '🏰',
    ages: [6, 15],
    weight: 5,
    cooldownYears: 5,
    when: rich,
    text: 'The house has nineteen rooms and you have been in all of them today, looking for someone to talk to. Your parents are away; the staff are kind, but busy.',
    choices: [
      {
        id: 'kitchen',
        label: 'Go and sit in the kitchen with the cook',
        outcomes: [
          {
            chance: 1,
            text: 'He lets you crack the eggs and tells you about his village. The kitchen becomes the warmest room in the house, and not because of the oven.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { skill: 'cooking', delta: 2 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'call',
        label: 'Ring your parents',
        outcomes: [
          {
            chance: 0.5,
            text: 'Your mother picks up between meetings and talks to you for twenty minutes. She promises to come home early. She does.',
            effects: [{ stat: 'happiness', delta: 4 }],
            success: true,
          },
          {
            chance: 0.5,
            text: 'An assistant answers and says they’ll pass on the message. You hang up and walk the corridors again.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cc_rich_security_drill',
    kind: 'notice',
    category: 'family',
    emoji: '🛡️',
    ages: [8, 16],
    weight: 5,
    cooldownYears: 6,
    when: rich,
    text: 'A man in a dark suit comes to teach you the family’s safety rules: never get in a car you weren’t told about, the code word, the room upstairs with the heavy door.',
    outcomes: [
      {
        chance: 1,
        text: 'You practise the drill until you can do it in your sleep, and sometimes you do. For a while you check the street from your window every night.',
        effects: [
          { stat: 'stress', delta: 6 },
          { stat: 'discipline', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'cc_rich_never_work',
    kind: 'choice',
    category: 'money',
    emoji: '💎',
    ages: [13, 17],
    weight: 5,
    cooldownYears: 6,
    once: true,
    when: rich,
    text: 'It dawns on you, somewhere around a maths lesson, that you will never need a job. Not a real one. The thought is a warm bath, and then it isn’t.',
    choices: [
      {
        id: 'drift',
        label: 'Stop trying so hard',
        outcomes: [
          {
            chance: 1,
            text: 'Your grades slide politely downhill. Life is very comfortable and very slightly beige.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { stat: 'discipline', delta: -4 },
              { stat: 'smarts', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'prove',
        label: 'Decide to earn something anyway',
        outcomes: [
          {
            chance: 1,
            text: 'You take a Saturday job at a garden centre under a fake surname. Your first wages are tiny and mean more than your trust fund.',
            effects: [
              { money: 120, kind: 'wage' },
              { stat: 'discipline', delta: 4 },
              { stat: 'happiness', delta: 3 },
              { stat: 'karma', delta: 1 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'give',
        label: 'Ask what the money is for',
        outcomes: [
          {
            chance: 1,
            text: 'The question puzzles your parents at dinner. It keeps puzzling you for years, which is probably the point.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { stat: 'karma', delta: 2 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
    ],
  },

  // ---------- Private and boarding school ----------
  {
    id: 'cc_board_first_night',
    kind: 'choice',
    category: 'school',
    emoji: '🛏️',
    ages: [7, 13],
    weight: 8,
    cooldownYears: 6,
    once: true,
    when: boarding,
    text: 'First night at boarding school. Twelve iron beds, one ticking radiator, and a boy at the end of the row who is crying very quietly into his pillow. So, nearly, are you.',
    choices: [
      {
        id: 'whisper',
        label: 'Whisper across to him',
        outcomes: [
          {
            chance: 1,
            text: 'His name is Rupert and he misses his dog. You talk about dogs until you both fall asleep. You are friends by breakfast.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'karma', delta: 2 },
              { status: 'friend', first: 'Rupert', gender: 'male' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'letter',
        label: 'Write home by torchlight',
        outcomes: [
          {
            chance: 1,
            text: 'Four pages, mostly about the food, all of it sad. You post it on Monday and feel better on Tuesday, before it even arrives.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { skill: 'writing', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'brave',
        label: 'Pull the blanket up and be brave',
        outcomes: [
          {
            chance: 1,
            text: 'You don’t cry. You don’t sleep, either. You learn early how to look fine, which will be useful and costly in equal measure.',
            effects: [
              { stat: 'discipline', delta: 3 },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cc_priv_prize_day',
    kind: 'choice',
    category: 'school',
    emoji: '🏅',
    ages: [10, 17],
    weight: 6,
    cooldownYears: 4,
    when: privateSchool,
    text: 'Prize day: a marquee on the playing field, a minor celebrity handing out silver cups, and parents in hats. You are down for a prize, which you suspect is the one for effort.',
    choices: [
      {
        id: 'accept',
        label: 'Walk up and shake the hand',
        outcomes: [
          {
            chance: 0.5,
            text: 'It is not for effort. It is for the history essay, and the headmaster reads out a line of it. Your parents stand up to clap.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'smarts', delta: 1 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'It is for effort. You trip on the marquee step on the way up, which, everyone agrees, shows effort.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'tea',
        label: 'Ignore the speeches and raid the tea tent',
        outcomes: [
          {
            chance: 1,
            text: 'You eat eleven tiny scones and miss your own name being called. A teacher brings the cup over to you, crumbs and all.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'discipline', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cc_priv_snobbery',
    kind: 'choice',
    category: 'school',
    emoji: '🎩',
    ages: [11, 17],
    weight: 6,
    cooldownYears: 4,
    when: (s) => privateSchool(s) && ['poor', 'working', 'middle'].includes(s.player.wealth),
    text: 'A boy in your year asks where you spend the summer, then what your father does, then where your house is, in a tone that is not really asking anything.',
    choices: [
      {
        id: 'truth',
        label: 'Tell him plainly',
        outcomes: [
          {
            chance: 1,
            text: 'He makes a small noise and turns away. Two people who heard it come and sit with you at lunch instead.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { stat: 'karma', delta: 2 },
              { status: 'friend' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'invent',
        label: 'Invent a villa in the south of France',
        outcomes: [
          {
            chance: 1,
            text: 'The villa grows a pool, a vineyard and a cousin who races cars. Maintaining it is exhausting, and you live in fear of a postcard.',
            effects: [
              { stat: 'stress', delta: 5 },
              { stat: 'karma', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'turn',
        label: 'Ask him what he does',
        outcomes: [
          {
            chance: 1,
            text: 'He doesn’t understand the question. That is, you realise, the answer.',
            effects: [
              { stat: 'smarts', delta: 1 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cc_priv_powerful_friend',
    kind: 'notice',
    category: 'school',
    emoji: '🤝',
    ages: [11, 17],
    weight: 5,
    cooldownYears: 6,
    once: true,
    when: privateSchool,
    text: 'Your new best friend, Imogen, has a grandfather who used to run the country and a mother who still sort of does. Imogen herself mostly wants to talk about frogs.',
    outcomes: [
      {
        chance: 1,
        text: 'You spend half-term at her family’s house, where a cabinet minister passes you the gravy. Imogen shows you her frogs.',
        effects: [
          { stat: 'happiness', delta: 4 },
          { status: 'friend', first: 'Imogen', gender: 'female' },
        ],
        success: true,
      },
    ],
  },
];
