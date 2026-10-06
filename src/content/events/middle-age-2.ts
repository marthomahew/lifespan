import type { EventDef } from '../../engine/events/types';
import { canAfford, hasJob, ownsHome, oddsBy } from './conditions';

export const MIDDLE_AGE_EVENTS_2: EventDef[] = [
  {
    id: 'mid2_motorbike',
    kind: 'choice',
    category: 'random',
    ages: [50, 60],
    weight: 7,
    once: true,
    text: 'A cherry-red motorbike sits outside the dealership on Calder Road with a sign reading “One careful owner.” You have walked past it eleven times this month and each time it looks more like a personality.',
    choices: [
      {
        id: 'buy',
        label: 'Buy it, and the leather jacket',
        requires: canAfford(9000),
        outcomes: [
          {
            chance: 1,
            text: 'You ride home at a cautious thirty, grinning inside a helmet that smells of someone else. The neighbours have opinions. You do not hear them over the engine.',
            effects: [
              { money: -9000 },
              { stat: 'happiness', delta: 8 },
              { stat: 'stress', delta: -4 },
              { flag: 'mid2_biker' },
            ],
            next: { eventId: 'mid2_motorbike_rally', inYears: [1, 3] },
            success: true,
          },
        ],
      },
      {
        id: 'band',
        label: 'Join a covers band instead',
        outcomes: [
          {
            chance: 0.6,
            text: 'The Lapsed Accountants need a rhythm guitarist and do not ask many questions. Your first gig is a garden centre. You are, briefly, a god among the hanging baskets.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { skill: 'instrument', delta: 6 },
              { status: 'friend' },
            ],
          },
          {
            chance: 0.4,
            text: 'Rehearsals happen in a garage that is mostly a freezer. You learn four chords and the drummer’s entire divorce.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { skill: 'instrument', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'marathon',
        label: 'Sign up for a marathon',
        outcomes: [
          {
            chance: oddsBy('health', 0.5),
            text: 'Sixteen weeks of early alarms and you cross the line in a time best described as “finished.” A stranger hands you a banana and you nearly propose.',
            effects: [
              { stat: 'health', delta: 6 },
              { stat: 'happiness', delta: 6 },
              { skill: 'athletics', delta: 5 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Your knee withdraws from the race in week nine, without consulting you. You become a very supportive spectator.',
            effects: [{ injury: 4 }, { stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'walk_past',
        label: 'Walk past a twelfth time',
        outcomes: [
          {
            chance: 1,
            text: 'Someone else buys it. You see them at the lights a week later, looking exactly as free as you had planned to.',
            effects: [{ stat: 'happiness', delta: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'mid2_motorbike_rally',
    kind: 'choice',
    category: 'travel',
    ages: [51, 64],
    weight: 1,
    chainOnly: true,
    text: 'A flyer tucked under your mirror invites “riders of all vintages” to a weekend rally in the hills. Camping is mandatory. So, it says, is the chilli.',
    choices: [
      {
        id: 'ride',
        label: 'Pack a tent and go',
        outcomes: [
          {
            chance: oddsBy('health', 0.65),
            text: 'Two hundred strangers in dented helmets turn out to be the friendliest people you have met in a decade. You come home sunburnt and owning a patch with a badger on it.',
            effects: [
              { stat: 'happiness', delta: 7 },
              { stat: 'stress', delta: -5 },
              { status: 'friend' },
            ],
            success: true,
          },
          {
            chance: 0.25,
            text: 'You take a gravel bend with more confidence than skill. The bike survives; your shoulder spends six weeks in a sling.',
            effects: [{ injury: 8 }, { money: -800 }, { stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'sell',
        label: 'Sell the bike while it still shines',
        outcomes: [
          {
            chance: 1,
            text: 'It goes to a nervous dentist for most of what you paid. You keep the jacket, which still fits if you do not raise your arms.',
            effects: [{ money: 6500 }, { stat: 'happiness', delta: -1 }, { unflag: 'mid2_biker' }],
          },
        ],
      },
      {
        id: 'pillion',
        label: 'Go, but only for the chilli',
        outcomes: [
          {
            chance: 1,
            text: 'You drive there in the car, eat three bowls and win a raffle for a tyre pump. It is a very good weekend under false pretences.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'health', delta: -1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mid2_parent_care',
    kind: 'choice',
    category: 'family',
    ages: [50, 62],
    weight: 9,
    cooldownYears: 12,
    bind: { dad: { role: 'father', minAge: 76, hasMemory: true } },
    text: 'The doctor says {dad.first} should not live alone any more. {dad.They} {dad.is} sitting in the corridor in {dad.their} good coat, telling a nurse about {dad.memory} as though nothing has changed.',
    choices: [
      {
        id: 'move_in',
        label: 'Move {dad.first} in with you',
        outcomes: [
          {
            chance: 1,
            text: 'You clear the spare room and buy a chair with arms. The house gets slower and louder at once, and you find you do not mind as much as you feared.',
            effects: [
              { rel: 'dad', delta: 12, memory: 'the room you made for him' },
              { stat: 'stress', delta: 6 },
              { stat: 'happiness', delta: 2 },
              { money: -1500 },
            ],
            next: { eventId: 'mid2_parent_care_after', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'home',
        label: 'Find a good care home',
        requires: canAfford(12000),
        outcomes: [
          {
            chance: 0.7,
            text: 'Larchmere House has a garden, a piano and a cook who remembers everyone’s tea. {dad.first} grumbles for a month, then starts beating the other residents at dominoes.',
            effects: [
              { money: -12000 },
              { rel: 'dad', delta: 4, memory: 'Larchmere House' },
              { stat: 'stress', delta: -2 },
            ],
          },
          {
            chance: 0.3,
            text: '{dad.first} asks every visit when {dad.they} can go home. You never find a good answer, and you stop expecting one.',
            effects: [
              { money: -12000 },
              { rel: 'dad', delta: -6, memory: 'being put in a home' },
              { stat: 'happiness', delta: -5 },
            ],
          },
        ],
      },
      {
        id: 'carers',
        label: 'Arrange carers at home',
        requires: canAfford(6000),
        outcomes: [
          {
            chance: 1,
            text: 'A rota of carers visits twice a day and one of them, Precious, becomes the only person {dad.first} will let near the kettle. It costs plenty, and it works.',
            effects: [
              { money: -6000 },
              { rel: 'dad', delta: 6, memory: 'keeping him in his own house' },
              { npcStat: 'dad', stat: 'happiness', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'not_yet',
        label: 'Tell the doctor you’ll think about it',
        outcomes: [
          {
            chance: 1,
            text: 'You drive {dad.first} home and check on {dad.them} every evening by phone. One night {dad.they} {dad.is} found on the kitchen floor, cold but unhurt, and the decision makes itself.',
            effects: [
              { npcStat: 'dad', stat: 'health', delta: -8 },
              { rel: 'dad', delta: -3, memory: 'the night on the kitchen floor' },
              { stat: 'stress', delta: 8 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mid2_parent_care_after',
    kind: 'notice',
    category: 'family',
    ages: [51, 64],
    weight: 1,
    chainOnly: true,
    bind: { dad: { role: 'father' } },
    text: 'A year and more of shared breakfasts with {dad.first} has settled into a rhythm.',
    outcomes: [
      {
        chance: 0.6,
        text: '{dad.They} {dad.has} taught you to make {dad.their} mother’s bread and told you three stories you had never heard. You are tired in a way you will one day miss.',
        effects: [
          { rel: 'dad', delta: 8, memory: 'teaching you the family bread' },
          { stat: 'happiness', delta: 4 },
          { skill: 'cooking', delta: 3 },
        ],
      },
      {
        chance: 0.4,
        text: 'Some days {dad.they} call{dad.s} you by your aunt’s name. You answer to it, make the tea, and cry a little in the car afterwards.',
        effects: [
          { rel: 'dad', delta: 4, memory: 'the cups of tea you made' },
          { stat: 'stress', delta: 4 },
          { stat: 'happiness', delta: -3 },
        ],
      },
    ],
  },
  {
    id: 'mid2_cousin_letter',
    kind: 'choice',
    category: 'social',
    ages: [50, 64],
    weight: 6,
    once: true,
    text: 'A handwritten letter arrives from a cousin called Ingrid Halvorsen, whom you last saw at a wedding when you were both nine. She has been doing the family tree and has “questions about Great-Uncle Bram.”',
    choices: [
      {
        id: 'write',
        label: 'Write back, at length',
        outcomes: [
          {
            chance: 0.7,
            text: 'Letters fly back and forth for months. Ingrid turns out to be hilarious, and Great-Uncle Bram turns out to have had two wives in two towns.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { skill: 'writing', delta: 3 },
              { status: 'friend' },
            ],
          },
          {
            chance: 0.3,
            text: 'Ingrid’s second letter asks, very politely, whether you might invest in her alpaca farm. Her third asks less politely.',
            effects: [
              { stat: 'happiness', delta: -1 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'visit',
        label: 'Go and visit her',
        requires: canAfford(1200),
        outcomes: [
          {
            chance: 1,
            text: 'She meets you at the station holding a sign with your name spelled wrong. You talk until two in the morning and find you have the same laugh.',
            effects: [{ money: -1200 }, { stat: 'happiness', delta: 8 }, { status: 'friend' }],
          },
        ],
      },
      {
        id: 'drawer',
        label: 'Put it in the drawer for later',
        outcomes: [
          {
            chance: 1,
            text: 'Later never comes. Years on you find the letter again, and Great-Uncle Bram’s secret is lost to the ages.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { stat: 'karma', delta: -1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mid2_downsize',
    kind: 'choice',
    category: 'money',
    ages: [55, 64],
    weight: 6,
    once: true,
    when: ownsHome,
    text: 'An estate agent with very white teeth walks through your house tapping walls and saying “lot of house for one or two.” The spare rooms seem to be listening.',
    choices: [
      {
        id: 'sell',
        label: 'Sell up and go smaller',
        outcomes: [
          {
            chance: 1,
            text: 'You sell, buy a bright flat near the river and bank the difference. Forty years of belongings must fit into two rooms, and most of them, it turns out, do not need to.',
            effects: [
              { money: 45000 },
              { stat: 'stress', delta: -4 },
              { stat: 'happiness', delta: 3 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'stay',
        label: 'Stay; the rooms are full of years',
        outcomes: [
          {
            chance: 1,
            text: 'You thank the agent and shut the door. That evening you sit in each room for a minute, and none of them feels too big.',
            effects: [{ stat: 'happiness', delta: 4 }, { money: -300 }],
          },
        ],
      },
      {
        id: 'lodger',
        label: 'Take in a lodger instead',
        outcomes: [
          {
            chance: 0.6,
            text: 'Your lodger, a quiet trainee vet, pays on time and occasionally brings home a recovering hedgehog. The house feels used again.',
            effects: [{ money: 6000 }, { stat: 'happiness', delta: 3 }],
          },
          {
            chance: 0.4,
            text: 'The lodger practises the bagpipes at dawn and calls it “meditation.” The rent arrives; your peace does not.',
            effects: [{ money: 6000 }, { stat: 'stress', delta: 5 }],
          },
        ],
      },
    ],
  },
  {
    id: 'mid2_empty_nest',
    kind: 'notice',
    category: 'family',
    ages: [36, 72],
    weight: 6,
    once: true,
    // The youngest has just left home.
    when: (s) => {
      const kids = s.npcs.filter((n) => n.alive && n.roles.includes('child'));
      return (
        kids.length > 0 &&
        Math.min(...kids.map((k) => k.age)) >= 18 &&
        Math.min(...kids.map((k) => k.age)) <= 19
      );
    },
    bind: { kid: { role: 'child', minAge: 18, maxAge: 19 } },
    text: 'The last of the boxes leaves in the back of {kid.first}’s borrowed van, and the house goes very quiet.',
    outcomes: [
      {
        chance: 0.5,
        text: 'You lay one plate too many for a fortnight. Then you turn {kid.their} room into a study and discover you have hobbies.',
        effects: [
          { stat: 'happiness', delta: 2 },
          { stat: 'stress', delta: -3 },
          { rel: 'kid', delta: 3, memory: 'the van you helped load' },
        ],
      },
      {
        chance: 0.5,
        text: 'For weeks you find yourself listening for a door that will not slam. {kid.first} rings on Sundays, and you start planning the week around it.',
        effects: [
          { stat: 'happiness', delta: -4 },
          { rel: 'kid', delta: 5, memory: 'the Sunday phone calls' },
        ],
      },
    ],
  },
  {
    id: 'mid2_baby_name',
    kind: 'choice',
    category: 'family',
    ages: [45, 80],
    weight: 6,
    cooldownYears: 6,
    // The granddaughter born this year, so the name belongs to someone in the family tree.
    bind: {
      baby: { role: 'grandchild', maxAge: 0, gender: 'female', notFlag: 'great_grandchild' },
    },
    text: 'The phone rings: {baby.first} is here and healthy, and her parents have chosen her middle name. It is Moonbeam. There is a pause on the line in which you are clearly expected to say something.',
    choices: [
      {
        id: 'love_it',
        label: 'Say it’s beautiful',
        outcomes: [
          {
            chance: 1,
            text: 'Her parents audibly relax. Within a month you cannot imagine her as anything but {baby.first} Moonbeam, and you knit the whole name into a blanket.',
            effects: [
              { rel: 'baby', delta: 8, memory: 'the blanket with my whole name on it' },
              { stat: 'happiness', delta: 5 },
              { skill: 'art', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'suggest',
        label: 'Suggest a family name instead',
        outcomes: [
          {
            chance: 0.4,
            text: 'Against all odds, they like it. The baby becomes {baby.first} Margaret, and your late aunt would have been unbearable about it.',
            effects: [
              { rel: 'baby', delta: 4, memory: 'the middle name you gave me' },
              { stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
          {
            chance: 0.6,
            text: 'The silence lengthens. "We weren’t actually asking," says a voice, and the first photos arrive a few days later than they might have.',
            effects: [{ stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'nickname',
        label: 'Privately decide on a nickname',
        outcomes: [
          {
            chance: 1,
            text: 'You call her Beanie, and nobody else does. She grows up knowing that it is only you, and treats it like a secret password.',
            effects: [
              { rel: 'baby', delta: 6, memory: 'the nickname only you use' },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mid2_neighbour_tip',
    kind: 'choice',
    category: 'money',
    ages: [50, 64],
    weight: 7,
    cooldownYears: 8,
    text: 'Over the fence, your neighbour Desmond lowers his voice to tell you about a company that makes “smart soil.” He has doubled his money twice and would like you to know it.',
    choices: [
      {
        id: 'all_in',
        label: 'Put in a serious sum',
        requires: canAfford(10000),
        outcomes: [
          {
            chance: 0.3,
            text: 'Smart soil turns out to be the future. You sell at the top and buy Desmond a very good bottle of something, which he drinks in front of you.',
            effects: [{ money: 18000 }, { stat: 'happiness', delta: 6 }],
            success: true,
          },
          {
            chance: 0.7,
            text: 'The founder of the soil company is last seen boarding a ferry. Desmond is quieter over the fence for a long while.',
            effects: [
              { money: -10000 },
              { stat: 'stress', delta: 6 },
              { stat: 'happiness', delta: -5 },
            ],
          },
        ],
      },
      {
        id: 'flutter',
        label: 'Put in a little, for fun',
        requires: canAfford(1000),
        outcomes: [
          {
            chance: 0.5,
            text: 'Your little stake becomes a slightly larger stake. You do not mention it to Desmond, which feels like winning twice.',
            effects: [{ money: 900 }, { stat: 'happiness', delta: 2 }],
          },
          {
            chance: 0.5,
            text: 'The money vanishes, as advertised by every sensible person you know. It was, you remind yourself, for fun.',
            effects: [{ money: -1000 }, { stat: 'happiness', delta: -1 }],
          },
        ],
      },
      {
        id: 'nod',
        label: 'Nod and keep weeding',
        outcomes: [
          {
            chance: 1,
            text: 'You make the noise people make when they are not going to do something. Desmond moves on to the topic of guttering.',
            effects: [
              { stat: 'stress', delta: -1 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mid2_landmark_birthday',
    fromYear: 2008,
    kind: 'choice',
    category: 'social',
    ages: [55, 60],
    weight: 7,
    once: true,
    text: 'You are turning {age}, and a group chat you are not in has been very busy. Someone has been asking your friends for “embarrassing photos, the worse the better.”',
    choices: [
      {
        id: 'embrace',
        label: 'Lean in and hire a hall',
        requires: canAfford(2500),
        outcomes: [
          {
            chance: 1,
            text: 'Sixty people, a ceilidh band and a slideshow that includes your perm. You dance until your feet file for divorce and it is the best night in years.',
            effects: [
              { money: -2500 },
              { stat: 'happiness', delta: 9 },
              { stat: 'health', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'small',
        label: 'Ask for a quiet dinner',
        outcomes: [
          {
            chance: 1,
            text: 'Six of you at a corner table, the good wine, and a cake with exactly one candle because nobody could find more. You go home warm and early.',
            effects: [
              { money: -300 },
              { stat: 'happiness', delta: 5 },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'flee',
        label: 'Book a cabin and vanish',
        requires: canAfford(900),
        outcomes: [
          {
            chance: 0.6,
            text: 'You spend the day alone by a lake with a book and a flask. Your phone fills with photos of the party they held without you, which is fair.',
            effects: [
              { money: -900 },
              { stat: 'stress', delta: -6 },
              { stat: 'happiness', delta: 3 },
            ],
          },
          {
            chance: 0.4,
            text: 'Your friends find the cabin. They arrive at dusk with balloons, a trestle table and the slideshow on a projector pointed at the trees.',
            effects: [{ money: -900 }, { stat: 'happiness', delta: 7 }],
          },
        ],
      },
    ],
  },
  {
    id: 'mid2_screening_letter',
    kind: 'choice',
    category: 'health',
    ages: [50, 64],
    weight: 7,
    cooldownYears: 6,
    text: 'A brown envelope invites you, in three languages and a cheerful font, to send a sample to a laboratory for a routine bowel screening. The kit is enclosed. So is a diagram.',
    choices: [
      {
        id: 'do_it',
        label: 'Do the test',
        outcomes: [
          {
            chance: 0.85,
            text: 'It is undignified for about four minutes. Three weeks later a letter tells you all is clear, and you feel oddly proud of yourself.',
            effects: [
              { stat: 'health', delta: 2 },
              { stat: 'stress', delta: -2 },
            ],
            success: true,
          },
          {
            chance: 0.15,
            text: 'The result asks you to come in. A small growth is found early and removed the same afternoon. The surgeon says the word “lucky” twice.',
            effects: [
              { stat: 'health', delta: 4 },
              { stat: 'stress', delta: 4 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'later',
        label: 'Put it on the fridge for later',
        outcomes: [
          {
            chance: 1,
            text: 'The envelope stays on the fridge under a magnet shaped like a lobster until it becomes furniture. A reminder arrives, slightly sterner.',
            effects: [
              { stat: 'stress', delta: 2 },
              { stat: 'discipline', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'bin',
        label: 'Bin it; you feel fine',
        outcomes: [
          {
            chance: 1,
            text: 'You feel fine for now. Feeling fine, the leaflet had said in bold, is rather the point of screening.',
            effects: [
              { stat: 'health', delta: -3 },
              { stat: 'karma', delta: -1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mid2_family_home',
    kind: 'choice',
    category: 'family',
    ages: [50, 64],
    weight: 7,
    once: true,
    // Empty means both parents are gone.
    when: (s) =>
      !s.npcs.some((n) => n.alive && (n.roles.includes('mother') || n.roles.includes('father'))),
    bind: { sib: { role: 'sibling', minAge: 40, hasMemory: true } },
    text: 'The house you grew up in is empty now, and {sib.first} wants to keep it “in the family,” meaning {sib.them}, rent-free. Over the phone {sib.they} remind{sib.s} you of {sib.memory}, which seems unrelated but clearly is not.',
    choices: [
      {
        id: 'let_them',
        label: 'Let {sib.first} have it',
        outcomes: [
          {
            chance: 1,
            text: 'You sign your half away. {sib.first} sends a photo of the old kitchen with a new kettle in it, and you are surprised how little it stings.',
            effects: [
              { rel: 'sib', delta: 10, memory: 'giving up your half of the house' },
              { stat: 'karma', delta: 4 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'sell_split',
        label: 'Insist it’s sold and split',
        outcomes: [
          {
            chance: 1,
            text: 'The solicitor’s letters get colder and the house sells to a young couple who love the wallpaper. Your share arrives. {sib.first} sends nothing at Christmas.',
            effects: [
              { money: 35000 },
              { rel: 'sib', delta: -12, memory: 'forcing the sale of the house' },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'buy_out',
        label: 'Offer to let them buy you out slowly',
        outcomes: [
          {
            chance: 0.6,
            text: 'You agree on a monthly sum and a handshake over the old kitchen table. The payments arrive with small notes, some of them almost tender.',
            effects: [{ money: 8000 }, { rel: 'sib', delta: 4, memory: 'the buy-out handshake' }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The payments arrive for four months and then stop. {sib.first} says money is tight, and the house acquires a hot tub.',
            effects: [
              { money: 2000 },
              { rel: 'sib', delta: -6, memory: 'the payments that stopped' },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mid2_charity_run',
    kind: 'notice',
    category: 'health',
    ages: [50, 64],
    weight: 5,
    cooldownYears: 10,
    text: 'A friend talks you into a 10k fun run for the hospice, dressed, for reasons nobody can explain, as a carrot.',
    outcomes: [
      {
        chance: oddsBy('health', 0.6),
        text: 'You jog the whole thing, high-fiving toddlers on the way round, and your sponsorship page raises more than you have ever given to anything.',
        effects: [
          { stat: 'health', delta: 3 },
          { stat: 'karma', delta: 5 },
          { stat: 'happiness', delta: 4 },
        ],
        success: true,
      },
      {
        chance: 0.4,
        text: 'You walk the last four kilometres with your costume’s leaves in your eyes, overtaken by a man pushing twins. The hospice gets its money all the same.',
        effects: [
          { stat: 'karma', delta: 4 },
          { stat: 'happiness', delta: 1 },
          { stat: 'health', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'mid2_early_retirement',
    kind: 'choice',
    category: 'work',
    ages: [55, 64],
    weight: 7,
    once: true,
    when: hasJob,
    text: 'HR emails a confidential offer: a lump sum to leave early, “in recognition of your service.” It arrives on a Monday, which feels pointed.',
    choices: [
      {
        id: 'take',
        label: 'Take the money and go',
        outcomes: [
          {
            chance: 1,
            text: 'You clear your desk in one carrier bag and walk out into a Tuesday afternoon, which is apparently what they look like. The lump sum lands a week later.',
            effects: [
              { money: 40000 },
              { job: 'fire' },
              { stat: 'stress', delta: -8 },
              { stat: 'happiness', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'part_time',
        label: 'Ask to go part-time instead',
        outcomes: [
          {
            chance: 0.6,
            text: 'They agree to three days a week at a lower grade. You discover Wednesday mornings and wonder how you ever lived without them.',
            effects: [
              { job: 'demote' },
              { stat: 'stress', delta: -5 },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The answer is a polite no, and now everyone knows you are thinking about the door. Meetings get a little shorter when you walk in.',
            effects: [{ performance: -6 }, { stat: 'stress', delta: 3 }],
          },
        ],
      },
      {
        id: 'stay',
        label: 'Turn it down and dig in',
        outcomes: [
          {
            chance: 1,
            text: 'You reply with one line and a renewed sense of purpose. Your manager finds this both admirable and slightly frightening.',
            effects: [
              { performance: 6 },
              { stat: 'discipline', delta: 3 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
];
