/** Sports you can take up (Occupation > Pursuits), each with its own ladder and stories. */
export type SportDef = {
  id: string;
  label: string;
  emoji: string;
  /** Rungs from the school team to the national side. */
  levels: string[];
  olympic: boolean;
  /** What a good season looks like, in this sport. */
  good: string[];
  fair: string[];
  bad: string[];
};

export const SPORTS: SportDef[] = [
  {
    id: 'football',
    label: 'Football',
    emoji: '⚽',
    levels: [
      'the school team',
      'a local club',
      'the county squad',
      'a professional academy',
      'the national team',
    ],
    olympic: true,
    good: [
      'You score in the cup final and the whole team piles on top of you.',
      'A season of goals and assists; the coach starts building the team around you.',
    ],
    fair: ['A steady season in midfield: no headlines, no mistakes, plenty of mud.'],
    bad: ['You spend most of the season on the bench, and the rest in the rain.'],
  },
  {
    id: 'basketball',
    label: 'Basketball',
    emoji: '🏀',
    levels: [
      'the school team',
      'a club side',
      'the regional squad',
      'the national junior programme',
      'the national team',
    ],
    olympic: true,
    good: [
      'You hit the buzzer-beater in the league final and the gym explodes.',
      'Top scorer for the season, and a highlight reel people actually watch.',
    ],
    fair: ['A solid season off the bench, and a jump shot that is finally consistent.'],
    bad: ['A season of air balls and a coach who has stopped looking at you.'],
  },
  {
    id: 'tennis',
    label: 'Tennis',
    emoji: '🎾',
    levels: [
      'the school team',
      'club tournaments',
      'regional rankings',
      'the national junior circuit',
      'the professional tour',
    ],
    olympic: true,
    good: [
      'You win the regional title without dropping a set.',
      'A run of wins on the circuit, and your ranking leaps.',
    ],
    fair: ['Some wins, some three-set losses, and a serve that is getting there.'],
    bad: ['A season of double faults and early exits.'],
  },
  {
    id: 'athletics',
    label: 'Athletics',
    emoji: '🏃',
    levels: [
      'school sports day',
      'a running club',
      'the county championships',
      'the national juniors',
      'the national team',
    ],
    olympic: true,
    good: [
      'You win your event at the championships with a personal best by half a second.',
      'A season of personal bests and a coach who starts timing you with two watches.',
    ],
    fair: ['Personal bests in training, near misses in races.'],
    bad: ['A hamstring that never quite settles, and a season of slow times.'],
  },
  {
    id: 'swimming',
    label: 'Swimming',
    emoji: '🏊',
    levels: [
      'school galas',
      'a swimming club',
      'the county championships',
      'the national age-group squad',
      'the national team',
    ],
    olympic: true,
    good: [
      'A gold at the championships, and a club record that stands for years.',
      'Five-in-the-morning sessions pay off: a season of personal bests.',
    ],
    fair: ['Long early sessions, steady times, and permanently chlorinated hair.'],
    bad: ['You miss the qualifying time by a hundredth, three meets in a row.'],
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
    olympic: true,
    good: [
      'You win the regional road race in a sprint you will replay for years.',
      'A season of podiums, and a team manager who wants a word.',
    ],
    fair: ['Long rides, a few top-ten finishes, and legs like tree trunks.'],
    bad: ['A crash in the first race and a season spent getting your nerve back.'],
  },
];

export const SPORT_BY_ID: Record<string, SportDef> = Object.fromEntries(
  SPORTS.map((x) => [x.id, x]),
);
