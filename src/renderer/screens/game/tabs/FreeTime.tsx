import { freeTime, type GameState } from '../../../../engine';

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
