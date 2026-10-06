import type { EventDef } from '../../engine/events/types';
import type { GameState } from '../../engine/types';
import { all, hasPartner, isJob, jobLevelAtLeast, notInPrison, oddsBy } from './conditions';

const clamp = (v: number): number => Math.min(0.9, Math.max(0.05, v));
/** Selection: the body and the mind both get tested. */
const selectionOdds = (s: GameState): number =>
  clamp(0.3 + (s.player.stats.health + s.player.stats.smarts - 120) / 150);
/** An election: people vote for the decent and the familiar. */
const electionOdds = (s: GameState): number =>
  clamp(0.25 + (s.player.stats.karma - 50) / 120 + s.player.stats.fame / 150);
/** A screen test: the camera loves some faces, and the voice carries the rest. */
const screenOdds = (s: GameState): number =>
  clamp(0.2 + (s.player.stats.looks - 60) / 80 + (s.player.skills['voice'] ?? 0) / 250);
const goldOdds = (s: GameState): number =>
  Math.min(0.5, Math.max(0.03, ((s.player.skills['athletics'] ?? 0) - 70) / 60));
const medalOdds = (s: GameState): number =>
  Math.min(0.45, Math.max(0.1, ((s.player.skills['athletics'] ?? 0) - 60) / 80));

const astro = all(isJob('astronaut'), notInPrison);
const pol = all(isJob('politician'), notInPrison);
const spy = all(isJob('intelligence_officer'), notInPrison);
const dip = all(isJob('diplomat'), notInPrison);
const actor = all(isJob('film_actor'), notInPrison);

