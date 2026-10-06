import type { EventDef } from '../../engine/events/types';
import { all, hasJob, hasPartner, isMarried, newCouple, single } from './conditions';
import type { GameState } from '../../engine/types';

const singleAtWork = (s: GameState): boolean => single(s) && hasJob(s);

/** Adult romance storylines, including affairs that surface years later (SPEC §5.1). Adults only, fade-to-black. */
export const ROMANCE_EVENTS: EventDef[] = [
  {
    id: 'work_coworker_spark',
    kind: 'choice',
    category: 'romance',
    ages: [18, 60],
    weight: 8,
    cooldownYears: 4,
    adultsOnly: true,
    when: singleAtWork,
    bind: {
      colleague: { role: 'coworker', minAge: 18, minRelationship: 40, fitsAttraction: true },
    },
    text: 'The printer jams again and {colleague.first} turns up with a paperclip and a theory. Somewhere between tray two and tray three, you realise you have been laughing for ten minutes.',
    choices: [
      {
        id: 'drink',
        label: 'Suggest a drink after work',
        outcomes: [
          {
            chance: 0.6,
            text: 'One drink becomes dinner, which becomes the last train home. The office never finds out, at first.',
            effects: [
              { status: 'meet', with: 'colleague' },
              { stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: '{colleague.first} says, kindly, that work and life live in separate drawers. Mondays are briefly awkward.',
            effects: [
              { rel: 'colleague', delta: -4, memory: 'the drink invitation by the printer' },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'professional',
        label: 'Keep it professional',
        outcomes: [
          {
            chance: 1,
            text: 'You fix the printer together and go back to your desks. It stays a good story for the break room.',
            effects: [{ rel: 'colleague', delta: 5, memory: 'the great printer rescue' }],
          },
        ],
      },
    ],
  },
  {
    id: 'rom_affair_temptation',
    kind: 'choice',
    category: 'romance',
    adultsOnly: true,
    ages: [25, 60],
    weight: 4,
    cooldownYears: 12,
    when: isMarried,
    bind: { sp: { role: 'spouse', minAge: 18 }, other: { role: 'coworker', minAge: 18 } },
    text: '{other.first} from work keeps finding reasons to stay late when you do. Tonight {other.they} suggest{other.s} a drink, just the two of you.',
    choices: [
      {
        id: 'go',
        label: 'Have the drink',
        outcomes: [
          {
            chance: 1,
            text: 'One drink becomes a secret, then a habit. You tell {sp.first} you are working late. A lot.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'stress', delta: 8 },
              { stat: 'karma', delta: -8 },
              { flag: 'had_affair' },
            ],
            next: { eventId: 'rom_affair_discovered', inYears: [1, 5] },
          },
        ],
      },
      {
        id: 'home',
        label: 'Go home to {sp.first}',
        outcomes: [
          {
            chance: 1,
            text: 'You pick up takeaway on the way home. {sp.first} is delighted; you feel oddly heroic about a curry.',
            effects: [
              { rel: 'sp', delta: 4, memory: 'the surprise takeaway' },
              { stat: 'karma', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rom_affair_discovered',
    kind: 'choice',
    category: 'romance',
    adultsOnly: true,
    ages: [26, 70],
    weight: 0,
    chainOnly: true,
    bind: { sp: { role: 'spouse', minAge: 18 }, other: { role: 'coworker', minAge: 18 } },
    text: '{sp.first} is holding your phone. On the screen is a message from {other.first} that you thought you had deleted years ago.',
    choices: [
      {
        id: 'confess',
        label: 'Tell the whole truth',
        outcomes: [
          {
            chance: 0.45,
            text: 'It takes a year of counselling and long walks, but {sp.first} stays.',
            effects: [
              { rel: 'sp', delta: -25, memory: 'the affair you confessed' },
              { stat: 'happiness', delta: -10 },
            ],
          },
          {
            chance: 0.55,
            text: '{sp.first} listens to everything and then asks you to leave.',
            effects: [
              { rel: 'sp', delta: -45, memory: 'the affair' },
              { status: 'divorce', with: 'sp' },
              { stat: 'happiness', delta: -15 },
            ],
          },
        ],
      },
      {
        id: 'deny',
        label: 'Deny everything',
        outcomes: [
          {
            chance: 0.3,
            text: 'Somehow, {sp.first} believes you. You will never feel good about this.',
            effects: [
              { rel: 'sp', delta: -8, memory: 'the night of the phone' },
              { stat: 'karma', delta: -6 },
            ],
          },
          {
            chance: 0.7,
            text: 'The denial lasts four minutes. {sp.first} has screenshots.',
            effects: [
              { rel: 'sp', delta: -50, memory: 'the affair and the lie' },
              { status: 'divorce', with: 'sp' },
              { stat: 'happiness', delta: -16 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rom_move_in',
    kind: 'choice',
    category: 'romance',
    adultsOnly: true,
    ages: [19, 70],
    weight: 6,
    once: true,
    when: all(hasPartner, newCouple(4)),
    bind: { pt: { role: 'partner', minAge: 18 } },
    text: "{pt.first} has started leaving a drawer's worth of clothes at your place. {pt.They} ask{pt.s} whether you two should just get one place.",
    choices: [
      {
        id: 'yes',
        label: 'Move in together',
        outcomes: [
          {
            chance: 1,
            text: 'You merge two flats of furniture into one and argue about exactly one lamp.',
            effects: [
              { rel: 'pt', delta: 8, memory: 'moving in together' },
              { stat: 'happiness', delta: 5 },
              { flag: 'cohabiting' },
              { system: 'move_out' },
            ],
          },
        ],
      },
      {
        id: 'notyet',
        label: 'Not yet',
        outcomes: [
          {
            chance: 1,
            text: '{pt.first} says that is fine, and takes the drawer back.',
            effects: [{ rel: 'pt', delta: -6, memory: 'the drawer you gave back' }],
          },
        ],
      },
    ],
  },
  {
    id: 'rom_wedding_guest_spark',
    kind: 'choice',
    category: 'romance',
    adultsOnly: true,
    ages: [20, 55],
    weight: 5,
    cooldownYears: 6,
    when: single,
    text: "At a friend's wedding you are seated at the singles table, next to a stranger who has also hidden a dinner roll in their pocket.",
    choices: [
      {
        id: 'dance',
        label: 'Ask them to dance',
        outcomes: [
          {
            chance: 0.6,
            success: true,
            text: 'You dance badly and talk well. By the cake you have plans for Thursday.',
            effects: [{ status: 'meet' }, { stat: 'happiness', delta: 6 }],
          },
          {
            chance: 0.4,
            text: 'They are a wonderful dancer. You are not. It ends as a fond memory and a sore toe.',
            effects: [{ stat: 'happiness', delta: 2 }],
          },
        ],
      },
      {
        id: 'cake',
        label: 'Focus on the cake',
        outcomes: [
          {
            chance: 1,
            text: 'The cake is excellent. You have three slices and no regrets, mostly.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { stat: 'health', delta: -1 },
            ],
          },
        ],
      },
    ],
  },
];
