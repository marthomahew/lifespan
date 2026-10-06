import type { EventDef } from '../../engine/events/types';
import { canAfford, famous, oddsBy } from './conditions';

/** Events for famous players: fans, paparazzi, scandals, deals, and the long tail of a public life. */
export const FAME_EVENTS: EventDef[] = [
  // ---------- 18–29 ----------
  {
    id: 'fame_ya_dentist_fan',
    fromYear: 2008,
    kind: 'notice',
    category: 'fame',
    ages: [18, 29],
    weight: 8,
    cooldownYears: 6,
    when: famous(20),
    text: 'Your dental hygienist stops mid-scrape, leans closer, and whispers that she has your poster above her bed.',
    outcomes: [
      {
        chance: 0.6,
        text: 'You nod with a mouth full of instruments. She gives you the gentle side of the polishing brush and three free toothbrushes.',
        effects: [{ stat: 'happiness', delta: 4 }, { fame: 1 }],
      },
      {
        chance: 0.4,
        text: 'She asks for a selfie while the suction tube is still in. It circulates online by dinnertime, captioned with something unkind about your molars.',
        effects: [{ stat: 'happiness', delta: -3 }, { stat: 'looks', delta: -1 }, { fame: 2 }],
      },
    ],
  },
  {
    id: 'fame_ya_paparazzo_bins',
    kind: 'choice',
    category: 'fame',
    ages: [18, 29],
    weight: 9,
    cooldownYears: 4,
    when: famous(30),
    text: 'A photographer has been living in a hatchback across from your building for four days. He has a folding chair, a flask, and a lens the length of a forearm.',
    choices: [
      {
        id: 'coffee',
        label: 'Bring him a coffee',
        outcomes: [
          {
            chance: 0.7,
            text: 'He is so thrown that he takes one flattering photo and drives off. The picture runs under the headline "Down to Earth".',
            effects: [{ fame: 2 }, { stat: 'karma', delta: 3 }, { stat: 'happiness', delta: 3 }],
            success: true,
          },
          {
            chance: 0.3,
            text: 'He photographs you holding out the cup in pyjamas. The coffee is not in the shot. The pyjamas very much are.',
            effects: [{ fame: 1 }, { stat: 'stress', delta: 4 }],
          },
        ],
      },
      {
        id: 'back_door',
        label: 'Use the back door for a month',
        outcomes: [
          {
            chance: 1,
            text: 'You learn the bin schedule of every neighbour and the name of the building cat. He gets bored and moves on to someone with a balcony.',
            effects: [
              { stat: 'stress', delta: 5 },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'confront',
        label: 'Knock on his window and complain',
        outcomes: [
          {
            chance: 0.5,
            text: 'Your furious face fills a front page. Half the country thinks you are a diva; the other half buys a mug of it.',
            effects: [{ fame: 4 }, { stat: 'karma', delta: -2 }, { stat: 'stress', delta: 3 }],
          },
          {
            chance: 0.5,
            text: 'He apologises, packs up the folding chair, and admits his mother is a fan. You part on oddly decent terms.',
            effects: [
              { stat: 'stress', delta: -3 },
              { stat: 'happiness', delta: 2 },
            ],
            success: true,
          },
        ],
      },
    ],
  },
  {
    id: 'fame_ya_viral_trip',
    kind: 'notice',
    category: 'fame',
    ages: [18, 29],
    weight: 8,
    cooldownYears: 5,
    when: famous(25),
    weightMods: [{ trait: 'awkward', mult: 1.4 }],
    text: 'A clip of you missing the last step of a stage, recovering into an accidental bow, and walking straight into a curtain does the rounds.',
    outcomes: [
      {
        chance: 0.65,
        text: 'It is remixed with a brass section and played at sports matches. People cheer when you take stairs now.',
        effects: [{ fame: 5 }, { stat: 'happiness', delta: 3 }],
      },
      {
        chance: 0.35,
        text: 'Commentators debate whether it was staged. You hurt your ankle more than you let on, and the curtain is still a joke at every interview.',
        effects: [{ fame: 3 }, { injury: 3 }, { stat: 'stress', delta: 3 }],
      },
    ],
  },
  {
    id: 'fame_ya_endorsement_drink',
    kind: 'choice',
    category: 'fame',
    ages: [18, 29],
    weight: 9,
    cooldownYears: 5,
    when: famous(35),
    weightMods: [{ trait: 'charming', mult: 1.3 }],
    text: 'Brindlewick, maker of a sparkling oat drink called Mossfizz, wants your face on every bus shelter. The sample tastes like a damp lawn with ambition.',
    choices: [
      {
        id: 'sign',
        label: 'Sign the deal',
        outcomes: [
          {
            chance: 0.75,
            text: 'The ads are everywhere and the cheque clears. You learn to say "crisp, green, alive" without blinking.',
            effects: [{ money: 25000 }, { fame: 4 }, { stat: 'happiness', delta: 4 }],
            success: true,
          },
          {
            chance: 0.25,
            text: 'The money arrives, and so does a recall when a batch turns faintly luminous. Your smiling face is on the recall notice too.',
            effects: [
              { money: 20000 },
              { fame: 2 },
              { stat: 'karma', delta: -2 },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'haggle',
        label: 'Ask for double and creative control',
        outcomes: [
          {
            chance: oddsBy('fame', 0.45),
            text: 'They agree. You direct the commercial yourself, in which a heron drinks Mossfizz and nods slowly. It wins an industry award.',
            effects: [{ money: 45000 }, { fame: 5 }, { stat: 'happiness', delta: 6 }],
            success: true,
          },
          {
            chance: 0.45,
            text: 'Brindlewick goes with a reality-show finalist instead. You see the bus shelters on your way to everything.',
            effects: [{ stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'refuse',
        label: "Decline: you can't promote lawn water",
        outcomes: [
          {
            chance: 1,
            text: 'Your integrity is intact and your fans call it principled. Your accountant calls it something shorter.',
            effects: [
              { stat: 'karma', delta: 3 },
              { stat: 'happiness', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'fame_ya_superfan_letters',
    kind: 'choice',
    category: 'fame',
    ages: [18, 29],
    weight: 6,
    cooldownYears: 8,
    when: famous(45),
    text: 'The same fan has sent forty letters this month, each one knowing slightly more about your week than the last. Today one arrives with no stamp.',
    choices: [
      {
        id: 'police',
        label: 'Report it and add security',
        outcomes: [
          {
            chance: 1,
            text: 'The police issue a warning and your new security consultant changes your routes. The letters stop. You sleep badly for a while, then better.',
            effects: [{ money: -6000 }, { stat: 'stress', delta: 4 }, { stat: 'health', delta: 1 }],
            success: true,
          },
        ],
      },
      {
        id: 'move',
        label: 'Move somewhere quietly',
        requires: canAfford(15000),
        outcomes: [
          {
            chance: 1,
            text: 'You move with a fake name on the van and a real lock on every door. The new place is smaller and feels enormous.',
            effects: [
              { money: -15000 },
              { stat: 'stress', delta: -4 },
              { stat: 'happiness', delta: 2 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'ignore',
        label: 'Try to ignore it',
        outcomes: [
          {
            chance: 0.5,
            text: 'The letters thin out and then stop. You still check the window before opening the curtains.',
            effects: [{ stat: 'stress', delta: 6 }],
          },
          {
            chance: 0.5,
            text: 'They keep coming until a neighbour calls the police on your behalf. It is handled, but you wish you had acted sooner.',
            effects: [
              { stat: 'stress', delta: 9 },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
    ],
  },

  // ---------- 30–49 ----------
  {
    id: 'fame_ad_tabloid_scandal',
    kind: 'choice',
    category: 'fame',
    ages: [30, 49],
    weight: 9,
    cooldownYears: 5,
    when: famous(40),
    bind: { mother: { role: 'mother' } },
    text: 'The Weekly Lantern runs a front page claiming you secretly own a llama sanctuary that "isn\'t really for llamas." {mother.first} has already rung twice.',
    choices: [
      {
        id: 'sue',
        label: 'Sue for libel',
        outcomes: [
          {
            chance: 0.6,
            text: 'The paper settles and prints a correction in a box the size of a stamp. The settlement is the size of a car.',
            effects: [
              { money: 30000 },
              { money: -8000 },
              { stat: 'stress', delta: 6 },
              { fame: 2 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The case drags on for a year and every hearing reprints the original story. You win on a technicality nobody reads about.',
            effects: [{ money: -12000 }, { stat: 'stress', delta: 9 }, { fame: 3 }],
          },
        ],
      },
      {
        id: 'joke',
        label: 'Post a photo of you with a llama',
        outcomes: [
          {
            chance: 0.7,
            text: 'The llama is adorable and the internet decides you are in on the joke. The Lantern quietly moves on.',
            effects: [
              { fame: 4 },
              { stat: 'happiness', delta: 4 },
              { rel: 'mother', delta: 3, memory: 'the llama photo' },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'The llama spits on you mid-shot. That picture is the one that goes round, and the original rumour gets a second week.',
            effects: [{ fame: 3 }, { stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'call_mum',
        label: 'Call {mother.first} back and explain',
        outcomes: [
          {
            chance: 1,
            text: '{mother.first} believes you after forty minutes and starts calling the paper herself. You decide not to ask what she says.',
            effects: [
              {
                rel: 'mother',
                delta: 6,
                memory: 'the night you talked her through the Lantern story',
              },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'fame_ad_charity_gala',
    kind: 'choice',
    category: 'fame',
    ages: [30, 49],
    weight: 8,
    cooldownYears: 4,
    when: famous(30),
    weightMods: [{ trait: 'generous', mult: 1.4 }],
    text: 'You are invited to host the Glasshouse Ball for river conservation. The dress code is "botanical", the tickets cost more than a car, and the auctioneer has a cold.',
    choices: [
      {
        id: 'host',
        label: 'Host it and run the auction',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.55),
            text: 'You sell a signed rowing oar for a fortune and make a banker bid against his own wife. The river gets a new reed bed.',
            effects: [{ fame: 4 }, { stat: 'karma', delta: 6 }, { stat: 'happiness', delta: 5 }],
            success: true,
          },
          {
            chance: 0.35,
            text: 'You mispronounce the guest of honour three times. The auction still raises plenty, and nobody remembers anything but the name.',
            effects: [{ fame: 1 }, { stat: 'karma', delta: 3 }, { stat: 'stress', delta: 4 }],
          },
        ],
      },
      {
        id: 'donate',
        label: 'Skip it and send a cheque',
        requires: canAfford(10000),
        outcomes: [
          {
            chance: 1,
            text: 'Your donation is read out between courses. You spend the evening at home in socks, which is its own sort of gala.',
            effects: [
              { money: -10000 },
              { stat: 'karma', delta: 5 },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'attend',
        label: 'Go as a guest in a hedge-themed suit',
        outcomes: [
          {
            chance: 1,
            text: 'The fashion pages call the hedge suit "brave". You have leaves in your pockets for weeks.',
            effects: [{ fame: 3 }, { stat: 'looks', delta: 2 }, { stat: 'happiness', delta: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'fame_ad_hostile_interview',
    kind: 'choice',
    category: 'fame',
    ages: [30, 49],
    weight: 8,
    cooldownYears: 5,
    when: famous(45),
    text: 'Halfway through a live radio interview, the presenter abandons his notes and asks why you think you deserve any of this.',
    choices: [
      {
        id: 'calm',
        label: 'Answer calmly and honestly',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.55),
            text: 'You talk about luck, work, and the people who helped. The clip is shared as a masterclass and the presenter looks small.',
            effects: [{ fame: 4 }, { stat: 'karma', delta: 3 }, { stat: 'happiness', delta: 3 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Your honest answer runs a bit long and a bit sad. Listeners are kind; critics call it "a wobble".',
            effects: [{ fame: 1 }, { stat: 'stress', delta: 4 }],
          },
        ],
      },
      {
        id: 'walk',
        label: 'Take your headphones off and leave',
        outcomes: [
          {
            chance: 1,
            text: 'Three seconds of dead air become the most discussed silence of the year. Opinion splits neatly down the middle.',
            effects: [{ fame: 5 }, { stat: 'karma', delta: -2 }, { stat: 'stress', delta: 3 }],
          },
        ],
      },
      {
        id: 'turn',
        label: 'Ask him the same question back',
        outcomes: [
          {
            chance: 0.5,
            text: 'He has no answer. The station gets more calls than it has had in a decade, mostly about him.',
            effects: [{ fame: 4 }, { stat: 'happiness', delta: 5 }],
            success: true,
          },
          {
            chance: 0.5,
            text: 'He has a prepared, smug answer. You laugh too loudly at it, and that laugh becomes a ringtone.',
            effects: [{ fame: 2 }, { stat: 'happiness', delta: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'fame_ad_talk_show',
    fromYear: 2008,
    kind: 'choice',
    category: 'fame',
    ages: [30, 49],
    weight: 9,
    cooldownYears: 3,
    when: famous(35),
    weightMods: [{ trait: 'funny', mult: 1.3 }],
    bind: { friend: { role: 'friend', minRelationship: 30 } },
    text: 'You are booked on "Late with Odile Marchetti", the sofa everyone pretends not to want. The producer asks for one good anecdote, ideally involving {friend.first}.',
    choices: [
      {
        id: 'friend_story',
        label: 'Tell the one about {friend.first}',
        outcomes: [
          {
            chance: 0.6,
            text: 'The audience howls. {friend.first} texts you a single row of crying-laughing faces and a request for royalties.',
            effects: [
              { fame: 4 },
              { stat: 'happiness', delta: 4 },
              { rel: 'friend', delta: 4, memory: 'being the star of your talk-show story' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'It kills, but {friend.first} is less than delighted to be known nationally as "the one with the goose".',
            effects: [
              { fame: 4 },
              { rel: 'friend', delta: -8, memory: 'the goose story you told on television' },
            ],
          },
        ],
      },
      {
        id: 'own_story',
        label: 'Tell an embarrassing one about yourself',
        outcomes: [
          {
            chance: 1,
            text: 'Self-deprecation lands. Odile gives you the rare double hand on the knee, which insiders say means a return booking.',
            effects: [{ fame: 3 }, { stat: 'happiness', delta: 3 }, { stat: 'karma', delta: 1 }],
          },
        ],
      },
      {
        id: 'plug',
        label: 'Just plug your work',
        outcomes: [
          {
            chance: 1,
            text: 'Seven minutes of polite promotion. The segment is not memorable, which is its own kind of safe.',
            effects: [{ fame: 1 }, { money: 3000 }],
          },
        ],
      },
    ],
  },
  {
    id: 'fame_ad_lookalike',
    kind: 'notice',
    category: 'fame',
    ages: [30, 49],
    weight: 6,
    cooldownYears: 8,
    when: famous(50),
    text: 'A man in {city} has been working as your lookalike at weddings and shopping-centre openings. He is, by most accounts, better at being you than you are.',
    outcomes: [
      {
        chance: 0.5,
        text: 'You meet him at a fan event. He corrects your posture. You both agree, uneasily, to divide the country into territories.',
        effects: [{ stat: 'happiness', delta: 3 }, { fame: 2 }],
      },
      {
        chance: 0.5,
        text: 'He is photographed falling out of a nightclub, and the papers run it as you. Your publicist spends a week explaining the difference in ear shape.',
        effects: [{ stat: 'stress', delta: 5 }, { fame: 1 }, { stat: 'karma', delta: -1 }],
      },
    ],
  },

  // ---------- 50–64 ----------
  {
    id: 'fame_mid_memoir_offer',
    kind: 'choice',
    category: 'fame',
    ages: [50, 64],
    weight: 8,
    once: true,
    when: famous(40),
    weightMods: [{ trait: 'creative', mult: 1.2 }],
    text: 'Quillmark Press offers a generous advance for your memoir. The editor wants "honesty, a few feuds, and a title with a colon in it".',
    choices: [
      {
        id: 'write',
        label: 'Write it yourself',
        outcomes: [
          {
            chance: 1,
            text: 'You sign, buy a serious notebook, and spend a long winter remembering things you had carefully forgotten.',
            effects: [
              { money: 40000 },
              { skill: 'writing', delta: 8 },
              { stat: 'stress', delta: 4 },
            ],
            next: {
              eventId: 'fame_mid_memoir_release',
              inYears: [1, 3],
              payload: { amount: 40000 },
            },
            success: true,
          },
        ],
      },
      {
        id: 'ghost',
        label: 'Hire a ghostwriter',
        outcomes: [
          {
            chance: 1,
            text: 'A quiet woman named Perpetua interviews you for six months and somehow makes you sound wittier than you were.',
            effects: [{ money: 28000 }, { stat: 'stress', delta: -1 }],
            next: {
              eventId: 'fame_mid_memoir_release',
              inYears: [1, 3],
              payload: { amount: 28000 },
            },
          },
        ],
      },
      {
        id: 'decline',
        label: 'Decline: some things stay private',
        outcomes: [
          {
            chance: 1,
            text: 'You turn it down. Three people you used to work with exhale without knowing why.',
            effects: [
              { stat: 'karma', delta: 2 },
              { stat: 'happiness', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'fame_mid_memoir_release',
    kind: 'choice',
    category: 'fame',
    ages: [51, 70],
    weight: 10,
    chainOnly: true,
    when: famous(30),
    bind: { friend: { role: 'friend' } },
    text: 'Your memoir is out. Chapter nine mentions {friend.first} by name, and the publisher wants you on a twelve-city tour to talk about it.',
    choices: [
      {
        id: 'tour',
        label: 'Do the full tour',
        outcomes: [
          {
            chance: 0.6,
            text: 'Queues around bookshops, a bestseller sticker, and royalties that outpace the advance. Your signing hand never fully recovers.',
            effects: [
              { money: { payload: 'amount', mult: 1.5 } },
              { fame: 6 },
              { stat: 'happiness', delta: 5 },
              { stat: 'health', delta: -2 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Sales are modest and the tour stops are half full. You get very good at signing books for people called Derek.',
            effects: [
              { money: { payload: 'amount', mult: 0.3 } },
              { fame: 2 },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'call_friend',
        label: 'Call {friend.first} before the press does',
        outcomes: [
          {
            chance: 0.6,
            text: '{friend.first} has already read it and loved being in it. You do a few local readings together instead of a tour.',
            effects: [
              { rel: 'friend', delta: 8, memory: 'chapter nine of your memoir' },
              { money: { payload: 'amount', mult: 0.5 } },
              { fame: 2 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: '{friend.first} would have preferred to be asked. The call is short and the silence afterwards is longer.',
            effects: [
              {
                rel: 'friend',
                delta: -10,
                memory: 'being written into your memoir without asking',
              },
              { money: { payload: 'amount', mult: 0.5 } },
            ],
          },
        ],
      },
    ],
  },

  // ---------- 65–85 ----------
  {
    id: 'fame_sr_retrospective',
    kind: 'choice',
    category: 'fame',
    ages: [65, 85],
    weight: 8,
    cooldownYears: 10,
    when: famous(35),
    weightMods: [{ trait: 'creative', mult: 1.2 }],
    text: 'A gallery in {city} is mounting a retrospective of your career. The curator has found photographs of haircuts you had hoped were destroyed.',
    choices: [
      {
        id: 'speech',
        label: 'Attend and give a speech',
        outcomes: [
          {
            chance: oddsBy('happiness', 0.6),
            text: 'You speak for nine minutes without notes. A young artist tells you afterwards that you are why they started. You keep thinking about it.',
            effects: [{ fame: 4 }, { stat: 'happiness', delta: 8 }],
            success: true,
          },
          {
            chance: 0.3,
            text: 'You lose your thread twice and thank the wrong sponsor. The room forgives you instantly, which is somehow worse.',
            effects: [{ fame: 2 }, { stat: 'stress', delta: 3 }, { stat: 'happiness', delta: 2 }],
          },
        ],
      },
      {
        id: 'quiet',
        label: 'Visit privately on a Tuesday',
        outcomes: [
          {
            chance: 1,
            text: 'You walk the rooms alone in a cap. A guard recognises you and says nothing, which is the nicest review you have ever had.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'veto',
        label: 'Demand they cut the haircuts',
        outcomes: [
          {
            chance: 1,
            text: 'The curator refuses and the haircut wall becomes the most photographed exhibit. You are, again, a trend.',
            effects: [{ fame: 3 }, { stat: 'looks', delta: -1 }, { stat: 'happiness', delta: 1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'fame_sr_tribute_concert',
    kind: 'choice',
    category: 'fame',
    ages: [65, 85],
    weight: 7,
    once: true,
    when: famous(60),
    text: 'A lifetime tribute is planned in your honour: a televised evening where younger stars perform your work and say nice things about you in suits.',
    choices: [
      {
        id: 'front_row',
        label: 'Sit in the front row and enjoy it',
        outcomes: [
          {
            chance: 1,
            text: 'Some of the covers are better than yours. You clap anyway, and mean it more than you expected to.',
            effects: [{ fame: 5 }, { stat: 'happiness', delta: 9 }, { stat: 'stress', delta: -3 }],
            success: true,
          },
        ],
      },
      {
        id: 'perform',
        label: 'Insist on doing the finale yourself',
        outcomes: [
          {
            chance: oddsBy('health', 0.5),
            text: 'Your voice is lower and slower, and the hall stands for the whole of it. The broadcast is repeated every holiday for years.',
            effects: [{ fame: 8 }, { stat: 'happiness', delta: 10 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You run out of breath in the second verse. The whole audience sings the rest for you, which you will never quite get over.',
            effects: [{ fame: 5 }, { stat: 'happiness', delta: 6 }, { stat: 'health', delta: -2 }],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Ask them to give the money to a music school',
        outcomes: [
          {
            chance: 1,
            text: 'The evening becomes a scholarship fund in your name. The first recipient sends a thank-you card in very careful handwriting.',
            effects: [{ stat: 'karma', delta: 8 }, { stat: 'happiness', delta: 5 }, { fame: 2 }],
          },
        ],
      },
    ],
  },
];
