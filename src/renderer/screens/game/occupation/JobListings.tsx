import { useState } from 'react';
import { JOB_FIELDS } from '../../../../content/jobs';
import { formatMoney, jobListings, type GameState } from '../../../../engine';
import { Modal } from '../../../components/Modal';
import { doAct } from '../../../store/app';

/** Job listings with filters: field, and requirements met (SPEC §5.3). */
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
  const [error, setError] = useState<string | null>(null);
  const rows = jobListings(game).filter(
    (l) =>
      (field === 'all' || l.job.field === field) &&
      (!eligibleOnly || l.unmet.length === 0) &&
      Boolean(l.job.partTime) === partTime,
  );
  const apply = (jobId: string): void => {
    const err = doAct({ type: 'apply_job', jobId });
    setError(err);
    if (!err) onClose();
  };
  return (
    <Modal title="Job listings" testId="job-listings" onClose={onClose} wide>
      <div className="row listing-filters">
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
        <label className="row small">
          <input
            type="checkbox"
            data-testid="jobs-eligible"
            checked={eligibleOnly}
            onChange={(e) => setEligibleOnly(e.target.checked)}
          />{' '}
          Requirements met
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
        <span className="muted small grow">{rows.length} listings</span>
      </div>
      {error && (
        <p className="error small" role="alert" data-testid="jobs-error">
          {error}
        </p>
      )}
      <ul className="listings" data-testid="listings">
        {rows.map((l) => (
          <li key={l.job.id} className="listing" data-testid={`job-${l.job.id}`}>
            <div className="grow">
              <div className="listing-title">
                {l.job.titles[0]}{' '}
                <span className="muted small">· {l.job.field.replace('_', ' ')}</span>
              </div>
              <div className="muted small">{l.job.description}</div>
              {l.job.perks.length > 0 && (
                <div className="small perks">Perks: {l.job.perks.join(', ')}</div>
              )}
              <div className="small">
                {formatMoney(game, l.salary)} a year
                {l.unmet.length > 0 && <span className="error"> · needs {l.unmet.join(', ')}</span>}
              </div>
            </div>
            <button
              className={l.unmet.length ? '' : 'primary'}
              data-testid={`apply-${l.job.id}`}
              disabled={
                l.unmet.length > 0 || l.current || game.career.appliedThisYear.includes(l.job.id)
              }
              onClick={() => apply(l.job.id)}
            >
              {l.current
                ? 'Current'
                : game.career.appliedThisYear.includes(l.job.id)
                  ? 'Applied'
                  : 'Apply'}
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
