import { useMemo } from 'react';
import { COUNTRIES } from '../../../content/countries';
import { SKILLS } from '../../../content/skills';
import { TRAITS } from '../../../content/traits';
import { WEALTH_TIERS, type Attraction, type Gender, type WealthTier } from '../../../engine';
import { LookBuilder } from '../../portrait/LookBuilder';
import { Portrait } from '../../portrait/Portrait';
import type { ParentSetup } from '../../../engine/types';
import { DICE, shownLook, STATS, toggleTrait, type Draft } from './useNewLife';

type Props = { d: Draft; set: (patch: Partial<Draft> | ((d: Draft) => Draft)) => void };

const Cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

function Section({
  title,
  dice,
  set,
  children,
}: {
  title: string;
  dice: keyof typeof DICE;
  set: Props['set'];
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <section className="card pad nl-section" aria-label={title}>
      <div className="nl-section-head">
        <h2>{title}</h2>
        <button
          type="button"
          className="ghost small"
          data-testid={`dice-${dice}`}
          title={`Roll ${title.toLowerCase()}`}
          onClick={() => set(DICE[dice])}
        >
          🎲 Roll
        </button>
      </div>
      {children}
    </section>
  );
}

export function IdentitySection({ d, set }: Props): React.JSX.Element {
  return (
    <Section title="Who" dice="identity" set={set}>
      <div className="form-grid">
        <label>
          First name
          <input
            data-testid="f-first"
            value={d.first}
            maxLength={40}
            placeholder="Random"
            onChange={(e) => set({ first: e.target.value })}
          />
        </label>
        <label>
          Last name
          <input
            data-testid="f-last"
            value={d.last}
            maxLength={40}
            placeholder="Random"
            onChange={(e) => set({ last: e.target.value })}
          />
        </label>
        <label>
          Gender
          <select
            data-testid="f-gender"
            value={d.gender}
            onChange={(e) => set({ gender: e.target.value as Gender | '' })}
          >
            <option value="">Surprise me</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="nonbinary">Nonbinary</option>
          </select>
        </label>
        <label>
          Attracted to
          <select
            data-testid="f-attraction"
            value={d.attraction}
            onChange={(e) => set({ attraction: e.target.value as Attraction | '' })}
          >
            <option value="">Surprise me</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="everyone">Everyone</option>
          </select>
        </label>
      </div>
    </Section>
  );
}

export function LookSection({ d, set }: Props): React.JSX.Element {
  const look = useMemo(() => shownLook(d), [d]);
  return (
    <Section title="Look" dice="look" set={set}>
      <div className="nl-look">
        <Portrait
          look={look}
          age={30}
          gender={d.gender || 'nonbinary'}
          size={132}
          label="Your look as an adult"
          testId="look-portrait"
        />
        <LookBuilder
          look={look}
          gender={d.gender || 'nonbinary'}
          onChange={(look) => set({ look, lookSet: true })}
        />
      </div>
    </Section>
  );
}

export function OriginsSection({ d, set }: Props): React.JSX.Element {
  const c = COUNTRIES.find((x) => x.id === d.country) ?? COUNTRIES[0];
  return (
    <Section title="Where and when" dice="origins" set={set}>
      <div className="form-grid">
        <label>
          Country
          <select
            data-testid="f-country"
            value={d.country}
            onChange={(e) => set({ country: e.target.value, city: '' })}
          >
            {COUNTRIES.map((x) => (
              <option key={x.id} value={x.id}>
                {x.flag} {x.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          City
          <select
            data-testid="f-city"
            value={d.city}
            onChange={(e) => set({ city: e.target.value })}
          >
            <option value="">Random</option>
            {c?.cities.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </label>
        <label>
          Birth year
          <input
            data-testid="f-year"
            type="number"
            min={1940}
            max={2030}
            value={d.birthYear}
            onChange={(e) => set({ birthYear: Number(e.target.value) || 2000 })}
          />
        </label>
        <label>
          Family wealth
          <select
            data-testid="f-wealth"
            value={d.wealth}
            onChange={(e) => set({ wealth: e.target.value as WealthTier })}
          >
            {WEALTH_TIERS.map((w) => (
              <option key={w} value={w}>
                {Cap(w)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Raised by
          <select
            data-testid="f-parents"
            value={d.parents}
            onChange={(e) => set({ parents: e.target.value as ParentSetup | '' })}
          >
            <option value="">Surprise me</option>
            <option value="together">Both parents, together</option>
            <option value="apart">Both parents, separated</option>
            <option value="mother">A single mother</option>
            <option value="father">A single father</option>
          </select>
        </label>
        <label>
          Siblings at birth
          <select
            data-testid="f-siblings"
            value={d.siblings}
            onChange={(e) => set({ siblings: e.target.value })}
          >
            <option value="">Surprise me</option>
            {[0, 1, 2, 3, 4].map((n) => (
              <option key={n} value={String(n)}>
                {n === 0 ? 'None (an only child, for now)' : n}
              </option>
            ))}
          </select>
        </label>
      </div>
    </Section>
  );
}

export function NatureSection({ d, set }: Props): React.JSX.Element {
  return (
    <Section title="Nature" dice="nature" set={set}>
      <div className="trait-pick" role="group" aria-label="Traits (up to 3)">
        <span className="nl-pick-label">Traits (up to 3)</span>
        {TRAITS.map((t) => (
          <button
            type="button"
            key={t.id}
            className={`chip${d.traits.includes(t.id) ? ' active' : ''}`}
            aria-pressed={d.traits.includes(t.id)}
            data-testid={`f-trait-${t.id}`}
            title={t.description}
            onClick={() => set((cur) => ({ ...cur, traits: toggleTrait(cur.traits, t.id) }))}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>
      <label className="nl-talent">
        A gift for
        <select
          data-testid="f-talent"
          value={d.talent}
          onChange={(e) => set({ talent: e.target.value })}
        >
          <option value="">Nothing in particular</option>
          {SKILLS.map((k) => (
            <option key={k.id} value={k.id}>
              {k.emoji} {k.label}
            </option>
          ))}
        </select>
        <span className="muted small">
          Starts a little ahead and grows half as fast again with practice.
        </span>
      </label>
    </Section>
  );
}

export function StatsSection({ d, set }: Props): React.JSX.Element {
  return (
    <Section title="Starting stats" dice="stats" set={set}>
      <div className="stat-pick">
        {STATS.map((k) => (
          <label key={k}>
            <span className="nl-stat-head">
              {Cap(k)} <strong>{d.stats[k]}</strong>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={d.stats[k]}
              data-testid={`f-stat-${k}`}
              onChange={(e) =>
                set((cur) => ({ ...cur, stats: { ...cur.stats, [k]: Number(e.target.value) } }))
              }
            />
          </label>
        ))}
      </div>
    </Section>
  );
}
