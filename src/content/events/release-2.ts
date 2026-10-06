import type { EventDef } from '../../engine/events/types';
import { all, exCon, hasChildren, hasFlag, notInPrison } from './conditions';

const out = all(exCon, notInPrison);

/** What you built inside comes back outside: each event reads a flag from the prison packs. */
export const RELEASE_2_EVENTS: EventDef[] = [
  {
    id: 'rel2_degree_interview',
    kind: 'choice',
    category: 'work',
    ages: [20, 64],
    weight: 8,
    once: true,
    when: all(out, hasFlag('prison_degree')),
    text: 'The interviewer has your CV in one hand and a pen in the other. "A degree, and you studied it where?" The room is very quiet.',
    choices: [
      {
        id: 'truth',
        label: 'Tell the whole story, plainly',
        outcomes: [
          {
            chance: 0.6,
            text: 'You talk about the library cart, the essays by torchlight, the exam in a room with a guard at the door. The interviewer puts the pen down. You start on Monday.',
            effects: [
              { stat: 'happiness', delta: 8 },
              { stat: 'stress', delta: -4 },
              { flag: 'degree_opened_door' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'They thank you for your honesty in the voice people use when they have already decided. It stings, and you are still glad you said it.',
            effects: [
              { stat: 'happiness', delta: -3 },
              { stat: 'karma', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'subject',
        label: 'Talk about the subject instead',
        outcomes: [
          {
            chance: 1,
            text: 'You steer every question back to the work and know it better than they do. They ask where you studied twice more. You answer a different question twice more.',
            effects: [
              { stat: 'smarts', delta: 1 },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rel2_allotment',
    kind: 'choice',
    category: 'random',
    ages: [20, 90],
    weight: 7,
    once: true,
    when: all(out, hasFlag('prison_garden')),
    text: 'A plot comes up at the allotments by the railway: brambles, a shed with no door, and soil that has not seen a spade in years. Your hands know what to do before you do.',
    choices: [
      {
        id: 'take',
        label: 'Take the plot',
        outcomes: [
          {
            chance: 1,
            text: 'By summer there are beans up canes and a neighbour who leaves rhubarb on your step. Nobody here asks where you learned to grow tomatoes like that.',
            effects: [
              { stat: 'happiness', delta: 7 },
              { stat: 'health', delta: 3 },
              { stat: 'stress', delta: -5 },
            ],
          },
        ],
      },
      {
        id: 'window',
        label: 'Grow herbs on the windowsill instead',
        outcomes: [
          {
            chance: 1,
            text: 'Basil, mint, a stubborn chilli plant. A small green square that is entirely yours, and nobody can move you on from it.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rel2_ship_gift',
    kind: 'choice',
    category: 'family',
    ages: [24, 95],
    weight: 7,
    once: true,
    when: all(out, hasFlag('prison_ship'), hasChildren),
    bind: { kid: { role: 'child' } },
    text: 'The model ship you built inside, matchstick by matchstick over three winters, sits on the shelf. {kid.first} keeps looking at it.',
    choices: [
      {
        id: 'give',
        label: 'Give it to {kid.first}',
        outcomes: [
          {
            chance: 1,
            text: 'You tell {kid.first} how long it took and roughly why. {kid.They} take{kid.s} it home on {kid.their} lap like it is made of glass. It is now the first thing anyone sees in {kid.their} hallway.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { rel: 'kid', delta: 10, memory: 'the matchstick ship' },
            ],
          },
        ],
      },
      {
        id: 'keep',
        label: 'Keep it where you can see it',
        outcomes: [
          {
            chance: 1,
            text: 'You tell {kid.first} it is not finished yet, which is true of most things. It stays on the shelf, a reminder of the patience you did not know you had.',
            effects: [
              { stat: 'stress', delta: -2 },
              { rel: 'kid', delta: 2, memory: 'the ship on the shelf' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rel2_mentee_call',
    kind: 'choice',
    category: 'social',
    ages: [22, 90],
    weight: 7,
    once: true,
    when: all(out, hasFlag('prison_mentor')),
    text: 'A number you do not know. It is someone you showed the ropes to inside, out now, standing in a job centre and not sure what to say to anyone.',
    choices: [
      {
        id: 'meet',
        label: 'Meet them for a coffee',
        outcomes: [
          {
            chance: 1,
            text: 'You give an hour, a bus timetable and the name of a landlord who does not ask questions he does not need the answers to. They text a week later: an interview.',
            effects: [
              { stat: 'happiness', delta: 7 },
              { stat: 'karma', delta: 6 },
              { status: 'friend', first: 'Dario', gender: 'male' },
            ],
          },
        ],
      },
      {
        id: 'advice',
        label: 'Give them the advice over the phone',
        outcomes: [
          {
            chance: 1,
            text: 'Twenty minutes of the things nobody told you. They write it down. You can hear the pen.',
            effects: [
              { stat: 'karma', delta: 3 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'nope',
        label: 'Let it ring out',
        outcomes: [
          {
            chance: 1,
            text: 'You need distance from all of it. That is allowed. You still think about the call on the bus home.',
            effects: [{ stat: 'stress', delta: 3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'rel2_first_things',
    kind: 'notice',
    category: 'random',
    ages: [19, 95],
    weight: 8,
    once: true,
    when: all(out, hasFlag('prison_list')),
    text: 'You find the list you wrote in your last month inside, folded into a book.',
    outcomes: [
      {
        chance: 0.6,
        text: 'Swim in the sea: done. Eat a curry at midnight: done, twice. Say sorry to the right people: in progress. You add a line at the bottom and put it back.',
        effects: [
          { stat: 'happiness', delta: 6 },
          { stat: 'stress', delta: -3 },
        ],
      },
      {
        chance: 0.4,
        text: 'Half the list is still waiting. You pick the easiest item, which is "watch a sunset from a hill", and do it that evening.',
        effects: [
          { stat: 'happiness', delta: 5 },
          { stat: 'health', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'rel2_trade_trial',
    kind: 'choice',
    category: 'work',
    ages: [19, 60],
    weight: 8,
    once: true,
    when: all(out, hasFlag('prison_trade_cert')),
    text: 'A site manager looks at your training certificate, then at you. "Trial shift, Thursday, seven sharp. Do not be late and do not be clever."',
    choices: [
      {
        id: 'go',
        label: 'Turn up at a quarter to seven',
        outcomes: [
          {
            chance: 0.7,
            text: 'You are first on site and last off it. By Friday the manager is calling you by your first name, which on a building site is practically a contract.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'discipline', delta: 3 },
              { money: 400, kind: 'wage' },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'The work goes fine. The paperwork does not: the insurer wants a clean record. The manager is apologetic, and gives you a number to call.',
            effects: [{ stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'skip',
        label: 'Tell them you have something else lined up',
        outcomes: [
          {
            chance: 1,
            text: 'You do not, really. You keep the certificate in your wallet anyway, folded small.',
            effects: [{ stat: 'stress', delta: 3 }],
          },
        ],
      },
    ],
  },
];
