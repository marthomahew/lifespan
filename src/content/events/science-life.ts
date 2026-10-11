import type { EventDef } from '../../engine/events/types';
import type { GameState } from '../../engine/types';
import { all, canAfford, hasPartner, oddsBy } from './conditions';

/**
 * A research life from the bench up: the lab and its disasters, papers and who gets the credit,
 * money and the outside world, and the long tail of a career in science. Everything here waits
 * for a science record (systems/science.ts) and a research job or a PhD in progress.
 */

// Kept local (not imported from engine/systems/science.ts) so content never pulls in the engine.
const SCI_JOBS = [
  'research_scientist',
  'professor',
  'chemist',
  'environmental_scientist',
  'data_scientist',
  'doctor',
];
const doingPhd = (s: GameState): boolean => s.education.enrollment?.programId === 'phd';
const researchJob = (s: GameState): boolean => SCI_JOBS.includes(s.career.jobId ?? '');
/** In a research life right now: a science record, a research job or a PhD, and not inside. */
const researching = (s: GameState): boolean =>
  !!s.science && !s.death && s.legal.prison === null && (researchJob(s) || doingPhd(s));
/** Running a group: a research post (not a student) with some standing behind it. */
const leadsGroup = (s: GameState): boolean =>
  researching(s) && researchJob(s) && (s.science?.rep ?? 0) >= 20;
const standing =
  (n: number) =>
  (s: GameState): boolean =>
    (s.science?.rep ?? 0) >= n;
const papers =
  (n: number) =>
  (s: GameState): boolean =>
    (s.science?.papers.length ?? 0) >= n;
const onProject = (s: GameState): boolean => !!s.science?.project;
const hasGrant = (s: GameState): boolean => (s.science?.grants.length ?? 0) > 0;
const citedAtLeast =
  (n: number) =>
  (s: GameState): boolean =>
    (s.science?.papers ?? []).some((p) => p.cites >= n);
/** Fields with a prize announced from Stockholm each October. */
const nobelField = (s: GameState): boolean =>
  ['life', 'chem', 'physics', 'social'].includes(s.science?.field ?? '') &&
  !(s.science?.prizes ?? []).some((p) => p.includes('Nobel'));
/** A science career behind you (retired or not), for the long-tail honours. */
const lifeInScience = (s: GameState): boolean => !!s.science && !s.death && s.legal.prison === null;

