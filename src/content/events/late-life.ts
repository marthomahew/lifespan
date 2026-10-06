import type { EventDef } from '../../engine/events/types';
import type { GameState } from '../../engine/types';
import { canAfford, ownsHome, oddsBy } from './conditions';

const retired = (s: GameState): boolean => s.career.retired;

/** Late life (58–100): grandchildren, retirement, old friends, and one last adventure. */
export const LATE_LIFE_EVENTS: EventDef[] = [
  {
    id: 'late_grandkid_lesson',
    kind: 'choice',
    category: 'family',
    ages: [60, 90],
    weight: 9,
    once: true,
    bind: { kid: { role: 'grandchild', minAge: 7, maxAge: 16 } },
    text: "{kid.first} watches you work with the attention normally reserved for screens, then asks if you'll show {kid.them} how.",
    choices: [
      {
        id: 'cook',
        label: 'Teach the family stew, no recipe card',
        outcomes: [
          {
            chance: 1,
            text: 'You measure nothing and narrate everything. {kid.first} writes it all down anyway, including the bit where you swear at the onions.',
            effects: [
              { skill: 'cooking', delta: 3 },
              { stat: 'happiness', delta: 6 },
              { rel: 'kid', delta: 10, memory: 'the stew lessons with no measurements' },
            ],
          },
        ],
      },
      {
        id: 'cards',
        label: 'Teach the card game you always win',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.5),
            text: 'By the third evening {kid.first} is counting cards and beats you fair and square. You have never been prouder to lose money in matchsticks.',
            effects: [
              { stat: 'smarts', delta: 3 },
              { rel: 'kid', delta: 9, memory: 'the matchstick card tournaments' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The rules turn out to be more family folklore than game. {kid.first} declares several of them made up, which they are.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { rel: 'kid', delta: 5, memory: 'your suspicious card rules' },
            ],
          },
        ],
      },
      {
        id: 'later',
        label: 'Say "another time" and finish it yourself',
        outcomes: [
          {
            chance: 1,
            text: 'It gets done faster and less well. {kid.first} drifts off to the sofa, and another time does not come round for a while.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { rel: 'kid', delta: -4, memory: 'the afternoon you were too busy' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'late_babysit_chaos',
    kind: 'choice',
    category: 'family',
    ages: [58, 85],
    weight: 8,
    cooldownYears: 6,
    bind: { kid: { role: 'grandchild', minAge: 2, maxAge: 7 } },
    text: 'You agree to mind {kid.first} for one evening. Within forty minutes there is glitter in the fridge and a solemn announcement that the cat is now a dinosaur.',
    choices: [
      {
        id: 'join',
        label: 'Become a dinosaur as well',
        outcomes: [
          {
            chance: 1,
            text: 'You stomp round the living room until your knees object. {kid.first} falls asleep mid-roar, and so, nearly, do you.',
            effects: [
              { stat: 'happiness', delta: 7 },
              { stat: 'health', delta: 1 },
              { rel: 'kid', delta: 8, memory: 'the night you were both dinosaurs' },
            ],
          },
        ],
      },
      {
        id: 'rules',
        label: 'Restore order with bath and bedtime',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.5),
            text: 'Bath, story, lights out, all by eight. The parents come home to a silent house and look at you as if you are a wizard.',
            effects: [
              { stat: 'stress', delta: -2 },
              { rel: 'kid', delta: 3, memory: 'your military bedtime' },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'Bedtime becomes a two-hour negotiation. You concede a glass of water, three stories and a ruling that the cat may stay a dinosaur.',
            effects: [
              { stat: 'stress', delta: 4 },
              { rel: 'kid', delta: 4, memory: 'the bedtime negotiations' },
            ],
          },
        ],
      },
      {
        id: 'telly',
        label: 'Put a film on and sit very still',
        outcomes: [
          {
            chance: 1,
            text: 'The film is about singing vegetables. You watch it twice and find yourself humming the turnip song for a fortnight.',
            effects: [
              { stat: 'stress', delta: -1 },
              { rel: 'kid', delta: 2, memory: 'the singing vegetable film' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'late_grandkid_old_days',
    kind: 'choice',
    category: 'family',
    ages: [62, 95],
    weight: 9,
    once: true,
    bind: { kid: { role: 'grandchild', minAge: 8, maxAge: 17 } },
    text: '{kid.first} arrives with a school project titled "Life Long Ago" and a list of questions. The first one is whether you had electricity.',
    choices: [
      {
        id: 'truth',
        label: 'Answer honestly, the boring bits too',
        outcomes: [
          {
            chance: 1,
            text: 'You talk about the bus fares, the rationed hot water and the first time you saw the sea. {kid.first} gets top marks and quotes you in assembly.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'smarts', delta: 1 },
              { rel: 'kid', delta: 9, memory: 'your interview for the school project' },
            ],
          },
        ],
      },
      {
        id: 'legend',
        label: 'Tell it the way it should have happened',
        outcomes: [
          {
            chance: 0.6,
            text: 'The teacher writes "Wonderful, if unlikely" beside the part where you crossed a frozen lake on a bicycle. {kid.first} believes every word.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'karma', delta: -1 },
              { rel: 'kid', delta: 7, memory: 'the frozen lake story' },
            ],
          },
          {
            chance: 0.4,
            text: "{kid.first}'s parent reads the project and phones you to ask, carefully, about the wolves.",
            effects: [
              { stat: 'happiness', delta: 2 },
              { rel: 'kid', delta: 4, memory: 'the wolves you invented' },
            ],
          },
        ],
      },
      {
        id: 'show',
        label: 'Get the shoebox of old photographs out',
        outcomes: [
          {
            chance: 1,
            text: 'Faces you have not thought of in years tumble onto the carpet. {kid.first} insists on a name for every one, and you find you still know most.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'stress', delta: -2 },
              { rel: 'kid', delta: 8, memory: 'the afternoon with the shoebox photos' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'late_grandkid_stays',
    kind: 'choice',
    category: 'family',
    ages: [65, 95],
    weight: 8,
    once: true,
    bind: { kid: { role: 'grandchild', minAge: 15, maxAge: 18 } },
    text: '{kid.first} turns up at your door at ten at night with a rucksack and a jaw set exactly like yours. There has been a row at home, and {kid.they} {kid.is} not going back tonight.',
    choices: [
      {
        id: 'take_in',
        label: 'Make up the spare bed, no questions yet',
        outcomes: [
          {
            chance: 1,
            text: 'Tonight becomes a month. {kid.first} does homework at your kitchen table, eats like a horse and slowly starts talking.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'stress', delta: 3 },
              { money: -400 },
              { rel: 'kid', delta: 14, memory: 'the month in your spare room' },
            ],
            next: { eventId: 'late_grandkid_graduation', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'mediate',
        label: 'Let them stay, then broker a peace',
        outcomes: [
          {
            chance: oddsBy('karma', 0.5),
            text: 'A week of phone calls and one tense Sunday lunch later, {kid.first} goes home. Everyone agrees, grudgingly, that you were right.',
            effects: [
              { stat: 'karma', delta: 4 },
              { stat: 'stress', delta: 2 },
              { rel: 'kid', delta: 9, memory: 'the peace talks at your table' },
            ],
            next: { eventId: 'late_grandkid_graduation', inYears: [1, 3] },
            success: true,
          },
          {
            chance: 0.4,
            text: 'Both sides decide you have taken the other one in. The lunch ends early and the gravy goes cold, but {kid.first} knows you tried.',
            effects: [
              { stat: 'stress', delta: 5 },
              { rel: 'kid', delta: 4, memory: 'the Sunday lunch that went wrong' },
            ],
          },
        ],
      },
      {
        id: 'send_home',
        label: 'Drive them home and stay for the row',
        outcomes: [
          {
            chance: 1,
            text: 'You sit in the middle of it like a referee in slippers. Nothing is settled, but nobody storms off again that year.',
            effects: [
              { stat: 'stress', delta: 4 },
              { rel: 'kid', delta: -3, memory: 'the night you drove them back' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'late_grandkid_graduation',
    kind: 'choice',
    category: 'family',
    ages: [66, 100],
    weight: 10,
    chainOnly: true,
    bind: { kid: { role: 'grandchild' } },
    text: 'An invitation comes with a note in a familiar scrawl: {kid.first} is graduating, and {kid.they} want{kid.s} you in the front row, since you are "basically the reason."',
    choices: [
      {
        id: 'go',
        label: 'Go, in your best coat',
        outcomes: [
          {
            chance: 1,
            text: 'When {kid.first} crosses the stage {kid.they} look{kid.s} straight at you. You clap until your hands sting and pretend the wind made your eyes water.',
            effects: [
              { stat: 'happiness', delta: 10 },
              { rel: 'kid', delta: 10, memory: 'you in the front row at graduation' },
            ],
          },
        ],
      },
      {
        id: 'gift',
        label: 'Go, and slip an envelope into their hand',
        requires: canAfford(1500),
        outcomes: [
          {
            chance: 1,
            text: '{kid.first} opens it later and calls you, a little choked, to say it covers the deposit on a first flat. You say it is only money, which is half true.',
            effects: [
              { money: -1500 },
              { stat: 'happiness', delta: 8 },
              { stat: 'karma', delta: 3 },
              { rel: 'kid', delta: 12, memory: 'the envelope at graduation' },
            ],
          },
        ],
      },
      {
        id: 'speech',
        label: 'Offer a few words at the family dinner',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.55),
            text: 'You keep it to two minutes and mention the spare bed only once. There is not a dry eye at the table, including the waiter.',
            effects: [
              { stat: 'happiness', delta: 8 },
              { rel: 'kid', delta: 9, memory: 'your speech at the graduation dinner' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The two minutes become fifteen and acquire a section on the price of bread. {kid.first} rescues you with a hug that doubles as a hook.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { rel: 'kid', delta: 5, memory: 'the very long graduation speech' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'late_first_monday',
    kind: 'choice',
    category: 'work',
    ages: [58, 80],
    weight: 10,
    once: true,
    when: retired,
    text: 'The first Monday of retirement. You wake at the old time out of habit, make coffee, and realise there is nowhere at all you need to be.',
    choices: [
      {
        id: 'bed',
        label: 'Go back to bed on principle',
        outcomes: [
          {
            chance: 1,
            text: 'You sleep until ten and eat breakfast in the garden in your dressing gown. The neighbour waves. You wave back like royalty.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: -6 },
            ],
          },
        ],
      },
      {
        id: 'list',
        label: 'Write a list of everything you never had time for',
        outcomes: [
          {
            chance: 1,
            text: 'The list runs to three pages and includes "learn Portuguese" and "finally fix the shed door." By lunchtime you have done neither and feel great.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'restless',
        label: 'Drive past the old workplace, just to look',
        outcomes: [
          {
            chance: 1,
            text: 'The car park is full and the building carries on exactly as before. It stings for a minute, then feels oddly like being let off.',
            effects: [
              { stat: 'happiness', delta: 1 },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'late_hobby_obsession',
    kind: 'choice',
    category: 'random',
    ages: [60, 85],
    weight: 9,
    once: true,
    when: retired,
    text: 'A model railway kit bought "to pass the odd afternoon" now occupies the whole spare room. You have strong opinions about the scale of the sheep.',
    choices: [
      {
        id: 'expand',
        label: 'Extend the line into the hallway',
        requires: canAfford(1500),
        outcomes: [
          {
            chance: 1,
            text: 'Track goes under the door and along the skirting. Visitors must step over a viaduct to reach the bathroom, and you would not have it otherwise.',
            effects: [
              { money: -1500 },
              { stat: 'happiness', delta: 8 },
              { skill: 'art', delta: 3 },
              { flag: 'late_railway' },
            ],
            next: { eventId: 'late_hobby_show', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'club',
        label: 'Join the model railway society',
        outcomes: [
          {
            chance: 1,
            text: 'The society meets in a church hall and argues for an hour about signal boxes. You fit in alarmingly fast and make a friend called Ossie.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { status: 'friend', first: 'Ossie', gender: 'male' },
              { flag: 'late_railway' },
            ],
            next: { eventId: 'late_hobby_show', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'limit',
        label: 'Agree to keep it to one table',
        outcomes: [
          {
            chance: 1,
            text: 'One table it is, densely populated. A tiny village grows on it with a post office, a pub and a scandal you invent for each figure.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'late_hobby_show',
    kind: 'choice',
    category: 'random',
    ages: [61, 95],
    weight: 10,
    chainOnly: true,
    text: 'The regional model railway exhibition has accepted your layout. It must be dismantled, carried to a sports hall in labelled crates and rebuilt by Saturday morning.',
    choices: [
      {
        id: 'show',
        label: 'Run it yourself, all weekend',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.5),
            text: 'Not one derailment in two days. A judge in a fleece crouches by your level crossing for ten minutes, then hands you a rosette without a word.',
            effects: [
              { stat: 'happiness', delta: 10 },
              { stat: 'stress', delta: 2 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The express jumps the points in front of a coach party. You fix it with a hairgrip to applause, and that, somehow, is the highlight of the show.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'children',
        label: 'Let visiting children drive the trains',
        outcomes: [
          {
            chance: 1,
            text: 'Chaos, collisions and a queue round the hall. You win no rosette but get the most votes for "Layout Everyone Liked."',
            effects: [
              { stat: 'happiness', delta: 8 },
              { stat: 'karma', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'withdraw',
        label: 'Pull out: it is too fragile to move',
        outcomes: [
          {
            chance: 1,
            text: 'The layout stays home, safe and unseen. You visit the exhibition as a punter and spend the whole time thinking yours was better.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'late_consultant',
    kind: 'choice',
    category: 'work',
    ages: [60, 78],
    weight: 8,
    once: true,
    when: retired,
    text: 'Your old employer calls. The system you built, the one everyone said was obsolete, has broken, and the only person who understands it is you. They mention a day rate.',
    choices: [
      {
        id: 'accept',
        label: 'Name a ridiculous fee and accept',
        outcomes: [
          {
            chance: 1,
            text: 'They agree without blinking. You fix it in two days, leave a handwritten manual nobody will read, and spend the fee on something pointless and lovely.',
            effects: [
              { money: 6000 },
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'mentor',
        label: 'Train a young replacement instead',
        outcomes: [
          {
            chance: 1,
            text: 'Her name is Priyanka and she is quicker than you ever were. You leave feeling less like a relic and more like a foundation.',
            effects: [
              { money: 2500 },
              { stat: 'karma', delta: 4 },
              { stat: 'happiness', delta: 4 },
              { status: 'friend' },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: "Tell them you're busy (you are not)",
        outcomes: [
          {
            chance: 1,
            text: 'You hang up and go back to the crossword. It is the most satisfying clue you solve all week.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'stress', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'late_volunteer',
    kind: 'choice',
    category: 'social',
    ages: [60, 90],
    weight: 8,
    cooldownYears: 8,
    when: retired,
    text: 'A handwritten notice in the library window asks for volunteers. Three causes are listed, and the pen ran out halfway through the third.',
    choices: [
      {
        id: 'reading',
        label: 'Listen to children read at the primary school',
        outcomes: [
          {
            chance: 1,
            text: 'Every Wednesday a small person reads you a story about a sad horse, very slowly. You look forward to it more than almost anything.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'karma', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'pantry',
        label: 'Sort tins at the food pantry',
        outcomes: [
          {
            chance: 1,
            text: 'You reorganise the shelves by expiry date and tin height. A fellow volunteer called Nell calls you "the general" and becomes a firm friend.',
            effects: [
              { stat: 'karma', delta: 6 },
              { stat: 'discipline', delta: 2 },
              { status: 'friend', first: 'Nell', gender: 'female' },
            ],
          },
        ],
      },
      {
        id: 'museum',
        label: 'Guide tours at the local museum',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.55),
            text: 'You learn the history of every exhibit and invent nothing. School groups ask for you by name, which the other guides find hard.',
            effects: [
              { stat: 'smarts', delta: 4 },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'A visitor corrects you about a Roman spoon in front of twenty people. You go home and read about spoons until midnight.',
            effects: [
              { stat: 'smarts', delta: 3 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'late_reunion',
    fromYear: 2008,
    kind: 'choice',
    category: 'social',
    ages: [60, 85],
    weight: 9,
    once: true,
    text: 'An invitation to your fifty-year class reunion arrives, with a list of who is coming. Half the names are married names you cannot decode.',
    choices: [
      {
        id: 'go',
        label: 'Go and wear a name badge proudly',
        outcomes: [
          {
            chance: 1,
            text: 'The boy who stole your lunch every Tuesday is now a gentle grandfather who apologises at once. You end the night swapping numbers like teenagers.',
            effects: [{ stat: 'happiness', delta: 8 }, { status: 'friend' }],
          },
        ],
      },
      {
        id: 'organise',
        label: 'Offer to organise the slideshow',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.5),
            text: 'Fifty years of photographs, set to music. When the old school hall appears on screen the whole room goes quiet, then cheers.',
            effects: [
              { stat: 'happiness', delta: 7 },
              { stat: 'karma', delta: 3 },
              { stat: 'stress', delta: 2 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The projector shows everything upside down for twenty minutes. People like it better that way, frankly.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'skip',
        label: 'Stay home and remember them as they were',
        outcomes: [
          {
            chance: 1,
            text: 'Photos of the evening turn up online. Everyone looks older and happier than you expected, and you wish, briefly, that you had gone.',
            effects: [{ stat: 'happiness', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'late_memoir',
    kind: 'choice',
    category: 'random',
    ages: [65, 95],
    weight: 8,
    once: true,
    text: 'Clearing a cupboard, you find the photo albums, forty years of them, with labels in three different hands. Somebody ought to write down who all these people were.',
    choices: [
      {
        id: 'write',
        label: 'Start writing it all down',
        outcomes: [
          {
            chance: 1,
            text: 'Each photograph unlocks a page. Within a year there are two hundred of them, and the chapter about your first job makes you laugh out loud.',
            effects: [
              { skill: 'writing', delta: 5 },
              { stat: 'happiness', delta: 6 },
              { stat: 'smarts', delta: 2 },
              { flag: 'memoir' },
            ],
          },
        ],
      },
      {
        id: 'record',
        label: 'Record yourself talking through each album',
        outcomes: [
          {
            chance: 1,
            text: 'Hours of your voice saying "and this one, oh, this one." It is rambling and warm and the family will treasure it far more than they let on.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'stress', delta: -2 },
              { flag: 'memoir' },
            ],
          },
        ],
      },
      {
        id: 'box',
        label: 'Put the albums back for another rainy day',
        outcomes: [
          {
            chance: 1,
            text: 'You close the cupboard on everyone gently. One loose photo stays out on the mantelpiece: you, aged nine, missing a tooth and very pleased about it.',
            effects: [{ stat: 'happiness', delta: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'late_old_flame_parcel',
    kind: 'choice',
    category: 'social',
    ages: [60, 90],
    weight: 7,
    once: true,
    bind: { flame: { role: 'ex', minAge: 55 } },
    text: 'A small parcel arrives from {flame.full}. Inside is a scarf you left in {flame.their} car more than forty years ago, folded neatly, and a note that says only: "Thought it was time."',
    choices: [
      {
        id: 'write',
        label: 'Write back, properly',
        outcomes: [
          {
            chance: 1,
            text: 'You write six pages and post them before you can lose your nerve. The reply is warm, funny and mostly about {flame.their} allotment.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { rel: 'flame', delta: 12, memory: 'the scarf you finally got back' },
            ],
          },
        ],
      },
      {
        id: 'return',
        label: 'Post back the book they lent you in return',
        outcomes: [
          {
            chance: 1,
            text: 'The book still has {flame.their} bus ticket in it as a bookmark. A postcard comes back: "So THAT is where it went." The debt is settled.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'karma', delta: 2 },
              { rel: 'flame', delta: 8, memory: 'the book swap forty years late' },
            ],
          },
        ],
      },
      {
        id: 'wear',
        label: 'Just wear the scarf, and say nothing',
        outcomes: [
          {
            chance: 1,
            text: 'It still smells faintly of a car you have not sat in since you were young. You wear it all winter and keep your thoughts to yourself.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { rel: 'flame', delta: 2, memory: 'the scarf in the parcel' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'late_friend_funeral',
    kind: 'choice',
    category: 'social',
    ages: [68, 95],
    weight: 7,
    once: true,
    bind: { pal: { role: 'friend', minAge: 65, minRelationship: 50 } },
    text: "{pal.full}'s family phones with the news. {pal.They} died in {pal.their} sleep, and they would like you to say something at the funeral.",
    choices: [
      {
        id: 'speak',
        label: 'Speak at the funeral',
        outcomes: [
          {
            chance: 1,
            text: 'You tell one true story and stop before your voice gives out. Afterwards a stranger takes your hand and says it was exactly {pal.first}.',
            effects: [
              { status: 'npc_dies', with: 'pal' },
              { stat: 'happiness', delta: -6 },
              { stat: 'karma', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'listen',
        label: 'Ask to sit with the family instead',
        outcomes: [
          {
            chance: 1,
            text: 'You sit in the second row beside people you have known for decades. Nobody says much, and nobody needs to.',
            effects: [
              { status: 'npc_dies', with: 'pal' },
              { stat: 'happiness', delta: -7 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'late_new_hip',
    kind: 'choice',
    category: 'health',
    ages: [65, 90],
    weight: 8,
    once: true,
    text: 'Your new hip is titanium, apparently, and the surgeon seems very pleased with it. The physio hands you a sheet of exercises and a look that says she has heard every excuse.',
    choices: [
      {
        id: 'diligent',
        label: 'Do every exercise, twice a day',
        outcomes: [
          {
            chance: 1,
            text: 'Six weeks later you walk to the shops without the stick. The physio says you are her best patient and you choose to believe she means it.',
            effects: [
              { stat: 'health', delta: 6 },
              { stat: 'discipline', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'rush',
        label: 'Get back on the dance floor early',
        outcomes: [
          {
            chance: oddsBy('health', 0.45),
            text: "You manage a careful waltz at a cousin's party and nothing goes wrong. The room applauds the hip as much as you.",
            effects: [
              { stat: 'happiness', delta: 7 },
              { stat: 'health', delta: 2 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'One spin too many. Nothing breaks, but you spend a month back on the stick being told off by everyone who loves you.',
            effects: [{ injury: 6 }, { stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'airport',
        label: 'Look forward to setting off the airport scanner',
        outcomes: [
          {
            chance: 1,
            text: 'You start planning a trip purely to beep at security. Recovery goes steadily, powered largely by that one petty ambition.',
            effects: [
              { stat: 'health', delta: 4 },
              { stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'late_driving_keys',
    kind: 'choice',
    category: 'family',
    ages: [75, 95],
    weight: 8,
    once: true,
    bind: { kid: { role: 'child', minAge: 30 } },
    text: '{kid.first} mentions, very casually and clearly after rehearsal, that {kid.they} noticed a new scrape on your car, and wonders whether it might be time to think about the keys.',
    choices: [
      {
        id: 'test',
        label: 'Book an assessment to prove them wrong',
        outcomes: [
          {
            chance: oddsBy('health', 0.5),
            text: 'You pass, with a note to avoid driving at night. You drive straight round to tell {kid.first} in person, in daylight.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { rel: 'kid', delta: 3, memory: 'the driving assessment you aced' },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The assessor is kind and firm. You hand over the keys in the car park and sit for a while before calling a taxi.',
            effects: [
              { stat: 'happiness', delta: -6 },
              { rel: 'kid', delta: 2, memory: 'the day you gave up driving' },
            ],
          },
        ],
      },
      {
        id: 'hand_over',
        label: 'Give up the keys on your own terms',
        outcomes: [
          {
            chance: 1,
            text: 'You sell the car to a student who promises to love it. {kid.first} sets up a lift rota, and the bus driver soon knows your name.',
            effects: [
              { stat: 'karma', delta: 3 },
              { stat: 'stress', delta: -2 },
              { money: 3000 },
              { rel: 'kid', delta: 8, memory: 'how gracefully you gave up the car' },
            ],
          },
        ],
      },
      {
        id: 'scooter',
        label: 'Buy a mobility scooter and go anyway',
        requires: canAfford(2500),
        outcomes: [
          {
            chance: 1,
            text: 'It is red, does eight miles an hour and has a basket. You overtake a jogger on the first day and refuse to stop talking about it.',
            effects: [
              { money: -2500 },
              { stat: 'happiness', delta: 7 },
              { rel: 'kid', delta: 4, memory: 'the red scooter' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'late_downsize',
    kind: 'choice',
    category: 'family',
    ages: [65, 90],
    weight: 8,
    once: true,
    when: ownsHome,
    text: 'The house has more rooms than you use and a loft you have not entered since the last century. Everyone has opinions about whether you should move somewhere smaller.',
    choices: [
      {
        id: 'clear',
        label: 'Clear the loft with a weekend yard sale',
        outcomes: [
          {
            chance: 1,
            text: 'You sell a rowing machine, three lampshades and a box of cables nobody can identify. The loft echoes now, which is unsettling and wonderful.',
            effects: [
              { money: 600 },
              { stat: 'stress', delta: -5 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'heirlooms',
        label: 'Give the family their pick of everything',
        outcomes: [
          {
            chance: 1,
            text: 'There is a brief, intense war over a gravy boat. Otherwise it goes well, and the things you love leave in the arms of people you love.',
            effects: [
              { stat: 'karma', delta: 4 },
              { stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'stay',
        label: 'Stay put: every room has a story',
        outcomes: [
          {
            chance: 1,
            text: 'You change nothing except a stair rail, which you fit yourself. The house creaks around you like an old friend settling into a chair.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'stress', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'late_last_adventure',
    kind: 'choice',
    category: 'random',
    ages: [70, 95],
    weight: 9,
    once: true,
    text: 'You find an old list in a drawer, written when you were twenty, titled "Before I Get Old." One line is still not crossed out: see the northern lights.',
    choices: [
      {
        id: 'go',
        label: 'Book the trip north tonight',
        requires: canAfford(5000),
        outcomes: [
          {
            chance: 0.7,
            text: 'On the third night the sky splits open in green and violet. You stand in the snow in four coats, crying and laughing, and cross the line off with a mitten on.',
            effects: [
              { money: -5000 },
              { stat: 'happiness', delta: 14 },
              { stat: 'stress', delta: -6 },
              { flag: 'late_last_adventure' },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'Five nights of cloud. On the last, a guide called Sigrun drives you three hours to a gap in the weather, and it is worth every minute.',
            effects: [
              { money: -5000 },
              { stat: 'happiness', delta: 11 },
              { status: 'friend', first: 'Sigrun', gender: 'female' },
              { flag: 'late_last_adventure' },
            ],
          },
        ],
      },
      {
        id: 'local',
        label: 'Do the cheaper version: a dark-sky night nearby',
        outcomes: [
          {
            chance: 1,
            text: 'No lights, but more stars than you knew existed. You lie on a picnic blanket in a field and decide the list was mostly about this.',
            effects: [{ money: -150 }, { stat: 'happiness', delta: 7 }],
          },
        ],
      },
      {
        id: 'new_list',
        label: 'Write a new list, for now',
        outcomes: [
          {
            chance: 1,
            text: 'The new list is shorter and more honest: a proper bakery, a day at the coast, one long phone call to an old friend. You start on it at once.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
];
