import type { EventDef, OutcomeDef } from '../../engine/events/types';
import type { GameState } from '../../engine/types';
import { inRegion, inTown, inTownWith, townOf } from '../../engine/towns';
import { all, atUniversity, hasJob, notInPrison, oddsBy, single } from './conditions';

/** Living in a Slovenian town we know in depth (and not inside). */
const home = (s: GameState): boolean =>
  s.player.country === 'si' && notInPrison(s) && townOf(s) !== null;
const si = (...ps: ((s: GameState) => boolean)[]) => all(home, ...ps);
const one = (text: string, effects: OutcomeDef['effects']): OutcomeDef[] => [
  { chance: 1, text, effects },
];
/** Outcome odds that follow where you live. */
const livingIn =
  (...towns: string[]) =>
  (s: GameState): number =>
    towns.includes(s.player.city) ? 1 : 0;
const notLivingIn =
  (...towns: string[]) =>
  (s: GameState): number =>
    towns.includes(s.player.city) ? 0 : 1;

const BURJA = [
  'Ajdovščina',
  'Sežana',
  'Nova Gorica',
  'Koper',
  'Izola',
  'Piran',
  'Ilirska Bistrica',
  'Postojna',
];
/** On the Croatian border, which stayed a hard Schengen border until 2023. */
const CROATIAN_BORDER = [
  'Brežice',
  'Metlika',
  'Črnomelj',
  'Ormož',
  'Rogaška Slatina',
  'Ilirska Bistrica',
];
const onCroatianBorder = (s: GameState): boolean => CROATIAN_BORDER.includes(s.player.city);
/** A border town on the Italian, Austrian or Hungarian side (open from 2007). */
const atSchengenBorder = (s: GameState): boolean => inTownWith('border')(s) && !onCroatianBorder(s);
const SOCA = ['Bovec', 'Kobarid', 'Tolmin'];
const BEAR_COUNTRY = ['Kočevje', 'Ribnica', 'Cerknica', 'Ilirska Bistrica', 'Logatec', 'Postojna'];
const NEAR_CAPITAL = ['Ljubljana', 'Medvode', 'Domžale', 'Grosuplje'];
const hasFamous = (s: GameState): boolean => !!townOf(s)?.famous;
const hasRiver = (s: GameState): boolean => inTownWith('river')(s) && !!townOf(s)?.river;

/**
 * Slovenian home towns in depth: the river, the landmark on every school trip, the dish
 * your grandmother makes, the wind, the mine, the border, and a handful of moments that
 * belong to one town only.
 */
