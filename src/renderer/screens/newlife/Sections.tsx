import { COUNTRIES } from '../../../content/countries';
import { SKILLS } from '../../../content/skills';
import { TRAITS } from '../../../content/traits';
import { GIFTS } from '../../../content/gifts';
import { BACKGROUNDS, BACKGROUND_BY_ID } from '../../../content/backgrounds';
import { WEALTH_TIERS } from '../../../engine';
import { LookBuilder } from '../../portrait/LookBuilder';
import type { ParentSetup } from '../../../engine/types';
import { shownLook, STATS, toggleTrait, type Draft, type Pace } from './useNewLife';
import { app } from '../../store/app';
import { useMemo } from 'react';
import { Section, Segmented, type SetDraft } from './parts';

type Props = { d: Draft; set: SetDraft };

const Cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
const STAT_EMOJI: Record<string, string> = {
  happiness: '😊',
  health: '❤️',
  smarts: '🧠',
  looks: '✨',
};

export function IdentitySection({ d, set }: Props): React.JSX.Element {
  return (
    <Section
      n={1}
      icon="🪪"
      title="Who"
      hint="Leave a name blank and one is picked to suit where you're born."
      dice="identity"
      set={set}
    >
      <div className="cl-grid">
        <label className="cl-field">
          <span className="cl-label">First name</span>
          <input
            data-testid="f-first"
            value={d.first}
            maxLength={40}
            placeholder="Random"
            onChange={(e) => set({ first: e.target.value })}
          />
        </label>
        <label className="cl-field">
          <span className="cl-label">Last name</span>
          <input
            data-testid="f-last"
            value={d.last}
            maxLength={40}
            placeholder="Random"
            onChange={(e) => set({ last: e.target.value })}
          />
        </label>
      </div>
      <Segmented
        label="Gender"
        testId="f-gender"
        value={d.gender}
        onChange={(v) => set({ gender: v })}
        options={[
          { value: '', label: '🎲 Any' },
          { value: 'female', label: 'Female' },
          { value: 'male', label: 'Male' },
          { value: 'nonbinary', label: 'Nonbinary' },
        ]}
      />
      <Segmented
        label="Attracted to"
        testId="f-attraction"
        value={d.attraction}
        onChange={(v) => set({ attraction: v })}
        options={[
          { value: '', label: '🎲 Any' },
          { value: 'men', label: 'Men' },
          { value: 'women', label: 'Women' },
          { value: 'everyone', label: 'Everyone' },
        ]}
      />
    </Section>
  );
}

export function LookSection({ d, set }: Props): React.JSX.Element {
  const look = useMemo(() => shownLook(d), [d]);
  return (
    <Section
      n={2}
      icon="🎨"
      title="Look"
      hint="Shown as an adult; you'll grow into it. The card on the left updates as you go."
      dice="look"
      set={set}
    >
      <LookBuilder
        look={look}
        gender={d.gender || 'nonbinary'}
        onChange={(look) => set({ look, lookSet: true })}
      />
    </Section>
  );
}

