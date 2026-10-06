import type { EventDef } from '../../engine/events/types';
import { canAfford, hasJob, hasPartner, oddsBy, single } from './conditions';

export const YOUNG_ADULT_EVENTS: EventDef[] = [
  {
    id: 'ya_first_lease_viewing',
    kind: 'choice',
    category: 'money',
    ages: [18, 24],
    weight: 9,
    once: true,
    // Only while still living at home: signing is moving out.
    when: (s) => s.assets.housing === 'parents',
    text: "The landlord calls the flat 'cosy.' The shower is in the kitchen and the window faces a wall painted to look like a window.",
    choices: [
      {
        id: 'sign',
        label: 'Sign the lease',
        requires: canAfford(1500),
        outcomes: [
          {
            chance: 1,
            text: 'You shower while making toast. Independence tastes faintly of soap.',
            effects: [
              { money: -1500 },
              { stat: 'happiness', delta: 6 },
              { stat: 'discipline', delta: 3 },
              { system: 'move_out' },
            ],
          },
        ],
      },
      {
        id: 'haggle',
        label: 'Point out the fake window',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.45),
            success: true,
            text: 'The landlord knocks a chunk off the rent, mostly to make you stop talking about the mural.',
            effects: [{ money: -1000 }, { stat: 'happiness', delta: 7 }],
          },
          {
            chance: 0.5,
            text: 'The landlord rents it to the next person in line, who loved the mural.',
            effects: [{ stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'stay_home',
        label: "Stay at your parents' a while longer",
        outcomes: [
          {
            chance: 1,
            text: '{father.first} quietly moves your childhood trophies into a box labelled "eventually."',
            effects: [
              { rel: 'father', delta: -2, memory: 'the year you would not move out' },
              { money: 600 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ya_friend_loan',
    kind: 'choice',
    category: 'money',
    ages: [19, 25],
    weight: 8,
    cooldownYears: 10,
    bind: { pal: { role: 'friend', minRelationship: 40, minAge: 18 } },
    text: '{pal.first} needs {money:2000} to start a food truck that only sells soup in bread bowls. {pal.They} {pal.has} a logo and a spreadsheet with one row.',
    choices: [
      {
        id: 'lend',
        label: 'Lend it',
        requires: canAfford(2000),
        outcomes: [
          {
            chance: 1,
            text: '{pal.first} hugs you so hard your ribs file a complaint. The truck is named after you, sort of.',
            effects: [
              { money: -2000 },
              { rel: 'pal', delta: 12, memory: 'the bread bowl loan' },
              { stat: 'karma', delta: 3 },
            ],
            next: { eventId: 'ya_friend_loan_return', inYears: [2, 4], payload: { amount: 2000 } },
          },
        ],
      },
      {
        id: 'refuse',
        label: 'Say money ruins friendships',
        outcomes: [
          {
            chance: 1,
            text: '{pal.first} says {pal.they} understand{pal.s}, in the tone of someone who does not.',
            effects: [{ rel: 'pal', delta: -6, memory: 'the time you said no to the soup truck' }],
          },
        ],
      },
      {
        id: 'advice',
        label: 'Offer business advice instead',
        outcomes: [
          {
            chance: 0.5,
            text: 'You suggest a second spreadsheet row. {pal.first} is genuinely grateful.',
            effects: [
              { rel: 'pal', delta: 3, memory: 'your spreadsheet pep talk' },
              { stat: 'smarts', delta: 2 },
            ],
          },
          {
            chance: 0.5,
            text: '{pal.first} nods politely through your advice and then borrows the money from an uncle.',
            effects: [{ rel: 'pal', delta: -3, memory: 'the unsolicited advice' }],
          },
        ],
      },
    ],
  },
  {
    id: 'ya_friend_loan_return',
    kind: 'choice',
    category: 'money',
    ages: [21, 29],
    weight: 10,
    chainOnly: true,
    once: true,
    bind: { pal: { role: 'friend', minAge: 18 } },
    text: '{pal.first} turns up at your door holding an envelope and a bread bowl. The truck, against all odds, has survived.',
    choices: [
      {
        id: 'accept',
        label: 'Take the envelope',
        outcomes: [
          {
            chance: 0.7,
            success: true,
            text: 'Inside is {money:$amount} and a coupon for free soup for life. You are rich in carbohydrates.',
            effects: [
              { money: { payload: 'amount' } },
              { rel: 'pal', delta: 6, memory: 'paying you back with interest in soup' },
              { stat: 'happiness', delta: 6 },
            ],
          },
          {
            chance: 0.3,
            text: 'Inside is half the money and an apology written on a napkin. The truck is surviving, not thriving.',
            effects: [
              { money: { payload: 'amount', mult: 0.5 } },
              { rel: 'pal', delta: 3, memory: 'the napkin IOU' },
            ],
          },
        ],
      },
      {
        id: 'forgive',
        label: 'Tell {pal.them} to keep it',
        outcomes: [
          {
            chance: 1,
            text: '{pal.first} cries into the bread bowl, which is somehow still structurally sound.',
            effects: [
              { rel: 'pal', delta: 15, memory: 'the loan you forgave' },
              { stat: 'karma', delta: 6 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ya_mother_sunday_call',
    kind: 'choice',
    category: 'family',
    ages: [18, 28],
    weight: 9,
    cooldownYears: 4,
    bind: { mother: { role: 'mother', hasMemory: true } },
    text: "{mother.first} calls for the fourth Sunday in a row to ask whether you're eating vegetables. Somehow {mother.they} also bring{mother.s} up {mother.memory}.",
    choices: [
      {
        id: 'chat',
        label: 'Talk for an hour',
        outcomes: [
          {
            chance: 1,
            text: 'You hear every update about the neighbours and their contested hedge. It is weirdly soothing.',
            effects: [
              { rel: 'mother', delta: 7, memory: 'your long Sunday calls' },
              { stat: 'stress', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'lie',
        label: 'Claim you ate a salad',
        outcomes: [
          {
            chance: 0.6,
            text: '{mother.first} is delighted. The salad was a crisp packet with a lettuce-coloured logo.',
            effects: [
              { stat: 'karma', delta: -2 },
              { stat: 'happiness', delta: 2 },
            ],
          },
          {
            chance: 0.4,
            text: '{mother.first} asks what dressing you used. You panic and say "the usual." The call goes downhill.',
            effects: [{ rel: 'mother', delta: -3, memory: 'the salad you never ate' }],
          },
        ],
      },
      {
        id: 'screen',
        label: 'Let it ring',
        outcomes: [
          {
            chance: 1,
            text: 'Seven voicemails arrive, each slightly more theatrical than the last.',
            effects: [
              { rel: 'mother', delta: -5, memory: 'the Sundays you let it ring' },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ya_coworker_cake_fund',
    kind: 'choice',
    category: 'work',
    ages: [18, 29],
    weight: 8,
    cooldownYears: 3,
    when: hasJob,
    text: "{coworker.first} is collecting money for a birthday cake at work. The birthday is {coworker.first}'s own.",
    choices: [
      {
        id: 'chip_in',
        label: 'Chip in',
        requires: canAfford(20),
        outcomes: [
          {
            chance: 1,
            text: 'The cake says "Happy Birthday To Me." {coworker.first} cuts you the biggest slice.',
            effects: [
              { money: -20 },
              { rel: 'coworker', delta: 5, memory: 'chipping in for the self-funded cake' },
              { performance: 1 },
            ],
          },
        ],
      },
      {
        id: 'point_out',
        label: 'Point out the conflict of interest',
        outcomes: [
          {
            chance: 0.5,
            text: 'The office laughs. {coworker.first} laughs too, about two seconds late.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { rel: 'coworker', delta: -6, memory: 'the cake audit' },
            ],
          },
          {
            chance: 0.5,
            text: 'Nobody laughs. Someone in accounting writes your name on a sticky note.',
            effects: [{ performance: -2 }, { stat: 'stress', delta: 3 }],
          },
        ],
      },
      {
        id: 'bake',
        label: 'Offer to bake one yourself',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.5),
            success: true,
            text: 'Your lemon sponge becomes the stuff of breakroom legend.',
            effects: [
              { skill: 'cooking', delta: 4 },
              { rel: 'coworker', delta: 8, memory: 'your lemon sponge' },
              { performance: 2 },
            ],
          },
          {
            chance: 0.4,
            text: 'The cake collapses in the car. You serve it in mugs and call it a trifle.',
            effects: [
              { skill: 'cooking', delta: 2 },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ya_boss_saturday_email',
    kind: 'choice',
    category: 'work',
    ages: [20, 29],
    weight: 8,
    cooldownYears: 4,
    when: hasJob,
    text: '{boss.first} sends an email at 11:48 on a Saturday night. The subject line is just "quick thing" with no punctuation.',
    choices: [
      {
        id: 'reply_now',
        label: 'Reply immediately',
        outcomes: [
          {
            chance: 1,
            text: 'The quick thing takes your whole Sunday. {boss.first} replies "thx" on Monday.',
            effects: [
              { performance: 4 },
              { rel: 'boss', delta: 4, memory: 'your Saturday night reply' },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'monday',
        label: 'Answer it on Monday',
        outcomes: [
          {
            chance: 0.7,
            text: 'Turns out the quick thing was a typo in a slide. Nobody noticed but {boss.first}.',
            effects: [{ stat: 'stress', delta: -3 }],
          },
          {
            chance: 0.3,
            text: '{boss.first} mentions your "weekend availability" in a meeting. Everyone looks at the table.',
            effects: [
              { performance: -3 },
              { rel: 'boss', delta: -4, memory: 'the ignored weekend email' },
            ],
          },
        ],
      },
      {
        id: 'out_of_office',
        label: 'Set a passive-aggressive auto-reply',
        outcomes: [
          {
            chance: 1,
            text: 'Your auto-reply cites "rest as a productivity strategy." Three colleagues quietly copy it.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { performance: -1 },
              { rel: 'boss', delta: -2, memory: 'your weekend auto-reply' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ya_backpacking_trip',
    group: 'gap_year',
    kind: 'choice',
    category: 'travel',
    ages: [18, 26],
    weight: 7,
    cooldownYears: 6,
    text: 'An airline is selling a round-the-region ticket for {money:1800}. The fine print says "seat not guaranteed to face forward."',
    choices: [
      {
        id: 'go',
        label: 'Pack one bag and go',
        requires: canAfford(1800),
        outcomes: [
          {
            chance: 0.75,
            text: 'You sleep in nine hostels, learn to say "where is the train" four ways, and come home changed.',
            effects: [
              { money: -1800 },
              { stat: 'happiness', delta: 10 },
              { stat: 'smarts', delta: 3 },
              { status: 'friend' },
            ],
          },
          {
            chance: 0.25,
            text: 'You spend most of the trip in a guesthouse bathroom after a questionable street skewer.',
            effects: [{ money: -1800 }, { illness: 'flu' }, { stat: 'happiness', delta: 2 }],
          },
        ],
      },
      {
        id: 'local',
        label: 'Explore {city} like a tourist',
        outcomes: [
          {
            chance: 1,
            text: 'You take the open-top bus around your own city and learn that your street has a plaque.',
            effects: [{ money: -40 }, { stat: 'happiness', delta: 4 }],
          },
        ],
      },
      {
        id: 'skip',
        label: 'Save the money',
        outcomes: [
          {
            chance: 1,
            text: 'Your savings account grows by a respectable amount. Your camera roll does not.',
            effects: [
              { stat: 'discipline', delta: 3 },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ya_gym_contract',
    kind: 'choice',
    category: 'health',
    ages: [18, 29],
    weight: 8,
    cooldownYears: 5,
    text: 'A gym salesman with arms like bridge cables offers a twelve-month deal for {money:400} and a free shaker bottle.',
    choices: [
      {
        id: 'join',
        label: 'Sign up',
        requires: canAfford(400),
        outcomes: [
          {
            chance: oddsBy('discipline', 0.5),
            success: true,
            text: 'You actually go. By spring, stairs stop being a negotiation.',
            effects: [
              { money: -400 },
              { stat: 'health', delta: 7 },
              { stat: 'looks', delta: 3 },
              { skill: 'athletics', delta: 4 },
            ],
          },
          {
            chance: 0.45,
            text: 'You go twice. The shaker bottle becomes a pen holder.',
            effects: [{ money: -400 }, { stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'run',
        label: 'Run in the park for free',
        outcomes: [
          {
            chance: 0.7,
            text: 'You and the same three dog walkers develop a silent nodding friendship.',
            effects: [
              { stat: 'health', delta: 4 },
              { skill: 'athletics', delta: 2 },
            ],
          },
          {
            chance: 0.3,
            text: 'A goose chases you off the path. You run faster than you ever have.',
            effects: [{ stat: 'health', delta: 2 }, { injury: 3 }],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Take only the shaker bottle',
        outcomes: [
          {
            chance: 1,
            text: 'The salesman respects the audacity and hands it over.',
            effects: [{ stat: 'happiness', delta: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'ya_dating_profile',
    kind: 'choice',
    category: 'romance',
    ages: [18, 29],
    weight: 8,
    cooldownYears: 3,
    adultsOnly: true,
    when: (s) => single(s) && s.assets.housing === 'renting',
    text: 'Your roommate insists on writing your dating profile. The draft opens with "Owns a colander."',
    choices: [
      {
        id: 'publish',
        label: 'Post it as written',
        outcomes: [
          {
            chance: oddsBy('looks', 0.45),
            success: true,
            text: 'Someone messages "I also own a colander." Dinner turns into a long walk, and the rest of the evening is nobody else\'s business.',
            effects: [{ status: 'meet' }, { stat: 'happiness', delta: 8 }],
          },
          {
            chance: 0.5,
            text: 'Your only match is a person who wants to buy the colander.',
            effects: [{ stat: 'happiness', delta: -2 }],
          },
        ],
      },
      {
        id: 'rewrite',
        label: 'Rewrite it yourself',
        outcomes: [
          {
            chance: 0.5,
            text: 'Your honest version gets fewer matches but one really good first date.',
            effects: [{ status: 'meet' }, { stat: 'happiness', delta: 6 }],
          },
          {
            chance: 0.5,
            text: 'You spend four hours choosing a photo and post nothing.',
            effects: [{ stat: 'stress', delta: 3 }],
          },
        ],
      },
      {
        id: 'nope',
        label: 'Stay single for now',
        outcomes: [
          {
            chance: 1,
            text: 'You spend the evening alone with a good book and zero notifications. Bliss.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ya_partner_job_offer_away',
    fromYear: 2008,
    kind: 'choice',
    category: 'romance',
    ages: [21, 29],
    weight: 7,
    cooldownYears: 6,
    adultsOnly: true,
    when: hasPartner,
    bind: { love: { role: 'partner', minAge: 18 } },
    text: '{love.first} got a job offer in another city, eight hours away by a train that is often a bus.',
    choices: [
      {
        id: 'move',
        label: 'Move with {love.them}',
        requires: canAfford(1200),
        outcomes: [
          {
            chance: 1,
            text: 'You pack your life into a van. {love.first} carries the heavy boxes and you carry the snacks.',
            effects: [
              { money: -1200 },
              { rel: 'love', delta: 12, memory: 'the move across the country' },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'long_distance',
        label: 'Try long distance',
        outcomes: [
          {
            chance: 0.55,
            success: true,
            text: 'Nightly video calls and one weekend a month. Absence makes the heart surprisingly patient.',
            effects: [
              { rel: 'love', delta: 5, memory: 'the long-distance year' },
              { stat: 'happiness', delta: 2 },
            ],
          },
          {
            chance: 0.45,
            text: 'The calls get shorter until one of them is just two people watching each other eat cereal.',
            effects: [
              { rel: 'love', delta: -8, memory: 'the cereal calls' },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'end_it',
        label: 'End things kindly',
        outcomes: [
          {
            chance: 1,
            text: 'You both cry at the station. It is the right call, and it still hurts.',
            effects: [
              { status: 'breakup', with: 'love' },
              { stat: 'happiness', delta: -8 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ya_sibling_couch_guest',
    kind: 'choice',
    category: 'family',
    ages: [20, 29],
    weight: 8,
    cooldownYears: 6,
    bind: { sib: { role: 'sibling', minAge: 18 } },
    text: '{sib.first} asks to crash on your couch "for a week or two" while {sib.they} figure{sib.s} things out. {sib.They} arrive{sib.s} with three suitcases and a lamp.',
    choices: [
      {
        id: 'welcome',
        label: 'Make up the couch',
        outcomes: [
          {
            chance: 0.5,
            text: 'Two weeks become two months. {sib.first} cooks dinner every night, so you are not complaining.',
            effects: [
              { rel: 'sib', delta: 10, memory: 'the summer on your couch' },
              { stat: 'happiness', delta: 4 },
            ],
          },
          {
            chance: 0.5,
            text: '{sib.first} eats everything and reorganises your spice rack alphabetically by mood.',
            effects: [
              { rel: 'sib', delta: 4, memory: 'the spice rack incident' },
              { stat: 'stress', delta: 5 },
              { money: -150 },
            ],
          },
        ],
      },
      {
        id: 'rules',
        label: 'Agree, with a written house contract',
        outcomes: [
          {
            chance: 1,
            text: '{sib.first} signs it with a flourish and actually follows clause four. Clause seven is ignored.',
            effects: [
              { rel: 'sib', delta: 3, memory: 'your house contract' },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'refuse',
        label: 'Say your place is too small',
        outcomes: [
          {
            chance: 1,
            text: '{sib.first} stays with a friend and tells the whole family about your "tiny" flat.',
            effects: [{ rel: 'sib', delta: -7, memory: 'the time you turned them away' }],
          },
        ],
      },
    ],
  },
  {
    id: 'ya_grandparent_recipe_card',
    kind: 'notice',
    category: 'family',
    ages: [18, 29],
    weight: 6,
    once: true,
    text: '{grandparent.first} mails you a handwritten recipe card for the dumplings you loved as a kid.',
    outcomes: [
      {
        chance: 0.6,
        text: 'The final step just says "you will know." You do not know, but the dumplings are still good.',
        effects: [
          { rel: 'grandparent', delta: 6, memory: 'the dumpling recipe card' },
          { skill: 'cooking', delta: 3 },
        ],
      },
      {
        chance: 0.4,
        text: 'Half of it is in a shorthand nobody else alive can read. You frame it instead.',
        effects: [
          { rel: 'grandparent', delta: 4, memory: 'the framed recipe' },
          { stat: 'happiness', delta: 4 },
        ],
      },
    ],
  },
  {
    id: 'ya_wedding_season',
    kind: 'notice',
    category: 'social',
    ages: [24, 29],
    weight: 6,
    cooldownYears: 5,
    text: 'Four friends get married in a single summer, and every invitation has a different dress code.',
    outcomes: [
      {
        chance: 0.5,
        text: 'You wear the same suit to all of them and nobody notices. The gifts still dent your account.',
        effects: [{ money: -600 }, { stat: 'happiness', delta: 4 }],
      },
      {
        chance: 0.5,
        text: 'You catch a bouquet by accident, then a second one on purpose. People start to talk.',
        effects: [{ money: -500 }, { stat: 'happiness', delta: 6 }, { stat: 'fame', delta: 1 }],
      },
    ],
  },
  {
    id: 'ya_misdelivered_parcel',
    kind: 'notice',
    category: 'random',
    ages: [18, 29],
    weight: 5,
    cooldownYears: 8,
    text: 'A parcel addressed to "The Occupant, Probably" lands on your doorstep.',
    outcomes: [
      {
        chance: 0.5,
        text: 'Inside is a very nice cast-iron pan and no return address. It is yours now, spiritually.',
        effects: [
          { stat: 'happiness', delta: 4 },
          { skill: 'cooking', delta: 1 },
        ],
      },
      {
        chance: 0.5,
        text: 'Inside is forty identical rubber ducks. You give them away for months.',
        effects: [
          { stat: 'happiness', delta: 2 },
          { stat: 'karma', delta: 1 },
        ],
      },
    ],
  },
];