export const SLOVENIA_TOWN_EVENTS: EventDef[] = [
  // ── Pinned to their year ─────────────────────────────────────────────────
  {
    id: 'hist_si_titovo_velenje_1981',
    kind: 'notice',
    category: 'world',
    emoji: '🪧',
    ages: [4, 120],
    weight: 40,
    once: true,
    fromYear: 1981,
    toYear: 1981,
    when: si(inTown('Velenje')),
    text: 'New signs go up at the edge of town: Velenje is now Titovo Velenje, a year after the old man died. The giant statue on the square looks on, as usual.',
    outcomes: [
      {
        chance: 1,
        text: 'At school you practise writing the new address on envelopes. Some grown-ups are proud, some roll their eyes, and everyone keeps calling it Velenje at home.',
        effects: [{ stat: 'smarts', delta: 1 }],
      },
    ],
  },
  {
    id: 'hist_si_sg_peace_1989',
    kind: 'notice',
    category: 'world',
    emoji: '🕊️',
    ages: [4, 120],
    weight: 40,
    once: true,
    fromYear: 1989,
    toYear: 1989,
    when: si(inTown('Slovenj Gradec')),
    text: 'The United Nations names Slovenj Gradec a Messenger of Peace city. The town that has spent years hanging peace art from all over the world in its gallery now has it in writing.',
    outcomes: [
      {
        chance: 1,
        text: 'There are speeches on the square by St Elizabeth’s, a children’s choir, and a lot of handshaking. You feel, briefly, that your small town has been noticed by the whole planet.',
        effects: [
          { stat: 'happiness', delta: 4 },
          { stat: 'karma', delta: 1 },
          { flag: 'si_sg_peace' },
        ],
      },
    ],
  },
  {
    id: 'hist_si_schengen_2007',
    kind: 'notice',
    category: 'world',
    emoji: '🚧',
    ages: [6, 120],
    weight: 40,
    once: true,
    fromYear: 2007,
    toYear: 2007,
    when: si(),
    text: 'Just before Christmas, Slovenia joins the open-border zone and the posts on the Italian, Austrian and Hungarian borders close for good. At midnight the barriers go up and stay up, and people walk across in the cold just to say they did.',
    outcomes: [
      {
        chance: (s) => (!atSchengenBorder(s) ? 1 : 0),
        text: 'You watch it on the evening news: champagne on the line at Rožna Dolina and a customs officer taking his own sign down. Your next trip to Trieste has no queue at all.',
        effects: [{ stat: 'happiness', delta: 3 }],
      },
      {
        chance: (s) => (atSchengenBorder(s) ? 0.6 : 0),
        text: 'Someone opens a bottle on the line itself. Your parents remember queueing here with coffee hidden in the spare tyre, and they laugh about it until they suddenly go quiet.',
        effects: [{ stat: 'happiness', delta: 4 }],
      },
      {
        chance: (s) => (atSchengenBorder(s) ? 0.4 : 0),
        text: 'You stand where the passport booth was and step from one country to the other and back. Nothing happens either time, which is exactly the point.',
        effects: [
          { stat: 'happiness', delta: 3 },
          { stat: 'smarts', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'hist_si_croatia_schengen_2023',
    kind: 'notice',
    category: 'world',
    emoji: '🛂',
    ages: [6, 120],
    weight: 40,
    once: true,
    fromYear: 2023,
    toYear: 2023,
    when: si(),
    text: 'On New Year’s Day Croatia joins the open-border zone, and the crossings that have had police, queues and stamps since 1991 are suddenly just roads.',
    outcomes: [
      {
        chance: (s) => (onCroatianBorder(s) ? 0 : 1),
        text: 'In July the drive to the Croatian coast has no two-hour queue at the border for the first time in thirty years. The whole car cheers at a booth with nobody in it.',
        effects: [{ stat: 'happiness', delta: 3 }],
      },
      {
        chance: (s) => (onCroatianBorder(s) ? 1 : 0),
        text: 'You drive over to the other side for coffee, because you can. Your cousins over there were never really foreign anyway, and now the map agrees.',
        effects: [
          { stat: 'happiness', delta: 4 },
          { stat: 'stress', delta: -2 },
        ],
      },
    ],
  },
  {
    id: 'hist_si_idrija_unesco_2012',
    kind: 'notice',
    category: 'world',
    emoji: '⛏️',
    ages: [6, 120],
    weight: 40,
    once: true,
    fromYear: 2012,
    toYear: 2012,
    when: si(),
    text: 'The old mercury mine at Idrija joins the UNESCO World Heritage list, together with Almadén in Spain. Five hundred years of digging in the dark is now officially the heritage of all humanity.',
    outcomes: [
      {
        chance: (s) => (s.player.city === 'Idrija' ? 0 : 1),
        text: 'Someone at work announces a weekend trip to see it, with žlikrofi for lunch. Half the office signs up for the žlikrofi.',
        effects: [{ stat: 'happiness', delta: 2 }],
      },
      {
        chance: (s) => (s.player.city === 'Idrija' ? 1 : 0),
        text: 'An old miner on the square tells a television crew that he could have told them this in 1960. The clip is shown everywhere, and Idrija is very pleased with him.',
        effects: [{ stat: 'happiness', delta: 4 }],
      },
    ],
  },
  {
    id: 'hist_si_gorica_capital_2025',
    kind: 'notice',
    category: 'world',
    emoji: '🎭',
    ages: [6, 120],
    weight: 40,
    once: true,
    fromYear: 2025,
    toYear: 2025,
    when: si(),
    text: 'Nova Gorica and Gorizia are European Capital of Culture together, and all year there are concerts, exhibitions and dinners laid along the old border line at the Transalpina square.',
    outcomes: [
      {
        chance: (s) => (inRegion('Goriška')(s) ? 0 : 1),
        text: 'You take the train west for a weekend of it: an open-air concert, a museum in a former customs house, and a dinner that starts in one country and finishes in another.',
        effects: [{ stat: 'happiness', delta: 4 }],
      },
      {
        chance: (s) => (inRegion('Goriška')(s) ? 1 : 0),
        text: 'You eat at one long table that runs across two countries, passing the bread from Slovenia to Italy and back, and nobody needs a passport for the salt.',
        effects: [
          { stat: 'happiness', delta: 6 },
          { stat: 'stress', delta: -3 },
        ],
      },
    ],
  },

  // ── Any town ─────────────────────────────────────────────────────────────
  {
    id: 'sitown_school_trip',
    kind: 'notice',
    category: 'school',
    emoji: '🚌',
    ages: [7, 12],
    weight: 7,
    cooldownYears: 3,
    when: si(),
    text: 'Your class goes on a school trip to {town:landmark}. The teacher counts heads every ten minutes and still almost loses the boy who wanders off to look at a beetle.',
    outcomes: [
      {
        chance: 0.6,
        text: 'You have walked past it your whole life, but with a worksheet in your hand it suddenly has dates and names. You come home and explain all of it at dinner.',
        effects: [
          { stat: 'smarts', delta: 2 },
          { stat: 'happiness', delta: 2 },
        ],
      },
      {
        chance: 0.4,
        text: 'You learn almost nothing about history, but you do learn that the packed lunch your mother made is the envy of the whole bus.',
        effects: [{ stat: 'happiness', delta: 3 }],
      },
    ],
  },
  {
    id: 'sitown_grandma_recipe',
    kind: 'choice',
    category: 'family',
    emoji: '🥘',
    ages: [10, 50],
    weight: 6,
    cooldownYears: 12,
    when: si(),
    bind: { grandparent: { role: 'grandparent', minRelationship: 20 } },
    text: '{grandparent.Rel} decides it is time you learned {town:food} properly, the way it was done in {grandparent.their} mother’s kitchen, with no measuring and a great deal of tutting.',
    choices: [
      {
        id: 'learn',
        label: 'Roll up your sleeves',
        outcomes: [
          {
            chance: 0.6,
            text: 'By the third try {grandparent.they} stop{grandparent.s} correcting your hands. You write nothing down, because {grandparent.they} would be insulted, and remember it anyway.',
            effects: [
              { skill: 'cooking', delta: 6 },
              { rel: 'grandparent', delta: 8, memory: 'the afternoon in the kitchen' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Yours comes out a different shape and a different colour. {grandparent.first} eats it anyway and says it is very modern.',
            effects: [
              { skill: 'cooking', delta: 3 },
              { rel: 'grandparent', delta: 5, memory: 'your modern attempt' },
            ],
          },
        ],
      },
      {
        id: 'eat',
        label: 'Offer to do the eating part',
        outcomes: one(
          '{grandparent.first} sighs that the young only know how to eat, then gives you a second helping to prove the point.',
          [
            { stat: 'happiness', delta: 3 },
            { rel: 'grandparent', delta: 2, memory: 'your appetite' },
          ],
        ),
      },
    ],
  },
  {
    id: 'sitown_veselica',
    kind: 'choice',
    category: 'social',
    emoji: '🎪',
    ages: [16, 70],
    weight: 6,
    cooldownYears: 4,
    when: si(),
    text: 'It is the town holiday in {city}: a stage in a field, a brass band, long benches, a tent that smells of grilled meat, and a dance floor already full of people your parents’ age.',
    choices: [
      {
        id: 'dance',
        label: 'Get on the dance floor',
        outcomes: [
          {
            chance: oddsBy('looks', 0.4, 0.004),
            text: 'You polka with a stranger, then with their aunt, then with half of {city}. By midnight you know three new people and every word of a song you hate.',
            effects: [{ stat: 'happiness', delta: 7 }, { status: 'friend' }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You step on a great many feet. Nobody minds; the band has seen worse, and the woman whose toes suffered most buys you a drink.',
            effects: [{ stat: 'happiness', delta: 4 }],
          },
        ],
      },
      {
        id: 'tug',
        label: 'Join the tug of war',
        outcomes: [
          {
            chance: oddsBy('health', 0.35, 0.004),
            text: 'Your street’s team drags the next street’s team clean through the mud. You will be reminding them about this for a decade.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'health', delta: 1 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The rope wins. You go down in the mud with eleven neighbours and get up as a kind of family.',
            effects: [{ stat: 'happiness', delta: 3 }, { injury: 2 }],
          },
        ],
      },
      {
        id: 'home',
        label: 'Listen to it from your bedroom',
        outcomes: one(
          'The band plays until two in the morning, and you hear every note through the window. In a way you were there.',
          [{ stat: 'stress', delta: 2 }],
        ),
      },
    ],
  },
  {
    id: 'sitown_football_club',
    kind: 'choice',
    category: 'social',
    emoji: '⚽',
    ages: [7, 13],
    weight: 6,
    once: true,
    when: si(),
    text: 'The local football club in {city} is taking kids for its youth team. Training is on a lumpy pitch behind the school, and the coach has the voice of a man who once nearly played for the national side.',
    choices: [
      {
        id: 'join',
        label: 'Sign up',
        outcomes: [
          {
            chance: 0.6,
            text: 'You spend three seasons getting muddy, losing to the next town, and winning once spectacularly. The team photo goes up in the clubhouse and stays there for decades.',
            effects: [
              { skill: 'athletics', delta: 6 },
              { stat: 'health', delta: 3 },
              { status: 'friend' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You spend most matches on the bench in a coat two sizes too big. You learn all the chants and none of the skills.',
            effects: [
              { skill: 'athletics', delta: 2 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'no',
        label: 'Stay at home',
        outcomes: one(
          'Your friends go to training and come back with stories you are not part of. You tell yourself you were busy.',
          [{ stat: 'happiness', delta: -2 }],
        ),
      },
    ],
  },
  {
    id: 'sitown_cousin_pride',
    kind: 'choice',
    category: 'family',
    emoji: '🏔️',
    ages: [10, 45],
    weight: 5,
    cooldownYears: 10,
    when: si(),
    text: 'A cousin from the next valley, two schnapps in at a family christening, announces that {city} is not a real place, just somewhere you drive through on the way to somewhere better.',
    choices: [
      {
        id: 'defend',
        label: 'Defend your town',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.45, 0.004),
            text: 'You list {town:landmark}, the {town:food}, and three things the cousin’s valley has never managed. The table applauds. The cousin pretends to need the bathroom.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: -2 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'It turns into a shouting match about whose grandmother’s potica is better, and an aunt has to separate you with a plate of cake.',
            effects: [
              { stat: 'stress', delta: 3 },
              { stat: 'happiness', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'agree',
        label: 'Agree, to annoy them',
        outcomes: one(
          'You agree so warmly and completely that the cousin gets confused, then suspicious, then starts defending your town for you.',
          [{ stat: 'happiness', delta: 4 }, { addTrait: 'funny' }],
        ),
      },
    ],
  },
  {
    id: 'sitown_uni_ljubljana',
    kind: 'notice',
    category: 'school',
    emoji: '🧺',
    ages: [18, 21],
    weight: 9,
    once: true,
    when: si(atUniversity, (s) => !NEAR_CAPITAL.includes(s.player.city)),
    text: 'You move to Ljubljana to study, into a student room in Rožna dolina with a bed, a desk and a roommate who owns forty jars of pickled peppers from home.',
    outcomes: [
      {
        chance: 0.6,
        text: 'Every Friday you take the bus back to {city} with a bag of laundry, and every Sunday you come back with clean clothes and enough food for a siege.',
        effects: [
          { stat: 'happiness', delta: 4 },
          { stat: 'smarts', delta: 2 },
          { status: 'friend' },
        ],
      },
      {
        chance: 0.4,
        text: 'The first month you are homesick for {city} in a way that embarrasses you. Then one evening you realise you know which bakery stays open latest, and you are fine.',
        effects: [
          { stat: 'stress', delta: 3 },
          { stat: 'smarts', delta: 2 },
          { stat: 'happiness', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'sitown_famous_lesson',
    kind: 'notice',
    category: 'school',
    emoji: '📜',
    ages: [9, 14],
    weight: 5,
    once: true,
    when: si(hasFamous),
    text: 'A whole week of lessons is about {town:famous}. There is a project, a poster, a visit from someone in a costume, and a test at the end.',
    outcomes: [
      {
        chance: 0.5,
        text: 'You get completely caught up in it and become, for one spring, the youngest expert in town. Adults are surprised by how much you know.',
        effects: [
          { stat: 'smarts', delta: 3 },
          { stat: 'happiness', delta: 2 },
        ],
      },
      {
        chance: 0.5,
        text: 'By Thursday you are sick of the subject. Still, years later, you will defend them fiercely to anyone who has not heard of them.',
        effects: [{ stat: 'smarts', delta: 1 }],
      },
    ],
  },
  {
    id: 'sitown_quirk_visitor',
    kind: 'notice',
    category: 'random',
    emoji: '🗺️',
    ages: [16, 85],
    weight: 4,
    cooldownYears: 15,
    when: si(),
    text: 'A lost tourist with a big rucksack asks what is special about {city}, and you hear yourself start like a guide.',
    outcomes: [
      {
        chance: 1,
        text: '{town:quirk} The tourist writes it down. You walk away surprisingly proud of a place you complain about most days.',
        effects: [
          { stat: 'happiness', delta: 3 },
          { stat: 'karma', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'sitown_landmark_walk',
    kind: 'choice',
    category: 'romance',
    emoji: '🌇',
    ages: [19, 45],
    weight: 5,
    cooldownYears: 6,
    adultsOnly: true,
    when: si(single),
    text: 'Someone you met at a friend’s birthday says they have never really seen {city}. They are new in town and clearly hoping you will offer.',
    choices: [
      {
        id: 'walk',
        label: 'Offer to show them around',
        outcomes: [
          {
            chance: oddsBy('looks', 0.4, 0.004),
            text: 'You take them to {town:landmark} and talk the whole way there and back, and somewhere in between it stops being a tour. The rest of the evening is nobody’s business but yours.',
            effects: [{ status: 'meet' }, { stat: 'happiness', delta: 6 }],
            success: true,
          },
          {
            chance: 0.5,
            text: 'It is a nice walk. They are polite, you are polite, and at the end you both shake hands like diplomats.',
            effects: [{ stat: 'happiness', delta: 1 }],
          },
        ],
      },
      {
        id: 'map',
        label: 'Draw them a map',
        outcomes: one(
          'You sketch a careful map on a napkin with arrows and stars. They thank you, and you realise too late what they were actually asking.',
          [{ stat: 'happiness', delta: -1 }],
        ),
      },
    ],
  },

  // ── The river, the coast, the wind ───────────────────────────────────────
  {
    id: 'sitown_river_flood',
    kind: 'notice',
    category: 'random',
    emoji: '🌊',
    ages: [5, 90],
    weight: 4,
    cooldownYears: 20,
    when: si(hasRiver),
    text: 'After a week of rain the {town:river} comes up over its banks overnight. By morning there is brown water in the cellar and a neighbour’s garden bench floating past the window.',
    outcomes: [
      {
        chance: 0.6,
        text: 'You spend two days carrying out jars, potatoes and sodden cardboard. The firemen bring pumps, the neighbours bring coffee, and the high-water line stays on the wall for years.',
        effects: [{ stat: 'stress', delta: 5 }, { stat: 'health', delta: -1 }, { money: -400 }],
      },
      {
        chance: 0.4,
        text: 'The water stops one step below the door. You stand there in boots for an hour, watching it, and then it starts to go down as if it had only been making a point.',
        effects: [{ stat: 'stress', delta: 3 }],
      },
    ],
  },
  {
    id: 'sitown_river_swim',
    kind: 'choice',
    category: 'social',
    emoji: '🏞️',
    ages: [9, 16],
    weight: 6,
    cooldownYears: 3,
    when: si(hasRiver),
    text: 'On the hottest afternoon of the summer the kids from your street go down to the {town:river}, to the deep spot under the trees that nobody’s parents officially know about.',
    choices: [
      {
        id: 'jump',
        label: 'Jump in from the rock',
        outcomes: [
          {
            chance: 0.75,
            text: 'The cold knocks the breath out of you and then you are laughing underwater. You go home with wet hair and pretend you were at the library.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'health', delta: 2 },
            ],
          },
          {
            chance: 0.25,
            text: 'You catch your foot on a stone on the way down and limp home. The story you tell your mother involves a staircase.',
            effects: [{ injury: 4 }, { stat: 'happiness', delta: 1 }],
          },
        ],
      },
      {
        id: 'paddle',
        label: 'Paddle in the shallows',
        outcomes: one(
          'You build a dam out of stones with two younger kids and catch a tiny fish in your hands. Nobody calls you a coward, and the dam lasts until autumn.',
          [
            { stat: 'happiness', delta: 4 },
            { stat: 'discipline', delta: 1 },
          ],
        ),
      },
    ],
  },
  {
    id: 'sitown_river_fishing',
    kind: 'choice',
    category: 'random',
    emoji: '🎣',
    ages: [12, 85],
    weight: 4,
    cooldownYears: 8,
    when: si(hasRiver),
    text: 'A retired neighbour with a fishing licence and a lot of opinions offers to take you to his spot on the {town:river} at dawn.',
    choices: [
      {
        id: 'go',
        label: 'Set the alarm',
        outcomes: [
          {
            chance: 0.5,
            text: 'Mist on the water, total silence, and then a trout as long as your forearm. He lets you hold it for the photo and then makes you put it back.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: -6 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'You catch nothing for four hours. He tells you about every fish he caught here since 1974, and you find, oddly, that you enjoyed it.',
            effects: [{ stat: 'stress', delta: -4 }],
          },
        ],
      },
      {
        id: 'sleep',
        label: 'Sleep in',
        outcomes: one(
          'He goes alone and catches something enormous, according to him. You will hear about it for years.',
          [{ stat: 'health', delta: 1 }],
        ),
      },
    ],
  },
  {
    id: 'sitown_coast_job',
    kind: 'choice',
    category: 'work',
    emoji: '🍹',
    ages: [16, 24],
    weight: 6,
    cooldownYears: 3,
    when: si(inTownWith('coast')),
    text: 'A bar on the seafront is looking for summer staff through the student work office. The owner says the tips are good and the hours are only from noon until the last tourist leaves.',
    choices: [
      {
        id: 'take',
        label: 'Take the summer job',
        outcomes: [
          {
            chance: 0.6,
            text: 'You learn to carry six glasses at once, say thank you in five languages and swim at seven in the morning before your shift. You end the summer brown, tired and richer.',
            effects: [{ money: 1600 }, { stat: 'happiness', delta: 3 }, { status: 'friend' }],
          },
          {
            chance: 0.4,
            text: 'The owner is a tyrant and the tourists tip in coins from countries you cannot identify. You make it to September out of pure stubbornness.',
            effects: [
              { money: 1100 },
              { stat: 'stress', delta: 5 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'beach',
        label: 'Spend the summer on the rocks',
        outcomes: one(
          'You spend the whole summer on the rocks with a book and a towel, broke and completely content.',
          [
            { stat: 'happiness', delta: 5 },
            { stat: 'stress', delta: -5 },
          ],
        ),
      },
    ],
  },
  {
    id: 'sitown_coast_fishmarket',
    kind: 'notice',
    category: 'random',
    emoji: '🐟',
    ages: [20, 85],
    weight: 4,
    cooldownYears: 8,
    when: si(inTownWith('coast')),
    text: 'A fisherman you went to school with is selling the morning catch off the side of his boat, and he waves you over before the tourists get there.',
    outcomes: [
      {
        chance: 0.6,
        text: 'He gives you the good sardines at the old price and the latest gossip for free. Grilled with garlic and parsley, they taste like being nine years old.',
        effects: [{ stat: 'happiness', delta: 4 }, { money: -10 }],
      },
      {
        chance: 0.4,
        text: 'He talks you into a whole sea bream and a squid you have no plan for. You spend the evening looking up recipes and smelling faintly of harbour.',
        effects: [{ skill: 'cooking', delta: 2 }, { money: -25 }],
      },
    ],
  },
  {
    id: 'sitown_burja',
    kind: 'notice',
    category: 'random',
    emoji: '🌬️',
    ages: [5, 90],
    weight: 5,
    cooldownYears: 5,
    when: si(inTown(...BURJA)),
    text: 'The burja comes down off the plateau in the night, cold, dry and furious. By morning the roads are closed to lorries and every loose thing in {city} is somewhere else.',
    outcomes: [
      {
        chance: 0.5,
        text: 'Your neighbour’s roof tiles end up in your garden and your garden chairs end up in his. You swap them back over coffee and agree that it was a proper one this time.',
        effects: [{ stat: 'stress', delta: 3 }, { money: -80 }],
      },
      {
        chance: 0.5,
        text: 'You lean into it on the way to the shop and it holds you up like a hand. Afterwards the air is so clear you can see the sea, or at least you are sure you can.',
        effects: [
          { stat: 'happiness', delta: 2 },
          { stat: 'health', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'sitown_karst_cave',
    kind: 'choice',
    category: 'random',
    emoji: '🦇',
    ages: [13, 45],
    weight: 5,
    cooldownYears: 8,
    when: si(inTownWith('karst')),
    text: 'The local caving club is going down a shaft that only appears on very old maps. A member who has known you since primary school says they could use someone small and calm.',
    choices: [
      {
        id: 'go',
        label: 'Put on the helmet',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.45, 0.004),
            text: 'Forty metres down, your lamp catches a chamber of white stone nobody has seen in decades. Your name goes on the survey sheet in pencil, and you never forget it.',
            effects: [
              { stat: 'happiness', delta: 8 },
              { stat: 'smarts', delta: 2 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'A tight squeeze turns out to be too tight for your nerves. The others are kind about it, and you discover how much you love the sky.',
            effects: [
              { stat: 'stress', delta: 5 },
              { stat: 'happiness', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'no',
        label: 'Stay above ground',
        outcomes: one(
          'You hold the rope at the top for six hours and eat everyone’s sandwiches. It counts as being in the club.',
          [{ stat: 'happiness', delta: 2 }],
        ),
      },
    ],
  },

  // ── Mountains, lakes, vineyards ──────────────────────────────────────────
  {
    id: 'sitown_alpine_pasture',
    kind: 'choice',
    category: 'family',
    emoji: '🐄',
    ages: [8, 14],
    weight: 6,
    once: true,
    when: si(inTownWith('alpine')),
    text: 'A great-uncle spends every summer with the cows on the high pasture above {city}, in a wooden hut with no electricity. He says you can come up for a month if you can get up at five.',
    choices: [
      {
        id: 'go',
        label: 'Go up the mountain',
        outcomes: [
          {
            chance: 0.7,
            text: 'You milk, carry, fetch water, and eat bread with fresh cheese in front of the best view you will ever have. You come down tougher, quieter, and smelling of smoke.',
            effects: [
              { stat: 'health', delta: 4 },
              { stat: 'discipline', delta: 4 },
              { stat: 'happiness', delta: 5 },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'It rains for nineteen days of the month. You learn every card game your great-uncle knows and lose most of them to a man who pretends he is bad at cards.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'no',
        label: 'Stay down in the valley',
        outcomes: one(
          'You spend the summer at home with a screen and a fan. In September your cousin comes down from the hut and seems a year older.',
          [{ stat: 'happiness', delta: -1 }],
        ),
      },
    ],
  },
  {
    id: 'sitown_ski_club',
    kind: 'choice',
    category: 'social',
    emoji: '⛷️',
    ages: [6, 12],
    weight: 6,
    once: true,
    when: si(inTownWith('ski')),
    text: 'The ski club in {city} runs training on the slope above town three afternoons a week. Half your class is already in it, and the other half are planning to be.',
    choices: [
      {
        id: 'join',
        label: 'Join the ski club',
        outcomes: [
          {
            chance: oddsBy('health', 0.4, 0.004),
            text: 'You go from snowplough to slalom in two winters and win a medal at the club race. It is plastic and gold and it hangs on your wall for twenty years.',
            effects: [
              { skill: 'athletics', delta: 7 },
              { stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You are fast but you never learn to stop gracefully. The coach calls you brave. Your mother calls it something else.',
            effects: [{ skill: 'athletics', delta: 4 }, { injury: 3 }],
          },
        ],
      },
      {
        id: 'sledge',
        label: 'Stick to the sledge',
        outcomes: one(
          'You and a plastic sledge own the hill behind the church every winter. It is free and every bit as fast.',
          [{ stat: 'happiness', delta: 4 }],
        ),
      },
    ],
  },
  {
    id: 'sitown_lake_freeze',
    kind: 'notice',
    category: 'random',
    emoji: '⛸️',
    ages: [5, 80],
    weight: 4,
    cooldownYears: 12,
    when: si(inTownWith('lake')),
    text: 'A hard frost holds for a fortnight and the lake by {city} freezes thick enough to walk on. Somebody’s grandfather tests it with an axe and declares it open.',
    outcomes: [
      {
        chance: 0.7,
        text: 'Half the town comes out with skates, hockey sticks and flasks of tea. You skate until your feet hurt and your cheeks burn, and it feels like the old days nobody remembers.',
        effects: [
          { stat: 'happiness', delta: 6 },
          { stat: 'health', delta: 2 },
        ],
      },
      {
        chance: 0.3,
        text: 'You fall hard on the first lap and spend the rest of the afternoon on the bank holding the tea and a bag of snow to your elbow.',
        effects: [{ injury: 3 }, { stat: 'happiness', delta: 2 }],
      },
    ],
  },
  {
    id: 'sitown_klopotec',
    kind: 'notice',
    category: 'family',
    emoji: '🍇',
    ages: [6, 13],
    weight: 5,
    once: true,
    when: si(inTownWith('wine'), inRegion('Štajerska', 'Prekmurje')),
    text: 'In high summer your grandfather takes you up to the family vineyard to put up the klopotec, a tall wooden wind rattle that clacks all day to keep the starlings off the grapes.',
    outcomes: [
      {
        chance: 1,
        text: 'You hold the ladder and he swears at the pole. When the wind catches the blades and it starts to clatter, he looks as proud as if he had built a cathedral.',
        effects: [
          { stat: 'happiness', delta: 4 },
          { rel: 'grandparent', delta: 5, memory: 'putting up the klopotec' },
        ],
      },
    ],
  },
  {
    id: 'sitown_wine_contest',
    kind: 'choice',
    category: 'money',
    emoji: '🍷',
    ages: [25, 85],
    weight: 4,
    cooldownYears: 10,
    when: si(inTownWith('wine')),
    text: 'The local wine-growers’ society holds its tasting competition, and your family’s few rows of vines produced something this year that is either very good or very strange.',
    choices: [
      {
        id: 'enter',
        label: 'Enter a bottle',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.35, 0.004),
            text: 'The judges give it a gold diploma. It goes up in a frame next to the door, and every guest for the next decade is shown it before they are allowed to sit down.',
            effects: [{ stat: 'happiness', delta: 8 }, { money: 150 }],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The judges write one word on the score sheet: interesting. You decide to take it as a compliment and drink the rest yourself.',
            effects: [{ stat: 'happiness', delta: 1 }],
          },
        ],
      },
      {
        id: 'keep',
        label: 'Keep it for the family',
        outcomes: one(
          'You keep the wine for christenings and St Martin’s Day. Everybody at the table says it beats whatever won.',
          [{ stat: 'happiness', delta: 3 }],
        ),
      },
    ],
  },
  {
    id: 'sitown_spa',
    kind: 'choice',
    category: 'health',
    emoji: '♨️',
    ages: [30, 85],
    weight: 4,
    cooldownYears: 8,
    when: si(inTownWith('spa')),
    text: 'Your doctor, who has known you since your vaccinations, suggests that before trying any new pills you could take the waters at the spa down the road like everyone’s grandparents did.',
    choices: [
      {
        id: 'cure',
        label: 'Take a week of the cure',
        outcomes: [
          {
            chance: 0.7,
            text: 'Warm pools in the morning, a walk in the park after lunch, an early night. By Friday you feel ten years younger, or at least four.',
            effects: [{ stat: 'health', delta: 5 }, { stat: 'stress', delta: -8 }, { money: -200 }],
            success: true,
          },
          {
            chance: 0.3,
            text: 'The water helps, but the man in the next lounger snores through every treatment. You come out rested and with a strong view on assigned seating.',
            effects: [{ stat: 'health', delta: 2 }, { stat: 'stress', delta: -2 }, { money: -200 }],
          },
        ],
      },
      {
        id: 'pills',
        label: 'Just take the pills',
        outcomes: one(
          'You take the pills. They work well enough, and you drive past the spa every day wondering what you missed.',
          [{ stat: 'health', delta: 2 }],
        ),
      },
    ],
  },

  // ── Mines, factories, borders, forests ───────────────────────────────────
  {
    id: 'sitown_mine_grandad',
    kind: 'notice',
    category: 'family',
    emoji: '⛏️',
    ages: [6, 13],
    weight: 6,
    once: true,
    when: si(inTownWith('mining')),
    text: 'Your grandfather, who spent thirty years underground, shows you his old lamp and his helmet and explains that a miner never says goodbye. He says Srečno, good luck, every time.',
    outcomes: [
      {
        chance: 0.6,
        text: 'He tells you about the heat, the dark and the men he worked with, some of whom never came back up. You understand why he still checks the weather every morning.',
        effects: [
          { stat: 'smarts', delta: 1 },
          { rel: 'grandparent', delta: 6, memory: 'the stories from underground' },
        ],
      },
      {
        chance: 0.4,
        text: 'He lets you wear the helmet. It falls over your eyes. He laughs harder than you have ever heard him laugh, and says you are not ready for the morning shift.',
        effects: [
          { stat: 'happiness', delta: 4 },
          { rel: 'grandparent', delta: 5, memory: 'trying on the helmet' },
        ],
      },
    ],
  },
  {
    id: 'sitown_factory_sold',
    kind: 'notice',
    category: 'work',
    emoji: '🏭',
    ages: [18, 64],
    weight: 6,
    once: true,
    fromYear: 1991,
    toYear: 2003,
    when: si(inTownWith('industrial')),
    text: 'The big factory in {city}, the one that used to own the football pitch, the holiday flats on the coast and half the housing estate, is privatised and sold to someone nobody has met.',
    outcomes: [
      {
        chance: 0.5,
        text: 'The holiday flats go first, then a third of the jobs. Your street gets quieter, and the café by the gate starts closing at noon.',
        effects: [
          { stat: 'stress', delta: 5 },
          { stat: 'happiness', delta: -3 },
        ],
      },
      {
        chance: 0.5,
        text: 'Workers got shares in the deal, and you sell yours to a man in a leather jacket for enough to buy a fridge. Later you suspect he got the better of it.',
        effects: [{ money: 600 }, { stat: 'stress', delta: 2 }],
      },
    ],
  },
  {
    id: 'sitown_border_shopping',
    kind: 'choice',
    category: 'money',
    emoji: '👖',
    ages: [10, 70],
    weight: 5,
    cooldownYears: 4,
    toYear: 1990,
    when: si(inTownWith('border'), (s) => !onCroatianBorder(s)),
    text: 'It is a Saturday shopping run over the border: jeans, coffee, washing powder and chocolate that tastes of the West. The customs officer on the way back has a famously long memory.',
    choices: [
      {
        id: 'layers',
        label: 'Wear three pairs of jeans home',
        outcomes: [
          {
            chance: 0.65,
            text: 'You waddle through customs looking innocent and very warm. At home you peel off the jeans like an onion, and they are the envy of the whole school.',
            effects: [{ stat: 'happiness', delta: 6 }, { money: -60 }],
            success: true,
          },
          {
            chance: 0.35,
            text: 'The officer looks at you for a long time and then asks how many legs you have. You pay the duty and the whole car is silent all the way home.',
            effects: [{ stat: 'stress', delta: 4 }, { money: -120 }],
          },
        ],
      },
      {
        id: 'honest',
        label: 'Declare everything',
        outcomes: one(
          'You declare every coffee packet. The officer, startled by honesty, waves you through without charging a thing.',
          [{ stat: 'karma', delta: 2 }, { money: -40 }],
        ),
      },
    ],
  },
  {
    id: 'sitown_bear',
    kind: 'choice',
    category: 'random',
    emoji: '🐻',
    ages: [10, 85],
    weight: 5,
    cooldownYears: 10,
    when: si(inTown(...BEAR_COUNTRY)),
    text: 'Walking home along the edge of the forest at dusk, you see a brown bear in the field about fifty metres away. It is eating something and has not looked up yet.',
    choices: [
      {
        id: 'back',
        label: 'Back away slowly, talking',
        outcomes: one(
          'You walk backwards, talking calmly about nothing. The bear lifts its head, considers you, and goes back to its dinner. Your legs only start shaking at the front door.',
          [
            { stat: 'stress', delta: 4 },
            { stat: 'happiness', delta: 3 },
          ],
        ),
      },
      {
        id: 'photo',
        label: 'Get your phone out',
        outcomes: [
          {
            chance: 0.6,
            text: 'The photo is blurry, dark and unmistakably a bear. It does the rounds on every family chat in the valley by morning.',
            effects: [{ stat: 'happiness', delta: 5 }],
          },
          {
            chance: 0.4,
            text: 'The bear stands up. You leave very fast without a photo and arrive home having set a personal best you will never be able to prove.',
            effects: [
              { stat: 'stress', delta: 8 },
              { stat: 'health', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sitown_second_language',
    kind: 'notice',
    category: 'school',
    emoji: '🗣️',
    ages: [7, 12],
    weight: 6,
    once: true,
    when: si(inTownWith('minority')),
    text: 'School here comes with a second language built in. Signs, report cards and school plays all come in two versions, and the dinner lady speaks whichever one you do.',
    outcomes: [
      {
        chance: livingIn('Lendava'),
        text: 'Lessons are in Slovene and Hungarian side by side. By the end of the year you can count, argue and sing a folk song in both, and you can read the signs on the way to grandmother’s twice over.',
        effects: [{ stat: 'smarts', delta: 4 }, { flag: 'speaks_hungarian' }],
      },
      {
        chance: notLivingIn('Lendava'),
        text: 'Italian is a compulsory subject from the first years, and your Italian-school friends correct your grammar at the beach. By twelve you can order an ice cream in either language without blushing.',
        effects: [{ stat: 'smarts', delta: 4 }, { flag: 'speaks_italian' }],
      },
    ],
  },
  {
    id: 'sitown_farm_harvest',
    kind: 'choice',
    category: 'family',
    emoji: '🎃',
    ages: [8, 15],
    weight: 5,
    cooldownYears: 4,
    when: si(inTownWith('farming')),
    text: 'Harvest time on your grandparents’ farm outside {city}. Every cousin, aunt and neighbour turns up, and there is a job for everyone, including you.',
    choices: [
      {
        id: 'work',
        label: 'Work with the grown-ups',
        outcomes: one(
          'You carry crates until your arms burn, and at the end you all sit at one long table and eat {town:food} as if you had earned it, which you have.',
          [
            { stat: 'discipline', delta: 3 },
            { stat: 'health', delta: 2 },
            { stat: 'happiness', delta: 3 },
          ],
        ),
      },
      {
        id: 'cousins',
        label: 'Run off with the cousins',
        outcomes: one(
          'You and the cousins build a fort in the hayloft and are found two hours later by a furious uncle. It is the best day of the summer.',
          [
            { stat: 'happiness', delta: 6 },
            { stat: 'discipline', delta: -1 },
          ],
        ),
      },
    ],
  },
  {
    id: 'sitown_storks',
    kind: 'notice',
    category: 'random',
    emoji: '🪺',
    ages: [5, 90],
    weight: 4,
    cooldownYears: 10,
    when: si(inRegion('Prekmurje')),
    text: 'The storks are back on the chimney across the road, clattering their beaks from the top of the nest as if they had never been away.',
    outcomes: [
      {
        chance: 1,
        text: 'Everybody on the street counts the chicks through the summer. When three little heads appear, an old neighbour declares it a good year, and nobody argues.',
        effects: [{ stat: 'happiness', delta: 3 }],
      },
    ],
  },
  {
    id: 'sitown_bela_krajina',
    kind: 'choice',
    category: 'social',
    emoji: '💃',
    ages: [8, 20],
    weight: 5,
    once: true,
    when: si(inRegion('Bela krajina')),
    text: 'The folk group needs dancers for the spring festival, in the white embroidered linen costumes of Bela krajina, with birch branches and the kolo danced in a circle until dark.',
    choices: [
      {
        id: 'dance',
        label: 'Join the folk group',
        outcomes: one(
          'You learn the steps, the songs and how to keep white linen white at an outdoor festival. When the circle closes on the square, you feel very old and very young at once.',
          [{ stat: 'happiness', delta: 6 }, { stat: 'discipline', delta: 2 }, { status: 'friend' }],
        ),
      },
      {
        id: 'watch',
        label: 'Watch from the crowd',
        outcomes: one(
          'You watch from the edge with a pogača in your hand. Your grandmother points out which dancer is related to you, which turns out to be most of them.',
          [{ stat: 'happiness', delta: 3 }],
        ),
      },
    ],
  },

  // ── One town only ────────────────────────────────────────────────────────
  {
    id: 'sitown_sg_gallery',
    kind: 'choice',
    category: 'school',
    emoji: '🎨',
    ages: [8, 15],
    weight: 7,
    once: true,
    when: si(inRegion('Koroška')),
    text: 'The Koroška Gallery of Fine Arts in Slovenj Gradec is hanging a children’s exhibition on the theme of peace, as befits a Messenger of Peace town, and your art teacher wants a picture from you by Friday.',
    choices: [
      {
        id: 'paint',
        label: 'Paint something ambitious',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.4, 0.004),
            text: 'Your painting, Uršlja gora with a dove the size of a cow, is hung in the main room. Your grandmother visits it four times and tells strangers who painted it.',
            effects: [
              { skill: 'art', delta: 6 },
              { stat: 'happiness', delta: 7 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'Your painting is hung in a corridor by the toilets. It is still in the gallery, which is more than most painters ever manage.',
            effects: [
              { skill: 'art', delta: 3 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'quick',
        label: 'Draw a quick dove',
        outcomes: one(
          'You draw a dove in five minutes. The teacher says it looks like a pigeon. It is pinned to the classroom wall instead, among twenty other pigeons.',
          [{ skill: 'art', delta: 1 }],
        ),
      },
    ],
  },
  {
    id: 'sitown_sg_ursulja',
    kind: 'choice',
    category: 'travel',
    emoji: '⛰️',
    ages: [10, 75],
    weight: 6,
    cooldownYears: 8,
    when: si(inRegion('Koroška')),
    text: 'A clear autumn Sunday, and someone in the family suggests climbing Uršlja gora, the mountain that watches over the whole of Koroška, to the little church of St Ursula on the top.',
    choices: [
      {
        id: 'climb',
        label: 'Climb to the top',
        outcomes: [
          {
            chance: 0.7,
            text: 'From the summit you can see Pohorje, the Kamnik Alps and the hills of Austria, and the hut at the top makes a tea that might be the best thing you have ever drunk.',
            effects: [
              { stat: 'health', delta: 4 },
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: -5 },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'Cloud rolls in an hour before the top. You reach the church in a white fog, ring nothing, see nothing, and somehow still feel you have been somewhere.',
            effects: [
              { stat: 'health', delta: 3 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'gostilna',
        label: 'Suggest lunch instead',
        outcomes: one(
          'You suggest the gostilna at the bottom instead. Nobody argues as much as they should, and everyone has a second helping of dessert.',
          [
            { stat: 'happiness', delta: 4 },
            { stat: 'health', delta: -1 },
          ],
        ),
      },
    ],
  },
  {
    id: 'sitown_lj_wire_walk',
    kind: 'choice',
    category: 'social',
    emoji: '🥾',
    ages: [10, 80],
    weight: 6,
    cooldownYears: 6,
    when: si(inTown('Ljubljana')),
    text: 'It is the May weekend of the walk along the wire, when the whole city walks the path that follows the line of the barbed-wire fence the occupiers put round Ljubljana in the war.',
    choices: [
      {
        id: 'whole',
        label: 'Walk the whole ring',
        outcomes: [
          {
            chance: oddsBy('health', 0.45, 0.004),
            text: 'Over thirty kilometres, past allotments, tower blocks and woods. At the end you have blisters, a stamp in your booklet, and a strange new respect for your own city.',
            effects: [
              { stat: 'health', delta: 4 },
              { stat: 'happiness', delta: 5 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'At kilometre twenty your knees file a formal complaint. You finish on the tram with a bag of roasted chestnuts, and decide that counts too.',
            effects: [
              { stat: 'health', delta: 1 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'stretch',
        label: 'Do a short stretch with friends',
        outcomes: one(
          'You walk an easy stretch through Tivoli with friends, stop for sausages, and sit in the sun far longer than you walked.',
          [
            { stat: 'happiness', delta: 4 },
            { stat: 'stress', delta: -3 },
          ],
        ),
      },
    ],
  },
  {
    id: 'sitown_mb_lent',
    kind: 'choice',
    category: 'social',
    emoji: '🎶',
    ages: [15, 70],
    weight: 6,
    cooldownYears: 4,
    when: si(inTown('Maribor')),
    text: 'Festival Lent has taken over the riverbank again: stages on the water, bands every night, and the Old Vine dressed up for the occasion.',
    choices: [
      {
        id: 'every',
        label: 'Go every single night',
        outcomes: one(
          'Two weeks of music, grilled fish and Drava breeze. You lose your voice to a singer you had never heard of and gain a friend you meet in a queue.',
          [{ stat: 'happiness', delta: 7 }, { status: 'friend' }, { money: -120 }],
        ),
      },
      {
        id: 'volunteer',
        label: 'Volunteer backstage',
        outcomes: one(
          'You carry amplifiers, hand out water to drummers and get a lanyard that opens every gate. You come out knowing exactly how a festival is made.',
          [
            { stat: 'discipline', delta: 3 },
            { stat: 'happiness', delta: 4 },
          ],
        ),
      },
      {
        id: 'skip',
        label: 'Escape up Pohorje for the quiet',
        outcomes: one(
          'You take the cable car up Pohorje and eat an omelette with cranberries in a mountain hut, far above the noise. It is your festival, and it is excellent.',
          [
            { stat: 'stress', delta: -5 },
            { stat: 'happiness', delta: 3 },
          ],
        ),
      },
    ],
  },
  {
    id: 'sitown_velenje_leap',
    kind: 'choice',
    category: 'work',
    emoji: '🦺',
    ages: [18, 35],
    weight: 6,
    once: true,
    when: si(inTown('Velenje'), hasJob),
    text: 'Friends from the mine are being initiated at the miners’ holiday with the leap over the skin, an old ritual with a leather apron, a beer and a jump in front of the whole town. They want you there.',
    choices: [
      {
        id: 'go',
        label: 'Cheer them on',
        outcomes: one(
          'They leap one by one over the leather, and the band plays, and an old miner tells you it used to be his turn sixty years ago. You find you are a little bit moved.',
          [
            { stat: 'happiness', delta: 5 },
            { rel: 'friend', delta: 5, memory: 'the miners’ leap' },
          ],
        ),
      },
      {
        id: 'work',
        label: 'You have your own shift',
        outcomes: one(
          'You are working that day, and you hear the band through the window. The photos come later, full of grinning men in black hats.',
          [{ stat: 'stress', delta: 1 }],
        ),
      },
    ],
  },
  {
    id: 'sitown_idrija_lace',
    kind: 'choice',
    category: 'school',
    emoji: '🧵',
    ages: [7, 13],
    weight: 7,
    once: true,
    when: si(inTown('Idrija')),
    text: 'Your grandmother has signed you up for the lace school, where children sit at round pillows with dozens of wooden bobbins and learn to make patterns their great-grandmothers made.',
    choices: [
      {
        id: 'stay',
        label: 'Stick at it',
        outcomes: [
          {
            chance: 0.6,
            text: 'Clack, clack, clack. After a year your hands move on their own and you finish a little lace star. Your grandmother frames it, and cries a bit, and blames the light.',
            effects: [
              { skill: 'art', delta: 6 },
              { stat: 'discipline', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Your bobbins tangle into something the teacher calls a bird’s nest. You keep at it anyway, and by the summer you can do a straight edge.',
            effects: [
              { skill: 'art', delta: 3 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'quit',
        label: 'Beg to go to football instead',
        outcomes: one(
          'You beg for football. Your grandmother agrees with the expression of a woman who knows you will regret it, and decades later, you do, a little.',
          [{ stat: 'happiness', delta: 2 }],
        ),
      },
    ],
  },
  {
    id: 'sitown_soca_rafting',
    kind: 'choice',
    category: 'work',
    emoji: '🛶',
    ages: [18, 26],
    weight: 6,
    once: true,
    when: si(inTown(...SOCA)),
    text: 'A rafting company on the Soča needs guides for the summer. The training is two weeks of cold water, rescue drills and learning to say paddle forward in German, Czech and Dutch.',
    choices: [
      {
        id: 'guide',
        label: 'Become a river guide',
        outcomes: [
          {
            chance: oddsBy('health', 0.45, 0.004),
            text: 'By August you can read the river like a page. You get a tan line in the shape of a life jacket and more marriage proposals from tourists than you can count.',
            effects: [
              { money: 2000 },
              { stat: 'health', delta: 4 },
              { stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You flip a raft on your second week with a family from Brno aboard. Everyone is fine, everyone is wet, and the father insists on a photo with you.',
            effects: [{ money: 1600 }, { stat: 'stress', delta: 4 }],
          },
        ],
      },
      {
        id: 'no',
        label: 'Keep your feet dry',
        outcomes: one(
          'You spend the summer serving coffee to rafters in wetsuits. They tip well and they all smell of the river.',
          [{ money: 900 }],
        ),
      },
    ],
  },
  {
    id: 'sitown_soca_attic',
    kind: 'choice',
    category: 'family',
    emoji: '🪖',
    ages: [10, 70],
    weight: 5,
    once: true,
    when: si(inTown(...SOCA)),
    text: 'Clearing out the attic, you find a rusted helmet, a mess tin and a bundle of letters in Italian and Hungarian, left over from the front line that ran through the valley a century ago.',
    choices: [
      {
        id: 'museum',
        label: 'Take it all to the museum in Kobarid',
        outcomes: one(
          'The curator reads one letter and goes very quiet. It is from a soldier to his mother, and it ends up in a glass case with your family’s name on the card.',
          [
            { stat: 'karma', delta: 3 },
            { stat: 'smarts', delta: 2 },
          ],
        ),
      },
      {
        id: 'keep',
        label: 'Keep the helmet on the shelf',
        outcomes: one(
          'The helmet goes on a shelf next to the radio. Whenever guests ask about it, the conversation goes somewhere serious and stays there.',
          [{ stat: 'smarts', delta: 1 }],
        ),
      },
    ],
  },
  {
    id: 'sitown_postojna_nativity',
    kind: 'choice',
    category: 'social',
    emoji: '🕯️',
    ages: [7, 16],
    weight: 6,
    once: true,
    when: si(inTown('Postojna')),
    text: 'Every Christmas there is a living nativity scene deep inside Postojna Cave, and this year they need children to play shepherds among the stalagmites.',
    choices: [
      {
        id: 'shepherd',
        label: 'Be a shepherd',
        outcomes: one(
          'You stand very still in a sheepskin with a wooden crook while thousands of visitors walk past in the half-dark. A real lamb leans against your leg the whole time.',
          [
            { stat: 'happiness', delta: 6 },
            { stat: 'discipline', delta: 2 },
          ],
        ),
      },
      {
        id: 'watch',
        label: 'Go and watch with the family',
        outcomes: one(
          'You ride the little cave train in with your family and watch the scene by candlelight. Your little cousin asks loudly where the toilets are, in front of the angel.',
          [{ stat: 'happiness', delta: 4 }],
        ),
      },
    ],
  },
  {
    id: 'sitown_loka_passion',
    kind: 'choice',
    category: 'social',
    emoji: '🎭',
    ages: [8, 75],
    weight: 6,
    cooldownYears: 6,
    when: si(inTown('Škofja Loka')),
    text: 'The Škofja Loka Passion is being staged again, the old procession play with hundreds of townspeople in costume, and the organisers need more volunteers.',
    choices: [
      {
        id: 'join',
        label: 'Put on a costume',
        outcomes: one(
          'You end up as a soldier, a pilgrim or a sinner, depending on who you ask. Walking through the old town with half of Loka in robes is stranger and more moving than you expected.',
          [{ stat: 'happiness', delta: 6 }, { stat: 'karma', delta: 2 }, { status: 'friend' }],
        ),
      },
      {
        id: 'watch',
        label: 'Watch from the square',
        outcomes: one(
          'You watch from the square with a coffee and spot your dentist as a Roman soldier. You will never see him in quite the same way.',
          [{ stat: 'happiness', delta: 3 }],
        ),
      },
    ],
  },
  {
    id: 'sitown_jesenice_hockey',
    kind: 'choice',
    category: 'social',
    emoji: '🏒',
    ages: [6, 12],
    weight: 7,
    once: true,
    when: si(inTown('Jesenice')),
    text: 'In Jesenice, a child with skates is a hockey player waiting to happen. The coach at Podmežakla has watched you on the frozen car park and says to come on Tuesday.',
    choices: [
      {
        id: 'go',
        label: 'Turn up on Tuesday',
        outcomes: [
          {
            chance: oddsBy('health', 0.4, 0.004),
            text: 'You learn to skate backwards, fall properly and shout at referees. The older players let you carry their sticks, which in this town is a knighthood.',
            effects: [
              { skill: 'athletics', delta: 7 },
              { stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You lose a tooth in the third week. It was a baby tooth, so you are mostly proud, and your parents are mostly not.',
            effects: [{ skill: 'athletics', delta: 4 }, { injury: 2 }],
          },
        ],
      },
      {
        id: 'no',
        label: 'Watch from the stands',
        outcomes: one(
          'You become the loudest small fan in the ice hall instead, with a scarf and a voice that carries all the way to the bench.',
          [{ stat: 'happiness', delta: 3 }],
        ),
      },
    ],
  },
];
