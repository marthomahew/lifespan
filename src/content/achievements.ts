import { netWorthRef } from '../engine/networth';
import type { GameState } from '../engine/types';
import type { AchievementDef, LifeTitleDef } from './types';

// Net worth in today's money, converted from the local currency (yen and won are not dollars).
const nw = (s: GameState): number => netWorthRef(s);
const kids = (s: GameState): number => s.npcs.filter((n) => n.roles.includes('child')).length;
const hasDegree = (s: GameState, lvls: string[]): boolean =>
  s.education.degrees.some((d) => lvls.includes(d.level));
const flag = (s: GameState, f: string): boolean => s.player.flags.includes(f);
const skill = (s: GameState, k: string): number => s.player.skills[k] ?? 0;

/** Achievements (SPEC §5.14). Net-worth checks use local money over the price index, close enough for milestones. */
export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_words',
    label: 'First Words',
    emoji: '🗣️',
    description: 'Said something. It was mostly vowels.',
    check: (s) => s.player.age >= 1,
  },
  {
    id: 'school_days',
    label: 'School Days',
    emoji: '🎒',
    description: 'Survived the first day of school.',
    check: (s) => s.player.age >= 6 && !s.education.droppedOut,
  },
  {
    id: 'straight_a',
    label: 'Straight A',
    emoji: '📝',
    description: 'Got a report card your family framed.',
    check: (s) => s.player.age >= 6 && s.player.age <= 17 && s.education.grade >= 90,
  },
  {
    id: 'diploma',
    label: 'Diploma',
    emoji: '🎓',
    description: 'Finished high school.',
    check: (s) => hasDegree(s, ['high_school']),
  },
  {
    id: 'graduate',
    label: 'Graduate',
    emoji: '🧑‍🎓',
    description: 'Earned a university degree.',
    check: (s) => hasDegree(s, ['bachelor', 'associate']),
  },
  {
    id: 'doctor_of_something',
    label: 'Doctor of Something',
    emoji: '🔬',
    description: 'Earned a doctorate, a law degree, or a medical degree.',
    check: (s) => hasDegree(s, ['doctorate', 'law', 'medicine']),
  },
  {
    id: 'first_paycheck',
    label: 'First Pay Cheque',
    emoji: '💵',
    description: 'Got a full-time job.',
    check: (s) => flag(s, 'ever_employed_ft'),
  },
  {
    id: 'moving_up',
    label: 'Moving Up',
    emoji: '📈',
    description: 'Got promoted.',
    check: (s) => s.career.level >= 1,
  },
  {
    id: 'corner_office',
    label: 'Corner Office',
    emoji: '🏢',
    description: 'Reached level four of a career.',
    check: (s) => s.career.level >= 3,
  },
  {
    id: 'millionaire',
    label: 'Millionaire',
    emoji: '💰',
    description: 'Net worth of a million in today’s money.',
    check: (s) => nw(s) >= 1_000_000,
  },
  {
    id: 'deca_millionaire',
    label: 'Ten Times Over',
    emoji: '🏦',
    description: 'Net worth of ten million in today’s money.',
    check: (s) => nw(s) >= 10_000_000,
  },
  {
    id: 'homeowner',
    label: 'Homeowner',
    emoji: '🏡',
    description: 'Bought a home.',
    check: (s) => s.assets.homes.length > 0,
  },
  {
    id: 'wheels',
    label: 'Wheels',
    emoji: '🚗',
    description: 'Passed the driving test.',
    check: (s) => s.assets.licence,
  },
  {
    id: 'married',
    label: 'Tied the Knot',
    emoji: '💍',
    description: 'Got married.',
    check: (s) => flag(s, 'ever_married'),
  },
  {
    id: 'parent',
    label: 'Parent',
    emoji: '🍼',
    description: 'Had or adopted a child.',
    check: (s) => kids(s) >= 1,
  },
  {
    id: 'big_family',
    label: 'Head of a Small Nation',
    emoji: '👨‍👩‍👧‍👦',
    description: 'Raised four or more children.',
    check: (s) => kids(s) >= 4,
  },
  {
    id: 'grandparent',
    label: 'Grandparent',
    emoji: '👵',
    description: 'Your child had a child.',
    check: (s) => s.npcs.some((n) => n.roles.includes('grandchild')),
  },
  {
    id: 'octogenarian',
    label: 'Eighty Candles',
    emoji: '🎂',
    description: 'Reached 80.',
    check: (s) => s.player.age >= 80,
  },
  {
    id: 'centenarian',
    label: 'Centenarian',
    emoji: '💯',
    description: 'Reached 100.',
    check: (s) => s.player.age >= 100,
  },
  {
    id: 'globetrotter',
    label: 'Somewhere Else',
    emoji: '✈️',
    description: 'Emigrated to another country.',
    check: (s) => flag(s, 'emigrated'),
  },
  {
    id: 'polyglot',
    label: 'Polyglot',
    emoji: '🌐',
    description: 'Fluent in three languages.',
    check: (s) => Object.values(s.player.languages).filter((v) => v >= 50).length >= 3,
  },
  {
    id: 'famous',
    label: 'Recognised',
    emoji: '🌟',
    description: 'Fame of 50 or more.',
    check: (s) => s.player.stats.fame >= 50,
  },
  {
    id: 'superstar',
    label: 'Superstar',
    emoji: '💫',
    description: 'Fame of 90 or more.',
    check: (s) => s.player.stats.fame >= 90,
  },
  {
    id: 'signed',
    label: 'Signed',
    emoji: '💿',
    description: 'Signed a record deal.',
    check: (s) => s.music.label !== null,
  },
  {
    id: 'virtuoso',
    label: 'Virtuoso',
    emoji: '🎻',
    description: 'An instrument or voice skill of 90.',
    check: (s) => skill(s, 'instrument') >= 90 || skill(s, 'voice') >= 90,
  },
  {
    id: 'master_chef',
    label: 'Master Chef',
    emoji: '👨‍🍳',
    description: 'Cooking skill of 90.',
    check: (s) => skill(s, 'cooking') >= 90,
  },
  {
    id: 'published',
    label: 'Published',
    emoji: '📚',
    description: 'Sold a novel.',
    check: (s) => flag(s, 'published_novel'),
  },
  {
    id: 'veteran',
    label: 'Veteran',
    emoji: '🎖️',
    description: 'Left the military with an honorable discharge.',
    check: (s) => s.military?.discharge === 'honorable',
  },
  {
    id: 'decorated',
    label: 'Decorated',
    emoji: '🏅',
    description: 'Earned a military medal.',
    check: (s) => (s.military?.medals.length ?? 0) > 0,
  },
  {
    id: 'jailbird',
    label: 'Jailbird',
    emoji: '🔒',
    description: 'Went to prison.',
    check: (s) => flag(s, 'ever_imprisoned'),
  },
  {
    id: 'great_escape',
    label: 'The Great Escape',
    emoji: '🪜',
    description: 'Broke out of prison.',
    check: (s) => flag(s, 'fugitive') || flag(s, 'escaped_once'),
  },
  {
    id: 'clean_slate',
    label: 'Clean Slate',
    emoji: '🧽',
    description: 'Had a juvenile record sealed.',
    check: (s) => s.legal.sealed,
  },
  {
    id: 'saint',
    label: 'Saint',
    emoji: '😇',
    description: 'Karma of 90 or more.',
    check: (s) => s.player.stats.karma >= 90,
  },
  {
    id: 'villain',
    label: 'Villain',
    emoji: '😈',
    description: 'Karma of 10 or less.',
    check: (s) => s.player.stats.karma <= 10,
  },
  {
    id: 'survivor',
    label: 'Survivor',
    emoji: '🎗️',
    description: 'Beat a cancer or a tumour.',
    check: (s) => flag(s, 'survived_cancer'),
  },
  {
    id: 'sober',
    label: 'One Day at a Time',
    emoji: '🌅',
    description: 'Went to rehab and got clean.',
    check: (s) => s.vices.rehab > 0 && Object.values(s.vices.levels).every((v) => v < 15),
  },
  {
    id: 'jackpot',
    label: 'Jackpot',
    emoji: '🎰',
    description: 'Won the lottery.',
    check: (s) => flag(s, 'lottery_winner'),
  },
  {
    id: 'retired',
    label: 'Gone Fishing',
    emoji: '🎣',
    description: 'Retired with a pension.',
    check: (s) => s.career.retired,
  },
  {
    id: 'adopter',
    label: 'Chosen Family',
    emoji: '🧸',
    description: 'Adopted a child.',
    check: (s) => s.family.adoptions > 0,
  },
  {
    id: 'athlete',
    label: 'Peak Condition',
    emoji: '🏃',
    description: 'Athletics skill of 90.',
    check: (s) => skill(s, 'athletics') >= 90,
  },
  {
    id: 'bucket_list',
    label: 'Bucket List',
    emoji: '🪂',
    description: 'Ticked off five things from the bucket list.',
    check: (s) => s.player.flags.filter((f) => f === 'bucket_item').length >= 5,
  },
  {
    id: 'best_friend',
    label: 'Best Friend',
    emoji: '🐾',
    description: 'A pet lived out every one of its years with you.',
    check: (s) => s.pets.some((p) => p.fate === 'died' && p.age >= p.lifespan),
  },
  {
    id: 'full_house',
    label: 'Full House',
    emoji: '🏡',
    description: 'Four animals under one roof.',
    check: (s) => s.pets.filter((p) => p.alive).length >= 4,
  },
  {
    id: 'cold_case',
    label: 'Cold Case',
    emoji: '🗄️',
    description: 'Stayed out of sight for twenty years.',
    check: (s) => s.player.flags.includes('file_cold'),
  },
  {
    id: 'shortlisted',
    label: 'Shortlisted',
    emoji: '🏅',
    description: 'A novel of yours was shortlisted for a prize.',
  },
  {
    id: 'passport_stamps',
    label: 'Passport Stamps',
    emoji: '🧳',
    description: 'Holidayed in six different places.',
    check: (s) => s.player.flags.filter((f) => f.startsWith('visited:')).length >= 6,
  },
  {
    id: 'natural',
    label: 'Twenty-One',
    emoji: '🃏',
    description: 'Dealt a natural blackjack.',
    check: (s) => s.player.flags.includes('natural_blackjack'),
  },
  {
    id: 'wunderkind',
    label: 'Wunderkind',
    emoji: '🌟',
    description: 'Noticed as a prodigy before you were grown.',
    check: (s) => flag(s, 'prodigy_noticed') && s.player.age < 18,
  },
  {
    id: 'grandmaster',
    label: 'Grandmaster',
    emoji: '♟️',
    description: 'Earned the highest title in chess.',
    check: (s) => flag(s, 'chess_gm'),
  },
  {
    id: 'founder',
    label: 'Founder',
    emoji: '🏪',
    description: 'Opened a business of your own.',
    check: (s) => flag(s, 'founded_business'),
  },
  {
    id: 'household_name',
    label: 'Household Name',
    emoji: '🏙️',
    description: 'Grew a business into a household name.',
    check: (s) => (s.business?.level ?? 0) >= 5,
  },
];

