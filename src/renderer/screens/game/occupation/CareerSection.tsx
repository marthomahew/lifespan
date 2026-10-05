import { useState } from 'react';
import { JOB_BY_ID } from '../../../../content/jobs';
import { formatMoney, type GameState } from '../../../../engine';
import { barColour } from '../../../components/StatBar';
import { doAct } from '../../../store/app';
import { JobListings } from './JobListings';
import { Perks } from './Perks';

export function CareerSection({
  game,
  onError,
}: {
  game: GameState;
  onError: (e: string | null) => void;
}): React.JSX.Element | null {
  const [listings, setListings] = useState(false);
  const c = game.career;
  const age = game.player.age;
  if (age < 14) return null;
  const job = c.jobId ? JOB_BY_ID[c.jobId] : undefined;
  const pt = c.partTimeId ? JOB_BY_ID[c.partTimeId] : undefined;
  const act = (id: string): void => onError(doAct({ type: 'career', id }));
  return (
    <section className="panel-section" data-testid="career-section">
      <h3 className="section-title">Work</h3>
      {job && (
        <div className="job-card card pad" data-testid="current-job">
          <div className="listing-title" data-testid="job-title">
            {job.titles[c.level] ?? job.titles[0]}
          </div>
          <div className="muted small">
            {formatMoney(game, c.salary)} a year · since {c.history.at(-1)?.from ?? game.year}
            {game.education.residency > 0 && job.id === 'doctor'
              ? ` · residency, ${game.education.residency} years left`
              : ''}
          </div>
          <Perks jobId={job.id} testId="job-perks" />
          <div className="row perf">
            <span className="small muted">Performance</span>
            <span
              className="mini-bar wide"
              aria-label={`Performance ${c.performance}`}
              data-testid="job-performance"
            >
              <span
                className={`bar-fill ${barColour(c.performance)}`}
                style={{ width: `${c.performance}%` }}
              />
            </span>
          </div>
          <div className="btn-row">
            <button data-testid="btn-work-harder" onClick={() => act('work_harder')}>
              Work harder
            </button>
            <button data-testid="btn-ask-raise" onClick={() => act('ask_raise')}>
              Ask for a raise
            </button>
            <button data-testid="btn-ask-promotion" onClick={() => act('ask_promotion')}>
              Ask for a promotion
            </button>
            <button className="danger" data-testid="btn-quit" onClick={() => act('quit')}>
              Quit
            </button>
            {age >= 50 && (
              <button data-testid="btn-retire" onClick={() => act('retire')}>
                Retire
              </button>
            )}
          </div>
        </div>
      )}
      {pt && (
        <div className="row" data-testid="part-time-job">
          <span className="grow">Part-time: {pt.titles[0]}</span>
          <button onClick={() => act('quit_part_time')}>Quit</button>
        </div>
      )}
      {c.retired && (
        <p data-testid="retired">Retired · pension {formatMoney(game, c.pension)} a year</p>
      )}
      <div className="btn-row">
        <button
          data-testid="btn-job-listings"
          onClick={() => setListings(true)}
          disabled={!!game.legal.prison}
        >
          Job listings
        </button>
        {age >= 16 && (
          <button
            data-testid="btn-freelance"
            onClick={() => act('freelance')}
            disabled={c.freelanceYear === game.year}
          >
            Freelance gig
          </button>
        )}
      </div>
      {c.history.length > 0 && (
        <details className="history">
          <summary className="small muted">Career history</summary>
          <ul className="plain small">
            {c.history.map((h, i) => (
              <li key={i}>
                {h.title}, {h.from}–{h.to ?? 'now'}
                {h.reason ? ` (${h.reason})` : ''}
              </li>
            ))}
          </ul>
        </details>
      )}
      {listings && <JobListings game={game} onClose={() => setListings(false)} />}
    </section>
  );
}
