import type { EventDef } from '../../engine/events/types';
import type { GameState } from '../../engine/types';

const pro = (s: GameState): boolean =>
  s.career.jobId === 'professional_athlete' && !!s.sport?.active && !s.legal.prison;
const proIn =
  (...ids: string[]) =>
  (s: GameState): boolean =>
    pro(s) && ids.includes(s.sport?.sport ?? '');
const star = (s: GameState): boolean => pro(s) && s.career.level >= 3;

/** Life as a professional athlete: contracts, cameras, injuries, and the odd moral test. */
export const PRO_SPORT_EVENTS: EventDef[] = [
  // ---------- Any sport ----------
  {
    id: 'prosport_holdout',
    kind: 'choice',
    category: 'work',
    emoji: '💼',
    ages: [22, 38],
    weight: 6,
    cooldownYears: 6,
    when: star,
    text: 'You are the best player on the payroll and nowhere near the best paid. Your agent says the word "holdout" slowly, as if tasting it. Pre-season starts on Monday.',
    choices: [
      {
        id: 'hold',
        label: 'Skip pre-season until they pay',
        outcomes: [
          {
            chance: 0.55,
            text: 'Eleven days of silence, then a fax machine somewhere whirs. The new deal makes you very rich and slightly less popular in the car park.',
            effects: [
              { money: 250000, kind: 'wage' },
              { stat: 'happiness', delta: 8 },
              { fame: 2 },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'The club fines you for every missed day and leaks the totals. Fans burn a replica shirt with your name on it, which you suppose is still merchandise.',
            effects: [
              { money: -30000, kind: 'wage' },
              { stat: 'stress', delta: 10 },
              { fame: -3 },
              { performance: -8 },
            ],
          },
        ],
      },
      {
        id: 'quiet',
        label: 'Sign the modest extension quietly',
        outcomes: [
          {
            chance: 1,
            text: 'You sign in a corridor, shake hands and go to training. The fans call you loyal. Your accountant calls you something else.',
            effects: [
              { money: 60000, kind: 'wage' },
              { stat: 'stress', delta: -4 },
              { performance: 5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'prosport_trade_request',
    kind: 'choice',
    category: 'work',
    emoji: '🔁',
    ages: [20, 36],
    weight: 6,
    cooldownYears: 6,
    when: pro,
    bind: { coach: { role: 'boss' } },
    text: 'Three losing seasons in a row and a front office that thinks a new mascot is a rebuild. {coach.first} catches you staring at the league table like it owes you money.',
    choices: [
      {
        id: 'request',
        label: 'Ask for a move, in writing',
        outcomes: [
          {
            chance: 0.5,
            text: 'Your letter leaks within the hour. A contender comes calling, and you spend the summer learning a new set of passwords and a new set of plays.',
            effects: [
              { stat: 'happiness', delta: 6 },
              { performance: 6 },
              { rel: 'coach', delta: -8, memory: 'the letter you sent upstairs' },
              { flag: 'requested_trade' },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'Nobody wants your contract at that price. You stay, everyone knows you asked to leave, and the home crowd remembers it every time you touch the ball.',
            effects: [
              { stat: 'stress', delta: 9 },
              { fame: -2 },
              { rel: 'coach', delta: -10, memory: 'the transfer request that went nowhere' },
            ],
          },
        ],
      },
      {
        id: 'stay',
        label: 'Stay and drag them upward',
        outcomes: [
          {
            chance: 0.4,
            text: 'You play like a one-person rebuild. The team scrapes into the playoffs and the city paints a mural of you that is mostly forehead.',
            effects: [
              { fame: 4 },
              { stat: 'happiness', delta: 7 },
              { rel: 'coach', delta: 6, memory: 'the season you carried the team' },
            ],
            success: true,
          },
          {
            chance: 0.6,
            text: 'Another long season of brave defeats. You are named player of the year on a team that finished second from bottom.',
            effects: [
              { stat: 'stress', delta: 5 },
              { stat: 'karma', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'prosport_play_hurt',
    kind: 'choice',
    category: 'work',
    emoji: '🩼',
    ages: [18, 40],
    weight: 7,
    cooldownYears: 4,
    when: pro,
    text: 'The biggest game of the season is on Saturday and your knee is the size of a grapefruit. The physio says "rest". The coach says "we\'ll see". Your knee says nothing, ominously.',
    choices: [
      {
        id: 'play',
        label: 'Strap it up and play',
        outcomes: [
          {
            chance: 0.45,
            text: 'You hobble through warm-up, then play the game of your life on pure adrenaline. The photo of you limping off with the trophy goes on a lot of walls.',
            effects: [{ fame: 5 }, { stat: 'happiness', delta: 10 }, { injury: 4 }],
            success: true,
          },
          {
            chance: 0.55,
            text: 'Twenty minutes in, something in the knee gives way with a sound the front row hears. You leave on a cart, and the surgeon books you for the morning.',
            effects: [{ injury: 12 }, { stat: 'happiness', delta: -8 }, { performance: -6 }],
          },
        ],
      },
      {
        id: 'sit',
        label: 'Sit it out',
        outcomes: [
          {
            chance: 1,
            text: 'You watch from the bench in a tracksuit, ice strapped to your leg. The team loses narrowly and the radio phone-in debates your heart for a week.',
            effects: [{ stat: 'health', delta: 3 }, { fame: -2 }, { stat: 'stress', delta: 4 }],
          },
        ],
      },
    ],
  },
  {
    id: 'prosport_press_conference',
    kind: 'choice',
    category: 'work',
    emoji: '🎙️',
    ages: [18, 40],
    weight: 7,
    cooldownYears: 4,
    when: pro,
    text: 'Post-match press conference after a defeat full of baffling refereeing. A reporter in the second row asks, very innocently, what you made of the officials.',
    choices: [
      {
        id: 'honest',
        label: 'Tell them exactly what you think',
        outcomes: [
          {
            chance: 0.5,
            text: 'Your forty-second rant becomes a catchphrase, then a T-shirt. The league fines you, and you frame the letter.',
            effects: [
              { fame: 6 },
              { money: -15000, kind: 'wage' },
              { stat: 'happiness', delta: 5 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The league fines you and suspends you for a game. The clip runs on every sports show with a slow zoom on your eyebrows.',
            effects: [
              { money: -25000, kind: 'wage' },
              { performance: -6 },
              { notoriety: 3 },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'cliche',
        label: 'Say "we go again" and nothing else',
        outcomes: [
          {
            chance: 1,
            text: 'You deliver three minutes of perfectly smooth nothing. The reporters sigh, and your media officer nearly weeps with pride.',
            effects: [{ stat: 'stress', delta: -2 }, { performance: 2 }],
          },
        ],
      },
      {
        id: 'joke',
        label: "Ask if anyone has the referee's optician",
        outcomes: [
          {
            chance: 1,
            text: "The room laughs. The league laughs less, but only issues a warning. An optician's chain sends you a gift voucher.",
            effects: [{ fame: 3 }, { stat: 'happiness', delta: 4 }],
          },
        ],
      },
    ],
  },
  {
    id: 'prosport_trash_talk',
    kind: 'choice',
    category: 'work',
    emoji: '🗯️',
    ages: [18, 38],
    weight: 6,
    cooldownYears: 5,
    when: pro,
    text: 'A rival from the team you play next week tells a radio host you are "overrated, overpaid and over there," pointing at nothing in particular. The quote is on every back page.',
    choices: [
      {
        id: 'fire_back',
        label: 'Fire back on the record',
        outcomes: [
          {
            chance: 0.5,
            text: "You produce a line so cutting that the rival's own teammates repeat it. Then you go out and beat them, which helps enormously.",
            effects: [{ fame: 5 }, { stat: 'happiness', delta: 6 }, { status: 'enemy' }],
            success: true,
          },
          {
            chance: 0.5,
            text: 'You fire back, then have a shocker. The rival waves at you as you walk off. The back pages enjoy themselves for a week.',
            effects: [{ fame: -3 }, { stat: 'stress', delta: 7 }, { status: 'enemy' }],
          },
        ],
      },
      {
        id: 'silent',
        label: 'Say nothing and answer on the field',
        outcomes: [
          {
            chance: 0.5,
            text: 'You play like you have a grudge, because you do. Afterwards you walk past the rival without a word, and that is the photo everyone uses.',
            effects: [{ fame: 3 }, { performance: 6 }, { stat: 'happiness', delta: 4 }],
            success: true,
          },
          {
            chance: 0.5,
            text: 'You keep your dignity and lose the game. Dignity turns out to be a hard thing to frame.',
            effects: [
              { stat: 'stress', delta: 3 },
              { stat: 'karma', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'prosport_fan_letter',
    kind: 'choice',
    category: 'work',
    emoji: '✉️',
    ages: [18, 40],
    weight: 6,
    cooldownYears: 6,
    when: pro,
    text: 'Among the club post is a letter in purple crayon from a nine-year-old in hospital: "You are my favourite. Please score for me on Saturday. I will be watching on the small TV."',
    choices: [
      {
        id: 'visit',
        label: 'Visit the ward with signed kit',
        outcomes: [
          {
            chance: 1,
            text: "You spend an afternoon on the children's ward losing at cards to a nine-year-old with no mercy. You drive home quiet, and better for it.",
            effects: [{ stat: 'happiness', delta: 8 }, { stat: 'karma', delta: 5 }, { fame: 1 }],
          },
        ],
      },
      {
        id: 'dedicate',
        label: 'Promise a goal, on camera',
        outcomes: [
          {
            chance: 0.5,
            text: 'You score in the second half and run straight to the nearest camera holding up nine fingers. Somewhere a small TV is very loud.',
            effects: [{ fame: 4 }, { stat: 'happiness', delta: 10 }, { stat: 'karma', delta: 3 }],
            success: true,
          },
          {
            chance: 0.5,
            text: 'You hit the post twice and miss everything else. A second purple letter arrives on Monday: "That\'s OK. Next week."',
            effects: [
              { stat: 'happiness', delta: -3 },
              { stat: 'karma', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'office',
        label: 'Let the club office send a photo',
        outcomes: [
          {
            chance: 1,
            text: 'An intern sends a glossy photo with your printed signature. You forget the letter by Thursday, mostly.',
            effects: [{ stat: 'karma', delta: -1 }],
          },
        ],
      },
    ],
  },
  {
    id: 'prosport_teammate_trouble',
    kind: 'choice',
    category: 'work',
    emoji: '🎲',
    ages: [18, 38],
    weight: 6,
    cooldownYears: 6,
    when: pro,
    bind: { mate: { role: 'coworker', nearAge: 12 } },
    text: '{mate.first} pulls you aside after training. Gambling debts, the wrong kind of lenders, and a request for money before the weekend. {mate.They} {mate.is} shaking.',
    choices: [
      {
        id: 'lend',
        label: 'Lend the money',
        outcomes: [
          {
            chance: 0.5,
            text: '{mate.first} pays you back in instalments and starts seeing a counsellor. In the dressing room, {mate.they} never sits anywhere but next to you.',
            effects: [
              { money: -20000 },
              { rel: 'mate', delta: 15, memory: 'the loan before the weekend' },
              { stat: 'karma', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The money vanishes into the same hole as the rest. {mate.first} asks again a month later, and avoids your eye when you say no.',
            effects: [
              { money: -20000 },
              { rel: 'mate', delta: -4, memory: 'the second loan you refused' },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'club',
        label: 'Take it to the club welfare officer',
        outcomes: [
          {
            chance: 1,
            text: "The club pays off the lenders and docks {mate.first}'s wages for years. {mate.They} {mate.is} furious with you, then quietly grateful.",
            effects: [
              { rel: 'mate', delta: 4, memory: 'the day you went to the welfare officer' },
              { stat: 'karma', delta: 3 },
            ],
          },
        ],
      },
      {
        id: 'out',
        label: 'Stay out of it',
        outcomes: [
          {
            chance: 1,
            text: '{mate.first} misses a week of training "with a virus". When {mate.they} come{mate.s} back there is a bruise nobody asks about.',
            effects: [
              { rel: 'mate', delta: -10, memory: 'the week you looked away' },
              { stat: 'karma', delta: -3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'prosport_documentary',
    kind: 'choice',
    category: 'work',
    emoji: '🎥',
    ages: [20, 40],
    weight: 5,
    cooldownYears: 8,
    when: star,
    text: 'A production company wants to follow you for a whole season: cameras at training, at home, at the breakfast table. The working title is "Behind the Badge". It pays well.',
    choices: [
      {
        id: 'accept',
        label: 'Let the cameras in',
        outcomes: [
          {
            chance: 0.55,
            text: "The series is a hit. Strangers now know your dog's name and the way you eat cereal standing up. Sponsors love it.",
            effects: [{ money: 80000, kind: 'wage' }, { fame: 8 }, { stat: 'stress', delta: 4 }],
            success: true,
          },
          {
            chance: 0.45,
            text: 'The editors find every sulk and every swear. Episode four, "The Tantrum", is the one everyone watches.',
            effects: [
              { money: 80000, kind: 'wage' },
              { fame: 3 },
              { notoriety: 4 },
              { stat: 'happiness', delta: -6 },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Keep your kitchen private',
        outcomes: [
          {
            chance: 1,
            text: 'They make it about your rival instead. You watch an episode out of curiosity and feel smug for roughly forty minutes.',
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
    id: 'prosport_coach_doubts',
    kind: 'choice',
    category: 'work',
    emoji: '📋',
    ages: [18, 36],
    weight: 7,
    cooldownYears: 5,
    when: pro,
    bind: { coach: { role: 'boss' } },
    text: '{coach.first} has dropped you for the third game running and explains it with a shrug and the word "shape". You are not sure what shape you are meant to be.',
    choices: [
      {
        id: 'extra',
        label: 'Turn up early every day for a month',
        outcomes: [
          {
            chance: 0.6,
            text: 'Every morning you are there before the groundskeeper. On day twenty-six, {coach.first} nods at you, and on Saturday you start.',
            effects: [
              { performance: 10 },
              { skill: 'athletics', delta: 3 },
              { rel: 'coach', delta: 8, memory: 'the month you came in at dawn' },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'You get fitter, sharper and no closer to the team sheet. {coach.first} compliments your "attitude", which is how you know.',
            effects: [
              { skill: 'athletics', delta: 2 },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'confront',
        label: 'Knock on the office door',
        outcomes: [
          {
            chance: 0.4,
            text: 'It is a blunt ten minutes, but {coach.first} respects blunt. You come away with a role, a plan and a grudging handshake.',
            effects: [
              { performance: 6 },
              { rel: 'coach', delta: 5, memory: 'your ten minutes in the office' },
            ],
            success: true,
          },
          {
            chance: 0.6,
            text: 'Voices are raised. You leave with the door still swinging and a place in the reserves that feels permanent.',
            effects: [
              { performance: -8 },
              { rel: 'coach', delta: -12, memory: 'the shouting in the office' },
              { stat: 'stress', delta: 6 },
            ],
          },
        ],
      },
      {
        id: 'wait',
        label: 'Wait for the next coach',
        outcomes: [
          {
            chance: 1,
            text: 'Coaches never last long. You watch from the bench, take very good notes, and practise looking patient.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { stat: 'discipline', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'prosport_dodgy_endorsement',
    kind: 'choice',
    category: 'work',
    emoji: '🧪',
    ages: [18, 40],
    weight: 6,
    cooldownYears: 6,
    when: pro,
    text: 'A company called VitaSurge wants your face on a powder that "rewires your mitochondria". The science section of their brochure is one photograph of a lightning bolt. The fee is serious.',
    choices: [
      {
        id: 'take',
        label: 'Take the money and smile',
        outcomes: [
          {
            chance: 0.6,
            text: 'Your grinning face goes on every tub. Nobody is harmed, as far as anyone can prove, and the cheque clears.',
            effects: [{ money: 60000, kind: 'wage' }, { stat: 'karma', delta: -4 }, { fame: 2 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'A consumer programme tests the powder and finds mostly chalk and optimism. Your face is in the report, on a tub, next to the word "misleading".',
            effects: [
              { money: 60000, kind: 'wage' },
              { stat: 'karma', delta: -6 },
              { fame: -4 },
              { notoriety: 4 },
            ],
          },
        ],
      },
      {
        id: 'decline',
        label: 'Turn it down',
        outcomes: [
          {
            chance: 1,
            text: 'You pass. A rival takes the deal and spends the next year explaining chalk to journalists.',
            effects: [
              { stat: 'karma', delta: 3 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'prosport_foundation',
    kind: 'choice',
    category: 'work',
    emoji: '🏟️',
    ages: [22, 40],
    weight: 5,
    cooldownYears: 8,
    when: star,
    text: 'The pitches where you learned to play in {city} are being sold for flats. A local councillor asks if you would put your name, and some of your money, behind saving them.',
    choices: [
      {
        id: 'fund',
        label: 'Start a foundation and fund it',
        outcomes: [
          {
            chance: 1,
            text: "The pitches stay. Every summer a few hundred kids play there in bibs printed with your foundation's name, and you hand out medals with your own hands.",
            effects: [
              { money: -50000 },
              { stat: 'karma', delta: 8 },
              { stat: 'happiness', delta: 8 },
              { fame: 4 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'name',
        label: 'Lend your name, not your money',
        outcomes: [
          {
            chance: 0.5,
            text: 'Your name brings in the donations, and the pitches are saved anyway. You turn up for the photo and feel slightly like a fraud.',
            effects: [{ stat: 'karma', delta: 3 }, { fame: 2 }],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The campaign falls short. The flats go up, and your name is on a banner left behind on the fence.',
            effects: [
              { stat: 'happiness', delta: -4 },
              { stat: 'karma', delta: 1 },
            ],
          },
        ],
      },
      {
        id: 'no',
        label: 'Say you are too busy',
        outcomes: [
          {
            chance: 1,
            text: 'The pitches become a car park for the flats. You drive past it once and take a different route after that.',
            effects: [
              { stat: 'karma', delta: -3 },
              { stat: 'happiness', delta: -2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'prosport_burnout',
    kind: 'choice',
    category: 'work',
    emoji: '🌫️',
    ages: [20, 40],
    weight: 6,
    cooldownYears: 6,
    when: pro,
    text: 'Hotel, bus, stadium, hotel. You cannot remember which city you are in, and the thing you used to love most in the world now feels like a tax return with studs.',
    choices: [
      {
        id: 'help',
        label: 'Tell the club you need help',
        outcomes: [
          {
            chance: 1,
            text: 'The club psychologist is better than you expected. You miss a few games, then come back and start enjoying {sport} again in small, surprising moments.',
            effects: [{ system: 'therapy' }, { stat: 'happiness', delta: 6 }, { performance: -3 }],
            success: true,
          },
        ],
      },
      {
        id: 'push',
        label: 'Push through it',
        outcomes: [
          {
            chance: 0.4,
            text: 'You grind it out and the feeling lifts with the spring. You are not sure it went anywhere.',
            effects: [{ stat: 'stress', delta: 6 }],
          },
          {
            chance: 0.6,
            text: "You keep going until your body files the complaint your mind wouldn't. A season ends in a fog of strains and sleepless nights.",
            effects: [
              { stat: 'stress', delta: 12 },
              { stat: 'health', delta: -6 },
              { stat: 'happiness', delta: -8 },
            ],
          },
        ],
      },
      {
        id: 'escape',
        label: 'Book a week somewhere with no fixtures',
        outcomes: [
          {
            chance: 1,
            text: 'You spend a week on a quiet island where nobody has heard of {sport}. You come back sunburnt and, unexpectedly, hungry for it.',
            effects: [
              { money: -6000 },
              { stat: 'stress', delta: -10 },
              { stat: 'happiness', delta: 5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'prosport_celebration',
    kind: 'choice',
    category: 'work',
    emoji: '🍾',
    ages: [18, 38],
    weight: 6,
    cooldownYears: 4,
    when: pro,
    text: 'You have just won something shiny. The team is heading to a nightclub that has closed its doors to everyone else, and the captain is already wearing the trophy as a hat.',
    choices: [
      {
        id: 'party',
        label: 'Go all night',
        outcomes: [
          {
            chance: 0.5,
            text: "Best night of your life, mostly reconstructed from other people's accounts. The trophy survives, slightly dented.",
            effects: [
              { stat: 'happiness', delta: 10 },
              { vice: 'alcohol', delta: 4 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'A tabloid photographer catches you at dawn asleep in a fountain, holding a traffic cone like a baby. The club issues a statement about "high spirits".',
            effects: [
              { stat: 'happiness', delta: 5 },
              { notoriety: 4 },
              { fame: 2 },
              { money: -10000, kind: 'wage' },
            ],
          },
        ],
      },
      {
        id: 'early',
        label: 'One drink, then home',
        outcomes: [
          {
            chance: 1,
            text: "You leave at eleven with your medal in your pocket and sleep like a stone. The next morning's papers are full of your teammates and not you.",
            effects: [
              { stat: 'happiness', delta: 5 },
              { stat: 'health', delta: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'prosport_agent_cut',
    kind: 'choice',
    category: 'work',
    emoji: '🕴️',
    ages: [20, 40],
    weight: 6,
    cooldownYears: 6,
    when: pro,
    text: 'Your agent arrives with a new contract for the two of you. It looks exactly like the old one, except the commission has grown from ten percent to fifteen and the font has shrunk.',
    choices: [
      {
        id: 'sign',
        label: 'Sign it, they got you here',
        outcomes: [
          {
            chance: 1,
            text: "Your agent hugs you for slightly too long. Next season's deal is a good one, and a fifth of the good part is theirs.",
            effects: [
              { money: -15000, kind: 'wage' },
              { stat: 'stress', delta: -2 },
            ],
          },
        ],
      },
      {
        id: 'haggle',
        label: 'Haggle it back down',
        outcomes: [
          {
            chance: 0.6,
            text: 'You meet at twelve percent over a long lunch that you end up paying for. Both of you leave feeling robbed, which means it was fair.',
            effects: [
              { money: -4000, kind: 'wage' },
              { stat: 'happiness', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The agent sulks and starts returning your calls a day late. A sponsorship deal drifts away while you wait.',
            effects: [{ stat: 'stress', delta: 5 }, { fame: -1 }],
          },
        ],
      },
      {
        id: 'fire',
        label: 'Fire them and represent yourself',
        outcomes: [
          {
            chance: 0.4,
            text: 'You learn contract law at the kitchen table and keep every penny. It is horrible and you are weirdly good at it.',
            effects: [
              { money: 30000, kind: 'wage' },
              { stat: 'smarts', delta: 3 },
            ],
            success: true,
          },
          {
            chance: 0.6,
            text: 'You negotiate your own renewal and accidentally agree to a pay cut and an appearance at the club Christmas party, dressed as a reindeer.',
            effects: [
              { money: -25000, kind: 'wage' },
              { stat: 'stress', delta: 7 },
            ],
          },
        ],
      },
    ],
  },

  // ---------- American football ----------
  {
    id: 'prosport_af_concussion',
    kind: 'choice',
    category: 'work',
    emoji: '🏈',
    ages: [20, 38],
    weight: 7,
    cooldownYears: 4,
    when: proIn('american_football'),
    text: "A helmet-to-helmet hit in the third quarter. You get up, but the stadium lights have halos and the playbook in your head is in a language you don't speak. The team doctor is jogging over.",
    choices: [
      {
        id: 'report',
        label: 'Tell the doctor the truth',
        outcomes: [
          {
            chance: 1,
            text: 'Concussion protocol: a dark room, no screens, two weeks off. You miss a big game. Years from now, your brain will be quietly grateful.',
            effects: [
              { stat: 'health', delta: 2 },
              { performance: -4 },
              { stat: 'happiness', delta: -3 },
            ],
            success: true,
          },
        ],
      },
      {
        id: 'hide',
        label: 'Say you are fine and stay in',
        outcomes: [
          {
            chance: 0.4,
            text: 'You fake your way through the sideline test and finish the game on muscle memory. You remember none of it, including the win.',
            effects: [{ injury: 6 }, { fame: 2 }, { flag: 'hid_concussion' }],
          },
          {
            chance: 0.6,
            text: 'Two plays later a second hit lands on the first. The concussion keeps you out for most of the season, and the headaches come and go after that.',
            effects: [
              { injury: 16 },
              { stat: 'smarts', delta: -2 },
              { stat: 'happiness', delta: -8 },
              { flag: 'hid_concussion' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'prosport_af_hazing',
    kind: 'choice',
    category: 'work',
    emoji: '🪒',
    ages: [22, 38],
    weight: 6,
    cooldownYears: 6,
    when: proIn('american_football'),
    text: "Training camp. The veterans have decided the rookies will shave their heads, carry everyone's pads and pay for a team dinner that costs more than their signing bonus.",
    choices: [
      {
        id: 'join',
        label: 'Join in, it happened to you',
        outcomes: [
          {
            chance: 1,
            text: 'The rookies pay for the steaks with tight smiles. One of them is a lot better than you, and he will remember the dinner bill.',
            effects: [
              { stat: 'karma', delta: -3 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'stop',
        label: 'Pick up the bill yourself',
        outcomes: [
          {
            chance: 0.6,
            text: 'You hand over your card and call it a tradition now. The rookies would run through walls for you, and two of them try that week.',
            effects: [{ money: -12000 }, { stat: 'karma', delta: 5 }, { performance: 4 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The veterans call you soft and freeze you out of the card games. The rookies are grateful, quietly, where nobody can see.',
            effects: [{ money: -12000 }, { stat: 'karma', delta: 4 }, { stat: 'stress', delta: 4 }],
          },
        ],
      },
      {
        id: 'away',
        label: 'Keep your head down',
        outcomes: [
          {
            chance: 1,
            text: "You eat your steak and look at your phone. It is someone else's problem, which is the problem.",
            effects: [{ stat: 'karma', delta: -1 }],
          },
        ],
      },
    ],
  },

  // ---------- Basketball ----------
  {
    id: 'prosport_bb_last_shot',
    kind: 'choice',
    category: 'work',
    emoji: '🏀',
    ages: [18, 38],
    weight: 7,
    cooldownYears: 3,
    when: proIn('basketball'),
    text: 'Down by one, four seconds left, and the play is drawn up for you. Twenty thousand people inhale at once. Your teammate in the corner is wide open, waving.',
    choices: [
      {
        id: 'shoot',
        label: 'Take the shot',
        outcomes: [
          {
            chance: 0.45,
            text: 'Fadeaway, buzzer, nothing but net. You are mobbed under a pile of teammates and the replay runs on a loop until midnight.',
            effects: [{ fame: 6 }, { stat: 'happiness', delta: 12 }, { performance: 6 }],
            success: true,
          },
          {
            chance: 0.55,
            text: 'Off the back iron, the buzzer goes, and you stand under the basket with your hands on your head. The open teammate says nothing, loudly.',
            effects: [{ stat: 'happiness', delta: -6 }, { stat: 'stress', delta: 6 }, { fame: -1 }],
          },
        ],
      },
      {
        id: 'pass',
        label: 'Find the open man in the corner',
        outcomes: [
          {
            chance: 0.5,
            text: 'You draw two defenders and fire it into the corner. Swish. The headline goes to your teammate; the coaches watch the pass on repeat.',
            effects: [
              { stat: 'happiness', delta: 8 },
              { performance: 8 },
              { stat: 'karma', delta: 2 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The pass is perfect and the shot rattles out. The talk shows spend the week asking why you did not want the ball.',
            effects: [{ fame: -3 }, { stat: 'stress', delta: 5 }],
          },
        ],
      },
    ],
  },
  {
    id: 'prosport_bb_online_beef',
    kind: 'choice',
    category: 'work',
    emoji: '📱',
    ages: [18, 36],
    weight: 6,
    cooldownYears: 5,
    fromYear: 2010,
    when: proIn('basketball'),
    text: 'A player from a rival team posts a slowed-down clip of you getting dunked on, with six laughing faces and a crown. It has two million views by breakfast.',
    choices: [
      {
        id: 'clap',
        label: 'Post a sharper clip of your own',
        outcomes: [
          {
            chance: 0.6,
            text: 'You dig up the time you blocked him into the third row and add a single sleeping face. The internet declares you the winner, for now.',
            effects: [{ fame: 5 }, { stat: 'happiness', delta: 5 }, { status: 'enemy' }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'The feud spills into the next game, then a technical foul, then a fine and a lecture from the league about "the brand".',
            effects: [
              { money: -20000, kind: 'wage' },
              { notoriety: 3 },
              { stat: 'stress', delta: 6 },
              { status: 'enemy' },
            ],
          },
        ],
      },
      {
        id: 'log_off',
        label: 'Delete the app for a month',
        outcomes: [
          {
            chance: 1,
            text: 'You log off and sleep better than you have in years. By the time you come back, everyone is angry about something else.',
            effects: [
              { stat: 'stress', delta: -6 },
              { stat: 'happiness', delta: 3 },
            ],
          },
        ],
      },
    ],
  },

  // ---------- Football (soccer) ----------
  {
    id: 'prosport_fb_transfer_abroad',
    kind: 'choice',
    category: 'work',
    emoji: '✈️',
    ages: [19, 32],
    weight: 6,
    cooldownYears: 8,
    when: proIn('football'),
    text: 'A giant club from another country has made a bid that makes your chairman sit down. They want you, a translator and a medical by Thursday. Your hometown fans have already started a petition.',
    choices: [
      {
        id: 'go',
        label: 'Push for the move',
        outcomes: [
          {
            chance: 0.55,
            text: 'You sign under a bank of flashbulbs and spend the first season learning swear words and a new league. The wages are absurd; so is your new kit number.',
            effects: [
              { money: 200000, kind: 'wage' },
              { fame: 6 },
              { stat: 'happiness', delta: 4 },
              { stat: 'stress', delta: 6 },
              { flag: 'played_abroad' },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'The move collapses on a failed medical and a scan of your ankle that someone in the press office leaks. You go back to training to a very cold welcome.',
            effects: [{ fame: -2 }, { stat: 'happiness', delta: -8 }, { performance: -5 }],
          },
        ],
      },
      {
        id: 'stay',
        label: 'Kiss the badge and stay',
        outcomes: [
          {
            chance: 1,
            text: 'You announce it on the pitch before kick-off. The stadium sings your name for a full minute and someone names a pub snack after you.',
            effects: [{ fame: 3 }, { stat: 'happiness', delta: 7 }, { stat: 'karma', delta: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'prosport_fb_derby',
    kind: 'notice',
    category: 'work',
    emoji: '🔥',
    ages: [18, 38],
    weight: 6,
    cooldownYears: 3,
    when: proIn('football'),
    text: 'Derby day. The city splits down the middle, flares turn the sky pink, and someone in the away end has spent the week making a banner about your haircut.',
    outcomes: [
      {
        chance: 0.4,
        text: 'You score the winner in front of the banner and stand very still beneath it. That photo will outlive you.',
        effects: [{ fame: 5 }, { stat: 'happiness', delta: 10 }],
        success: true,
      },
      {
        chance: 0.35,
        text: 'A grinding draw, two red cards and a coin bouncing off your shoulder. You go home with ringing ears and nothing to show for it.',
        effects: [{ stat: 'stress', delta: 4 }, { injury: 2 }],
      },
      {
        chance: 0.25,
        text: 'You lose, and you are the one who gave away the penalty. For a week, half the city will not look at you in the supermarket.',
        effects: [{ stat: 'happiness', delta: -8 }, { fame: -2 }],
      },
    ],
  },

  // ---------- Ice hockey ----------
  {
    id: 'prosport_ih_gloves',
    kind: 'choice',
    category: 'work',
    emoji: '🥊',
    ages: [19, 38],
    weight: 7,
    cooldownYears: 3,
    when: proIn('ice_hockey'),
    text: 'Their enforcer has just flattened your smallest teammate against the boards. Now he is skating towards you, shaking one glove loose with a look that asks a question.',
    choices: [
      {
        id: 'drop',
        label: 'Drop the gloves',
        outcomes: [
          {
            chance: 0.45,
            text: 'You land the first punch and the last. The crowd roars, the bench bangs its sticks, and you serve five minutes in the box feeling ten feet tall.',
            effects: [
              { fame: 3 },
              { stat: 'happiness', delta: 6 },
              { performance: 4 },
              { injury: 3 },
            ],
            success: true,
          },
          {
            chance: 0.55,
            text: "He is much bigger up close. You wake up on the ice looking at a referee's chin, and the dentist sees you on Monday.",
            effects: [
              { injury: 10 },
              { stat: 'looks', delta: -3 },
              { stat: 'happiness', delta: -4 },
            ],
          },
        ],
      },
      {
        id: 'skate',
        label: 'Skate away and score instead',
        outcomes: [
          {
            chance: 0.4,
            text: 'You wheel away, pick up a loose puck and bury it top shelf on the power play. Revenge, in the most annoying form available.',
            effects: [{ fame: 3 }, { performance: 6 }, { stat: 'happiness', delta: 6 }],
            success: true,
          },
          {
            chance: 0.6,
            text: 'You skate off. The bench says nothing, which is worse than anything they could have said.',
            effects: [{ stat: 'stress', delta: 5 }, { performance: -3 }],
          },
        ],
      },
    ],
  },
  {
    id: 'prosport_ih_beard',
    kind: 'notice',
    category: 'work',
    emoji: '🧔',
    ages: [19, 40],
    weight: 5,
    cooldownYears: 4,
    when: proIn('ice_hockey'),
    text: 'Playoffs. By team superstition, no razor touches anyone until the season ends. By round two, the dressing room looks like a convention of lighthouse keepers.',
    outcomes: [
      {
        chance: 0.35,
        text: 'You go deep into the playoffs, and the beard becomes local legend. A barber in town offers free shaves to the team, live on the evening news.',
        effects: [{ fame: 3 }, { stat: 'happiness', delta: 7 }, { stat: 'looks', delta: -1 }],
        success: true,
      },
      {
        chance: 0.65,
        text: 'You are knocked out in the first round with barely a shadow on your chin. You shave it off that night with the solemnity of a funeral.',
        effects: [{ stat: 'happiness', delta: -4 }],
      },
    ],
  },

  // ---------- Tennis ----------
  {
    id: 'prosport_tn_line_call',
    kind: 'choice',
    category: 'work',
    emoji: '🎾',
    ages: [18, 36],
    weight: 7,
    cooldownYears: 3,
    when: proIn('tennis'),
    text: 'Break point in the deciding set. Your forehand lands on the line, you are certain of it, and the line judge calls it out with the confidence of a person who was looking at a pigeon.',
    choices: [
      {
        id: 'argue',
        label: 'Have it out with the umpire',
        outcomes: [
          {
            chance: 0.35,
            text: 'Your speech to the umpire is so eloquent the crowd applauds. The call stays, but you play the next three games in a fury and win them all.',
            effects: [{ fame: 4 }, { stat: 'happiness', delta: 6 }, { money: -5000, kind: 'wage' }],
            success: true,
          },
          {
            chance: 0.65,
            text: 'You smash a racket, take a code violation, then a point penalty, and lose the match arguing with a chair. The fine arrives by email.',
            effects: [
              { money: -15000, kind: 'wage' },
              { notoriety: 3 },
              { stat: 'happiness', delta: -6 },
              { stat: 'stress', delta: 5 },
            ],
          },
        ],
      },
      {
        id: 'let_go',
        label: 'Shrug and reset',
        outcomes: [
          {
            chance: 0.5,
            text: 'You walk to the towel, breathe, and win the next point anyway. Your opponent looks rattled by how calm you are.',
            effects: [
              { stat: 'discipline', delta: 3 },
              { stat: 'happiness', delta: 5 },
            ],
            success: true,
          },
          {
            chance: 0.5,
            text: 'You let it go. The match does too. In the car park, you replay the ball in your head and it is still in.',
            effects: [
              { stat: 'stress', delta: 3 },
              { stat: 'karma', delta: 1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'prosport_tn_five_setter',
    kind: 'notice',
    category: 'work',
    emoji: '⏱️',
    ages: [18, 36],
    weight: 5,
    cooldownYears: 4,
    when: proIn('tennis'),
    text: 'A second-round match that refuses to end. Five hours in, past midnight, the ball kids have been swapped twice and the crowd is eating crisps they brought for breakfast.',
    outcomes: [
      {
        chance: 0.5,
        text: 'You win it on your fourth match point and lie flat on the baseline staring at the moths. Tomorrow you can barely climb stairs.',
        effects: [{ fame: 3 }, { stat: 'happiness', delta: 8 }, { stat: 'health', delta: -3 }],
        success: true,
      },
      {
        chance: 0.5,
        text: 'You lose it on a net cord at twenty to one. You and your opponent hug at the net like survivors of a shipwreck.',
        effects: [{ stat: 'happiness', delta: -4 }, { stat: 'health', delta: -3 }, { fame: 1 }],
      },
    ],
  },

  // ---------- Cycling ----------
  {
    id: 'prosport_cy_mountain_attack',
    kind: 'choice',
    category: 'work',
    emoji: '⛰️',
    ages: [20, 38],
    weight: 7,
    cooldownYears: 3,
    when: proIn('cycling'),
    text: 'Eight kilometres from the summit finish, the leaders are looking at each other instead of the road. Your legs feel weirdly good. Your team car says over the radio: "Your call."',
    choices: [
      {
        id: 'attack',
        label: 'Attack now',
        outcomes: [
          {
            chance: 0.4,
            text: 'You go clear on the steepest hairpin and nobody follows. You cross the line alone with your arms up and nothing left in them.',
            effects: [{ fame: 6 }, { stat: 'happiness', delta: 12 }, { performance: 6 }],
            success: true,
          },
          {
            chance: 0.6,
            text: 'You blow up two kilometres from the top and the group sails past you one by one, some of them nodding sympathetically.',
            effects: [
              { stat: 'happiness', delta: -5 },
              { stat: 'health', delta: -2 },
              { performance: -3 },
            ],
          },
        ],
      },
      {
        id: 'wait',
        label: 'Sit in and sprint at the top',
        outcomes: [
          {
            chance: 0.5,
            text: 'You hide in the wheels until the last two hundred metres, then pip them at the line by the width of a tyre.',
            effects: [{ fame: 3 }, { stat: 'happiness', delta: 7 }],
            success: true,
          },
          {
            chance: 0.5,
            text: 'Someone else attacks, everybody hesitates, and the stage is gone. You finish fifth and the commentators call it "a missed opportunity".',
            effects: [{ stat: 'stress', delta: 4 }],
          },
        ],
      },
    ],
  },
  {
    id: 'prosport_cy_doctor_offer',
    kind: 'choice',
    category: 'work',
    emoji: '💉',
    ages: [20, 38],
    weight: 5,
    cooldownYears: 8,
    when: proIn('cycling'),
    text: 'The new team doctor closes the door of the hotel room and talks about "recovery support". There is a cool box, a list of dates and no paperwork. "Everyone does it," he says. "The trick is not getting caught."',
    choices: [
      {
        id: 'refuse',
        label: 'Refuse and walk out',
        outcomes: [
          {
            chance: 1,
            text: 'You leave the cool box closed. The doctor is gone from the team by the next race, and you finish the season clean and a little slower than some.',
            effects: [
              { stat: 'karma', delta: 6 },
              { stat: 'happiness', delta: 2 },
            ],
          },
        ],
      },
      {
        id: 'report',
        label: 'Report him to the authorities',
        outcomes: [
          {
            chance: 0.6,
            text: 'An investigation follows. The doctor is banned, the team is shaken up, and some riders stop speaking to you. A journalist calls you brave in print.',
            effects: [{ stat: 'karma', delta: 8 }, { fame: 3 }, { stat: 'stress', delta: 6 }],
            success: true,
          },
          {
            chance: 0.4,
            text: 'Nothing can be proven. The team quietly leaves you out of the big races, and the peloton treats you like a draught under a door.',
            effects: [
              { stat: 'karma', delta: 6 },
              { performance: -8 },
              { stat: 'happiness', delta: -6 },
            ],
          },
        ],
      },
      {
        id: 'accept',
        label: 'Take the programme',
        outcomes: [
          {
            chance: 0.55,
            text: "Your legs feel like someone else's. You win a stage, then another, and smile through every press conference with your stomach in knots.",
            effects: [
              { fame: 5 },
              { performance: 10 },
              { stat: 'karma', delta: -8 },
              { stat: 'stress', delta: 6 },
              { flag: 'doping' },
            ],
            success: true,
          },
          {
            chance: 0.45,
            text: 'A morning knock on the hotel door, a sample, and a positive test. You are banned for the season, your name is in every paper, and your mother cries on the phone.',
            effects: [
              { flag: 'doping' },
              { flag: 'banned' },
              { stat: 'happiness', delta: -15 },
              { stat: 'karma', delta: -8 },
              { fame: -6 },
              { notoriety: 8 },
              { performance: -20 },
            ],
          },
        ],
      },
    ],
  },

  // ---------- Athletics and swimming ----------
  {
    id: 'prosport_world_record',
    kind: 'choice',
    category: 'work',
    emoji: '⏱️',
    ages: [18, 34],
    weight: 6,
    cooldownYears: 4,
    when: (s) => proIn('athletics', 'swimming')(s) && s.career.level >= 2,
    text: 'Perfect conditions, a fast field, and pacing lights set to world-record speed. Your coach thinks you can do it. Your coach also thinks a lot of things.',
    choices: [
      {
        id: 'record',
        label: 'Go out at record pace',
        outcomes: [
          {
            chance: 0.25,
            text: 'You stay with the lights all the way, then pass them. The clock flashes, the stadium goes up, and your name goes into the record books in bold.',
            effects: [
              { fame: 10 },
              { stat: 'happiness', delta: 15 },
              { money: 50000, kind: 'wage' },
            ],
            success: true,
          },
          {
            chance: 0.75,
            text: 'You are a stride ahead of history for most of the race, then the last stretch takes it back. Fourth. A brave fourth, the commentators say.',
            effects: [
              { stat: 'happiness', delta: -5 },
              { stat: 'stress', delta: 4 },
            ],
          },
        ],
      },
      {
        id: 'win',
        label: 'Ignore the lights and race to win',
        outcomes: [
          {
            chance: 0.6,
            text: 'You sit, wait and kick at the end. A tidy win, a decent prize and a time nobody will mention in ten years.',
            effects: [{ money: 15000, kind: 'wage' }, { stat: 'happiness', delta: 5 }, { fame: 1 }],
            success: true,
          },
          {
            chance: 0.4,
            text: "The pace goes too slow, then too fast, and somebody else's kick is better than yours today.",
            effects: [{ stat: 'happiness', delta: -2 }],
          },
        ],
      },
    ],
  },
  {
    id: 'prosport_tech_offer',
    kind: 'choice',
    category: 'work',
    emoji: '👟',
    ages: [18, 36],
    weight: 6,
    cooldownYears: 6,
    when: proIn('athletics', 'swimming'),
    text: 'A rival kit maker offers you their prototype: a carbon-plated, wind-tunnel-tested miracle the governing body has not quite got round to banning. It means leaving your old sponsor.',
    choices: [
      {
        id: 'switch',
        label: 'Switch to the prototype',
        outcomes: [
          {
            chance: 0.5,
            text: "The new kit is unreasonably fast. You set three personal bests in a month and the old sponsor sends a lawyer's letter in their sulkiest font.",
            effects: [{ performance: 8 }, { fame: 3 }, { money: 30000, kind: 'wage' }],
            success: true,
          },
          {
            chance: 0.5,
            text: 'The governing body bans the prototype two weeks before the championships. You compete in an emergency replacement that fits like a borrowed coat.',
            effects: [{ performance: -6 }, { stat: 'stress', delta: 7 }],
          },
        ],
      },
      {
        id: 'loyal',
        label: 'Stay with your old sponsor',
        outcomes: [
          {
            chance: 1,
            text: 'Your sponsor rewards loyalty with a small bonus and a large fruit basket. Rivals in the new kit start beating you by tiny, maddening margins.',
            effects: [
              { money: 8000, kind: 'wage' },
              { stat: 'karma', delta: 1 },
              { performance: -2 },
            ],
          },
        ],
      },
    ],
  },
];
