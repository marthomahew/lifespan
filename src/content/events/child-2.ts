import type { EventDef } from '../../engine/events/types';
import { oddsBy } from './conditions';

/** Childhood, second pack: ages 0–12, mostly family scenes. */
export const CHILD_EVENTS_2: EventDef[] = [
  {
    id: 'kid2_imaginary_friend',
    kind: 'choice',
    category: 'family',
    ages: [3, 7],
    weight: 8,
    once: true,
    text: 'You have a new best friend called Captain Gribble. He is invisible, seven feet tall, and insists on his own chair at dinner. {mother.first} has started laying him a plate.',
    choices: [
      {
        id: 'chair',
        label: 'Demand the good chair for him',
        outcomes: [
          {
            chance: 0.6,
            text: 'Captain Gribble gets the good chair. {mother.first} serves him peas, which he famously hates, and you eat them on his behalf.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { rel: 'mother', delta: 4, memory: 'setting a place for Captain Gribble' },
              { addTrait: 'creative' },
            ],
            next: { eventId: 'kid2_imaginary_farewell', inYears: [1, 3] },
          },
          {
            chance: 0.4,
            text: '{father.first} sits in the good chair without looking. You scream that he has squashed the Captain. Dinner does not recover.',
            effects: [
              { stat: 'happiness', delta: -3 },
              { rel: 'father', delta: -3, memory: 'sitting on Captain Gribble' },
            ],
            next: { eventId: 'kid2_imaginary_farewell', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'blame',
        label: 'Blame him for the spilled juice',
        outcomes: [
          {
            chance: 0.5,
            text: '{mother.first} gravely sentences Captain Gribble to no pudding. You agree it is fair, and quietly feel terrible for him.',
            effects: [
              { stat: 'karma', delta: -2 },
              { stat: 'happiness', delta: 2 },
            ],
            next: { eventId: 'kid2_imaginary_farewell', inYears: [1, 3] },
          },
          {
            chance: 0.5,
            text: '"Then the Captain can help you mop it," says {mother.first}, handing you a cloth. The Captain, it turns out, is useless with a mop.',
            effects: [
              { stat: 'discipline', delta: 3 },
              { rel: 'mother', delta: 2, memory: 'the Captain Gribble juice incident' },
            ],
          },
        ],
      },
      {
        id: 'keep_secret',
        label: 'Keep him a secret from now on',
        outcomes: [
          {
            chance: 1,
            text: 'You and the Captain meet only in the airing cupboard now. Some friendships are too important for adults.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'smarts', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid2_imaginary_farewell',
    kind: 'notice',
    category: 'family',
    ages: [4, 10],
    weight: 8,
    once: true,
    chainOnly: true,
    bind: { mother: { role: 'mother' }, father: { role: 'father' } },
    text: 'One morning you announce that Captain Gribble has joined a ship bound for the moon and will not be coming back.',
    outcomes: [
      {
        chance: 0.6,
        text: '{mother.first} asks if you will miss him. You think about it and say "a medium amount", then go outside to find a real friend.',
        effects: [
          { stat: 'happiness', delta: 2 },
          { rel: 'mother', delta: 2, memory: 'the night Captain Gribble left for the moon' },
        ],
      },
      {
        chance: 0.4,
        text: 'You hold a short memorial in the garden. {father.first} attends in a tie, says a few words, and takes it more seriously than anyone expected.',
        effects: [
          { stat: 'happiness', delta: 3 },
          { rel: 'father', delta: 5, memory: "Captain Gribble's garden memorial" },
        ],
      },
    ],
  },
  {
    id: 'kid2_hamster_escape',
    kind: 'choice',
    category: 'family',
    ages: [5, 11],
    weight: 8,
    once: true,
    text: 'Your hamster, Duchess, has bent a cage bar and vanished. There is a trail of sunflower-seed husks leading under the kitchen skirting board.',
    choices: [
      {
        id: 'trap',
        label: 'Build a trap from a bucket and books',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.55),
            success: true,
            text: 'At 2am there is a thud. Duchess sits in the bucket on a pile of encyclopaedias, chewing a seed and showing no remorse.',
            effects: [
              { stat: 'smarts', delta: 4 },
              { stat: 'happiness', delta: 6 },
            ],
          },
          {
            chance: 0.4,
            text: 'The bucket catches nothing but {father.first} on his way to the toilet. Duchess turns up three days later inside a slipper.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { rel: 'father', delta: -2, memory: 'the hamster trap on the landing' },
            ],
          },
        ],
      },
      {
        id: 'sibling',
        label: 'Accuse {sibling.first} of letting her out',
        outcomes: [
          {
            chance: 0.5,
            text: '{sibling.first} denies everything, then finds Duchess in the laundry basket within ten minutes. Suspicious, but you say thank you.',
            effects: [{ rel: 'sibling', delta: 3, memory: 'finding Duchess in the laundry' }],
          },
          {
            chance: 0.5,
            text: 'A long, loud argument follows. Duchess watches the entire thing from on top of the fridge.',
            effects: [
              { stat: 'stress', delta: 4 },
              { rel: 'sibling', delta: -5, memory: 'being blamed for the hamster' },
            ],
          },
        ],
      },
      {
        id: 'wait',
        label: 'Leave a cheese trail and wait',
        outcomes: [
          {
            chance: 1,
            text: 'Duchess follows the cheese straight back to her cage, eats all of it, and goes to sleep. The mice in the walls also had a lovely evening.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid2_bike_lesson',
    kind: 'choice',
    category: 'family',
    ages: [4, 9],
    weight: 9,
    once: true,
    text: '{father.first} has taken the stabilisers off your bike and is jogging behind you holding the saddle. He promises he will not let go.',
    choices: [
      {
        id: 'pedal',
        label: 'Pedal like your life depends on it',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.55),
            success: true,
            text: 'You glide the length of the park before realising {father.first} let go ages ago. You are furious and delighted in equal amounts.',
            effects: [
              { stat: 'happiness', delta: 7 },
              { skill: 'athletics', delta: 3 },
              { rel: 'father', delta: 5, memory: 'teaching you to ride in the park' },
              { flag: 'kid2_rides_bike' },
            ],
            next: { eventId: 'kid2_bike_errand', inYears: [1, 3] },
          },
          {
            chance: 0.4,
            text: 'You steer, with great confidence, into a hedge. You emerge with leaves in your hair and a grazed knee.',
            effects: [{ injury: 3 }, { stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'refuse',
        label: 'Refuse until the stabilisers go back on',
        outcomes: [
          {
            chance: 1,
            text: '{father.first} screws them back on with a sigh. You ride proudly past younger kids who are already better at this than you.',
            effects: [
              { stat: 'happiness', delta: 1 },
              { stat: 'discipline', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'make_promise',
        label: 'Make him pinky-swear first',
        outcomes: [
          {
            chance: 0.7,
            text: 'He swears. He lets go anyway. You wobble, then find your balance, and decide you will never trust a pinky again.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { skill: 'athletics', delta: 2 },
              { rel: 'father', delta: 2, memory: 'the broken pinky-swear on the bike' },
              { flag: 'kid2_rides_bike' },
            ],
            next: { eventId: 'kid2_bike_errand', inYears: [1, 3] },
          },
          {
            chance: 0.3,
            text: 'He keeps the promise so well that he jogs behind you for forty minutes and has to sit down on the grass afterwards.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { npcStat: 'father', stat: 'health', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid2_bike_errand',
    kind: 'choice',
    category: 'family',
    ages: [5, 12],
    weight: 8,
    once: true,
    chainOnly: true,
    bind: { father: { role: 'father' } },
    text: '{father.first} needs milk and, for the first time ever, says you can ride to the corner shop on your own. He gives you a coin and a long look.',
    choices: [
      {
        id: 'straight',
        label: 'Go straight there and back',
        outcomes: [
          {
            chance: 1,
            text: 'Milk, change, and a receipt, delivered in eleven minutes. {father.first} shakes your hand like you have closed a business deal.',
            effects: [
              { stat: 'discipline', delta: 4 },
              { rel: 'father', delta: 4, memory: 'your first solo milk run' },
            ],
          },
        ],
      },
      {
        id: 'detour',
        label: 'Take the long way past the duck pond',
        outcomes: [
          {
            chance: 0.6,
            text: 'The ducks are magnificent. The milk is warm by the time you get home, and {father.first} has been standing at the gate for twenty minutes.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { rel: 'father', delta: -3, memory: 'the duck pond detour' },
            ],
          },
          {
            chance: 0.4,
            text: 'You take the hill too fast and the milk carton explodes on the pavement. You return with a dented bike and a very good story.',
            effects: [{ injury: 2 }, { stat: 'happiness', delta: 2 }],
          },
        ],
      },
      {
        id: 'sweets',
        label: 'Spend the change on sherbet',
        outcomes: [
          {
            chance: 1,
            text: 'Your tongue is bright blue when you hand over the milk. {father.first} does not need to ask where the change went.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'karma', delta: -2 },
              { rel: 'father', delta: -2, memory: 'the blue-tongue milk run' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid2_supermarket_lost',
    kind: 'choice',
    category: 'random',
    ages: [3, 7],
    weight: 8,
    cooldownYears: 4,
    text: 'One minute {mother.first} is beside you in the cereal aisle. The next, every adult in the supermarket is a stranger wearing her coat.',
    choices: [
      {
        id: 'staff',
        label: 'Find someone in a shop uniform',
        outcomes: [
          {
            chance: 1,
            success: true,
            text: 'A cashier named Pauline announces your name over the tannoy. {mother.first} arrives at a sprint, pale, and holds on for a long time.',
            effects: [
              { stat: 'smarts', delta: 3 },
              { rel: 'mother', delta: 4, memory: 'hearing your name on the supermarket tannoy' },
            ],
          },
        ],
      },
      {
        id: 'stay',
        label: 'Stay exactly where you are',
        outcomes: [
          {
            chance: 0.7,
            text: 'You stand very still beside the cornflakes, as instructed long ago, and {mother.first} doubles back within two minutes.',
            effects: [
              { stat: 'discipline', delta: 3 },
              { stat: 'stress', delta: 2 },
            ],
          },
          {
            chance: 0.3,
            text: 'Ten minutes pass. You decide to live here now and begin eating grapes from the display. A manager returns you, damp and sticky.',
            effects: [
              { stat: 'stress', delta: 4 },
              { stat: 'happiness', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'wail',
        label: 'Sit down and howl',
        outcomes: [
          {
            chance: 1,
            text: 'It works faster than any plan. Six strangers and {mother.first} converge on you, and someone gives you a free biscuit.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid2_bad_magician',
    kind: 'choice',
    category: 'social',
    ages: [5, 10],
    weight: 7,
    once: true,
    text: 'For your birthday, {mother.first} has hired The Amazing Rodrigo. He drops the cards twice and the rabbit is clearly a sock. {friend.first} is already whispering.',
    choices: [
      {
        id: 'cheer',
        label: 'Cheer loudly to save the show',
        outcomes: [
          {
            chance: 1,
            text: 'Your cheering shames the room into clapping. Rodrigo looks at you with real gratitude and gives you the sock rabbit.',
            effects: [
              { stat: 'karma', delta: 4 },
              { stat: 'happiness', delta: 3 },
              { rel: 'mother', delta: 3, memory: 'saving The Amazing Rodrigo' },
            ],
          },
        ],
      },
      {
        id: 'expose',
        label: 'Point out the sock',
        outcomes: [
          {
            chance: 0.6,
            text: 'The party erupts. {friend.first} laughs so hard juice comes out of {friend.their} nose. Rodrigo leaves early and does not take his fee well.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'karma', delta: -3 },
              { rel: 'friend', delta: 4, memory: 'the sock rabbit at your birthday' },
            ],
          },
          {
            chance: 0.4,
            text: 'Rodrigo calmly makes your slice of cake disappear. It does not come back. Of all his tricks, this one works.',
            effects: [{ stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'volunteer',
        label: 'Volunteer as his assistant',
        outcomes: [
          {
            chance: oddsBy('looks', 0.5),
            success: true,
            text: 'You hide the dropped cards with your foot and pass him the right one. Together you are almost competent. The guests are stunned.',
            effects: [{ stat: 'happiness', delta: 6 }, { addTrait: 'charming' }],
          },
          {
            chance: 0.4,
            text: 'He tries to pull a coin from your ear and pulls out your hair clip instead. You spend the rest of the party being called Coin Ear.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { stat: 'looks', delta: -1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid2_kitchen_haircut',
    kind: 'choice',
    category: 'family',
    ages: [4, 11],
    weight: 7,
    cooldownYears: 5,
    text: '{mother.first} has decided barbers are a scam and sat you on a stool in the kitchen with a tea towel round your neck. The scissors are the ones for chicken.',
    choices: [
      {
        id: 'still',
        label: 'Sit absolutely still',
        outcomes: [
          {
            chance: 0.4,
            success: true,
            text: 'It is, against all odds, fine. Slightly wonky on the left, but nobody at school says anything.',
            effects: [{ rel: 'mother', delta: 3, memory: 'your kitchen haircut' }],
          },
          {
            chance: 0.6,
            text: 'Your fringe ends up a perfect diagonal. {mother.first} calls it "a bold look". Your school photo is taken the next morning.',
            effects: [
              { stat: 'looks', delta: -4 },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'escape',
        label: 'Bolt for the garden mid-cut',
        outcomes: [
          {
            chance: 1,
            text: 'You live in the garden for an hour with half a haircut. {mother.first} eventually finishes the job on the trampoline.',
            effects: [
              { stat: 'looks', delta: -2 },
              { stat: 'happiness', delta: 2 },
              { rel: 'mother', delta: -2, memory: 'the haircut on the trampoline' },
            ],
          },
        ],
      },
      {
        id: 'own',
        label: 'Offer to do it yourself',
        outcomes: [
          {
            chance: 1,
            text: 'You remove one entire eyebrow before the scissors are confiscated. It takes two months to grow back and you are treated as a legend.',
            effects: [
              { stat: 'looks', delta: -5 },
              { stat: 'happiness', delta: 3 },
              { addTrait: 'reckless' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid2_grandparent_holiday',
    kind: 'choice',
    category: 'travel',
    ages: [5, 12],
    weight: 8,
    cooldownYears: 4,
    text: "You are spending a week of the holidays at {grandparent.first}'s house, where bedtime is negotiable, the telly gets four channels, and everything smells faintly of mints.",
    choices: [
      {
        id: 'garden',
        label: 'Help in the vegetable patch',
        outcomes: [
          {
            chance: 1,
            text: 'You dig up a potato the size of your head. {grandparent.first} photographs it next to a ruler and sends the picture to everyone.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'health', delta: 2 },
              { rel: 'grandparent', delta: 6, memory: 'the giant potato' },
            ],
          },
        ],
      },
      {
        id: 'stories',
        label: 'Ask about the old days',
        outcomes: [
          {
            chance: 0.6,
            text: 'Out come the photo albums and a story about a stolen goat that may be at least half true. You stay up far too late.',
            effects: [
              { stat: 'smarts', delta: 3 },
              { rel: 'grandparent', delta: 5, memory: 'the evening of the goat story' },
            ],
          },
          {
            chance: 0.4,
            text: 'You learn {grandparent.first} once danced in a competition and won a toaster. {grandparent.They} {grandparent.is} still bitter about second place the year after.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { rel: 'grandparent', delta: 4, memory: 'the toaster dance trophy' },
            ],
          },
        ],
      },
      {
        id: 'homesick',
        label: 'Phone home every night',
        outcomes: [
          {
            chance: 1,
            text: 'You ring {mother.first} each evening to report on the mints. {grandparent.first} pretends not to mind and makes your favourite pudding anyway.',
            effects: [
              { stat: 'stress', delta: 2 },
              { rel: 'mother', delta: 2, memory: 'your homesick phone calls' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid2_swimming_lesson',
    kind: 'choice',
    category: 'health',
    ages: [4, 9],
    weight: 8,
    once: true,
    text: 'First swimming lesson. The instructor, a woman named Brigid with a whistle and no patience, tells everyone to let go of the side.',
    choices: [
      {
        id: 'let_go',
        label: 'Let go',
        outcomes: [
          {
            chance: oddsBy('health', 0.55),
            success: true,
            text: 'You sink, panic, kick, and discover you are moving. Brigid gives a single nod. It is the proudest you have ever been.',
            effects: [
              { skill: 'athletics', delta: 3 },
              { stat: 'happiness', delta: 5 },
              { stat: 'health', delta: 2 },
            ],
          },
          {
            chance: 0.4,
            text: 'You swallow roughly a third of the pool and are towed back to the side by the armbands. You taste chlorine until Thursday.',
            effects: [
              { stat: 'happiness', delta: -3 },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'cling',
        label: 'Cling to the side and refuse',
        outcomes: [
          {
            chance: 1,
            text: 'You spend the whole lesson attached to the tiles like a limpet. {father.first} watches from the gallery and says nothing on the drive home.',
            effects: [{ stat: 'discipline', delta: -2 }, { addTrait: 'cautious' }],
          },
        ],
      },
      {
        id: 'show_off',
        label: 'Jump in at the deep end',
        outcomes: [
          {
            chance: 1,
            text: 'Brigid fishes you out with the long pole and blows the whistle so hard the whole pool stops. You are banned from the deep end for a month.',
            effects: [{ injury: 2 }, { stat: 'happiness', delta: -2 }, { addTrait: 'reckless' }],
          },
        ],
      },
    ],
  },
  {
    id: 'kid2_tooth_fairy_deal',
    kind: 'choice',
    category: 'family',
    ages: [6, 10],
    weight: 7,
    cooldownYears: 3,
    text: 'Before bed you write the tooth fairy a letter. The going rate at school is apparently much higher than whatever you got last time, and you have questions.',
    choices: [
      {
        id: 'demand',
        label: 'Demand a pay rise, in writing',
        outcomes: [
          {
            chance: 0.6,
            text: 'You wake to a reply in handwriting suspiciously like {father.first}\'s: "Rates are fixed. Brush more." There is a coin, and a toothbrush.',
            effects: [
              { money: 2 },
              { stat: 'smarts', delta: 2 },
              { rel: 'father', delta: 2, memory: 'the tooth fairy pay dispute' },
            ],
          },
          {
            chance: 0.4,
            text: 'The fairy doubles the payment and adds a gold sticker reading "Excellent Negotiator". You frame it.',
            effects: [{ money: 5 }, { stat: 'happiness', delta: 4 }, { addTrait: 'ambitious' }],
          },
        ],
      },
      {
        id: 'ask',
        label: 'Ask what she does with all the teeth',
        outcomes: [
          {
            chance: 1,
            text: 'The answer comes in tiny writing: "Building a castle. Long project." You lie awake picturing it, slightly horrified.',
            effects: [{ money: 1 }, { stat: 'smarts', delta: 1 }, { stat: 'happiness', delta: 2 }],
          },
        ],
      },
      {
        id: 'stakeout',
        label: 'Stay up to catch her',
        outcomes: [
          {
            chance: 1,
            text: 'At midnight the door creaks open and {mother.first} freezes, coin in hand. You both agree, wordlessly, that this never happened.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { rel: 'mother', delta: 3, memory: 'the night you caught the tooth fairy' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid2_sibling_baby_news',
    kind: 'notice',
    category: 'family',
    ages: [6, 12],
    weight: 6,
    once: true,
    bind: { sib: { role: 'sibling', minAge: 21 } },
    text: "At Sunday dinner, {sib.first} taps a glass and announces a baby is on the way. At {age}, you are about to become somebody's relative with authority.",
    outcomes: [
      {
        chance: 0.6,
        text: 'You immediately begin drafting rules for the baby. {sib.first} lets you read them out and promises to take them under consideration.',
        effects: [
          { stat: 'happiness', delta: 5 },
          { rel: 'sib', delta: 4, memory: 'your rules for the baby' },
        ],
      },
      {
        chance: 0.4,
        text: 'Everyone cries and hugs, and nobody passes you the potatoes for twenty minutes. You decide to feel happy about it later.',
        effects: [
          { stat: 'happiness', delta: 2 },
          { stat: 'stress', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'kid2_museum_trip',
    kind: 'choice',
    category: 'school',
    ages: [6, 12],
    weight: 8,
    cooldownYears: 4,
    text: 'The class trip to the natural history museum in {city} reaches a hall with a whale skeleton hanging from the ceiling. {classmate.first} dares you to touch the rope.',
    choices: [
      {
        id: 'touch',
        label: 'Touch the rope',
        outcomes: [
          {
            chance: 0.5,
            text: 'An alarm sounds. A guard with a moustache like a broom escorts your whole group to the gift shop, which is honestly an upgrade.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'discipline', delta: -3 },
              { rel: 'classmate', delta: 3, memory: 'setting off the whale alarm' },
            ],
          },
          {
            chance: 0.5,
            text: "Nothing happens at all. {classmate.first} is deeply disappointed in the museum's security and in you.",
            effects: [{ rel: 'classmate', delta: -1, memory: 'the anticlimactic whale dare' }],
          },
        ],
      },
      {
        id: 'worksheet',
        label: 'Actually finish the worksheet',
        outcomes: [
          {
            chance: 1,
            text: 'You learn the whale ate four tonnes of shrimp a day, and recite this fact to anyone who will listen for the next year.',
            effects: [{ stat: 'smarts', delta: 5 }],
          },
        ],
      },
      {
        id: 'wander',
        label: 'Sneak off to the mummy room',
        outcomes: [
          {
            chance: 0.6,
            text: 'The mummies are magnificent and you are alone with them. Then you realise you are also alone in the entire wing, and walk back very fast.',
            effects: [
              { stat: 'smarts', delta: 3 },
              { stat: 'stress', delta: 3 },
            ],
          },
          {
            chance: 0.4,
            text: '{teacher.first} finds you twenty minutes later, nose pressed to a sarcophagus. You sit next to {teacher.them} on the coach home.',
            effects: [
              { stat: 'discipline', delta: -2 },
              { rel: 'teacher', delta: -4, memory: 'losing you in the museum' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid2_scary_film',
    kind: 'choice',
    category: 'world',
    ages: [7, 12],
    weight: 8,
    once: true,
    text: '{sibling.first} is watching a film called "The Thing in the Lift", which you are absolutely not allowed to see. The living room door is open a crack.',
    choices: [
      {
        id: 'watch',
        label: 'Watch from behind the sofa',
        outcomes: [
          {
            chance: 0.5,
            text: 'You see eleven minutes and will not use a lift for two years. Each night you check the wardrobe, then check it again.',
            effects: [
              { stat: 'stress', delta: 6 },
              { stat: 'happiness', delta: -2 },
              { addTrait: 'anxious' },
            ],
          },
          {
            chance: 0.5,
            text: 'It is mostly people shouting in a corridor. You fall asleep behind the sofa and wake up feeling enormously grown-up.',
            effects: [{ stat: 'happiness', delta: 4 }],
          },
        ],
      },
      {
        id: 'join',
        label: 'Ask {sibling.first} if you can join',
        outcomes: [
          {
            chance: 0.5,
            text: '{sibling.first} lets you, on the condition that you never tell. You hold a cushion over your face for the scary parts and share the crisps.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { rel: 'sibling', delta: 5, memory: 'watching The Thing in the Lift together' },
            ],
          },
          {
            chance: 0.5,
            text: '"Absolutely not," says {sibling.first}, and turns the volume up so the screams follow you up the stairs.',
            effects: [
              { stat: 'stress', delta: 3 },
              { rel: 'sibling', delta: -3, memory: 'shutting you out of the film' },
            ],
          },
        ],
      },
      {
        id: 'tell',
        label: 'Tell {mother.first}',
        outcomes: [
          {
            chance: 1,
            text: 'The film goes off. {sibling.first} glares at you for a week, and sleeps with the landing light on, which you notice and say nothing about.',
            effects: [
              { stat: 'karma', delta: 1 },
              { rel: 'sibling', delta: -5, memory: 'telling on the lift film' },
            ],
          },
        ],
      },
    ],
  },
];
