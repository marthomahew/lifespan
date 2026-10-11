import type { EventDef, OutcomeDef } from '../../engine/events/types';
import type { GameState } from '../../engine/types';
import { atUniversity, hasJob, inSchool, livesAbroad, notInPrison, oddsBy } from './conditions';

/** Living in one of these countries (and not inside, where history waits at the gate). */
const inCountry =
  (...ids: string[]) =>
  (s: GameState): boolean =>
    ids.includes(s.player.country) && notInPrison(s);
const inSlovenia = inCountry('si');
/** Outcome odds: the child's view of a moment, or the grown-up's. */
const asChild = (s: GameState): number => (s.player.age < 18 ? 1 : 0);
const asAdult = (s: GameState): number => (s.player.age < 18 ? 0 : 1);
/** Living in one of these towns, or anywhere else. */
const inTown =
  (...towns: string[]) =>
  (s: GameState): number =>
    towns.includes(s.player.city) ? 1 : 0;
const elsewhere =
  (...towns: string[]) =>
  (s: GameState): number =>
    towns.includes(s.player.city) ? 0 : 1;
const one = (text: string, effects: OutcomeDef['effects']): OutcomeDef[] => [
  { chance: 1, text, effects },
];

const SOCA_VALLEY = ['Bovec', 'Kobarid', 'Tolmin'];
const FLOODED_2023 = [
  'Ravne na Koroškem',
  'Slovenj Gradec',
  'Kamnik',
  'Žalec',
  'Celje',
  'Litija',
  'Domžale',
  'Medvode',
];

/**
 * Slovenia, from the Yugoslav years to now: the history pinned to its year, and the
 * everyday rituals of a small country with a mountain on its coat of arms.
 */
