import { MAJORS, isChampion, majorReason, type GameState } from '../../../../engine';
import { doAct } from '../../../store/app';

/** The world title cycle, once a player is strong enough to think about it. */
export function ChessMajors({
  game,
  onError,
}: {
  game: GameState;
  onError: (e: string | null) => void;
}): React.JSX.Element | null {
  const rec = game.chess;
  if (!rec || (rec.best < 2450 && !rec.crowns?.length)) return null;
  const crowns = rec.crowns ?? [];
  const recent = [...(rec.majors ?? [])].reverse().slice(0, 4);
  return (
    <div className="col small chess-majors" data-testid="chess-majors">
      <strong>The world stage</strong>
      {crowns.length > 0 && (
        <div data-testid="chess-crown">
          <strong>
            {isChampion(game) ? '👑 World champion' : 'Former world champion'} ({crowns.join(', ')})
          </strong>
          {isChampion(game) && crowns.at(-1) !== game.year && game.year % 2 === 0 && (
            <span className="muted"> · a challenger awaits: defend your title this year</span>
          )}
        </div>
      )}
      {rec.candQual && rec.candQual >= game.year && (
        <div className="muted">Qualified for the {rec.candQual} Candidates.</div>
      )}
      <div className="btn-row">
        {MAJORS.map((m) => {
          const why = majorReason(game, m.id);
          if (m.id === 'title' && why === 'win the Candidates first') return null;
          return (
            <button
              key={m.id}
              data-testid={`chess-major-${m.id}`}
              disabled={why !== null}
              title={why ?? m.pay}
              onClick={() => onError(doAct({ type: 'chess_major', id: m.id }))}
            >
              {m.label}
              {why ? <span className="muted"> ({why})</span> : null}
            </button>
          );
        })}
      </div>
      {recent.length > 0 && (
        <ul className="plain">
          {recent.map((r, i) => (
            <li key={`${r.year}-${r.id}-${i}`} className="muted">
              {r.year}: {MAJORS.find((x) => x.id === r.id)?.label}, {r.result}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
