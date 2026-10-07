import type { EventDef } from '../../engine/events/types';
import type { GameState } from '../../engine/types';

const actor = (s: GameState): boolean => s.career.jobId === 'film_actor' && !s.legal.prison;
const billed =
  (min: number) =>
  (s: GameState): boolean =>
    actor(s) && s.career.level >= min;
const unbilled = (s: GameState): boolean => actor(s) && s.career.level <= 1;

/** Life as a film actor: auditions, sets, awards, fans and the long shadow of an old interview. */
export const ACTING_EVENTS: EventDef[] = [
  {
    id: 'act_audition_room',
    kind: 'choice',
    category: 'work',
    emoji: '🎭',
    ages: [16, 80],
    weight: 8,
    cooldownYears: 3,
    when: unbilled,
    text: 'Audition number forty this year. The casting director eats a salad through your monologue and asks, without looking up, if you can "do it again, but as a different person".',
    choices: [
      {
        id: 'again',
        label: 'Do it again, completely differently',
        outcomes: [
          {
            chance: 0.45,
            text: 'You play it as a tired ferry captain for no reason you can explain. The salad stops. Two days later you get a callback, then the part.',
            effects: [
              { stat: 'happiness', delta: 8 },
              { money: 8000, kind: 'wage' },
              { performance: 6 },
            ],
            success: true,
          },
          {
            chance: 0.55,
            text: 'The second version is the first version with a limp. "Thanks, we\'ll be in touch," she says, which in this building means the opposite.',
            effects: [
              { stat: 'stress', delta: 5 },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'walk',
        label: 'Thank her and walk out',
        outcomes: [
          {
            chance: 0.25,
            text: 'Your exit is the best acting anyone saw all day. Her assistant chases you down the corridor with a callback sheet.',
            effects: [{ stat: 'happiness', delta: 6 }, { performance: 4 }],
            success: true,
          },
          {
            chance: 0.75,
            text: 'You buy yourself a pastry on the way home and feel dignified for almost an hour. The part goes to someone who did it again.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { stat: 'stress', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'act_screaming_director',
    kind: 'choice',
    category: 'work',
    emoji: '📢',
    ages: [16, 80],
    weight: 6,
    cooldownYears: 5,
    when: actor,
    bind: { dir: { role: 'boss' } },
    text: 'Take thirty-one. {dir.first} hurls a megaphone into a hedge and screams that you are "acting like someone who has read about sadness in a leaflet". The crew studies its shoes.',
    choices: [
      {
        id: 'push',
        label: 'Use it: pour the fury into the scene',
        outcomes: [
          {
            chance: 0.6,
            text: 'Take thirty-two is raw enough that the sound recordist cries. {dir.first} says nothing, which from {dir.them} is a standing ovation.',
            effects: [
              { performance: 8 },
              { stat: 'stress', delta: 6 },
              { rel: 'dir', delta: 6, memory: 'the take where you finally broke' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You go so big that a pigeon leaves the set. Take thirty-three, thirty-four, thirty-five. You eat dinner in your trailer with your head in your hands.',
            effects: [
              { stat: 'stress', delta: 10 },
              { stat: 'happiness', delta: -5 },
              { rel: 'dir', delta: -3, memory: 'the night of fifty takes' },
            ],
          },
        ],
      },
      {
        id: 'stand',
        label: 'Tell them to speak to you like a person',
        outcomes: [
          {
            chance: 0.5,
            text: 'A long silence, then a stiff apology. The rest of the shoot is quieter, and three crew members buy you coffee without saying why.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'karma', delta: 3 },
              { rel: 'dir', delta: -2, memory: 'being told off in front of the crew' },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'You are "difficult" now, a word that travels faster than any film. Your next two auditions start with someone asking how you are with notes.',
            effects: [
              { performance: -6 },
              { stat: 'stress', delta: 6 },
              { rel: 'dir', delta: -10, memory: 'being shouted down by an actor on set' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'act_method_role',
    kind: 'choice',
    category: 'work',
    emoji: '🌲',
    ages: [18, 70],
    weight: 6,
    cooldownYears: 6,
    when: billed(1),
    text: 'The new role is a hermit who survives a winter alone in the mountains. The director hints, heavily, that the part would be "more honest" if you actually did.',
    choices: [
      {
        id: 'woods',
        label: 'Live in the woods for two months',
        outcomes: [
          {
            chance: 0.55,
            text: 'You come back thin, bearded in spirit, and able to skin things. Critics use the word "feral" as a compliment. Your family uses it otherwise.',
            effects: [
              { performance: 10 },
              { fame: 4 },
              { stat: 'health', delta: -6 },
              { stat: 'happiness', delta: -3 },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'Week three: you fall into a stream in a cold snap and spend the rest of the method in a cottage hospital with a drip and no beard.',
            effects: [{ injury: 6 }, { stat: 'health', delta: -8 }, { stat: 'stress', delta: 6 }],
          },
        ],
      },
      {
        id: 'starve',
        label: 'Just lose the weight on set',
        outcomes: [
          {
            chance: 1,
            text: 'Broth, black coffee and resentment for ten weeks. You look gaunt on camera and thunderous at catering, and the performance is solid.',
            effects: [
              { performance: 5 },
              { stat: 'health', delta: -4 },
              { stat: 'happiness', delta: -4 },
              { stat: 'looks', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'act',
        label: 'Act it. That is the job.',
        outcomes: [
          {
            chance: 1,
            text: 'You turn up warm, fed and prepared, and pretend to be cold. Nobody writes a profile about your process. You sleep beautifully.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'stress', delta: -4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'act_costar_feud',
    kind: 'choice',
    category: 'work',
    emoji: '😤',
    ages: [16, 80],
    weight: 6,
    cooldownYears: 5,
    when: billed(1),
    bind: { co: { role: 'coworker' } },
    text: '{co.first} keeps "accidentally" stepping into your light and has started ad-libbing over your best line. The make-up team has picked sides. So has the catering van.',
    choices: [
      {
        id: 'confront',
        label: 'Have it out in their trailer',
        outcomes: [
          {
            chance: 0.5,
            text: 'Ten tense minutes, then {co.first} admits {co.they} are terrified of being replaced. You split a bag of crisps and run lines.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { rel: 'co', delta: 12, memory: 'the talk in the trailer that cleared the air' },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'Voices are raised, a mirror is slammed, and an intern sells the audio. The gossip columns adore you both for a fortnight, for the wrong reasons.',
            effects: [
              { stat: 'stress', delta: 8 },
              { fame: 2 },
              { rel: 'co', delta: -12, memory: 'the shouting match that ended up in the papers' },
            ],
          },
        ],
      },
      {
        id: 'outact',
        label: 'Say nothing and out-act them',
        outcomes: [
          {
            chance: 0.55,
            text: 'You find your light, hold it, and make every scene quietly yours. The editor notices. In the final cut, {co.first} is mostly an elbow.',
            effects: [
              { performance: 7 },
              { stat: 'happiness', delta: 4 },
              { rel: 'co', delta: -5, memory: 'losing every scene to you in the edit' },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'The cold war lasts the entire shoot. You grind your teeth at night and a dentist charges you for the privilege.',
            effects: [
              { stat: 'stress', delta: 7 },
              { money: -1200, kind: 'price' },
              { rel: 'co', delta: -6, memory: 'a whole shoot without a word between you' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'act_romance_rumour',
    kind: 'choice',
    category: 'fame',
    emoji: '📰',
    ages: [18, 80],
    adultsOnly: true,
    weight: 6,
    cooldownYears: 6,
    when: billed(2),
    bind: { co: { role: 'coworker', minAge: 18 } },
    text: 'A long-lens photo of you and {co.first} sharing a laugh over a script becomes a front page headline: "SET SIZZLER". You were discussing a scene about a tax audit.',
    choices: [
      {
        id: 'deny',
        label: 'Issue a firm denial',
        outcomes: [
          {
            chance: 1,
            text: 'Your statement is so firm it reads like a confession. The rumour runs another week, then a royal wedding somewhere kindly takes the front pages.',
            effects: [
              { stat: 'stress', delta: 5 },
              { rel: 'co', delta: 2, memory: 'the headline you both had to live down' },
            ],
          },
        ],
      },
      {
        id: 'coy',
        label: 'Smile and say nothing at the premiere',
        outcomes: [
          {
            chance: 0.6,
            text: 'The mystery sells tickets. The studio sends you both flowers, and {co.first} sends you a note that just says "well played".',
            effects: [
              { fame: 4 },
              { money: 20000, kind: 'wage' },
              { rel: 'co', delta: 6, memory: 'playing along with the rumour together' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: "{co.first} hadn't agreed to play along, and says so in a television interview. You look smug and wrong in the same photograph.",
            effects: [
              { fame: -2 },
              { stat: 'happiness', delta: -5 },
              { rel: 'co', delta: -10, memory: 'being used to sell a film' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'act_franchise_offer',
    kind: 'choice',
    category: 'work',
    emoji: '🦸',
    ages: [18, 60],
    weight: 7,
    cooldownYears: 8,
    when: billed(2),
    text: 'A nine-picture deal to play a man who can talk to bridges. The cape weighs eleven kilos. The money has a number of zeros your accountant has to count twice.',
    choices: [
      {
        id: 'sign',
        label: 'Sign for all nine pictures',
        outcomes: [
          {
            chance: 0.6,
            text: 'The first film makes a fortune and children dress as you at Halloween. The critics are polite in the way one is polite about weather.',
            effects: [
              { money: 2000000, kind: 'wage' },
              { fame: 8 },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The film flops so hard the sequels quietly evaporate. You keep the signing fee and the cape, which now hangs in your hall like a warning.',
            effects: [
              { money: 500000, kind: 'wage' },
              { fame: -2 },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'refuse',
        label: 'Decline: you want to be taken seriously',
        outcomes: [
          {
            chance: 1,
            text: 'You turn it down and do a play about grief in a room above a pub. Two serious directors call you afterwards. The bridges find another friend.',
            effects: [
              { performance: 6 },
              { stat: 'happiness', delta: 3 },
              { stat: 'karma', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'act_arthouse_festival',
    kind: 'choice',
    category: 'fame',
    emoji: '🎞️',
    ages: [16, 80],
    weight: 6,
    cooldownYears: 6,
    when: actor,
    text: 'A first-time director with a borrowed camera wants you for a black-and-white film about a lighthouse keeper and a goat. There is no pay. There is a goat.',
    choices: [
      {
        id: 'yes',
        label: 'Do it for nothing',
        outcomes: [
          {
            chance: 0.4,
            text: 'The film wins the top prize at the festival in the south of France. You stand on a stage in a hired suit while a goat-shaped trophy is pressed into your arms.',
            effects: [
              { fame: 8 },
              { performance: 8 },
              { stat: 'happiness', delta: 10 },
              { job: 'promote' },
            ],
            success: true,
          },
          {
            chance: 0.6,
            text: 'It plays one festival at nine in the morning to eleven people and a reviewer who calls it "a goat with ambitions". You are proud of it anyway.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { money: -2000, kind: 'price' },
            ],
          },
        ],
      },
      {
        id: 'no',
        label: 'You have bills, and an aversion to goats',
        outcomes: [
          {
            chance: 1,
            text: 'You do a week on a crime drama instead, playing Man In Car. It pays the rent. The goat goes on without you.',
            effects: [{ money: 6000, kind: 'wage' }],
          },
        ],
      },
    ],
  },
  {
    id: 'act_awards_nomination',
    kind: 'choice',
    category: 'fame',
    emoji: '🏆',
    ages: [18, 80],
    weight: 6,
    cooldownYears: 6,
    when: billed(2),
    text: 'At five in the morning your phone rings: you are nominated for the big award. Your publicist wants a campaign. Your mother wants to know what you will wear.',
    choices: [
      {
        id: 'campaign',
        label: 'Campaign hard: lunches, panels, handshakes',
        outcomes: [
          {
            chance: 0.4,
            text: 'Two hundred lunches later they read out your name. Your speech is short, your knees are unreliable, and the statuette is heavier than it looks.',
            effects: [
              { fame: 12 },
              { stat: 'happiness', delta: 14 },
              { job: 'promote' },
              { flag: 'won_big_award' },
            ],
            success: true,
          },
          {
            chance: 0.6,
            text: 'You lose to someone who played a historical figure with a limp. Your gracious-loser face is so good it should have its own nomination.',
            effects: [{ fame: 4 }, { stat: 'stress', delta: 8 }, { stat: 'happiness', delta: -4 }],
          },
        ],
      },
      {
        id: 'aloof',
        label: 'Let the work speak for itself',
        outcomes: [
          {
            chance: 0.2,
            text: 'Against every prediction, you win. Your speech, written on a napkin in the taxi, is the most quoted of the night.',
            effects: [
              { fame: 12 },
              { stat: 'happiness', delta: 12 },
              { job: 'promote' },
              { flag: 'won_big_award' },
            ],
            success: true,
          },
          {
            chance: 0.8,
            text: 'You go, clap for the winner and leave before dessert. Being nominated, it turns out, is a perfectly good evening out.',
            effects: [{ fame: 3 }, { stat: 'stress', delta: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'act_red_carpet',
    kind: 'choice',
    category: 'fame',
    emoji: '👗',
    ages: [16, 80],
    weight: 6,
    cooldownYears: 4,
    when: billed(1),
    text: 'Halfway down the red carpet at your premiere, something structural in your outfit gives way with an audible twang. Two hundred cameras turn as one.',
    choices: [
      {
        id: 'own',
        label: 'Strike a pose and own it',
        outcomes: [
          {
            chance: 0.6,
            text: 'You hold the torn hem aloft like a trophy. The photo runs everywhere under "the only person having fun". Three designers call your agent.',
            effects: [{ fame: 5 }, { stat: 'happiness', delta: 6 }, { stat: 'looks', delta: 1 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The pose makes it worse, structurally. You end the evening wrapped in a borrowed tablecloth, and the tablecloth gets the better reviews.',
            effects: [
              { stat: 'happiness', delta: -6 },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'flee',
        label: 'Retreat to the toilets with safety pins',
        outcomes: [
          {
            chance: 1,
            text: 'You miss the carpet and most of the film, but emerge pinned and composed. One photographer gets a shot of your back disappearing. It is oddly flattering.',
            effects: [{ stat: 'stress', delta: 3 }, { fame: -1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'act_paparazzi',
    kind: 'choice',
    category: 'fame',
    emoji: '📸',
    ages: [16, 80],
    weight: 7,
    cooldownYears: 4,
    when: billed(3),
    text: 'A photographer has been parked outside your house for three days, living on crisps and patience. Today he follows you to the dry cleaner and photographs your receipt.',
    choices: [
      {
        id: 'confront',
        label: 'Walk over and grab the camera',
        outcomes: [
          {
            chance: 1,
            text: 'The camera keeps recording as you grab it, so the whole world gets a very close-up nostril. His lawyer sends a letter. Yours sends a bill.',
            effects: [
              { money: -40000, kind: 'price' },
              { stat: 'stress', delta: 8 },
              { fame: 2 },
              { stat: 'karma', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'tea',
        label: 'Bring him a cup of tea',
        outcomes: [
          {
            chance: 0.6,
            text: 'He looks stricken, drinks it, and leaves the next morning. The photo he sells is of you in slippers, smiling, holding out a mug.',
            effects: [{ stat: 'karma', delta: 4 }, { fame: 2 }, { stat: 'stress', delta: -3 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'He accepts the tea and stays another week. You have accidentally adopted a paparazzo. He starts taking his shoes off in your porch.',
            effects: [
              { stat: 'stress', delta: 5 },
              { stat: 'karma', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'disguise',
        label: 'Go out in a hat and enormous sunglasses',
        outcomes: [
          {
            chance: 1,
            text: 'You look exactly like a famous person trying not to look like a famous person. The photo is captioned "Hiding Something?" You were buying lightbulbs.',
            effects: [{ fame: 1 }, { stat: 'happiness', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'act_own_stunt',
    kind: 'choice',
    category: 'work',
    emoji: '🚁',
    ages: [18, 70],
    weight: 6,
    cooldownYears: 5,
    when: billed(1),
    text: 'The script says you leap from a moving train onto a hay cart. The stunt double is already warming up. You have been doing lunges in your trailer for a week, just in case.',
    choices: [
      {
        id: 'self',
        label: 'Insist on doing it yourself',
        outcomes: [
          {
            chance: 0.55,
            text: 'You land in the hay with an undignified "hup" and the crew bursts into applause. The behind-the-scenes clip makes you look like a lunatic, in a good way.',
            effects: [{ fame: 4 }, { stat: 'happiness', delta: 8 }, { performance: 4 }],
            success: true,
          },
          {
            chance: 0.45,
            text: 'The hay cart is in the wrong place by about a metre. You spend six weeks in a cast, and the studio insurers develop a personal interest in you.',
            effects: [{ injury: 10 }, { stat: 'happiness', delta: -6 }, { performance: -5 }],
          },
        ],
      },
      {
        id: 'double',
        label: 'Let the professional do it',
        outcomes: [
          {
            chance: 1,
            text: 'The double lands it in one take. You watch from a folding chair with a sandwich, and in the trailer edit it is somehow still you.',
            effects: [
              { stat: 'stress', delta: -2 },
              { stat: 'karma', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'act_typecast_villain',
    kind: 'choice',
    category: 'work',
    emoji: '🦹',
    ages: [20, 80],
    weight: 5,
    cooldownYears: 7,
    when: billed(1),
    text: 'You played one memorable murderer and now every script you receive has you lurking in a stairwell. A child at the park hides behind a bin when you wave.',
    choices: [
      {
        id: 'lean',
        label: 'Lean in: become the best villain alive',
        outcomes: [
          {
            chance: 1,
            text: 'You perfect the slow head-turn and the soft menacing "hello". You are never out of work again, and never once allowed to win.',
            effects: [{ money: 60000, kind: 'wage' }, { performance: 4 }, { fame: 2 }],
          },
        ],
      },
      {
        id: 'romcom',
        label: 'Fight for a part in a romantic comedy',
        outcomes: [
          {
            chance: 0.35,
            text: 'You land it, and audiences spend the whole film waiting for you to stab someone. When you just hand over flowers, the cinema gasps. Critics call it daring.',
            effects: [{ fame: 5 }, { stat: 'happiness', delta: 8 }, { performance: 6 }],
            success: true,
          },
          {
            chance: 0.65,
            text: 'The producers watch your romantic audition in total silence and cast someone with friendlier eyebrows. You go home and glare at the mirror, menacingly.',
            effects: [
              { stat: 'happiness', delta: -5 },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'act_old_interview',
    kind: 'choice',
    category: 'fame',
    emoji: '🗞️',
    ages: [25, 80],
    weight: 5,
    cooldownYears: 8,
    when: billed(2),
    text: 'A magazine digs up an interview you gave at twenty-two in which you said several genuinely stupid things about people who wear sandals, and one about something that matters.',
    choices: [
      {
        id: 'apologise',
        label: 'Apologise properly, in your own words',
        outcomes: [
          {
            chance: 0.65,
            text: 'You write it yourself, without a lawyer, and it sounds like a person. The story dies in three days. A sandal company sends you a pair, as a peace offering.',
            effects: [
              { stat: 'karma', delta: 4 },
              { stat: 'stress', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.35,
            text: 'Your apology is picked apart word by word for a week. A film you were attached to finds someone "less complicated" for the role.',
            effects: [{ fame: -4 }, { stat: 'stress', delta: 8 }, { performance: -4 }],
          },
        ],
      },
      {
        id: 'deflect',
        label: 'Say you were misquoted',
        outcomes: [
          {
            chance: 0.3,
            text: 'It works. Nobody can find the original tape and the story fades. You feel faintly grubby every time you see a sandal.',
            effects: [{ stat: 'karma', delta: -3 }],
            success: true,
          },
          {
            chance: 0.7,
            text: 'The journalist still has the tape, and plays it on the radio. Now there are two stories, and the second one is worse.',
            effects: [
              { fame: -6 },
              { stat: 'stress', delta: 10 },
              { stat: 'karma', delta: -3 },
              { notoriety: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'act_streaming_series',
    kind: 'choice',
    category: 'work',
    emoji: '📺',
    ages: [18, 80],
    weight: 7,
    cooldownYears: 6,
    fromYear: 2012,
    when: billed(1),
    text: 'A streaming service wants you for an eight-part prestige drama about a family of grim lawyers. Every episode is seventy minutes long and filmed in the rain.',
    choices: [
      {
        id: 'sign',
        label: 'Sign on for the series',
        outcomes: [
          {
            chance: 0.55,
            text: "The whole world binges it in one weekend. Strangers greet you by your character's name and ask whether you really did forge the will.",
            effects: [
              { fame: 7 },
              { money: 120000, kind: 'wage' },
              { stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'It drops the same week as a cooking show about soup and vanishes without trace. The algorithm recommends it to your aunt, who stops at episode two.',
            effects: [
              { money: 80000, kind: 'wage' },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'film',
        label: 'Hold out for cinema',
        outcomes: [
          {
            chance: 1,
            text: 'You hold out for a big-screen role. The series becomes a sensation with someone else in your raincoat. You see the billboards on every bus.',
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
    id: 'act_theatre_run',
    kind: 'choice',
    category: 'work',
    emoji: '🎟️',
    ages: [18, 80],
    weight: 6,
    cooldownYears: 6,
    when: billed(1),
    text: 'A grand old theatre offers you a sixteen-week run in a tragedy that ends with everyone dead, eight shows a week. The matinee audience is mostly coach parties.',
    choices: [
      {
        id: 'tread',
        label: 'Tread the boards',
        outcomes: [
          {
            chance: 0.6,
            text: 'By week six you could die on stage in your sleep, and you nearly do on a Wednesday. The reviews are glowing and the curtain calls get longer.',
            effects: [
              { performance: 8 },
              { fame: 3 },
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'On opening night a sword fails to retract and you take it in the forearm. The audience think it is the best stage blood they have ever seen.',
            effects: [{ injury: 5 }, { fame: 2 }, { stat: 'stress', delta: 6 }],
          },
        ],
      },
      {
        id: 'pass',
        label: 'Eight shows a week? Pass.',
        outcomes: [
          {
            chance: 1,
            text: 'You decline and spend the spring doing voice-overs for a documentary about otters. It is, frankly, lovely.',
            effects: [
              { money: 15000, kind: 'wage' },
              { stat: 'stress', delta: -4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'act_agent_drops',
    kind: 'choice',
    category: 'work',
    emoji: '📉',
    ages: [16, 80],
    weight: 6,
    cooldownYears: 6,
    when: unbilled,
    text: 'Your agent takes you to lunch, which agents only do for two reasons. They are not signing a new deal with you. They pay for the soup and say "it\'s a numbers thing".',
    choices: [
      {
        id: 'hustle',
        label: 'Represent yourself for a while',
        outcomes: [
          {
            chance: 0.4,
            text: 'You print your own headshots and phone casting offices directly, cheerfully, relentlessly. One of them gives in and casts you as a vicar.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { money: 5000, kind: 'wage' },
              { performance: 4 },
            ],
            success: true,
          },
          {
            chance: 0.6,
            text: 'A season of unanswered emails and one audition for a yoghurt that went to a dog. You learn more about voicemail than any person should.',
            effects: [
              { stat: 'happiness', delta: -6 },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'new',
        label: 'Sign with a small agency above a launderette',
        outcomes: [
          {
            chance: 1,
            text: 'Your new agent smells faintly of fabric softener and genuinely believes in you. The work is small but steady, and somebody answers when you call.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { money: 3000, kind: 'wage' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'act_supermarket',
    kind: 'notice',
    category: 'fame',
    emoji: '🛒',
    ages: [16, 80],
    weight: 6,
    cooldownYears: 4,
    when: billed(2),
    text: 'In the supermarket a woman stops you by the frozen peas, squints, and says she knows you from somewhere.',
    outcomes: [
      {
        chance: 0.5,
        text: 'She works it out: the film where you die in the first scene. She makes you sign her shopping list, then tells everyone in the checkout queue.',
        effects: [{ stat: 'happiness', delta: 5 }, { fame: 1 }],
      },
      {
        chance: 0.5,
        text: 'After a long interrogation she decides you went to school with her son. You agree, because it is easier, and leave without the peas.',
        effects: [{ stat: 'happiness', delta: 2 }],
      },
    ],
  },
  {
    id: 'act_fan_convention',
    kind: 'choice',
    category: 'fame',
    emoji: '🧝',
    ages: [18, 80],
    weight: 6,
    cooldownYears: 5,
    when: billed(1),
    text: 'A fan convention invites you to sign photos for a weekend. Hundreds of people in your old costume will queue for hours, and some of them have built your spaceship out of cardboard.',
    choices: [
      {
        id: 'go',
        label: 'Go, and stay until the last fan',
        outcomes: [
          {
            chance: 1,
            text: 'You sign until your wrist seizes, hear a hundred stories about how a film got someone through a bad year, and fly home tired and oddly moved.',
            effects: [
              { money: 25000, kind: 'wage' },
              { stat: 'happiness', delta: 8 },
              { stat: 'karma', delta: 3 },
              { fame: 2 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'cash',
        label: 'Go, sign fast, charge for photos',
        outcomes: [
          {
            chance: 1,
            text: 'You are efficient, smiling and gone by Saturday lunchtime. A fan writes a long and hurt essay about it, which you never read but somehow hear about.',
            effects: [{ money: 45000, kind: 'wage' }, { stat: 'karma', delta: -3 }, { fame: -1 }],
          },
        ],
      },
      {
        id: 'skip',
        label: 'Politely decline',
        outcomes: [
          {
            chance: 1,
            text: 'You spend the weekend gardening instead. The convention puts a cardboard cut-out of you in your chair, and it is reportedly very gracious.',
            effects: [{ stat: 'stress', delta: -4 }],
          },
        ],
      },
    ],
  },
  {
    id: 'act_improvised_line',
    kind: 'notice',
    category: 'fame',
    emoji: '💬',
    ages: [16, 80],
    weight: 5,
    cooldownYears: 8,
    when: billed(1),
    text: 'On the last day of a shoot, exhausted, you forget your line and say the first thing that comes into your head. The director keeps it.',
    outcomes: [
      {
        chance: 0.5,
        text: 'Your accidental line becomes a catchphrase. People shout it at you from passing cars, on mugs, at weddings. You no longer remember what the real line was.',
        effects: [{ fame: 6 }, { stat: 'happiness', delta: 6 }, { performance: 5 }],
        success: true,
      },
      {
        chance: 0.5,
        text: 'The line survives the edit and no one notices. Only you know, and you smile every single time the film plays on a long flight.',
        effects: [{ stat: 'happiness', delta: 4 }],
      },
    ],
  },
  {
    id: 'act_accent_role',
    kind: 'choice',
    category: 'work',
    emoji: '🗣️',
    ages: [16, 80],
    weight: 6,
    cooldownYears: 5,
    when: billed(1),
    text: 'Your next part is a fisherman from a remote island with an accent so particular that the dialect coach only knows two people who still have it. Both are in their nineties.',
    choices: [
      {
        id: 'live',
        label: 'Move to the island for a month',
        outcomes: [
          {
            chance: 0.6,
            text: 'You come back saying "aye" in a way that worries your friends. The islanders watch the premiere in the village hall and give you a standing ovation.',
            effects: [{ performance: 7 }, { fame: 3 }, { stat: 'happiness', delta: 5 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'A month of wind and herring, and your accent still drifts somewhere south-west by the third scene. A critic maps its journey in a column.',
            effects: [{ stat: 'stress', delta: 5 }, { fame: -1 }],
          },
        ],
      },
      {
        id: 'wing',
        label: 'Wing it with a recording',
        outcomes: [
          {
            chance: 0.3,
            text: 'Somehow it works. Your fisherman sounds like a fisherman, or at least like nobody else, which on screen is close enough.',
            effects: [{ performance: 4 }],
            success: true,
          },
          {
            chance: 0.7,
            text: 'Your accent is described in one review as "an international incident". The island\'s council writes a formal letter of complaint.',
            effects: [{ fame: -2 }, { stat: 'happiness', delta: -5 }, { performance: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'act_foreign_advert',
    kind: 'choice',
    category: 'work',
    emoji: '🥫',
    ages: [18, 80],
    weight: 5,
    cooldownYears: 6,
    when: billed(2),
    text: 'An offer from abroad: a fortune to appear in adverts for a fizzy canned coffee that will only ever air on the other side of the world. Nobody at home will ever see it. Probably.',
    choices: [
      {
        id: 'take',
        label: 'Take the coffee money',
        outcomes: [
          {
            chance: 0.6,
            text: 'Three days of drinking the coffee and gasping with delight on cue. Over there you are now the coffee person, and fans bow politely at airports.',
            effects: [
              { money: 300000, kind: 'wage' },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The advert leaks home. A late-night host plays your gasp on a loop for a week. The money is still very good, you remind yourself.',
            effects: [{ money: 300000, kind: 'wage' }, { fame: -2 }, { stat: 'stress', delta: 5 }],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Decline: you have integrity',
        outcomes: [
          {
            chance: 1,
            text: 'You turn it down. A rival takes the job, and you see them in the papers grinning beside a coffee can the size of a lorry.',
            effects: [
              { stat: 'karma', delta: 2 },
              { stat: 'happiness', delta: -1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'act_lifetime_tribute',
    kind: 'choice',
    category: 'fame',
    emoji: '🌟',
    ages: [45, 80],
    weight: 6,
    cooldownYears: 8,
    once: true,
    when: billed(4),
    text: 'The academy is giving you a lifetime-achievement tribute. Your old co-stars will make speeches, there is a montage, and you have to sit through all of it without crying.',
    choices: [
      {
        id: 'gracious',
        label: 'Thank everyone who carried you',
        outcomes: [
          {
            chance: 1,
            text: 'You name the dressers, the drivers and the woman who ran the tea urn on your first set. The hall stands. You cry anyway, as everyone knew you would.',
            effects: [{ fame: 6 }, { stat: 'happiness', delta: 15 }, { stat: 'karma', delta: 4 }],
            success: true,
          },
        ],
      },
      {
        id: 'notdone',
        label: 'Insist you are not finished yet',
        outcomes: [
          {
            chance: 0.6,
            text: '"This feels like a eulogy," you say, "and I have a film out in March." The laugh is huge and the film\'s bookings double the next morning.',
            effects: [
              { fame: 8 },
              { stat: 'happiness', delta: 10 },
              { money: 200000, kind: 'wage' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You come across as prickly, and the montage that follows is mostly of you looking cross. The hall applauds politely, as if at a bus timetable.',
            effects: [{ fame: 2 }, { stat: 'happiness', delta: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'act_biopic',
    kind: 'choice',
    category: 'work',
    emoji: '🎬',
    ages: [20, 80],
    weight: 6,
    cooldownYears: 7,
    when: billed(2),
    text: 'You are offered the lead in a biopic of a famous, recently departed jazz pianist. His children are alive, opinionated and already writing letters to the producers.',
    choices: [
      {
        id: 'learn',
        label: 'Learn the piano for real',
        outcomes: [
          {
            chance: 0.55,
            text: 'Fourteen hours a day for six months. You play his hardest piece in a single take and his daughter hugs you on set. The award buzz starts early.',
            effects: [
              { performance: 9 },
              { fame: 6 },
              { stat: 'happiness', delta: 8 },
              { skill: 'instrument', delta: 15 },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'Your fingers manage half the piece. The edit hides it with close-ups of a hand double, and a critic notes the pianist "seems to change rings".',
            effects: [
              { performance: 2 },
              { stat: 'stress', delta: 6 },
              { skill: 'instrument', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'impression',
        label: 'Nail the walk and the voice, fake the rest',
        outcomes: [
          {
            chance: 1,
            text: 'A perfect impression of a man you have never met. His children hate it. Audiences love it, and so, crucially, does the box office.',
            effects: [{ money: 150000, kind: 'wage' }, { fame: 3 }, { stat: 'karma', delta: -1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'act_turned_down_hit',
    kind: 'notice',
    category: 'work',
    emoji: '🙈',
    ages: [16, 80],
    weight: 5,
    cooldownYears: 8,
    when: actor,
    text: 'Years ago you turned down a script about a talking tortoise who solves crimes. It has just become the most successful film of the decade.',
    outcomes: [
      {
        chance: 0.6,
        text: 'You see the tortoise on lunchboxes, on buses and on the side of a building. Every interviewer asks you about it. You develop a stock answer and a twitch.',
        effects: [
          { stat: 'happiness', delta: -5 },
          { stat: 'stress', delta: 4 },
        ],
      },
      {
        chance: 0.4,
        text: 'You tell the story so well on a chat show that it becomes your most famous anecdote. Turning down the tortoise is somehow good for your career.',
        effects: [{ fame: 3 }, { stat: 'happiness', delta: 3 }],
        success: true,
      },
    ],
  },
  {
    id: 'act_dubbing_gig',
    kind: 'choice',
    category: 'work',
    emoji: '🎙️',
    ages: [16, 80],
    weight: 5,
    cooldownYears: 5,
    when: unbilled,
    text: 'A dubbing studio needs an English voice for a foreign soap opera about rival bakeries. It is three hundred episodes. The lip movements were not filmed with English in mind.',
    choices: [
      {
        id: 'dub',
        label: 'Take the booth',
        outcomes: [
          {
            chance: 1,
            text: 'For a year you are the voice of a passionate baker called Teodor, cramming "I love you" into mouths saying something much shorter. It pays steadily.',
            effects: [
              { money: 18000, kind: 'wage' },
              { performance: 3 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'hold',
        label: 'Hold out for on-screen work',
        outcomes: [
          {
            chance: 0.35,
            text: 'Your patience is rewarded: a supporting part in a proper film, with a name and two scenes. Your mother watches it four times.',
            effects: [{ stat: 'happiness', delta: 8 }, { job: 'promote' }],
            success: true,
          },
          {
            chance: 0.65,
            text: 'Nothing comes. You go back to the dubbing studio and Teodor has a new voice, deeper than yours and annoyingly good.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { money: -2000, kind: 'price' },
            ],
          },
        ],
      },
    ],
  },
];
