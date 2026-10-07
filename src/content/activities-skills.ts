import type { ActivityDef } from './types';

/** One activity per skill, with its own stories (Practise a skill remains for any of them). */
export const SKILL_ACTIVITIES: ActivityDef[] = [
  {
    id: 'code_project',
    label: 'Code a side project',
    emoji: '💻',
    group: 'mind_body',
    ages: [10, 100],
    minYear: 1978,
    limitPerYear: 1,
    description: 'A little program of your own, built in the evenings.',
    outcomes: [
      {
        chance: 0.45,
        success: true,
        text: 'Your side project works, and three strangers start using it. You read every message twice.',
        texts: [
          'You build a tool that saves you an hour a week. It took forty hours to build. Worth it.',
          'A bug that haunted you for a month turns out to be one misplaced character. You fix it at 1 a.m. and cheer.',
        ],
        effects: [
          { skill: 'programming', delta: 6 },
          { stat: 'smarts', delta: 1 },
          { stat: 'happiness', delta: 3 },
        ],
      },
      {
        chance: 0.4,
        text: 'You get halfway, rewrite it twice, and learn more from the rewrites than you would have from finishing.',
        effects: [{ skill: 'programming', delta: 4 }],
      },
      {
        chance: 0.15,
        text: 'You spend the whole time configuring tools and never write a line of the actual thing.',
        effects: [
          { skill: 'programming', delta: 1 },
          { stat: 'stress', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'art_class',
    label: 'Take an art class',
    emoji: '🎨',
    group: 'mind_body',
    ages: [6, 100],
    cost: 250,
    limitPerYear: 1,
    description: 'Paints, a patient tutor, and a room that smells of turpentine.',
    outcomes: [
      {
        chance: 0.45,
        success: true,
        text: 'The tutor pins your still life on the wall as an example for the beginners. You walk home a foot taller.',
        texts: [
          'You finally understand shadows. Everything you paint after that looks like it is actually there.',
        ],
        effects: [
          { skill: 'art', delta: 6 },
          { stat: 'happiness', delta: 4 },
        ],
      },
      {
        chance: 0.4,
        text: 'Ten weeks of practice, a full sketchbook, and slow, real progress.',
        effects: [
          { skill: 'art', delta: 4 },
          { stat: 'happiness', delta: 1 },
        ],
      },
      {
        chance: 0.15,
        text: 'Everything you draw comes out a little sad, including the fruit bowl.',
        effects: [{ skill: 'art', delta: 2 }],
      },
    ],
  },
  {
    id: 'cooking_lessons',
    label: 'Cookery lessons',
    emoji: '🍳',
    group: 'mind_body',
    ages: [10, 100],
    cost: 300,
    limitPerYear: 1,
    description: 'Knife skills, sauces, and someone to tell you when to stop stirring.',
    outcomes: [
      {
        chance: 0.45,
        success: true,
        text: 'You master a sauce the chef says most of his staff can’t make. You cook it for everyone you know.',
        texts: ['Your bread finally rises. You photograph it from four angles.'],
        effects: [
          { skill: 'cooking', delta: 6 },
          { stat: 'happiness', delta: 4 },
        ],
      },
      {
        chance: 0.4,
        text: 'A course of solid Tuesdays: you chop faster, burn less, and season more.',
        effects: [{ skill: 'cooking', delta: 4 }],
      },
      {
        chance: 0.15,
        text: 'You set off the smoke alarm in week two and are known as the smoke alarm for the rest of the course.',
        effects: [
          { skill: 'cooking', delta: 2 },
          { stat: 'happiness', delta: -1 },
        ],
      },
    ],
  },
  {
    id: 'singing_lessons',
    label: 'Singing lessons',
    emoji: '🎤',
    group: 'mind_body',
    ages: [6, 100],
    cost: 400,
    limitPerYear: 1,
    description: 'Scales, breathing, and a teacher with a piano and opinions.',
    outcomes: [
      {
        chance: 0.45,
        success: true,
        text: 'You hit a note you didn’t know you had. Your teacher stops playing and just nods.',
        texts: ['You sing at a friend’s birthday and the room goes quiet in the right way.'],
        effects: [
          { skill: 'voice', delta: 6 },
          { stat: 'happiness', delta: 4 },
        ],
      },
      {
        chance: 0.4,
        text: 'A term of breathing exercises that sound ridiculous and work.',
        effects: [{ skill: 'voice', delta: 4 }],
      },
      {
        chance: 0.15,
        text: 'Your voice cracks on the high bit every single week. The teacher says it is “part of the journey”.',
        effects: [{ skill: 'voice', delta: 2 }],
      },
    ],
  },
  {
    id: 'instrument_lessons',
    label: 'Music lessons',
    emoji: '🎹',
    group: 'mind_body',
    ages: [5, 100],
    cost: 450,
    limitPerYear: 1,
    description: 'A weekly lesson on an instrument, and practice you should really do.',
    outcomes: [
      {
        chance: 0.45,
        success: true,
        text: 'You play a whole piece without stopping, and your teacher writes “lovely” in your book.',
        texts: ['You pass your next grade with a merit and a lot of relief.'],
        effects: [
          { skill: 'instrument', delta: 6 },
          { stat: 'happiness', delta: 3 },
        ],
      },
      {
        chance: 0.4,
        text: 'Scales, arpeggios and a piece that slowly stops sounding like an accident.',
        effects: [{ skill: 'instrument', delta: 4 }],
      },
      {
        chance: 0.15,
        text: 'You forget to practise for a month and your teacher can tell within four bars.',
        effects: [
          { skill: 'instrument', delta: 2 },
          { stat: 'discipline', delta: -1 },
        ],
      },
    ],
  },
  {
    id: 'write_stories',
    label: 'Write short stories',
    emoji: '📝',
    group: 'mind_body',
    ages: [8, 110],
    limitPerYear: 1,
    description: 'A notebook, an idea, and a stubborn first sentence.',
    outcomes: [
      {
        chance: 0.45,
        success: true,
        text: 'You finish a story you actually like. A local magazine prints it, with your name spelled right.',
        texts: ['You write something that makes a friend cry, in a good way. They ask for more.'],
        effects: [
          { skill: 'writing', delta: 6 },
          { stat: 'happiness', delta: 3 },
        ],
      },
      {
        chance: 0.4,
        text: 'Three stories started, one finished, and a drawer that is getting full.',
        effects: [{ skill: 'writing', delta: 4 }],
      },
      {
        chance: 0.15,
        text: 'You rewrite the same first paragraph forty times. It is a very good paragraph.',
        effects: [{ skill: 'writing', delta: 2 }],
      },
    ],
  },
  {
    id: 'chess_study',
    label: 'Study chess',
    emoji: '♟️',
    group: 'mind_body',
    ages: [5, 110],
    limitPerYear: 1,
    description: 'Openings, endgames, and the games of the great players, move by move.',
    outcomes: [
      {
        chance: 0.45,
        success: true,
        text: 'An endgame you have failed for years finally makes sense. You set it up again just to win it twice.',
        texts: ['You learn an opening so well you can play it half asleep, and sometimes do.'],
        effects: [
          { skill: 'chess', delta: 6 },
          { stat: 'smarts', delta: 1 },
        ],
      },
      {
        chance: 0.4,
        text: 'A winter of puzzles and old games. You see one move further than you used to.',
        effects: [{ skill: 'chess', delta: 4 }],
      },
      {
        chance: 0.15,
        text: 'You memorise a sharp opening and forget it the first time anyone plays it against you.',
        effects: [{ skill: 'chess', delta: 2 }],
      },
    ],
  },
  {
    id: 'go_running',
    label: 'Train: go running',
    emoji: '🏃',
    group: 'mind_body',
    ages: [8, 90],
    limitPerYear: 1,
    description: 'Early mornings, a route you know by heart, and lungs that slowly agree.',
    outcomes: [
      {
        chance: 0.45,
        success: true,
        text: 'You knock a whole minute off your time over a season. Strangers on your route start nodding.',
        texts: [
          'You run your first half-marathon and finish smiling, which nobody warned you was possible.',
        ],
        effects: [
          { skill: 'athletics', delta: 6 },
          { stat: 'health', delta: 3 },
          { stat: 'happiness', delta: 2 },
        ],
      },
      {
        chance: 0.4,
        text: 'Steady miles through rain and sun. Fitter, if not faster.',
        effects: [
          { skill: 'athletics', delta: 4 },
          { stat: 'health', delta: 2 },
        ],
      },
      {
        chance: 0.15,
        text: 'Shin splints in week three. You spend the season limping to the bus stop.',
        effects: [
          { skill: 'athletics', delta: 1 },
          { stat: 'health', delta: -1 },
        ],
      },
    ],
  },
];
