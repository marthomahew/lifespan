import type { EventDef } from '../../engine/events/types';

/** Forks in a working life, fired by the career system every five to eight years. */
export const CROSSROADS_EVENTS: EventDef[] = [
  {
    id: 'xr_manage',
    kind: 'choice',
    category: 'work',
    ages: [24, 64],
    weight: 1,
    chainOnly: true,
    text: 'Your boss is moving on and wants you to take the team. More money, more meetings, and much less of the work you are actually good at.',
    choices: [
      {
        id: 'manage',
        label: 'Take the team',
        outcomes: [
          {
            chance: 0.65,
            text: 'You turn out to be good at it: fair, calm, and the person people come to. You miss doing the work, a little, every Thursday.',
            effects: [
              { job: 'promote' },
              { stat: 'stress', delta: 8 },
              { stat: 'happiness', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.35,
            text: 'Spreadsheets, appraisals and one man who cries in every one-to-one. The money is better. You are not.',
            effects: [
              { job: 'promote' },
              { stat: 'stress', delta: 14 },
              { stat: 'happiness', delta: -5 },
            ],
          },
        ],
      },
      {
        id: 'craft',
        label: 'Stay hands-on and get better at the craft',
        outcomes: [
          {
            chance: 1,
            text: 'Someone else gets the team. You get the interesting problems, and by the end of the year you are the one people quote.',
            effects: [
              { performance: 10 },
              { stat: 'happiness', delta: 5 },
              { stat: 'stress', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'xr_poached',
    kind: 'choice',
    category: 'work',
    ages: [24, 62],
    weight: 1,
    chainOnly: true,
    text: 'A rival company takes you to lunch and slides a number across the table on a napkin. It is a fifth more than you earn now. Your boss, somehow, already knows.',
    choices: [
      {
        id: 'go',
        label: 'Take the new job',
        outcomes: [
          {
            chance: 0.7,
            text: 'New desk, new badge, new coffee machine you do not understand yet. The money is real and so is the fresh start.',
            effects: [
              { system: 'salary_mult', arg: '1.2' },
              { stat: 'happiness', delta: 4 },
              { stat: 'stress', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'The money is real. So is the culture of answering emails at midnight. You start counting the years until you can leave.',
            effects: [
              { system: 'salary_mult', arg: '1.2' },
              { stat: 'happiness', delta: -4 },
              { stat: 'stress', delta: 10 },
            ],
          },
        ],
      },
      {
        id: 'counter',
        label: 'Use it to ask for a counter-offer',
        outcomes: [
          {
            chance: 0.55,
            text: 'Your boss matches most of it and thanks you for your honesty through slightly gritted teeth.',
            effects: [
              { system: 'salary_mult', arg: '1.12' },
              { stat: 'stress', delta: 2 },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'Your boss calls the bluff. The rival has filled the post by Friday. You stay, a little smaller in the corridor.',
            effects: [{ performance: -8 }, { stat: 'happiness', delta: -4 }],
          },
        ],
      },
      {
        id: 'stay',
        label: 'Stay where you are',
        outcomes: [
          {
            chance: 1,
            text: 'You fold the napkin and keep it in a drawer. Loyalty is not nothing, and neither is knowing where the good biscuits are.',
            effects: [{ stat: 'happiness', delta: 1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'xr_package',
    kind: 'choice',
    category: 'work',
    ages: [30, 64],
    weight: 1,
    chainOnly: true,
    text: 'A restructuring. HR offers voluntary redundancy: a year’s pay to walk away now. Everyone left behind will be doing more for the same.',
    choices: [
      {
        id: 'take',
        label: 'Take the money and walk',
        outcomes: [
          {
            chance: 1,
            text: 'You clear your desk into one box, shake eleven hands and walk out into a Tuesday afternoon with a year of freedom in the bank.',
            effects: [
              { system: 'severance', arg: '1' },
              { job: 'fire' },
              { stat: 'stress', delta: -8 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'stay',
        label: 'Keep your head down and stay',
        outcomes: [
          {
            chance: 0.7,
            text: 'You keep your job and inherit two other people’s. The office is quieter now, and nobody books the big meeting room.',
            effects: [{ stat: 'stress', delta: 8 }, { performance: 4 }],
          },
          {
            chance: 0.3,
            text: 'Six months later, the second round is not voluntary. You leave with half the package and all of the irony.',
            effects: [
              { system: 'severance', arg: '0.5' },
              { job: 'fire' },
              { stat: 'happiness', delta: -8 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'xr_sabbatical',
    kind: 'choice',
    category: 'work',
    ages: [28, 62],
    weight: 1,
    chainOnly: true,
    text: 'After years in the same job, the company offers a sabbatical: six months unpaid, your job held for you. You could actually stop for a while.',
    choices: [
      {
        id: 'go',
        label: 'Take the six months',
        outcomes: [
          {
            chance: 1,
            text: 'You learn to sleep past seven, finish two long books and walk a coastline. You come back slower and better, and the work feels new.',
            effects: [
              { system: 'salary_mult', arg: '0.97' },
              { stat: 'stress', delta: -15 },
              { stat: 'happiness', delta: 8 },
              { stat: 'health', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'no',
        label: 'Not now: there is too much on',
        outcomes: [
          {
            chance: 1,
            text: 'There is always too much on. You file the form away, and it stays filed.',
            effects: [{ performance: 3 }, { stat: 'stress', delta: 3 }],
          },
        ],
      },
    ],
  },
];
