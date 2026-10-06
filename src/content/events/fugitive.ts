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
];
