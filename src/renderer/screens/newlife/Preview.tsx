import { BACKGROUND_BY_ID } from '../../../content/backgrounds';
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
  const facts = [
    `${c?.flag ?? ''} ${d.city || c?.name || ''}`.trim(),
    `Born ${d.birthYear}`,
    `${Cap(WEALTH[d.wealth] ?? d.wealth)} family`,
    ...(talent ? [`${talent.emoji} ${d.prodigy ? 'Prodigy' : 'Talent'}`] : []),
  ];
  return (
    <aside className="cl-hero" data-testid="life-preview" aria-label="Your new life">
      <div className="cl-hero-band" aria-hidden="true" />
      <div className="cl-hero-face">
        <Portrait
          look={look}
          age={30}
          gender={g}
          size={150}
          label="Your look as an adult"
          testId="look-portrait"
        />
      </div>
      <h2 className="cl-name" data-testid="preview-name">
        {name}
      </h2>
      <div className="cl-facts">
        {facts.map((f) => (
          <span key={f} className="cl-fact">
            {f}
          </span>
        ))}
      </div>
      <p className="cl-summary" data-testid="preview-summary">
        Born {d.birthYear} {d.city ? `in ${d.city},` : 'somewhere in'} {c?.flag} {c?.name}, into a{' '}
        {WEALTH[d.wealth] ?? d.wealth} family, raised by{' '}
        {d.parents ? PARENTS[d.parents] : 'whoever fate decides'}, with {sibs}.
        {traits.length > 0 && ` Grows up ${traits.join(', ')}.`}
        {talent &&
          (d.prodigy
            ? ` A prodigy at ${talent.label.toLowerCase()}.`
            : ` A gift for ${talent.label.toLowerCase()}.`)}
        {d.gifts.includes('quick_study') && ' A quick study.'}
        {BACKGROUND_BY_ID[d.background] &&
          ` ${BACKGROUND_BY_ID[d.background]?.emoji} ${BACKGROUND_BY_ID[d.background]?.label}.`}
      </p>
      <div className="cl-ages" aria-label="Through the years">
        {[1, 8, 18, 30, 50, 80].map((age) => (
          <figure key={age}>
            <Portrait look={look} age={age} gender={g} size={44} testId={`preview-age-${age}`} />
            <figcaption>{age}</figcaption>
          </figure>
        ))}
      </div>
      {children}
      <label className="cl-seed" title="The same seed replays the same life">
        <span className="cl-label">Seed</span>
        <input
          data-testid="f-seed"
          inputMode="numeric"
          value={d.seed}
          onChange={(e) => onSeed(e.target.value)}
          placeholder="Random (optional)"
        />
      </label>
    </aside>
  );
}

const Cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
