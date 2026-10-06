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

export function HelpOverlay(): React.JSX.Element {
  return (
    <Modal title="Keyboard shortcuts" testId="help" onClose={() => app.set({ overlay: null })}>
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
