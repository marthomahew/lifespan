import type { EventDef } from '../../engine/events/types';
import { all, canAfford, hasBackground, hasChildren, notInPrison } from './conditions';

const mover = hasBackground('moving_family');
const immigrant = hasBackground('immigrant_family');
const twin = hasBackground('twin');
const adopted = hasBackground('adopted');

/** Background events: the family that moves, the family from elsewhere, the twin, the adopted child. */
export const BG_ROOTS_EVENTS: EventDef[] = [
  // ── Always moving ────────────────────────────────────────────────────────
  {
    id: 'bgr_new_school_again',
    kind: 'choice',
    category: 'school',
    ages: [6, 11],
    weight: 60,
    once: true,
    when: mover,
    bind: { par: { role: 'acquaintance', anyRole: true, flag: 'mover_parent' } },
    text: '{par.Rel} comes home with a new posting and a roll of parcel tape. By the end of the month you are standing at the front of another classroom while a teacher mispronounces your name.',
    choices: [
      {
        id: 'loud',
        label: 'Be the funny new kid',
        outcomes: [
          {
            chance: 0.65,
            text: 'You do an impression of the head teacher by lunchtime. By Friday you have a gang, a nickname and a seat at the good table.',
            effects: [
              { system: 'move_city' },
              { stat: 'happiness', delta: 4 },
              { stat: 'looks', delta: 1 },
              { flag: 'new_kid_charm' },
            ],
            success: true,
          },
          {
            chance: 0.35,
            text: 'The impression lands badly; the head teacher is standing behind you. You spend your first week as the kid who got a detention on day one.',
            effects: [
              { system: 'move_city' },
              { stat: 'happiness', delta: -3 },
              { stat: 'discipline', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'quiet',
        label: 'Keep your head down and watch',
        outcomes: [
          {
            chance: 1,
            text: 'You sit at the back and learn the place like a map: who rules the climbing frame, which dinner lady gives seconds. You make one friend, a careful one.',
            effects: [
              { system: 'move_city' },
              { stat: 'smarts', delta: 3 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'sulk',
        label: 'Refuse to unpack',
        outcomes: [
          {
            chance: 1,
            text: 'Your boxes stay taped in protest for six weeks. {par.Rel} unpacks them one night while you sleep and says nothing about it, ever.',
            effects: [
              { system: 'move_city' },
              { stat: 'happiness', delta: -4 },
              { rel: 'par', delta: -4, memory: 'the boxes you would not unpack' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bgr_leaving_best_friend',
    kind: 'choice',
    category: 'social',
    ages: [10, 14],
    weight: 60,
    once: true,
    when: mover,
    bind: { par: { role: 'acquaintance', anyRole: true, flag: 'mover_parent' } },
    text: 'Another move, and this time it hurts: you finally have a best friend, the kind who knows your locker code and your worst joke. The van comes on Saturday.',
    choices: [
      {
        id: 'write',
        label: 'Promise to write every week',
        outcomes: [
          {
            chance: 1,
            text: 'You keep the promise far longer than anyone expects. Your letters get longer, funnier and better spelt, and your friend keeps every one in a shoebox.',
            effects: [
              { system: 'move_city' },
              { skill: 'writing', delta: 4 },
              { stat: 'happiness', delta: 2 },
              { flag: 'pen_friend' },
            ],
            next: { eventId: 'bgr_pen_friend_reunion', inYears: [8, 14] },
          },
        ],
      },
      {
        id: 'let_go',
        label: 'Let it go cleanly',
        outcomes: [
          {
            chance: 1,
            text: 'You hug once at the gate and do not look back. It works, more or less. You learn to travel light, and something in you gets a little harder.',
            effects: [
              { system: 'move_city' },
              { stat: 'stress', delta: -2 },
              { stat: 'happiness', delta: -3 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'blame',
        label: 'Tell {par.rel} it’s not fair',
        outcomes: [
          {
            chance: 1,
            text: 'You say it at dinner, loudly. {par.Rel} agrees that it isn’t, and apologises, which is somehow worse. You still move, but you both remember the talk.',
            effects: [
              { system: 'move_city' },
              { rel: 'par', delta: 4, memory: 'admitting the moves weren’t fair on you' },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bgr_pen_friend_reunion',
    kind: 'notice',
    category: 'social',
    ages: [18, 40],
    weight: 60,
    chainOnly: true,
    text: 'A letter in familiar handwriting, years after the last one: your old best friend is passing through and wants to buy you a drink.',
    outcomes: [
      {
        chance: 1,
        text: 'You talk until the bar staff stack the chairs around you. The shoebox of letters still exists. You leave with an old friend who somehow is not old at all.',
        effects: [{ stat: 'happiness', delta: 8 }, { status: 'friend' }],
      },
    ],
  },
  {
    id: 'bgr_refuse_the_move',
    kind: 'choice',
    category: 'family',
    ages: [15, 16],
    weight: 60,
    once: true,
    when: all(mover, notInPrison),
    bind: { par: { role: 'acquaintance', anyRole: true, flag: 'mover_parent' } },
    text: 'One more posting, two years before your final exams. Your friend’s family has a spare room and has said, quite seriously, that you could stay with them and finish school here.',
    choices: [
      {
        id: 'stay',
        label: 'Stay, and finish school here',
        outcomes: [
          {
            chance: 1,
            text: '{par.Rel} cries in the car park and then helps carry your bags upstairs. For the first time you get to stay somewhere long enough to be bored of it, which is wonderful.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'smarts', delta: 3 },
              { rel: 'par', delta: -6, memory: 'staying behind when the family moved' },
              { flag: 'stayed_behind' },
            ],
          },
        ],
      },
      {
        id: 'go',
        label: 'Go with the family',
        outcomes: [
          {
            chance: 1,
            text: 'You pack in an afternoon; you are very good at it by now. The new school is fine. {par.Rel} notices what you gave up and never quite stops thanking you.',
            effects: [
              { system: 'move_city' },
              { stat: 'stress', delta: 5 },
              { rel: 'par', delta: 8, memory: 'coming with the family one last time' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bgr_rootless_adult',
    kind: 'choice',
    category: 'social',
    ages: [20, 40],
    weight: 60,
    once: true,
    when: all(mover, notInPrison),
    text: 'Three years in one place and the itch arrives on schedule. You can make a friend in a day; you have never once kept one for ten years.',
    choices: [
      {
        id: 'stay_put',
        label: 'Stay, and learn to keep people',
        outcomes: [
          {
            chance: 1,
            text: 'You join a choir that meets every Thursday and go every Thursday, even the dull ones. It is harder than any move. Slowly, a few people start to count on you.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'discipline', delta: 3 },
              { skill: 'voice', delta: 3 },
              { flag: 'put_down_roots' },
            ],
          },
        ],
      },
      {
        id: 'move_on',
        label: 'Scratch the itch: move again',
        outcomes: [
          {
            chance: 1,
            text: 'You hand in your notice and your keys in the same week. The new city smells of possibility and somebody else’s paint. You are happy, mostly, in the way you know how.',
            effects: [
              { system: 'move_city' },
              { stat: 'happiness', delta: 4 },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
    ],
  },

  // ── An immigrant family ──────────────────────────────────────────────────
  {
    id: 'bgr_little_translator',
    kind: 'choice',
    category: 'family',
    ages: [8, 13],
    weight: 60,
    once: true,
    when: immigrant,
    bind: { par: { role: 'acquaintance', anyRole: true, flag: 'heritage_parent' } },
    text: 'At the bank, the man behind the glass talks slowly and loudly at {par.rel}, as if that helps. {par.Rel} looks down at you: you are the one who speaks both.',
    choices: [
      {
        id: 'translate',
        label: 'Translate every word, properly',
        outcomes: [
          {
            chance: 1,
            text: 'You learn the words “overdraft” and “standing order” at nine years old. The man starts speaking to you directly. {par.Rel} holds your hand on the way out, hard.',
            effects: [
              { stat: 'smarts', delta: 4 },
              { stat: 'stress', delta: 3 },
              { rel: 'par', delta: 8, memory: 'translating for them at the bank' },
              { flag: 'family_translator' },
            ],
          },
        ],
      },
      {
        id: 'soften',
        label: 'Translate, but leave out the rude bits',
        outcomes: [
          {
            chance: 1,
            text: 'The man is curt; in your version he is charming. {par.Rel} leaves thinking the bank is a lovely place, and you leave knowing exactly what diplomacy costs.',
            effects: [
              { stat: 'karma', delta: 2 },
              { stat: 'smarts', delta: 2 },
              { rel: 'par', delta: 4, memory: 'the kind version of the bank meeting' },
            ],
          },
        ],
      },
      {
        id: 'refuse',
        label: 'Say you don’t know the words',
        outcomes: [
          {
            chance: 1,
            text: 'You stare at your shoes. {par.Rel} struggles through alone, with a lot of pointing, and never asks you again. You are not sure whether that is a relief.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { rel: 'par', delta: -5, memory: 'leaving them to manage at the bank' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bgr_two_kitchens',
    kind: 'choice',
    category: 'school',
    ages: [11, 15],
    weight: 60,
    once: true,
    when: immigrant,
    bind: { par: { role: 'acquaintance', anyRole: true, flag: 'heritage_parent' } },
    text: 'At home, dinner is from {heritage} and so are the arguments. At school, someone sniffs your lunchbox and makes a face. Tomorrow you have to bring something in for food day.',
    choices: [
      {
        id: 'proud',
        label: 'Bring {par.rel}’s cooking',
        outcomes: [
          {
            chance: 0.7,
            text: 'The tray is empty in four minutes. The kid who made the face comes back for thirds and asks, very quietly, for the recipe.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { skill: 'cooking', delta: 3 },
              { rel: 'par', delta: 5, memory: 'taking their cooking to school, proudly' },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'Half the class tries it and half refuses on principle. You eat the leftovers on the bus home and decide, firmly, that the refusers are the ones missing out.',
            effects: [
              { stat: 'happiness', delta: 1 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'blend',
        label: 'Bring sandwiches like everyone else',
        outcomes: [
          {
            chance: 1,
            text: 'Nobody notices your sandwiches, which was the point. At home {par.rel} sees the empty bread bag and says nothing, which you hear anyway.',
            effects: [
              { stat: 'stress', delta: -2 },
              { stat: 'happiness', delta: -2 },
              { rel: 'par', delta: -3, memory: 'the sandwiches you took instead of their food' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bgr_first_trip_heritage',
    kind: 'choice',
    category: 'travel',
    ages: [16, 25],
    weight: 60,
    once: true,
    when: all(immigrant, notInPrison),
    text: 'You have a whole country of cousins you have only met in photographs. A great-aunt in {heritage} writes, in careful capitals, that there is a bed for you whenever you come.',
    choices: [
      {
        id: 'go',
        label: 'Go to {heritage}',
        requires: canAfford(1500),
        outcomes: [
          {
            chance: 1,
            text: 'At the airport a crowd of strangers with your nose holds up a sign with your name spelt three ways. You are fed until you cannot move, and you understand your parents a little better.',
            effects: [
              { money: -1500, kind: 'wage' },
              { stat: 'happiness', delta: 10 },
              { skill: 'cooking', delta: 2 },
              { flag: 'visited_heritage' },
            ],
          },
        ],
      },
      {
        id: 'not_yet',
        label: 'Not yet',
        outcomes: [
          {
            chance: 1,
            text: 'You write back, promising next year. The great-aunt sends a jar of something pickled with a note: “Not yet is not never.” You keep the jar long after it is empty.',
            effects: [{ stat: 'happiness', delta: -1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'bgr_what_you_keep',
    kind: 'choice',
    category: 'family',
    ages: [28, 55],
    weight: 60,
    once: true,
    when: all(immigrant, hasChildren),
    text: 'Your child asks why you hum that song in a language nobody else at school speaks. You realise the things you got from {heritage} stop with you unless you hand them on.',
    choices: [
      {
        id: 'teach',
        label: 'Teach them the language, the songs, the dishes',
        outcomes: [
          {
            chance: 1,
            text: 'Sunday mornings become lessons: verbs, then dumplings, then the song. Your child rolls their eyes for a year and then corrects your grammar, which is the whole reward.',
            effects: [
              { stat: 'happiness', delta: 7 },
              { skill: 'cooking', delta: 3 },
              { stat: 'stress', delta: 2 },
              { flag: 'passed_on_heritage' },
            ],
          },
        ],
      },
      {
        id: 'some',
        label: 'Keep a few things: the food, the holidays',
        outcomes: [
          {
            chance: 1,
            text: 'The language slips, but the holiday table stays loud and the one dish stays exactly right. It is not everything. It is something you can carry.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { skill: 'cooking', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'let_be',
        label: 'Let them be from here',
        outcomes: [
          {
            chance: 1,
            text: 'You tell them it is just an old song. Years later you catch them humming it anyway, slightly wrong, and you do not correct them.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { stat: 'stress', delta: -1 },
            ],
          },
        ],
      },
    ],
  },

  // ── A twin ───────────────────────────────────────────────────────────────
  {
    id: 'bgr_twin_swap',
    kind: 'choice',
    category: 'school',
    ages: [8, 12],
    weight: 60,
    once: true,
    when: twin,
    bind: { twin: { role: 'sibling', flag: 'twin' } },
    text: '{twin.first} has a spelling test {twin.they} {twin.is} doomed to fail; you have a PE lesson you would rather die than do. {twin.They} suggest{twin.s} a swap.',
    choices: [
      {
        id: 'swap',
        label: 'Swap places for the day',
        outcomes: [
          {
            chance: 0.55,
            text: 'Nobody notices. You get every word right in {twin.first}’s handwriting, and {twin.they} score{twin.s} a goal in yours. You both keep the secret until your thirties.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'karma', delta: -1 },
              { rel: 'twin', delta: 8, memory: 'the day you swapped places' },
              { flag: 'twin_swap' },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'The dinner lady spots it in a second: you hold your fork differently. Two detentions, one letter home, and a long talk at the kitchen table that neither of you regrets.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { stat: 'discipline', delta: -2 },
              { rel: 'twin', delta: 5, memory: 'getting caught swapping places together' },
            ],
          },
        ],
      },
      {
        id: 'refuse',
        label: 'Refuse: do your own test',
        outcomes: [
          {
            chance: 1,
            text: '{twin.first} fails the spelling test and sulks for an evening. You run your laps alone, slowly, and feel noble, then a bit lonely.',
            effects: [
              { stat: 'karma', delta: 2 },
              { rel: 'twin', delta: -3, memory: 'refusing the swap' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bgr_twin_rivalry',
    kind: 'choice',
    category: 'school',
    ages: [14, 18],
    weight: 60,
    once: true,
    when: twin,
    bind: { twin: { role: 'sibling', flag: 'twin' } },
    text: 'The school play has one lead role, and you and {twin.first} have both put your names down. Everyone at school has already picked a side.',
    choices: [
      {
        id: 'compete',
        label: 'Go for it, properly',
        outcomes: [
          {
            chance: 0.5,
            text: 'You get the part. {twin.first} shakes your hand like a stranger and then turns up to every rehearsal to run lines with you, which is the most annoying and loving thing {twin.they} could do.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { skill: 'voice', delta: 3 },
              { rel: 'twin', delta: -2, memory: 'beating them to the lead role' },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: '{twin.first} gets the part. You get “Second Guard”. You deliver your one line with such force that the audience applauds it, which helps, a little.',
            effects: [
              { stat: 'happiness', delta: -3 },
              { skill: 'voice', delta: 2 },
              { npcStat: 'twin', stat: 'happiness', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'withdraw',
        label: 'Withdraw and let {twin.them} have it',
        outcomes: [
          {
            chance: 1,
            text: 'You cross your name off. {twin.first} is brilliant in the role and finds out what you did on opening night. {twin.They} buy{twin.s} you flowers, which is ridiculous, and you keep them.',
            effects: [
              { stat: 'karma', delta: 3 },
              { stat: 'happiness', delta: -1 },
              { rel: 'twin', delta: 10, memory: 'stepping aside for them at the audition' },
            ],
          },
        ],
      },
      {
        id: 'different',
        label: 'Audition for the stage crew instead',
        outcomes: [
          {
            chance: 1,
            text: 'You build a balcony that only wobbles on Thursdays. For the first time, people know which twin is which: the one on stage and the one with the drill.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'discipline', delta: 3 },
              { flag: 'own_lane' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bgr_twin_feeling',
    kind: 'notice',
    category: 'family',
    ages: [20, 60],
    weight: 60,
    once: true,
    when: twin,
    bind: { twin: { role: 'sibling', flag: 'twin' } },
    text: 'For no reason at all, halfway through a quiet evening, you pick up the phone and call {twin.first}.',
    outcomes: [
      {
        chance: 1,
        text: '{twin.They} answer{twin.s} on the first ring, mid-sob: a terrible day, and you were the only person {twin.they} wanted. Neither of you can explain it. Neither of you tries.',
        effects: [
          { stat: 'happiness', delta: 4 },
          { rel: 'twin', delta: 8, memory: 'the call that came exactly when they needed it' },
          { npcStat: 'twin', stat: 'happiness', delta: 8 },
        ],
      },
    ],
  },
  {
    id: 'bgr_twin_in_need',
    kind: 'choice',
    category: 'family',
    ages: [30, 70],
    weight: 60,
    once: true,
    when: all(twin, notInPrison),
    bind: { twin: { role: 'sibling', flag: 'twin' } },
    text: '{twin.first} turns up on your doorstep with two suitcases and a face you know better than your own. Things have fallen apart, and {twin.they} need{twin.s} somewhere to land.',
    choices: [
      {
        id: 'room',
        label: 'Make up the spare bed, for as long as it takes',
        outcomes: [
          {
            chance: 1,
            text: 'It takes eight months. You fight over the thermostat like you are nine again, and on the day {twin.first} moves out you both pretend not to be upset.',
            effects: [
              { stat: 'stress', delta: 6 },
              { stat: 'karma', delta: 4 },
              { rel: 'twin', delta: 12, memory: 'taking them in when everything fell apart' },
              { npcStat: 'twin', stat: 'happiness', delta: 10 },
            ],
          },
        ],
      },
      {
        id: 'money',
        label: 'Pay for a flat instead',
        requires: canAfford(8000),
        outcomes: [
          {
            chance: 1,
            text: 'You hand over a deposit and six months’ rent. {twin.first} is grateful and a little stung that it wasn’t your spare room. Both feelings are fair.',
            effects: [
              { money: -8000, kind: 'wage' },
              { stat: 'karma', delta: 2 },
              { rel: 'twin', delta: 5, memory: 'paying for a flat when they had nowhere to go' },
            ],
          },
        ],
      },
      {
        id: 'no',
        label: 'Say no: you can’t carry this',
        outcomes: [
          {
            chance: 1,
            text: '{twin.first} nods, picks up the suitcases and goes to a friend’s. You do not speak for a year, and you feel it every single day, like a missing tooth.',
            effects: [
              { stat: 'happiness', delta: -6 },
              { stat: 'karma', delta: -3 },
              { rel: 'twin', delta: -18, memory: 'turning them away from your door' },
            ],
          },
        ],
      },
    ],
  },

  // ── Adopted ──────────────────────────────────────────────────────────────
  {
    id: 'bgr_coming_home_story',
    kind: 'notice',
    category: 'family',
    ages: [5, 9],
    weight: 60,
    once: true,
    when: adopted,
    text: 'At bedtime you ask, again, for the story of the day you came home.',
    outcomes: [
      {
        chance: 1,
        text: 'The waiting list, the phone call, the drive with an empty baby seat and a new teddy that was far too big. “We chose you,” they say, “and then you chose us right back.” You sleep very well.',
        effects: [
          { stat: 'happiness', delta: 6 },
          { stat: 'stress', delta: -2 },
        ],
      },
    ],
  },
  {
    id: 'bgr_adopted_questions',
    kind: 'choice',
    category: 'family',
    ages: [13, 17],
    weight: 60,
    once: true,
    when: adopted,
    text: 'In biology you draw a family tree with eye colours, and yours does not work. The question you have been carrying around gets heavier: who did you come from?',
    choices: [
      {
        id: 'ask',
        label: 'Ask your parents',
        outcomes: [
          {
            chance: 1,
            text: 'They go quiet, then fetch a folder from the top of the wardrobe: a name, a city, a single letter. They had been waiting for you to ask. Nobody cries as much as expected, or less.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'stress', delta: -3 },
              { flag: 'knows_birth_name' },
            ],
          },
        ],
      },
      {
        id: 'keep',
        label: 'Keep it to yourself',
        outcomes: [
          {
            chance: 1,
            text: 'You make up eye colours for the tree and get full marks. The question goes back in its box, where it rattles now and then, mostly at night.',
            effects: [
              { stat: 'stress', delta: 4 },
              { stat: 'discipline', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bgr_birth_mother_search',
    kind: 'choice',
    category: 'family',
    ages: [18, 40],
    weight: 60,
    once: true,
    when: all(adopted, notInPrison),
    text: 'The adoption agency has a form for this. It is two pages long and asks one question that matters: do you want to find your birth mother?',
    choices: [
      {
        id: 'search',
        label: 'Fill it in, and search',
        outcomes: [
          {
            chance: 1,
            text: 'Months of letters and dead ends, then a reply in a hand that looks oddly like yours. She has thought about you every birthday. She would like to meet, if you would.',
            effects: [
              { system: 'birth_parent' },
              { stat: 'stress', delta: 6 },
              { stat: 'happiness', delta: 4 },
              { flag: 'searched_birth_mother' },
            ],
            next: { eventId: 'bgr_birth_mother_meet', inYears: 1 },
          },
        ],
      },
      {
        id: 'leave',
        label: 'Put the form in a drawer',
        outcomes: [
          {
            chance: 1,
            text: 'You decide the family you have is the family you need. The form stays in the drawer, unfilled, and you find you can live with that.',
            effects: [
              { stat: 'stress', delta: -2 },
              { stat: 'happiness', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bgr_birth_mother_meet',
    kind: 'choice',
    category: 'family',
    ages: [19, 41],
    weight: 60,
    chainOnly: true,
    bind: { bm: { role: 'acquaintance', anyRole: true, flag: 'birth_parent' } },
    text: 'You meet {bm.first} in a café halfway between your cities. She has your laugh, and the same way of folding a napkin into tiny squares. After two hours you have to decide what this is.',
    choices: [
      {
        id: 'stay',
        label: 'Stay in touch',
        outcomes: [
          {
            chance: 1,
            text: 'You agree on letters, then phone calls, then a visit at Christmas that is awkward and lovely in equal parts. She is not your mother. She is somebody, and that is plenty.',
            effects: [
              { stat: 'happiness', delta: 7 },
              { rel: 'bm', delta: 20, memory: 'the café where you finally met' },
              { flag: 'knows_birth_mother' },
            ],
          },
        ],
      },
      {
        id: 'once',
        label: 'Once was enough',
        outcomes: [
          {
            chance: 1,
            text: 'You thank her and mean it. Some questions only needed answering once. On the train home you feel lighter than you have in years.',
            effects: [
              { stat: 'stress', delta: -5 },
              { stat: 'happiness', delta: 3 },
              { rel: 'bm', delta: 2, memory: 'one afternoon in a café, and a kind goodbye' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bgr_which_family',
    kind: 'choice',
    category: 'family',
    ages: [40, 80],
    weight: 60,
    once: true,
    when: adopted,
    text: 'A form at the doctor’s asks for your family medical history, and you sit with the pen for a long time. It occurs to you that “family” has never been one simple box.',
    choices: [
      {
        id: 'raised',
        label: 'Write down the people who raised you',
        outcomes: [
          {
            chance: 1,
            text: 'You fill it in with the people who sat up with your fevers. The doctor says the answer is medically useless and humanly correct. You agree with both halves.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'karma', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'both',
        label: 'Write “it’s complicated” and explain',
        outcomes: [
          {
            chance: 1,
            text: 'You explain it all to the doctor, who listens properly. By the end you have said out loud, for the first time, that you belong to more than one story, and that is fine.',
            effects: [
              { stat: 'stress', delta: -4 },
              { stat: 'smarts', delta: 1 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
];
