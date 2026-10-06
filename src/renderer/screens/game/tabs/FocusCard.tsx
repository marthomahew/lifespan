import { FOCUS_COST, focusOptions, focusReason, type GameState } from '../../../../engine';
import { doAct } from '../../../store/app';

/** What your free time goes to, year after year: a skill or a language, or nothing in particular. */
export function FocusCard({
  game,
  onError,
}: {
  game: GameState;
  onError: (e: string | null) => void;
}): React.JSX.Element | null {
  if (focusReason(game) || game.legal.prison) return null;
  const options = focusOptions(game);
  const cur = game.player.focus ?? '';
  return (
    <label
      className="focus-card"
      data-testid="focus-card"
      title={`A focus takes ${FOCUS_COST} pips of free time and gives about three practice sessions a year, faster if you're young or gifted.`}
    >
      <span className="free-time-label">🎯 Focus</span>
      <select
        data-testid="focus-select"
        aria-label="Focus"
        value={cur}
        onChange={(e) => onError(doAct({ type: 'focus', target: e.target.value || null }))}
      >
        <option value="">Nothing in particular</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label} ({o.level})
          </option>
        ))}
      </select>
      <span className="muted small">
        {cur
          ? `Takes ${FOCUS_COST} pips of free time a year`
          : 'Devote your spare time to one thing'}
      </span>
    </label>
  );
}
