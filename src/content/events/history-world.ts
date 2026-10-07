import type { EventDef, OutcomeDef } from '../../engine/events/types';
import type { GameState } from '../../engine/types';
import { notInPrison } from './conditions';

/** Living in one of these countries (and not inside, where history waits at the gate). */
const inCountry =
  (...ids: string[]) =>
  (s: GameState): boolean =>
    ids.includes(s.player.country) && notInPrison(s);
/** Outcome odds: the child's view of a moment, or the grown-up's. */
const asChild = (s: GameState): number => (s.player.age < 18 ? 1 : 0);
const asAdult = (s: GameState): number => (s.player.age < 18 ? 0 : 1);
const one = (text: string, effects: OutcomeDef['effects']): OutcomeDef[] => [
  { chance: 1, text, effects },
];
/** A young man of call-up age, not already in uniform. */
const callUpAge = (s: GameState): boolean =>
  s.player.gender === 'male' && s.player.age >= 18 && s.player.age <= 20 && !s.military?.active;

/** Real moments from a dozen more countries, 1950 to 2024, pinned to their years. */
export const WORLD_HISTORY_EVENTS: EventDef[] = [
  // Italy
  {
    id: 'hist_florence_flood_1966',
    kind: 'choice',
    category: 'world',
    emoji: '🌊',
    ages: [14, 70],
    weight: 40,
    once: true,
    fromYear: 1966,
    toYear: 1966,
    when: inCountry('it'),
    text: 'The Arno bursts its banks in November and Florence fills with brown water and fuel oil. Paintings, manuscripts and whole libraries sit in the mud. Volunteers are arriving from everywhere with shovels.',
    choices: [
      {
        id: 'shovel',
        label: 'Go and dig books out of the mud',
        outcomes: one(
          'You spend a fortnight passing sodden books hand to hand down a human chain. Your boots never recover. People start calling you lot the mud angels.',
          [
            { stat: 'karma', delta: 6 },
            { stat: 'health', delta: -2 },
            { stat: 'happiness', delta: 4 },
            { flag: 'mud_angel' },
          ],
        ),
      },
      {
        id: 'watch',
        label: 'Follow it on the news',
        outcomes: one(
          'You see a crucifix being lifted out of the slime on television, and feel the loss of something you never got round to visiting.',
          [{ stat: 'happiness', delta: -3 }, { flag: 'remembers_florence_flood' }],
        ),
      },
    ],
  },
  {
    id: 'hist_irpinia_quake_1980',
    kind: 'notice',
    category: 'world',
    emoji: '🏚️',
    ages: [6, 120],
    weight: 40,
    once: true,
    fromYear: 1980,
    toYear: 1980,
    when: inCountry('it'),
    text: 'On a Sunday evening in November, an earthquake flattens villages across Campania and Basilicata. Nearly three thousand people die, and help is days late reaching the mountains.',
    outcomes: [
      {
        chance: asChild,
        text: 'Your class collects tins and blankets in cardboard boxes. The pictures of children your age sleeping in tents stay with you.',
        effects: [{ stat: 'happiness', delta: -4 }, { flag: 'remembers_irpinia' }],
      },
      {
        chance: asAdult,
        text: 'The slow, chaotic rescue makes you furious in a way that does not fade. You give what you can and argue about it at every dinner for a year.',
        effects: [
          { stat: 'happiness', delta: -4 },
          { stat: 'stress', delta: 3 },
          { stat: 'karma', delta: 2 },
          { flag: 'remembers_irpinia' },
        ],
      },
    ],
  },
  {
    id: 'hist_italy_world_cup_1982',
    kind: 'notice',
    category: 'world',
    emoji: '⚽',
    ages: [5, 120],
    weight: 40,
    once: true,
    fromYear: 1982,
    toYear: 1982,
    when: inCountry('it'),
    text: 'Italy beat West Germany three goals to one in Madrid to win the World Cup. The whole country seems to pour into the piazzas at once, honking at nothing in particular.',
    outcomes: one(
      'You end up on the roof of a stranger’s car, waving a flag you did not own an hour ago. Nobody sleeps on your street.',
      [{ stat: 'happiness', delta: 6 }, { flag: 'saw_italy_1982' }],
    ),
  },

  // Spain
  {
    id: 'hist_franco_dies_1975',
    kind: 'notice',
    category: 'world',
    emoji: '📻',
    ages: [6, 120],
    weight: 40,
    once: true,
    fromYear: 1975,
    toYear: 1975,
    when: inCountry('es'),
    text: 'After weeks of medical bulletins, the radio announces that General Franco is dead. Thirty-six years of dictatorship end not with a bang but with a very long illness.',
    outcomes: [
      {
        chance: asChild,
        text: 'School is closed for mourning. Your grandfather opens a bottle he has been saving and will not tell you why.',
        effects: [{ stat: 'happiness', delta: 2 }, { flag: 'remembers_franco' }],
      },
      {
        chance: asAdult,
        text: 'Some neighbours weep in public. Others smile behind closed shutters. You lower your voice out of habit, and then wonder whether you still need to.',
        effects: [
          { stat: 'stress', delta: 3 },
          { stat: 'happiness', delta: 2 },
          { flag: 'remembers_franco' },
        ],
      },
    ],
  },
  {
    id: 'hist_barcelona_1992',
    kind: 'notice',
    category: 'world',
    emoji: '🏹',
    ages: [5, 120],
    weight: 40,
    once: true,
    fromYear: 1992,
    toYear: 1992,
    when: inCountry('es'),
    text: 'Barcelona hosts the Olympic Games, and the cauldron is lit by an archer firing a flaming arrow over the stadium. The whole country holds its breath to see if he hits it.',
    outcomes: one(
      'Spain wins more gold medals than anyone expected, and the city by the sea looks brand new. You feel, briefly, like the centre of the world.',
      [{ stat: 'happiness', delta: 5 }, { flag: 'saw_barcelona_1992' }],
    ),
  },
  {
    id: 'hist_madrid_bombings_2004',
    kind: 'notice',
    category: 'world',
    emoji: '🕯️',
    ages: [8, 120],
    weight: 40,
    once: true,
    fromYear: 2004,
    toYear: 2004,
    when: inCountry('es'),
    text: 'On a March morning, bombs explode on four commuter trains heading into Madrid. A hundred and ninety-three people are killed on their way to work and school.',
    outcomes: one(
      'The next evening, millions march in the rain across the country. You stand in the crowd with an umbrella you do not open.',
      [{ stat: 'happiness', delta: -5 }, { stat: 'stress', delta: 4 }, { flag: 'remembers_11m' }],
    ),
  },

  // Ireland
  {
    id: 'hist_italia_90_ireland',
    kind: 'notice',
    category: 'world',
    emoji: '⚽',
    ages: [5, 120],
    weight: 40,
    once: true,
    fromYear: 1990,
    toYear: 1990,
    when: inCountry('ie'),
    text: 'Ireland reach the quarter-finals of the World Cup in Italy without winning a single match in normal time. A penalty shoot-out against Romania stops the country dead.',
    outcomes: [
      {
        chance: asChild,
        text: 'You watch through a forest of legs in a packed pub, lemonade in hand. When the last penalty goes in, a man you have never met lifts you onto his shoulders.',
        effects: [{ stat: 'happiness', delta: 6 }, { flag: 'saw_italia_90' }],
      },
      {
        chance: asAdult,
        text: 'Work stops for every match and nobody pretends otherwise. That summer, for once, the whole island seems to be in a good mood at the same time.',
        effects: [
          { stat: 'happiness', delta: 6 },
          { stat: 'stress', delta: -2 },
          { flag: 'saw_italia_90' },
        ],
      },
    ],
  },
  {
    id: 'hist_good_friday_ireland_1998',
    kind: 'notice',
    category: 'world',
    emoji: '🕊️',
    ages: [10, 120],
    weight: 40,
    once: true,
    fromYear: 1998,
    toYear: 1998,
    when: inCountry('ie'),
    text: 'A peace agreement for Northern Ireland is signed on Good Friday, and in May the Republic votes to change its constitution to help it stand. The queues at the polling stations are unusually cheerful.',
    outcomes: one(
      'You read the whole agreement in the paper, which almost nobody does. It is long and careful and full of compromise, and that is what makes it feel real.',
      [
        { stat: 'happiness', delta: 3 },
        { stat: 'smarts', delta: 1 },
        { flag: 'remembers_good_friday' },
      ],
    ),
  },
  {
    id: 'hist_marriage_referendum_2015',
    kind: 'choice',
    category: 'world',
    emoji: '🗳️',
    ages: [18, 120],
    weight: 40,
    once: true,
    fromYear: 2015,
    toYear: 2015,
    when: inCountry('ie'),
    text: 'Ireland holds a referendum on whether two people of the same sex may marry. Emigrants are flying home just to vote, and the hashtag for it is everywhere.',
    choices: [
      {
        id: 'yes',
        label: 'Vote yes',
        outcomes: one(
          'The count comes in at sixty-two per cent in favour. You stand in the courtyard of Dublin Castle with thousands of others, singing badly and crying a bit.',
          [
            { stat: 'happiness', delta: 5 },
            { stat: 'karma', delta: 2 },
            { flag: 'voted_yes_2015' },
          ],
        ),
      },
      {
        id: 'no',
        label: 'Vote no',
        outcomes: one(
          'You vote no, and lose by a distance. The country changes around you anyway, and the weddings that follow turn out to be very much like other weddings.',
          [{ stat: 'stress', delta: 2 }, { flag: 'voted_no_2015' }],
        ),
      },
      {
        id: 'skip',
        label: 'Stay at home',
        outcomes: one(
          'You let everyone else decide. Watching the celebrations on the news that evening, you feel a little left out of your own country.',
          [{ stat: 'happiness', delta: -1 }],
        ),
      },
    ],
  },

  // Netherlands
  {
    id: 'hist_north_sea_flood_1953',
    kind: 'notice',
    category: 'world',
    emoji: '🌊',
    ages: [3, 120],
    weight: 40,
    once: true,
    fromYear: 1953,
    toYear: 1953,
    when: inCountry('nl'),
    text: 'On the night of the first of February, a storm surge breaks the dikes in Zeeland and the islands of the south-west. Water rises through houses in the dark. More than eighteen hundred people drown.',
    outcomes: [
      {
        chance: asChild,
        text: 'Your family takes in a girl from the islands whose house is gone. She sleeps in your bed and you sleep on the floor, and neither of you minds.',
        effects: [
          { stat: 'happiness', delta: -4 },
          { stat: 'karma', delta: 2 },
          { flag: 'remembers_1953_flood' },
        ],
      },
      {
        chance: asAdult,
        text: 'You spend weeks filling sandbags and sorting donated coats. The country decides it will never let the sea do this again, and starts building.',
        effects: [
          { stat: 'happiness', delta: -4 },
          { stat: 'stress', delta: 4 },
          { stat: 'karma', delta: 3 },
          { flag: 'remembers_1953_flood' },
        ],
      },
    ],
  },
  {
    id: 'hist_dutch_final_1974',
    kind: 'notice',
    category: 'world',
    emoji: '🟠',
    ages: [5, 120],
    weight: 40,
    once: true,
    fromYear: 1974,
    toYear: 1974,
    when: inCountry('nl'),
    text: 'The Netherlands play the most beautiful football anyone has seen and score in the first two minutes of the World Cup final in Munich. Then West Germany score twice.',
    outcomes: one(
      'You learn that it is possible to be the best team in the world and still lose. The orange shirt goes back in the drawer, and the grudge goes nowhere.',
      [{ stat: 'happiness', delta: -3 }, { flag: 'saw_1974_final' }],
    ),
  },
  {
    id: 'hist_dutch_euro_1988',
    kind: 'notice',
    category: 'world',
    emoji: '🏆',
    ages: [5, 120],
    weight: 40,
    once: true,
    fromYear: 1988,
    toYear: 1988,
    when: inCountry('nl'),
    text: 'In the European Championship, the Netherlands beat West Germany at last, then win the final with a volley from an angle that should not have been possible.',
    outcomes: one(
      'The canals in Amsterdam fill with boats full of orange people. Fourteen years of sulking evaporate in one afternoon.',
      [{ stat: 'happiness', delta: 6 }, { flag: 'saw_euro_1988' }],
    ),
  },

  // Poland
  {
    id: 'hist_solidarity_1980',
    kind: 'choice',
    category: 'world',
    emoji: '✊',
    ages: [17, 70],
    weight: 40,
    once: true,
    fromYear: 1980,
    toYear: 1980,
    when: inCountry('pl'),
    text: 'Strikes spread from the Gdańsk shipyard across the country, and the workers have twenty-one demands, including the right to a free trade union. Your workplace is choosing a side.',
    choices: [
      {
        id: 'join',
        label: 'Join the strike',
        outcomes: one(
          'You sleep on the factory floor for a week, eat soup passed through the gates, and sign your name on a list that might matter later. The government gives in.',
          [
            { stat: 'happiness', delta: 5 },
            { stat: 'stress', delta: 5 },
            { stat: 'karma', delta: 3 },
            { flag: 'solidarity_member' },
          ],
        ),
      },
      {
        id: 'quiet',
        label: 'Keep your head down',
        outcomes: one(
          'You keep working and keep quiet, because someone has to feed the family. When the agreement is signed, you cheer as loudly as anyone, in your kitchen.',
          [{ stat: 'stress', delta: 2 }, { flag: 'saw_solidarity' }],
        ),
      },
    ],
  },
  {
    id: 'hist_martial_law_1981',
    kind: 'notice',
    category: 'world',
    emoji: '🪖',
    ages: [6, 120],
    weight: 40,
    once: true,
    fromYear: 1981,
    toYear: 1981,
    when: inCountry('pl'),
    text: 'On a Sunday morning in December, the television shows only a general in dark glasses. Martial law has been declared. There are tanks in the snow and the telephones are dead.',
    outcomes: [
      {
        chance: asChild,
        text: 'Your Sunday cartoons are gone, replaced by the general. You are cross about this for days before you understand what else has gone.',
        effects: [{ stat: 'happiness', delta: -3 }, { flag: 'remembers_martial_law' }],
      },
      {
        chance: asAdult,
        text: 'Friends disappear into internment camps overnight. There is a curfew, a queue for everything, and a candle in many windows on Christmas Eve.',
        effects: [
          { stat: 'happiness', delta: -5 },
          { stat: 'stress', delta: 6 },
          { flag: 'remembers_martial_law' },
        ],
      },
    ],
  },
  {
    id: 'hist_polish_elections_1989',
    kind: 'notice',
    category: 'world',
    emoji: '🗳️',
    ages: [10, 120],
    weight: 40,
    once: true,
    fromYear: 1989,
    toYear: 1989,
    when: inCountry('pl'),
    text: 'In June, Poland holds elections that are only partly free, and Solidarity wins almost every seat it is allowed to contest. The posters show a lone cowboy at high noon.',
    outcomes: one(
      'By the end of the summer, the country has its first non-communist prime minister in four decades. You keep the ballot slip in a book, flattened like a flower.',
      [{ stat: 'happiness', delta: 6 }, { flag: 'saw_1989_poland' }],
    ),
  },

  // Turkey
  {
    id: 'hist_turkey_coup_1980',
    kind: 'notice',
    category: 'world',
    emoji: '📻',
    ages: [8, 120],
    weight: 40,
    once: true,
    fromYear: 1980,
    toYear: 1980,
    when: inCountry('tr'),
    text: 'On the twelfth of September, the army takes power before dawn. The radio plays marches; there is a curfew; parliament is shut. After years of street violence, some people are relieved, which frightens others more.',
    outcomes: [
      {
        chance: asChild,
        text: 'The streets go oddly quiet and your parents start burning some of their books in the stove. You are told not to repeat anything said at home.',
        effects: [{ stat: 'stress', delta: 4 }, { flag: 'remembers_1980_coup' }],
      },
      {
        chance: asAdult,
        text: 'Tens of thousands are detained in the months that follow. You learn which friends to stop mentioning, and that is a lesson you resent learning.',
        effects: [
          { stat: 'happiness', delta: -4 },
          { stat: 'stress', delta: 6 },
          { flag: 'remembers_1980_coup' },
        ],
      },
    ],
  },
  {
    id: 'hist_izmit_quake_1999',
    kind: 'notice',
    category: 'world',
    emoji: '🏚️',
    ages: [6, 120],
    weight: 40,
    once: true,
    fromYear: 1999,
    toYear: 1999,
    when: inCountry('tr'),
    text: 'At three in the morning in August, the ground under the Marmara region shakes for forty-five seconds. Apartment blocks fold like card tables. More than seventeen thousand people die.',
    outcomes: one(
      'For weeks, half the city sleeps in parks and on balconies. Rescue teams arrive from Greece, of all places, and something old and bitter softens a little.',
      [{ stat: 'happiness', delta: -5 }, { stat: 'stress', delta: 6 }, { flag: 'remembers_izmit' }],
    ),
  },
  {
    id: 'hist_turkey_quake_2023',
    kind: 'choice',
    category: 'world',
    emoji: '🧱',
    ages: [16, 75],
    weight: 40,
    once: true,
    fromYear: 2023,
    toYear: 2023,
    when: inCountry('tr'),
    text: 'In February, two huge earthquakes strike the south-east within hours, in freezing cold. Whole towns are gone. More than fifty thousand people are killed, and the rubble is still talking for days.',
    choices: [
      {
        id: 'drive',
        label: 'Drive south with supplies',
        outcomes: one(
          'You fill a borrowed van with nappies, stoves and blankets and drive through the night. You are not trained for any of what you see, and you help anyway.',
          [
            { stat: 'karma', delta: 6 },
            { stat: 'stress', delta: 8 },
            { money: -300, kind: 'price' },
            { flag: 'quake_volunteer_2023' },
          ],
        ),
      },
      {
        id: 'give',
        label: 'Give money and blood',
        outcomes: one(
          'The queue at the blood bank goes round the block twice. You wait four hours and nobody complains, not once.',
          [
            { stat: 'karma', delta: 3 },
            { stat: 'happiness', delta: -3 },
            { money: -150, kind: 'price' },
            { flag: 'remembers_2023_quake' },
          ],
        ),
      },
    ],
  },

  // China
  {
    id: 'hist_tangshan_1976',
    kind: 'notice',
    category: 'world',
    emoji: '🏚️',
    ages: [6, 120],
    weight: 40,
    once: true,
    fromYear: 1976,
    toYear: 1976,
    when: inCountry('cn'),
    text: 'Before dawn in July, an earthquake destroys the industrial city of Tangshan almost entirely. The official figure is two hundred and forty thousand dead. Little else is said about it for a long time.',
    outcomes: one(
      'All summer, people in the north sleep outside in shelters made of plastic sheeting. It is a year of endings: by autumn, Chairman Mao is dead as well.',
      [
        { stat: 'happiness', delta: -5 },
        { stat: 'stress', delta: 5 },
        { flag: 'remembers_tangshan' },
      ],
    ),
  },
  {
    id: 'hist_reform_opening_1978',
    kind: 'notice',
    category: 'world',
    emoji: '🚲',
    ages: [10, 120],
    weight: 40,
    once: true,
    fromYear: 1978,
    toYear: 1978,
    when: inCountry('cn'),
    text: 'The Party announces a policy of reform and opening up. Farmers may sell what they grow beyond their quota. The university entrance exam came back last winter, and everyone you know is cramming.',
    outcomes: [
      {
        chance: asChild,
        text: 'An older cousin passes the exam and leaves for the city. The whole village walks her to the bus, and you decide that you will be next.',
        effects: [{ stat: 'smarts', delta: 3 }, { flag: 'saw_reform_opening' }],
      },
      {
        chance: asAdult,
        text: 'Someone on your street opens a stall selling dumplings for actual money and nobody arrests him. It feels like the beginning of something enormous.',
        effects: [
          { stat: 'happiness', delta: 4 },
          { stat: 'smarts', delta: 1 },
          { flag: 'saw_reform_opening' },
        ],
      },
    ],
  },
  {
    id: 'hist_beijing_2008',
    kind: 'notice',
    category: 'world',
    emoji: '🎆',
    ages: [5, 120],
    weight: 40,
    once: true,
    fromYear: 2008,
    toYear: 2008,
    when: inCountry('cn'),
    text: 'At eight minutes past eight on the eighth of the eighth, 2008, the Beijing Olympics open with two thousand drummers in perfect time and a sky full of fireworks.',
    outcomes: one(
      'China tops the gold medal table, and you watch the ceremony three times. Earlier that year an earthquake in Sichuan killed tens of thousands, and the cheering feels like a kind of answer.',
      [{ stat: 'happiness', delta: 6 }, { flag: 'saw_beijing_2008' }],
    ),
  },

  // Philippines
  {
    id: 'hist_people_power_1986',
    kind: 'choice',
    category: 'world',
    emoji: '💛',
    ages: [15, 75],
    weight: 40,
    once: true,
    fromYear: 1986,
    toYear: 1986,
    when: inCountry('ph'),
    text: 'After a stolen election, a church radio station asks people to come to the avenue outside two army camps. Nuns, students and families are going, with rosaries, sandwiches and yellow ribbons, to stand in front of tanks.',
    choices: [
      {
        id: 'go',
        label: 'Go to the avenue',
        outcomes: one(
          'For four days you stand in the crowd, handing flowers to soldiers who do not fire. Then the dictator flies away in an American helicopter.',
          [
            { stat: 'happiness', delta: 8 },
            { stat: 'stress', delta: 4 },
            { stat: 'karma', delta: 3 },
            { flag: 'was_at_edsa' },
          ],
        ),
      },
      {
        id: 'radio',
        label: 'Follow it on the radio',
        outcomes: one(
          'You stay home with the radio pressed to your ear, praying along when the crowd prays. When the news comes, you run out into the street anyway.',
          [{ stat: 'happiness', delta: 5 }, { flag: 'saw_people_power' }],
        ),
      },
    ],
  },
  {
    id: 'hist_pinatubo_1991',
    kind: 'notice',
    category: 'world',
    emoji: '🌋',
    ages: [5, 120],
    weight: 40,
    once: true,
    fromYear: 1991,
    toYear: 1991,
    when: inCountry('ph'),
    text: 'Mount Pinatubo, quiet for five hundred years, erupts in June while a typhoon passes overhead. Ash turns to heavy wet cement and falls for hours. Midday goes black as night.',
    outcomes: [
      {
        chance: asChild,
        text: 'You help sweep grey sludge off the roof and are allowed to keep a jar of ash. For a year the sunsets are the most ridiculous colours you have ever seen.',
        effects: [{ stat: 'happiness', delta: 1 }, { flag: 'saw_pinatubo' }],
      },
      {
        chance: asAdult,
        text: 'Roofs give way under the weight, and the mudflows go on for years with every rainy season. Somehow, thanks to the warnings, most people got out.',
        effects: [
          { stat: 'stress', delta: 5 },
          { stat: 'happiness', delta: -3 },
          { flag: 'saw_pinatubo' },
        ],
      },
    ],
  },
  {
    id: 'hist_haiyan_2013',
    kind: 'notice',
    category: 'world',
    emoji: '🌀',
    ages: [6, 120],
    weight: 40,
    once: true,
    fromYear: 2013,
    toYear: 2013,
    when: inCountry('ph'),
    text: 'Typhoon Haiyan, one of the strongest storms ever to make landfall, drives a wall of seawater through Tacloban in November. More than six thousand people are killed.',
    outcomes: one(
      'You spend weeks trying to reach relatives in the Visayas. When a cousin finally calls from a borrowed phone, you sit down on the floor and stay there for a while.',
      [
        { stat: 'happiness', delta: -5 },
        { stat: 'stress', delta: 6 },
        { flag: 'remembers_haiyan' },
      ],
    ),
  },

  // New Zealand
  {
    id: 'hist_rainbow_warrior_1985',
    kind: 'notice',
    category: 'world',
    emoji: '⛵',
    ages: [8, 120],
    weight: 40,
    once: true,
    fromYear: 1985,
    toYear: 1985,
    when: inCountry('nz'),
    text: 'A protest ship bound for French nuclear tests is sunk by two bombs in Auckland harbour, and a photographer aboard is killed. The bombers turn out to be French secret agents on fake passports.',
    outcomes: one(
      'A small country discovers it can be furious with a large one. The nuclear-free stance that follows becomes something people here wear like a badge.',
      [
        { stat: 'stress', delta: 2 },
        { stat: 'karma', delta: 1 },
        { flag: 'remembers_rainbow_warrior' },
      ],
    ),
  },
  {
    id: 'hist_christchurch_quake_2011',
    kind: 'notice',
    category: 'world',
    emoji: '🏚️',
    ages: [6, 120],
    weight: 40,
    once: true,
    fromYear: 2011,
    toYear: 2011,
    when: inCountry('nz'),
    text: 'Just before one o’clock on a February afternoon, an earthquake shatters central Christchurch. The cathedral spire falls, an office block collapses, and a hundred and eighty-five people are killed.',
    outcomes: one(
      'Students turn up by the thousand with shovels to clear the liquefied silt from strangers’ driveways. The city will take a decade to rebuild, and you will notice every gap.',
      [
        { stat: 'happiness', delta: -4 },
        { stat: 'stress', delta: 5 },
        { flag: 'remembers_christchurch_quake' },
      ],
    ),
  },
  {
    id: 'hist_christchurch_mosques_2019',
    kind: 'notice',
    category: 'world',
    emoji: '🕯️',
    ages: [8, 120],
    weight: 40,
    once: true,
    fromYear: 2019,
    toYear: 2019,
    when: inCountry('nz'),
    text: 'During Friday prayers in March, a gunman attacks two mosques in Christchurch and kills fifty-one people. The country does not have the words, so for a while it simply stands still.',
    outcomes: [
      {
        chance: asChild,
        text: 'Your school performs a haka for the victims on the field, everyone in it together. You are shaking by the end, and so is your teacher.',
        effects: [{ stat: 'happiness', delta: -5 }, { flag: 'remembers_march_15' }],
      },
      {
        chance: asAdult,
        text: 'Within a month, parliament bans the weapons used, almost unanimously. You leave flowers at the fence of the nearest mosque, among a wall of others.',
        effects: [
          { stat: 'happiness', delta: -5 },
          { stat: 'karma', delta: 2 },
          { flag: 'remembers_march_15' },
        ],
      },
    ],
  },

  // South Africa
  {
    id: 'hist_soweto_1976',
    kind: 'notice',
    category: 'world',
    emoji: '✊',
    ages: [8, 120],
    weight: 40,
    once: true,
    fromYear: 1976,
    toYear: 1976,
    when: inCountry('za'),
    text: 'In June, thousands of schoolchildren in Soweto march against being taught in Afrikaans. Police open fire. A photograph of a dying twelve-year-old boy goes round the world.',
    outcomes: [
      {
        chance: asChild,
        text: 'Older pupils at your school whisper about walking out too. Your mother makes you promise to come straight home, and holds your hand much too hard.',
        effects: [{ stat: 'stress', delta: 5 }, { flag: 'remembers_soweto' }],
      },
      {
        chance: asAdult,
        text: 'The unrest spreads for months and hundreds die. You realise that the young people have run out of patience, and that nothing is going back to how it was.',
        effects: [
          { stat: 'happiness', delta: -5 },
          { stat: 'stress', delta: 5 },
          { flag: 'remembers_soweto' },
        ],
      },
    ],
  },
  {
    id: 'hist_sa_election_1994',
    kind: 'notice',
    category: 'world',
    emoji: '🗳️',
    ages: [8, 120],
    weight: 40,
    once: true,
    fromYear: 1994,
    toYear: 1994,
    when: inCountry('za'),
    text: 'In April, South Africans of every race vote together for the first time. The queues stretch for kilometres across the veld, and people wait all day in the sun to make their mark.',
    outcomes: [
      {
        chance: asChild,
        text: 'You spend the day in the queue with your grandmother, who has waited her whole life for this. She dresses in her church clothes and will not sit down.',
        effects: [{ stat: 'happiness', delta: 6 }, { flag: 'saw_1994_vote' }],
      },
      {
        chance: asAdult,
        text: 'You stand for nine hours, talking to strangers you would never have met. When you finally fold the ballot into the box, your hands are not quite steady.',
        effects: [
          { stat: 'happiness', delta: 7 },
          { stat: 'karma', delta: 2 },
          { flag: 'saw_1994_vote' },
        ],
      },
    ],
  },
  {
    id: 'hist_sa_world_cup_2010',
    kind: 'notice',
    category: 'world',
    emoji: '📯',
    ages: [5, 120],
    weight: 40,
    once: true,
    fromYear: 2010,
    toYear: 2010,
    when: inCountry('za'),
    text: 'South Africa hosts the first World Cup on African soil, and the country hums for a month with the drone of plastic horns. The home side goes out early, and nobody lets it spoil the party.',
    outcomes: one(
      'You learn to sleep through the horns, then to miss them. Flags fly from every car aerial, including some cars with no other working parts.',
      [{ stat: 'happiness', delta: 5 }, { flag: 'saw_sa_2010' }],
    ),
  },

  // Egypt
  {
    id: 'hist_suez_1956',
    kind: 'notice',
    category: 'world',
    emoji: '🚢',
    ages: [8, 120],
    weight: 40,
    once: true,
    fromYear: 1956,
    toYear: 1956,
    when: inCountry('eg'),
    text: 'President Nasser nationalises the Suez Canal, and by autumn British, French and Israeli forces have invaded. Port Said is bombed. Within weeks, under pressure from both superpowers, they withdraw.',
    outcomes: one(
      'The radio plays Nasser’s speeches in every café, and the whole street listens. You feel, for the first time, that your country has stood up to someone.',
      [{ stat: 'happiness', delta: 3 }, { stat: 'stress', delta: 3 }, { flag: 'remembers_suez' }],
    ),
  },
  {
    id: 'hist_october_war_1973',
    kind: 'notice',
    category: 'world',
    emoji: '🪖',
    ages: [8, 120],
    weight: 40,
    once: true,
    fromYear: 1973,
    toYear: 1973,
    when: inCountry('eg'),
    text: 'In October, Egyptian troops cross the Suez Canal into Sinai, breaching the sand wall on the far bank with water cannons. The fighting lasts less than three weeks and costs thousands of lives.',
    outcomes: [
      {
        chance: asChild,
        text: 'The windows are painted blue for the blackout and you do homework by candlelight. An older brother of a friend does not come back.',
        effects: [
          { stat: 'stress', delta: 4 },
          { stat: 'happiness', delta: -2 },
          { flag: 'remembers_october_war' },
        ],
      },
      {
        chance: asAdult,
        text: 'The crossing becomes a story the country tells itself with pride for decades. You also remember the funerals, which the story tends to leave out.',
        effects: [
          { stat: 'stress', delta: 5 },
          { stat: 'happiness', delta: 1 },
          { flag: 'remembers_october_war' },
        ],
      },
    ],
  },
  {
    id: 'hist_tahrir_2011',
    kind: 'choice',
    category: 'world',
    emoji: '🇪🇬',
    ages: [16, 75],
    weight: 40,
    once: true,
    fromYear: 2011,
    toYear: 2011,
    when: inCountry('eg'),
    text: 'In January, protests against thirty years of the same president fill Tahrir Square in Cairo. The government cuts off the internet. People keep coming anyway, by word of mouth.',
    choices: [
      {
        id: 'square',
        label: 'Go to the square',
        outcomes: [
          {
            chance: 0.8,
            text: 'You spend eighteen days in a tent city with doctors, poets and football ultras. When Mubarak resigns, the square shakes with noise and you lose your voice for a week.',
            effects: [
              { stat: 'happiness', delta: 8 },
              { stat: 'stress', delta: 6 },
              { flag: 'was_in_tahrir' },
            ],
          },
          {
            chance: 0.2,
            text: 'You are caught in a charge and come home with a split eyebrow and a cough from the tear gas. You go back the next day.',
            effects: [
              { injury: 10 },
              { stat: 'stress', delta: 8 },
              { stat: 'happiness', delta: 3 },
              { flag: 'was_in_tahrir' },
            ],
          },
        ],
      },
      {
        id: 'home',
        label: 'Stay home and guard the street',
        outcomes: one(
          'With the police gone, your neighbours form a night watch with sticks and kitchen knives. You get to know every family on the street by name.',
          [
            { stat: 'stress', delta: 4 },
            { stat: 'happiness', delta: 2 },
            { flag: 'saw_2011_egypt' },
          ],
        ),
      },
    ],
  },

  // Argentina
  {
    id: 'hist_falklands_callup_1982',
    kind: 'choice',
    category: 'world',
    emoji: '✉️',
    ages: [18, 20],
    weight: 40,
    once: true,
    fromYear: 1982,
    toYear: 1982,
    when: (s) => inCountry('ar')(s) && callUpAge(s),
    text: 'In April, the junta sends troops to take the Malvinas from Britain, and a British fleet sails south. Conscripts your age are being shipped to the islands with summer boots.',
    choices: [
      {
        id: 'report',
        label: 'Report when called',
        outcomes: one(
          'You report, are handed a rifle older than you are, and learn what a South Atlantic winter does to a trench. Your mother lights a candle every night.',
          [{ system: 'conscript', arg: 'Army' }, { flag: 'malvinas_conscript' }],
        ),
      },
      {
        id: 'unfit',
        label: 'Find a doctor to sign you unfit',
        outcomes: [
          {
            chance: 0.5,
            text: 'An old family doctor finds a heart murmur nobody else can hear. You stay home, and carry the relief and the shame around together for years.',
            effects: [
              { stat: 'stress', delta: 5 },
              { stat: 'karma', delta: -2 },
              { flag: 'dodged_malvinas' },
            ],
          },
          {
            chance: 0.5,
            text: 'The army doctor listens to your chest for three seconds and passes you fit. You are on a transport plane the following week.',
            effects: [
              { system: 'conscript', arg: 'Army' },
              { stat: 'stress', delta: 6 },
              { flag: 'malvinas_conscript' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'hist_falklands_1982',
    kind: 'notice',
    category: 'world',
    emoji: '📺',
    ages: [8, 120],
    weight: 40,
    once: true,
    fromYear: 1982,
    toYear: 1982,
    when: (s) => inCountry('ar')(s) && !callUpAge(s),
    text: 'Argentine troops land on the Malvinas, and the Plaza de Mayo fills with cheering crowds. Ten weeks later the war is lost. Six hundred and forty-nine Argentines are dead, many of them teenagers.',
    outcomes: one(
      'The magazines said the country was winning until almost the last day. You never trust the official news quite the same way again, and before long the junta is gone.',
      [
        { stat: 'happiness', delta: -5 },
        { stat: 'stress', delta: 4 },
        { flag: 'remembers_malvinas' },
      ],
    ),
  },
  {
    id: 'hist_argentina_world_cup_1986',
    kind: 'notice',
    category: 'world',
    emoji: '⚽',
    ages: [5, 120],
    weight: 40,
    once: true,
    fromYear: 1986,
    toYear: 1986,
    when: inCountry('ar'),
    text: 'In Mexico, Argentina knock England out with one goal scored by a hand and another that takes a short number ten past half the team. Then they win the whole World Cup.',
    outcomes: one(
      'You will argue about the first goal for the rest of your life, and about the second never, because there is nothing to say. The Obelisk disappears under people.',
      [{ stat: 'happiness', delta: 7 }, { flag: 'saw_mexico_86' }],
    ),
  },
  {
    id: 'hist_corralito_2001',
    kind: 'notice',
    category: 'money',
    emoji: '🏦',
    ages: [18, 120],
    weight: 40,
    once: true,
    fromYear: 2001,
    toYear: 2001,
    when: inCountry('ar'),
    text: 'In December, the government freezes bank accounts to stop a run on the peso. You may withdraw a few hundred a week. People bang pots in the street, and five presidents come and go in a fortnight.',
    outcomes: one(
      'When the peso is finally let go, your savings are worth a fraction of what they were. You start keeping cash in a biscuit tin, and you never quite stop.',
      [
        { wealth: -0.2 },
        { stat: 'stress', delta: 10 },
        { stat: 'happiness', delta: -4 },
        { flag: 'lived_corralito' },
      ],
    ),
  },
  {
    id: 'hist_argentina_world_cup_2022',
    kind: 'notice',
    category: 'world',
    emoji: '🏆',
    ages: [5, 120],
    weight: 40,
    once: true,
    fromYear: 2022,
    toYear: 2022,
    when: inCountry('ar'),
    text: 'Argentina win the World Cup in Qatar after a final against France that goes three goals each, through extra time, to penalties. The country has been holding its breath for thirty-six years.',
    outcomes: one(
      'Millions fill the streets of Buenos Aires for the homecoming, so many that the open-top bus gives up. You cry at a stranger and they cry back.',
      [{ stat: 'happiness', delta: 8 }, { flag: 'saw_qatar_2022' }],
    ),
  },
];
