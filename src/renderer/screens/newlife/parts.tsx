import { DICE, type Draft } from './useNewLife';

export type SetDraft = (patch: Partial<Draft> | ((d: Draft) => Draft)) => void;

/** One step of the form: a numbered heading with an icon, a hint, and its own dice. */
export function Section({
  n,
  icon,
  title,
  hint,
  dice,
  set,
  children,
}: {
  n: number;
  icon: string;
  title: string;
  hint: string;
  dice: keyof typeof DICE;
  set: SetDraft;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <section className="cl-section" aria-label={title} id={`cl-${dice}`}>
      <header className="cl-section-head">
        <span className="cl-step" aria-hidden="true">
          {n}
        </span>
        <span className="cl-icon" aria-hidden="true">
          {icon}
        </span>
        <div className="cl-heading">
          <h2>{title}</h2>
          <p>{hint}</p>
        </div>
        <button
          type="button"
          className="cl-dice"
          data-testid={`dice-${dice}`}
          title={`Roll ${title.toLowerCase()}`}
          aria-label={`Roll ${title.toLowerCase()}`}
          onClick={() => set(DICE[dice])}
        >
          🎲
        </button>
      </header>
      {children}
    </section>
  );
}

/** A short choice as a row of buttons ('' is "surprise me"). */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  testId,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  testId: string;
}): React.JSX.Element {
  return (
    <div className="cl-field">
      <span className="cl-label" id={`${testId}-label`}>
        {label}
      </span>
      <div className="cl-seg" role="radiogroup" aria-labelledby={`${testId}-label`}>
        {options.map((o) => (
          <button
            type="button"
            key={o.value || 'any'}
            role="radio"
            aria-checked={value === o.value}
            className={value === o.value ? 'on' : ''}
            data-testid={`${testId}-${o.value || 'any'}`}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
