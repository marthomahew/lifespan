import type { EventDef } from '../../engine/events/types';

type DecadeFields = 'kind' | 'weight' | 'once' | 'fromYear' | 'toYear' | 'ages';

/** A childhood moment pinned to the years it could have happened in. */
const era = (
  fromYear: number,
  toYear: number,
  ages: [number, number],
  e: Omit<EventDef, DecadeFields> & { kind?: EventDef['kind'] },
): EventDef => ({ kind: 'choice', weight: 12, once: true, fromYear, toYear, ages, ...e });

/**
 * Decade flavour for childhood and adolescence (5–17): the toys, crazes, screens and
 * pocket-money economics of the years a life is actually growing up in.
 */
export const DECADE_EVENTS: EventDef[] = [
  // ── 1950s ────────────────────────────────────────────────────────────────
  era(1953, 1959, [5, 12], {
    id: 'dec50_first_television',
    emoji: '📺',
    category: 'family',
    text: 'A television arrives in a box the size of a wardrobe. The neighbours come round to watch it, mostly the test card, and your father adjusts the aerial as if defusing a bomb.',
    choices: [
      {
        id: 'watch',
        label: 'Sit right up close to the screen',
        outcomes: [
          {
            chance: 1,
            text: 'You are told every evening that you will go square-eyed. You watch a puppet show, a man reading the news in a dinner jacket, and the little white dot shrinking at closedown.',
            effects: [{ stat: 'happiness', delta: 6 }, { flag: 'first_tv_1950s' }],
          },
        ],
      },
      {
        id: 'outside',
        label: 'Go back out to the street game',
        outcomes: [
          {
            chance: 1,
            text: 'Half your team has gone indoors to stare at the box. The ones left play a ferocious game of kerby until it is too dark to see the ball.',
            effects: [
              { stat: 'health', delta: 3 },
              { skill: 'athletics', delta: 2 },
            ],
          },
        ],
      },
    ],
  }),
  era(1950, 1959, [6, 13], {
    id: 'dec50_comics_swap',
    emoji: '📚',
    category: 'social',
    text: 'The boy two doors down has a whole suitcase of American comics his uncle brought back from the docks. He is open to trades, but drives a hard bargain.',
    choices: [
      {
        id: 'trade',
        label: 'Trade your marbles for a stack',
        outcomes: [
          {
            chance: 1,
            text: 'Your best glass alley goes for six comics with the covers still on. You read them under the blankets with a torch until the batteries die.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { skill: 'writing', delta: 1 },
              { status: 'friend' },
            ],
          },
        ],
      },
      {
        id: 'draw',
        label: 'Draw your own instead',
        outcomes: [
          {
            chance: 1,
            text: 'Your hero is called Captain Thunder and he can fly, but only on Tuesdays. Your teacher confiscates issue one and, you suspect, reads it.',
            effects: [
              { skill: 'art', delta: 3 },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
    ],
  }),
  era(1950, 1959, [5, 11], {
    id: 'dec50_sweets_off_ration',
    emoji: '🍬',
    category: 'money',
    // Threepenny bits and sherbet lemons: a British-coinage childhood.
    when: (s) => ['uk', 'ie', 'au', 'nz'].includes(s.player.country),
    text: 'You have a threepenny bit, the sweet shop has every jar in the window full, and the woman behind the counter is waiting with her paper bag and her patience running out.',
    choices: [
      {
        id: 'quarter',
        label: 'A quarter of sherbet lemons',
        outcomes: [
          {
            chance: 1,
            text: 'They last precisely the walk home. Your tongue goes numb and you are very happy.',
            effects: [
              { money: -1, kind: 'price' },
              { stat: 'happiness', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'save',
        label: 'Put it in the tin money box',
        outcomes: [
          {
            chance: 1,
            text: 'The tin rattles more satisfyingly every week. You open it with a butter knife at Christmas and buy everyone a present.',
            effects: [
              { stat: 'discipline', delta: 4 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
    ],
  }),
  era(1955, 1959, [12, 17], {
    id: 'dec50_rock_and_roll',
    emoji: '🎸',
    category: 'social',
    text: 'A record comes on at the youth club and every adult in the room looks personally offended. The drums sound like a train coming through the hall.',
    choices: [
      {
        id: 'dance',
        label: 'Get up and jive',
        outcomes: [
          {
            chance: 1,
            text: 'You have no idea what you are doing and neither does anyone else. The vicar unplugs the gramophone at nine and you walk home buzzing.',
            effects: [{ stat: 'happiness', delta: 7 }, { status: 'friend' }],
          },
        ],
      },
      {
        id: 'guitar',
        label: 'Save up for a cheap guitar',
        outcomes: [
          {
            chance: 1,
            text: 'It costs a summer of paper rounds and the strings sit a full inch off the neck. Your fingertips blister, then harden, then learn three chords.',
            effects: [
              { money: -12, kind: 'price' },
              { skill: 'instrument', delta: 4 },
              { flag: 'rock_and_roll_1950s' },
            ],
          },
        ],
      },
    ],
  }),

  // ── 1960s ────────────────────────────────────────────────────────────────
  era(1960, 1969, [5, 11], {
    id: 'dec60_space_race',
    emoji: '🚀',
    category: 'school',
    text: 'Your teacher wheels in the school television so the class can watch a rocket go up. Everyone counts down out loud, including the headmaster.',
    choices: [
      {
        id: 'astronaut',
        label: 'Decide to be an astronaut',
        outcomes: [
          {
            chance: 1,
            text: 'You build a helmet from a goldfish bowl and a lunar module from the coal bunker. You learn all the planets in order, and the speed of light, approximately.',
            effects: [
              { stat: 'smarts', delta: 4 },
              { stat: 'happiness', delta: 4 },
              { flag: 'space_kid_1960s' },
            ],
          },
        ],
      },
      {
        id: 'scrapbook',
        label: 'Start a scrapbook of cuttings',
        outcomes: [
          {
            chance: 1,
            text: 'Newspaper photographs of men in silver suits, glued in with flour paste. It smells a bit, but it is the most important book in the house.',
            effects: [
              { skill: 'writing', delta: 2 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
    ],
  }),
  era(1963, 1969, [9, 17], {
    id: 'dec60_beat_music',
    emoji: '🎶',
    category: 'social',
    text: 'Four lads with fringes are on the radio again and your older cousin has screamed herself hoarse at a concert. Your mother says the hair is a phase.',
    choices: [
      {
        id: 'single',
        label: 'Buy the new single',
        outcomes: [
          {
            chance: 1,
            text: 'You play it forty times on the family radiogram until the needle wears a groove into your father’s nerves. You know every word, including the ones you misheard.',
            effects: [
              { money: -2, kind: 'price' },
              { stat: 'happiness', delta: 6 },
              { skill: 'voice', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'band',
        label: 'Start a band with a tea-chest bass',
        outcomes: [
          {
            chance: 1,
            text: 'Your bass is a tea chest, a broom handle and a length of string. You play one gig, in a garage, to three dogs and a bemused milkman.',
            effects: [
              { skill: 'instrument', delta: 3 },
              { status: 'friend' },
              { stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
    ],
  }),
  era(1960, 1969, [5, 10], {
    id: 'dec60_street_summer',
    emoji: '🧒',
    category: 'social',
    text: 'It is the long summer holiday, the street is yours from breakfast to teatime, and the only rule is be back when the streetlights come on.',
    choices: [
      {
        id: 'den',
        label: 'Build a den on the waste ground',
        outcomes: [
          {
            chance: 1,
            text: 'Pallets, a carpet offcut and an old pram. It is the finest building in the county, and it has a password nobody can remember.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'health', delta: 2 },
              { status: 'friend' },
            ],
          },
        ],
      },
      {
        id: 'cart',
        label: 'Build a go-kart from pram wheels',
        outcomes: [
          {
            chance: 0.6,
            text: 'The steering is a length of washing line and the brakes are your shoes. It goes like the clappers down Hill Street and you are a legend by Friday.',
            effects: [
              { stat: 'happiness', delta: 7 },
              { skill: 'athletics', delta: 1 },
            ],
          },
          {
            chance: 0.4,
            text: 'The go-kart meets a hedge at full tilt. You come out scratched, triumphant, and covered in privet.',
            effects: [
              { stat: 'health', delta: -2 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
    ],
  }),

  // ── 1970s ────────────────────────────────────────────────────────────────
  era(1970, 1979, [5, 12], {
    id: 'dec70_colour_tv',
    emoji: '🌈',
    category: 'family',
    text: 'The family finally has a colour television, rented from the shop on the high street. Your dad keeps turning the colour knob until everyone on it is orange.',
    choices: [
      {
        id: 'saturday',
        label: 'Claim Saturday morning telly',
        outcomes: [
          {
            chance: 1,
            text: 'Cartoons, a phone-in, and a man getting a bucket of water poured on him. You sit through all of it in your dressing gown with a bowl of sugary cereal.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'discipline', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'brag',
        label: 'Tell everyone at school',
        outcomes: [
          {
            chance: 1,
            text: 'Three classmates come round for tea to see it in person. They are not disappointed, though one asks why the snooker is so green.',
            effects: [{ status: 'friend' }, { stat: 'happiness', delta: 4 }],
          },
        ],
      },
    ],
  }),
  era(1970, 1979, [8, 15], {
    id: 'dec70_chopper_bike',
    emoji: '🚲',
    category: 'social',
    text: 'The bike every child wants has a high seat, a long gear stick and handlebars like a motorbike. It is, objectively, a terrible bike, and you want one more than anything.',
    choices: [
      {
        id: 'round',
        label: 'Do a paper round to pay for it',
        outcomes: [
          {
            chance: 1,
            text: 'Six months of early mornings and a dog that hates you on Elm Road. The bike is wobbly at speed and absolutely magnificent.',
            effects: [
              { money: -30, kind: 'price' },
              { stat: 'discipline', delta: 5 },
              { stat: 'happiness', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'hand_me_down',
        label: 'Make do with your sister’s old bike',
        outcomes: [
          {
            chance: 1,
            text: 'It has a basket and a bell shaped like a ladybird. You paint it black, and ride it so hard that nobody dares mention the basket.',
            effects: [
              { skill: 'athletics', delta: 2 },
              { stat: 'health', delta: 2 },
            ],
          },
        ],
      },
    ],
  }),
  era(1972, 1979, [10, 17], {
    id: 'dec70_tape_the_charts',
    emoji: '📼',
    category: 'social',
    text: 'Sunday evening, the chart countdown is on the radio, and you have a blank cassette, a finger on the record button and absolutely nobody allowed to speak.',
    choices: [
      {
        id: 'record',
        label: 'Tape your favourite song off the radio',
        outcomes: [
          {
            chance: 0.6,
            text: 'You catch it clean, start to finish, with the DJ only talking over the last two seconds. You play that tape until the label peels off.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { skill: 'instrument', delta: 1 },
            ],
          },
          {
            chance: 0.4,
            text: 'Your mum shouts up the stairs that tea is ready, right in the middle of the chorus. It is preserved forever on the tape, and you never quite forgive the shepherd’s pie.',
            effects: [{ stat: 'happiness', delta: 2 }],
          },
        ],
      },
      {
        id: 'pencil',
        label: 'Rewind a chewed tape with a pencil',
        outcomes: [
          {
            chance: 1,
            text: 'Twenty patient minutes winding the ribbon back in. It plays again, slightly wobbly, like the singer is underwater.',
            effects: [
              { stat: 'discipline', delta: 2 },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
    ],
  }),
  era(1975, 1979, [6, 15], {
    id: 'dec70_space_film',
    emoji: '🌌',
    category: 'social',
    text: 'There is a queue round the block at the cinema for a film about spaceships and a farm boy. Everyone at school has seen it at least twice.',
    choices: [
      {
        id: 'see',
        label: 'Beg to be taken to see it',
        outcomes: [
          {
            chance: 1,
            text: 'The opening shot of a spaceship going over your head pins you to the seat. You spend the bus home making laser noises.',
            effects: [
              { money: -2, kind: 'price' },
              { stat: 'happiness', delta: 7 },
              { flag: 'sci_fi_kid' },
            ],
          },
        ],
      },
      {
        id: 'figures',
        label: 'Collect the little plastic figures',
        outcomes: [
          {
            chance: 1,
            text: 'You assemble most of the set, trade a duplicate robot at a premium, and stage battles across the living-room carpet for the next two years.',
            effects: [
              { money: -5, kind: 'price' },
              { stat: 'happiness', delta: 5 },
              { status: 'friend' },
            ],
          },
        ],
      },
    ],
  }),

  // ── 1980s ────────────────────────────────────────────────────────────────
  era(1981, 1989, [8, 17], {
    id: 'dec80_tape_computer',
    emoji: '💾',
    category: 'family',
    text: 'There is a home computer under the Christmas tree. It plugs into the telly, loads its games from a cassette, and screams like a fax machine for six minutes while it does.',
    choices: [
      {
        id: 'program',
        label: 'Type in a program from a magazine',
        outcomes: [
          {
            chance: 1,
            text: 'Four pages of code, typed one finger at a time over a weekend. One typo on line 340 and the game becomes a cat that moves diagonally. You fix it, and you are hooked.',
            effects: [
              { skill: 'programming', delta: 5 },
              { stat: 'smarts', delta: 3 },
              { flag: 'first_computer_1980s' },
            ],
          },
        ],
      },
      {
        id: 'games',
        label: 'Load a game and wait',
        outcomes: [
          {
            chance: 0.7,
            text: 'The screen flashes stripes for an age, the cassette whirrs, and then a tiny man in a hat appears. You play until two in the morning.',
            effects: [{ stat: 'happiness', delta: 6 }, { flag: 'first_computer_1980s' }],
          },
          {
            chance: 0.3,
            text: 'R Tape loading error. You adjust the volume, rewind, and try again. And again. Patience, you discover, is a skill.',
            effects: [
              { stat: 'discipline', delta: 3 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
    ],
  }),
  era(1980, 1989, [7, 17], {
    id: 'dec80_arcade',
    emoji: '👾',
    category: 'social',
    text: 'The seaside arcade is dark, loud and smells of chips. There is a pocket of coins in your shorts and a high-score table with someone called AAA at the top.',
    choices: [
      {
        id: 'highscore',
        label: 'Go for the high score',
        outcomes: [
          {
            chance: 0.4,
            text: 'One coin lasts forty minutes. A crowd of older kids gathers behind you. You enter your initials at the top of the table and walk out into the sunshine a different person.',
            effects: [
              { money: -1, kind: 'price' },
              { stat: 'happiness', delta: 8 },
              { flag: 'arcade_high_score' },
            ],
            success: true,
          },
          {
            chance: 0.6,
            text: 'The aliens descend faster than seems fair. Every coin you have disappears into the machine in a quarter of an hour.',
            effects: [
              { money: -3, kind: 'price' },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'grabber',
        label: 'Try the claw machine',
        outcomes: [
          {
            chance: 1,
            text: 'The claw closes on a pink teddy, lifts it, and lets it go with what you swear is a smirk. The machine is clearly rigged, and you try twice more anyway.',
            effects: [
              { money: -2, kind: 'price' },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
    ],
  }),
  era(1980, 1985, [7, 15], {
    id: 'dec80_rubiks_cube',
    emoji: '🧩',
    category: 'school',
    text: 'Everyone at school has a Rubik’s Cube, and nobody can do one. A rumour goes round that a boy in the fifth year solved it in under a minute.',
    choices: [
      {
        id: 'solve',
        label: 'Learn to solve it properly',
        outcomes: [
          {
            chance: 1,
            text: 'You find a booklet in the library and practise in every lesson you can get away with. By spring you can do it in three minutes, and are in demand.',
            effects: [
              { stat: 'smarts', delta: 4 },
              { skill: 'chess', delta: 1 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'stickers',
        label: 'Peel the stickers off and swap them',
        outcomes: [
          {
            chance: 1,
            text: 'Solved in five minutes, with a butter knife. Your little brother is very impressed. Your conscience mildly less so.',
            effects: [{ stat: 'happiness', delta: 3 }],
          },
        ],
      },
    ],
  }),
  era(1980, 1989, [10, 17], {
    id: 'dec80_walkman',
    emoji: '🎧',
    category: 'social',
    text: 'You have finally got a Walkman: orange foam headphones, a belt clip, and the whole world now has a soundtrack. The batteries last about a bus journey and a half.',
    choices: [
      {
        id: 'mixtape',
        label: 'Make a mixtape for your best friend',
        outcomes: [
          {
            chance: 1,
            text: 'Two evenings of pausing, rewinding and arguing with yourself about the running order. The inlay card is hand-lettered in four colours of felt tip. Your friend plays it to death.',
            effects: [
              { status: 'friend' },
              { skill: 'art', delta: 2 },
              { stat: 'happiness', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'walk',
        label: 'Take long walks with it, alone',
        outcomes: [
          {
            chance: 1,
            text: 'You walk around the town with your hands in your pockets, a person in a film. Nobody has ever felt the things you feel, you are sure of it.',
            effects: [
              { stat: 'stress', delta: -4 },
              { stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
    ],
  }),

  // ── 1990s ────────────────────────────────────────────────────────────────
  era(1990, 1999, [6, 13], {
    id: 'dec90_game_boy',
    emoji: '🎮',
    category: 'social',
    text: 'There is a Game Boy in the back of the car for the long drive to the coast. The screen is green, the batteries are borrowed from the remote control, and the game is about falling blocks.',
    choices: [
      {
        id: 'play',
        label: 'Play all the way there',
        outcomes: [
          {
            chance: 1,
            text: 'You see nothing of the countryside, but you see the blocks in your sleep for a week. Your best line is four rows at once and nobody saw it.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'link',
        label: 'Link up with your cousin',
        outcomes: [
          {
            chance: 1,
            text: 'A cable between the two machines and a lot of shouting. You trade a monster you have two of for one you have never seen, and the deal of the century is struck at a motorway services.',
            effects: [{ status: 'friend' }, { stat: 'happiness', delta: 5 }],
          },
        ],
      },
    ],
  }),
  era(1996, 1999, [6, 12], {
    id: 'dec90_tamagotchi',
    emoji: '🥚',
    category: 'school',
    text: 'The Tamagotchi craze hits school. Yours is a small egg-shaped creature on a keyring that needs feeding, cleaning and putting to bed, mostly during maths.',
    choices: [
      {
        id: 'care',
        label: 'Look after it devotedly',
        outcomes: [
          {
            chance: 1,
            text: 'It reaches an astonishing age. You hand it to your nan for a day while you are on a school trip and she keeps it alive out of sheer grandmotherly duty.',
            effects: [
              { stat: 'discipline', delta: 3 },
              { stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'forget',
        label: 'Forget it in your coat pocket',
        outcomes: [
          {
            chance: 1,
            text: 'You find it in March, a little ghost on the screen. You hold a small funeral at break with three mourners and press reset.',
            effects: [{ stat: 'happiness', delta: -1 }, { status: 'friend' }],
          },
        ],
      },
    ],
  }),
  era(1995, 1999, [10, 17], {
    id: 'dec90_dial_up',
    emoji: '☎️',
    category: 'family',
    text: 'The family is connected to the internet. The modem screeches, warbles and hisses like a robot being sick, and nobody can use the telephone while you are on.',
    choices: [
      {
        id: 'chat',
        label: 'Visit a chat room',
        outcomes: [
          {
            chance: 1,
            text: 'Strangers typing in capital letters, a person called DragonLord99 asking everyone their age, and you leaving quickly. You spend the rest of the hour reading about sharks.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'homepage',
        label: 'Build your own homepage',
        outcomes: [
          {
            chance: 1,
            text: 'A starry background, a hit counter that reads 7 (all you), and an animated construction worker. It is under construction for the rest of its life.',
            effects: [
              { skill: 'programming', delta: 4 },
              { skill: 'art', delta: 1 },
              { flag: 'first_homepage_1990s' },
            ],
          },
        ],
      },
      {
        id: 'phone_bill',
        label: 'Stay on all night downloading one song',
        outcomes: [
          {
            chance: 1,
            text: 'It reaches 98 per cent at four in the morning, and then your mother picks up the phone downstairs. The bill comes in and you hear about it for a month.',
            effects: [
              { stat: 'stress', delta: 4 },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
    ],
  }),
  era(1990, 1999, [8, 15], {
    id: 'dec90_playstation_saturdays',
    emoji: '💿',
    category: 'social',
    text: 'Your friend’s family has a PlayStation, and on Saturdays half the street ends up in their front room, cross-legged, waiting for a go on the racing game.',
    choices: [
      {
        id: 'turns',
        label: 'Wait your turn patiently',
        outcomes: [
          {
            chance: 1,
            text: 'You get one lap in three hours and spend the rest offering expert advice nobody asked for. It is the best Saturday of the month, every month.',
            effects: [{ status: 'friend' }, { stat: 'happiness', delta: 5 }],
          },
        ],
      },
      {
        id: 'save_up',
        label: 'Save up for one of your own',
        outcomes: [
          {
            chance: 1,
            text: 'Birthday money, Christmas money, a car-wash empire on your road. You buy it second-hand from a lad in the paper, memory card included, someone else’s save files and all.',
            effects: [
              { money: -60, kind: 'price' },
              { stat: 'discipline', delta: 4 },
              { stat: 'happiness', delta: 6 },
            ],
          },
        ],
      },
    ],
  }),

  // ── 2000s ────────────────────────────────────────────────────────────────
  era(2000, 2006, [10, 17], {
    id: 'dec00_snake_phone',
    emoji: '🐍',
    category: 'social',
    text: 'You get your first mobile phone: a brick-shaped thing with a monochrome screen, a ringtone you composed yourself, and a game about a snake that eats dots.',
    choices: [
      {
        id: 'snake',
        label: 'Get the top score on Snake',
        outcomes: [
          {
            chance: 1,
            text: 'Your snake grows so long it fills the screen and eats itself. You show your score to anyone who will look, which is two people.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'discipline', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'credit',
        label: 'Spend all your credit messaging friends',
        outcomes: [
          {
            chance: 1,
            text: 'Ten pence a message, abbreviated to the bone to save money. The credit is gone in three days. You were saying nothing at all, but it felt like everything.',
            effects: [
              { money: -10, kind: 'price' },
              { status: 'friend' },
              { stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
    ],
  }),
  era(2000, 2008, [11, 17], {
    id: 'dec00_burn_a_cd',
    emoji: '💽',
    category: 'social',
    text: 'The family computer can now burn CDs. You spend an evening choosing eighteen songs for a friend, written in marker on the disc in your neatest handwriting.',
    choices: [
      {
        id: 'burn',
        label: 'Burn the CD for your friend',
        outcomes: [
          {
            chance: 0.7,
            text: 'It plays in their stereo first time. They put track six on at every party for the next two years and act like they found it themselves.',
            effects: [{ status: 'friend' }, { stat: 'happiness', delta: 5 }],
          },
          {
            chance: 0.3,
            text: 'The burner fails at 94 per cent and turns your disc into a shiny coaster. You make three more coasters before one works. The household is very well protected from mugs.',
            effects: [
              { stat: 'stress', delta: 3 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'ipod',
        label: 'Save for an iPod instead',
        outcomes: [
          {
            chance: 1,
            text: 'A thousand songs in your pocket and a little white click-wheel. You wear the white earphones even when nothing is playing.',
            effects: [
              { money: -150, kind: 'price' },
              { stat: 'happiness', delta: 6 },
              { flag: 'ipod_kid_2000s' },
            ],
          },
        ],
      },
    ],
  }),
  era(2000, 2009, [12, 17], {
    id: 'dec00_messenger_after_school',
    emoji: '💬',
    category: 'social',
    text: 'You get home from school, say goodbye to your friends, then sign in to Messenger and talk to the same friends for three more hours. Your display name has song lyrics in it.',
    choices: [
      {
        id: 'nudge',
        label: 'Nudge everyone until they reply',
        outcomes: [
          {
            chance: 1,
            text: 'The window shakes, the chat fills with capital letters, and someone sends a picture of a cat that will be funny for exactly one week. You are very late doing your homework.',
            effects: [
              { status: 'friend' },
              { stat: 'happiness', delta: 4 },
              { stat: 'smarts', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'appear_offline',
        label: 'Appear invisible and do homework',
        outcomes: [
          {
            chance: 1,
            text: 'You set yourself to invisible and watch everyone talk about you, which is not as much as you hoped. You finish the history essay early, at least.',
            effects: [
              { stat: 'smarts', delta: 3 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
    ],
  }),
  era(2006, 2009, [6, 14], {
    id: 'dec00_wii_bowling',
    emoji: '🎳',
    category: 'family',
    text: 'There is a Wii in the living room and, to everyone’s amazement, your grandmother is the best bowler in the family. She takes it very seriously.',
    choices: [
      {
        id: 'challenge',
        label: 'Challenge her to a rematch',
        outcomes: [
          {
            chance: 1,
            text: 'You lose. You lose again. She bowls a perfect game in her slippers and asks if you want to try tennis instead.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { skill: 'athletics', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'strap',
        label: 'Ignore the wrist strap',
        outcomes: [
          {
            chance: 1,
            text: 'The remote leaves your hand at speed and finds the telly. It survives, but there is now a small crack across the weather presenter’s face forever.',
            effects: [
              { stat: 'stress', delta: 3 },
              { stat: 'happiness', delta: 1 },
            ],
          },
        ],
      },
    ],
  }),

  // ── 2010s ────────────────────────────────────────────────────────────────
  era(2010, 2019, [7, 15], {
    id: 'dec10_tutorial_rabbit_hole',
    emoji: '▶️',
    category: 'school',
    text: 'You discover that YouTube has a tutorial for absolutely everything, presented by someone in a bedroom who begins every video with “Hey guys”.',
    choices: [
      {
        id: 'ukulele',
        label: 'Teach yourself the ukulele',
        outcomes: [
          {
            chance: 1,
            text: 'Four chords, sixty songs. You annoy the whole household for a month and then, suddenly, you are actually rather good.',
            effects: [
              { skill: 'instrument', delta: 4 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'code',
        label: 'Learn to make a simple game',
        outcomes: [
          {
            chance: 1,
            text: 'Your first game is a square that jumps over other squares. It is the greatest thing ever made, and you make your parents play it twice.',
            effects: [
              { skill: 'programming', delta: 4 },
              { stat: 'smarts', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'baking',
        label: 'Attempt a three-tier cake',
        outcomes: [
          {
            chance: 1,
            text: 'The tutorial took eight minutes. Yours takes six hours, two trips to the shop and a tower that leans like it has had a long day. It tastes wonderful.',
            effects: [
              { skill: 'cooking', delta: 4 },
              { money: -15, kind: 'price' },
            ],
          },
        ],
      },
    ],
  }),
  era(2012, 2019, [12, 17], {
    id: 'dec10_phones_at_dinner',
    emoji: '📱',
    category: 'family',
    text: 'Your parents have introduced a basket at dinner, and every smartphone in the house goes into it, theirs included. Yours keeps buzzing in there like an angry bee.',
    choices: [
      {
        id: 'comply',
        label: 'Put it in the basket and talk',
        outcomes: [
          {
            chance: 1,
            text: 'It is awkward for three dinners. On the fourth, your dad tells a story about his first job that nobody has ever heard, and you laugh until you cry.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'stress', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'sneak',
        label: 'Smuggle it under the table',
        outcomes: [
          {
            chance: 0.5,
            text: 'You keep up with the group chat with heroic stealth. Nobody notices, except your little brother, who will hold this over you for years.',
            effects: [
              { stat: 'discipline', delta: -2 },
              { stat: 'happiness', delta: 2 },
            ],
          },
          {
            chance: 0.5,
            text: 'Your phone lights up your lap like a torch. Your mum holds out her hand without a word. You get it back on Thursday.',
            effects: [
              { stat: 'stress', delta: 3 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
    ],
  }),
  era(2011, 2019, [6, 13], {
    id: 'dec10_block_building',
    emoji: '⛏️',
    category: 'social',
    text: 'Everyone in your class plays the same game made of blocks, and recess is spent explaining your world to anyone standing still: the castle, the moat, the lava trap.',
    choices: [
      {
        id: 'build',
        label: 'Build an entire city',
        outcomes: [
          {
            chance: 1,
            text: 'Months of work: a cathedral, a railway, a working calculator made of redstone that adds up to seven. Your dad pretends to understand it and is quietly impressed.',
            effects: [
              { skill: 'programming', delta: 3 },
              { skill: 'art', delta: 2 },
              { stat: 'smarts', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'server',
        label: 'Start a server with friends',
        outcomes: [
          {
            chance: 1,
            text: 'Five of you, one shared world, and long negotiations about who burned down whose house. Your friendships are forged in pixelated fire.',
            effects: [{ status: 'friend' }, { stat: 'happiness', delta: 5 }],
          },
        ],
      },
    ],
  }),
  era(2016, 2016, [8, 15], {
    id: 'dec10_monster_hunt',
    emoji: '🗺️',
    category: 'social',
    text: 'An app has everyone walking around the park staring at their phones, hunting cartoon monsters. Your dad has started asking for walks.',
    choices: [
      {
        id: 'hunt',
        label: 'Hunt every evening',
        outcomes: [
          {
            chance: 1,
            text: 'You walk further this summer than in the rest of your life combined, and meet a retired postman who has caught one of everything.',
            effects: [
              { stat: 'health', delta: 4 },
              { status: 'friend' },
              { stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'skip',
        label: 'Roll your eyes at the whole thing',
        outcomes: [
          {
            chance: 1,
            text: 'By autumn the craze has gone as fast as it came, and you are glad to have been above it. Slightly, secretly, you would have liked a dragon.',
            effects: [
              { stat: 'discipline', delta: 1 },
              { stat: 'happiness', delta: 1 },
            ],
          },
        ],
      },
    ],
  }),

  // ── 2020s ────────────────────────────────────────────────────────────────
  era(2020, 2021, [5, 17], {
    id: 'dec20_remote_school',
    emoji: '💻',
    category: 'school',
    text: 'School has moved to the kitchen table. Your teacher is a small frozen square on a video call, and half the class has their camera off and is definitely still in bed.',
    choices: [
      {
        id: 'focus',
        label: 'Keep your camera on and work',
        outcomes: [
          {
            chance: 1,
            text: 'You do every worksheet, mostly while your parent hisses into a different video call in the next room. Your teacher sends you a gold star emoji, which you treasure.',
            effects: [
              { stat: 'smarts', delta: 4 },
              { stat: 'discipline', delta: 3 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'mute',
        label: 'Mute, camera off, back to sleep',
        outcomes: [
          {
            chance: 1,
            text: 'You are marked present for weeks without saying a word. Then your teacher asks you a question directly, and the silence is enormous.',
            effects: [
              { stat: 'smarts', delta: -2 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'bake',
        label: 'Bake bread with the family instead',
        outcomes: [
          {
            chance: 1,
            text: 'The whole country seems to be making sourdough at once. Yours rises like a brick, but by the third loaf it is genuinely good.',
            effects: [
              { skill: 'cooking', delta: 4 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
    ],
  }),
  era(2020, 2029, [11, 17], {
    id: 'dec20_short_videos',
    emoji: '🎬',
    category: 'social',
    text: 'There is a dance trend going round and your friends have decided to film it in the school car park. It is fifteen seconds long and requires eleven takes.',
    choices: [
      {
        id: 'join',
        label: 'Learn the dance and join in',
        outcomes: [
          {
            chance: 1,
            text: 'You finally nail it on take twelve, and someone’s dog walks right through the middle of the shot. It is the best version, everyone agrees.',
            effects: [
              { status: 'friend' },
              { stat: 'happiness', delta: 5 },
              { skill: 'athletics', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'direct',
        label: 'Film and edit it yourself',
        outcomes: [
          {
            chance: 1,
            text: 'You cut it on your phone with transitions so slick it looks professional. Three friends ask you to do theirs next.',
            effects: [
              { skill: 'art', delta: 3 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
    ],
  }),
  era(2022, 2029, [12, 17], {
    id: 'dec20_ai_homework',
    emoji: '🤖',
    category: 'school',
    text: 'An AI chatbot can write your history essay in eight seconds. Your teacher has started setting essays in class, with pen and paper, like it is the nineteenth century.',
    choices: [
      {
        id: 'own_work',
        label: 'Write it yourself',
        outcomes: [
          {
            chance: 1,
            text: 'It takes a whole evening and your hand aches. But your teacher writes “This sounds like you” in the margin, which turns out to be the highest compliment available.',
            effects: [
              { skill: 'writing', delta: 3 },
              { stat: 'smarts', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'tutor',
        label: 'Use it as a tutor, not a ghostwriter',
        outcomes: [
          {
            chance: 1,
            text: 'You ask it to explain the causes of the war like you are five, then like you are fifteen. For the first time, the topic actually makes sense.',
            effects: [
              { stat: 'smarts', delta: 4 },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'copy',
        label: 'Let it write the whole thing',
        outcomes: [
          {
            chance: 0.5,
            text: 'You get a B-plus for an essay you have never read. When asked about it in class, you cannot remember what side anyone was on.',
            effects: [
              { stat: 'discipline', delta: -3 },
              { stat: 'smarts', delta: -1 },
            ],
          },
          {
            chance: 0.5,
            text: 'The essay cites three books that do not exist. Your teacher circles them in red with a small, tired question mark.',
            effects: [
              { stat: 'stress', delta: 4 },
              { stat: 'discipline', delta: 1 },
            ],
          },
        ],
      },
    ],
  }),
  era(2020, 2029, [6, 13], {
    id: 'dec20_pocket_money_card',
    emoji: '💳',
    category: 'money',
    text: 'Your pocket money now arrives on a children’s bank card with an app your parents watch like hawks. You have never actually touched a coin.',
    choices: [
      {
        id: 'goal',
        label: 'Set a savings goal in the app',
        outcomes: [
          {
            chance: 1,
            text: 'A little jar fills up on the screen week by week. When it is full you buy a skateboard, and it feels like you built it out of patience.',
            effects: [
              { stat: 'discipline', delta: 4 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'skins',
        label: 'Spend it all on in-game outfits',
        outcomes: [
          {
            chance: 1,
            text: 'Your character now dances in a banana costume. Your bank balance is zero, and you are surprised to find you feel slightly cheated.',
            effects: [
              { money: -20, kind: 'price' },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
    ],
  }),
];
