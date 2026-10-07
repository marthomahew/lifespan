import type { EventDef } from '../../engine/events/types';
import type { GameState } from '../../engine/types';

const pol = (s: GameState): boolean => s.career.jobId === 'politician' && !s.legal.prison;
const atLeast =
  (lvl: number) =>
  (s: GameState): boolean =>
    pol(s) && s.career.level >= lvl;
const between =
  (lo: number, hi: number) =>
  (s: GameState): boolean =>
    pol(s) && s.career.level >= lo && s.career.level <= hi;
const governing = (s: GameState): boolean => pol(s) && !!s.politics?.inGovernment;
const opposition = (s: GameState): boolean => pol(s) && !s.politics?.inGovernment;
const local = between(0, 1);
const minister = (s: GameState): boolean => between(3, 3)(s) && governing(s);
const leader = atLeast(4);

/** Life in politics, from the council chamber to the top job. */
export const POLITICS_EVENTS: EventDef[] = [
  // ---------- Councillor and mayor ----------
  {
    id: 'polife_pothole',
    kind: 'choice',
    category: 'work',
    emoji: '🕳️',
    ages: [21, 90],
    weight: 7,
    cooldownYears: 5,
    when: local,
    text: 'There is a pothole on Mill Lane deep enough to lose a bicycle in. Residents have planted a small tree in it. Everyone is waiting to see what you do.',
    choices: [
      {
        id: 'crusade',
        label: 'Make potholes your crusade',
        outcomes: [
          {
            chance: 0.65,
            text: 'You photograph every hole in the district and badger the roads department weekly. Forty get filled. People call you "the pothole one", fondly.',
            effects: [
              { system: 'approval', arg: '7' },
              { stat: 'stress', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.35,
            text: 'The roads budget is spent until spring. Your crusade becomes a list of holes with your name next to each one.',
            effects: [
              { system: 'approval', arg: '-4' },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'tree',
        label: 'Leave the tree and call it a garden',
        outcomes: [
          {
            chance: 1,
            text: 'You declare it the district’s smallest park. It gets a plaque and a letter in the paper calling you a coward with a sense of humour, which is most of the job.',
            effects: [
              { system: 'approval', arg: '2' },
              { stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'polife_supermarket',
    kind: 'choice',
    category: 'work',
    emoji: '🛒',
    ages: [21, 90],
    weight: 6,
    cooldownYears: 6,
    when: local,
    text: 'A supermarket chain wants to build on the old cricket ground. The planning meeting has standing room only, a petition with two thousand names, and a man dressed as a badger.',
    choices: [
      {
        id: 'approve',
        label: 'Back it: jobs and cheap bread',
        outcomes: [
          {
            chance: 0.55,
            text: 'It goes through. Two hundred jobs arrive with it, and the people who wanted them are quieter than the people who did not.',
            effects: [
              { system: 'approval', arg: '4' },
              { stat: 'karma', delta: -1 },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'It goes through, and the badger becomes a local celebrity. He stands against you at the next election and is surprisingly good on housing.',
            effects: [
              { system: 'approval', arg: '-6' },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'block',
        label: 'Block it and save the ground',
        outcomes: [
          {
            chance: 0.6,
            text: 'The cricket ground survives. A junior team names its trophy after you, and the chain builds on the next town’s field instead.',
            effects: [
              { system: 'approval', arg: '6' },
              { stat: 'karma', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The chain appeals and wins. You spent the goodwill and still got the car park.',
            effects: [
              { system: 'approval', arg: '-3' },
              { stat: 'happiness', delta: -5 },
            ],
          },
        ],
      },
      {
        id: 'compromise',
        label: 'Demand a smaller store and a new pavilion',
        outcomes: [
          {
            chance: 1,
            text: 'Nobody gets everything. The badger shakes your hand afterwards, through the costume, and says it could have been worse.',
            effects: [
              { system: 'approval', arg: '3' },
              { stat: 'smarts', delta: 1 },
            ],
            success: true,
          },
        ],
      },
    ],
  },
  {
    id: 'polife_letter',
    kind: 'choice',
    category: 'work',
    emoji: '✉️',
    ages: [21, 90],
    weight: 7,
    cooldownYears: 4,
    when: local,
    text: 'A handwritten letter: a widow is being evicted on Friday after a housing office mix-up. She has enclosed a photo of her cat, "in case it helps".',
    choices: [
      {
        id: 'fight',
        label: 'Drop everything and fight for her',
        outcomes: [
          {
            chance: 0.75,
            text: 'You spend Thursday on the phone and Friday on her doorstep. The bailiffs leave with an apology. The cat ignores you completely.',
            effects: [
              { stat: 'karma', delta: 6 },
              { stat: 'happiness', delta: 6 },
              { system: 'approval', arg: '3' },
            ],
            success: true,
          },
          {
            chance: 0.25,
            text: 'You are too late by a day, but you find her a flat by the next week. She sends a second photo of the cat, in the new window.',
            effects: [
              { stat: 'karma', delta: 4 },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'forward',
        label: 'Forward it to the housing office',
        outcomes: [
          {
            chance: 1,
            text: 'The housing office thanks you for your enquiry. You think about the cat more than you would like to admit.',
            effects: [
              { stat: 'karma', delta: -3 },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'polife_festival',
    kind: 'choice',
    category: 'fame',
    emoji: '🎪',
    ages: [21, 90],
    weight: 6,
    cooldownYears: 4,
    when: local,
    text: 'You are opening the town festival. You have giant scissors, a ribbon, and a five-minute speech. Behind you, the brass band is already tuning up impatiently.',
    choices: [
      {
        id: 'speech',
        label: 'Give the full speech',
        outcomes: [
          {
            chance: 0.4,
            text: 'You find a joke about the weather that lands. The crowd laughs, then cheers, and the brass band forgives you.',
            effects: [{ system: 'approval', arg: '4' }, { fame: 1 }],
            success: true,
          },
          {
            chance: 0.6,
            text: 'By minute three a child is loudly asking when the man stops. The band starts without you, and the ribbon is cut by a gust of wind.',
            effects: [
              { system: 'approval', arg: '-2' },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'cut',
        label: 'Cut the ribbon and get out of the way',
        outcomes: [
          {
            chance: 1,
            text: 'Snip, wave, done. You spend the afternoon judging the marrows, and you award first prize to a marrow that clearly deserves it.',
            effects: [
              { system: 'approval', arg: '3' },
              { stat: 'happiness', delta: 5 },
            ],
            success: true,
          },
        ],
      },
    ],
  },
  {
    id: 'polife_bin_strike',
    kind: 'choice',
    category: 'work',
    emoji: '🗑️',
    ages: [21, 90],
    weight: 6,
    cooldownYears: 6,
    when: local,
    text: 'The bin crews have walked out over pay. Three weeks in, the bags on the high street have formed a ridge, and the seagulls have formed a government.',
    choices: [
      {
        id: 'pay',
        label: 'Find the money and settle',
        outcomes: [
          {
            chance: 0.7,
            text: 'You raid the parks budget and the crews go back on Monday. The street is clear by Wednesday. The parks people do not send a Christmas card.',
            effects: [
              { system: 'approval', arg: '6' },
              { stat: 'karma', delta: 2 },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'The deal costs more than you have. The bins are emptied, the council tax goes up, and every bag of rubbish now has your name on it.',
            effects: [
              { system: 'approval', arg: '-5' },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'hold',
        label: 'Hold firm and hire contractors',
        outcomes: [
          {
            chance: 0.4,
            text: 'The contractors arrive under escort, the strike collapses, and half the town thinks you are decisive. The other half will remember.',
            effects: [
              { system: 'approval', arg: '3' },
              { stat: 'karma', delta: -4 },
            ],
          },
          {
            chance: 0.6,
            text: 'The contractors refuse to cross the picket line. The seagulls win. You hold a press conference with a bag of rubbish at your feet that nobody asked about.',
            effects: [
              { system: 'approval', arg: '-7' },
              { stat: 'stress', delta: 8 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'polife_hit_piece',
    kind: 'choice',
    category: 'fame',
    emoji: '📰',
    ages: [21, 90],
    weight: 6,
    cooldownYears: 5,
    when: local,
    text: 'The local paper runs a two-page spread on you headlined "ALL TALK". The photo makes you look like you are sneezing. The editor plays golf with your opponent.',
    choices: [
      {
        id: 'reply',
        label: 'Write a measured reply',
        outcomes: [
          {
            chance: 0.6,
            text: 'They print it on page nine, but people read page nine. Several write in to say the sneeze photo was unfair.',
            effects: [
              { system: 'approval', arg: '3' },
              { stat: 'smarts', delta: 1 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'They print it under a new headline: "NOW WITH MORE TALK". You learn the limits of the measured reply.',
            effects: [
              { system: 'approval', arg: '-2' },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'ignore',
        label: 'Ignore it and keep working',
        outcomes: [
          {
            chance: 1,
            text: 'You do not read it twice, which is not the same as not reading it. By the next week it is lining a budgie cage, and so is the editor’s credibility.',
            effects: [
              { stat: 'stress', delta: 3 },
              { stat: 'karma', delta: 1 },
            ],
          },
        ],
      },
    ],
  },

  // ---------- Legislator ----------
  {
    id: 'polife_lobbyist_lunch',
    kind: 'choice',
    category: 'work',
    emoji: '🥂',
    ages: [21, 90],
    weight: 7,
    cooldownYears: 5,
    when: atLeast(2),
    text: 'A lobbyist for a quarry company invites you to lunch at a restaurant with no prices on the menu. They mention a "consultancy" that would need almost none of your time.',
    choices: [
      {
        id: 'accept',
        label: 'Take the lunch and the consultancy',
        outcomes: [
          {
            chance: 0.65,
            text: 'The fees arrive quietly every quarter. So does a feeling, at about three in the morning, that you are being rented by the hour.',
            effects: [
              { money: 40000, kind: 'wage' },
              { stat: 'karma', delta: -8 },
            ],
          },
          {
            chance: 0.35,
            text: 'A reporter was at the next table. The register of interests becomes your least favourite document, and the quarry stops returning calls.',
            effects: [
              { money: 15000, kind: 'wage' },
              { stat: 'karma', delta: -6 },
              { system: 'approval', arg: '-9' },
              { notoriety: 4 },
            ],
          },
        ],
      },
      {
        id: 'lunch_only',
        label: 'Eat the lunch, decline the job',
        outcomes: [
          {
            chance: 1,
            text: 'The fish is excellent. You decline politely, and they pay the bill as if it were a down payment on something.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { stat: 'karma', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'refuse',
        label: 'Refuse and buy your own sandwich',
        outcomes: [
          {
            chance: 1,
            text: 'You eat a sandwich at your desk and feel faintly heroic about it. Nobody will ever know, which is rather the point.',
            effects: [{ stat: 'karma', delta: 4 }],
            success: true,
          },
        ],
      },
    ],
  },
  {
    id: 'polife_whip',
    kind: 'choice',
    category: 'work',
    emoji: '📋',
    ages: [21, 90],
    weight: 7,
    cooldownYears: 4,
    when: (s) => between(2, 3)(s) && s.politics?.party !== 'independent',
    text: 'The party whip corners you by the tea urn. The vote on the transport bill is tight, they know about your doubts, and they mention a committee chair that will be going spare.',
    choices: [
      {
        id: 'fold',
        label: 'Take the chair, vote the line',
        outcomes: [
          {
            chance: 1,
            text: 'You vote as told and get the committee. The chair is comfortable. You notice that you sit in it a little lower than you expected.',
            effects: [{ performance: 8 }, { stat: 'karma', delta: -3 }],
          },
        ],
      },
      {
        id: 'rebel',
        label: 'Tell them you will vote as you see fit',
        outcomes: [
          {
            chance: 0.55,
            text: 'You rebel and the bill is amended in your direction. The whips stop saying good morning; your constituents start.',
            effects: [
              { system: 'approval', arg: '6' },
              { stat: 'karma', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'You rebel alone. The bill passes, the committee chair goes to someone who smiled more, and you are moved to an office beside the boiler.',
            effects: [{ performance: -8 }, { stat: 'happiness', delta: -4 }],
          },
        ],
      },
    ],
  },
  {
    id: 'polife_tv_debate',
    kind: 'choice',
    category: 'fame',
    emoji: '📺',
    ages: [21, 90],
    weight: 7,
    cooldownYears: 4,
    when: atLeast(2),
    text: 'A late-night TV debate: you, a rival from the other side, and a presenter who has clearly been told to make someone cry. Make-up has made you an unusual shade of apricot.',
    choices: [
      {
        id: 'facts',
        label: 'Arrive armed with facts',
        outcomes: [
          {
            chance: 0.55,
            text: 'You quote a figure, the rival disputes it, and you produce the page. The clip is replayed for a week and the apricot is forgiven.',
            effects: [{ system: 'approval', arg: '6' }, { fame: 3 }],
            success: true,
          },
          {
            chance: 0.45,
            text: 'Your facts are right and your timing is wrong. The rival gets the laugh line and the headline, and you get a footnote.',
            effects: [
              { system: 'approval', arg: '-3' },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'zinger',
        label: 'Go for the knockout line',
        outcomes: [
          {
            chance: 0.4,
            text: 'You have been saving the line for a year. It lands perfectly. Strangers repeat it to you on the train, slightly wrong.',
            effects: [{ system: 'approval', arg: '8' }, { fame: 5 }],
            success: true,
          },
          {
            chance: 0.6,
            text: 'The line comes out backwards. The rival thanks you for your support, the studio laughs, and you will hear that silence in your sleep.',
            effects: [
              { system: 'approval', arg: '-7' },
              { fame: 2 },
              { stat: 'happiness', delta: -6 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'polife_long_speech',
    kind: 'choice',
    category: 'work',
    emoji: '🕯️',
    ages: [21, 90],
    weight: 5,
    cooldownYears: 8,
    when: (s) => between(2, 3)(s) && opposition(s),
    text: 'A bill you think is cruel will pass at midnight unless someone keeps talking. The chamber is half empty. You have a dry mouth, comfortable shoes and the telephone directory of an entire province.',
    choices: [
      {
        id: 'talk',
        label: 'Talk until morning',
        outcomes: [
          {
            chance: 0.5,
            text: 'You speak for nine hours, reading letters from constituents when you run out of argument. The deadline passes. The bill dies, and so do your legs.',
            effects: [
              { system: 'approval', arg: '9' },
              { fame: 4 },
              { stat: 'karma', delta: 5 },
              { stat: 'health', delta: -3 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'A procedural motion cuts you off at hour five. The bill passes anyway, but the cleaners, who stayed to listen, give you a round of applause.',
            effects: [
              { system: 'approval', arg: '3' },
              { stat: 'karma', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'home',
        label: 'Go home and fight it later',
        outcomes: [
          {
            chance: 1,
            text: 'You sleep well and the bill passes. Someone else will do the long speech next time, you tell yourself, and the someone else is never anyone.',
            effects: [
              { stat: 'stress', delta: -3 },
              { stat: 'karma', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'polife_expenses',
    kind: 'choice',
    category: 'money',
    emoji: '🧾',
    ages: [21, 90],
    weight: 6,
    cooldownYears: 6,
    when: atLeast(2),
    text: 'The expenses rules say a "second home" can be anywhere you sleep twice a year. A colleague has claimed for a holiday cottage. "Everyone does it," they say, which is what everyone says.',
    choices: [
      {
        id: 'claim',
        label: 'Claim for the flat you barely use',
        outcomes: [
          {
            chance: 0.7,
            text: 'The money arrives. It is entirely within the rules, a phrase you practise saying in the mirror just in case.',
            effects: [
              { money: 18000, kind: 'wage' },
              { stat: 'karma', delta: -5 },
            ],
          },
          {
            chance: 0.3,
            text: 'A freedom-of-information request lands. Within the rules is not the same as within the reach of a front page, it turns out.',
            effects: [
              { money: -6000, kind: 'wage' },
              { system: 'approval', arg: '-10' },
              { notoriety: 4 },
            ],
          },
        ],
      },
      {
        id: 'honest',
        label: 'Claim only your train fares',
        outcomes: [
          {
            chance: 1,
            text: 'Your claims are so small the auditors ring to check you are well. Two years later, when the scandal breaks, yours is the only clean page.',
            effects: [
              { stat: 'karma', delta: 5 },
              { system: 'approval', arg: '4' },
            ],
            success: true,
          },
        ],
      },
    ],
  },
  {
    id: 'polife_committee_ceo',
    kind: 'choice',
    category: 'work',
    emoji: '🎙️',
    ages: [21, 90],
    weight: 6,
    cooldownYears: 5,
    when: between(2, 3),
    text: 'A water company boss is before your committee after a summer of sewage on the beaches. They have brought a lawyer, a chart and a bonus they would rather not discuss.',
    choices: [
      {
        id: 'grill',
        label: 'Ask about the bonus, again and again',
        outcomes: [
          {
            chance: 0.65,
            text: 'You ask the same question nine times, more politely each time. On the tenth they answer. The bonus is returned within a week.',
            effects: [{ system: 'approval', arg: '7' }, { fame: 3 }, { stat: 'karma', delta: 3 }],
            success: true,
          },
          {
            chance: 0.35,
            text: 'The lawyer has an answer for everything, all of them the same answer. You end up arguing with the chart.',
            effects: [
              { system: 'approval', arg: '-2' },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'soft',
        label: 'Keep it polite and technical',
        outcomes: [
          {
            chance: 1,
            text: 'You ask sensible questions about pipe diameters. The hearing produces a fine report that nobody reads, and the beaches stay brown.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { stat: 'karma', delta: -1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'polife_asleep_clip',
    kind: 'choice',
    category: 'fame',
    emoji: '😴',
    ages: [21, 90],
    weight: 6,
    cooldownYears: 8,
    fromYear: 2008,
    when: atLeast(2),
    text: 'A clip of you asleep on the benches during a debate on sleep deprivation has gone viral. Someone has added snoring. Twelve million people have watched it.',
    choices: [
      {
        id: 'own',
        label: 'Laugh at yourself in public',
        outcomes: [
          {
            chance: 0.7,
            text: 'You post a picture of yourself with a pillow and a promise to do better. People like a politician who can take a joke. They like it more than your policies.',
            effects: [{ system: 'approval', arg: '4' }, { fame: 4 }],
            success: true,
          },
          {
            chance: 0.3,
            text: 'The joke is fine, but the snoring remix is better. It plays at a wedding you attend.',
            effects: [{ fame: 3 }, { stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'excuse',
        label: 'Insist you were resting your eyes',
        outcomes: [
          {
            chance: 1,
            text: '"Resting my eyes" becomes a catchphrase, and not yours. A mattress company asks to use it.',
            effects: [{ system: 'approval', arg: '-4' }, { fame: 3 }, { stat: 'stress', delta: 4 }],
          },
        ],
      },
    ],
  },
  {
    id: 'polife_surgery',
    kind: 'choice',
    category: 'work',
    emoji: '🪑',
    ages: [21, 90],
    weight: 7,
    cooldownYears: 4,
    when: between(2, 3),
    text: 'Saturday surgery in a church hall. The queue goes out the door: a lost passport, a noisy neighbour, a war widow’s pension, and a man who wants to discuss the moon.',
    choices: [
      {
        id: 'everyone',
        label: 'See every single person',
        outcomes: [
          {
            chance: 0.8,
            text: 'You finish at seven, with the caretaker rattling his keys. The passport turns up, the pension gets paid, and the moon man leaves satisfied for reasons of his own.',
            effects: [
              { system: 'approval', arg: '5' },
              { stat: 'karma', delta: 4 },
              { stat: 'stress', delta: 5 },
            ],
            success: true,
          },
          {
            chance: 0.2,
            text: 'You see everyone and fix almost nothing, but people seem glad someone listened. You go home and sit in the car for twenty minutes.',
            effects: [
              { stat: 'karma', delta: 3 },
              { stat: 'stress', delta: 7 },
            ],
          },
        ],
      },
      {
        id: 'staff',
        label: 'Leave it to your caseworker',
        outcomes: [
          {
            chance: 1,
            text: 'Your caseworker handles it beautifully and you get your Saturday back. A letter in the paper asks who the constituency is actually represented by.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { system: 'approval', arg: '-3' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'polife_shadow_brief',
    kind: 'choice',
    category: 'work',
    emoji: '🗂️',
    ages: [21, 90],
    weight: 5,
    cooldownYears: 6,
    when: (s) => atLeast(2)(s) && opposition(s),
    text: 'In opposition, you have a title, a shared office and no power whatsoever. A government minister has just announced your own policy as their idea.',
    choices: [
      {
        id: 'cry_foul',
        label: 'Point out loudly that it was yours',
        outcomes: [
          {
            chance: 0.5,
            text: 'You produce last year’s press release, dated and signed. The papers enjoy it. The minister claims they were thinking along the same lines all along.',
            effects: [{ system: 'approval', arg: '4' }, { fame: 2 }],
            success: true,
          },
          {
            chance: 0.5,
            text: 'Nobody cares who thought of it first. You sound petty and the policy happens anyway, which is, you remind yourself, the point.',
            effects: [
              { stat: 'happiness', delta: -3 },
              { stat: 'karma', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'welcome',
        label: 'Welcome it graciously',
        outcomes: [
          {
            chance: 1,
            text: '"Imitation is the sincerest form of governing," you tell the chamber. It gets a laugh from both sides, and a nod from the minister.',
            effects: [
              { system: 'approval', arg: '3' },
              { stat: 'karma', delta: 3 },
            ],
            success: true,
          },
        ],
      },
    ],
  },

  // ---------- Minister ----------
  {
    id: 'polife_dept_crisis',
    kind: 'choice',
    category: 'work',
    emoji: '🚨',
    ages: [21, 90],
    weight: 7,
    cooldownYears: 5,
    when: minister,
    text: 'Your department has lost a laptop containing the records of half a million people. It was left on a train, in a bag marked "department". The press office is pale.',
    choices: [
      {
        id: 'own_it',
        label: 'Go on air and take responsibility',
        outcomes: [
          {
            chance: 0.6,
            text: 'You apologise without blaming the junior official. A commuter hands the laptop in the next day, unopened. Your honesty is the story, not the bag.',
            effects: [
              { system: 'approval', arg: '5' },
              { stat: 'karma', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Taking responsibility, it turns out, means being responsible. A week of questions in the chamber, and a cartoon of you as a lost-property desk.',
            effects: [
              { system: 'approval', arg: '-6' },
              { stat: 'stress', delta: 8 },
            ],
          },
        ],
      },
      {
        id: 'blame',
        label: 'Blame the official who lost it',
        outcomes: [
          {
            chance: 1,
            text: 'The official is suspended and you survive the week. Your private office is a little colder afterwards, and briefings start arriving late.',
            effects: [
              { system: 'approval', arg: '1' },
              { stat: 'karma', delta: -6 },
              { performance: -4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'polife_leaked_memo',
    kind: 'choice',
    category: 'work',
    emoji: '📄',
    ages: [21, 90],
    weight: 6,
    cooldownYears: 6,
    when: minister,
    text: 'A memo of yours is on the front page. In it you describe the government’s flagship policy as "a pudding with no recipe". You did write that, at eleven at night.',
    choices: [
      {
        id: 'stand',
        label: 'Stand by every word',
        outcomes: [
          {
            chance: 0.45,
            text: 'Voters love the honesty. The head of government does not, but cannot afford to sack you while you are this popular.',
            effects: [{ system: 'approval', arg: '8' }, { fame: 3 }, { performance: -6 }],
            success: true,
          },
          {
            chance: 0.55,
            text: 'Standing by it means standing alone. You keep the job for now, at the far end of the cabinet table, near the draught.',
            effects: [{ performance: -10 }, { stat: 'stress', delta: 8 }],
          },
        ],
      },
      {
        id: 'context',
        label: 'Say it was taken out of context',
        outcomes: [
          {
            chance: 1,
            text: 'Nobody can work out what context would make a pudding sound good. The story fades anyway, and the word "pudding" is banned from your office.',
            effects: [
              { system: 'approval', arg: '-3' },
              { stat: 'karma', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'hunt',
        label: 'Hunt down the leaker',
        outcomes: [
          {
            chance: 1,
            text: 'The inquiry costs six weeks and finds a photocopier with a memory. Your office stops writing anything down at all, which causes its own problems.',
            effects: [{ stat: 'stress', delta: 6 }, { performance: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'polife_civil_servant',
    kind: 'choice',
    category: 'work',
    emoji: '🫖',
    ages: [21, 90],
    weight: 6,
    cooldownYears: 6,
    when: minister,
    text: 'Your permanent secretary assures you that your reform is "certainly ambitious" and "worth exploring in due course". You have learned this means it will be buried with full honours.',
    choices: [
      {
        id: 'push',
        label: 'Insist, in writing, with a deadline',
        outcomes: [
          {
            chance: 0.5,
            text: 'You set a date and turn up on it, every week. Grudgingly, then quite enthusiastically, the department delivers. The permanent secretary takes the credit, graciously.',
            effects: [{ system: 'approval', arg: '5' }, { performance: 6 }],
            success: true,
          },
          {
            chance: 0.5,
            text: 'A consultation is launched. It has nine stages, and you are reshuffled after the fourth.',
            effects: [
              { stat: 'stress', delta: 6 },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'ally',
        label: 'Win them over over a long lunch',
        outcomes: [
          {
            chance: 0.6,
            text: 'It turns out they agree with you and simply object to your timetable. Over pudding, you agree a new one. The reform happens slowly and properly.',
            effects: [{ performance: 5 }, { stat: 'smarts', delta: 2 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'A lovely lunch. You come away having agreed, somehow, to delay your own reform by a year.',
            effects: [{ stat: 'happiness', delta: 2 }, { performance: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'polife_reshuffle',
    kind: 'choice',
    category: 'work',
    emoji: '🔀',
    ages: [21, 90],
    weight: 6,
    cooldownYears: 4,
    when: minister,
    text: 'Reshuffle rumours. Your name is on a list in a newspaper, under "could go". Your phone has been very quiet, which is either good or the worst sign there is.',
    choices: [
      {
        id: 'lobby',
        label: 'Ring round and remind people you exist',
        outcomes: [
          {
            chance: 0.55,
            text: 'You call in favours you had forgotten you were owed. When the list comes out you have survived, and even been given a slightly bigger car.',
            effects: [{ performance: 8 }, { stat: 'stress', delta: 5 }],
            success: true,
          },
          {
            chance: 0.45,
            text: 'Ringing round is noticed, and not admired. You keep your job but lose your seat at the good end of the table.',
            effects: [{ performance: -5 }, { stat: 'happiness', delta: -4 }],
          },
        ],
      },
      {
        id: 'work',
        label: 'Keep your head down and work',
        outcomes: [
          {
            chance: 0.6,
            text: 'You spend reshuffle day reading a report on bridges. Nobody calls. That evening, you realise you are safe and also extremely well informed about bridges.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { stat: 'stress', delta: -2 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The call comes at four. You are moved sideways to a department with a smaller budget and a bigger window.',
            effects: [{ performance: -6 }, { stat: 'happiness', delta: -5 }],
          },
        ],
      },
    ],
  },
  {
    id: 'polife_sector_strike',
    kind: 'choice',
    category: 'work',
    emoji: '✊',
    ages: [21, 90],
    weight: 6,
    cooldownYears: 5,
    when: minister,
    text: 'The nurses are striking, and it is your brief. The picket line outside the hospital is polite, freezing, and holding signs with your face on them, drawn kindly.',
    choices: [
      {
        id: 'talks',
        label: 'Go to the picket line and talk',
        outcomes: [
          {
            chance: 0.6,
            text: 'You turn up with flasks of tea and no cameras. Two weeks of honest talks later there is a deal nobody loves and everybody accepts.',
            effects: [
              { system: 'approval', arg: '7' },
              { stat: 'karma', delta: 5 },
              { stat: 'stress', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The treasury will not move, and neither will they. You leave with a cold, a sign of your face and a lot of respect for both sides.',
            effects: [
              { system: 'approval', arg: '-3' },
              { stat: 'health', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'hard',
        label: 'Call the strike irresponsible',
        outcomes: [
          {
            chance: 1,
            text: 'The papers that like you print it. The ones that do not print a photo of a nurse holding a newborn in the rain. The strike goes on, and so do the photos.',
            effects: [
              { system: 'approval', arg: '-7' },
              { stat: 'karma', delta: -4 },
            ],
          },
        ],
      },
    ],
  },

  // ---------- Head of government ----------
  {
    id: 'polife_summit',
    kind: 'choice',
    category: 'work',
    emoji: '🌐',
    ages: [21, 90],
    weight: 7,
    cooldownYears: 4,
    when: leader,
    text: 'An international summit at a lakeside hotel. Eighteen leaders, one family photo and a joint statement that will be written, as always, at four in the morning.',
    choices: [
      {
        id: 'deal',
        label: 'Stay up and broker the deal',
        outcomes: [
          {
            chance: 0.55,
            text: 'At four in the morning you find the comma that lets everyone sign. The statement is called historic, which it nearly is.',
            effects: [{ system: 'approval', arg: '6' }, { fame: 5 }, { stat: 'health', delta: -2 }],
            success: true,
          },
          {
            chance: 0.45,
            text: 'Two delegations walk out over a word in paragraph nine. You fly home with a lake-view tie and nothing to sign.',
            effects: [
              { system: 'approval', arg: '-3' },
              { stat: 'stress', delta: 7 },
            ],
          },
        ],
      },
      {
        id: 'photo',
        label: 'Smile for the photo and fly home early',
        outcomes: [
          {
            chance: 1,
            text: 'You are on the end of the photo, slightly blurred. At home nobody minds, and you sleep in your own bed, which feels like the real summit.',
            effects: [{ stat: 'stress', delta: -4 }, { fame: 1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'polife_hostile_interview',
    kind: 'choice',
    category: 'fame',
    emoji: '🎤',
    ages: [21, 90],
    weight: 7,
    cooldownYears: 4,
    when: leader,
    text: 'The country’s most feared interviewer has you for thirty minutes, live. Their first question is your own quote from twenty years ago, read back slowly.',
    choices: [
      {
        id: 'candid',
        label: 'Admit you changed your mind',
        outcomes: [
          {
            chance: 0.6,
            text: '"I was wrong, and here is what changed it." The interviewer pauses, unarmed for a second. Viewers write in about the first straight answer in years.',
            effects: [
              { system: 'approval', arg: '7' },
              { stat: 'karma', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Admitting one thing invites them to ask about the other forty. The half hour feels like a week.',
            effects: [
              { system: 'approval', arg: '-4' },
              { stat: 'stress', delta: 8 },
            ],
          },
        ],
      },
      {
        id: 'dodge',
        label: 'Answer a different question entirely',
        outcomes: [
          {
            chance: 1,
            text: 'You answer questions nobody asked for half an hour. The interviewer asks the first one fourteen times. A sketch show has its next month sorted.',
            effects: [{ system: 'approval', arg: '-6' }, { fame: 3 }, { stat: 'karma', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'polife_disaster',
    kind: 'choice',
    category: 'work',
    emoji: '🌪️',
    ages: [21, 90],
    weight: 6,
    cooldownYears: 6,
    when: leader,
    text: 'An earthquake has flattened a market town in the hills. Roads are cut, phones are down, and the reports coming in get worse with every hour.',
    choices: [
      {
        id: 'go',
        label: 'Go there yourself, tonight',
        outcomes: [
          {
            chance: 0.7,
            text: 'You arrive with the first convoy and stay three days, carrying water and listening more than talking. The country sees it. You will not forget what you saw.',
            effects: [
              { system: 'approval', arg: '9' },
              { stat: 'karma', delta: 5 },
              { stat: 'stress', delta: 10 },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'Your visit ties up a helicopter the rescuers needed. You meant well, and the headlines say so, eventually, after saying the other thing.',
            effects: [
              { system: 'approval', arg: '-4' },
              { stat: 'happiness', delta: -6 },
            ],
          },
        ],
      },
      {
        id: 'command',
        label: 'Run the response from the capital',
        outcomes: [
          {
            chance: 0.65,
            text: 'You clear the red tape in an afternoon and the army is on the roads by dawn. Nobody photographs you, and the town gets what it needs.',
            effects: [
              { system: 'approval', arg: '5' },
              { stat: 'karma', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.35,
            text: 'The response is efficient and the cameras film it without you. "Where is the leader?" asks a front page, alongside a photo of an empty chair.',
            effects: [
              { system: 'approval', arg: '-5' },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'polife_referendum',
    kind: 'choice',
    category: 'work',
    emoji: '🗳️',
    ages: [21, 90],
    weight: 5,
    cooldownYears: 8,
    when: leader,
    text: 'Your backbenchers want a referendum on electoral reform. Your advisers say you would win comfortably. Advisers have said that before, in other countries, quite famously.',
    choices: [
      {
        id: 'call',
        label: 'Call the referendum',
        outcomes: [
          {
            chance: 0.5,
            text: 'The campaign is bruising, the turnout huge, and you win by a whisker. Half the country is delighted and the other half has a new hobby.',
            effects: [{ system: 'approval', arg: '5' }, { fame: 4 }, { stat: 'stress', delta: 8 }],
            success: true,
          },
          {
            chance: 0.5,
            text: 'You lose by a whisker. You did ask, and they did answer. Your party starts openly discussing what comes after you.',
            effects: [
              { system: 'approval', arg: '-12' },
              { stat: 'happiness', delta: -8 },
              { performance: -8 },
            ],
          },
        ],
      },
      {
        id: 'refuse',
        label: 'Refuse: that is what parliaments are for',
        outcomes: [
          {
            chance: 1,
            text: 'The backbenchers grumble into their soup for a month. The question does not go away, but nor do you.',
            effects: [
              { system: 'approval', arg: '-2' },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'polife_coalition_walkout',
    kind: 'choice',
    category: 'work',
    emoji: '🤝',
    ages: [21, 90],
    weight: 6,
    cooldownYears: 5,
    when: (s) => leader(s) && governing(s),
    text: 'Your junior coalition partner threatens to walk out unless you scrap the motorway they have hated since the first day. Without them you lose your majority by four.',
    choices: [
      {
        id: 'give',
        label: 'Scrap the motorway',
        outcomes: [
          {
            chance: 1,
            text: 'The coalition survives and the motorway becomes a very expensive cycle path. Your own side calls it weakness; the partner calls it a beginning.',
            effects: [
              { system: 'approval', arg: '-2' },
              { stat: 'stress', delta: -3 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'call_bluff',
        label: 'Call their bluff',
        outcomes: [
          {
            chance: 0.55,
            text: 'They blink. The motorway goes ahead, and the coalition’s photos look strained for the rest of the term.',
            effects: [
              { system: 'approval', arg: '4' },
              { stat: 'stress', delta: 6 },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'They walk. You limp on as a minority government, negotiating every vote like a car boot sale, and sleep in short shifts.',
            effects: [
              { system: 'approval', arg: '-8' },
              { stat: 'stress', delta: 12 },
              { stat: 'health', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'polife_state_visit',
    kind: 'choice',
    category: 'fame',
    emoji: '👑',
    ages: [21, 90],
    weight: 5,
    cooldownYears: 6,
    when: leader,
    text: 'A state visit from a foreign monarch: gold carriages, a banquet for four hundred, and nine forks at your place setting. Protocol has sent you a forty-page guide on bowing.',
    choices: [
      {
        id: 'study',
        label: 'Memorise the guide',
        outcomes: [
          {
            chance: 0.7,
            text: 'You bow at exactly the right angle and use the forks outside in. The monarch remarks that you are "very correct", which counts as warmth in those circles.',
            effects: [{ fame: 3 }, { system: 'approval', arg: '2' }],
            success: true,
          },
          {
            chance: 0.3,
            text: 'You remember all forty pages and still curtsey by accident. It makes the evening news, set to music.',
            effects: [{ fame: 3 }, { stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'be_yourself',
        label: 'Be yourself and talk about gardening',
        outcomes: [
          {
            chance: 0.6,
            text: 'It turns out the monarch grows prize roses. You talk compost for an hour while the diplomats panic, and a trade deal follows soon after.',
            effects: [
              { system: 'approval', arg: '4' },
              { stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The monarch does not garden. The monarch has gardeners. The silence lasts the length of the soup.',
            effects: [{ stat: 'stress', delta: 4 }, { fame: 1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'polife_weight_of_office',
    kind: 'choice',
    category: 'work',
    emoji: '🕰️',
    ages: [21, 90],
    weight: 5,
    cooldownYears: 8,
    when: leader,
    text: 'In your first week, a general and a quiet official take you into a windowless room and explain, in plain words, what you can now order and how. Then they leave you alone with it.',
    choices: [
      {
        id: 'letter',
        label: 'Write the letter they ask you to write',
        outcomes: [
          {
            chance: 1,
            text: 'You write instructions you pray no one will ever open, seal them, and walk out into sunshine. That night you hold your own hands for a long time.',
            effects: [
              { stat: 'stress', delta: 8 },
              { stat: 'smarts', delta: 2 },
              { flag: 'pol_weight_of_office' },
            ],
          },
        ],
      },
      {
        id: 'walk',
        label: 'Ask for a minute, and take a walk',
        outcomes: [
          {
            chance: 1,
            text: 'You walk round the garden twice with a security officer five steps behind. When you come back in, you are someone else, a little older and a lot quieter.',
            effects: [
              { stat: 'stress', delta: 5 },
              { stat: 'happiness', delta: -3 },
              { stat: 'karma', delta: 2 },
              { flag: 'pol_weight_of_office' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'polife_epidemic',
    kind: 'choice',
    category: 'work',
    emoji: '🦠',
    ages: [21, 90],
    weight: 5,
    cooldownYears: 8,
    when: leader,
    text: 'A new fever is spreading through the cities. The scientists want schools shut by Friday; the treasury wants nothing shut at all. Both sides have graphs, and both graphs are frightening.',
    choices: [
      {
        id: 'early',
        label: 'Close things early and explain why',
        outcomes: [
          {
            chance: 0.6,
            text: 'The curve bends sooner than anyone dared hope. People are angry about the closures, and alive to be angry, which you will take.',
            effects: [
              { system: 'approval', arg: '6' },
              { stat: 'karma', delta: 5 },
              { stat: 'stress', delta: 10 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The closures work, and so nobody believes they were needed. A protest outside your office brings its own folding chairs.',
            effects: [
              { system: 'approval', arg: '-6' },
              { stat: 'karma', delta: 3 },
              { stat: 'stress', delta: 10 },
            ],
          },
        ],
      },
      {
        id: 'wait',
        label: 'Wait a fortnight for more data',
        outcomes: [
          {
            chance: 0.4,
            text: 'The fever burns out on its own. You look wise, and you lie awake knowing that luck did the work.',
            effects: [
              { system: 'approval', arg: '3' },
              { stat: 'stress', delta: 5 },
            ],
          },
          {
            chance: 0.6,
            text: 'The fortnight costs more than any closure would have. The hospitals fill. You will read the inquiry report for the rest of your life.',
            effects: [
              { system: 'approval', arg: '-10' },
              { stat: 'karma', delta: -5 },
              { stat: 'happiness', delta: -10 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'polife_attempt',
    kind: 'choice',
    category: 'work',
    emoji: '🛡️',
    ages: [21, 90],
    weight: 5,
    cooldownYears: 8,
    when: leader,
    text: 'At a rally, a man pushes through the crowd with something in his hand. Your bodyguard is quicker than he is. You find yourself on the ground under two officers, unhurt, ears ringing.',
    choices: [
      {
        id: 'finish',
        label: 'Get up and finish the speech',
        outcomes: [
          {
            chance: 1,
            text: 'Your hands shake on the lectern, and you finish anyway. The crowd roars. Weeks later you still flinch at car doors, and you start seeing someone about it.',
            effects: [
              { system: 'approval', arg: '10' },
              { fame: 6 },
              { stat: 'stress', delta: 14 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'leave',
        label: 'Let them get you out',
        outcomes: [
          {
            chance: 1,
            text: 'They bundle you into a car and you are home within the hour, holding a mug of tea you cannot drink. The country sends flowers by the van-load.',
            effects: [
              { system: 'approval', arg: '6' },
              { stat: 'stress', delta: 12 },
              { stat: 'happiness', delta: -6 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'polife_legacy',
    kind: 'choice',
    category: 'work',
    emoji: '📜',
    ages: [21, 90],
    weight: 5,
    cooldownYears: 8,
    when: leader,
    text: 'A historian writing your biography asks, very politely, what you think you will be remembered for. You open your mouth, and nothing comes out for longer than is comfortable.',
    choices: [
      {
        id: 'big',
        label: 'Start one big, lasting project',
        outcomes: [
          {
            chance: 0.5,
            text: 'You pick something that will outlast you: a national library in every county. The first one opens before the next election, and a child there asks who you are.',
            effects: [
              { system: 'approval', arg: '5' },
              { stat: 'karma', delta: 5 },
              { stat: 'happiness', delta: 8 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The project is so big it eats your last two years and is cancelled by your successor. The foundations are still there, under a car park.',
            effects: [
              { stat: 'happiness', delta: -6 },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'people',
        label: 'Say "the people I helped, quietly"',
        outcomes: [
          {
            chance: 1,
            text: 'The historian writes it down, then underlines it. It is the only line in the book you are proud of.',
            effects: [
              { stat: 'karma', delta: 3 },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
        ],
      },
    ],
  },

  // ---------- Governing or opposition, any level ----------
  {
    id: 'polife_opposition_rally',
    kind: 'choice',
    category: 'fame',
    emoji: '📣',
    ages: [21, 90],
    weight: 6,
    cooldownYears: 4,
    when: opposition,
    text: 'Your party is out of power and a march against the government’s latest budget is passing your office. The organisers ask if you will say a few words from the back of a lorry.',
    choices: [
      {
        id: 'speak',
        label: 'Climb up and speak',
        outcomes: [
          {
            chance: 0.6,
            text: 'You find a voice you did not know you had. Thousands chant a line you made up on the spot, and it ends up on mugs.',
            effects: [{ system: 'approval', arg: '6' }, { fame: 3 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The microphone fails after your first sentence. You mime the rest with great conviction, and are photographed doing so.',
            effects: [{ fame: 2 }, { stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Wave from the window',
        outcomes: [
          {
            chance: 1,
            text: 'The marchers wave back, mostly. One shouts "Come down then!", which is fair.',
            effects: [
              { system: 'approval', arg: '-1' },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'polife_ribbon_season',
    kind: 'choice',
    category: 'work',
    emoji: '✂️',
    ages: [21, 90],
    weight: 5,
    cooldownYears: 5,
    when: (s) => governing(s) && s.career.level <= 3,
    text: 'Your party is in power, so there is money for your patch at last: a new bridge, a clinic or a bus route. The budget covers one, and each has a delegation in your waiting room.',
    choices: [
      {
        id: 'clinic',
        label: 'The clinic',
        outcomes: [
          {
            chance: 1,
            text: 'The clinic opens eighteen months later. Nobody writes to thank you, because people only write about what goes wrong, but the waiting lists shorten.',
            effects: [
              { system: 'approval', arg: '4' },
              { stat: 'karma', delta: 4 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'bridge',
        label: 'The bridge',
        outcomes: [
          {
            chance: 0.6,
            text: 'The bridge saves twenty minutes on every commute. It is named after a local poet, not you, but you get to cut the ribbon.',
            effects: [{ system: 'approval', arg: '6' }, { fame: 1 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The bridge runs a year late and twice over budget. It is beautiful. The cost is the only thing anyone mentions.',
            effects: [
              { system: 'approval', arg: '-4' },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'bus',
        label: 'The bus route',
        outcomes: [
          {
            chance: 1,
            text: 'The number 41 runs again to the outlying villages. Pensioners treat it like a social club, and the driver learns everyone’s name.',
            effects: [
              { system: 'approval', arg: '3' },
              { stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
    ],
  },
];
