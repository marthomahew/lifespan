import type { EventDef } from '../../engine/events/types';
import { canAfford } from './conditions';
import type { GameState } from '../../engine/types';

const canBail = (s: GameState): boolean =>
  s.legal.case !== null && s.money.cash >= s.legal.case.bail;

/** The court process, fired by the justice system (SPEC §5.10). */
export const LEGAL_EVENTS: EventDef[] = [
  {
    id: 'legal_arrest',
    kind: 'choice',
    category: 'crime',
    weight: 0,
    chainOnly: true,
    text: 'You are arrested for {$crime}. The custody sergeant reads you your rights in the voice of someone reading a bus timetable. Bail is set at {cash:$bail}.',
    choices: [
      {
        id: 'pay',
        label: 'Pay bail',
        requires: canBail,
        outcomes: [
          {
            chance: 1,
            text: 'You hand over the money and get your shoelaces back.',
            effects: [{ system: 'case_bail', arg: 'pay' }],
          },
        ],
      },
      {
        id: 'wait',
        label: 'Wait in a cell',
        outcomes: [
          {
            chance: 1,
            text: 'You spend the wait counting ceiling tiles. There are ninety-one.',
            effects: [{ system: 'case_bail', arg: 'stay' }],
          },
        ],
      },
    ],
  },
  {
    id: 'legal_lawyer',
    kind: 'choice',
    category: 'crime',
    weight: 0,
    chainOnly: true,
    text: 'You are charged with {$crime}. You need a lawyer, and lawyers come in three sizes.',
    choices: [
      {
        id: 'public',
        label: 'Take the public defender',
        outcomes: [
          {
            chance: 1,
            text: 'Your public defender has forty cases and one tired tie. They read your file in the lift.',
            effects: [{ system: 'case_lawyer', arg: 'public' }],
          },
        ],
      },
      {
        id: 'standard',
        label: 'Hire a solid lawyer',
        requires: canAfford(6000),
        outcomes: [
          {
            chance: 1,
            text: 'Your lawyer has a good handshake and a better filing system.',
            effects: [{ system: 'case_lawyer', arg: 'standard' }],
          },
        ],
      },
      {
        id: 'elite',
        label: 'Hire the best money can buy',
        requires: canAfford(40000),
        outcomes: [
          {
            chance: 1,
            text: 'Your lawyer arrives in a coat that costs more than your car and calls the prosecutor by her first name.',
            effects: [{ system: 'case_lawyer', arg: 'elite' }],
          },
        ],
      },
    ],
  },
  {
    id: 'legal_plea',
    kind: 'choice',
    category: 'crime',
    weight: 0,
    chainOnly: true,
    text: 'The prosecution offers a plea deal on the {$crime} charge: plead guilty for a lighter sentence, or take your chances at trial.',
    choices: [
      {
        id: 'plea',
        label: 'Take the plea deal',
        outcomes: [
          {
            chance: 1,
            text: 'You stand up and say "guilty". It is a very short word for how it feels.',
            effects: [{ system: 'case_plea', arg: 'plea' }],
          },
        ],
      },
      {
        id: 'trial',
        label: 'Go to trial',
        outcomes: [
          {
            chance: 1,
            text: 'The trial takes four days. The jury takes six hours. Nobody tells you what the six hours were like for them.',
            effects: [{ system: 'case_plea', arg: 'trial' }],
          },
        ],
      },
    ],
  },
];
