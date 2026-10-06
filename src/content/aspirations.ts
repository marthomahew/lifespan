import type { GameState } from '../engine/types';

/** A life goal the player chooses (up to three at once) and is celebrated for reaching. */
export type AspirationDef = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  done: (s: GameState) => boolean;
};

const realNetWorth = (s: GameState): number => {
  const m = s.money;
  const a = s.assets;
  const local =
    m.cash +
    m.savings +
    Object.values(m.holdings).reduce((x, y) => x + y, 0) +
    [...a.homes, ...a.vehicles, ...a.possessions].reduce((x, y) => x + y.value, 0) -
    m.loans.reduce((x, l) => x + l.balance, 0);
  return local / Math.max(1e-9, s.inflation);
};
const job = (s: GameState, id: string, level = 0): boolean =>
  s.career.jobId === id && s.career.level >= level;
const degree = (s: GameState, levels: string[]): boolean =>
  s.education.degrees.some((d) => levels.includes(d.level));
const flag = (s: GameState, f: string): boolean => s.player.flags.includes(f);
const adultRecord = (s: GameState): boolean =>
  s.legal.record.some((r) => (r.verdict === 'convicted' || r.verdict === 'plea') && !r.juvenile);

export const ASPIRATIONS: AspirationDef[] = [
  {
    id: 'doctor',
    label: 'Become a doctor',
    emoji: '🩺',
    description: 'Medical school, residency, and your name on a door.',
    done: (s) => job(s, 'doctor', 1),
  },
  {
    id: 'partner',
    label: 'Make partner or take the bench',
    emoji: '⚖️',
    description: 'Partner at a law firm, or a judge.',
    done: (s) => job(s, 'lawyer', 3) || job(s, 'judge'),
  },
  {
    id: 'run_company',
    label: 'Run a company',
    emoji: '🏢',
    description: 'Chief executive, or owner of your own business.',
    done: (s) =>
      job(s, 'corporate_executive', 4) ||
      // Your own business, past its third birthday.
      (!!s.business && s.year - s.business.founded >= 3) ||
      ['plumber', 'florist', 'photographer', 'personal_trainer', 'landscaper'].some((j) =>
        job(s, j, 3),
      ),
  },
  {
    id: 'professor',
    label: 'Become a full professor',
    emoji: '🎓',
    description: 'Tenure, a corner of the library, and graduate students who fear you.',
    done: (s) => job(s, 'professor', 3),
  },
  {
    id: 'degree',
    label: 'Graduate from university',
    emoji: '📜',
    description: "A bachelor's degree or better.",
    done: (s) => degree(s, ['bachelor', 'master', 'doctorate', 'law', 'medicine', 'mba']),
  },
  {
    id: 'doctorate',
    label: 'Earn a doctorate',
    emoji: '🧪',
    description: 'A PhD, a law degree, or a medical degree.',
    done: (s) => degree(s, ['doctorate', 'law', 'medicine']),
  },
  {
    id: 'own_home',
    label: 'Own your home outright',
    emoji: '🏡',
    description: 'A home of your own with the mortgage paid off.',
    done: (s) => s.assets.homes.length > 0 && !s.money.loans.some((l) => l.kind === 'mortgage'),
  },
  {
    id: 'millionaire',
    label: 'Become a millionaire',
    emoji: '💰',
    description: 'A net worth of a million in today’s money.',
    done: (s) => realNetWorth(s) >= 1_000_000,
  },
  {
    id: 'marry',
    label: 'Marry for love',
    emoji: '💍',
    description: 'Find someone and make it official.',
    done: (s) => flag(s, 'ever_married'),
  },
  {
    id: 'big_family',
    label: 'Raise a big family',
    emoji: '👨‍👩‍👧‍👦',
    description: 'Three children or more.',
    done: (s) => s.npcs.filter((n) => n.roles.includes('child')).length >= 3,
  },
  {
    id: 'abroad',
    label: 'Make a life abroad',
    emoji: '✈️',
    description: 'Live somewhere other than the country you were born in.',
    done: (s) => s.player.country !== s.player.birthCountry,
  },
  {
    id: 'polyglot',
    label: 'Speak three languages well',
    emoji: '🗣️',
    description: 'Fluency of 60 or more in three languages.',
    done: (s) => Object.values(s.player.languages).filter((v) => v >= 60).length >= 3,
  },
  {
    id: 'famous',
    label: 'Become famous',
    emoji: '🌟',
    description: 'Fame of 60 or more.',
    done: (s) => s.player.stats.fame >= 60,
  },
  {
    id: 'record_deal',
    label: 'Sign a record deal',
    emoji: '🎤',
    description: 'A label wants your music.',
    done: (s) => s.music.label !== null,
  },
  {
    id: 'novel',
    label: 'Publish a novel',
    emoji: '📚',
    description: 'Write it, finish it, and sell it.',
    done: (s) => flag(s, 'published_novel'),
  },
  {
    id: 'pro_athlete',
    label: 'Go professional in sport',
    emoji: '🏅',
    description: 'Get paid to play.',
    done: (s) => job(s, 'professional_athlete'),
  },
  {
    id: 'serve',
    label: 'Serve with honour',
    emoji: '🎖️',
    description: 'Complete military service with an honourable discharge.',
    done: (s) => s.military?.discharge === 'honorable',
  },
  {
    id: 'retire_early',
    label: 'Retire before 55',
    emoji: '🏖️',
    description: 'Stop working while you still have the knees for it.',
    done: (s) => s.career.retired && s.player.age < 55,
  },
  {
    id: 'clean_life',
    label: 'Reach 70 with a clean record',
    emoji: '😇',
    description: 'No adult convictions, all the way to 70.',
    done: (s) => s.player.age >= 70 && !adultRecord(s),
  },
  {
    id: 'kind_soul',
    label: 'Be known for your kindness',
    emoji: '🤲',
    description: 'Karma of 85 or more.',
    done: (s) => s.player.stats.karma >= 85,
  },
];

export const ASPIRATION_BY_ID: Record<string, AspirationDef> = Object.fromEntries(
  ASPIRATIONS.map((a) => [a.id, a]),
);
