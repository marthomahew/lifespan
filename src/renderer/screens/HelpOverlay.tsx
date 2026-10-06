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
    'Free time',
    'Each year holds a few activities (fewer with a full-time job or small children, more in retirement). Health care and paperwork are free. It refills on your birthday, and can be switched off in Settings.',
  ],
  [
    'A focus',
    'In Activities, give your spare time to one skill or language. It practises itself every year for two pips of free time, and keeps a mastered skill from fading. Children learn fastest, and so do the gifted.',
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
