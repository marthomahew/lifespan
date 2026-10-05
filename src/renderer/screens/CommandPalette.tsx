import { useMemo, useState } from 'react';
import type { GameState } from '../../engine';
import { commandsFor, searchCommands } from '../app/commands';
import { Modal } from '../components/Modal';
import { app, showError } from '../store/app';

/** ⌘K: find any available action (SPEC §6). */
export function CommandPalette({ game }: { game: GameState }): React.JSX.Element {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const all = useMemo(() => commandsFor(game), [game]);
  const results = searchCommands(all, q);
  const run = (i: number): void => {
    const c = results[i];
    if (!c) return;
    const err = c.run();
    if (err) showError(err);
  };
  return (
    <Modal
      title="Command palette"
      testId="palette"
      onClose={() => app.set({ overlay: null })}
      hideTitle
      hideClose
    >
      <input
        className="palette-input"
        data-testid="palette-input"
        aria-label="Search actions"
        placeholder="Search actions: gym, propose, finances…"
        value={q}
        autoFocus
        onChange={(e) => {
          setQ(e.target.value);
          setSel(0);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSel((x) => Math.min(x + 1, results.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSel((x) => Math.max(0, x - 1));
          } else if (e.key === 'Enter') {
            e.preventDefault();
            run(sel);
          }
        }}
      />
      <ul
        className="palette-list"
        role="listbox"
        aria-label="Actions"
        data-testid="palette-results"
      >
        {results.map((c, i) => (
          <li key={c.id} role="option" aria-selected={i === sel}>
            <button
              className={`palette-item${i === sel ? ' sel' : ''}`}
              data-testid="palette-item"
              tabIndex={-1}
              onMouseEnter={() => setSel(i)}
              onClick={() => run(i)}
            >
              <span className="grow">{c.label}</span>
              <span className="muted small">{c.hint ?? c.group}</span>
            </button>
          </li>
        ))}
        {!results.length && <li className="muted small">Nothing matches.</li>}
      </ul>
    </Modal>
  );
}