export const SLOVENIA_EVENTS: EventDef[] = [
  // ── History ───────────────────────────────────────────────────────────────
  {
    id: 'si_friuli_quake_1976',
    kind: 'notice',
    category: 'world',
    emoji: '🏚️',
    ages: [3, 120],
    weight: 40,
    once: true,
    fromYear: 1976,
    toYear: 1976,
    when: inSlovenia,
    text: 'On a warm May evening the ground rolls for nearly a minute. The earthquake is centred over the border in Friuli, but in the Soča valley chimneys fall, church towers crack, and the village of Breginj is all but lost.',
    outcomes: [
      {
        chance: inTown(...SOCA_VALLEY),
        text: 'Your family sleeps in the car and then in a tent in the orchard for most of the summer. When the September shocks come, nobody is surprised any more, just tired.',
        effects: [
          { stat: 'stress', delta: 7 },
          { stat: 'happiness', delta: -4 },
          { flag: 'si_quake_1976' },
        ],
      },
      {
        chance: elsewhere(...SOCA_VALLEY),
        text: 'The lampshade swings and the glasses chatter in the cupboard. Within a week there are collection boxes at every factory gate for the families by the Soča.',
        effects: [
          { stat: 'stress', delta: 3 },
          { stat: 'karma', delta: 1 },
          { flag: 'si_quake_1976' },
        ],
      },
    ],
  },
  {
    id: 'si_tito_dies_1980',
    kind: 'notice',
    category: 'world',
    emoji: '📻',
    ages: [0, 120],
    weight: 40,
    once: true,
    fromYear: 1980,
    toYear: 1980,
    when: inSlovenia,
    text: 'On the fourth of May, after months of bulletins, the radio announces that Tito has died at the clinical centre in Ljubljana. A football match in Split stops mid-game and the players weep on the pitch.',
    outcomes: [
      {
        chance: (s) => (s.player.age < 6 ? 1 : 0),
        text: 'You are far too young to remember it, but for the rest of your life older relatives will tell you exactly where they were standing when the news came.',
        effects: [{ flag: 'si_tito_1980' }],
      },
      {
        chance: (s) => (s.player.age >= 6 && s.player.age < 18 ? 1 : 0),
        text: 'School is all wreaths and black ribbons for a week. Your teacher cries during roll call, which frightens the class more than anything on the news.',
        effects: [{ stat: 'stress', delta: 3 }, { flag: 'si_tito_1980' }],
      },
      {
        chance: asAdult,
        text: 'The whole country watches the funeral, kings and presidents walking behind the coffin. Nobody says aloud what everyone is thinking: who holds it all together now?',
        effects: [{ stat: 'stress', delta: 4 }, { flag: 'si_tito_1980' }],
      },
    ],
  },
  {
    id: 'si_jbtz_trial_1988',
    kind: 'notice',
    category: 'world',
    emoji: '⚖️',
    ages: [7, 120],
    weight: 40,
    once: true,
    fromYear: 1988,
    toYear: 1988,
    when: inSlovenia,
    text: 'Four young men, three of them journalists, are put on trial by a military court in Ljubljana, and the proceedings are held in Serbo-Croatian rather than Slovene. Tens of thousands gather in protest on Congress Square.',
    outcomes: [
      {
        chance: asChild,
        text: 'You do not follow the details, but your parents start talking about politics at dinner in a new voice, low and fierce, and they stop telling you to keep quiet about it.',
        effects: [{ stat: 'smarts', delta: 1 }, { flag: 'si_jbtz_1988' }],
      },
      {
        chance: asAdult,
        text: 'You stand in the square under the plane trees with tens of thousands of strangers, and sign a petition for the defence of human rights. It does not feel like a protest so much as a country clearing its throat.',
        effects: [
          { stat: 'karma', delta: 2 },
          { stat: 'stress', delta: 3 },
          { flag: 'si_jbtz_1988' },
        ],
      },
    ],
  },
  {
    id: 'si_may_declaration_1989',
    kind: 'notice',
    category: 'world',
    emoji: '📜',
    ages: [8, 120],
    weight: 40,
    once: true,
    fromYear: 1989,
    toYear: 1989,
    when: inSlovenia,
    text: 'In May a poet reads a short declaration to a packed Congress Square: the Slovene nation wants a sovereign state of its own. Then people queue to sign it, in their thousands, in every town.',
    outcomes: [
      {
        chance: asChild,
        text: 'Your mother signs it at a folding table outside the post office and lets you hold the pen afterwards. You are not sure what a sovereign state is, but it sounds big.',
        effects: [{ stat: 'happiness', delta: 2 }, { flag: 'si_may_1989' }],
      },
      {
        chance: asAdult,
        text: 'You sign in your best handwriting. On the way home you notice that nobody on the bus is talking about anything else, and that nobody is whispering.',
        effects: [{ stat: 'happiness', delta: 3 }, { flag: 'si_may_1989' }],
      },
    ],
  },
  {
    id: 'si_plebiscite_1990',
    kind: 'choice',
    category: 'world',
    emoji: '🗳️',
    ages: [18, 120],
    weight: 40,
    once: true,
    fromYear: 1990,
    toYear: 1990,
    when: inSlovenia,
    text: 'Two days before Christmas, the country votes on one question: should Slovenia become an independent and sovereign state? The polling station in the school gym smells of floor wax and wet coats.',
    choices: [
      {
        id: 'yes',
        label: 'Vote za, yes',
        outcomes: one(
          'Turnout is over ninety per cent and the yes vote is a landslide, 88.5 per cent of everyone entitled to vote. Your Christmas dinner turns into a long, loud argument about what happens next.',
          [
            { stat: 'happiness', delta: 6 },
            { flag: 'si_voted_plebiscite' },
            { flag: 'si_independence_yes' },
          ],
        ),
      },
      {
        id: 'no',
        label: 'Vote proti, against',
        outcomes: one(
          'You vote against, out of caution more than anything. You lose by a mile. Over the potica, your brother-in-law calls you a pessimist, and you call him an optimist, and neither of you means it kindly.',
          [{ stat: 'stress', delta: 3 }, { flag: 'si_voted_plebiscite' }],
        ),
      },
      {
        id: 'skip',
        label: 'Stay home with the radio',
        outcomes: one(
          'You listen to the results in your slippers. Almost everyone you know voted, and for years afterwards you keep quiet whenever the subject comes up.',
          [{ stat: 'happiness', delta: -2 }],
        ),
      },
    ],
  },
  {
    id: 'si_plebiscite_child_1990',
    kind: 'notice',
    category: 'world',
    emoji: '🗳️',
    ages: [5, 17],
    weight: 40,
    once: true,
    fromYear: 1990,
    toYear: 1990,
    when: inSlovenia,
    text: 'Your parents go to vote on a Sunday just before Christmas, dressed as if for church. The question on the paper is whether Slovenia should become its own country.',
    outcomes: one(
      'They come home pink-cheeked and pleased with themselves. At dinner, your grandfather raises a glass of juice to you and says you will grow up in a different country without ever moving house.',
      [{ stat: 'happiness', delta: 3 }, { flag: 'si_independence_child' }],
    ),
  },
  {
    id: 'si_independence_war_1991',
    kind: 'choice',
    category: 'military',
    emoji: '🇸🇮',
    ages: [18, 60],
    weight: 40,
    once: true,
    fromYear: 1991,
    toYear: 1991,
    when: inSlovenia,
    text: 'Slovenia declares independence on the twenty-fifth of June. A day after the flag goes up in Republic Square, army tanks roll out of their barracks towards the border posts. The Territorial Defence is calling up volunteers.',
    choices: [
      {
        id: 'volunteer',
        label: 'Report to the Territorial Defence',
        outcomes: [
          {
            chance: 0.85,
            text: 'You spend ten days at a roadblock built from lorries and gravel trucks, eating sandwiches the neighbours bring in baskets. When the ceasefire comes, you sleep for a day and a half.',
            effects: [
              { stat: 'stress', delta: 8 },
              { stat: 'karma', delta: 4 },
              { stat: 'discipline', delta: 4 },
              { flag: 'si_ten_day_war_veteran' },
            ],
            success: true,
          },
          {
            chance: 0.15,
            text: 'A shell lands near your position on the fourth day, and you wake up in a field hospital with a bandaged leg and a medal you will never wear in public.',
            effects: [
              { injury: 12 },
              { stat: 'stress', delta: 10 },
              { stat: 'karma', delta: 4 },
              { flag: 'si_ten_day_war_veteran' },
            ],
          },
        ],
      },
      {
        id: 'home',
        label: 'Help with civil protection at home',
        outcomes: one(
          'You tape the windows, stock the cellar with jars, and run messages for the civil protection office on your bicycle. After ten days it is over, and you are amazed how much bread one town can bake.',
          [{ stat: 'stress', delta: 5 }, { stat: 'karma', delta: 2 }, { flag: 'si_ten_day_war' }],
        ),
      },
      {
        id: 'away',
        label: 'Take the family to relatives in the hills',
        outcomes: one(
          'You sit out the war at an aunt’s farm above the valley, listening to jets you cannot see. When you drive home, the border signs have already been repainted.',
          [{ stat: 'stress', delta: 4 }, { flag: 'si_ten_day_war' }],
        ),
      },
    ],
  },
  {
    id: 'si_ten_day_war_child_1991',
    kind: 'notice',
    category: 'world',
    emoji: '🚨',
    ages: [3, 17],
    weight: 40,
    once: true,
    fromYear: 1991,
    toYear: 1991,
    when: inSlovenia,
    text: 'In the last days of June the air-raid sirens go off for real. Your family carries blankets and a radio down to the cellar, between the potatoes and the jars of pickled peppers.',
    outcomes: one(
      'Ten days later it is over. You remember the sirens and the jets, and also, a little guiltily, that it was the best game of cards your family ever played.',
      [{ stat: 'stress', delta: 5 }, { flag: 'si_ten_day_war' }],
    ),
  },
  {
    id: 'si_jna_deserter_1991',
    kind: 'choice',
    category: 'military',
    emoji: '🪖',
    ages: [18, 21],
    weight: 40,
    once: true,
    fromYear: 1991,
    toYear: 1991,
    when: (s) => inSlovenia(s) && s.player.gender === 'male' && !s.military?.active,
    text: 'You are doing national service in the Yugoslav army at a barracks hundreds of kilometres from home when the news comes that Slovenia has declared independence. The officers have stopped looking you in the eye.',
    choices: [
      {
        id: 'desert',
        label: 'Slip away and make for home',
        outcomes: [
          {
            chance: 0.8,
            text: 'You walk out in borrowed civilian clothes, take three trains and a lorry, and arrive at your mother’s door unshaven at two in the morning. She feeds you before she lets you speak.',
            effects: [
              { stat: 'happiness', delta: 8 },
              { stat: 'stress', delta: 6 },
              { flag: 'si_left_jna' },
            ],
            success: true,
          },
          {
            chance: 0.2,
            text: 'You are caught at a station and spend a miserable fortnight in the guardhouse before the agreement sends all Slovene conscripts home anyway.',
            effects: [
              { stat: 'stress', delta: 9 },
              { stat: 'happiness', delta: -4 },
              { flag: 'si_left_jna' },
            ],
          },
        ],
      },
      {
        id: 'wait',
        label: 'Keep your head down and wait',
        outcomes: one(
          'You wait. By late summer the Slovene boys are released, and parents arrive at the gates in borrowed cars to collect them. Your father hugs you longer than he has since you were small.',
          [{ stat: 'stress', delta: 5 }, { flag: 'si_left_jna' }],
        ),
      },
    ],
  },
  {
    id: 'si_tolar_1991',
    kind: 'notice',
    category: 'money',
    emoji: '💵',
    ages: [7, 120],
    weight: 40,
    once: true,
    fromYear: 1991,
    toYear: 1991,
    when: inSlovenia,
    text: 'In October the dinar stops being money here. The new tolar arrives first as plain provisional notes with Triglav printed on them, swapped one for one at the bank.',
    outcomes: [
      {
        chance: asChild,
        text: 'Your grandmother keeps a bundle of dinars in the sideboard just in case. You keep one of the new notes in your pencil case and show it to anyone who will look.',
        effects: [{ stat: 'happiness', delta: 2 }, { flag: 'si_saw_tolar' }],
      },
      {
        chance: asAdult,
        text: 'You stand in a long queue to change your savings, then spend the winter learning what anything costs all over again. The coffee at least is the same.',
        effects: [{ stat: 'stress', delta: 2 }, { flag: 'si_saw_tolar' }],
      },
    ],
  },
  {
    id: 'si_recognition_1992',
    kind: 'notice',
    category: 'world',
    emoji: '🌍',
    ages: [8, 120],
    weight: 40,
    once: true,
    fromYear: 1992,
    toYear: 1992,
    when: inSlovenia,
    text: 'In the middle of January the countries of the European Community recognise Slovenia, one after another, and in May it takes a seat at the United Nations. The new flag goes up outside a building in New York.',
    outcomes: one(
      'The evening news reads out the list of countries like football results. Your neighbour sets off a firework left over from New Year and is told off by his wife, then joined by her.',
      [{ stat: 'happiness', delta: 4 }, { flag: 'si_recognised_1992' }],
    ),
  },
  {
    id: 'si_posocje_quake_1998',
    kind: 'notice',
    category: 'world',
    emoji: '🏔️',
    ages: [5, 120],
    weight: 40,
    once: true,
    fromYear: 1998,
    toYear: 1998,
    when: inSlovenia,
    text: 'On Easter Sunday a strong earthquake shakes the mountains above Bovec. Rockfalls thunder down the slopes of Krn, and the old stone houses of the upper Soča valley split along their seams.',
    outcomes: [
      {
        chance: inTown(...SOCA_VALLEY),
        text: 'The Easter ham ends up on the kitchen floor and your family ends up in a prefab container for two years. The neighbours help rebuild every wall by hand, and they argue about all of them.',
        effects: [
          { stat: 'stress', delta: 8 },
          { money: -1500 },
          { stat: 'karma', delta: 2 },
          { flag: 'si_quake_1998' },
        ],
      },
      {
        chance: elsewhere(...SOCA_VALLEY),
        text: 'You feel it as a long shudder through the dinner table. On the news, the mountain has a fresh pale scar where the rock came away, as if someone had scratched it.',
        effects: [{ stat: 'stress', delta: 2 }, { flag: 'si_quake_1998' }],
      },
    ],
  },
  {
    id: 'si_eu_night_2004',
    kind: 'choice',
    category: 'world',
    emoji: '🇪🇺',
    ages: [14, 120],
    weight: 40,
    once: true,
    fromYear: 2004,
    toYear: 2004,
    when: inSlovenia,
    text: 'Slovenia joined NATO in March, and at midnight on the last night of April it joins the European Union. In Nova Gorica, the fence across the square at the old Transalpina station is coming down.',
    choices: [
      {
        id: 'border',
        label: 'Party on the border square',
        outcomes: one(
          'At midnight you stand with one foot in Italy and one in Slovenia while fireworks go up over Gorizia. A stranger in a scarf of stars kisses you on both cheeks and shouts in a language you do not know.',
          [{ stat: 'happiness', delta: 7 }, { status: 'friend' }, { flag: 'si_eu_2004' }],
        ),
      },
      {
        id: 'bonfire',
        label: 'Light a May Day bonfire on the hill',
        outcomes: one(
          'The kres on the hill above town burns through the night as it does every year, only tonight someone has stuck a little blue flag on a pole beside it. The sparks go up like a toast.',
          [{ stat: 'happiness', delta: 5 }, { flag: 'si_eu_2004' }],
        ),
      },
      {
        id: 'sleep',
        label: 'Sleep through it',
        outcomes: one(
          'You wake up a European, which feels exactly like waking up the day before, with slightly louder neighbours.',
          [{ stat: 'stress', delta: -2 }, { flag: 'si_eu_2004' }],
        ),
      },
    ],
  },
  {
    id: 'si_euro_2007',
    kind: 'notice',
    category: 'money',
    emoji: '💶',
    ages: [6, 120],
    weight: 40,
    once: true,
    fromYear: 2007,
    toYear: 2007,
    when: inSlovenia,
    text: 'On New Year’s Day, Slovenia becomes the first of the new members to use the euro: 239.64 tolars each. The coins are Slovene on one side, with Prešeren on the two, Triglav on the fifty cents, and a stork on the smallest.',
    outcomes: [
      {
        chance: asChild,
        text: 'You start collecting coins from other countries in a jam jar. The stork cents are worth almost nothing, which does not stop you lining them up on the windowsill.',
        effects: [{ stat: 'happiness', delta: 3 }, { flag: 'si_saw_euro' }],
      },
      {
        chance: asAdult,
        text: 'For years afterwards, you multiply every price by 240 in your head before deciding whether it is outrageous. It nearly always is.',
        effects: [{ stat: 'stress', delta: 2 }, { flag: 'si_saw_euro' }],
      },
    ],
  },
  {
    id: 'si_eu_presidency_2008',
    kind: 'notice',
    category: 'world',
    emoji: '🏛️',
    ages: [14, 120],
    weight: 40,
    once: true,
    fromYear: 2008,
    toYear: 2008,
    when: inSlovenia,
    text: 'For the first half of the year, Slovenia chairs the Council of the European Union, the first of the newer members to do it. Motorcades with tinted windows become a normal part of the Ljubljana traffic.',
    outcomes: one(
      'You find it oddly touching that a country you could cross in an afternoon is running the meetings for half a billion people. You get stuck behind a motorcade twice and forgive it both times.',
      [{ stat: 'happiness', delta: 2 }, { flag: 'si_presidency_2008' }],
    ),
  },
  {
    id: 'si_uprising_2012',
    kind: 'choice',
    category: 'world',
    emoji: '📣',
    ages: [16, 120],
    weight: 40,
    once: true,
    fromYear: 2012,
    toYear: 2012,
    when: inSlovenia,
    text: 'It starts in Maribor over a wave of speed-camera fines and turns into something bigger: crowds in every city chanting that the politicians are finished. Gotof je! is painted on bedsheets from balconies.',
    choices: [
      {
        id: 'march',
        label: 'Join the march',
        outcomes: one(
          'You bang a saucepan with a wooden spoon outside the parliament until your arm aches. It is cold and loud and mostly peaceful, and by the next spring the government has fallen.',
          [
            { stat: 'happiness', delta: 4 },
            { stat: 'karma', delta: 2 },
            { stat: 'stress', delta: 2 },
            { flag: 'si_protested_2012' },
          ],
        ),
      },
      {
        id: 'watch',
        label: 'Follow it on the news',
        outcomes: one(
          'You watch from the sofa and agree with nearly everything the banners say, which is a strange sort of loneliness.',
          [{ stat: 'stress', delta: 2 }],
        ),
      },
    ],
  },
  {
    id: 'si_green_capital_2016',
    kind: 'notice',
    category: 'world',
    emoji: '🌳',
    ages: [8, 120],
    weight: 30,
    once: true,
    fromYear: 2016,
    toYear: 2016,
    when: inSlovenia,
    text: 'Ljubljana is named European Green Capital for the year. The centre has already been handed back to pedestrians and bicycles, and little electric buggies ferry grandmothers along the river for free.',
    outcomes: [
      {
        chance: inTown('Ljubljana'),
        text: 'You start cycling to work along the Ljubljanica and arrive smug and slightly damp. A colleague from abroad asks where all the cars went, and you shrug as if it was your idea.',
        effects: [
          { stat: 'health', delta: 3 },
          { stat: 'happiness', delta: 2 },
          { flag: 'si_green_2016' },
        ],
      },
      {
        chance: elsewhere('Ljubljana'),
        text: 'On a day trip to the capital, you drink from a public fountain, sit by the river and wonder, briefly, why your own town still has a car park where its square should be.',
        effects: [{ stat: 'happiness', delta: 2 }, { flag: 'si_green_2016' }],
      },
    ],
  },
  {
    id: 'si_eurobasket_2017',
    kind: 'notice',
    category: 'world',
    emoji: '🏀',
    ages: [6, 120],
    weight: 40,
    once: true,
    fromYear: 2017,
    toYear: 2017,
    when: inSlovenia,
    text: 'In September, Slovenia wins the European basketball championship in Istanbul, beating Serbia in the final. Goran Dragić scores 35, and an eighteen-year-old called Luka Dončić plays like a veteran.',
    outcomes: [
      {
        chance: asChild,
        text: 'Every hoop in the neighbourhood has a queue the next morning. You practise step-back shots until the street light comes on and your mother calls you in twice.',
        effects: [
          { stat: 'happiness', delta: 6 },
          { skill: 'athletics', delta: 2 },
          { flag: 'si_eurobasket_2017' },
        ],
      },
      {
        chance: asAdult,
        text: 'Ljubljana’s Congress Square fills with tens of thousands of people in green for the team’s homecoming. You lose your voice and gain a sunburn.',
        effects: [{ stat: 'happiness', delta: 6 }, { flag: 'si_eurobasket_2017' }],
      },
    ],
  },
  {
    id: 'si_tour_2020',
    kind: 'notice',
    category: 'world',
    emoji: '🚴',
    ages: [6, 120],
    weight: 40,
    once: true,
    fromYear: 2020,
    toYear: 2020,
    when: inSlovenia,
    text: 'On the second-to-last day of the Tour de France, in a mountain time trial, Tadej Pogačar overturns Primož Roglič’s lead. Two Slovenians finish first and second in Paris, and the winner turns twenty-two the next day.',
    outcomes: one(
      'You watch the time trial through your fingers and do not know whom to cheer for, so you cheer for both. By Sunday every child on a bicycle in {city} is wearing yellow.',
      [{ stat: 'happiness', delta: 5 }, { flag: 'si_tour_2020' }],
    ),
  },
  {
    id: 'si_floods_2023',
    kind: 'choice',
    category: 'world',
    emoji: '🌊',
    ages: [16, 120],
    weight: 40,
    once: true,
    fromYear: 2023,
    toYear: 2023,
    when: inSlovenia,
    text: 'In early August a month of rain falls in a day. Rivers in Koroška, the Savinja valley and around Kamnik tear away bridges and houses. It is the worst natural disaster since independence.',
    choices: [
      {
        id: 'shovel',
        label: 'Grab a shovel and go help',
        outcomes: [
          {
            chance: inTown(...FLOODED_2023),
            text: 'Your own ground floor is under a metre of mud, and then the volunteers arrive: strangers with buckets, firemen from three valleys over. In a week your kitchen is a kitchen again.',
            effects: [
              { money: -2500 },
              { stat: 'stress', delta: 8 },
              { stat: 'karma', delta: 3 },
              { flag: 'si_floods_2023' },
            ],
          },
          {
            chance: elsewhere(...FLOODED_2023),
            text: 'You spend three weekends shovelling mud out of strangers’ houses. Someone’s grandmother feeds the whole street from a camping stove and refuses all help with the washing up.',
            effects: [
              { stat: 'karma', delta: 5 },
              { stat: 'health', delta: -2 },
              { stat: 'happiness', delta: 3 },
              { flag: 'si_floods_2023' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'donate',
        label: 'Send money to the relief fund',
        outcomes: one(
          'You give what you can. The appeal raises an astonishing amount for a country of two million, and the list of donors on the news goes on for a long time.',
          [{ money: -300 }, { stat: 'karma', delta: 3 }, { flag: 'si_floods_2023' }],
        ),
      },
    ],
  },

  // ── Growing up ────────────────────────────────────────────────────────────
  {
    id: 'si_yugo_childhood',
    kind: 'choice',
    category: 'family',
    emoji: '🚲',
    ages: [6, 12],
    weight: 10,
    once: true,
    fromYear: 1960,
    toYear: 1990,
    when: inSlovenia,
    text: 'Your uncle has come back from the factory with a new Rog bicycle, red as a fire engine, and a crate of Cockta for the summer. He says one of them is for you, and he is not telling which.',
    choices: [
      {
        id: 'bike',
        label: 'Ask for the bicycle',
        outcomes: one(
          'The bicycle is yours. You ride it until the chain falls off, fix it with your father’s pliers, and ride it again. Your knees are a map of the village for years.',
          [
            { stat: 'happiness', delta: 6 },
            { stat: 'health', delta: 3 },
            { skill: 'athletics', delta: 2 },
          ],
        ),
      },
      {
        id: 'drink',
        label: 'Ask for the Cockta',
        outcomes: one(
          'You get the whole crate, which is the wrong answer and the right one. You ration it all summer, a bottle on Sundays, and nothing will ever taste quite that fizzy again.',
          [
            { stat: 'happiness', delta: 5 },
            { stat: 'discipline', delta: 2 },
          ],
        ),
      },
    ],
  },
  {
    id: 'si_pioneer_1st_grade',
    kind: 'notice',
    category: 'school',
    emoji: '🧢',
    ages: [6, 8],
    weight: 12,
    once: true,
    fromYear: 1950,
    toYear: 1990,
    when: (s) => inSlovenia(s) && inSchool(s),
    text: 'Your whole first-grade class is sworn in as pioneers, in navy caps with a red star and red scarves knotted under your chins. You recite the oath in unison and mostly in the right order.',
    outcomes: one(
      'You wear the scarf home and refuse to take it off for dinner. Your grandmother, who remembers older uniforms, irons it for you without a word.',
      [{ stat: 'happiness', delta: 3 }, { flag: 'si_pioneer' }],
    ),
  },
  {
    id: 'si_ana_desetnica',
    kind: 'notice',
    category: 'family',
    emoji: '📖',
    ages: [5, 10],
    weight: 8,
    once: true,
    bind: { gran: { role: 'grandparent' } },
    when: inSlovenia,
    text: '{gran.Rel} tells you the old story of Ana Desetnica, the tenth daughter who had to leave home and wander the world, never staying anywhere more than a night.',
    outcomes: one(
      'You count your cousins on your fingers to make sure none of them is a tenth daughter. {gran.first} laughs and says the world was harder then, and so were the stories.',
      [
        { stat: 'smarts', delta: 2 },
        { rel: 'gran', delta: 4, memory: 'the evening of Ana Desetnica' },
      ],
    ),
  },
  {
    id: 'si_dragon_bridge',
    kind: 'notice',
    category: 'travel',
    emoji: '🐉',
    ages: [5, 12],
    weight: 8,
    once: true,
    when: inSlovenia,
    text: 'On a trip to Ljubljana you are introduced to the copper dragons on the bridge, green with age. Your father explains that Jason and the Argonauts killed the first one in the marshes nearby.',
    outcomes: one(
      'You decide the dragons are on your side. For years, every drawing you make has one in the corner, guarding something.',
      [
        { stat: 'happiness', delta: 3 },
        { skill: 'art', delta: 1 },
      ],
    ),
  },
  {
    id: 'si_malica',
    kind: 'notice',
    category: 'school',
    emoji: '🥪',
    ages: [6, 14],
    weight: 6,
    cooldownYears: 4,
    when: (s) => inSlovenia(s) && inSchool(s),
    text: 'At ten the bell rings for malica. Today it is a bread roll, a slice of salami, a hard-boiled egg and a cup of tea that tastes faintly of the urn it came from.',
    outcomes: [
      {
        chance: 0.6,
        text: 'You trade your egg for half a chocolate bar with the boy behind you. It is the best deal you will make all year.',
        effects: [{ stat: 'happiness', delta: 2 }],
      },
      {
        chance: 0.4,
        text: 'The jam on the bread is the good apricot kind, and the dinner lady gives you a second slice because you said thank you. You learn something about manners.',
        effects: [
          { stat: 'happiness', delta: 2 },
          { stat: 'karma', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'si_sola_v_naravi',
    kind: 'choice',
    category: 'school',
    emoji: '🏊',
    ages: [9, 12],
    weight: 10,
    once: true,
    when: (s) => inSlovenia(s) && inSchool(s),
    text: 'Šola v naravi: your class goes away together for a week, to the coast to learn to swim properly. Bunk beds, a teacher with a whistle, and nobody’s parents for five whole days.',
    choices: [
      {
        id: 'dive',
        label: 'Throw yourself into it',
        outcomes: [
          {
            chance: 0.75,
            text: 'You come home with a swimming certificate, a tan in the shape of goggles, and a best friend from the next village over.',
            effects: [
              { skill: 'athletics', delta: 3 },
              { stat: 'happiness', delta: 6 },
              { status: 'friend' },
            ],
            success: true,
          },
          {
            chance: 0.25,
            text: 'You swallow a good part of the Adriatic on the first day, but by Friday you can swim a length. The teacher shakes your hand like you have won something.',
            effects: [
              { skill: 'athletics', delta: 2 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'homesick',
        label: 'Phone home every evening',
        outcomes: one(
          'You queue for the hostel telephone every night to tell your mother you are fine and miserable. On the last day you cry because it is over.',
          [
            { stat: 'happiness', delta: 2 },
            { stat: 'stress', delta: 2 },
          ],
        ),
      },
    ],
  },
  {
    id: 'si_postojna_olm',
    kind: 'choice',
    category: 'school',
    emoji: '🦎',
    ages: [7, 12],
    weight: 8,
    once: true,
    when: (s) => inSlovenia(s) && inSchool(s),
    text: 'The school trip goes to Postojna Cave. A little train carries you deep into the hill, past stone curtains and dripping columns, to a tank where a pale, blind olm lies very still. The guide calls it the human fish.',
    choices: [
      {
        id: 'stare',
        label: 'Stay by the tank as long as you can',
        outcomes: one(
          'The guide tells you the olm can live a hundred years and go years without eating. You go home and announce that you will be a cave scientist. Your parents say good, it is cool down there.',
          [{ stat: 'smarts', delta: 3 }, { flag: 'si_loves_olm' }],
        ),
      },
      {
        id: 'echo',
        label: 'Test the echo in the big hall',
        outcomes: one(
          'Your shout bounces round the Concert Hall for a surprisingly long time. So does the teacher’s, afterwards.',
          [
            { stat: 'happiness', delta: 3 },
            { stat: 'discipline', delta: -1 },
          ],
        ),
      },
    ],
  },
  {
    id: 'si_grandma_garden',
    kind: 'choice',
    category: 'family',
    emoji: '🥬',
    ages: [5, 14],
    weight: 8,
    cooldownYears: 4,
    bind: { gran: { role: 'grandparent', gender: 'female' } },
    when: inSlovenia,
    text: '{gran.Rel} needs help in the vrt. The beans need staking, the potatoes have beetles, and there is a row of lettuces she wants you to admire properly.',
    choices: [
      {
        id: 'help',
        label: 'Pick beetles into a jar',
        outcomes: one(
          'You collect a jar of stripy potato beetles and are paid in a slice of apple strudel the size of your head. {gran.first} says you have good hands.',
          [
            { stat: 'happiness', delta: 3 },
            { skill: 'cooking', delta: 1 },
            { rel: 'gran', delta: 6, memory: 'the potato beetle summer' },
          ],
        ),
      },
      {
        id: 'hide',
        label: 'Hide in the hayloft with a comic',
        outcomes: one(
          'She finds you within ten minutes, because she has been finding children in that hayloft for fifty years. You do the beans anyway.',
          [
            { stat: 'discipline', delta: 1 },
            { rel: 'gran', delta: 2, memory: 'the hayloft hiding spot' },
          ],
        ),
      },
    ],
  },
  {
    id: 'si_kozolec',
    kind: 'notice',
    category: 'family',
    emoji: '🌾',
    ages: [6, 70],
    weight: 5,
    once: true,
    when: inSlovenia,
    text: 'There is a kozolec at the edge of the family field, a great wooden hayrack with a roof, older than anyone living. Every summer the hay goes up between its slats to dry in the wind.',
    outcomes: [
      {
        chance: asChild,
        text: 'You climb to the top rung, against every instruction, and see the whole valley laid out like a tablecloth. Coming down takes much longer.',
        effects: [
          { stat: 'happiness', delta: 3 },
          { stat: 'health', delta: 1 },
        ],
      },
      {
        chance: asAdult,
        text: 'You re-roof it with new shingles over a long weekend. A foreign cyclist stops to photograph it and you stand beside it, pretending not to be proud.',
        effects: [{ stat: 'happiness', delta: 3 }, { money: -400 }],
      },
    ],
  },
  {
    id: 'si_birma_gift',
    kind: 'choice',
    category: 'family',
    emoji: '⌚',
    ages: [12, 15],
    weight: 8,
    once: true,
    when: inSlovenia,
    text: 'Your birma is next month, and your sponsor, your godparent for confirmation, has asked what you would like as a gift. By tradition it is a wristwatch. By the playground, it is something much bigger.',
    choices: [
      {
        id: 'watch',
        label: 'Ask for a proper watch',
        outcomes: one(
          'The watch is heavy and ticks loudly and is engraved on the back with your name. You will still have it in forty years, which is the point.',
          [{ stat: 'happiness', delta: 4 }, { flag: 'si_birma_watch' }],
        ),
      },
      {
        id: 'big',
        label: 'Hint heavily about a new bicycle',
        outcomes: [
          {
            chance: 0.5,
            text: 'Your sponsor takes the hint. After the mass you ride the bicycle round the churchyard in your good shoes while the photographer despairs.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'health', delta: 1 },
            ],
          },
          {
            chance: 0.5,
            text: 'You get a watch anyway, plus a talk about what confirmation is for. You blush through the whole lunch.',
            effects: [
              { stat: 'happiness', delta: 1 },
              { stat: 'karma', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'si_preseren_day',
    kind: 'choice',
    category: 'school',
    emoji: '🪶',
    ages: [8, 18],
    weight: 6,
    cooldownYears: 4,
    when: (s) => inSlovenia(s) && inSchool(s),
    text: 'The eighth of February is Prešeren Day, the culture holiday, and your class is putting on a recital. Someone has to recite the seventh verse of Zdravljica, the one that became the anthem.',
    choices: [
      {
        id: 'recite',
        label: 'Volunteer to recite it',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.5, 0.01),
            text: 'You get through it without a stumble, about the day when every nation is free and neighbours are friends, not devils. The headteacher dabs her eye.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { stat: 'happiness', delta: 4 },
              { skill: 'writing', delta: 1 },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'Your mind empties after the fourth line. The front row whispers the rest to you, and the audience claps extra hard out of sympathy.',
            effects: [
              { stat: 'stress', delta: 3 },
              { stat: 'happiness', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'museum',
        label: 'Skip it and visit a free museum',
        outcomes: one(
          'Museums are free on Prešeren Day, so you spend the afternoon looking at a Roman tombstone and a very old canoe. It is more interesting than you admit at dinner.',
          [{ stat: 'smarts', delta: 2 }],
        ),
      },
    ],
  },
  {
    id: 'si_matura',
    kind: 'choice',
    category: 'school',
    emoji: '📝',
    ages: [17, 19],
    weight: 12,
    once: true,
    when: (s) => inSlovenia(s) && inSchool(s),
    text: 'The matura is a month away: the exam that decides which faculty will have you. The Slovene essay is on a set novel you have mostly read the back cover of.',
    choices: [
      {
        id: 'study',
        label: 'Read the whole novel twice',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.55, 0.008),
            text: 'You write five pages with quotations and a conclusion, and your results come back in July with a number you could frame. Your parents tell the neighbours before you do.',
            effects: [
              { stat: 'smarts', delta: 4 },
              { stat: 'happiness', delta: 5 },
              { flag: 'si_matura_excellent' },
            ],
            success: true,
          },
          {
            chance: 0.35,
            text: 'You pass respectably, if not gloriously. In the end the novel stays with you more than the grade does.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { stat: 'stress', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'wing',
        label: 'Trust your instincts and the summary',
        outcomes: [
          {
            chance: 0.45,
            text: 'You bluff with surprising confidence about symbolism and get a grade nobody expected, least of all you.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'discipline', delta: -2 },
            ],
          },
          {
            chance: 0.55,
            text: 'The essay question is about a minor character you did not know existed. You pass, just, and resit the maths in the autumn to be safe.',
            effects: [
              { stat: 'stress', delta: 5 },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'si_cetvorka',
    kind: 'choice',
    category: 'school',
    emoji: '💃',
    ages: [17, 19],
    weight: 8,
    once: true,
    bind: { mate: { role: 'classmate' } },
    when: (s) => inSlovenia(s) && inSchool(s),
    text: 'In May, final-year students all over the country dance the četvorka, an old quadrille, in their town squares at the same moment. {mate.first} needs a partner for the rehearsals.',
    choices: [
      {
        id: 'dance',
        label: 'Partner up with {mate.first}',
        outcomes: one(
          'You step on each other for three weeks, and then on the day it suddenly works, a whole square of you turning in time. The two of you laugh about it for years.',
          [
            { stat: 'happiness', delta: 5 },
            { rel: 'mate', delta: 8, memory: 'the četvorka in the square' },
          ],
        ),
      },
      {
        id: 'watch',
        label: 'Watch from the fountain',
        outcomes: one(
          'You film nothing and remember everything: hundreds of nervous eighteen-year-olds in their good clothes, and the brass band slightly behind them.',
          [{ stat: 'happiness', delta: 1 }],
        ),
      },
    ],
  },
  {
    id: 'si_studentsko_delo',
    kind: 'choice',
    category: 'money',
    emoji: '🧾',
    ages: [16, 26],
    weight: 9,
    cooldownYears: 3,
    when: (s) => inSlovenia(s) && (inSchool(s) || atUniversity(s)),
    text: 'The student service has a board full of summer jobs, paid through a referral slip and topped up with very little tax. You have one free month and three offers.',
    choices: [
      {
        id: 'warehouse',
        label: 'Night shifts in a warehouse',
        outcomes: one(
          'You learn to drive a pallet jack and to sleep in daylight. The money is good and you spend it on nothing in particular, which is its own kind of luxury.',
          [
            { money: 1200, kind: 'wage' },
            { stat: 'health', delta: -1 },
            { stat: 'discipline', delta: 2 },
          ],
        ),
      },
      {
        id: 'icecream',
        label: 'An ice cream stand in Portorož',
        outcomes: one(
          'You scoop pistachio for tourists in four languages and swim off the concrete pier on your break. Your forearm grows noticeably stronger than the other one.',
          [
            { money: 800, kind: 'wage' },
            { stat: 'happiness', delta: 5 },
          ],
        ),
      },
      {
        id: 'strawberries',
        label: 'Pick strawberries near Ptuj',
        outcomes: one(
          'Your back hurts by ten every morning, and you eat about one in five. The farmer’s wife pretends not to notice and sends you home with a tray.',
          [
            { money: 600, kind: 'wage' },
            { stat: 'health', delta: 2 },
          ],
        ),
      },
    ],
  },

  // ── Mountains, snow and sport ─────────────────────────────────────────────
  {
    id: 'si_triglav',
    kind: 'choice',
    category: 'travel',
    emoji: '🏔️',
    ages: [10, 60],
    weight: 10,
    once: true,
    when: inSlovenia,
    text: 'Everyone says a true Slovene climbs Triglav at least once. The plan is a night at the Kredarica hut and the summit at dawn, two thousand eight hundred and sixty-four metres above everything.',
    choices: [
      {
        id: 'climb',
        label: 'Go for the summit',
        outcomes: [
          {
            chance: oddsBy('health', 0.5, 0.008),
            text: 'You reach the little tin Aljaž tower as the sun comes up. Then, as tradition demands for first-timers, your guide gives you three ceremonial swats on the backside with a rope. You have never been happier.',
            effects: [
              { stat: 'happiness', delta: 10 },
              { stat: 'health', delta: 3 },
              { flag: 'si_climbed_triglav' },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'Fog rolls in at the ridge and the guide turns everyone back. You sulk all the way down, then eat a bowl of jota at the hut and decide the mountain will wait.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { stat: 'health', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'hut',
        label: 'Stop at the hut and enjoy the view',
        outcomes: one(
          'You watch the others clip on to the cables and inch upwards, while you drink tea with your boots off. Your grandfather says it still counts as a pilgrimage, half of one.',
          [
            { stat: 'happiness', delta: 4 },
            { stat: 'stress', delta: -3 },
          ],
        ),
      },
    ],
  },
  {
    id: 'si_planica',
    kind: 'choice',
    category: 'social',
    emoji: '🎿',
    ages: [8, 75],
    weight: 7,
    cooldownYears: 6,
    when: inSlovenia,
    text: 'It is March, and Planica is having its ski-flying weekend. Tens of thousands are heading for the valley under Ponce with flags, cowbells and sausages wrapped in foil.',
    choices: [
      {
        id: 'go',
        label: 'Stand in the crowd at the outrun',
        outcomes: [
          {
            chance: 0.7,
            text: 'A jumper floats past overhead for what feels like a full minute and lands beyond two hundred metres. The roar shakes the snow off the pines, and you are part of it.',
            effects: [
              { stat: 'happiness', delta: 7 },
              { status: 'friend' },
              { flag: 'si_planica' },
            ],
          },
          {
            chance: 0.3,
            text: 'The wind is too strong and the competition is postponed twice. You spend the day singing with strangers, which turns out to be the main event anyway.',
            effects: [{ stat: 'happiness', delta: 4 }, { flag: 'si_planica' }],
          },
        ],
      },
      {
        id: 'tv',
        label: 'Watch it on television with soup',
        outcomes: one(
          'The commentator nearly loses his mind over a Slovene jump. You shout at the screen as if the jumper could hear you, and the soup goes cold.',
          [
            { stat: 'happiness', delta: 3 },
            { stat: 'stress', delta: -2 },
          ],
        ),
      },
    ],
  },
  {
    id: 'si_ski_day',
    kind: 'choice',
    category: 'social',
    emoji: '⛷️',
    ages: [6, 65],
    weight: 7,
    cooldownYears: 4,
    when: inSlovenia,
    text: 'A clear winter Saturday, and half the country is on the road to Krvavec, Kranjska Gora or Pohorje. Your old Elan skis are in the cellar where they always are, waxed by someone, sometime.',
    choices: [
      {
        id: 'black',
        label: 'Take the steepest run',
        outcomes: [
          {
            chance: oddsBy('health', 0.55, 0.006),
            text: 'You carve down in long clean arcs and arrive at the bottom breathless and impossibly pleased with yourself. A child half your size overtakes you on the next run.',
            effects: [
              { stat: 'happiness', delta: 7 },
              { skill: 'athletics', delta: 2 },
            ],
            success: true,
          },
          {
            chance: 0.25,
            text: 'You catch an edge and slide the last fifty metres on your back. Nothing broken, but you will feel it every time you sit down this week.',
            effects: [{ injury: 4 }, { stat: 'happiness', delta: 1 }],
          },
        ],
      },
      {
        id: 'hut',
        label: 'Ski to the hut for ričet and tea',
        outcomes: one(
          'You eat barley stew on a sun terrace with your goggles on your head, watching other people fall over. It is the most Slovene afternoon imaginable.',
          [
            { stat: 'happiness', delta: 5 },
            { stat: 'stress', delta: -4 },
          ],
        ),
      },
    ],
  },
  {
    id: 'si_ljubljana_marathon',
    kind: 'choice',
    category: 'health',
    emoji: '🏃',
    ages: [18, 70],
    weight: 6,
    cooldownYears: 5,
    when: inSlovenia,
    text: 'The Ljubljana Marathon is at the end of October, through the old town and along the river under the castle. A friend has signed you both up, and is weirdly calm about it.',
    choices: [
      {
        id: 'full',
        label: 'Train for the full marathon',
        outcomes: [
          {
            chance: oddsBy('health', 0.45, 0.008),
            text: 'You cross the line in Congress Square in a time you will mention unprompted for the rest of your life. A volunteer wraps you in foil like a leftover.',
            effects: [
              { stat: 'health', delta: 6 },
              { stat: 'happiness', delta: 8 },
              { skill: 'athletics', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.35,
            text: 'Your calf seizes at kilometre thirty and you walk the rest, cheered on by a brass band and a lady handing out orange slices. You finish. That is what counts.',
            effects: [{ stat: 'health', delta: 2 }, { stat: 'happiness', delta: 4 }, { injury: 2 }],
          },
        ],
      },
      {
        id: 'ten',
        label: 'Do the 10 km instead',
        outcomes: one(
          'You run the ten kilometres, then spend the rest of the morning on the bridge clapping for the marathoners with a paper cup of tea.',
          [
            { stat: 'health', delta: 3 },
            { stat: 'happiness', delta: 4 },
          ],
        ),
      },
    ],
  },

  // ── Seasons and the table ────────────────────────────────────────────────
  {
    id: 'si_kurentovanje',
    kind: 'choice',
    category: 'social',
    emoji: '🐑',
    ages: [6, 75],
    weight: 6,
    cooldownYears: 7,
    when: inSlovenia,
    text: 'It is carnival time in Ptuj, and the kurenti are out: shaggy sheepskin figures with horned masks, long red tongues and cowbells on their belts, stamping through the streets to drive away the winter.',
    choices: [
      {
        id: 'watch',
        label: 'Watch the procession',
        outcomes: one(
          'The noise of a hundred cowbells goes right through your chest. A kurent stops in front of you, shakes himself thoroughly, and moves on. You feel oddly blessed.',
          [{ stat: 'happiness', delta: 5 }, { flag: 'si_kurentovanje' }],
        ),
      },
      {
        id: 'costume',
        label: 'Help a neighbour dress as a kurent',
        outcomes: one(
          'The costume weighs as much as a small child and smells of sheep and woodsmoke. You lace him into it, and he dances for six hours. You get a free doughnut for your trouble.',
          [{ stat: 'happiness', delta: 4 }, { stat: 'karma', delta: 1 }, { status: 'friend' }],
        ),
      },
    ],
  },
  {
    id: 'si_potica',
    kind: 'choice',
    category: 'family',
    emoji: '🥮',
    ages: [7, 85],
    weight: 7,
    cooldownYears: 5,
    when: inSlovenia,
    text: 'It is the week before Christmas and the kitchen is a flour storm. The potica dough has to be rolled so thin you can read a newspaper through it, and the walnut filling has been argued over since breakfast.',
    choices: [
      {
        id: 'learn',
        label: 'Learn to roll it yourself',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.5, 0.008),
            text: 'Your first potica comes out of the ring tin with a perfect spiral. The family cuts it with the ceremony of a wedding cake.',
            effects: [
              { skill: 'cooking', delta: 4 },
              { stat: 'happiness', delta: 5 },
              { flag: 'si_potica_maker' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The dough tears twice and the spiral looks more like a map of the motorway network. It tastes wonderful, which everyone says carefully.',
            effects: [
              { skill: 'cooking', delta: 2 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'eat',
        label: 'Volunteer as official taster',
        outcomes: one(
          'You eat the end slice, which is the best slice, and then another one to be sure. By Easter you have gained a small, honourable amount of weight.',
          [
            { stat: 'happiness', delta: 4 },
            { stat: 'health', delta: -1 },
          ],
        ),
      },
    ],
  },
  {
    id: 'si_gostilna_sunday',
    kind: 'notice',
    category: 'family',
    emoji: '🍲',
    ages: [5, 85],
    weight: 5,
    cooldownYears: 5,
    when: inSlovenia,
    text: 'Sunday lunch at the gostilna by the church: beef soup with thin noodles, then roast pork with fried potatoes and salad dressed in pumpkin seed oil, then štruklji. Everyone says dober tek and means it.',
    outcomes: [
      {
        chance: 0.5,
        text: 'You eat until you have to undo something. The owner comes round with a plate of extra štruklji, “for the young ones”, and refuses to put them on the bill.',
        effects: [{ stat: 'happiness', delta: 4 }, { money: -60 }],
      },
      {
        chance: 0.5,
        text: 'The soup is as clear as a mountain stream, and you sit long after the plates are cleared, listening to the old men at the next table arguing about mushrooms.',
        effects: [{ stat: 'happiness', delta: 3 }, { stat: 'stress', delta: -3 }, { money: -60 }],
      },
    ],
  },
  {
    id: 'si_martinovanje',
    kind: 'choice',
    category: 'social',
    emoji: '🍷',
    ages: [18, 85],
    weight: 6,
    cooldownYears: 4,
    adultsOnly: true,
    when: inSlovenia,
    text: 'It is the eleventh of November, Saint Martin’s Day, when the must turns into wine. There is goose with mlinci and red cabbage in every gostilna, and the cellars are open for tasting.',
    choices: [
      {
        id: 'cellar',
        label: 'Join the cellar crawl',
        outcomes: [
          {
            chance: 0.6,
            text: 'You taste eleven wines and remember six. A winemaker baptises the new vintage with a little speech and a spoonful of water, and you applaud as if at an opera.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { vice: 'alcohol', delta: 2 },
              { status: 'friend' },
            ],
          },
          {
            chance: 0.4,
            text: 'You wake up the next morning with a headache and a receipt for a whole case of something called a cviček. It turns out to be very good.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'health', delta: -2 },
              { money: -120 },
              { vice: 'alcohol', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'goose',
        label: 'Just eat the goose',
        outcomes: one(
          'You roast your own goose and soak the mlinci in its juices. The house smells of it for three days, in a good way.',
          [
            { stat: 'happiness', delta: 4 },
            { skill: 'cooking', delta: 2 },
          ],
        ),
      },
    ],
  },
  {
    id: 'si_vineyard_trgatev',
    kind: 'choice',
    category: 'family',
    emoji: '🍇',
    ages: [10, 75],
    weight: 7,
    cooldownYears: 5,
    when: inSlovenia,
    text: 'It is trgatev, the grape harvest, at the family vineyard in the hills, and every cousin with two hands has been summoned. The steep rows are slippery with dew and wasps.',
    choices: [
      {
        id: 'pick',
        label: 'Pick from dawn till dusk',
        outcomes: [
          {
            chance: asChild,
            text: 'You fill buckets until your fingers are purple and sticky. At lunch under the walnut tree you get grape juice straight from the press and a sausage nobody counts.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'discipline', delta: 2 },
              { flag: 'si_vineyard' },
            ],
          },
          {
            chance: asAdult,
            text: 'You carry the brenta, the wooden pannier, up and down the slope all day. Your shoulders are destroyed, the harvest is good, and your uncle calls you a proper worker.',
            effects: [
              { stat: 'health', delta: 2 },
              { stat: 'happiness', delta: 4 },
              { flag: 'si_vineyard' },
            ],
          },
        ],
      },
      {
        id: 'skive',
        label: 'Find a reason to stay in town',
        outcomes: one(
          'You claim a prior engagement. Your aunt says nothing, which is worse than anything she could have said, and at Christmas you get the smallest slice of potica.',
          [
            { stat: 'happiness', delta: -1 },
            { stat: 'karma', delta: -1 },
          ],
        ),
      },
    ],
  },
  {
    id: 'si_vikend',
    kind: 'choice',
    category: 'family',
    emoji: '🏡',
    ages: [8, 75],
    weight: 6,
    cooldownYears: 6,
    when: inSlovenia,
    text: 'The family vikend, the weekend cottage in the hills, has been under construction for twenty years. This Saturday is another working Saturday. There is cement to mix and a terrace to finish.',
    choices: [
      {
        id: 'work',
        label: 'Roll up your sleeves',
        outcomes: one(
          'You mix cement, carry tiles, and eat grilled sausages on an unfinished terrace with a view of three valleys. The cottage is nearly done, as it has been for years.',
          [
            { stat: 'health', delta: 2 },
            { stat: 'happiness', delta: 4 },
            { stat: 'discipline', delta: 2 },
          ],
        ),
      },
      {
        id: 'hammock',
        label: 'String up a hammock between the plum trees',
        outcomes: one(
          'You supervise from the hammock until someone tips you out of it. The plums are ripe, which almost makes up for it.',
          [
            { stat: 'stress', delta: -4 },
            { stat: 'happiness', delta: 2 },
          ],
        ),
      },
    ],
  },
  {
    id: 'si_mushrooms',
    kind: 'choice',
    category: 'social',
    emoji: '🍄',
    ages: [10, 85],
    weight: 6,
    cooldownYears: 4,
    when: inSlovenia,
    text: 'After a week of warm rain you walk into the beech woods with a basket, and there, under the ferns, is a family of fat brown porcini. Your secret spot has delivered again.',
    choices: [
      {
        id: 'secret',
        label: 'Tell no one, ever',
        outcomes: one(
          'When asked where you found them, you say “in the forest” and change the subject, as your grandfather taught you and his grandfather taught him.',
          [
            { stat: 'happiness', delta: 5 },
            { skill: 'cooking', delta: 1 },
            { flag: 'si_mushroom_spot' },
          ],
        ),
      },
      {
        id: 'share',
        label: 'Bring a friend next time',
        outcomes: one(
          'Your friend is sworn to secrecy and the friendship is sealed over a pan of mushrooms with garlic and parsley. You keep an eye on them in the woods anyway.',
          [{ stat: 'happiness', delta: 4 }, { status: 'friend' }],
        ),
      },
      {
        id: 'unknown',
        label: 'Also pick the pretty red ones',
        outcomes: [
          {
            chance: 0.6,
            text: 'The mushroom society at the village hall examines your basket and throws out half of it with a look of deep pity. You eat only the porcini and live.',
            effects: [{ stat: 'smarts', delta: 2 }],
          },
          {
            chance: 0.4,
            text: 'You do not check them carefully enough. The night that follows is long and unpleasant, and you learn the Latin names of three species from the doctor.',
            effects: [{ illness: 'food_poisoning' }, { stat: 'health', delta: -4 }],
          },
        ],
      },
    ],
  },
  {
    id: 'si_bees',
    kind: 'choice',
    category: 'random',
    emoji: '🐝',
    ages: [12, 80],
    weight: 6,
    once: true,
    when: inSlovenia,
    text: 'A retired neighbour has too many hives and offers you two, with their painted front boards and a colony of Carniolan bees, famously gentle. “They are Slovene,” he says. “They will not bother you unless you are rude.”',
    choices: [
      {
        id: 'take',
        label: 'Take up beekeeping',
        outcomes: [
          {
            chance: 0.75,
            text: 'By late summer you have jars of forest honey, dark as tea, lined up on the shelf. You give them away at Christmas, and people actually ask for more.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: -4 },
              { money: 200 },
              { flag: 'si_beekeeper' },
            ],
            success: true,
          },
          {
            chance: 0.25,
            text: 'You are rude to them, once, by accident, and spend a day with a face like a pumpkin. The bees and you come to an understanding.',
            effects: [
              { stat: 'looks', delta: -2 },
              { stat: 'happiness', delta: 3 },
              { flag: 'si_beekeeper' },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Admire them from a distance',
        outcomes: one(
          'You decline politely. He gives you a jar of acacia honey anyway and tells you about his bees for an hour, which you discover you enjoy.',
          [{ stat: 'happiness', delta: 2 }],
        ),
      },
    ],
  },
  {
    id: 'si_bled',
    kind: 'choice',
    category: 'travel',
    emoji: '🏝️',
    ages: [6, 80],
    weight: 6,
    cooldownYears: 10,
    when: inSlovenia,
    text: 'A day at Bled: the lake green as bottle glass, the little church on its island, the castle on its cliff. A man with a wooden pletna boat is offering to row you across.',
    choices: [
      {
        id: 'bell',
        label: 'Row to the island and ring the bell',
        outcomes: one(
          'You climb the ninety-nine steps and pull the rope of the wishing bell. You wish for something private and specific, and the bell sounds pleased about it.',
          [
            { stat: 'happiness', delta: 6 },
            { stat: 'karma', delta: 1 },
          ],
        ),
      },
      {
        id: 'cake',
        label: 'Eat the famous cream cake',
        outcomes: one(
          'The kremšnita is a wobbling cube of custard and cream between flaky pastry, and there is no dignified way to eat it. You manage half dignified and order a second.',
          [{ stat: 'happiness', delta: 5 }, { stat: 'health', delta: -1 }, { money: -15 }],
        ),
      },
      {
        id: 'swim',
        label: 'Swim in the lake',
        outcomes: one(
          'The water is cold enough to make you swear, then perfect. You float on your back and look up at the castle, and think: people pay a great deal to see this.',
          [
            { stat: 'health', delta: 3 },
            { stat: 'stress', delta: -5 },
          ],
        ),
      },
    ],
  },
  {
    id: 'si_coast_summer',
    kind: 'notice',
    category: 'travel',
    emoji: '⛱️',
    ages: [5, 80],
    weight: 5,
    cooldownYears: 6,
    when: inSlovenia,
    text: 'A week at the coast, all forty-odd kilometres of it. You swim off the stone quays at Piran, eat grilled squid by the harbour, and watch the evening light turn Tartini Square the colour of apricots.',
    outcomes: [
      {
        chance: 0.6,
        text: 'You get exactly the right amount of sunburn and come home with sand in places sand should not go. Next year, everyone agrees, same place.',
        effects: [{ stat: 'happiness', delta: 6 }, { stat: 'stress', delta: -5 }, { money: -300 }],
      },
      {
        chance: 0.4,
        text: 'The bora wind blows for three days and the sea goes grey and wild. You drink hot chocolate in a café and watch spray hit the windows, and somehow it is still a holiday.',
        effects: [{ stat: 'happiness', delta: 3 }, { stat: 'stress', delta: -3 }, { money: -300 }],
      },
    ],
  },
  {
    id: 'si_lipica',
    kind: 'notice',
    category: 'travel',
    emoji: '🐴',
    ages: [6, 80],
    weight: 4,
    once: true,
    when: inSlovenia,
    text: 'At the stud farm in Lipica, among the stone walls and oak trees of the Karst, the Lipizzaner mares graze with their foals. The foals are born dark and only turn white over several years.',
    outcomes: one(
      'A grey foal comes right up to the fence and breathes on your hand. You learn that horses have been bred here since 1580, and you feel very new.',
      [
        { stat: 'happiness', delta: 4 },
        { stat: 'smarts', delta: 1 },
      ],
    ),
  },
  {
    id: 'si_dvojina_learner',
    kind: 'choice',
    category: 'social',
    emoji: '🗣️',
    ages: [14, 85],
    weight: 10,
    once: true,
    when: (s) => inSlovenia(s) && livesAbroad(s),
    text: 'Your Slovene teacher explains, with relish, that Slovene has not just singular and plural but a dual: special forms for exactly two of anything. Two beers, two dogs, the two of us. You have been saying it wrong all week.',
    choices: [
      {
        id: 'practise',
        label: 'Drill the dual every evening',
        outcomes: one(
          'You master it, and from then on use it at every opportunity. The baker beams at you when you ask for two loaves correctly. It is a small country, and word gets around.',
          [
            { stat: 'smarts', delta: 3 },
            { stat: 'happiness', delta: 4 },
            { flag: 'si_learned_dvojina' },
          ],
        ),
      },
      {
        id: 'avoid',
        label: 'Only ever buy one or three of things',
        outcomes: one(
          'Your strategy works perfectly until someone asks you about your parents. The neighbours find it charming.',
          [{ stat: 'happiness', delta: 2 }],
        ),
      },
    ],
  },
  {
    id: 'si_world_bee_day',
    kind: 'notice',
    category: 'work',
    emoji: '🍯',
    ages: [18, 70],
    weight: 5,
    once: true,
    fromYear: 2018,
    when: (s) => inSlovenia(s) && hasJob(s),
    text: 'The twentieth of May is World Bee Day, which the United Nations declared at Slovenia’s suggestion, and your workplace has gone all in. There is a honey breakfast in the canteen and a hive on the roof.',
    outcomes: one(
      'Someone gives a short talk about pollination, and you leave with a jar of linden honey and a new respect for the colleague in accounts who turns out to keep thirty hives.',
      [{ stat: 'happiness', delta: 3 }, { performance: 2 }],
    ),
  },
];
