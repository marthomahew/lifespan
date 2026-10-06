import type { EventDef } from '../../engine/events/types';
import { canAfford, ownsHome, oddsBy } from './conditions';

/** More senior-years events (65+): clubs, gadgets, family legacy, and the long view. */
export const SENIOR_EVENTS_2: EventDef[] = [
  {
    id: 'sr2_bowls_rival',
    kind: 'choice',
    category: 'social',
    ages: [65, 95],
    weight: 8,
    once: true,
    bind: { rival: { role: 'friend', maxRelationship: 75 } },
    text: '{rival.first} has joined your bowls club and is already muttering that your winning streak owes more to the slope of the green than to talent.',
    choices: [
      {
        id: 'challenge',
        label: 'Challenge them to the club final',
        outcomes: [
          {
            chance: 1,
            text: 'You both sign the sheet on the noticeboard in pen, which at this club is practically a duel.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'stress', delta: 3 },
              { rel: 'rival', delta: -3, memory: 'the bowls final challenge' },
            ],
            next: { eventId: 'sr2_bowls_final', inYears: [1, 2] },
          },
        ],
      },
      {
        id: 'peace',
        label: 'Buy them a shandy and laugh it off',
        outcomes: [
          {
            chance: 1,
            text: '{rival.first} admits the slope comment was jealousy. By closing time you are plotting against the treasurer together.',
            effects: [
              { stat: 'karma', delta: 3 },
              { rel: 'rival', delta: 8, memory: 'the peace-offering shandy' },
            ],
          },
        ],
      },
      {
        id: 'chess',
        label: 'Defect to the chess club',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.5),
            text: 'The chess club is quieter, smells of instant coffee, and you win your third game. You stop missing the green by Thursday.',
            effects: [
              { stat: 'smarts', delta: 4 },
              { rel: 'rival', delta: -4, memory: 'the way you fled to chess' },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'A nine-year-old prodigy beats you in eleven moves and offers a handshake you cannot quite accept.',
            effects: [
              { stat: 'happiness', delta: -3 },
              { rel: 'rival', delta: -2, memory: 'your chess club exile' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sr2_bowls_final',
    kind: 'choice',
    category: 'social',
    ages: [66, 100],
    weight: 10,
    chainOnly: true,
    bind: { rival: { role: 'friend' } },
    text: 'Final day. Half the club has brought folding chairs, and {rival.first} is wearing a lucky cardigan you have never seen before.',
    choices: [
      {
        id: 'steady',
        label: 'Play slow, careful bowls',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.5),
            text: 'Your last bowl kisses the jack and stops dead. The folding chairs erupt. Your name goes on the honours board in gold paint.',
            effects: [
              { stat: 'happiness', delta: 8 },
              { rel: 'rival', delta: -2, memory: 'losing the bowls final to you' },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'You lose by one shot. {rival.first} is unbearable for a week, then quietly buys you lunch.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { rel: 'rival', delta: 5, memory: 'the one-shot bowls final' },
            ],
          },
        ],
      },
      {
        id: 'talk',
        label: 'Chat during their run-up',
        outcomes: [
          {
            chance: 0.5,
            text: 'It works, shamefully. You win, and the club secretary writes "concerns about sportsmanship" in the minutes.',
            effects: [
              { stat: 'karma', delta: -4 },
              { stat: 'happiness', delta: 4 },
              { rel: 'rival', delta: -8, memory: 'your chatter in the bowls final' },
            ],
          },
          {
            chance: 0.5,
            text: '{rival.first} simply bowls better when annoyed. You learn this at the worst possible moment.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { rel: 'rival', delta: -4, memory: 'the final you tried to talk your way through' },
            ],
          },
        ],
      },
      {
        id: 'share',
        label: 'Suggest you share the trophy',
        outcomes: [
          {
            chance: 1,
            text: 'The committee is baffled but allows it. The trophy lives six months at each house and gets polished more than it ever has.',
            effects: [
              { stat: 'karma', delta: 4 },
              { rel: 'rival', delta: 10, memory: 'the shared bowls trophy' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sr2_video_call_forehead',
    fromYear: 2008,
    kind: 'choice',
    category: 'family',
    ages: [65, 95],
    weight: 8,
    cooldownYears: 10,
    bind: { kid: { role: 'child', minAge: 25 } },
    text: '{kid.first} insists on a weekly video call. For the first three weeks {kid.they} see{kid.s} only your forehead and the corner of a lampshade.',
    choices: [
      {
        id: 'practise',
        label: 'Practise holding the screen properly',
        outcomes: [
          {
            chance: 1,
            text: 'By week four your whole face fits in the frame. {kid.first} takes a screenshot as if you have landed on the moon.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { rel: 'kid', delta: 6, memory: 'the first full-face video call' },
            ],
          },
        ],
      },
      {
        id: 'lean_in',
        label: 'Embrace the forehead',
        outcomes: [
          {
            chance: 1,
            text: 'You start decorating the lampshade for each call. It wears a tiny hat at Christmas. The calls become the highlight of the week.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { rel: 'kid', delta: 4, memory: 'the lampshade in the hat' },
            ],
          },
        ],
      },
      {
        id: 'phone',
        label: 'Insist on a normal phone call',
        outcomes: [
          {
            chance: 1,
            text: 'The old phone works perfectly. {kid.first} sighs, but you both talk for longer without faces to fuss over.',
            effects: [
              { stat: 'stress', delta: -2 },
              { rel: 'kid', delta: 1, memory: 'your refusal to do video' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sr2_care_home_tour',
    kind: 'choice',
    category: 'family',
    ages: [72, 100],
    weight: 7,
    cooldownYears: 10,
    bind: { kid: { role: 'child', minAge: 30 } },
    text: '{kid.first} drives you to Willowmere Court "just to have a look." The brochure promises a sensory garden, a hair salon and bingo with a live caller.',
    choices: [
      {
        id: 'open_mind',
        label: 'Take the tour with an open mind',
        outcomes: [
          {
            chance: 0.6,
            text: 'A resident called Dot beats you at dominoes and invites you back. You leave annoyed and slightly charmed.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'stress', delta: -2 },
              { rel: 'kid', delta: 4, memory: 'the Willowmere tour' },
            ],
          },
          {
            chance: 0.4,
            text: 'Everything smells faintly of gravy and disinfectant. You smile politely and decide never, not yet, not here.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { rel: 'kid', delta: 2, memory: 'the gravy-scented care home' },
            ],
          },
        ],
      },
      {
        id: 'inspect',
        label: 'Inspect it like a health inspector',
        outcomes: [
          {
            chance: 1,
            text: 'You run a finger along every skirting board and ask the manager about staffing ratios. She is impressed; {kid.first} wants to vanish.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { rel: 'kid', delta: -2, memory: 'your care home inspection' },
            ],
          },
        ],
      },
      {
        id: 'car',
        label: 'Stay in the car',
        outcomes: [
          {
            chance: 1,
            text: 'You sit in the car park with the radio on and your arms crossed. {kid.first} brings you a brochure and a scone, which helps.',
            effects: [
              { stat: 'stress', delta: 3 },
              { rel: 'kid', delta: -4, memory: 'the car park sulk' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sr2_grandchild_visit',
    kind: 'choice',
    category: 'family',
    ages: [65, 95],
    weight: 9,
    cooldownYears: 4,
    bind: { gk: { role: 'grandchild', minAge: 6, hasMemory: true } },
    text: '{gk.first} comes to stay for the weekend and, within an hour of arriving, brings up {gk.memory}. Then {gk.they} ask{gk.s} what there is to do.',
    choices: [
      {
        id: 'baking',
        label: 'Teach them your famous recipe',
        outcomes: [
          {
            chance: 1,
            text: 'Flour reaches the ceiling, somehow. The cake is lopsided and perfect, and {gk.first} demands the recipe in writing.',
            effects: [
              { skill: 'cooking', delta: 2 },
              { stat: 'happiness', delta: 6 },
              { rel: 'gk', delta: 8, memory: 'the lopsided cake weekend' },
            ],
          },
        ],
      },
      {
        id: 'stories',
        label: 'Tell them what their parent was like as a child',
        outcomes: [
          {
            chance: 1,
            text: '{gk.first} listens, wide-eyed, to the story of the bathroom flood, and plans to use it at the next family argument.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { rel: 'gk', delta: 7, memory: 'your stories about the old days' },
            ],
          },
        ],
      },
      {
        id: 'telly',
        label: 'Let them watch whatever they like',
        outcomes: [
          {
            chance: 1,
            text: 'You doze through four hours of something with shouting puppets. Everyone is content, if not enriched.',
            effects: [
              { stat: 'stress', delta: -3 },
              { rel: 'gk', delta: 2, memory: 'the puppet marathon at your place' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sr2_memoir_start',
    kind: 'choice',
    category: 'family',
    ages: [68, 100],
    weight: 7,
    once: true,
    bind: { kid: { role: 'child', minAge: 25 } },
    text: '{kid.first} buys you a notebook with "Your Life, In Your Words" embossed on the cover. It sits on the table, blank and accusing.',
    choices: [
      {
        id: 'write',
        label: 'Write it all down, honestly',
        outcomes: [
          {
            chance: 1,
            text: 'You fill the notebook, then a second one. Some chapters are funny. A few you write with the door closed.',
            effects: [
              { skill: 'writing', delta: 4 },
              { stat: 'happiness', delta: 4 },
              { flag: 'sr2_memoir_written' },
              { rel: 'kid', delta: 4, memory: 'the memoir notebooks' },
            ],
            next: { eventId: 'sr2_memoir_reading', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'embellish',
        label: 'Improve on the truth a little',
        outcomes: [
          {
            chance: 1,
            text: 'In your version you once outran a bull and turned down a minor royal. Writing it is the most fun you have had in years.',
            effects: [
              { skill: 'writing', delta: 3 },
              { stat: 'karma', delta: -1 },
              { flag: 'sr2_memoir_embellished' },
              { rel: 'kid', delta: 3, memory: 'the suspiciously exciting memoir' },
            ],
            next: { eventId: 'sr2_memoir_reading', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'shopping',
        label: 'Use it for shopping lists',
        outcomes: [
          {
            chance: 1,
            text: 'Page one now reads "eggs, bin bags, the good biscuits." In its way, it is a record of a life.',
            effects: [
              { stat: 'stress', delta: -1 },
              { rel: 'kid', delta: -2, memory: 'the memoir that became a shopping list' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sr2_memoir_reading',
    kind: 'choice',
    category: 'family',
    ages: [69, 105],
    weight: 10,
    chainOnly: true,
    bind: { kid: { role: 'child' } },
    text: '{kid.first} has had your memoir bound into proper books, one for each branch of the family, and asks you to read a chapter aloud after Sunday lunch.',
    choices: [
      {
        id: 'funny',
        label: 'Read the funniest chapter',
        outcomes: [
          {
            chance: 1,
            text: 'The chapter about the honeymoon caravan reduces the table to tears. Someone has to leave the room to breathe.',
            effects: [
              { stat: 'happiness', delta: 7 },
              { rel: 'kid', delta: 6, memory: 'the caravan chapter reading' },
            ],
          },
        ],
      },
      {
        id: 'hard',
        label: 'Read the hard chapter',
        outcomes: [
          {
            chance: 1,
            text: 'Nobody speaks when you finish. Then {kid.first} squeezes your hand and says {kid.they} finally understand{kid.s} a few things.',
            effects: [
              { stat: 'stress', delta: -4 },
              { stat: 'karma', delta: 3 },
              { rel: 'kid', delta: 10, memory: 'the chapter you read aloud at lunch' },
            ],
          },
        ],
      },
      {
        id: 'pass',
        label: 'Let someone else read it',
        outcomes: [
          {
            chance: 1,
            text: '{kid.first} reads it in completely the wrong voice for you. You correct the pauses from your armchair throughout.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { rel: 'kid', delta: 3, memory: 'reading your memoir in the wrong voice' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sr2_garden_gnome',
    kind: 'notice',
    category: 'random',
    ages: [65, 100],
    weight: 5,
    once: true,
    text: 'Your garden gnome, Barnaby, disappears from beside the pond overnight.',
    outcomes: [
      {
        chance: 0.6,
        text: 'Three months later a postcard arrives from Lisbon, showing Barnaby in tiny sunglasses. Two more follow. You pin them all to the fridge.',
        effects: [{ stat: 'happiness', delta: 5 }],
      },
      {
        chance: 0.4,
        text: 'He is never seen again. You put up a laminated poster and replace him with a gnome who looks less trustworthy.',
        effects: [{ stat: 'happiness', delta: -2 }],
      },
    ],
  },
  {
    id: 'sr2_dance_class',
    kind: 'choice',
    category: 'health',
    ages: [65, 92],
    weight: 7,
    cooldownYears: 10,
    text: 'The community centre starts a Tuesday afternoon dance class. The instructor is seventy-eight, wears sequins, and calls everyone "darling" in a voice like gravel.',
    choices: [
      {
        id: 'join',
        label: 'Sign up',
        outcomes: [
          {
            chance: oddsBy('health', 0.6),
            text: 'You master a cha-cha that is legally a shuffle but has real attitude. Your hips are livelier than they have been in years.',
            effects: [
              { stat: 'health', delta: 4 },
              { stat: 'happiness', delta: 5 },
              { status: 'friend' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You turn left when the whole room turns right, twice. Your ankle files a complaint and you sit out the rest of term.',
            effects: [{ injury: 3 }, { stat: 'happiness', delta: -1 }],
          },
        ],
      },
      {
        id: 'watch',
        label: 'Sit at the side with a tea',
        outcomes: [
          {
            chance: 1,
            text: 'You become the unofficial judge, holding up biscuits as scores. The class loves you more than any of the dancers.',
            effects: [{ stat: 'happiness', delta: 3 }],
          },
        ],
      },
      {
        id: 'skip',
        label: 'Your dancing days are done',
        outcomes: [
          {
            chance: 1,
            text: 'You catch yourself tapping a foot to the music drifting through the wall at the library next door. Old habits.',
            effects: [{ stat: 'happiness', delta: -1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sr2_old_flame_letter',
    kind: 'choice',
    category: 'social',
    ages: [65, 95],
    weight: 5,
    once: true,
    adultsOnly: true,
    bind: { flame: { role: 'ex', minAge: 18, hasMemory: true } },
    text: 'A letter arrives from {flame.full}, decades late and four pages long. Near the end {flame.they} mention{flame.s} {flame.memory} and say{flame.s} {flame.they} still think{flame.s} about it.',
    choices: [
      {
        id: 'reply',
        label: 'Write back',
        outcomes: [
          {
            chance: 1,
            text: 'Letters start crossing in the post, long and teasing and full of old jokes. You buy better stationery.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { rel: 'flame', delta: 10, memory: 'the letters you wrote back' },
            ],
          },
        ],
      },
      {
        id: 'meet',
        label: 'Suggest dinner',
        outcomes: [
          {
            chance: 0.7,
            text: "Dinner runs late, then later. What happens after the restaurant closes is nobody else's business, and you keep it that way.",
            effects: [
              { stat: 'happiness', delta: 8 },
              { stat: 'stress', delta: -3 },
              { rel: 'flame', delta: 12, memory: 'that long dinner, all those years later' },
            ],
          },
          {
            chance: 0.3,
            text: 'You both remember the past differently, and the conversation never quite finds its feet. A kind handshake at the station.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { rel: 'flame', delta: -3, memory: 'the awkward reunion dinner' },
            ],
          },
        ],
      },
      {
        id: 'keep',
        label: 'Keep the letter in a drawer',
        outcomes: [
          {
            chance: 1,
            text: 'You never answer it, but you reread it on rainy afternoons. Some things are better as a pleasant ache.',
            effects: [
              { stat: 'happiness', delta: 1 },
              { rel: 'flame', delta: -2, memory: 'the letter you never answered' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sr2_prize_letter',
    kind: 'choice',
    category: 'money',
    ages: [65, 100],
    weight: 7,
    cooldownYears: 8,
    text: 'A gold-edged letter from the "Continental Prize Office" says you have won a fortune in a draw you never entered. To release it, you need only pay a small handling fee.',
    choices: [
      {
        id: 'bin',
        label: 'Bin it',
        outcomes: [
          {
            chance: 1,
            text: 'Straight in with the potato peelings. Winning things you never entered is, you note, not how anything works.',
            effects: [{ stat: 'smarts', delta: 2 }],
          },
        ],
      },
      {
        id: 'report',
        label: 'Hand it to the police',
        outcomes: [
          {
            chance: 1,
            text: 'The officer has a whole folder of identical letters. Your name goes on a warning leaflet for the local paper, which you frame.',
            effects: [
              { stat: 'karma', delta: 4 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'pay',
        label: 'Pay the fee, just in case',
        requires: canAfford(1500),
        outcomes: [
          {
            chance: 1,
            text: 'The fee leaves. A second letter arrives asking for a larger "tax." You stop there, poorer and furious with yourself.',
            effects: [
              { money: -1500 },
              { stat: 'stress', delta: 6 },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sr2_address_book',
    kind: 'notice',
    category: 'social',
    ages: [80, 110],
    weight: 6,
    cooldownYears: 12,
    text: 'Writing your holiday cards, you realise more names in your address book are crossed out than not.',
    outcomes: [
      {
        chance: 1,
        text: 'You sit with it a long while. Then you write to the ones who are left, and make each card a little longer.',
        effects: [
          { stat: 'happiness', delta: -5 },
          { stat: 'stress', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'sr2_hospital_stay',
    kind: 'choice',
    category: 'health',
    ages: [70, 100],
    weight: 6,
    cooldownYears: 8,
    text: 'A fall in the kitchen earns you a week on a hospital ward. The man in the next bed snores like a cement mixer and the jelly is always green.',
    choices: [
      {
        id: 'rules',
        label: 'Follow every instruction',
        outcomes: [
          {
            chance: 1,
            text: 'You do your physio, eat the green jelly, and are discharged on time with a walking stick you secretly like.',
            effects: [
              { stat: 'health', delta: 4 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'befriend',
        label: 'Befriend the ward',
        outcomes: [
          {
            chance: 1,
            text: "By day three you run a card game, know every nurse's holiday plans, and the snorer has become your best friend.",
            effects: [{ stat: 'happiness', delta: 5 }, { status: 'friend' }],
          },
        ],
      },
      {
        id: 'escape',
        label: 'Discharge yourself early',
        outcomes: [
          {
            chance: 0.5,
            text: 'You are home in your own bed by lunchtime. Your hip is unimpressed, but your mood is wonderful.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'health', delta: -3 },
            ],
          },
          {
            chance: 0.5,
            text: 'Two days later you are back on the same ward, in the same bed, next to the same snorer. He waves.',
            effects: [
              { stat: 'health', delta: -6 },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sr2_cruise_talent_show',
    kind: 'choice',
    category: 'travel',
    ages: [65, 92],
    weight: 5,
    cooldownYears: 10,
    when: canAfford(5000),
    text: 'You splash out on a fortnight aboard the MS Aurelia. On night six the cruise director announces a passenger talent show, and your tablemates look straight at you.',
    choices: [
      {
        id: 'sing',
        label: 'Sing the song you always sing',
        outcomes: [
          {
            chance: oddsBy('happiness', 0.5),
            text: 'You hit the high note, mostly. The ballroom gives you a standing ovation and the captain sends over a bottle.',
            effects: [
              { money: -3500 },
              { stat: 'happiness', delta: 8 },
              { skill: 'voice', delta: 2 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The ship lurches during the key change. You finish the song on your knees, which the judges count as choreography.',
            effects: [{ money: -3500 }, { stat: 'happiness', delta: 3 }],
          },
        ],
      },
      {
        id: 'comedy',
        label: 'Do ten minutes on the buffet',
        outcomes: [
          {
            chance: 1,
            text: 'Your routine about the omelette station kills. For the rest of the voyage strangers shout your punchlines at you on deck.',
            effects: [{ money: -3500 }, { stat: 'happiness', delta: 6 }, { status: 'friend' }],
          },
        ],
      },
      {
        id: 'judge',
        label: 'Volunteer to judge instead',
        outcomes: [
          {
            chance: 1,
            text: 'You award first place to a retired dentist who plays the spoons. Several magicians do not speak to you again.',
            effects: [{ money: -3500 }, { stat: 'happiness', delta: 4 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sr2_hearing_aid',
    kind: 'choice',
    category: 'health',
    ages: [68, 100],
    weight: 7,
    once: true,
    text: 'The audiologist fits you with a new hearing aid the size of a lentil. On the walk home you hear birds you had forgotten existed, and your own footsteps.',
    choices: [
      {
        id: 'wear',
        label: 'Wear it every day',
        outcomes: [
          {
            chance: 1,
            text: 'Conversations stop being guesswork. You discover the neighbours have been calling you by the wrong name for years.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'smarts', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'selective',
        label: 'Switch it off when it suits you',
        outcomes: [
          {
            chance: 1,
            text: 'Family dinners are on. Long speeches about guttering are off. It is the most powerful you have ever felt.',
            effects: [
              { stat: 'stress', delta: -4 },
              { stat: 'karma', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'drawer',
        label: 'It itches. Into the drawer it goes',
        outcomes: [
          {
            chance: 1,
            text: 'You go back to nodding and smiling. Twice you agree to things you will later regret, including a fun run.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sr2_neighbours_dog',
    kind: 'choice',
    category: 'random',
    ages: [65, 100],
    weight: 7,
    cooldownYears: 10,
    text: "The neighbour's scruffy terrier has worked out a gap in your hedge and now arrives every morning at nine, sits on your doormat and waits for toast.",
    choices: [
      {
        id: 'toast',
        label: 'Make it a slice of toast',
        outcomes: [
          {
            chance: 1,
            text: 'The dog, whose name turns out to be Colonel, becomes your shadow. Your daily walks double in length and your heart is grateful.',
            effects: [
              { stat: 'health', delta: 3 },
              { stat: 'happiness', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'neighbour',
        label: 'Knock next door and offer to walk him',
        outcomes: [
          {
            chance: 1,
            text: 'The neighbour, a nurse on night shifts, nearly cries with relief. Colonel now has two homes and you have a new friend.',
            effects: [
              { stat: 'karma', delta: 4 },
              { stat: 'health', delta: 2 },
              { status: 'friend' },
            ],
          },
        ],
      },
      {
        id: 'hedge',
        label: 'Patch the hedge',
        outcomes: [
          {
            chance: 1,
            text: 'You block the gap with chicken wire. Next morning Colonel is on your doormat again, looking deeply disappointed in you.',
            effects: [{ stat: 'happiness', delta: -1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sr2_who_inherits',
    kind: 'choice',
    category: 'family',
    ages: [70, 105],
    weight: 6,
    once: true,
    when: ownsHome,
    bind: { kid: { role: 'child', minAge: 30, hasMemory: true } },
    text: 'Your solicitor says it is time to put the house in your will. Over the phone {kid.first} says {kid.they} {kid.is} fine with anything, then brings up {kid.memory} in a pointed sort of way.',
    choices: [
      {
        id: 'split',
        label: 'Split it evenly between the children',
        outcomes: [
          {
            chance: 1,
            text: 'Equal shares, signed and witnessed. The family breathes out. The question of who gets the good teapot remains unresolved.',
            effects: [
              { stat: 'stress', delta: -4 },
              { flag: 'will_written' },
              { rel: 'kid', delta: 3, memory: 'the fair will' },
            ],
          },
        ],
      },
      {
        id: 'to_kid',
        label: 'Leave it to the one who visits most',
        outcomes: [
          {
            chance: 1,
            text: 'You leave the house to {kid.first}, who visits more often after hearing the news. You decide not to read into that.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { flag: 'will_written' },
              { rel: 'kid', delta: 8, memory: 'being left the house' },
            ],
          },
        ],
      },
      {
        id: 'charity',
        label: 'Leave it to a donkey sanctuary',
        outcomes: [
          {
            chance: 1,
            text: 'The sanctuary sends a thank-you card signed with a hoofprint. {kid.first} calls it "a choice." You call it a legacy.',
            effects: [
              { stat: 'karma', delta: 6 },
              { flag: 'will_written' },
              { rel: 'kid', delta: -8, memory: 'the house going to the donkeys' },
            ],
          },
        ],
      },
      {
        id: 'later',
        label: 'Deal with it later',
        outcomes: [
          {
            chance: 1,
            text: "You put the solicitor's letter under the fruit bowl, where several important letters already live.",
            effects: [{ stat: 'stress', delta: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sr2_ninetieth_telegram',
    kind: 'notice',
    category: 'world',
    ages: [88, 110],
    weight: 12,
    once: true,
    when: (s) => s.player.age >= 90,
    text: 'A cream envelope with an official crest arrives: CONGRATULATIONS STOP NINETY YEARS AND COUNTING STOP YOUR COUNTRY SALUTES YOU STOP.',
    outcomes: [
      {
        chance: 0.7,
        text: 'The street throws you a party with bunting. You make a speech, forget the middle, and get the biggest cheer of your life.',
        effects: [{ stat: 'happiness', delta: 8 }, { fame: 1 }],
      },
      {
        chance: 0.3,
        text: 'It arrives a few years late, which seems about right. You prop it on the mantelpiece next to your best clock and feel quietly proud.',
        effects: [{ stat: 'happiness', delta: 5 }],
      },
    ],
  },
];
