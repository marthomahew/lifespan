import { formatMoney, treatmentsFor, VICE_LABEL, VICES, type GameState } from '../../../../engine';
import { doAct } from '../../../store/app';

/** Current illnesses with every treatment's cost and odds, plus addiction meters worth knowing about. */
export function HealthSection({
  game,
  onError,
}: {
  game: GameState;
  onError: (e: string | null) => void;
}): React.JSX.Element | null {
  const ills = treatmentsFor(game);
  const vices = VICES.filter((v) => game.vices.levels[v] >= 20);
  if (!ills.length && !vices.length) return null;
  return (
    <section className="panel-section" data-testid="health-section">
      <h3 className="section-title">Health</h3>
      <ul className="plain">
        {ills.map((i) => (
          <li key={i.illness} className="asset-row" data-testid={`illness-${i.illness}`}>
            <span className="grow">
              {i.emoji} {i.label}
              <span className="muted small">
                {' '}
                · severity {i.severity}
                {i.chronic ? ' · chronic' : ''}
              </span>
            </span>
            {i.options.map((o) => (
              <button
                key={o.method}
                data-testid={`treat-${i.illness}-${o.method}`}
                title={`${Math.round(o.odds * 100)}% chance`}
                onClick={() =>
                  onError(doAct({ type: 'treat', illness: i.illness, method: o.method }))
                }
              >
                {o.method} · {formatMoney(game, o.cost)}
              </button>
            ))}
          </li>
        ))}
      </ul>
      {vices.length > 0 && (
        <ul className="plain small" data-testid="addictions">
          {vices.map((v) => (
            <li key={v}>
              {VICE_LABEL[v]}: addiction {game.vices.levels[v]}/100
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
