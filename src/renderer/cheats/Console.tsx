import { useMemo, useRef, useState } from 'react';
import { suggest, type GameState } from '../../engine';
import { doConsole } from '../store/app';

type Line = { text: string; kind: 'in' | 'out' | 'err' };

/** The cheat console: autocomplete, ↑/↓ history, and help. */
export function Console({ game }: { game: GameState }): React.JSX.Element {
  const [value, setValue] = useState('');
  const [lines, setLines] = useState<Line[]>([
    { text: 'Type help for a list of commands.', kind: 'out' },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const [sel, setSel] = useState(0);
  const outRef = useRef<HTMLDivElement>(null);
  const suggestions = useMemo(() => (value.trim() ? suggest(game, value) : []), [game, value]);

  const scroll = (): void => {
    requestAnimationFrame(() => {
      if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight;
    });
  };
  const run = (): void => {
    const line = value.trim();
    if (!line) return;
    const r = doConsole(line);
    setLines((l) =>
      [
        ...l,
        { text: `> ${line}`, kind: 'in' as const },
        { text: r.message, kind: r.ok ? ('out' as const) : ('err' as const) },
      ].slice(-200),
    );
    setHistory((h) => [...h.filter((x) => x !== line), line].slice(-100));
    setHIdx(-1);
    setValue('');
    setSel(0);
    scroll();
  };
  const onKey = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      run();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const s = suggestions[sel] ?? suggestions[0];
      if (s) setValue(s.includes('{') ? s.slice(0, s.indexOf('{')) : `${s} `);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      const i = hIdx < 0 ? history.length - 1 : Math.max(0, hIdx - 1);
      setHIdx(i);
      setValue(history[i] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (hIdx < 0) {
        setSel((x) => Math.min(x + 1, Math.max(0, suggestions.length - 1)));
        return;
      }
      const i = hIdx + 1;
      if (i >= history.length) {
        setHIdx(-1);
        setValue('');
      } else {
        setHIdx(i);
        setValue(history[i] ?? '');
      }
    } else if (e.key === 'Escape') {
      e.currentTarget.blur();
    }
  };
  return (
    <div className="console" data-testid="cheat-console">
      <div className="console-out" ref={outRef} data-testid="console-output" aria-live="polite">
        {lines.map((l, i) => (
          <pre key={i} className={`console-line ${l.kind}`}>
            {l.text}
          </pre>
        ))}
      </div>
      {suggestions.length > 0 && (
        <ul
          className="console-suggest"
          data-testid="console-suggestions"
          role="listbox"
          aria-label="Suggestions"
        >
          {suggestions.map((s, i) => (
            <li key={s} role="option" aria-selected={i === sel} className={i === sel ? 'sel' : ''}>
              <button
                className="ghost"
                tabIndex={-1}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setValue(s.includes('{') ? s.slice(0, s.indexOf('{')) : `${s} `);
                }}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        className="console-in"
        data-testid="console-input"
        aria-label="Cheat console"
        spellCheck={false}
        autoComplete="off"
        placeholder="money add 1000000"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSel(0);
          setHIdx(-1);
        }}
        onKeyDown={onKey}
      />
    </div>
  );
}
