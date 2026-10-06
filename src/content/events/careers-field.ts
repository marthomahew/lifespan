import type { EventDef } from '../../engine/events/types';
import { all, hasJob, inField, isJob, jobLevelAtLeast, oddsBy, officeJob } from './conditions';

/** Field-specific working lives (agriculture, sports) and career-arc moments for anyone employed. */
export const CAREER_FIELD_EVENTS: EventDef[] = [
  // ---------- agriculture ----------
  {
    id: 'car_agri_late_frost',
    kind: 'choice',
    category: 'work',
    ages: [18, 57],
    weight: 8,
    cooldownYears: 5,
    when: all(inField('agriculture'), isJob('farmer')),
    text: 'The orchard is in full blossom and the overnight forecast has just dropped to minus three. Every flower out there is next autumn, and none of them are dressed for this.',
    choices: [
      {
        id: 'fires',
        label: 'Light braziers between the rows all night',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.55),
            text: 'You walk the rows until dawn feeding the fires, smelling of smoke and stubbornness. Most of the blossom survives. So, barely, do you.',
            effects: [
              { performance: 7 },
              { stat: 'stress', delta: 5 },
              { stat: 'health', delta: -2 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The wind shifts at three in the morning and blows the warmth into the neighbour’s field. Their pears have never looked better.',
            effects: [
              { performance: -3 },
              { stat: 'stress', delta: 7 },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'cloth',
        label: 'Buy frost cloth and drape the young trees',
        outcomes: [
          {
            chance: 1,
            text: 'The orchard spends the night looking like a field of badly wrapped presents. The young trees come through fine; the old ones take their chances.',
            effects: [{ money: -900 }, { performance: 4 }, { stat: 'stress', delta: -2 }],
            success: true,
          },
        ],
      },
      {
        id: 'sleep',
        label: 'Go to bed and let the season decide',
        outcomes: [
          {
            chance: 1,
            text: 'Morning shows a carpet of brown petals under every tree. You will be selling a very small, very exclusive harvest this year.',
            effects: [{ performance: -6 }, { money: -1500 }, { stat: 'happiness', delta: -5 }],
          },
        ],
      },
    ],
  },
  {
    id: 'car_agri_odd_catch',
    kind: 'choice',
    category: 'work',
    ages: [18, 57],
    weight: 8,
    cooldownYears: 6,
    when: all(inField('agriculture'), isJob('fisher')),
    text: 'The net comes up heavy with a grey, whiskered fish nobody on deck can name. The buyer at the dock takes one look and says the market wants nothing with that many teeth.',
    choices: [
      {
        id: 'restaurant',
        label: 'Sell it to a restaurant under a fancy name',
        outcomes: [
          {
            chance: 1,
            text: 'You call it "silver harbour bream" with total confidence. A chef pays cash, asks no questions, and wants to know when you can bring more.',
            effects: [{ money: 700 }, { performance: 3 }, { stat: 'karma', delta: -2 }],
            success: true,
            next: { eventId: 'car_agri_odd_catch_menu', inYears: [1, 3] },
          },
        ],
      },
      {
        id: 'release',
        label: 'Tip the lot back over the side',
        outcomes: [
          {
            chance: 1,
            text: 'The whiskered things vanish into the swell, looking faintly offended. You lose half a day and gain a clear conscience.',
            effects: [{ performance: -3 }, { stat: 'karma', delta: 3 }],
          },
        ],
      },
      {
        id: 'cook',
        label: 'Take a few home and work out how to cook them',
        outcomes: [
          {
            chance: 0.6,
            text: 'Slow-roasted with lemon, the mystery fish is excellent. Your kitchen will smell of it until the next equinox.',
            effects: [
              { skill: 'cooking', delta: 3 },
              { stat: 'happiness', delta: 4 },
            ],
          },
          {
            chance: 0.4,
            text: 'You find out why the market says no. You spend the evening very close to the bathroom.',
            effects: [
              { stat: 'health', delta: -4 },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_agri_odd_catch_menu',
    kind: 'choice',
    category: 'work',
    ages: [19, 60],
    weight: 9,
    chainOnly: true,
    when: all(inField('agriculture'), isJob('fisher')),
    text: '"Silver harbour bream" is now the most expensive item on three menus in town. A food writer wants to come out on your boat and meet the noble, ancient species you invented.',
    choices: [
      {
        id: 'confess',
        label: 'Admit you made the name up',
        outcomes: [
          {
            chance: 0.55,
            text: 'The writer is delighted and runs the confession as the story. Diners now order the ugly fish out of loyalty, and you are its only supplier.',
            effects: [{ money: 2500 }, { performance: 6 }, { stat: 'karma', delta: 3 }],
            success: true,
          },
          {
            chance: 0.45,
            text: 'The article is titled "The Fish That Wasn’t." The restaurants quietly drop it and stop answering your calls.',
            effects: [{ money: -400 }, { performance: -4 }, { stat: 'stress', delta: 4 }],
          },
        ],
      },
      {
        id: 'legend',
        label: 'Give the writer the full legend',
        outcomes: [
          {
            chance: 1,
            text: 'You describe moonlit spawning grounds and a grandfather who fished them. None of it is true, the piece is lovely, and the orders double.',
            effects: [
              { money: 3500 },
              { performance: 4 },
              { stat: 'karma', delta: -5 },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Say the boat is too busy for visitors',
        outcomes: [
          {
            chance: 1,
            text: 'The mystery holds, the price holds, and you go on hauling in a fish whose real name you still do not know.',
            effects: [{ money: 1200 }, { stat: 'stress', delta: -1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'car_agri_dog_garden',
    kind: 'choice',
    category: 'work',
    ages: [18, 57],
    weight: 8,
    cooldownYears: 5,
    when: all(inField('agriculture'), isJob('landscaper')),
    text: 'For the third week in a row, the client’s spaniel has dug up the new herb border and buried something in its place. Today it is a single leather slipper, planted with real care.',
    choices: [
      {
        id: 'design',
        label: 'Design a dig pit just for the dog',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.55),
            text: 'You build a sandy corner and bury a chew toy in it as bait. The spaniel adopts it on sight, and the client tells everyone on the street about you.',
            effects: [{ performance: 7 }, { money: 300 }, { stat: 'happiness', delta: 4 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The dog inspects the pit, digs a tunnel underneath it, and comes up in the rose bed. You admire the engineering despite yourself.',
            effects: [{ performance: -2 }, { stat: 'stress', delta: 4 }],
          },
        ],
      },
      {
        id: 'replant',
        label: 'Replant the herbs again, quietly',
        outcomes: [
          {
            chance: 1,
            text: 'You put the thyme back for the third time and invoice for the fourth. The spaniel watches from the patio, already planning.',
            effects: [{ money: 150 }, { stat: 'stress', delta: 3 }],
          },
        ],
      },
      {
        id: 'tell',
        label: 'Tell the client the dog is the problem',
        outcomes: [
          {
            chance: 1,
            text: '"He’s expressing himself," the client says, and moves your next visit to a month from now. The slipper stays where it was planted.',
            effects: [{ performance: -4 }, { stat: 'happiness', delta: -2 }],
          },
        ],
      },
    ],
  },
  // ---------- sports ----------
  {
    id: 'car_sport_contract_year',
    kind: 'choice',
    category: 'work',
    ages: [20, 36],
    weight: 8,
    cooldownYears: 4,
    when: all(inField('sports'), isJob('professional_athlete')),
    text: 'Your contract runs out at the end of the season, and every scout in the stands knows it. Your left hamstring knows it too, and it has started to make its opinions known on the sprints.',
    choices: [
      {
        id: 'through',
        label: 'Play through it and say nothing',
        outcomes: [
          {
            chance: oddsBy('health', 0.5),
            text: 'You strap it, grit your teeth and have the best month of your career. The leg holds. Your agent starts using the word "leverage."',
            effects: [
              { performance: 8 },
              { stat: 'stress', delta: 5 },
              { skill: 'athletics', delta: 1 },
            ],
            success: true,
            next: { eventId: 'car_sport_contract_talks', inYears: [1, 2] },
          },
          {
            chance: 0.45,
            text: 'It goes on a routine sprint, with a sound you feel more than hear. You are carried off to polite applause.',
            effects: [{ injury: 12 }, { performance: -8 }, { stat: 'happiness', delta: -6 }],
          },
        ],
      },
      {
        id: 'physio',
        label: 'Tell the team physio',
        outcomes: [
          {
            chance: 1,
            text: 'Two careful weeks on the bench and a lot of rubber bands. You come back sound, and slightly less of a talking point.',
            effects: [
              { performance: -2 },
              { stat: 'health', delta: 4 },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'manage',
        label: 'Coast the training, save it for match days',
        outcomes: [
          {
            chance: 0.6,
            text: 'Nobody notices you jogging the drills, and you are sharp when it counts. The coaches put it down to your famous composure.',
            effects: [{ performance: 4 }, { stat: 'discipline', delta: -2 }],
          },
          {
            chance: 0.4,
            text: 'The fitness coach notices. You are dropped for a week "to rediscover your hunger."',
            effects: [{ performance: -5 }, { stat: 'happiness', delta: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'car_sport_contract_talks',
    kind: 'choice',
    category: 'work',
    ages: [21, 38],
    weight: 9,
    chainOnly: true,
    when: all(inField('sports'), isJob('professional_athlete')),
    text: 'The club offers a new deal: less money than you hoped, more years than you expected. A rival side has made a bigger offer through your agent, who keeps saying "this is the moment" in a way that worries you.',
    choices: [
      {
        id: 'stay',
        label: 'Sign the long, loyal deal',
        outcomes: [
          {
            chance: 1,
            text: 'You sign at the training ground with a scarf around your neck. Security beats ambition, and the fans chant your name at the next home game.',
            effects: [
              { money: 20000 },
              { performance: 5 },
              { stat: 'stress', delta: -5 },
              { fame: 2 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'move',
        label: 'Take the bigger offer',
        outcomes: [
          {
            chance: 0.6,
            text: 'The new club pays handsomely and expects goals from day one. You deliver enough of them to silence the boos when you visit your old ground.',
            effects: [{ money: 60000 }, { stat: 'stress', delta: 6 }, { fame: 4 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Your new teammates have heard about the fee and pass to you a little less often than they should. The money arrives; the joy does not.',
            effects: [{ money: 45000 }, { performance: -6 }, { stat: 'happiness', delta: -6 }],
          },
        ],
      },
      {
        id: 'hold',
        label: 'Make both clubs wait a month',
        outcomes: [
          {
            chance: 0.5,
            text: 'Your agent was right. Both offers climb, you take the better one, and you learn to keep a straight face on the phone.',
            effects: [{ money: 70000 }, { performance: 2 }, { stat: 'stress', delta: 4 }],
          },
          {
            chance: 0.5,
            text: 'The rival club signs someone younger while you are deciding. The home club’s offer shrinks by the exact amount of your pride.',
            effects: [{ money: 10000 }, { performance: -3 }, { stat: 'happiness', delta: -5 }],
          },
        ],
      },
    ],
  },
  {
    id: 'car_sport_eleven_keepers',
    kind: 'choice',
    category: 'work',
    ages: [21, 60],
    weight: 8,
    cooldownYears: 5,
    when: all(inField('sports'), isJob('sports_coach')),
    text: 'Your new squad of eleven-year-olds has one demand: everyone wants to be goalkeeper. At the first practice, fourteen children stand in the same goal, wearing gloves that are far too big.',
    choices: [
      {
        id: 'rota',
        label: 'Run a strict goalkeeper rota',
        outcomes: [
          {
            chance: oddsBy('discipline', 0.55),
            text: 'Everyone gets a turn in goal and, between turns, finds out they quite like scoring. By midseason you have one keeper and thirteen strikers.',
            effects: [{ performance: 6 }, { stat: 'happiness', delta: 4 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The rota spreadsheet becomes the most fiercely argued document in the league. Three parents email you about fairness on the same evening.',
            effects: [{ performance: -2 }, { stat: 'stress', delta: 5 }],
          },
        ],
      },
      {
        id: 'chaos',
        label: 'Play a match with two keepers each',
        outcomes: [
          {
            chance: 1,
            text: 'It is not football as you know it, and the children have the best afternoon of their lives. You lose 0–1 and nobody cares.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: -3 },
              { performance: 2 },
            ],
          },
        ],
      },
      {
        id: 'pick',
        label: 'Pick the tallest kid and move on',
        outcomes: [
          {
            chance: 1,
            text: 'Efficient, and deeply unpopular. Thirteen children sulk through the drills, and one of them tells their mother you have "no vision."',
            effects: [
              { performance: -3 },
              { stat: 'karma', delta: -1 },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_sport_wedding_suit',
    fromYear: 2008,
    kind: 'choice',
    category: 'work',
    ages: [19, 60],
    weight: 8,
    cooldownYears: 5,
    when: all(inField('sports'), isJob('personal_trainer')),
    text: 'A new client has a wedding in three weeks, a suit two sizes too optimistic, and a firm belief that one session a week plus a smoothie will close the gap.',
    choices: [
      {
        id: 'honest',
        label: 'Tell them the honest timeline',
        outcomes: [
          {
            chance: oddsBy('karma', 0.55),
            text: 'They take it well, book a tailor and sign up for six months. On the wedding photos they look happy, and the suit fits.',
            effects: [{ performance: 6 }, { money: 400 }, { stat: 'karma', delta: 2 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'They thank you warmly and sign with the trainer across the street, who promises miracles in a vest.',
            effects: [{ performance: -3 }, { stat: 'happiness', delta: -2 }],
          },
        ],
      },
      {
        id: 'bootcamp',
        label: 'Put them through a three-week bootcamp',
        outcomes: [
          {
            chance: 0.6,
            text: 'Daily sessions, no bread, a lot of quiet swearing. The suit buttons on the morning of the wedding, though the client sits down very slowly.',
            effects: [{ performance: 5 }, { money: 900 }, { stat: 'stress', delta: 4 }],
          },
          {
            chance: 0.4,
            text: 'Day eleven: the client pulls something lifting a kettlebell they had no business lifting. You spend the session filling in an incident form.',
            effects: [
              { performance: -5 },
              { stat: 'stress', delta: 5 },
              { stat: 'karma', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'smoothie',
        label: 'Sell them the smoothie plan',
        outcomes: [
          {
            chance: 1,
            text: 'The money is easy and the smoothies are green. The suit is not consulted, and you avoid looking at the wedding photos online.',
            effects: [{ money: 500 }, { stat: 'karma', delta: -4 }],
          },
        ],
      },
    ],
  },
  // ---------- career arc (any full-time job) ----------
  {
    id: 'car_arc_first_reports',
    kind: 'choice',
    category: 'work',
    ages: [22, 55],
    weight: 8,
    once: true,
    when: all(hasJob, jobLevelAtLeast(2)),
    bind: { col: { role: 'coworker' } },
    text: 'Monday is your first week managing people, and one of them is {col.first}, who sat next to you last month and knows exactly what you used to say about management.',
    choices: [
      {
        id: 'one_on_ones',
        label: 'Book a proper one-to-one with everyone',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.55),
            text: 'You mostly listen, and write things down, and then actually do some of them. {col.first} admits you are better at this than {col.they} expected.',
            effects: [
              { performance: 7 },
              { rel: 'col', delta: 8, memory: 'your first week as the boss' },
              { stat: 'stress', delta: 2 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The meetings run long and someone cries about a parking space. You start to understand why your old managers looked so tired.',
            effects: [{ performance: 2 }, { stat: 'stress', delta: 6 }],
          },
        ],
      },
      {
        id: 'friend',
        label: 'Stay one of the gang',
        outcomes: [
          {
            chance: 1,
            text: 'Drinks on Friday are as fun as ever. Deadlines on Monday are now more of a suggestion, and everyone seems to know it but you.',
            effects: [
              { performance: -5 },
              { rel: 'col', delta: 5, memory: 'the Friday drinks you still came to' },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'firm',
        label: 'Set firm rules from day one',
        outcomes: [
          {
            chance: 1,
            text: 'Your rules are laminated and pinned to the kitchen wall. Work gets done; the chat goes quiet when you walk in.',
            effects: [
              { performance: 4 },
              { rel: 'col', delta: -6, memory: 'the laminated rules' },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_arc_headhunted',
    kind: 'choice',
    category: 'work',
    ages: [26, 58],
    weight: 7,
    cooldownYears: 7,
    when: all(hasJob, jobLevelAtLeast(1)),
    bind: { boss: { role: 'boss' } },
    text: 'A recruiter from a rival firm invites you for coffee "just to talk." By the second espresso there is a number written on a napkin, and it is bigger than the one on your payslip.',
    choices: [
      {
        id: 'leverage',
        label: 'Take the napkin to {boss.first}',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.5),
            text: '{boss.first} goes pale, makes a phone call and matches it by Friday. Nobody says the word napkin out loud.',
            effects: [
              { job: 'raise' },
              { performance: 2 },
              { rel: 'boss', delta: -3, memory: 'the counter-offer you forced' },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: '"Sounds like a great opportunity," {boss.first} says, holding the door. You are suddenly negotiating with no chair.',
            effects: [
              { performance: -6 },
              { rel: 'boss', delta: -8, memory: 'the rival offer you waved around' },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'think',
        label: 'Keep the napkin and think it over',
        outcomes: [
          {
            chance: 1,
            text: 'You fold the napkin into your wallet. It sits there for months, warm and quietly radioactive, and you work harder than ever while you decide.',
            effects: [{ stat: 'stress', delta: 3 }, { performance: 4 }],
          },
        ],
      },
      {
        id: 'loyal',
        label: 'Turn it down on the spot',
        outcomes: [
          {
            chance: 1,
            text: 'You thank the recruiter and pay for both coffees. Walking back to the office, you feel loyal, principled, and about twelve percent poorer.',
            effects: [{ stat: 'karma', delta: 2 }, { stat: 'happiness', delta: 1 }, { money: -10 }],
          },
        ],
      },
    ],
  },
  {
    id: 'car_arc_mentor_retires',
    kind: 'choice',
    category: 'work',
    ages: [24, 55],
    weight: 7,
    cooldownYears: 8,
    when: all(hasJob, jobLevelAtLeast(1)),
    bind: { col: { role: 'coworker', minAge: 58, minRelationship: 30 } },
    text: '{col.first}, who showed you where everything was and which rules were real, is retiring on Friday. The leaving card has been round twice and still has space on it.',
    choices: [
      {
        id: 'speech',
        label: 'Give a short speech at the send-off',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.5),
            text: 'You keep it to three minutes and one good story. {col.first} pretends there is something in {col.their} eye. Half the office does too.',
            effects: [
              { rel: 'col', delta: 15, memory: 'your speech at the leaving do' },
              { stat: 'happiness', delta: 5 },
              { performance: 3 },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'You mean every word and lose your place twice. {col.first} rescues you by starting the applause early, which is what {col.they} always did.',
            effects: [
              { rel: 'col', delta: 8, memory: 'the speech you fumbled for them' },
              { stat: 'stress', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'notes',
        label: 'Ask them to write down what they know',
        outcomes: [
          {
            chance: 1,
            text: '{col.first} hands you a battered notebook of unwritten rules, passwords and who to call when the printer jams. It is worth more than the training budget.',
            effects: [
              { performance: 6 },
              { stat: 'smarts', delta: 2 },
              { rel: 'col', delta: 5, memory: 'the notebook they left you' },
            ],
          },
        ],
      },
      {
        id: 'skip',
        label: 'Sign the card and leave it there',
        outcomes: [
          {
            chance: 1,
            text: 'You write "Enjoy the rest!" and mean to say more in person. By the time you look up, the desk is empty and the plant has been rehomed.',
            effects: [
              { rel: 'col', delta: -4, memory: 'the send-off you missed' },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_arc_train_replacement',
    kind: 'choice',
    category: 'work',
    ages: [55, 68],
    weight: 8,
    once: true,
    when: all(hasJob, jobLevelAtLeast(1)),
    bind: { col: { role: 'coworker', maxAge: 35 } },
    text: 'Management asks you to "share your knowledge" with {col.first}, who is twenty-something, cheerful, and has been given a desk next to yours and a job title suspiciously similar to yours.',
    choices: [
      {
        id: 'teach',
        label: 'Teach them everything, properly',
        outcomes: [
          {
            chance: 1,
            text: 'You hand over thirty years of shortcuts and scars. {col.first} absorbs it fast and credits you in every meeting. It stings less than you expected.',
            effects: [
              { performance: 5 },
              { rel: 'col', delta: 12, memory: 'everything you taught them' },
              { stat: 'karma', delta: 4 },
              { stat: 'happiness', delta: 3 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'guard',
        label: 'Keep the important bits to yourself',
        outcomes: [
          {
            chance: 0.6,
            text: 'Without your undocumented tricks the department stumbles whenever you are away. Your job is safe, for now. Your conscience files a complaint.',
            effects: [
              { performance: 3 },
              { rel: 'col', delta: -6, memory: 'the things you would not explain' },
              { stat: 'karma', delta: -4 },
            ],
          },
          {
            chance: 0.4,
            text: '{col.first} works it all out from old emails in a fortnight, and mentions to management that you were "not very forthcoming."',
            effects: [
              { performance: -6 },
              { rel: 'col', delta: -8, memory: 'how little you helped' },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'ask',
        label: 'Ask management straight out what the plan is',
        outcomes: [
          {
            chance: 1,
            text: 'After some coughing, they admit it is a succession plan and offer you a gentler workload until you choose your leaving date. At least now you know.',
            effects: [
              { stat: 'stress', delta: -4 },
              { stat: 'happiness', delta: -1 },
              { performance: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_arc_twenty_years',
    kind: 'choice',
    category: 'work',
    ages: [38, 68],
    weight: 6,
    once: true,
    when: all(hasJob, jobLevelAtLeast(2)),
    bind: { col: { role: 'coworker' } },
    text: 'By your count it is twenty years today since you first walked into this line of work. The calendar has nothing, the inbox has nothing, and the kitchen has someone else’s birthday cake.',
    choices: [
      {
        id: 'cake',
        label: 'Buy your own cake and announce it',
        outcomes: [
          {
            chance: 1,
            text: 'You put a lemon sponge in the kitchen with a card that says "20 years, apparently." {col.first} leads a slightly startled round of applause.',
            effects: [
              { money: -30 },
              { stat: 'happiness', delta: 5 },
              { rel: 'col', delta: 4, memory: 'your anniversary cake' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'mention',
        label: 'Mention it to {col.first} over coffee',
        outcomes: [
          {
            chance: 0.6,
            text: '{col.first} insists on taking you to lunch and asks what the job was like back then. You talk for an hour and enjoy every minute.',
            effects: [
              { rel: 'col', delta: 8, memory: 'your twenty-year lunch' },
              { stat: 'happiness', delta: 4 },
            ],
          },
          {
            chance: 0.4,
            text: '"Twenty years? Wow," says {col.first}, already looking at {col.their} phone. You return to your desk with your coffee and your milestone.',
            effects: [{ stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'quiet',
        label: 'Keep it to yourself',
        outcomes: [
          {
            chance: 1,
            text: 'You work the day as usual, then on the way home you take the long route past the first place you ever worked. It is a phone shop now.',
            effects: [
              { stat: 'stress', delta: -2 },
              { stat: 'happiness', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'car_arc_reorg_title',
    kind: 'choice',
    category: 'work',
    ages: [25, 64],
    weight: 7,
    cooldownYears: 8,
    when: all(officeJob, jobLevelAtLeast(1)),
    bind: { boss: { role: 'boss' } },
    text: 'After a six-month restructure with its own logo, your title is now "Lead Value Enablement Partner." Your desk, your duties and your pay are exactly what they were last Tuesday.',
    choices: [
      {
        id: 'embrace',
        label: 'Update your email signature with pride',
        outcomes: [
          {
            chance: 1,
            text: 'Strangers on calls assume you are important and treat you accordingly. You start to wonder if titles were the real job all along.',
            effects: [{ performance: 3 }, { stat: 'happiness', delta: 2 }],
            success: true,
          },
        ],
      },
      {
        id: 'ask_pay',
        label: 'Ask {boss.first} whether "lead" comes with pay',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.4),
            text: '{boss.first} checks the new framework and, to everyone’s surprise, finds a pay band attached to the word. Your raise arrives next month.',
            effects: [
              { job: 'raise' },
              { rel: 'boss', delta: 2, memory: 'the question about your title' },
            ],
          },
          {
            chance: 0.55,
            text: '"It’s more of a mindset," {boss.first} says, and books a follow-up to discuss your growth journey.',
            effects: [
              { stat: 'stress', delta: 3 },
              { rel: 'boss', delta: -2, memory: 'the mindset conversation' },
            ],
          },
        ],
      },
      {
        id: 'ignore',
        label: 'Keep doing the job and ignore the title',
        outcomes: [
          {
            chance: 1,
            text: 'You go on introducing yourself the old way. Eighteen months later the reorganisation is reorganised and your old title quietly returns.',
            effects: [
              { stat: 'stress', delta: -2 },
              { stat: 'discipline', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
];
