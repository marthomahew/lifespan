/**
 * Professional sport, sport by sport: the league and its honours, the positions you can
 * play (and what each is paid relative to the sport's scale), a season's statistics for a
 * position at a given form, and the rookie pay scale for draft sports. Figures are real
 * 2024–25 levels, roughly.
 */
export type Position = {
  id: string;
  label: string;
  /** Pay relative to the sport's scale: quarterbacks earn most, kickers least. */
  pay: number;
  /** A season's numbers at this form (q: 0..1 from form; r: 0..1 luck). */
  stats: (q: number, r: number) => string;
};

export type ProLeague = {
  /** The top division or tour. */
  league: string;
  /** Winning it all. */
  title: string;
  /** The all-star honour. */
  allStar: string;
  /** The individual award. */
  mvp: string;
  /** Club nicknames for team names ("the Denver Comets"). */
  nicknames: string[];
  positions: Position[];
  /**
   * Draft sports only: rookie pay (today's dollars a year) by pick, as [last pick in the
   * band, pay], and how many picks a draft has.
   */
  rookie?: { scale: [number, number][]; picks: number; perRound: number };
};

const n = (x: number): string => Math.round(x).toLocaleString('en-US');
const d1 = (x: number): string => x.toFixed(1);
const rank = (q: number, r: number): number =>
  Math.max(1, Math.round(220 * (1 - q) ** 2 + r * 8 - 3));

