import type { EventDef } from '../../engine/events/types';
import { all, hasChildren, hasFlag, notInPrison } from './conditions';

/** Later chapters for choices the newer systems record. */
export const CALLBACK_3_EVENTS: EventDef[] = [
  {
    id: 'cb3_cottage_summer',
    kind: 'choice',
    category: 'family',
    ages: [40, 95],
    weight: 6,
    cooldownYears: 8,
    when: all(hasFlag('holiday_home'), notInPrison),
    text: 'Summer at the cottage by the sea. The gate is still crooked, the kettle still whistles, and the question is who comes this year.',
    choices: [
      {
        id: 'family',
        label: 'Fill it with family',
        requires: hasChildren,
        outcomes: [
          {
            chance: 1,
            text: 'Sandy floors, too many people, a sandcastle contest that becomes a feud. It is the summer everyone will talk about at Christmas.',
            effects: [
              { stat: 'happiness', delta: 8 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'alone',
        label: 'Go alone and do nothing',
        outcomes: [
          {
            chance: 1,
            text: 'Two weeks, one book, a lot of sea. The village shop learns your order by the third day.',
            effects: [
              { stat: 'stress', delta: -10 },
              { stat: 'happiness', delta: 5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cb3_scholar_letter',
    kind: 'notice',
    category: 'money',
    ages: [45, 110],
    weight: 6,
    once: true,
    when: hasFlag('philanthropist'),
    text: 'A letter arrives from the first student your foundation ever funded.',
    outcomes: [
      {
        chance: 0.5,
        text: 'She is a doctor now. She writes that she would not be, without you, and that she has started a scholarship of her own. You read it three times.',
        effects: [
          { stat: 'happiness', delta: 10 },
          { stat: 'karma', delta: 5 },
        ],
      },
      {
        chance: 0.5,
        text: 'He has just qualified as an engineer and is building a bridge over the river where he grew up. There is a photograph, and a very muddy hard hat.',
        effects: [
          { stat: 'happiness', delta: 9 },
          { stat: 'karma', delta: 5 },
        ],
      },
    ],
  },
  {
    id: 'cb3_drawer_book',
    kind: 'choice',
    category: 'fame',
    ages: [25, 100],
    weight: 6,
    once: true,
    when: all(hasFlag('novel_in_drawer'), (s) => !s.projects?.novel),
    text: 'Looking for the spare keys, you find the novel you put in a drawer years ago, still tied with string. You read the first page standing up. It is better than you remembered.',
    choices: [
      {
        id: 'again',
        label: 'Take it out of the drawer for good',
        outcomes: [
          {
            chance: 1,
            text: 'You clear the kitchen table and start again where you left off. It feels like meeting an old friend who has been waiting, patiently, all this time.',
            effects: [{ novel: 'revive' }, { stat: 'happiness', delta: 5 }],
          },
        ],
      },
      {
        id: 'back',
        label: 'Put it back where it belongs',
        outcomes: [
          {
            chance: 1,
            text: 'Some books are for the person who wrote them. You retie the string, a little tighter, and find the keys in your coat.',
            effects: [{ stat: 'happiness', delta: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'cb3_long_engagement',
    kind: 'choice',
    category: 'romance',
    adultsOnly: true,
    ages: [20, 90],
    weight: 8,
    cooldownYears: 4,
    when: (s) =>
      s.npcs.some(
        (n) => n.alive && n.romance?.stage === 'engaged' && s.year - n.romance.since >= 3,
      ),
    bind: { pt: { role: 'partner', minAge: 18 } },
    text: '{pt.first} turns the ring on {pt.their} finger and asks, very lightly, whether the two of you are ever actually going to do this.',
    choices: [
      {
        id: 'elope',
        label: 'Run away and get married this week',
        outcomes: [
          {
            chance: 1,
            text: 'A registry office, two witnesses from the café next door, and a wedding lunch of chips on the beach. You have never been happier.',
            effects: [
              { status: 'marry', with: 'pt' },
              { stat: 'happiness', delta: 12 },
            ],
          },
        ],
      },
      {
        id: 'plan',
        label: 'Promise to set a date and plan it properly',
        outcomes: [
          {
            chance: 1,
            text: 'You open a calendar together for the first time. {pt.first} draws a heart on a Saturday in spring. (Plan the wedding from {pt.their} panel.)',
            effects: [{ rel: 'pt', delta: 8, memory: 'setting a date, at last' }],
          },
        ],
      },
      {
        id: 'wait',
        label: 'Say there’s no rush',
        outcomes: [
          {
            chance: 1,
            text: '{pt.first} nods and changes the subject. The ring goes in a drawer that week, and comes out less often.',
            effects: [{ rel: 'pt', delta: -12, memory: 'no rush, again' }],
          },
        ],
      },
    ],
  },
];
