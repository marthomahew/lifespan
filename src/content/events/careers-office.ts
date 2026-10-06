import type { EventDef } from '../../engine/events/types';
import { all, inField, isJob, jobLevelAtLeast, oddsBy } from './conditions';

/** Field-specific working life: technology, finance, arts and retail each feel different. */
export const CAREER_OFFICE_EVENTS: EventDef[] = [
  // ---------- technology ----------
  {
    id: 'car_tech_outage_pager',
    kind: 'choice',
    category: 'work',
    ages: [22, 60],
    weight: 8,
    cooldownYears: 5,
    when: inField('technology'),
    bind: { col: { role: 'coworker' } },
    text: 'At 3:12 a.m. your phone screams. Production is down, the status page says "all systems normal," and {col.first} has already posted a single skull emoji in the incident channel.',
    choices: [
      {
        id: 'dig',
        label: 'Open the laptop and start reading logs',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.55),
            text: 'A config file expired at midnight like milk. You renew it, everything wakes up, and the morning standup applauds a person still wearing one sock.',
            effects: [
              { performance: 8 },
              { skill: 'programming', delta: 3 },
              { stat: 'stress', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'Four hours of guessing later the system recovers on its own, for reasons nobody will ever learn. You write a confident postmortem anyway.',
            effects: [
              { performance: 2 },
              { stat: 'stress', delta: 8 },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'wake',
        label: 'Call {col.first}, who wrote the thing',
        outcomes: [
          {
            chance: 1,
            text: '{col.first} answers on the first ring, fixes it in six minutes, and makes sure you hear the yawn. The debt is now on record.',
            effects: [
              { performance: 3 },
              { rel: 'col', delta: -4, memory: 'the 3 a.m. phone call' },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'sleep',
        label: 'Silence it. Surely someone else is on call',
        outcomes: [
          {
            chance: 0.3,
            text: 'Someone else was, in fact, on call. You wake up rested and slightly guilty, which is the best way to wake up.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'karma', delta: -1 },
            ],
          },
          {
            chance: 0.7,
            text: 'Nobody else was on call. The outage runs until breakfast and your name is the first line of the timeline.',
            effects: [
              { performance: -10 },
              { stat: 'stress', delta: 7 },
              { rel: 'col', delta: -3, memory: 'the night you slept through the pager' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_tech_legacy_module',
    kind: 'choice',
    category: 'work',
    ages: [22, 60],
    weight: 7,
    cooldownYears: 6,
    when: inField('technology'),
    text: 'You inherit a fourteen-year-old file called final_v2_REAL_use_this. Its only comment reads "do not touch, ask Gerald." Gerald left the company before smartphones.',
    choices: [
      {
        id: 'rewrite',
        label: 'Rewrite it from scratch',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.4),
            text: 'Three weeks later your clean version runs twice as fast and is readable by humans. You frame the old file as a warning.',
            effects: [
              { performance: 7 },
              { skill: 'programming', delta: 4 },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.6,
            text: "Your rewrite is elegant and breaks invoicing for an entire region. It turns out Gerald's nonsense was holding up a wall.",
            effects: [{ performance: -7 }, { stat: 'stress', delta: 6 }],
          },
        ],
      },
      {
        id: 'wrap',
        label: 'Wrap it in tests and leave it alone',
        outcomes: [
          {
            chance: 1,
            text: 'You build a careful fence of tests around the beast. It keeps working, and now you know exactly how strange it is.',
            effects: [
              { performance: 3 },
              { skill: 'programming', delta: 2 },
              { stat: 'stress', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'add',
        label: 'Add one more comment: "ask me"',
        outcomes: [
          {
            chance: 1,
            text: 'You have joined a fourteen-year tradition. The file feels heavier somehow.',
            effects: [
              { stat: 'happiness', delta: 1 },
              { stat: 'karma', delta: -1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_tech_dashboard_green',
    kind: 'choice',
    category: 'work',
    ages: [24, 62],
    weight: 7,
    cooldownYears: 7,
    when: all(inField('technology'), jobLevelAtLeast(1)),
    bind: { boss: { role: 'boss' } },
    text: '{boss.first} reviews your metrics dashboard before the board meeting and asks if the red line could be "more of a calm orange." The red line is customer churn.',
    choices: [
      {
        id: 'honest',
        label: 'Keep it red and explain why',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.5),
            text: 'You walk {boss.first} through the numbers until the colour stops mattering. The board funds a fix, and your slide gets quoted.',
            effects: [
              { performance: 6 },
              { rel: 'boss', delta: 3, memory: 'the red line you defended' },
              { stat: 'karma', delta: 2 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: '{boss.first} presents your slide with a thumb placed carefully over the bad part. Nobody asks you to the next one.',
            effects: [
              { performance: -3 },
              { rel: 'boss', delta: -4, memory: 'the slide you would not recolour' },
            ],
          },
        ],
      },
      {
        id: 'orange',
        label: 'Make it a calm orange',
        outcomes: [
          {
            chance: 1,
            text: 'The board admires the warm palette and moves on. You save the original chart in a folder you name "later."',
            effects: [
              { performance: 4 },
              { rel: 'boss', delta: 4, memory: 'the orange chart' },
              { stat: 'karma', delta: -3 },
            ],
            next: { eventId: 'car_tech_dashboard_reckoning', inYears: [1, 3] },
          },
        ],
      },
    ],
  },
  {
    id: 'car_tech_dashboard_reckoning',
    kind: 'choice',
    category: 'work',
    ages: [25, 64],
    weight: 8,
    chainOnly: true,
    when: inField('technology'),
    bind: { boss: { role: 'boss' } },
    text: 'The churn caught up with the orange. An auditor wants to know who built the chart, and {boss.first} has suddenly forgotten your shared love of warm colours.',
    choices: [
      {
        id: 'folder',
        label: 'Produce the "later" folder',
        outcomes: [
          {
            chance: 1,
            text: 'The original red chart, timestamped and untouched, makes you the only person in the room with a clean story. {boss.first} never quite forgives the folder.',
            effects: [
              { performance: 5 },
              { stat: 'karma', delta: 3 },
              { rel: 'boss', delta: -10, memory: 'the folder named later' },
              { stat: 'stress', delta: 4 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'cover',
        label: 'Say the colour was your idea',
        outcomes: [
          {
            chance: 1,
            text: 'You take the blame with a straight face. {boss.first} owes you enormously and you both know it, which is its own kind of job security.',
            effects: [
              { performance: -8 },
              { rel: 'boss', delta: 8, memory: 'the blame you took for the orange' },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'vague',
        label: 'Blame the default colour palette',
        outcomes: [
          {
            chance: 0.5,
            text: 'The auditor writes "software defaults" in a notebook and moves on. You feel like you got away with a very small, very dull crime.',
            effects: [
              { stat: 'stress', delta: -2 },
              { stat: 'karma', delta: -2 },
            ],
          },
          {
            chance: 0.5,
            text: 'The auditor pulls up the edit history, which has your name and the word "calm" in it. Your next review is short and chilly.',
            effects: [{ performance: -10 }, { stat: 'stress', delta: 8 }],
          },
        ],
      },
    ],
  },

  // ---------- finance ----------
  {
    id: 'car_fin_penny_audit',
    kind: 'choice',
    category: 'work',
    ages: [22, 62],
    weight: 8,
    cooldownYears: 6,
    when: inField('finance'),
    bind: { col: { role: 'coworker' } },
    text: 'The year-end books are off by exactly the smallest coin there is. Not a note, not a rounding error you can name: one coin, somewhere among forty thousand entries. {col.first} suggests buying a calculator with a better attitude.',
    choices: [
      {
        id: 'hunt',
        label: 'Hunt the missing coin down',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.5),
            text: 'At 11 p.m. you find it: a refund entered twice and reversed once, by a ghost. The books balance and you feel like a detective in a very boring film.',
            effects: [
              { performance: 7 },
              { stat: 'smarts', delta: 2 },
              { stat: 'stress', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'Two days, no coin. You start seeing decimal points when you close your eyes.',
            effects: [{ performance: -2 }, { stat: 'stress', delta: 8 }],
          },
        ],
      },
      {
        id: 'plug',
        label: 'Post a one-coin adjustment and go home',
        outcomes: [
          {
            chance: 0.7,
            text: 'Nobody notices. The cent haunts nobody but you.',
            effects: [
              { stat: 'stress', delta: -3 },
              { stat: 'karma', delta: -1 },
            ],
          },
          {
            chance: 0.3,
            text: 'The external auditor notices, because finding your cent is the entire job. A sternly polite memo follows.',
            effects: [{ performance: -6 }, { stat: 'stress', delta: 4 }],
          },
        ],
      },
      {
        id: 'team',
        label: 'Make it a team contest with a prize',
        outcomes: [
          {
            chance: 1,
            text: '{col.first} finds the cent in forty minutes and wins a cake shaped like a coin. The office has not been this happy since the coffee machine was fixed.',
            effects: [
              { performance: 3 },
              { money: -45 },
              { rel: 'col', delta: 6, memory: 'the one-cent cake' },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_fin_dog_coin',
    kind: 'choice',
    category: 'work',
    ages: [24, 64],
    weight: 7,
    cooldownYears: 6,
    when: all(inField('finance'), jobLevelAtLeast(1)),
    text: "A client in his sixties wants to move his whole retirement fund into a new digital token named after his neighbour's dog. He has a printout. The dog is on the printout.",
    choices: [
      {
        id: 'talk',
        label: 'Talk him into a sensible plan',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.55),
            text: 'You agree on a tiny "fun" slice and a boring rest. Six months later the token is worth less than the printout and he sends you a thank-you fruit basket.',
            effects: [
              { performance: 6 },
              { stat: 'karma', delta: 3 },
              { stat: 'happiness', delta: 2 },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'He calls you a dinosaur and takes his account to a firm with a cartoon mascot. Your monthly numbers sag.',
            effects: [{ performance: -5 }, { stat: 'stress', delta: 3 }],
          },
        ],
      },
      {
        id: 'doit',
        label: 'It is his money. Process it',
        outcomes: [
          {
            chance: 0.25,
            text: 'The dog token triples for one glorious week. He sells, buys a boat, and names it after you.',
            effects: [{ performance: 4 }, { stat: 'happiness', delta: 3 }],
          },
          {
            chance: 0.75,
            text: 'The token collapses in a month. Compliance wants to know why the file has no record of you warning him, and so does his daughter.',
            effects: [
              { performance: -9 },
              { stat: 'stress', delta: 7 },
              { stat: 'karma', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'dog',
        label: 'Ask to meet the dog first',
        outcomes: [
          {
            chance: 1,
            text: 'The dog is a twelve-year-old basset hound with no ambitions. The client looks at the dog, then at his printout, and quietly folds it in half.',
            effects: [{ performance: 3 }, { stat: 'happiness', delta: 4 }],
          },
        ],
      },
    ],
  },
  {
    id: 'car_fin_coin_jar',
    kind: 'choice',
    category: 'work',
    ages: [18, 50],
    weight: 7,
    cooldownYears: 5,
    when: isJob('bank_teller'),
    text: 'Ten minutes before closing, a man heaves a water-cooler bottle full of loose coins onto your counter. He has been saving since the previous century, and he would like it counted by hand, now, while he watches.',
    choices: [
      {
        id: 'count',
        label: 'Count every coin, cheerfully',
        outcomes: [
          {
            chance: 1,
            text: 'It takes ninety minutes and comes to just over {money:400}. He shakes your hand with a palm that smells of copper and tells your manager you are a credit to banking.',
            effects: [
              { performance: 6 },
              { stat: 'stress', delta: 3 },
              { stat: 'karma', delta: 2 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'machine',
        label: 'Insist on the coin machine',
        outcomes: [
          {
            chance: 0.6,
            text: 'He grumbles, the machine roars, and you are out the door on time with ringing ears.',
            effects: [{ stat: 'stress', delta: -2 }],
          },
          {
            chance: 0.4,
            text: 'The machine chokes on a foreign coin and a button. It is now out of service, and so, it seems, is your evening.',
            effects: [{ performance: -3 }, { stat: 'stress', delta: 5 }],
          },
        ],
      },
      {
        id: 'tomorrow',
        label: 'Ask him to come back tomorrow morning',
        outcomes: [
          {
            chance: 1,
            text: 'He leaves the bottle on the counter "as a reservation." The night guard is not thrilled.',
            effects: [{ performance: -2 }, { stat: 'happiness', delta: 1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'car_fin_weekend_deal',
    kind: 'notice',
    category: 'work',
    ages: [26, 64],
    weight: 6,
    cooldownYears: 6,
    when: all(inField('finance'), jobLevelAtLeast(2)),
    text: 'A merger lands on a Friday at 6 p.m., the way they always do, and the weekend dissolves into spreadsheets and cold dumplings.',
    outcomes: [
      {
        chance: 0.6,
        text: 'By Monday the deal closes and a bonus memo with your name on it circulates upstairs. You sleep for most of Tuesday.',
        effects: [
          { performance: 6 },
          { money: 4000 },
          { stat: 'stress', delta: 6 },
          { stat: 'health', delta: -2 },
        ],
        success: true,
      },
      {
        chance: 0.4,
        text: 'The other side walks away on Sunday night over a parking clause. Sixty hours of work go into an archive folder nobody will open.',
        effects: [
          { performance: 1 },
          { stat: 'stress', delta: 7 },
          { stat: 'happiness', delta: -4 },
        ],
      },
    ],
  },

  // ---------- arts ----------
  {
    id: 'car_arts_logo_more',
    kind: 'choice',
    category: 'work',
    ages: [20, 60],
    weight: 8,
    cooldownYears: 5,
    when: inField('arts'),
    text: 'The client loves the logo. They just want it "more." More what, you ask. "More," they repeat, spreading their hands like a sunrise. The invoice depends on this.',
    choices: [
      {
        id: 'same',
        label: 'Send the same logo back, slightly bigger',
        outcomes: [
          {
            chance: 0.55,
            text: '"Yes! That is exactly it." You bill them for the revision and feel nothing.',
            effects: [{ performance: 4 }, { money: 300 }, { stat: 'karma', delta: -1 }],
            success: true,
          },
          {
            chance: 0.45,
            text: 'They notice. A long email arrives with the subject line "hmm," copying their entire leadership team.',
            effects: [{ performance: -5 }, { stat: 'stress', delta: 4 }],
          },
        ],
      },
      {
        id: 'explore',
        label: 'Make twelve wildly different versions',
        outcomes: [
          {
            chance: 1,
            text: 'Version nine, the one you made at midnight out of spite, is the one they choose. It is genuinely better, which annoys you.',
            effects: [{ performance: 6 }, { skill: 'art', delta: 3 }, { stat: 'stress', delta: 4 }],
          },
        ],
      },
      {
        id: 'ask',
        label: 'Ask them to name three things it should feel',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.5),
            text: 'They say "trusted, fast, a bit like a fox." Suddenly there is a brief. You deliver in two days and they frame the sketches.',
            effects: [
              { performance: 7 },
              { skill: 'art', delta: 2 },
              { stat: 'happiness', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'They name "more" three times in different tones of voice. You stare at the ceiling for a while.',
            effects: [
              { stat: 'stress', delta: 5 },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_arts_exposure_offer',
    kind: 'choice',
    category: 'work',
    ages: [20, 55],
    weight: 7,
    cooldownYears: 6,
    when: inField('arts'),
    text: 'A restaurant owner offers to put your work on the menu cover "for exposure." He mentions twice that thousands of people will see it, and zero times that anyone will pay for it.',
    choices: [
      {
        id: 'quote',
        label: 'Send him your actual rate',
        outcomes: [
          {
            chance: 0.4,
            text: 'He winces, pays, and the menu turns out lovely. You get two paying clients from people who read it waiting for soup.',
            effects: [{ money: 900 }, { performance: 4 }, { stat: 'happiness', delta: 3 }],
            success: true,
          },
          {
            chance: 0.6,
            text: 'He replies "never mind, my nephew draws" and the menu cover later features a horse with five legs.',
            effects: [{ stat: 'happiness', delta: 2 }],
          },
        ],
      },
      {
        id: 'free',
        label: 'Do it for free and a lifetime of bread',
        outcomes: [
          {
            chance: 1,
            text: 'Your work is on every table in the neighbourhood and the bread is excellent. The exposure buys you exactly no rent.',
            effects: [{ skill: 'art', delta: 2 }, { stat: 'happiness', delta: 2 }, { fame: 1 }],
          },
        ],
      },
      {
        id: 'counter',
        label: 'Propose free dinners for a year instead',
        outcomes: [
          {
            chance: 1,
            text: 'He agrees on the spot. For twelve months you eat like royalty and talk about light and shadow with the chef.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'health', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_arts_source_tip',
    kind: 'choice',
    category: 'work',
    ages: [23, 60],
    weight: 7,
    once: true,
    when: all(inField('arts'), isJob('journalist')),
    bind: { boss: { role: 'boss' } },
    text: 'A nervous clerk from the city water office slips you a folder in a car park and asks you to wait before publishing. {boss.first}, your editor, wants a front page by Friday.',
    choices: [
      {
        id: 'wait',
        label: 'Sit on it and keep digging',
        outcomes: [
          {
            chance: 1,
            text: 'You tell {boss.first} the story is "not ready," which goes down like a cold coffee. The folder stays in your bottom drawer, growing.',
            effects: [
              { performance: -3 },
              { rel: 'boss', delta: -4, memory: 'the front page you held back' },
              { stat: 'karma', delta: 2 },
              { skill: 'writing', delta: 2 },
            ],
            next: { eventId: 'car_arts_source_story', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'run',
        label: 'Run it Friday',
        outcomes: [
          {
            chance: 0.5,
            text: 'The story lands and the city scrambles. Within a week the clerk is "on leave," and your phone stops ringing from that office forever.',
            effects: [
              { performance: 6 },
              { fame: 2 },
              { stat: 'karma', delta: -4 },
              { stat: 'stress', delta: 3 },
            ],
          },
          {
            chance: 0.5,
            text: 'Half the folder is missing context. The city issues a correction to your story before you can, which is a special kind of humiliating.',
            effects: [{ performance: -8 }, { stat: 'stress', delta: 6 }],
          },
        ],
      },
      {
        id: 'pass',
        label: 'Hand the folder to a colleague',
        outcomes: [
          {
            chance: 1,
            text: 'You keep your Fridays quiet. Someone else wins an award two years later and thanks you in a footnote.',
            effects: [
              { stat: 'stress', delta: -3 },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_arts_source_story',
    kind: 'choice',
    category: 'work',
    ages: [24, 63],
    weight: 8,
    chainOnly: true,
    when: inField('arts'),
    bind: { boss: { role: 'boss' } },
    text: 'The drawer folder has grown into a real investigation: dates, second sources, a pipe that was never replaced. The clerk finally says go. {boss.first} reads the draft without blinking once.',
    choices: [
      {
        id: 'publish',
        label: 'Publish under your own name',
        outcomes: [
          {
            chance: 1,
            text: 'The piece runs across two pages and the city announces repairs within a month. {boss.first} pins your byline to the newsroom wall, next to the fire exit map.',
            effects: [
              { performance: 10 },
              { fame: 4 },
              { skill: 'writing', delta: 3 },
              { rel: 'boss', delta: 8, memory: 'the water story you were right to wait on' },
              { stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'share',
        label: 'Share the byline with the clerk',
        outcomes: [
          {
            chance: 1,
            text: 'The clerk becomes the face of it and you become the quiet craftsman behind it. Sources start calling you first.',
            effects: [
              { performance: 6 },
              { stat: 'karma', delta: 4 },
              { rel: 'boss', delta: 4, memory: 'the shared water byline' },
            ],
          },
        ],
      },
      {
        id: 'sell',
        label: 'Pitch it to a bigger outlet instead',
        outcomes: [
          {
            chance: 0.5,
            text: 'A national desk buys it for a sum that makes you blink. {boss.first} finds out from the newsstand.',
            effects: [
              { money: 6000 },
              { fame: 3 },
              { performance: -10 },
              { rel: 'boss', delta: -12, memory: 'the story you sold out from under the paper' },
            ],
          },
          {
            chance: 0.5,
            text: 'The national desk sits on it for months and then passes. By then the story is stale and your editor is cool towards you.',
            effects: [
              { performance: -5 },
              { stat: 'happiness', delta: -5 },
              { rel: 'boss', delta: -5, memory: 'the story you shopped around' },
            ],
          },
        ],
      },
    ],
  },

  // ---------- retail ----------
  {
    id: 'car_retail_month_end',
    kind: 'choice',
    category: 'work',
    ages: [20, 60],
    weight: 8,
    cooldownYears: 4,
    when: isJob('car_salesperson'),
    bind: { col: { role: 'coworker' } },
    text: 'It is 4 p.m. on the last day of the month and you are one sale short of your bonus. A young couple is circling a hatchback, and {col.first} is circling the couple.',
    choices: [
      {
        id: 'charm',
        label: 'Get there first with your warmest handshake',
        outcomes: [
          {
            chance: oddsBy('looks', 0.5),
            text: 'You find them a fair price, throw in floor mats, and sign at 5:58. The bonus clears and {col.first} stares at you over the coffee machine.',
            effects: [
              { performance: 7 },
              { money: 1500 },
              { rel: 'col', delta: -5, memory: 'the hatchback you swooped on' },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'They thank you warmly and leave to "think about it," which in this building means forever.',
            effects: [
              { stat: 'stress', delta: 4 },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'split',
        label: 'Offer {col.first} a split commission',
        outcomes: [
          {
            chance: 1,
            text: 'You work the couple as a double act. Both of you hit target, and {col.first} brings you a celebratory sandwich of uncertain origin.',
            effects: [
              { performance: 4 },
              { money: 700 },
              { rel: 'col', delta: 6, memory: 'the month-end double act' },
            ],
          },
        ],
      },
      {
        id: 'honest',
        label: 'Tell them to come back next week for a better deal',
        outcomes: [
          {
            chance: 1,
            text: 'They come back next week, buy two cars, and send their parents. You miss this bonus and secure several future ones.',
            effects: [
              { performance: 3 },
              { stat: 'karma', delta: 3 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_retail_worn_return',
    kind: 'choice',
    category: 'work',
    ages: [18, 55],
    weight: 7,
    cooldownYears: 5,
    when: inField('retail'),
    text: 'A customer wants to return a party dress "unworn." It smells strongly of smoke machine and there is confetti in the hem. The receipt is from a holiday that ended three months ago.',
    choices: [
      {
        id: 'refuse',
        label: 'Politely point out the confetti',
        outcomes: [
          {
            chance: 0.5,
            text: 'She studies the confetti, laughs, and admits it was a great party. You offer store credit and part as friends.',
            effects: [{ performance: 4 }, { stat: 'happiness', delta: 2 }],
            success: true,
          },
          {
            chance: 0.5,
            text: "She asks for your manager, your manager's manager and, eventually, the name of the person who founded the shop.",
            effects: [{ stat: 'stress', delta: 6 }, { performance: -1 }],
          },
        ],
      },
      {
        id: 'accept',
        label: 'Process the refund to make her leave',
        outcomes: [
          {
            chance: 1,
            text: 'She leaves triumphant. Your till comes up short on returns again and the area manager starts a spreadsheet with your initials.',
            effects: [{ performance: -4 }, { stat: 'stress', delta: -2 }],
          },
        ],
      },
      {
        id: 'party',
        label: 'Ask where the party was',
        outcomes: [
          {
            chance: 1,
            text: 'Twenty minutes of story later, she buys a second dress for the next one. Nobody mentions the first dress again.',
            effects: [{ performance: 5 }, { stat: 'happiness', delta: 3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'car_retail_wedding_colours',
    kind: 'choice',
    category: 'work',
    ages: [20, 60],
    weight: 7,
    cooldownYears: 6,
    when: isJob('florist'),
    text: 'The day before her wedding, a bride calls to say the colour scheme is now "dusk," not "blush." You have two hundred pink peonies in the cooler and no idea what colour dusk is.',
    choices: [
      {
        id: 'allnight',
        label: 'Work through the night to rebuild it',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.55),
            text: 'By dawn you have invented dusk out of plum roses, dyed thistle and sheer stubbornness. The bride cries the good kind of tears.',
            effects: [
              { performance: 8 },
              { money: 600 },
              { skill: 'art', delta: 2 },
              { stat: 'stress', delta: 6 },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'At 5 a.m. dusk looks mostly like bruises. You deliver it anyway and the photographer adjusts the lighting very carefully.',
            effects: [
              { performance: -3 },
              { stat: 'stress', delta: 8 },
              { stat: 'health', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'reframe',
        label: 'Convince her blush is actually early dusk',
        outcomes: [
          {
            chance: 0.6,
            text: 'You describe the sky at half past seven with such conviction that she agrees. The peonies are saved.',
            effects: [{ performance: 4 }, { stat: 'happiness', delta: 3 }],
          },
          {
            chance: 0.4,
            text: 'She is not convinced, and her mother leaves a review that mentions "a florist with opinions about the sky."',
            effects: [{ performance: -5 }, { stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'surcharge',
        label: 'Agree, with a rush surcharge',
        outcomes: [
          {
            chance: 1,
            text: 'She pays it without blinking. You sell the peonies to a funeral home and a sweet sixteen, and somehow come out ahead.',
            effects: [{ money: 900 }, { performance: 3 }, { stat: 'stress', delta: 4 }],
          },
        ],
      },
    ],
  },
  {
    id: 'car_retail_holiday_rush',
    kind: 'notice',
    category: 'work',
    ages: [18, 50],
    weight: 6,
    cooldownYears: 4,
    when: inField('retail'),
    text: 'The holiday season arrives like weather. For six weeks the shop plays the same nine songs and you fold the same sweater roughly four hundred times.',
    outcomes: [
      {
        chance: 0.5,
        text: 'Sales beat last year and the manager hands out bonus envelopes with a little drawing of a snowman on each.',
        effects: [{ performance: 5 }, { money: 300 }, { stat: 'stress', delta: 5 }],
        success: true,
      },
      {
        chance: 0.5,
        text: 'By January you can hum the jingles backwards and flinch at the sound of tissue paper. You survive, mostly.',
        effects: [
          { stat: 'stress', delta: 7 },
          { stat: 'happiness', delta: -3 },
        ],
      },
    ],
  },
];
