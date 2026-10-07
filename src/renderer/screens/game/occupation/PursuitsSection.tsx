import {
  CHESS_TIERS,
  TITLE_NAMES,
  formatMoney,
  money,
  playingStrength,
  tournamentReason,
  worldRank,
  type GameState,
} from '../../../../engine';
import { doAct } from '../../../store/app';

/** Pursuits: things you can get good at that keep their own record (chess first). */
export function PursuitsSection({
  game,
  onError,
}: {
  game: GameState;
  onError: (e: string | null) => void;
}): React.JSX.Element | null {
  const skill = game.player.skills['chess'] ?? 0;
  const rec = game.chess ?? null;
  if (!rec && skill < 5) return null;
  return (
    <section className="panel-section" data-testid="pursuit-chess">
      <h3 className="section-title">♟️ Chess</h3>
      {rec ? (
        <div className="col small">
          <div data-testid="chess-rating">
            <strong>
              {rec.title ? `${TITLE_NAMES[rec.title]} · ` : ''}Rating {rec.rating}
            </strong>{' '}
            <span className="muted">
              (best {rec.best}, {worldRank(rec.rating)})
            </span>
          </div>
          <div className="muted">
            {rec.events} tournaments, {rec.wins} won
            {rec.imNorms + rec.gmNorms > 0 &&
              ` · norms: ${rec.gmNorms} grandmaster, ${rec.imNorms} international master`}
            {' · '}playing strength about {playingStrength(game)}
          </div>
          {rec.recent.length > 0 && (
            <ul className="plain" data-testid="chess-recent">
              {[...rec.recent].reverse().map((r, i) => (
                <li key={`${r.year}-${i}`} className="muted">
                  {r.year}: {CHESS_TIERS.find((t) => t.id === r.tier)?.label}, {r.score}/9,{' '}
                  {r.place} ({r.change >= 0 ? '+' : ''}
                  {r.change})
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="muted small">
          Unrated. Your first tournament gives you a rating; your skill sets how well you play.
        </p>
      )}
      <div className="btn-row">
        {CHESS_TIERS.map((t) => {
          const why = tournamentReason(game, t.id);
          if (why?.startsWith('needs a rating') && (rec?.rating ?? 0) < t.minRating - 400)
            return null;
          return (
            <button
              key={t.id}
              data-testid={`chess-${t.id}`}
              disabled={why !== null}
              title={
                why ??
                `Field around ${t.field}. The winner takes ${formatMoney(game, money(game, t.prize, 'wage'))}.`
              }
              onClick={() => onError(doAct({ type: 'chess', tier: t.id }))}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <p className="muted small">
        Titles: Candidate Master at 2200, FIDE Master at 2300, International Master at 2400 with
        three norms, Grandmaster at 2500 with three grandmaster norms (a 2600 performance in a
        strong field).
      </p>
    </section>
  );
}
