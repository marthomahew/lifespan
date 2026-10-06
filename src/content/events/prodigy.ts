import type { EventDef } from '../../engine/events/types';

const chance =
  (skill: string, base: number) => (s: { player: { skills: Record<string, number> } }) =>
    Math.min(0.95, base + (s.player.skills[skill] ?? 0) / 200);
const musicChance = (base: number) => (s: { player: { skills: Record<string, number> } }) =>
  Math.min(
    0.95,
    base + Math.max(s.player.skills['instrument'] ?? 0, s.player.skills['voice'] ?? 0) / 200,
  );

/** A young talent noticed (fired by the prodigy system when a skill runs far ahead of age). */
export const PRODIGY_EVENTS: EventDef[] = [
  // ── Chess ────────────────────────────────────────────────────────────────
  {
    id: 'pr_chess_club',
    kind: 'notice',
    category: 'school',
    ages: [4, 13],
    weight: 1,
    chainOnly: true,
    text: 'At the library chess club, the champion is a retired engineer who has not lost in eleven years.',
    outcomes: [
      {
        chance: 1,
        text: 'You beat him in twenty-three moves, swinging your legs because your feet don’t reach the floor. He shakes your hand very seriously and asks for a rematch, which you also win.',
        effects: [
          { stat: 'happiness', delta: 6 },
          { fame: 1 },
          { skill: 'chess', delta: 3 },
          { flag: 'chess_kid' },
        ],
      },
    ],
  },
  {
    id: 'pr_chess_junior',
    kind: 'choice',
    category: 'school',
    ages: [6, 16],
    weight: 1,
    chainOnly: true,
    text: 'The national junior championship is in a hotel ballroom three hours away: two hundred children, silent clocks, and parents pacing the corridor.',
    choices: [
      {
        id: 'enter',
        label: 'Enter, and play to win',
        outcomes: [
          {
            chance: chance('chess', 0.25),
            text: 'Seven rounds, seven wins. In the last game your opponent offers a draw and you politely decline. The trophy is taller than your little cousin.',
            effects: [
              { fame: 4 },
              { money: 2000, kind: 'wage' },
              { stat: 'happiness', delta: 10 },
              { flag: 'junior_chess_champion' },
            ],
            success: true,
          },
          {
            chance: 0.35,
            text: 'You finish third after one careless bishop in round six. You replay that move in your head for a month, and never make it again.',
            effects: [{ stat: 'happiness', delta: -2 }, { skill: 'chess', delta: 5 }, { fame: 1 }],
          },
        ],
      },
      {
        id: 'later',
        label: 'Not this year: play for fun',
        outcomes: [
          {
            chance: 1,
            text: 'You spend the weekend at a friend’s birthday instead, and win every game of tag. Chess will still be there.',
            effects: [{ stat: 'happiness', delta: 4 }],
          },
        ],
      },
    ],
  },
  {
    id: 'pr_chess_master',
    kind: 'choice',
    category: 'school',
    ages: [8, 18],
    weight: 1,
    chainOnly: true,
    text: 'A grandmaster who watched you play at a weekend tournament writes to offer you a place in her training group: three evenings a week, and tournaments abroad in the holidays.',
    choices: [
      {
        id: 'train',
        label: 'Train with her',
        outcomes: [
          {
            chance: 1,
            text: 'She is strict, dry and brilliant, and she never praises a win, only a good idea. By the end of the year you have earned your first international title.',
            effects: [
              { skill: 'chess', delta: 10 },
              { fame: 4 },
              { stat: 'stress', delta: 8 },
              { flag: 'chess_international_master' },
            ],
          },
        ],
      },
      {
        id: 'childhood',
        label: 'Thank her, and stay a kid a while longer',
        outcomes: [
          {
            chance: 1,
            text: 'You write back, very politely, that you would like to be a kid for a while longer. She replies: “Good. The board will wait.”',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: -4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'pr_chess_grandmaster',
    kind: 'notice',
    category: 'fame',
    ages: [10, 31],
    weight: 1,
    chainOnly: true,
    text: 'A third grandmaster norm, in a cold tournament hall at the end of a long season.',
    outcomes: [
      {
        chance: 1,
        text: 'The federation makes it official: you are a grandmaster. The local paper calls you a genius, which you find embarrassing and keep anyway.',
        effects: [
          { fame: 8 },
          { stat: 'happiness', delta: 12 },
          { money: 5000, kind: 'wage' },
          { flag: 'chess_gm' },
        ],
      },
    ],
  },

  // ── Music ────────────────────────────────────────────────────────────────
  {
    id: 'pr_music_recital',
    kind: 'notice',
    category: 'fame',
    ages: [4, 12],
    weight: 1,
    chainOnly: true,
    text: 'The end-of-term recital: thirty children, one squeaky piano stool, and an audience of patient parents.',
    outcomes: [
      {
        chance: 1,
        text: 'You perform last. When you finish, nobody claps for a second, and then the whole hall stands up. A woman in the front row is crying and is not even your relative.',
        effects: [{ stat: 'happiness', delta: 8 }, { fame: 2 }, { flag: 'music_kid' }],
      },
    ],
  },
  {
    id: 'pr_music_conservatory',
    kind: 'choice',
    category: 'school',
    ages: [6, 15],
    weight: 1,
    chainOnly: true,
    text: 'A music conservatory invites you to audition for its junior school: lessons every day, practice rooms that never close, and very few weekends.',
    choices: [
      {
        id: 'audition',
        label: 'Audition',
        outcomes: [
          {
            chance: musicChance(0.3),
            text: 'The panel stops writing halfway through your piece. You start in September with a locker, a timetable, and the strange feeling of finally being among your people.',
            effects: [
              { skill: 'instrument', delta: 8 },
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: 6 },
              { flag: 'conservatory' },
            ],
            success: true,
          },
          {
            chance: 0.35,
            text: 'Your hands shake for the first time in your life. They offer you a place next year. You practise harder than you ever have.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { skill: 'instrument', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'normal',
        label: 'Stay at your ordinary school',
        outcomes: [
          {
            chance: 1,
            text: 'You keep your friends, your football and your lessons on Saturdays. At the school concert you are, by a wide margin, the best thing anyone has ever heard there.',
            effects: [{ stat: 'happiness', delta: 4 }],
          },
        ],
      },
    ],
  },
  {
    id: 'pr_music_debut',
    kind: 'choice',
    category: 'fame',
    ages: [8, 17],
    weight: 1,
    chainOnly: true,
    text: 'A city orchestra wants a young soloist for its spring concert. Two thousand seats, a famous conductor, and you, if you say yes.',
    choices: [
      {
        id: 'play',
        label: 'Say yes',
        outcomes: [
          {
            chance: musicChance(0.35),
            text: 'The conductor nods once at the start and once at the end, and in between you forget there is anyone in the room. The ovation lasts four minutes. A recording of it goes round the world.',
            effects: [
              { fame: 8 },
              { money: 3000, kind: 'wage' },
              { stat: 'happiness', delta: 12 },
              { flag: 'orchestra_debut' },
            ],
            success: true,
          },
          {
            chance: 0.3,
            text: 'A memory slip in the slow movement, eight bars of panic, then you find your way back. The review says “a remarkable talent, still growing.” You underline “remarkable” and hide the rest.',
            effects: [{ fame: 3 }, { stat: 'stress', delta: 8 }, { money: 1500, kind: 'wage' }],
          },
        ],
      },
      {
        id: 'wait',
        label: 'Not yet',
        outcomes: [
          {
            chance: 1,
            text: 'You go to the concert as a listener instead, in the cheap seats, and watch the soloist’s hands the whole time.',
            effects: [
              { stat: 'happiness', delta: 2 },
              { skill: 'instrument', delta: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'pr_music_composer',
    kind: 'notice',
    category: 'fame',
    ages: [10, 20],
    weight: 1,
    chainOnly: true,
    text: 'For two years you have been writing something of your own in the margins of your practice books.',
    outcomes: [
      {
        chance: 1,
        text: 'A youth orchestra premieres the first big piece of your own. You sit in the front row in a borrowed jacket while three hundred people hear the inside of your head. Critics use the word that begins with M.',
        effects: [
          { fame: 10 },
          { stat: 'happiness', delta: 15 },
          { money: 4000, kind: 'wage' },
          { flag: 'young_composer' },
        ],
      },
    ],
  },

  // ── Other gifts ─────────────────────────────────────────────────────────
  {
    id: 'pr_art_exhibit',
    kind: 'choice',
    category: 'fame',
    ages: [6, 15],
    weight: 1,
    chainOnly: true,
    text: 'A gallery owner sees your paintings pinned up in a café and offers you a show of your own. You are not tall enough to see over the counter.',
    choices: [
      {
        id: 'sell',
        label: 'Show them, and sell',
        outcomes: [
          {
            chance: 1,
            text: 'Every painting sells on the first night, including the one of the cat. A collector asks for “first refusal on the next period.” You don’t know what a period is.',
            effects: [
              { fame: 4 },
              { money: 4000, kind: 'wage' },
              { stat: 'happiness', delta: 8 },
              { flag: 'child_artist' },
            ],
          },
        ],
      },
      {
        id: 'keep',
        label: 'Show them, but keep them',
        outcomes: [
          {
            chance: 1,
            text: 'Every one is marked “not for sale,” which makes everyone want them more. The cat painting goes back on your bedroom wall.',
            effects: [{ fame: 3 }, { stat: 'happiness', delta: 6 }],
          },
        ],
      },
    ],
  },
  {
    id: 'pr_sport_academy',
    kind: 'choice',
    category: 'school',
    ages: [8, 15],
    weight: 1,
    chainOnly: true,
    text: 'A scout from a sports academy has watched three of your matches from the same spot on the touchline. Today she comes over with a folder.',
    choices: [
      {
        id: 'join',
        label: 'Join the academy',
        outcomes: [
          {
            chance: 1,
            text: 'Early mornings, ice baths, and a coach who can tell what you had for breakfast from how you run. You get faster every month.',
            effects: [
              { skill: 'athletics', delta: 10 },
              { stat: 'health', delta: 4 },
              { stat: 'stress', delta: 5 },
              { flag: 'sports_academy' },
            ],
          },
        ],
      },
      {
        id: 'local',
        label: 'Stay with your local team',
        outcomes: [
          {
            chance: 1,
            text: 'You stay with your mates and win the league by a distance. The scout leaves her card. You keep it in your boot.',
            effects: [{ stat: 'happiness', delta: 5 }],
          },
        ],
      },
    ],
  },
  {
    id: 'pr_code_app',
    kind: 'choice',
    category: 'money',
    ages: [9, 16],
    weight: 1,
    chainOnly: true,
    text: 'The little program you wrote after school, a homework planner with a dancing frog, is being used by a million students. A software company writes to your parents.',
    choices: [
      {
        id: 'sell',
        label: 'Sell it to them',
        outcomes: [
          {
            chance: 1,
            text: 'The cheque goes into a trust you can touch at eighteen. The frog gets a corporate redesign and stops dancing. You start on the next idea.',
            effects: [{ money: 40000, kind: 'wage' }, { fame: 3 }, { flag: 'teen_founder' }],
          },
        ],
      },
      {
        id: 'keep',
        label: 'Keep running it yourself',
        outcomes: [
          {
            chance: 1,
            text: 'You answer support emails between lessons and push updates at midnight. The ads bring in more than your parents earn, which makes for interesting dinners.',
            effects: [
              { money: 12000, kind: 'wage' },
              { skill: 'programming', delta: 6 },
              { stat: 'stress', delta: 6 },
              { flag: 'teen_founder' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'pr_young_author',
    kind: 'choice',
    category: 'fame',
    ages: [8, 16],
    weight: 1,
    chainOnly: true,
    text: 'Your story wins a national competition, and a publisher asks whether you have any more. You have a whole notebook.',
    choices: [
      {
        id: 'publish',
        label: 'Publish the notebook',
        outcomes: [
          {
            chance: 1,
            text: 'The book comes out with your school photo on the back. Reviewers are astonished, then a little jealous. You sign copies with a gel pen.',
            effects: [
              { fame: 5 },
              { money: 6000, kind: 'wage' },
              { stat: 'happiness', delta: 8 },
              { flag: 'published_novel' },
            ],
          },
        ],
      },
      {
        id: 'wait',
        label: 'Wait until it’s better',
        outcomes: [
          {
            chance: 1,
            text: 'You decide the stories deserve another draft, and so do you. The notebook goes in a drawer, fuller every year.',
            effects: [{ skill: 'writing', delta: 6 }],
          },
        ],
      },
    ],
  },
  {
    id: 'pr_junior_chef',
    kind: 'choice',
    category: 'fame',
    ages: [8, 15],
    weight: 1,
    chainOnly: true,
    text: 'A television cooking contest for under-sixteens wants you on the show. The audition dish: anything, in thirty minutes, with a camera in your face.',
    choices: [
      {
        id: 'compete',
        label: 'Go on the show',
        outcomes: [
          {
            chance: chance('cooking', 0.25),
            text: 'You win the final with a dessert the judges argue about for the whole ad break. Strangers stop you in the supermarket to ask about the caramel.',
            effects: [
              { fame: 6 },
              { money: 5000, kind: 'wage' },
              { stat: 'happiness', delta: 10 },
              { flag: 'junior_chef' },
            ],
            success: true,
          },
          {
            chance: 0.35,
            text: 'The custard splits on live television. You laugh, start again, and become the contestant everybody remembers anyway.',
            effects: [{ fame: 3 }, { stat: 'happiness', delta: 3 }],
          },
        ],
      },
      {
        id: 'no',
        label: 'Cook for your family instead',
        outcomes: [
          {
            chance: 1,
            text: 'You make the same dessert for your family on a Sunday. Nobody films it. It is perfect.',
            effects: [{ stat: 'happiness', delta: 4 }],
          },
        ],
      },
    ],
  },

  // ── The cost of it ───────────────────────────────────────────────────────
  {
    id: 'pr_burnout',
    kind: 'choice',
    category: 'school',
    ages: [11, 17],
    weight: 1,
    chainOnly: true,
    text: 'One evening you sit down to practise and simply can’t. Everyone your age seems to have a life. You have a schedule, and a gift that has started to feel like a job.',
    choices: [
      {
        id: 'push',
        label: 'Push through it',
        outcomes: [
          {
            chance: 1,
            text: 'You keep going on discipline alone. Slowly, the love comes back, a little different: less play, more purpose.',
            effects: [
              { stat: 'stress', delta: 10 },
              { stat: 'happiness', delta: -6 },
              { stat: 'discipline', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'break',
        label: 'Take a real summer off',
        outcomes: [
          {
            chance: 1,
            text: 'A summer of bikes, bad films and friends. In September you pick it up again and find you missed it, which is the best news of the year.',
            effects: [
              { stat: 'stress', delta: -12 },
              { stat: 'happiness', delta: 10 },
            ],
          },
        ],
      },
      {
        id: 'quit',
        label: 'Give it up for good',
        outcomes: [
          {
            chance: 1,
            text: 'You tell everyone you are done. It is the bravest thing you have ever said. The gift doesn’t vanish; it just waits, quietly, in case you ever want it back.',
            effects: [
              { stat: 'stress', delta: -15 },
              { stat: 'happiness', delta: 6 },
              { flag: 'quit_prodigy' },
              { system: 'focus_off' },
            ],
          },
        ],
      },
    ],
  },
];
