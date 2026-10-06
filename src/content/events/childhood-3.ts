import type { EventDef } from '../../engine/events/types';
import { oddsBy } from './conditions';

/** Childhood, third pack: ages 3–12, small domestic adventures and first independence. */
export const CHILDHOOD_3_EVENTS: EventDef[] = [
  // ---- Ages 3–5 ----
  {
    id: 'kid3_hoover_monster',
    kind: 'choice',
    category: 'family',
    ages: [3, 5],
    weight: 7,
    once: true,
    bind: { dad: { role: 'father' } },
    text: '{dad.first} has wheeled out the hoover. It roars, it eats crumbs, and it is coming down the hall towards you with a long grey trunk.',
    choices: [
      {
        id: 'hide',
        label: 'Hide behind the curtains',
        outcomes: [
          {
            chance: 0.6,
            text: 'You stay behind the curtains until the monster is back in its cupboard. Your feet were visible the whole time, but nobody mentions it.',
            effects: [
              { stat: 'stress', delta: 3 },
              { stat: 'happiness', delta: -1 },
            ],
          },
          {
            chance: 0.4,
            text: '{dad.first} switches it off and lets you pat it. It is cold and smells of dust. The fear lingers, but it is smaller now.',
            effects: [
              { stat: 'stress', delta: -1 },
              { rel: 'dad', delta: 3, memory: 'introducing you to the hoover' },
            ],
          },
        ],
      },
      {
        id: 'ride',
        label: 'Demand to drive it',
        outcomes: [
          {
            chance: 0.7,
            text: '{dad.first} lets you steer while he pushes. You hoover one stripe of carpet with enormous pride and accept no help with the corners.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'discipline', delta: 2 },
              { rel: 'dad', delta: 4, memory: 'letting you drive the hoover' },
            ],
          },
          {
            chance: 0.3,
            text: 'You steer straight into a sock. The hoover makes a noise like a dying goose and stops forever. {dad.first} stares at it for a long time.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { rel: 'dad', delta: -2, memory: 'the sock that killed the hoover' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid3_big_puddle',
    kind: 'choice',
    category: 'family',
    ages: [3, 5],
    weight: 7,
    once: true,
    bind: { mum: { role: 'mother' } },
    text: 'You have new yellow wellies and there is a puddle at the park the size of a small lake. {mum.first} is saying "not that one" in a voice that knows it is losing.',
    choices: [
      {
        id: 'jump',
        label: 'Jump in with both feet',
        outcomes: [
          {
            chance: 0.6,
            text: 'The splash is magnificent. It reaches a pigeon, a bench and the back of your own head. You squelch home the happiest person in town.',
            effects: [
              { stat: 'happiness', delta: 7 },
              { rel: 'mum', delta: -1, memory: 'the great park puddle' },
            ],
          },
          {
            chance: 0.4,
            text: 'The puddle is deeper than it looks. Water pours in over the tops of the wellies, and you spend the walk home announcing how cold your socks are.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { stat: 'health', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'stick',
        label: 'Poke it with a stick instead',
        outcomes: [
          {
            chance: 1,
            text: 'You spend twenty minutes measuring the puddle with a stick and report your findings to {mum.first}, who praises your scientific restraint.',
            effects: [
              { stat: 'smarts', delta: 3 },
              { rel: 'mum', delta: 3, memory: 'your puddle report' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid3_snail_hotel',
    kind: 'choice',
    category: 'family',
    ages: [3, 6],
    weight: 6,
    once: true,
    bind: { mum: { role: 'mother' } },
    text: 'You have collected eleven snails from the garden and housed them in an ice-cream tub with a leaf each. You have named them all Kevin. {mum.first} has not yet looked inside.',
    choices: [
      {
        id: 'show',
        label: 'Proudly show her the Kevins',
        outcomes: [
          {
            chance: 0.5,
            text: '{mum.first} looks into the tub, breathes slowly, and helps you build them a proper home under the hedge. You visit them daily.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { rel: 'mum', delta: 4, memory: 'the Kevin hotel' },
            ],
          },
          {
            chance: 0.5,
            text: 'The lid was not on properly. The Kevins are on the ceiling, the curtains and the cat. {mum.first} says nothing, which is worse.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { rel: 'mum', delta: -3, memory: 'snails on the ceiling' },
            ],
          },
        ],
      },
      {
        id: 'release',
        label: 'Let them go back to the garden',
        outcomes: [
          {
            chance: 1,
            text: 'You tip the Kevins gently onto the lawn and wave. They leave at a speed that makes the goodbye very long. You feel grown-up about it.',
            effects: [
              { stat: 'karma', delta: 3 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid3_cape_shopping',
    kind: 'choice',
    category: 'family',
    ages: [3, 5],
    weight: 6,
    once: true,
    bind: { dad: { role: 'father' } },
    text: 'You have been wearing a cape for nine days. It was a bath towel. {dad.first} needs to go to the shops and asks, carefully, whether the cape could stay at home.',
    choices: [
      {
        id: 'wear',
        label: 'Wear the cape to the shops',
        outcomes: [
          {
            chance: 0.6,
            text: 'You patrol the frozen aisle with your fists on your hips. An old woman at the till thanks you for keeping the town safe, and you nod gravely.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { rel: 'dad', delta: 2, memory: 'the caped shopping trip' },
            ],
          },
          {
            chance: 0.4,
            text: 'The cape gets caught in the automatic door. It is not a dignified escape, but you make it look intentional.',
            effects: [
              { stat: 'happiness', delta: 1 },
              { stat: 'looks', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'retire',
        label: 'Hang up the cape',
        outcomes: [
          {
            chance: 1,
            text: 'You fold the towel with ceremony and leave it on your bed "in case." {dad.first} buys you a biscuit for being reasonable, which feels like a bribe, because it is.',
            effects: [
              { stat: 'discipline', delta: 3 },
              { rel: 'dad', delta: 3, memory: 'the retirement of the cape' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid3_nightmare',
    kind: 'choice',
    category: 'family',
    ages: [3, 6],
    weight: 7,
    once: true,
    bind: { mum: { role: 'mother' } },
    text: 'You wake up in the dark sure that something with too many elbows lives in the wardrobe. The landing light is very far away.',
    choices: [
      {
        id: 'run',
        label: "Run to {mum.first}'s room",
        outcomes: [
          {
            chance: 0.7,
            text: '{mum.first} lifts the duvet without fully waking. You fall asleep with your cold feet on her legs, and she pretends not to mind.',
            effects: [
              { stat: 'stress', delta: -3 },
              { stat: 'happiness', delta: 3 },
              { rel: 'mum', delta: 5, memory: 'the night of the wardrobe elbows' },
            ],
          },
          {
            chance: 0.3,
            text: '{mum.first} walks you back and opens the wardrobe. It holds coats, a broken kite and nothing with elbows. You sleep with the door open anyway.',
            effects: [
              { stat: 'stress', delta: -2 },
              { rel: 'mum', delta: 3, memory: 'checking the wardrobe for you' },
            ],
          },
        ],
      },
      {
        id: 'brave',
        label: 'Stare at the wardrobe until morning',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.5),
            success: true,
            text: 'You outlast the wardrobe. At dawn it is clearly just a wardrobe, and you feel you have won something important.',
            effects: [
              { stat: 'discipline', delta: 3 },
              { stat: 'health', delta: -1 },
            ],
          },
          {
            chance: 0.5,
            text: 'You fall asleep sitting up and wake with a crick in your neck. The wardrobe looks smug.',
            effects: [
              { stat: 'stress', delta: 3 },
              { stat: 'health', delta: -1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid3_shoelaces',
    kind: 'choice',
    category: 'family',
    ages: [4, 6],
    weight: 7,
    once: true,
    bind: { gran: { role: 'grandparent' } },
    text: '{gran.first} kneels on the hall rug and shows you the rabbit-ears method for tying laces. The rabbit goes round the tree, then down the hole, then nowhere you can follow.',
    choices: [
      {
        id: 'practise',
        label: 'Practise until it works',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.55),
            success: true,
            text: 'On the fourteenth go, the bow holds. You tie and untie it all afternoon. {gran.first} claps every single time.',
            effects: [
              { stat: 'discipline', delta: 4 },
              { stat: 'happiness', delta: 4 },
              { rel: 'gran', delta: 5, memory: 'teaching you to tie your laces' },
            ],
          },
          {
            chance: 0.45,
            text: 'You produce a knot so tight it has to be cut off. {gran.first} says it shows commitment and finds the scissors.',
            effects: [
              { stat: 'discipline', delta: 2 },
              { rel: 'gran', delta: 2, memory: 'the knot that needed scissors' },
            ],
          },
        ],
      },
      {
        id: 'velcro',
        label: 'Ask why Velcro is not enough',
        outcomes: [
          {
            chance: 1,
            text: '{gran.first} laughs and has no good answer. You keep your Velcro trainers another year and save hours of your life.',
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
    id: 'kid3_front_seat',
    kind: 'choice',
    category: 'family',
    ages: [5, 10],
    weight: 6,
    once: true,
    bind: { sib: { role: 'sibling', maxAge: 17 }, mum: { role: 'mother' } },
    text: 'The car is unlocked and there is one front seat. You and {sib.first} both see it at the same moment, three metres away, on the same path.',
    choices: [
      {
        id: 'sprint',
        label: 'Sprint for it',
        outcomes: [
          {
            chance: oddsBy('health', 0.5),
            success: true,
            text: 'You win by a hand on the door handle and ride the whole way to town like visiting royalty. {sib.first} kicks the back of your seat in silence.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { rel: 'sib', delta: -3, memory: 'the great front seat sprint' },
            ],
          },
          {
            chance: 0.5,
            text: 'You both get there at once and wedge yourselves into the door frame. {mum.first} puts you both in the back and the shopping in the front.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { rel: 'mum', delta: -2, memory: 'the car door wedging' },
            ],
          },
        ],
      },
      {
        id: 'rota',
        label: 'Propose a rota',
        outcomes: [
          {
            chance: 0.6,
            text: 'You draw up a front-seat calendar with coloured pens. {mum.first} sticks it on the fridge. It holds for years and causes only minor disputes.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { stat: 'karma', delta: 2 },
              { rel: 'sib', delta: 3, memory: 'the front-seat calendar' },
            ],
          },
          {
            chance: 0.4,
            text: '{sib.first} agrees to the rota, then takes the seat anyway on your first day. There is no court that will hear your case.',
            effects: [
              { stat: 'happiness', delta: -3 },
              { rel: 'sib', delta: -2, memory: 'breaking the front-seat rota' },
            ],
          },
        ],
      },
    ],
  },

  // ---- Ages 6–12 ----
  {
    id: 'kid3_library_card',
    kind: 'choice',
    category: 'school',
    ages: [6, 9],
    weight: 7,
    once: true,
    text: 'The librarian, a tall man called Mr Okonjo, slides a card across the desk with your name typed on it. You may take six books. Six. Of any kind.',
    choices: [
      {
        id: 'six',
        label: 'Take the full six',
        outcomes: [
          {
            chance: 0.7,
            text: 'You stagger home with six books stacked to your chin and read them under the covers by torchlight. The card becomes your most precious possession.',
            effects: [
              { stat: 'smarts', delta: 6 },
              { stat: 'happiness', delta: 3 },
              { skill: 'writing', delta: 2 },
              { flag: 'library_card' },
            ],
          },
          {
            chance: 0.3,
            text: 'One of the six is a car manual for a van your family does not own. You read it anyway and know far too much about gaskets.',
            effects: [{ stat: 'smarts', delta: 4 }, { flag: 'library_card' }],
          },
        ],
      },
      {
        id: 'one',
        label: 'Ask Mr Okonjo for the best one',
        outcomes: [
          {
            chance: 1,
            text: 'Mr Okonjo thinks hard and hands you a battered book about a girl who lives in a lighthouse. You return for the sequel two days later.',
            effects: [
              { stat: 'smarts', delta: 4 },
              { stat: 'happiness', delta: 4 },
              { flag: 'library_card' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid3_sticker_album',
    kind: 'choice',
    category: 'social',
    ages: [7, 11],
    weight: 7,
    once: true,
    bind: { cm: { role: 'classmate' } },
    text: 'The whole class is collecting Galaxy Beasts stickers. You need one shiny Moonwolf to finish the page. {cm.first} has two, and knows it.',
    choices: [
      {
        id: 'trade',
        label: 'Offer five of your doubles',
        outcomes: [
          {
            chance: 0.6,
            text: '{cm.first} counts the doubles twice and accepts. The Moonwolf goes in with a ceremony involving a ruler and a held breath.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { rel: 'cm', delta: 4, memory: 'the Moonwolf trade' },
            ],
          },
          {
            chance: 0.4,
            text: '{cm.first} takes the doubles and hands over a Moonwolf with a crease down the middle. You are now an expert in the word "condition".',
            effects: [
              { stat: 'happiness', delta: -2 },
              { stat: 'smarts', delta: 1 },
              { rel: 'cm', delta: -3, memory: 'the creased Moonwolf' },
            ],
          },
        ],
      },
      {
        id: 'lunch',
        label: 'Offer your pudding for a week',
        outcomes: [
          {
            chance: 1,
            text: 'The deal is struck. For five lunches you watch {cm.first} eat your pudding while you look at the Moonwolf. It feels about even.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'discipline', delta: 2 },
              { rel: 'cm', delta: 3, memory: 'a week of your puddings' },
            ],
          },
        ],
      },
      {
        id: 'quit',
        label: 'Declare stickers childish',
        outcomes: [
          {
            chance: 1,
            text: 'You announce you are done with stickers. Nobody believes you, including you, but the album goes in a drawer with its one empty space.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { stat: 'stress', delta: -1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid3_gran_card_game',
    kind: 'choice',
    category: 'family',
    ages: [6, 11],
    weight: 7,
    once: true,
    bind: { gran: { role: 'grandparent' } },
    text: '{gran.first} produces a soft old pack of cards and teaches you a game called Crow, which {gran.they} insist{gran.s} has no written rules and never has.',
    choices: [
      {
        id: 'learn',
        label: 'Learn properly',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.45),
            success: true,
            text: 'By the third hand you beat {gran.first} fair and square. {gran.They} look{gran.s} delighted and immediately demand a rematch for the honour of the family.',
            effects: [
              { stat: 'smarts', delta: 4 },
              { stat: 'happiness', delta: 4 },
              { rel: 'gran', delta: 6, memory: 'your first win at Crow' },
              { flag: 'cards_with_gran' },
            ],
          },
          {
            chance: 0.55,
            text: '{gran.first} wins every hand, invents two new rules mid-game, and teaches you that adults cheat at cards. It is the best afternoon in months.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { rel: 'gran', delta: 5, memory: 'losing at Crow all afternoon' },
              { flag: 'cards_with_gran' },
            ],
          },
        ],
      },
      {
        id: 'telly',
        label: 'Ask to watch telly instead',
        outcomes: [
          {
            chance: 1,
            text: '{gran.first} puts the cards away without a word and switches on a quiz show. You both shout wrong answers at it, but something small went unshared.',
            effects: [
              { stat: 'happiness', delta: 1 },
              { rel: 'gran', delta: -2, memory: 'the card game you skipped' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid3_empty_party',
    kind: 'choice',
    category: 'family',
    ages: [7, 11],
    weight: 5,
    once: true,
    bind: { mum: { role: 'mother' } },
    text: 'Your party started at two. It is half past three. There are twelve paper hats on twelve plates, and the only guests are you and {mum.first}.',
    choices: [
      {
        id: 'party_anyway',
        label: 'Have the party anyway',
        outcomes: [
          {
            chance: 0.6,
            text: '{mum.first} puts on a paper hat and plays every game with full commitment. You win musical chairs eleven times. Years later, it is the party you remember.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { rel: 'mum', delta: 8, memory: 'the birthday it was just the two of you' },
            ],
          },
          {
            chance: 0.4,
            text: 'At four the doorbell rings. One kid from your class, very sorry, wrong date on the invitation. It turns out that is enough.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { rel: 'mum', delta: 4, memory: 'the late-arriving party guest' },
              { status: 'friend' },
            ],
          },
        ],
      },
      {
        id: 'room',
        label: 'Go to your room',
        outcomes: [
          {
            chance: 1,
            text: '{mum.first} leaves a slice of cake outside your door and sits on the stairs until you open it. Neither of you talks about the hats.',
            effects: [
              { stat: 'happiness', delta: -5 },
              { stat: 'stress', delta: 3 },
              { rel: 'mum', delta: 4, memory: 'the cake on the stairs' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid3_talent_dare',
    kind: 'choice',
    category: 'school',
    ages: [8, 12],
    weight: 6,
    once: true,
    bind: { pal: { role: 'friend', maxAge: 17 } },
    text: '{pal.first} dares you to enter the school talent show. You have no talent prepared. Sign-ups close at the end of lunch, and lunch is eleven minutes long.',
    choices: [
      {
        id: 'sing',
        label: 'Sign up to sing',
        outcomes: [
          {
            chance: oddsBy('happiness', 0.45),
            success: true,
            text: 'You sing the only song you know all the words to, a jingle for a carpet shop. The hall joins in on the phone number. You are a legend by home time.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { skill: 'voice', delta: 3 },
              { rel: 'pal', delta: 4, memory: 'your carpet-shop song' },
            ],
          },
          {
            chance: 0.55,
            text: 'Your voice leaves your body halfway through the first line and does not return. The silence is huge. {pal.first} claps alone, loudly, which helps.',
            effects: [
              { stat: 'stress', delta: 4 },
              { stat: 'happiness', delta: -3 },
              { rel: 'pal', delta: 3, memory: 'clapping alone for you' },
            ],
          },
        ],
      },
      {
        id: 'drag_pal',
        label: 'Sign {pal.first} up too',
        outcomes: [
          {
            chance: 1,
            text: 'You do a double act that is mostly the two of you falling over on purpose. It comes third out of four, ahead of a boy who just stood there.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { rel: 'pal', delta: 6, memory: 'your talent show double act' },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Refuse the dare',
        outcomes: [
          {
            chance: 1,
            text: 'You watch from the third row. The winner juggles three oranges. You are quietly sure you could learn to juggle, and never do.',
            effects: [
              { stat: 'happiness', delta: -1 },
              { rel: 'pal', delta: -1, memory: 'the dare you turned down' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid3_painted_stones',
    kind: 'choice',
    category: 'money',
    ages: [7, 11],
    weight: 6,
    once: true,
    text: 'You have painted forty stones from the river with faces, ladybirds and one very angry sun. You plan to sell them door to door. Nobody has asked for a stone.',
    choices: [
      {
        id: 'doors',
        label: 'Knock on every door',
        outcomes: [
          {
            chance: oddsBy('looks', 0.5),
            success: true,
            text: 'The street is charmed. You sell twenty-two stones, mostly to pensioners, and come home with a jar of coins and a firm handshake technique.',
            effects: [
              { money: 25 },
              { stat: 'happiness', delta: 5 },
              { skill: 'art', delta: 2 },
              { flag: 'kid_stone_business' },
            ],
          },
          {
            chance: 0.5,
            text: 'Three doors in a row say no thank you. The fourth buys the angry sun out of pity. You learn that sales is mostly weather.',
            effects: [
              { money: 2 },
              { stat: 'happiness', delta: -2 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'gift',
        label: 'Give them away instead',
        outcomes: [
          {
            chance: 1,
            text: 'You leave a painted stone on every front wall in the street. For weeks people keep them on windowsills, and nobody knows it was you.',
            effects: [
              { stat: 'karma', delta: 5 },
              { stat: 'happiness', delta: 3 },
              { skill: 'art', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid3_stray_cat',
    kind: 'choice',
    category: 'family',
    ages: [6, 10],
    weight: 6,
    once: true,
    bind: { dad: { role: 'father' } },
    text: 'A thin grey cat with half an ear has started sitting by the back door at teatime. It belongs to nobody and looks at you as if it is keeping a list.',
    choices: [
      {
        id: 'feed',
        label: 'Feed it your fish fingers',
        outcomes: [
          {
            chance: 0.6,
            text: 'The cat eats, then sits on your shoe for a minute before it leaves. It comes back every evening. {dad.first} starts buying a tin of something "for no reason".',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'karma', delta: 3 },
              { rel: 'dad', delta: 3, memory: 'the half-eared cat at the back door' },
              { flag: 'fed_stray_cat' },
            ],
          },
          {
            chance: 0.4,
            text: 'The cat takes the fish finger, scratches your hand as a thank-you and leaves over the fence. You decide it was worth it.',
            effects: [
              { stat: 'karma', delta: 2 },
              { stat: 'health', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'tell',
        label: 'Tell {dad.first}',
        outcomes: [
          {
            chance: 1,
            text: '{dad.first} rings the vet, who finds a microchip. The cat is called Duncan and lives two streets away with a family who had given up hope.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'smarts', delta: 2 },
              { rel: 'dad', delta: 3, memory: 'getting Duncan home' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid3_woods_den',
    kind: 'choice',
    category: 'social',
    ages: [8, 12],
    weight: 7,
    once: true,
    bind: { pal: { role: 'friend', maxAge: 17 } },
    text: 'You and {pal.first} have found the perfect spot for a den in the woods behind the school: a fallen tree, a hollow and a rusty sign that once said something.',
    choices: [
      {
        id: 'build',
        label: 'Build it properly',
        outcomes: [
          {
            chance: 0.6,
            text: 'Three weekends of branches and a stolen bedsheet later, the den stands. It holds two people, one torch and a strict password nobody can remember.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'health', delta: 2 },
              { rel: 'pal', delta: 6, memory: 'building the den' },
            ],
          },
          {
            chance: 0.4,
            text: 'The roof falls in during the grand opening. Nobody is hurt, but {pal.first} gets a twig in the eyebrow and you both laugh until you are sick.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { injury: 2 },
              { rel: 'pal', delta: 4, memory: 'the night the den roof fell in' },
            ],
          },
        ],
      },
      {
        id: 'club',
        label: 'Start a secret club there',
        outcomes: [
          {
            chance: 1,
            text: 'The club has rules, a handshake and two members. Its first act is to ban younger siblings. Its second is to argue about the name for a month.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'smarts', delta: 1 },
              { rel: 'pal', delta: 5, memory: 'the secret club' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid3_wedding_attendant',
    kind: 'choice',
    category: 'family',
    ages: [6, 10],
    weight: 6,
    once: true,
    bind: { mum: { role: 'mother' } },
    text: 'A cousin is getting married and you are carrying the rings down the aisle on a satin cushion. {mum.first} has said, four times, "slowly, and do not swing it".',
    choices: [
      {
        id: 'slow',
        label: 'Walk at a funeral pace',
        outcomes: [
          {
            chance: 0.7,
            text: 'You take so long that the organist plays the tune twice. Every ring arrives. Relatives say "so serious" with great fondness.',
            effects: [
              { stat: 'discipline', delta: 3 },
              { rel: 'mum', delta: 4, memory: 'carrying the rings so carefully' },
            ],
          },
          {
            chance: 0.3,
            text: 'Halfway down the aisle you sneeze. One ring rolls under a pew and an uncle has to crawl after it in a suit. It becomes the story of the day.',
            effects: [
              { stat: 'happiness', delta: -1 },
              { stat: 'stress', delta: 3 },
              { rel: 'mum', delta: -1, memory: 'the ring under the pew' },
            ],
          },
        ],
      },
      {
        id: 'dance',
        label: 'Save your energy for the dance floor',
        outcomes: [
          {
            chance: 1,
            text: 'The rings arrive, and later you dance for three hours straight, knees sliding across the floor. You fall asleep under a table on a pile of coats.',
            effects: [
              { stat: 'happiness', delta: 7 },
              { stat: 'health', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid3_recorder',
    kind: 'choice',
    category: 'school',
    ages: [7, 10],
    weight: 7,
    once: true,
    bind: { teacher: { role: 'teacher' } },
    text: '{teacher.first} hands every child in the class a plastic recorder. By the end of the first lesson, the noise can be heard in the car park.',
    choices: [
      {
        id: 'practise',
        label: 'Practise every evening',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.55),
            success: true,
            text: 'Within a month you can play a whole tune without squeaking. {teacher.first} gives you the solo at assembly, and your family are only slightly relieved.',
            effects: [
              { skill: 'instrument', delta: 5 },
              { stat: 'happiness', delta: 3 },
              { rel: 'teacher', delta: 4, memory: 'your recorder solo' },
            ],
          },
          {
            chance: 0.45,
            text: 'You practise faithfully and still squeak on the same note every time. The household develops a flinch, but your fingers get faster.',
            effects: [
              { skill: 'instrument', delta: 3 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'lose',
        label: '"Lose" it behind the radiator',
        outcomes: [
          {
            chance: 1,
            text: 'The recorder vanishes. Nobody at home looks very hard for it. {teacher.first} sighs and hands you a triangle, which is somehow more embarrassing.',
            effects: [
              { stat: 'karma', delta: -1 },
              { rel: 'teacher', delta: -2, memory: 'your missing recorder' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid3_garden_camp',
    kind: 'choice',
    category: 'family',
    ages: [6, 10],
    weight: 6,
    once: true,
    bind: { dad: { role: 'father' } },
    text: '{dad.first} has put a tent up on the back lawn so the two of you can camp out. The house is twelve metres away, with its lights on and its toilet.',
    choices: [
      {
        id: 'all_night',
        label: 'Stay out all night',
        outcomes: [
          {
            chance: 0.6,
            text: 'You eat crisps by torchlight while {dad.first} names the stars, mostly wrongly. You hear a fox, an owl and his snoring, and you love all three.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { rel: 'dad', delta: 6, memory: 'camping on the back lawn' },
            ],
          },
          {
            chance: 0.4,
            text: 'At two in the morning a hedgehog snuffles past the tent and you both shriek. You finish the night on the sofa and agree to tell people you stayed out.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { rel: 'dad', delta: 4, memory: 'the hedgehog retreat' },
            ],
          },
        ],
      },
      {
        id: 'stories',
        label: 'Make him tell ghost stories',
        outcomes: [
          {
            chance: 1,
            text: '{dad.first} tells a ghost story so badly that it becomes funny, then so funny it becomes slightly scary again. You remember it for decades.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'stress', delta: 1 },
              { rel: 'dad', delta: 4, memory: 'his terrible ghost story' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid3_pancake_morning',
    kind: 'choice',
    category: 'family',
    ages: [8, 12],
    weight: 6,
    once: true,
    bind: { mum: { role: 'mother' } },
    text: 'You are up before everyone and have decided to make {mum.first} pancakes in bed. You have read half a recipe and you have a frying pan.',
    choices: [
      {
        id: 'cook',
        label: 'Go for it',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.5),
            success: true,
            text: 'The first pancake is a crime and you eat the evidence. The rest are round, golden and delivered with jam. {mum.first} looks at you as if you have grown.',
            effects: [
              { skill: 'cooking', delta: 4 },
              { stat: 'happiness', delta: 4 },
              { rel: 'mum', delta: 6, memory: 'pancakes in bed' },
            ],
          },
          {
            chance: 0.5,
            text: 'The smoke alarm reviews your cooking before anyone else can. {mum.first} arrives in her dressing gown, opens a window and eats the pancake anyway.',
            effects: [
              { skill: 'cooking', delta: 2 },
              { rel: 'mum', delta: 3, memory: 'the smoke alarm breakfast' },
            ],
          },
        ],
      },
      {
        id: 'cereal',
        label: 'Serve cereal with ceremony',
        outcomes: [
          {
            chance: 1,
            text: 'You bring cereal on a tray with a folded napkin and a flower from the garden that turns out to be a weed. It is received with real joy.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'karma', delta: 2 },
              { rel: 'mum', delta: 4, memory: 'breakfast on a tray' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kid3_teacher_comic',
    kind: 'choice',
    category: 'school',
    ages: [8, 12],
    weight: 6,
    once: true,
    bind: { teacher: { role: 'teacher' } },
    text: 'You have drawn a comic called "The Adventures of {teacher.first}", in which {teacher.first} fights a giant stapler. It has gone round half the class. It is now on {teacher.their} desk.',
    choices: [
      {
        id: 'own_up',
        label: 'Own up',
        outcomes: [
          {
            chance: 0.6,
            text: '{teacher.first} reads every page in silence, then says the stapler was drawn very well and asks for a copy. You still have to stay in at break.',
            effects: [
              { skill: 'art', delta: 3 },
              { stat: 'karma', delta: 2 },
              { rel: 'teacher', delta: 3, memory: 'the comic with the giant stapler' },
            ],
          },
          {
            chance: 0.4,
            text: '{teacher.first} does not find it funny and calls home. The comic stays in a drawer forever, which you consider censorship.',
            effects: [
              { stat: 'happiness', delta: -3 },
              { stat: 'discipline', delta: 2 },
              { rel: 'teacher', delta: -3, memory: 'your unkind comic' },
            ],
          },
        ],
      },
      {
        id: 'silent',
        label: 'Say nothing and look surprised',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.4),
            text: 'Nobody gives you away. You keep drawing, but in a secret notebook now, and the stapler returns in issue two.',
            effects: [
              { skill: 'art', delta: 3 },
              { stat: 'karma', delta: -2 },
            ],
          },
          {
            chance: 0.6,
            text: 'Your name is signed in the corner of every page. {teacher.first} points at it without a word, and the class enjoys this more than the comic.',
            effects: [
              { stat: 'happiness', delta: -3 },
              { stat: 'stress', delta: 2 },
              { rel: 'teacher', delta: -2, memory: 'the signed comic' },
            ],
          },
        ],
      },
    ],
  },
];
