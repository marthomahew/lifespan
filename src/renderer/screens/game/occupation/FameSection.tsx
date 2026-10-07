import {
  FAME_DEALS,
  fameDealPay,
  fameDealReason,
  formatMoney,
  knownForLine,
  type GameState,
} from '../../../../engine';
import { fameLanes, laneBonus, LANE_NOTE } from '../../../../engine/systems/fame-deals';
import { doAct } from '../../../store/app';

/** Cash in on fame: deals open to anyone known for something. */
export function FameSection({
  game,
  onError,
}: {
  game: GameState;
  onError: (e: string | null) => void;
}): React.JSX.Element | null {
  if (game.player.age < 16 || game.player.stats.fame < 30) return null;
  const line = knownForLine(game);
  if (!line) return null;
  return (
    <section className="panel-section" data-testid="fame-deals">
      <h3 className="section-title">🌟 Cash in on fame</h3>
      <p className="muted small">
        {line} Fame {game.player.stats.fame}: sponsors, publishers and promoters pay for your name,
        a little at first and enormously at the very top. Deals take no pips.
        {fameLanes(game).length > 0 &&
          ` ${fameLanes(game)
            .map((l) => LANE_NOTE[l])
            .join(' ')}`}
      </p>
      <ul className="plain col">
        {FAME_DEALS.map((d) => {
          const why = fameDealReason(game, d.id);
          if (why?.startsWith('from ')) return null;
          return (
            <li key={d.id} className="row small">
              <button
                data-testid={`fame-${d.id}`}
                disabled={why !== null}
                title={why ?? d.blurb}
                onClick={() => onError(doAct({ type: 'fame_deal', id: d.id }))}
              >
                {d.emoji} {d.label}
              </button>
              <span className="muted">
                {why ??
                  `about ${formatMoney(game, fameDealPay(game, d.id))}${laneBonus(game, d.id) > 1 ? ' (your kind of fame pays extra)' : ''}`}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
