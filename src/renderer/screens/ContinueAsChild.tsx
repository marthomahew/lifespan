import { formatMoney, heirOptions, type GameState } from '../../engine';
import { continueAs } from '../store/app';

/** Choose an heir and carry on (SPEC §5.15). */
export function ContinueAsChild({ game }: { game: GameState }): React.JSX.Element | null {
  const heirs = heirOptions(game);
  if (!heirs.length) return null;
  return (
    <section className="heirs" data-testid="heirs">
      <h3 className="section-title">Continue as a child</h3>
      <ul className="plain">
        {heirs.map((h) => (
          <li key={h.id} className="asset-row">
            <span className="grow">
              {h.name}, {h.age}
              <span className="muted small">
                {' '}
                · relationship {h.rel} · inherits {formatMoney(game, h.money)}
              </span>
            </span>
            <button
              className="primary"
              data-testid={`heir-${h.id}`}
              onClick={() => continueAs(h.id)}
            >
              Continue as {h.name.split(' ')[0]}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