/** Rare careers: the knock on the door (special-paths.ts), and the years in the job after. */
export const SPECIAL_PATH_EVENTS: EventDef[] = [
  // ── Openings ─────────────────────────────────────────────────────────────
  {
    id: 'sp_astronaut_invite',
    kind: 'choice',
    category: 'work',
    ages: [26, 46],
    weight: 1,
    chainOnly: true,
    text: 'A letter on heavy paper from the space agency: they have read your flight record and your degree, and would like you to come to selection. Bring trainers.',
    choices: [
      {
        id: 'go',
        label: 'Go through selection',
        outcomes: [
          {
            chance: selectionOdds,
            text: 'Six weeks of tests: spinning chairs, cold water, logic puzzles at three in the morning. On the last day a woman in a blue jumpsuit shakes your hand and says, “Welcome to the class.”',
            effects: [
              { system: 'hire', arg: 'astronaut' },
              { stat: 'happiness', delta: 15 },
              { fame: 3 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'You make the final twelve, and not the final four. The letter is kind and handwritten, and says your file stays open. You frame it, slightly against your will.',
            effects: [{ stat: 'happiness', delta: -4 }, { flag: 'astronaut_finalist' }],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Stay where you are',
        outcomes: [
          {
            chance: 1,
            text: 'You write back that you are honoured, and settled. Some nights, flying above the clouds, you look up and wonder anyway.',
            effects: [{ stat: 'stress', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sp_politics_ask',
    kind: 'choice',
    category: 'work',
    ages: [25, 65],
    weight: 1,
    chainOnly: true,
    text: 'Three people from the local party turn up on your doorstep with a tin of biscuits and a proposal: the council seat is open, and they think you could win it.',
    choices: [
      {
        id: 'stand',
        label: 'Stand for the council',
        outcomes: [
          {
            chance: electionOdds,
            text: 'Leaflets, doorsteps, a hustings in a church hall that smells of floor polish. At two in the morning the returning officer reads your name, and the biscuit people cheer.',
            effects: [
              { system: 'hire', arg: 'politician' },
              { stat: 'happiness', delta: 10 },
              { fame: 4 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'You come a respectable second, two hundred votes short. Strangers stop you in the street to say they voted for you, which helps more than it should.',
            effects: [{ stat: 'happiness', delta: -3 }, { fame: 2 }, { flag: 'stood_for_council' }],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Thank them, and keep the biscuits',
        outcomes: [
          {
            chance: 1,
            text: 'You tell them you are more use where you are. They leave the tin anyway, which feels like a down payment on next time.',
            effects: [{ stat: 'happiness', delta: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sp_spy_approach',
    kind: 'choice',
    category: 'work',
    ages: [22, 45],
    weight: 1,
    chainOnly: true,
    text: 'On a park bench, a man with a newspaper he is not reading compliments your accent in three languages, then asks whether you have ever thought about serving your country quietly.',
    choices: [
      {
        id: 'accept',
        label: 'Hear him out, and say yes',
        outcomes: [
          {
            chance: 1,
            text: 'An interview in an office with no sign, a test you are not told is a test, and a contract you can never mention. Your family is delighted about your new job in logistics.',
            effects: [
              { system: 'hire', arg: 'intelligence_officer' },
              { stat: 'stress', delta: 6 },
              { stat: 'happiness', delta: 6 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'decline',
        label: 'Say you are happy as you are',
        outcomes: [
          {
            chance: 1,
            text: 'He nods as if he expected it and leaves a plain white card with only a number on it. You burn it in the sink that evening, then wonder why you felt you had to.',
            effects: [{ stat: 'stress', delta: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sp_diplomat_offer',
    kind: 'choice',
    category: 'work',
    ages: [23, 50],
    weight: 1,
    chainOnly: true,
    text: 'The foreign ministry is recruiting people who can apologise convincingly in several languages. Someone has put your name forward, and the invitation is very politely worded.',
    choices: [
      {
        id: 'accept',
        label: 'Join the diplomatic service',
        outcomes: [
          {
            chance: 1,
            text: 'Induction week teaches you protocol, seating plans and the eleven ways to say “we note your concerns”. You leave with a lanyard and a strong opinion about forks.',
            effects: [
              { system: 'hire', arg: 'diplomat' },
              { stat: 'happiness', delta: 8 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'decline',
        label: 'Decline, diplomatically',
        outcomes: [
          {
            chance: 1,
            text: 'Your refusal is so gracious that they write back to say it proves their point. You keep the letter in a drawer for bad days.',
            effects: [{ stat: 'happiness', delta: 3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sp_screen_test',
    kind: 'choice',
    category: 'fame',
    ages: [16, 40],
    weight: 1,
    chainOnly: true,
    text: 'A casting director stops you outside a café, apologises for staring, and asks if you have ever been on camera. She is making a film and needs a face exactly like yours.',
    choices: [
      {
        id: 'test',
        label: 'Do the screen test',
        outcomes: [
          {
            chance: screenOdds,
            text: 'You read two pages opposite a bored assistant, and somewhere in the second page you forget to be nervous. She calls that evening: a small part, a real one, and an agent who wants to meet you.',
            effects: [
              { system: 'hire', arg: 'film_actor' },
              { fame: 4 },
              { stat: 'happiness', delta: 10 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'You freeze on the first line and never quite thaw. She is kind about it, and you walk home replaying everything you should have done with your hands.',
            effects: [{ stat: 'happiness', delta: -3 }],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Laugh, and keep walking',
        outcomes: [
          {
            chance: 1,
            text: 'You tell her you are flattered and busy, and keep walking. For a week you catch yourself checking your reflection in shop windows.',
            effects: [{ stat: 'happiness', delta: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sp_olympics',
    kind: 'choice',
    category: 'fame',
    ages: [17, 32],
    weight: 1,
    chainOnly: true,
    text: 'The national federation rings with news: you have been selected for the Olympic Games. A kit bag arrives with your name on it, spelled correctly at the second attempt.',
    choices: [
      {
        id: 'compete',
        label: 'Go to the Games',
        outcomes: [
          {
            chance: goldOdds,
            text: 'Gold. You do not remember crossing the line, only the anthem afterwards and trying very hard not to cry on the podium, and failing gloriously.',
            effects: [
              { flag: 'olympic_gold' },
              { flag: 'olympic_medal' },
              { fame: 20 },
              { stat: 'happiness', delta: 20 },
            ],
            success: true,
          },
          {
            chance: medalOdds,
            text: 'A medal: not the shiny one, but heavier than you expected. Your home town paints a postbox in your honour.',
            effects: [{ flag: 'olympic_medal' }, { fame: 10 }, { stat: 'happiness', delta: 14 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You finish sixth, a personal best on the biggest stage there is. No medal, but you walked into that stadium with the whole world watching, and that stays.',
            effects: [{ stat: 'happiness', delta: 8 }, { fame: 3 }, { flag: 'olympian' }],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Decline: you can’t take the time',
        outcomes: [
          {
            chance: 1,
            text: 'You turn down the place and give the kit bag to the reserve, who weeps with joy. Every four years after, you watch the opening ceremony with complicated feelings.',
            effects: [{ stat: 'happiness', delta: -4 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sp_michelin',
    kind: 'notice',
    category: 'work',
    ages: [18, 100],
    weight: 1,
    chainOnly: true,
    text: 'A quiet diner ate alone at table nine in spring, ordered everything, and left an enormous tip. This morning the restaurant guide publishes its list.',
    outcomes: [
      {
        chance: 1,
        text: 'A star. The kitchen goes silent, then the dishwasher starts banging a pan and everyone joins in. The phone does not stop ringing for a month, and the booking book fills to autumn.',
        effects: [
          { fame: 8 },
          { stat: 'happiness', delta: 14 },
          { flag: 'michelin_star' },
          { system: 'biz_health', arg: '20' },
        ],
      },
    ],
  },
  {
    id: 'sp_nobel',
    kind: 'notice',
    category: 'fame',
    ages: [40, 110],
    weight: 1,
    chainOnly: true,
    text: 'The phone rings at dawn. A polite voice from Stockholm asks whether you are sitting down, and whether you would mind being woken for something rather good.',
    outcomes: [
      {
        chance: 1,
        text: 'A Nobel prize, for the work everyone told you was a dead end. By lunchtime there are cameras on your lawn. In December you shake a king’s hand in borrowed shoes.',
        effects: [
          { money: 500000, kind: 'wage' },
          { fame: 15 },
          { stat: 'happiness', delta: 18 },
          { flag: 'nobel_laureate' },
        ],
      },
    ],
  },

  // ── Astronaut ────────────────────────────────────────────────────────────
  {
    id: 'sp_ast_training',
    kind: 'choice',
    category: 'work',
    ages: [26, 65],
    weight: 10,
    cooldownYears: 4,
    when: astro,
    text: 'Training week: the centrifuge on Monday, six hours in the giant pool in a pressure suit on Wednesday, and a sim on Friday that the instructors have promised will go wrong.',
    choices: [
      {
        id: 'push',
        label: 'Push yourself to the top of the class',
        outcomes: [
          {
            chance: oddsBy('health', 0.5),
            text: 'You keep your lunch through nine g and fix the Friday fault before the instructor finishes his coffee. The flight surgeon writes “unflappable” on your file.',
            effects: [{ performance: 12 }, { stat: 'stress', delta: 6 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You push too hard in the pool and come out with a shoulder that clicks. Two weeks on light duties, watching the others train.',
            effects: [{ performance: -4 }, { stat: 'health', delta: -4 }],
          },
        ],
      },
      {
        id: 'steady',
        label: 'Pace yourself: it’s a long career',
        outcomes: [
          {
            chance: 1,
            text: 'Middle of the pack, every test passed, no drama. The old hands nod approvingly. Steady is what they want in a tin can.',
            effects: [{ performance: 4 }, { stat: 'stress', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sp_ast_launch',
    kind: 'notice',
    category: 'work',
    ages: [26, 65],
    weight: 12,
    once: true,
    when: astro,
    text: 'Launch day. You are strapped in on your back at the top of a very tall controlled explosion, listening to a voice count backwards.',
    outcomes: [
      {
        chance: 1,
        text: 'Eight and a half minutes of being shaken like a tin of paint, then silence, and a pen floats up past your nose. Out of the window, the whole curve of the world. You laugh out loud.',
        effects: [
          { flag: 'been_to_space' },
          { stat: 'happiness', delta: 25 },
          { fame: 6 },
          { performance: 8 },
        ],
      },
    ],
  },
  {
    id: 'sp_ast_spacewalk',
    kind: 'choice',
    category: 'work',
    ages: [26, 65],
    weight: 9,
    cooldownYears: 5,
    when: all(astro, jobLevelAtLeast(2)),
    text: 'Mission control has a job outside: a panel that won’t deploy on the station’s far side. Seven hours in the suit, holding on with one hand and working with the other.',
    choices: [
      {
        id: 'volunteer',
        label: 'Volunteer for the spacewalk',
        outcomes: [
          {
            chance: 0.8,
            text: 'You free the panel in the fourth hour, then let yourself look down for exactly one minute. The ocean below is bluer than any word you own.',
            effects: [
              { performance: 14 },
              { fame: 4 },
              { stat: 'happiness', delta: 12 },
              { flag: 'spacewalker' },
            ],
            success: true,
          },
          {
            chance: 0.2,
            text: 'The bolt will not budge. You come back in after eight hours with nothing to show but aching hands, and a crewmate finishes it the next week.',
            effects: [{ performance: -2 }, { stat: 'stress', delta: 8 }],
          },
        ],
      },
      {
        id: 'support',
        label: 'Run the robotic arm from inside',
        outcomes: [
          {
            chance: 1,
            text: 'You fly the arm with the delicacy of someone defusing a cake. The walkers get the credit; the crew knows who held them steady.',
            effects: [{ performance: 6 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sp_ast_emergency',
    kind: 'choice',
    category: 'work',
    ages: [26, 65],
    weight: 8,
    cooldownYears: 8,
    when: astro,
    text: 'An alarm in the middle of the station’s night: a pressure reading that should not be falling is falling, slowly. Six sleepy faces turn to you.',
    choices: [
      {
        id: 'calm',
        label: 'Work the checklist, calmly',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.55),
            text: 'You find the leak behind a storage panel within the hour and seal it with something the manual calls a patch and you call a miracle. Mission control applauds over the loop.',
            effects: [{ job: 'promote' }, { fame: 5 }, { stat: 'happiness', delta: 8 }],
            success: true,
          },
          {
            chance: 0.35,
            text: 'It takes a long, quiet night, two crewmates and a spare part from the toilet, but the reading levels out. You do not sleep properly for a week afterwards.',
            effects: [{ performance: 6 }, { stat: 'stress', delta: 12 }],
          },
        ],
      },
      {
        id: 'ground',
        label: 'Wake mission control and wait for instructions',
        outcomes: [
          {
            chance: 1,
            text: 'The ground talks you through it step by step. By procedure, perfectly. Someone on the loop sounds disappointed you did not improvise.',
            effects: [{ performance: 2 }, { stat: 'stress', delta: 6 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sp_ast_home',
    kind: 'choice',
    category: 'family',
    ages: [26, 70],
    weight: 9,
    cooldownYears: 6,
    when: all(astro, (s) => s.player.flags.includes('been_to_space')),
    text: 'Back on the ground, you find you can’t stop thinking about how thin the atmosphere looked from up there, and how small the arguments are underneath it.',
    choices: [
      {
        id: 'family',
        label: 'Spend a long summer with the people you love',
        outcomes: [
          {
            chance: 1,
            text: 'You take every day of leave you are owed and spend it in kitchens and on beaches. Nobody can quite say what has changed about you, only that they like it.',
            effects: [
              { stat: 'happiness', delta: 12 },
              { stat: 'stress', delta: -10 },
              { performance: -4 },
            ],
          },
        ],
      },
      {
        id: 'talks',
        label: 'Give talks about it in schools',
        outcomes: [
          {
            chance: 1,
            text: 'You visit forty schools. A nine-year-old asks how you sneeze in a helmet, and a teenager at the back asks how you come back down. You answer both honestly.',
            effects: [{ fame: 4 }, { stat: 'karma', delta: 6 }, { stat: 'happiness', delta: 6 }],
          },
        ],
      },
      {
        id: 'again',
        label: 'Get straight back in line for the next flight',
        outcomes: [
          {
            chance: 1,
            text: 'You are first in the office every morning. The chief notices; so do the people waiting at home.',
            effects: [{ performance: 10 }, { stat: 'stress', delta: 6 }],
          },
        ],
      },
    ],
  },

  // ── Politician ───────────────────────────────────────────────────────────
  {
    id: 'sp_pol_campaign',
    kind: 'choice',
    category: 'work',
    ages: [21, 85],
    weight: 10,
    cooldownYears: 4,
    when: pol,
    text: 'Re-election season. Your opponent’s posters are bigger than yours, and someone has drawn a moustache on the one outside your house.',
    choices: [
      {
        id: 'hard',
        label: 'Campaign hard, every doorstep',
        outcomes: [
          {
            chance: oddsBy('karma', 0.6),
            text: 'You knock on so many doors that dogs start recognising you. You win comfortably, and the party starts mentioning your name in rooms you are not in.',
            effects: [{ job: 'promote' }, { stat: 'stress', delta: 10 }, { fame: 3 }],
            success: true,
          },
          {
            chance: 0.3,
            text: 'You lose by a few hundred votes, on a rainy day, to a man who promised a car park. You make a gracious speech and go home to sleep for a week.',
            effects: [{ job: 'fire' }, { stat: 'happiness', delta: -10 }],
          },
        ],
      },
      {
        id: 'clean',
        label: 'Run clean and point at your record',
        outcomes: [
          {
            chance: oddsBy('karma', 0.5),
            text: 'You stand on what you did, nothing more. It turns out that is enough: a narrow win, and a newspaper calls you “refreshingly dull”, which you decide is praise.',
            effects: [{ performance: 8 }, { stat: 'karma', delta: 4 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Decency loses to a catchier slogan. You concede with dignity, and three people write to say they will vote for you next time.',
            effects: [
              { job: 'fire' },
              { stat: 'karma', delta: 4 },
              { stat: 'happiness', delta: -6 },
            ],
          },
        ],
      },
      {
        id: 'stand_down',
        label: 'Stand down with dignity',
        outcomes: [
          {
            chance: 1,
            text: 'You announce you will not stand again, and both sides applaud in the chamber. On your last day a cleaner tells you that you were one of the decent ones.',
            effects: [
              { job: 'fire' },
              { stat: 'stress', delta: -15 },
              { stat: 'happiness', delta: 4 },
              { flag: 'stood_down' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sp_pol_vote',
    kind: 'choice',
    category: 'work',
    ages: [21, 85],
    weight: 10,
    cooldownYears: 3,
    when: pol,
    text: 'A vote tomorrow, and the party wants it one way. You read the bill twice in bed, and your conscience wants it the other.',
    choices: [
      {
        id: 'line',
        label: 'Vote with the party',
        outcomes: [
          {
            chance: 1,
            text: 'You walk through the lobby with everyone else. The whips buy you a drink; you leave it half finished and walk home the long way.',
            effects: [{ performance: 8 }, { stat: 'karma', delta: -4 }],
          },
        ],
      },
      {
        id: 'conscience',
        label: 'Vote with your conscience',
        outcomes: [
          {
            chance: 0.6,
            text: 'You rebel, and the bill falls by three votes. The party is furious for a month. Your constituents stop you in the supermarket to shake your hand.',
            effects: [{ performance: -8 }, { stat: 'karma', delta: 8 }, { fame: 3 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You rebel and the bill passes anyway. You lose your committee seat over it, and sleep perfectly well.',
            effects: [{ performance: -10 }, { stat: 'karma', delta: 6 }],
          },
        ],
      },
      {
        id: 'abstain',
        label: 'Find a reason to be elsewhere',
        outcomes: [
          {
            chance: 1,
            text: 'A dental appointment, suddenly urgent. Nobody is fooled, including the dentist.',
            effects: [{ performance: -2 }, { stat: 'stress', delta: 4 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sp_pol_scandal',
    kind: 'choice',
    category: 'work',
    ages: [21, 85],
    weight: 8,
    cooldownYears: 8,
    when: pol,
    text: 'A newspaper has found your expenses claim for an ornamental fountain shaped like a heron. You had forgotten all about it. They have not.',
    choices: [
      {
        id: 'apologise',
        label: 'Apologise and pay it back',
        outcomes: [
          {
            chance: 0.75,
            text: 'You apologise on the steps, cheque in hand, without a single “if”. It is a two-day story, and then a cabinet minister falls off a bicycle and you are forgotten.',
            effects: [
              { money: -2000, kind: 'wage' },
              { stat: 'karma', delta: 3 },
              { performance: -3 },
            ],
            success: true,
          },
          {
            chance: 0.25,
            text: 'You apologise, and they find a second claim, for a trouser press. The story runs for a fortnight. Your local paper prints a cartoon of you as a heron.',
            effects: [{ money: -3000, kind: 'wage' }, { performance: -10 }, { notoriety: 4 }],
          },
        ],
      },
      {
        id: 'deny',
        label: 'Deny everything',
        outcomes: [
          {
            chance: 0.3,
            text: 'You call it a clerical error, loudly and often. Somehow it works. You do not enjoy looking in the mirror for a while.',
            effects: [{ stat: 'karma', delta: -6 }],
          },
          {
            chance: 0.7,
            text: 'The receipt surfaces, with your signature and a little drawing of the heron. The party asks for your resignation by teatime.',
            effects: [{ job: 'fire' }, { notoriety: 8 }, { stat: 'happiness', delta: -12 }],
          },
        ],
      },
      {
        id: 'resign',
        label: 'Resign before it grows',
        outcomes: [
          {
            chance: 1,
            text: 'You resign the same afternoon. Commentators call it old-fashioned and honourable. The fountain goes to a nature reserve, where actual herons ignore it.',
            effects: [{ job: 'fire' }, { stat: 'karma', delta: 6 }, { stat: 'stress', delta: -6 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sp_pol_big_moment',
    kind: 'choice',
    category: 'work',
    ages: [21, 85],
    weight: 9,
    cooldownYears: 6,
    when: all(pol, jobLevelAtLeast(3)),
    text: 'A crisis lands on your desk at midnight: floods in the north, the budget already spent, and every advisor in the room giving different advice at once.',
    choices: [
      {
        id: 'act',
        label: 'Take charge and spend what it takes',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.55),
            text: 'You sign the order before dawn and are standing in wellies in the worst-hit town by noon. The water goes down; your approval goes up.',
            effects: [{ job: 'promote' }, { fame: 6 }, { stat: 'karma', delta: 4 }],
            success: true,
          },
          {
            chance: 0.35,
            text: 'You do the right thing and it costs a fortune. The help arrives, and so does a week of headlines about the bill.',
            effects: [
              { performance: -4 },
              { stat: 'karma', delta: 4 },
              { stat: 'stress', delta: 10 },
            ],
          },
        ],
      },
      {
        id: 'committee',
        label: 'Set up a committee to review options',
        outcomes: [
          {
            chance: 1,
            text: 'The committee meets on Thursday. By Thursday the water has gone down by itself, and a photograph of you in a dry suit becomes very famous for the wrong reasons.',
            effects: [{ performance: -10 }, { notoriety: 3 }],
          },
        ],
      },
    ],
  },

  // ── Intelligence officer ─────────────────────────────────────────────────
  {
    id: 'sp_spy_double_life',
    kind: 'choice',
    category: 'family',
    ages: [22, 70],
    weight: 10,
    cooldownYears: 4,
    when: all(spy, hasPartner),
    bind: { pt: { role: 'partner', minAge: 18 } },
    text: '{pt.first} has planned a birthday dinner for you, with candles. At four o’clock the work phone buzzes with a single word, and it is not “happy”.',
    choices: [
      {
        id: 'go',
        label: 'Go: the job comes first',
        outcomes: [
          {
            chance: 1,
            text: 'You leave a note about a logistics emergency. {pt.first} eats alone and keeps you a slice of cake, which is somehow worse than shouting.',
            effects: [
              { performance: 10 },
              {
                rel: 'pt',
                delta: -10,
                memory: 'the birthday you missed for a logistics emergency',
              },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'stay',
        label: 'Stay for dinner, and pay for it later',
        outcomes: [
          {
            chance: 1,
            text: 'You blow out the candles. Tomorrow your section head will be very cold with you; tonight {pt.first} is laughing across the table and you would not trade it.',
            effects: [
              { performance: -8 },
              { rel: 'pt', delta: 8, memory: 'the birthday dinner you stayed for' },
              { stat: 'happiness', delta: 6 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sp_spy_operation',
    kind: 'choice',
    category: 'work',
    ages: [22, 70],
    weight: 10,
    cooldownYears: 3,
    when: spy,
    text: 'An operation, months in the planning: a conference in a grey city, a source with something to hand over, and three ways it could go wrong that you have rehearsed in your sleep.',
    choices: [
      {
        id: 'run',
        label: 'Run it exactly to plan',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.55),
            text: 'A handshake, a borrowed umbrella, a flight home. Nobody will ever know what you did this week, and the director sends a note that says only “Well done.”',
            effects: [{ job: 'promote' }, { stat: 'happiness', delta: 6 }],
            success: true,
          },
          {
            chance: 0.35,
            text: 'The source gets cold feet and leaves by the back door. You sit through four days of panels on logistics, which is at least on brand.',
            effects: [{ performance: -6 }, { stat: 'stress', delta: 8 }],
          },
        ],
      },
      {
        id: 'improvise',
        label: 'Trust your instincts and improvise',
        outcomes: [
          {
            chance: 0.5,
            text: 'You change the meeting place on a hunch, and later learn the original café was being watched. Your instincts get a file of their own.',
            effects: [{ performance: 14 }, { stat: 'stress', delta: 6 }],
            success: true,
          },
          {
            chance: 0.5,
            text: 'Your clever change of plan confuses everyone, mostly your own side. The operation is quietly shelved, and so, for a while, are you.',
            effects: [{ performance: -12 }, { stat: 'stress', delta: 10 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sp_spy_retire_offer',
    kind: 'choice',
    category: 'work',
    ages: [30, 75],
    weight: 9,
    once: true,
    when: all(spy, jobLevelAtLeast(3)),
    text: 'Your section head offers you the choice nobody gets twice: a senior desk at headquarters with regular hours, or one more posting abroad, the kind they don’t write down.',
    choices: [
      {
        id: 'desk',
        label: 'Take the desk and the regular hours',
        outcomes: [
          {
            chance: 1,
            text: 'You learn the joys of a lunch break and a calendar. Your family notices you home for supper and starts, cautiously, to believe the logistics story.',
            effects: [
              { stat: 'stress', delta: -15 },
              { stat: 'happiness', delta: 8 },
              { flag: 'spy_desk' },
            ],
          },
        ],
      },
      {
        id: 'posting',
        label: 'One more posting',
        outcomes: [
          {
            chance: 0.7,
            text: 'Two years under another name, in a city where it never stops raining. You come back with a promotion and a habit of sitting facing the door.',
            effects: [{ job: 'promote' }, { stat: 'stress', delta: 12 }],
            success: true,
          },
          {
            chance: 0.3,
            text: 'The posting is cut short when someone else’s mistake closes the whole network. You come home early, unharmed, and quieter than before.',
            effects: [{ performance: -6 }, { stat: 'happiness', delta: -6 }],
          },
        ],
      },
    ],
  },

  // ── Diplomat ─────────────────────────────────────────────────────────────
  {
    id: 'sp_dip_reception',
    kind: 'choice',
    category: 'work',
    ages: [23, 75],
    weight: 10,
    cooldownYears: 3,
    when: dip,
    text: 'At the embassy reception, you notice the visiting delegation has been seated beneath a painting of the battle they lost. Their minister has not looked up yet.',
    choices: [
      {
        id: 'swap',
        label: 'Quietly rearrange the seating',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.6),
            text: 'A spilled drink, a hurried apology, and everyone moves to the other table while staff whisk the painting away. The ambassador catches your eye and nods once.',
            effects: [{ performance: 12 }, { stat: 'happiness', delta: 4 }],
            success: true,
          },
          {
            chance: 0.3,
            text: 'The spilled drink lands on the minister. A small international incident is averted by a slightly larger domestic one.',
            effects: [{ performance: -4 }, { stat: 'stress', delta: 6 }],
          },
        ],
      },
      {
        id: 'charm',
        label: 'Keep the minister talking, facing the other way',
        outcomes: [
          {
            chance: 1,
            text: 'You discuss his grandchildren, his garden and his views on cheese for two hours without once letting him turn round. Your neck is stiff for a week.',
            effects: [{ performance: 8 }, { stat: 'stress', delta: 3 }],
          },
        ],
      },
      {
        id: 'ignore',
        label: 'Say nothing: it’s not your department',
        outcomes: [
          {
            chance: 1,
            text: 'He looks up during dessert. The communiqué is chillier than planned, and nobody can say exactly why.',
            effects: [{ performance: -6 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sp_dip_crisis',
    kind: 'choice',
    category: 'work',
    ages: [23, 75],
    weight: 9,
    cooldownYears: 5,
    when: all(dip, jobLevelAtLeast(1)),
    text: 'A trade dispute boils over and a delegation threatens to walk out at dawn. The capital is asleep, and the other side wants an answer from you, tonight.',
    choices: [
      {
        id: 'negotiate',
        label: 'Negotiate through the night',
        outcomes: [
          {
            chance: oddsBy('smarts', 0.5),
            text: 'By four in the morning you have a form of words that lets everyone claim victory. The delegation stays. The capital wakes up and takes the credit, and promotes you anyway.',
            effects: [{ job: 'promote' }, { stat: 'stress', delta: 8 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You offer a concession you were not authorised to make. The deal holds; the reprimand arrives by diplomatic bag.',
            effects: [{ performance: -8 }, { stat: 'stress', delta: 10 }],
          },
        ],
      },
      {
        id: 'defer',
        label: 'Defer to the capital in the morning',
        outcomes: [
          {
            chance: 1,
            text: 'You play for time with tea and procedure until the capital wakes up and decides. Correct, careful, and forgotten by the end of the week.',
            effects: [{ performance: 2 }, { stat: 'stress', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sp_dip_posting',
    kind: 'choice',
    category: 'travel',
    ages: [23, 75],
    weight: 9,
    cooldownYears: 6,
    when: dip,
    text: 'The ministry offers you a posting abroad: a step up, a residence with a garden, and a city where you will know nobody for a year.',
    choices: [
      {
        id: 'accept',
        label: 'Accept the posting',
        outcomes: [
          {
            chance: 1,
            text: 'You pack your life into eleven crates and learn the new city one market at a time. Your home address stays the same on paper, which is the way of embassies.',
            effects: [
              { job: 'promote' },
              { stat: 'happiness', delta: 6 },
              { stat: 'stress', delta: 6 },
              { flag: 'posted_abroad' },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'decline',
        label: 'Decline: your life is here',
        outcomes: [
          {
            chance: 1,
            text: 'You turn it down. A colleague takes it gratefully, and sends postcards that are mostly about the weather.',
            effects: [{ performance: -4 }, { stat: 'happiness', delta: 2 }],
          },
        ],
      },
    ],
  },

  // ── Film actor ───────────────────────────────────────────────────────────
  {
    id: 'sp_act_breakout',
    kind: 'choice',
    category: 'fame',
    ages: [16, 80],
    weight: 10,
    once: true,
    when: actor,
    text: 'The script arrives with a note from a director you admire: “Nobody else could play this.” It is a small film, a hard part, and half the pay of the advert you were offered.',
    choices: [
      {
        id: 'take',
        label: 'Take the part',
        outcomes: [
          {
            chance: oddsBy('looks', 0.6),
            text: 'The film opens quietly and then not quietly at all. Strangers quote your lines back at you in the street. Your agent stops returning calls because there are too many.',
            effects: [{ job: 'promote' }, { fame: 12 }, { stat: 'happiness', delta: 12 }],
            success: true,
          },
          {
            chance: 0.3,
            text: 'The film is beautiful and almost nobody sees it. The few who do write to you for years.',
            effects: [{ performance: 6 }, { fame: 3 }, { stat: 'happiness', delta: 4 }],
          },
        ],
      },
      {
        id: 'advert',
        label: 'Do the advert: rent is rent',
        outcomes: [
          {
            chance: 1,
            text: 'You spend three days enthusing about yoghurt. The cheque clears. The small film wins a prize with someone else in it.',
            effects: [
              { money: 15000, kind: 'wage' },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sp_act_awards',
    kind: 'choice',
    category: 'fame',
    ages: [16, 90],
    weight: 9,
    cooldownYears: 5,
    when: all(actor, jobLevelAtLeast(2)),
    text: 'Awards night: a borrowed outfit, a seat on the aisle, and a camera pointed at your face for the whole of the category. They open the envelope. It is you.',
    choices: [
      {
        id: 'heartfelt',
        label: 'Thank the people who got you here',
        outcomes: [
          {
            chance: 1,
            text: 'You thank your first drama teacher by name and the hall goes soft. She watches at home and phones you weeping.',
            effects: [{ fame: 6 }, { stat: 'happiness', delta: 12 }, { stat: 'karma', delta: 4 }],
          },
        ],
      },
      {
        id: 'funny',
        label: 'Make them laugh',
        outcomes: [
          {
            chance: 0.6,
            text: 'Thirty seconds, three laughs and a perfect exit. The clip of your speech is the thing everybody talks about the next morning.',
            effects: [{ fame: 10 }, { stat: 'happiness', delta: 10 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The joke about the director lands badly with the director. You laugh it off on stage and spend the afterparty apologising.',
            effects: [{ fame: 5 }, { performance: -4 }],
          },
        ],
      },
      {
        id: 'cause',
        label: 'Use the moment to speak up for something',
        outcomes: [
          {
            chance: 1,
            text: 'You keep it short and plain. Half the room applauds and half check their watches, and a charity you mentioned has its best month ever.',
            effects: [{ fame: 6 }, { stat: 'karma', delta: 8 }],
          },
        ],
      },
    ],
  },
  {
    id: 'sp_act_typecast',
    kind: 'choice',
    category: 'work',
    ages: [16, 90],
    weight: 10,
    cooldownYears: 4,
    when: all(actor, jobLevelAtLeast(1)),
    text: 'Your agent has an offer: the same part again. Another gruff detective with a tragic past and a coat, for a great deal of money.',
    choices: [
      {
        id: 'money',
        label: 'Take the money',
        outcomes: [
          {
            chance: 1,
            text: 'You could do it in your sleep, and on one Thursday you very nearly do. The cheque is enormous. The coat, at least, is new.',
            effects: [
              { money: 60000, kind: 'wage' },
              { performance: 2 },
              { stat: 'happiness', delta: -3 },
            ],
          },
        ],
      },
      {
        id: 'hold',
        label: 'Hold out for something different',
        outcomes: [
          {
            chance: 0.5,
            text: 'Eight months of nothing, then a comedy. Nobody thought you could be funny, including you. The reviews are astonished.',
            effects: [{ performance: 12 }, { fame: 6 }, { stat: 'happiness', delta: 10 }],
            success: true,
          },
          {
            chance: 0.5,
            text: 'A year of auditions for parts that go to younger people with fewer coats. Your savings notice before you do.',
            effects: [{ performance: -8 }, { stat: 'happiness', delta: -6 }],
          },
        ],
      },
    ],
  },
];
