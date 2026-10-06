import type { EventDef } from '../../engine/events/types';
import { canAfford, hasKidAged, oddsBy } from './conditions';

/** Raising a teenager: trust, money, and the arguments that turn out to matter. */
export const TEEN_PARENTING_EVENTS: EventDef[] = [
  {
    id: 'part_curfew',
    kind: 'choice',
    category: 'family',
    ages: [32, 62],
    weight: 7,
    cooldownYears: 4,
    when: hasKidAged(14, 17),
    bind: { kid: { role: 'child', minAge: 14, maxAge: 17 } },
    text: 'Half past one in the morning. {kid.first} was meant to be home at eleven. {kid.Their} phone goes straight to voicemail, and the house is very quiet.',
    choices: [
      {
        id: 'wait',
        label: 'Wait up, and talk in the morning',
        outcomes: [
          {
            chance: 1,
            text: '{kid.first} creeps in at two, sees you on the sofa, and goes white. In the morning you talk, calmly, about what the waiting felt like. {kid.They} never do it again.',
            effects: [
              { stat: 'stress', delta: 5 },
              { rel: 'kid', delta: 5, memory: 'the night you waited up and didn’t shout' },
            ],
          },
        ],
      },
      {
        id: 'search',
        label: 'Get in the car and go looking',
        outcomes: [
          {
            chance: 0.6,
            text: 'You find {kid.first} at a bus stop with a dead phone and three friends, perfectly safe and deeply embarrassed. The drive home is silent. Years later {kid.they} admit{kid.s} how glad {kid.they} felt to see the headlights.',
            effects: [
              { stat: 'stress', delta: 3 },
              { rel: 'kid', delta: 2, memory: 'you turning up at the bus stop' },
            ],
          },
          {
            chance: 0.4,
            text: 'You pull up outside a party and walk in to fetch {kid.first}, in front of everyone. It is discussed at school for a month. {kid.first} take{kid.s} a long time to forgive you.',
            effects: [{ rel: 'kid', delta: -8, memory: 'being dragged out of the party' }],
          },
        ],
      },
      {
        id: 'ground',
        label: 'Ground them for the summer',
        outcomes: [
          {
            chance: 1,
            text: 'A long, sulky summer. {kid.first} comes home on time afterwards, and tells you a good deal less about where {kid.they} spend{kid.s} {kid.their} evenings.',
            effects: [
              { rel: 'kid', delta: -5, memory: 'the summer you grounded them' },
              { npcStat: 'kid', stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'part_quit_instrument',
    kind: 'choice',
    category: 'family',
    ages: [32, 62],
    weight: 6,
    once: true,
    when: hasKidAged(13, 16),
    bind: { kid: { role: 'child', minAge: 13, maxAge: 16 } },
    text: 'Seven years of piano lessons, and {kid.first} announces {kid.they} {kid.is} done. The piano, which you are still paying off, looks on.',
    choices: [
      {
        id: 'let',
        label: 'Let them stop',
        outcomes: [
          {
            chance: 1,
            text: '{kid.first} fills the time with football and friends, and is happier for it. Every few years, late at night, you hear the piano being played very softly.',
            effects: [
              { rel: 'kid', delta: 5, memory: 'letting them give up the piano' },
              { npcStat: 'kid', stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'push',
        label: 'One more year, then decide',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.45),
            text: 'Somewhere in that year {kid.first} discovers jazz, and the piano stops being homework. {kid.They} play{kid.s} at {kid.their} own wedding, one day.',
            effects: [
              { rel: 'kid', delta: 6, memory: 'the extra year of piano' },
              { npcStat: 'kid', stat: 'smarts', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.55,
            text: 'A year of grim, joyless scales. The lid comes down on the last day and stays down.',
            effects: [{ rel: 'kid', delta: -5, memory: 'being made to keep up the piano' }],
          },
        ],
      },
      {
        id: 'sell',
        label: 'Sell the piano, then',
        outcomes: [
          {
            chance: 1,
            text: 'Two men carry it out in the rain. {kid.first} is unexpectedly upset to see it go, which teaches you both something.',
            effects: [
              { money: 900, kind: 'price' },
              { rel: 'kid', delta: -2, memory: 'the day the piano went' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'part_school_trip',
    kind: 'choice',
    category: 'family',
    ages: [32, 62],
    weight: 6,
    once: true,
    when: hasKidAged(14, 17),
    bind: { kid: { role: 'child', minAge: 14, maxAge: 17 } },
    text: 'The school is running a two-week trip abroad. {kid.first} brings the letter home and slides it across the table, not quite daring to hope.',
    choices: [
      {
        id: 'pay',
        label: 'Pay for it',
        requires: canAfford(2200),
        outcomes: [
          {
            chance: 1,
            text: '{kid.first} comes home taller somehow, with a new word for everything and a friend for life. The postcard arrives a week after {kid.they} do.',
            effects: [
              { money: -2200, kind: 'price' },
              { rel: 'kid', delta: 7, memory: 'the school trip you paid for' },
              { npcStat: 'kid', stat: 'smarts', delta: 2 },
              { npcStat: 'kid', stat: 'happiness', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'earn',
        label: 'Half each: they earn their share',
        requires: canAfford(1100),
        outcomes: [
          {
            chance: oddsBy('discipline', 0.6),
            text: 'A paper round, two car washes and a great deal of babysitting. {kid.first} pays {kid.their} half in coins and notes, and is prouder of that than the trip.',
            effects: [
              { money: -1100, kind: 'price' },
              { rel: 'kid', delta: 6, memory: 'earning half the school trip' },
              { npcStat: 'kid', stat: 'smarts', delta: 2 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The money does not come together in time. {kid.first} watches the coach leave from the school gates, and blames you a little, and {kid.their} own slow start a lot.',
            effects: [
              { rel: 'kid', delta: -3, memory: 'missing the school trip' },
              { npcStat: 'kid', stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'no',
        label: 'Say it isn’t possible this year',
        outcomes: [
          {
            chance: 1,
            text: '{kid.first} says it’s fine. For two weeks the house is very quiet at dinner, and {kid.their} best friend’s photos keep arriving.',
            effects: [{ rel: 'kid', delta: -5, memory: 'the school trip you said no to' }],
          },
        ],
      },
    ],
  },
  {
    id: 'part_friend_trouble',
    kind: 'choice',
    category: 'family',
    ages: [32, 62],
    weight: 6,
    cooldownYears: 5,
    when: hasKidAged(13, 17),
    bind: { kid: { role: 'child', minAge: 13, maxAge: 17 } },
    text: '{kid.first}’s new friends are loud, older, and never take their shoes off. {kid.Their} grades have started to slide, and {kid.they} say{kid.s} you just don’t like anyone fun.',
    choices: [
      {
        id: 'welcome',
        label: 'Invite the friends round for dinner',
        outcomes: [
          {
            chance: 0.65,
            text: 'Up close they are mostly polite, slightly lost kids who eat everything. You know their names now, and {kid.first} knows you aren’t the enemy.',
            effects: [
              { rel: 'kid', delta: 7, memory: 'the night you fed all my friends' },
              { npcStat: 'kid', stat: 'happiness', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.35,
            text: 'Dinner is a disaster of eye-rolling. But a month later {kid.first} quietly drifts back to the old crowd, and the grades follow.',
            effects: [{ rel: 'kid', delta: 1, memory: 'the awkward dinner with my friends' }],
          },
        ],
      },
      {
        id: 'ban',
        label: 'Forbid them from seeing those friends',
        outcomes: [
          {
            chance: 1,
            text: 'Forbidding it makes them irresistible. {kid.first} sees them anyway and lies about it, and you both know.',
            effects: [
              { rel: 'kid', delta: -9, memory: 'you banning my friends' },
              { npcStat: 'kid', stat: 'smarts', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'grades',
        label: 'Make it about the grades, not the friends',
        outcomes: [
          {
            chance: 1,
            text: 'You agree a deal: homework first, then whoever {kid.they} like{kid.s}. It mostly holds. The grades come back up, slowly.',
            effects: [
              { rel: 'kid', delta: 2, memory: 'the homework deal' },
              { npcStat: 'kid', stat: 'smarts', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'part_job',
    kind: 'choice',
    category: 'family',
    ages: [32, 62],
    weight: 6,
    once: true,
    when: hasKidAged(15, 17),
    bind: { kid: { role: 'child', minAge: 15, maxAge: 17 } },
    text: '{kid.first} wants a Saturday job at the garden centre. It means less time for revision and, {kid.they} point{kid.s} out, less asking you for money.',
    choices: [
      {
        id: 'yes',
        label: 'Good for them',
        outcomes: [
          {
            chance: 1,
            text: '{kid.first} comes home smelling of compost and full of stories about the regulars. {kid.They} buy{kid.s} you a plant with {kid.their} first wage packet.',
            effects: [
              { rel: 'kid', delta: 5, memory: 'my first job, and the plant I bought you' },
              { npcStat: 'kid', stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'study',
        label: 'Exams first; you’ll cover their pocket money',
        requires: canAfford(600),
        outcomes: [
          {
            chance: 1,
            text: 'You pay a modest allowance and {kid.first} revises, mostly. The grades are good. {kid.They} spend{kid.s} a lot of it on headphones.',
            effects: [
              { money: -600, kind: 'price' },
              { npcStat: 'kid', stat: 'smarts', delta: 3 },
              { rel: 'kid', delta: 1, memory: 'the exam-year allowance' },
            ],
          },
        ],
      },
    ],
  },
];
