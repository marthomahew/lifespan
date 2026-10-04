import type { EventDef } from '../../engine/events/types';
import { oddsBy, serving } from './conditions';

/** Day-to-day military life while serving: training, barracks, discipline, career. */
export const SERVICE_EVENTS: EventDef[] = [
  // ---- Young adult (18–29) ----
  {
    id: 'svc_ya_basic_training',
    kind: 'choice',
    category: 'military',
    ages: [18, 23],
    weight: 10,
    once: true,
    when: serving,
    text: 'Week two of basic training. It is 4:40 a.m., it is raining sideways, and the obstacle course has a wall you have privately named after your enemies.',
    choices: [
      {
        id: 'push',
        label: 'Throw yourself at the wall',
        outcomes: [
          {
            chance: oddsBy('health', 0.6),
            text: 'You clear it on the third try with a sound you did not know you could make. Something in you gets harder, in the good way.',
            effects: [
              { stat: 'discipline', delta: 6 },
              { conduct: 8 },
              { stat: 'happiness', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.35,
            text: 'You hit it chest-first and slide down into the mud. You go again anyway, and the instructors notice that part.',
            effects: [{ injury: 4 }, { conduct: 5 }, { stat: 'discipline', delta: 4 }],
          },
        ],
      },
      {
        id: 'pace',
        label: 'Pace yourself and finish steady',
        outcomes: [
          {
            chance: 1,
            text: 'You come in middle of the pack, dry-ish and uninjured. Nobody yells your name, which out here counts as praise.',
            effects: [{ stat: 'stress', delta: -3 }, { conduct: 3 }],
          },
        ],
      },
      {
        id: 'skip',
        label: 'Report a sore ankle to skip it',
        outcomes: [
          {
            chance: 0.5,
            text: 'The medic prods the ankle, then looks at you for a long moment. You spend the afternoon peeling potatoes with your reputation.',
            effects: [{ conduct: -8 }, { stat: 'karma', delta: -3 }],
          },
          {
            chance: 0.5,
            text: 'You get a day in the warm. The guilt follows you back to the barracks and sleeps in your bunk.',
            effects: [
              { conduct: -5 },
              { stat: 'happiness', delta: 2 },
              { stat: 'karma', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'svc_ya_drill_sergeant',
    kind: 'choice',
    category: 'military',
    ages: [18, 25],
    weight: 8,
    cooldownYears: 5,
    when: serving,
    text: 'Your drill sergeant has decided you are their personal project. Every mistake you make is announced to the whole platoon, with commentary.',
    choices: [
      {
        id: 'absorb',
        label: 'Take it and get better',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.6),
            text: 'Weeks later the sergeant stops shouting at you and starts shouting at someone else. It feels almost like a medal.',
            effects: [
              { stat: 'discipline', delta: 7 },
              { conduct: 10 },
              { stat: 'stress', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.35,
            text: 'You improve, but the volume does not. You start hearing that voice in your sleep.',
            effects: [
              { stat: 'discipline', delta: 4 },
              { conduct: 4 },
              { stat: 'stress', delta: 7 },
            ],
          },
        ],
      },
      {
        id: 'talk_back',
        label: 'Answer back, once',
        outcomes: [
          {
            chance: 0.7,
            text: 'The silence afterwards is enormous. You spend the weekend scrubbing things that were already clean.',
            effects: [{ conduct: -10 }, { stat: 'happiness', delta: -4 }],
          },
          {
            chance: 0.3,
            text: 'The sergeant almost smiles, then gives you extra drill for it. Your platoon treats you like a minor folk hero.',
            effects: [{ conduct: -5 }, { stat: 'happiness', delta: 4 }],
          },
        ],
      },
      {
        id: 'ask',
        label: 'Ask privately what you are doing wrong',
        outcomes: [
          {
            chance: 1,
            text: 'You get a blunt, oddly useful list. The public commentary softens to a mere running summary.',
            effects: [{ conduct: 6 }, { stat: 'smarts', delta: 2 }, { stat: 'stress', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'svc_ya_inspection_day',
    kind: 'notice',
    category: 'military',
    ages: [18, 29],
    weight: 7,
    cooldownYears: 4,
    when: serving,
    text: 'Inspection day. An officer in very clean gloves walks the length of your barracks looking for dust with the focus of an art critic.',
    outcomes: [
      {
        chance: 0.5,
        text: 'Your locker passes without comment. Your boots, polished at midnight, reflect the ceiling lights back at the officer.',
        effects: [{ conduct: 6 }, { stat: 'discipline', delta: 2 }],
      },
      {
        chance: 0.35,
        text: 'A single crumb is found beneath your bunk and held up for everyone to see. The whole room loses its weekend pass.',
        effects: [{ conduct: -6 }, { stat: 'happiness', delta: -4 }],
      },
      {
        chance: 0.15,
        text: 'The officer stops at your bunk, says nothing at all, and moves on. You will think about that silence for days.',
        effects: [{ stat: 'stress', delta: 4 }],
      },
    ],
  },
  {
    id: 'svc_ya_barracks_prank',
    kind: 'choice',
    category: 'military',
    ages: [18, 26],
    weight: 8,
    cooldownYears: 4,
    when: serving,
    bind: { buddy: { role: 'friend', minRelationship: 20 } },
    text: "{buddy.first} wants to fill the corporal's bunk with packing peanuts tonight. {buddy.They} {buddy.has} somehow sourced four bin bags of them.",
    choices: [
      {
        id: 'join',
        label: 'Help with the peanuts',
        outcomes: [
          {
            chance: 0.55,
            text: 'The corporal opens the door and disappears into a gentle white avalanche. Nobody talks. The legend grows.',
            effects: [
              { stat: 'happiness', delta: 7 },
              { rel: 'buddy', delta: 8, memory: 'the packing peanut avalanche' },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'You are caught with a bag in each hand. Both of you spend a week on latrine duty, which is a different sort of avalanche.',
            effects: [
              { conduct: -7 },
              { rel: 'buddy', delta: 4, memory: 'the latrine week you shared' },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'lookout',
        label: 'Stand lookout, touch nothing',
        outcomes: [
          {
            chance: 1,
            text: 'You whistle a warning a beat too late. {buddy.first} escapes through the window and says you were magnificent.',
            effects: [
              { rel: 'buddy', delta: 5, memory: 'your terrible lookout whistle' },
              { conduct: -2 },
            ],
          },
        ],
      },
      {
        id: 'refuse',
        label: 'Talk them out of it',
        outcomes: [
          {
            chance: 1,
            text: '{buddy.first} sighs and donates the peanuts to the post office. You both sleep soundly, and slightly bored.',
            effects: [{ rel: 'buddy', delta: -3, memory: 'the prank you vetoed' }, { conduct: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'svc_ya_sneak_off_base',
    kind: 'choice',
    category: 'military',
    ages: [18, 28],
    weight: 6,
    cooldownYears: 6,
    when: serving,
    text: 'There is a gap in the fence behind the motor pool, and everyone knows about it. Tonight there is a concert in town you would give a lot to see.',
    choices: [
      {
        id: 'go',
        label: 'Slip through the fence',
        outcomes: [
          {
            chance: 0.45,
            text: 'You get back before roll call with ringing ears and a story you can never tell anyone. Nobody notices.',
            effects: [
              { stat: 'happiness', delta: 8 },
              { stat: 'karma', delta: -3 },
              { stat: 'stress', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Military police are waiting at the gap on your way back. The charge sheet is short and very serious.',
            effects: [
              { conduct: -20 },
              { stat: 'stress', delta: 8 },
              { stat: 'happiness', delta: -6 },
            ],
          },
          {
            chance: 0.15,
            text: 'One night becomes three days before you turn yourself in. The hearing is brief, and your service ends with a discharge you will carry for life.',
            effects: [
              { conduct: -25 },
              { system: 'dishonorable' },
              { stat: 'happiness', delta: -10 },
            ],
          },
        ],
      },
      {
        id: 'request',
        label: 'Request a pass instead',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.5),
            text: 'Your record is clean enough that the pass is approved. You walk out of the front gate like a citizen.',
            effects: [{ stat: 'happiness', delta: 6 }, { conduct: 2 }],
          },
          {
            chance: 0.5,
            text: 'Denied. You listen to the concert through a friend on the phone, which is mostly crowd noise.',
            effects: [{ stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'stay',
        label: 'Stay in and forget about it',
        outcomes: [
          {
            chance: 1,
            text: 'You spend the evening ironing a shirt and pretending this is what you wanted. It nearly works.',
            effects: [
              { stat: 'discipline', delta: 3 },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'svc_ya_fight_soldier',
    kind: 'choice',
    category: 'military',
    ages: [18, 28],
    weight: 7,
    cooldownYears: 5,
    when: serving,
    text: 'A soldier from another platoon has been needling you for weeks. In the chow line he shoves your tray into your chest, and the hall goes quiet.',
    choices: [
      {
        id: 'swing',
        label: 'Hit him',
        outcomes: [
          {
            chance: 0.55,
            text: 'It is over in seconds and nobody wins. You both lose rank privileges and you gain a permanent rival.',
            effects: [
              { conduct: -15 },
              { injury: 5 },
              { status: 'enemy' },
              { stat: 'stress', delta: 5 },
            ],
          },
          {
            chance: 0.45,
            text: 'Two sergeants pull you apart before it starts. The paperwork is lighter than it could have been, but it still has your name on it.',
            effects: [{ conduct: -10 }, { stat: 'stress', delta: 4 }],
          },
        ],
      },
      {
        id: 'walk',
        label: 'Walk away and report it',
        outcomes: [
          {
            chance: 1,
            text: 'You scrape the gravy off your shirt and go to your sergeant. The needling stops, though the glaring does not.',
            effects: [
              { conduct: 8 },
              { stat: 'discipline', delta: 4 },
              { stat: 'karma', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'counsel',
        label: 'Accept the offer of anger counselling',
        outcomes: [
          {
            chance: 1,
            text: 'The counsellor helps you see what has been building up since you enlisted. The tray incident becomes, eventually, a funny story.',
            effects: [{ system: 'therapy' }, { conduct: 4 }, { stat: 'stress', delta: -6 }],
          },
        ],
      },
    ],
  },
  {
    id: 'svc_ya_homesick_letters',
    kind: 'choice',
    category: 'military',
    ages: [18, 26],
    weight: 8,
    cooldownYears: 5,
    when: serving,
    bind: { mother: { role: 'mother', hasMemory: true } },
    text: 'A letter from {mother.first} arrives, smelling faintly of home. She mentions {mother.memory} and the dog sleeping by your door. The barracks feels very far from anywhere.',
    choices: [
      {
        id: 'write',
        label: 'Write back, honestly',
        outcomes: [
          {
            chance: 1,
            text: 'You fill four pages, then a fifth. Her reply comes faster than the post should allow.',
            effects: [
              { rel: 'mother', delta: 10, memory: 'the long letters you sent from base' },
              { stat: 'stress', delta: -4 },
              { stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'brave',
        label: 'Send a short, cheerful note',
        outcomes: [
          {
            chance: 1,
            text: 'Everything is great, you write, which is not true. She keeps it on the fridge anyway.',
            effects: [
              { rel: 'mother', delta: 3, memory: 'your suspiciously cheerful note' },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'chaplain',
        label: 'Talk to the unit counsellor',
        outcomes: [
          {
            chance: 1,
            text: 'You expected to feel silly. Instead you leave lighter, with a phone card and a plan for the hard evenings.',
            effects: [{ system: 'therapy' }, { stat: 'happiness', delta: 3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'svc_ya_training_accident',
    kind: 'notice',
    category: 'military',
    ages: [18, 29],
    weight: 5,
    cooldownYears: 8,
    when: serving,
    text: 'During a live training exercise, a vehicle loses traction on a muddy slope and rolls toward your section.',
    outcomes: [
      {
        chance: 0.5,
        text: 'You dive clear and land badly. A sprained shoulder and a reminder that training is not pretend.',
        effects: [{ injury: 6 }, { stat: 'stress', delta: 6 }],
      },
      {
        chance: 0.35,
        text: 'You haul a stunned recruit out of its path. The bruises fade; the thanks from the recruit, and the brass, do not.',
        effects: [{ injury: 4 }, { conduct: 12 }, { stat: 'karma', delta: 5 }],
      },
      {
        chance: 0.15,
        text: 'It catches your leg. After months of surgery and rehab, a medical board rules you unfit to serve and discharges you with honour.',
        effects: [
          { injury: 30 },
          { system: 'injury_discharge' },
          { stat: 'happiness', delta: -10 },
        ],
      },
    ],
  },

  // ---- Adult (30–45) ----
  {
    id: 'svc_ad_promotion_board',
    kind: 'choice',
    category: 'military',
    ages: [30, 41],
    weight: 8,
    cooldownYears: 5,
    when: serving,
    text: 'You are called before a promotion board: three senior officers, a long table, and a glass of water nobody expects you to drink.',
    choices: [
      {
        id: 'prepare',
        label: 'Spend weeks preparing',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.6),
            text: 'You answer every question cleanly, including the trick one about regulations nobody has read since they were written.',
            effects: [
              { conduct: 15 },
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.35,
            text: 'You know the material cold and freeze on the first question anyway. They are polite. That is worse.',
            effects: [
              { conduct: 3 },
              { stat: 'stress', delta: 8 },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'record',
        label: 'Let your record speak',
        outcomes: [
          {
            chance: 0.5,
            text: 'The board flips through your file and nods. Your years of showing up on time finally pay a dividend.',
            effects: [{ conduct: 10 }, { stat: 'happiness', delta: 4 }],
          },
          {
            chance: 0.5,
            text: 'One officer asks something you cannot answer, and your record goes quiet. Better luck next cycle.',
            effects: [{ conduct: -3 }, { stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'withdraw',
        label: 'Withdraw your name',
        outcomes: [
          {
            chance: 1,
            text: 'You decide you like your job exactly the size it is. Your commander is puzzled but signs the form.',
            effects: [{ stat: 'stress', delta: -5 }, { conduct: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'svc_ad_specialist_course',
    kind: 'choice',
    category: 'military',
    ages: [30, 40],
    weight: 7,
    once: true,
    when: serving,
    text: 'A slot opens on a demanding specialist course in field logistics and communications. Six months, a hard final exam, and a long waiting list behind you.',
    choices: [
      {
        id: 'take',
        label: 'Take the slot',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.65),
            text: 'You finish near the top of the course and come back with a new badge and a head full of acronyms.',
            effects: [{ conduct: 10 }, { stat: 'smarts', delta: 5 }, { stat: 'stress', delta: 4 }],
            next: { eventId: 'svc_ad_specialist_payoff', inYears: [1, 3] },
            success: true,
          },
          {
            chance: 0.3,
            text: 'You fail the final exam by two points. The instructor says to try again next year, and seems to mean it.',
            effects: [
              { stat: 'happiness', delta: -5 },
              { stat: 'smarts', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'pass',
        label: 'Give it to someone younger',
        outcomes: [
          {
            chance: 1,
            text: 'A young corporal gets the slot and thanks you with startling sincerity. You feel old and quite good about it.',
            effects: [
              { stat: 'karma', delta: 5 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'svc_ad_specialist_payoff',
    kind: 'notice',
    category: 'military',
    ages: [31, 43],
    weight: 10,
    chainOnly: true,
    when: serving,
    text: 'During a major exercise the communications network collapses, and everyone turns to the person who did the specialist course.',
    outcomes: [
      {
        chance: 0.75,
        text: 'You have the network back up in an hour with a spare radio and nerve. A formal commendation lands on your file a month later.',
        effects: [{ conduct: 15 }, { stat: 'happiness', delta: 6 }, { stat: 'fame', delta: 1 }],
        success: true,
      },
      {
        chance: 0.25,
        text: 'You fix it, but slowly, and a colonel watches the whole time. You get a nod, which is a commendation in installments.',
        effects: [{ conduct: 6 }, { stat: 'stress', delta: 5 }],
      },
    ],
  },
  {
    id: 'svc_ad_cover_friend',
    kind: 'choice',
    category: 'military',
    ages: [30, 42],
    weight: 7,
    cooldownYears: 6,
    when: serving,
    bind: { buddy: { role: 'friend', minRelationship: 40 } },
    text: '{buddy.first} signed off an equipment check {buddy.they} never did, and now a radio is missing. The investigator asks whether you saw {buddy.them} do the check.',
    choices: [
      {
        id: 'cover',
        label: 'Say you saw it done',
        outcomes: [
          {
            chance: 0.6,
            text: 'The inquiry closes. {buddy.first} buys you dinner and will not quite meet your eyes.',
            effects: [
              { rel: 'buddy', delta: 10, memory: 'the time you covered for them' },
              { stat: 'karma', delta: -5 },
              { stat: 'stress', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The radio turns up with a timestamp that contradicts you. Now there are two names on the report.',
            effects: [
              { conduct: -15 },
              { rel: 'buddy', delta: 5, memory: 'the inquiry you went down for together' },
              { stat: 'stress', delta: 7 },
            ],
          },
        ],
      },
      {
        id: 'truth',
        label: 'Tell the truth',
        outcomes: [
          {
            chance: 1,
            text: '{buddy.first} gets a formal warning, and the barracks gets colder around you. Your file gets a line about integrity.',
            effects: [
              { conduct: 8 },
              { stat: 'karma', delta: 4 },
              { rel: 'buddy', delta: -15, memory: 'what you told the investigator' },
            ],
          },
        ],
      },
      {
        id: 'urge',
        label: 'Urge them to come clean first',
        outcomes: [
          {
            chance: oddsBy('karma', 0.5),
            text: '{buddy.first} owns up before you have to say a word. The punishment is mild, and the friendship survives with a dent.',
            effects: [
              { rel: 'buddy', delta: 3, memory: 'the night you talked them into confessing' },
              { conduct: 4 },
              { stat: 'karma', delta: 3 },
            ],
          },
          {
            chance: 0.5,
            text: '{buddy.first} refuses, so you answer the investigator honestly anyway. It costs you both something.',
            effects: [
              { rel: 'buddy', delta: -10, memory: 'the ultimatum you gave them' },
              { conduct: 5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'svc_ad_selling_kit',
    kind: 'choice',
    category: 'military',
    ages: [30, 42],
    weight: 5,
    cooldownYears: 8,
    when: serving,
    text: 'As stores sergeant you sign for crates nobody counts twice. A man in a car park offers good money for a few boxes of night-vision gear that would never be missed.',
    choices: [
      {
        id: 'sell',
        label: 'Sell a few boxes',
        outcomes: [
          {
            chance: 0.4,
            text: 'The cash is in your hand and the crates are short. You start checking your mirrors every time you drive.',
            effects: [
              { money: 6000 },
              { conduct: -10 },
              { stat: 'karma', delta: -10 },
              { stat: 'stress', delta: 10 },
            ],
            success: true,
          },
          {
            chance: 0.35,
            text: 'A routine audit finds the gap within weeks. You are stripped of your post and your record now has a dark mark on it.',
            effects: [
              { conduct: -25 },
              { stat: 'karma', delta: -8 },
              { stat: 'stress', delta: 12 },
            ],
          },
          {
            chance: 0.25,
            text: 'The buyer was working with investigators. The court martial is swift, and you leave the service in disgrace.',
            effects: [
              { conduct: -25 },
              { system: 'dishonorable' },
              { stat: 'happiness', delta: -12 },
            ],
          },
        ],
      },
      {
        id: 'report',
        label: 'Report the approach',
        outcomes: [
          {
            chance: 1,
            text: 'Investigators thank you and quietly reorganise the whole stores system. You get fewer smiles from the people who used the gaps.',
            effects: [{ conduct: 12 }, { stat: 'karma', delta: 6 }],
          },
        ],
      },
      {
        id: 'ignore',
        label: 'Walk away and say nothing',
        outcomes: [
          {
            chance: 1,
            text: 'You drive off without a word. Nothing happens, apart from you recounting the crates twice a week.',
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
    id: 'svc_ad_leave_weekend',
    kind: 'choice',
    category: 'military',
    ages: [32, 44],
    weight: 8,
    cooldownYears: 3,
    when: serving,
    text: 'You finally get a long weekend of leave. The base empties out like a school at the end of term, and you have exactly seventy-two hours.',
    choices: [
      {
        id: 'home',
        label: 'Go home and do nothing',
        outcomes: [
          {
            chance: 1,
            text: 'You sleep eleven hours, eat breakfast at noon, and nobody shouts your surname once. Bliss.',
            effects: [
              { stat: 'stress', delta: -8 },
              { stat: 'happiness', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'party',
        label: 'Hit the town with your unit',
        outcomes: [
          {
            chance: 0.65,
            text: 'Dancing, terrible karaoke, a kebab at 3 a.m. You return to base exhausted and oddly fond of everyone.',
            effects: [
              { stat: 'happiness', delta: 8 },
              { stat: 'health', delta: -2 },
            ],
            success: true,
          },
          {
            chance: 0.35,
            text: 'Someone starts a scuffle with the locals and you are all marched back early. Your commander is unamused.',
            effects: [{ conduct: -8 }, { stat: 'happiness', delta: -2 }],
          },
        ],
      },
      {
        id: 'volunteer',
        label: 'Volunteer for duty and bank the leave',
        outcomes: [
          {
            chance: 1,
            text: 'The quiet base is almost peaceful. Your commander notices who stayed, and so does your exhaustion.',
            effects: [{ conduct: 6 }, { stat: 'stress', delta: 4 }, { money: 300 }],
          },
        ],
      },
    ],
  },
];
