import type { EventDef } from '../../engine/events/types';
import { all, hasFlag, hasKidAged, hasPet, notInPrison } from './conditions';

/** Childhood moments coming back: each event reads a flag from the childhood packs. */
export const CALLBACK_2_EVENTS: EventDef[] = [
  {
    id: 'cb2_library_card',
    kind: 'choice',
    category: 'random',
    ages: [30, 80],
    weight: 6,
    once: true,
    when: all(hasFlag('library_card'), notInPrison),
    text: 'Clearing out a drawer, you find your first library card: your name in wobbly capitals, the corner chewed. The library is still there, smaller than you remember.',
    choices: [
      {
        id: 'visit',
        label: 'Go back and borrow something',
        outcomes: [
          {
            chance: 1,
            text: 'The children’s corner has new beanbags and the same smell. You take out three books, one of them the one you loved at eight. It holds up.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'keep',
        label: 'Keep the card in your wallet',
        outcomes: [
          {
            chance: 1,
            text: 'It lives behind your bank card now, a small paper reminder of the first place that let you take things home for free.',
            effects: [{ stat: 'happiness', delta: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'cb2_teach_the_game',
    kind: 'choice',
    category: 'family',
    ages: [30, 90],
    weight: 7,
    once: true,
    when: all(hasFlag('cards_with_gran'), hasKidAged(6, 14)),
    bind: { kid: { role: 'child', minAge: 6, maxAge: 14 } },
    text: 'Rain, a power cut, and a bored {kid.first}. You find a pack of cards and realise you still know every rule of the game your grandmother taught you.',
    choices: [
      {
        id: 'teach',
        label: 'Teach it, house rules and all',
        outcomes: [
          {
            chance: 1,
            text: 'By candlelight {kid.first} learns the game, the cheating {kid.they} {kid.is} allowed, and the phrase your grandmother said when she won. It is very rude. {kid.They} love{kid.s} it.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { rel: 'kid', delta: 8, memory: 'the card game from great-grandma' },
            ],
          },
        ],
      },
      {
        id: 'quiet',
        label: 'Play something simpler',
        outcomes: [
          {
            chance: 1,
            text: 'Snap, forty times. Not the same, but {kid.first} laughs at every round, and that is the point of cards.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { rel: 'kid', delta: 3, memory: 'snap in the power cut' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cb2_stone_entrepreneur',
    kind: 'notice',
    category: 'work',
    ages: [24, 60],
    weight: 6,
    once: true,
    when: hasFlag('kid_stone_business'),
    text: 'A colleague is pitching a side hustle over lunch.',
    outcomes: [
      {
        chance: 0.5,
        text: 'You tell them about the painted-stone empire you ran at nine, door to door, with a price list in felt tip. They ask for your business advice, seriously. You give it, seriously.',
        effects: [{ stat: 'happiness', delta: 3 }],
      },
      {
        chance: 0.5,
        text: 'You realise you have not made anything just to sell it since the painted stones. You buy acrylics on the way home, just in case.',
        effects: [
          { stat: 'happiness', delta: 2 },
          { skill: 'art', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'cb2_stray_returns',
    kind: 'choice',
    category: 'family',
    ages: [22, 70],
    weight: 7,
    once: true,
    when: all(
      hasFlag('fed_stray_cat'),
      notInPrison,
      (s) => !hasPet('cat')(s) && s.pets.filter((p) => p.alive).length < 4,
    ),
    text: 'A thin tabby has started waiting on your step every evening, looking at you the way the stray from your childhood once did. It is not the same cat. It is exactly the same look.',
    choices: [
      {
        id: 'adopt',
        label: 'Let it in',
        outcomes: [
          {
            chance: 1,
            text: 'It walks in like it has lived here for years, inspects every room and chooses your chair. You name it Echo, because some things come back.',
            effects: [
              { pet: 'adopt', kind: 'cat', name: 'Echo' },
              { stat: 'happiness', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'feed',
        label: 'Feed it on the step, like before',
        outcomes: [
          {
            chance: 1,
            text: 'A saucer on the step, every evening, for a summer. Then one day it is gone, the way strays go, and you miss it more than is reasonable.',
            effects: [{ stat: 'happiness', delta: 2 }],
          },
        ],
      },
    ],
  },
];
