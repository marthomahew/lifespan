import type { EventDef } from '../../engine/events/types';
import { inSchool, oddsBy, statAtLeast } from './conditions';

export const TEEN_EVENTS: EventDef[] = [
  {
    id: 'teen_group_project_freeloader',
    kind: 'choice',
    category: 'school',
    ages: [13, 17],
    weight: 10,
    cooldownYears: 3,
    when: inSchool,
    text: "Your history group project is due Friday. {classmate.first} has contributed one idea, and the idea was 'a font.'",
    choices: [
      {
        id: 'do_it_all',
        label: 'Do the whole thing yourself',
        outcomes: [
          {
            chance: 1,
            text: 'You pull two late nights and get an A. {classmate.first} gets the same A and thanks the font.',
            effects: [
              { stat: 'smarts', delta: 4 },
              { stat: 'stress', delta: 6 },
              { stat: 'discipline', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'tell_teacher',
        label: 'Tell the teacher',
        outcomes: [
          {
            chance: 0.6,
            success: true,
            text: '{teacher.first} quietly splits the grade. {classmate.first} finds out anyway and gives you a long, wounded look across the cafeteria.',
            effects: [
              { stat: 'karma', delta: 2 },
              {
                rel: 'classmate',
                delta: -6,
                memory: 'the time you reported them for the history project',
              },
            ],
          },
          {
            chance: 0.4,
            text: '{teacher.first} says group work is about learning to cooperate, which is easy to say when you are not in the group.',
            effects: [{ stat: 'happiness', delta: -4 }],
          },
        ],
      },
      {
        id: 'confront',
        label: 'Assign them a real job',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.5),
            success: true,
            text: '{classmate.first} makes the poster, and it is genuinely gorgeous. Turns out nobody had ever asked.',
            effects: [
              { rel: 'classmate', delta: 8, memory: 'the history poster you made together' },
              { stat: 'smarts', delta: 2 },
            ],
          },
          {
            chance: 0.5,
            text: 'The poster arrives Friday morning. It says HISTORY in a lovely font and nothing else.',
            effects: [
              { stat: 'smarts', delta: -2 },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'teen_driving_lesson_lot',
    kind: 'choice',
    category: 'family',
    ages: [15, 17],
    weight: 9,
    once: true,
    text: '{father.first} takes you to an empty supermarket car park for your first driving lesson. {father.They} grip{father.s} the door handle before you have even started the engine.',
    choices: [
      {
        id: 'careful',
        label: 'Go painfully slowly',
        outcomes: [
          {
            chance: 1,
            text: 'You circle the car park at walking pace for an hour. A man with a trolley overtakes you twice.',
            effects: [
              { rel: 'father', delta: 5, memory: 'your glacial first driving lesson' },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'confident',
        label: 'Drive like you mean it',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.45),
            success: true,
            text: 'You nail a three-point turn on the first try. {father.first} tells the entire family at dinner, twice.',
            effects: [
              { rel: 'father', delta: 8, memory: 'your perfect three-point turn' },
              { stat: 'happiness', delta: 6 },
            ],
          },
          {
            chance: 0.55,
            text: 'You meet a lamppost at low speed. Nobody is hurt except the bumper and {father.first}’s faith in you.',
            effects: [
              { rel: 'father', delta: -5, memory: 'the lamppost incident' },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Say you would rather take the bus forever',
        outcomes: [
          {
            chance: 1,
            text: '{father.first} looks relieved, then guilty about looking relieved. You both go get milkshakes instead.',
            effects: [
              { rel: 'father', delta: 3, memory: 'the driving lesson that became milkshakes' },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'teen_school_play_audition',
    kind: 'choice',
    category: 'school',
    ages: [13, 17],
    weight: 8,
    cooldownYears: 4,
    when: inSchool,
    text: '{teacher.first} is casting the spring play, a musical about a lighthouse keeper who may or may not be a ghost. Sign-ups close at lunch.',
    choices: [
      {
        id: 'lead',
        label: 'Audition for the lead',
        outcomes: [
          {
            chance: oddsBy('looks', 0.35, 0.004),
            success: true,
            text: 'You get the part. Opening night, you forget one line and improvise a better one. The applause is real.',
            effects: [
              { stat: 'happiness', delta: 10 },
              { skill: 'voice', delta: 6 },
              { rel: 'teacher', delta: 6, memory: 'your turn as the ghost keeper' },
            ],
          },
          {
            chance: 0.65,
            text: 'You are cast as Fog. Fog has no lines but does a lot of drifting, and you drift with conviction.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { skill: 'voice', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'crew',
        label: 'Join the stage crew',
        outcomes: [
          {
            chance: 1,
            text: 'You build a lighthouse out of plywood and stubbornness. It is the only part of the show the local paper mentions.',
            effects: [
              { skill: 'art', delta: 4 },
              { stat: 'discipline', delta: 3 },
              { status: 'friend' },
            ],
          },
        ],
      },
      {
        id: 'skip',
        label: 'Eat your lunch in peace',
        outcomes: [
          {
            chance: 1,
            text: 'Your sandwich is excellent. Somewhere down the hall, people are singing about fog.',
            effects: [{ stat: 'stress', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'teen_grandparent_tech_support',
    kind: 'choice',
    category: 'family',
    ages: [13, 17],
    weight: 8,
    cooldownYears: 5,
    text: '{grandparent.first} has bought a new phone and needs help. {grandparent.They} {grandparent.has} already accidentally set the language to Finnish.',
    choices: [
      {
        id: 'patient',
        label: 'Teach slowly, step by step',
        outcomes: [
          {
            chance: 1,
            text: 'Two hours later {grandparent.first} can send a photo. Every photo since has been of a thumb, sent with love.',
            effects: [
              { rel: 'grandparent', delta: 10, memory: 'the afternoon you taught them the phone' },
              { stat: 'karma', delta: 3 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'just_fix',
        label: 'Just set it all up yourself',
        outcomes: [
          {
            chance: 0.6,
            text: 'Done in ten minutes. A week later the phone is in Finnish again, and nobody knows how.',
            effects: [{ rel: 'grandparent', delta: 3, memory: 'the time you set up their phone' }],
          },
          {
            chance: 0.4,
            text: '{grandparent.first} slips you a folded note “for your trouble.” It is enough for a pizza.',
            effects: [
              { money: 30 },
              { rel: 'grandparent', delta: 4, memory: 'the phone set-up tip' },
            ],
          },
        ],
      },
      {
        id: 'learn_finnish',
        label: 'Leave it in Finnish',
        outcomes: [
          {
            chance: 1,
            text: 'You both decide this is a fun challenge. {grandparent.first} now knows the Finnish word for “voicemail” and uses it constantly.',
            effects: [
              { rel: 'grandparent', delta: 6, memory: 'the Finnish phone' },
              { stat: 'happiness', delta: 4 },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'teen_cafeteria_rival',
    kind: 'choice',
    category: 'social',
    ages: [13, 17],
    weight: 9,
    cooldownYears: 3,
    text: '{enemy.first} has started a rumour that you cry at dog food adverts. This is true, which somehow makes it worse.',
    choices: [
      {
        id: 'own_it',
        label: 'Own it loudly',
        outcomes: [
          {
            chance: oddsBy('happiness', 0.55),
            success: true,
            text: 'You announce that the one with the old terrier is a masterpiece. Half the table agrees. The rumour dies of embarrassment.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { rel: 'enemy', delta: -3, memory: 'the dog advert rumour that backfired' },
            ],
          },
          {
            chance: 0.45,
            text: 'Someone starts barking whenever you walk past. It lasts a month, which in school is a geological era.',
            effects: [
              { stat: 'happiness', delta: -5 },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'counter',
        label: 'Spread something about them',
        outcomes: [
          {
            chance: 0.5,
            text: 'You tell people {enemy.first} still sleeps with a nightlight. It spreads fast. You feel worse than expected.',
            effects: [
              { stat: 'karma', delta: -5 },
              { rel: 'enemy', delta: -10, memory: 'the nightlight rumour you started' },
            ],
          },
          {
            chance: 0.5,
            text: 'Nobody believes you, because {enemy.first} got there first and told everyone you would say exactly that.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { rel: 'enemy', delta: -4, memory: 'your failed counter-rumour' },
            ],
          },
        ],
      },
      {
        id: 'truce',
        label: 'Ask them why they hate you',
        outcomes: [
          {
            chance: 0.35,
            success: true,
            text: '{enemy.first} admits it is about a seat on a bus in Year Seven. You both laugh. It is not quite friendship, but it is close.',
            effects: [
              { rel: 'enemy', delta: 15, memory: 'the bus seat truce' },
              { stat: 'karma', delta: 3 },
            ],
          },
          {
            chance: 0.65,
            text: '{enemy.first} says “you know what you did” and walks off. You genuinely do not.',
            effects: [{ stat: 'stress', delta: 3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'teen_summer_flyers',
    kind: 'choice',
    category: 'money',
    ages: [14, 17],
    weight: 8,
    cooldownYears: 4,
    text: 'A mattress shop called Slumber Kingdom offers you a summer job handing out flyers while dressed as a large, smiling pillow.',
    choices: [
      {
        id: 'take',
        label: 'Become the pillow',
        outcomes: [
          {
            chance: 0.7,
            text: 'Eight weeks inside a foam costume. You come out sweaty, humbled and noticeably richer.',
            effects: [
              { money: 900 },
              { stat: 'discipline', delta: 5 },
              { stat: 'looks', delta: -1 },
            ],
          },
          {
            chance: 0.3,
            text: 'A classmate photographs you mid-wave. By Monday the picture is the background on half the school’s phones. The money still spends.',
            effects: [{ money: 900 }, { stat: 'happiness', delta: -4 }],
          },
        ],
      },
      {
        id: 'negotiate',
        label: 'Ask for more money first',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.4),
            success: true,
            text: 'The manager is so startled a teenager negotiated that he raises your rate and lets you skip the head piece.',
            effects: [{ money: 1200 }, { stat: 'discipline', delta: 3 }, { addTrait: 'ambitious' }],
          },
          {
            chance: 0.6,
            text: 'The job goes to a kid who said yes immediately. You spend the summer watching someone else be the pillow.',
            effects: [{ stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'refuse',
        label: 'Spend the summer doing nothing',
        outcomes: [
          {
            chance: 1,
            text: 'You sleep in, read four books and become an expert on one very specific video game. No regrets, no cash.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'stress', delta: -4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'teen_school_sign_prank',
    kind: 'choice',
    category: 'crime',
    ages: [14, 17],
    weight: 7,
    cooldownYears: 5,
    bind: { pal: { role: 'friend', minRelationship: 20 } },
    text: '{pal.first} has a plan to rearrange the letters on the school’s outdoor sign overnight. {pal.They} {pal.has} already worked out what it should say, and it is not kind to the head teacher.',
    choices: [
      {
        id: 'join',
        label: 'Help with the letters',
        outcomes: [
          {
            chance: 0.5,
            success: true,
            text: 'The sign stays up for a full morning. Nobody finds out it was you, and you cannot tell anyone, which is its own punishment.',
            effects: [
              { stat: 'happiness', delta: 7 },
              { stat: 'karma', delta: -2 },
              { rel: 'pal', delta: 8, memory: 'the night of the school sign' },
            ],
          },
          {
            chance: 0.5,
            text: 'A caretaker with a torch catches you both holding the letter Q. A police officer gives you a stern talking-to and your parents a phone call.',
            effects: [
              { flag: 'juvenile_warning' },
              { stat: 'stress', delta: 8 },
              { rel: 'mother', delta: -6, memory: 'the night the police called about the sign' },
              { rel: 'pal', delta: 4, memory: 'getting caught together at the sign' },
            ],
          },
        ],
      },
      {
        id: 'improve',
        label: 'Suggest a nicer message',
        outcomes: [
          {
            chance: 1,
            text: 'The sign now reads GOOD LUCK ON EXAMS, YOU ARE ALL LOVED. Nobody can work out who to punish for kindness.',
            effects: [
              { stat: 'karma', delta: 4 },
              { rel: 'pal', delta: -2, memory: 'the time you made the prank wholesome' },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'refuse',
        label: 'Stay in bed',
        outcomes: [
          {
            chance: 1,
            text: '{pal.first} goes alone and gets the spelling wrong. You are the only one who finds this hilarious.',
            effects: [
              { rel: 'pal', delta: -3, memory: 'the night you bailed on the sign plan' },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'teen_garage_band',
    kind: 'choice',
    category: 'social',
    ages: [13, 16],
    weight: 8,
    once: true,
    bind: { pal: { role: 'friend', minRelationship: 25 } },
    text: '{pal.first} wants to start a band in {pal.their} garage. You have no instrument, but {pal.first} says enthusiasm is basically an instrument.',
    choices: [
      {
        id: 'drums',
        label: 'Take up the drums',
        outcomes: [
          {
            chance: 1,
            success: true,
            text: 'You practise on a borrowed kit until the neighbours start leaving notes. The band picks a name: Accidental Soup.',
            effects: [
              { skill: 'instrument', delta: 6 },
              { stat: 'happiness', delta: 6 },
              { rel: 'pal', delta: 6, memory: 'starting Accidental Soup' },
            ],
            next: { eventId: 'teen_garage_band_showcase', inYears: [1, 2] },
          },
        ],
      },
      {
        id: 'sing',
        label: 'Volunteer as the singer',
        outcomes: [
          {
            chance: 1,
            text: 'You sing every song as though it is the saddest thing ever written, including the one about a sandwich. The band is thrilled.',
            effects: [
              { skill: 'voice', delta: 5 },
              { stat: 'happiness', delta: 5 },
              { rel: 'pal', delta: 6, memory: 'your tragic sandwich ballad' },
            ],
            next: { eventId: 'teen_garage_band_showcase', inYears: [1, 2] },
          },
        ],
      },
      {
        id: 'manager',
        label: 'Offer to be the manager instead',
        outcomes: [
          {
            chance: 1,
            text: 'You make a spreadsheet and a logo. The band never plays a gig, but the logo is extremely professional.',
            effects: [
              { skill: 'art', delta: 3 },
              { rel: 'pal', delta: 2, memory: 'the band logo you designed' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'teen_garage_band_showcase',
    kind: 'choice',
    category: 'social',
    ages: [14, 19],
    weight: 10,
    chainOnly: true,
    bind: { pal: { role: 'friend' } },
    text: 'Accidental Soup has been offered a slot at the school talent showcase. {pal.first} wants to debut a seven-minute song about the moon. You have rehearsed it twice.',
    choices: [
      {
        id: 'play_moon',
        label: 'Play the moon song',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.45),
            success: true,
            text: 'Minute five gets a standing ovation, mostly from parents, but still. Someone films it and it gets passed around for weeks.',
            effects: [
              { stat: 'happiness', delta: 10 },
              { skill: 'instrument', delta: 4 },
              { rel: 'pal', delta: 10, memory: 'the moon song triumph' },
            ],
          },
          {
            chance: 0.55,
            text: 'The band loses the tempo around minute three and never finds it again. The moon, at least, is unaffected.',
            effects: [
              { stat: 'happiness', delta: -5 },
              { rel: 'pal', delta: -3, memory: 'the night the moon song fell apart' },
            ],
          },
        ],
      },
      {
        id: 'play_cover',
        label: 'Insist on the one song you know',
        outcomes: [
          {
            chance: 1,
            text: 'You play your tight, safe three-minute number and take second place behind a boy who juggles. {pal.first} sulks through the trophy photo.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { rel: 'pal', delta: -4, memory: 'vetoing the moon song' },
            ],
          },
        ],
      },
      {
        id: 'quit',
        label: 'Quit the band before the show',
        outcomes: [
          {
            chance: 1,
            text: 'You watch from the back row as Accidental Soup plays without you. They are worse. You feel smug, then lonely.',
            effects: [
              { rel: 'pal', delta: -10, memory: 'quitting the band before the showcase' },
              { stat: 'stress', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'teen_sibling_hoodie',
    kind: 'choice',
    category: 'family',
    ages: [13, 17],
    weight: 9,
    cooldownYears: 3,
    text: 'Your favourite hoodie has been missing for a week. You spot it on {sibling.first}, who is wearing it with the confidence of the rightful owner.',
    choices: [
      {
        id: 'demand',
        label: 'Demand it back',
        outcomes: [
          {
            chance: 0.6,
            text: '{sibling.first} hands it over. It now smells faintly of someone else’s cereal, and there is a new hole in the sleeve.',
            effects: [
              { rel: 'sibling', delta: -4, memory: 'the hoodie confrontation' },
              { stat: 'happiness', delta: 2 },
            ],
          },
          {
            chance: 0.4,
            text: 'It becomes a shouting match. {mother.first} confiscates the hoodie entirely. Nobody wins.',
            effects: [
              { rel: 'sibling', delta: -6, memory: 'the hoodie war' },
              { stat: 'stress', delta: 4 },
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
            success: true,
            text: 'You swap the hoodie for a week of {sibling.first} doing your share of the dishes. It is the best deal you have ever made.',
            effects: [
              { rel: 'sibling', delta: 3, memory: 'the hoodie-for-dishes deal' },
              { stat: 'happiness', delta: 4 },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'let_go',
        label: 'Let them keep it',
        outcomes: [
          {
            chance: 1,
            text: '{sibling.first} is so surprised that {sibling.they} {sibling.is} nice to you for almost a whole week.',
            effects: [
              { rel: 'sibling', delta: 8, memory: 'the time you gave up your hoodie' },
              { stat: 'karma', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'teen_missed_curfew',
    fromYear: 2008,
    kind: 'choice',
    category: 'family',
    ages: [14, 17],
    weight: 8,
    cooldownYears: 3,
    bind: { mother: { role: 'mother', hasMemory: true } },
    text: 'You get home ninety minutes after curfew. {mother.first} is sitting in the dark kitchen like a film villain, and {mother.they} still bring{mother.s} up {mother.memory}.',
    choices: [
      {
        id: 'truth',
        label: 'Tell the whole truth',
        outcomes: [
          {
            chance: oddsBy('karma', 0.55),
            success: true,
            text: 'You explain that the bus broke down and your phone died. {mother.first} believes you, and the grounding is short.',
            effects: [
              { rel: 'mother', delta: 4, memory: 'the night the bus broke down' },
              { stat: 'karma', delta: 2 },
            ],
          },
          {
            chance: 0.45,
            text: 'The truth is that you lost track of time at a friend’s house playing a board game. Two weeks grounded, no appeals.',
            effects: [
              { rel: 'mother', delta: -3, memory: 'the board-game curfew' },
              { stat: 'happiness', delta: -5 },
            ],
          },
        ],
      },
      {
        id: 'excuse',
        label: 'Invent an elaborate excuse',
        outcomes: [
          {
            chance: 0.3,
            text: 'Your story involves a lost tourist, a goose and a heroic detour. Against all odds, it works.',
            effects: [
              { stat: 'karma', delta: -3 },
              { stat: 'happiness', delta: 3 },
              { addTrait: 'cunning' },
            ],
          },
          {
            chance: 0.7,
            text: 'The goose is where the story falls apart. {mother.first} adds a week to the grounding purely for the goose.',
            effects: [
              { rel: 'mother', delta: -7, memory: 'the goose excuse' },
              { stat: 'happiness', delta: -6 },
            ],
          },
        ],
      },
      {
        id: 'apologise',
        label: 'Apologise and go straight to bed',
        outcomes: [
          {
            chance: 1,
            text: 'In the morning there is toast waiting and a note that just says “TEXT ME.” Message received.',
            effects: [
              { rel: 'mother', delta: 2, memory: 'the TEXT ME note' },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'teen_growth_spurt',
    kind: 'notice',
    category: 'health',
    ages: [13, 15],
    weight: 6,
    once: true,
    text: 'Over one summer you grow so fast that none of your trousers reach your ankles.',
    outcomes: [
      {
        chance: 0.6,
        text: 'Your knees ache, you trip over doorframes, and you are suddenly the person asked to reach the top shelf.',
        effects: [
          { stat: 'looks', delta: 3 },
          { stat: 'health', delta: 2 },
        ],
      },
      {
        chance: 0.4,
        text: 'Your body cannot decide which part to grow first, so it starts with your nose. The rest catches up eventually.',
        effects: [
          { stat: 'looks', delta: -2 },
          { stat: 'happiness', delta: -2 },
        ],
      },
    ],
  },
  {
    id: 'teen_cracked_screen',
    kind: 'notice',
    category: 'random',
    ages: [13, 17],
    weight: 6,
    cooldownYears: 4,
    text: 'You drop your phone face-first onto the one paving stone in town that is shaped like a knife.',
    outcomes: [
      {
        chance: 0.5,
        text: 'The crack runs right through the middle. You learn to read messages around it like a code-breaker.',
        effects: [{ stat: 'happiness', delta: -3 }],
      },
      {
        chance: 0.5,
        text: 'Repairs cost most of your savings. You take it as a personal lesson in gravity.',
        effects: [{ money: -80 }, { stat: 'stress', delta: 3 }],
      },
    ],
  },
  {
    id: 'teen_teacher_praise',
    kind: 'notice',
    category: 'school',
    ages: [13, 17],
    weight: 5,
    cooldownYears: 4,
    when: statAtLeast('smarts', 60),
    text: '{teacher.first} hands back your essay with a single comment written across the top in green ink:',
    outcomes: [
      {
        chance: 0.7,
        text: '“This is the first essay I have enjoyed marking all year.” You read it eleven times on the bus home.',
        effects: [
          { stat: 'happiness', delta: 5 },
          { stat: 'smarts', delta: 2 },
          { rel: 'teacher', delta: 5, memory: 'the essay in green ink' },
        ],
      },
      {
        chance: 0.3,
        text: '“Brilliant, but please stop inventing quotes from historical figures.” Fair.',
        effects: [
          { stat: 'smarts', delta: 1 },
          { stat: 'karma', delta: -1 },
        ],
      },
    ],
  },
];
