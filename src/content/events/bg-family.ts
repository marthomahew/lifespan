import type { EventDef } from '../../engine/events/types';
import type { GameState } from '../../engine/types';
import { all, hasBackground, hasFlag, lacksFlag, notInPrison, oddsBy } from './conditions';

const bizParent = {
  par: { role: 'acquaintance', anyRole: true, flag: 'business_parent' },
} as const;
const pushyParent = { par: { role: 'acquaintance', anyRole: true, flag: 'pushy_parent' } } as const;
const famousParent = {
  par: { role: 'acquaintance', anyRole: true, flag: 'famous_parent' },
} as const;
const raisingGran = { gran: { role: 'grandparent', flag: 'raising_grandparent' } } as const;

/** Holds a medicine or law degree: the plan, delivered. */
const didThePlan = (s: GameState): boolean =>
  s.education.degrees.some((d) => d.level === 'medicine' || d.level === 'law');
/** Doing well by some measure of your own: a degree, a decent job, or a business. */
const doingWell = (s: GameState): boolean =>
  s.education.degrees.some((d) => d.level !== 'high_school') ||
  (s.career.jobId !== null && s.career.level >= 2) ||
  !!s.business;
const proudOdds = (s: GameState): number => {
  let p = 0.2;
  if (didThePlan(s)) p += 0.45;
  if (doingWell(s)) p += 0.2;
  if (s.player.flags.includes('own_degree')) p += 0.05;
  if (s.player.flags.includes('rebelled_lessons')) p -= 0.05;
  return Math.min(0.9, Math.max(0.1, p));
};
const granGone = (s: GameState): boolean => {
  const g = s.npcs.find((n) => n.flags.includes('raising_grandparent'));
  return !!g && !g.alive;
};

