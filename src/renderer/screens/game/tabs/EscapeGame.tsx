import { useEffect, useMemo, useState } from 'react';
import type { GameState } from '../../../../engine';
import { escapeMap, simulate, type Dir } from '../../../../engine/systems/escape';

const KEYS: Record<string, Dir> = {
  ArrowUp: 'U',
  ArrowDown: 'D',
  ArrowLeft: 'L',
  ArrowRight: 'R',
  w: 'U',
  s: 'D',
  a: 'L',
  d: 'R',
  ' ': 'W',
};

/** The escape plan, played out: reach the gap in the fence before dawn, out of every guard's sight. */
export function EscapeGame({
  game,
  onRun,
}: {
  game: GameState;
  onRun: (params: Record<string, string>) => void;
}): React.JSX.Element {
  const map = useMemo(() => escapeMap(game), [game]);
  const [moves, setMoves] = useState<Dir[]>([]);
  const st = simulate(map, moves);
  const over = st.status !== 'running';
  const move = (d: Dir): void => {
    if (!over) setMoves((m) => [...m, d]);
  };
  useEffect(() => {
    const h = (e: KeyboardEvent): void => {
      const d = KEYS[e.key];
      if (!d) return;
      e.preventDefault();
      e.stopPropagation();
      move(d);
    };
    window.addEventListener('keydown', h, { capture: true });
    return () => window.removeEventListener('keydown', h, { capture: true });
  });
  const at = (x: number, y: number): string => {
    if (st.pos[0] === x && st.pos[1] === y) return over && st.status !== 'escaped' ? '🚨' : '🧍';
    if (st.guards.some((g) => g.at[0] === x && g.at[1] === y)) return '👮';
    if (map.exit[0] === x && map.exit[1] === y) return '🕳️';
    if (map.walls.some((w) => w[0] === x && w[1] === y)) return '📦';
    return '';
  };
  const lit = (x: number, y: number): boolean => st.seen.some((c) => c[0] === x && c[1] === y);
  return (
    <div className="escape" data-testid="escape-game" data-status={st.status}>
      <p className="muted small">
        Reach the gap in the fence (🕳️) before dawn. Guards see the lit squares; boxes block their
        view. Arrow keys or WASD to move, Space to wait.
      </p>
      <div
        className="escape-grid"
        style={{ gridTemplateColumns: `repeat(${map.w}, 1fr)` }}
        role="grid"
        aria-label="The prison yard"
      >
        {Array.from({ length: map.h }, (_, y) =>
          Array.from({ length: map.w }, (_, x) => (
            <span
              key={`${x},${y}`}
              role="gridcell"
              className={`escape-cell${lit(x, y) ? ' lit' : ''}`}
              data-testid={st.pos[0] === x && st.pos[1] === y ? 'escape-you' : undefined}
              data-x={x}
              data-y={y}
            >
              {at(x, y)}
            </span>
          )),
        )}
      </div>
      <div className="escape-bar">
        <span className="small" data-testid="escape-turn">
          {st.status === 'escaped'
            ? 'Through the fence!'
            : st.status === 'caught'
              ? 'A torch in your face. Caught.'
              : st.status === 'dawn'
                ? 'The sky goes grey. Dawn.'
                : `Turn ${st.turn} of ${map.maxTurns}`}
        </span>
        {!over && (
          <span className="escape-pad">
            {(['L', 'U', 'D', 'R', 'W'] as Dir[]).map((d) => (
              <button
                key={d}
                type="button"
                data-testid={`escape-${d}`}
                onClick={() => move(d)}
                aria-label={NAMES[d]}
              >
                {ICONS[d]}
              </button>
            ))}
          </span>
        )}
      </div>
      <div className="row">
        {over ? (
          <button
            className="primary"
            data-testid="escape-done"
            onClick={() => onRun({ moves: moves.join('') })}
          >
            {st.status === 'escaped'
              ? 'Run'
              : st.status === 'caught'
                ? 'Face the music'
                : 'Slip back to your cell'}
          </button>
        ) : (
          <>
            <button
              className="quiet-danger"
              data-testid="escape-quit"
              onClick={() => onRun({ moves: '' })}
            >
              Lose your nerve and go back to bed
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const ICONS: Record<Dir, string> = { L: '←', U: '↑', D: '↓', R: '→', W: '⏸' };
const NAMES: Record<Dir, string> = { L: 'Left', U: 'Up', D: 'Down', R: 'Right', W: 'Wait' };
