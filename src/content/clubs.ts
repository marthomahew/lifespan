/** Clubs you can join (the Join a club activity): each with its own skill, stat and stories. */
export type ClubDef = {
  id: string;
  label: string;
  emoji: string;
  /** Too young for it below this age. */
  minAge?: number;
  /** Not around before this year. */
  fromYear?: number;
  skill?: string;
  /** A stat it nudges each time. */
  stat?: 'health' | 'smarts' | 'looks' | 'happiness' | 'discipline';
  good: string[];
  fair: string[];
  bad: string[];
};

export const CLUBS: ClubDef[] = [
  {
    id: 'chess',
    label: 'Chess club',
    emoji: '♟️',
    skill: 'chess',
    stat: 'smarts',
    good: [
      'The chess club is mostly snacks and arguing. You fit right in and make a friend.',
      'You beat the club’s oldest member and he insists on buying the tea.',
    ],
    fair: ['A season of Thursday evenings and one opening you finally understand.'],
    bad: ['Everyone at the chess club is either eight or eighty, and both groups beat you.'],
  },
  {
    id: 'running',
    label: 'Running club',
    emoji: '🏃',
    minAge: 12,
    skill: 'athletics',
    stat: 'health',
    good: [
      'Sunday long runs with the running club, and a friend who matches your pace exactly.',
      'You run your first 10K with the club cheering at the line.',
    ],
    fair: ['Cold mornings, steady miles, and a new pair of trainers you cannot really afford.'],
    bad: ['The running club’s idea of an easy pace is your idea of a sprint. You drift away.'],
  },
  {
    id: 'choir',
    label: 'Community choir',
    emoji: '🎶',
    skill: 'voice',
    stat: 'happiness',
    good: [
      'The choir’s winter concert gives you goosebumps in the alto section. You come home humming.',
      'You get a two-line solo and the whole choir claps for you at the next rehearsal.',
    ],
    fair: ['Tuesday nights of scales and gossip, and a carol service in a cold church.'],
    bad: [
      'The choir director moves you to the back row and asks you to “blend”. You take the hint.',
    ],
  },
  {
    id: 'drama',
    label: 'Amateur dramatics',
    emoji: '🎭',
    minAge: 10,
    stat: 'looks',
    good: [
      'You get a speaking part in the spring play and the audience laughs exactly where you hoped.',
      'Backstage friendships, a borrowed costume, and a standing ovation from forty people.',
    ],
    fair: ['You are Second Villager and give it everything you have.'],
    bad: ['Opening night, you forget your one line. Someone else says it for you.'],
  },
  {
    id: 'football',
    label: 'Five-a-side football',
    emoji: '⚽',
    minAge: 8,
    skill: 'athletics',
    stat: 'health',
    good: [
      'Your five-a-side team wins the league, and the trophy lives on your mantelpiece for a year.',
      'You score the winner in the last minute and the team carries you off, slightly.',
    ],
    fair: ['A season of Wednesday nights, two goals, and one sprained pride.'],
    bad: ['You spend the season in goal because nobody else will go there.'],
  },
  {
    id: 'book',
    label: 'Book club',
    emoji: '📚',
    minAge: 10,
    skill: 'writing',
    stat: 'smarts',
    good: [
      'The book club argues about an ending for three hours, and you win. You make a friend.',
      'You pick the month’s book and everyone loves it. You are insufferable for a week.',
    ],
    fair: ['Twelve books, eleven read, and more wine than literature.'],
    bad: ['Everyone at the book club has read the book except you, every single month.'],
  },
  {
    id: 'coding',
    label: 'Coding club',
    emoji: '💻',
    minAge: 9,
    fromYear: 1980,
    skill: 'programming',
    stat: 'smarts',
    good: [
      'Your coding club builds a game in a weekend. Yours is the level everyone plays twice.',
      'You fix a bug that has stumped the club for a month and are briefly a legend.',
    ],
    fair: ['Saturday mornings of tutorials and a program that mostly works.'],
    bad: ['You spend the whole term trying to make one thing compile.'],
  },
  {
    id: 'art',
    label: 'Life-drawing class',
    emoji: '🎨',
    minAge: 16,
    skill: 'art',
    stat: 'happiness',
    good: [
      'The tutor pins your drawing on the wall as an example. You pretend not to be thrilled.',
      'You fill a whole sketchbook and make a friend over the charcoal.',
    ],
    fair: ['Evening classes, smudged hands, and slow, real progress.'],
    bad: ['Everything you draw comes out looking like a potato. You stop going.'],
  },
  {
    id: 'cooking',
    label: 'Cookery class',
    emoji: '🍳',
    minAge: 12,
    skill: 'cooking',
    stat: 'happiness',
    good: [
      'You master a sauce that impresses even the tutor, and take home enough for a week.',
      'The class ends with a dinner you cooked for everyone. It is genuinely good.',
    ],
    fair: ['Ten weeks of chopping, and knife skills you will use for life.'],
    bad: ['You set off the smoke alarm twice in one evening. The tutor knows your name.'],
  },
  {
    id: 'debate',
    label: 'Debating society',
    emoji: '🗣️',
    minAge: 11,
    stat: 'smarts',
    good: [
      'You win the inter-school debate with an argument you did not believe when you started.',
      'A judge says your closing speech was the best she has heard in years.',
    ],
    fair: ['A year of motions, rebuttals, and arguing with your family for practice.'],
    bad: ['You freeze at the podium and the other side wins without trying.'],
  },
  {
    id: 'gardening',
    label: 'Allotment society',
    emoji: '🌱',
    minAge: 14,
    stat: 'health',
    good: [
      'Your marrow wins second prize at the allotment show. The rivalry with the first-prize winner begins.',
      'Your plot produces more courgettes than you can give away. Your neighbours start hiding.',
    ],
    fair: ['Slugs, weeding and one perfect tomato.'],
    bad: ['Your whole crop is eaten by something you never see.'],
  },
];

export const CLUB_BY_ID: Record<string, ClubDef> = Object.fromEntries(CLUBS.map((c) => [c.id, c]));
