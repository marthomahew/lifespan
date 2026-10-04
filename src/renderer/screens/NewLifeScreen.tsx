import { useState } from 'react';
import { COUNTRIES } from '../../content/countries';
import { SKIN_TONES } from '../../content/family';
import { TRAITS } from '../../content/traits';
import {
  WEALTH_TIERS,
  type Attraction,
  type Gender,
  type NewLifeOptions,
  type WealthTier,
} from '../../engine';
import { go, startLife } from '../store/app';

const STATS = ['happiness', 'health', 'smarts', 'looks'] as const;

export function NewLifeScreen(): React.JSX.Element {
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [attraction, setAttraction] = useState<Attraction | ''>('');
  const [country, setCountry] = useState('us');
  const [city, setCity] = useState('');
  const [birthYear, setBirthYear] = useState(2000);
  const [tone, setTone] = useState('');
  const [traits, setTraits] = useState<string[]>([]);
  const [stats, setStats] = useState<Record<(typeof STATS)[number], number>>({
    happiness: 80,
    health: 90,
    smarts: 20,
    looks: 50,
  });
  const [wealth, setWealth] = useState<WealthTier>('middle');
  const [seed, setSeed] = useState('');
  const c = COUNTRIES.find((x) => x.id === country) ?? COUNTRIES[0];

  const toggleTrait = (id: string): void => {
    setTraits((cur) => {
      if (cur.includes(id)) return cur.filter((t) => t !== id);
      const t = TRAITS.find((x) => x.id === id);
      const kept = cur.filter((o) => !t?.excludes.includes(o));
      return kept.length >= 3 ? kept : [...kept, id];
    });
  };

  const submit = (e: React.FormEvent): void => {
    e.preventDefault();
    const opts: NewLifeOptions = {
      // Left on "Surprise me", the engine rolls them the way it does for random lives.
      ...(gender ? { gender } : {}),
      ...(attraction ? { attraction } : {}),
      country,
      birthYear,
      appearance: tone,
      traits,
      stats,
      wealth,
    };
    if (first.trim()) opts.first = first.trim();
    if (last.trim()) opts.last = last.trim();
    if (city) opts.city = city;
    const n = Number(seed);
    startLife(opts, seed.trim() && Number.isFinite(n) ? Math.abs(Math.floor(n)) : undefined);
  };

  return (
    <div className="screen" data-testid="new-life-screen">
      <div className="screen-head">
        <button className="ghost" data-testid="btn-back" onClick={() => go('start')}>
          ← Back
        </button>
        <h1>New Life</h1>
      </div>
      <div className="newlife">
        <section className="card pad random-card">
          <h2>Roll the dice</h2>
          <p className="muted">A random person, somewhere, sometime.</p>
          <button
            className="primary big"
            data-testid="btn-random-life"
            onClick={() => startLife({})}
          >
            🎲 Random life
          </button>
        </section>
        <form
          className="card pad custom"
          onSubmit={submit}
          data-testid="custom-form"
          aria-label="Custom life"
        >
          <h2>Or build one</h2>
          <div className="form-grid">
            <label>
              First name
              <input
                data-testid="f-first"
                value={first}
                maxLength={40}
                placeholder="Random"
                onChange={(e) => setFirst(e.target.value)}
              />
            </label>
            <label>
              Last name
              <input
                data-testid="f-last"
                value={last}
                maxLength={40}
                placeholder="Random"
                onChange={(e) => setLast(e.target.value)}
              />
            </label>
            <label>
              Gender
              <select
                data-testid="f-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender | '')}
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
                value={attraction}
                onChange={(e) => setAttraction(e.target.value as Attraction | '')}
              >
                <option value="">Surprise me</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="everyone">Everyone</option>
              </select>
            </label>
            <label>
              Country
              <select
                data-testid="f-country"
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setCity('');
                }}
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
              <select data-testid="f-city" value={city} onChange={(e) => setCity(e.target.value)}>
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
                value={birthYear}
                onChange={(e) => setBirthYear(Number(e.target.value) || 2000)}
              />
            </label>
            <label>
              Family wealth
              <select
                data-testid="f-wealth"
                value={wealth}
                onChange={(e) => setWealth(e.target.value as WealthTier)}
              >
                {WEALTH_TIERS.map((w) => (
                  <option key={w} value={w}>
                    {w[0]?.toUpperCase()}
                    {w.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <fieldset className="tones">
            <legend>Appearance</legend>
            {SKIN_TONES.map((t, i) => (
              <button
                type="button"
                key={i}
                className={`tone${tone === t ? ' active' : ''}`}
                aria-pressed={tone === t}
                aria-label={`Skin tone ${i + 1}`}
                data-testid={`f-tone-${i}`}
                onClick={() => setTone(t)}
              >
                {`🧑${t}`}
              </button>
            ))}
          </fieldset>
          <fieldset className="trait-pick">
            <legend>Traits (up to 3)</legend>
            {TRAITS.map((t) => (
              <button
                type="button"
                key={t.id}
                className={`chip${traits.includes(t.id) ? ' active' : ''}`}
                aria-pressed={traits.includes(t.id)}
                data-testid={`f-trait-${t.id}`}
                title={t.description}
                onClick={() => toggleTrait(t.id)}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </fieldset>
          <fieldset className="stat-pick">
            <legend>Starting stats</legend>
            {STATS.map((k) => (
              <label key={k}>
                {k[0]?.toUpperCase()}
                {k.slice(1)} <span className="muted">{stats[k]}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={stats[k]}
                  data-testid={`f-stat-${k}`}
                  onChange={(e) => setStats((s) => ({ ...s, [k]: Number(e.target.value) }))}
                />
              </label>
            ))}
          </fieldset>
          <div className="row">
            <label className="grow">
              Seed <span className="muted small">(optional, replays a life)</span>
              <input
                data-testid="f-seed"
                inputMode="numeric"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Random"
              />
            </label>
            <button className="primary big" type="submit" data-testid="btn-begin">
              Begin life
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
