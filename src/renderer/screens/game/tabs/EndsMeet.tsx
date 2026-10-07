import { HUSTLES, hustleReason, strapped, type GameState } from '../../../../engine';
import { doAct } from '../../../store/app';

/** When money is tight: the things people actually do. */
export function EndsMeet({
  game,
  onError,
}: {
  game: GameState;
  onError: (e: string | null) => void;
}): React.JSX.Element | null {
  if (game.player.age < 18 || game.legal.prison || !strapped(game)) return null;
  return (
    <section className="panel-section" data-testid="ends-meet">
      <h3 className="section-title">Making ends meet</h3>
      <ul className="plain col small">
        {HUSTLES.map((h) => {
          const why = hustleReason(game, h.id);
          return (
            <li key={h.id} className="row">
              <button
                data-testid={`hustle-${h.id}`}
                disabled={why !== null}
                title={why ?? h.blurb}
                onClick={() => onError(doAct({ type: 'hustle', id: h.id }))}
              >
                {h.emoji} {h.label}
              </button>
              <span className="muted">{why ?? h.blurb}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
