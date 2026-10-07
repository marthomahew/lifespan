import { useState } from 'react';
import { SPORTS, SPORT_BY_ID } from '../../../../content/sports';
import {
  CHESS_TIERS,
  TITLE_NAMES,
  SPORT_COST,
  formatMoney,
  levelLabel,
  money,
  takeUpReason,
  playingStrength,
  tournamentReason,
  worldRank,
  type GameState,
} from '../../../../engine';
import { doAct } from '../../../store/app';

/** Pursuits: things you can get good at that keep their own record. */
export function PursuitsSection({
  game,
  onError,
}: {
  game: GameState;
  onError: (e: string | null) => void;
}): React.JSX.Element | null {
  if (game.player.age < 6 || game.legal.prison) return null;
  return (
    <>
      <SportPanel game={game} onError={onError} />
      <ChessPanel game={game} onError={onError} />
    </>
  );
}

function SportPanel({
  game,
  onError,
}: {
  game: GameState;
  onError: (e: string | null) => void;
}): React.JSX.Element | null {
  const [pick, setPick] = useState(SPORTS[0]?.id ?? 'football');
  const r = game.sport ?? null;
  const def = r ? SPORT_BY_ID[r.sport] : undefined;
  if (game.player.age > 45 && !r?.active) return null;
  return (
    <section className="panel-section" data-testid="pursuit-sport">
      <h3 className="section-title">
        {def && r?.active ? `${def.emoji} ${def.label}` : '🏅 Sport'}
      </h3>
      {r && def && r.active ? (
        <div className="col small">
          <div data-testid="sport-level">
            <strong>Playing for {levelLabel(r)}</strong>{' '}
            <span className="muted">
              · form {r.form} · {r.seasons} {r.seasons === 1 ? 'season' : 'seasons'}
              {r.best > r.level ? ` · reached ${def.levels[r.best]}` : ''}
            </span>
          </div>
          <div className="muted">
            Next: {def.levels[r.level + 1] ?? 'the top: stay there'}. A strong season gets you
            picked; a poor one can drop you. Training takes {SPORT_COST} pip of free time a year.
          </div>
          {r.honours.length > 0 && <div className="muted">Honours: {r.honours.join(', ')}</div>}
          <div className="btn-row">
            <button
              className="quiet-danger"
              data-testid="sport-stop"
              onClick={() => onError(doAct({ type: 'sport', sport: null }))}
            >
              Hang up your boots
            </button>
          </div>
        </div>
      ) : (
        <div className="row small">
          <select
            aria-label="Sport"
            data-testid="sport-pick"
            value={pick}
            onChange={(e) => setPick(e.target.value)}
          >
            {SPORTS.map((x) => (
              <option key={x.id} value={x.id}>
                {x.emoji} {x.label}
              </option>
            ))}
          </select>
          <button
            data-testid="sport-start"
            disabled={takeUpReason(game, pick) !== null}
            title={takeUpReason(game, pick) ?? `Start at ${SPORT_BY_ID[pick]?.levels[0]}`}
            onClick={() => onError(doAct({ type: 'sport', sport: pick }))}
          >
            Take it up
          </button>
          {r && !r.active && def && (
            <span className="muted">You used to play {def.label.toLowerCase()}.</span>
          )}
        </div>
      )}
    </section>
  );
}

function ChessPanel({
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
