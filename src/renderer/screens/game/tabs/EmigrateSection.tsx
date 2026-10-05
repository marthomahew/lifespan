import { useState } from 'react';
import { COUNTRIES, COUNTRY_BY_ID } from '../../../../content/countries';
import { emigrateReason, formatMoney, money, MOVE_COST, type GameState } from '../../../../engine';
import { doAct } from '../../../store/app';
import { cap } from '../../../components/text';

/** Move abroad (SPEC §5.11). */
export function EmigrateSection({
  game,
  onError,
}: {
  game: GameState;
  onError: (e: string | null) => void;
}): React.JSX.Element | null {
  const others = COUNTRIES.filter((c) => c.id !== game.player.country);
  const [country, setCountry] = useState(others[0]?.id ?? 'us');
  const [city, setCity] = useState('');
  if (game.player.age < 16) return null;
  const target = COUNTRY_BY_ID[country];
  const why = emigrateReason(game, country);
  return (
    <section className="panel-section" data-testid="emigrate-section">
      <h3 className="section-title">Move abroad</h3>
      <form
        className="enroll"
        onSubmit={(e) => {
          e.preventDefault();
          onError(doAct({ type: 'emigrate', country, ...(city ? { city } : {}) }));
        }}
      >
        <select
          aria-label="Country"
          data-testid="emigrate-country"
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            setCity('');
          }}
        >
          {others.map((c) => (
            <option key={c.id} value={c.id}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
        <select
          aria-label="City"
          data-testid="emigrate-city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="">Any city</option>
          {target?.cities.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button
          type="submit"
          data-testid="btn-emigrate"
          disabled={why !== null}
          title={why ?? undefined}
        >
          Emigrate
        </button>
        <span className="muted small enroll-note">
          {why
            ? cap(why)
            : `Moving costs ${formatMoney(game, money(game, MOVE_COST))}. Your job stays behind.`}
        </span>
      </form>
    </section>
  );
}