export function OriginsSection({ d, set }: Props): React.JSX.Element {
  const c = COUNTRIES.find((x) => x.id === d.country) ?? COUNTRIES[0];
  return (
    <Section
      n={3}
      icon="🌍"
      title="Where and when"
      hint="Your birth year matters: prices, jobs, phones and history all follow it."
      dice="origins"
      set={set}
    >
      <div className="cl-grid">
        <label className="cl-field">
          <span className="cl-label">Country</span>
          <select
            data-testid="f-country"
            value={d.country}
            onChange={(e) => set({ country: e.target.value, city: '' })}
          >
            {[...COUNTRIES]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((x) => (
                <option key={x.id} value={x.id}>
                  {x.flag} {x.name}
                </option>
              ))}
          </select>
        </label>
        <label className="cl-field">
          <span className="cl-label">City</span>
          <select
            data-testid="f-city"
            value={d.city}
            onChange={(e) => set({ city: e.target.value })}
          >
            <option value="">Random</option>
            {[...(c?.cities ?? [])]
              .sort((a, b) => a.localeCompare(b))
              .map((x) => (
                <option key={x} value={x}>
                  {c?.towns?.[x] ? `${x} (${c.towns[x]?.region})` : x}
                </option>
              ))}
          </select>
        </label>
        <label className="cl-field">
          <span className="cl-label">Birth year</span>
          <input
            data-testid="f-year"
            type="number"
            min={1940}
            max={2030}
            value={d.birthYear}
            onChange={(e) => set({ birthYear: Number(e.target.value) || 2000 })}
          />
        </label>
        <label className="cl-field">
          <span className="cl-label">Background</span>
          <select
            data-testid="f-background"
            value={d.background}
            onChange={(e) => set({ background: e.target.value })}
          >
            <option value="auto">As Settings says (off by default)</option>
            <option value="none">An ordinary upbringing</option>
            {BACKGROUNDS.map((b) => (
              <option key={b.id} value={b.id} title={b.description}>
                {b.emoji} {b.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Segmented
        label="Family wealth"
        testId="f-wealth"
        value={d.wealth}
        onChange={(v) => set({ wealth: v })}
        options={WEALTH_TIERS.map((w) => ({ value: w, label: Cap(w) }))}
      />
      <Segmented
        label="Raised by"
        testId="f-parents"
        value={d.parents}
        onChange={(v) => set({ parents: v })}
        options={[
          { value: '' as ParentSetup | '', label: '🎲 Any' },
          { value: 'together', label: 'Both parents' },
          { value: 'apart', label: 'Separated parents' },
          { value: 'mother', label: 'Single mother' },
          { value: 'father', label: 'Single father' },
        ]}
      />
      <Segmented
        label="Siblings at birth"
        testId="f-siblings"
        value={d.siblings}
        onChange={(v) => set({ siblings: v })}
        options={[
          { value: '', label: '🎲 Any' },
          { value: '0', label: 'Only child' },
          ...['1', '2', '3', '4'].map((n) => ({ value: n, label: n })),
        ]}
      />
      {BACKGROUND_BY_ID[d.background] && (
        <p className="muted small" data-testid="background-note">
          {BACKGROUND_BY_ID[d.background]?.description}
        </p>
      )}
    </Section>
  );
}

export function NatureSection({ d, set }: Props): React.JSX.Element {
  return (
    <Section
      n={4}
      icon="✨"
      title="Nature"
      hint="Up to three traits, a talent, and gifts that bend the odds."
      dice="nature"
      set={set}
    >
      <span className="cl-label">Traits (up to 3)</span>
      <div className="cl-chips" role="group" aria-label="Traits (up to 3)">
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
      <label className="cl-field cl-talent">
        <span className="cl-label">A talent for</span>
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
      {d.talent && (
        <label className="cl-check">
          <input
            type="checkbox"
            data-testid="f-prodigy"
            checked={d.prodigy}
            onChange={(e) => set({ prodigy: e.target.checked })}
          />
          🌟 A prodigy: starts further ahead and learns it three times as fast
        </label>
      )}
      <span className="cl-label">Gifts (only if you pick them; the dice never roll these)</span>
      <div className="cl-gifts" role="group" aria-label="Gifts">
        {GIFTS.map((g) => (
          <label
            key={g.id}
            className={`cl-gift${d.gifts.includes(g.id) ? ' on' : ''}`}
            title={g.description}
          >
            <input
              type="checkbox"
              data-testid={`gift-${g.id}`}
              checked={d.gifts.includes(g.id)}
              onChange={(e) =>
                set({
                  gifts: e.target.checked ? [...d.gifts, g.id] : d.gifts.filter((x) => x !== g.id),
                })
              }
            />
            <span className="cl-gift-emoji" aria-hidden="true">
              {g.emoji}
            </span>
            <span className="cl-gift-text">
              <strong>{g.label}</strong>
              <span className="muted small">{g.description}</span>
            </span>
          </label>
        ))}
      </div>
    </Section>
  );
}

export function StatsSection({ d, set }: Props): React.JSX.Element {
  return (
    <Section
      n={5}
      icon="📊"
      title="Starting stats"
      hint="Where you begin. Life moves them from here."
      dice="stats"
      set={set}
    >
      <div className="cl-stats">
        {STATS.map((k) => (
          <label
            key={k}
            className="cl-stat"
            style={{ '--v': `${d.stats[k]}%` } as React.CSSProperties}
          >
            <span className="cl-stat-head">
              <span>
                {STAT_EMOJI[k]} {Cap(k)}
              </span>{' '}
              <strong>{d.stats[k]}</strong>
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
      <Segmented
        label="Pips each year"
        testId="f-pace"
        value={d.pace}
        onChange={(v) => set({ pace: v })}
        options={[
          { value: '' as Pace | '', label: `As in Settings (${Cap(app.get().settings.pace)})` },
          { value: 'relaxed', label: 'Relaxed' },
          { value: 'standard', label: 'Standard' },
          { value: 'challenging', label: 'Challenging' },
        ]}
      />
      <p className="muted small">
        Relaxed: 3 more free-time pips and 9 work-time. Challenging: 2 fewer and 4 work-time. Kept
        with this life (and its template); Settings can still change it later.
      </p>
    </Section>
  );
}
