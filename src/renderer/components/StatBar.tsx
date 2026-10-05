import { Sparkline } from './Sparkline';

type Props = {
  id: string;
  label: string;
  emoji: string;
  value: number;
  history?: number[];
  /** Change since the last birthday, shown beside the value. */
  delta?: number;
};

export function barColour(v: number): 'red' | 'amber' | 'green' {
  return v < 30 ? 'red' : v < 60 ? 'amber' : 'green';
}

/** A stat bar: red below 30, amber 30–59, green from 60 (SPEC §7). */
export function StatBar({ id, label, emoji, value, history, delta }: Props): React.JSX.Element {
  const colour = barColour(value);
  return (
    <div className="stat" data-testid={`stat-${id}`}>
      <div className="stat-head">
        <span aria-hidden="true">{emoji}</span>
        <span className="stat-label">{label}</span>
        {history && (
          <Sparkline values={history} label={`${label} over the last ${history.length} years`} />
        )}
        {delta ? (
          <span
            className={`stat-delta ${delta > 0 ? 'up' : 'down'}`}
            data-testid={`stat-${id}-delta`}
            title="Since your last birthday"
          >
            {delta > 0 ? `+${delta}` : `−${-delta}`}
          </span>
        ) : null}
        <span className="stat-value" data-testid={`stat-${id}-value`}>
          {value}
        </span>
      </div>
      <div
        className="bar"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <div className={`bar-fill ${colour}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