export const ACHIEVEMENT_BY_ID: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);

/** Life titles for the obituary (SPEC §5.14), first match wins. */
export const LIFE_TITLES: LifeTitleDef[] = [
  { title: 'Gone Too Soon', when: (s) => s.player.age < 18 },
  {
    title: 'Lifer with Excellent Penmanship',
    when: (s) => s.legal.record.reduce((t, r) => t + r.sentenceYears, 0) >= 15,
  },
  { title: 'The Getaway Driver of Their Own Life', when: (s) => flag(s, 'fugitive') },
  {
    title: 'Crime Paid, Mostly',
    when: (s) => flag(s, 'ever_crime') && !flag(s, 'ever_imprisoned') && nw(s) >= 1_000_000,
  },
  { title: 'Famous for Being Famous, Eventually', when: (s) => s.player.stats.fame >= 70 },
  {
    title: 'One Hit, Several Misses',
    when: (s) =>
      s.music.releases.length > 0 &&
      s.music.releases.every((r) => r.quality < 75) &&
      s.music.releases.some((r) => r.quality >= 60),
  },
  { title: 'Decorated, Twice Over', when: (s) => (s.military?.medals.length ?? 0) >= 2 },
  { title: 'A Life in Uniform', when: (s) => (s.military?.years ?? 0) >= 12 },
  {
    title: 'The Smartest Person in Most Rooms',
    when: (s) => hasDegree(s, ['doctorate', 'law', 'medicine']) && s.player.stats.smarts >= 80,
  },
  { title: 'Rich Beyond Reason', when: (s) => nw(s) >= 10_000_000 },
  { title: 'Head of a Small Nation', when: (s) => kids(s) >= 5 },
  {
    title: 'Hopelessly Romantic, Repeatedly',
    when: (s) =>
      s.npcs.filter((n) => n.flags.includes('was_spouse') || n.roles.includes('spouse')).length >=
      3,
  },
  { title: 'Stubbornly Alive', when: (s) => s.player.age >= 100 },
  { title: 'Citizen of Somewhere Else', when: (s) => flag(s, 'emigrated') },
  { title: 'Genuinely Lovely Human', when: (s) => s.player.stats.karma >= 85 },
  { title: "Nobody's Favourite", when: (s) => s.player.stats.karma <= 15 },
  { title: 'Comfortably Off, Loudly', when: (s) => nw(s) >= 1_000_000 },
  {
    title: 'Gainfully Unemployed',
    when: (s) => s.player.age >= 30 && !flag(s, 'ever_employed_ft') && (s.military?.years ?? 0) < 4,
  },
  {
    title: 'Married to the Job',
    // Only for someone the job really was married to: no spouse, no children.
    when: (s) =>
      s.career.yearsWorked >= 40 &&
      kids(s) === 0 &&
      !s.npcs.some((n) => n.roles.includes('spouse') || n.flags.includes('was_spouse')),
  },
  { title: 'Ordinary, in the Best Way', when: () => true },
];
