import type { EventDef } from '../../engine/events/types';
import { canAfford, hasJob, inSchool, oddsBy, onTheRun, ownsHome } from './conditions';

/** The wider world brushing against an ordinary life: weather, money, crowds, councils. */
export const WORLD_EVENTS_2: EventDef[] = [
  // Chain A, step 1: the shop closes, and you might try to save it.
  {
    id: 'wld2_shop_closing',
    kind: 'choice',
    category: 'world',
    ages: [18, 55],
    weight: 6,
    cooldownYears: 12,
    text: 'Pell & Daughter, the hardware shop that has sold {city} single screws by the gram since before you were born, has a hand-lettered sign in the window: CLOSING END OF MONTH. THANK YOU FOR THE NAILS.',
    choices: [
      {
        id: 'save',
        label: 'Rally the street to save it',
        outcomes: [
          {
            chance: 1,
            text: 'You knock on forty doors and get thirty-one promises, six shrugs and one man who wants to talk about drains. Old Mrs Pell agrees to hang on while you raise the money.',
            effects: [
              { stat: 'karma', delta: 4 },
              { stat: 'stress', delta: 3 },
            ],
            next: { eventId: 'wld2_fundraiser', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'buy',
        label: 'Buy something you do not need, as a goodbye',
        outcomes: [
          {
            chance: 1,
            text: 'You leave with a brass doorstop shaped like a hedgehog and a lump in your throat. Mrs Pell wraps it in newspaper like it matters, because it does.',
            effects: [{ money: -40 }, { stat: 'happiness', delta: 2 }],
          },
        ],
      },
      {
        id: 'shrug',
        label: 'Accept that things end',
        outcomes: [
          {
            chance: 1,
            text: 'Within a year it becomes a shop selling candles that smell of other candles. You walk past quickly and miss the screws more than you expected.',
            effects: [{ stat: 'happiness', delta: -3 }],
          },
        ],
      },
    ],
  },
  // Chain A, step 2.
  {
    id: 'wld2_fundraiser',
    kind: 'choice',
    category: 'world',
    ages: [19, 58],
    weight: 8,
    chainOnly: true,
    text: 'The Save Pell & Daughter fundraiser is tonight in the church hall. There is a raffle, a tombola full of donated soap and a thermometer poster you drew that is still worryingly cold at the top.',
    choices: [
      {
        id: 'auction',
        label: 'Run the auction yourself',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.5),
            text: 'You sell a signed cricket bat, a weekend of dog-walking and a cake shaped like the shop. The thermometer goes red to the brim and Mrs Pell cries into the soap.',
            effects: [
              { stat: 'happiness', delta: 8 },
              { stat: 'karma', delta: 5 },
              { status: 'friend' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Bidding stalls at the price of a sandwich. The shop survives three more months, which Mrs Pell insists is a gift. You are less sure.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'donate',
        label: 'Quietly cover the shortfall',
        requires: canAfford(2000),
        outcomes: [
          {
            chance: 1,
            text: 'You slip an envelope into the box when no one is looking. The thermometer is suddenly, mysteriously full, and the whole hall argues about who did it.',
            effects: [
              { money: -2000 },
              { stat: 'karma', delta: 8 },
              { stat: 'happiness', delta: 5 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'raffle',
        label: 'Sell raffle tickets at the door',
        outcomes: [
          {
            chance: 1,
            text: 'You sell three hundred tickets and win the first prize yourself, which is deeply embarrassing. You give the hamper back and are applauded for it anyway.',
            effects: [
              { stat: 'karma', delta: 3 },
              { stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'wld2_week_blackout',
    kind: 'choice',
    category: 'world',
    ages: [18, 50],
    weight: 5,
    cooldownYears: 12,
    text: 'The storm takes out a substation and the estimate for getting the lights back on in your part of {city} is "about a week, give or take a week."',
    choices: [
      {
        id: 'camp',
        label: 'Treat it like camping indoors',
        outcomes: [
          {
            chance: 1,
            text: 'You cook on a camping stove, read three whole books by torchlight and go to bed at nine like a medieval farmer. It is the best you have slept in years.',
            effects: [
              { stat: 'stress', delta: -6 },
              { stat: 'smarts', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'neighbours',
        label: 'Share your gas hob with the street',
        outcomes: [
          {
            chance: 1,
            text: 'Your kitchen becomes the canteen of a small, damp republic. A neighbour you only knew as "blue door" turns out to be very good company.',
            effects: [
              { stat: 'karma', delta: 5 },
              { stat: 'happiness', delta: 4 },
              { status: 'friend' },
            ],
          },
        ],
      },
      {
        id: 'hotel',
        label: 'Check into a hotel across town',
        requires: canAfford(700),
        outcomes: [
          {
            chance: 1,
            text: 'Hot showers, room service and a creeping guilt every time you charge your phone. You come home to a fridge you will not open without gloves.',
            effects: [{ money: -700 }, { stat: 'stress', delta: -2 }, { stat: 'karma', delta: -1 }],
          },
        ],
      },
    ],
  },
  // Chain B, step 1: local election.
  {
    id: 'wld2_local_election',
    kind: 'choice',
    category: 'world',
    ages: [25, 57],
    weight: 5,
    cooldownYears: 12,
    // Nobody on the run stands for election.
    when: (s) => !onTheRun(s) && !s.legal.prison,
    text: 'The ward seat on the {city} council is up for grabs and nobody wants it. A woman with a clipboard corners you at the bus stop and says you have "a sensible face." She means it as a job offer.',
    choices: [
      {
        id: 'stand',
        label: 'Stand as an independent',
        outcomes: [
          {
            chance: oddsBy('karma', 0.45),
            text: 'Your entire platform is fixing the swings and holding a street party. You win by eighty-four votes and a recount that takes until two in the morning.',
            effects: [{ stat: 'happiness', delta: 7 }, { stat: 'stress', delta: 5 }, { fame: 1 }],
            success: true,
            next: { eventId: 'wld2_street_party', inYears: [1, 3] },
          },
          {
            chance: 0.5,
            text: 'You come a respectable second, beaten by a retired dentist with better leaflets. Strangers keep telling you they would have voted for you if they had voted.',
            effects: [
              { stat: 'happiness', delta: -3 },
              { stat: 'karma', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'campaign',
        label: 'Campaign for someone else',
        outcomes: [
          {
            chance: 1,
            text: 'You spend six weekends posting leaflets through letterboxes with springs strong enough to take a finger. Your candidate loses, but you gain a fellow leafleteer for life.',
            effects: [
              { stat: 'karma', delta: 3 },
              { stat: 'health', delta: 1 },
              { status: 'friend' },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Say your face is busy',
        outcomes: [
          {
            chance: 1,
            text: 'The clipboard woman nods slowly, as though adding you to a list. You vote on the day and feel you have done the minimum, which you have.',
            effects: [{ stat: 'stress', delta: -1 }],
          },
        ],
      },
    ],
  },
  // Chain B, step 2.
  {
    id: 'wld2_street_party',
    kind: 'choice',
    category: 'world',
    ages: [26, 60],
    weight: 8,
    chainOnly: true,
    text: 'Councillor {first} {last} must now deliver the street party that won the election. The road closure is approved, the bunting is ordered, and the forecast is "changeable," which in {countryThe} means anything.',
    choices: [
      {
        id: 'everything',
        label: 'Go all out: band, bouncy castle, long tables',
        outcomes: [
          {
            chance: 0.6,
            text: 'The sun holds. Two hundred people eat at one long table down the middle of the road, the band plays something everyone half knows, and you are re-elected in their eyes on the spot.',
            effects: [
              { stat: 'happiness', delta: 9 },
              { stat: 'karma', delta: 3 },
              { status: 'friend' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'It pours at three. The bouncy castle becomes a paddling pool and the band plays on under a gazebo. Somehow people still talk about it fondly for years.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'simple',
        label: 'Keep it simple: bring a dish, bring a chair',
        outcomes: [
          {
            chance: 1,
            text: 'Fourteen potato salads, one samosa mountain and a neighbour who plays the accordion whether asked or not. Small, warm, cheap, and nobody gets wet.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'delegate',
        label: 'Hand it to a committee',
        outcomes: [
          {
            chance: 1,
            text: 'The committee meets nine times and agrees on the colour of the napkins. The party happens eventually, in October, indoors.',
            effects: [
              { stat: 'stress', delta: -1 },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'wld2_heatwave',
    kind: 'notice',
    category: 'world',
    ages: [18, 57],
    weight: 6,
    cooldownYears: 8,
    text: 'A heatwave settles over {city} and refuses to leave. The pavements shimmer, the newsreaders loosen their ties, and every electric fan in the country sells out by Tuesday.',
    outcomes: [
      {
        chance: 0.5,
        text: 'You sleep with your feet in a bucket and a damp towel on your face, and wake each morning slightly basted.',
        effects: [
          { stat: 'stress', delta: 4 },
          { stat: 'health', delta: -2 },
        ],
      },
      {
        chance: 0.5,
        text: 'You discover the lido at seven in the morning, before the crowds, and spend a fortnight swimming lengths beside a silent man in a floral cap. It is glorious.',
        effects: [
          { stat: 'happiness', delta: 4 },
          { stat: 'health', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'wld2_flood',
    kind: 'choice',
    category: 'world',
    ages: [25, 64],
    weight: 5,
    cooldownYears: 12,
    when: ownsHome,
    text: 'Three days of rain and the river at the end of your road is no longer at the end of your road. It is in the garden, and it is eyeing the back door.',
    choices: [
      {
        id: 'sandbag',
        label: 'Sandbag the doors all night',
        outcomes: [
          {
            chance: oddsBy('health', 0.5),
            text: 'By dawn you are soaked, aching and victorious. The water licks the top bag and retreats. Your house is the only dry one on the row.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'health', delta: -2 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The water finds the one gap you missed. The ground floor needs new boards and a dehumidifier that roars like a jet for a month.',
            effects: [{ money: -6000 }, { stat: 'stress', delta: 7 }],
          },
        ],
      },
      {
        id: 'upstairs',
        label: 'Carry everything precious upstairs',
        outcomes: [
          {
            chance: 1,
            text: 'You lose the carpets and the kitchen units, but the photo albums, the good chair and the box of birth certificates all spend the night dry on the landing. The repairs still sting.',
            effects: [{ money: -4000 }, { stat: 'stress', delta: 4 }],
          },
        ],
      },
      {
        id: 'help',
        label: 'Help the elderly couple next door first',
        outcomes: [
          {
            chance: 1,
            text: 'You ferry their whole life up their stairs before your own. Your hallway floods to the ankle, and they leave a casserole on your step every Sunday for a year.',
            effects: [{ money: -2500 }, { stat: 'karma', delta: 8 }, { status: 'friend' }],
          },
        ],
      },
    ],
  },
  {
    id: 'wld2_town_festival',
    kind: 'choice',
    category: 'world',
    ages: [6, 13],
    weight: 7,
    cooldownYears: 5,
    text: 'The {city} summer festival takes over the park: a fairground, a dog show, a man on stilts and a tent selling something called "candy floss on a stick, but bigger."',
    choices: [
      {
        id: 'rides',
        label: 'Spend your pocket money on rides',
        outcomes: [
          {
            chance: 0.7,
            text: 'You ride the Spinning Teacup of Doom four times and scream yourself hoarse. It is the greatest day of your life so far.',
            effects: [{ stat: 'happiness', delta: 7 }, { money: -15 }],
          },
          {
            chance: 0.3,
            text: 'The fourth go on the Teacup is one too many. You are sick behind the coconut shy and spend the afternoon sitting very still on a hay bale.',
            effects: [
              { stat: 'happiness', delta: 1 },
              { stat: 'health', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'dogshow',
        label: 'Enter the dog show with no dog',
        outcomes: [
          {
            chance: 1,
            text: 'You enter yourself in the "Most Obedient" category and sit, stay and roll over for the judge. You get a special rosette and the crowd adores you.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'looks', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'stilts',
        label: 'Ask the stilt man how he does it',
        outcomes: [
          {
            chance: 1,
            text: 'He lets you try a pair of short ones. You fall over eleven times, then walk the length of the tea tent without help, and his friend pays you in candy floss.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'discipline', delta: 2 },
              { status: 'friend' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'wld2_recession',
    kind: 'choice',
    category: 'world',
    ages: [22, 61],
    weight: 6,
    cooldownYears: 12,
    when: hasJob,
    text: 'The news says "downturn" so often it stops sounding like a word. At work, meetings get quieter, the biscuits vanish and someone starts saying "restructure" in the lift.',
    choices: [
      {
        id: 'indispensable',
        label: 'Make yourself impossible to cut',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.55),
            text: 'You volunteer for the dull, vital things nobody notices until they stop. When the list goes round, your name is not on it.',
            effects: [{ performance: 8 }, { stat: 'stress', delta: 5 }],
            success: true,
          },
          {
            chance: 0.35,
            text: 'You work every weekend for three months and burn out just as things improve. Your manager says "great effort" in a tone that means nothing.',
            effects: [
              { performance: 2 },
              { stat: 'stress', delta: 9 },
              { stat: 'health', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'savings',
        label: 'Move your savings somewhere safe',
        outcomes: [
          {
            chance: 1,
            text: 'You shift your money into the dullest account available. It earns almost nothing, which during a downturn feels like winning.',
            effects: [{ money: -200 }, { stat: 'stress', delta: -4 }],
          },
        ],
      },
      {
        id: 'panic',
        label: 'Sell your investments in a panic',
        outcomes: [
          {
            chance: 1,
            text: 'You sell at the very bottom, as is traditional. Prices recover the following spring, and you follow every percentage point of it with your head in your hands.',
            effects: [{ money: -1500 }, { stat: 'stress', delta: 6 }, { stat: 'smarts', delta: 1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'wld2_general_strike',
    fromYear: 2008,
    kind: 'choice',
    category: 'world',
    ages: [18, 57],
    weight: 5,
    cooldownYears: 10,
    when: hasJob,
    text: 'A nationwide general strike shuts the trains, the buses and half the schools across {countryThe}. Your commute is now a theoretical concept.',
    choices: [
      {
        id: 'cycle',
        label: 'Dust off the old bicycle',
        outcomes: [
          {
            chance: 0.8,
            text: 'You arrive at work damp, purple and smug. By Friday your thighs have opinions and you have overtaken a man on a unicycle, twice.',
            effects: [{ stat: 'health', delta: 4 }, { performance: 3 }],
          },
          {
            chance: 0.2,
            text: 'A pothole the size of a bath sends you over the handlebars. You arrive late, grazed and holding a wheel that is no longer round.',
            effects: [{ injury: 4 }, { stat: 'stress', delta: 3 }],
          },
        ],
      },
      {
        id: 'picket',
        label: 'Bring coffee to the picket line',
        outcomes: [
          {
            chance: 1,
            text: 'The drivers at the depot gate are cold, polite and very grateful for a flask. You spend an hour hearing about shift rotas and leave understanding much more.',
            effects: [
              { stat: 'karma', delta: 4 },
              { stat: 'smarts', delta: 2 },
              { status: 'friend' },
            ],
          },
        ],
      },
      {
        id: 'home',
        label: 'Work from the kitchen table',
        outcomes: [
          {
            chance: 1,
            text: 'You attend eleven video calls in your pyjama bottoms. Productivity is fine. Your sense of where the week went is not.',
            effects: [{ stat: 'stress', delta: -2 }, { performance: -1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'wld2_breakthrough',
    kind: 'notice',
    category: 'world',
    ages: [12, 51],
    weight: 5,
    once: true,
    fromYear: 2000,
    text: 'The evening news leads with a breakthrough: a lab team has grown working nerve tissue from a few skin cells. A scientist in a cardigan tries not to cry on camera and fails.',
    outcomes: [
      {
        chance: 0.6,
        text: 'You stay up reading everything you can find, understanding perhaps a third of it. The world feels briefly larger and more hopeful than it did at breakfast.',
        effects: [
          { stat: 'smarts', delta: 4 },
          { stat: 'happiness', delta: 3 },
        ],
      },
      {
        chance: 0.4,
        text: 'It changes nothing you can point to, but for weeks you catch yourself looking at your own hands as if they were a very clever machine. They are.',
        effects: [
          { stat: 'smarts', delta: 2 },
          { stat: 'stress', delta: -2 },
        ],
      },
    ],
  },
  {
    id: 'wld2_sporting_win',
    kind: 'notice',
    category: 'random',
    ages: [6, 45],
    weight: 6,
    once: true,
    // Slovenia only fields its own teams after independence.
    when: (s) => s.player.country !== 'si' || s.year >= 1992,
    text: 'In the last seconds of a final nobody thought {country} could win, {country} wins. The whole street erupts. Car horns, pans banged with spoons, a postman weeping openly.',
    outcomes: [
      {
        chance: 0.7,
        text: 'A stranger hugs you outside the corner shop and you hug them right back. For one night, everyone in the country is on the same side.',
        effects: [
          { stat: 'happiness', delta: 6 },
          { stat: 'stress', delta: -3 },
        ],
      },
      {
        chance: 0.3,
        text: 'You join a conga line that lasts four streets and end up three neighbourhoods from home with a new friend, a borrowed flag and no idea how to get back.',
        effects: [{ stat: 'happiness', delta: 7 }, { status: 'friend' }],
      },
    ],
  },
  {
    id: 'wld2_exam_blackout',
    kind: 'choice',
    category: 'world',
    ages: [12, 17],
    weight: 6,
    cooldownYears: 5,
    when: inSchool,
    text: 'Forty minutes into your end-of-year exam, the power cuts out. The clocks die, the blinds are down and the sports hall goes the grey of a wet Sunday.',
    choices: [
      {
        id: 'keep',
        label: 'Keep writing by window light',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.5),
            text: 'You squint, you scribble, and you finish. The examiner, impressed and slightly alarmed, gives your paper a nod as she collects it.',
            effects: [
              { stat: 'smarts', delta: 3 },
              { stat: 'discipline', delta: 2 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You write two pages that turn out, in daylight, to be on the wrong question. It is a lesson about reading the paper, and about lighting.',
            effects: [
              { stat: 'stress', delta: 4 },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'stop',
        label: 'Put your pen down and wait',
        outcomes: [
          {
            chance: 1,
            text: 'The exam is abandoned and rescheduled for next week. You get seven extra days to revise and absolutely use four of them.',
            effects: [
              { stat: 'stress', delta: -3 },
              { stat: 'smarts', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'whisper',
        label: 'Whisper to the person beside you',
        outcomes: [
          {
            chance: 1,
            text: 'The lights flick back on mid-whisper, with the invigilator standing directly behind you. Your paper gets a note on it, and your stomach gets a knot.',
            effects: [
              { stat: 'karma', delta: -3 },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'wld2_census',
    kind: 'choice',
    category: 'random',
    ages: [18, 57],
    weight: 5,
    cooldownYears: 10,
    text: 'The national census form arrives. Question 19 asks, in calm government type, for the birthplace of your paternal grandmother. You realise you have no idea at all.',
    choices: [
      {
        id: 'research',
        label: 'Dig through old records to find out',
        outcomes: [
          {
            chance: 1,
            text: 'Three evenings, two archives and one helpful volunteer later, you learn she was born on a fishing boat, which explains a great deal about the family temperament.',
            effects: [
              { stat: 'smarts', delta: 3 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'guess',
        label: 'Make a confident guess',
        outcomes: [
          {
            chance: 1,
            text: 'You write the name of the town she retired to and move on. Somewhere in a database, a small, permanent fiction is born.',
            effects: [{ stat: 'stress', delta: -1 }],
          },
        ],
      },
      {
        id: 'joke',
        label: 'Write "unknown, possibly the sea"',
        outcomes: [
          {
            chance: 1,
            text: 'A month later a polite letter asks you to clarify. You spend twenty minutes drafting a reply that is far too long and absolutely accurate.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { stat: 'stress', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
];
