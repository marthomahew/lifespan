import type { EventDef } from '../../engine/events/types';
import type { GameState } from '../../engine/types';
import {
  all,
  canAfford,
  canMoveAbroad,
  hasChildren,
  hasJob,
  hasPartner,
  isMarried,
  newCouple,
  single,
} from './conditions';

const partnerNoKids = (s: GameState): boolean => hasPartner(s) && !hasChildren(s);

/** The texture of adult relationships across a lifetime. Adults only, fade-to-black. */
export const ROMANCE_EVENTS_2: EventDef[] = [
  {
    id: 'rom2_first_holiday_itinerary',
    kind: 'choice',
    category: 'romance',
    adultsOnly: true,
    ages: [18, 45],
    weight: 7,
    once: true,
    when: all(hasPartner, newCouple(2)),
    bind: { love: { role: 'partner', minAge: 18 } },
    text: 'Your first holiday together. {love.first} has printed a colour-coded itinerary with a column labelled "contingency lunch". You had planned to wander.',
    choices: [
      {
        id: 'follow',
        label: 'Follow the itinerary',
        outcomes: [
          {
            chance: 0.7,
            text: 'Every museum opens exactly when promised. You admit, on day four, that contingency lunch was a triumph.',
            effects: [
              { rel: 'love', delta: 6, memory: 'the colour-coded holiday' },
              { stat: 'stress', delta: -3 },
            ],
          },
          {
            chance: 0.3,
            text: 'By the third cathedral you are walking two paces behind and sighing at fountains. The flight home is quiet.',
            effects: [
              { rel: 'love', delta: -4, memory: 'the sulk at the fountains' },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'wander',
        label: 'Bin the plan and wander',
        outcomes: [
          {
            chance: 0.5,
            text: 'You get lost, find a tiny restaurant with no menu, and eat whatever the owner decides. {love.first} calls it the best night of the trip.',
            effects: [
              { rel: 'love', delta: 7, memory: 'the restaurant with no menu' },
              { stat: 'happiness', delta: 6 },
            ],
          },
          {
            chance: 0.5,
            text: 'You spend two hours looking for a bus that stopped running in the spring. The spreadsheet is never mentioned again, pointedly.',
            effects: [
              { rel: 'love', delta: -5, memory: 'the bus that never came' },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'halves',
        label: 'Split the days: plan, wander, plan',
        outcomes: [
          {
            chance: 1,
            text: 'Alternate days work surprisingly well. You both learn something about the other, mainly how they hold a map.',
            effects: [
              { rel: 'love', delta: 4, memory: 'the alternate-day holiday' },
              { stat: 'happiness', delta: 3 },
              { money: -800 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rom2_meet_the_family',
    kind: 'choice',
    category: 'romance',
    adultsOnly: true,
    ages: [19, 50],
    weight: 6,
    once: true,
    when: all(hasPartner, newCouple(2)),
    bind: { love: { role: 'partner', minAge: 18 } },
    text: "Sunday lunch at {love.first}'s parents. There is a dog that hates you, a cousin who sells insurance, and a roast that has clearly been cooked as a test.",
    choices: [
      {
        id: 'charm',
        label: 'Compliment the roast, twice',
        outcomes: [
          {
            chance: 0.65,
            text: 'The second compliment lands. You leave with leftovers in a tub you are now obliged to return, which counts as acceptance.',
            effects: [
              { rel: 'love', delta: 6, memory: 'the Sunday roast audition' },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.35,
            text: 'You praise the gravy. The gravy was shop-bought and everyone knows it. A small chill settles over dessert.',
            effects: [
              { rel: 'love', delta: -2, memory: 'the gravy incident' },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'dog',
        label: 'Win over the dog',
        outcomes: [
          {
            chance: 0.5,
            text: 'Twenty minutes of patience and a hidden potato later, the dog sleeps on your feet. The family takes this extremely seriously.',
            effects: [
              { rel: 'love', delta: 5, memory: 'the dog that chose you' },
              { stat: 'happiness', delta: 5 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The dog takes the potato and your sock. Everyone laughs, which is better than the silence you feared.',
            effects: [{ rel: 'love', delta: 2, memory: 'the stolen sock' }],
          },
        ],
      },
      {
        id: 'politics',
        label: 'Argue with the cousin',
        outcomes: [
          {
            chance: 1,
            text: 'You are right and it does not matter. {love.first} drives home with the radio up rather loud.',
            effects: [
              { rel: 'love', delta: -6, memory: 'the row with the cousin' },
              { stat: 'stress', delta: 5 },
              { stat: 'karma', delta: -1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rom2_whose_sofa',
    kind: 'choice',
    category: 'romance',
    adultsOnly: true,
    ages: [20, 55],
    weight: 6,
    cooldownYears: 8,
    when: all(hasPartner, newCouple(4)),
    bind: { love: { role: 'partner', minAge: 18 } },
    text: "The new place has room for one sofa. Yours has a dent shaped like you; {love.first}'s is beige and smells faintly of a former flatmate.",
    choices: [
      {
        id: 'mine',
        label: 'Fight for your sofa',
        outcomes: [
          {
            chance: 0.5,
            text: 'You win on the grounds of sentiment. {love.first} sits on it like a guest for six months.',
            effects: [
              { rel: 'love', delta: -3, memory: 'the sofa you refused to give up' },
              { stat: 'happiness', delta: 3 },
            ],
          },
          {
            chance: 0.5,
            text: 'You lose on the grounds of the stain. Your sofa goes to a student who collects it in a van with no doors.',
            effects: [
              { rel: 'love', delta: 2, memory: 'the great sofa debate' },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'theirs',
        label: 'Let {love.first} keep the beige one',
        outcomes: [
          {
            chance: 1,
            text: 'A generous surrender. The beige sofa grows on you, slowly, the way moss does.',
            effects: [
              { rel: 'love', delta: 5, memory: 'the sofa you let go' },
              { stat: 'karma', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'new',
        label: 'Sell both and buy one together',
        requires: canAfford(1200),
        outcomes: [
          {
            chance: 1,
            text: 'Three weekends of showrooms and one tense debate about cushions. The result belongs to neither of you, which is the point.',
            effects: [
              { rel: 'love', delta: 7, memory: 'choosing the sofa together' },
              { money: -1200 },
              { stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rom2_offer_overseas',
    kind: 'choice',
    category: 'romance',
    adultsOnly: true,
    ages: [26, 55],
    weight: 6,
    cooldownYears: 10,
    when: hasPartner,
    bind: { love: { role: 'partner', minAge: 18 } },
    text: '{love.first} reads the email aloud twice: a two-year post in another country, the kind of offer that does not come round again. Then {love.they} look{love.s} at you and wait{love.s}.',
    choices: [
      {
        id: 'go',
        label: 'Pack up and go together',
        requires: canMoveAbroad,
        outcomes: [
          {
            chance: 1,
            text: 'You sell half your things and learn the word for "receipt" in a new language. It is hard and it is yours, together.',
            effects: [
              { rel: 'love', delta: 10, memory: 'the move abroad together' },
              { system: 'move_abroad' },
              { money: -3000 },
              { stat: 'stress', delta: 6 },
              { stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'distance',
        label: 'Try two years of distance',
        outcomes: [
          {
            chance: 1,
            text: 'Airport goodbyes, time-zone maths, and a shared playlist you both add to at strange hours. You start counting in months.',
            effects: [
              { rel: 'love', delta: 2, memory: 'the long-distance years' },
              { stat: 'stress', delta: 5 },
            ],
            next: { eventId: 'rom2_distance_reckoning', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'stay',
        label: 'Ask {love.them} to turn it down',
        outcomes: [
          {
            chance: 0.5,
            text: '{love.first} turns it down and says it is fine. It is mostly fine. It comes up in arguments for years.',
            effects: [
              { rel: 'love', delta: -8, memory: 'the job abroad you asked them to refuse' },
              { stat: 'karma', delta: -2 },
            ],
          },
          {
            chance: 0.5,
            text: '{love.first} takes the job anyway, and the relationship stays behind at the departure gate.',
            effects: [
              { rel: 'love', delta: -20, memory: 'the ultimatum before the move' },
              { status: 'breakup', with: 'love' },
              { stat: 'happiness', delta: -10 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rom2_distance_reckoning',
    kind: 'choice',
    category: 'romance',
    adultsOnly: true,
    ages: [27, 58],
    weight: 0,
    chainOnly: true,
    when: hasPartner,
    bind: { love: { role: 'partner', minAge: 18 } },
    text: 'The video call freezes mid-sentence again, on a picture of {love.first} looking tired in a kitchen you have never stood in. Something needs deciding.',
    choices: [
      {
        id: 'fly',
        label: 'Book a one-way ticket',
        requires: canAfford(1500),
        outcomes: [
          {
            chance: 1,
            text: 'You turn up with one suitcase and a jar of the good jam from home. {love.first} cries at the arrivals gate and blames the air conditioning.',
            effects: [
              { rel: 'love', delta: 12, memory: 'the one-way ticket' },
              { money: -1500 },
              { stat: 'happiness', delta: 8 },
            ],
          },
        ],
      },
      {
        id: 'hold',
        label: 'Hold on until the contract ends',
        outcomes: [
          {
            chance: 0.6,
            text: 'The countdown reaches zero. {love.first} comes home with a suntan and an accent that lasts a fortnight.',
            effects: [
              { rel: 'love', delta: 8, memory: 'the countdown home' },
              { stat: 'stress', delta: -5 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: '{love.first} renews the contract without asking. The calls get shorter until, one Sunday, neither of you rings.',
            effects: [
              { rel: 'love', delta: -15, memory: 'the calls that stopped' },
              { status: 'breakup', with: 'love' },
              { stat: 'happiness', delta: -8 },
            ],
          },
        ],
      },
      {
        id: 'end',
        label: 'Admit it is not working',
        outcomes: [
          {
            chance: 1,
            text: 'The honest conversation is the kindest one you have had in months. You both cry, then talk about the weather for a while.',
            effects: [
              { rel: 'love', delta: -5, memory: 'the honest goodbye' },
              { status: 'breakup', with: 'love' },
              { stat: 'stress', delta: -4 },
              { stat: 'happiness', delta: -6 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rom2_saver_spender',
    kind: 'choice',
    category: 'romance',
    adultsOnly: true,
    ages: [22, 60],
    weight: 6,
    cooldownYears: 7,
    when: hasPartner,
    bind: { love: { role: 'partner', minAge: 18 } },
    text: 'A parcel arrives: an espresso machine the size of a small car. {love.first} bought it on a whim. You have a spreadsheet tracking the price of butter.',
    choices: [
      {
        id: 'budget',
        label: 'Propose a joint budget',
        outcomes: [
          {
            chance: 0.6,
            text: 'Three evenings with a calculator, then a deal: a shared pot, and each of you gets guilt-free money. The coffee is, admittedly, very good.',
            effects: [
              { rel: 'love', delta: 5, memory: 'the budget summit' },
              { money: 600 },
              { stat: 'stress', delta: -3 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: '{love.first} hears "budget" as "lecture". The machine stays. So does the tension.',
            effects: [
              { rel: 'love', delta: -5, memory: 'the espresso machine row' },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'return',
        label: 'Insist it goes back',
        outcomes: [
          {
            chance: 1,
            text: 'The refund arrives. {love.first} drinks instant coffee with exaggerated, silent suffering for a month.',
            effects: [
              { rel: 'love', delta: -6, memory: 'sending the coffee machine back' },
              { money: 400 },
            ],
          },
        ],
      },
      {
        id: 'loosen',
        label: 'Loosen up and enjoy it',
        outcomes: [
          {
            chance: 1,
            text: 'You learn to froth milk and stop checking the butter. Your savings notice before you do.',
            effects: [
              { rel: 'love', delta: 6, memory: 'the morning coffee ritual' },
              { stat: 'happiness', delta: 4 },
              { money: -500 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rom2_they_forgot',
    kind: 'choice',
    category: 'romance',
    adultsOnly: true,
    ages: [25, 65],
    weight: 6,
    cooldownYears: 8,
    when: isMarried,
    bind: { love: { role: 'spouse', minAge: 18 } },
    text: 'You booked the table, wore the good shirt, and wrapped a gift. {love.first} comes home, kicks off {love.their} shoes, and asks what is for dinner.',
    choices: [
      {
        id: 'reveal',
        label: 'Hand over the gift and say nothing',
        outcomes: [
          {
            chance: 1,
            text: "The slow dawn of realisation on {love.first}'s face is worth more than the dinner. You will be getting breakfast in bed for a year.",
            effects: [
              { rel: 'love', delta: 6, memory: 'the anniversary they forgot' },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'sulk',
        label: 'Go quiet and wait to be asked',
        outcomes: [
          {
            chance: 1,
            text: 'Nobody asks. You eat toast in silence and the restaurant charges you for the no-show.',
            effects: [
              { rel: 'love', delta: -5, memory: 'the silent anniversary' },
              { money: -60 },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'laugh',
        label: 'Laugh and drag them out anyway',
        outcomes: [
          {
            chance: 1,
            text: 'You make it with two minutes to spare, {love.first} in odd socks. The waiter thinks you are newlyweds.',
            effects: [
              { rel: 'love', delta: 8, memory: 'the odd-socks anniversary dinner' },
              { stat: 'happiness', delta: 6 },
              { money: -150 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rom2_old_friend_jealousy',
    kind: 'choice',
    category: 'romance',
    adultsOnly: true,
    ages: [20, 60],
    weight: 6,
    cooldownYears: 6,
    when: hasPartner,
    bind: { love: { role: 'partner', minAge: 18 } },
    text: '{love.first} has an old friend from school who texts constantly, laughs at every joke, and calls {love.them} by a nickname you are not allowed to use.',
    choices: [
      {
        id: 'raise',
        label: 'Say calmly that it bothers you',
        outcomes: [
          {
            chance: 0.65,
            text: '{love.first} listens properly, then introduces you. The friend turns out to be married, nervous, and keen to like you.',
            effects: [
              { rel: 'love', delta: 6, memory: 'the talk about the old friend' },
              { stat: 'stress', delta: -4 },
            ],
            success: true,
          },
          {
            chance: 0.35,
            text: 'It comes out sharper than you meant. {love.first} says you are being ridiculous, and it hangs in the air all weekend.',
            effects: [
              { rel: 'love', delta: -4, memory: 'the jealous weekend' },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'snoop',
        label: 'Read the messages when they shower',
        outcomes: [
          {
            chance: 0.5,
            text: 'The messages are entirely about a television quiz. You feel ashamed for days, and rightly.',
            effects: [
              { stat: 'karma', delta: -5 },
              { stat: 'happiness', delta: -3 },
            ],
          },
          {
            chance: 0.5,
            text: '{love.first} comes back early and sees the phone in your hand. Trust, it turns out, takes longer to dry than hair.',
            effects: [
              { rel: 'love', delta: -14, memory: 'the time you read their messages' },
              { stat: 'karma', delta: -4 },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'befriend',
        label: 'Invite the friend round for dinner',
        outcomes: [
          {
            chance: 1,
            text: 'By dessert the friend is telling stories about {love.first} at fifteen. You have ammunition for life and nothing left to resent.',
            effects: [
              { rel: 'love', delta: 5, memory: 'the dinner with the old friend' },
              { stat: 'happiness', delta: 4 },
              { stat: 'karma', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rom2_children_question',
    kind: 'choice',
    category: 'romance',
    adultsOnly: true,
    ages: [25, 44],
    weight: 6,
    once: true,
    when: partnerNoKids,
    bind: { love: { role: 'partner', minAge: 18 } },
    text: 'Walking past a playground, {love.first} goes quiet, then asks the question you have both been stepping around: children, or not?',
    choices: [
      {
        id: 'want',
        label: 'Say you want them',
        outcomes: [
          {
            chance: 0.6,
            text: '{love.first} exhales and grins. You spend the rest of the walk arguing happily about names neither of you will use.',
            effects: [
              { rel: 'love', delta: 8, memory: 'the playground conversation' },
              { flag: 'wants_children' },
              { stat: 'happiness', delta: 5 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: '{love.first} does not want them, and has known for a long time. There is no villain here, only two honest answers that do not fit.',
            effects: [
              { rel: 'love', delta: -10, memory: 'the answer that did not match' },
              { status: 'breakup', with: 'love' },
              { stat: 'happiness', delta: -8 },
            ],
          },
        ],
      },
      {
        id: 'dont',
        label: 'Say you would rather not',
        outcomes: [
          {
            chance: 0.6,
            text: 'Relief all round. You agree on a life of lie-ins, spontaneous trips and, possibly, a very spoilt cat.',
            effects: [
              { rel: 'love', delta: 8, memory: 'choosing a child-free life together' },
              { flag: 'child_free' },
              { stat: 'stress', delta: -4 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: '{love.first} wanted them very much. You both try to bend and neither can, and you part with more love than anger.',
            effects: [
              { rel: 'love', delta: -10, memory: 'the playground walk that ended things' },
              { status: 'breakup', with: 'love' },
              { stat: 'happiness', delta: -8 },
            ],
          },
        ],
      },
      {
        id: 'unsure',
        label: 'Admit you do not know yet',
        outcomes: [
          {
            chance: 1,
            text: '{love.first} says that is a fair answer and a temporary one. You agree to talk again in a year, and both quietly mark the calendar.',
            effects: [
              { rel: 'love', delta: 2, memory: 'agreeing to decide later' },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rom2_quiet_companionship',
    kind: 'notice',
    category: 'romance',
    adultsOnly: true,
    ages: [60, 99],
    weight: 6,
    cooldownYears: 6,
    when: isMarried,
    bind: { love: { role: 'spouse', minAge: 18, hasMemory: true } },
    text: 'A wet afternoon. You do the crossword and {love.first} reads, feet tucked under your leg, and neither of you says a word for an hour.',
    outcomes: [
      {
        chance: 0.6,
        text: 'At some point {love.first} fills in seven across without looking up, then mentions {love.memory} and laughs at nothing in particular.',
        effects: [
          { rel: 'love', delta: 4, memory: 'the quiet crossword afternoons' },
          { stat: 'happiness', delta: 5 },
          { stat: 'stress', delta: -4 },
        ],
      },
      {
        chance: 0.4,
        text: 'When the rain stops, you both reach for the kettle at exactly the same moment. Decades of practice.',
        effects: [
          { rel: 'love', delta: 3, memory: 'the synchronised kettle' },
          { stat: 'happiness', delta: 4 },
        ],
      },
    ],
  },
  {
    id: 'rom2_renew_vows',
    kind: 'choice',
    category: 'romance',
    adultsOnly: true,
    ages: [45, 84],
    weight: 5,
    once: true,
    when: isMarried,
    bind: { love: { role: 'spouse', minAge: 18, hasMemory: true } },
    text: 'Over breakfast {love.first} says, out of nowhere, that {love.they} would marry you again tomorrow. Then {love.they} bring{love.s} up {love.memory}, which nearly changes {love.their} mind.',
    choices: [
      {
        id: 'party',
        label: 'Renew your vows with a party',
        requires: canAfford(4000),
        outcomes: [
          {
            chance: 1,
            text: 'A garden, sixty guests, and vows rewritten with better jokes. Someone films the speech; you watch it every year after.',
            effects: [
              { rel: 'love', delta: 12, memory: 'the vow renewal in the garden' },
              { money: -4000 },
              { stat: 'happiness', delta: 10 },
            ],
          },
        ],
      },
      {
        id: 'quiet',
        label: 'Just the two of you, on a hill',
        outcomes: [
          {
            chance: 1,
            text: 'You walk up the hill where you had your first long talk and say the words again to nobody but each other and a sheep.',
            effects: [
              { rel: 'love', delta: 10, memory: 'the vows on the hill' },
              { stat: 'happiness', delta: 7 },
              { stat: 'stress', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'joke',
        label: 'Say once was plenty, thanks',
        outcomes: [
          {
            chance: 1,
            text: '{love.first} laughs, but files it away. You find out how far away at your next birthday.',
            effects: [{ rel: 'love', delta: -3, memory: 'the vow renewal you laughed off' }],
          },
        ],
      },
    ],
  },
  {
    id: 'rom2_caring_for_partner',
    kind: 'choice',
    category: 'romance',
    adultsOnly: true,
    ages: [40, 79],
    weight: 5,
    cooldownYears: 10,
    when: isMarried,
    bind: { love: { role: 'spouse', minAge: 18 } },
    text: "{love.first}'s diagnosis means months of treatment. The appointments, the medication, the bad days: someone has to hold all of it.",
    choices: [
      {
        id: 'leave',
        label: 'Take leave and care for them yourself',
        requires: hasJob,
        outcomes: [
          {
            chance: 1,
            text: 'You learn the names of every nurse and every side effect. It is exhausting, and {love.first} is never alone for a single appointment.',
            effects: [
              { rel: 'love', delta: 12, memory: 'how you cared for them when they were ill' },
              { money: -3000 },
              { stat: 'stress', delta: 10 },
              { stat: 'karma', delta: 5 },
            ],
            next: { eventId: 'rom2_after_treatment', inYears: [1, 2] },
          },
        ],
      },
      {
        id: 'help',
        label: 'Pay for help at home',
        requires: canAfford(6000),
        outcomes: [
          {
            chance: 1,
            text: 'A carer comes three days a week. You keep working and spend the evenings at the bedside, reading aloud.',
            effects: [
              { rel: 'love', delta: 7, memory: 'the evenings you read to them' },
              { money: -6000 },
              { stat: 'stress', delta: 5 },
            ],
            next: { eventId: 'rom2_after_treatment', inYears: [1, 2] },
          },
        ],
      },
      {
        id: 'juggle',
        label: 'Juggle everything alone',
        outcomes: [
          {
            chance: 1,
            text: 'You keep it all going on four hours of sleep. Some days you get it wrong. {love.first} notices how hard you are trying.',
            effects: [
              { rel: 'love', delta: 6, memory: 'the year you held everything together' },
              { stat: 'stress', delta: 14 },
              { stat: 'health', delta: -4 },
            ],
            next: { eventId: 'rom2_after_treatment', inYears: [1, 2] },
          },
        ],
      },
    ],
  },
  {
    id: 'rom2_after_treatment',
    kind: 'notice',
    category: 'romance',
    adultsOnly: true,
    ages: [41, 82],
    weight: 0,
    chainOnly: true,
    when: isMarried,
    bind: { love: { role: 'spouse', minAge: 18 } },
    text: 'The last round of treatment ends.',
    outcomes: [
      {
        chance: 0.65,
        text: 'The scan is clear. {love.first} insists on walking home from the hospital, slowly, stopping to look at every tree.',
        effects: [
          { rel: 'love', delta: 6, memory: 'the walk home after the clear scan' },
          { npcStat: 'love', stat: 'health', delta: 15 },
          { stat: 'happiness', delta: 10 },
          { stat: 'stress', delta: -8 },
        ],
      },
      {
        chance: 0.35,
        text: 'The doctors call it manageable rather than gone. You buy a bigger calendar and learn to plan in good weeks.',
        effects: [
          { rel: 'love', delta: 4, memory: 'learning to live in good weeks' },
          { npcStat: 'love', stat: 'health', delta: -5 },
          { stat: 'stress', delta: 4 },
        ],
      },
    ],
  },
  {
    id: 'rom2_dating_again_later',
    kind: 'choice',
    category: 'romance',
    adultsOnly: true,
    ages: [40, 79],
    weight: 6,
    cooldownYears: 6,
    when: single,
    bind: { pal: { role: 'friend', minAge: 18, minRelationship: 30 } },
    text: 'It has been a long time since you were on your own; the last time you dated, people phoned each other. {pal.first} says it is time, and has already picked someone.',
    choices: [
      {
        id: 'app',
        label: 'Make a profile, honestly',
        outcomes: [
          {
            chance: 0.55,
            text: 'Your profile admits you garden badly and cry at adverts. Someone writes back: "Same. Coffee?" It goes well.',
            effects: [{ status: 'meet' }, { stat: 'happiness', delta: 7 }],
            success: true,
          },
          {
            chance: 0.45,
            text: 'Three dates: one talks only about a boat, one is late, one is lovely and moving to Spain. Still, you got out of the house.',
            effects: [
              { stat: 'happiness', delta: 1 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'blind',
        label: 'Let {pal.first} set up a blind date',
        outcomes: [
          {
            chance: 0.5,
            text: 'You were told to wear blue and not mention fish. Your date is also in blue, under orders. You both blame {pal.first} and order dessert.',
            effects: [
              { status: 'meet' },
              { rel: 'pal', delta: 6, memory: 'the blind date that worked' },
              { stat: 'happiness', delta: 7 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'Your date talks about fish for ninety minutes. You now understand the warning and none of the logic behind the match.',
            effects: [
              { rel: 'pal', delta: -2, memory: 'the fish date' },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'not_yet',
        label: 'Say you are not ready',
        outcomes: [
          {
            chance: 1,
            text: 'You decide your own company is decent company for now. {pal.first} drops it, for a whole month.',
            effects: [{ stat: 'stress', delta: -3 }],
          },
        ],
      },
    ],
  },
];
