import { useState } from 'react';
import { COUNTRY_BY_ID } from '../../../../content/countries';
import {
  formatMoney,
  moveCost,
  moveTownReason,
  townOf,
  type GameState,
  type PlayerAction,
} from '../../../../engine';

const SIZE: Record<string, string> = {
  capital: 'the capital',
  city: 'a city',
  town: 'a town',
  'small town': 'a small town',
};

/** Where you live: the town in depth (where the game knows it), and a move to another. */
export function TownPanel({
  game,
  run,
}: {
  game: GameState;
  run: (a: PlayerAction) => void;
}): React.JSX.Element | null {
  const c = COUNTRY_BY_ID[game.player.country];
  const others = (c?.cities ?? [])
    .filter((x) => x !== game.player.city)
    .sort((a, b) => a.localeCompare(b));
  const [to, setTo] = useState('');
  if (game.legal.prison) return null;
  const t = townOf(game);
  const pick = to || others[0] || '';
  const why = moveTownReason(game, pick);
  return (
    <section className="panel-section" data-testid="town">
      <h3 className="section-title">📍 {game.player.city}</h3>
      {t ? (
        <div className="col small">
          <div data-testid="town-region">
            <strong>{t.region}</strong>
            <span className="muted">
              {' '}
              · {SIZE[t.size] ?? t.size} of about {t.population.toLocaleString('en')}
              {t.river ? ` · on the ${t.river}` : ''}
            </span>
          </div>
          <p>{t.blurb}</p>
          <div className="muted" data-testid="town-landmarks">
            Known for: {t.landmarks.join(' · ')}
          </div>
          <div className="muted">
            Eat: {t.food}
            {t.famous ? ` · Home of ${t.famous}` : ''}
          </div>
          <div className="muted">{t.quirk}</div>
          {t.housing !== 1 && (
            <div className="muted">
              Homes here cost {t.housing > 1 ? 'more' : 'less'} than the national average (
              {Math.round(t.housing * 100)}%).
            </div>
          )}
        </div>
      ) : (
        <p className="muted small">
          {c ? `A ${c.demonym} town like any other, and yours.` : 'Home, for now.'}
        </p>
      )}
      {game.player.age >= 18 && others.length > 0 && (
        <div className="row small wrap" data-testid="town-move">
          <select
            aria-label="Move to"
            data-testid="town-pick"
            value={pick}
            onChange={(e) => setTo(e.target.value)}
          >
            {others.map((x) => (
              <option key={x} value={x}>
                {c?.towns?.[x] ? `${x} (${c.towns[x]?.region})` : x}
              </option>
            ))}
          </select>
          <button
            data-testid="btn-move-town"
            disabled={why !== null}
            title={why ?? `Moving costs ${formatMoney(game, moveCost(game))}`}
            onClick={() => run({ type: 'move_town', city: pick })}
          >
            🚚 Move ({formatMoney(game, moveCost(game))})
          </button>
          {why && <span className="muted">{why}</span>}
        </div>
      )}
    </section>
  );
}
