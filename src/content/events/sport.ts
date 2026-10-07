import type { EventDef } from '../../engine/events/types';

/** Sport as a career: the offer that turns a talent into a living (fired by the sport system). */
export const SPORT_EVENTS: EventDef[] = [
  {
    id: 'sport_pro_offer',
    kind: 'choice',
    category: 'work',
    emoji: '✍️',
    ages: [16, 40],
    weight: 1,
    chainOnly: true,
    text: 'A professional {sport} club has been watching. Their offer is on the kitchen table: a contract, a salary, and a training schedule that leaves room for very little else.',
    choices: [
      {
        id: 'sign',
        label: 'Sign it',
        outcomes: [
          {
            chance: 1,
            text: 'You sign at the training ground with a photographer in the room. From Monday, {sport} is your job.',
            effects: [
              { system: 'turn_pro' },
              { stat: 'happiness', delta: 10 },
              { flag: 'pro_athlete' },
            ],
          },
        ],
      },
      {
        id: 'amateur',
        label: 'Stay amateur and keep your options open',
        outcomes: [
          {
            chance: 1,
            text: 'You turn it down politely. You keep playing for the love of it, and keep your evenings for everything else.',
            effects: [{ stat: 'stress', delta: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sport_pro_draft',
    kind: 'choice',
    category: 'work',
    emoji: '🎤',
    ages: [19, 30],
    weight: 1,
    chainOnly: true,
    text: 'Draft night. You sit in a borrowed suit with your family around a phone, waiting for a professional {sport} team to say your name on live television. {$draftline}',
    choices: [
      {
        id: 'sign',
        label: 'Sign your rookie contract',
        outcomes: [
          {
            chance: 1,
            text: 'You pull on the team cap for the cameras and sign a rookie deal the next week. From training camp on, {sport} is your job.',
            effects: [
              { system: 'turn_pro' },
              { stat: 'happiness', delta: 10 },
              { flag: 'pro_athlete' },
            ],
          },
        ],
      },
      {
        id: 'amateur',
        label: 'Turn it down and keep your future open',
        outcomes: [
          {
            chance: 1,
            text: 'You thank them and walk away from the draft, to the disbelief of everyone you know. The phone stops ringing within a month.',
            effects: [{ stat: 'stress', delta: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sport_pro_tour',
    kind: 'choice',
    category: 'work',
    emoji: '🎾',
    ages: [16, 30],
    weight: 1,
    chainOnly: true,
    text: 'Your results have earned you a ranking and a racket sponsor who wants you on the professional {sport} tour: entry fees, flights, coaching, and a year of living out of a suitcase.',
    choices: [
      {
        id: 'sign',
        label: 'Turn professional',
        outcomes: [
          {
            chance: 1,
            text: "You play your first event as a professional in a half-empty stadium and win a round. From now on, {sport} pays the bills, or doesn't.",
            effects: [
              { system: 'turn_pro' },
              { stat: 'happiness', delta: 10 },
              { flag: 'pro_athlete' },
            ],
          },
        ],
      },
      {
        id: 'amateur',
        label: 'Stay amateur for now',
        outcomes: [
          {
            chance: 1,
            text: 'You decline the sponsor and keep playing local tournaments. Nobody books you a flight anywhere.',
            effects: [{ stat: 'stress', delta: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sport_pro_sponsor',
    kind: 'choice',
    category: 'work',
    emoji: '👟',
    ages: [18, 34],
    weight: 1,
    chainOnly: true,
    text: 'A sportswear company has noticed your times. They offer a sponsorship deal to compete in {sport} full-time: a stipend, kit, coaching and bonuses for every medal.',
    choices: [
      {
        id: 'sign',
        label: 'Sign the deal and go full-time',
        outcomes: [
          {
            chance: 1,
            text: 'You sign in a branded tracksuit that arrives two sizes too big. From now on, {sport} is your full-time job.',
            effects: [
              { system: 'turn_pro' },
              { stat: 'happiness', delta: 10 },
              { flag: 'pro_athlete' },
            ],
          },
        ],
      },
      {
        id: 'amateur',
        label: 'Keep it a passion, not a living',
        outcomes: [
          {
            chance: 1,
            text: 'You keep training around everything else. It is slower, but nobody owns your Saturdays.',
            effects: [{ stat: 'stress', delta: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sport_pro_team',
    kind: 'choice',
    category: 'work',
    emoji: '🚴',
    ages: [19, 32],
    weight: 1,
    chainOnly: true,
    text: 'A professional {sport} team wants you as a neo-pro: a two-year contract, a team car, a bike worth more than a family car, and a race calendar that never seems to end.',
    choices: [
      {
        id: 'sign',
        label: 'Sign with the team',
        outcomes: [
          {
            chance: 1,
            text: 'You get your team kit and a number pinned to your back by a mechanic who has done it ten thousand times. From now on, {sport} is your job.',
            effects: [
              { system: 'turn_pro' },
              { stat: 'happiness', delta: 10 },
              { flag: 'pro_athlete' },
            ],
          },
        ],
      },
      {
        id: 'amateur',
        label: 'Stay with the amateur club',
        outcomes: [
          {
            chance: 1,
            text: 'You decline and keep racing for the club on weekends. The team signs someone else by Friday.',
            effects: [{ stat: 'stress', delta: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sport_scholarship',
    kind: 'choice',
    category: 'school',
    emoji: '🎓',
    ages: [17, 19],
    weight: 1,
    chainOnly: true,
    text: 'A university {sport} coach has been in the stands for your last three games. Now there is a letter on the kitchen table: a full athletic scholarship. Tuition, books, a dorm room and a place on the team.',
    choices: [
      {
        id: 'business',
        label: 'Accept, and study business',
        outcomes: [
          {
            chance: 1,
            text: 'You sign on the kitchen table while your family takes photographs of you signing on the kitchen table.',
            effects: [{ system: 'sport_scholarship', arg: 'business' }],
          },
        ],
      },
      {
        id: 'education',
        label: 'Accept, and study education (coaching, one day)',
        outcomes: [
          {
            chance: 1,
            text: 'You sign, and pick a degree that keeps a whistle in your future either way.',
            effects: [{ system: 'sport_scholarship', arg: 'education' }],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Turn it down',
        outcomes: [
          {
            chance: 1,
            text: 'You write a polite letter saying no. The coach writes back to say the door is closed, but kindly.',
            effects: [{ flag: 'declined_scholarship' }],
          },
        ],
      },
    ],
  },
];
