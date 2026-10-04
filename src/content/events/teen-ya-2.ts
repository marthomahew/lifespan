import type { EventDef } from '../../engine/events/types';
import { canAfford, hasJob, inSchool, oddsBy } from './conditions';

export const TEEN_YA_EVENTS_2: EventDef[] = [
  // ---------------------------------------------------------------- teen (13–17)
  {
    id: 'teen2_first_paycheque',
    kind: 'notice',
    category: 'money',
    ages: [15, 17],
    weight: 7,
    once: true,
    text: 'Your first pay cheque from bagging groceries at the Fennwick Market arrives in a tiny envelope with your name spelled wrong.',
    outcomes: [
      {
        chance: 0.6,
        text: 'You stare at the deductions line for a full minute, then spend the remainder on a jacket you will wear until it falls apart.',
        effects: [
          { money: 250 },
          { stat: 'happiness', delta: 5 },
          { stat: 'discipline', delta: 2 },
        ],
      },
      {
        chance: 0.4,
        text: 'You put all of it in a savings account and check the balance every morning like it might have hatched.',
        effects: [{ money: 350 }, { stat: 'discipline', delta: 4 }, { addTrait: 'frugal' }],
      },
    ],
  },
  {
    id: 'teen2_viral_video',
    kind: 'choice',
    category: 'social',
    ages: [13, 17],
    weight: 8,
    cooldownYears: 5,
    bind: { pal: { role: 'friend', minRelationship: 20 } },
    text: '{pal.first} filmed you walking confidently into a glass door at the shopping centre. It now has four hundred thousand views and a remix with a drum beat.',
    choices: [
      {
        id: 'lean_in',
        label: 'Post a slow-motion sequel',
        outcomes: [
          {
            chance: oddsBy('looks', 0.5),
            success: true,
            text: 'The sequel does even better. Strangers on the bus point and you bow. You are, briefly, a local landmark.',
            effects: [
              { stat: 'happiness', delta: 7 },
              { fame: 2 },
              { rel: 'pal', delta: 5, memory: 'the glass door sequel' },
            ],
          },
          {
            chance: 0.4,
            text: 'The sequel flops. The original keeps climbing. Your grandmother has seen it twice.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'demand_delete',
        label: 'Make {pal.first} take it down',
        outcomes: [
          {
            chance: 1,
            text: '{pal.first} deletes it with a heavy sigh, as if retiring a racehorse. Copies keep surfacing for a month.',
            effects: [
              { rel: 'pal', delta: -4, memory: 'the video you made them delete' },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'hide',
        label: 'Stay indoors until it blows over',
        outcomes: [
          {
            chance: 1,
            text: 'You spend a long weekend under a blanket. By Tuesday the internet has moved on to a goose that steals sandwiches.',
            effects: [
              { stat: 'happiness', delta: -3 },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'teen2_road_trip',
    kind: 'notice',
    category: 'travel',
    ages: [13, 16],
    weight: 6,
    cooldownYears: 6,
    text: '{father.first} plans a family road trip with a laminated itinerary and a strict rule against stopping for toilets before the second motorway.',
    outcomes: [
      {
        chance: 0.5,
        text: 'The car overheats near a town famous for one large concrete egg. It is, against all odds, the best afternoon of the year.',
        effects: [
          { stat: 'happiness', delta: 6 },
          { rel: 'father', delta: 4, memory: 'the concrete egg detour' },
        ],
      },
      {
        chance: 0.5,
        text: 'Nine hours, one map argument, and a sandwich that fell in the footwell. You arrive barely on speaking terms with everyone.',
        effects: [
          { stat: 'stress', delta: 4 },
          { rel: 'father', delta: -2, memory: 'the nine-hour drive' },
        ],
      },
    ],
  },
  {
    id: 'teen2_sibling_car',
    kind: 'choice',
    category: 'family',
    ages: [16, 17],
    weight: 8,
    cooldownYears: 3,
    bind: { sib: { role: 'sibling', minAge: 15 } },
    text: 'There is one family car and two of you with brand-new licences. {sib.first} has started leaving the keys in the freezer so you cannot find them.',
    choices: [
      {
        id: 'rota',
        label: 'Draw up a calendar',
        outcomes: [
          {
            chance: 0.6,
            success: true,
            text: 'The colour-coded rota is a triumph of bureaucracy. {sib.first} grumbles but sticks to it.',
            effects: [
              { stat: 'discipline', delta: 3 },
              { rel: 'sib', delta: 3, memory: 'the car rota' },
            ],
          },
          {
            chance: 0.4,
            text: '{sib.first} draws a moustache on your days and claims the calendar is "non-binding."',
            effects: [
              { stat: 'stress', delta: 3 },
              { rel: 'sib', delta: -3, memory: 'the moustache on the car rota' },
            ],
          },
        ],
      },
      {
        id: 'retaliate',
        label: 'Hide the keys somewhere worse',
        outcomes: [
          {
            chance: 1,
            text: 'You hide them inside a flowerpot. Nobody can find them for three days, including you. {mother.first} takes the bus out of spite.',
            effects: [
              { rel: 'sib', delta: -5, memory: 'the flowerpot key war' },
              { rel: 'mother', delta: -3, memory: 'the week of the missing car keys' },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'bike',
        label: 'Let {sib.first} have it and cycle',
        outcomes: [
          {
            chance: 1,
            text: 'You cycle everywhere and develop thighs like bridge supports. {sib.first} feels oddly guilty about it.',
            effects: [
              { stat: 'health', delta: 4 },
              { rel: 'sib', delta: 4, memory: 'you giving up the car' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'teen2_school_election',
    kind: 'choice',
    category: 'school',
    ages: [14, 17],
    weight: 8,
    once: true,
    when: inSchool,
    bind: { rival: { role: 'classmate' } },
    text: '{rival.first} is running for student council on a platform of "more benches." You could run against {rival.them}, and you suspect you would be better at benches.',
    choices: [
      {
        id: 'run_serious',
        label: 'Run on a real platform',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.45),
            success: true,
            text: 'Your plan to fix the broken water fountains wins in a landslide. The fountains remain broken, but now officially on your watch.',
            effects: [
              { stat: 'smarts', delta: 3 },
              { stat: 'happiness', delta: 6 },
              { addTrait: 'ambitious' },
            ],
          },
          {
            chance: 0.5,
            text: 'You lose by eleven votes to benches. People really wanted to sit down.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { rel: 'rival', delta: -2, memory: 'beating you on benches' },
            ],
          },
        ],
      },
      {
        id: 'run_joke',
        label: 'Promise a pool on the roof',
        outcomes: [
          {
            chance: 0.5,
            text: 'You win. The head teacher calls you in to discuss the roof pool, gravely. You resign within a month, beloved.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'karma', delta: -2 },
              { addTrait: 'funny' },
            ],
          },
          {
            chance: 0.5,
            text: 'You come a distant third, behind benches and a write-in vote for the caretaker.',
            effects: [{ stat: 'happiness', delta: 1 }],
          },
        ],
      },
      {
        id: 'manage',
        label: "Offer to run {rival.first}'s campaign",
        outcomes: [
          {
            chance: 1,
            text: 'Benches win. {rival.first} thanks you in the acceptance speech and you get a small plaque that is also, technically, a bench.',
            effects: [
              { rel: 'rival', delta: 7, memory: 'the bench campaign' },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'teen2_friend_moving',
    kind: 'choice',
    category: 'social',
    ages: [13, 15],
    weight: 7,
    cooldownYears: 6,
    bind: { pal: { role: 'friend', minRelationship: 40 } },
    text: '{pal.first} announces {pal.their} family is moving to the other side of the country next month. {pal.They} {pal.is} trying very hard to look like {pal.they} {pal.is} fine about it.',
    choices: [
      {
        id: 'promise',
        label: 'Promise to stay in touch',
        outcomes: [
          {
            chance: 1,
            text: 'You set up a shared calendar for calls. On the last day you both pretend you have something in your eye.',
            effects: [
              { rel: 'pal', delta: 6, memory: 'your goodbye at the removal van' },
              { stat: 'happiness', delta: -3 },
            ],
            next: { eventId: 'teen2_friend_visit', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'gift',
        label: 'Make a farewell scrapbook',
        outcomes: [
          {
            chance: 1,
            text: 'The scrapbook is mostly receipts and blurry photos of pigeons. {pal.first} cries anyway, which is the correct response.',
            effects: [
              { rel: 'pal', delta: 9, memory: 'the pigeon scrapbook' },
              { skill: 'art', delta: 2 },
            ],
            next: { eventId: 'teen2_friend_visit', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'avoid',
        label: 'Act like it is no big deal',
        outcomes: [
          {
            chance: 1,
            text: 'You say "cool" and talk about something else. The removal van leaves while you are at the dentist.',
            effects: [
              { rel: 'pal', delta: -6, memory: 'how little you seemed to care' },
              { stat: 'happiness', delta: -5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'teen2_friend_visit',
    kind: 'choice',
    category: 'social',
    ages: [14, 17],
    weight: 8,
    chainOnly: true,
    bind: { pal: { role: 'friend' } },
    text: '{pal.first} invites you to stay for a weekend in {pal.their} new town. {pal.They} now {pal.has} a regional accent and opinions about a football team you have never heard of.',
    choices: [
      {
        id: 'go',
        label: 'Take the train out',
        outcomes: [
          {
            chance: 0.65,
            success: true,
            text: 'Within an hour it is like nothing changed, except {pal.first} says "aye" now. You stay up until four.',
            effects: [
              { rel: 'pal', delta: 8, memory: 'the weekend you came to visit' },
              { stat: 'happiness', delta: 7 },
            ],
          },
          {
            chance: 0.35,
            text: '{pal.first} has new friends with a lot of in-jokes. You laugh at all of them a beat late and ride home quietly.',
            effects: [
              { rel: 'pal', delta: -2, memory: 'the slightly awkward visit' },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Say you are too busy',
        outcomes: [
          {
            chance: 1,
            text: "The calls get shorter after that. You still like every one of {pal.first}'s posts, which counts for something.",
            effects: [{ rel: 'pal', delta: -5, memory: 'the visit you never made' }],
          },
        ],
      },
    ],
  },
  {
    id: 'teen2_summer_camp',
    kind: 'choice',
    category: 'travel',
    ages: [13, 15],
    weight: 7,
    once: true,
    text: '{mother.first} has booked you two weeks at Camp Pinehollow, where the brochure promises "canoeing, character and no screens." The photos look suspiciously like a car park.',
    choices: [
      {
        id: 'embrace',
        label: 'Throw yourself into it',
        outcomes: [
          {
            chance: oddsBy('health', 0.55),
            success: true,
            text: 'You capsize a canoe, win the knot-tying final and come home with a tan line shaped like a lanyard.',
            effects: [
              { stat: 'health', delta: 4 },
              { stat: 'happiness', delta: 6 },
              { status: 'friend' },
            ],
          },
          {
            chance: 0.35,
            text: "Day two, a wasp. Day three, a second wasp. You spend most of camp in the nurse's hut reading her magazines.",
            effects: [{ injury: 3 }, { stat: 'smarts', delta: 2 }],
          },
        ],
      },
      {
        id: 'sulk',
        label: 'Sulk for the full fortnight',
        outcomes: [
          {
            chance: 1,
            text: 'You sulk so committedly that a counsellor writes "intense" on your report. {mother.first} asks for a refund and does not get one.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { rel: 'mother', delta: -3, memory: 'the wasted camp fees' },
            ],
          },
        ],
      },
      {
        id: 'smuggle',
        label: 'Smuggle in a phone',
        outcomes: [
          {
            chance: 0.5,
            text: 'You run a lucrative phone-rental operation from your bunk. Ten minutes for two biscuits.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'karma', delta: -2 },
              { addTrait: 'cunning' },
            ],
          },
          {
            chance: 0.5,
            text: 'The counsellors find it inside a sock on night one. It is returned to {mother.first} with a sternly worded leaflet.',
            effects: [
              { rel: 'mother', delta: -4, memory: 'the phone in the camp sock' },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'teen2_weird_hobby',
    kind: 'choice',
    category: 'random',
    ages: [13, 17],
    weight: 7,
    cooldownYears: 5,
    text: 'You have become obsessed with competitive yo-yo. You own six. You have watched a forty-minute tutorial on something called the "Trapeze Brain Twister."',
    choices: [
      {
        id: 'compete',
        label: 'Enter the regional championship',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.45),
            success: true,
            text: 'You place fourth out of nineteen. The trophy is a yo-yo glued to a smaller yo-yo, and you treasure it.',
            effects: [
              { stat: 'happiness', delta: 7 },
              { stat: 'discipline', delta: 3 },
            ],
          },
          {
            chance: 0.5,
            text: 'The string snaps mid-routine and the yo-yo hits a judge on the clipboard. They are very nice about it.',
            effects: [
              { stat: 'happiness', delta: -3 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'teach',
        label: 'Teach {sibling.first}',
        outcomes: [
          {
            chance: 1,
            text: '{sibling.first} is instantly better than you, which is unbearable, but you practise together every night anyway.',
            effects: [
              { rel: 'sibling', delta: 5, memory: 'the yo-yo summer' },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'quit',
        label: 'Move on to the next thing',
        outcomes: [
          {
            chance: 1,
            text: 'The six yo-yos go in a drawer, where they join the juggling clubs and a book on lock-picking for magicians.',
            effects: [{ stat: 'happiness', delta: 1 }, { addTrait: 'creative' }],
          },
        ],
      },
    ],
  },
  {
    id: 'teen2_protest',
    kind: 'choice',
    category: 'world',
    ages: [15, 17],
    weight: 6,
    cooldownYears: 4,
    when: inSchool,
    bind: { mate: { role: 'classmate' } },
    text: "{mate.first} is organising a walkout over the council plan to pave the town's last wild meadow for a car park. There are placards. There is a megaphone with one working setting: loud.",
    choices: [
      {
        id: 'march',
        label: 'Walk out and march',
        outcomes: [
          {
            chance: 0.55,
            success: true,
            text: 'You end up on the local news holding a sign that says MEADOWS NOT METERS. The council postpones the vote.',
            effects: [
              { stat: 'karma', delta: 5 },
              { stat: 'happiness', delta: 5 },
              { rel: 'mate', delta: 5, memory: 'the meadow walkout' },
            ],
          },
          {
            chance: 0.45,
            text: 'It rains, the megaphone dies and the school gives everyone a Saturday detention. You feel noble and damp.',
            effects: [
              { stat: 'karma', delta: 3 },
              { stat: 'stress', delta: 3 },
              { rel: 'mate', delta: 3, memory: 'the rained-out walkout' },
            ],
          },
        ],
      },
      {
        id: 'letter',
        label: 'Write to the council instead',
        outcomes: [
          {
            chance: 1,
            text: 'Your four-page letter gets a reply thanking you for your "valued engagement." You frame it out of pure irony.',
            effects: [
              { stat: 'smarts', delta: 3 },
              { skill: 'writing', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'stay',
        label: 'Stay in maths',
        outcomes: [
          {
            chance: 1,
            text: 'You are one of six people left in a very quiet maths lesson. You learn simultaneous equations. {mate.first} notices.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { rel: 'mate', delta: -3, memory: 'you staying in maths' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'teen2_phone_dinner',
    kind: 'choice',
    category: 'family',
    ages: [13, 17],
    weight: 7,
    cooldownYears: 4,
    text: 'You look at your phone under the dinner table one time too many. {mother.first} holds out a hand and says nothing, which is so much worse than saying something.',
    choices: [
      {
        id: 'hand_over',
        label: 'Hand it over',
        outcomes: [
          {
            chance: 1,
            text: 'It goes in the fruit bowl for a week. You read two whole books and rediscover a board game with most of its pieces.',
            effects: [
              { stat: 'smarts', delta: 3 },
              { stat: 'happiness', delta: -2 },
              { rel: 'mother', delta: 3, memory: 'the week in the fruit bowl' },
            ],
          },
        ],
      },
      {
        id: 'negotiate',
        label: 'Negotiate terms',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.4),
            success: true,
            text: 'You argue your way down to two days and an evening of washing up. {mother.first} looks faintly impressed.',
            effects: [
              { stat: 'discipline', delta: 2 },
              { rel: 'mother', delta: 1, memory: 'your phone negotiation' },
            ],
          },
          {
            chance: 0.5,
            text: 'Every counter-offer adds a day. You stop talking at nine days, a personal worst.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { rel: 'mother', delta: -2, memory: 'your nine-day phone ban' },
            ],
          },
        ],
      },
      {
        id: 'decoy',
        label: 'Hand over your old cracked phone',
        outcomes: [
          {
            chance: 0.4,
            text: 'It works for two whole days. Then the real one buzzes in your pocket during grace.',
            effects: [
              { stat: 'karma', delta: -3 },
              { rel: 'mother', delta: -6, memory: 'the decoy phone' },
            ],
          },
          {
            chance: 0.6,
            success: true,
            text: '{mother.first} never notices. You feel like a master criminal and also, slightly, like a bad person.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'karma', delta: -3 },
            ],
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------- young adult (18–29)
  {
    id: 'ya2_bad_flatmate',
    kind: 'choice',
    category: 'social',
    ages: [18, 26],
    weight: 8,
    cooldownYears: 6,
    text: 'Your new flatmate labels every item in the fridge, including yours, with their own name. They also practise the bagpipes on the balcony at seven in the morning.',
    choices: [
      {
        id: 'confront',
        label: 'Call a flat meeting',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.45),
            success: true,
            text: 'You present a calm, bullet-pointed list. The bagpipes move to Saturdays and the labels come off. Peace, of a sort.',
            effects: [
              { stat: 'stress', delta: -3 },
              { stat: 'happiness', delta: 4 },
            ],
          },
          {
            chance: 0.5,
            text: 'The meeting turns into a two-hour grievance session about your mugs. You concede on the mugs.',
            effects: [{ stat: 'stress', delta: 5 }],
          },
        ],
      },
      {
        id: 'move',
        label: 'Find somewhere else',
        requires: canAfford(1200),
        outcomes: [
          {
            chance: 1,
            text: 'You lose the deposit but gain a silent flat above a bakery. The mornings smell of bread instead of drones.',
            effects: [
              { money: -1200 },
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'escape',
        label: "Couch-surf at {friend.first}'s",
        outcomes: [
          {
            chance: 1,
            text: "You last nine nights on {friend.first}'s sofa before {friend.they} start{friend.s} leaving property listings on your pillow.",
            effects: [
              { rel: 'friend', delta: -3, memory: 'the nine nights on their sofa' },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ya2_tax_return',
    kind: 'choice',
    category: 'money',
    ages: [19, 25],
    weight: 7,
    once: true,
    when: hasJob,
    text: 'Your first tax return arrives as a forty-page form that uses the word "notwithstanding" eleven times. Box 14b refers you to Box 14b.',
    choices: [
      {
        id: 'diy',
        label: 'Fill it in yourself',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.5),
            success: true,
            text: 'Three evenings and a lot of muttering later, you discover you overpaid. A small refund lands like a gift from a stern uncle.',
            effects: [
              { money: 400 },
              { stat: 'smarts', delta: 3 },
              { stat: 'discipline', delta: 2 },
            ],
          },
          {
            chance: 0.45,
            text: 'You misread a box and owe a penalty, plus a letter whose tone suggests the tax office is disappointed in you personally.',
            effects: [{ money: -300 }, { stat: 'stress', delta: 5 }],
          },
        ],
      },
      {
        id: 'parent',
        label: 'Ring {father.first} for help',
        outcomes: [
          {
            chance: 1,
            text: '{father.first} talks you through it for two hours with the energy of a man who has waited years for this exact call.',
            effects: [
              { rel: 'father', delta: 6, memory: 'the night he did your taxes with you' },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'accountant',
        label: 'Pay an accountant',
        requires: canAfford(250),
        outcomes: [
          {
            chance: 1,
            text: 'A woman named Bernadette finishes it in twenty minutes while eating a pear. Worth every cent.',
            effects: [{ money: -250 }, { stat: 'stress', delta: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'ya2_wedding_speech',
    kind: 'choice',
    category: 'social',
    ages: [22, 29],
    weight: 7,
    cooldownYears: 5,
    bind: { pal: { role: 'friend', minRelationship: 45, minAge: 21 } },
    text: '{pal.first} asks you to give a speech at {pal.their} wedding. You have three weeks, a stack of embarrassing stories, and one that absolutely cannot be told in front of a grandmother.',
    choices: [
      {
        id: 'heartfelt',
        label: 'Write something sincere',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.5),
            success: true,
            text: 'Halfway through, the best man starts crying, then the caterers. {pal.first} hugs you so long the band has to vamp.',
            effects: [
              { rel: 'pal', delta: 10, memory: 'your wedding speech' },
              { stat: 'happiness', delta: 6 },
              { skill: 'writing', delta: 2 },
            ],
          },
          {
            chance: 0.45,
            text: 'It is lovely but runs to fourteen minutes. The soup goes cold. Nobody mentions it, but everyone remembers the soup.',
            effects: [
              { rel: 'pal', delta: 3, memory: 'the fourteen-minute speech' },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'roast',
        label: 'Go for big laughs',
        outcomes: [
          {
            chance: 0.5,
            text: 'The room roars. Even the vicar does a little snort. You are asked for a copy by three separate uncles.',
            effects: [
              { rel: 'pal', delta: 6, memory: 'the speech that made the vicar snort' },
              { stat: 'happiness', delta: 7 },
            ],
          },
          {
            chance: 0.5,
            text: 'You tell the story. The grandmother hears it. The grandmother has follow-up questions.',
            effects: [
              { rel: 'pal', delta: -7, memory: 'the story you told at the wedding' },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Politely decline',
        outcomes: [
          {
            chance: 1,
            text: 'Someone from {pal.first}\'s work does it instead and quotes a dictionary definition of "love." You feel slightly responsible.',
            effects: [{ rel: 'pal', delta: -4, memory: 'you turning down the speech' }],
          },
        ],
      },
    ],
  },
  {
    id: 'ya2_sublet_scam',
    kind: 'notice',
    category: 'money',
    ages: [18, 26],
    weight: 5,
    cooldownYears: 10,
    text: 'A beautiful sublet listing in {city}, cheap and available immediately, asks for the deposit up front because the owner is "currently on a boat."',
    outcomes: [
      {
        chance: 0.4,
        text: 'You pay it. The keys never arrive and the listing vanishes. You report it and become very sceptical about boats.',
        effects: [{ money: -800 }, { stat: 'stress', delta: 6 }, { addTrait: 'cautious' }],
      },
      {
        chance: 0.6,
        text: 'Something about the boat bothers you. A quick search shows the same flat listed in four cities. You close the tab, quietly proud.',
        effects: [
          { stat: 'smarts', delta: 2 },
          { stat: 'happiness', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'ya2_gap_year',
    kind: 'choice',
    category: 'travel',
    ages: [18, 22],
    weight: 7,
    once: true,
    text: "You could take a year off to see the world. You have a backpack, a vague plan involving Lisbon, and {mother.first}'s face doing a complicated thing.",
    choices: [
      {
        id: 'go',
        label: 'Book a one-way ticket',
        requires: canAfford(3000),
        outcomes: [
          {
            chance: 0.6,
            success: true,
            text: 'You pick grapes, sleep in eleven hostels and learn to order coffee in four languages. You come home browner and calmer.',
            effects: [
              { money: -3000 },
              { stat: 'happiness', delta: 9 },
              { stat: 'stress', delta: -6 },
              { addTrait: 'optimistic' },
            ],
          },
          {
            chance: 0.4,
            text: 'Your bag goes missing in the first week and the year becomes mostly a long dispute with an airline. Still, the sunsets.',
            effects: [
              { money: -3500 },
              { stat: 'stress', delta: 4 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'cheap',
        label: 'Volunteer abroad for board and lodging',
        outcomes: [
          {
            chance: 1,
            text: 'You spend six months repairing dry-stone walls in the hills outside Porto. Your hands are wrecked and your heart is full.',
            effects: [
              { stat: 'health', delta: 4 },
              { stat: 'karma', delta: 4 },
              { stat: 'happiness', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'stay',
        label: 'Stay and get ahead',
        outcomes: [
          {
            chance: 1,
            text: '{mother.first} visibly relaxes. You get a head start, and a recurring daydream about Lisbon.',
            effects: [
              { rel: 'mother', delta: 3, memory: 'you staying home instead of travelling' },
              { stat: 'discipline', delta: 3 },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ya2_impulse_tattoo',
    kind: 'choice',
    category: 'random',
    ages: [18, 27],
    weight: 6,
    cooldownYears: 8,
    bind: { pal: { role: 'friend', minAge: 18 } },
    text: 'It is half past midnight and {pal.first} has found a tattoo studio still open. The artist has a walk-in special: any design from the wall, no questions.',
    choices: [
      {
        id: 'matching',
        label: 'Get matching ones with {pal.first}',
        requires: canAfford(150),
        outcomes: [
          {
            chance: 0.5,
            success: true,
            text: 'Two tiny lightning bolts on your ankles. You both swear it is meaningful. It is, a bit.',
            effects: [
              { money: -150 },
              { rel: 'pal', delta: 7, memory: 'your matching lightning bolts' },
              { stat: 'happiness', delta: 4 },
            ],
          },
          {
            chance: 0.5,
            text: '{pal.first} backs out at the last second, after yours is finished. You now have half of a matching pair.',
            effects: [
              { money: -150 },
              { rel: 'pal', delta: -4, memory: 'leaving you with half a tattoo' },
              { stat: 'looks', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'wall',
        label: 'Point at the wall and hope',
        requires: canAfford(120),
        outcomes: [
          {
            chance: 0.5,
            text: 'You leave with a small, surprisingly elegant swallow. People ask about it and you invent a new origin story every time.',
            effects: [
              { money: -120 },
              { stat: 'looks', delta: 2 },
              { stat: 'happiness', delta: 3 },
            ],
          },
          {
            chance: 0.5,
            text: 'It is a dolphin wearing sunglasses. It looks back at you from your shoulder with the confidence of something that knows it is permanent.',
            effects: [
              { money: -120 },
              { stat: 'happiness', delta: -3 },
              { stat: 'looks', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'home',
        label: 'Go home and sleep',
        outcomes: [
          {
            chance: 1,
            text: 'You leave {pal.first} to it. In the morning {pal.they} send{pal.s} a photo of a fresh, slightly blurry anchor and the word "help."',
            effects: [
              { stat: 'health', delta: 1 },
              { rel: 'pal', delta: -1, memory: 'you bailing on tattoo night' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ya2_mentor_advice',
    kind: 'choice',
    category: 'work',
    ages: [20, 25],
    weight: 7,
    once: true,
    when: hasJob,
    bind: { mentor: { role: 'coworker', minAge: 40 } },
    text: '{mentor.first}, who has been at the company longer than the carpet, takes you to lunch and says, "Two pieces of advice, and you will only take one."',
    choices: [
      {
        id: 'listen',
        label: 'Take notes on a napkin',
        outcomes: [
          {
            chance: 1,
            text: '"Learn the boring parts nobody else wants, and never eat at your desk." You keep the napkin. {mentor.first} pretends not to be touched.',
            effects: [
              { rel: 'mentor', delta: 8, memory: 'the napkin lunch' },
              { performance: 4 },
              { stat: 'discipline', delta: 3 },
            ],
            next: { eventId: 'ya2_mentor_return', inYears: [2, 3] },
          },
        ],
      },
      {
        id: 'argue',
        label: 'Politely argue each point',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.4),
            success: true,
            text: '{mentor.first} laughs for the first time in recorded office history and says you might be all right after all.',
            effects: [
              { rel: 'mentor', delta: 5, memory: 'the lunch where you argued back' },
              { stat: 'smarts', delta: 2 },
            ],
            next: { eventId: 'ya2_mentor_return', inYears: [2, 3] },
          },
          {
            chance: 0.5,
            text: '{mentor.first} pays for lunch in silence. You suspect you were the second piece of advice.',
            effects: [{ rel: 'mentor', delta: -4, memory: 'the lunch where you knew better' }],
          },
        ],
      },
      {
        id: 'phone',
        label: 'Check your phone under the table',
        outcomes: [
          {
            chance: 1,
            text: '{mentor.first} notices, finishes the soup and never offers you lunch again.',
            effects: [
              { rel: 'mentor', delta: -6, memory: 'you checking your phone at lunch' },
              { performance: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ya2_mentor_return',
    kind: 'choice',
    category: 'work',
    ages: [22, 28],
    weight: 8,
    chainOnly: true,
    when: hasJob,
    bind: { mentor: { role: 'coworker' } },
    text: '{mentor.first} is retiring. At the leaving drinks {mentor.they} hand{mentor.s} you a sealed envelope and say{mentor.s} it holds the name of the one person upstairs you must impress.',
    choices: [
      {
        id: 'open',
        label: 'Open it at once',
        outcomes: [
          {
            chance: 0.6,
            success: true,
            text: 'It names the head of facilities. You befriend her, and somehow every promotion meeting now happens in a room with working air conditioning.',
            effects: [
              { performance: 6 },
              { stat: 'happiness', delta: 4 },
              { rel: 'mentor', delta: 4, memory: 'the envelope at the leaving drinks' },
            ],
          },
          {
            chance: 0.4,
            text: 'It just says "yourself." You cannot tell whether that is profound or a dodge. {mentor.first} winks and leaves.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { rel: 'mentor', delta: 3, memory: 'the envelope that said yourself' },
            ],
          },
        ],
      },
      {
        id: 'speech',
        label: 'Give a toast to {mentor.first}',
        outcomes: [
          {
            chance: 1,
            text: 'You tell the napkin story. Half the office raises a glass and {mentor.first} has to go and look very hard at a pot plant.',
            effects: [
              { rel: 'mentor', delta: 10, memory: 'your toast at the leaving drinks' },
              { performance: 2 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ya2_parent_call',
    kind: 'notice',
    category: 'family',
    ages: [23, 29],
    weight: 5,
    cooldownYears: 8,
    bind: { mum: { role: 'mother', minAge: 45, minRelationship: 20 } },
    text: '{mum.first} rings on a weekday afternoon, which {mum.they} {mum.has} never once done, and says "nothing to worry about" twice before mentioning a scan.',
    outcomes: [
      {
        chance: 0.7,
        text: 'You drive over that evening. The results come back clear a week later. You both pretend you were not frightened.',
        effects: [
          { rel: 'mum', delta: 6, memory: 'you driving over after the scan' },
          { stat: 'stress', delta: 3 },
        ],
      },
      {
        chance: 0.3,
        text: 'It is something that needs treating. The doctors are hopeful. You start calling every Sunday without being asked.',
        effects: [
          { rel: 'mum', delta: 8, memory: 'your Sunday calls' },
          { npcStat: 'mum', stat: 'health', delta: -8 },
          { stat: 'stress', delta: 6 },
        ],
      },
    ],
  },
];
