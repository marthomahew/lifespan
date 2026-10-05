import type { EventDef } from '../../engine/events/types';
import { all, inField, isJob, jobLevelAtLeast, oddsBy } from './conditions';

/** Field-specific working lives: healthcare, education, science and law. */
export const CAREER_CARE_EVENTS: EventDef[] = [
  // ---------- healthcare ----------
  {
    id: 'car_health_double_shift',
    kind: 'choice',
    category: 'work',
    ages: [20, 58],
    weight: 8,
    cooldownYears: 5,
    when: inField('healthcare'),
    bind: { col: { role: 'coworker' } },
    text: 'The night shift is two people down and {col.first} is already on {col.their} fourteenth hour. The rota manager looks at you the way a lifeguard looks at a buoy.',
    choices: [
      {
        id: 'stay',
        label: 'Stay for the double',
        outcomes: [
          {
            chance: 0.7,
            text: 'You make it to dawn on vending-machine crackers and adrenaline. {col.first} buys you breakfast, and the ward remembers who stayed.',
            effects: [
              { performance: 7 },
              { stat: 'stress', delta: 8 },
              { stat: 'health', delta: -3 },
              { rel: 'col', delta: 8, memory: 'the night you stayed for the double' },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'Around four in the morning you chart a blood pressure on the wrong patient. A colleague catches it. You go home shaking.',
            effects: [
              { performance: -3 },
              { stat: 'stress', delta: 12 },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'half',
        label: 'Offer four more hours, not eight',
        outcomes: [
          {
            chance: 1,
            text: 'You cover the worst stretch and hand over at two. The manager sighs, then writes your name in the good column anyway.',
            effects: [
              { performance: 3 },
              { stat: 'stress', delta: 3 },
              { rel: 'col', delta: 3, memory: 'the four hours you covered' },
            ],
          },
        ],
      },
      {
        id: 'leave',
        label: 'Go home and sleep',
        outcomes: [
          {
            chance: 1,
            text: 'You sleep nine hours and feel guilty for roughly two of them. {col.first} is polite with you for a fortnight, which is worse than rude.',
            effects: [
              { stat: 'stress', delta: -4 },
              { stat: 'health', delta: 2 },
              { rel: 'col', delta: -6, memory: 'the night you went home' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_health_lost_patient',
    kind: 'choice',
    category: 'work',
    ages: [22, 60],
    weight: 6,
    cooldownYears: 7,
    when: all(inField('healthcare'), jobLevelAtLeast(1)),
    text: 'A patient you have looked after for three weeks dies early on a Tuesday. Their daughter is in the corridor holding two coffees, one of them for you.',
    choices: [
      {
        id: 'sit',
        label: 'Sit with her for a while',
        outcomes: [
          {
            chance: 1,
            text: 'You sit, you listen, and you tell her one true thing about her father. She thanks you. You carry it home, and it is heavy.',
            effects: [
              { stat: 'karma', delta: 6 },
              { stat: 'stress', delta: 5 },
              { stat: 'happiness', delta: -3 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'brief',
        label: 'Say something kind and return to the ward',
        outcomes: [
          {
            chance: 1,
            text: 'Four other patients need you before lunch. You do the job well and think about her coffee all afternoon.',
            effects: [
              { performance: 3 },
              { stat: 'stress', delta: 4 },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'debrief',
        label: 'Ask for the staff debrief',
        outcomes: [
          {
            chance: 1,
            text: 'The debrief is a small room, bad biscuits and people who understand. You leave a little lighter than you went in.',
            effects: [{ system: 'therapy' }, { stat: 'happiness', delta: -1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'car_health_near_miss',
    kind: 'choice',
    category: 'work',
    ages: [20, 58],
    weight: 7,
    cooldownYears: 6,
    when: inField('healthcare'),
    bind: { col: { role: 'coworker' } },
    text: 'During handover you notice {col.first} has written up a dose with an extra zero on it. Nobody has given it yet. {col.They} {col.is} already putting on {col.their} coat.',
    choices: [
      {
        id: 'report',
        label: 'Fix it and file an incident report',
        outcomes: [
          {
            chance: 1,
            text: 'You correct the chart and fill in the form, every box of it. {col.first} goes pale and then very quiet. The safety team says they will be in touch.',
            effects: [
              { performance: 4 },
              { stat: 'karma', delta: 4 },
              { rel: 'col', delta: -8, memory: 'the incident report you filed' },
            ],
            success: true,
            next: { eventId: 'car_health_near_miss_review', inYears: [1, 2] },
          },
        ],
      },
      {
        id: 'quiet',
        label: 'Fix it and tell only {col.first}',
        outcomes: [
          {
            chance: 0.75,
            text: '{col.first} looks at the chart, swears softly and hugs you in the sluice room. You have a friend for life, or at least for this ward.',
            effects: [{ rel: 'col', delta: 12, memory: 'the zero you caught at handover' }],
          },
          {
            chance: 0.25,
            text: 'A pharmacist spots the corrected entry in an audit and asks why nobody reported it. You have no good answer.',
            effects: [
              { performance: -6 },
              { stat: 'stress', delta: 7 },
              { rel: 'col', delta: 4, memory: 'the audit you took the heat for' },
            ],
          },
        ],
      },
      {
        id: 'ignore',
        label: 'Assume the night team will spot it',
        outcomes: [
          {
            chance: 1,
            text: 'The night team does spot it, eventually, and asks who signed the handover. Your initials are right there.',
            effects: [
              { performance: -8 },
              { stat: 'karma', delta: -5 },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_health_near_miss_review',
    kind: 'choice',
    category: 'work',
    ages: [20, 61],
    weight: 8,
    chainOnly: true,
    when: inField('healthcare'),
    bind: { col: { role: 'coworker' } },
    text: 'The safety review of the dosing error lands. The panel wants to turn your report into training for the whole hospital, and {col.first} is on the agenda as "case study A."',
    choices: [
      {
        id: 'lead',
        label: 'Run the session yourself',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.55),
            text: 'You teach it as a systems problem, not a person problem: tired staff, a confusing form. The form gets redesigned. People clap, which never happens.',
            effects: [
              { performance: 9 },
              { stat: 'happiness', delta: 5 },
              { rel: 'col', delta: 6, memory: 'the training where you kept it kind' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Halfway through, someone asks who made the mistake and the room turns to look at {col.first}. You could not stop it.',
            effects: [
              { performance: 2 },
              { stat: 'stress', delta: 6 },
              { rel: 'col', delta: -6, memory: 'the training that named names' },
            ],
          },
        ],
      },
      {
        id: 'anon',
        label: 'Insist the case is anonymised',
        outcomes: [
          {
            chance: 1,
            text: 'The panel grumbles about paperwork and agrees. {col.first} finds out who argued for it and leaves a card in your locker.',
            effects: [
              { stat: 'karma', delta: 5 },
              { rel: 'col', delta: 10, memory: 'the case you kept anonymous' },
            ],
          },
        ],
      },
      {
        id: 'skip',
        label: 'Let management handle it',
        outcomes: [
          {
            chance: 1,
            text: 'Management handles it with a slideshow nobody reads. The confusing form survives another year.',
            effects: [{ stat: 'stress', delta: -2 }, { performance: -2 }],
          },
        ],
      },
    ],
  },

  // ---------- education ----------
  {
    id: 'car_edu_parents_evening',
    kind: 'choice',
    category: 'work',
    ages: [21, 60],
    weight: 8,
    cooldownYears: 4,
    when: all(
      inField('education'),
      isJob('teaching_assistant', 'school_teacher', 'school_principal'),
    ),
    text: 'Parents\' evening, slot nineteen of twenty-six. A father in a golf jumper wants to know why his son\'s essay on the Romans received a C when "the boy watched three documentaries."',
    choices: [
      {
        id: 'honest',
        label: 'Show him the essay, gently',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.5),
            text: 'You walk him through it page by page. By the end he is annotating it himself, furious at his son instead of you. Progress.',
            effects: [{ performance: 5 }, { stat: 'stress', delta: -2 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'He emails the head before he has reached his car. You spend the next week writing a document titled "Essay Context."',
            effects: [
              { performance: -3 },
              { stat: 'stress', delta: 7 },
              { skill: 'writing', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'praise',
        label: 'Praise the documentaries',
        outcomes: [
          {
            chance: 1,
            text: 'He leaves delighted. The next essay arrives with a bibliography of streaming services.',
            effects: [
              { stat: 'karma', delta: -1 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'clock',
        label: 'Point at the clock',
        outcomes: [
          {
            chance: 1,
            text: 'You are back on schedule by slot twenty-two and the last parent brings you a biscuit. The golf jumper sends a formal complaint.',
            effects: [
              { performance: -2 },
              { stat: 'stress', delta: -3 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_edu_inspection',
    kind: 'choice',
    category: 'work',
    ages: [22, 62],
    weight: 7,
    cooldownYears: 6,
    when: all(inField('education'), isJob('school_teacher', 'school_principal')),
    bind: { boss: { role: 'boss' } },
    text: 'Inspectors arrive on Monday, and {boss.first} has laminated everything that does not move. A clipboard will sit in the back of your lesson on Wednesday.',
    choices: [
      {
        id: 'showpiece',
        label: 'Plan a dazzling showpiece lesson',
        outcomes: [
          {
            chance: 0.55,
            text: 'The volcano erupts on cue and thirty children say "whoa" in unison. The inspector writes one word and underlines it twice.',
            effects: [
              { performance: 9 },
              { rel: 'boss', delta: 6, memory: 'the volcano lesson' },
              { stat: 'stress', delta: 5 },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'The volcano erupts on the inspector. Baking soda, it turns out, travels. The report calls your lesson "ambitious."',
            effects: [
              { performance: -5 },
              { rel: 'boss', delta: -5, memory: 'the volcano incident' },
              { stat: 'stress', delta: 8 },
            ],
          },
        ],
      },
      {
        id: 'normal',
        label: 'Teach a normal lesson, well',
        outcomes: [
          {
            chance: 1,
            text: 'You teach fractions the way you always do. The class behaves suspiciously well. The feedback is short, fair and good.',
            effects: [{ performance: 4 }, { stat: 'stress', delta: 1 }],
          },
        ],
      },
      {
        id: 'sick',
        label: 'Develop a convenient Wednesday cough',
        outcomes: [
          {
            chance: 1,
            text: 'A supply teacher hosts the inspector instead. {boss.first} does not say anything, loudly.',
            effects: [
              { performance: -6 },
              { stat: 'stress', delta: -5 },
              { rel: 'boss', delta: -7, memory: 'your inspection-day cough' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_edu_trip',
    kind: 'choice',
    category: 'work',
    ages: [20, 58],
    weight: 7,
    cooldownYears: 6,
    when: all(inField('education'), isJob('teaching_assistant', 'school_teacher')),
    bind: { col: { role: 'coworker' } },
    text: 'At the natural history museum the headcount comes back as thirty-one out of thirty-two. {col.first} is counting again with the face of someone recalculating {col.their} career.',
    choices: [
      {
        id: 'search',
        label: 'Search the dinosaur hall',
        outcomes: [
          {
            chance: 0.8,
            text: 'You find him under the mammoth, sketching it in perfect detail. You get the drawing as a peace offering. It goes on your fridge.',
            effects: [
              { performance: 4 },
              { skill: 'art', delta: 1 },
              { rel: 'col', delta: 6, memory: 'the boy under the mammoth' },
            ],
            success: true,
          },
          {
            chance: 0.2,
            text: 'Not there. He turns up in the gift shop, having spent his lunch money on a rubber trilobite. Your heart takes an hour to restart.',
            effects: [
              { stat: 'stress', delta: 8 },
              { stat: 'health', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'staff',
        label: 'Alert museum security at once',
        outcomes: [
          {
            chance: 1,
            text: 'Security has him in four minutes; this happens every Thursday. The incident form is six pages, and you fill in all six.',
            effects: [{ performance: 2 }, { stat: 'stress', delta: 3 }],
          },
        ],
      },
      {
        id: 'recount',
        label: 'Count again, more slowly',
        outcomes: [
          {
            chance: 1,
            text: 'Thirty-two. {col.first} had skipped the boy holding {col.their} hand. You agree never to speak of this, which lasts until the staffroom.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { rel: 'col', delta: 3, memory: 'the headcount that included a teacher' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_edu_plagiarism',
    kind: 'choice',
    category: 'work',
    ages: [28, 68],
    weight: 7,
    cooldownYears: 6,
    when: all(inField('education'), isJob('professor')),
    text: 'A final-year dissertation is excellent, which is suspicious, because its author has never once spelled your name correctly. Paragraph four is in a different font.',
    choices: [
      {
        id: 'viva',
        label: 'Call the student in to talk it through',
        outcomes: [
          {
            chance: 0.6,
            text: 'Ten minutes in, the student admits a friend "helped a lot." You refer it properly and leave the room feeling older.',
            effects: [
              { performance: 4 },
              { stat: 'karma', delta: 3 },
              { stat: 'stress', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The student explains every argument fluently and wrote it in two fonts out of panic. You apologise. The mark stands.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'panel',
        label: 'Send it straight to the misconduct panel',
        outcomes: [
          {
            chance: 1,
            text: 'The panel takes four months and three meetings. The decision arrives the week everyone has stopped caring.',
            effects: [{ performance: 2 }, { stat: 'stress', delta: 6 }],
          },
        ],
      },
      {
        id: 'mark',
        label: 'Mark it as written and go home',
        outcomes: [
          {
            chance: 1,
            text: 'It gets a first. You suspect you have just graded a stranger, and the thought follows you to the car park.',
            effects: [
              { stat: 'karma', delta: -4 },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
    ],
  },

  // ---------- science ----------
  {
    id: 'car_sci_contaminated_sample',
    kind: 'choice',
    category: 'work',
    ages: [21, 60],
    weight: 8,
    cooldownYears: 5,
    when: inField('science'),
    bind: { col: { role: 'coworker' } },
    text: 'Six weeks of cultures, and today every plate is growing something fluffy and uninvited. {col.first} insists {col.they} closed the hood. The fluff disagrees.',
    choices: [
      {
        id: 'trace',
        label: 'Trace the contamination properly',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.5),
            text: 'You swab every surface and find the culprit: a cracked filter in the incubator. The lab manager orders a new one and buys you a doughnut.',
            effects: [
              { performance: 7 },
              { stat: 'smarts', delta: 2 },
              { rel: 'col', delta: 5, memory: 'the cracked filter you found' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Three days of swabs reveal nothing. The fluff returns the following month, like a seasonal visitor.',
            effects: [{ performance: -2 }, { stat: 'stress', delta: 6 }],
          },
        ],
      },
      {
        id: 'blame',
        label: 'Tell the PI it was {col.first}',
        outcomes: [
          {
            chance: 1,
            text: '{col.first} is moved to bench seven, next to the centrifuge that screams. Your results are still ruined.',
            effects: [
              { performance: -1 },
              { stat: 'karma', delta: -4 },
              { rel: 'col', delta: -12, memory: 'the time you blamed them for the fluff' },
            ],
          },
        ],
      },
      {
        id: 'restart',
        label: 'Bin it all and start again',
        outcomes: [
          {
            chance: 1,
            text: 'You autoclave six weeks of your life and begin again on Monday. It is grim, but the new plates look healthy.',
            effects: [
              { stat: 'stress', delta: 4 },
              { stat: 'happiness', delta: -3 },
              { performance: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_sci_grant',
    kind: 'choice',
    category: 'work',
    ages: [26, 64],
    weight: 7,
    cooldownYears: 7,
    when: all(inField('science'), jobLevelAtLeast(1)),
    text: 'The big grant deadline is Friday at five. Your proposal is ninety pages, the limit is twenty, and the budget spreadsheet has achieved sentience.',
    choices: [
      {
        id: 'bold',
        label: 'Pitch the risky idea you believe in',
        outcomes: [
          {
            chance: 1,
            text: 'You cut it to twenty pages of pure nerve and submit at 4:58. Now comes the long wait.',
            effects: [
              { stat: 'stress', delta: 6 },
              { skill: 'writing', delta: 2 },
            ],
            success: true,
            next: { eventId: 'car_sci_grant_result', inYears: [1, 2] },
          },
        ],
      },
      {
        id: 'safe',
        label: 'Propose the safe, incremental study',
        outcomes: [
          {
            chance: 0.6,
            text: 'It is funded at once. Three years of steady, worthy, slightly dull work stretch ahead of you like a well-lit corridor.',
            effects: [{ performance: 5 }, { money: 2000 }, { stat: 'happiness', delta: -1 }],
          },
          {
            chance: 0.4,
            text: 'The reviewers call it "solid but unexciting" and fund someone bolder. You frame the rejection letter as a joke. Mostly a joke.',
            effects: [{ performance: -2 }, { stat: 'happiness', delta: -4 }],
          },
        ],
      },
      {
        id: 'skip',
        label: 'Skip this round',
        outcomes: [
          {
            chance: 1,
            text: 'You spend Friday at five in a park instead. Your head of department notices the empty slot in the submissions list.',
            effects: [{ stat: 'stress', delta: -6 }, { performance: -4 }],
          },
        ],
      },
    ],
  },
  {
    id: 'car_sci_grant_result',
    kind: 'notice',
    category: 'work',
    ages: [27, 66],
    weight: 8,
    chainOnly: true,
    when: inField('science'),
    text: 'An email with the subject line "Outcome of your application" sits unopened for an hour while you make tea you do not drink.',
    outcomes: [
      {
        chance: oddsBy('smarts', 0.4),
        text: 'Funded, in full. Your risky idea now has a budget, two postdocs and a fridge of its own. You read the email nine times.',
        effects: [
          { performance: 12 },
          { money: 5000 },
          { stat: 'happiness', delta: 9 },
          { stat: 'stress', delta: 3 },
        ],
        success: true,
      },
      {
        chance: 0.5,
        text: 'Rejected. One reviewer loved it; the other called it "speculative," twice. You file the comments and start redrafting by the weekend.',
        effects: [
          { stat: 'happiness', delta: -6 },
          { stat: 'smarts', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'car_sci_fieldwork',
    kind: 'choice',
    category: 'work',
    ages: [22, 58],
    weight: 7,
    cooldownYears: 5,
    when: all(inField('science'), isJob('environmental_scientist')),
    text: 'Fieldwork week: river samples at dawn, waders that leak, and a cow that has taken a personal interest in your sampling kit.',
    choices: [
      {
        id: 'wade',
        label: 'Wade out to the proper site',
        outcomes: [
          {
            chance: 0.7,
            text: 'Your samples are clean, labelled and slightly heroic. The data shows something upstream that nobody wanted to see, which is the point.',
            effects: [
              { performance: 7 },
              { stat: 'health', delta: 1 },
              { stat: 'karma', delta: 2 },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'You step into a hole the map did not mention. The samples survive. Your phone and dignity do not.',
            effects: [{ injury: 2 }, { money: -600 }, { performance: 3 }],
          },
        ],
      },
      {
        id: 'bank',
        label: 'Sample from the bank instead',
        outcomes: [
          {
            chance: 1,
            text: 'Dry and efficient, but your supervisor spots the bank-side readings at once and asks you to redo the week.',
            effects: [{ performance: -4 }, { stat: 'stress', delta: 4 }],
          },
        ],
      },
      {
        id: 'cow',
        label: 'Negotiate with the cow',
        outcomes: [
          {
            chance: 1,
            text: 'You offer it a sandwich. It accepts the sandwich and the clipboard. You lose a morning and gain a story you tell for years.',
            effects: [{ stat: 'happiness', delta: 5 }, { performance: -1 }],
          },
        ],
      },
    ],
  },

  // ---------- law ----------
  {
    id: 'car_law_late_disclosure',
    kind: 'choice',
    category: 'work',
    ages: [22, 60],
    weight: 8,
    cooldownYears: 5,
    when: all(inField('law'), isJob('paralegal', 'lawyer')),
    bind: { col: { role: 'coworker' } },
    text: "At 11:40 p.m. the other side discloses forty thousand documents, due to be reviewed before a nine o'clock hearing. {col.first} has already ordered pizza and opened the first box.",
    choices: [
      {
        id: 'allnight',
        label: 'Pull an all-nighter with {col.first}',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.5),
            text: 'At 6:12 a.m. you find the one email that matters, buried in a thread about a birthday cake. The hearing goes your way.',
            effects: [
              { performance: 10 },
              { stat: 'stress', delta: 7 },
              { stat: 'health', delta: -2 },
              { rel: 'col', delta: 8, memory: 'the birthday-cake email at dawn' },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'You read until your eyes blur and find nothing. Later, a junior on the other side finds the email you missed.',
            effects: [
              { performance: -4 },
              { stat: 'stress', delta: 9 },
              { rel: 'col', delta: 3, memory: 'the night of forty thousand documents' },
            ],
          },
        ],
      },
      {
        id: 'adjourn',
        label: 'Draft an application to adjourn',
        outcomes: [
          {
            chance: 0.6,
            text: 'The judge agrees that disclosing at midnight is "unhelpful" and grants a week. The other side looks at their shoes.',
            effects: [{ performance: 6 }, { skill: 'writing', delta: 1 }],
          },
          {
            chance: 0.4,
            text: 'Refused. You walk into the hearing having read three hundred documents and bluffing about the rest.',
            effects: [{ performance: -3 }, { stat: 'stress', delta: 6 }],
          },
        ],
      },
      {
        id: 'sleep',
        label: 'Sleep and skim it at dawn',
        outcomes: [
          {
            chance: 1,
            text: 'You arrive rested, sharp and hopelessly underprepared. You argue beautifully about the parts you know.',
            effects: [{ stat: 'health', delta: 2 }, { performance: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'car_law_billing',
    kind: 'choice',
    category: 'work',
    ages: [22, 60],
    weight: 7,
    cooldownYears: 5,
    when: inField('law'),
    bind: { boss: { role: 'boss' } },
    text: '{boss.first} reminds the team that billable targets are "a floor, not a ceiling." Your timesheet shows 6.1 hours for a day that felt like thirty.',
    choices: [
      {
        id: 'pad',
        label: 'Round everything up generously',
        outcomes: [
          {
            chance: 0.6,
            text: 'The six minutes you spent reading a client email become half an hour. Your numbers glow, and so does your conscience, uncomfortably.',
            effects: [
              { performance: 5 },
              { stat: 'karma', delta: -5 },
              { rel: 'boss', delta: 3, memory: 'your excellent month of billing' },
            ],
          },
          {
            chance: 0.4,
            text: 'A client queries the bill line by line. Line fourteen is you. {boss.first} asks for a word in the small room.',
            effects: [
              { performance: -8 },
              { stat: 'stress', delta: 8 },
              { rel: 'boss', delta: -8, memory: 'line fourteen of the bill' },
            ],
          },
        ],
      },
      {
        id: 'honest',
        label: 'Bill what you actually did',
        outcomes: [
          {
            chance: 1,
            text: 'Your figures are the lowest on the team and the only ones nobody ever questions. A long-standing client asks for you by name.',
            effects: [{ stat: 'karma', delta: 4 }, { performance: 2 }],
            success: true,
          },
        ],
      },
      {
        id: 'hours',
        label: 'Work the extra hours for real',
        outcomes: [
          {
            chance: 1,
            text: 'You hit the target by living at your desk. Your desk plant dies of neglect and a neighbour asks if you moved out.',
            effects: [
              { performance: 7 },
              { money: 1500 },
              { stat: 'stress', delta: 9 },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_law_filing_typo',
    kind: 'notice',
    category: 'work',
    ages: [18, 55],
    weight: 6,
    cooldownYears: 6,
    when: all(inField('law'), isJob('legal_secretary', 'paralegal')),
    text: 'A court filing goes out with the client described as "the defendant\'s pet" instead of "the defendant\'s partner."',
    outcomes: [
      {
        chance: 0.5,
        text: 'You catch it twenty minutes later and file a correction before anyone important reads it. The office never finds out.',
        effects: [{ stat: 'stress', delta: 4 }, { performance: 1 }],
        success: true,
      },
      {
        chance: 0.5,
        text: 'The judge reads it aloud, deadpan, to a full courtroom. The partner on the case does not laugh. Everyone else does.',
        effects: [
          { performance: -5 },
          { stat: 'stress', delta: 6 },
          { stat: 'happiness', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'car_law_sentencing',
    kind: 'choice',
    category: 'work',
    ages: [38, 70],
    weight: 7,
    cooldownYears: 5,
    when: all(inField('law'), isJob('judge')),
    text: 'A young first offender stands before you for a theft that guidelines say means custody. Her employer has written a letter, and her mother is in the gallery gripping her coat.',
    choices: [
      {
        id: 'community',
        label: 'Impose a community sentence',
        outcomes: [
          {
            chance: 0.7,
            text: 'You explain your reasons carefully on the record. Two years later a probation report crosses your desk: still employed, no new charges.',
            effects: [
              { stat: 'karma', delta: 6 },
              { performance: 4 },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'The appeal court calls your sentence "unduly lenient" in a judgment that gets quoted in the papers. You stand by it, privately.',
            effects: [
              { performance: -5 },
              { stat: 'stress', delta: 6 },
              { stat: 'karma', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'guideline',
        label: 'Follow the guidelines to the letter',
        outcomes: [
          {
            chance: 1,
            text: 'The sentence is correct and unappealable. You hear the mother in the corridor afterwards, and you take the long way to your chambers.',
            effects: [{ performance: 3 }, { stat: 'happiness', delta: -4 }],
          },
        ],
      },
      {
        id: 'adjourn',
        label: 'Adjourn for a full pre-sentence report',
        outcomes: [
          {
            chance: 1,
            text: 'Six weeks later the report fills in what the file left out. Your decision is easier and your list is longer.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
];