export const PRO_LEAGUES: Record<string, ProLeague> = {
  american_football: {
    league: 'the NFL',
    title: 'the Super Bowl',
    allStar: 'the Pro Bowl',
    mvp: 'league MVP',
    nicknames: [
      'Comets',
      'Wolves',
      'Ironmen',
      'Mustangs',
      'Hawks',
      'Pioneers',
      'Storm',
      'Bulldogs',
    ],
    positions: [
      {
        id: 'qb',
        label: 'Quarterback',
        pay: 1.25,
        stats: (q, r) =>
          `${n(1800 + q * 2900 + r * 400)} passing yards and ${n(8 + q * 30 + r * 5)} touchdowns`,
      },
      {
        id: 'rb',
        label: 'Running back',
        pay: 0.6,
        stats: (q, r) =>
          `${n(350 + q * 1400 + r * 250)} rushing yards and ${n(2 + q * 14 + r * 3)} touchdowns`,
      },
      {
        id: 'wr',
        label: 'Wide receiver',
        pay: 0.9,
        stats: (q, r) =>
          `${n(30 + q * 85 + r * 10)} catches for ${n(350 + q * 1300 + r * 200)} yards`,
      },
      {
        id: 'ol',
        label: 'Offensive lineman',
        pay: 0.8,
        stats: (q, r) =>
          `${n(10 + q * 7)} starts and ${n(Math.max(0, 9 - q * 8 + r * 2))} sacks allowed`,
      },
      {
        id: 'lb',
        label: 'Linebacker',
        pay: 0.8,
        stats: (q, r) => `${n(40 + q * 110 + r * 15)} tackles and ${d1(q * 11 + r * 2)} sacks`,
      },
      {
        id: 'cb',
        label: 'Cornerback',
        pay: 0.8,
        stats: (q, r) =>
          `${n(q * 7 + r * 2)} interceptions and ${n(4 + q * 16 + r * 3)} passes defended`,
      },
      {
        id: 'k',
        label: 'Kicker',
        pay: 0.3,
        stats: (q, r) => `${n(70 + q * 26 + r * 3)}% of field goals, ${n(45 + q * 15)} yards long`,
      },
    ],
    rookie: {
      scale: [
        [1, 10_000_000],
        [10, 6_000_000],
        [32, 3_000_000],
        [64, 1_500_000],
        [256, 1_000_000],
      ],
      picks: 256,
      perRound: 32,
    },
  },
  basketball: {
    league: 'the NBA',
    title: 'the championship',
    allStar: 'the All-Star Game',
    mvp: 'MVP',
    nicknames: ['Blaze', 'Kings', 'Rockets', 'Spirit', 'Thunderbirds', 'Cyclones', 'Monarchs'],
    positions: [
      {
        id: 'pg',
        label: 'Point guard',
        pay: 1,
        stats: (q, r) => `${d1(5 + q * 24 + r * 3)} points and ${d1(2 + q * 8 + r)} assists a game`,
      },
      {
        id: 'sg',
        label: 'Shooting guard',
        pay: 1,
        stats: (q, r) => `${d1(6 + q * 26 + r * 3)} points a game, ${n(33 + q * 9)}% from three`,
      },
      {
        id: 'sf',
        label: 'Small forward',
        pay: 1,
        stats: (q, r) =>
          `${d1(6 + q * 24 + r * 3)} points and ${d1(2 + q * 6 + r)} rebounds a game`,
      },
      {
        id: 'pf',
        label: 'Power forward',
        pay: 0.95,
        stats: (q, r) =>
          `${d1(5 + q * 21 + r * 3)} points and ${d1(3 + q * 9 + r)} rebounds a game`,
      },
      {
        id: 'c',
        label: 'Center',
        pay: 0.95,
        stats: (q, r) =>
          `${d1(4 + q * 22 + r * 3)} points, ${d1(4 + q * 10 + r)} rebounds and ${d1(q * 3)} blocks a game`,
      },
    ],
    rookie: {
      scale: [
        [1, 10_000_000],
        [10, 6_000_000],
        [30, 3_000_000],
        [60, 1_200_000],
      ],
      picks: 60,
      perRound: 30,
    },
  },
  ice_hockey: {
    league: 'the NHL',
    title: 'the Stanley Cup',
    allStar: 'the All-Star Game',
    mvp: 'the Hart Trophy',
    nicknames: ['Blades', 'Bears', 'Huskies', 'Northmen', 'Flyers', 'Glaciers', 'Raiders'],
    positions: [
      {
        id: 'g',
        label: 'Goaltender',
        pay: 1,
        stats: (q, r) =>
          `a .${n(885 + q * 42 + r * 6)} save percentage and ${n(q * 8 + r * 2)} shutouts`,
      },
      {
        id: 'd',
        label: 'Defenceman',
        pay: 0.9,
        stats: (q, r) => `${n(q * 20 + r * 3)} goals and ${n(8 + q * 60 + r * 8)} points`,
      },
      {
        id: 'c',
        label: 'Center',
        pay: 1.1,
        stats: (q, r) => `${n(4 + q * 46 + r * 6)} goals and ${n(12 + q * 95 + r * 10)} points`,
      },
      {
        id: 'w',
        label: 'Winger',
        pay: 1,
        stats: (q, r) => `${n(5 + q * 50 + r * 6)} goals and ${n(10 + q * 80 + r * 10)} points`,
      },
    ],
    rookie: {
      scale: [
        [32, 950_000],
        [224, 800_000],
      ],
      picks: 224,
      perRound: 32,
    },
  },
  football: {
    league: 'the top flight',
    title: 'the league title',
    allStar: 'the Team of the Season',
    mvp: 'Player of the Year',
    nicknames: ['United', 'City', 'Rovers', 'Athletic', 'Wanderers', 'Albion', 'Town'],
    positions: [
      {
        id: 'gk',
        label: 'Goalkeeper',
        pay: 0.6,
        stats: (q, r) => `${n(3 + q * 18 + r * 3)} clean sheets in ${n(25 + q * 13)} games`,
      },
      {
        id: 'def',
        label: 'Defender',
        pay: 0.8,
        stats: (q, r) => `${n(25 + q * 13)} appearances, ${n(q * 5 + r * 2)} goals`,
      },
      {
        id: 'mid',
        label: 'Midfielder',
        pay: 1,
        stats: (q, r) => `${n(q * 12 + r * 3)} goals and ${n(1 + q * 14 + r * 3)} assists`,
      },
      {
        id: 'fwd',
        label: 'Forward',
        pay: 1.3,
        stats: (q, r) => `${n(2 + q * 30 + r * 4)} goals in all competitions`,
      },
    ],
  },
  tennis: {
    league: 'the tour',
    title: 'a Grand Slam',
    allStar: 'the Tour Finals',
    mvp: 'year-end world No. 1',
    nicknames: [],
    positions: [
      {
        id: 'base',
        label: 'Baseliner',
        pay: 1,
        stats: (q, r) => `${n(q * q * 7 + r)} titles, ranked No. ${rank(q, r)} in the world`,
      },
      {
        id: 'sv',
        label: 'Serve-and-volleyer',
        pay: 1,
        stats: (q, r) => `${n(q * q * 6 + r)} titles, ranked No. ${rank(q, r)} in the world`,
      },
      {
        id: 'all',
        label: 'All-court player',
        pay: 1,
        stats: (q, r) => `${n(q * q * 7 + r)} titles, ranked No. ${rank(q, r)} in the world`,
      },
    ],
  },
  athletics: {
    league: 'the circuit',
    title: 'a world title',
    allStar: 'the Diamond League final',
    mvp: 'World Athlete of the Year',
    nicknames: [],
    positions: [
      {
        id: 'sprint',
        label: 'Sprinter',
        pay: 1.2,
        stats: (q, r) => `${n(q * 8 + r * 2)} meeting wins, ranked No. ${rank(q, r)} in the world`,
      },
      {
        id: 'mid',
        label: 'Middle-distance runner',
        pay: 0.9,
        stats: (q, r) => `${n(q * 7 + r * 2)} meeting wins, ranked No. ${rank(q, r)} in the world`,
      },
      {
        id: 'long',
        label: 'Distance runner',
        pay: 0.9,
        stats: (q, r) => `${n(q * 4 + r)} marathon and road wins, ranked No. ${rank(q, r)}`,
      },
      {
        id: 'jump',
        label: 'Jumper',
        pay: 0.8,
        stats: (q, r) => `${n(q * 7 + r * 2)} meeting wins, ranked No. ${rank(q, r)} in the world`,
      },
      {
        id: 'throw',
        label: 'Thrower',
        pay: 0.7,
        stats: (q, r) => `${n(q * 7 + r * 2)} meeting wins, ranked No. ${rank(q, r)} in the world`,
      },
    ],
  },
  swimming: {
    league: 'the circuit',
    title: 'a world title',
    allStar: 'the world championship final',
    mvp: 'Swimmer of the Year',
    nicknames: [],
    positions: [
      {
        id: 'free',
        label: 'Freestyler',
        pay: 1.1,
        stats: (q, r) => `${n(q * 9 + r * 2)} World Cup wins, ranked No. ${rank(q, r)}`,
      },
      {
        id: 'back',
        label: 'Backstroker',
        pay: 0.9,
        stats: (q, r) => `${n(q * 8 + r * 2)} World Cup wins, ranked No. ${rank(q, r)}`,
      },
      {
        id: 'breast',
        label: 'Breaststroker',
        pay: 0.9,
        stats: (q, r) => `${n(q * 8 + r * 2)} World Cup wins, ranked No. ${rank(q, r)}`,
      },
      {
        id: 'fly',
        label: 'Butterflyer',
        pay: 0.9,
        stats: (q, r) => `${n(q * 8 + r * 2)} World Cup wins, ranked No. ${rank(q, r)}`,
      },
      {
        id: 'im',
        label: 'Medley swimmer',
        pay: 1,
        stats: (q, r) => `${n(q * 8 + r * 2)} World Cup wins, ranked No. ${rank(q, r)}`,
      },
    ],
  },
  cycling: {
    league: 'the WorldTour',
    title: 'a Grand Tour',
    allStar: 'the world championships',
    mvp: 'world No. 1 on the rankings',
    nicknames: [],
    positions: [
      {
        id: 'climb',
        label: 'Climber',
        pay: 1.2,
        stats: (q, r) => `${n(q * q * 9 + r)} wins, including ${n(q * q * 3)} mountain stages`,
      },
      {
        id: 'sprint',
        label: 'Sprinter',
        pay: 1,
        stats: (q, r) => `${n(q * 14 + r * 2)} wins, most of them bunch sprints`,
      },
      {
        id: 'tt',
        label: 'Time triallist',
        pay: 0.9,
        stats: (q, r) => `${n(q * 6 + r)} time-trial wins`,
      },
      {
        id: 'dom',
        label: 'Domestique',
        pay: 0.5,
        stats: (q, r) => `${n(40 + q * 30 + r * 10)} race days in service of the team leader`,
      },
    ],
  },
};