export const SCIENCE_LIFE_EVENTS: EventDef[] = [
  // ---------- the lab and the work ----------
  {
    id: 'sci_student_needs_help',
    kind: 'choice',
    category: 'work',
    ages: [28, 67],
    weight: 9,
    cooldownYears: 4,
    when: all(leadsGroup, onProject),
    text: 'A first-year student knocks on your open door holding a gel that looks like a ransom note. Your own paper is due to the editor on Friday, and the student has clearly been crying in the cold room.',
    choices: [
      {
        id: 'help',
        label: 'Sit down with them and redo it from scratch',
        outcomes: [
          {
            chance: 1,
            text: 'You spend two afternoons showing them where the buffer went wrong and why it matters. Your paper goes in late and slightly rougher; the student walks out standing taller.',
            effects: [
              { system: 'sci_quality', arg: '-4' },
              { stat: 'karma', delta: 5 },
              { stat: 'happiness', delta: 3 },
              { flag: 'sci_mentor' },
            ],
            next: { eventId: 'sci_former_student_prize', inYears: [8, 15] },
          },
        ],
      },
      {
        id: 'later',
        label: 'Promise them next week and close the door',
        outcomes: [
          {
            chance: 1,
            text: 'The paper goes in on time and polished. Next week the student has figured it out alone, and never quite knocks on your door again.',
            effects: [
              { system: 'sci_quality', arg: '5' },
              { stat: 'karma', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'postdoc',
        label: 'Hand them to your most patient postdoc',
        outcomes: [
          {
            chance: 1,
            text: 'The postdoc sighs, then takes the student under a wing so wide it covers half the lab. You owe them a very good reference letter.',
            effects: [
              { system: 'sci_quality', arg: '2' },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_former_student_prize',
    kind: 'choice',
    category: 'work',
    ages: [36, 85],
    weight: 10,
    chainOnly: true,
    when: lifeInScience,
    text: 'The student who once brought you a ruined gel has just won a major young-investigator prize. In the acceptance speech they thank "the person who sat down with me when I was about to quit."',
    choices: [
      {
        id: 'ceremony',
        label: 'Go to the ceremony and sit at the back',
        outcomes: [
          {
            chance: 1,
            text: 'They spot you from the stage and wave like a child at a school play. You blame the air conditioning for your eyes.',
            effects: [
              { stat: 'happiness', delta: 10 },
              { system: 'sci_rep', arg: '3' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'card',
        label: 'Send a short, proud card',
        outcomes: [
          {
            chance: 1,
            text: 'The card says six words. You hear later that it is pinned above their desk, next to a photograph of a very bad gel.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'karma', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_too_good',
    kind: 'choice',
    category: 'work',
    ages: [23, 66],
    weight: 8,
    cooldownYears: 8,
    when: all(researching, onProject),
    text: 'The numbers come back and they are perfect. Not good: perfect. Error bars the width of a hair, an effect three times what anyone predicted, and a small voice in the back of your head clearing its throat.',
    choices: [
      {
        id: 'check',
        label: 'Run the whole thing again from scratch',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.45),
            text: 'Three months later the repeat comes back almost as strong. Now you can say it out loud, and you have the data to stop anyone arguing.',
            effects: [
              { system: 'sci_quality', arg: '14' },
              { stat: 'stress', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The repeat shows nothing. A mislabelled tube did all the work the first time. You are disappointed and very, very relieved.',
            effects: [
              { system: 'sci_quality', arg: '-6' },
              { stat: 'karma', delta: 4 },
              { stat: 'smarts', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'rush',
        label: 'Write it up tonight before anyone else does',
        outcomes: [
          {
            chance: 1,
            text: 'The draft pours out of you in one sleepless weekend. Your head of department calls it "the sort of result careers are made of". The small voice goes quiet. For now.',
            effects: [
              { system: 'sci_quality', arg: '12' },
              { system: 'sci_finish' },
              { system: 'sci_rep', arg: '4' },
              { flag: 'sci_rushed_result' },
            ],
            next: { eventId: 'sci_too_good_doubt', inYears: [3, 7] },
          },
        ],
      },
    ],
  },
  {
    id: 'sci_too_good_doubt',
    kind: 'choice',
    category: 'work',
    ages: [26, 75],
    weight: 10,
    chainOnly: true,
    when: all(lifeInScience, papers(1)),
    text: 'A polite letter from a lab on another continent: three separate teams have tried to reproduce your famous result and none of them can. They attach their data. It is careful, and it is damning.',
    choices: [
      {
        id: 'retract',
        label: 'Look again, then retract it yourself',
        outcomes: [
          {
            chance: 1,
            text: 'You find the mislabelled tube in your old notebook and write the retraction notice yourself. It hurts. Colleagues you barely know write to say they respect it.',
            effects: [
              { system: 'sci_retract' },
              { system: 'sci_rep', arg: '4' },
              { stat: 'karma', delta: 8 },
              { stat: 'happiness', delta: -6 },
              { unflag: 'sci_rushed_result' },
            ],
          },
        ],
      },
      {
        id: 'defend',
        label: 'Insist their methods are the problem',
        outcomes: [
          {
            chance: 0.35,
            text: 'You find a real difference in their protocol and the argument stalls in the letters pages for years. Nobody wins. Nobody cites you much any more, either.',
            effects: [
              { system: 'sci_rep', arg: '-4' },
              { stat: 'stress', delta: 6 },
            ],
          },
          {
            chance: 0.65,
            text: 'The journal opens an inquiry, the inquiry finds the tube, and the retraction comes with your name in a headline. The small voice would like it noted that it tried.',
            effects: [
              { system: 'sci_retract' },
              { system: 'sci_rep', arg: '-6' },
              { notoriety: 4 },
              { stat: 'happiness', delta: -10 },
              { unflag: 'sci_rushed_result' },
            ],
            next: { eventId: 'sci_retraction_after', inYears: [1, 2] },
          },
        ],
      },
    ],
  },
  {
    id: 'sci_retraction_after',
    kind: 'choice',
    category: 'work',
    ages: [27, 77],
    weight: 10,
    chainOnly: true,
    when: lifeInScience,
    text: 'A year after the retraction, a research-integrity course asks whether you would speak to its students about what went wrong. You would be the cautionary tale, in person, with slides.',
    choices: [
      {
        id: 'speak',
        label: 'Say yes and tell it straight',
        outcomes: [
          {
            chance: 1,
            text: 'You tell a room of twenty-three-year-olds about the perfect numbers and the voice you ignored. Nobody looks at their phone. Afterwards three of them ask to rerun their own data.',
            effects: [
              { system: 'sci_rep', arg: '5' },
              { stat: 'karma', delta: 5 },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'decline',
        label: 'Decline and keep your head down',
        outcomes: [
          {
            chance: 1,
            text: 'You say no and get on with quiet, careful work. The story fades slowly, the way these things do, mostly from other people’s memories.',
            effects: [
              { stat: 'stress', delta: -3 },
              { system: 'sci_quality', arg: '3' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_lab_flood',
    kind: 'choice',
    category: 'work',
    ages: [22, 66],
    weight: 6,
    cooldownYears: 10,
    when: all(researching, onProject),
    text: 'A pipe bursts in the chemistry teaching lab upstairs. By the time you arrive, water is coming through the ceiling tiles in three places and dripping steadily onto the bench where your samples live.',
    choices: [
      {
        id: 'samples',
        label: 'Wade in and rescue the samples',
        outcomes: [
          {
            chance: 1,
            text: 'You carry rack after rack to the corridor with a bin bag on your head. The samples survive. Your shoes do not.',
            effects: [
              { stat: 'health', delta: -2 },
              { stat: 'happiness', delta: 3 },
              { money: -120 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'notebooks',
        label: 'Save the lab notebooks first',
        outcomes: [
          {
            chance: 1,
            text: 'Ten years of notebooks reach the dry corridor in your arms. Half a season of samples does not. You can repeat experiments; you cannot repeat handwriting.',
            effects: [
              { system: 'sci_quality', arg: '-6' },
              { stat: 'karma', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'facilities',
        label: 'Ring facilities and wait for the experts',
        outcomes: [
          {
            chance: 1,
            text: 'Facilities arrive after forty minutes with one mop and a man called Desmond who is very calm. The bench is a paddling pool by then.',
            effects: [
              { system: 'sci_quality', arg: '-12' },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_freezer_holiday',
    kind: 'choice',
    category: 'work',
    ages: [22, 66],
    weight: 7,
    cooldownYears: 8,
    when: all(researching, onProject),
    text: 'Holiday weekend, 3 a.m.: the alarm company rings to say the minus-eighty freezer is reading minus forty and climbing. Inside are four years of samples and one tub of somebody’s ice cream.',
    choices: [
      {
        id: 'drive',
        label: 'Get dressed and drive in',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.6),
            text: 'You spend the night moving boxes into the backup freezer with dry ice and a head torch. Everything is saved, including the ice cream, which you eat as payment.',
            effects: [
              { stat: 'health', delta: -2 },
              { stat: 'happiness', delta: 2 },
              { system: 'sci_quality', arg: '2' },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'The backup freezer is full of someone else’s abandoned samples from the nineties. You save what fits and mourn the rest in the car park at dawn.',
            effects: [
              { system: 'sci_quality', arg: '-8' },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'student',
        label: 'Ring the student who lives nearest',
        outcomes: [
          {
            chance: 1,
            text: 'The student cycles in wearing pyjamas and saves nearly everything. On Tuesday you buy them the best lunch the canteen can offer, which is not saying much.',
            effects: [
              { system: 'sci_quality', arg: '-2' },
              { money: -30 },
              { stat: 'karma', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'sleep',
        label: 'Tell yourself it will hold till Monday',
        outcomes: [
          {
            chance: 1,
            text: 'It does not hold till Monday. You open the freezer to a smell you will remember at odd moments for the rest of your life.',
            effects: [
              { system: 'sci_quality', arg: '-15' },
              { stat: 'happiness', delta: -6 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_reagent_shortage',
    kind: 'choice',
    category: 'work',
    ages: [22, 66],
    weight: 7,
    cooldownYears: 6,
    when: all(researching, onProject),
    text: 'The one supplier of the one reagent your project needs writes to say it is back-ordered for "approximately two quarters". The email is signed with a smiley face.',
    choices: [
      {
        id: 'beg',
        label: 'Go begging along the corridor',
        outcomes: [
          {
            chance: 0.6,
            text: 'A lab two doors down has half a bottle at the back of a shelf. The price is a co-authorship and your share of the good pipettes.',
            effects: [
              { system: 'sci_quality', arg: '-2' },
              { stat: 'happiness', delta: 2 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Everyone on the floor ordered from the same supplier. The corridor fills with the quiet despair of people refreshing an order page.',
            effects: [
              { system: 'sci_quality', arg: '-6' },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'make',
        label: 'Synthesise it yourself',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.4),
            text: 'It takes a month and a fume hood you are not technically booked on, but your homemade batch is purer than the commercial one. You feel unreasonably smug.',
            effects: [
              { system: 'sci_quality', arg: '6' },
              { stat: 'smarts', delta: 3 },
              { stat: 'stress', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'Your homemade batch is brown when it should be clear and smells of burnt toast. You learn a great deal about chemistry and very little about your project.',
            effects: [
              { system: 'sci_quality', arg: '-4' },
              { stat: 'smarts', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'redesign',
        label: 'Redesign the experiment around it',
        outcomes: [
          {
            chance: 1,
            text: 'You rebuild the method around an older, cheaper chemical. It is slower and clunkier, and works, which in research is a love language.',
            effects: [{ system: 'sci_quality', arg: '1' }, { addTrait: 'creative' }],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_happy_accident',
    kind: 'notice',
    category: 'work',
    ages: [22, 70],
    weight: 5,
    cooldownYears: 12,
    when: all(researching, onProject),
    text: 'Someone leaves a window open over the weekend and a stray draught ruins a whole tray of your experiment.',
    outcomes: [
      {
        chance: 1,
        text: 'Except it is not ruined: on Monday the spoiled samples are doing something nobody has ever described. You drop everything to chase it, and the project changes shape beneath you.',
        effects: [
          { system: 'sci_quality', arg: '15' },
          { stat: 'happiness', delta: 8 },
        ],
      },
    ],
  },
  {
    id: 'sci_lab_meeting_politics',
    kind: 'choice',
    category: 'work',
    ages: [30, 67],
    weight: 7,
    cooldownYears: 5,
    when: leadsGroup,
    text: 'Two postdocs in your group both want to present the same result at the big meeting, and lab meeting has become a cold war conducted entirely through slide transitions.',
    choices: [
      {
        id: 'senior',
        label: 'Give the talk to the more senior one',
        outcomes: [
          {
            chance: 1,
            text: 'Seniority wins and the talk goes well. The junior postdoc starts arriving with headphones on and leaving exactly at five.',
            effects: [
              { system: 'sci_rep', arg: '2' },
              { system: 'sci_quality', arg: '-3' },
              { performance: 2 },
            ],
          },
        ],
      },
      {
        id: 'junior',
        label: 'Give it to the one who did the work',
        outcomes: [
          {
            chance: 1,
            text: 'The junior postdoc is nervous and brilliant, and two groups ask for their contact details afterwards. The senior one starts updating a CV with suspicious energy.',
            effects: [
              { stat: 'karma', delta: 3 },
              { system: 'sci_quality', arg: '2' },
              { system: 'sci_rep', arg: '1' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'both',
        label: 'Make them present it together',
        outcomes: [
          {
            chance: 0.5,
            text: 'They rehearse together for a week, discover they like each other, and give the best talk of the session. The cold war ends in a joint paper.',
            effects: [
              { system: 'sci_quality', arg: '6' },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'They split the talk down the middle and each one corrects the other on stage. The audience enjoys it the way people enjoy a car crash at walking pace.',
            effects: [
              { system: 'sci_rep', arg: '-2' },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_cleaner_unplug',
    kind: 'notice',
    category: 'work',
    ages: [22, 66],
    weight: 5,
    cooldownYears: 10,
    when: all(researching, onProject),
    text: 'Overnight, a cleaner needs a socket for the floor polisher and finds a perfect one, conveniently occupied by your six-week incubation.',
    outcomes: [
      {
        chance: 0.6,
        text: 'Six weeks become zero weeks. You tape a laminated sign over the plug in three languages and a drawing of a skull.',
        effects: [
          { system: 'sci_quality', arg: '-8' },
          { stat: 'happiness', delta: -4 },
        ],
      },
      {
        chance: 0.4,
        text: 'By some miracle the run had finished an hour earlier. The floor, you notice, has never been shinier.',
        effects: [{ stat: 'happiness', delta: 2 }],
      },
    ],
  },
  {
    id: 'sci_lab_party',
    kind: 'choice',
    category: 'social',
    ages: [22, 68],
    weight: 6,
    cooldownYears: 4,
    when: researching,
    text: 'The lab’s end-of-year party is in the seminar room. The punch is bubbling with dry ice, someone has wrapped the centrifuge in tinsel, and there is a quiz about the department.',
    choices: [
      {
        id: 'quiz',
        label: 'Throw yourself into the quiz',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.4),
            text: 'Your team wins on a tie-break about the departmental photocopier’s birthday. The prize is a novelty mug that you will defend for decades.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: -4 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'You come last behind the team of first-year students, who knew things about the department you never wanted to know.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'stress', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'speech',
        label: 'Give a heartfelt speech about the year',
        outcomes: [
          {
            chance: 1,
            text: 'You thank everyone by name, including the technician who keeps the place running. The technician pretends not to be moved and fails.',
            effects: [
              { stat: 'karma', delta: 3 },
              { system: 'sci_quality', arg: '3' },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'bench',
        label: 'Slip off to finish an experiment',
        outcomes: [
          {
            chance: 1,
            text: 'You run the gel alone while laughter drifts down the corridor. The data are good. You eat a cold mince pie alone in the dark like a cartoon scientist.',
            effects: [
              { system: 'sci_quality', arg: '4' },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_emeritus',
    kind: 'choice',
    category: 'work',
    ages: [24, 64],
    weight: 6,
    cooldownYears: 10,
    when: researching,
    text: 'Professor Emeritus Albrecht retired fourteen years ago and still comes in every day at eight, in a tie, to sit at the bench by the window. Now facilities want the bench for your new equipment.',
    choices: [
      {
        id: 'listen',
        label: 'Find him a corner and ask about his work',
        outcomes: [
          {
            chance: 1,
            text: 'He tells you about a forgotten method from 1971 that solves your current problem in an afternoon. He has been waiting a decade for somebody to ask.',
            effects: [
              { system: 'sci_quality', arg: '7' },
              { stat: 'smarts', delta: 2 },
              { stat: 'karma', delta: 3 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'bench',
        label: 'Take the bench, politely',
        outcomes: [
          {
            chance: 1,
            text: 'He moves his things without a word. The new machine is excellent. The window seat feels oddly empty in the mornings.',
            effects: [
              { system: 'sci_quality', arg: '3' },
              { stat: 'karma', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_postdoc_visa',
    kind: 'choice',
    category: 'work',
    ages: [30, 67],
    weight: 6,
    cooldownYears: 8,
    when: all(leadsGroup, standing(25)),
    text: 'Your best postdoc’s visa renewal has been stuck for five months behind a form nobody can explain. In three weeks they will have to leave the country, mid-experiment.',
    choices: [
      {
        id: 'letters',
        label: 'Write letters and ring everyone you know',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.5),
            text: 'A dean you once shared a minibus with makes a call to someone who makes another call. The visa arrives with four days to spare.',
            effects: [
              { stat: 'stress', delta: 6 },
              { stat: 'karma', delta: 5 },
              { system: 'sci_quality', arg: '4' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Nobody can help in time. The postdoc goes home, works remotely at odd hours, and returns the following spring. You both age a little.',
            effects: [
              { stat: 'stress', delta: 8 },
              { system: 'sci_quality', arg: '-5' },
            ],
          },
        ],
      },
      {
        id: 'lawyer',
        label: 'Pay for an immigration lawyer yourself',
        requires: canAfford(2500),
        outcomes: [
          {
            chance: 1,
            text: 'The lawyer finds the missing stamp in a week. It is the most expensive stamp in history, and it is worth every coin.',
            effects: [
              { money: -2500 },
              { stat: 'karma', delta: 4 },
              { system: 'sci_quality', arg: '3' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'hr',
        label: 'Leave it to the international office',
        outcomes: [
          {
            chance: 1,
            text: 'The international office sends a reassuring email a fortnight after the postdoc has gone home. Their half-finished experiment sits on the bench like a ghost.',
            effects: [
              { system: 'sci_quality', arg: '-9' },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_student_burnout',
    kind: 'choice',
    category: 'work',
    ages: [30, 67],
    weight: 6,
    cooldownYears: 6,
    when: leadsGroup,
    text: 'One of your PhD students has stopped coming in. When you finally reach them, they say quietly that they have not slept properly since the spring and cannot look at the data any more.',
    choices: [
      {
        id: 'rest',
        label: 'Send them home for a proper month off',
        outcomes: [
          {
            chance: 1,
            text: 'You sign the leave form and tell them the thesis will wait. They come back pinker and slower and, by the autumn, finally enjoying the work again.',
            effects: [
              { stat: 'karma', delta: 6 },
              { system: 'sci_quality', arg: '-3' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'support',
        label: 'Halve their load and meet them weekly',
        outcomes: [
          {
            chance: 1,
            text: 'Every Thursday you drink terrible coffee together and talk about anything but results. It takes up your afternoons and gives them back their evenings.',
            effects: [
              { stat: 'karma', delta: 4 },
              { stat: 'stress', delta: 3 },
              { system: 'sci_quality', arg: '1' },
            ],
          },
        ],
      },
      {
        id: 'push',
        label: 'Remind them the funding ends in a year',
        outcomes: [
          {
            chance: 0.3,
            text: 'They grit their teeth and finish the chapter. The thesis passes. They never send you a holiday card, and you notice.',
            effects: [
              { system: 'sci_quality', arg: '4' },
              { stat: 'karma', delta: -5 },
            ],
          },
          {
            chance: 0.7,
            text: 'They leave science that summer. The project loses its best pair of hands, and the department loses a little patience with you.',
            effects: [
              { system: 'sci_quality', arg: '-8' },
              { system: 'sci_rep', arg: '-3' },
              { stat: 'karma', delta: -6 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_fire_alarm',
    kind: 'choice',
    category: 'work',
    ages: [22, 66],
    weight: 6,
    cooldownYears: 7,
    when: all(researching, onProject),
    text: 'The fire alarm goes off with eleven minutes left on the most delicate timed step of your entire project. It is almost certainly a test. Almost.',
    choices: [
      {
        id: 'leave',
        label: 'Leave everything and file out',
        outcomes: [
          {
            chance: 1,
            text: 'You stand in the car park for forty minutes while somebody’s burnt toast is investigated. The experiment dies of neglect. You are, at least, alive.',
            effects: [
              { system: 'sci_quality', arg: '-5' },
              { stat: 'karma', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'stay',
        label: 'Finish the step, then run',
        outcomes: [
          {
            chance: 0.85,
            text: 'You finish the step and jog out to meet a fire warden with a clipboard and a face like thunder. The experiment is perfect; your safety record is not.',
            effects: [
              { system: 'sci_quality', arg: '4' },
              { system: 'sci_rep', arg: '-1' },
              { stat: 'stress', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.15,
            text: 'It was not a test. The fire is small and far away, but the smoke reaches the stairwell before you do, and you spend the evening coughing in casualty.',
            effects: [{ injury: 8 }, { system: 'sci_rep', arg: '-3' }],
          },
        ],
      },
    ],
  },
  // ---------- papers and credit ----------
  {
    id: 'sci_authorship_dispute',
    kind: 'choice',
    category: 'work',
    ages: [24, 66],
    weight: 7,
    cooldownYears: 6,
    when: all(researching, onProject),
    text: 'A collaborator who contributed one dataset and a lot of opinions writes to say they "naturally assume" first authorship. You did the other ninety per cent of the work.',
    choices: [
      {
        id: 'give',
        label: 'Let them have it for a quiet life',
        outcomes: [
          {
            chance: 1,
            text: 'Your name goes second. The collaborator invites you to everything for years afterwards, with the warmth of a person who knows exactly what they did.',
            effects: [
              { system: 'sci_rep', arg: '-2' },
              { stat: 'stress', delta: -2 },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'fight',
        label: 'Send them the contribution table',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.45),
            text: 'You lay out who did what in a spreadsheet so neutral it could be used in arbitration. They back down without a single reply-all. You frame nothing, but you want to.',
            effects: [
              { system: 'sci_rep', arg: '2' },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'They withdraw their dataset, and the paper loses a figure and a friend. You get first authorship of something smaller.',
            effects: [
              { system: 'sci_quality', arg: '-7' },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'joint',
        label: 'Propose joint first authorship',
        outcomes: [
          {
            chance: 1,
            text: 'Two names, one asterisk, and a footnote that says "these authors contributed equally", which everyone in the field knows how to read.',
            effects: [
              { system: 'sci_rep', arg: '1' },
              { stat: 'karma', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_reviewer_rival',
    kind: 'choice',
    category: 'work',
    ages: [28, 68],
    weight: 7,
    cooldownYears: 7,
    when: all(researching, papers(2), standing(20), onProject),
    text: 'Reviewer 2 wants nine new experiments and uses the phrase "one wonders whether" three times. Only one person in your field writes like that, and their lab is racing yours.',
    choices: [
      {
        id: 'comply',
        label: 'Do every experiment, through gritted teeth',
        outcomes: [
          {
            chance: 1,
            text: 'Eight months later the paper is far stronger and Reviewer 2 has nothing left to say except "acceptable". You consider having it engraved.',
            effects: [
              { system: 'sci_quality', arg: '9' },
              { stat: 'stress', delta: 6 },
            ],
            success: true,
            next: { eventId: 'sci_rival_bar', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'editor',
        label: 'Write to the editor about the conflict',
        outcomes: [
          {
            chance: 0.55,
            text: 'The editor reads your careful letter, finds a new reviewer, and the paper is through in a month. Somewhere a rival is very annoyed.',
            effects: [
              { system: 'sci_quality', arg: '3' },
              { system: 'sci_rep', arg: '1' },
            ],
            success: true,
            next: { eventId: 'sci_rival_bar', inYears: [1, 3] },
          },
          {
            chance: 0.45,
            text: 'The editor replies that reviewers are anonymous and your concern is noted. The tone suggests "noted" means "filed under paranoid".',
            effects: [
              { system: 'sci_rep', arg: '-2' },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'elsewhere',
        label: 'Withdraw and send it to another journal',
        outcomes: [
          {
            chance: 1,
            text: 'Another journal takes it with two pleasant reviews and a deadline you can meet. It lands a little lower than you hoped, and a lot sooner.',
            effects: [
              { system: 'sci_quality', arg: '-3' },
              { stat: 'stress', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_rival_bar',
    kind: 'choice',
    category: 'social',
    ages: [29, 72],
    weight: 10,
    chainOnly: true,
    when: lifeInScience,
    text: 'At a conference hotel bar, the rival you are sure was Reviewer 2 sits down on the stool next to yours, orders the same drink, and says, "Your paper got better, you know."',
    choices: [
      {
        id: 'laugh',
        label: 'Laugh and buy the next round',
        outcomes: [
          {
            chance: 1,
            text: 'You talk until the bar closes and find you agree on almost everything except each other’s methods. By morning you are planning a joint grant.',
            effects: [
              { status: 'friend' },
              { system: 'sci_rep', arg: '3' },
              { stat: 'happiness', delta: 5 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'confront',
        label: 'Ask straight out whether it was them',
        outcomes: [
          {
            chance: 0.5,
            text: 'They smile, say nothing, and pay for both drinks. That is answer enough, and somehow you feel better for it.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'stress', delta: -3 },
            ],
          },
          {
            chance: 0.5,
            text: 'They deny it so hotly that half the bar turns round. By the closing dinner the whole field has a version of the story, and none of them flatter you.',
            effects: [
              { status: 'enemy' },
              { system: 'sci_rep', arg: '-2' },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_scooped',
    kind: 'choice',
    category: 'work',
    ages: [23, 66],
    weight: 7,
    cooldownYears: 8,
    fromYear: 1991,
    when: all(researching, onProject),
    text: 'A rival lab posts a preprint on Monday morning. It has your hypothesis, your method, and very nearly your title. You read it twice, standing up, in the corridor.',
    choices: [
      {
        id: 'rush',
        label: 'Rush your version out within a month',
        outcomes: [
          {
            chance: 1,
            text: 'You publish a slightly rougher paper three weeks behind theirs. The field calls it "independent confirmation", which is a kind phrase for second place.',
            effects: [
              { system: 'sci_quality', arg: '-8' },
              { system: 'sci_finish' },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'pivot',
        label: 'Pivot to the question their paper misses',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.45),
            text: 'Their paper has a hole in it the shape of your best idea. A year later yours fills it, and people start citing the two together.',
            effects: [
              { system: 'sci_quality', arg: '8' },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The pivot takes longer than you hoped and lands softer than you wanted. Still, it is yours, all the way down.',
            effects: [
              { system: 'sci_quality', arg: '2' },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'email',
        label: 'Email them and propose back-to-back papers',
        requires: (s) => s.year >= 1995,
        outcomes: [
          {
            chance: 0.6,
            text: 'The rival writes back within an hour, surprisingly relieved. Two papers come out side by side in the same issue, and both labs look clever.',
            effects: [
              { system: 'sci_finish' },
              { system: 'sci_rep', arg: '3' },
              { stat: 'karma', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The reply is one line long and contains the word "regrettably". Their paper is out in a fortnight. Yours is out of date.',
            effects: [
              { system: 'sci_quality', arg: '-10' },
              { stat: 'happiness', delta: -5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_predatory_journal',
    kind: 'choice',
    category: 'work',
    ages: [23, 70],
    weight: 6,
    cooldownYears: 6,
    fromYear: 2010,
    when: all(researching, papers(1)),
    text: '"Dear Esteemed Professor," begins the email, "we are honoured by your outstanding research in the field of your field." The International Journal of Advanced Everything invites you to publish, for a small fee.',
    choices: [
      {
        id: 'delete',
        label: 'Delete it, like the other forty',
        outcomes: [
          {
            chance: 1,
            text: 'It goes to the bin with the rest. By Friday the same journal has invited you to join its editorial board, its conference and, somehow, its yoga retreat.',
            effects: [{ stat: 'stress', delta: -1 }],
          },
        ],
      },
      {
        id: 'pay',
        label: 'Pay the fee for a quick publication',
        outcomes: [
          {
            chance: 1,
            text: 'Your paper appears in forty-eight hours beside an article on the healing power of magnets. A colleague notices, and the department notices the colleague noticing.',
            effects: [
              { money: -600 },
              { system: 'sci_rep', arg: '-4' },
              { stat: 'karma', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'sting',
        label: 'Submit a gibberish paper to test them',
        outcomes: [
          {
            chance: 1,
            text: 'Your paper, about a cat’s theory of gravity, co-authored by the cat, is accepted "with minor revisions" in a day. You decline to pay and tell the story at every dinner for ten years.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { fame: 1 },
              { system: 'sci_rep', arg: '1' },
            ],
            success: true,
          },
        ],
      },
    ],
  },
  {
    id: 'sci_open_access_fee',
    kind: 'choice',
    category: 'money',
    ages: [24, 68],
    weight: 6,
    cooldownYears: 7,
    fromYear: 2000,
    when: all(researching, papers(1)),
    text: 'Your paper is accepted, and the journal would love to make it free for anyone to read. The open-access charge is roughly the price of a modest second-hand car.',
    choices: [
      {
        id: 'grant',
        label: 'Pay it from the research budget',
        requires: hasGrant,
        outcomes: [
          {
            chance: 1,
            text: 'The money comes out of a budget line labelled "dissemination". A nurse in a rural clinic downloads the paper the following week and writes to thank you.',
            effects: [
              { system: 'sci_rep', arg: '2' },
              { stat: 'karma', delta: 3 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'repository',
        label: 'Post the accepted draft to a free repository',
        outcomes: [
          {
            chance: 1,
            text: 'You upload the accepted manuscript, typos and all, to the university repository. It gets read more than the polished version, which feels like a lesson.',
            effects: [
              { system: 'sci_rep', arg: '1' },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'own',
        label: 'Pay out of your own pocket',
        requires: canAfford(3000),
        outcomes: [
          {
            chance: 1,
            text: 'Your bank balance winces. The paper is free to everyone on earth, and this year’s holiday is now a long weekend at home.',
            effects: [
              { money: -3000 },
              { system: 'sci_rep', arg: '2' },
              { stat: 'karma', delta: 4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_ai_draft',
    kind: 'choice',
    category: 'work',
    ages: [28, 70],
    weight: 7,
    cooldownYears: 4,
    fromYear: 2023,
    when: leadsGroup,
    text: 'A student’s thesis chapter arrives suspiciously fluent, with the word "delve" eleven times and four citations to papers that, as far as you can tell, nobody ever wrote.',
    choices: [
      {
        id: 'talk',
        label: 'Sit down and talk it through kindly',
        outcomes: [
          {
            chance: 1,
            text: 'They admit an AI tool "tidied" it and the tidying made things up. You rewrite the lab’s rules together: the tool may help, the thinking stays human.',
            effects: [
              { stat: 'karma', delta: 4 },
              { system: 'sci_quality', arg: '2' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'report',
        label: 'Report it to the integrity office',
        outcomes: [
          {
            chance: 1,
            text: 'The office opens a file and the student is suspended for a term. The rest of the lab becomes very quiet and very careful around you.',
            effects: [
              { system: 'sci_quality', arg: '-4' },
              { system: 'sci_rep', arg: '1' },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'ignore',
        label: 'Fix the citations yourself and move on',
        outcomes: [
          {
            chance: 0.6,
            text: 'You spend a weekend finding real papers to stand in for the imaginary ones. Nobody else ever knows, including, possibly, the student.',
            effects: [
              { stat: 'stress', delta: 5 },
              { stat: 'happiness', delta: -2 },
            ],
          },
          {
            chance: 0.4,
            text: 'You miss one. An external examiner finds it and asks, very politely, where on earth the Journal of Theoretical Pastry is published.',
            effects: [
              { system: 'sci_rep', arg: '-3' },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_reply_all',
    kind: 'notice',
    category: 'work',
    ages: [22, 70],
    weight: 4,
    cooldownYears: 12,
    fromYear: 1995,
    when: researching,
    text: 'Somebody emails the whole faculty asking who took the good stapler, and two hundred academics reply to everybody asking to be removed from the list.',
    outcomes: [
      {
        chance: 1,
        text: 'You lose a whole afternoon to the thread and gain a lifelong respect for the one professor who replied only with a photograph of a stapler.',
        effects: [
          { stat: 'happiness', delta: 2 },
          { stat: 'stress', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'sci_citation_milestone',
    kind: 'notice',
    category: 'work',
    ages: [30, 90],
    weight: 12,
    once: true,
    when: all(lifeInScience, citedAtLeast(1000)),
    text: 'One of your papers passes a thousand citations this year. A thousand other pieces of work stand, in some small part, on something you once figured out late at night.',
    outcomes: [
      {
        chance: 1,
        text: 'The department puts it in the newsletter under a photograph of you squinting. You pretend not to care and check the number twice a week.',
        effects: [
          { stat: 'happiness', delta: 10 },
          { system: 'sci_rep', arg: '5' },
        ],
      },
    ],
  },
  // ---------- money and the wider world ----------
  {
    id: 'sci_grant_audit',
    kind: 'choice',
    category: 'money',
    ages: [28, 68],
    weight: 6,
    cooldownYears: 8,
    when: all(researching, hasGrant),
    text: 'The funder’s auditors have gone through four years of your spending line by line, and have one question: where exactly did {money:40} of biscuits go, and how did they advance science?',
    choices: [
      {
        id: 'receipt',
        label: 'Find the receipt in an old coat pocket',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.4),
            text: 'The receipt is crumpled, faded and says "WORKSHOP CATERING". The auditors seem almost disappointed. The case is closed.',
            effects: [
              { stat: 'stress', delta: -3 },
              { stat: 'happiness', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The coat pocket contains a bus ticket, a pipette tip and a single biscuit. You do not mention the biscuit.',
            effects: [{ money: -40 }, { stat: 'stress', delta: 3 }],
          },
        ],
      },
      {
        id: 'explain',
        label: 'Write a passionate defence of biscuits',
        outcomes: [
          {
            chance: 1,
            text: 'Two pages on morale, blood sugar and the collaborative role of the shared tin. The auditors accept it. One of them, you later hear, has it pinned up.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { skill: 'writing', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'pay',
        label: 'Pay it back and make it go away',
        outcomes: [
          {
            chance: 1,
            text: 'You reimburse the grant out of your own wallet. It is the most expensive packet of biscuits you will ever buy, measured in dignity.',
            effects: [{ money: -40 }, { stat: 'stress', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_headhunter',
    kind: 'choice',
    category: 'work',
    ages: [28, 60],
    weight: 6,
    cooldownYears: 8,
    when: all(researching, (s) => researchJob(s) && (s.science?.rep ?? 0) >= 30),
    text: 'A headhunter from a pharmaceutical company buys you lunch and slides a number across the table: double your salary, a lab twice the size, and nobody ever asking you to teach again.',
    choices: [
      {
        id: 'leverage',
        label: 'Take the offer to your head of department',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.4),
            text: 'Your head of department turns pale, makes three phone calls, and finds money that apparently did not exist yesterday. You stay, better paid and slightly smug.',
            effects: [{ job: 'raise' }, { stat: 'happiness', delta: 5 }],
            success: true,
          },
          {
            chance: 0.5,
            text: 'Your head of department wishes you every success in industry. It turns out there is no counter-offer, only a very awkward next faculty meeting.',
            effects: [{ stat: 'stress', delta: 5 }, { performance: -2 }],
          },
        ],
      },
      {
        id: 'consult',
        label: 'Offer to consult on the side instead',
        outcomes: [
          {
            chance: 1,
            text: 'You spend one Friday a month in a glass building where the coffee is free and the questions are dull. The cheques are very far from dull.',
            effects: [
              { money: 9000 },
              { system: 'sci_rep', arg: '-1' },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Say science is not for sale',
        outcomes: [
          {
            chance: 1,
            text: 'You turn it down and walk back to a lab where the windows do not open. You feel noble for about a week and sometimes wonder after that.',
            effects: [
              { stat: 'karma', delta: 2 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_spinoff_idea',
    kind: 'choice',
    category: 'money',
    ages: [28, 64],
    weight: 5,
    cooldownYears: 12,
    when: all(researching, papers(3), standing(35)),
    text: 'One of your results, it turns out, could become something people would actually buy. The university’s technology office is excited in the way that makes everyone nervous.',
    choices: [
      {
        id: 'found',
        label: 'Start a spin-off company',
        requires: canAfford(5000),
        outcomes: [
          {
            chance: 1,
            text: 'You found the company with two students, a lawyer and a logo drawn on a napkin. Evenings vanish into investor decks. Mornings vanish into the lab.',
            effects: [{ money: -5000 }, { stat: 'stress', delta: 8 }, { addTrait: 'ambitious' }],
            next: { eventId: 'sci_spinoff_offer', inYears: [2, 4] },
          },
        ],
      },
      {
        id: 'license',
        label: 'License it and stay in the lab',
        outcomes: [
          {
            chance: 1,
            text: 'An established firm licenses the patent and sends a modest royalty every year. You never have to wear a lanyard at a trade fair.',
            effects: [{ money: 15000 }, { stat: 'happiness', delta: 3 }],
            success: true,
          },
        ],
      },
      {
        id: 'open',
        label: 'Publish it openly for anyone to use',
        outcomes: [
          {
            chance: 1,
            text: 'You put it out in the open. Three companies use it within a year, none of them thank you, and the field quietly adds you to its list of good people.',
            effects: [
              { system: 'sci_rep', arg: '4' },
              { stat: 'karma', delta: 6 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_spinoff_offer',
    kind: 'choice',
    category: 'money',
    ages: [30, 70],
    weight: 10,
    chainOnly: true,
    when: lifeInScience,
    text: 'Your spin-off has twelve staff, one working product, and a buyer: a large company wants the lot. The other founders look at you, because it was your idea first.',
    choices: [
      {
        id: 'sell',
        label: 'Sell and go back to research',
        outcomes: [
          {
            chance: 1,
            text: 'The deal closes on a rainy Tuesday. You pay off the house, fund a student out of your own pocket, and sleep for the first time in two years.',
            effects: [
              { money: 220000 },
              { stat: 'stress', delta: -10 },
              { stat: 'happiness', delta: 8 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'grow',
        label: 'Refuse and keep building',
        outcomes: [
          {
            chance: 0.35,
            text: 'You hold on, and two years later a much bigger buyer pays a much bigger sum. Your co-founders forgive you for every sleepless night.',
            effects: [{ money: 600000 }, { stat: 'happiness', delta: 12 }, { fame: 3 }],
            success: true,
          },
          {
            chance: 0.65,
            text: 'The market turns, the money runs dry, and the company closes with a dignified party and a lot of second-hand office chairs for sale.',
            effects: [
              { money: -4000 },
              { stat: 'happiness', delta: -8 },
              { stat: 'smarts', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_media_misquote',
    kind: 'choice',
    category: 'fame',
    ages: [26, 70],
    weight: 6,
    cooldownYears: 7,
    when: all(researching, papers(1)),
    text: 'A newspaper covers your latest paper under the headline "SCIENTISTS SAY CHEESE CURES AGEING". Your paper, about cell membranes, mentions cheese only once, in the acknowledgements.',
    choices: [
      {
        id: 'letter',
        label: 'Write a stern letter to the editor',
        outcomes: [
          {
            chance: 1,
            text: 'The correction runs a fortnight later on page thirty-one, in very small print, beside the crossword. Somebody in your family cuts it out anyway.',
            effects: [
              { system: 'sci_rep', arg: '1' },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'thread',
        label: 'Post a patient correction thread',
        requires: (s) => s.year >= 2008,
        outcomes: [
          {
            chance: 0.6,
            text: 'Your calm, funny explanation is shared far more widely than the original story. Strangers start sending you photographs of cheese.',
            effects: [
              { fame: 2 },
              { system: 'sci_rep', arg: '2' },
              { stat: 'happiness', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Half the replies tell you science is a conspiracy, the other half ask for the cheese. You log off and go for a long walk.',
            effects: [{ stat: 'stress', delta: 5 }],
          },
        ],
      },
      {
        id: 'enjoy',
        label: 'Say nothing and enjoy the attention',
        outcomes: [
          {
            chance: 1,
            text: 'A cheese board arrives as a thank-you from a dairy trade body. Your colleagues eat it at lab meeting and never let you forget it.',
            effects: [
              { fame: 1 },
              { system: 'sci_rep', arg: '-2' },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_documentary',
    kind: 'choice',
    category: 'fame',
    ages: [30, 75],
    weight: 5,
    cooldownYears: 10,
    fromYear: 1960,
    when: all(researching, standing(40)),
    text: 'A television producer wants to make a documentary about your work. They need you to walk slowly down a corridor looking thoughtful, about forty times.',
    choices: [
      {
        id: 'yes',
        label: 'Do it, corridor walks and all',
        outcomes: [
          {
            chance: oddsBy('looks', 0.4),
            text: 'The documentary goes out on a Sunday evening and people stop you in the supermarket to say they finally understand what you do. They mostly do.',
            effects: [
              { fame: 6 },
              { system: 'sci_rep', arg: '2' },
              { stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'They cut your forty-minute interview down to one sentence and a long shot of you looking at a test tube. Your family watches it six times.',
            effects: [{ fame: 2 }, { stat: 'happiness', delta: 2 }],
          },
        ],
      },
      {
        id: 'student',
        label: 'Send your best student on camera instead',
        outcomes: [
          {
            chance: 1,
            text: 'Your student is a natural, and is soon getting invitations of their own. You get a thank-you in the credits, spelled almost right.',
            effects: [{ stat: 'karma', delta: 3 }, { fame: 1 }],
          },
        ],
      },
      {
        id: 'no',
        label: 'Decline: you have experiments to run',
        outcomes: [
          {
            chance: 1,
            text: 'They make the documentary about your rival instead. It is very good. You watch it with your arms folded.',
            effects: [
              { system: 'sci_quality', arg: '3' },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_outreach_day',
    kind: 'choice',
    category: 'social',
    ages: [22, 70],
    weight: 6,
    cooldownYears: 5,
    when: researching,
    text: 'It is the institute’s open day, and you have been put in charge of the stand for eight-year-olds. You have liquid nitrogen, a lot of balloons and no supervision whatsoever.',
    choices: [
      {
        id: 'ice',
        label: 'Make liquid-nitrogen ice cream',
        outcomes: [
          {
            chance: 1,
            text: 'The queue goes out the door and round the car park. A girl with plaits tells you she will be a scientist and asks for seconds in the same breath.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { system: 'sci_rep', arg: '1' },
              { stat: 'karma', delta: 3 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'talk',
        label: 'Explain your actual research to them',
        outcomes: [
          {
            chance: 0.5,
            text: 'You find, to your surprise, that you can explain your whole project to an eight-year-old in four sentences. It improves your next grant proposal enormously.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { system: 'sci_quality', arg: '3' },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The children listen politely for ninety seconds, then drift off to the stand next door, which has a robot that says rude words.',
            effects: [{ stat: 'happiness', delta: -2 }],
          },
        ],
      },
    ],
  },
  // ---------- recognition and the long career ----------
  {
    id: 'sci_projector_fails',
    kind: 'choice',
    category: 'work',
    ages: [23, 70],
    weight: 7,
    cooldownYears: 6,
    when: all(researching, papers(1)),
    text: 'Two minutes into your conference talk the projector gives a tired click and dies. Three hundred people look at a blank screen, then at you.',
    choices: [
      {
        id: 'memory',
        label: 'Carry on from memory with big hand gestures',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.4),
            text: 'You describe every graph with your arms and the room follows. Several people say afterwards it was the best talk of the meeting. Nobody can remember a single number.',
            effects: [
              { system: 'sci_rep', arg: '4' },
              { stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You lose the thread somewhere around the third imaginary figure and finish early to merciful applause.',
            effects: [
              { system: 'sci_rep', arg: '-1' },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'board',
        label: 'Grab a marker and draw on the whiteboard',
        outcomes: [
          {
            chance: 1,
            text: 'Your main result is reconstructed in green marker, slightly wonky. A professor in the front row photographs it as though it were a cave painting.',
            effects: [
              { system: 'sci_rep', arg: '2' },
              { skill: 'art', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'wait',
        label: 'Wait for the technician',
        outcomes: [
          {
            chance: 1,
            text: 'The technician arrives after eight minutes of silence, presses a button, and leaves. You give the talk at double speed and skip your favourite slide.',
            effects: [{ stat: 'stress', delta: 4 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_keynote_abroad',
    kind: 'choice',
    category: 'travel',
    ages: [32, 75],
    weight: 6,
    cooldownYears: 5,
    when: all(researching, standing(50), hasPartner),
    text: 'You are invited to give the opening keynote at the big international meeting in your field, on another continent, flight and hotel paid. It falls on your partner’s birthday weekend.',
    choices: [
      {
        id: 'go',
        label: 'Go and give the talk of your life',
        outcomes: [
          {
            chance: 1,
            text: 'You walk onto the biggest stage of your career and the room is full. Afterwards a queue forms to ask questions, and a jet-lagged birthday call is made from the hotel.',
            effects: [
              { system: 'sci_rep', arg: '4' },
              { fame: 1 },
              { stat: 'happiness', delta: 4 },
              { stat: 'stress', delta: 3 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'bring',
        label: 'Take your partner along',
        requires: canAfford(2500),
        outcomes: [
          {
            chance: 1,
            text: 'You give the keynote, then spend three days being tourists together. The extra ticket costs plenty. The birthday is remembered for years.',
            effects: [
              { money: -2500 },
              { system: 'sci_rep', arg: '3' },
              { stat: 'happiness', delta: 9 },
            ],
          },
        ],
      },
      {
        id: 'send',
        label: 'Send your best postdoc to give it',
        outcomes: [
          {
            chance: 1,
            text: 'Your postdoc gives your keynote, wonderfully, and comes home with three job offers. You stay home with cake.',
            effects: [
              { stat: 'karma', delta: 3 },
              { stat: 'happiness', delta: 4 },
              { system: 'sci_rep', arg: '1' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_nobel_rumour',
    kind: 'notice',
    category: 'fame',
    ages: [45, 95],
    weight: 6,
    cooldownYears: 3,
    when: all(lifeInScience, standing(85), nobelField),
    text: 'October comes round, and once again your name is on the betting lists for the prize from Stockholm. Journalists ring the department. You keep your phone on the pillow.',
    outcomes: [
      {
        chance: 1,
        text: 'The call goes to someone else, as it does most years. You send them a warm note and go back to the lab, where nobody mentions it, kindly.',
        texts: [
          'Morning comes and the phone stays silent. A student brings in a cake anyway, iced with the words "NEXT YEAR".',
          'The announcement names three people you know well. You raise a glass to them at dinner and mean it, mostly.',
        ],
        effects: [{ stat: 'stress', delta: 3 }, { fame: 1 }],
      },
    ],
  },
  {
    id: 'sci_honorary_doctorate',
    kind: 'choice',
    category: 'fame',
    ages: [50, 90],
    weight: 5,
    cooldownYears: 10,
    when: all(lifeInScience, standing(60)),
    text: 'A university you have never worked at wants to give you an honorary doctorate. There will be a velvet hat, a long gown in a colour not found in nature, and a speech to graduates.',
    choices: [
      {
        id: 'accept',
        label: 'Accept, and write a real speech',
        outcomes: [
          {
            chance: 1,
            text: 'You tell eight hundred graduates about every experiment that failed and why you kept going. Parents cry. The hat falls off once.',
            effects: [
              { system: 'sci_rep', arg: '3' },
              { stat: 'happiness', delta: 8 },
              { fame: 1 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'short',
        label: 'Accept, but keep the speech to two minutes',
        outcomes: [
          {
            chance: 1,
            text: 'Your two-minute speech is the most popular thing on the programme. The vice-chancellor goes on for twenty-five.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { system: 'sci_rep', arg: '1' },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Decline politely: the work is the honour',
        outcomes: [
          {
            chance: 1,
            text: 'Your gracious refusal is quoted in their newsletter as if it were a speech of its own. You stay home and weed the garden.',
            effects: [
              { stat: 'karma', delta: 2 },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sci_festschrift',
    kind: 'choice',
    category: 'fame',
    ages: [62, 92],
    weight: 9,
    once: true,
    when: all(lifeInScience, (s) => (s.science?.rep ?? 0) >= 45 || papers(12)(s)),
    text: 'Your former students have secretly assembled a Festschrift: a whole volume of papers written in your honour, with a portrait on the cover that makes you look wiser than you feel.',
    choices: [
      {
        id: 'read',
        label: 'Read every chapter, slowly',
        outcomes: [
          {
            chance: 1,
            text: 'Each chapter begins with a story about you that you had forgotten. You read the last one twice and have to sit down in the garden for a while.',
            effects: [
              { stat: 'happiness', delta: 12 },
              { system: 'sci_rep', arg: '2' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'party',
        label: 'Throw a party for every contributor',
        requires: canAfford(3000),
        outcomes: [
          {
            chance: 1,
            text: 'Forty years of your lab crowd into a rented hall. The same arguments start up within ten minutes, exactly as if no time had passed.',
            effects: [
              { money: -3000 },
              { stat: 'happiness', delta: 14 },
              { stat: 'karma', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'correct',
        label: 'Find and correct an error in chapter four',
        outcomes: [
          {
            chance: 1,
            text: 'You send the editor three pages of corrections to chapter four. Your students agree it is the most you thing you have ever done, and love you for it.',
            effects: [
              { stat: 'happiness', delta: 8 },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
];
