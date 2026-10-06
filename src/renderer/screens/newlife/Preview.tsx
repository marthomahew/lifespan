import { useMemo } from 'react';
import { COUNTRIES } from '../../../content/countries';
import { SKILL_BY_ID } from '../../../content/skills';
import { TRAIT_BY_ID } from '../../../content/traits';
import { Portrait } from '../../portrait/Portrait';
import { shownLook, type Draft } from './useNewLife';

const WEALTH: Record<string, string> = {
  poor: 'poor',
  working: 'working-class',
  middle: 'middle-class',
  comfortable: 'comfortable',
  rich: 'wealthy',
};

const PARENTS: Record<string, string> = {
  together: 'two parents, together',
  apart: 'two parents who live apart',
  mother: 'a single mother',
  father: 'a single father',
};

/** Who you are about to be, in a card that keeps the Begin button in view. */
export function Preview({
  d,
  onSeed,
  children,
}: {
  d: Draft;
  onSeed: (v: string) => void;
  children: React.ReactNode;
}): React.JSX.Element {
  const c = COUNTRIES.find((x) => x.id === d.country);
  const g = d.gender || 'nonbinary';
  const look = useMemo(() => shownLook(d), [d]);
  const name = [d.first.trim(), d.last.trim()].filter(Boolean).join(' ') || 'A new person';
  const traits = d.traits.map((t) => TRAIT_BY_ID[t]?.label.toLowerCase()).filter(Boolean);
  const talent = d.talent ? SKILL_BY_ID[d.talent] : undefined;
  const sibs =
    d.siblings === ''
      ? 'siblings left to chance'
      : d.siblings === '0'
        ? 'no siblings yet'
        : `${d.siblings} sibling${d.siblings === '1' ? '' : 's'}`;
  return (
    <aside className="card pad nl-preview" data-testid="life-preview" aria-label="Your new life">
      <div className="nl-avatars" aria-label="Through the years">
        {[1, 8, 30, 75].map((age) => (
          <figure key={age}>
            <Portrait
              look={look}
              age={age}
              gender={g}
              size={age === 30 ? 72 : 52}
              testId={`preview-age-${age}`}
            />
            <figcaption className="muted small">{age}</figcaption>
          </figure>
        ))}
      </div>
      <h2 data-testid="preview-name">{name}</h2>
      <p className="nl-summary" data-testid="preview-summary">
        Born {d.birthYear} {d.city ? `in ${d.city},` : 'somewhere in'} {c?.flag} {c?.name}, into a{' '}
        {WEALTH[d.wealth] ?? d.wealth} family, raised by{' '}
        {d.parents ? PARENTS[d.parents] : 'whoever fate decides'}, with {sibs}.
        {traits.length > 0 && ` Grows up ${traits.join(', ')}.`}
        {talent && ` A gift for ${talent.label.toLowerCase()}.`}
      </p>
      <label className="nl-seed">
        Seed <span className="muted small">(optional; the same seed replays the same life)</span>
        <input
          data-testid="f-seed"
          inputMode="numeric"
          value={d.seed}
          onChange={(e) => onSeed(e.target.value)}
          placeholder="Random"
        />
      </label>
      {children}
    </aside>
  );
}