/** Background threads for the family you're born into: the shop, the plans, the fame, the grandparent. */
export const BG_FAMILY_EVENTS: EventDef[] = [
  // ── Family business ──────────────────────────────────────────────────────
  {
    id: 'bgf_biz_saturdays',
    kind: 'choice',
    category: 'family',
    ages: [8, 12],
    weight: 60,
    once: true,
    when: hasBackground('family_business'),
    bind: bizParent,
    text: '{par.first} needs an extra pair of hands at {fambiz} on Saturdays. The pay is a paper bag of whatever didn’t sell and the right to wear the apron.',
    choices: [
      {
        id: 'help',
        label: 'Put the apron on',
        outcomes: [
          {
            chance: 1,
            text: 'You learn to count change backwards, remember the regulars’ names and smile at people who don’t deserve it. {par.They} introduce{par.s} you as “management”.',
            effects: [
              { stat: 'discipline', delta: 5 },
              { stat: 'happiness', delta: 2 },
              { rel: 'par', delta: 8, memory: 'the Saturdays you wore the apron' },
              { flag: 'fambiz_saturdays' },
            ],
          },
        ],
      },
      {
        id: 'play',
        label: 'Saturdays are for playing',
        outcomes: [
          {
            chance: 1,
            text: 'You spend Saturdays in the park instead. {par.first} says it’s fine, in the voice that means it is nearly fine.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { rel: 'par', delta: -3, memory: 'the Saturdays you chose the park over the shop' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bgf_biz_summer',
    kind: 'choice',
    category: 'work',
    ages: [14, 17],
    weight: 60,
    once: true,
    when: all(hasBackground('family_business'), notInPrison),
    bind: bizParent,
    text: 'The summer someone quits at {fambiz}, {par.first} hands you the keys and says, “Just till September.” Your friends are going camping.',
    choices: [
      {
        id: 'counter',
        label: 'Run the counter all summer',
        outcomes: [
          {
            chance: 0.75,
            text: 'Twelve weeks of early starts, a till that sticks on Tuesdays and a regular who only pays in coins. You are good at it, which is the worrying part.',
            effects: [
              { money: 2500, kind: 'wage' },
              { stat: 'discipline', delta: 6 },
              { stat: 'stress', delta: 5 },
              { rel: 'par', delta: 10, memory: 'the summer you ran the till' },
              { flag: 'fambiz_summer' },
            ],
            success: true,
          },
          {
            chance: 0.25,
            text: 'In week three you give a whole tray of stock away to a very charming customer who turns out to be no one at all. {par.They} laugh{par.s} about it much, much later.',
            effects: [
              { money: 1500, kind: 'wage' },
              { stat: 'happiness', delta: -3 },
              { rel: 'par', delta: 4, memory: 'the summer you gave the stock away' },
            ],
          },
        ],
      },
      {
        id: 'camping',
        label: 'Go camping with your friends',
        outcomes: [
          {
            chance: 1,
            text: 'It rains for nine days and it is the best fortnight of your life. When you get back, {par.first} looks very tired.',
            effects: [
              { stat: 'happiness', delta: 8 },
              { rel: 'par', delta: -6, memory: 'the summer you went camping and left me short' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bgf_biz_join',
    kind: 'choice',
    category: 'work',
    ages: [18, 23],
    weight: 60,
    once: true,
    when: all(
      hasBackground('family_business'),
      notInPrison,
      (s) => !s.business,
      lacksFlag('declined_fambiz'),
    ),
    bind: bizParent,
    text: '{par.first} takes you out for dinner, which {par.they} never bother{par.s} to do, and slides a set of keys across the table. “{fambiz} could be yours. I’d like it to be.”',
    choices: [
      {
        id: 'join',
        label: 'Take the keys',
        outcomes: [
          {
            chance: 1,
            text: 'You say yes before pudding. {par.first} cries, then gets out a notebook of everything that can go wrong with the boiler.',
            effects: [
              { system: 'take_fambiz' },
              { rel: 'par', delta: 15, memory: 'the night you took the keys' },
              { stat: 'stress', delta: 6 },
              { flag: 'joined_fambiz' },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Say no, kindly',
        outcomes: [
          {
            chance: 1,
            text: 'You tell {par.them} you want a life that isn’t already written. {par.They} nod{par.s}, pay{par.s} the bill and drive{par.s} home in silence.',
            effects: [
              { rel: 'par', delta: -12, memory: 'the night you turned down the business' },
              { stat: 'happiness', delta: 3 },
              { flag: 'declined_fambiz' },
            ],
          },
        ],
      },
      {
        id: 'later',
        label: 'Ask for a few years first',
        outcomes: [
          {
            chance: 1,
            text: '“Go and see the world,” {par.first} says. “The boiler will still be broken when you get back.” You both know this is a no with good manners.',
            effects: [
              { rel: 'par', delta: -4, memory: 'the night you asked for a few years' },
              { flag: 'declined_fambiz' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bgf_biz_handover',
    kind: 'choice',
    category: 'money',
    ages: [35, 60],
    weight: 60,
    once: true,
    when: all(
      hasBackground('family_business'),
      hasFlag('declined_fambiz'),
      notInPrison,
      (s) => !s.business,
    ),
    bind: bizParent,
    text: '{par.first} is retiring. There is a buyer for {fambiz}, a smiling chain-owner in a quilted jacket, unless you want it. It is the last time {par.they} will ask.',
    choices: [
      {
        id: 'take',
        label: 'Take it on at last',
        outcomes: [
          {
            chance: 1,
            text: 'You turn up on Monday at six. The regulars clap, ironically and then not. {par.first} stays on to “help” for exactly one week and then goes fishing.',
            effects: [
              { system: 'take_fambiz' },
              { rel: 'par', delta: 18, memory: 'the Monday you finally came home to the shop' },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'sell',
        label: 'Let it be sold',
        outcomes: [
          {
            chance: 1,
            text: 'The sign comes down on a Thursday. {par.first} gives you your share and the old brass bell from above the door, and does not watch the van leave.',
            effects: [
              { system: 'sell_fambiz' },
              { stat: 'happiness', delta: -3 },
              { rel: 'par', delta: 2, memory: 'the day the sign came down' },
            ],
          },
        ],
      },
    ],
  },

  // ── Parents with plans ───────────────────────────────────────────────────
  {
    id: 'bgf_pushy_lessons',
    kind: 'choice',
    category: 'school',
    ages: [6, 10],
    weight: 60,
    once: true,
    when: hasBackground('pushy_parents'),
    bind: pushyParent,
    text: '{par.first} has drawn up a timetable for your evenings: maths on Monday, violin on Tuesday, Mandarin on Wednesday, and “free time” on Sunday from four till half past.',
    choices: [
      {
        id: 'along',
        label: 'Go along with it',
        outcomes: [
          {
            chance: 1,
            text: 'You do every lesson and every worksheet. You get very good at things and quite tired of them, and you never quite learn what you’d do with a free evening.',
            effects: [
              { stat: 'smarts', delta: 6 },
              { stat: 'discipline', delta: 6 },
              { stat: 'happiness', delta: -6 },
              { skill: 'instrument', delta: 4 },
              { rel: 'par', delta: 5, memory: 'the years you did every lesson' },
            ],
          },
        ],
      },
      {
        id: 'rebel',
        label: 'Hide the violin in the shed',
        outcomes: [
          {
            chance: 0.6,
            text: 'The violin is found in March, slightly damp. There is a family meeting. You win back Thursdays and lose the trust of the shed.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { rel: 'par', delta: -8, memory: 'the violin in the shed' },
              { flag: 'rebelled_lessons' },
            ],
          },
          {
            chance: 0.4,
            text: 'Nobody ever finds it. You spend Tuesdays building a den, and decades later you still feel a small thrill walking past sheds.',
            effects: [{ stat: 'happiness', delta: 6 }, { flag: 'rebelled_lessons' }],
          },
        ],
      },
    ],
  },
  {
    id: 'bgf_pushy_report',
    kind: 'choice',
    category: 'school',
    ages: [12, 16],
    weight: 60,
    once: true,
    when: hasBackground('pushy_parents'),
    bind: pushyParent,
    text: 'Report-card night. {par.first} reads yours at the kitchen table with a highlighter, and the silence goes on long enough for the fridge to start humming.',
    choices: [
      {
        id: 'promise',
        label: 'Promise to do better',
        outcomes: [
          {
            chance: (s) => (s.education.grade >= 70 ? 0.7 : 0.4),
            text: '“Better is good,” {par.they} say{par.s}, putting a new study chart on the fridge. Over the term your grades climb, and so do your shoulders, nearer your ears.',
            effects: [
              { stat: 'smarts', delta: 4 },
              { stat: 'stress', delta: 6 },
              { rel: 'par', delta: 4, memory: 'the report card you promised to fix' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You try and the marks barely move. {par.first} sighs a sigh that you will be able to hear, word for word, at forty.',
            effects: [
              { stat: 'happiness', delta: -6 },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'defend',
        label: 'Point at the B in art',
        outcomes: [
          {
            chance: 0.5,
            text: '“Art,” {par.first} says, like you have named a disease. But {par.they} pin{par.s} your drawing to the fridge anyway, a little behind the study chart.',
            effects: [
              { skill: 'art', delta: 4 },
              { stat: 'happiness', delta: 4 },
              { rel: 'par', delta: 2, memory: 'the drawing on the fridge' },
            ],
          },
          {
            chance: 0.5,
            text: 'It does not land. You are sent to your room, where you draw an unflattering picture of the highlighter.',
            effects: [
              { skill: 'art', delta: 3 },
              { rel: 'par', delta: -5, memory: 'the report card argument' },
            ],
          },
        ],
      },
      {
        id: 'fair',
        label: 'Tell them it’s too much',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.45),
            text: 'You say it calmly, with examples. {par.first} is quiet for a long time, then cancels Wednesday Mandarin. It is the first time you have ever won.',
            effects: [
              { stat: 'stress', delta: -6 },
              { stat: 'happiness', delta: 5 },
              { rel: 'par', delta: 3, memory: 'the night you told me it was too much' },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'Your voice wobbles halfway through and it turns into shouting. Two doors slam, one of them yours.',
            effects: [
              { stat: 'stress', delta: 4 },
              { rel: 'par', delta: -7, memory: 'the night of the slammed doors' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bgf_pushy_degree',
    kind: 'choice',
    category: 'school',
    ages: [17, 19],
    weight: 60,
    once: true,
    when: hasBackground('pushy_parents'),
    bind: pushyParent,
    text: '{par.first} has filled in your university forms in pencil, so you can “go over them in pen”. Medicine first, law as a fallback. There is no third box.',
    choices: [
      {
        id: 'along',
        label: 'Go over them in pen',
        outcomes: [
          {
            chance: 1,
            text: 'You sign. {par.first} hugs you so hard your back clicks, and tells the neighbours before the envelope is even in the post.',
            effects: [
              { rel: 'par', delta: 10, memory: 'the forms you signed in pen' },
              { stat: 'discipline', delta: 4 },
              { stat: 'happiness', delta: -4 },
              { flag: 'parents_degree' },
            ],
          },
        ],
      },
      {
        id: 'own',
        label: 'Rub it out and choose your own',
        outcomes: [
          {
            chance: 1,
            text: 'You use the rubber on the end of {par.their} own pencil. For a week {par.they} barely speak{par.s} to you. Then a prospectus for your subject appears on your bed, without a word.',
            effects: [
              { rel: 'par', delta: -12, memory: 'the forms you rubbed out' },
              { stat: 'happiness', delta: 8 },
              { flag: 'own_degree' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bgf_pushy_proud',
    kind: 'choice',
    category: 'family',
    ages: [28, 45],
    weight: 60,
    once: true,
    when: hasBackground('pushy_parents'),
    bind: pushyParent,
    text: 'A long lunch with {par.first}, older now and slower to correct the waiter. Somewhere between the soup and the bill, there is a gap where the thing you’ve waited thirty years to hear could go.',
    choices: [
      {
        id: 'ask',
        label: 'Ask: “Are you proud of me?”',
        outcomes: [
          {
            chance: proudOdds,
            text: '{par.They} put{par.s} down {par.their} fork. “I was always proud. I was just frightened for you.” You both look at the menu very hard for a while.',
            effects: [
              { stat: 'happiness', delta: 12 },
              { stat: 'stress', delta: -6 },
              { rel: 'par', delta: 15, memory: 'the lunch where I told you I was proud' },
              { flag: 'parent_proud' },
            ],
            success: true,
          },
          {
            chance: (s) => 1 - proudOdds(s),
            text: '“Of course,” {par.they} say{par.s}, “but your cousin is a consultant now.” You pay the bill and drive home with the radio very loud.',
            effects: [
              { stat: 'happiness', delta: -8 },
              { rel: 'par', delta: -6, memory: 'the lunch with the cousin' },
            ],
          },
        ],
      },
      {
        id: 'let',
        label: 'Let it go: you know who you are',
        outcomes: [
          {
            chance: 1,
            text: 'You don’t ask. You talk about the garden instead, and at the door {par.first} squeezes your arm a little too long, which might have been the answer.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'stress', delta: -3 },
              { rel: 'par', delta: 5, memory: 'the lunch where we talked about the garden' },
            ],
          },
        ],
      },
    ],
  },

  // ── A famous parent ──────────────────────────────────────────────────────
  {
    id: 'bgf_famous_gate',
    kind: 'choice',
    category: 'fame',
    ages: [7, 12],
    weight: 60,
    once: true,
    when: hasBackground('famous_parent'),
    bind: famousParent,
    text: 'There are photographers at the school gate again, because {par.first} is doing the pick-up for once. Every other child in your year is pretending not to look.',
    choices: [
      {
        id: 'wave',
        label: 'Wave at the cameras',
        outcomes: [
          {
            chance: 1,
            text: 'Your gap-toothed grin is on the front of a Sunday magazine. Your class think you are a celebrity; your teacher thinks you are a distraction. Both are right.',
            effects: [
              { fame: 2 },
              { stat: 'happiness', delta: 4 },
              { rel: 'par', delta: 3, memory: 'the day you waved at the cameras' },
            ],
          },
        ],
      },
      {
        id: 'hide',
        label: 'Hide behind {par.their} coat',
        outcomes: [
          {
            chance: 1,
            text: '{par.first} notices, and from then on the pick-up is done by a quiet aunt in a very ordinary car. You are grateful in a way you can’t explain yet.',
            effects: [
              { stat: 'stress', delta: -3 },
              { rel: 'par', delta: 6, memory: 'the day you hid behind my coat' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bgf_famous_compared',
    kind: 'choice',
    category: 'fame',
    ages: [15, 19],
    weight: 60,
    once: true,
    when: hasBackground('famous_parent'),
    bind: famousParent,
    text: 'You enter the school talent show under a made-up surname. Someone finds out by lunchtime, and the local paper runs it anyway: “{par.first}’s kid takes the stage.”',
    choices: [
      {
        id: 'perform',
        label: 'Go on and own it',
        outcomes: [
          {
            chance: oddsBy('looks', 0.45),
            text: 'You are, it turns out, actually good. The paper prints a second piece the next week, and this one only mentions {par.first} in the last line.',
            effects: [{ fame: 3 }, { skill: 'voice', delta: 4 }, { stat: 'happiness', delta: 8 }],
            success: true,
          },
          {
            chance: 0.5,
            text: 'You are fine. Just fine. The review says “not a patch on the parent”, and you laminate it and stick it inside your wardrobe out of spite.',
            effects: [
              { fame: 1 },
              { stat: 'happiness', delta: -5 },
              { stat: 'discipline', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'pull',
        label: 'Pull out of the show',
        outcomes: [
          {
            chance: 1,
            text: 'You pull out and say you have a cold. {par.first} rings from a hotel abroad to tell you that {par.they} threw up before every show for ten years.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { rel: 'par', delta: 5, memory: 'the call about stage fright' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bgf_famous_scandal',
    kind: 'choice',
    category: 'fame',
    ages: [10, 40],
    weight: 60,
    once: true,
    when: hasBackground('famous_parent'),
    bind: famousParent,
    text: '{par.first} is all over the papers: a leaked recording, a furious co-star, and a word nobody in your family has ever said out loud. Reporters want a quote from you.',
    choices: [
      {
        id: 'stand',
        label: 'Stand by {par.them} in public',
        outcomes: [
          {
            chance: 1,
            text: 'You walk out of the house holding {par.their} hand and say nothing at all to the cameras. The picture runs everywhere. {par.first} keeps a copy in {par.their} wallet.',
            effects: [
              { rel: 'par', delta: 14, memory: 'the morning you held my hand past the cameras' },
              { fame: 2 },
              { stat: 'stress', delta: 8 },
            ],
          },
        ],
      },
      {
        id: 'distance',
        label: 'Keep your distance',
        outcomes: [
          {
            chance: 1,
            text: 'You turn off your phone, stay at a friend’s and let your name fall out of the story. It works. It also costs something you only notice at Christmas.',
            effects: [
              { rel: 'par', delta: -10, memory: 'the scandal you stayed away from' },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'ask',
        label: 'Ask {par.them} what really happened',
        outcomes: [
          {
            chance: 0.6,
            text: '{par.They} tell{par.s} you, at length, at the kitchen table at two in the morning. It is worse than the papers and also more human. You decide to stay.',
            effects: [
              { rel: 'par', delta: 8, memory: 'the night I told you the truth' },
              { stat: 'karma', delta: 3 },
            ],
          },
          {
            chance: 0.4,
            text: '{par.They} won’t say. “It’s complicated,” is all you get, and you are tired of complicated. Something between you sets a little harder.',
            effects: [{ rel: 'par', delta: -6, memory: 'the question I wouldn’t answer' }],
          },
        ],
      },
    ],
  },
  {
    id: 'bgf_famous_door',
    kind: 'choice',
    category: 'work',
    ages: [20, 35],
    weight: 60,
    once: true,
    when: all(hasBackground('famous_parent'), notInPrison),
    bind: famousParent,
    text: 'A producer who owes {par.first} a favour rings you directly. There is a part, a slot, an opening: yours if you say the word, and everybody would know why.',
    choices: [
      {
        id: 'take',
        label: 'Take the help',
        outcomes: [
          {
            chance: 1,
            text: 'You take it. The work is real and the money is better, and you get used to people saying “of course” when they hear your surname.',
            effects: [
              { fame: 6 },
              { money: 15000, kind: 'wage' },
              { stat: 'happiness', delta: 4 },
              { rel: 'par', delta: 5, memory: 'the favour you let me call in' },
              { flag: 'took_the_door' },
            ],
          },
        ],
      },
      {
        id: 'own',
        label: 'Make it on your own',
        outcomes: [
          {
            chance: 1,
            text: 'You say no thank you and start at the bottom, under your middle name. It is slow, cold and badly paid, and every inch of it is yours.',
            effects: [
              { stat: 'discipline', delta: 6 },
              { stat: 'happiness', delta: 2 },
              { flag: 'own_way' },
            ],
            next: { eventId: 'bgf_famous_own_way', inYears: [3, 6] },
          },
        ],
      },
    ],
  },
  {
    id: 'bgf_famous_own_way',
    kind: 'notice',
    category: 'fame',
    ages: [23, 45],
    weight: 60,
    chainOnly: true,
    when: hasBackground('famous_parent'),
    text: 'Years of starting at the bottom under your middle name, and someone finally writes about your work without knowing whose child you are.',
    outcomes: [
      {
        chance: oddsBy('discipline', 0.5),
        text: 'The piece is glowing. When the journalist finds out your surname a week later, the follow-up headline is about you, and your parent is the footnote.',
        effects: [{ fame: 5 }, { stat: 'happiness', delta: 10 }, { flag: 'made_own_name' }],
        success: true,
      },
      {
        chance: 0.4,
        text: 'The piece is kind and small and nobody reads it. You cut it out anyway. It is the first one with only your name in it.',
        effects: [{ fame: 1 }, { stat: 'happiness', delta: 5 }],
      },
    ],
  },

  // ── Raised by a grandparent ──────────────────────────────────────────────
  {
    id: 'bgf_gran_skills',
    kind: 'choice',
    category: 'family',
    ages: [6, 11],
    weight: 60,
    once: true,
    when: hasBackground('grandparents'),
    bind: raisingGran,
    text: '{gran.first}’s house has rules from another century: shoes off, elbows in, no television before the washing-up. But {gran.they} also know{gran.s} things nobody else’s family does.',
    choices: [
      {
        id: 'kitchen',
        label: 'Learn to cook from scratch',
        outcomes: [
          {
            chance: 1,
            text: 'You learn pastry with cold hands, soup from bones and how to rescue gravy. By ten you can feed six people from a near-empty cupboard.',
            effects: [
              { skill: 'cooking', delta: 8 },
              { stat: 'discipline', delta: 3 },
              { rel: 'gran', delta: 8, memory: 'the winter we made pastry with cold hands' },
            ],
          },
        ],
      },
      {
        id: 'garden',
        label: 'Help in the garden',
        outcomes: [
          {
            chance: 1,
            text: 'You learn which weeds to pull and which to leave for the bees, and you grow a marrow so large the neighbours come round to look at it.',
            effects: [
              { stat: 'health', delta: 4 },
              { stat: 'happiness', delta: 5 },
              { rel: 'gran', delta: 8, memory: 'the summer of the enormous marrow' },
            ],
          },
        ],
      },
      {
        id: 'cards',
        label: 'Learn {gran.their} card games',
        outcomes: [
          {
            chance: 1,
            text: '{gran.first} teaches you whist, patience and a game with no name that {gran.they} cheat{gran.s} at shamelessly. You learn to count cards, and people.',
            effects: [
              { skill: 'chess', delta: 4 },
              { stat: 'smarts', delta: 4 },
              { rel: 'gran', delta: 8, memory: 'the card game I always cheated at' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bgf_gran_school_day',
    kind: 'choice',
    category: 'school',
    ages: [8, 13],
    weight: 60,
    once: true,
    when: hasBackground('grandparents'),
    bind: raisingGran,
    text: 'It’s “bring a parent to school” day. Everyone else’s parent is in a suit or a hi-vis jacket. You have {gran.first}, who has brought a tin of biscuits and a walking stick.',
    choices: [
      {
        id: 'bring',
        label: 'Bring {gran.first} proudly',
        outcomes: [
          {
            chance: 1,
            text: '{gran.first} tells the class about the year {gran.they} drove an ambulance through a snowstorm. Nobody remembers anybody else’s parent. The biscuits are gone by ten.',
            effects: [
              { stat: 'happiness', delta: 8 },
              { rel: 'gran', delta: 10, memory: 'the day you took me to school' },
            ],
          },
        ],
      },
      {
        id: 'skip',
        label: 'Say {gran.they} couldn’t make it',
        outcomes: [
          {
            chance: 1,
            text: 'You tell your teacher {gran.first} is busy. {gran.They} find{gran.s} the letter in your bag that evening. Not a word is said, and your favourite pudding appears anyway, which is worse.',
            effects: [
              { stat: 'happiness', delta: -5 },
              { rel: 'gran', delta: -4, memory: 'the school letter in your bag' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bgf_gran_carer',
    kind: 'choice',
    category: 'health',
    ages: [13, 18],
    weight: 60,
    once: true,
    when: hasBackground('grandparents'),
    bind: raisingGran,
    text: '{gran.first} is slowing down: the stairs take longer, the pills come in a box with the days on, and twice now the gas has been left on. {gran.They} insist{gran.s} {gran.they} {gran.is} fine.',
    choices: [
      {
        id: 'care',
        label: 'Look after {gran.them} yourself',
        outcomes: [
          {
            chance: 1,
            text: 'You learn the pill box, the shopping, the stairs. Your homework gets done at midnight and your friends stop asking you out. {gran.first} calls you “the boss” and means it.',
            effects: [
              { stat: 'karma', delta: 8 },
              { stat: 'stress', delta: 10 },
              { stat: 'discipline', delta: 5 },
              { rel: 'gran', delta: 14, memory: 'the years you looked after me' },
              { npcStat: 'gran', stat: 'happiness', delta: 10 },
              { flag: 'young_carer' },
            ],
          },
        ],
      },
      {
        id: 'help',
        label: 'Tell the school and get help',
        outcomes: [
          {
            chance: 1,
            text: 'A nurse starts visiting twice a week, and a neighbour takes the Thursday shopping. {gran.first} grumbles about strangers in the kitchen, and gets stronger.',
            effects: [
              { stat: 'stress', delta: -2 },
              { stat: 'karma', delta: 3 },
              { npcStat: 'gran', stat: 'health', delta: 6 },
              { rel: 'gran', delta: 4, memory: 'the nurse you found for me' },
            ],
          },
        ],
      },
      {
        id: 'ignore',
        label: 'Take {gran.their} word for it',
        outcomes: [
          {
            chance: 1,
            text: 'You want it to be true, so you let it be. Then {gran.first} falls on the back step and you find {gran.them} after school. {gran.They} recover{gran.s}. You don’t, quite.',
            effects: [
              { stat: 'happiness', delta: -8 },
              { stat: 'stress', delta: 8 },
              { npcStat: 'gran', stat: 'health', delta: -8 },
              { rel: 'gran', delta: -2, memory: 'the fall on the back step' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bgf_gran_remembered',
    kind: 'choice',
    category: 'family',
    ages: [25, 80],
    weight: 60,
    once: true,
    when: all(hasBackground('grandparents'), granGone),
    text: 'Clearing a cupboard, you find the old recipe tin from the house you grew up in, the lid still dented. Inside are cards in a handwriting you would know anywhere.',
    choices: [
      {
        id: 'cook',
        label: 'Cook something from the tin',
        outcomes: [
          {
            chance: 1,
            text: 'You make the soup from the card marked “for colds and sadness”. The kitchen smells exactly like being nine. You eat it standing up, and you cry a bit, and it helps.',
            effects: [
              { stat: 'happiness', delta: 8 },
              { stat: 'stress', delta: -6 },
              { skill: 'cooking', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'pass',
        label: 'Pass the cards on',
        outcomes: [
          {
            chance: 1,
            text: 'You copy every card out by hand and give the copies to the people you love. The originals go back in the tin, dent and all, on the shelf where you’ll see it.',
            effects: [
              { stat: 'karma', delta: 5 },
              { stat: 'happiness', delta: 6 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'bgf_biz_inherit',
    kind: 'choice',
    category: 'family',
    ages: [18, 100],
    weight: 1,
    chainOnly: true,
    text: 'With the funeral over, the solicitor slides a set of keys across the desk: {fambiz} is yours to keep or to let go.',
    choices: [
      {
        id: 'keep',
        label: 'Keep it running',
        outcomes: [
          {
            chance: 1,
            text: 'You open up on Monday at the usual time. The regulars come in quietly and say the same thing in different words: they would have been proud.',
            effects: [{ system: 'take_fambiz' }, { stat: 'happiness', delta: 4 }],
          },
        ],
      },
      {
        id: 'sell',
        label: 'Sell it',
        outcomes: [
          {
            chance: 1,
            text: 'A buyer takes it on, staff and all. You keep the old sign, which goes in your hallway.',
            effects: [{ system: 'sell_fambiz' }, { stat: 'happiness', delta: -2 }],
          },
        ],
      },
    ],
  },
];
