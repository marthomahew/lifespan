/**
 * Politics: parties, policy areas for bills, and what offices are called where you live.
 * Generic parties (no real ones); real-world office titles by country.
 */
export type PartyId = 'progressive' | 'centrist' | 'conservative' | 'independent';

export const PARTIES: { id: PartyId; label: string; emoji: string; blurb: string }[] = [
  {
    id: 'progressive',
    label: 'Progressive Party',
    emoji: '🌹',
    blurb: 'Public services, workers’ rights and the climate.',
  },
  {
    id: 'centrist',
    label: 'Centre Party',
    emoji: '🕊️',
    blurb: 'Sensible compromises, balanced budgets and not too much of anything.',
  },
  {
    id: 'conservative',
    label: 'Conservative Party',
    emoji: '🦅',
    blurb: 'Lower taxes, strong defence, law and order, and tradition.',
  },
  {
    id: 'independent',
    label: 'Independent',
    emoji: '🎗️',
    blurb: 'No party machine behind you: harder to win, but nobody tells you how to vote.',
  },
];

export const PARTY_BY_ID = Object.fromEntries(PARTIES.map((p) => [p.id, p])) as Record<
  PartyId,
  (typeof PARTIES)[number]
>;

/** A bill's area, and how each party's voters feel about action on it (-1 hate .. +1 love). */
export type PolicyArea = {
  id: string;
  label: string;
  emoji: string;
  lean: Record<PartyId, number>;
  /** Karma for doing it (helping people), and how hard it is to pass. */
  karma: number;
  difficulty: number;
  passed: string;
  failed: string;
};

export const POLICY_AREAS: PolicyArea[] = [
  {
    id: 'healthcare',
    label: 'Expand healthcare',
    emoji: '🏥',
    lean: { progressive: 1, centrist: 0.4, conservative: -0.4, independent: 0.3 },
    karma: 4,
    difficulty: 0.15,
    passed:
      'Your healthcare bill passes. A nurse writes to say her patients can afford their prescriptions now.',
    failed: 'Your healthcare bill dies in committee, smothered by amendments about the cost.',
  },
  {
    id: 'tax_cut',
    label: 'Cut taxes',
    emoji: '💵',
    lean: { progressive: -0.6, centrist: 0.3, conservative: 1, independent: 0.2 },
    karma: -1,
    difficulty: 0.05,
    passed: 'Your tax cut passes. Pay slips get a little fatter and the treasury a little thinner.',
    failed: 'Your tax cut is voted down after economists line up on the news to call it reckless.',
  },
  {
    id: 'schools',
    label: 'Fund schools',
    emoji: '🏫',
    lean: { progressive: 0.8, centrist: 0.6, conservative: 0.2, independent: 0.5 },
    karma: 3,
    difficulty: 0.05,
    passed: 'Your schools bill passes. A head teacher invites you to open a new science block.',
    failed: 'Your schools bill stalls over how to pay for it, as these things do.',
  },
  {
    id: 'climate',
    label: 'Climate action',
    emoji: '🌍',
    lean: { progressive: 1, centrist: 0.3, conservative: -0.7, independent: 0.4 },
    karma: 4,
    difficulty: 0.2,
    passed:
      'Your climate bill passes. Protesters who once glued themselves to your office send flowers.',
    failed:
      'Your climate bill is defeated by a coalition of industry lobbyists and nervous colleagues.',
  },
  {
    id: 'crime',
    label: 'Tough on crime',
    emoji: '🚔',
    lean: { progressive: -0.4, centrist: 0.4, conservative: 1, independent: 0.3 },
    karma: 0,
    difficulty: 0.05,
    passed:
      'Your crime bill passes. More police on the streets, and a long argument about whether it helps.',
    failed: 'Your crime bill fails after a report says it would cost a fortune and prove nothing.',
  },
  {
    id: 'housing',
    label: 'Build more homes',
    emoji: '🏘️',
    lean: { progressive: 0.8, centrist: 0.7, conservative: 0.3, independent: 0.6 },
    karma: 3,
    difficulty: 0.15,
    passed: 'Your housing bill passes. Cranes appear on the skyline, and so do angry neighbours.',
    failed: 'Your housing bill is killed by members whose voters like their views as they are.',
  },
  {
    id: 'defence',
    label: 'Strengthen defence',
    emoji: '🛡️',
    lean: { progressive: -0.3, centrist: 0.4, conservative: 1, independent: 0.1 },
    karma: 0,
    difficulty: 0.1,
    passed: 'Your defence bill passes. Generals shake your hand firmly and at length.',
    failed: 'Your defence bill falls when its price tag is read out loud in the chamber.',
  },
  {
    id: 'transport',
    label: 'New transport links',
    emoji: '🚆',
    lean: { progressive: 0.6, centrist: 0.6, conservative: 0.3, independent: 0.5 },
    karma: 2,
    difficulty: 0.1,
    passed:
      'Your transport bill passes. In fifteen years a train will be named after you, probably.',
    failed: 'Your transport bill is shunted into a siding of feasibility studies.',
  },
];

export const POLICY_BY_ID = Object.fromEntries(POLICY_AREAS.map((p) => [p.id, p])) as Record<
  string,
  PolicyArea
>;

/** Presidential systems call the top job President. */
const PRESIDENTIAL = ['us', 'mx', 'br', 'ar', 'ph', 'ng', 'kr', 'fr', 'eg', 'tr', 'za'];

/** What each rung is called here: councillor, mayor, legislator, minister, head of government. */
export function officeTitles(country: string): string[] {
  const head =
    country === 'cn' ? 'Premier' : PRESIDENTIAL.includes(country) ? 'President' : 'Prime Minister';
  const legislator =
    country === 'us'
      ? 'Member of Congress'
      : country === 'uk'
        ? 'Member of Parliament (MP)'
        : 'Member of Parliament';
  const minister = country === 'us' ? 'Cabinet Secretary' : 'Government Minister';
  const council = country === 'us' ? 'City Council Member' : 'Local Councillor';
  return [council, 'Mayor', legislator, minister, head];
}
