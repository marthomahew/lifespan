import type { ActivityDef } from './types';

/** More activities (SPEC §5.13): body and mind, vices, leisure, and prison life. */
export const MORE_ACTIVITIES: ActivityDef[] = [
  {
    id: 'doctor_visit',
    label: 'See a doctor',
    emoji: '🩺',
    group: 'mind_body',
    ages: [0, 120],
    cost: 120,
    limitPerYear: 2,
    special: 'doctor',
    description: 'A paper gown, a cold stethoscope, and some honest questions.',
    outcomes: [
      {
        chance: 0.5,
        success: true,
        text: 'The doctor listens, nods, and writes something illegible. You leave with a plan and a lollipop you did not ask for.',
        effects: [{ stat: 'health', delta: 3 }],
      },
      {
        chance: 0.3,
        text: 'You wait ninety minutes to be told to drink more water. You read every pamphlet in the room.',
        effects: [
          { stat: 'health', delta: 1 },
          { stat: 'stress', delta: 1 },
        ],
      },
      {
        chance: 0.2,
        success: true,
        text: 'A thorough check-up catches something small before it becomes something big. The doctor seems pleased with herself.',
        effects: [
          { stat: 'health', delta: 4 },
          { stat: 'stress', delta: -2 },
        ],
      },
    ],
  },
  {
    id: 'gym',
    label: 'Hit the gym',
    emoji: '🏋️',
    group: 'mind_body',
    ages: [12, 100],
    cost: 40,
    limitPerYear: 1,
    description: 'Lift heavy things and put them back down. Repeat all year.',
    outcomes: [
      {
        chance: 0.45,
        success: true,
        text: 'You stick with it. By autumn the stairs stop winning and your reflection starts looking smug.',
        effects: [
          { stat: 'health', delta: 5 },
          { stat: 'looks', delta: 3 },
          { skill: 'athletics', delta: 6 },
        ],
      },
      {
        chance: 0.35,
        success: true,
        text: 'You go twice a week, mostly. The regulars start nodding at you, which feels like a promotion.',
        effects: [
          { stat: 'health', delta: 3 },
          { stat: 'looks', delta: 1 },
          { skill: 'athletics', delta: 3 },
        ],
      },
      {
        chance: 0.2,
        text: 'You try to match the person on the next bench and pull something in your back that has a Latin name.',
        effects: [{ injury: 4 }, { skill: 'athletics', delta: 1 }],
      },
    ],
  },
  {
    id: 'diet',
    label: 'Go on a diet',
    emoji: '🥗',
    group: 'mind_body',
    ages: [12, 100],
    limitPerYear: 1,
    description: 'More vegetables, fewer regrets. In theory.',
    outcomes: [
      {
        chance: 0.45,
        success: true,
        text: 'You learn to like lentils, against all odds. Your trousers fit differently by spring.',
        effects: [
          { stat: 'health', delta: 4 },
          { stat: 'looks', delta: 2 },
          { stat: 'discipline', delta: 2 },
        ],
      },
      {
        chance: 0.3,
        text: 'Three weeks of salads end abruptly in front of the fridge, where you eat an entire birthday cake that was not yours.',
        effects: [
          { stat: 'happiness', delta: 2 },
          { stat: 'health', delta: -1 },
        ],
      },
      {
        chance: 0.25,
        success: true,
        text: 'You swap the afternoon snack for fruit and mostly mean it. Small changes, small results, no drama.',
        effects: [
          { stat: 'health', delta: 2 },
          { stat: 'looks', delta: 1 },
        ],
      },
    ],
  },
  {
    id: 'meditate',
    label: 'Meditate',
    emoji: '🧘',
    group: 'mind_body',
    ages: [10, 120],
    limitPerYear: 1,
    description: 'Sit still, breathe, and notice your thoughts wandering off.',
    outcomes: [
      {
        chance: 0.45,
        success: true,
        text: 'Ten minutes every morning. The world is just as loud, but you are slightly further away from it.',
        effects: [
          { stat: 'stress', delta: -12 },
          { stat: 'happiness', delta: 4 },
        ],
      },
      {
        chance: 0.3,
        success: true,
        text: 'You fall asleep during most sessions. Your app counts them anyway, and honestly so do you.',
        effects: [
          { stat: 'stress', delta: -8 },
          { stat: 'happiness', delta: 2 },
        ],
      },
      {
        chance: 0.25,
        success: true,
        text: 'On a silent retreat weekend you hear your own heartbeat for the first time in years. You drive home very slowly.',
        effects: [
          { stat: 'stress', delta: -15 },
          { stat: 'happiness', delta: 6 },
        ],
      },
    ],
  },
  {
    id: 'therapy',
    label: 'See a therapist',
    emoji: '🛋️',
    group: 'mind_body',
    ages: [10, 120],
    cost: 150,
    limitPerYear: 2,
    special: 'therapy',
    description: 'An hour a week with someone whose job is to listen.',
    outcomes: [
      {
        chance: 0.45,
        success: true,
        text: 'Your therapist asks one quiet question that rearranges a decade. You cry a little and feel lighter on the bus home.',
        effects: [
          { stat: 'stress', delta: -10 },
          { stat: 'happiness', delta: 5 },
        ],
      },
      {
        chance: 0.3,
        success: true,
        text: 'Most sessions feel like small talk with tissues. Then, in week nine, something shifts and stays shifted.',
        effects: [
          { stat: 'stress', delta: -6 },
          { stat: 'happiness', delta: 3 },
        ],
      },
      {
        chance: 0.25,
        text: 'The first therapist is not the right fit. You try another, and she is. Finding the right person counts as progress.',
        effects: [
          { stat: 'stress', delta: -4 },
          { stat: 'happiness', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'plastic_surgery',
    label: 'Cosmetic surgery',
    emoji: '💉',
    group: 'mind_body',
    ages: [18, 90],
    adultsOnly: true,
    cost: 8000,
    limitPerYear: 1,
    special: 'plastic_surgery',
    description: 'A new nose, a new jaw, a new you. Results may vary.',
    outcomes: [
      {
        chance: 0.55,
        success: true,
        text: 'When the swelling goes down, the mirror is kind. Strangers start holding doors open with unusual enthusiasm.',
        effects: [
          { stat: 'looks', delta: 14 },
          { stat: 'happiness', delta: 5 },
        ],
      },
      {
        chance: 0.3,
        text: 'You paid a lot of money to look like yourself after a long nap. Nobody notices. You tell nobody.',
        effects: [
          { stat: 'looks', delta: 2 },
          { stat: 'happiness', delta: -3 },
        ],
      },
      {
        chance: 0.15,
        text: 'Complications. A second operation fixes the worst of it, but your face now has opinions of its own.',
        effects: [{ stat: 'looks', delta: -10 }, { injury: 8 }, { stat: 'happiness', delta: -8 }],
      },
    ],
  },
  {
    id: 'practice_skill',
    label: 'Practise a skill',
    emoji: '🎯',
    group: 'mind_body',
    ages: [6, 100],
    limitPerYear: 2,
    special: 'practice',
    description: 'Put in the hours. Get a little less bad.',
    outcomes: [
      {
        chance: 0.45,
        success: true,
        text: 'You practise until it stops feeling like practice. Something that used to be hard is now just a thing you do.',
        effects: [
          { stat: 'happiness', delta: 3 },
          { stat: 'discipline', delta: 2 },
        ],
      },
      {
        chance: 0.35,
        success: true,
        text: 'Progress is slow and invisible until one evening it suddenly is not. You do a small victory lap of the kitchen.',
        effects: [
          { stat: 'happiness', delta: 2 },
          { stat: 'discipline', delta: 1 },
        ],
      },
      {
        chance: 0.2,
        text: 'You plateau for months and nearly quit twice. You keep going out of sheer stubbornness.',
        effects: [
          { stat: 'happiness', delta: -1 },
          { stat: 'discipline', delta: 3 },
        ],
      },
    ],
  },
  {
    id: 'learn_language',
    label: 'Learn a language',
    emoji: '🗣️',
    group: 'mind_body',
    ages: [6, 100],
    cost: 300,
    limitPerYear: 1,
    special: 'language',
    description: 'Lessons, flashcards, and an app that guilt-trips you nightly.',
    outcomes: [
      {
        chance: 0.4,
        success: true,
        text: 'Your tutor stops correcting every second word and starts correcting every fifth. You count this as fluency.',
        effects: [{ stat: 'smarts', delta: 2 }],
      },
      {
        chance: 0.35,
        success: true,
        text: 'A cartoon owl reminds you to practise 300 days in a row. You can now order soup and apologise for the soup.',
        effects: [{ stat: 'smarts', delta: 1 }],
      },
      {
        chance: 0.25,
        success: true,
        text: 'You watch a film without subtitles and understand most of the jokes, if not the plot.',
        effects: [
          { stat: 'smarts', delta: 2 },
          { stat: 'happiness', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'drink',
    label: 'Go drinking',
    emoji: '🍻',
    group: 'fun',
    ages: [16, 120],
    limitPerYear: 3,
    special: 'vice:alcohol',
    description: 'One drink, they said. They always say that.',
    outcomes: [
      {
        chance: 0.45,
        success: true,
        text: 'A loud, warm night with good people and a jukebox that only knows sad songs. You sing all of them.',
        effects: [
          { stat: 'happiness', delta: 5 },
          { stat: 'health', delta: -1 },
        ],
      },
      {
        chance: 0.3,
        text: 'Someone films you explaining your theory of everything to a coat rack. It circulates by breakfast.',
        effects: [
          { stat: 'happiness', delta: -3 },
          { stat: 'health', delta: -2 },
        ],
      },
      {
        chance: 0.25,
        text: 'The next morning arrives like a brass band in your skull. You promise the ceiling you will never do it again.',
        effects: [
          { stat: 'happiness', delta: -2 },
          { stat: 'health', delta: -3 },
        ],
      },
    ],
  },
  {
    id: 'smoke',
    label: 'Smoke',
    emoji: '🚬',
    group: 'fun',
    ages: [16, 120],
    limitPerYear: 3,
    special: 'vice:smoking',
    description: 'Five calm minutes now, a bill your lungs will send later.',
    outcomes: [
      {
        chance: 0.45,
        text: 'Outside in the cold, the first drag settles your nerves. For five minutes everything is fine. It is not fine.',
        effects: [
          { stat: 'stress', delta: -4 },
          { stat: 'health', delta: -2 },
        ],
      },
      {
        chance: 0.3,
        text: 'You bond with the smokers out back, the most honest people in any building. Your clothes smell of it for days.',
        effects: [
          { stat: 'stress', delta: -3 },
          { stat: 'happiness', delta: 1 },
          { stat: 'health', delta: -2 },
        ],
      },
      {
        chance: 0.25,
        text: 'A coughing fit on the stairs makes you stop halfway. You stand there a long moment, thinking about it.',
        effects: [
          { stat: 'stress', delta: -1 },
          { stat: 'health', delta: -3 },
        ],
      },
    ],
  },
  {
    id: 'casino',
    label: 'Visit a casino',
    emoji: '🎰',
    group: 'fun',
    ages: [18, 120],
    adultsOnly: true,
    limitPerYear: 2,
    special: 'casino',
    description: 'No clocks, no windows, free drinks. The house is patient.',
    outcomes: [
      {
        chance: 0.3,
        success: true,
        text: 'The dice love you tonight. A small crowd gathers to watch you win, and you leave before they can love you less.',
        effects: [{ stat: 'happiness', delta: 6 }],
      },
      {
        chance: 0.45,
        text: 'You lose steadily, politely, and all at once. The dealer gives you a sympathetic look that is probably in the training.',
        effects: [{ stat: 'happiness', delta: -5 }],
      },
      {
        chance: 0.25,
        text: 'Up, down, up, down. You walk out at three in the morning with exactly what you came in with and no idea where the night went.',
        effects: [{ stat: 'happiness', delta: 1 }],
      },
    ],
  },
  {
    id: 'lottery',
    label: 'Buy a lottery ticket',
    emoji: '🎟️',
    group: 'money',
    ages: [18, 120],
    adultsOnly: true,
    cost: 5,
    limitPerYear: 3,
    special: 'lottery',
    description: 'A tiny tax on hope, sold at the petrol station.',
    outcomes: [
      {
        chance: 0.35,
        text: 'You match one number. The ticket goes in the bin along with the beach house you had already furnished in your head.',
        effects: [{ stat: 'happiness', delta: -1 }],
      },
      {
        chance: 0.35,
        text: 'Your numbers are your family birthdays. The universe declines to acknowledge your family.',
        effects: [{ stat: 'happiness', delta: -1 }],
      },
      {
        chance: 0.3,
        text: 'You lose, but you spent a whole week deciding which relatives you would stop answering. Cheap entertainment.',
        effects: [{ stat: 'happiness', delta: 1 }],
      },
    ],
  },
  {
    id: 'vacation',
    label: 'Take a holiday',
    emoji: '🏖️',
    group: 'travel',
    ages: [6, 110],
    cost: 2500,
    limitPerYear: 1,
    description: 'Two weeks somewhere that is not here.',
    outcomes: [
      {
        chance: 0.5,
        success: true,
        text: 'Sun, salt, long lunches, and a phone you forget to charge. You come home a different colour and a calmer person.',
        effects: [
          { stat: 'happiness', delta: 15 },
          { stat: 'stress', delta: -12 },
        ],
      },
      {
        chance: 0.3,
        text: 'It rains for eleven of fourteen days. You become an expert on the local museum and its one café.',
        effects: [
          { stat: 'happiness', delta: 8 },
          { stat: 'stress', delta: -5 },
        ],
      },
      {
        chance: 0.2,
        text: 'The airline sends your suitcase to a different continent. You spend the week in souvenir T-shirts and make it work.',
        effects: [
          { stat: 'happiness', delta: 9 },
          { stat: 'stress', delta: -4 },
        ],
      },
    ],
  },
  {
    id: 'write_novel',
    label: 'Write a novel',
    emoji: '✍️',
    group: 'fun',
    ages: [14, 110],
    limitPerYear: 1,
    special: 'novel',
    description: 'Chapter one, again. This time for real.',
    outcomes: [
      {
        chance: 0.4,
        success: true,
        text: 'Every morning before work, a page. By December you have a stack you are almost not embarrassed by.',
        effects: [
          { skill: 'writing', delta: 6 },
          { stat: 'happiness', delta: 4 },
        ],
      },
      {
        chance: 0.35,
        text: "Writer's block. You reorganise your desk, your bookshelf, and finally your kitchen. The blank page stays blank.",
        effects: [
          { skill: 'writing', delta: 1 },
          { stat: 'happiness', delta: -3 },
        ],
      },
      {
        chance: 0.25,
        success: true,
        text: 'You type the last line of a full draft at two in the morning and sit in the dark grinning at nothing.',
        effects: [
          { skill: 'writing', delta: 8 },
          { stat: 'happiness', delta: 8 },
        ],
      },
    ],
  },
  {
    id: 'party_drugs',
    label: 'Party drugs',
    emoji: '🌀',
    group: 'crime',
    ages: [18, 90],
    adultsOnly: true,
    limitPerYear: 2,
    special: 'vice:party_drugs',
    description: 'A night that feels endless and a Tuesday that feels worse.',
    outcomes: [
      {
        chance: 0.45,
        text: 'The music gets inside you and you love everyone in the warehouse, briefly and completely.',
        effects: [
          { stat: 'happiness', delta: 6 },
          { stat: 'health', delta: -3 },
        ],
      },
      {
        chance: 0.35,
        text: 'The comedown lasts three grey days. Everything tastes of cardboard and you cancel all your plans.',
        effects: [
          { stat: 'happiness', delta: -6 },
          { stat: 'health', delta: -3 },
          { stat: 'stress', delta: 3 },
        ],
      },
      {
        chance: 0.2,
        text: 'You lose your friends, your jacket and four hours. Nobody can tell you where any of them went.',
        effects: [
          { stat: 'happiness', delta: -3 },
          { stat: 'health', delta: -4 },
        ],
      },
    ],
  },
  {
    id: 'pills',
    label: 'Pills',
    emoji: '💊',
    group: 'crime',
    ages: [18, 100],
    adultsOnly: true,
    limitPerYear: 2,
    special: 'vice:pills',
    description: 'Something to take the edge off every edge.',
    outcomes: [
      {
        chance: 0.4,
        text: 'A soft numbness settles over the week. Nothing hurts, which is not quite the same as anything feeling good.',
        effects: [
          { stat: 'happiness', delta: 3 },
          { stat: 'stress', delta: -3 },
          { stat: 'health', delta: -3 },
        ],
      },
      {
        chance: 0.35,
        text: 'You start counting the hours until the next one. The counting becomes the loudest thing in your life.',
        effects: [
          { stat: 'happiness', delta: -4 },
          { stat: 'stress', delta: 5 },
          { stat: 'health', delta: -3 },
        ],
      },
      {
        chance: 0.25,
        text: 'You sleep through an important day and wake to a phone full of worried messages. Shame does not numb.',
        effects: [
          { stat: 'happiness', delta: -6 },
          { stat: 'stress', delta: 6 },
          { stat: 'health', delta: -2 },
        ],
      },
    ],
  },
  {
    id: 'hard_drugs',
    label: 'Hard drugs',
    emoji: '☠️',
    group: 'crime',
    ages: [18, 90],
    adultsOnly: true,
    limitPerYear: 1,
    special: 'vice:hard_drugs',
    description: 'A road with very few exits.',
    outcomes: [
      {
        chance: 0.4,
        text: 'The high is enormous and the low is lower than anywhere you have been. You lose a week to both.',
        effects: [
          { stat: 'health', delta: -8 },
          { stat: 'happiness', delta: -4 },
        ],
      },
      {
        chance: 0.35,
        text: 'You wake up in a hospital bed with a nurse watching you closely. It was close. Everyone says so.',
        effects: [
          { stat: 'health', delta: -15 },
          { stat: 'stress', delta: 8 },
        ],
      },
      {
        chance: 0.25,
        text: 'An old friend sits you down and says your name like it is a question. You do not have an answer.',
        effects: [
          { stat: 'health', delta: -5 },
          { stat: 'happiness', delta: -5 },
          { stat: 'stress', delta: 4 },
        ],
      },
    ],
  },
  {
    id: 'rehab',
    label: 'Go to rehab',
    emoji: '🏥',
    group: 'mind_body',
    ages: [16, 120],
    cost: 15000,
    limitPerYear: 1,
    special: 'rehab',
    description: 'Thirty days, a lot of honesty, and a fresh start.',
    outcomes: [
      {
        chance: 0.5,
        success: true,
        text: "The first week is hell. The third is quieter. You leave with a counsellor's number and a plan you believe in.",
        effects: [
          { stat: 'stress', delta: -8 },
          { stat: 'happiness', delta: 6 },
          { stat: 'health', delta: 4 },
        ],
      },
      {
        chance: 0.3,
        success: true,
        text: 'You say things in group you have never said aloud. A stranger nods like they have lived it. They have.',
        effects: [
          { stat: 'stress', delta: -6 },
          { stat: 'happiness', delta: 4 },
        ],
      },
      {
        chance: 0.2,
        text: 'You leave early and regret it within a week. The door stays open, the staff tell you. Come back when you can.',
        effects: [
          { stat: 'stress', delta: 3 },
          { stat: 'happiness', delta: -2 },
        ],
      },
    ],
  },
  {
    id: 'support_group',
    label: 'Support group',
    emoji: '🪑',
    group: 'mind_body',
    ages: [14, 120],
    limitPerYear: 2,
    special: 'support',
    description: 'Folding chairs, bad coffee, good people.',
    outcomes: [
      {
        chance: 0.45,
        success: true,
        text: 'A circle of folding chairs in a church hall. You say your name and the truth in the same breath, and nobody flinches.',
        effects: [
          { stat: 'happiness', delta: 4 },
          { stat: 'stress', delta: -6 },
        ],
      },
      {
        chance: 0.3,
        success: true,
        text: 'A grey-haired regular offers to be your mentor. She texts every Sunday whether you answer or not.',
        effects: [
          { stat: 'happiness', delta: 5 },
          { stat: 'stress', delta: -5 },
        ],
      },
      {
        chance: 0.25,
        text: 'You mostly listen this time. The coffee is terrible and the stories are not, and that is enough for now.',
        effects: [
          { stat: 'happiness', delta: 2 },
          { stat: 'stress', delta: -3 },
        ],
      },
    ],
  },
  {
    id: 'prison_workout',
    label: 'Work out in the yard',
    emoji: '💪',
    group: 'prison',
    ages: [10, 120],
    limitPerYear: 1,
    special: 'prison:workout',
    description: 'Push-ups, pull-ups, and plenty of time.',
    outcomes: [
      {
        chance: 0.5,
        success: true,
        text: 'You do push-ups until the concrete knows your hands. By the end of the year your shirts are tight in new places.',
        effects: [
          { stat: 'health', delta: 5 },
          { stat: 'looks', delta: 3 },
          { skill: 'athletics', delta: 5 },
        ],
      },
      {
        chance: 0.3,
        success: true,
        text: 'An old lifer shows you a routine he has done every morning for twenty years. It is brutal and it works.',
        effects: [
          { stat: 'health', delta: 4 },
          { stat: 'looks', delta: 2 },
          { skill: 'athletics', delta: 4 },
        ],
      },
      {
        chance: 0.2,
        text: 'Someone is always on the bar you want. You make do with laps around the yard and a lot of pacing.',
        effects: [
          { stat: 'health', delta: 2 },
          { skill: 'athletics', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'prison_study',
    label: 'Study for a diploma',
    emoji: '📚',
    group: 'prison',
    ages: [10, 120],
    limitPerYear: 1,
    special: 'prison:diploma',
    description: 'Night classes with very strict attendance.',
    outcomes: [
      {
        chance: 0.5,
        success: true,
        text: 'You sit the exam in a room with a guard at the door. You pass, and frame the certificate with cardboard.',
        effects: [
          { stat: 'smarts', delta: 4 },
          { stat: 'happiness', delta: 4 },
        ],
      },
      {
        chance: 0.3,
        text: 'The volunteer teacher stops coming in March. You keep working through the textbook alone.',
        effects: [{ stat: 'smarts', delta: 2 }],
      },
      {
        chance: 0.2,
        success: true,
        text: 'Your cellmate quizzes you on fractions every night. You both get better at fractions.',
        effects: [
          { stat: 'smarts', delta: 3 },
          { stat: 'happiness', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'prison_allies',
    label: 'Make allies',
    emoji: '🤝',
    group: 'prison',
    ages: [10, 120],
    limitPerYear: 1,
    special: 'prison:allies',
    description: 'Everyone in here needs someone watching their back.',
    outcomes: [
      {
        chance: 0.5,
        success: true,
        text: 'You share your commissary snacks and your card tricks. Soon a few people save you a seat at dinner.',
        effects: [{ stat: 'happiness', delta: 5 }],
      },
      {
        chance: 0.3,
        success: true,
        text: 'You help an older inmate write letters to his daughter. He makes sure nobody bothers you after that.',
        effects: [
          { stat: 'happiness', delta: 4 },
          { stat: 'karma', delta: 2 },
        ],
      },
      {
        chance: 0.2,
        text: 'You try too hard and the whole block decides you are strange. Strange, at least, gets left alone.',
        effects: [{ stat: 'happiness', delta: -1 }],
      },
    ],
  },
  {
    id: 'prison_fight',
    label: 'Start a fight',
    emoji: '👊',
    group: 'prison',
    ages: [10, 120],
    limitPerYear: 1,
    special: 'prison:fight',
    description: 'Make a reputation. Or lose some teeth trying.',
    outcomes: [
      {
        chance: 0.4,
        success: true,
        text: 'It is over in seconds and you are still standing. The yard goes quiet when you walk through it now.',
        effects: [{ stat: 'karma', delta: -4 }, { notoriety: 4 }, { stat: 'happiness', delta: 2 }],
      },
      {
        chance: 0.4,
        text: 'You pick the wrong person. You spend a fortnight in the infirmary and a month in solitary.',
        effects: [{ stat: 'karma', delta: -3 }, { injury: 8 }, { stat: 'stress', delta: 6 }],
      },
      {
        chance: 0.2,
        text: 'The guards break it up before it really starts. Everyone still talks about it as if you won.',
        effects: [{ stat: 'karma', delta: -2 }, { notoriety: 2 }],
      },
    ],
  },
  {
    id: 'prison_riot',
    label: 'Join a riot',
    emoji: '🔥',
    group: 'prison',
    ages: [10, 120],
    limitPerYear: 1,
    special: 'prison:riot',
    description: 'The block boils over. You can be part of it.',
    outcomes: [
      {
        chance: 0.4,
        text: 'Mattresses burn and alarms scream for hours. You come out of it with a split lip and a lot of new paperwork.',
        effects: [{ injury: 5 }, { stat: 'stress', delta: 8 }, { notoriety: 2 }],
      },
      {
        chance: 0.35,
        text: 'You get swept along, then pinned against a wall when the response team arrives. Lockdown lasts a month.',
        effects: [{ injury: 3 }, { stat: 'stress', delta: 10 }],
      },
      {
        chance: 0.25,
        success: true,
        text: 'The riot wins one real concession: hot water in the showers. You were there. That counts for something in here.',
        effects: [{ stat: 'stress', delta: 4 }, { stat: 'happiness', delta: 3 }, { notoriety: 3 }],
      },
    ],
  },
  {
    id: 'prison_escape',
    label: 'Attempt an escape',
    emoji: '🏃',
    group: 'prison',
    ages: [10, 120],
    limitPerYear: 1,
    special: 'prison:escape',
    description: 'The fence is high. The odds are worse.',
    outcomes: [
      {
        chance: 0.15,
        success: true,
        text: 'A gap in the patrol, a dark night, and your legs carry you further than you thought possible. You are out.',
        effects: [
          { stat: 'happiness', delta: 10 },
          { stat: 'stress', delta: 10 },
        ],
      },
      {
        chance: 0.55,
        text: 'The searchlight finds you halfway up the fence. You are back in a cell before the coffee in the guard tower cools.',
        effects: [{ injury: 3 }, { stat: 'stress', delta: 8 }, { stat: 'happiness', delta: -5 }],
      },
      {
        chance: 0.3,
        text: 'You get as far as the laundry room, look at the wall, and go back to bed. Nobody ever knows.',
        effects: [
          { stat: 'stress', delta: 3 },
          { stat: 'happiness', delta: -2 },
        ],
      },
    ],
  },
  {
    id: 'prison_appeal',
    label: 'File an appeal',
    emoji: '⚖️',
    group: 'prison',
    ages: [10, 120],
    limitPerYear: 1,
    special: 'prison:appeal',
    description: 'One more shot at the courts.',
    outcomes: [
      {
        chance: 0.35,
        text: 'A legal aid lawyer reads your file and says the word "promising". You sleep better than you have in months.',
        effects: [
          { stat: 'happiness', delta: 4 },
          { stat: 'stress', delta: -3 },
        ],
      },
      {
        chance: 0.45,
        text: 'The rejection arrives in a single paragraph. It took them eleven months to write it.',
        effects: [
          { stat: 'happiness', delta: -5 },
          { stat: 'stress', delta: 4 },
        ],
      },
      {
        chance: 0.2,
        success: true,
        text: 'Someone misfiled a form at your trial. A judge with a fondness for procedure takes a very close look.',
        effects: [{ stat: 'happiness', delta: 6 }],
      },
    ],
  },
  {
    id: 'prison_library',
    label: 'Visit the library',
    emoji: '📖',
    group: 'prison',
    ages: [10, 120],
    limitPerYear: 1,
    special: 'prison:library',
    description: 'Three shelves of donated paperbacks and total silence.',
    outcomes: [
      {
        chance: 0.45,
        success: true,
        text: 'You read every book on the history shelf, including one about canals you will think about for years.',
        effects: [
          { stat: 'smarts', delta: 3 },
          { stat: 'stress', delta: -4 },
        ],
      },
      {
        chance: 0.35,
        success: true,
        text: 'The librarian, an inmate with half-moon glasses, starts setting books aside for you. Most are excellent.',
        effects: [
          { stat: 'smarts', delta: 2 },
          { stat: 'stress', delta: -5 },
          { stat: 'happiness', delta: 2 },
        ],
      },
      {
        chance: 0.2,
        text: 'Someone has torn out the last chapter of every mystery novel. You invent your own endings, with growing bitterness.',
        effects: [
          { stat: 'smarts', delta: 1 },
          { stat: 'stress', delta: -2 },
        ],
      },
    ],
  },
];
