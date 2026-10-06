import { useState } from 'react';
import { JOB_FIELDS } from '../../../../content/jobs';
import {
  formatMoney,
  formatMoneyShort,
  jobBoard,
  sortBoard,
  type BoardRow,
  type BoardSort,
  type GameState,
} from '../../../../engine';
import { Modal } from '../../../components/Modal';
import { doAct } from '../../../store/app';
import { Perks } from './Perks';

const ODDS = (o: number): string =>
  o >= 0.65 ? 'good odds' : o >= 0.4 ? 'fair odds' : 'a long shot';

/**
 * The job board (SPEC §5.3): what you could apply for now, what is one step away, and the
 * rest, ranked by fit or by pay, with each job's pay ladder and ceiling.
 */
export function JobListings({
  game,
  onClose,
}: {
  game: GameState;
  onClose: () => void;
}): React.JSX.Element {
  const [field, setField] = useState('all');
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [partTime, setPartTime] = useState(game.player.age < 18);
  const [sort, setSort] = useState<BoardSort>('fit');
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);
  const query = q.trim().toLowerCase();
  const rows = sortBoard(
    jobBoard(game).filter(
      (l) =>
        (field === 'all' || l.job.field === field) &&
        Boolean(l.job.partTime) === partTime &&
        (!query ||
          `${l.job.titles.join(' ')} ${l.job.field} ${l.job.description}`
            .toLowerCase()
            .includes(query)),
    ),
    sort,
  );
  const now = rows.filter((r) => r.unmet.length === 0);
  const near = rows.filter((r) => r.unmet.length === 1);
  const far = rows.filter((r) => r.unmet.length > 1);
  const apply = (jobId: string): void => {
    const err = doAct({ type: 'apply_job', jobId });
    setError(err);
    if (!err) onClose();
  };
  const list = (items: BoardRow[]): React.JSX.Element => (
    <ul className="listings">
      {items.map((l) => (
        <JobRow key={l.job.id} game={game} row={l} onApply={apply} />
      ))}
    </ul>
  );
  return (
    <Modal title="Job listings" testId="job-listings" onClose={onClose} wide>
      <div className="row listing-filters">
        <input
          type="search"
          placeholder="Search jobs"
          aria-label="Search jobs"
          data-testid="jobs-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          aria-label="Field"
          data-testid="jobs-field"
          value={field}
          onChange={(e) => setField(e.target.value)}
        >
          <option value="all">All fields</option>
          {JOB_FIELDS.map((f) => (
            <option key={f} value={f}>
              {f.replace('_', ' ')}
            </option>
          ))}
        </select>
        <select
          aria-label="Sort"
          data-testid="jobs-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as BoardSort)}
        >
          <option value="fit">Best fit for you</option>
          <option value="start">Highest starting pay</option>
          <option value="top">Highest ceiling</option>
        </select>
        <label className="row small">
          <input
            type="checkbox"
            data-testid="jobs-eligible"
            checked={eligibleOnly}
            onChange={(e) => setEligibleOnly(e.target.checked)}
          />{' '}
          Only what I can apply for
        </label>
        <label className="row small">
          <input
            type="checkbox"
            data-testid="jobs-part-time"
            checked={partTime}
            onChange={(e) => setPartTime(e.target.checked)}
          />{' '}
          Part-time
        </label>
      </div>
      {error && (
        <p className="error small" role="alert" data-testid="jobs-error">
          {error}
        </p>
      )}
      <div data-testid="listings">
        <h3 className="section-title" data-testid="jobs-now">
          You could apply now ({now.length})
        </h3>
        {now.length ? list(now) : <p className="muted small">Nothing yet: see what is in reach.</p>}
        {!eligibleOnly && near.length > 0 && (
          <>
            <h3 className="section-title" data-testid="jobs-near">
              One step away ({near.length})
            </h3>
            {list(near)}
          </>
        )}
        {!eligibleOnly && far.length > 0 && (
          <details className="jobs-far" data-testid="jobs-far">
            <summary>Further off ({far.length})</summary>
            {list(far)}
          </details>
        )}
      </div>
    </Modal>
  );
}

function JobRow({
  game,
  row: l,
  onApply,
}: {
  game: GameState;
  row: BoardRow;
  onApply: (id: string) => void;
}): React.JSX.Element {
  const applied = game.career.appliedThisYear.includes(l.job.id);
  return (
    <li className="listing" data-testid={`job-${l.job.id}`}>
      <div className="grow">
        <div className="listing-title">
          {l.job.titles[0]} <span className="muted small">· {l.job.field.replace('_', ' ')}</span>
          {l.odds !== null && !l.current && (
            <span
              className={`odds-chip ${l.odds >= 0.65 ? 'good' : l.odds >= 0.4 ? 'fair' : 'long'}`}
            >
              {ODDS(l.odds)}
            </span>
          )}
        </div>
        <div className="muted small">{l.job.description}</div>
        <div className="small" data-testid={`pay-${l.job.id}`}>
          Starts at {formatMoney(game, l.start)} a year
          {l.ladder.length > 1 && (
            <>
              {' '}
              · up to <strong>{formatMoney(game, l.top)}</strong> as {l.topTitle}
            </>
          )}
        </div>
        {l.unmet.length > 0 && <div className="error small">Needs {l.unmet.join(', ')}</div>}
        <Perks jobId={l.job.id} />
        {l.ladder.length > 1 && (
          <details className="pay-ladder">
            <summary className="small" data-testid={`ladder-open-${l.job.id}`}>
              Pay ladder
            </summary>
            <ol className="small" data-testid={`ladder-${l.job.id}`}>
              {l.ladder.map((r) => (
                <li key={r.title}>
                  {r.title}: {formatMoneyShort(game, r.low)}–{formatMoneyShort(game, r.high)}
                </li>
              ))}
            </ol>
          </details>
        )}
      </div>
      <button
        className={l.unmet.length ? '' : 'primary'}
        data-testid={`apply-${l.job.id}`}
        disabled={l.unmet.length > 0 || l.current || applied}
        onClick={() => onApply(l.job.id)}
      >
        {l.current ? 'Current' : applied ? 'Applied' : 'Apply'}
      </button>
    </li>
  );
}
