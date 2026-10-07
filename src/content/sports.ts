/** Sports you can take up (Occupation > Pursuits), each with its own ladder and stories. */
export type SportDef = {
  id: string;
  label: string;
  emoji: string;
  /** Rungs from the first team you join to the national side. */
  levels: string[];
  /** The youngest age for each rung: nobody plays college football at 13. */
  ages: number[];
  /** Where an adult beginner starts (instead of the youth rung). */
  adult: string;
  /** Rungs you reach by being recruited or transferring, not by being picked. */
  recruited?: number[];
  olympic: boolean;
  /** What a good season looks like, in this sport. */
  good: string[];
  fair: string[];
  bad: string[];
  /**
   * The professional ladder, rung by rung (career level 0–4), with yearly pay in today's
   * dollars: salaries, or prize money and sponsors where a sport has no salaries. Real
   * 2024–25 figures, roughly (league minimums, typical contracts, the top earners).
   */
  pro: { titles: string[]; pay: [number, number][] };
  /**
   * How a career starts, and the youngest it can: a club contract, the draft (after college),
   * turning pro on the tour, a sponsor's deal, or a professional team's neo-pro contract.
   */
  route: { kind: 'club' | 'draft' | 'tour' | 'sponsor' | 'team'; age: number };
};

export const SPORTS: SportDef[] = [
  {
    id: 'football',
    label: 'Football',
    emoji: '⚽',
    levels: [
      'a youth club',
      'a district select side',
      'a professional academy',
      'the national youth team',
      'the national team',
    ],
    ages: [6, 9, 12, 15, 18],
    adult: 'a Sunday league side',
    olympic: true,
    good: [
      'You score in the cup final and the whole team piles on top of you.',
      'A season of goals and assists; the coach starts building the team around you.',
    ],
    fair: ['A steady season in midfield: no headlines, no mistakes, plenty of mud.'],
    bad: ['You spend most of the season on the bench, and the rest in the rain.'],
    route: { kind: 'club', age: 17 },
    pro: {
      titles: [
        'Lower-League Pro',
        'Squad Player',
        'First-Team Regular',
        'International',
        'Superstar',
      ],
      pay: [
        [30000, 90000],
        [150000, 800000],
        [1000000, 5000000],
        [5000000, 20000000],
        [20000000, 60000000],
      ],
    },
  },
  {
    id: 'basketball',
    label: 'Basketball',
    emoji: '🏀',
    levels: [
      'a youth league',
      'the school team',
      'an elite travel team',
      'a college team',
      'the national team',
    ],
    ages: [6, 12, 14, 18, 19],
    adult: 'a pickup league',
    recruited: [3],
    olympic: true,
    good: [
      'You hit the buzzer-beater in the league final and the gym explodes.',
      'Top scorer for the season, and a highlight reel people actually watch.',
    ],
    fair: ['A solid season off the bench, and a jump shot that is finally consistent.'],
    bad: ['A season of air balls and a coach who has stopped looking at you.'],
    route: { kind: 'draft', age: 19 },
    pro: {
      titles: [
        'Overseas / G League Pro',
        'NBA Bench Player',
        'NBA Rotation Player',
        'NBA Starter',
        'All-Star',
      ],
      pay: [
        [40000, 300000],
        [1100000, 3000000],
        [3000000, 12000000],
        [12000000, 35000000],
        [35000000, 55000000],
      ],
    },
  },
  {
    id: 'tennis',
    label: 'Tennis',
    emoji: '🎾',
    levels: [
      'club lessons',
      'junior tournaments',
      'the national junior rankings',
      'the junior international circuit',
      'the national team',
    ],
    ages: [6, 9, 12, 14, 17],
    adult: 'club league tennis',
    olympic: true,
    good: [
      'You win the regional title without dropping a set.',
      'A run of wins on the circuit, and your ranking leaps.',
    ],
    fair: ['Some wins, some three-set losses, and a serve that is getting there.'],
    bad: ['A season of double faults and early exits.'],
    route: { kind: 'tour', age: 16 },
    pro: {
      titles: [
        'Challenger Tour Player',
        'Top-200 Pro',
        'Top-100 Pro',
        'Top-10 Player',
        'Grand Slam Champion',
      ],
      pay: [
        [20000, 80000],
        [100000, 400000],
        [500000, 2000000],
        [5000000, 15000000],
        [15000000, 40000000],
      ],
    },
  },
  {
    id: 'athletics',
    label: 'Athletics',
    emoji: '🏃',
    levels: [
      'the school team',
      'an athletics club',
      'regional championships',
      'the national junior squad',
      'the national team',
    ],
    ages: [6, 9, 12, 15, 18],
    adult: 'a running club',
    olympic: true,
    good: [
      'You win your event at the championships with a personal best by half a second.',
      'A season of personal bests and a coach who starts timing you with two watches.',
    ],
    fair: ['Personal bests in training, near misses in races.'],
    bad: ['A hamstring that never quite settles, and a season of slow times.'],
    route: { kind: 'sponsor', age: 18 },
    pro: {
      titles: [
        'Semi-Pro Athlete',
        'Sponsored Athlete',
        'Diamond League Regular',
        'Global Medallist',
        'Global Superstar',
      ],
      pay: [
        [15000, 40000],
        [40000, 120000],
        [150000, 500000],
        [500000, 2000000],
        [3000000, 15000000],
      ],
    },
  },
  {
    id: 'swimming',
    label: 'Swimming',
    emoji: '🏊',
    levels: [
      'a swimming club',
      'the county squad',
      'regional championships',
      'the national junior squad',
      'the national team',
    ],
    ages: [6, 9, 11, 14, 16],
    adult: 'masters swimming',
    olympic: true,
    good: [
      'A gold at the championships, and a club record that stands for years.',
      'Five-in-the-morning sessions pay off: a season of personal bests.',
    ],
    fair: ['Long early sessions, steady times, and permanently chlorinated hair.'],
    bad: ['You miss the qualifying time by a hundredth, three meets in a row.'],
    route: { kind: 'sponsor', age: 18 },
    pro: {
      titles: [
        'Club Professional',
        'Funded National Squad',
        'International Finalist',
        'Olympic Medallist',
        'Global Superstar',
      ],
      pay: [
        [10000, 30000],
        [30000, 80000],
        [100000, 300000],
        [300000, 1500000],
        [2000000, 8000000],
      ],
    },
  },
  {
    id: 'cycling',
    label: 'Cycling',
    emoji: '🚴',
    levels: [
      'weekend rides',
      'a cycling club',
      'regional races',
      'a development team',
      'the national team',
    ],
    ages: [6, 10, 13, 17, 19],
    adult: 'a cycling club',
    olympic: true,
    good: [
      'You win the regional road race in a sprint you will replay for years.',
      'A season of podiums, and a team manager who wants a word.',
    ],
    fair: ['Long rides, a few top-ten finishes, and legs like tree trunks.'],
    bad: ['A crash in the first race and a season spent getting your nerve back.'],
    route: { kind: 'team', age: 19 },
    pro: {
      titles: [
        'Continental Team Rider',
        'Neo-Pro',
        'WorldTour Domestique',
        'Team Leader',
        'Grand Tour Champion',
      ],
      pay: [
        [15000, 40000],
        [45000, 120000],
        [150000, 600000],
        [1000000, 3000000],
        [4000000, 8000000],
      ],
    },
  },
  {
    id: 'american_football',
    label: 'American football',
    emoji: '🏈',
    levels: [
      'youth flag football',
      'the high-school junior varsity',
      'the high-school varsity team',
      'a college team',
      'a major college programme',
    ],
    ages: [6, 14, 15, 18, 18],
    adult: 'a recreational league',
    recruited: [3, 4],
    olympic: false,
    good: [
      'You run back the opening kick-off for a touchdown, and the stands do not sit down again.',
      'A season of big plays on Friday nights; scouts start sitting in the front row.',
    ],
    fair: ['A grinding season in the trenches: bruises, film sessions and a few good drives.'],
    bad: ['A torn hamstring in week three and a season spent watching from the sideline.'],
    route: { kind: 'draft', age: 21 },
    pro: {
      titles: ['Practice Squad Player', 'Backup', 'Starter', 'Pro Bowler', 'Franchise Star'],
      pay: [
        [216000, 300000],
        [840000, 2000000],
        [2000000, 10000000],
        [10000000, 30000000],
        [30000000, 55000000],
      ],
    },
  },
  {
    id: 'ice_hockey',
    label: 'Ice hockey',
    emoji: '🏒',
    levels: [
      'youth hockey',
      'a travel team',
      'major junior hockey',
      'the national junior team',
      'the national team',
    ],
    ages: [6, 10, 16, 17, 19],
    adult: 'a beer league',
    olympic: true,
    good: [
      'A hat-trick in the play-off final, and the rink fills with hats.',
      'A season of goals and hard checks; scouts with clipboards start turning up at practice.',
    ],
    fair: ['A steady season on the third line: good shifts, sore shoulders, cold mornings.'],
    bad: ['A season spent mostly in the penalty box, and the rest on the bench.'],
    route: { kind: 'draft', age: 18 },
    pro: {
      titles: ['Minor-League Pro', 'Fourth-Liner', 'Regular Starter', 'All-Star', 'Franchise Star'],
      pay: [
        [50000, 100000],
        [775000, 1500000],
        [1500000, 5000000],
        [5000000, 10000000],
        [10000000, 16000000],
      ],
    },
  },
];

export const SPORT_BY_ID: Record<string, SportDef> = Object.fromEntries(
  SPORTS.map((x) => [x.id, x]),
);
