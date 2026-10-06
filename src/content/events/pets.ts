import type { EventDef } from '../../engine/events/types';
import { favouritePet } from '../../engine/systems/pets';
import type { GameState } from '../../engine/types';
import { all, canAfford, hasJob, hasPet, notInPrison, oddsBy } from './conditions';

/** Your favourite pet (of a kind) has lived at least this share of its expected years. */
const petPastPrime =
  (share: number, kind?: string) =>
  (s: GameState): boolean => {
    const p = favouritePet(s, kind);
    return p !== undefined && p.age >= p.lifespan * share;
  };

/** Your favourite pet is not one of these kinds (for texts that would not fit them). */
const favouriteNot =
  (...kinds: string[]) =>
  (s: GameState): boolean => {
    const p = favouritePet(s);
    return p !== undefined && !kinds.includes(p.kind);
  };

/** Everyday life with animals: vet scares, small fame, escapes and goodbyes. */
export const PET_EVENTS: EventDef[] = [
  // ---- Any pet ----
  {
    id: 'pet_vet_scare',
    kind: 'choice',
    category: 'money',
    ages: [18, 100],
    weight: 6,
    cooldownYears: 4,
    when: all(hasPet(), notInPrison),
    text: '{pet} has gone off their food and is giving you a look you cannot read. The vet can see them this afternoon, for a fee that makes you sit down.',
    choices: [
      {
        id: 'vet',
        label: 'Take them in',
        requires: canAfford(250),
        outcomes: [
          {
            chance: 3,
            text: 'Two tests, one scan and a lot of reassuring murmuring later: a mild infection. The bill is painful; the relief is larger.',
            effects: [
              { money: -250, kind: 'price' },
              { pet: 'health', delta: 12 },
              { pet: 'bond', delta: 4 },
              { stat: 'stress', delta: -3 },
            ],
          },
          {
            chance: 1,
            text: 'The vet finds nothing at all. {pet} eats an entire bowl the moment you get home, as if the whole thing were your idea.',
            effects: [
              { money: -250, kind: 'price' },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'wait',
        label: 'Give it a day or two',
        outcomes: [
          {
            chance: 2,
            text: 'By Thursday {pet} is back to normal and pretending none of it happened. You pretend too.',
            effects: [{ stat: 'stress', delta: 2 }],
          },
          {
            chance: 1,
            text: 'It gets worse before it gets better. You spend three nights checking on them, and {pet} comes out of it thinner and a little warier of you.',
            effects: [
              { pet: 'health', delta: -12 },
              { pet: 'bond', delta: -4 },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'pet_local_fame',
    kind: 'choice',
    category: 'social',
    ages: [12, 90],
    weight: 5,
    once: true,
    when: hasPet(),
    text: 'A photo you posted of {pet} looking deeply unimpressed is doing the rounds in {city}. A local news page wants to share it, and someone has already made it into a sticker.',
    choices: [
      {
        id: 'lean',
        label: 'Start an account for {pet}',
        outcomes: [
          {
            chance: oddsBy('looks', 0.4),
            text: 'Four hundred followers by the weekend, most of them strangers who now ask after {pet} by name. You are second-billed in your own home.',
            effects: [{ stat: 'happiness', delta: 5 }, { fame: 1 }],
            success: true,
          },
          {
            chance: 0.6,
            text: 'The account peaks at thirty-one followers, eleven of them relatives. {pet} remains indifferent to the whole enterprise.',
            effects: [{ stat: 'happiness', delta: 2 }],
          },
        ],
      },
      {
        id: 'let',
        label: 'Let the moment pass',
        outcomes: [
          {
            chance: 1,
            text: 'You let the sticker people have their fun. A week later a stranger at the bus stop shows you the photo of your own {pet.kind}, and you say nothing, smugly.',
            effects: [{ stat: 'happiness', delta: 3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'pet_birthday',
    kind: 'choice',
    category: 'family',
    ages: [8, 100],
    weight: 5,
    cooldownYears: 5,
    when: all(hasPet(), favouriteNot('horse')),
    text: 'You realise it has been exactly another year since {pet} came home. Nobody else has remembered, least of all {pet}.',
    choices: [
      {
        id: 'party',
        label: 'Throw a small party',
        outcomes: [
          {
            chance: 1,
            text: 'There is a special dinner, a candle nobody is allowed near and a song sung badly. {pet} shows no sign of understanding the occasion, which makes it no less of one.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { pet: 'bond', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'quiet',
        label: 'Mark it quietly',
        outcomes: [
          {
            chance: 1,
            text: 'You sit with {pet} for a while and tell them, out loud, that things are better with them here. It is a strange thing to say to a {pet.kind}, and completely true.',
            effects: [
              { stat: 'stress', delta: -3 },
              { pet: 'bond', delta: 4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'pet_bad_week',
    kind: 'notice',
    category: 'health',
    ages: [10, 100],
    weight: 5,
    cooldownYears: 6,
    when: all(hasPet(), (s) => s.player.stats.stress >= 55 || s.player.stats.happiness <= 40),
    text: 'It has been a grey, heavy week, and the only thing in the house that has not asked anything of you is {pet}.',
    outcomes: [
      {
        chance: 1,
        text: 'Every evening you end up beside {pet}, saying nothing, and {pet} seems fine with that. It does not fix anything. It does make the evenings shorter.',
        effects: [
          { stat: 'stress', delta: -6 },
          { stat: 'happiness', delta: 4 },
          { pet: 'bond', delta: 5 },
        ],
      },
    ],
  },
  {
    id: 'pet_moving_house',
    kind: 'choice',
    category: 'family',
    ages: [18, 90],
    weight: 4,
    cooldownYears: 8,
    // Only just after a move: a home bought this year or last.
    when: all(hasPet(), notInPrison, favouriteNot('horse'), (s) =>
      s.assets.homes.some((h) => h.livingIn && h.bought >= s.year - 1),
    ),
    text: 'The new place is lovely, the boxes are unpacked, and {pet} has decided the whole move was a personal betrayal.',
    choices: [
      {
        id: 'patience',
        label: 'Give them time and their old blanket',
        outcomes: [
          {
            chance: 3,
            text: 'It takes a fortnight, but one morning {pet} is sitting in the sunniest spot as if they chose the house themselves.',
            effects: [
              { pet: 'bond', delta: 4 },
              { stat: 'happiness', delta: 3 },
            ],
          },
          {
            chance: 1,
            text: 'Weeks pass and {pet} still sulks in the hallway. You start to suspect the old flat was better too.',
            effects: [
              { pet: 'bond', delta: -3 },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'calming',
        label: 'Buy the calming kit from the pet shop',
        requires: canAfford(60),
        outcomes: [
          {
            chance: 1,
            text: 'The kit contains a diffuser, a pamphlet and a toy shaped like a cloud. Something works, or perhaps it was just time; either way {pet} is home again.',
            effects: [
              { money: -60, kind: 'price' },
              { pet: 'bond', delta: 3 },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'pet_neighbour_complaint',
    kind: 'choice',
    category: 'social',
    ages: [18, 100],
    weight: 5,
    once: true,
    when: all(hasPet(), notInPrison),
    text: 'A note under your door, written in capitals, informs you that your {pet.kind} is "a menace to the whole building". It does not say how. It is signed "A Neighbour".',
    choices: [
      {
        id: 'charm',
        label: 'Knock on doors with biscuits',
        outcomes: [
          {
            chance: oddsBy('looks', 0.55),
            text: 'The culprit turns out to be the man at number six, who complains about everything and is disarmed completely by shortbread. He asks to meet {pet}.',
            effects: [{ stat: 'happiness', delta: 4 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Nobody admits to the note, but everybody eats the biscuits. The mystery stays open and slightly delicious.',
            effects: [{ stat: 'stress', delta: 2 }],
          },
        ],
      },
      {
        id: 'reply',
        label: 'Tape up a reply, also in capitals',
        outcomes: [
          {
            chance: 1,
            text: 'Your reply defends {pet} with the passion of a barrister. It is still on the noticeboard months later, and the building has quietly split into factions.',
            effects: [
              { stat: 'stress', delta: 4 },
              { stat: 'karma', delta: -2 },
            ],
          },
        ],
      },
    ],
  },

  // ---- Dogs ----
  {
    id: 'pet_dog_ate_expensive',
    kind: 'choice',
    category: 'money',
    ages: [18, 100],
    weight: 6,
    cooldownYears: 5,
    when: hasPet('dog'),
    text: '{dog} is lying very still beside the chewed remains of something you paid good money for. Possibly your good headphones. Possibly a shoe. The evidence is mostly gone.',
    choices: [
      {
        id: 'vet',
        label: 'Ring the vet, just in case',
        requires: canAfford(180),
        outcomes: [
          {
            chance: 1,
            text: 'The vet confirms {dog} will be fine and that nature will take its course. You pay for this advice and replace the headphones as well.',
            effects: [
              { money: -180, kind: 'price' },
              { stat: 'stress', delta: -2 },
              { pet: 'health', delta: 3, kind: 'dog' },
            ],
          },
        ],
      },
      {
        id: 'watch',
        label: 'Keep a close eye on things',
        outcomes: [
          {
            chance: 3,
            text: 'Two anxious days later, the matter resolves itself in the garden. {dog} looks proud. You look away.',
            effects: [{ stat: 'stress', delta: 3 }],
          },
          {
            chance: 1,
            text: '{dog} spends a miserable night and so do you, followed by an emergency visit that costs more than the shoe ever did.',
            effects: [
              { money: -400, kind: 'price' },
              { pet: 'health', delta: -8, kind: 'dog' },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'pet_dog_park',
    kind: 'choice',
    category: 'social',
    ages: [14, 90],
    weight: 6,
    cooldownYears: 4,
    when: hasPet('dog'),
    text: "At the park, {dog} has stolen a much larger dog's ball and refuses to give it back. The larger dog's owner is wearing a gilet and an expression.",
    choices: [
      {
        id: 'apologise',
        label: 'Apologise and retrieve the ball',
        outcomes: [
          {
            chance: 1,
            text: 'You chase {dog} in three wide circles while the whole park watches. The ball comes back damp; your dignity does not come back at all.',
            effects: [
              { stat: 'happiness', delta: -1 },
              { stat: 'health', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'laugh',
        label: 'Laugh it off with the owner',
        outcomes: [
          {
            chance: oddsBy('looks', 0.5),
            text: 'The gilet softens. By the end you are swapping names, and the dogs have agreed to share. You start bumping into each other most Saturdays.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { pet: 'bond', delta: 3, kind: 'dog' },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The owner does not laugh. They tell you about "recall training" for a long, cold minute. {dog} keeps the ball.',
            effects: [{ stat: 'stress', delta: 3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'pet_dog_postie',
    kind: 'notice',
    category: 'random',
    ages: [6, 100],
    weight: 5,
    once: true,
    when: hasPet('dog'),
    text: 'Every morning at ten past eight, {dog} defends the house against the postie with everything they have.',
    outcomes: [
      {
        chance: 2,
        text: 'One day the postie crouches and offers a biscuit through the gate. Now {dog} waits for them by the door every morning, tail going, a traitor.',
        effects: [
          { stat: 'happiness', delta: 4 },
          { pet: 'bond', delta: 2, kind: 'dog' },
        ],
      },
      {
        chance: 1,
        text: 'A card arrives saying your parcel could not be delivered "due to the dog". It is unclear how the postie wrote it while running.',
        effects: [{ stat: 'stress', delta: 2 }],
      },
    ],
  },

  // ---- Cats ----
  {
    id: 'pet_cat_gift',
    kind: 'choice',
    category: 'random',
    ages: [8, 100],
    weight: 6,
    cooldownYears: 4,
    when: hasPet('cat'),
    text: '{cat} has left a present on your pillow: something small, grey and no longer interested in anything. {cat} watches you for a reaction.',
    choices: [
      {
        id: 'praise',
        label: 'Thank them, gravely',
        outcomes: [
          {
            chance: 1,
            text: 'You say "thank you, {cat}" in your most sincere voice and dispose of the gift with gloves. {cat} purrs, a hunter honoured.',
            effects: [
              { pet: 'bond', delta: 5, kind: 'cat' },
              { stat: 'happiness', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'scold',
        label: 'Make your feelings known',
        outcomes: [
          {
            chance: 1,
            text: 'You explain at length that this is not acceptable. {cat} hears you out, then leaves a second, larger present in your shoe.',
            effects: [
              { pet: 'bond', delta: -3, kind: 'cat' },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'pet_cat_laptop',
    fromYear: 2008,
    kind: 'choice',
    category: 'work',
    ages: [18, 80],
    weight: 6,
    once: true,
    when: all(hasPet('cat'), hasJob),
    text: 'You are halfway through the most important video call of your year when {cat} walks across the keyboard, mutes you, and sits on the trackpad facing the camera.',
    choices: [
      {
        id: 'introduce',
        label: 'Introduce {cat} to everyone',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.55),
            text: 'The mood in the call lifts at once. Someone senior turns their camera round to show their own cat, and you somehow get everything you wanted.',
            effects: [{ performance: 4 }, { stat: 'happiness', delta: 4 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Everyone says "aww" and then the call goes on without you for the next ten minutes, while you try to find the unmute button under a cat.',
            effects: [{ performance: -2 }, { stat: 'stress', delta: 3 }],
          },
        ],
      },
      {
        id: 'remove',
        label: 'Lift {cat} off and carry on',
        outcomes: [
          {
            chance: 1,
            text: 'You remove {cat} with the calm of a professional. {cat} returns twice more and finally knocks your tea into your lap off-screen. Nobody notices but you.',
            effects: [
              { stat: 'stress', delta: 4 },
              { pet: 'bond', delta: -1, kind: 'cat' },
            ],
          },
        ],
      },
    ],
  },

  // ---- Parrot ----
  {
    id: 'pet_parrot_guests',
    kind: 'choice',
    category: 'social',
    ages: [18, 100],
    weight: 6,
    once: true,
    when: hasPet('parrot'),
    text: 'You have people round for dinner. During a lull, {parrot} clears their throat and says, in your exact voice, "Oh no, not THEM again."',
    choices: [
      {
        id: 'blame',
        label: 'Insist it is something from the television',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.4),
            text: 'Your story about a detective show is detailed and plausible. The guests seem to accept it, though one of them keeps glancing at the cage.',
            effects: [{ stat: 'stress', delta: 3 }],
            success: true,
          },
          {
            chance: 0.6,
            text: '{parrot} immediately adds your laugh, the one you do on the phone to your mother. The evening ends early.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'own',
        label: 'Laugh and own it',
        outcomes: [
          {
            chance: 1,
            text: 'You admit you said it, once, about someone else entirely. The table falls about laughing and the story is retold at every gathering for years. {parrot} takes a bow.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { pet: 'bond', delta: 2, kind: 'parrot' },
            ],
          },
        ],
      },
    ],
  },

  // ---- Hamster ----
  {
    id: 'pet_hamster_escape',
    kind: 'choice',
    category: 'random',
    ages: [6, 90],
    weight: 6,
    once: true,
    when: hasPet('hamster'),
    text: 'The cage door is open and {hamster} is gone. Somewhere in the house there is a very small, very pleased fugitive.',
    choices: [
      {
        id: 'trap',
        label: 'Set a trail of seeds and wait up',
        outcomes: [
          {
            chance: 3,
            text: 'At two in the morning you hear the rustle. {hamster} is found inside a slipper, cheeks packed with the bait, entirely unrepentant.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'stress', delta: -2 },
              { pet: 'bond', delta: 3, kind: 'hamster' },
            ],
          },
          {
            chance: 1,
            text: 'The seeds vanish night after night with no sign of {hamster}. On day four they are back in the cage, as if nothing happened. You decide not to ask.',
            effects: [{ stat: 'stress', delta: 3 }],
          },
        ],
      },
      {
        id: 'search',
        label: 'Take the sofa apart',
        outcomes: [
          {
            chance: 1,
            text: 'You find {hamster}, three lost pens, a coin from another country and the remote you blamed on your family. A productive emergency.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'health', delta: 1 },
            ],
          },
        ],
      },
    ],
  },

  // ---- Tortoise ----
  {
    id: 'pet_tortoise_will',
    kind: 'choice',
    category: 'family',
    ages: [40, 100],
    weight: 5,
    once: true,
    when: hasPet('tortoise'),
    text: 'Watching {tortoise} take twenty minutes to cross the lawn, it dawns on you: barring accidents, {tortoise} will still be crossing lawns long after you are gone.',
    choices: [
      {
        id: 'will',
        label: 'Name a guardian for {tortoise}',
        outcomes: [
          {
            chance: 1,
            text: 'You add a line to your affairs naming who gets {tortoise}, plus a page of care notes. It is the most organised you have ever been about anything.',
            effects: [
              { stat: 'stress', delta: -4 },
              { stat: 'happiness', delta: 2 },
              { flag: 'tortoise_in_will' },
            ],
          },
        ],
      },
      {
        id: 'ponder',
        label: 'Sit with the thought a while',
        outcomes: [
          {
            chance: 1,
            text: 'You sit beside {tortoise} on the grass until the sun moves. It is oddly comforting to share a garden with something in no hurry at all.',
            effects: [
              { stat: 'stress', delta: -5 },
              { pet: 'bond', delta: 3, kind: 'tortoise' },
            ],
          },
        ],
      },
    ],
  },

  // ---- Horse ----
  {
    id: 'pet_horse_show',
    kind: 'choice',
    category: 'social',
    ages: [10, 75],
    weight: 5,
    cooldownYears: 5,
    when: all(hasPet('horse'), notInPrison),
    text: 'The county show is on, with a novice class that {horse} could plausibly win, if {horse} feels like it on the day, which is never guaranteed.',
    choices: [
      {
        id: 'enter',
        label: 'Plait the mane and enter',
        outcomes: [
          {
            chance: oddsBy('health', 0.45),
            text: '{horse} floats round the ring as if born to it. You come home with a rosette, sunburn and a photograph you will frame.',
            effects: [
              { stat: 'happiness', delta: 7 },
              { pet: 'bond', delta: 5, kind: 'horse' },
            ],
            success: true,
          },
          {
            chance: 0.55,
            text: 'Halfway round, {horse} stops to eat a decorative flower arrangement. The judges are polite. The crowd loves it more than anything else all day.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'watch',
        label: 'Go and watch instead',
        outcomes: [
          {
            chance: 1,
            text: "You spend the day eating chips by the rail and quietly judging everyone else's horses against {horse}. {horse} would have won, obviously.",
            effects: [{ stat: 'happiness', delta: 3 }],
          },
        ],
      },
    ],
  },

  // ---- Fish ----
  {
    id: 'pet_fish_immortal',
    kind: 'choice',
    category: 'random',
    ages: [8, 100],
    weight: 5,
    once: true,
    when: all(hasPet('fish'), petPastPrime(0.6, 'fish')),
    text: '{fish} has now outlived two of your phones and a car. A friend who once looked after the tank asks, a little too casually, whether {fish} has always been that colour.',
    choices: [
      {
        id: 'ask',
        label: 'Ask them what exactly happened',
        outcomes: [
          {
            chance: 1,
            text: 'Long pause. They confess to a week-long holiday, a tragedy and a very fast trip to the pet shop. You have been loving an understudy for years.',
            effects: [
              { stat: 'happiness', delta: -1 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'nope',
        label: 'Decide you do not want to know',
        outcomes: [
          {
            chance: 1,
            text: '{fish} is {fish}. You tap the glass and {fish} comes over, as always. Some questions are better left in the tank.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { pet: 'bond', delta: 3, kind: 'fish' },
            ],
          },
        ],
      },
    ],
  },

  // ---- Children with pets ----
  {
    id: 'pet_ate_homework',
    kind: 'choice',
    category: 'school',
    ages: [7, 15],
    weight: 6,
    once: true,
    when: all(hasPet(), favouriteNot('fish')),
    text: 'Your geography project is in pieces, and {pet} is the only suspect. The trouble is, nobody has ever believed this excuse in the history of school.',
    choices: [
      {
        id: 'truth',
        label: 'Tell the teacher the truth',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.35),
            text: 'You bring the chewed remains in a sandwich bag as evidence. The teacher is so impressed by your commitment that you get an extension.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'smarts', delta: 1 },
            ],
            success: true,
          },
          {
            chance: 0.6,
            text: 'The teacher says "of course they did" in the voice adults use when they mean the opposite. You lose a lunchtime and gain a lifelong grudge against injustice.',
            effects: [
              { stat: 'happiness', delta: -3 },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'redo',
        label: 'Stay up and redo it',
        outcomes: [
          {
            chance: 1,
            text: 'You redo the whole thing at the kitchen table while {pet} watches, unbothered. The second version is better, which feels unfair to everyone.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { stat: 'stress', delta: 2 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'pet_show_and_tell',
    kind: 'choice',
    category: 'school',
    ages: [7, 12],
    weight: 6,
    once: true,
    when: all(hasPet(), favouriteNot('horse')),
    text: 'It is your turn for show-and-tell, and you have permission to bring in {pet} for the morning. Your whole class has been told. Expectations are high.',
    choices: [
      {
        id: 'bring',
        label: 'Bring {pet} in',
        outcomes: [
          {
            chance: 3,
            text: "For one glorious morning you are the most important person in your year. Thirty children learn your {pet.kind}'s name and will remember it longer than their times tables.",
            effects: [
              { stat: 'happiness', delta: 6 },
              { pet: 'bond', delta: 3 },
            ],
          },
          {
            chance: 1,
            text: '{pet} is a hit right up until a classmate tries to feed them a crayon and the room dissolves into chaos. You are still, somehow, a legend.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'talk',
        label: 'Bring photos and a talk instead',
        outcomes: [
          {
            chance: 1,
            text: 'You deliver five minutes on {pet}, with diagrams. Nobody else has done diagrams. The teacher puts one on the wall.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
    ],
  },

  // ---- Bittersweet ----
  {
    id: 'pet_slowing_down',
    kind: 'choice',
    category: 'family',
    ages: [8, 110],
    weight: 5,
    once: true,
    when: all(hasPet(), petPastPrime(0.75)),
    text: '{pet} is slower now. Longer rests, less appetite for adventure, a pause before things that used to be easy.',
    choices: [
      {
        id: 'comfort',
        label: 'Make life softer for them',
        outcomes: [
          {
            chance: 1,
            text: 'Softer routines, gentler days, more time spent simply nearby. {pet} does not know you are doing it on purpose, and that is the point.',
            effects: [
              { pet: 'health', delta: -4 },
              { pet: 'bond', delta: 6 },
              { stat: 'happiness', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'vet',
        label: 'Ask the vet what to expect',
        outcomes: [
          {
            chance: 1,
            text: 'The vet is kind and honest. There is no cure for getting old, only good days to collect. You start collecting them.',
            effects: [
              { pet: 'health', delta: -6 },
              { stat: 'stress', delta: 3 },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'pet_gone_missing',
    kind: 'choice',
    category: 'family',
    ages: [8, 100],
    weight: 4,
    once: true,
    when: all(hasPet(), favouriteNot('fish'), notInPrison),
    text: 'One evening {pet} is simply not there. The door was open for a minute, perhaps less. The house feels the wrong shape.',
    choices: [
      {
        id: 'posters',
        label: 'Put up posters and search every night',
        outcomes: [
          {
            chance: 3,
            text: 'On the sixth night a stranger rings: they have {pet} in their kitchen, a bit hungry and very pleased with themselves. You cry in front of a total stranger and do not mind.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: -2 },
              { pet: 'bond', delta: 8 },
            ],
          },
          {
            chance: 1,
            text: 'The posters fade in the rain. You keep the lead, or the bowl, or the little box, for a long time. You never find out where {pet} went.',
            effects: [
              { pet: 'lose', fate: 'ran off' },
              { stat: 'happiness', delta: -8 },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'wait',
        label: 'Leave the door open and wait',
        outcomes: [
          {
            chance: 1,
            text: 'At dawn, {pet} is back where they belong, looking as if nothing whatsoever has happened. You have never been so glad to be ignored.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'stress', delta: 2 },
              { pet: 'bond', delta: 2 },
            ],
          },
          {
            chance: 1,
            text: 'Days become weeks, and the door gets closed again. {pet} has gone somewhere you cannot follow, and you hope it is somewhere good.',
            effects: [
              { pet: 'lose', fate: 'ran off' },
              { stat: 'happiness', delta: -8 },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
    ],
  },
];
