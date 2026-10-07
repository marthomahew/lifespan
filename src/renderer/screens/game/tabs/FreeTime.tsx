import { freeTime, workTime, type GameState } from '../../../../engine';

/** This year's free time: a row of pips and what is eating it. */
export function FreeTime({ game }: { game: GameState }): React.JSX.Element {
  const f = freeTime(game);
  return (
    <div
      className="free-time"
      data-testid="free-time"
      data-left={f.left}
      title="Activities that fit in a year. Health care and paperwork are free. It refills on your birthday."
    >
      <span className="free-time-label">Free time</span>
      <span className="pips" aria-hidden="true">
        {Array.from({ length: f.total }, (_, i) => (
          <span key={i} className={i < f.left ? 'pip on' : 'pip'} />
        ))}
      </span>
      <span className="muted small">
        {f.left} of {f.total} left{f.why.length > 0 && ` · ${f.why.join(', ')}`}
      </span>
    </div>
  );
}

/** This year's work time: career moves (tournaments, gigs, extra study) have their own pips. */
export function WorkTime({ game }: { game: GameState }): React.JSX.Element {
  const w = workTime(game);
  return (
    <div
      className="free-time"
      data-testid="work-time"
      data-left={w.left}
      title="Career moves that fit in a year, separate from your free time. It refills on your birthday."
    >
      <span className="free-time-label">Work time</span>
      <span className="pips" aria-hidden="true">
        {Array.from({ length: w.total }, (_, i) => (
          <span key={i} className={i < w.left ? 'pip on work' : 'pip'} />
        ))}
      </span>
      <span className="muted small">
        {w.left} of {w.total} left · tournaments, gigs and extra study
      </span>
    </div>
  );
}
