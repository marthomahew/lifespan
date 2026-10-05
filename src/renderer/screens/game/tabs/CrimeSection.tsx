import { CRIMES } from '../../../../content/crimes';
import { crimeOdds, crimeReason, type GameState } from '../../../../engine';
import { doAct } from '../../../store/app';
import { cap } from '../../../components/text';

/** The crime menu (SPEC §5.13): abstract descriptions, odds shown. */
export function CrimeSection({
  game,
  onError,
}: {
  game: GameState;
  onError: (e: string | null) => void;
}): React.JSX.Element | null {
  if (game.player.age < 10 || game.legal.prison) return null;
  const rows = CRIMES.filter((c) => game.player.age >= c.minAge);
  return (
    <section className="panel-section" data-testid="crime-section">
      <h3 className="section-title">Crime</h3>
      <ul className="activity-list">
        {rows.map((c) => {
          const why = crimeReason(game, c.id);
          return (
            <li key={c.id}>
              <button
                className="activity"
                data-testid={`crime-${c.id}`}
                disabled={why !== null}
                title={why ?? c.description}
                onClick={() => onError(doAct({ type: 'crime', id: c.id }))}
              >
                <span className="activity-emoji" aria-hidden="true">
                  {c.emoji}
                </span>
                <span className="grow">
                  <span className="activity-label">{c.label}</span>
                  <span className="muted small activity-desc">
                    {why ? cap(why) : c.description}
                  </span>
                </span>
                <span className="muted small">{Math.round(crimeOdds(game, c.id) * 100)}%</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
