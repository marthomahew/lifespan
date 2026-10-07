import { Modal } from '../components/Modal';
import { app } from '../store/app';

export const SHORTCUTS: [string, string][] = [
  ['Space', 'Age Up'],
  ['1 – 4', 'Choose in a popup'],
  ['Esc', 'Close the top window or panel (event popups need an answer)'],
  ['⌘1 – ⌘4', 'Switch tabs (Occupation, Assets, Relationships, Activities)'],
  ['⌘K', 'Command palette: find any action'],
  ['⌘S', 'Save'],
  ['⌘L', 'Lives'],
  ['⌘,', 'Settings'],
  ['?', 'This help'],
  ['` or ⇧⌘K', 'Toggle the cheat panel'],
];

/** Short notes on the systems that aren't obvious from the screen. */
export const GUIDE: [string, string][] = [
  [
    'Free time and work time',
    'Each year holds free-time pips for activities (nine for children, eight for adults; fewer with a full-time job, a team or small children, more in retirement or with household staff) and six work-time pips for career moves in Occupation: tournaments, gigs, extra training, fame deals. Health care and paperwork are free. Both refill on your birthday; unused pips don’t carry over. Settings can switch the limits off.',
  ],
  [
    'A focus',
    'In Activities, give your spare time to one skill or language for one pip a year. It practises itself every year, and each year in a row adds momentum (up to +60%). Practice on top of a focus counts in full. Children learn fastest, and so do the gifted; the last points to 100 come slowly but steadily. Skills don’t rust before 30.',
  ],
  [
    'Gifts and prodigies',
    'At the start, a gift for one skill makes it grow faster; a prodigy’s gift much faster. A child far ahead of their age gets noticed: chess tournaments and a grandmaster’s title, recitals, an orchestra debut, a premiere, and more.',
  ],
  [
    'Luck',
    'Pick-only gifts at the start (never rolled): lucky with money, a charmed career, a born athlete, a golden ear, never caught, the Midas touch, or a charmed life. They are generous on purpose.',
  ],
  [
    'Your own business',
    'From 18, open one in Occupation. Run it yourself (it is your job) or hire a manager. Its momentum rises with your skill and hours; profit follows. Grow it, invest when it wobbles, or sell it.',
  ],
  [
    'Backgrounds',
    'An optional start with its own stories: a family business, parents with plans, a famous parent, always moving, new arrivals, raised by a grandparent, a twin, or adoption. Pick one when you build a life; Settings decides how often a random life gets one (off by default).',
  ],
  [
    'Memory and chains',
    'People remember what you did and bring it back years later. Many choices schedule a follow-up: what you decide now may come round again.',
  ],
  [
    'Sport',
    'Take up a sport (and a position) in Occupation › Pursuits. Seasons play out on your birthday; rungs open with age. Strong school athletes in the US are offered scholarships; each sport goes pro its own way (a club at 17, the draft after college, the tour, a sponsor). Pros get contracts, statistics, honours and trades.',
  ],
  [
    'Chess',
    'Tournaments earn an Elo rating and norms toward titles (GM at 2500 with three norms). At the top: the World Rapid & Blitz, the World Cup, the Candidates and the title match. A champion keeps the title until beaten.',
  ],
  [
    'Money and markets',
    'Real history drives prices, mortgage rates, index funds and famous shares (year-end prices to 2025). Bitcoin appears once you have heard of it. When money is tight, Assets › Making ends meet has gig work and other options; with wealth, The good life opens tier by tier.',
  ],
  [
    'Growing up',
    'Your family’s wealth shapes your childhood: the home, state or private school (private lifts grades and later helps in law, finance and public service), pocket money, lessons, holidays and hard years. Your parents pay from their own savings, and may give you a car at 17 and a trust fund or gift at 18.',
  ],
  [
    'Other people’s money',
    'Family, partners and close friends have educations, jobs that pay, savings that follow the markets, homes with mortgages and debts. Their profile shows it; when someone dies, their whole estate, home included, is shared among their heirs.',
  ],
  [
    'Cars and homes',
    'The showroom has real models by category, new or used; collectors’ cars gain value after production. Home listings follow what you can afford, from mobile homes to castles, and grand homes come with perks.',
  ],
  [
    'Fame',
    'Fame comes from what you are known for. Once you are famous, Occupation › Cash in on fame has sponsorships, appearances, a memoir and an online channel; a world champion or Olympic champion earns double.',
  ],
  [
    'Cheats',
    'The cheat panel (` key) can change anything: money, stats, skills, gifts, relationships, events, time. Lives that cheat get a badge, which Settings can hide.',
  ],
];

export function HelpOverlay(): React.JSX.Element {
  return (
    <Modal title="Help" testId="help" onClose={() => app.set({ overlay: null })}>
      <h3 className="section-title">How things work</h3>
      <dl className="help-guide" data-testid="help-guide">
        {GUIDE.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd className="muted small">{v}</dd>
          </div>
        ))}
      </dl>
      <h3 className="section-title">Keyboard shortcuts</h3>
      <table className="shortcuts" data-testid="shortcut-table">
        <tbody>
          {SHORTCUTS.map(([k, v]) => (
            <tr key={k}>
              <th scope="row">
                <kbd>{k}</kbd>
              </th>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted small">On Windows and Linux keyboards, ⌘ is Ctrl.</p>
    </Modal>
  );
}
