import type { EventDef } from '../../engine/events/types';
import { oddsBy } from './conditions';

export const CHILD_EVENTS: EventDef[] = [
  {
    id: 'child_crayon_wall',
    kind: 'choice',
    category: 'family',
    ages: [3, 6],
    weight: 10,
    once: true,
    text: 'You have drawn a mural of the family dog across the hallway wall. In permanent marker. It is, honestly, a good likeness.',
    choices: [
      {
        id: 'confess',
        label: 'Confess',
        outcomes: [
          {
            chance: 0.7,
            text: '{mother.first} sighs, photographs it, then scrubs for an hour.',
            effects: [
              { rel: 'mother', delta: 3, memory: 'the hallway mural' },
              { stat: 'karma', delta: 2 },
            ],
          },
          {
            chance: 0.3,
            text: 'No dessert for a week. Art has a price.',
            effects: [{ stat: 'happiness', delta: -4 }],
          },
        ],
      },
      {
        id: 'blame',
        label: 'Blame the dog',
        outcomes: [
          {
            chance: 0.4,
            text: 'Somehow, it works. The dog is unbothered.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'karma', delta: -3 },
            ],
          },
          {
            chance: 0.6,
            text: 'The dog cannot hold a marker. Everyone knows this.',
            effects: [
              { rel: 'mother', delta: -4, memory: 'the time you blamed the dog' },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'child_first_word',
    kind: 'notice',
    category: 'family',
    ages: [0, 2],
    weight: 10,
    once: true,
    text: 'After months of babbling, you finally say your first real word.',
    outcomes: [
      {
        chance: 0.4,
        text: 'It is "{mother.first}". {mother.first} cries, calls three relatives, and repeats the story at every birthday for decades.',
        effects: [
          { rel: 'mother', delta: 6, memory: 'your very first word' },
          { stat: 'happiness', delta: 3 },
        ],
      },
      {
        chance: 0.35,
        text: 'It is "no". You use it forty times before lunch and mean every one.',
        effects: [
          { stat: 'discipline', delta: -2 },
          { stat: 'happiness', delta: 2 },
        ],
      },
      {
        chance: 0.25,
        text: 'It is "spoon", spoken with total authority while pointing at a cat. Linguists would be fascinated.',
        effects: [{ stat: 'smarts', delta: 3 }],
      },
    ],
  },
  {
    id: 'child_bath_escape',
    kind: 'choice',
    category: 'family',
    ages: [2, 4],
    weight: 9,
    cooldownYears: 2,
    text: '{father.first} turns around for one second to grab a towel. The bathroom door is open. You are wet, soapy, and free.',
    choices: [
      {
        id: 'run',
        label: 'Make a break for the garden',
        outcomes: [
          {
            chance: 0.5,
            text: 'You get as far as the front step before {father.first} catches you mid-sprint. The neighbours applaud.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { rel: 'father', delta: -2, memory: 'the naked garden sprint' },
            ],
          },
          {
            chance: 0.5,
            text: 'You slip on the hallway tiles and land on your bottom with a wet slap. Dignity, and a bruise, lost.',
            effects: [{ injury: 2 }, { stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'hide',
        label: 'Hide behind the curtain',
        outcomes: [
          {
            chance: 1,
            text: 'Your feet stick out the bottom. {father.first} pretends to search for ten minutes, which is the best game ever invented.',
            effects: [
              { rel: 'father', delta: 5, memory: 'the curtain hide-and-seek' },
              { stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'stay',
        label: 'Stay in the bath and splash',
        outcomes: [
          {
            chance: 1,
            text: 'You flood the floor with remarkable efficiency. {father.first} kneels in a puddle and questions every choice that led here.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { npcStat: 'father', stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'child_sibling_toy',
    kind: 'choice',
    category: 'family',
    ages: [3, 7],
    weight: 10,
    cooldownYears: 3,
    text: '{sibling.first} has the toy dinosaur. It is your toy dinosaur. It has always been your toy dinosaur, regardless of what the receipt says.',
    choices: [
      {
        id: 'grab',
        label: 'Snatch it back',
        outcomes: [
          {
            chance: 0.5,
            text: 'You win the tug of war. The dinosaur loses its tail. Nobody is happy, least of all the dinosaur.',
            effects: [
              { rel: 'sibling', delta: -5, memory: 'the dinosaur tug of war' },
              { stat: 'karma', delta: -2 },
            ],
          },
          {
            chance: 0.5,
            text: '{sibling.first} screams loud enough to summon both parents. You are the one sent to your room.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { rel: 'sibling', delta: -2, memory: 'getting you sent to your room' },
            ],
          },
        ],
      },
      {
        id: 'trade',
        label: 'Offer a trade',
        outcomes: [
          {
            chance: 1,
            text: 'You hand over a slightly chewed crayon. {sibling.first} accepts. You have just discovered negotiation.',
            effects: [
              { stat: 'smarts', delta: 3 },
              { rel: 'sibling', delta: 3, memory: 'the great crayon trade' },
            ],
          },
        ],
      },
      {
        id: 'share',
        label: 'Play dinosaurs together',
        outcomes: [
          {
            chance: 1,
            text: 'The dinosaur becomes a doctor, then a king, then a doctor king. You and {sibling.first} play until dinner.',
            effects: [
              { rel: 'sibling', delta: 7, memory: 'the doctor-king dinosaur' },
              { stat: 'karma', delta: 3 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'child_grandparent_sweets',
    kind: 'choice',
    category: 'family',
    ages: [3, 8],
    weight: 9,
    cooldownYears: 3,
    text: '{grandparent.first} slips you a paper bag of boiled sweets and whispers, "Don\'t tell your parents. This is between us."',
    choices: [
      {
        id: 'eat',
        label: 'Eat them all at once',
        outcomes: [
          {
            chance: 0.6,
            text: 'Glorious. Sticky. You are wired until ten at night and nobody can work out why.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { rel: 'grandparent', delta: 4, memory: 'the secret sweet bag' },
            ],
          },
          {
            chance: 0.4,
            text: 'Your stomach files a formal complaint around bedtime. You spend the evening curled up and regretting.',
            effects: [
              { stat: 'health', delta: -3 },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'save',
        label: 'Ration them carefully',
        outcomes: [
          {
            chance: 1,
            text: 'You hide the bag in a sock drawer and allow yourself one per day. The bag lasts a month. You feel like a banker.',
            effects: [
              { stat: 'discipline', delta: 4 },
              { rel: 'grandparent', delta: 3, memory: 'how long you made those sweets last' },
            ],
          },
        ],
      },
      {
        id: 'tell',
        label: 'Tell your parents anyway',
        outcomes: [
          {
            chance: 1,
            text: 'The sweets are confiscated. {grandparent.first} gives you a long, disappointed look over {grandparent.their} glasses.',
            effects: [
              { rel: 'grandparent', delta: -5, memory: 'the time you snitched about the sweets' },
              { stat: 'karma', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'child_first_school_day',
    kind: 'choice',
    category: 'school',
    ages: [5, 6],
    weight: 12,
    once: true,
    text: 'Your first day of school. {teacher.full} has a name sticker waiting for you and a smile with a lot of teeth in it.',
    choices: [
      {
        id: 'cling',
        label: "Cling to your parent's leg",
        outcomes: [
          {
            chance: 1,
            text: 'You are peeled off like a stubborn sticker. By snack time you have forgotten why you were upset.',
            effects: [
              { stat: 'stress', delta: 3 },
              { stat: 'happiness', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'march',
        label: 'March straight in',
        outcomes: [
          {
            chance: 1,
            text: 'You take the best seat, by the window, and inform {teacher.first} that you already know the alphabet. Most of it.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { rel: 'teacher', delta: 3, memory: 'your confident first day' },
            ],
          },
        ],
      },
      {
        id: 'befriend',
        label: 'Find the quietest kid and sit next to them',
        outcomes: [
          {
            chance: 1,
            text: 'The quiet kid shows you a rock shaped like a potato. You are best friends by lunchtime.',
            effects: [{ status: 'friend' }, { stat: 'happiness', delta: 3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'child_lost_tooth',
    kind: 'choice',
    category: 'family',
    ages: [5, 8],
    weight: 10,
    cooldownYears: 2,
    text: 'Your front tooth finally falls out, in an apple, in public. Now it sits in your palm like a tiny trophy.',
    choices: [
      {
        id: 'pillow',
        label: 'Put it under your pillow',
        outcomes: [
          {
            chance: 0.7,
            text: 'In the morning there is a coin and a note in very familiar handwriting. You decide not to ask questions.',
            effects: [{ money: 2 }, { stat: 'happiness', delta: 4 }],
          },
          {
            chance: 0.3,
            text: 'Morning comes and the tooth is still there. {father.first} looks guilty all through breakfast.',
            effects: [
              { stat: 'happiness', delta: -3 },
              { rel: 'father', delta: -2, memory: 'the night the tooth fairy forgot' },
            ],
          },
        ],
      },
      {
        id: 'keep',
        label: 'Keep it in a matchbox',
        outcomes: [
          {
            chance: 1,
            text: 'You start a collection. It is deeply unsettling to every adult who sees it, which only makes it better.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'sell',
        label: 'Try to sell it to {sibling.first}',
        outcomes: [
          {
            chance: 1,
            text: '{sibling.first} pays you in stickers and then cannot explain what {sibling.they} wanted it for. A clean deal.',
            effects: [
              { rel: 'sibling', delta: 2, memory: 'buying your tooth' },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'child_lemonade_stand',
    kind: 'choice',
    category: 'money',
    ages: [6, 10],
    weight: 9,
    once: true,
    text: 'It is the hottest day of summer. {mother.first} has lemons, a folding table, and an expression that says "fine, but you clean up."',
    choices: [
      {
        id: 'cheap',
        label: 'Sell cups cheap',
        outcomes: [
          {
            chance: 1,
            text: 'You undercut the ice cream van and sell out by noon. Your business career has begun.',
            effects: [
              { money: 15 },
              { stat: 'happiness', delta: 5 },
              { rel: 'mother', delta: 2, memory: 'your first lemonade stand' },
            ],
            next: { eventId: 'child_lemonade_followup', inYears: [1, 3] },
            success: true,
          },
        ],
      },
      {
        id: 'premium',
        label: 'Charge a fortune and call it artisanal',
        outcomes: [
          {
            chance: 0.35,
            text: 'A tired jogger pays your outrageous price without blinking. You become insufferable about it.',
            effects: [{ money: 25 }, { stat: 'happiness', delta: 4 }],
            success: true,
          },
          {
            chance: 0.65,
            text: 'Nobody buys a single cup. You drink the whole jug yourself and spend the evening very close to the bathroom.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { stat: 'health', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'skip',
        label: 'Drink the lemonade instead',
        outcomes: [
          {
            chance: 1,
            text: 'You sit in the shade and finish the lot. No profit, but you are the most refreshed child on the street.',
            effects: [{ stat: 'happiness', delta: 3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'child_lemonade_followup',
    kind: 'choice',
    category: 'money',
    ages: [7, 13],
    weight: 10,
    chainOnly: true,
    text: 'A new lemonade stand has opened directly across from your usual spot. {classmate.first} is running it, with a hand-painted sign that just says "BETTER".',
    choices: [
      {
        id: 'compete',
        label: 'Start a price war',
        outcomes: [
          {
            chance: 0.5,
            text: 'You drop to half price and add free ice. {classmate.first} folds by lunch. You feel powerful and slightly evil.',
            effects: [
              { money: 10 },
              { rel: 'classmate', delta: -6, memory: 'the lemonade price war' },
              { stat: 'karma', delta: -2 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'You both end up giving lemonade away for free. The street has never been so hydrated or so tense.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { rel: 'classmate', delta: -3, memory: 'the free lemonade standoff' },
            ],
          },
        ],
      },
      {
        id: 'merge',
        label: 'Propose a merger',
        outcomes: [
          {
            chance: 1,
            text: 'You combine tables and split the money down the middle. {classmate.first} handles the sign, you handle the ice.',
            effects: [
              { money: 12 },
              { rel: 'classmate', delta: 8, memory: 'your lemonade merger' },
              { stat: 'smarts', delta: 2 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'retire',
        label: 'Retire from the lemonade business',
        outcomes: [
          {
            chance: 1,
            text: 'You hang up your jug with grace. Years later you will still say you could have dominated that corner.',
            effects: [{ stat: 'happiness', delta: -1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'child_fever_week',
    kind: 'notice',
    category: 'health',
    ages: [4, 9],
    weight: 6,
    cooldownYears: 4,
    text: 'A bug sweeps through your class and takes you down with it.',
    outcomes: [
      {
        chance: 0.6,
        text: 'A week on the sofa, cartoons, and soup delivered by {mother.first}. Honestly, not the worst week.',
        effects: [
          { illness: 'flu' },
          { rel: 'mother', delta: 3, memory: 'nursing you through that fever' },
        ],
      },
      {
        chance: 0.4,
        text: 'The fever climbs high enough for a night at the clinic. You are fine by morning, but the adults look shaken.',
        effects: [{ illness: 'flu' }, { stat: 'health', delta: -4 }, { stat: 'stress', delta: 3 }],
      },
    ],
  },
  {
    id: 'child_class_hamster',
    kind: 'choice',
    category: 'school',
    ages: [6, 10],
    weight: 9,
    once: true,
    text: 'It is your turn to take the class hamster, Professor Nibbles, home for the weekend. {teacher.first} hands over the cage with surprising seriousness.',
    choices: [
      {
        id: 'care',
        label: 'Follow the care sheet exactly',
        outcomes: [
          {
            chance: 1,
            text: 'Professor Nibbles returns on Monday fat and content. {teacher.first} gives you a gold star the size of a saucer.',
            effects: [
              { stat: 'discipline', delta: 4 },
              { rel: 'teacher', delta: 5, memory: 'how well you looked after Professor Nibbles' },
            ],
          },
        ],
      },
      {
        id: 'adventure',
        label: 'Build him an obstacle course',
        outcomes: [
          {
            chance: 0.5,
            text: 'Professor Nibbles completes the cardboard maze in record time. You write a report on it nobody asked for.',
            effects: [
              { stat: 'smarts', delta: 3 },
              { stat: 'happiness', delta: 4 },
            ],
          },
          {
            chance: 0.5,
            text: 'Professor Nibbles escapes into the walls. He is found on Sunday night inside a slipper, unrepentant.',
            effects: [
              { stat: 'stress', delta: 5 },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'swap',
        label: 'Let {sibling.first} handle feeding',
        outcomes: [
          {
            chance: 1,
            text: '{sibling.first} feeds him an entire carrot. Professor Nibbles is round and slow for days. Nobody at school notices.',
            effects: [
              { rel: 'sibling', delta: 3, memory: 'the hamster weekend' },
              { stat: 'discipline', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'child_spelling_bee',
    kind: 'choice',
    category: 'school',
    ages: [7, 11],
    weight: 9,
    cooldownYears: 3,
    text: 'You are in the final two of the school spelling bee. {teacher.first} reads your word from the card: "rhythm". The hall goes very quiet.',
    choices: [
      {
        id: 'spell',
        label: 'Spell it slowly and carefully',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.5, 0.008),
            text: 'R-H-Y-T-H-M. Correct. You win a certificate and a pencil with a tassel on it. Peak achievement.',
            effects: [
              { stat: 'smarts', delta: 4 },
              { stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You put an extra I in there somewhere. Second place. You will never trust that word again.',
            effects: [
              { stat: 'happiness', delta: -3 },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'definition',
        label: 'Ask for it in a sentence',
        outcomes: [
          {
            chance: 1,
            text: '"The drummer had no rhythm." It helps not at all, but it buys you time to panic in a more organised way.',
            effects: [{ stat: 'stress', delta: 3 }],
          },
          {
            chance: 1,
            text: 'Hearing it aloud jogs your memory. You spell it perfectly and win, and the other finalist demands a recount.',
            effects: [
              { stat: 'smarts', delta: 3 },
              { stat: 'happiness', delta: 5 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'faint',
        label: 'Pretend to feel faint',
        outcomes: [
          {
            chance: 1,
            text: 'You are escorted out and your rival wins by default. Everyone suspects. Nobody can prove it.',
            effects: [
              { stat: 'karma', delta: -3 },
              { rel: 'teacher', delta: -3, memory: 'your suspicious spelling bee collapse' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'child_grandparent_passes',
    kind: 'notice',
    category: 'family',
    ages: [6, 12],
    weight: 4,
    once: true,
    bind: { gp: { role: 'grandparent', minAge: 75 } },
    text: '{gp.first}, {gp.rel}, dies peacefully in {gp.their} sleep.',
    outcomes: [
      {
        chance: 0.6,
        text: 'At the funeral you hold a handful of {gp.their} old boiled sweets in your pocket the whole time. You keep one for years.',
        effects: [
          { status: 'npc_dies', with: 'gp' },
          { stat: 'happiness', delta: -10 },
        ],
      },
      {
        chance: 0.4,
        text: 'It is your first funeral. You do not fully understand it, only that the house is quieter now.',
        effects: [
          { status: 'npc_dies', with: 'gp' },
          { stat: 'happiness', delta: -8 },
          { stat: 'stress', delta: 4 },
        ],
      },
    ],
  },
  {
    id: 'child_sleepover',
    kind: 'choice',
    category: 'social',
    ages: [8, 12],
    weight: 9,
    cooldownYears: 2,
    text: "You're at {classmate.first}'s sleepover. At midnight someone suggests telling ghost stories with the lights off.",
    choices: [
      {
        id: 'tell',
        label: 'Tell the scariest story you know',
        outcomes: [
          {
            chance: 0.6,
            text: 'Your tale of the lady who lives in the airing cupboard is a hit. Two kids sleep with the light on for a week.',
            effects: [
              { rel: 'classmate', delta: 5, memory: 'the airing cupboard ghost story' },
              { stat: 'happiness', delta: 4 },
            ],
          },
          {
            chance: 0.4,
            text: 'You scare yourself so badly you have to call home at one in the morning. {father.first} picks you up in pyjamas.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { rel: 'father', delta: 2, memory: 'the midnight sleepover rescue' },
            ],
          },
        ],
      },
      {
        id: 'prank',
        label: 'Sneak off and put toothpaste on the sleepers',
        outcomes: [
          {
            chance: 0.5,
            text: 'A perfect operation. At breakfast three kids have minty moustaches and no idea why. Legends are born this way.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'karma', delta: -2 },
            ],
          },
          {
            chance: 0.5,
            text: "{classmate.first}'s mum catches you mid-squeeze. You spend the rest of the night on the sofa, under supervision.",
            effects: [
              { rel: 'classmate', delta: -3, memory: 'the toothpaste ambush' },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'sleep',
        label: 'Go to sleep like a sensible person',
        outcomes: [
          {
            chance: 1,
            text: 'You wake up refreshed to find your eyebrows drawn on in felt pen. Sensibility has a cost.',
            effects: [
              { stat: 'looks', delta: -2 },
              { stat: 'health', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'child_broken_window',
    kind: 'choice',
    category: 'random',
    ages: [7, 11],
    weight: 8,
    once: true,
    text: 'Your football sails over the fence and straight through the window of the grumpy neighbour, Mr. Halvorsen. The silence afterwards is enormous.',
    choices: [
      {
        id: 'knock',
        label: 'Knock on his door and own up',
        outcomes: [
          {
            chance: 0.6,
            text: 'Mr. Halvorsen grumbles, then admits nobody has ever apologised to him before. He gives you the ball back and a biscuit.',
            effects: [
              { stat: 'karma', delta: 5 },
              { stat: 'happiness', delta: 2 },
            ],
          },
          {
            chance: 0.4,
            text: 'He wants the window paid for. {father.first} pays, then hands you a very long list of chores to cover it.',
            effects: [
              { stat: 'karma', delta: 3 },
              { stat: 'discipline', delta: 3 },
              { rel: 'father', delta: -2, memory: 'paying for that broken window' },
            ],
          },
        ],
      },
      {
        id: 'run',
        label: 'Run and hide in the shed',
        outcomes: [
          {
            chance: 0.3,
            text: 'Nobody ever finds out. The guilt, however, moves into the shed with you and stays a while.',
            effects: [
              { stat: 'karma', delta: -4 },
              { stat: 'stress', delta: 3 },
            ],
          },
          {
            chance: 0.7,
            text: 'Your name is written on the ball in marker. In your own handwriting. {mother.first} finds you within minutes.',
            effects: [
              { rel: 'mother', delta: -4, memory: 'the window you tried to run from' },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'blame',
        label: 'Blame {sibling.first}',
        outcomes: [
          {
            chance: 1,
            text: '{sibling.first} is grounded for a week and knows exactly who to thank. Revenge is now inevitable.',
            effects: [
              { rel: 'sibling', delta: -8, memory: 'taking the blame for your broken window' },
              { stat: 'karma', delta: -5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'child_playground_rival',
    kind: 'choice',
    category: 'social',
    ages: [8, 12],
    weight: 9,
    cooldownYears: 3,
    text: '{classmate.first} announces to the whole playground that you still sleep with a stuffed rabbit. This is true, but it is not their business.',
    choices: [
      {
        id: 'deny',
        label: 'Deny everything',
        outcomes: [
          {
            chance: 0.5,
            text: 'Your poker face holds. By Thursday everyone has moved on to a rumour about the dinner lady.',
            effects: [{ stat: 'happiness', delta: 2 }],
          },
          {
            chance: 0.5,
            text: '{classmate.first} produces a photo from the last sleepover. The rabbit is named. The rabbit is famous.',
            effects: [{ stat: 'happiness', delta: -6 }, { status: 'enemy' }],
          },
        ],
      },
      {
        id: 'own',
        label: 'Own it proudly',
        outcomes: [
          {
            chance: 1,
            text: '"His name is Sir Hops and he is a better friend than you." Half the playground quietly admits to having one too.',
            effects: [{ stat: 'happiness', delta: 5 }, { addTrait: 'funny' }],
          },
        ],
      },
      {
        id: 'retaliate',
        label: 'Reveal one of their secrets',
        outcomes: [
          {
            chance: 1,
            text: "You tell everyone {classmate.first} cried at a film about a lighthouse. It's war now, and both of you lose.",
            effects: [
              { rel: 'classmate', delta: -10, memory: 'the lighthouse film secret' },
              { stat: 'karma', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'child_science_fair',
    kind: 'choice',
    category: 'school',
    ages: [9, 12],
    weight: 9,
    cooldownYears: 3,
    text: 'The science fair is on Monday and it is Sunday afternoon. Your project so far is a title: "Volcanoes (Real)".',
    choices: [
      {
        id: 'parent',
        label: 'Beg {mother.first} for help',
        outcomes: [
          {
            chance: 1,
            text: '{mother.first} takes over completely and builds a working volcano with a lighting rig. You hold the glue. It wins third prize.',
            effects: [
              { rel: 'mother', delta: 4, memory: 'the volcano she built for you' },
              { stat: 'smarts', delta: 1 },
              { stat: 'karma', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'cram',
        label: 'Build it yourself overnight',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.45, 0.008),
            text: 'Your lopsided volcano erupts on cue and drenches a judge in pink foam. Somehow, you win first prize.',
            effects: [
              { stat: 'smarts', delta: 5 },
              { stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'The volcano refuses to erupt. You stand beside it for two hours explaining that it is dormant.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'pivot',
        label: 'Change the project to "Why procrastination happens"',
        outcomes: [
          {
            chance: 1,
            text: '{teacher.first} sees the poster, sighs deeply, and gives you a mark for honesty. Barely.',
            effects: [
              { rel: 'teacher', delta: -2, memory: 'your procrastination poster' },
              { addTrait: 'lazy' },
            ],
          },
        ],
      },
    ],
  },
];
