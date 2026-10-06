import type { EventDef } from '../../engine/events/types';
import { inSchool, oddsBy } from './conditions';

/** School life: teachers, bullies, classmates. Primary (6–11) and secondary (12–17). */
export const SCHOOL_EVENTS: EventDef[] = [
  // ---------------------------------------------------------------- primary
  {
    id: 'school_p_times_tables',
    kind: 'choice',
    category: 'school',
    ages: [7, 10],
    weight: 9,
    cooldownYears: 4,
    when: inSchool,
    text: 'Mrs Abernathy announces a times-tables race against the clock, with a laminated certificate for the winner. The sevens are your sworn enemy.',
    choices: [
      {
        id: 'drill',
        label: 'Drill the sevens every night',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.6),
            success: true,
            text: 'Seven eights are fifty-six, and you say it before Mrs Abernathy finishes asking. The certificate goes on the fridge with great ceremony.',
            effects: [
              { stat: 'smarts', delta: 4 },
              { stat: 'discipline', delta: 3 },
              { stat: 'happiness', delta: 3 },
            ],
          },
          {
            chance: 0.35,
            text: 'You freeze on seven nines and say "seventy-something" with total confidence. Second place, but a strong second.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'fingers',
        label: 'Count on your fingers under the desk',
        outcomes: [
          {
            chance: 0.5,
            text: 'Your fingers are fast and the desk is solid. Nobody suspects a thing, including your conscience.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { stat: 'karma', delta: -1 },
            ],
          },
          {
            chance: 0.5,
            text: 'Mrs Abernathy peers under the desk and finds ten very busy fingers. She says nothing, which is somehow worse.',
            effects: [
              { stat: 'happiness', delta: -3 },
              { stat: 'discipline', delta: -1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'school_p_lost_tooth_class',
    kind: 'notice',
    category: 'school',
    ages: [6, 8],
    weight: 7,
    once: true,
    when: inSchool,
    text: 'A wobbly front tooth gives up halfway through a reading lesson and lands on page twelve of a library book.',
    outcomes: [
      {
        chance: 0.6,
        text: 'The class gathers round as if it were a meteorite. You are famous until lunch.',
        effects: [{ stat: 'happiness', delta: 4 }],
      },
      {
        chance: 0.4,
        text: 'The book is overdue now, because nobody wants to touch page twelve. You keep the tooth in a crisp packet.',
        effects: [
          { stat: 'happiness', delta: 2 },
          { stat: 'looks', delta: -1 },
        ],
      },
    ],
  },
  {
    id: 'school_p_lunch_swap',
    kind: 'choice',
    category: 'social',
    ages: [6, 10],
    weight: 9,
    cooldownYears: 3,
    when: inSchool,
    text: '{classmate.first} slides a chocolate pudding across the lunch table and nods at your sandwich. It is a ham sandwich. It is also, somehow, the most valuable thing you own.',
    choices: [
      {
        id: 'trade',
        label: 'Make the trade',
        outcomes: [
          {
            chance: 1,
            text: 'The pudding is magnificent. {classmate.first} eats your sandwich with the relief of someone whose own lunch is always lentils.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { rel: 'classmate', delta: 6, memory: 'the great pudding trade' },
            ],
          },
        ],
      },
      {
        id: 'haggle',
        label: 'Demand the pudding and a biscuit',
        outcomes: [
          {
            chance: 0.5,
            text: '{classmate.first} hands over a biscuit with a look of grudging respect. A tycoon is born at table four.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'smarts', delta: 1 },
            ],
          },
          {
            chance: 0.5,
            text: 'Negotiations collapse. {classmate.first} trades with someone at table five instead and tells everyone you are greedy.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { rel: 'classmate', delta: -5, memory: 'the time you got greedy over a pudding' },
            ],
          },
        ],
      },
      {
        id: 'refuse',
        label: 'Keep your sandwich',
        outcomes: [
          {
            chance: 1,
            text: 'You eat the ham sandwich slowly while staring at the pudding. A lesson in principles, or possibly stubbornness.',
            effects: [
              { stat: 'discipline', delta: 2 },
              { stat: 'happiness', delta: -1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'school_p_bully_coat_peg',
    kind: 'choice',
    category: 'school',
    ages: [7, 11],
    weight: 8,
    cooldownYears: 4,
    when: inSchool,
    text: 'An older kid called Dorian Pask has claimed your coat peg and hung his bag on it. When you point this out, he hangs your coat in the bin.',
    choices: [
      {
        id: 'tell',
        label: 'Tell Mr Fennimore',
        outcomes: [
          {
            chance: 0.6,
            text: 'Mr Fennimore writes your name above the peg in permanent marker. Dorian sulks, but the peg is legally yours now.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'karma', delta: 1 },
            ],
          },
          {
            chance: 0.4,
            text: 'Mr Fennimore has a quiet word, and Dorian decides you are his new hobby.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { status: 'enemy', first: 'Dorian', gender: 'male' },
            ],
          },
        ],
      },
      {
        id: 'move_bag',
        label: 'Move his bag to the floor',
        outcomes: [
          {
            chance: 0.4,
            text: 'Dorian looks at the bag, looks at you, and somehow decides it is not worth it. You stand an inch taller all afternoon.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'discipline', delta: 1 },
            ],
          },
          {
            chance: 0.6,
            text: "A shoving match ends with both of you outside the head teacher's office and a feud that will outlive the coat.",
            effects: [
              { status: 'enemy', first: 'Dorian', gender: 'male' },
              { stat: 'happiness', delta: -3 },
              { flag: 'juvenile_warning' },
            ],
          },
        ],
      },
      {
        id: 'new_peg',
        label: 'Find a different peg',
        outcomes: [
          {
            chance: 1,
            text: 'The new peg is by the radiator, so your coat is always warm. Victory comes in strange shapes.',
            effects: [{ stat: 'happiness', delta: 1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'school_p_science_fair_volcano',
    kind: 'choice',
    category: 'school',
    ages: [7, 10],
    weight: 9,
    once: true,
    when: inSchool,
    text: 'The school science fair is in two weeks. Half your class is building a baking-soda volcano. You have bigger, slightly unclear ambitions.',
    choices: [
      {
        id: 'mould',
        label: 'Grow mould on six different breads',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.55),
            success: true,
            text: 'Your chart of mould colours is horrifying and thorough. The judges award you first place and wash their hands twice.',
            effects: [
              { stat: 'smarts', delta: 5 },
              { stat: 'discipline', delta: 3 },
              { stat: 'happiness', delta: 4 },
            ],
            next: { eventId: 'school_p_science_fair_regional', inYears: [1, 2] },
          },
          {
            chance: 0.4,
            text: 'The rye bread escapes its bag in your bedroom. Your project is now the whole house, and nobody is grateful.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { rel: 'mother', delta: -3, memory: 'the bread mould incident' },
            ],
          },
        ],
      },
      {
        id: 'volcano',
        label: 'Build a volcano, but bigger',
        outcomes: [
          {
            chance: 0.6,
            text: "Your volcano erupts all over the judges' table. Technically impressive. The judges are damp.",
            effects: [
              { stat: 'happiness', delta: 4 },
              { stat: 'smarts', delta: 1 },
            ],
          },
          {
            chance: 0.4,
            text: 'Your volcano refuses to erupt and just fizzes politely. You get a participation ribbon in a pale, apologetic green.',
            effects: [{ stat: 'happiness', delta: -2 }],
          },
        ],
      },
      {
        id: 'parent',
        label: 'Let {father.first} take over',
        outcomes: [
          {
            chance: 1,
            text: '{father.first} builds a working wind turbine and calls it "our" project. The judges can tell. Everyone can tell.',
            effects: [
              { rel: 'father', delta: 4, memory: 'the wind turbine you did not build' },
              { stat: 'karma', delta: -2 },
              { stat: 'smarts', delta: -1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'school_p_science_fair_regional',
    kind: 'choice',
    category: 'school',
    ages: [8, 12],
    weight: 10,
    chainOnly: true,
    when: inSchool,
    text: 'Your mould project has been invited to the regional science fair in {city}. A girl from another school has brought a robot that can sort socks.',
    choices: [
      {
        id: 'present',
        label: 'Present your mould with pride',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.45),
            success: true,
            text: 'You explain penicillin to a judge who keeps nodding. The sock robot takes gold; you take silver and a handshake from an actual scientist.',
            effects: [
              { stat: 'smarts', delta: 6 },
              { stat: 'happiness', delta: 6 },
              { addTrait: 'bookish' },
            ],
          },
          {
            chance: 0.5,
            text: 'The judges spend eleven minutes with the sock robot and forty seconds with your bread. Science, it turns out, is political.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'sabotage',
        label: "Hide one of the robot's socks",
        outcomes: [
          {
            chance: 0.5,
            text: 'The robot jams on an odd number and loops forever. You win bronze and feel uneasy about it for months.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { stat: 'karma', delta: -6 },
            ],
          },
          {
            chance: 0.5,
            text: 'A volunteer sees you pocket the sock. You are escorted from the hall past every school in the region.',
            effects: [
              { stat: 'happiness', delta: -6 },
              { stat: 'karma', delta: -4 },
              { flag: 'juvenile_warning' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'school_p_nativity_role',
    kind: 'choice',
    category: 'school',
    ages: [6, 9],
    weight: 8,
    cooldownYears: 3,
    when: inSchool,
    text: 'Casting for the end-of-term play is out. You have been given the role of Second Tree. You have no lines. You have one branch.',
    choices: [
      {
        id: 'commit',
        label: 'Become the best tree in history',
        outcomes: [
          {
            chance: 1,
            text: 'You sway with such conviction that a grandparent in the front row weeps. Ms Delacroix calls it "a brave choice".',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'discipline', delta: 2 },
              { rel: 'mother', delta: 3, memory: 'your swaying as Second Tree' },
            ],
          },
        ],
      },
      {
        id: 'improvise',
        label: 'Give the tree some lines',
        outcomes: [
          {
            chance: 0.5,
            text: 'Your tree delivers a short speech about loneliness and the audience roars. Ms Delacroix pretends it was planned.',
            effects: [{ stat: 'happiness', delta: 6 }, { addTrait: 'funny' }],
          },
          {
            chance: 0.5,
            text: "The tree talks over the lead's big moment. You are recast as Silent Rock for the second night.",
            effects: [
              { stat: 'happiness', delta: -3 },
              { stat: 'discipline', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'sick',
        label: 'Fake a cough on the night',
        outcomes: [
          {
            chance: 1,
            text: 'You stay home and watch cartoons. Second Tree is played by a coat stand, and nobody notices the difference.',
            effects: [
              { stat: 'happiness', delta: 1 },
              { stat: 'karma', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'school_p_sports_day_sack',
    kind: 'choice',
    category: 'school',
    ages: [6, 11],
    weight: 9,
    cooldownYears: 3,
    when: inSchool,
    text: 'Sports day. You are entered in the sack race against {classmate.first}, who has apparently been training in a pillowcase since Easter.',
    choices: [
      {
        id: 'hop',
        label: 'Hop like your life depends on it',
        outcomes: [
          {
            chance: oddsBy('health', 0.5),
            success: true,
            text: 'You win by a single hop and a lot of shouting. {classmate.first} demands a rematch next year.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { skill: 'athletics', delta: 3 },
              { rel: 'classmate', delta: -2, memory: 'the sack race you stole' },
            ],
          },
          {
            chance: 0.45,
            text: 'You go face first into the grass halfway down the track. The grass stains never come out.',
            effects: [{ injury: 2 }, { stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'shuffle',
        label: 'Shuffle instead of hopping',
        outcomes: [
          {
            chance: 0.6,
            text: 'The shuffle is slow but nobody can ban it. You come third and are photographed for the newsletter.',
            effects: [{ stat: 'happiness', delta: 3 }],
          },
          {
            chance: 0.4,
            text: 'The PE teacher, Mr Gruber, rules that shuffling is "not in the spirit of the sack". Disqualified.',
            effects: [{ stat: 'happiness', delta: -2 }],
          },
        ],
      },
      {
        id: 'team',
        label: 'Suggest a three-legged race instead',
        outcomes: [
          {
            chance: 1,
            text: 'You and {classmate.first} tie your legs together and fall over in perfect unison. Joint last place. Joint best day.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { rel: 'classmate', delta: 7, memory: 'falling over together at sports day' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'school_p_supply_teacher',
    kind: 'choice',
    category: 'school',
    ages: [7, 11],
    weight: 8,
    cooldownYears: 4,
    when: inSchool,
    text: "Your teacher is off sick, and the supply teacher, Mr Quill, does not know anyone's name. The class has quietly agreed to swap seats.",
    choices: [
      {
        id: 'join',
        label: "Answer to someone else's name",
        outcomes: [
          {
            chance: 0.6,
            text: 'For one glorious day you are called Priya and nobody can stop you. Mr Quill leaves a note that says only "good luck".',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'discipline', delta: -2 },
            ],
          },
          {
            chance: 0.4,
            text: 'Mr Quill has the seating plan. He reads it aloud slowly, one name at a time, and makes everyone move back.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { stat: 'discipline', delta: -1 },
            ],
          },
        ],
      },
      {
        id: 'help',
        label: 'Help him with the register',
        outcomes: [
          {
            chance: 0.5,
            text: 'Mr Quill is so grateful he lets you choose the end-of-day story. The class calls you a traitor, then enjoys the story.',
            effects: [
              { stat: 'karma', delta: 3 },
              { stat: 'happiness', delta: 2 },
            ],
          },
          {
            chance: 0.5,
            text: 'Everyone sees you helping. You eat lunch alone with a strong sense of having done the right thing.',
            effects: [
              { stat: 'karma', delta: 3 },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'school_p_reading_badge',
    kind: 'notice',
    category: 'school',
    ages: [6, 10],
    weight: 7,
    cooldownYears: 4,
    when: inSchool,
    text: 'The school library is running a reading challenge with a shiny badge for every ten books.',
    outcomes: [
      {
        chance: 0.5,
        text: 'You collect four badges and wear them all at once, like a tiny general. The librarian knows you by name now.',
        effects: [
          { stat: 'smarts', delta: 4 },
          { stat: 'discipline', delta: 2 },
        ],
      },
      {
        chance: 0.5,
        text: 'You read the same joke book ten times and argue it counts. The librarian gives you half a badge, cut with scissors.',
        effects: [
          { stat: 'happiness', delta: 3 },
          { stat: 'smarts', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'school_p_trip_farm',
    kind: 'choice',
    category: 'school',
    ages: [6, 10],
    weight: 8,
    cooldownYears: 4,
    when: inSchool,
    text: 'The class trip to a working farm reaches the goat pen. A sign says DO NOT FEED. A goat is looking at your packed lunch with real intent.',
    choices: [
      {
        id: 'feed',
        label: 'Feed the goat a crust',
        outcomes: [
          {
            chance: 0.5,
            text: 'The goat takes the crust gently, then the bag, then your lunch, then a corner of your coat. Worth it.',
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'discipline', delta: -1 },
            ],
          },
          {
            chance: 0.5,
            text: 'The farmer sees you and gives a loud talk about goat digestion to the whole class while pointing at you.',
            effects: [
              { stat: 'happiness', delta: -3 },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'obey',
        label: 'Obey the sign',
        outcomes: [
          {
            chance: 1,
            text: 'You keep your lunch and learn that a sheep can recognise faces. The goat holds a grudge.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { stat: 'discipline', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'dare',
        label: 'Dare {classmate.first} to do it',
        outcomes: [
          {
            chance: 1,
            text: '{classmate.first} feeds the goat and gets head-butted gently into a hay bale. You both laugh until the coach ride home.',
            effects: [
              { stat: 'happiness', delta: 4 },
              { rel: 'classmate', delta: 3, memory: 'the goat at the farm trip' },
              { stat: 'karma', delta: -1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'school_p_homework_dog',
    kind: 'choice',
    category: 'school',
    ages: [7, 11],
    weight: 8,
    cooldownYears: 4,
    when: inSchool,
    text: 'Your project on the solar system was due today. It currently exists as one planet, painted the wrong colour, drying on the kitchen table.',
    choices: [
      {
        id: 'truth',
        label: 'Tell Mrs Okonkwo the truth',
        outcomes: [
          {
            chance: 0.7,
            text: 'Mrs Okonkwo gives you until Friday and a look that says she expects all eight planets. You deliver nine, to be safe.',
            effects: [
              { stat: 'discipline', delta: 3 },
              { stat: 'karma', delta: 2 },
              { stat: 'smarts', delta: 2 },
            ],
          },
          {
            chance: 0.3,
            text: 'No extension. You spend break indoors colouring Saturn while everyone else plays outside.',
            effects: [
              { stat: 'happiness', delta: -3 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'excuse',
        label: 'Invent an elaborate excuse',
        outcomes: [
          {
            chance: 0.35,
            text: 'Your story involves a burst pipe and a heroic uncle. Mrs Okonkwo is so impressed by the plotting she lets it go.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'karma', delta: -3 },
            ],
          },
          {
            chance: 0.65,
            text: 'Mrs Okonkwo phones home to ask about the burst pipe. There is no pipe. There is a long car journey.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { rel: 'mother', delta: -3, memory: 'the made-up burst pipe' },
            ],
          },
        ],
      },
      {
        id: 'one_planet',
        label: 'Hand in the one planet with confidence',
        outcomes: [
          {
            chance: 1,
            text: 'You present it as "a study of Mars in depth". You get a C and a sticky note reading "nice try".',
            effects: [
              { stat: 'smarts', delta: 1 },
              { stat: 'happiness', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'school_p_new_kid',
    kind: 'choice',
    category: 'social',
    ages: [6, 11],
    weight: 8,
    cooldownYears: 4,
    when: inSchool,
    text: 'A new kid named Tomasz joins the class mid-year, speaks very little, and spends break standing next to the bins like he is guarding them.',
    choices: [
      {
        id: 'invite',
        label: 'Invite him into your game',
        outcomes: [
          {
            chance: 0.8,
            text: 'Tomasz turns out to be ruthless at tag and very funny once he trusts you. You have a new best mate.',
            effects: [
              { status: 'friend', first: 'Tomasz', gender: 'male' },
              { stat: 'karma', delta: 4 },
              { stat: 'happiness', delta: 4 },
            ],
          },
          {
            chance: 0.2,
            text: 'He shakes his head politely and goes back to the bins. You leave the door open, and that counts for something.',
            effects: [{ stat: 'karma', delta: 2 }],
          },
        ],
      },
      {
        id: 'ignore',
        label: 'Leave him be',
        outcomes: [
          {
            chance: 1,
            text: 'By summer, Tomasz has friends of his own. He nods at you in the corridor in a way you cannot quite read.',
            effects: [{ stat: 'karma', delta: -1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'school_p_detention_lines',
    kind: 'notice',
    category: 'school',
    ages: [8, 11],
    weight: 6,
    cooldownYears: 4,
    when: inSchool,
    text: 'You laugh at the wrong moment during assembly and earn a lunchtime detention with Mr Stannard, who believes in lines.',
    outcomes: [
      {
        chance: 0.5,
        text: 'You write "I will respect assembly" fifty times and your handwriting improves enormously. Small mercies.',
        effects: [
          { stat: 'discipline', delta: 3 },
          { stat: 'happiness', delta: -2 },
        ],
      },
      {
        chance: 0.5,
        text: 'Mr Stannard falls asleep after ten lines. You sit very still for forty minutes out of pure respect.',
        effects: [
          { stat: 'discipline', delta: 1 },
          { stat: 'happiness', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'school_p_class_pet_vote',
    kind: 'choice',
    category: 'school',
    ages: [6, 9],
    weight: 7,
    once: true,
    when: inSchool,
    text: 'Miss Varga lets the class vote on what to name the new classroom fish. The front runners are Bubbles and Captain Destruction.',
    choices: [
      {
        id: 'campaign',
        label: 'Campaign for Captain Destruction',
        outcomes: [
          {
            chance: 0.55,
            text: "Your speech about the fish's inner warrior wins by three votes. Captain Destruction swims in slow, peaceful circles.",
            effects: [{ stat: 'happiness', delta: 5 }, { addTrait: 'charming' }],
          },
          {
            chance: 0.45,
            text: 'Bubbles wins in a landslide. You are gracious in defeat, mostly, apart from the posters.',
            effects: [{ stat: 'happiness', delta: -2 }],
          },
        ],
      },
      {
        id: 'third',
        label: 'Propose a third name: Gerald',
        outcomes: [
          {
            chance: 1,
            text: "Nobody votes for Gerald except you and Miss Varga, who whispers that it is her dad's name. A secret bond forms.",
            effects: [
              { stat: 'happiness', delta: 2 },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  // -------------------------------------------------------------- secondary
  {
    id: 'school_s_bully_corridor',
    kind: 'choice',
    category: 'school',
    ages: [12, 15],
    weight: 8,
    cooldownYears: 5,
    when: inSchool,
    bind: { bully: { role: 'enemy', maxAge: 19 } },
    text: '{bully.first} has started blocking the stairwell between lessons and charging a "toll" of whatever is in your pockets.',
    choices: [
      {
        id: 'pay',
        label: 'Hand over your snacks',
        outcomes: [
          {
            chance: 1,
            text: 'You pay the toll in crisps for a whole term. {bully.first} grows confident. You grow hungry.',
            effects: [
              { stat: 'happiness', delta: -5 },
              { stat: 'stress', delta: 4 },
            ],
            next: { eventId: 'school_s_bully_reckoning', inYears: [1, 2] },
          },
        ],
      },
      {
        id: 'report',
        label: 'Report it to the head of year',
        outcomes: [
          {
            chance: 0.6,
            text: 'Mrs Hollingsworth posts a teacher on the stairs every break. {bully.first} is furious, and very quiet about it.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { rel: 'bully', delta: -6, memory: 'the day you told on them' },
            ],
            next: { eventId: 'school_s_bully_reckoning', inYears: [1, 2] },
          },
          {
            chance: 0.4,
            text: 'Nothing happens except that everyone now knows you reported it. The toll doubles.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { rel: 'bully', delta: -4, memory: 'you running to the teachers' },
            ],
          },
        ],
      },
      {
        id: 'other_stairs',
        label: 'Take the long way round',
        outcomes: [
          {
            chance: 1,
            text: 'The long way adds four minutes and goes past the science labs, which smell of burnt hair. You are late, but intact.',
            effects: [
              { stat: 'discipline', delta: -1 },
              { stat: 'health', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'school_s_bully_reckoning',
    kind: 'choice',
    category: 'school',
    ages: [13, 17],
    weight: 10,
    chainOnly: true,
    when: inSchool,
    bind: { bully: { role: 'enemy' } },
    text: 'At the bus stop you overhear {bully.first} being torn apart by an older cousin, loudly, over nothing. {bully.They} {bully.is} smaller than you remembered.',
    choices: [
      {
        id: 'stand_up',
        label: 'Tell the cousin to back off',
        outcomes: [
          {
            chance: 0.6,
            success: true,
            text: 'The cousin leaves, muttering. {bully.first} stares at you for a long time and then, unbelievably, says thanks.',
            effects: [
              { rel: 'bully', delta: 20, memory: 'the bus stop where you had their back' },
              { stat: 'karma', delta: 6 },
              { stat: 'happiness', delta: 3 },
            ],
          },
          {
            chance: 0.4,
            text: 'The cousin turns on you instead. {bully.first} watches it happen, and something in {bully.their} face shifts.',
            effects: [
              { injury: 3 },
              { rel: 'bully', delta: 10, memory: 'you taking a shove for them' },
              { stat: 'karma', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'gloat',
        label: 'Make sure {bully.first} sees you smiling',
        outcomes: [
          {
            chance: 1,
            text: 'It feels great for about six seconds. {bully.first} has a new reason to hate you and an old one confirmed.',
            effects: [
              { stat: 'karma', delta: -5 },
              { rel: 'bully', delta: -8, memory: 'your smile at the bus stop' },
              { stat: 'happiness', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'leave',
        label: 'Put your headphones in and walk',
        outcomes: [
          {
            chance: 1,
            text: 'You walk home the long way. The toll on the stairs quietly stops the next week, and neither of you mentions why.',
            effects: [
              { stat: 'stress', delta: -3 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'school_s_chemistry_fire',
    kind: 'choice',
    category: 'school',
    ages: [13, 16],
    weight: 8,
    cooldownYears: 4,
    when: inSchool,
    text: 'In chemistry, your Bunsen burner is doing something Dr Ferreira describes as "theatrical". Your lab partner {classmate.first} has stepped back two full metres.',
    choices: [
      {
        id: 'valve',
        label: 'Turn off the gas like you were taught',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.65),
            success: true,
            text: 'Click. Silence. Dr Ferreira gives you a nod usually reserved for her favourite periodic elements.',
            effects: [
              { stat: 'smarts', delta: 3 },
              { stat: 'discipline', delta: 2 },
            ],
          },
          {
            chance: 0.3,
            text: 'You turn the wrong knob and the flame roars a foot higher. Dr Ferreira handles it, then sits down for a while.',
            effects: [
              { stat: 'happiness', delta: -3 },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'show',
        label: 'Wave a pencil through it for the crowd',
        outcomes: [
          {
            chance: 1,
            text: 'The pencil ignites, the class cheers, and you get a lunchtime safety lecture with diagrams.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { stat: 'discipline', delta: -3 },
              { flag: 'juvenile_warning' },
            ],
          },
        ],
      },
      {
        id: 'partner',
        label: 'Ask {classmate.first} to handle it',
        outcomes: [
          {
            chance: 1,
            text: '{classmate.first} sighs, steps forward, and calmly saves you both. {classmate.They} will remind you of this forever.',
            effects: [
              { rel: 'classmate', delta: 4, memory: 'saving you from the Bunsen burner' },
              { stat: 'smarts', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'school_s_mock_exams',
    kind: 'choice',
    category: 'school',
    ages: [14, 17],
    weight: 10,
    cooldownYears: 2,
    when: inSchool,
    text: 'Mock exams start in three weeks. Your revision timetable is colour-coded, laminated, and completely untouched.',
    choices: [
      {
        id: 'revise',
        label: 'Actually follow the timetable',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.6),
            success: true,
            text: 'Three weeks of flashcards and cold toast pay off. Your results make {mother.first} read them twice.',
            effects: [
              { stat: 'smarts', delta: 6 },
              { stat: 'discipline', delta: 5 },
              { stat: 'stress', delta: 3 },
              { rel: 'mother', delta: 3, memory: 'your mock exam results' },
            ],
          },
          {
            chance: 0.35,
            text: 'You revise everything except the topic that comes up. Decent marks, and a deep personal grudge against trigonometry.',
            effects: [
              { stat: 'smarts', delta: 3 },
              { stat: 'discipline', delta: 3 },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'cram',
        label: 'Cram everything the night before',
        outcomes: [
          {
            chance: 0.4,
            text: 'Fuelled by panic and cereal, you scrape through. You remember none of it by lunch.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { stat: 'health', delta: -2 },
            ],
          },
          {
            chance: 0.6,
            text: 'You fall asleep on your notes and wake up with the French Revolution printed backwards on your cheek.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'shrug',
        label: 'They are only mocks',
        outcomes: [
          {
            chance: 1,
            text: 'Your results arrive in a sealed envelope that {father.first} opens at dinner. Silence, then the word "disappointed".',
            effects: [
              { stat: 'happiness', delta: 2 },
              { stat: 'discipline', delta: -4 },
              { rel: 'father', delta: -3, memory: 'your mock exam shrug' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'school_s_cafeteria_table',
    kind: 'choice',
    category: 'social',
    ages: [12, 15],
    weight: 9,
    cooldownYears: 4,
    when: inSchool,
    bind: { pal: { role: 'friend', maxAge: 19 } },
    text: 'The popular table has an empty seat, and someone there just waved at you. {pal.first} is sitting at your usual table, saving you a seat as always.',
    choices: [
      {
        id: 'popular',
        label: 'Take the seat at the popular table',
        outcomes: [
          {
            chance: 0.5,
            text: 'They are surprisingly nice and talk exclusively about a TV show you have never seen. You laugh at the right moments.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { rel: 'pal', delta: -8, memory: 'the day you swapped lunch tables' },
            ],
          },
          {
            chance: 0.5,
            text: 'The wave was for the person behind you. You sit down anyway, and the silence lasts the full length of a yoghurt.',
            effects: [
              { stat: 'happiness', delta: -5 },
              { rel: 'pal', delta: -3, memory: 'the lunch you tried to sit elsewhere' },
            ],
          },
        ],
      },
      {
        id: 'loyal',
        label: 'Sit with {pal.first}',
        outcomes: [
          {
            chance: 1,
            text: '{pal.first} pushes half a cookie across without a word. You are exactly where you are supposed to be.',
            effects: [
              { rel: 'pal', delta: 6, memory: 'always saving you a seat' },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'merge',
        label: 'Bring {pal.first} with you',
        outcomes: [
          {
            chance: 0.5,
            text: 'Two worlds collide, and {pal.first} turns out to be hilarious under pressure. Everyone eats together for a week.',
            effects: [
              { rel: 'pal', delta: 5, memory: 'crashing the popular table together' },
              { stat: 'happiness', delta: 5 },
            ],
          },
          {
            chance: 0.5,
            text: 'There is only one empty seat. You both stand there holding trays until it gets weird, then retreat.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { rel: 'pal', delta: 2, memory: 'the tray standoff' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'school_s_substitute_film',
    kind: 'notice',
    category: 'school',
    ages: [12, 16],
    weight: 6,
    cooldownYears: 3,
    when: inSchool,
    text: 'The substitute teacher, a tired man named Mr Brannigan, puts on a documentary about glaciers and leaves the room for fifty minutes.',
    outcomes: [
      {
        chance: 0.5,
        text: 'You watch the whole thing and become, briefly and intensely, invested in the fate of a glacier called Hilda.',
        effects: [
          { stat: 'smarts', delta: 3 },
          { stat: 'happiness', delta: 1 },
        ],
      },
      {
        chance: 0.5,
        text: 'The class descends into a paper-ball war. You take one in the ear and return fire with honour.',
        effects: [
          { stat: 'happiness', delta: 4 },
          { stat: 'discipline', delta: -2 },
        ],
      },
    ],
  },
  {
    id: 'school_s_essay_copy',
    kind: 'choice',
    category: 'school',
    ages: [13, 17],
    weight: 8,
    cooldownYears: 3,
    when: inSchool,
    text: '{classmate.first} offers to let you "borrow the structure" of last year\'s English essay on a poem about a heron. It got full marks.',
    choices: [
      {
        id: 'copy',
        label: 'Borrow the structure, and some words',
        outcomes: [
          {
            chance: 0.4,
            text: 'You hand it in with the confidence of a forger. Full marks, and an uneasy feeling every time someone mentions herons.',
            effects: [
              { stat: 'karma', delta: -4 },
              { stat: 'happiness', delta: 2 },
            ],
          },
          {
            chance: 0.6,
            text: "Mr Adeyemi marked last year's essays too. He has a very good memory and a very quiet voice when he is angry.",
            effects: [
              { stat: 'karma', delta: -3 },
              { stat: 'discipline', delta: -3 },
              { flag: 'juvenile_warning' },
              { rel: 'classmate', delta: -4, memory: 'getting dragged into your heron essay' },
            ],
          },
        ],
      },
      {
        id: 'own',
        label: 'Write your own, badly',
        outcomes: [
          {
            chance: 1,
            text: 'Your essay argues the heron is a metaphor for disappointment. Mr Adeyemi writes "bold" in the margin and gives you a B.',
            effects: [
              { stat: 'smarts', delta: 3 },
              { stat: 'discipline', delta: 3 },
              { stat: 'karma', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'school_s_debate_team',
    kind: 'choice',
    category: 'school',
    ages: [13, 17],
    weight: 8,
    once: true,
    when: inSchool,
    text: 'Ms Lindqvist needs one more person for the debate team. This week\'s motion: "This house would ban homework." You have strong feelings.',
    choices: [
      {
        id: 'join',
        label: 'Sign up and argue for the ban',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.5),
            success: true,
            text: 'You crush a team from across town with a speech that ends "and that is why I did not do my homework for this". A legend.',
            effects: [
              { stat: 'smarts', delta: 4 },
              { stat: 'happiness', delta: 5 },
              { addTrait: 'charming' },
            ],
          },
          {
            chance: 0.45,
            text: 'You lose your train of thought halfway and repeat your opening line twice. The other team is kind about it, which is worse.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'against',
        label: 'Sign up and argue against it',
        outcomes: [
          {
            chance: 1,
            text: 'Defending homework is so unpopular it becomes a sort of art. You lose, but Ms Lindqvist says you have "range".',
            effects: [
              { stat: 'smarts', delta: 3 },
              { stat: 'discipline', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Decline',
        outcomes: [
          {
            chance: 1,
            text: 'You go home and do no homework, which is a kind of debate in itself.',
            effects: [
              { stat: 'happiness', delta: 1 },
              { stat: 'discipline', delta: -1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'school_s_skip_trip',
    kind: 'choice',
    category: 'school',
    ages: [14, 17],
    weight: 7,
    cooldownYears: 4,
    when: inSchool,
    text: 'The geography trip to a reservoir in the rain stops at a motorway service station. {classmate.first} whispers that the coach will not notice two missing people for an hour.',
    choices: [
      {
        id: 'sneak',
        label: 'Slip off to the arcade',
        outcomes: [
          {
            chance: 0.45,
            text: 'You beat a racing game three times and get back with seconds to spare, smelling of hot dogs and triumph.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { rel: 'classmate', delta: 5, memory: 'the service station escape' },
            ],
          },
          {
            chance: 0.55,
            text: 'The coach does a headcount early. Forty classmates watch through the windows as Mr Pemberton marches you back.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { flag: 'juvenile_warning' },
              { rel: 'classmate', delta: 3, memory: 'getting caught together at the services' },
            ],
          },
        ],
      },
      {
        id: 'stay',
        label: 'Stay and look at the reservoir',
        outcomes: [
          {
            chance: 1,
            text: 'It rains on the reservoir. The reservoir does not care. You learn more about water tables than you ever wanted.',
            effects: [
              { stat: 'smarts', delta: 2 },
              { stat: 'discipline', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'school_s_rumour_mill',
    kind: 'choice',
    category: 'social',
    ages: [12, 16],
    weight: 8,
    cooldownYears: 4,
    when: inSchool,
    text: 'A rumour is going round that you cried in the toilets after a maths test. You did not. It was hay fever. The truth has never been less interesting.',
    choices: [
      {
        id: 'deny',
        label: 'Deny it loudly to everyone',
        outcomes: [
          {
            chance: 1,
            text: 'Nothing says "I definitely cried" like denying it in fourteen separate conversations. The rumour gains a second chapter.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'own_it',
        label: 'Say yes, and it was a hard test',
        outcomes: [
          {
            chance: 0.7,
            text: 'Several people quietly admit they cried too. A support group forms by the vending machines.',
            effects: [{ stat: 'happiness', delta: 4 }, { status: 'friend' }],
          },
          {
            chance: 0.3,
            text: 'It works on most people, but someone draws a crying face on your locker. You add a small hat to it.',
            effects: [{ stat: 'happiness', delta: 1 }, { addTrait: 'funny' }],
          },
        ],
      },
      {
        id: 'trace',
        label: 'Find out who started it',
        outcomes: [
          {
            chance: 0.5,
            text: 'The trail leads to {classmate.first}, who swears {classmate.they} only told one person. That person told the school.',
            effects: [
              { rel: 'classmate', delta: -6, memory: 'starting the toilet rumour' },
              { stat: 'smarts', delta: 1 },
            ],
          },
          {
            chance: 0.5,
            text: 'The investigation goes nowhere and makes the rumour bigger. You retire from detective work.',
            effects: [{ stat: 'stress', delta: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'school_s_sports_trials',
    kind: 'choice',
    category: 'school',
    ages: [12, 16],
    weight: 8,
    cooldownYears: 3,
    when: inSchool,
    text: 'Coach Mbeki is holding trials for the school hockey team. The equipment cupboard smells of a hundred years of shin pads.',
    choices: [
      {
        id: 'try',
        label: 'Go to trials',
        outcomes: [
          {
            chance: oddsBy('health', 0.45),
            success: true,
            text: 'You make the squad and get a shirt two sizes too big. Coach Mbeki calls you "Wheels", for reasons nobody explains.',
            effects: [
              { skill: 'athletics', delta: 5 },
              { stat: 'happiness', delta: 5 },
              { stat: 'discipline', delta: 3 },
            ],
          },
          {
            chance: 0.5,
            text: 'You spend trials mostly hitting your own ankles. Coach Mbeki suggests you might enjoy keeping score.',
            effects: [{ stat: 'happiness', delta: -3 }, { injury: 1 }],
          },
        ],
      },
      {
        id: 'with_friend',
        label: 'Go only if {friend.first} goes too',
        outcomes: [
          {
            chance: 1,
            text: '{friend.first} makes the team and you do not, but you become the loudest supporter on the sideline every Saturday.',
            effects: [
              { rel: 'friend', delta: 6, memory: 'you cheering at every hockey match' },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'skip',
        label: 'Stay in the library',
        outcomes: [
          {
            chance: 1,
            text: "The library is warm and smells of radiator dust. You read an entire novel about a lighthouse keeper's cat.",
            effects: [
              { stat: 'smarts', delta: 2 },
              { stat: 'happiness', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'school_s_phone_confiscated',
    fromYear: 2008,
    kind: 'notice',
    category: 'school',
    ages: [12, 17],
    weight: 6,
    cooldownYears: 3,
    when: inSchool,
    text: 'Your phone buzzes in the middle of a silent reading period. Mr Castellano holds out his hand without looking up.',
    outcomes: [
      {
        chance: 0.6,
        text: 'It sits in his desk drawer until the end of the day, with eleven unread messages from the family group chat.',
        effects: [
          { stat: 'happiness', delta: -3 },
          { stat: 'discipline', delta: 2 },
        ],
      },
      {
        chance: 0.4,
        text: 'He reads the notification aloud before confiscating it. It was {mother.first} asking whether you like courgettes.',
        effects: [
          { stat: 'happiness', delta: -4 },
          { rel: 'mother', delta: -1, memory: 'the courgette message read out in class' },
        ],
      },
    ],
  },
  {
    id: 'school_s_career_quiz',
    kind: 'notice',
    category: 'school',
    ages: [14, 17],
    weight: 6,
    once: true,
    when: inSchool,
    text: 'The school careers adviser runs everyone through a computer quiz that claims to predict your ideal profession.',
    outcomes: [
      {
        chance: 0.35,
        text: 'It suggests lighthouse keeper. You were hoping for something with more people, but the idea stays with you.',
        effects: [
          { stat: 'happiness', delta: 2 },
          { stat: 'smarts', delta: 1 },
        ],
      },
      {
        chance: 0.35,
        text: 'It says you would make an excellent accountant. You answered every question at random to see what would happen.',
        effects: [{ stat: 'happiness', delta: 1 }],
      },
      {
        chance: 0.3,
        text: 'The result is "surgeon", and it lands like a challenge. You start paying attention in biology, to your own surprise.',
        effects: [
          { stat: 'smarts', delta: 3 },
          { stat: 'discipline', delta: 3 },
          { addTrait: 'ambitious' },
        ],
      },
    ],
  },
  {
    id: 'school_s_sibling_same_teacher',
    kind: 'choice',
    category: 'school',
    ages: [12, 16],
    weight: 7,
    once: true,
    when: inSchool,
    bind: { sib: { role: 'sibling', minAge: 13 } },
    text: 'Your new history teacher, Mr Ibarra, reads the register, pauses at your surname and asks if you are related to {sib.first}. He does not look pleased.',
    choices: [
      {
        id: 'admit',
        label: 'Admit it',
        outcomes: [
          {
            chance: 0.5,
            text: 'Mr Ibarra watches you like a hawk all year. You earn every mark twice over, and grudgingly, his respect.',
            effects: [
              { stat: 'discipline', delta: 4 },
              { stat: 'smarts', delta: 2 },
              { stat: 'stress', delta: 3 },
            ],
          },
          {
            chance: 0.5,
            text: 'It turns out he means it fondly. {sib.first} was apparently "a delight". You have never heard anyone say this.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { rel: 'sib', delta: 3, memory: 'being called a delight by Mr Ibarra' },
            ],
          },
        ],
      },
      {
        id: 'deny',
        label: 'Claim it is a coincidence',
        outcomes: [
          {
            chance: 1,
            text: "Mr Ibarra nods slowly. At parents' evening, {sib.first} comes along to pick you up and waves at him.",
            effects: [
              { stat: 'karma', delta: -2 },
              { stat: 'happiness', delta: -2 },
              { rel: 'sib', delta: -2, memory: 'the time you disowned them at school' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'school_s_talent_tech_crew',
    kind: 'choice',
    category: 'school',
    ages: [13, 17],
    weight: 7,
    cooldownYears: 4,
    when: inSchool,
    text: 'The school play needs someone on lights. Mrs Drummond hands you a binder labelled CUES and explains that the lighting desk is "old but loyal".',
    choices: [
      {
        id: 'take',
        label: 'Run the lighting desk',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.55),
            success: true,
            text: 'You hit every cue. Nobody in the audience knows your name, and the cast buys you a doughnut at the after-party.',
            effects: [
              { stat: 'discipline', delta: 4 },
              { stat: 'happiness', delta: 4 },
              { status: 'friend' },
            ],
          },
          {
            chance: 0.4,
            text: 'The dramatic death scene happens in total darkness, followed by a sudden disco ball. Reviews are mixed.',
            effects: [
              { stat: 'happiness', delta: -2 },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'audition',
        label: 'Ask for an acting part instead',
        outcomes: [
          {
            chance: 1,
            text: 'Mrs Drummond casts you as Messenger Two, who enters, says "the duke is dead", and leaves. You rehearse it four hundred times.',
            effects: [
              { stat: 'happiness', delta: 3 },
              { skill: 'voice', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
];
