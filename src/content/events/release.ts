import type { EventDef } from '../../engine/events/types';
import { all, canAfford, exCon, hasJob, noJob, oddsBy } from './conditions';

/** Life after release: rebuilding with a record (SPEC §5.10). Every event needs exCon. */
export const RELEASE_EVENTS: EventDef[] = [
  {
    id: 'rel_first_morning',
    kind: 'choice',
    category: 'crime',
    ages: [18, 58],
    weight: 9,
    once: true,
    when: exCon,
    text: 'The gate shuts behind you. You own a plastic bag of belongings, a bus pass with a few rides left on it, and a phone so old it asks to update for an hour and then gives up.',
    choices: [
      {
        id: 'walk',
        label: 'Walk somewhere with no walls',
        outcomes: [
          {
            chance: 1,
            text: 'You walk until your feet hurt, past a bakery, a dog, a park bench nobody will tell you to leave. The sky is ridiculously large.',
            effects: [
              { stat: 'happiness', delta: 8 },
              { stat: 'stress', delta: -6 },
            ],
          },
        ],
      },
      {
        id: 'meal',
        label: 'Buy the greasiest breakfast in town',
        outcomes: [
          {
            chance: 1,
            text: 'Eggs, chips, a coffee that tastes of the pot. You eat slowly because nobody is timing you, and the waitress calls you love.',
            effects: [{ stat: 'happiness', delta: 6 }, { money: -15 }],
          },
        ],
      },
      {
        id: 'list',
        label: 'Sit down and write a plan',
        outcomes: [
          {
            chance: 1,
            text: 'On the back of your release papers you list ID, bank account, job, address, in that order. It looks almost doable written down.',
            effects: [
              { stat: 'discipline', delta: 6 },
              { stat: 'stress', delta: -2 },
              { flag: 'release_plan' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rel_interview_record',
    kind: 'choice',
    category: 'work',
    ages: [18, 58],
    weight: 8,
    cooldownYears: 4,
    when: all(exCon, noJob),
    text: 'The interview at a warehouse goes well until the manager reaches the box on the form that asks about convictions. You ticked it. He taps it twice with his pen.',
    choices: [
      {
        id: 'straight',
        label: 'Explain it plainly',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.45),
            text: 'You keep it short and do not make excuses. He nods slowly and says his brother did time once. You start Monday on a trial shift.',
            effects: [{ stat: 'happiness', delta: 6 }, { stat: 'karma', delta: 3 }, { money: 400 }],
            success: true,
          },
          {
            chance: 0.5,
            text: 'He thanks you for your honesty in the voice people use for a door closing. The email arrives two days later, polite and empty.',
            effects: [
              { stat: 'happiness', delta: -5 },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'joke',
        label: 'Make light of it',
        outcomes: [
          {
            chance: 1,
            text: 'You say at least you are very punctual now. He does not laugh, and you watch the interview end three minutes before it actually does.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'leave',
        label: 'Thank him and leave first',
        outcomes: [
          {
            chance: 1,
            text: 'You save him the speech. On the bus home you circle six more listings in the free paper, mostly out of spite.',
            effects: [
              { stat: 'discipline', delta: 4 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rel_boss_chance',
    kind: 'choice',
    category: 'work',
    ages: [18, 58],
    weight: 8,
    once: true,
    when: all(exCon, hasJob),
    bind: { gaffer: { role: 'boss' } },
    text: '{gaffer.first} calls you in and shuts the door. Someone has told the whole floor about your record. {gaffer.They} say{gaffer.s} {gaffer.they} knew already and hired you anyway, and would like to know what you want done about the gossip.',
    choices: [
      {
        id: 'own',
        label: 'Tell the team yourself',
        outcomes: [
          {
            chance: 1,
            text: 'You say it once at the morning meeting, without drama. The kettle conversation is awkward for a week, then goes back to football.',
            effects: [
              { rel: 'gaffer', delta: 8, memory: 'the morning you told the team' },
              { stat: 'stress', delta: -5 },
              { performance: 4 },
            ],
            next: { eventId: 'rel_boss_chance_year', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'work',
        label: 'Let the work do the talking',
        outcomes: [
          {
            chance: 1,
            text: 'You come in early and leave late and say nothing. It works, slowly, and costs you a fair amount of sleep.',
            effects: [
              { rel: 'gaffer', delta: 5, memory: 'how hard you worked that first year' },
              { stat: 'stress', delta: 5 },
              { performance: 7 },
            ],
            next: { eventId: 'rel_boss_chance_year', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'quit',
        label: 'Say you will find somewhere else',
        outcomes: [
          {
            chance: 1,
            text: '{gaffer.first} tells you to sit down and stop being daft. You stay, but the threat to leave sits between you for a while.',
            effects: [
              { rel: 'gaffer', delta: -3, memory: 'nearly quitting over the gossip' },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rel_boss_chance_year',
    kind: 'choice',
    category: 'work',
    ages: [19, 59],
    weight: 8,
    chainOnly: true,
    when: all(exCon, hasJob),
    bind: { gaffer: { role: 'boss' } },
    text: 'At your review, {gaffer.first} slides a sheet across the desk. A new starter has a record too, and {gaffer.they} want{gaffer.s} you to show them the ropes.',
    choices: [
      {
        id: 'yes',
        label: 'Take the new starter on',
        outcomes: [
          {
            chance: 1,
            text: 'You teach the kid where the good mugs are and which supervisor to avoid on Mondays. Being the one who was trusted feels oddly heavy, in a good way.',
            effects: [
              { rel: 'gaffer', delta: 8, memory: 'mentoring the new starter' },
              { stat: 'karma', delta: 6 },
              { performance: 5 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'no',
        label: 'Say you would rather keep your head down',
        outcomes: [
          {
            chance: 1,
            text: '{gaffer.first} understands, or says so. You get a small raise anyway and spend it on a coat that fits.',
            effects: [
              { rel: 'gaffer', delta: 2, memory: 'the review where you said no' },
              { money: 600 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rel_probation_meeting',
    kind: 'choice',
    category: 'crime',
    ages: [18, 58],
    weight: 7,
    cooldownYears: 4,
    when: exCon,
    text: 'Your probation officer, a tired woman with a cactus on her desk, runs through the checklist: address, work, no new trouble. Then she puts the pen down and asks how you are actually doing.',
    choices: [
      {
        id: 'honest',
        label: 'Tell her the truth',
        outcomes: [
          {
            chance: 1,
            text: 'You admit the nights are hard. She writes down a number for a counsellor who does sliding-scale fees and does not make it sound like a punishment.',
            effects: [{ system: 'therapy' }, { stat: 'happiness', delta: 3 }],
          },
        ],
      },
      {
        id: 'mentor',
        label: 'Ask about the mentoring scheme',
        outcomes: [
          {
            chance: 1,
            text: 'She signs you up. Your mentor turns out to be a retired plasterer called Osric who served six years and talks mostly about his allotment.',
            effects: [
              { status: 'friend', first: 'Osric', gender: 'male' },
              { stat: 'discipline', delta: 5 },
              { stat: 'karma', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'fine',
        label: 'Say everything is fine',
        outcomes: [
          {
            chance: 1,
            text: 'She ticks the box. You are back on the street in eight minutes, which is a record, and not the kind you wanted to add to.',
            effects: [{ stat: 'stress', delta: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'rel_family_door',
    kind: 'choice',
    category: 'family',
    ages: [18, 58],
    weight: 8,
    once: true,
    when: exCon,
    bind: { mum: { role: 'mother', hasMemory: true } },
    text: 'You stand outside {mum.first}’s door for a long time before knocking. The last thing {mum.they} said to you in person was about {mum.memory}, and that was years ago.',
    choices: [
      {
        id: 'knock',
        label: 'Knock',
        outcomes: [
          {
            chance: 0.6,
            text: '{mum.first} opens the door, looks at you for a full second, and pulls you inside by the sleeve. Your old room has become a sewing room, but there is a camp bed.',
            effects: [
              { rel: 'mum', delta: 12, memory: 'the night you came home' },
              { stat: 'happiness', delta: 9 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: '{mum.first} talks to you on the step and does not invite you in. It is not a no. It is a not yet, with a cup of tea handed out the door.',
            effects: [
              { rel: 'mum', delta: 3, memory: 'tea on the doorstep' },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'note',
        label: 'Leave a note and your number',
        outcomes: [
          {
            chance: 1,
            text: 'You fold the note into the letterbox and walk away fast. Three days later your ancient phone rings, and it is {mum.first}, crying a bit, mostly about the bus timetable.',
            effects: [
              { rel: 'mum', delta: 6, memory: 'the note through the letterbox' },
              { stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'away',
        label: 'Walk away',
        outcomes: [
          {
            chance: 1,
            text: 'You tell yourself you will come back when you have a job and a decent shirt. The street looks exactly the same in your rear-view memory.',
            effects: [
              { stat: 'happiness', delta: -6 },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rel_cellmate_knock',
    kind: 'choice',
    category: 'social',
    ages: [18, 58],
    weight: 7,
    once: true,
    when: exCon,
    bind: { bunk: { role: 'acquaintance', flag: 'former_cellmate' } },
    text: '{bunk.first}, who slept in the bunk below you and snored in two keys, turns up at your door. Out a month, no address, all {bunk.their} worldly goods in a sports bag. {bunk.They} ask{bunk.s} for {money:300} to get a room.',
    choices: [
      {
        id: 'lend',
        label: 'Lend the money',
        requires: canAfford(300),
        outcomes: [
          {
            chance: 1,
            text: '{bunk.first} counts it twice, promises it back, and hugs you like someone falling off a ladder. You decide not to think about it too much.',
            effects: [
              { money: -300 },
              { rel: 'bunk', delta: 10, memory: 'the loan for the room' },
              { stat: 'karma', delta: 4 },
            ],
            next: { eventId: 'rel_cellmate_payback', inYears: [1, 3], payload: { amount: 300 } },
          },
        ],
      },
      {
        id: 'sofa',
        label: 'Offer the sofa for a week',
        outcomes: [
          {
            chance: 1,
            text: 'A week becomes nine days. {bunk.first} fixes your dripping tap and leaves the place cleaner than you keep it, which is a little insulting.',
            effects: [
              { rel: 'bunk', delta: 8, memory: 'the nine days on your sofa' },
              { stat: 'stress', delta: 3 },
              { stat: 'karma', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'no',
        label: 'Say you cannot be around that life',
        outcomes: [
          {
            chance: 1,
            text: 'You say it as gently as you can. {bunk.first} says {bunk.they} understand{bunk.s}, and the way {bunk.they} shoulder{bunk.s} the bag says otherwise.',
            effects: [
              { rel: 'bunk', delta: -10, memory: 'being turned away at your door' },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rel_cellmate_payback',
    kind: 'notice',
    category: 'social',
    ages: [19, 59],
    weight: 8,
    chainOnly: true,
    when: exCon,
    bind: { bunk: { role: 'acquaintance', flag: 'former_cellmate' } },
    text: 'An envelope arrives with no return address and handwriting you recognise from years of shared notes about whose turn it was to mop.',
    outcomes: [
      {
        chance: 0.6,
        text: 'Inside is {money:$amount} and a photo of {bunk.first} in a hi-vis vest outside a building site, grinning. On the back: square, mate.',
        effects: [
          { money: { payload: 'amount', mult: 1 } },
          { rel: 'bunk', delta: 8, memory: 'paying back the room money' },
          { stat: 'happiness', delta: 6 },
        ],
        success: true,
      },
      {
        chance: 0.4,
        text: 'There is no money, just a postcard from another prison. {bunk.first} says sorry three times and asks you to write. You keep the card in a drawer.',
        effects: [
          { rel: 'bunk', delta: 2, memory: 'the postcard from inside again' },
          { stat: 'happiness', delta: -5 },
        ],
      },
    ],
  },
  {
    id: 'rel_old_crew_offer',
    kind: 'choice',
    category: 'crime',
    ages: [18, 58],
    weight: 7,
    cooldownYears: 5,
    when: exCon,
    text: 'A car you know slows beside you at the bus stop. The old crew have a little something going, nothing heavy, and they kept your seat warm. The driver is wearing a watch worth your annual rent.',
    choices: [
      {
        id: 'in',
        label: 'Get in the car',
        outcomes: [
          {
            chance: 1,
            text: 'It is easy, which is the worst part. The money is fast, the old jokes are the same, and you start checking the mirrors again.',
            effects: [
              { money: 2500 },
              { stat: 'notoriety', delta: 10 },
              { stat: 'karma', delta: -8 },
              { stat: 'stress', delta: 6 },
              { flag: 'back_with_crew' },
            ],
          },
        ],
      },
      {
        id: 'out',
        label: 'Wave them on',
        outcomes: [
          {
            chance: 1,
            text: 'You shake your head and the car pulls away. Your bus is nineteen minutes late. You have rarely been so pleased to wait for anything.',
            effects: [
              { stat: 'karma', delta: 7 },
              { stat: 'discipline', delta: 4 },
              { flag: 'refused_crew' },
            ],
          },
        ],
      },
      {
        id: 'warn',
        label: 'Tell them to leave you alone for good',
        outcomes: [
          {
            chance: 0.7,
            text: 'The driver laughs, then sees you mean it. They do not come by again. You feel a decade lighter and slightly exposed.',
            effects: [
              { stat: 'karma', delta: 5 },
              { stat: 'stress', delta: 3 },
              { flag: 'refused_crew' },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'Word gets round that you think you are better than them now. A brick comes through your window that week, with no note, which is its own kind of note.',
            effects: [{ stat: 'stress', delta: 8 }, { stat: 'karma', delta: 4 }, { money: -200 }],
          },
        ],
      },
    ],
  },
  {
    id: 'rel_landlord_check',
    kind: 'choice',
    category: 'social',
    ages: [18, 58],
    weight: 7,
    cooldownYears: 6,
    when: exCon,
    text: 'The flat is perfect: second floor, decent light, a radiator that works. Then the letting agent mentions they run background checks on all tenants, and smiles like that is good news.',
    choices: [
      {
        id: 'tell',
        label: 'Tell them before the check does',
        outcomes: [
          {
            chance: oddsBy('karma', 0.4),
            text: 'The landlord, a retired teacher, phones you herself. She says everyone deserves a front door and asks for an extra month up front.',
            effects: [
              { money: -900 },
              { stat: 'happiness', delta: 7 },
              { stat: 'stress', delta: -4 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The agent goes quiet, then very busy. The flat is suddenly let to someone else, which you find out from the website that evening.',
            effects: [
              { stat: 'happiness', delta: -5 },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'deposit',
        label: 'Offer six months up front',
        requires: canAfford(5000),
        outcomes: [
          {
            chance: 1,
            text: 'Money talks over the record. You get the keys, a list of bin days, and a strong sense that you are paying a premium for being you.',
            effects: [{ money: -5000 }, { stat: 'happiness', delta: 5 }],
          },
        ],
      },
      {
        id: 'walk',
        label: 'Look for somewhere that does not ask',
        outcomes: [
          {
            chance: 1,
            text: 'You find a room above a kebab shop where the landlord takes cash and asks nothing. The extractor fan runs all night. It is yours.',
            effects: [
              { money: -350 },
              { stat: 'happiness', delta: -2 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rel_child_asks',
    kind: 'choice',
    category: 'family',
    ages: [36, 76],
    weight: 7,
    once: true,
    when: exCon,
    bind: { kid: { role: 'child', minAge: 18 } },
    text: '{kid.first} is grown now and asks you straight out, over a kitchen table, what really happened. Not the version {kid.they} heard at school. Yours.',
    choices: [
      {
        id: 'all',
        label: 'Tell all of it',
        outcomes: [
          {
            chance: 0.7,
            text: 'It takes two hours and a second pot of coffee. {kid.first} does not forgive everything, but stops looking at you like a stranger.',
            effects: [
              { rel: 'kid', delta: 10, memory: 'the night you told the whole story' },
              { stat: 'stress', delta: -6 },
              { stat: 'karma', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: '{kid.first} listens, says thank you for telling me, and leaves early. It is a month before {kid.they} call{kid.s} again, but {kid.they} do{kid.s} call.',
            effects: [
              { rel: 'kid', delta: -2, memory: 'hearing the truth at the kitchen table' },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'some',
        label: 'Give the short version',
        outcomes: [
          {
            chance: 1,
            text: 'You say you made bad choices and paid for them. It is true, and {kid.first} can tell it is also a locked door.',
            effects: [
              { rel: 'kid', delta: -3, memory: 'the short version you gave' },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'ask',
        label: 'Ask what they remember first',
        outcomes: [
          {
            chance: 1,
            text: '{kid.first} remembers the police at the door, and a birthday you missed, and a song you used to sing in the car that you had forgotten. You start from there.',
            effects: [
              { rel: 'kid', delta: 7, memory: 'listening before you explained' },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rel_small_win',
    kind: 'notice',
    category: 'social',
    ages: [20, 60],
    weight: 6,
    once: true,
    when: exCon,
    text: 'A neighbour knocks to ask if you can keep a spare key and feed her cat while she visits her sister.',
    outcomes: [
      {
        chance: 1,
        text: 'She hands over the key without a second thought. You hang it on its own hook by the door and look at it more than a key strictly warrants.',
        effects: [
          { stat: 'happiness', delta: 7 },
          { stat: 'karma', delta: 3 },
          { stat: 'stress', delta: -3 },
        ],
      },
    ],
  },
];
