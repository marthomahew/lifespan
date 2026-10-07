import { JOB_BY_ID } from '../../../../content/jobs';
import { PRO_LEAGUES } from '../../../../content/sport-pro';
import { formatMoney, titleFor, type GameState } from '../../../../engine';

const ord = (k: number): string =>
  `${k}${k % 10 === 1 && k % 100 !== 11 ? 'st' : k % 10 === 2 && k % 100 !== 12 ? 'nd' : k % 10 === 3 && k % 100 !== 13 ? 'rd' : 'th'}`;

/** A professional's view of their sport: team, position, contract, last season, honours. */
export function ProSportPanel({ game }: { game: GameState }): React.JSX.Element | null {
  const p = game.proSport;
  const r = game.sport;
  const job = JOB_BY_ID['professional_athlete'];
  if (!p || !r || !job || game.career.jobId !== 'professional_athlete') return null;
  const lg = PRO_LEAGUES[r.sport];
  const pos = lg?.positions.find((x) => x.id === r.position) ?? lg?.positions[0];
  const title = titleFor(game, job, game.career.level);
  return (
    <div className="col small" data-testid="pro-sport">
      <div>
        <strong>
          {pos && (lg?.positions.length ?? 0) > 1 ? `${pos.label} · ` : ''}
          {title}
        </strong>
        {lg?.nicknames.length ? <span className="muted"> · {p.team}</span> : null}
        <span className="muted"> · form {r.form}</span>
      </div>
      <div className="muted">
        Contract: {formatMoney(game, game.career.salary)} a year, {p.contractYears}{' '}
        {p.contractYears === 1 ? 'year' : 'years'} left · {p.seasons}{' '}
        {p.seasons === 1 ? 'season' : 'seasons'} as a pro
        {p.pick !== undefined && lg?.rookie
          ? p.pick === 0
            ? ' · undrafted'
            : ` · drafted ${ord(p.pick)} overall`
          : ''}
      </div>
      {p.last && <div>Last season: {p.last}.</div>}
      {p.honours.length > 0 && (
        <div className="muted" data-testid="pro-honours">
          Honours: {p.honours.join(', ')}
        </div>
      )}
      <div className="muted">
        Your form on the day decides your standing, honours and your next contract. Extra training
        uses work time and lifts the coming season.
      </div>
    </div>
  );
}
