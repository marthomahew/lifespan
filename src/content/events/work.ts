import type { EventDef } from '../../engine/events/types';
import { canAfford, hasJob, isJob, oddsBy, officeJob } from './conditions';

/** Workplace events across a working life. Every one needs a job. */
export const WORK_EVENTS: EventDef[] = [
  // ---------- 18–29 ----------
  {
    id: 'work_ya_meeting_email',
    kind: 'choice',
    category: 'work',
    ages: [18, 29],
    weight: 9,
    cooldownYears: 5,
    when: officeJob,
    bind: { boss: { role: 'boss' } },
    text: '{boss.first} has booked a ninety-minute meeting titled "Alignment Touchpoint" to read out an agenda that was already in the invite. You are slide nine of nothing.',
    choices: [
      {
        id: 'suggest',
        label: 'Suggest it could have been an email',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.45),
            text: 'You phrase it so diplomatically that {boss.first} thinks it was {boss.their} idea. Meetings shrink to twenty minutes and you are quietly a legend.',
            effects: [
              { performance: 6 },
              { rel: 'boss', delta: 4, memory: 'the meeting you shortened' },
              { stat: 'stress', delta: -3 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: '{boss.first} thanks you for the feedback and schedules a separate meeting to discuss meeting length.',
            effects: [
              { performance: -4 },
              { rel: 'boss', delta: -4, memory: 'your comment about the touchpoint' },
            ],
          },
        ],
      },
      {
        id: 'doodle',
        label: 'Nod and draw a castle in your notebook',
        outcomes: [
          {
            chance: 1,
            text: 'By minute eighty the castle has a moat, a drawbridge and a small tax system. You remember none of the meeting.',
            effects: [
              { skill: 'art', delta: 2 },
              { stat: 'happiness', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'work',
        label: 'Answer emails under the table',
        outcomes: [
          {
            chance: 0.7,
            text: 'You clear your inbox while appearing deeply engaged. Efficiency, of a sort.',
            effects: [{ performance: 3 }],
          },
          {
            chance: 0.3,
            text: 'Your laptop is still shared to the projector. Everyone now knows your opinion of the quarterly plan.',
            effects: [
              { performance: -8 },
              { rel: 'boss', delta: -6, memory: 'what was on the projector' },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'work_ya_fridge_yogurt',
    kind: 'choice',
    category: 'work',
    ages: [18, 29],
    weight: 9,
    cooldownYears: 6,
    when: hasJob,
    bind: { cw: { role: 'coworker' } },
    text: 'Your yogurt has vanished from the office fridge for the third week running. Then you spot {cw.first} at {cw.their} desk, eating a yogurt with your exact name written on the lid.',
    choices: [
      {
        id: 'confront',
        label: 'Point at the lid, silently',
        outcomes: [
          {
            chance: 0.6,
            text: '{cw.first} goes crimson, buys you a twelve-pack of yogurt and never touches the fridge again.',
            effects: [
              { rel: 'cw', delta: -2, memory: 'the yogurt lid incident' },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: "'Oh, is this yours? I thought it was a brand.' {cw.first} keeps eating.",
            effects: [
              { rel: 'cw', delta: -6, memory: 'the yogurt you claimed' },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'trap',
        label: 'Leave a decoy yogurt full of hot sauce',
        outcomes: [
          {
            chance: 1,
            text: 'A shriek from the kitchen confirms justice. HR sends a company-wide note about food safety that is clearly about you.',
            effects: [
              { rel: 'cw', delta: -10, memory: 'the hot sauce yogurt' },
              { performance: -3 },
              { stat: 'happiness', delta: 6 },
              { stat: 'karma', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'cooler',
        label: 'Buy a tiny lunch cooler',
        outcomes: [
          {
            chance: 1,
            text: 'The cooler has a combination lock. Your lunches are safe and you are now known as the person with the lunch safe.',
            effects: [{ money: -40 }, { stat: 'stress', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'work_ya_credit_thief',
    kind: 'choice',
    category: 'work',
    ages: [20, 26],
    weight: 9,
    cooldownYears: 8,
    when: officeJob,
    bind: { cw: { role: 'coworker' }, boss: { role: 'boss' } },
    text: 'In the team meeting, {cw.first} presents your fix for the billing bug as {cw.their} own, using your diagram, your joke and your exact pause before the punchline.',
    choices: [
      {
        id: 'callout',
        label: 'Ask a question only the author could answer',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.5),
            text: '{cw.first} stalls. You answer it yourself, in detail. {boss.first} writes your name down in a small, significant way.',
            effects: [
              { performance: 9 },
              { rel: 'cw', delta: -12, memory: 'the question in the billing meeting' },
              { rel: 'boss', delta: 5, memory: 'how you explained the billing fix' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: '{cw.first} bluffs through it with total confidence. You come off as someone who heckles colleagues.',
            effects: [
              { performance: -5 },
              { rel: 'cw', delta: -8, memory: 'being heckled in the billing meeting' },
            ],
          },
        ],
      },
      {
        id: 'later',
        label: 'Say nothing and keep receipts',
        outcomes: [
          {
            chance: 1,
            text: 'You start a folder named "Evidence" with timestamps. It feels petty and wonderful. {cw.first} looks a little too relaxed.',
            effects: [{ stat: 'stress', delta: 4 }, { flag: 'work_credit_receipts' }],
            next: { eventId: 'work_ya_credit_thief_return', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'let',
        label: 'Let it go',
        outcomes: [
          {
            chance: 1,
            text: 'You tell yourself the work matters more than the credit. Your paycheque does not agree.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { stat: 'karma', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'work_ya_credit_thief_return',
    kind: 'choice',
    category: 'work',
    ages: [21, 29],
    weight: 10,
    chainOnly: true,
    when: hasJob,
    bind: { cw: { role: 'coworker' }, boss: { role: 'boss' } },
    text: '{cw.first} is up for a promotion, and {boss.first} asks you for a candid opinion of {cw.their} work. Your "Evidence" folder is open in another tab.',
    choices: [
      {
        id: 'send',
        label: 'Forward the folder',
        outcomes: [
          {
            chance: 0.65,
            text: 'The timestamps speak for themselves. {cw.first} does not get the role. You do, a month later.',
            effects: [
              { job: 'promote' },
              { performance: 8 },
              { rel: 'cw', delta: -20, memory: 'the evidence folder' },
              { rel: 'boss', delta: 6, memory: 'your well-documented candour' },
              { unflag: 'work_credit_receipts' },
            ],
            success: true,
          },
          {
            chance: 0.35,
            text: '{boss.first} skims it and calls it "a lot." You are now the person who keeps files on colleagues.',
            effects: [
              { performance: -6 },
              { rel: 'boss', delta: -5, memory: 'the folder you kept on a teammate' },
              { unflag: 'work_credit_receipts' },
            ],
          },
        ],
      },
      {
        id: 'honest',
        label: 'Say they present well and leave it there',
        outcomes: [
          {
            chance: 1,
            text: '{cw.first} gets the job and, oddly, starts crediting you in every meeting. Guilt, or strategy. You take it either way.',
            effects: [
              { rel: 'cw', delta: 8, memory: 'the reference you gave' },
              { performance: 3 },
              { stat: 'karma', delta: 3 },
              { unflag: 'work_credit_receipts' },
            ],
          },
        ],
      },
      {
        id: 'delete',
        label: 'Delete the folder and feel lighter',
        outcomes: [
          {
            chance: 1,
            text: 'The folder goes. So does a knot in your shoulders you had stopped noticing.',
            effects: [{ stat: 'stress', delta: -6 }, { unflag: 'work_credit_receipts' }],
          },
        ],
      },
    ],
  },
  {
    id: 'work_ya_outage',
    kind: 'choice',
    category: 'work',
    ages: [19, 29],
    weight: 8,
    cooldownYears: 6,
    when: officeJob,
    text: 'At 4:10 p.m. every screen in the building turns blue at once. Someone in the next row whispers, "It was only a small update."',
    choices: [
      {
        id: 'fix',
        label: 'Roll up your sleeves and dig in',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.4),
            text: 'You find the loose cable, the bad setting and the one server nobody labelled. The lights come back with you at the helm.',
            effects: [
              { performance: 12 },
              { skill: 'programming', delta: 4 },
              { stat: 'stress', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'You press a button that makes the screens turn a different shade of blue. IT asks you, kindly, to step away.',
            effects: [{ performance: -3 }, { stat: 'stress', delta: 3 }],
          },
        ],
      },
      {
        id: 'leave',
        label: 'Declare it a sign and go home',
        outcomes: [
          {
            chance: 0.6,
            text: 'Half the office follows you. Nobody can prove anything was lost.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'stress', delta: -4 },
            ],
          },
          {
            chance: 0.4,
            text: 'Systems return at 4:30. Your empty chair is on the security camera at 4:12.',
            effects: [{ performance: -7 }],
          },
        ],
      },
      {
        id: 'snacks',
        label: 'Organise snacks for the stranded',
        outcomes: [
          {
            chance: 1,
            text: 'You turn a disaster into a picnic. Morale peaks during the worst hour of the quarter.',
            effects: [
              { performance: 3 },
              { money: -30 },
              { stat: 'happiness', delta: 3 },
              { status: 'friend' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'work_ya_team_building',
    fromYear: 2008,
    kind: 'choice',
    category: 'work',
    ages: [18, 29],
    weight: 8,
    cooldownYears: 6,
    when: hasJob,
    bind: { cw: { role: 'coworker' } },
    text: 'The team-building day is an escape room themed around "synergy." You are locked in with {cw.first}, a manager who wants to lead, and a padlock with no visible keyhole.',
    choices: [
      {
        id: 'solve',
        label: 'Take charge of the puzzles',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.45),
            text: 'You crack it in eighteen minutes. The staff have never seen this. {cw.first} tells everyone the next morning.',
            effects: [
              { performance: 5 },
              { rel: 'cw', delta: 6, memory: 'the escape room record' },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'You confidently insist on the wrong code for forty minutes. The staff release you with pity.',
            effects: [
              { performance: -2 },
              { rel: 'cw', delta: -3, memory: 'your wrong code in the escape room' },
            ],
          },
        ],
      },
      {
        id: 'sit',
        label: 'Sit on the fake treasure chest and chat',
        outcomes: [
          {
            chance: 1,
            text: 'You and {cw.first} never find the key but discover you both hate the same podcast. That counts.',
            effects: [{ rel: 'cw', delta: 9, memory: 'the chat on the treasure chest' }],
          },
        ],
      },
      {
        id: 'sick',
        label: 'Call in sick that morning',
        outcomes: [
          {
            chance: 1,
            text: 'You miss the escape room and the team photo, which is now framed in reception without you.',
            effects: [{ performance: -3 }, { stat: 'stress', delta: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'work_ya_first_review',
    kind: 'choice',
    category: 'work',
    ages: [18, 26],
    weight: 8,
    cooldownYears: 7,
    when: hasJob,
    bind: { boss: { role: 'boss' } },
    text: 'Your performance review form asks you to rate yourself from 1 to 5 on "Embodies Our Values." Nobody has ever told you the values. {boss.first} is waiting for it by noon.',
    choices: [
      {
        id: 'five',
        label: 'Give yourself straight fives',
        outcomes: [
          {
            chance: 0.5,
            text: '{boss.first} admires the confidence. You get a small raise and a sticky note that says "bold!"',
            effects: [{ job: 'raise' }, { rel: 'boss', delta: 3, memory: 'your all-fives review' }],
            success: true,
          },
          {
            chance: 0.5,
            text: '{boss.first} spends the review gently explaining why you are a three. For an hour.',
            effects: [{ performance: -4 }, { stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'three',
        label: 'Threes across the board',
        outcomes: [
          {
            chance: 1,
            text: 'The review takes eight minutes. Nobody learns anything. You get the standard pay bump and a free pen.',
            effects: [{ performance: 1 }],
          },
        ],
      },
      {
        id: 'essay',
        label: 'Write a thoughtful essay about growth',
        outcomes: [
          {
            chance: 1,
            text: '{boss.first} quotes your essay in a leadership newsletter. Without your name, but still.',
            effects: [
              { skill: 'writing', delta: 3 },
              { performance: 4 },
              { rel: 'boss', delta: 4, memory: 'your essay on growth' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'work_ya_new_badge',
    kind: 'notice',
    category: 'work',
    ages: [18, 25],
    weight: 6,
    once: true,
    when: officeJob,
    text: 'Your security badge photo was taken mid-sneeze.',
    outcomes: [
      {
        chance: 0.5,
        text: 'Facilities say a reprint takes six to eight weeks. The lobby guard now greets you with "Bless you."',
        effects: [{ stat: 'happiness', delta: -1 }],
      },
      {
        chance: 0.5,
        text: 'It becomes a minor office meme. People who never spoke to you before now say hello.',
        effects: [{ stat: 'happiness', delta: 2 }, { performance: 2 }],
      },
    ],
  },
  {
    id: 'work_ya_rumour',
    kind: 'notice',
    category: 'work',
    ages: [21, 29],
    weight: 6,
    cooldownYears: 8,
    when: hasJob,
    bind: { cw: { role: 'coworker' } },
    text: 'You and {cw.first} were seen sharing an umbrella to the bus stop, and everyone at work has decided it is a love story.',
    outcomes: [
      {
        chance: 0.6,
        text: 'You both deny it so firmly that it only gets worse. The kitchen whiteboard now has a heart drawn on it with your initials.',
        effects: [
          { rel: 'cw', delta: 3, memory: 'the umbrella rumour' },
          { stat: 'stress', delta: 3 },
        ],
      },
      {
        chance: 0.4,
        text: 'The story dies within a week when someone in accounts announces an engagement and everyone moves on.',
        effects: [{ rel: 'cw', delta: 2, memory: 'the week everyone thought you were a couple' }],
      },
    ],
  },
  {
    id: 'work_ya_cold_coffee',
    kind: 'choice',
    category: 'work',
    ages: [18, 24],
    weight: 7,
    cooldownYears: 6,
    when: hasJob,
    bind: { boss: { role: 'boss' } },
    text: '{boss.first} wants the coffee run: nine drinks, each with a modification so specific it sounds like a password. The order is not written down.',
    choices: [
      {
        id: 'memory',
        label: 'Memorise it, like a hero',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.5),
            text: 'You get all nine right, including the oat-milk half-shot thing. Respect follows you back up the stairs.',
            effects: [
              { performance: 4 },
              { rel: 'boss', delta: 3, memory: 'the perfect coffee run' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: '{boss.first} sips and says nothing, which is worse than anything {boss.they} could say.',
            effects: [{ performance: -2 }, { stat: 'stress', delta: 2 }],
          },
        ],
      },
      {
        id: 'same',
        label: 'Order nine identical lattes',
        outcomes: [
          {
            chance: 1,
            text: 'You announce it as a team unity initiative. Two people are delighted. Seven are not.',
            effects: [{ stat: 'happiness', delta: 2 }, { performance: -1 }],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Point out it is not in your job description',
        outcomes: [
          {
            chance: 1,
            text: 'Technically correct. {boss.first} fetches the coffee alone, and the air in the office stays cool for a month.',
            effects: [
              { rel: 'boss', delta: -5, memory: 'the coffee run you refused' },
              { stat: 'karma', delta: 1 },
            ],
          },
        ],
      },
    ],
  },

  // ---------- 30–49 ----------
  {
    id: 'work_ad_client_from_hell',
    kind: 'choice',
    category: 'work',
    ages: [30, 44],
    weight: 9,
    cooldownYears: 6,
    when: isJob('graphic_designer', 'architect', 'journalist', 'photographer', 'web_developer'),
    text: 'A client wants the logo "bigger, but also smaller," the colour "blue, but not like that," and the final version yesterday. This is the eleventh round.',
    choices: [
      {
        id: 'patient',
        label: 'Smile and do round twelve',
        outcomes: [
          {
            chance: 0.6,
            text: 'Round twelve is identical to round one. The client calls it perfect. You stare at a wall for a while.',
            effects: [{ performance: 6 }, { stat: 'stress', delta: 6 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Round twelve leads to round thirteen. You start dreaming in shades of blue.',
            effects: [
              { stat: 'stress', delta: 9 },
              { stat: 'health', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'push',
        label: 'Bill them for every extra round',
        outcomes: [
          {
            chance: 0.55,
            text: 'The invoice arrives and the feedback stops overnight. Clarity, it turns out, has a price.',
            effects: [{ performance: 8 }, { money: 800 }],
          },
          {
            chance: 0.45,
            text: 'They take their logo elsewhere and leave a review describing you as "rigid." Your manager frames the loss as a learning.',
            effects: [{ performance: -8 }, { stat: 'stress', delta: 3 }],
          },
        ],
      },
      {
        id: 'fire',
        label: 'Tell them exactly what you think',
        outcomes: [
          {
            chance: 0.25,
            text: 'Shockingly, they respect it, sign a three-year contract and send you a fruit basket.',
            effects: [{ performance: 10 }, { stat: 'happiness', delta: 6 }],
            success: true,
          },
          {
            chance: 0.75,
            text: 'The call is recorded. By Thursday you are clearing your desk into a printer-paper box.',
            effects: [
              { job: 'fire' },
              { stat: 'happiness', delta: -8 },
              { stat: 'stress', delta: -4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'work_ad_headhunter',
    kind: 'choice',
    category: 'work',
    ages: [30, 44],
    weight: 8,
    cooldownYears: 8,
    when: officeJob,
    text: "A headhunter named Priya Okonkwo-Lund messages: \"Exciting opportunity, can't say where, can't say what, but the salary is a number you'll like.\" She wants a call during lunch.",
    choices: [
      {
        id: 'leverage',
        label: 'Tell your boss you have an offer',
        outcomes: [
          {
            chance: 0.55,
            text: 'Your manager panics and matches a salary that did not exist yet. Congratulations on your bluff.',
            effects: [{ job: 'raise' }, { stat: 'happiness', delta: 5 }],
            success: true,
          },
          {
            chance: 0.45,
            text: '"We\'d hate to stand in your way," your manager says, standing very much out of the way. Your projects quietly go to others.',
            effects: [{ performance: -10 }, { stat: 'stress', delta: 6 }],
          },
        ],
      },
      {
        id: 'call',
        label: 'Take the call, out of curiosity',
        outcomes: [
          {
            chance: 1,
            text: 'The mystery role is your current job at a rival firm, for a little less money. You hang up oddly flattered.',
            effects: [{ stat: 'happiness', delta: 2 }],
          },
        ],
      },
      {
        id: 'ignore',
        label: 'Leave her on read',
        outcomes: [
          {
            chance: 1,
            text: 'She messages twice more, then wishes you "all the best on your journey." Loyalty, untested.',
            effects: [{ performance: 1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'work_ad_burnout',
    kind: 'choice',
    category: 'work',
    ages: [30, 49],
    weight: 8,
    cooldownYears: 7,
    when: officeJob,
    text: 'You realise you have read the same email nine times without understanding it, and that you cannot remember your last weekend. Your eye has developed a small, persistent twitch.',
    choices: [
      {
        id: 'leave',
        label: 'Take two weeks off, phone in a drawer',
        outcomes: [
          {
            chance: 1,
            text: 'The first three days are pure guilt. By day ten you remember you like birds. You come back slower and better.',
            effects: [
              { stat: 'stress', delta: -15 },
              { stat: 'happiness', delta: 6 },
              { performance: -3 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'push',
        label: 'Push through, one more quarter',
        outcomes: [
          {
            chance: 0.4,
            text: 'You hit every target and feel nothing. Your manager calls you "a rock." Rocks do not sleep, apparently.',
            effects: [
              { performance: 8 },
              { stat: 'stress', delta: 10 },
              { stat: 'health', delta: -4 },
            ],
          },
          {
            chance: 0.6,
            text: 'You fall asleep in a client meeting, briefly but audibly. Everyone pretends it was a long blink.',
            effects: [{ performance: -9 }, { stat: 'stress', delta: 8 }],
          },
        ],
      },
      {
        id: 'therapy',
        label: 'Book a therapist',
        requires: canAfford(600),
        outcomes: [
          {
            chance: 1,
            text: 'She asks why you answer emails at 1 a.m. You do not have a good answer. Over a few months, you stop.',
            effects: [
              { money: -600 },
              { stat: 'stress', delta: -10 },
              { stat: 'smarts', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'work_ad_work_trip',
    kind: 'choice',
    category: 'work',
    ages: [30, 49],
    weight: 8,
    cooldownYears: 6,
    when: officeJob,
    bind: { cw: { role: 'coworker' } },
    text: 'You and {cw.first} are sent to a conference in a beige hotel by a motorway. The keynote is called "Disrupting the Disruptors." The bar has a happy hour.',
    choices: [
      {
        id: 'network',
        label: 'Network like your career depends on it',
        outcomes: [
          {
            chance: oddsBy('looks', 0.45),
            text: 'You collect forty business cards and two real leads. Your expense report is immaculate.',
            effects: [{ performance: 8 }, { stat: 'stress', delta: 3 }],
            success: true,
          },
          {
            chance: 0.5,
            text: 'You spend twenty minutes pitching to a man who turns out to be the hotel plumber. Lovely chap.',
            effects: [{ performance: 1 }, { stat: 'happiness', delta: 2 }],
          },
        ],
      },
      {
        id: 'bar',
        label: 'Happy hour with {cw.first}',
        outcomes: [
          {
            chance: 0.6,
            text: 'You and {cw.first} rank every session on a napkin. It is the best work you do all year.',
            effects: [
              { rel: 'cw', delta: 10, memory: 'the napkin rankings at the conference' },
              { stat: 'happiness', delta: 5 },
            ],
          },
          {
            chance: 0.4,
            text: 'Happy hour becomes happy four hours. You miss your own panel the next morning.',
            effects: [
              { performance: -8 },
              { rel: 'cw', delta: 4, memory: 'the conference bar' },
              { vice: 'alcohol', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'room',
        label: 'Room service and an early night',
        outcomes: [
          {
            chance: 1,
            text: 'You eat a club sandwich in bed watching a cooking competition in a language you do not speak. Bliss.',
            effects: [
              { stat: 'stress', delta: -5 },
              { skill: 'cooking', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'work_ad_bad_boss',
    kind: 'choice',
    category: 'work',
    ages: [30, 44],
    weight: 8,
    cooldownYears: 8,
    when: officeJob,
    bind: { boss: { role: 'boss' } },
    text: '{boss.first} has started CC-ing {boss.their} own manager on every reply to you, including the one that said "sounds good."',
    choices: [
      {
        id: 'skip',
        label: 'Go over their head',
        outcomes: [
          {
            chance: 0.5,
            text: 'Turns out {boss.first} does this to everyone. The big boss sighs, nods and has a word. The CCs stop overnight.',
            effects: [
              { performance: 5 },
              { rel: 'boss', delta: -8, memory: 'going over their head' },
              { stat: 'stress', delta: -5 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The big boss and {boss.first} play golf together. You learn this too late.',
            effects: [
              { performance: -10 },
              { rel: 'boss', delta: -12, memory: 'the complaint you filed' },
            ],
          },
        ],
      },
      {
        id: 'cc',
        label: 'CC everyone back, cheerfully',
        outcomes: [
          {
            chance: 1,
            text: 'Soon every email has nine executives on it. Someone higher up announces a new "CC policy." Nobody is happy, but you feel seen.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { rel: 'boss', delta: -4, memory: 'the CC arms race' },
            ],
          },
        ],
      },
      {
        id: 'talk',
        label: 'Ask for a frank one-to-one',
        outcomes: [
          {
            chance: 1,
            text: '{boss.first} admits {boss.they} {boss.is} terrified of {boss.their} own review. You leave weirdly allies.',
            effects: [
              { rel: 'boss', delta: 9, memory: 'the honest one-to-one' },
              { performance: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'work_ad_moonshot',
    kind: 'choice',
    category: 'work',
    ages: [31, 44],
    weight: 7,
    cooldownYears: 10,
    when: officeJob,
    bind: { boss: { role: 'boss' } },
    text: '{boss.first} offers you the "Phoenix Project," a doomed initiative that has already burned through two leads. If it works, everyone wins. If not, it has your name on it.',
    choices: [
      {
        id: 'take',
        label: 'Take it on',
        outcomes: [
          {
            chance: 1,
            text: 'You accept, buy a whiteboard, and stop seeing daylight. It will be a while before anyone knows if it worked.',
            effects: [
              { stat: 'stress', delta: 8 },
              { performance: 4 },
              { rel: 'boss', delta: 4, memory: 'taking on the Phoenix Project' },
            ],
            next: { eventId: 'work_ad_moonshot_result', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'decline',
        label: 'Decline politely',
        outcomes: [
          {
            chance: 1,
            text: 'The project goes to someone in sales, who renames it "Phoenix 2.0." You watch from a safe distance.',
            effects: [{ rel: 'boss', delta: -3, memory: 'turning down the Phoenix Project' }],
          },
        ],
      },
    ],
  },
  {
    id: 'work_ad_moonshot_result',
    kind: 'notice',
    category: 'work',
    ages: [32, 47],
    weight: 10,
    chainOnly: true,
    when: hasJob,
    bind: { boss: { role: 'boss' } },
    text: 'The Phoenix Project finally reaches its launch day.',
    outcomes: [
      {
        chance: oddsBy('smarts', 0.45),
        text: 'It works. Spectacularly. {boss.first} takes you to lunch, then into a meeting about your new title.',
        effects: [
          { job: 'promote' },
          { performance: 12 },
          { rel: 'boss', delta: 8, memory: 'the Phoenix launch' },
          { stat: 'happiness', delta: 8 },
        ],
        success: true,
      },
      {
        chance: 0.4,
        text: 'It works, sort of, and the meeting about it lasts longer than the project did. Nobody is blamed, which here counts as a triumph.',
        effects: [{ performance: 4 }, { stat: 'stress', delta: -4 }],
      },
      {
        chance: 0.2,
        text: 'It crashes before lunch. {boss.first} remembers, in a meeting, that the whole thing was your idea.',
        effects: [
          { performance: -12 },
          { rel: 'boss', delta: -6, memory: 'the Phoenix launch' },
          { stat: 'stress', delta: 6 },
        ],
      },
    ],
  },
  {
    id: 'work_ad_reply_all_storm',
    fromYear: 1995,
    kind: 'notice',
    category: 'work',
    ages: [30, 44],
    weight: 6,
    cooldownYears: 8,
    when: officeJob,
    text: 'Someone sends a company newsletter to all six thousand staff, and the replies begin: "Please remove me," "Please stop replying," "Who is this?"',
    outcomes: [
      {
        chance: 0.5,
        text: 'By noon your inbox holds four hundred emails and a thriving subculture. You get nothing done and bond with strangers across three time zones.',
        effects: [{ performance: -3 }, { stat: 'happiness', delta: 3 }],
      },
      {
        chance: 0.5,
        text: 'You set up one rule to delete them all and accidentally delete a week of real mail with it.',
        effects: [{ performance: -6 }, { stat: 'stress', delta: 4 }],
      },
    ],
  },
  {
    id: 'work_ad_mentor',
    kind: 'notice',
    category: 'work',
    ages: [34, 49],
    weight: 6,
    cooldownYears: 10,
    when: hasJob,
    bind: { cw: { role: 'coworker' } },
    text: '{cw.first} asks for advice on a tricky project and, with no warning, calls you a mentor.',
    outcomes: [
      {
        chance: 0.7,
        text: 'You give advice you did not know you had. It works. You walk home a little taller than you left.',
        effects: [
          { rel: 'cw', delta: 8, memory: 'the advice you gave on the tricky project' },
          { performance: 4 },
          { stat: 'happiness', delta: 4 },
        ],
      },
      {
        chance: 0.3,
        text: 'Your advice is confident and wrong. {cw.first} is far too polite to mention it, which is how you know.',
        effects: [{ rel: 'cw', delta: -2, memory: 'your confident advice' }, { performance: -2 }],
      },
    ],
  },
  {
    id: 'work_ad_open_plan',
    kind: 'choice',
    category: 'work',
    ages: [30, 49],
    weight: 7,
    cooldownYears: 8,
    when: officeJob,
    bind: { cw: { role: 'coworker' } },
    text: 'The office goes "hot-desking." Your desk is gone. Your plant is in a box marked LOST PROPERTY. {cw.first} has taken the last seat by a window.',
    choices: [
      {
        id: 'early',
        label: 'Arrive at 6:45 to claim the window',
        outcomes: [
          {
            chance: 1,
            text: 'You win the window every day. You also win a new relationship with the cleaning crew and a deep fatigue.',
            effects: [
              { performance: 3 },
              { stat: 'stress', delta: 4 },
              { stat: 'discipline', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'home',
        label: 'Work from home more often',
        outcomes: [
          {
            chance: 0.6,
            text: 'Your productivity goes up and your trousers become theoretical.',
            effects: [{ performance: 5 }, { stat: 'happiness', delta: 4 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Out of sight, out of mind: you are left off the invitation to the planning offsite.',
            effects: [{ performance: -5 }],
          },
        ],
      },
      {
        id: 'treaty',
        label: 'Negotiate a window treaty with {cw.first}',
        outcomes: [
          {
            chance: 1,
            text: 'Mondays and Wednesdays are yours. {cw.first} draws up a laminated rota. It is the most functional thing in the building.',
            effects: [
              { rel: 'cw', delta: 7, memory: 'the window treaty' },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
    ],
  },

  // ---------- 50–64 ----------
  {
    id: 'work_mid_restructure',
    kind: 'choice',
    category: 'work',
    ages: [50, 64],
    weight: 8,
    cooldownYears: 8,
    when: officeJob,
    bind: { boss: { role: 'boss' } },
    text: 'Consultants in identical vests have been interviewing everyone about "what you do, exactly." {boss.first} asks you to justify your role in one slide.',
    choices: [
      {
        id: 'slide',
        label: 'Make the best slide of your life',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.5),
            text: 'The slide is so clear that the consultants steal it for their final report. You survive the cuts with a better title.',
            effects: [
              { performance: 10 },
              { skill: 'writing', delta: 2 },
              { stat: 'stress', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Your slide has a typo in the headline. You survive, but the vests look at you differently.',
            effects: [{ performance: -4 }, { stat: 'stress', delta: 5 }],
          },
        ],
      },
      {
        id: 'package',
        label: 'Ask about a voluntary package',
        outcomes: [
          {
            chance: 1,
            text: 'The package is generous and the exit interview brief. You walk out at lunchtime holding a cheque and your old mug.',
            effects: [{ money: 25000 }, { job: 'fire' }, { stat: 'stress', delta: -10 }],
          },
        ],
      },
      {
        id: 'ally',
        label: 'Remind {boss.first} who trained {boss.them}',
        outcomes: [
          {
            chance: 1,
            text: '{boss.first} goes pink and quietly takes your name off a list. Neither of you ever mentions it.',
            effects: [
              { rel: 'boss', delta: -3, memory: 'being reminded who trained them' },
              { performance: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'work_mid_new_software',
    kind: 'choice',
    category: 'work',
    ages: [50, 64],
    weight: 7,
    cooldownYears: 8,
    when: officeJob,
    text: 'The company is replacing the old system you have mastered over fifteen years with a new one that has a cartoon mascot and no undo button.',
    choices: [
      {
        id: 'learn',
        label: 'Learn it properly',
        outcomes: [
          {
            chance: 1,
            text: 'Within a month you know its shortcuts better than the trainer. Younger staff start sending you questions, half embarrassed.',
            effects: [{ skill: 'programming', delta: 3 }, { performance: 6 }],
            success: true,
          },
        ],
      },
      {
        id: 'resist',
        label: 'Keep a secret copy of the old one',
        outcomes: [
          {
            chance: 0.5,
            text: 'Your secret system ends up saving month-end close. Nobody may ever know, but you know.',
            effects: [{ performance: 7 }, { stat: 'happiness', delta: 4 }],
          },
          {
            chance: 0.5,
            text: 'IT discovers the shadow system and writes a ten-page memo about compliance. Your name is in it eleven times.',
            effects: [{ performance: -9 }, { stat: 'stress', delta: 6 }],
          },
        ],
      },
      {
        id: 'mascot',
        label: 'Name the mascot and make peace',
        outcomes: [
          {
            chance: 1,
            text: 'You call it Gerald and start greeting it each morning. The software is still terrible, but Gerald helps.',
            effects: [
              { stat: 'stress', delta: -3 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'work_mid_rival_return',
    kind: 'choice',
    category: 'work',
    ages: [50, 64],
    weight: 7,
    cooldownYears: 10,
    when: hasJob,
    bind: { cw: { role: 'coworker' } },
    text: '{cw.first} has been here almost as long as you, and you have both been quietly competing for the same promotion for a decade. It has finally come free.',
    choices: [
      {
        id: 'campaign',
        label: 'Campaign openly for it',
        outcomes: [
          {
            chance: oddsBy('looks', 0.45),
            text: 'You win the office. It has a window, a radiator that sings, and a view of {cw.first} looking wounded.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { rel: 'cw', delta: -8, memory: 'the corner office' },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: '{cw.first} gets it. {cw.They} put{cw.s} a plant on the sill specifically so you can see it.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { rel: 'cw', delta: -4, memory: 'the corner office campaign' },
            ],
          },
        ],
      },
      {
        id: 'share',
        label: 'Propose sharing it',
        outcomes: [
          {
            chance: 1,
            text: 'Management is baffled but agrees. You and {cw.first} end up having lunch together every Friday, after ten years of glaring.',
            effects: [
              { rel: 'cw', delta: 14, memory: 'sharing the corner office' },
              { stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'cede',
        label: 'Let {cw.first} have it',
        outcomes: [
          {
            chance: 1,
            text: '{cw.first} is suspicious for a week, then sends you a card. You did not expect to feel so relieved.',
            effects: [
              { rel: 'cw', delta: 8, memory: 'giving up the corner office' },
              { stat: 'stress', delta: -4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'work_mid_milestone',
    kind: 'notice',
    category: 'work',
    ages: [50, 64],
    weight: 5,
    cooldownYears: 10,
    when: hasJob,
    text: 'HR sends a long-service email with a link to choose a reward from a catalogue.',
    outcomes: [
      {
        chance: 0.5,
        text: 'You choose a wooden salad bowl. It is a very good salad bowl. You feel strangely seen by it.',
        effects: [{ stat: 'happiness', delta: 3 }],
      },
      {
        chance: 0.5,
        text: 'The link has expired. HR replies that they will "circle back," and never do.',
        effects: [{ stat: 'happiness', delta: -2 }, { performance: -1 }],
      },
    ],
  },
  {
    id: 'work_mid_young_star',
    kind: 'choice',
    category: 'work',
    ages: [50, 64],
    weight: 7,
    cooldownYears: 8,
    when: hasJob,
    bind: { cw: { role: 'coworker', maxAge: 32 } },
    text: '{cw.first}, twenty-something and brilliant, has redone in an afternoon the report that took you a week. {cw.They} ask{cw.s} if you would mind checking it.',
    choices: [
      {
        id: 'mentor',
        label: 'Check it carefully and teach what you can',
        outcomes: [
          {
            chance: 1,
            text: 'You spot two errors only experience would catch. {cw.first} is grateful, and starts bringing you every hard problem.',
            effects: [
              { rel: 'cw', delta: 10, memory: 'the report you checked' },
              { performance: 6 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'sabotage',
        label: 'Sit on it for a few days',
        outcomes: [
          {
            chance: 0.5,
            text: 'The deadline passes. {cw.first} takes the blame gracefully, and you feel like a villain in a small film.',
            effects: [
              { rel: 'cw', delta: -10, memory: 'the report you held up' },
              { stat: 'karma', delta: -4 },
            ],
          },
          {
            chance: 0.5,
            text: '{cw.first} goes straight to the boss. Your delay becomes the story.',
            effects: [
              { performance: -10 },
              { rel: 'cw', delta: -8, memory: 'the report you held up' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'work_mid_pension_talk',
    kind: 'choice',
    category: 'work',
    ages: [55, 64],
    weight: 7,
    cooldownYears: 6,
    when: hasJob,
    bind: { boss: { role: 'boss' } },
    text: '{boss.first} keeps asking about your "plans for the next chapter" and slid a retirement brochure under your keyboard. It\'s the third this month.',
    choices: [
      {
        id: 'nothing',
        label: 'Say you plan to work forever',
        outcomes: [
          {
            chance: 1,
            text: '{boss.first} laughs nervously. You laugh confidently. You both know you have won this round.',
            effects: [
              { performance: 3 },
              { rel: 'boss', delta: -3, memory: 'your plan to work forever' },
            ],
          },
        ],
      },
      {
        id: 'hint',
        label: 'Hint that you might, for the right package',
        outcomes: [
          {
            chance: 0.6,
            text: 'Within a week you have a raise to stay "through the transition." Negotiation is just patience in a cardigan.',
            effects: [{ job: 'raise' }, { stat: 'happiness', delta: 4 }],
            success: true,
          },
          {
            chance: 0.4,
            text: '{boss.first} takes the hint and starts planning your farewell drinks. You had not quite meant it.',
            effects: [{ performance: -5 }, { stat: 'stress', delta: 4 }],
          },
        ],
      },
    ],
  },

  // ---------- 65–75 ----------
  {
    id: 'work_sr_still_here',
    kind: 'choice',
    category: 'work',
    ages: [65, 75],
    weight: 7,
    cooldownYears: 6,
    when: hasJob,
    bind: { cw: { role: 'coworker' } },
    text: '{cw.first} asks, kindly but directly, why you are still working when you could be "golfing or something." Several people lean in for the answer.',
    choices: [
      {
        id: 'joke',
        label: '"Because I hate golf."',
        outcomes: [
          {
            chance: 1,
            text: 'It gets a big laugh. You become a sort of office oracle, consulted on everything from printers to divorce.',
            effects: [
              { rel: 'cw', delta: 6, memory: 'your answer about golf' },
              { stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'truth',
        label: 'Tell the truth: you like it',
        outcomes: [
          {
            chance: 1,
            text: 'The room goes quiet in a good way. {cw.first} says {cw.they} hope{cw.s} {cw.they} feel{cw.s} like that one day.',
            effects: [
              { rel: 'cw', delta: 8, memory: 'the day you said you liked your job' },
              { performance: 3 },
            ],
          },
        ],
      },
      {
        id: 'doubt',
        label: 'Start to wonder yourself',
        outcomes: [
          {
            chance: 1,
            text: 'You go home and look at a brochure for a river cruise for an hour. The seed is planted.',
            effects: [{ stat: 'stress', delta: 2 }, { flag: 'thinking_of_retiring' }],
          },
        ],
      },
    ],
  },
  {
    id: 'work_sr_farewell_cake',
    kind: 'notice',
    category: 'work',
    ages: [65, 75],
    weight: 5,
    cooldownYears: 5,
    when: hasJob,
    text: 'A cake appears in the break room for a colleague retiring after thirty years. The icing misspells their name.',
    outcomes: [
      {
        chance: 0.5,
        text: 'You eat a slice and realise you have outlasted almost everyone in the farewell photos on the wall.',
        effects: [{ stat: 'happiness', delta: 2 }],
      },
      {
        chance: 0.5,
        text: 'Someone asks if your farewell is next. You say, "Not yet." The cake tastes better for it.',
        effects: [{ stat: 'happiness', delta: 3 }, { performance: 1 }],
      },
    ],
  },
  {
    id: 'work_sr_knowledge',
    kind: 'choice',
    category: 'work',
    ages: [65, 75],
    weight: 6,
    cooldownYears: 8,
    when: officeJob,
    bind: { boss: { role: 'boss' } },
    text: '{boss.first} wants you to write down "everything you know" before you inevitably leave. You are the only person who understands the invoicing system, which is older than half the staff.',
    choices: [
      {
        id: 'write',
        label: 'Write the definitive manual',
        outcomes: [
          {
            chance: 1,
            text: 'Eighty pages, with diagrams and jokes. It becomes known as The Book, consulted in hushed tones.',
            effects: [
              { skill: 'writing', delta: 4 },
              { performance: 8 },
              { rel: 'boss', delta: 5, memory: 'The Book' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'keep',
        label: 'Keep it all in your head',
        outcomes: [
          {
            chance: 1,
            text: 'Job security, the old-fashioned way. {boss.first} smiles at you with a thin and calculated patience.',
            effects: [
              { rel: 'boss', delta: -4, memory: 'the knowledge you kept to yourself' },
              { performance: 2 },
            ],
          },
        ],
      },
      {
        id: 'retire',
        label: 'Use it to negotiate a consulting fee',
        outcomes: [
          {
            chance: 0.6,
            text: 'They agree to pay you handsomely for two afternoons a month. Your colleagues are equal parts outraged and inspired.',
            effects: [{ job: 'raise' }, { stat: 'happiness', delta: 5 }],
          },
          {
            chance: 0.4,
            text: 'They hire a consultant half your age who rebuilds the invoicing system in a weekend. It is somehow worse.',
            effects: [{ performance: -6 }, { stat: 'happiness', delta: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'work_sr_reading_glasses',
    kind: 'choice',
    category: 'work',
    ages: [65, 75],
    weight: 6,
    cooldownYears: 6,
    when: officeJob,
    text: 'In a client presentation you realise the small print on your own slides is a grey blur, and your reading glasses are on your head.',
    choices: [
      {
        id: 'improvise',
        label: 'Improvise from memory',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.5),
            text: 'Decades of experience take over. The client says it was the most natural pitch they have heard all year.',
            effects: [{ performance: 7 }, { stat: 'happiness', delta: 3 }],
            success: true,
          },
          {
            chance: 0.4,
            text: "You confidently present last year's figures. A junior colleague corrects you, gently and in public.",
            effects: [{ performance: -5 }, { stat: 'stress', delta: 3 }],
          },
        ],
      },
      {
        id: 'admit',
        label: 'Laugh and find your glasses',
        outcomes: [
          {
            chance: 1,
            text: 'The client laughs too and admits to owning six pairs. The meeting warms up considerably.',
            effects: [{ performance: 3 }, { stat: 'stress', delta: -2 }],
          },
        ],
      },
    ],
  },
];
