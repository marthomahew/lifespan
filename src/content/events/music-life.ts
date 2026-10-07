import type { EventDef } from '../../engine/events/types';
import type { GameState } from '../../engine/types';

const musician = (s: GameState): boolean => s.music.stage >= 2 && !s.legal.prison;
const signed = (s: GameState): boolean => musician(s) && !!s.music.label;
const band = (s: GameState): boolean => musician(s) && s.music.act === 'band';
const star = (s: GameState): boolean => musician(s) && s.player.stats.fame >= 50;
const released = (s: GameState): boolean => musician(s) && s.music.releases.length > 0;

/** A working life in music: producers, bandmates, labels, festivals, voices that give out and songs that come back. */
export const MUSIC_LIFE_EVENTS: EventDef[] = [
  {
    id: 'mus_producer_new_sound',
    kind: 'choice',
    category: 'fame',
    emoji: '🎛️',
    ages: [16, 85],
    weight: 7,
    cooldownYears: 5,
    when: released,
    text: 'A producer in a cardigan worth more than your van plays your demo, winces, and says your sound is "very honest". He wants to add a choir, a drum machine and, possibly, a harp.',
    choices: [
      {
        id: 'trust',
        label: 'Let him have his harp',
        outcomes: [
          {
            chance: 0.55,
            text: 'The harp is, annoyingly, correct. The new mix sounds like you on a very good day, and people who never cared before start to care.',
            effects: [{ fame: 4 }, { stat: 'happiness', delta: 5 }, { skill: 'voice', delta: 2 }],
            success: true,
          },
          {
            chance: 0.45,
            text: 'The record comes out sounding expensive and slightly like someone else. Old fans write letters with the word "sellout" underlined twice.',
            effects: [{ fame: 1 }, { stat: 'happiness', delta: -5 }, { stat: 'stress', delta: 4 }],
          },
        ],
      },
      {
        id: 'meet',
        label: 'Meet him halfway: one trick each',
        outcomes: [
          {
            chance: 0.7,
            text: 'You keep the rough vocal, he keeps the drum machine, and nobody mentions the harp again. It is the best thing you have made.',
            effects: [
              { fame: 3 },
              { stat: 'happiness', delta: 6 },
              { skill: 'instrument', delta: 2 },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'Halfway turns out to be nowhere. The track sounds like two arguments recorded at once, and you both agree to never speak of it.',
            effects: [{ stat: 'stress', delta: 5 }],
          },
        ],
      },
      {
        id: 'refuse',
        label: 'Keep it honest',
        outcomes: [
          {
            chance: 1,
            text: 'You thank him and take the demo home. It stays small and scruffy and yours, and you sleep fine.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'karma', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mus_ten_minute_song',
    kind: 'notice',
    category: 'fame',
    emoji: '📝',
    ages: [16, 85],
    weight: 5,
    cooldownYears: 8,
    when: released,
    text: 'The song you wrote in ten minutes on the back of a parking fine, mainly to fill a gap on the record, is suddenly the only one anyone asks for.',
    outcomes: [
      {
        chance: 0.6,
        text: 'It pays the rent for years. You stop telling people how long it took, because they look so disappointed.',
        effects: [{ fame: 6 }, { money: 15000, kind: 'wage' }, { stat: 'happiness', delta: 6 }],
        success: true,
      },
      {
        chance: 0.4,
        text: 'The songs you bled over for two years go ignored. You play the ten-minute one every night and feel faintly cheated by your own talent.',
        effects: [{ fame: 4 }, { money: 8000, kind: 'wage' }, { stat: 'happiness', delta: -2 }],
      },
    ],
  },
  {
    id: 'mus_band_credits_feud',
    kind: 'choice',
    category: 'work',
    emoji: '🧾',
    ages: [16, 85],
    weight: 7,
    cooldownYears: 5,
    when: (s) => band(s) && s.music.releases.length > 0,
    bind: { mate: { role: 'bandmate' } },
    text: '{mate.first} has noticed that the songwriting credits say your name alone, and that the bass line everyone hums was {mate.their} idea. The royalty statement lies on the rehearsal-room floor like a dare.',
    choices: [
      {
        id: 'split',
        label: 'Split the credits evenly',
        outcomes: [
          {
            chance: 1,
            text: 'Your share gets smaller and the band gets tighter. {mate.first} plays that bass line like a victory lap every night.',
            effects: [
              { money: -4000 },
              { stat: 'karma', delta: 4 },
              { rel: 'mate', delta: 12, memory: 'the night you split the credits' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'hold',
        label: 'You wrote the song; the credit stands',
        outcomes: [
          {
            chance: 0.5,
            text: '{mate.first} goes quiet in the way that means a lawyer is about to get a phone call. Rehearsals become very efficient and very cold.',
            effects: [
              { stat: 'stress', delta: 6 },
              { rel: 'mate', delta: -15, memory: 'the credits you kept' },
            ],
          },
          {
            chance: 0.5,
            text: '{mate.first} grumbles, then lets it go. Mostly. You notice the bass line is a fraction late every night from now on.',
            effects: [
              { stat: 'stress', delta: 3 },
              { rel: 'mate', delta: -6, memory: 'the bass line nobody credited' },
            ],
          },
        ],
      },
      {
        id: 'arbiter',
        label: 'Get the band to vote on it',
        outcomes: [
          {
            chance: 0.6,
            text: 'The drummer, kingmaker at last, votes for a three-way split and a takeaway. Peace breaks out over cold noodles.',
            effects: [
              { money: -2000 },
              { stat: 'happiness', delta: 3 },
              { rel: 'mate', delta: 6, memory: 'the noodle summit' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The vote is a tie, then a shouting match, then a broken tambourine. Nothing is settled except who buys a new tambourine.',
            effects: [
              { stat: 'stress', delta: 5 },
              { rel: 'mate', delta: -5, memory: 'the tambourine vote' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mus_member_quits',
    kind: 'choice',
    category: 'work',
    emoji: '🚪',
    ages: [16, 85],
    weight: 6,
    cooldownYears: 7,
    when: band,
    bind: { mate: { role: 'bandmate' } },
    text: '{mate.first} turns up to rehearsal with a sandwich and a speech. {mate.They} {mate.has} been offered a steady job, a mortgage and weekends, and {mate.they} would like to stop living in a van.',
    choices: [
      {
        id: 'bless',
        label: 'Wish them well and mean it',
        outcomes: [
          {
            chance: 1,
            text: 'You hug in the car park. {mate.first} comes to the next show and sings along from the bar, which is somehow worse and better.',
            effects: [
              { stat: 'happiness', delta: -3 },
              { stat: 'karma', delta: 3 },
              { rel: 'mate', delta: 10, memory: 'the car-park goodbye' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'beg',
        label: 'Beg them to stay one more year',
        outcomes: [
          {
            chance: 0.4,
            text: '{mate.first} sighs and stays. The year that follows is the best the band ever plays, and neither of you says why.',
            effects: [
              { fame: 3 },
              { stat: 'happiness', delta: 5 },
              { rel: 'mate', delta: 5, memory: 'the one more year' },
            ],
            success: true,
          },
          {
            chance: 0.6,
            text: '{mate.first} stays, resents it, and leaves anyway in the spring. The second goodbye is shorter and much less kind.',
            effects: [
              { stat: 'stress', delta: 6 },
              { rel: 'mate', delta: -10, memory: 'the year you made them stay' },
            ],
          },
        ],
      },
      {
        id: 'replace',
        label: 'Hold auditions by Friday',
        outcomes: [
          {
            chance: 1,
            text: 'Eleven hopefuls, one who can play. The new member is younger, keener and owns their own van, and {mate.first} hears about it secondhand.',
            effects: [
              { stat: 'stress', delta: 3 },
              { rel: 'mate', delta: -8, memory: 'being replaced by Friday' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mus_label_cover_push',
    kind: 'choice',
    category: 'work',
    emoji: '💿',
    ages: [16, 85],
    weight: 7,
    cooldownYears: 5,
    when: signed,
    text: 'Your label wants a single by spring and suggests, with a smile you can hear down the phone, a dance remix of an old wedding-disco favourite. "It tested very well with people in their forties."',
    choices: [
      {
        id: 'do_it',
        label: 'Record the remix',
        outcomes: [
          {
            chance: 0.6,
            text: 'It is played at every office party for a year. You earn well from a song you did not write and would not dance to.',
            effects: [
              { fame: 4 },
              { money: 20000, kind: 'wage' },
              { stat: 'happiness', delta: -2 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'It stalls just outside the charts. The label blames the mix, the mixer blames you, and your mum loves it.',
            effects: [
              { stat: 'stress', delta: 5 },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'counter',
        label: 'Offer a new song of your own instead',
        outcomes: [
          {
            chance: 0.5,
            text: 'They grudgingly let you try. Your song does almost as well, and you get to keep looking yourself in the mirror.',
            effects: [{ fame: 3 }, { money: 8000, kind: 'wage' }, { stat: 'happiness', delta: 5 }],
            success: true,
          },
          {
            chance: 0.5,
            text: 'Your song is shelved "for now", which in label language is a burial with no flowers. Things are tense at the next meeting.',
            effects: [{ stat: 'stress', delta: 6 }],
          },
        ],
      },
    ],
  },
  {
    id: 'mus_creative_control',
    kind: 'choice',
    category: 'work',
    emoji: '🎚️',
    ages: [18, 85],
    weight: 6,
    cooldownYears: 6,
    when: signed,
    text: 'The finished album comes back from the label with three songs cut, a new running order and a cover photo of you that you have never seen, taken in a room you have never been in.',
    choices: [
      {
        id: 'fight',
        label: 'Threaten to walk',
        outcomes: [
          {
            chance: 0.45,
            text: "They blink first. The album comes out your way, odd cover and all, and the critics notice it is somebody's actual vision.",
            effects: [{ fame: 4 }, { stat: 'happiness', delta: 8 }, { stat: 'stress', delta: 3 }],
            success: true,
          },
          {
            chance: 0.55,
            text: 'They do not blink. They release their version anyway and make a note in your file. Your next advance is noticeably smaller.',
            effects: [
              { money: -6000 },
              { stat: 'stress', delta: 8 },
              { stat: 'happiness', delta: -5 },
            ],
          },
        ],
      },
      {
        id: 'trade',
        label: 'Trade the cover for the songs',
        outcomes: [
          {
            chance: 1,
            text: 'You get your three songs back and live with the mystery photograph. Fans spend years trying to work out where it was taken.',
            effects: [{ fame: 2 }, { stat: 'happiness', delta: 3 }],
            success: true,
          },
        ],
      },
      {
        id: 'shrug',
        label: 'Let them do their job',
        outcomes: [
          {
            chance: 1,
            text: 'The album sells better than you expected and feels less like yours than you hoped. Both of those things stay true.',
            effects: [
              { money: 10000, kind: 'wage' },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mus_festival_headline',
    kind: 'choice',
    category: 'fame',
    emoji: '🎪',
    ages: [18, 85],
    weight: 6,
    cooldownYears: 6,
    when: star,
    text: 'Your name is at the top of the festival poster, in letters bigger than the tents. Eighty thousand people, one field, and a curfew enforced by a man with a clipboard and no sense of occasion.',
    choices: [
      {
        id: 'hits',
        label: 'Play every hit, in order of size',
        outcomes: [
          {
            chance: 1,
            text: 'Eighty thousand people sing your chorus back at you so loud you can feel it in your teeth. You walk off grinning like a child.',
            effects: [
              { fame: 5 },
              { money: 60000, kind: 'wage' },
              { stat: 'happiness', delta: 10 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'new',
        label: 'Debut the new album in full',
        outcomes: [
          {
            chance: 0.35,
            text: 'Bold, strange and somehow right. Reviewers call it the set of the weekend, and the new songs arrive already loved.',
            effects: [{ fame: 8 }, { money: 60000, kind: 'wage' }, { stat: 'happiness', delta: 8 }],
            success: true,
          },
          {
            chance: 0.65,
            text: 'You watch a field of people politely checking the time. The single you held back for the encore saves the night, barely.',
            effects: [{ fame: -2 }, { money: 60000, kind: 'wage' }, { stat: 'stress', delta: 6 }],
          },
        ],
      },
      {
        id: 'overrun',
        label: 'Ignore the curfew for one more song',
        outcomes: [
          {
            chance: 0.5,
            text: 'The power is cut mid-chorus. Eighty thousand people finish the song for you in the dark, and it becomes the night of legend.',
            effects: [
              { fame: 8 },
              { money: 45000, kind: 'wage' },
              { notoriety: 2 },
              { stat: 'happiness', delta: 10 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The fine for overrunning eats a third of your fee, and the man with the clipboard tells the trade press about it.',
            effects: [
              { money: 40000, kind: 'wage' },
              { notoriety: 2 },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mus_disastrous_festival',
    kind: 'choice',
    category: 'fame',
    emoji: '🌧️',
    ages: [16, 85],
    weight: 6,
    cooldownYears: 6,
    when: musician,
    text: "Your festival slot coincides with a cloudburst, a dead monitor and the soundman's lunch. Twelve songs in, you can hear neither yourself nor the band, and the crowd is mostly ponchos walking away.",
    choices: [
      {
        id: 'unplug',
        label: 'Kill the amps and sing to the front row',
        outcomes: [
          {
            chance: 0.55,
            text: 'The ponchos turn around. Forty soaked strangers huddle at the barrier and sing with you, and someone calls it the best thing they saw all weekend.',
            effects: [{ fame: 3 }, { stat: 'happiness', delta: 7 }, { skill: 'voice', delta: 2 }],
            success: true,
          },
          {
            chance: 0.45,
            text: 'Nobody beyond the second row can hear a thing. You finish to the sound of rain hitting a hundred empty crisp packets.',
            effects: [{ stat: 'happiness', delta: -5 }, { illness: 'flu' }],
          },
        ],
      },
      {
        id: 'push_on',
        label: 'Play through it as rehearsed',
        outcomes: [
          {
            chance: 1,
            text: 'You finish the set to the people who could not find their tents. A trade paper review uses the phrase "gamely damp".',
            effects: [{ fame: -2 }, { stat: 'stress', delta: 5 }],
          },
        ],
      },
      {
        id: 'walk_off',
        label: 'Walk off and blame the sound desk',
        outcomes: [
          {
            chance: 1,
            text: 'You are back in the van before the second chorus would have started. The soundman writes a long, detailed account for anyone who asks.',
            effects: [{ fame: -3 }, { notoriety: 2 }, { stat: 'karma', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'mus_every_lyric_fan',
    kind: 'notice',
    category: 'fame',
    emoji: '🎤',
    ages: [16, 85],
    weight: 7,
    cooldownYears: 4,
    when: released,
    text: 'There is a teenager in the second row singing every word of a b-side you forgot you wrote, eyes shut, word-perfect, including the verse you mumbled because you never finished it.',
    outcomes: [
      {
        chance: 0.7,
        text: 'After the show you sign their ticket and ask what the mumbled bit says. They tell you. It is better than anything you had planned.',
        effects: [
          { stat: 'happiness', delta: 8 },
          { stat: 'stress', delta: -3 },
        ],
        success: true,
      },
      {
        chance: 0.3,
        text: 'You lose your place watching them and stop dead mid-song. They carry on alone for two bars until you catch up, and the room cheers you both.',
        effects: [{ stat: 'happiness', delta: 5 }, { fame: 1 }],
      },
    ],
  },
  {
    id: 'mus_sync_deal',
    kind: 'choice',
    category: 'work',
    emoji: '📺',
    ages: [16, 85],
    weight: 6,
    cooldownYears: 6,
    when: released,
    text: 'A car advert wants thirty seconds of your saddest song, the one about your grandfather, to sell a family estate with heated seats. The fee would cover a year of your life.',
    choices: [
      {
        id: 'take',
        label: 'Take the money',
        outcomes: [
          {
            chance: 1,
            text: "Your grandfather's song plays during every football match for a season. Strangers hum it at petrol stations. The bank manager smiles at you.",
            effects: [
              { money: 30000, kind: 'wage' },
              { fame: 4 },
              { stat: 'happiness', delta: -1 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'film',
        label: 'Hold out for a film instead',
        outcomes: [
          {
            chance: 0.35,
            text: 'Months later a small, sad film uses it over the final scene. It wins things, and audiences leave the cinema asking who sang that.',
            effects: [{ money: 15000, kind: 'wage' }, { fame: 6 }, { stat: 'happiness', delta: 7 }],
            success: true,
          },
          {
            chance: 0.65,
            text: "No film calls. The car advert uses someone else's sad song, and it is very nearly as good as yours.",
            effects: [{ stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'no',
        label: 'Some songs are not for sale',
        outcomes: [
          {
            chance: 1,
            text: "You turn it down and play the song that night with your grandfather's name in the introduction. It feels expensive and right.",
            effects: [
              { stat: 'karma', delta: 3 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mus_bigger_collab',
    kind: 'choice',
    category: 'fame',
    emoji: '🤝',
    ages: [16, 85],
    weight: 6,
    cooldownYears: 6,
    when: (s) => released(s) && s.player.stats.fame >= 20,
    text: 'An artist far more famous than you has heard your record and wants you on a duet. Their manager sends a contract, a studio address and a list of things you are not to say to the press.',
    choices: [
      {
        id: 'yes',
        label: 'Say yes before they change their mind',
        outcomes: [
          {
            chance: 0.6,
            text: 'In the studio they are generous and slightly shy. The duet does very well, and journalists finally start spelling your name correctly.',
            effects: [{ fame: 7 }, { money: 12000, kind: 'wage' }, { stat: 'happiness', delta: 6 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Your verse is cut down to a breathy ad-lib in the bridge. The credits list you as "featuring", in a font size best read with a magnifying glass.',
            effects: [{ fame: 2 }, { money: 4000, kind: 'wage' }, { stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'terms',
        label: 'Ask for an equal verse and credit',
        outcomes: [
          {
            chance: 0.4,
            text: 'Their manager calls you difficult, then calls back. You get your verse. The song sounds like two people, which is what a duet is meant to be.',
            effects: [{ fame: 6 }, { stat: 'happiness', delta: 8 }],
            success: true,
          },
          {
            chance: 0.6,
            text: 'The duet goes to someone more grateful. You hear it in a supermarket a year later and it is fine. Just fine.',
            effects: [{ stat: 'happiness', delta: -4 }],
          },
        ],
      },
    ],
  },
  {
    id: 'mus_writers_block',
    kind: 'choice',
    category: 'work',
    emoji: '🫥',
    ages: [16, 85],
    weight: 7,
    cooldownYears: 5,
    when: released,
    text: 'Six months and not a single song. You have tried a cabin, a rented piano, long walks and short ones. Your notebook contains one line, "the kettle sounds sad", and a drawing of a kettle.',
    choices: [
      {
        id: 'cover_tour',
        label: "Go and play other people's songs",
        outcomes: [
          {
            chance: 0.65,
            text: 'A month of covers in small bars loosens something. On the last night you hum a tune in the van, and it is yours, and it is good.',
            effects: [
              { skill: 'instrument', delta: 3 },
              { stat: 'stress', delta: -6 },
              { stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
          {
            chance: 0.35,
            text: "You play other people's songs so well that the bar owners stop asking for yours. You come home with money and still no songs.",
            effects: [
              { money: 3000, kind: 'wage' },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'kettle',
        label: 'Write the kettle song',
        outcomes: [
          {
            chance: 0.4,
            text: 'It turns out to be about your father, and very much not about a kettle. You cry finishing it. It is the truest thing you have written.',
            effects: [
              { skill: 'voice', delta: 2 },
              { stat: 'happiness', delta: 7 },
              { stat: 'stress', delta: -4 },
            ],
            success: true,
          },
          {
            chance: 0.6,
            text: 'It is about a kettle. Four minutes and twelve seconds about a kettle. You put it in a drawer and buy a new kettle.',
            effects: [{ stat: 'stress', delta: 3 }, { money: -40 }],
          },
        ],
      },
      {
        id: 'rest',
        label: 'Stop trying for a while',
        outcomes: [
          {
            chance: 1,
            text: 'You garden, sleep and cook badly. The songs come back on their own schedule, the way cats do.',
            effects: [
              { stat: 'stress', delta: -8 },
              { stat: 'health', delta: 2 },
            ],
            success: true,
          },
        ],
      },
    ],
  },
  {
    id: 'mus_song_leaked',
    kind: 'choice',
    category: 'fame',
    emoji: '💧',
    ages: [16, 85],
    weight: 6,
    cooldownYears: 6,
    when: signed,
    text: 'Three months before release, the lead single gets out: a muddy rough mix with your guide vocal and a cough in the second verse. The label is furious. The fans seem delighted.',
    choices: [
      {
        id: 'release_now',
        label: 'Release the real one tomorrow',
        outcomes: [
          {
            chance: 0.6,
            text: 'The label scrambles, the real version lands, and the surprise makes it an event. People still argue over which version is better.',
            effects: [{ fame: 5 }, { money: 10000, kind: 'wage' }, { stat: 'stress', delta: 5 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The rushed master comes out thin. Fans quietly prefer the leak, cough and all, which is its own kind of insult.',
            effects: [{ fame: 1 }, { stat: 'happiness', delta: -4 }],
          },
        ],
      },
      {
        id: 'hunt',
        label: 'Find out who leaked it',
        outcomes: [
          {
            chance: 1,
            text: "Weeks of suspicion. It turns out to be a mastering engineer's nephew. Everyone you suspected along the way remembers being suspected.",
            effects: [
              { stat: 'stress', delta: 8 },
              { stat: 'karma', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'embrace',
        label: 'Joke about the cough on stage',
        outcomes: [
          {
            chance: 1,
            text: 'You start coughing on cue in the second verse at every show. Crowds cough back. It is the strangest singalong of your career.',
            effects: [{ fame: 3 }, { stat: 'happiness', delta: 5 }],
            success: true,
          },
        ],
      },
    ],
  },
  {
    id: 'mus_melody_lawsuit',
    kind: 'choice',
    category: 'work',
    emoji: '⚖️',
    ages: [18, 85],
    weight: 5,
    cooldownYears: 8,
    when: (s) => released(s) && s.player.stats.fame >= 30,
    text: 'A songwriter you have never heard of says your biggest chorus is note-for-note his 1970s ballad about a lighthouse. His lawyer has a keyboard, a diagram and enormous confidence.',
    choices: [
      {
        id: 'fight',
        label: 'Fight it in court',
        outcomes: [
          {
            chance: 0.55,
            text: 'Your musicologist plays the jury twelve older songs with the same four notes. The case is dismissed, and you never want to hear a C major chord again.',
            effects: [
              { money: -15000 },
              { stat: 'stress', delta: 8 },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'The jury hums both songs in the deliberation room and agrees with the lighthouse. You pay damages and the lighthouse man buys a boat.',
            effects: [{ money: -60000 }, { stat: 'stress', delta: 10 }, { notoriety: 2 }],
          },
        ],
      },
      {
        id: 'settle',
        label: 'Settle quietly',
        outcomes: [
          {
            chance: 1,
            text: 'He gets a slice of the song and a writing credit. You suspect you heard his ballad in a waiting room as a child, which is the worst part.',
            effects: [{ money: -25000 }, { stat: 'stress', delta: 3 }],
          },
        ],
      },
      {
        id: 'call',
        label: 'Phone him yourself',
        outcomes: [
          {
            chance: 0.5,
            text: 'He is eighty and lonely and just wanted somebody to notice. You record his lighthouse song as a b-side, and he drops the case in tears.',
            effects: [
              { stat: 'karma', delta: 5 },
              { stat: 'happiness', delta: 6 },
              { money: -2000 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'He hands the phone straight to his lawyer, who thanks you for confirming that you know who he is.',
            effects: [{ money: -30000 }, { stat: 'stress', delta: 8 }],
          },
        ],
      },
    ],
  },
  {
    id: 'mus_stadium_night',
    kind: 'notice',
    category: 'fame',
    emoji: '🏟️',
    ages: [18, 85],
    weight: 6,
    cooldownYears: 5,
    when: (s) => star(s) && s.player.stats.fame >= 65,
    text: "A stadium, sold out, in {city}. From the stage the crowd is a dark sea dotted with tiny lights, and somewhere out there a kid on someone's shoulders is holding a sign with your name spelled wrong.",
    outcomes: [
      {
        chance: 0.75,
        text: 'You play for two and a half hours and do not want to stop. Back at the hotel you sit in silence for a long time, completely full.',
        effects: [
          { fame: 4 },
          { money: 120000, kind: 'wage' },
          { stat: 'happiness', delta: 10 },
          { stat: 'stress', delta: 3 },
        ],
        success: true,
      },
      {
        chance: 0.25,
        text: 'It is a triumph, and it goes by in a blur of in-ear monitors and pyrotechnics. You remember the kid with the sign and almost nothing else.',
        effects: [
          { fame: 3 },
          { money: 120000, kind: 'wage' },
          { stat: 'happiness', delta: 4 },
          { stat: 'stress', delta: 6 },
        ],
      },
    ],
  },
  {
    id: 'mus_lost_voice',
    kind: 'choice',
    category: 'fame',
    emoji: '🤐',
    ages: [16, 85],
    weight: 6,
    cooldownYears: 6,
    when: (s) => musician(s) && s.player.stats.fame >= 25,
    text: 'The morning of the biggest show of your year, you open your mouth and produce a sound like a door in a draught. The doctor says rest. The promoter says the tickets are sold.',
    choices: [
      {
        id: 'cancel',
        label: 'Cancel and rest',
        outcomes: [
          {
            chance: 1,
            text: 'You refund the tickets and spend a week drinking honey and writing apologetic notes. Your voice comes back whole, which is the point.',
            effects: [
              { money: -12000 },
              { stat: 'health', delta: 3 },
              { stat: 'happiness', delta: -4 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'push',
        label: 'Sing anyway',
        outcomes: [
          {
            chance: 0.4,
            text: 'You croak the first verse, the crowd takes the rest, and it becomes the famous night everyone sang for you. Your throat forgives you, eventually.',
            effects: [{ fame: 4 }, { stat: 'happiness', delta: 6 }, { stat: 'health', delta: -3 }],
            success: true,
          },
          {
            chance: 0.6,
            text: 'Your voice gives out in the third song and does not come back for two months. A specialist uses the word "nodes" in a very serious tone.',
            effects: [
              { skill: 'voice', delta: -6 },
              { stat: 'health', delta: -5 },
              { stat: 'stress', delta: 8 },
            ],
          },
        ],
      },
      {
        id: 'guests',
        label: 'Phone round for guest singers',
        outcomes: [
          {
            chance: 0.6,
            text: 'Three friends take a verse each while you play guitar and mime gratitude. The show becomes a one-off people still talk about.',
            effects: [{ fame: 3 }, { stat: 'happiness', delta: 6 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Only one friend can make it, and he knows two of your songs. It is a long, generous, slightly baffling evening.',
            effects: [{ fame: -1 }, { stat: 'stress', delta: 4 }],
          },
        ],
      },
    ],
  },
  {
    id: 'mus_acoustic_special',
    kind: 'choice',
    category: 'fame',
    emoji: '🪕',
    ages: [18, 85],
    weight: 5,
    cooldownYears: 7,
    when: (s) => released(s) && s.player.stats.fame >= 40,
    text: 'A television channel wants you for a stripped-back special: a small room, candles, a cello player, no backing tracks, nowhere to hide. Your loudest songs will need to survive being whispered.',
    choices: [
      {
        id: 'yes',
        label: 'Do it, candles and all',
        outcomes: [
          {
            chance: 0.6,
            text: 'Without the noise, the songs turn out to be about something. The recording sells for years, mostly to people who never liked you before.',
            effects: [
              { fame: 5 },
              { money: 25000, kind: 'wage' },
              { skill: 'instrument', delta: 2 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Stripped back, your big anthem is revealed as three chords and the word "tonight". The cellist looks sorry for you.',
            effects: [
              { money: 15000, kind: 'wage' },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'rework',
        label: 'Rearrange everything from scratch',
        outcomes: [
          {
            chance: 1,
            text: 'Two months of rehearsal for one night. You find a slow version of your silliest song that makes the cellist cry, which you take as a review.',
            effects: [
              { fame: 4 },
              { money: 20000, kind: 'wage' },
              { skill: 'voice', delta: 3 },
              { stat: 'stress', delta: 4 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'no',
        label: 'Your songs need their volume',
        outcomes: [
          {
            chance: 1,
            text: 'You say no. They ask a rival instead, who cries on camera during the bridge. The clip follows you around for a decade.',
            effects: [{ stat: 'happiness', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'mus_comeback_album',
    kind: 'choice',
    category: 'fame',
    emoji: '🔁',
    ages: [45, 85],
    weight: 6,
    cooldownYears: 8,
    when: (s) =>
      released(s) && s.year - (s.music.releases[s.music.releases.length - 1]?.year ?? s.year) >= 6,
    text: 'It has been years since your last record. Your hair is a different colour, your knees creak, and you have twelve new songs about exactly that. A small label calls to ask if you are "still doing music".',
    choices: [
      {
        id: 'honest',
        label: 'Make the honest, older record',
        outcomes: [
          {
            chance: 0.55,
            text: 'Critics call it a late masterpiece. People your age buy it in actual shops, and young people discover your old records through it.',
            effects: [
              { fame: 8 },
              { money: 20000, kind: 'wage' },
              { stat: 'happiness', delta: 10 },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'It is quietly lovely and sells to about the same forty people who bought your first record. You know most of them by name now.',
            effects: [{ fame: 1 }, { stat: 'happiness', delta: 5 }],
          },
        ],
      },
      {
        id: 'young',
        label: "Chase a young producer's sound",
        outcomes: [
          {
            chance: 0.3,
            text: "Against all odds, it works. You are on the radio next to people your children's age, and none of them know quite what to make of you.",
            effects: [
              { fame: 10 },
              { money: 30000, kind: 'wage' },
              { stat: 'happiness', delta: 7 },
            ],
            success: true,
          },
          {
            chance: 0.7,
            text: 'You sound like a parent at a wedding doing the robot. A reviewer is kind about it, which is somehow worse.',
            effects: [{ fame: -3 }, { stat: 'happiness', delta: -5 }],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Keep the songs for the kitchen',
        outcomes: [
          {
            chance: 1,
            text: 'You play them for your family on Sundays. They are the best audience you have ever had, and they never leave early.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'stress', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mus_reunion_tour',
    kind: 'choice',
    category: 'fame',
    emoji: '🚌',
    ages: [40, 85],
    weight: 6,
    cooldownYears: 8,
    when: (s) => band(s) && s.music.releases.length > 0,
    bind: { mate: { role: 'bandmate' } },
    text: 'A promoter offers the old line-up a reunion tour: thirty dates, real money, a bus with beds. You have not been in a room with {mate.first} for longer than a funeral in years.',
    choices: [
      {
        id: 'yes',
        label: 'Get the band back together',
        outcomes: [
          {
            chance: 0.6,
            text: 'The first rehearsal is awkward for eleven minutes and then it is twenty years ago. You sell out every date, and {mate.first} hugs you on the last night.',
            effects: [
              { money: 80000, kind: 'wage' },
              { fame: 6 },
              { stat: 'happiness', delta: 8 },
              { rel: 'mate', delta: 12, memory: 'the reunion tour' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Every old argument climbs aboard the bus. You finish the tour richer, and you and {mate.first} travel separately to the final show.',
            effects: [
              { money: 80000, kind: 'wage' },
              { stat: 'stress', delta: 10 },
              { rel: 'mate', delta: -10, memory: 'the bus with the old arguments' },
            ],
          },
        ],
      },
      {
        id: 'one_night',
        label: 'One night only, then done',
        outcomes: [
          {
            chance: 1,
            text: 'One sweaty, perfect night in a hometown hall. Nobody pretends it is the start of anything, and that is why it is so good.',
            effects: [
              { money: 15000, kind: 'wage' },
              { stat: 'happiness', delta: 7 },
              { rel: 'mate', delta: 6, memory: 'the one-night reunion' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'no',
        label: 'Leave the past where it is',
        outcomes: [
          {
            chance: 1,
            text: 'You decline. A tribute act takes the dates instead and does quite well. You go to see them in disguise, and they are not bad.',
            effects: [
              { stat: 'happiness', delta: 1 },
              { rel: 'mate', delta: -3, memory: 'the reunion you said no to' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mus_tinnitus',
    kind: 'choice',
    category: 'fame',
    emoji: '👂',
    ages: [25, 85],
    weight: 5,
    cooldownYears: 8,
    when: (s) => musician(s) && s.music.stage >= 3,
    text: 'The ringing in your ears used to stop by morning. Now it is there when you wake, a thin high note that follows you round the house like a mosquito with tenure.',
    choices: [
      {
        id: 'protect',
        label: 'See a specialist and wear earplugs on stage',
        outcomes: [
          {
            chance: 1,
            text: 'The custom plugs make everything sound like it is happening next door, but the ringing stops getting worse. You learn to love the muffled roar.',
            effects: [
              { money: -1500 },
              { stat: 'health', delta: 2 },
              { stat: 'stress', delta: -2 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'ignore',
        label: 'Turn it up and carry on',
        outcomes: [
          {
            chance: 1,
            text: 'The note gets louder and more permanent. You now sleep with a fan running, and you ask people to repeat themselves at dinner.',
            effects: [
              { stat: 'health', delta: -4 },
              { stat: 'stress', delta: 5 },
              { skill: 'instrument', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mus_young_cover_hit',
    kind: 'notice',
    category: 'fame',
    emoji: '🌱',
    ages: [35, 85],
    weight: 5,
    cooldownYears: 8,
    when: released,
    text: 'A young singer you have never heard of records one of your old songs, slower and stranger, and it climbs higher than your version ever did.',
    outcomes: [
      {
        chance: 0.7,
        text: 'The royalties arrive like a long-lost relative with gifts. In interviews the singer calls you a hero, and your old record sells again too.',
        effects: [{ money: 40000, kind: 'wage' }, { fame: 5 }, { stat: 'happiness', delta: 8 }],
        success: true,
      },
      {
        chance: 0.3,
        text: 'The cheques are lovely. It stings only slightly that people now think you are covering them when you play it.',
        effects: [
          { money: 30000, kind: 'wage' },
          { stat: 'happiness', delta: 3 },
        ],
      },
    ],
  },
  {
    id: 'mus_video_shoot_disaster',
    kind: 'choice',
    category: 'work',
    emoji: '🎬',
    ages: [16, 85],
    weight: 6,
    cooldownYears: 6,
    when: signed,
    text: 'The video concept is "you, a horse, a beach at dawn". The horse has opinions, the tide is coming in faster than planned, and the director keeps shouting "more yearning!"',
    choices: [
      {
        id: 'commit',
        label: 'Yearn harder at the horse',
        outcomes: [
          {
            chance: 0.5,
            text: 'The horse stands perfectly still just as the sun breaks. The final shot is ridiculous and beautiful and becomes the image everyone knows you by.',
            effects: [{ fame: 5 }, { stat: 'happiness', delta: 5 }],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The horse bolts, you fall in the sea, and the director keeps rolling. The blooper reel outlives the actual video by decades.',
            effects: [{ injury: 3 }, { fame: 2 }, { stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'change',
        label: 'Rewrite it: just you in a car park',
        outcomes: [
          {
            chance: 1,
            text: 'One take in a multistorey with a single street light. It is cheap, moody and much admired, and the horse goes home happy.',
            effects: [{ fame: 3 }, { stat: 'stress', delta: -2 }],
            success: true,
          },
        ],
      },
    ],
  },
  {
    id: 'mus_desert_residency',
    kind: 'choice',
    category: 'work',
    emoji: '🎰',
    ages: [40, 85],
    weight: 5,
    cooldownYears: 8,
    when: star,
    text: 'A casino in a desert city wants you for a two-year residency: three nights a week, the same theatre, your name in lights next to a buffet. No more buses. A great deal of carpet.',
    choices: [
      {
        id: 'sign',
        label: 'Sign for two years',
        outcomes: [
          {
            chance: 0.6,
            text: 'You build the show you always wanted and play it to perfection two hundred times. You make a fortune and learn to like the carpet.',
            effects: [
              { money: 400000, kind: 'wage' },
              { stat: 'happiness', delta: 5 },
              { stat: 'health', delta: 2 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The money is huge and the nights blur together. By the second year you sing the songs on autopilot, and the slot machines start to sound like applause.',
            effects: [
              { money: 400000, kind: 'wage' },
              { stat: 'happiness', delta: -5 },
              { vice: 'gambling', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'short',
        label: 'Do one month as an experiment',
        outcomes: [
          {
            chance: 1,
            text: 'One month, twelve shows, a suntan. You leave before it gets weird, with a nice cheque and a souvenir ashtray.',
            effects: [
              { money: 60000, kind: 'wage' },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'no',
        label: 'You are not ready for the buffet',
        outcomes: [
          {
            chance: 1,
            text: 'You turn it down and go back on the road. Somewhere in a cold service station at two in the morning, you wonder.',
            effects: [
              { stat: 'stress', delta: 3 },
              { stat: 'karma', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mus_charity_concert',
    kind: 'choice',
    category: 'fame',
    emoji: '💛',
    ages: [16, 85],
    weight: 6,
    cooldownYears: 6,
    when: (s) => musician(s) && s.player.stats.fame >= 30,
    text: 'An all-star benefit concert for flood relief asks you to play one song, unpaid, between a comedian and a man who plays the saw. The broadcast reaches half the world.',
    choices: [
      {
        id: 'play',
        label: 'Play your biggest song',
        outcomes: [
          {
            chance: 1,
            text: 'Four minutes on stage, a hundred thousand voices, and a total raised that makes you sit down. It is the best you feel about your job all year.',
            effects: [{ fame: 4 }, { stat: 'karma', delta: 5 }, { stat: 'happiness', delta: 7 }],
            success: true,
          },
        ],
      },
      {
        id: 'new_song',
        label: 'Write something new for the cause',
        outcomes: [
          {
            chance: 0.5,
            text: 'Written in a hotel room the night before, it becomes the anthem of the evening and raises a small fortune on its own.',
            effects: [{ fame: 6 }, { stat: 'karma', delta: 6 }, { stat: 'happiness', delta: 8 }],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The new song is earnest and under-rehearsed. The man with the saw gets the bigger cheer, and the cause still does well, which matters more.',
            effects: [
              { stat: 'karma', delta: 4 },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'donate',
        label: 'Send a cheque instead',
        outcomes: [
          {
            chance: 1,
            text: 'The cheque is generous and nobody films it. The organisers thank you warmly, and a tabloid notes your absence.',
            effects: [{ money: -10000 }, { stat: 'karma', delta: 3 }, { fame: -1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'mus_backstage_admirer',
    kind: 'choice',
    category: 'fame',
    emoji: '🌙',
    ages: [18, 85],
    weight: 5,
    cooldownYears: 5,
    adultsOnly: true,
    when: (s) => musician(s) && s.player.stats.fame >= 35,
    text: 'Backstage after the show, a striking stranger with an all-access pass of uncertain origin says they followed the whole tour just to tell you something. They lean in and lower their voice.',
    choices: [
      {
        id: 'hotel',
        label: 'Invite them back to the hotel',
        requires: (s) =>
          !s.npcs.some(
            (n) => n.alive && (n.roles.includes('partner') || n.roles.includes('spouse')),
          ),
        outcomes: [
          {
            chance: 0.6,
            text: 'The night is long and the door stays closed. In the morning they leave a note on the hotel stationery that you keep for years.',
            effects: [
              { stat: 'happiness', delta: 8 },
              { stat: 'stress', delta: -4 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Things go as you hoped behind closed doors. By lunch, a gossip column has a blurry photo of you both in the hotel lobby.',
            effects: [{ stat: 'happiness', delta: 4 }, { notoriety: 2 }, { fame: 1 }],
          },
        ],
      },
      {
        id: 'talk',
        label: 'Hear them out over a drink',
        outcomes: [
          {
            chance: 1,
            text: 'What they wanted to say is that your second album got them through a bad year. You talk until the cleaners arrive and part as friends.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'karma', delta: 2 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'security',
        label: 'Ask security how they got in',
        outcomes: [
          {
            chance: 1,
            text: 'The pass turns out to be laminated cereal box. Security tightens. The stranger waves sadly from behind a barrier at the next three shows.',
            effects: [
              { stat: 'stress', delta: 2 },
              { stat: 'karma', delta: -1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mus_music_tv_era',
    kind: 'choice',
    category: 'fame',
    emoji: '📼',
    ages: [16, 85],
    weight: 7,
    cooldownYears: 5,
    fromYear: 1981,
    toYear: 2005,
    when: released,
    text: "The music-video channel everyone's teenagers watch all day wants your new video in rotation, if you can cut it to three minutes and lose the bit where you stare at a fridge.",
    choices: [
      {
        id: 'cut',
        label: 'Cut the fridge',
        outcomes: [
          {
            chance: 0.65,
            text: 'Heavy rotation. Teenagers learn your dance routine in bedrooms across the country, and parents learn your name against their will.',
            effects: [{ fame: 7 }, { money: 10000, kind: 'wage' }, { stat: 'happiness', delta: 6 }],
            success: true,
          },
          {
            chance: 0.35,
            text: 'It airs twice, both times at four in the morning. One of the viewers is your aunt, who rings to say the fridge was the best bit.',
            effects: [{ fame: 1 }, { stat: 'happiness', delta: -2 }],
          },
        ],
      },
      {
        id: 'keep',
        label: 'The fridge is the whole point',
        outcomes: [
          {
            chance: 0.3,
            text: 'A late-night alternative show plays the full fridge version and it becomes a cult object. Art students quote it at parties.',
            effects: [{ fame: 4 }, { stat: 'happiness', delta: 7 }],
            success: true,
          },
          {
            chance: 0.7,
            text: 'The channel passes. You hold an artistic principle and a video nobody sees, which is a lonely pair of things to hold.',
            effects: [{ stat: 'happiness', delta: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'mus_playlist_placement',
    kind: 'notice',
    category: 'fame',
    emoji: '🎧',
    ages: [16, 85],
    weight: 7,
    cooldownYears: 4,
    fromYear: 2015,
    when: released,
    text: 'One of your songs lands on a huge streaming playlist called something like "Rainy Afternoon Focus" between a lo-fi beat and the sound of a ceiling fan.',
    outcomes: [
      {
        chance: 0.6,
        text: 'Millions of people play it while doing spreadsheets. Hardly any of them know your name, but the cheques know your address.',
        effects: [{ money: 9000, kind: 'wage' }, { fame: 2 }, { stat: 'happiness', delta: 4 }],
        success: true,
      },
      {
        chance: 0.4,
        text: 'Millions of plays work out at roughly the price of a decent dinner. You eat it slowly and with some bitterness.',
        effects: [{ money: 300, kind: 'wage' }, { fame: 1 }, { stat: 'happiness', delta: -1 }],
      },
    ],
  },
  {
    id: 'mus_short_video_moment',
    kind: 'choice',
    category: 'fame',
    emoji: '📱',
    ages: [16, 85],
    weight: 7,
    cooldownYears: 4,
    fromYear: 2019,
    when: musician,
    text: "Fifteen seconds of a song you wrote years ago goes viral as the soundtrack to people revealing their dogs' outfits. Millions of short videos, none of them about you.",
    choices: [
      {
        id: 'join',
        label: 'Post your own dog in an outfit',
        outcomes: [
          {
            chance: 0.6,
            text: 'Your dog in a tiny raincoat outperforms every interview you have ever given. Old fans and new ones find the rest of your songs.',
            effects: [{ fame: 6 }, { money: 5000, kind: 'wage' }, { stat: 'happiness', delta: 6 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'It reads as trying too hard. A teenager comments "who is this" under your post about your own song.',
            effects: [{ fame: 1 }, { stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'full',
        label: 'Release the full song properly',
        outcomes: [
          {
            chance: 0.5,
            text: 'People who only knew the fifteen seconds discover the other three minutes. The song charts, years late and fully deserved.',
            effects: [{ fame: 5 }, { money: 12000, kind: 'wage' }, { stat: 'happiness', delta: 5 }],
            success: true,
          },
          {
            chance: 0.5,
            text: 'Everyone loves the fifteen seconds. The rest of the song, it turns out, is not what they came for.',
            effects: [
              { money: 2000, kind: 'wage' },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'ignore',
        label: 'Let the dogs have it',
        outcomes: [
          {
            chance: 1,
            text: 'You stay out of it and the royalties trickle in on their own. Every so often a dog in a hat walks past you in the park to your music.',
            effects: [
              { money: 3000, kind: 'wage' },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
];
