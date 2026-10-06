import type { EventDef } from '../../engine/events/types';
import type { GameState } from '../../engine/types';
import { all, oddsBy } from './conditions';

type Pred = (s: GameState) => boolean;

/** Years already served is at least n. */
const servedAtLeast =
  (n: number): Pred =>
  (s) =>
    s.legal.prison !== null && s.legal.prison.served >= n;
/** Years already served is at most n. */
const servedAtMost =
  (n: number): Pred =>
  (s) =>
    s.legal.prison !== null && s.legal.prison.served <= n;
/** Years still to serve is at most n. */
const yearsLeftAtMost =
  (n: number): Pred =>
  (s) =>
    s.legal.prison !== null && s.legal.prison.years - s.legal.prison.served <= n;
/** Years still to serve is at least n. */
const yearsLeftAtLeast =
  (n: number): Pred =>
  (s) =>
    s.legal.prison !== null && s.legal.prison.years - s.legal.prison.served >= n;

const smartsOdds = oddsBy('smarts', 0.6);
const disciplineOdds = oddsBy('discipline', 0.55);

/** More of life inside (SPEC §5.10), spread across a long sentence: early weeks, the long middle, the last year. */
export const PRISON_2_EVENTS: EventDef[] = [
  {
    id: 'prison2_unwritten_rules',
    kind: 'choice',
    category: 'crime',
    ages: [16, 100],
    weight: 8,
    once: true,
    inPrison: true,
    when: servedAtMost(1),
    text: 'Nobody hands you the real rulebook. Which table is whose, which officer to call sir, why you never touch the remote. You have about a week to work it out.',
    choices: [
      {
        id: 'watch',
        label: 'Keep quiet and watch',
        outcomes: [
          {
            chance: 1,
            text: 'You say almost nothing for a fortnight and learn a great deal. By the end of it you know where to sit and when to look away.',
            effects: [
              { stat: 'discipline', delta: 4 },
              { stat: 'stress', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'ask',
        label: 'Ask an old-timer',
        outcomes: [
          {
            chance: 0.7,
            text: 'Okonjo, eleven years in, explains it all over a game of draughts and charges you one biscuit per rule.',
            effects: [
              { status: 'friend', first: 'Okonjo' },
              { stat: 'stress', delta: -5 },
            ],
          },
          {
            chance: 0.3,
            text: 'The old-timer tells you three rules, two of which turn out to be jokes at your expense. The wing enjoys them very much.',
            effects: [
              { stat: 'happiness', delta: -3 },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'ignore',
        label: 'Do things your own way',
        outcomes: [
          {
            chance: 1,
            text: 'You sit at the wrong table on day three. Nothing happens, exactly, but nobody passes you the salt for a month.',
            effects: [
              { stat: 'stress', delta: 7 },
              { stat: 'notoriety', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'prison2_model_ship',
    kind: 'choice',
    category: 'random',
    ages: [16, 100],
    weight: 5,
    once: true,
    inPrison: true,
    when: all(servedAtLeast(2), yearsLeftAtLeast(3)),
    text: 'The hobby trolley has a kit for a three-masted ship: two thousand pieces, glue that smells of pear drops, instructions written for someone with far more patience than you.',
    choices: [
      {
        id: 'build',
        label: 'Start on the hull',
        outcomes: [
          {
            chance: disciplineOdds,
            text: 'It takes the better part of two years. When the last tiny sail goes on, three officers come to look at it and one asks if it is for sale.',
            effects: [
              { flag: 'prison_ship' },
              { skill: 'art', delta: 8 },
              { stat: 'discipline', delta: 6 },
              { stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
          {
            chance: (s) => 1 - disciplineOdds(s),
            text: 'You get as far as the keel and a stubborn half-deck before the glue runs out. It sits on the shelf, unfinished and somehow yours.',
            effects: [
              { skill: 'art', delta: 3 },
              { stat: 'stress', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'leave',
        label: 'Leave it for someone else',
        outcomes: [
          {
            chance: 1,
            text: 'Someone two cells down takes the kit. Eighteen months later you catch yourself envying a boat.',
            effects: [{ stat: 'happiness', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'prison2_garden_plot',
    kind: 'choice',
    category: 'health',
    ages: [16, 100],
    weight: 6,
    once: true,
    inPrison: true,
    when: all(servedAtLeast(1), yearsLeftAtLeast(2)),
    text: 'Behind the workshop there is a strip of earth the size of a parked car, and the governor has decided it should grow vegetables. They need volunteers who can be trusted with a trowel.',
    choices: [
      {
        id: 'volunteer',
        label: 'Put your name down',
        outcomes: [
          {
            chance: 0.75,
            text: 'Your first tomatoes are small, sour and the best thing you have eaten in years. You start talking about soil like it owes you money.',
            effects: [
              { flag: 'prison_garden' },
              { behaviour: 3 },
              { stat: 'happiness', delta: 6 },
              { stat: 'health', delta: 2 },
              { stat: 'stress', delta: -5 },
            ],
            success: true,
          },
          {
            chance: 0.25,
            text: 'Slugs take the lettuces, pigeons take the seeds. You learn a lot about patience and nothing about lettuce.',
            effects: [
              { flag: 'prison_garden' },
              { behaviour: 3 },
              { stat: 'discipline', delta: 4 },
              { stat: 'happiness', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'pass',
        label: 'Stay indoors',
        outcomes: [
          {
            chance: 1,
            text: 'You watch the gardeners from the landing window, kneeling in the mud, oddly content. It is a long way down.',
            effects: [{ stat: 'happiness', delta: -1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'prison2_chapel_guitar',
    kind: 'choice',
    category: 'random',
    ages: [16, 100],
    weight: 5,
    cooldownYears: 6,
    inPrison: true,
    when: servedAtLeast(2),
    text: 'The chaplain has a guitar with five strings and a crack along the body, and says anyone may borrow it on Tuesday evenings as long as they bring it back in tune.',
    choices: [
      {
        id: 'learn',
        label: 'Borrow it every Tuesday',
        outcomes: [
          {
            chance: 1,
            text: 'Three chords become six. By winter you can play something the whole landing hums along to, badly but with feeling.',
            effects: [
              { skill: 'instrument', delta: 10 },
              { stat: 'stress', delta: -5 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'listen',
        label: 'Just listen to whoever plays',
        outcomes: [
          {
            chance: 1,
            text: 'You sit on the back pew and let someone else do the fumbling. It is the best hour of the week anyway.',
            effects: [{ stat: 'stress', delta: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'prison2_transfer',
    kind: 'choice',
    category: 'crime',
    ages: [16, 100],
    weight: 5,
    cooldownYears: 8,
    inPrison: true,
    when: all(servedAtLeast(2), yearsLeftAtLeast(2)),
    text: 'A form arrives saying you are eligible for a transfer to a lower-category prison three hundred miles away. It has more fresh air and fewer people you know.',
    choices: [
      {
        id: 'go',
        label: 'Take the transfer',
        outcomes: [
          {
            chance: 0.7,
            text: 'The new place has a field you can actually see the end of and doors that open more than they close. You miss your old cell for a week, which surprises you.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: -6 },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'The paperwork gets lost in transit and you spend a month in a holding wing that nobody seems to be in charge of. Then it is fine.',
            effects: [
              { stat: 'stress', delta: 6 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'stay',
        label: 'Stay where you know the rules',
        outcomes: [
          {
            chance: 1,
            text: 'You tick the box that says no. Better the devil whose shift pattern you have memorised.',
            effects: [{ stat: 'stress', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'prison2_new_arrival',
    kind: 'choice',
    category: 'social',
    ages: [20, 100],
    weight: 6,
    once: true,
    inPrison: true,
    when: servedAtLeast(3),
    text: 'A new arrival called Robin moves into the cell opposite: nineteen, sleeps with shoes on, and jumps every time the doors bang.',
    choices: [
      {
        id: 'help',
        label: 'Show Robin the ropes',
        outcomes: [
          {
            chance: 1,
            text: 'You explain which rules are real and which are noise. A month later Robin sleeps barefoot and starts calling you by your first name.',
            effects: [
              { status: 'friend', first: 'Robin', age: 19 },
              { stat: 'karma', delta: 4 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'distance',
        label: 'Keep your distance',
        outcomes: [
          {
            chance: 1,
            text: 'Someone else takes Robin under their wing. You notice, later, that it was not someone you would have chosen.',
            effects: [{ stat: 'karma', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'prison2_reading_glasses',
    kind: 'choice',
    category: 'health',
    ages: [38, 100],
    weight: 6,
    once: true,
    inPrison: true,
    when: servedAtLeast(8),
    text: 'Somewhere in year eight the library books start printing smaller. Your knees now announce the stairs before you reach them, and the youngsters on the wing have started calling you Professor.',
    choices: [
      {
        id: 'optician',
        label: 'Put in for an eye test',
        outcomes: [
          {
            chance: 1,
            text: 'Four months later you get a pair of grey plastic glasses that pinch. The books go back to normal size. Professor sticks.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'embrace',
        label: 'Lean into being Professor',
        outcomes: [
          {
            chance: 1,
            text: 'You start dispensing advice at the pool table. Some of it is good. The young ones bring you their letters to check for spelling.',
            effects: [
              { stat: 'karma', delta: 3 },
              { stat: 'happiness', delta: 4 },
              { stat: 'health', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'squint',
        label: 'Hold the book further away',
        outcomes: [
          {
            chance: 1,
            text: 'Your arms are only so long. By spring you have a headache that lives behind your left eye.',
            effects: [
              { stat: 'health', delta: -2 },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'prison2_radio_song',
    kind: 'notice',
    category: 'world',
    ages: [16, 100],
    weight: 5,
    cooldownYears: 6,
    inPrison: true,
    when: servedAtLeast(4),
    text: 'A song comes on the workshop radio and the whole room starts singing the chorus. Everyone knows it but you. Apparently it has been everywhere for a year.',
    outcomes: [
      {
        chance: 0.6,
        text: 'Someone writes the words out for you on the back of a canteen sheet. By Friday you are singing it louder than anyone.',
        effects: [
          { stat: 'happiness', delta: 3 },
          { skill: 'voice', delta: 3 },
        ],
      },
      {
        chance: 0.4,
        text: 'You work out how many songs you must have missed and stop counting at the thought of it. The radio goes off at four.',
        effects: [
          { stat: 'happiness', delta: -4 },
          { stat: 'stress', delta: 3 },
        ],
      },
    ],
  },
  {
    id: 'prison2_funeral_release',
    kind: 'choice',
    category: 'family',
    ages: [18, 100],
    weight: 5,
    once: true,
    inPrison: true,
    when: servedAtLeast(1),
    bind: { mum: { role: 'mother', minAge: 65 } },
    text: 'The chaplain comes to your cell instead of an officer, which is how you know before a word is said. {mum.first} has died. The governor will allow an escorted day release for the funeral.',
    choices: [
      {
        id: 'go',
        label: 'Go, in handcuffs',
        outcomes: [
          {
            chance: 1,
            text: 'You stand at the back with an officer on either side. Your relatives look at the cuffs, then at you, then hold you anyway.',
            effects: [
              { status: 'npc_dies', with: 'mum' },
              { stat: 'happiness', delta: -10 },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'stay',
        label: 'Say goodbye from here',
        outcomes: [
          {
            chance: 1,
            text: 'You don’t want the cuffs to be what people remember. At eleven o’clock you sit on your bunk with the door shut, and the wing goes quiet for you.',
            effects: [
              { status: 'npc_dies', with: 'mum' },
              { stat: 'happiness', delta: -12 },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'prison2_funeral_release_father',
    kind: 'choice',
    category: 'family',
    ages: [18, 100],
    weight: 5,
    once: true,
    inPrison: true,
    when: servedAtLeast(1),
    bind: { dad: { role: 'father', minAge: 65 } },
    text: 'The chaplain comes to your cell instead of an officer, which is how you know before a word is said. {dad.first} has died. The governor will allow an escorted day release for the funeral.',
    choices: [
      {
        id: 'go',
        label: 'Go, in handcuffs',
        outcomes: [
          {
            chance: 1,
            text: 'The officers let you stand by the grave for one minute longer than the rules allow. Someone has brought {dad.first}’s old cap. You are allowed to hold it.',
            effects: [
              { status: 'npc_dies', with: 'dad' },
              { stat: 'happiness', delta: -10 },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'stay',
        label: 'Say goodbye from here',
        outcomes: [
          {
            chance: 1,
            text: 'You ask the chaplain to read something {dad.first} liked at the service. At the hour it starts, you stand at your window, and three cells along someone turns their radio off.',
            effects: [
              { status: 'npc_dies', with: 'dad' },
              { stat: 'happiness', delta: -12 },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'prison2_sibling_wedding',
    kind: 'choice',
    category: 'family',
    ages: [18, 100],
    weight: 5,
    cooldownYears: 8,
    inPrison: true,
    when: servedAtLeast(1),
    bind: { sib: { role: 'sibling', minAge: 20, minRelationship: 30 } },
    text: '{sib.first} is getting married in the spring. The application for day release comes back stamped “not approved” in red, in a box too small for reasons.',
    choices: [
      {
        id: 'speech',
        label: 'Write a speech for someone to read',
        outcomes: [
          {
            chance: 1,
            text: 'Your cousin reads it out between the main course and the cake. {sib.first} writes afterwards to say the room cried twice and laughed once, in the right places.',
            effects: [
              { rel: 'sib', delta: 10, memory: 'the speech read out at the wedding' },
              { skill: 'writing', delta: 4 },
              { stat: 'happiness', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'call',
        label: 'Save your phone credit for the day',
        outcomes: [
          {
            chance: 0.6,
            text: 'You get four minutes on the landing phone during the reception. Over the music you hear {sib.first} shout that it is not the same without you.',
            effects: [
              { rel: 'sib', delta: 6, memory: 'the call from inside on the wedding day' },
              { stat: 'happiness', delta: 2 },
            ],
          },
          {
            chance: 0.4,
            text: 'The phone is out of order all afternoon. You find out about the first dance from a photograph a month later.',
            effects: [
              { rel: 'sib', delta: 1, memory: 'missing the wedding' },
              { stat: 'happiness', delta: -6 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'prison2_library_orderly',
    kind: 'choice',
    category: 'work',
    ages: [18, 90],
    weight: 6,
    once: true,
    inPrison: true,
    when: servedAtLeast(2),
    text: 'The library orderly is being released and recommends you as a replacement. The job is shelving, stamping, and keeping a waiting list for the one copy of every thriller.',
    choices: [
      {
        id: 'take',
        label: 'Take the job',
        outcomes: [
          {
            chance: 1,
            text: 'You reorganise the crime section with a straight face and start a request list that runs to four pages. People nod to you in the corridor now.',
            effects: [
              { flag: 'prison_library' },
              { behaviour: 4 },
              { stat: 'smarts', delta: 5 },
              { stat: 'discipline', delta: 3 },
              { money: 120, kind: 'wage' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'decline',
        label: 'Keep to your own reading',
        outcomes: [
          {
            chance: 1,
            text: 'The job goes to someone who files everything by colour. You do not get the new thriller until spring.',
            effects: [{ stat: 'happiness', delta: -1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'prison2_peer_mentor',
    kind: 'choice',
    category: 'social',
    ages: [21, 100],
    weight: 5,
    once: true,
    inPrison: true,
    when: all(servedAtLeast(5), yearsLeftAtLeast(1)),
    text: 'The induction officer asks if you’d be a peer mentor: meet new arrivals on their first night, explain the kettle, answer the questions they are too proud to ask staff.',
    choices: [
      {
        id: 'yes',
        label: 'Say yes',
        outcomes: [
          {
            chance: 0.8,
            text: 'You see a lot of first nights. Some of them write to you after they get out, short letters that mostly just say “still out”.',
            effects: [
              { flag: 'prison_mentor' },
              { behaviour: 6 },
              { stat: 'karma', delta: 6 },
              { stat: 'happiness', delta: 5 },
            ],
            success: true,
          },
          {
            chance: 0.2,
            text: 'It is harder than it sounds. Some nights you carry other people’s first nights back to your own cell.',
            effects: [
              { flag: 'prison_mentor' },
              { behaviour: 6 },
              { stat: 'karma', delta: 5 },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'no',
        label: 'Say you’re not the type',
        outcomes: [
          {
            chance: 1,
            text: 'The officer says that is what everyone says, and asks someone else. You think about it longer than you expected to.',
            effects: [{ stat: 'karma', delta: -1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'prison2_degree',
    kind: 'choice',
    category: 'school',
    ages: [18, 90],
    weight: 5,
    once: true,
    inPrison: true,
    // Four years of essays need four years served.
    when: all(servedAtLeast(4), yearsLeftAtLeast(1)),
    text: 'A distance-learning university offers degrees by correspondence: textbooks by post, essays by hand, exams in the visits hall under the eye of a bored invigilator.',
    choices: [
      {
        id: 'enrol',
        label: 'Enrol',
        outcomes: [
          {
            chance: smartsOdds,
            text: 'Four years of essays written on your knees. The certificate arrives in a cardboard tube and you are not too proud to cry about it.',
            effects: [
              { flag: 'prison_degree' },
              { behaviour: 5 },
              { stat: 'smarts', delta: 10 },
              { skill: 'writing', delta: 6 },
              { stat: 'happiness', delta: 8 },
            ],
            success: true,
          },
          {
            chance: (s) => 1 - smartsOdds(s),
            text: 'You finish two modules before the statistics one breaks you. It still counts for something on a form one day.',
            effects: [
              { stat: 'smarts', delta: 4 },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'later',
        label: 'Wait until you’re out',
        outcomes: [
          {
            chance: 1,
            text: 'You tell yourself there will be time later. The prospectus gets used to level the table.',
            effects: [{ stat: 'smarts', delta: -1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'prison2_landing_row',
    kind: 'choice',
    category: 'crime',
    ages: [18, 80],
    weight: 6,
    cooldownYears: 5,
    inPrison: true,
    when: servedAtLeast(1),
    text: 'An argument about the pool table goes past the point of words on your landing. There are about ten seconds before the officers arrive and everyone has to be somewhere.',
    choices: [
      {
        id: 'between',
        label: 'Step in and calm it down',
        outcomes: [
          {
            chance: 0.6,
            text: 'You talk fast and keep your hands where everyone can see them. It fizzles out. One of them buys you a coffee later without saying why.',
            effects: [
              { stat: 'karma', delta: 5 },
              { stat: 'notoriety', delta: 2 },
              { stat: 'stress', delta: 3 },
              { behaviour: 4 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You end up in the middle of it when the alarm goes. The report says “involved”, which is technically true.',
            effects: [{ injury: 8 }, { stat: 'stress', delta: 8 }, { behaviour: -8 }],
          },
        ],
      },
      {
        id: 'cell',
        label: 'Go back to your cell',
        outcomes: [
          {
            chance: 1,
            text: 'You hear it from behind your door, then the boots, then nothing. Nobody asks you a single question, which is the point.',
            effects: [{ stat: 'stress', delta: 2 }],
          },
        ],
      },
      {
        id: 'officer',
        label: 'Fetch an officer',
        outcomes: [
          {
            chance: 1,
            text: 'It gets broken up quickly. A few people on the landing stop talking when you walk past, for a while.',
            effects: [
              { stat: 'karma', delta: 2 },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'prison2_training_scheme',
    kind: 'choice',
    category: 'work',
    ages: [18, 70],
    weight: 6,
    once: true,
    inPrison: true,
    when: yearsLeftAtMost(2),
    text: 'With your release in sight, the resettlement officer offers a place on a twelve-week trades course. Plumbing or bricklaying, with a certificate that doesn’t mention where you earned it.',
    choices: [
      {
        id: 'plumbing',
        label: 'Plumbing',
        outcomes: [
          {
            chance: 1,
            text: 'You learn more about U-bends than any person needs to. The instructor says you have steady hands and an unsettling calm around leaks.',
            effects: [
              { flag: 'prison_trade_cert' },
              { behaviour: 4 },
              { stat: 'smarts', delta: 3 },
              { stat: 'discipline', delta: 4 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'bricks',
        label: 'Bricklaying',
        outcomes: [
          {
            chance: 1,
            text: 'By week ten your walls stand up on their own. You build the same small wall nine times and knock it down eight.',
            effects: [
              { flag: 'prison_trade_cert' },
              { behaviour: 4 },
              { stat: 'health', delta: 2 },
              { stat: 'discipline', delta: 4 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'skip',
        label: 'Coast to the end',
        outcomes: [
          {
            chance: 1,
            text: 'You spend the time watching the clock instead. It moves exactly as slowly as it always has.',
            effects: [{ stat: 'stress', delta: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'prison2_first_things_list',
    kind: 'choice',
    category: 'random',
    ages: [16, 100],
    weight: 7,
    once: true,
    inPrison: true,
    when: all(yearsLeftAtMost(1), servedAtLeast(2)),
    text: 'Less than a year to go. You find yourself making a list on the inside cover of a library book: the first things you will do when the gate opens.',
    choices: [
      {
        id: 'small',
        label: 'Keep it small: chips, a bath, the sea',
        outcomes: [
          {
            chance: 1,
            text: 'You read the list every night until you know it by heart. Somehow the sea gets bigger each time.',
            effects: [
              { flag: 'prison_list' },
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'big',
        label: 'Plan a whole new life',
        outcomes: [
          {
            chance: 0.6,
            text: 'Job, flat, savings, apology letters, in that order. It looks almost possible written down.',
            effects: [
              { flag: 'prison_list' },
              { stat: 'discipline', delta: 4 },
              { stat: 'happiness', delta: 3 },
            ],
          },
          {
            chance: 0.4,
            text: 'The list grows to six pages and starts to feel like a second sentence. You tear out the last five.',
            effects: [{ flag: 'prison_list' }, { stat: 'stress', delta: 5 }],
          },
        ],
      },
      {
        id: 'none',
        label: 'Don’t jinx it',
        outcomes: [
          {
            chance: 1,
            text: 'You put the pen down. Plenty of people on this wing made lists. You will believe the gate when you see it.',
            effects: [{ stat: 'stress', delta: 2 }],
          },
        ],
      },
    ],
  },
];
