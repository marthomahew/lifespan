import type { EventDef } from '../../engine/events/types';

const odds = (_s: unknown, p: Record<string, string | number | boolean>): number =>
  Number(p['odds'] ?? 0.5);
const miss = (_s: unknown, p: Record<string, string | number | boolean>): number =>
  1 - Number(p['odds'] ?? 0.5);
const boost =
  (d: number) =>
  (_s: unknown, p: Record<string, string | number | boolean>): number =>
    Math.min(0.97, Math.max(0.03, Number(p['odds'] ?? 0.5) + d));
const unboost =
  (d: number) =>
  (_s: unknown, p: Record<string, string | number | boolean>): number =>
    1 - Math.min(0.97, Math.max(0.03, Number(p['odds'] ?? 0.5) + d));

/** Events fired by systems rather than drawn at random: interviews, call-ups, deployments, record deals. */
export const SYSTEM_EVENTS: EventDef[] = [
  {
    id: 'interview_panel',
    kind: 'choice',
    category: 'work',
    ages: [14, 90],
    weight: 0,
    chainOnly: true,
    text: 'The interview for {$title} is a panel of four. One is eating crisps. The chair asks you to describe your greatest weakness.',
    choices: [
      {
        id: 'honest',
        label: 'Answer honestly',
        outcomes: [
          {
            chance: odds,
            success: true,
            text: 'Your honesty disarms the panel. The crisp-eater nods slowly. You get the job.',
            effects: [{ system: 'hire' }, { stat: 'happiness', delta: 6 }],
          },
          {
            chance: miss,
            text: 'You are a little too honest. They thank you for your time in a way that ends things.',
            effects: [{ stat: 'happiness', delta: -4 }],
          },
        ],
      },
      {
        id: 'humblebrag',
        label: '"I care too much"',
        outcomes: [
          {
            chance: boost(-0.1),
            success: true,
            text: 'Somehow the oldest answer in the book works. You start Monday.',
            effects: [{ system: 'hire' }, { stat: 'happiness', delta: 5 }],
          },
          {
            chance: unboost(-0.1),
            text: 'Three of the four panellists visibly sigh. The fourth keeps eating crisps.',
            effects: [{ stat: 'happiness', delta: -5 }],
          },
        ],
      },
      {
        id: 'question',
        label: 'Turn it into a question about the team',
        outcomes: [
          {
            chance: boost(0.05),
            success: true,
            text: 'You talk about the team for ten minutes and they talk about you for the next week. Hired.',
            effects: [{ system: 'hire' }, { stat: 'happiness', delta: 6 }],
          },
          {
            chance: unboost(0.05),
            text: 'The pivot is noticed. The chair writes something down and underlines it.',
            effects: [{ stat: 'happiness', delta: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'interview_casual',
    kind: 'choice',
    category: 'work',
    ages: [14, 90],
    weight: 0,
    chainOnly: true,
    text: 'The {$title} interview is "just a casual chat" at a café. The manager is already on their second flat white and asks what drives you.',
    choices: [
      {
        id: 'passion',
        label: 'Talk about your passion',
        outcomes: [
          {
            chance: odds,
            success: true,
            text: 'You light up and so does the manager. The job is yours, and so is the bill.',
            effects: [{ system: 'hire' }, { stat: 'happiness', delta: 6 }],
          },
          {
            chance: miss,
            text: "Your passion turns out to be mostly about the café's pastries. No offer comes.",
            effects: [{ stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'money',
        label: 'Say "money, mostly"',
        outcomes: [
          {
            chance: boost(-0.15),
            success: true,
            text: 'The manager laughs, says they respect it, and hires you on the spot.',
            effects: [{ system: 'hire' }, { stat: 'happiness', delta: 5 }],
          },
          {
            chance: unboost(-0.15),
            text: 'The manager says "ha" without laughing. You pay for your own coffee.',
            effects: [{ stat: 'happiness', delta: -4 }],
          },
        ],
      },
    ],
  },
  {
    id: 'interview_test',
    kind: 'choice',
    category: 'work',
    ages: [14, 90],
    weight: 0,
    chainOnly: true,
    text: 'Before the {$title} interview there is a practical test, timed, in a room with a ticking clock that is definitely there on purpose.',
    choices: [
      {
        id: 'careful',
        label: 'Work carefully',
        outcomes: [
          {
            chance: boost(0.05),
            success: true,
            text: 'You finish with seconds to spare and no mistakes. The offer arrives by email that evening.',
            effects: [{ system: 'hire' }, { stat: 'happiness', delta: 6 }],
          },
          {
            chance: unboost(0.05),
            text: 'You run out of time two questions from the end. Careful, it turns out, is also slow.',
            effects: [{ stat: 'happiness', delta: -4 }],
          },
        ],
      },
      {
        id: 'fast',
        label: 'Rush it',
        outcomes: [
          {
            chance: boost(-0.1),
            success: true,
            text: 'You blitz the test. The examiner rechecks it twice, then hires you.',
            effects: [{ system: 'hire' }, { stat: 'happiness', delta: 6 }],
          },
          {
            chance: unboost(-0.1),
            text: 'Fast and wrong, in that order. They let you know by Friday.',
            effects: [{ stat: 'happiness', delta: -5 }],
          },
        ],
      },
      {
        id: 'walk',
        label: 'Walk out',
        outcomes: [
          {
            chance: 1,
            text: 'You decide you do not want a job that starts with a ticking clock. It feels great for an hour.',
            effects: [{ stat: 'stress', delta: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'military_conscription_notice',
    kind: 'choice',
    category: 'military',
    ages: [16, 30],
    weight: 0,
    chainOnly: true,
    text: 'A brown envelope arrives: you are called up for {$years} year(s) of national service.',
    choices: [
      {
        id: 'army',
        label: 'Report to the Army',
        outcomes: [
          {
            chance: 1,
            text: 'You pack a bag and say goodbye to your own bed.',
            effects: [{ system: 'conscript', arg: 'Army' }],
          },
        ],
      },
      {
        id: 'navy',
        label: 'Ask for the Navy',
        outcomes: [
          {
            chance: 1,
            text: 'They grant the request. You will learn about seasickness first-hand.',
            effects: [{ system: 'conscript', arg: 'Navy' }],
          },
        ],
      },
      {
        id: 'air',
        label: 'Ask for the Air Force',
        outcomes: [
          {
            chance: 1,
            text: 'They grant it. Mostly you will be near aircraft rather than in them.',
            effects: [{ system: 'conscript', arg: 'Air Force' }],
          },
        ],
      },
      {
        id: 'object',
        label: 'Object and do civilian service',
        outcomes: [
          {
            chance: 0.7,
            text: 'The tribunal accepts your objection. You spend the time in a care home, where you are adored by everyone over ninety.',
            effects: [
              { flag: 'civilian_service' },
              { stat: 'karma', delta: 6 },
              { stat: 'stress', delta: 4 },
            ],
          },
          {
            chance: 0.3,
            text: 'The tribunal does not accept your objection. You report to the Army after all, with a reputation.',
            effects: [
              { system: 'conscript', arg: 'Army' },
              { stat: 'stress', delta: 8 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'military_deployment_patrol',
    kind: 'choice',
    category: 'military',
    ages: [17, 60],
    weight: 0,
    chainOnly: true,
    text: 'On patrol, your unit is pinned down at a crossroads. Your sergeant looks at you.',
    choices: [
      {
        id: 'cover',
        label: 'Lay down covering fire',
        outcomes: [
          {
            chance: 0.7,
            success: true,
            text: 'The unit gets clear. Nobody talks about it afterwards, and everybody remembers.',
            effects: [
              { stat: 'stress', delta: 10 },
              { stat: 'karma', delta: 3 },
            ],
          },
          {
            chance: 0.3,
            text: 'Shrapnel catches your leg. A medic gets to you fast. You will walk again, slowly.',
            effects: [{ injury: 25 }, { stat: 'stress', delta: 15 }],
          },
        ],
      },
      {
        id: 'hold',
        label: 'Hold position and wait',
        outcomes: [
          {
            chance: 1,
            text: 'Support arrives after the longest forty minutes of your life.',
            effects: [{ stat: 'stress', delta: 12 }],
          },
        ],
      },
    ],
  },
  {
    id: 'military_deployment_convoy',
    kind: 'choice',
    category: 'military',
    ages: [17, 60],
    weight: 0,
    chainOnly: true,
    text: 'Your convoy stops on a road that feels wrong. The driver wants to push on before dark.',
    choices: [
      {
        id: 'reroute',
        label: 'Insist on a different route',
        outcomes: [
          {
            chance: 1,
            success: true,
            text: 'The detour costs six hours. Later you hear what happened on the other road.',
            effects: [
              { stat: 'stress', delta: 8 },
              { stat: 'karma', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'push',
        label: 'Push on',
        outcomes: [
          {
            chance: 0.75,
            text: 'Nothing happens. You do not sleep well anyway.',
            effects: [{ stat: 'stress', delta: 6 }],
          },
          {
            chance: 0.25,
            text: 'The blast throws the truck sideways. You wake up in a field hospital with ringing ears, and the doctors say your service is over.',
            effects: [
              { injury: 30 },
              { stat: 'stress', delta: 18 },
              { system: 'injury_discharge' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'military_deployment_letter',
    kind: 'choice',
    category: 'military',
    ages: [17, 60],
    weight: 0,
    chainOnly: true,
    text: 'Weeks into deployment, the chaplain mentions that counselling is available, no questions asked.',
    choices: [
      {
        id: 'talk',
        label: 'Go and talk to someone',
        outcomes: [
          {
            chance: 1,
            text: 'It helps more than you expected. You keep going back.',
            effects: [{ system: 'therapy' }],
          },
        ],
      },
      {
        id: 'fine',
        label: 'Say you are fine',
        outcomes: [
          {
            chance: 1,
            text: 'You are not fine. You carry it home with the rest of your kit.',
            effects: [
              { stat: 'stress', delta: 10 },
              { stat: 'happiness', delta: -5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'military_deployment_medic',
    kind: 'choice',
    category: 'military',
    ages: [17, 60],
    weight: 0,
    chainOnly: true,
    text: 'A local family brings an injured child to the gate. Regulations are unclear.',
    choices: [
      {
        id: 'help',
        label: 'Get the medic',
        outcomes: [
          {
            chance: 1,
            success: true,
            text: 'The child goes home with a cast and a sticker. The family sends bread for a week.',
            effects: [
              { stat: 'karma', delta: 8 },
              { stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'rules',
        label: 'Follow the rules',
        outcomes: [
          {
            chance: 1,
            text: 'You send them to the clinic in town. You think about it for years.',
            effects: [
              { stat: 'happiness', delta: -6 },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'fame_record_deal_offer',
    kind: 'choice',
    category: 'fame',
    ages: [14, 90],
    weight: 0,
    chainOnly: true,
    text: 'A scout from a record label caught your last release and wants a meeting. Their business card is matte black, which seems significant.',
    choices: [
      {
        id: 'sign',
        label: 'Sign the deal',
        outcomes: [
          {
            chance: 1,
            success: true,
            text: 'You sign. Somebody pops a cork and you pretend you are used to this.',
            effects: [
              { system: 'sign_label' },
              { stat: 'happiness', delta: 10 },
              { stat: 'fame', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'indie',
        label: 'Stay independent',
        outcomes: [
          {
            chance: 1,
            text: 'You keep your masters and your van. The scout says the door is open, which it is not.',
            effects: [
              { stat: 'karma', delta: 3 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
];
