import type { EventDef } from '../../engine/events/types';

/** Babies and toddlers, ages 0–4: small decisions from the very first year. */
export const BABY_EVENTS: EventDef[] = [
  {
    id: 'baby_night_shift',
    kind: 'choice',
    category: 'family',
    ages: [0, 1],
    weight: 12,
    once: true,
    bind: { mum: { role: 'mother' }, dad: { role: 'father' } },
    text: 'It is three in the morning. The house is dark, the ceiling is boring, and you have just remembered that you exist. Somebody needs to know about this immediately.',
    choices: [
      {
        id: 'mum',
        label: 'Scream for {mum.first}',
        outcomes: [
          {
            chance: 1,
            text: '{mum.first} shuffles in with one eye open and sings you a song with most of the words missing. It works anyway.',
            effects: [
              { rel: 'mum', delta: 3, memory: 'the three a.m. lullabies' },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'dad',
        label: 'Scream for {dad.first}',
        outcomes: [
          {
            chance: 0.6,
            text: '{dad.first} walks you up and down the landing for an hour, narrating the plot of a film he has only half seen. You are riveted.',
            effects: [
              { rel: 'dad', delta: 3, memory: 'pacing the landing with you at 3 a.m.' },
              { stat: 'smarts', delta: 1 },
            ],
          },
          {
            chance: 0.4,
            text: '{dad.first} sleeps through the whole thing, impressively. You switch targets and find a more responsive parent.',
            effects: [
              { rel: 'dad', delta: -1, memory: 'sleeping through your first big scream' },
              { stat: 'happiness', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'self',
        label: 'Babble at the ceiling instead',
        outcomes: [
          {
            chance: 1,
            text: 'You hold a long, private conversation with a crack in the plaster and fall asleep mid-sentence. Your parents wake up rested and suspicious.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { stat: 'discipline', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'baby_first_solids',
    kind: 'choice',
    category: 'health',
    ages: [0, 1],
    weight: 11,
    once: true,
    bind: { mum: { role: 'mother' } },
    text: 'A tiny spoon approaches, carrying something green. {mum.first} is making aeroplane noises and opening her own mouth very wide, as if that helps.',
    choices: [
      {
        id: 'open',
        label: 'Open wide',
        outcomes: [
          {
            chance: 0.7,
            text: 'Mashed peas. You consider them carefully, then demand more with both fists. {mum.first} films the second spoonful.',
            effects: [
              { stat: 'health', delta: 2 },
              { rel: 'mum', delta: 2, memory: 'the great pea breakthrough' },
            ],
          },
          {
            chance: 0.3,
            text: 'It tastes of betrayal. Your face does something so dramatic that the photo ends up on the fridge for eleven years.',
            effects: [{ stat: 'happiness', delta: -1 }],
          },
        ],
      },
      {
        id: 'spit',
        label: 'Blow a raspberry',
        outcomes: [
          {
            chance: 1,
            text: 'Peas go everywhere: the walls, the cat, a small but meaningful amount on the ceiling. You find this hilarious.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { rel: 'mum', delta: -1, memory: 'the peas on the ceiling' },
            ],
          },
        ],
      },
      {
        id: 'grab',
        label: 'Grab the spoon',
        outcomes: [
          {
            chance: 1,
            text: 'You seize control of the spoon and feed yourself, mostly via the ear. Messy, but independent.',
            effects: [
              { stat: 'discipline', delta: 1 },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'baby_stranger_glasses',
    kind: 'choice',
    category: 'random',
    ages: [0, 1],
    weight: 10,
    once: true,
    bind: { mum: { role: 'mother' } },
    text: 'On the bus, an elderly man leans over your pushchair to say hello. His glasses are huge, round and shiny, and they are right there.',
    choices: [
      {
        id: 'grab',
        label: 'Grab them',
        outcomes: [
          {
            chance: 1,
            text: 'Your grip is astonishing. It takes {mum.first} two stops and a biscuit to negotiate their release. The man says you have a future in sport.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { rel: 'mum', delta: -1, memory: 'the glasses hostage on the number 9 bus' },
            ],
          },
        ],
      },
      {
        id: 'stare',
        label: 'Stare at him without blinking',
        outcomes: [
          {
            chance: 1,
            text: 'You stare for so long that he becomes uncertain about his life choices and moves to the back of the bus.',
            effects: [{ stat: 'smarts', delta: 1 }],
          },
        ],
      },
      {
        id: 'giggle',
        label: 'Giggle',
        outcomes: [
          {
            chance: 1,
            text: 'He pulls a face, you laugh, he pulls a worse face. By the time you get off, half the bus is waving at you.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'looks', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'baby_sitter_first_night',
    kind: 'choice',
    category: 'family',
    ages: [0, 1],
    weight: 9,
    once: true,
    bind: { mum: { role: 'mother' } },
    text: 'Your parents are going out for the first time since you arrived. The baby-sitter, a teenager named Odile, has a long list of instructions and the expression of someone defusing a bomb.',
    choices: [
      {
        id: 'cry',
        label: 'Cry louder',
        outcomes: [
          {
            chance: 1,
            text: 'You cry until your parents come home early, halfway through their starters. {mum.first} is secretly relieved.',
            effects: [
              { rel: 'mum', delta: 2, memory: 'the dinner you cut short' },
              { stat: 'happiness', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'charm',
        label: 'Charm her',
        outcomes: [
          {
            chance: 1,
            text: 'You and Odile spend the evening clapping at a wooden giraffe. She tells your parents you were perfect, and asks to come back.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'looks', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'sleep',
        label: 'Fall asleep at once',
        outcomes: [
          {
            chance: 1,
            text: 'You are unconscious before the front door closes. Odile watches you breathe for three hours, just to be sure.',
            effects: [
              { stat: 'health', delta: 2 },
              { stat: 'discipline', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'baby_grandparent_visit',
    kind: 'choice',
    category: 'family',
    ages: [0, 1],
    weight: 10,
    cooldownYears: 2,
    bind: { gran: { role: 'grandparent' } },
    text: '{gran.first} has come to stay and is holding you like a priceless vase. {gran.They} smell{gran.s} of peppermints and cold air.',
    choices: [
      {
        id: 'nap',
        label: 'Fall asleep on {gran.them}',
        outcomes: [
          {
            chance: 1,
            text: 'You nod off on {gran.first}, who refuses to move for two hours, including for lunch.',
            effects: [
              { rel: 'gran', delta: 4, memory: 'you sleeping on them all afternoon' },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'nose',
        label: 'Grab {gran.their} nose',
        outcomes: [
          {
            chance: 1,
            text: 'You get a firm hold of {gran.first} by the nose and do not let go. {gran.They} laugh{gran.s} so hard {gran.they} need{gran.s} to sit down.',
            effects: [
              { rel: 'gran', delta: 3, memory: 'the day you caught their nose' },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'wail',
        label: 'Wail at the strange face',
        outcomes: [
          {
            chance: 1,
            text: 'You make it very clear that you have never seen this person before. {gran.first} hands you back, a little wounded, and tries again tomorrow.',
            effects: [
              { rel: 'gran', delta: -2, memory: 'you screaming at first sight of them' },
              { stat: 'happiness', delta: -1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'baby_naming_party',
    kind: 'choice',
    category: 'family',
    ages: [0, 1],
    weight: 9,
    once: true,
    bind: { dad: { role: 'father' } },
    text: 'There is a party in your honour. You are passed from relative to relative like a warm parcel while {dad.first} attempts a speech about what your name means.',
    choices: [
      {
        id: 'heckle',
        label: 'Shriek during the speech',
        outcomes: [
          {
            chance: 1,
            text: 'Your perfectly timed shriek gets a bigger laugh than any of his jokes. {dad.first} gives up and lets you have the last word.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { rel: 'dad', delta: 1, memory: 'you heckling his speech' },
            ],
          },
        ],
      },
      {
        id: 'cake',
        label: 'Lunge at the cake',
        outcomes: [
          {
            chance: 1,
            text: 'Someone holds you too close to the table. Your hand goes straight through the icing, right in the middle of your own name.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { rel: 'dad', delta: -1, memory: 'your handprint in the party cake' },
            ],
          },
        ],
      },
      {
        id: 'sleep',
        label: 'Sleep through the whole thing',
        outcomes: [
          {
            chance: 1,
            text: 'You are cooed at by forty people and remember none of them. Everyone agrees you were a very good guest.',
            effects: [
              { stat: 'health', delta: 1 },
              { stat: 'looks', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'baby_first_tooth',
    kind: 'notice',
    category: 'health',
    ages: [0, 1],
    weight: 10,
    once: true,
    bind: { mum: { role: 'mother' } },
    text: 'Something small and sharp has arrived in your mouth without asking.',
    outcomes: [
      {
        chance: 0.5,
        text: 'You test it on a rusk, a rattle and, briefly, {mum.first}. Everybody survives, and the tooth gets its own photograph.',
        effects: [
          { rel: 'mum', delta: 1, memory: 'the first bite you ever gave anyone' },
          { stat: 'looks', delta: 1 },
        ],
      },
      {
        chance: 0.5,
        text: 'It brings company: a week of drooling, grumbling and gnawing on a frozen flannel. Then it settles in, and you grin about it constantly.',
        effects: [
          { stat: 'happiness', delta: -1 },
          { stat: 'health', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'baby_pan_cupboard',
    kind: 'choice',
    category: 'family',
    ages: [2, 3],
    weight: 11,
    once: true,
    bind: { dad: { role: 'father' } },
    text: 'You have learned to walk, which mostly means you can now reach the cupboard nobody wanted you to reach. It is full of pans. Every pan has a lid.',
    choices: [
      {
        id: 'bang',
        label: 'Bang them together',
        outcomes: [
          {
            chance: 1,
            text: 'You give a twenty-minute percussion recital on the kitchen floor. {dad.first} swears there was a rhythm in there somewhere.',
            effects: [
              { skill: 'instrument', delta: 2 },
              { rel: 'dad', delta: 1, memory: 'the saucepan concerts' },
            ],
          },
        ],
      },
      {
        id: 'helmet',
        label: 'Wear one as a helmet',
        outcomes: [
          {
            chance: 1,
            text: 'You patrol the house in a saucepan, lid held up as a shield. {dad.first} salutes you every time you pass.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { rel: 'dad', delta: 2, memory: 'the saucepan knight' },
            ],
          },
        ],
      },
      {
        id: 'stack',
        label: 'Stack them very carefully',
        outcomes: [
          {
            chance: 0.5,
            text: 'Six pans, one tower, perfectly balanced. You stare at it for a long time, as if you had invented engineering.',
            effects: [{ stat: 'smarts', delta: 2 }],
          },
          {
            chance: 0.5,
            text: 'The tower reaches four pans before it falls with a crash heard two doors down. The neighbour comes round to check on everyone.',
            effects: [
              { stat: 'happiness', delta: 1 },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'baby_checkout_meltdown',
    kind: 'choice',
    category: 'family',
    ages: [2, 4],
    weight: 10,
    cooldownYears: 2,
    bind: { mum: { role: 'mother' } },
    text: 'At the checkout, at exactly your eye level, there is a wall of sweets. {mum.first} has said no. The queue behind you is long, and listening.',
    choices: [
      {
        id: 'floor',
        label: 'Lie face down on the floor',
        outcomes: [
          {
            chance: 1,
            text: 'You go limp and loud. {mum.first} pays with you tucked under one arm like a rolled carpet, and tells this story at your wedding.',
            effects: [
              { rel: 'mum', delta: -2, memory: 'the checkout meltdown' },
              { stat: 'discipline', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'bargain',
        label: 'Negotiate',
        outcomes: [
          {
            chance: 0.5,
            success: true,
            text: 'You offer to be good forever in exchange for one lolly. The cashier laughs so much that {mum.first} gives in.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { stat: 'happiness', delta: 2 },
            ],
          },
          {
            chance: 0.5,
            text: '{mum.first} counters with a banana. You accept, with the dignity of a defeated diplomat.',
            effects: [
              { stat: 'health', delta: 1 },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'accept',
        label: 'Accept your fate',
        outcomes: [
          {
            chance: 1,
            text: 'You sigh the sigh of a much older person and help unload the trolley. {mum.first} buys you a sticker for good behaviour.',
            effects: [
              { stat: 'discipline', delta: 2 },
              { rel: 'mum', delta: 2, memory: 'how good you were at the shops that once' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'baby_imaginary_pony',
    kind: 'choice',
    category: 'family',
    ages: [3, 4],
    weight: 10,
    once: true,
    bind: { mum: { role: 'mother' } },
    text: 'You have a pony named Biscuit. He is invisible, lives behind the sofa and eats only toast crusts. {mum.first} has asked, politely, whether Biscuit could live in the garden.',
    choices: [
      {
        id: 'insist',
        label: 'Biscuit stays indoors',
        outcomes: [
          {
            chance: 1,
            text: '{mum.first} gives in and starts leaving crusts behind the sofa. Biscuit, you report, is grateful.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { rel: 'mum', delta: 2, memory: 'feeding Biscuit the invisible pony' },
              { flag: 'imaginary_biscuit' },
            ],
            next: { eventId: 'baby_biscuit_returns', inYears: [2, 4] },
          },
        ],
      },
      {
        id: 'garden',
        label: 'Build Biscuit a stable outside',
        outcomes: [
          {
            chance: 1,
            text: 'You build a stable out of two flowerpots and a tea towel. It is the finest stable in the street, and nobody else can see it.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { skill: 'art', delta: 1 },
              { flag: 'imaginary_biscuit' },
            ],
            next: { eventId: 'baby_biscuit_returns', inYears: [2, 4] },
          },
        ],
      },
      {
        id: 'release',
        label: 'Say Biscuit has run away',
        outcomes: [
          {
            chance: 1,
            text: 'You announce, very calmly, that Biscuit has gone to live on a farm. {mum.first} feels oddly guilty about this for a week.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { rel: 'mum', delta: 1, memory: 'the day Biscuit went to the farm' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'baby_biscuit_returns',
    kind: 'choice',
    category: 'family',
    ages: [5, 9],
    weight: 10,
    once: true,
    chainOnly: true,
    bind: { mum: { role: 'mother' } },
    text: 'Moving the sofa, {mum.first} finds a fossilised pile of toast crusts and holds one up. "Is Biscuit still with us?" Your friends from school are in the next room.',
    choices: [
      {
        id: 'admit',
        label: 'Admit Biscuit never left',
        outcomes: [
          {
            chance: 1,
            text: 'You explain that Biscuit is older now, mostly retired, and likes the quiet. {mum.first} nods seriously and puts the crusts back.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { rel: 'mum', delta: 3, memory: 'Biscuit and the crusts behind the sofa' },
            ],
          },
        ],
      },
      {
        id: 'deny',
        label: 'Say you are far too old for that',
        outcomes: [
          {
            chance: 1,
            text: 'You say it loudly enough for the next room to hear. {mum.first} bins the crusts. It feels like a bigger thing than it should.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { stat: 'discipline', delta: 1 },
              { unflag: 'imaginary_biscuit' },
            ],
          },
        ],
      },
      {
        id: 'story',
        label: 'Write down where Biscuit went',
        outcomes: [
          {
            chance: 0.4,
            text: "You fill a whole notebook with Biscuit's travels across the sea, illustrated. {mum.first} keeps it in a drawer for the rest of her life.",
            effects: [
              { addTrait: 'creative' },
              { skill: 'writing', delta: 2 },
              { rel: 'mum', delta: 2, memory: "the notebook of Biscuit's adventures" },
            ],
          },
          {
            chance: 0.6,
            text: 'You write three pages about Biscuit becoming a racehorse, then lose interest when lunch is called. It is still a strong opening.',
            effects: [
              { skill: 'writing', delta: 1 },
              { stat: 'smarts', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'baby_big_cat',
    kind: 'choice',
    category: 'random',
    ages: [2, 4],
    weight: 9,
    once: true,
    text: "The neighbour's cat, a huge ginger animal called Admiral, sits on the garden wall. You discover that he has a tail, and that the tail is attached.",
    choices: [
      {
        id: 'pat',
        label: 'Pat him very gently',
        outcomes: [
          {
            chance: 0.7,
            success: true,
            text: 'Admiral permits one stroke, then two, then flops over and purrs like an engine. You are friends for life, on his terms.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'karma', delta: 1 },
            ],
          },
          {
            chance: 0.3,
            text: 'Admiral looks at your hand, then at you, then leaves. You take it personally for days.',
            effects: [{ stat: 'happiness', delta: -1 }],
          },
        ],
      },
      {
        id: 'tail',
        label: 'Grab the tail',
        outcomes: [
          {
            chance: 1,
            text: 'Admiral vanishes over the wall with an outraged yowl. He spends the rest of your childhood glaring at you from a distance.',
            effects: [
              { stat: 'karma', delta: -1 },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'meow',
        label: 'Meow at him',
        outcomes: [
          {
            chance: 1,
            text: 'Admiral meows back. You hold a ten-minute conversation, and he seems to come out ahead.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'baby_nursery_day',
    kind: 'choice',
    category: 'family',
    ages: [3, 4],
    weight: 11,
    once: true,
    bind: { dad: { role: 'father' } },
    text: 'Your first morning at nursery. There are twelve tiny chairs, a hamster called Professor, and a sand tray. {dad.first} is lingering by the door, looking worse than you do.',
    choices: [
      {
        id: 'cling',
        label: 'Cling to his leg',
        outcomes: [
          {
            chance: 1,
            text: 'You attach yourself to {dad.first} like a limpet. A teacher peels you off with practised skill, and you are fine within ten minutes. He is not.',
            effects: [
              { rel: 'dad', delta: 2, memory: 'you clinging to his leg at nursery' },
              { stat: 'happiness', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'march',
        label: 'March in without looking back',
        outcomes: [
          {
            chance: 1,
            text: 'You walk straight in and take charge of the dressing-up box. {dad.first} waves at the back of your head for some time.',
            effects: [
              { stat: 'discipline', delta: 2 },
              { rel: 'dad', delta: -1, memory: 'you not even waving goodbye at nursery' },
            ],
          },
        ],
      },
      {
        id: 'sand',
        label: 'Head straight for the sand tray',
        outcomes: [
          {
            chance: 1,
            text: 'In the sand you meet a girl named Wren, who has already built a moat. By home time, she is your best friend and you are both made of sand.',
            effects: [{ stat: 'happiness', delta: 3 }, { status: 'friend' }],
          },
        ],
      },
    ],
  },
  {
    id: 'baby_hidden_veg',
    kind: 'choice',
    category: 'health',
    ages: [2, 4],
    weight: 10,
    cooldownYears: 3,
    bind: { dad: { role: 'father' } },
    text: 'Dinner is three boiled carrots and some broccoli. {dad.first} says nobody leaves the table until the plate is clear. You have a plan, and pockets.',
    choices: [
      {
        id: 'pockets',
        label: 'Hide them in your pockets',
        outcomes: [
          {
            chance: 1,
            text: 'The plan works perfectly until laundry day, when {dad.first} finds a carrot in your dungarees and laughs until he cries.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { rel: 'dad', delta: 1, memory: 'the carrot in your dungarees' },
            ],
          },
        ],
      },
      {
        id: 'dog',
        label: 'Feed them to whoever is under the table',
        outcomes: [
          {
            chance: 0.5,
            text: 'Under the table there is nobody, just a growing heap of broccoli. You are caught in the act and made to eat a single, symbolic floret.',
            effects: [
              { stat: 'health', delta: 1 },
              { stat: 'discipline', delta: 1 },
            ],
          },
          {
            chance: 0.5,
            text: 'Something under the table eats everything. You never ask what. The plate is clear, and you are a free person.',
            effects: [{ stat: 'happiness', delta: 3 }],
          },
        ],
      },
      {
        id: 'eat',
        label: 'Eat them, making terrible faces',
        outcomes: [
          {
            chance: 1,
            text: 'Every bite is a tragedy in three acts. You finish anyway, and receive applause and pudding.',
            effects: [
              { stat: 'health', delta: 3 },
              { stat: 'discipline', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'baby_why_phase',
    kind: 'choice',
    category: 'family',
    ages: [3, 4],
    weight: 10,
    once: true,
    bind: { mum: { role: 'mother' } },
    text: 'You have discovered the word "why", and that it works on everything. {mum.first} has just explained rain, clouds and the sea, and is starting to look tired.',
    choices: [
      {
        id: 'again',
        label: 'Ask "why?" again',
        outcomes: [
          {
            chance: 1,
            text: 'Eleven whys later, you reach the edge of what {mum.first} knows, somewhere around the Moon. She buys you a book about space the next day.',
            effects: [
              { stat: 'smarts', delta: 3 },
              { rel: 'mum', delta: 1, memory: 'the endless whys' },
            ],
          },
        ],
      },
      {
        id: 'harder',
        label: 'Ask where you came from',
        outcomes: [
          {
            chance: 1,
            text: '{mum.first} says "a hospital" very fast and suggests a snack. You decide this is the most interesting topic in the world, and file it for later.',
            effects: [
              { stat: 'smarts', delta: 1 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'own',
        label: 'Explain the rain yourself',
        outcomes: [
          {
            chance: 1,
            text: 'You tell her that clouds cry because they are lonely. It is wrong in every scientific respect, and she writes it down anyway.',
            effects: [
              { skill: 'writing', delta: 1 },
              { rel: 'mum', delta: 2, memory: 'your theory about lonely clouds' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'baby_sibling_box',
    kind: 'choice',
    category: 'family',
    ages: [2, 4],
    weight: 9,
    once: true,
    bind: { sib: { role: 'sibling' } },
    text: 'A new fridge has been delivered, but the real prize is the box it came in. Both you and {sib.first} are inside it, and the box is not big enough for two visions.',
    choices: [
      {
        id: 'share',
        label: 'Share (reluctantly)',
        outcomes: [
          {
            chance: 1,
            text: 'You agree it is a spaceship and {sib.first} is the captain. You are the engine. Being the engine turns out to be great.',
            effects: [
              { rel: 'sib', delta: 3, memory: 'the fridge-box spaceship' },
              { stat: 'karma', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'claim',
        label: 'Claim it as your house',
        outcomes: [
          {
            chance: 0.5,
            text: 'You hold the box for a whole afternoon and draw a door on it. {sib.first} sulks in the hall, plotting.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { rel: 'sib', delta: -3, memory: 'you stealing the fridge box' },
            ],
          },
          {
            chance: 0.5,
            text: 'The tussle ends with the box flattened and both of you crying on top of it. Nobody wins. A parent puts it in the recycling.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { rel: 'sib', delta: -1, memory: 'the fight that flattened the fridge box' },
            ],
          },
        ],
      },
      {
        id: 'tunnel',
        label: 'Turn it into a tunnel',
        outcomes: [
          {
            chance: 1,
            text: 'You cut both ends off (with help) and crawl back and forth through it with {sib.first} until bedtime. Engineering beats ownership.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { rel: 'sib', delta: 2, memory: 'the cardboard tunnel' },
            ],
          },
        ],
      },
    ],
  },
];
