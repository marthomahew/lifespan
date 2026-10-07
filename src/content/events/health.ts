import type { EventDef } from '../../engine/events/types';
import type { GameState } from '../../engine/types';
import { all, canAfford, hasJob, hasPartner, oddsBy } from './conditions';

/** Highest level across the substance vices (not gambling). */
const substanceLevel = (s: GameState): number =>
  Math.max(
    s.vices.levels.alcohol,
    s.vices.levels.party_drugs,
    s.vices.levels.pills,
    s.vices.levels.hard_drugs,
  );

/** How common smoking was in a year, relative to 2000 (US adults: 42% in 1965, 23% in 2000, 12% in 2020). */
export function smokingEra(year: number): number {
  const pct =
    year <= 1965
      ? 42
      : year <= 2000
        ? 42 - ((year - 1965) * 19) / 35
        : Math.max(10, 23 - ((year - 2000) * 11) / 20);
  return pct / 23;
}

export const HEALTH_EVENTS: EventDef[] = [
  // ---------------------------------------------------------------- teen (13–17)
  {
    id: 'hl_teen_cigarette_offer',
    kind: 'choice',
    category: 'health',
    ages: [13, 17],
    // As common as smoking was: everywhere in the sixties, rare by the twenties.
    weight: (s) => Math.round(8 * smokingEra(s.year) * 10) / 10,
    cooldownYears: 3,
    bind: { pal: { role: 'friend' } },
    text: 'Behind the sports hall, {pal.first} holds out a crumpled pack like it is a membership card. Three older kids are watching to see what you do.',
    choices: [
      {
        id: 'try',
        label: 'Take one',
        outcomes: [
          {
            chance: 0.6,
            text: 'You cough so hard a pigeon leaves. The older kids nod anyway, which somehow feels worse.',
            effects: [
              { vice: 'smoking', delta: 5 },
              { stat: 'happiness', delta: 2 },
              { stat: 'health', delta: -2 },
            ],
          },
          {
            chance: 0.4,
            text: 'It tastes like a burnt sofa. You smile through it and smell like a bonfire for the rest of the afternoon.',
            effects: [
              { vice: 'smoking', delta: 5 },
              { stat: 'happiness', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'refuse',
        label: 'Say no thanks',
        outcomes: [
          {
            chance: 1,
            text: 'Nobody actually cares as much as you feared. {pal.first} shrugs and you go buy crisps instead.',
            effects: [
              { stat: 'discipline', delta: 3 },
              { stat: 'karma', delta: 2 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'lecture',
        label: 'Tell them it is disgusting',
        outcomes: [
          {
            chance: 1,
            text: 'Your speech on lung tar is accurate and deeply unwelcome. {pal.first} goes quiet for a week.',
            effects: [
              { stat: 'discipline', delta: 2 },
              { rel: 'pal', delta: -4, memory: 'your lung tar speech' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'hl_teen_party_drink',
    kind: 'choice',
    category: 'health',
    ages: [15, 17],
    weight: 8,
    cooldownYears: 3,
    text: 'Someone at the party has emptied every bottle from a parent cabinet into one punch bowl. It is a colour that does not occur in nature.',
    choices: [
      {
        id: 'drink',
        label: 'Have a cup',
        outcomes: [
          {
            chance: 0.6,
            text: 'One cup turns into two. You end the night telling a coat stand your secrets and wake up very thirsty.',
            effects: [
              { vice: 'alcohol', delta: 5 },
              { stat: 'happiness', delta: 4 },
              { stat: 'health', delta: -2 },
            ],
          },
          {
            chance: 0.4,
            text: 'Your parents smell it on you the moment you open the door. The conversation that follows is very long.',
            effects: [
              { vice: 'alcohol', delta: 5 },
              { rel: 'mother', delta: -4, memory: 'the night you came home smelling of punch' },
            ],
          },
        ],
      },
      {
        id: 'soda',
        label: 'Stick to fizzy drinks',
        outcomes: [
          {
            chance: 1,
            text: 'You are the only one who remembers the whole night, which turns out to be a superpower on Monday.',
            effects: [
              { stat: 'discipline', delta: 3 },
              { stat: 'happiness', delta: 2 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'leave',
        label: 'Head home early',
        outcomes: [
          {
            chance: 1,
            text: 'You walk home under the streetlights feeling oddly grown-up and a little left out.',
            effects: [
              { stat: 'karma', delta: 2 },
              { stat: 'happiness', delta: -1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'hl_teen_ankle',
    kind: 'choice',
    category: 'health',
    ages: [13, 17],
    weight: 7,
    cooldownYears: 4,
    text: 'You land badly in the final minutes of a match and your ankle makes a noise like snapping celery. The coach asks if you can keep going.',
    choices: [
      {
        id: 'play',
        label: 'Play on',
        outcomes: [
          {
            chance: 0.3,
            text: 'You hobble through, the team wins, and you are briefly a legend with an ankle like a grapefruit.',
            effects: [{ injury: 4 }, { stat: 'happiness', delta: 5 }],
            success: true,
          },
          {
            chance: 0.7,
            text: 'Two steps later you are on the grass. Six weeks on crutches teaches you a lot about stairs.',
            effects: [{ injury: 10 }, { stat: 'happiness', delta: -4 }],
          },
        ],
      },
      {
        id: 'sit',
        label: 'Sit out and ice it',
        outcomes: [
          {
            chance: 1,
            text: 'You watch from the bench with a bag of frozen peas. It heals in a fortnight.',
            effects: [{ injury: 2 }, { stat: 'discipline', delta: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'hl_teen_acne',
    kind: 'choice',
    category: 'health',
    ages: [13, 17],
    weight: 7,
    cooldownYears: 4,
    text: 'The morning of school photos, a spot the size of a small moon appears on your chin. It seems pleased with itself.',
    choices: [
      {
        id: 'squeeze',
        label: 'Deal with it yourself',
        outcomes: [
          {
            chance: 1,
            text: 'It is now larger, redder and has a friend. The photo is preserved in a yearbook forever.',
            effects: [
              { stat: 'looks', delta: -2 },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'own',
        label: 'Smile anyway',
        outcomes: [
          {
            chance: 1,
            text: 'You grin like nothing is wrong. Years later it is the photo everyone agrees you look happiest in.',
            effects: [{ stat: 'happiness', delta: 3 }],
            success: true,
          },
        ],
      },
      {
        id: 'doctor',
        label: 'Ask about seeing a skin doctor',
        outcomes: [
          {
            chance: 1,
            text: 'A sensible cream and a routine later, your skin calms down over the next few months.',
            effects: [
              { stat: 'looks', delta: 3 },
              { stat: 'discipline', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'hl_teen_phone_nights',
    fromYear: 2008,
    kind: 'notice',
    category: 'health',
    ages: [13, 17],
    weight: 6,
    cooldownYears: 4,
    text: 'You have been watching videos until three every night for a month.',
    outcomes: [
      {
        chance: 0.5,
        text: 'You fall asleep in a maths test and wake with the imprint of a protractor on your cheek.',
        effects: [
          { stat: 'smarts', delta: -2 },
          { stat: 'health', delta: -2 },
        ],
      },
      {
        chance: 0.5,
        text: 'Eventually your body stages a protest and you sleep fourteen hours straight on a Saturday. It helps.',
        effects: [
          { stat: 'stress', delta: -2 },
          { stat: 'health', delta: -1 },
        ],
      },
    ],
  },
  {
    id: 'hl_teen_exam_pressure',
    kind: 'choice',
    category: 'health',
    ages: [14, 17],
    weight: 7,
    cooldownYears: 4,
    when: (s) => s.player.stats.stress >= 50,
    text: 'Exams are close and you have stopped sleeping well or eating much. {mother.first} sits on the end of your bed and asks if you would like to talk to someone about how you are feeling.',
    choices: [
      {
        id: 'accept',
        label: 'Say yes',
        outcomes: [
          {
            chance: 1,
            text: 'The school counsellor is kind and unhurried. Saying it all out loud makes the weight feel lighter.',
            effects: [
              { stat: 'stress', delta: -10 },
              { stat: 'happiness', delta: 5 },
              { rel: 'mother', delta: 5, memory: 'the talk on the end of your bed' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'fine',
        label: 'Insist you are fine',
        outcomes: [
          {
            chance: 1,
            text: '{mother.first} nods and leaves the door open a crack, just in case. The weeks stay heavy.',
            effects: [
              { stat: 'stress', delta: 3 },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'talk_now',
        label: 'Talk to {mother.them} right there',
        outcomes: [
          {
            chance: 1,
            text: 'You talk until the tea goes cold. Nothing is fixed, but you no longer feel alone with it.',
            effects: [
              { stat: 'stress', delta: -6 },
              { stat: 'happiness', delta: 3 },
              { rel: 'mother', delta: 6, memory: 'the night the tea went cold' },
            ],
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- young adult (18–29)
  {
    id: 'hl_ya_casino_night',
    kind: 'choice',
    category: 'health',
    ages: [18, 29],
    weight: 7,
    cooldownYears: 4,
    bind: { pal: { role: 'friend', minAge: 18 } },
    text: "For {pal.first}'s birthday the group ends up at the Lucky Meridian, a casino with carpet designed to keep you awake and no clocks anywhere.",
    choices: [
      {
        id: 'bet',
        label: 'Put money on the tables',
        requires: canAfford(300),
        outcomes: [
          {
            chance: 0.35,
            text: 'You win on your third spin and feel briefly invincible. That feeling follows you home and keeps whispering.',
            effects: [
              { money: 600 },
              { vice: 'gambling', delta: 10 },
              { stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
          {
            chance: 0.65,
            text: 'The chips vanish faster than seems mathematically fair. You leave lighter and oddly eager to come back.',
            effects: [
              { money: -300 },
              { vice: 'gambling', delta: 10 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'watch',
        label: 'Just watch and drink lemonade',
        outcomes: [
          {
            chance: 1,
            text: 'You hold coats, cheer at strangers and keep your wallet shut. {pal.first} calls you the responsible one.',
            effects: [
              { stat: 'discipline', delta: 3 },
              { rel: 'pal', delta: 2, memory: 'holding everyone’s coats at the casino' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'hl_ya_festival_offer',
    kind: 'choice',
    category: 'health',
    ages: [18, 29],
    weight: 7,
    cooldownYears: 4,
    text: 'Somewhere between the second and third stage at a music festival, a stranger in glitter offers you something to "make the colours louder."',
    choices: [
      {
        id: 'take',
        label: 'Accept',
        outcomes: [
          {
            chance: 0.7,
            text: 'The night becomes a blur of lights and hugging people you will never see again. The next two days are grey.',
            effects: [
              { vice: 'party_drugs', delta: 10 },
              { stat: 'happiness', delta: 6 },
              { stat: 'health', delta: -3 },
            ],
          },
          {
            chance: 0.3,
            text: 'It hits badly. You spend the headline set in the first-aid tent with a volunteer patting your hand.',
            effects: [
              { vice: 'party_drugs', delta: 10 },
              { stat: 'health', delta: -8 },
              { stat: 'happiness', delta: -3 },
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
            text: 'You dance anyway, terribly and with total commitment. The colours are loud enough on their own.',
            effects: [
              { stat: 'discipline', delta: 3 },
              { stat: 'happiness', delta: 3 },
            ],
            success: true,
          },
        ],
      },
    ],
  },
  {
    id: 'hl_ya_afterparty_hard',
    kind: 'choice',
    category: 'health',
    ages: [19, 29],
    weight: 5,
    cooldownYears: 5,
    when: (s) => s.vices.levels.party_drugs >= 20,
    text: 'At an after-party in a flat nobody seems to live in, someone offers you something far heavier than anything you have tried. The room goes quiet to see what you say.',
    choices: [
      {
        id: 'take',
        label: 'Go along with it',
        outcomes: [
          {
            chance: 0.75,
            text: 'You lose most of the night and the whole of the next day. Something in you keeps asking for more.',
            effects: [
              { vice: 'hard_drugs', delta: 15 },
              { stat: 'happiness', delta: 3 },
              { stat: 'health', delta: -8 },
            ],
          },
          {
            chance: 0.25,
            text: 'You wake in a hospital corridor with no memory of arriving. A nurse tells you, flatly, that you were lucky.',
            effects: [
              { vice: 'hard_drugs', delta: 15 },
              { stat: 'health', delta: -18 },
              { stat: 'stress', delta: 8 },
            ],
          },
        ],
      },
      {
        id: 'leave',
        label: 'Get your coat and go',
        outcomes: [
          {
            chance: 1,
            text: 'The night bus home is cold and smells of chips. It feels like the best decision you have made all year.',
            effects: [
              { stat: 'discipline', delta: 4 },
              { stat: 'karma', delta: 3 },
            ],
            success: true,
          },
        ],
      },
    ],
  },
  {
    id: 'hl_ya_missed_shift',
    kind: 'choice',
    category: 'work',
    ages: [18, 29],
    weight: 8,
    cooldownYears: 2,
    when: all(hasJob, (s) => s.vices.levels.alcohol >= 50),
    text: 'You wake at eleven with your shoes still on. Your shift started at nine and your phone shows six missed calls from {boss.first}.',
    choices: [
      {
        id: 'sick',
        label: 'Claim you were ill',
        outcomes: [
          {
            chance: 0.5,
            text: '{boss.first} says "feel better" in a voice that suggests a file is being started.',
            effects: [{ performance: -6 }, { stat: 'stress', delta: 4 }],
          },
          {
            chance: 0.5,
            text: 'A coworker posted a photo of you at the bar last night. Your excuse dies on arrival.',
            effects: [
              { performance: -10 },
              { rel: 'boss', delta: -6, memory: 'the sick day that was not' },
            ],
          },
        ],
      },
      {
        id: 'go_in',
        label: 'Drag yourself in late',
        outcomes: [
          {
            chance: 1,
            text: 'You spend the afternoon squinting at a screen and drinking water in sips. It is not your finest work.',
            effects: [{ performance: -3 }, { stat: 'health', delta: -3 }],
          },
        ],
      },
      {
        id: 'help',
        label: 'Admit you need to cut back',
        outcomes: [
          {
            chance: 1,
            text: 'Saying it to yourself is the hard part. You book a support group that evening and actually go.',
            effects: [
              { vice: 'alcohol', delta: -20 },
              { stat: 'stress', delta: -4 },
              { stat: 'happiness', delta: 2 },
              { performance: -2 },
            ],
            success: true,
          },
        ],
      },
    ],
  },
  {
    id: 'hl_ya_intervention',
    kind: 'choice',
    category: 'health',
    ages: [19, 29],
    weight: 9,
    cooldownYears: 4,
    when: (s) => substanceLevel(s) >= 50,
    bind: { pal: { role: 'friend', minRelationship: 40, minAge: 18 } },
    text: 'You arrive for what {pal.first} called a quiet dinner. Instead there are four chairs in a half circle and a letter in {pal.their} shaking hands.',
    choices: [
      {
        id: 'listen',
        label: 'Sit down and listen',
        outcomes: [
          {
            chance: 1,
            text: 'It is the hardest hour of your life. At the end you agree to get help, and {pal.first} cries harder than you do.',
            effects: [
              { vice: 'alcohol', delta: -20 },
              { vice: 'party_drugs', delta: -20 },
              { vice: 'pills', delta: -20 },
              { vice: 'hard_drugs', delta: -20 },
              { stat: 'stress', delta: -5 },
              { rel: 'pal', delta: 10, memory: 'the letter at the dinner table' },
            ],
            next: { eventId: 'hl_ya_intervention_after', inYears: [1, 2] },
            success: true,
          },
        ],
      },
      {
        id: 'storm',
        label: 'Walk out',
        outcomes: [
          {
            chance: 1,
            text: 'You slam the door hard enough to rattle the pictures. {pal.first} keeps calling for a while, then stops.',
            effects: [
              { stat: 'happiness', delta: -5 },
              { rel: 'pal', delta: -15, memory: 'the door you slammed' },
            ],
          },
        ],
      },
      {
        id: 'bargain',
        label: 'Promise to cut down on your own',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.4),
            text: 'You mean it, and for once you stick to it. Slowly, the mornings get easier.',
            effects: [
              { vice: 'alcohol', delta: -10 },
              { vice: 'party_drugs', delta: -10 },
              { vice: 'pills', delta: -10 },
              { rel: 'pal', delta: 4, memory: 'the promise you kept' },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The promise lasts nine days. {pal.first} stops bringing it up, which is somehow worse.',
            effects: [
              { stat: 'happiness', delta: -3 },
              { rel: 'pal', delta: -5, memory: 'the promise that lasted nine days' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'hl_ya_intervention_after',
    kind: 'choice',
    category: 'health',
    ages: [20, 31],
    weight: 10,
    chainOnly: true,
    bind: { pal: { role: 'friend', minAge: 18 } },
    text: '{pal.first} turns up with a lopsided cake. It has been a year since that dinner, and the icing says so in wobbly letters.',
    choices: [
      {
        id: 'celebrate',
        label: 'Cut the cake together',
        outcomes: [
          {
            chance: 1,
            text: 'You eat far too much of it on the floor of your kitchen. It is the best evening you can remember clearly.',
            effects: [
              { stat: 'happiness', delta: 8 },
              { stat: 'stress', delta: -4 },
              { rel: 'pal', delta: 8, memory: 'the lopsided sobriety cake' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'confess',
        label: 'Admit it has been rocky',
        outcomes: [
          {
            chance: 1,
            text: '{pal.first} does not flinch. {pal.They} {pal.is} staying for dinner, and you are going to a meeting together on Thursday.',
            effects: [
              { vice: 'alcohol', delta: -10 },
              { vice: 'party_drugs', delta: -10 },
              { stat: 'stress', delta: -3 },
              { rel: 'pal', delta: 6, memory: 'the honest anniversary' },
            ],
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- adult (30–49)
  {
    id: 'hl_ad_back_spasm',
    kind: 'choice',
    category: 'health',
    ages: [30, 49],
    weight: 7,
    cooldownYears: 10,
    text: 'You bend to pick up a sock and your lower back seizes like a rusted hinge. You are now living on the floor.',
    choices: [
      {
        id: 'physio',
        label: 'Book a physiotherapist',
        requires: canAfford(250),
        outcomes: [
          {
            chance: 1,
            text: 'A cheerful woman named Ottilie bends you in ways you object to. Within a month you can tie your shoes again.',
            effects: [{ money: -250 }, { injury: 2 }, { stat: 'health', delta: 2 }],
            success: true,
          },
        ],
      },
      {
        id: 'wait',
        label: 'Lie there and wait it out',
        outcomes: [
          {
            chance: 1,
            text: 'You get to know your ceiling very well. It eases eventually, but now it twinges every time it rains.',
            effects: [{ injury: 6 }, { stat: 'happiness', delta: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'hl_ad_after_work_round',
    fromYear: 2008,
    kind: 'choice',
    category: 'health',
    ages: [30, 49],
    weight: 7,
    cooldownYears: 3,
    when: hasJob,
    text: '{coworker.first} declares it a "one drink" night at the Copper Kettle. Nobody has ever seen a one drink night actually happen.',
    choices: [
      {
        id: 'go',
        label: 'Go for one',
        outcomes: [
          {
            chance: 0.6,
            text: 'One becomes five and you learn more office gossip than is healthy. You get home well past midnight.',
            effects: [
              { vice: 'alcohol', delta: 10 },
              { stat: 'happiness', delta: 5 },
              { rel: 'coworker', delta: 4, memory: 'the night at the Copper Kettle' },
            ],
          },
          {
            chance: 0.4,
            text: 'You turn up the next morning looking like a crumpled receipt. Your manager notices.',
            effects: [
              { vice: 'alcohol', delta: 10 },
              { stat: 'happiness', delta: 2 },
              { performance: -3 },
            ],
          },
        ],
      },
      {
        id: 'water',
        label: 'Go, but drink water',
        outcomes: [
          {
            chance: 1,
            text: 'You are the only one who can find the exit at the end of the night, which earns a strange kind of respect.',
            effects: [
              { stat: 'discipline', delta: 3 },
              { rel: 'coworker', delta: 2, memory: 'leading everyone to the exit' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'home',
        label: 'Head home',
        outcomes: [
          {
            chance: 1,
            text: 'You make soup, go to bed early and wake up smug. The office group chat is mostly apologies.',
            effects: [
              { stat: 'health', delta: 2 },
              { stat: 'karma', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'hl_ad_smokers_cough',
    kind: 'choice',
    category: 'health',
    ages: [30, 49],
    weight: 9,
    cooldownYears: 4,
    when: (s) => s.vices.levels.smoking >= 50,
    text: 'The cough that started last winter has not left. You get breathless on the stairs, and the doctor looks at your chart without speaking for a long moment.',
    choices: [
      {
        id: 'quit',
        label: 'Commit to quitting',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.5),
            text: 'The first month is miserable. By the third, food tastes of food again and the stairs are just stairs.',
            effects: [
              { vice: 'smoking', delta: -20 },
              { stat: 'health', delta: 4 },
              { stat: 'stress', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You last six weeks before a bad day undoes it. Still, you smoke less than before, and you know you can try again.',
            effects: [
              { vice: 'smoking', delta: -8 },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'ignore',
        label: 'Blame the weather',
        outcomes: [
          {
            chance: 1,
            text: 'You buy stronger cough sweets and keep going. The cough settles in like a lodger who never pays rent.',
            effects: [
              { stat: 'health', delta: -5 },
              { vice: 'smoking', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'hl_ad_burnout',
    kind: 'choice',
    category: 'health',
    ages: [30, 49],
    weight: 8,
    cooldownYears: 4,
    when: (s) => s.player.stats.stress >= 60,
    bind: { pal: { role: 'friend', minRelationship: 30, minAge: 18 } },
    text: 'You have been snapping at people and waking at four every morning. Over coffee, {pal.first} says gently that {pal.they} saw a therapist after a rough year and it helped.',
    choices: [
      {
        id: 'book',
        label: 'Ask for the name',
        outcomes: [
          {
            chance: 1,
            text: 'The first session feels awkward. By the fifth you notice you are sleeping through the night again.',
            effects: [
              { stat: 'stress', delta: -10 },
              { stat: 'happiness', delta: 5 },
              { rel: 'pal', delta: 5, memory: 'the coffee where you finally opened up' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'later',
        label: 'Say you will think about it',
        outcomes: [
          {
            chance: 1,
            text: 'You put the number in your phone and leave it there. The four o’clock wake-ups carry on.',
            effects: [{ stat: 'stress', delta: 2 }],
          },
        ],
      },
      {
        id: 'leave',
        label: 'Take a week off instead',
        outcomes: [
          {
            chance: 1,
            text: 'A week of long walks and no email takes the edge off. It is a start rather than a fix.',
            effects: [
              { stat: 'stress', delta: -5 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'hl_ad_heart_flutter',
    kind: 'choice',
    category: 'health',
    ages: [32, 49],
    weight: 6,
    once: true,
    text: 'Your heart does a strange skip while you wait for a bus, then another. The doctor says it is probably nothing, but wants a proper look.',
    choices: [
      {
        id: 'tests',
        label: 'Have the tests',
        outcomes: [
          {
            chance: 1,
            text: 'A week of wearing a monitor taped to your chest reveals a mild rhythm quirk. You are told to cut down on stress and coffee, and to come back.',
            effects: [
              { stat: 'stress', delta: 3 },
              { stat: 'health', delta: 1 },
            ],
            next: { eventId: 'hl_ad_heart_followup', inYears: [1, 3] },
            success: true,
          },
        ],
      },
      {
        id: 'skip',
        label: 'Cancel the appointment',
        outcomes: [
          {
            chance: 0.7,
            text: 'The skips fade on their own. You decide that settles it and do not think about it again.',
            effects: [{ stat: 'stress', delta: -1 }],
          },
          {
            chance: 0.3,
            text: 'They come back worse a few months later, along with a dizzy spell in the supermarket.',
            effects: [
              { stat: 'health', delta: -6 },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'hl_ad_heart_followup',
    kind: 'choice',
    category: 'health',
    ages: [33, 52],
    weight: 10,
    chainOnly: true,
    text: 'Time for the follow-up the cardiologist asked for. You have been half dreading the letter for weeks.',
    choices: [
      {
        id: 'go',
        label: 'Go to the appointment',
        outcomes: [
          {
            chance: oddsBy('health', 0.6),
            text: 'The results are clear. The quirk has settled and you are sent home with nothing more than a pleased nod.',
            effects: [
              { stat: 'stress', delta: -6 },
              { stat: 'happiness', delta: 5 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'It is still there but stable. A daily tablet and some changes to your routine, and you are told to live normally.',
            effects: [
              { stat: 'stress', delta: -2 },
              { stat: 'health', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'run',
        label: 'Take up running first, then go',
        outcomes: [
          {
            chance: 1,
            text: 'Months of slow jogging around the park leave you fitter than you have been in years. The cardiologist is impressed.',
            effects: [
              { stat: 'health', delta: 5 },
              { stat: 'discipline', delta: 3 },
              { skill: 'athletics', delta: 5 },
            ],
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- middle age (50–64)
  {
    id: 'hl_mid_pill_reliance',
    kind: 'choice',
    category: 'health',
    ages: [50, 64],
    weight: 9,
    cooldownYears: 3,
    when: (s) => s.vices.levels.pills >= 50,
    text: 'The doctor refuses to renew your prescription and slides a leaflet across the desk instead. Your hands are not quite steady as you take it.',
    choices: [
      {
        id: 'help',
        label: 'Read the leaflet and call',
        outcomes: [
          {
            chance: 1,
            text: 'The withdrawal programme is long and unglamorous. You come out of it tired, clearer and proud.',
            effects: [
              { vice: 'pills', delta: -20 },
              { stat: 'stress', delta: -3 },
              { stat: 'happiness', delta: 3 },
              { stat: 'health', delta: 2 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'elsewhere',
        label: 'Find another way to get them',
        outcomes: [
          {
            chance: 1,
            text: 'It costs more than you would like to admit and you start keeping secrets from people you love.',
            effects: [
              { vice: 'pills', delta: 8 },
              { money: -1500 },
              { stat: 'karma', delta: -4 },
              { stat: 'health', delta: -4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'hl_mid_casino_drain',
    kind: 'notice',
    category: 'money',
    ages: [50, 64],
    weight: 8,
    cooldownYears: 2,
    when: (s) => s.vices.levels.gambling >= 50,
    text: 'You check your bank balance after a weekend at the Golden Lagoon casino and have to sit down.',
    outcomes: [
      {
        chance: 0.6,
        text: 'Money that was meant for bills is simply gone. You spend the drive home doing sums that will not come out right.',
        effects: [{ money: -3000 }, { stat: 'happiness', delta: -5 }, { stat: 'stress', delta: 6 }],
      },
      {
        chance: 0.4,
        text: 'You lost a fortune, won half of it back and lost that too. The number on the screen is very small.',
        effects: [{ money: -2000 }, { stat: 'stress', delta: 5 }, { vice: 'gambling', delta: 3 }],
      },
    ],
  },
  {
    id: 'hl_mid_knee',
    kind: 'notice',
    category: 'health',
    ages: [50, 64],
    weight: 6,
    cooldownYears: 5,
    text: 'You join a friendly game of five-a-side to prove a point.',
    outcomes: [
      {
        chance: 0.6,
        text: 'The point is proved, and so is the fact that your knee is no longer under warranty. It aches for months.',
        effects: [{ injury: 6 }, { stat: 'happiness', delta: 2 }],
      },
      {
        chance: 0.4,
        text: 'You score once, pull a hamstring celebrating and limp to the car a hero.',
        effects: [{ injury: 4 }, { stat: 'happiness', delta: 4 }],
      },
    ],
  },
  {
    id: 'hl_mid_snoring',
    kind: 'choice',
    category: 'health',
    ages: [50, 64],
    weight: 7,
    cooldownYears: 6,
    when: hasPartner,
    text: '{partner.first} has recorded your snoring and plays it back over breakfast. It sounds like a tractor losing an argument.',
    choices: [
      {
        id: 'study',
        label: 'Get a sleep study',
        outcomes: [
          {
            chance: 1,
            text: 'You stop breathing for short spells at night, it turns out. A machine fixes it and you both sleep properly for the first time in years.',
            effects: [
              { stat: 'health', delta: 4 },
              { stat: 'stress', delta: -4 },
              { rel: 'partner', delta: 5, memory: 'the end of the tractor era' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'deny',
        label: 'Claim the recording is fake',
        outcomes: [
          {
            chance: 1,
            text: '{partner.first} moves into the spare room with earplugs and a pointed silence.',
            effects: [
              { stat: 'health', delta: -2 },
              { rel: 'partner', delta: -5, memory: 'the snoring you denied' },
            ],
          },
        ],
      },
      {
        id: 'pillow',
        label: 'Buy a fancy anti-snore pillow',
        requires: canAfford(120),
        outcomes: [
          {
            chance: 1,
            text: 'The pillow is shaped like a boomerang and does nothing whatsoever. You keep it out of pride.',
            effects: [
              { money: -120 },
              { rel: 'partner', delta: 1, memory: 'the boomerang pillow' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'hl_mid_wine_o_clock',
    kind: 'choice',
    category: 'health',
    ages: [50, 64],
    weight: 7,
    cooldownYears: 4,
    text: 'The single glass of wine with dinner has quietly become most of a bottle, most nights. You notice it while recycling.',
    choices: [
      {
        id: 'carry_on',
        label: 'Pour another',
        outcomes: [
          {
            chance: 1,
            text: 'It takes the edge off the evening. The mornings are getting harder to ignore.',
            effects: [
              { vice: 'alcohol', delta: 10 },
              { stat: 'happiness', delta: 3 },
              { stat: 'health', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'dry',
        label: 'Try a dry month',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.55),
            text: 'You make it the whole month. You sleep better and lose a belt notch without trying.',
            effects: [
              { vice: 'alcohol', delta: -10 },
              { stat: 'health', delta: 3 },
              { stat: 'discipline', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You last until a friend’s birthday on day eleven. It is still eleven more days than last month.',
            effects: [
              { vice: 'alcohol', delta: -3 },
              { stat: 'discipline', delta: 1 },
            ],
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- senior (65–90)
  {
    id: 'hl_sr_bathroom_slip',
    kind: 'notice',
    category: 'health',
    ages: [65, 90],
    weight: 6,
    cooldownYears: 4,
    text: 'You slip on the wet bathroom tiles reaching for a towel.',
    outcomes: [
      {
        chance: 0.6,
        text: 'A bruised hip and a bruised ego. A grab rail goes up the following week.',
        effects: [{ injury: 5 }, { stat: 'stress', delta: 2 }],
      },
      {
        chance: 0.4,
        text: 'You break your wrist and spend six weeks in a cast that your neighbour insists on decorating.',
        effects: [{ injury: 10 }, { stat: 'happiness', delta: -3 }],
      },
    ],
  },
  {
    id: 'hl_sr_flu_clinic',
    kind: 'choice',
    category: 'health',
    ages: [65, 90],
    weight: 7,
    cooldownYears: 3,
    text: 'A letter invites you to the winter flu clinic at the library. The queue apparently goes round the block and there are biscuits.',
    choices: [
      {
        id: 'jab',
        label: 'Get the jab',
        outcomes: [
          {
            chance: 1,
            text: 'A sore arm, two biscuits and a long chat with a stranger about tomatoes. You sail through winter.',
            effects: [
              { stat: 'health', delta: 2 },
              { stat: 'happiness', delta: 2 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'skip',
        label: 'Skip it this year',
        outcomes: [
          {
            chance: 0.5,
            text: 'You catch a nasty flu in January and spend a fortnight under three blankets.',
            effects: [{ illness: 'flu' }, { stat: 'happiness', delta: -2 }],
          },
          {
            chance: 0.5,
            text: 'Winter passes without so much as a sniffle. You feel lucky rather than clever.',
            effects: [{ stat: 'stress', delta: -1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'hl_sr_grandkid_smoking',
    kind: 'choice',
    category: 'health',
    ages: [65, 90],
    weight: 8,
    cooldownYears: 5,
    when: (s) => s.vices.levels.smoking >= 30,
    bind: { kid: { role: 'grandchild', minAge: 6 } },
    text: '{kid.first} draws you a picture of your lungs, coloured mostly black, and asks very seriously if you will stop smoking so you can see {kid.them} grow up.',
    choices: [
      {
        id: 'promise',
        label: 'Promise to quit',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.55),
            text: 'You pin the drawing to the fridge and look at it every time you want one. It works.',
            effects: [
              { vice: 'smoking', delta: -20 },
              { stat: 'health', delta: 3 },
              { rel: 'kid', delta: 8, memory: 'the drawing of your lungs' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You manage to cut down by half. {kid.first} checks your pockets at every visit.',
            effects: [
              { vice: 'smoking', delta: -10 },
              { rel: 'kid', delta: 4, memory: 'checking your pockets for cigarettes' },
            ],
          },
        ],
      },
      {
        id: 'too_late',
        label: 'Say it is too late to change',
        outcomes: [
          {
            chance: 1,
            text: '{kid.first} goes quiet and takes the drawing home. You smoke the next one feeling worse than usual.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { rel: 'kid', delta: -5, memory: 'the drawing you would not keep' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'hl_sr_low_spell',
    kind: 'choice',
    category: 'health',
    ages: [65, 90],
    weight: 7,
    cooldownYears: 5,
    when: (s) => s.player.stats.happiness < 45,
    text: 'The house feels very quiet lately and the days have started to blur. {child.first} notices on the phone and suggests you talk to someone, or join the Thursday group at the community centre.',
    choices: [
      {
        id: 'talk',
        label: 'Agree to talk to someone',
        outcomes: [
          {
            chance: 1,
            text: 'The counsellor listens without hurrying you. Week by week, the days separate back out into their own shapes.',
            effects: [
              { stat: 'stress', delta: -10 },
              { stat: 'happiness', delta: 6 },
              { rel: 'child', delta: 5, memory: 'the phone call when you were low' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'group',
        label: 'Try the Thursday group',
        outcomes: [
          {
            chance: 1,
            text: 'It is mostly tea and a crossword, but there are faces to look forward to. You start going every week.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'stress', delta: -4 },
              { status: 'friend' },
            ],
          },
        ],
      },
      {
        id: 'brush',
        label: 'Tell them not to fuss',
        outcomes: [
          {
            chance: 1,
            text: '{child.first} lets it go but starts calling more often. You find you look forward to it.',
            effects: [
              { stat: 'happiness', delta: 1 },
              { rel: 'child', delta: 2, memory: 'all those extra phone calls' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'hl_sr_race_night',
    kind: 'choice',
    category: 'health',
    ages: [65, 90],
    weight: 6,
    cooldownYears: 4,
    text: 'The social club has added a weekly betting night on the horse racing. Your friend Marjorie wins every time and will not say how.',
    choices: [
      {
        id: 'bet',
        label: 'Have a flutter',
        requires: canAfford(50),
        outcomes: [
          {
            chance: 0.3,
            text: 'Your horse, Tuppence Lad, wins by a nose. You buy a round and plan your next bet on the way home.',
            effects: [
              { money: 200 },
              { vice: 'gambling', delta: 5 },
              { stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
          {
            chance: 0.7,
            text: 'Your horse appears to stop for a think halfway round. You resolve to win it back next week.',
            effects: [
              { money: -50 },
              { vice: 'gambling', delta: 5 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'cheer',
        label: 'Cheer without betting',
        outcomes: [
          {
            chance: 1,
            text: 'You shout louder than anyone and keep your pension intact. Marjorie calls you a natural.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'hl_era_smoke_everywhere',
    kind: 'choice',
    category: 'health',
    ages: [18, 60],
    weight: 7,
    cooldownYears: 6,
    toYear: 1989,
    text: 'Everyone smokes: at their desks, on the bus, in the cinema, on planes. Someone at the party taps out a cigarette and offers you one without even asking.',
    choices: [
      {
        id: 'take',
        label: 'Take it, like everyone else',
        outcomes: [
          {
            chance: 1,
            text: 'It is what grown-ups do, apparently. You smoke it with the confidence of someone who has been told it is fine.',
            effects: [
              { vice: 'smoking', delta: 8 },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: 'No thanks, you don’t',
        outcomes: [
          {
            chance: 1,
            text: 'You say no and get a look as though you had refused a handshake. Your lungs will thank you in thirty years.',
            effects: [{ stat: 'health', delta: 1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'hl_teen_vape_offer',
    kind: 'choice',
    category: 'health',
    ages: [13, 18],
    weight: 7,
    cooldownYears: 3,
    fromYear: 2012,
    bind: { pal: { role: 'friend' } },
    text: '{pal.first} pulls a vape the size of a USB stick out of a sleeve and offers it to you. It smells of something called “blue razz ice”.',
    choices: [
      {
        id: 'try',
        label: 'Try it',
        outcomes: [
          {
            chance: 1,
            text: 'It tastes like sweets and hits like a headache. You get why people do it, and you also get dizzy.',
            effects: [
              { vice: 'smoking', delta: 6 },
              { rel: 'pal', delta: 2, memory: 'the vape behind the science block' },
            ],
          },
        ],
      },
      {
        id: 'pass',
        label: 'Pass',
        outcomes: [
          {
            chance: 1,
            text: 'You shake your head. {pal.first} shrugs and blows a cloud the size of a sofa.',
            effects: [{ stat: 'health', delta: 1 }],
          },
        ],
      },
    ],
  },
];
