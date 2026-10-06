import type { EventDef } from '../../engine/events/types';
import { canAfford, hasKidAged, oddsBy } from './conditions';

/** Events about the player's own children, from cot to adulthood. How they feel about you matters later. */
export const PARENTING_EVENTS: EventDef[] = [
  // ── Babies (0–2) ─────────────────────────────────────────────────────────
  {
    id: 'par_baby_sleepless',
    kind: 'choice',
    category: 'family',
    ages: [22, 42],
    weight: 9,
    cooldownYears: 3,
    when: hasKidAged(0, 2),
    bind: { kid: { role: 'child', minAge: 0, maxAge: 2 } },
    text: '{kid.first} has decided that 3 a.m. is the ideal time for a long, loud conversation. You have not slept properly in what feels like a geological era.',
    choices: [
      {
        id: 'night_shift',
        label: 'Take every night shift',
        outcomes: [
          {
            chance: 1,
            text: 'You learn every creak in the floorboards and invent eleven lullabies, none of which rhyme. {kid.first} settles on your shoulder most nights.',
            effects: [
              { stat: 'health', delta: -4 },
              { stat: 'stress', delta: 5 },
              { rel: 'kid', delta: 6, memory: 'the made-up lullabies' },
              { npcStat: 'kid', stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'book',
        label: 'Follow a sleep-training book',
        outcomes: [
          {
            chance: 0.55,
            text: 'Against all odds, the chapter on "gentle routines" works. By week three, the house is silent and you keep checking it is still breathing.',
            effects: [
              { stat: 'stress', delta: -5 },
              { stat: 'happiness', delta: 4 },
              { rel: 'kid', delta: 2, memory: 'the strict bedtime routine' },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: '{kid.first} has clearly not read the book. You end up reading it aloud at 4 a.m., which works on you instead.',
            effects: [
              { stat: 'stress', delta: 4 },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'drive',
        label: 'Drive around until it nods off',
        outcomes: [
          {
            chance: 1,
            text: 'Twenty minutes of slow laps past the same petrol station does the trick. You become a regular at a place you never actually stop at.',
            effects: [
              { stat: 'stress', delta: -2 },
              { money: -60 },
              { rel: 'kid', delta: 3, memory: 'the midnight drives' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'par_baby_first_steps',
    kind: 'notice',
    category: 'family',
    ages: [22, 42],
    weight: 8,
    once: true,
    when: hasKidAged(1, 2),
    bind: { kid: { role: 'child', minAge: 1, maxAge: 2 } },
    text: '{kid.first} lets go of the sofa, wobbles, and takes three determined steps straight toward the biscuit tin.',
    outcomes: [
      {
        chance: 0.6,
        text: 'You catch {kid.them} one step short of the biscuit tin and both of you shriek with joy. You will tell this story far too often.',
        effects: [
          { stat: 'happiness', delta: 7 },
          { rel: 'kid', delta: 4, memory: 'the first steps you caught' },
          { npcStat: 'kid', stat: 'happiness', delta: 3 },
        ],
      },
      {
        chance: 0.4,
        text: 'You were in the next room. You hear about it secondhand and spend a week filming the sofa, just in case.',
        effects: [
          { stat: 'happiness', delta: 3 },
          { stat: 'stress', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'par_baby_first_word',
    kind: 'choice',
    category: 'family',
    ages: [22, 42],
    weight: 7,
    once: true,
    when: hasKidAged(1, 2),
    bind: { kid: { role: 'child', minAge: 1, maxAge: 2 } },
    text: '{kid.first} says {kid.their} first clear word over breakfast. The word is "biscuit", delivered with total authority.',
    choices: [
      {
        id: 'claim',
        label: 'Insist it sounded like your name',
        outcomes: [
          {
            chance: 1,
            text: 'Nobody believes you, but you write your name in the baby book anyway, in pen.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { rel: 'kid', delta: 2, memory: 'the baby book you fiddled' },
            ],
          },
        ],
      },
      {
        id: 'teach',
        label: 'Start a vocabulary drive',
        outcomes: [
          {
            chance: 1,
            text: 'Flash cards go up on the fridge. Within a month {kid.first} can say "giraffe" and uses it for everything.',
            effects: [
              { npcStat: 'kid', stat: 'smarts', delta: 5 },
              { rel: 'kid', delta: 4, memory: 'the fridge flash cards' },
              { stat: 'stress', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'reward',
        label: 'Hand over a biscuit',
        outcomes: [
          {
            chance: 1,
            text: '{kid.first} learns that words have power. Specifically, the power to produce biscuits. Breakfast is never quiet again.',
            effects: [
              { npcStat: 'kid', stat: 'happiness', delta: 5 },
              { rel: 'kid', delta: 3, memory: 'the biscuit economy' },
            ],
          },
        ],
      },
    ],
  },

  // ── Small children (3–7) ─────────────────────────────────────────────────
  {
    id: 'par_small_tantrum',
    kind: 'choice',
    category: 'family',
    ages: [25, 47],
    weight: 9,
    cooldownYears: 3,
    when: hasKidAged(3, 7),
    bind: { kid: { role: 'child', minAge: 3, maxAge: 7 } },
    text: 'In the middle of the supermarket, {kid.first} lies face down on the floor because you will not buy a cereal box shaped like a dinosaur.',
    choices: [
      {
        id: 'buy',
        label: 'Buy the dinosaur',
        outcomes: [
          {
            chance: 1,
            text: 'The crying stops instantly. You have negotiated with a very small terrorist and you both know it.',
            effects: [
              { money: -8 },
              { npcStat: 'kid', stat: 'happiness', delta: 4 },
              { rel: 'kid', delta: 2, memory: 'the dinosaur cereal' },
              { stat: 'stress', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'hold',
        label: 'Hold firm and keep shopping',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.5),
            text: 'You calmly steer the trolley around the protest. By the yoghurt aisle {kid.first} gets bored and asks to push. A small, hard-won victory.',
            effects: [
              { stat: 'discipline', delta: 3 },
              { rel: 'kid', delta: 1, memory: 'the supermarket stand-off' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The wailing follows you to the checkout. A stranger gives you a look of deep sympathy, which is somehow worse.',
            effects: [
              { stat: 'stress', delta: 5 },
              { rel: 'kid', delta: -2, memory: 'the meltdown by the tills' },
            ],
          },
        ],
      },
      {
        id: 'join',
        label: 'Lie down on the floor too',
        outcomes: [
          {
            chance: 1,
            text: '{kid.first} is so baffled that {kid.they} stop{kid.s} crying to tell you to get up. The staff are less amused than you hoped.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { rel: 'kid', delta: 4, memory: 'you lying on the supermarket floor' },
              { npcStat: 'kid', stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'par_small_school_play',
    fromYear: 2008,
    kind: 'choice',
    category: 'family',
    ages: [25, 47],
    weight: 8,
    cooldownYears: 4,
    when: hasKidAged(4, 7),
    bind: { kid: { role: 'child', minAge: 4, maxAge: 7 } },
    text: '{kid.first} has been cast as Tree Number Two in the school play. The costume is your problem, and the show is on Thursday.',
    choices: [
      {
        id: 'homemade',
        label: 'Build the costume yourself',
        outcomes: [
          {
            chance: 0.5,
            text: 'Cardboard, green paint and a lot of tape produce a magnificent oak. {kid.first} rustles proudly through the whole show.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { skill: 'art', delta: 3 },
              { rel: 'kid', delta: 6, memory: 'the cardboard oak' },
              { npcStat: 'kid', stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The tree sheds a branch during the first song. {kid.first} carries on with real dignity and one arm.',
            effects: [
              { stat: 'stress', delta: 3 },
              { rel: 'kid', delta: 3, memory: 'the tree that fell apart on stage' },
            ],
          },
        ],
      },
      {
        id: 'bought',
        label: 'Buy one online',
        requires: canAfford(60),
        outcomes: [
          {
            chance: 1,
            text: 'The costume arrives looking like a broccoli with ambitions. Nobody can tell the difference from the back row.',
            effects: [{ money: -60 }, { rel: 'kid', delta: 2, memory: 'the broccoli costume' }],
          },
        ],
      },
      {
        id: 'rehearse',
        label: 'Rehearse the one line with them',
        outcomes: [
          {
            chance: 1,
            text: '{kid.first} delivers "The wind is coming!" with such force that the front row flinches. You are the loudest parent clapping.',
            effects: [
              { npcStat: 'kid', stat: 'smarts', delta: 2 },
              { npcStat: 'kid', stat: 'happiness', delta: 5 },
              { rel: 'kid', delta: 5, memory: 'rehearsing the tree line' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'par_small_lost_tooth',
    kind: 'notice',
    category: 'family',
    ages: [25, 47],
    weight: 7,
    once: true,
    when: hasKidAged(5, 7),
    bind: { kid: { role: 'child', minAge: 5, maxAge: 7 } },
    text: '{kid.first} loses {kid.their} first tooth in an apple and puts it under the pillow with a handwritten note asking the tooth fairy for her autograph.',
    outcomes: [
      {
        chance: 0.6,
        text: 'You leave a coin and a signature in glittery ink. {kid.first} keeps the note in a shoebox for years.',
        effects: [
          { stat: 'happiness', delta: 4 },
          { money: -2 },
          { rel: 'kid', delta: 4, memory: 'the tooth fairy autograph' },
          { npcStat: 'kid', stat: 'happiness', delta: 4 },
        ],
      },
      {
        chance: 0.4,
        text: 'You forget entirely. At dawn you slip a coin under the pillow mid-yawn and invent a story about fairy traffic.',
        effects: [
          { stat: 'stress', delta: 2 },
          { rel: 'kid', delta: 1, memory: 'the tooth fairy running late' },
        ],
      },
    ],
  },

  // ── Older children (8–12) ────────────────────────────────────────────────
  {
    id: 'par_older_report_card',
    kind: 'choice',
    category: 'family',
    ages: [30, 52],
    weight: 9,
    cooldownYears: 3,
    when: hasKidAged(8, 12),
    bind: { kid: { role: 'child', minAge: 8, maxAge: 12 } },
    text: '{kid.first} hands over a report card face down. Art is glowing. Maths says "has potential", which you know is a teacher\'s polite word for trouble.',
    choices: [
      {
        id: 'praise',
        label: 'Celebrate the art grade',
        outcomes: [
          {
            chance: 1,
            text: 'The drawing of a horse that looks like a sofa goes on the fridge. {kid.first} walks a little taller for a month.',
            effects: [
              { npcStat: 'kid', stat: 'happiness', delta: 6 },
              { rel: 'kid', delta: 5, memory: 'the horse drawing on the fridge' },
            ],
          },
        ],
      },
      {
        id: 'homework',
        label: 'Sit down for homework every night',
        outcomes: [
          {
            chance: 0.6,
            text: 'Long division turns out to be hard for both of you. By spring, {kid.first} is better at it than you are.',
            effects: [
              { npcStat: 'kid', stat: 'smarts', delta: 6 },
              { rel: 'kid', delta: 3, memory: 'homework at the kitchen table' },
              { stat: 'stress', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Every session ends in sighing, mostly yours. The grades creep up, and so does the tension at dinner.',
            effects: [
              { npcStat: 'kid', stat: 'smarts', delta: 3 },
              { rel: 'kid', delta: -3, memory: 'the nightly maths arguments' },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'bribe',
        label: 'Offer cash for every top grade',
        outcomes: [
          {
            chance: 1,
            text: '{kid.first} becomes a ruthless academic mercenary and presents you with an invoice at the end of term.',
            effects: [
              { money: -150 },
              { npcStat: 'kid', stat: 'smarts', delta: 4 },
              { rel: 'kid', delta: 2, memory: 'the grades-for-cash deal' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'par_older_bullied',
    kind: 'choice',
    category: 'family',
    ages: [30, 52],
    weight: 7,
    cooldownYears: 5,
    when: hasKidAged(8, 12),
    bind: { kid: { role: 'child', minAge: 8, maxAge: 12 } },
    text: '{kid.first} has gone quiet lately. Eventually it comes out: an older kid has been taking {kid.their} lunch and calling {kid.them} names in front of everyone.',
    choices: [
      {
        id: 'school',
        label: 'Go to the school',
        outcomes: [
          {
            chance: 0.7,
            text: 'The head teacher takes it seriously. The lunches stop vanishing, and {kid.first} starts talking at dinner again.',
            effects: [
              { npcStat: 'kid', stat: 'happiness', delta: 6 },
              { rel: 'kid', delta: 6, memory: 'the time you went to the school for them' },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'The school promises to "monitor the situation". It takes a second meeting and a firmer voice before anything changes.',
            effects: [
              { stat: 'stress', delta: 5 },
              { rel: 'kid', delta: 3, memory: 'you not giving up on the school' },
            ],
          },
        ],
      },
      {
        id: 'talk',
        label: 'Talk it through at home',
        outcomes: [
          {
            chance: 1,
            text: 'You sit on the end of the bed and mostly listen. It does not fix everything, but {kid.first} knows you are on {kid.their} side.',
            effects: [
              { npcStat: 'kid', stat: 'happiness', delta: 3 },
              { rel: 'kid', delta: 5, memory: 'the talk on the end of the bed' },
            ],
          },
        ],
      },
      {
        id: 'class',
        label: 'Sign them up for a judo class',
        requires: canAfford(300),
        outcomes: [
          {
            chance: 1,
            text: '{kid.first} never throws anyone, but {kid.they} stand{kid.s} straighter and make{kid.s} two friends on the mat. The lunch thief loses interest.',
            effects: [
              { money: -300 },
              { npcStat: 'kid', stat: 'happiness', delta: 5 },
              { rel: 'kid', delta: 4, memory: 'the judo lessons' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'par_older_pet',
    kind: 'choice',
    category: 'family',
    ages: [30, 52],
    weight: 8,
    once: true,
    when: hasKidAged(8, 12),
    bind: { kid: { role: 'child', minAge: 8, maxAge: 12 } },
    text: '{kid.first} presents a twelve-slide presentation titled "Why We Need A Dog", including a chart and a forged letter of support from the cat next door.',
    choices: [
      {
        id: 'dog',
        label: 'Get a dog',
        requires: canAfford(800),
        outcomes: [
          {
            chance: 1,
            text: 'A scruffy rescue called Biscuit joins the family. {kid.first} walks it every day for two weeks, and then you do.',
            effects: [
              { money: -800 },
              { stat: 'happiness', delta: 5 },
              { stat: 'health', delta: 2 },
              { npcStat: 'kid', stat: 'happiness', delta: 8 },
              { rel: 'kid', delta: 8, memory: 'the day you brought the dog home' },
              { pet: 'adopt', kind: 'dog', name: 'Biscuit' },
            ],
          },
        ],
      },
      {
        id: 'fish',
        label: 'Counter-offer: a goldfish',
        outcomes: [
          {
            chance: 1,
            text: '{kid.first} accepts with the air of a diplomat signing a bad treaty. The fish is named Sir Reginald and lives an astonishingly long time.',
            effects: [
              { money: -30 },
              { npcStat: 'kid', stat: 'happiness', delta: 3 },
              { rel: 'kid', delta: 2, memory: 'the goldfish compromise' },
            ],
          },
        ],
      },
      {
        id: 'no',
        label: 'Say no',
        outcomes: [
          {
            chance: 1,
            text: 'The presentation is reworked for the next birthday, now with a slide about your many failings.',
            effects: [
              { npcStat: 'kid', stat: 'happiness', delta: -4 },
              { rel: 'kid', delta: -4, memory: 'the dog you refused' },
            ],
          },
        ],
      },
    ],
  },

  // ── Teens (13–17) ────────────────────────────────────────────────────────
  {
    id: 'par_teen_rebellion',
    kind: 'choice',
    category: 'family',
    ages: [35, 57],
    weight: 9,
    cooldownYears: 3,
    when: hasKidAged(13, 17),
    bind: { kid: { role: 'child', minAge: 13, maxAge: 17 } },
    text: '{kid.first} comes down to breakfast with green hair, a new opinion on everything, and a firm belief that you have never been young.',
    choices: [
      {
        id: 'shrug',
        label: 'Say it suits them',
        outcomes: [
          {
            chance: 1,
            text: '{kid.first} is visibly disappointed by the lack of a fight. The green fades by spring. The respect does not.',
            effects: [
              { rel: 'kid', delta: 5, memory: 'you shrugging at the green hair' },
              { npcStat: 'kid', stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'ground',
        label: 'Ground them for a month',
        outcomes: [
          {
            chance: 1,
            text: 'The month is long and very loud. Doors are closed with feeling. The hair stays green out of pure principle.',
            effects: [
              { stat: 'stress', delta: 5 },
              { rel: 'kid', delta: -6, memory: 'the green-hair grounding' },
              { npcStat: 'kid', stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'match',
        label: 'Dye your own hair to match',
        outcomes: [
          {
            chance: 0.5,
            text: '{kid.first} is mortified, then delighted. There is a photo of the two of you that ends up framed.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'looks', delta: -2 },
              { rel: 'kid', delta: 7, memory: 'the matching green hair' },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'This is apparently the most embarrassing thing that has ever happened to anyone. You are walked to the car at a distance of ten metres.',
            effects: [
              { stat: 'looks', delta: -2 },
              { rel: 'kid', delta: -2, memory: 'you copying their hair' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'par_teen_driving',
    kind: 'choice',
    category: 'family',
    ages: [35, 57],
    weight: 8,
    once: true,
    when: hasKidAged(15, 17),
    bind: { kid: { role: 'child', minAge: 15, maxAge: 17 } },
    text: '{kid.first} is old enough to learn to drive and has been jingling your keys meaningfully since breakfast.',
    choices: [
      {
        id: 'teach',
        label: 'Teach them yourself',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.55),
            text: 'You grip the door handle and say "gently" four hundred times. By summer {kid.first} passes first time and thanks you in the car park.',
            effects: [
              { stat: 'stress', delta: 4 },
              { rel: 'kid', delta: 7, memory: 'the driving lessons in the car park' },
              { npcStat: 'kid', stat: 'happiness', delta: 5 },
            ],
            success: true,
            next: { eventId: 'par_teen_first_car', inYears: [1, 3] },
          },
          {
            chance: 0.4,
            text: 'One lesson ends with a recycling bin on its side and both of you shouting. {kid.first} passes eventually, with someone else in the passenger seat.',
            effects: [
              { stat: 'stress', delta: 6 },
              { rel: 'kid', delta: -3, memory: 'the bin incident' },
            ],
            next: { eventId: 'par_teen_first_car', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'lessons',
        label: 'Pay for proper lessons',
        requires: canAfford(700),
        outcomes: [
          {
            chance: 1,
            text: 'A patient instructor called Delphine does the screaming for you. {kid.first} passes, and you keep your nerves.',
            effects: [
              { money: -700 },
              { rel: 'kid', delta: 3, memory: 'paying for the driving lessons' },
              { npcStat: 'kid', stat: 'smarts', delta: 1 },
            ],
            next: { eventId: 'par_teen_first_car', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'wait',
        label: 'Tell them to wait a year',
        outcomes: [
          {
            chance: 1,
            text: 'You hide the keys in the freezer. {kid.first} finds them in a day and puts them back, pointedly, next to the peas.',
            effects: [
              { rel: 'kid', delta: -4, memory: 'the keys in the freezer' },
              { npcStat: 'kid', stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'par_teen_first_car',
    fromYear: 2008,
    kind: 'choice',
    category: 'family',
    weight: 1,
    chainOnly: true,
    bind: { kid: { role: 'child' } },
    text: '{kid.first} has found {kid.their} dream car online. It is twenty years old, a colour the listing calls "sunset", and the seller says the rattle is "character".',
    choices: [
      {
        id: 'buy',
        label: 'Help buy it',
        requires: canAfford(3000),
        outcomes: [
          {
            chance: 0.6,
            text: 'The sunset car runs beautifully, rattle and all. {kid.first} drives you to the shops just to prove it can.',
            effects: [
              { money: -3000 },
              { rel: 'kid', delta: 8, memory: 'the sunset car you helped buy' },
              { npcStat: 'kid', stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The rattle turns out to be the exhaust leaving. The repairs cost nearly as much as the car, but {kid.first} loves it anyway.',
            effects: [
              { money: -4500 },
              { stat: 'stress', delta: 3 },
              { rel: 'kid', delta: 5, memory: 'the car that ate its own exhaust' },
            ],
          },
        ],
      },
      {
        id: 'save',
        label: 'Make them save for it',
        outcomes: [
          {
            chance: 1,
            text: '{kid.first} works weekends for eight months and buys a much duller car with {kid.their} own money. It gets washed every Sunday.',
            effects: [
              { npcStat: 'kid', stat: 'smarts', delta: 3 },
              { rel: 'kid', delta: 1, memory: 'saving up for the first car' },
            ],
          },
        ],
      },
      {
        id: 'share',
        label: 'Offer to share your car',
        outcomes: [
          {
            chance: 1,
            text: 'Your car now smells of chips, and every radio preset has changed. You discover several songs you secretly like.',
            effects: [
              { stat: 'stress', delta: 2 },
              { rel: 'kid', delta: 4, memory: 'borrowing your car every weekend' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'par_teen_exam_stress',
    kind: 'choice',
    category: 'family',
    ages: [35, 57],
    weight: 8,
    cooldownYears: 2,
    when: hasKidAged(15, 17),
    bind: { kid: { role: 'child', minAge: 15, maxAge: 17 } },
    text: 'It is exam season. {kid.first} has not slept, has highlighted entire textbooks, and has just burst into tears over a chemistry flashcard.',
    choices: [
      {
        id: 'tutor',
        label: 'Hire a tutor',
        requires: canAfford(500),
        outcomes: [
          {
            chance: 1,
            text: 'The tutor is calm, patient and charges by the hour. {kid.first} stops panicking about moles, the chemistry kind.',
            effects: [
              { money: -500 },
              { npcStat: 'kid', stat: 'smarts', delta: 6 },
              { rel: 'kid', delta: 3, memory: 'the chemistry tutor' },
            ],
          },
        ],
      },
      {
        id: 'pancakes',
        label: 'Take them out for pancakes',
        outcomes: [
          {
            chance: 1,
            text: 'Over a tall stack you tell {kid.them} that one exam is not a life. {kid.first} laughs for the first time in a week, then goes home and sleeps for eleven hours.',
            effects: [
              { npcStat: 'kid', stat: 'happiness', delta: 7 },
              { npcStat: 'kid', stat: 'smarts', delta: 2 },
              { rel: 'kid', delta: 7, memory: 'the exam-week pancakes' },
            ],
          },
        ],
      },
      {
        id: 'push',
        label: 'Tell them to push harder',
        outcomes: [
          {
            chance: 1,
            text: 'The grades come out well. {kid.first} thanks you politely and does not talk to you properly for most of the summer.',
            effects: [
              { npcStat: 'kid', stat: 'smarts', delta: 4 },
              { npcStat: 'kid', stat: 'happiness', delta: -5 },
              { rel: 'kid', delta: -5, memory: 'the pressure during exams' },
            ],
          },
        ],
      },
    ],
  },

  // ── Adult children (18–40) ───────────────────────────────────────────────
  {
    id: 'par_grown_asks_money',
    kind: 'choice',
    category: 'family',
    ages: [45, 65],
    weight: 8,
    cooldownYears: 6,
    when: hasKidAged(18, 40),
    bind: { kid: { role: 'child', minAge: 18, maxAge: 40 } },
    text: '{kid.first} calls, chats about the weather for an unusually long time, and then asks whether you could help with {money:5000} for a flat deposit.',
    choices: [
      {
        id: 'give',
        label: 'Give it, no strings',
        requires: canAfford(5000),
        outcomes: [
          {
            chance: 1,
            text: 'There is a long silence on the line, then a very wobbly thank-you. You get a key to the new flat and a standing Sunday invitation.',
            effects: [
              { money: -5000 },
              { stat: 'happiness', delta: 4 },
              { rel: 'kid', delta: 10, memory: 'the deposit you gave without asking questions' },
              { npcStat: 'kid', stat: 'happiness', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'loan',
        label: 'Lend it, with a repayment plan',
        requires: canAfford(5000),
        outcomes: [
          {
            chance: 0.6,
            text: 'You draw up a little spreadsheet. {kid.first} pays back every penny over two years, with a smiley face on the last transfer.',
            effects: [
              { rel: 'kid', delta: 4, memory: 'the loan with a spreadsheet' },
              { stat: 'happiness', delta: 2 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The repayments start strong and then quietly stop. Neither of you mentions it, which is its own kind of mention.',
            effects: [
              { money: -3000 },
              { rel: 'kid', delta: -2, memory: 'the loan nobody talks about' },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'refuse',
        label: 'Say you cannot',
        outcomes: [
          {
            chance: 1,
            text: '{kid.first} says {kid.they} understand{kid.s}, in the voice people use when they do not. The flat happens a year later, without you.',
            effects: [
              { rel: 'kid', delta: -6, memory: 'the deposit you would not help with' },
              { npcStat: 'kid', stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'par_grown_moves_abroad',
    fromYear: 2008,
    kind: 'choice',
    category: 'family',
    ages: [45, 65],
    weight: 7,
    once: true,
    when: hasKidAged(21, 40),
    bind: { kid: { role: 'child', minAge: 21, maxAge: 40 } },
    text: '{kid.first} has been offered a job on the other side of the world and wants to know what you think. {kid.They} {kid.has} already bought a phrasebook.',
    choices: [
      {
        id: 'support',
        label: 'Tell them to go',
        outcomes: [
          {
            chance: 1,
            text: 'You cry at the airport and pretend it is hay fever. The video calls are every Sunday, and {kid.first} sounds happier than {kid.they} {kid.has} in years.',
            effects: [
              { npcFlag: 'kid', flag: 'moved_away' },
              { stat: 'happiness', delta: -2 },
              { rel: 'kid', delta: 8, memory: 'you telling them to take the job abroad' },
              { npcStat: 'kid', stat: 'happiness', delta: 7 },
            ],
          },
        ],
      },
      {
        id: 'guilt',
        label: 'Mention how lonely you will be',
        outcomes: [
          {
            chance: 0.5,
            text: '{kid.first} turns the job down. {kid.They} visit{kid.s} more often now, and wonder{kid.s} about it more often too.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { rel: 'kid', delta: -6, memory: 'the job abroad they gave up for you' },
              { npcStat: 'kid', stat: 'happiness', delta: -5 },
            ],
          },
          {
            chance: 0.5,
            text: '{kid.first} goes anyway, a little stiffly. The first few calls are short.',
            effects: [
              { npcFlag: 'kid', flag: 'moved_away' },
              { stat: 'happiness', delta: -4 },
              { rel: 'kid', delta: -4, memory: 'the guilt trip before they emigrated' },
            ],
          },
        ],
      },
      {
        id: 'pack',
        label: 'Offer to help them settle in',
        requires: canAfford(2000),
        outcomes: [
          {
            chance: 1,
            text: 'You fly out with two suitcases of tea bags and assemble a wardrobe with instructions in a language neither of you reads. It stands, mostly.',
            effects: [
              { npcFlag: 'kid', flag: 'moved_away' },
              { money: -2000 },
              { stat: 'happiness', delta: 5 },
              { rel: 'kid', delta: 9, memory: 'the wardrobe you built together abroad' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'par_grown_graduation',
    kind: 'notice',
    category: 'family',
    ages: [45, 65],
    weight: 6,
    once: true,
    when: hasKidAged(21, 40),
    bind: { kid: { role: 'child', minAge: 21, maxAge: 40 } },
    text: '{kid.first} sends a stiff, cream-coloured card: a graduation, a gown, a hat that will not stay on, and a handwritten line saying "I want you there."',
    outcomes: [
      {
        chance: 0.7,
        text: 'You sit in the third row and clap loudly enough to be shushed. Afterwards {kid.first} puts the hat on your head for a photo.',
        effects: [
          { stat: 'happiness', delta: 8 },
          { rel: 'kid', delta: 7, memory: 'you cheering at the graduation' },
          { npcStat: 'kid', stat: 'happiness', delta: 5 },
        ],
      },
      {
        chance: 0.3,
        text: 'Your train is cancelled and you arrive as the crowd is leaving. {kid.first} walks back across the empty stage so you can take the picture anyway.',
        effects: [
          { stat: 'happiness', delta: 4 },
          { stat: 'stress', delta: 3 },
          { rel: 'kid', delta: 4, memory: 'the second walk across the stage' },
        ],
      },
    ],
  },
];
