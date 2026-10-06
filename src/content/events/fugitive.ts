import type { EventDef } from '../../engine/events/types';
import { all, canAfford, onTheRun } from './conditions';

/** Life on the run after an escape. Every event needs onTheRun. */
export const FUGITIVE_EVENTS: EventDef[] = [
  {
    id: 'fug_face_on_the_news',
    kind: 'choice',
    category: 'crime',
    ages: [16, 90],
    weight: 9,
    once: true,
    when: onTheRun,
    text: 'The local news runs a photo of you from before. It is not a good photo. The man at the corner shop looks at the screen, then at you, then at the screen.',
    choices: [
      {
        id: 'cut',
        label: 'Change your hair that afternoon',
        outcomes: [
          {
            chance: 1,
            text: 'Kitchen scissors, a box of dye, a long hard look in the mirror. You barely recognise yourself, which is the point and also slightly upsetting.',
            effects: [
              { stat: 'stress', delta: -4 },
              { stat: 'looks', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'chat',
        label: 'Make small talk about the weather',
        outcomes: [
          {
            chance: 0.7,
            text: 'You talk about the rain for four minutes with total commitment. He gives you your change and says, "Shocking, isn’t it." You agree that it is.',
            effects: [{ stat: 'stress', delta: 3 }],
            success: true,
          },
          {
            chance: 0.3,
            text: 'He keeps glancing at the phone by the till. You leave your milk on the counter and do not go back to that end of town.',
            effects: [{ stat: 'stress', delta: 8 }],
          },
        ],
      },
    ],
  },
  {
    id: 'fug_new_name',
    kind: 'choice',
    category: 'crime',
    ages: [18, 90],
    weight: 7,
    once: true,
    when: onTheRun,
    text: 'Someone who knows someone can get you papers in a different name. It is not cheap, and it is not legal.',
    choices: [
      {
        id: 'buy',
        label: 'Pay for the papers',
        requires: canAfford(3000),
        outcomes: [
          {
            chance: 0.75,
            text: 'An envelope in a café toilet. The photo is you; the name belongs to nobody. You practise signing it until it looks like yours.',
            effects: [
              { money: -3000, kind: 'price' },
              { stat: 'stress', delta: -6 },
              { flag: 'false_papers' },
            ],
            success: true,
          },
          {
            chance: 0.25,
            text: 'You hand over the money. Nobody comes back with the envelope. Nobody was ever going to.',
            effects: [
              { money: -3000, kind: 'price' },
              { stat: 'happiness', delta: -6 },
            ],
          },
        ],
      },
      {
        id: 'no',
        label: 'Stay as you are and stay careful',
        outcomes: [
          {
            chance: 1,
            text: 'You keep cash in a sock, your head down, and your phone off. It is tiring, being nobody.',
            effects: [{ stat: 'stress', delta: 4 }],
          },
        ],
      },
    ],
  },
  {
    id: 'fug_checkpoint',
    kind: 'choice',
    category: 'crime',
    ages: [16, 90],
    weight: 6,
    cooldownYears: 4,
    when: onTheRun,
    text: 'Police are stopping cars at the roundabout tonight, one by one, torches in windows. You are four cars back.',
    choices: [
      {
        id: 'calm',
        label: 'Sit tight and look bored',
        outcomes: [
          {
            chance: 0.65,
            text: 'The officer is more interested in your tyre tread than your face. "Get those looked at." You will. You absolutely will.',
            effects: [{ stat: 'stress', delta: 6 }],
            success: true,
          },
          {
            chance: 0.35,
            text: 'The torch stays on your face a beat too long. "Step out of the car, please." The running is over.',
            effects: [{ system: 'recapture' }],
          },
        ],
      },
      {
        id: 'turn',
        label: 'Turn off before you reach them',
        outcomes: [
          {
            chance: 0.8,
            text: 'You take a side road nobody sensible would use and sit in a lay-by for an hour with the lights off, listening to your own heart.',
            effects: [{ stat: 'stress', delta: 8 }],
            success: true,
          },
          {
            chance: 0.2,
            text: 'Turning off is exactly what they were watching for. Blue lights in the mirror, then everywhere.',
            effects: [{ system: 'recapture' }],
          },
        ],
      },
    ],
  },
  {
    id: 'fug_quiet_life',
    kind: 'notice',
    category: 'random',
    ages: [20, 95],
    weight: 6,
    once: true,
    when: all(onTheRun, (s) => !!s.legal.fugitive && s.year - s.legal.fugitive.since >= 5),
    text: 'Five years under the radar.',
    outcomes: [
      {
        chance: 0.6,
        text: 'You have a favourite bench now, and a neighbour who waves. Some days you forget, for whole hours, that anyone was ever looking for you.',
        effects: [
          { stat: 'happiness', delta: 4 },
          { stat: 'stress', delta: -4 },
        ],
      },
      {
        chance: 0.4,
        text: 'A siren two streets away still makes you check where your shoes are. The quiet life is quiet, but it is never restful.',
        effects: [{ stat: 'stress', delta: 5 }],
      },
    ],
  },
  {
    id: 'fug_cash_work',
    kind: 'choice',
    category: 'work',
    ages: [17, 70],
    weight: 8,
    cooldownYears: 5,
    when: all(onTheRun, (s) => !s.career.partTimeId && !s.career.jobId),
    text: 'A café owner with a hand-written sign in the window wants someone for the counter. Cash, no questions, no forms. She looks at you for a long moment and does not ask any.',
    choices: [
      {
        id: 'take',
        label: 'Take the shifts',
        outcomes: [
          {
            chance: 1,
            text: 'You learn the coffee machine, the regulars and the art of not giving your surname. It is honest work, which is a strange thing to be grateful for.',
            effects: [
              { system: 'hire', arg: 'pt_cafe_counter' },
              { stat: 'stress', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'no',
        label: 'Keep moving',
        outcomes: [
          {
            chance: 1,
            text: 'Staying anywhere long enough to have regulars feels like a risk. You thank her and buy a coffee for the road.',
            effects: [{ stat: 'stress', delta: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'fug_recognised',
    kind: 'choice',
    category: 'crime',
    ages: [18, 90],
    weight: 6,
    once: true,
    when: onTheRun,
    text: 'A man at the bus stop says your old name, quietly, without turning his head. He knew you inside. He says he can keep quiet, for a price.',
    choices: [
      {
        id: 'pay',
        label: 'Pay him to forget',
        requires: canAfford(1500),
        outcomes: [
          {
            chance: 0.7,
            text: 'An envelope changes hands behind the shelter. You never see him again, which is exactly what you paid for.',
            effects: [
              { money: -1500, kind: 'price' },
              { stat: 'stress', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'He takes the money, and the next month he is back for more. You move flats that weekend.',
            effects: [
              { money: -1500, kind: 'price' },
              { stat: 'stress', delta: 10 },
            ],
          },
        ],
      },
      {
        id: 'bluff',
        label: 'Tell him he has the wrong person',
        outcomes: [
          {
            chance: 0.6,
            text: 'You look straight through him and get on the wrong bus. By the time it reaches the depot, he has decided he was mistaken.',
            effects: [{ stat: 'stress', delta: 6 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'He shrugs, takes out his phone and makes a call. You get off at the next stop and keep walking, but it is already too late.',
            effects: [{ system: 'recapture' }],
          },
        ],
      },
    ],
  },
  {
    id: 'fug_family_call',
    kind: 'choice',
    category: 'family',
    ages: [18, 90],
    weight: 6,
    cooldownYears: 6,
    when: onTheRun,
    bind: { fam: { role: 'mother' } },
    text: 'It is {fam.first}’s birthday. You have a phone box, a pocket of coins, and a very good idea of who might be listening to {fam.their} line.',
    choices: [
      {
        id: 'call',
        label: 'Call anyway',
        outcomes: [
          {
            chance: 0.75,
            text: 'Four minutes. {fam.first} cries, then laughs, then tells you to hang up before you get caught. You walk for an hour afterwards.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { rel: 'fam', delta: 8, memory: 'the birthday call from a phone box' },
            ],
            success: true,
          },
          {
            chance: 0.25,
            text: 'Halfway through, a car pulls up across the road with its engine running. You leave the receiver swinging.',
            effects: [{ system: 'recapture' }],
          },
        ],
      },
      {
        id: 'card',
        label: 'Send a card with no return address',
        outcomes: [
          {
            chance: 1,
            text: 'You write three versions and send the shortest. Somewhere, {fam.first} will know it is from you from the handwriting alone.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { rel: 'fam', delta: 3, memory: 'a card with no return address' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'fug_anniversary',
    kind: 'notice',
    category: 'random',
    ages: [18, 95],
    weight: 6,
    once: true,
    when: all(onTheRun, (s) => !!s.legal.fugitive && s.year - s.legal.fugitive.since >= 10),
    text: 'Ten years since the fence.',
    outcomes: [
      {
        chance: 0.5,
        text: 'A local paper runs a "where are they now" piece about the escape. They have no idea. You read it in a café, two streets from your flat.',
        effects: [
          { stat: 'stress', delta: 4 },
          { stat: 'happiness', delta: 1 },
        ],
      },
      {
        chance: 0.5,
        text: 'Nobody marks it but you. You buy a cake, eat one slice, and think about the version of you who stayed inside.',
        effects: [{ stat: 'happiness', delta: 2 }],
      },
    ],
  },
];
