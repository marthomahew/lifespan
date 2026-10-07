import {
  FOCUS_COST,
  focusForecast,
  momentum,
  focusOptions,
  focusReason,
  type GameState,
} from '../../../../engine';
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
      title={`A focus takes ${FOCUS_COST} ${FOCUS_COST === 1 ? 'pip' : 'pips'} of free time and gives about three practice sessions a year, faster if you're young or gifted, and faster again each year you stick with it.`}
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
            {o.label} ({o.level}, about +{focusForecast(game, o.id)} a year)
          </option>
        ))}
      </select>
      <span className="muted small">
        {cur
          ? `Takes ${FOCUS_COST} ${FOCUS_COST === 1 ? 'pip' : 'pips'} of free time a year${
              (game.player.focusYears ?? 0) > 0
                ? ` · year ${(game.player.focusYears ?? 0) + 1} in a row: +${Math.round((momentum(game) - 1) * 100)}% momentum`
                : ' · sticking with it builds momentum'
            }`
          : 'Devote your spare time to one thing'}
      </span>
    </label>
  );
}
