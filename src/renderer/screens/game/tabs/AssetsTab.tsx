import { useState } from 'react';
import { POSSESSIONS, POSSESSION_BY_ID, VEHICLES, VEHICLE_BY_ID } from '../../../../content/assets';
import {
  formatMoney,
  homeLabel,
  money,
  netWorth,
  type GameState,
  type PlayerAction,
} from '../../../../engine';
import { app, doAct } from '../../../store/app';

const HOUSING_LABEL: Record<string, string> = {
  parents: 'Living with your parents',
  renting: 'Renting',
  owning: 'In your own home',
  prison: 'In prison',
  barracks: 'In the barracks',
};

export function AssetsTab({ game }: { game: GameState }): React.JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState(VEHICLES[0]?.id ?? '');
  const [item, setItem] = useState(POSSESSIONS[0]?.id ?? '');
  const m = game.money;
  const adult = game.player.age >= 18;
  const run = (a: PlayerAction): void => setError(doAct(a));
  const invested = Object.values(m.holdings).reduce((a, b) => a + b, 0);
  const debt = m.loans.reduce((t, l) => t + l.balance, 0);
  return (
    <div className="col" data-testid="assets">
      {error && (
        <p className="error small" role="alert" data-testid="assets-error">
          {error}
        </p>
      )}
      <section className="panel-section">
        <h3 className="section-title">Money</h3>
        <dl className="kv">
          <dt>Cash</dt>
          <dd data-testid="assets-cash">{formatMoney(game, m.cash)}</dd>
          <dt>Savings</dt>
          <dd>{formatMoney(game, m.savings)}</dd>
          <dt>Investments</dt>
          <dd>{formatMoney(game, invested)}</dd>
          <dt>Debts</dt>
          <dd data-testid="assets-debt">{formatMoney(game, debt)}</dd>
          <dt>Net worth</dt>
          <dd data-testid="assets-networth">{formatMoney(game, netWorth(game))}</dd>
        </dl>
        <div className="btn-row">
          <button
            className="primary"
            data-testid="btn-finances"
            onClick={() => app.set({ overlay: 'finances' })}
          >
            Finances…
          </button>
          {adult && (
            <select
              aria-label="Lifestyle"
              data-testid="lifestyle"
              value={m.lifestyle}
              onChange={(e) =>
                run({
                  type: 'money',
                  action: {
                    op: 'lifestyle',
                    lifestyle: e.target.value as 'frugal' | 'normal' | 'lavish',
                  },
                })
              }
            >
              <option value="frugal">Frugal</option>
              <option value="normal">Normal</option>
              <option value="lavish">Lavish</option>
            </select>
          )}
        </div>
      </section>
      {m.loans.length > 0 && (
        <section className="panel-section" data-testid="loans">
          <h3 className="section-title">Loans</h3>
          <ul className="plain">
            {m.loans.map((l) => (
              <li key={l.id} className="row" data-testid={`loan-${l.kind}`}>
                <span className="grow">
                  {l.kind === 'debt'
                    ? 'Overdraft debt'
                    : `${l.kind[0]?.toUpperCase()}${l.kind.slice(1)} loan`}
                  : {formatMoney(game, l.balance)}
                  <span className="muted small">
                    {' '}
                    · {(l.rate * 100).toFixed(1)}% · {formatMoney(game, l.payment)}/yr
                  </span>
                </span>
                <button
                  data-testid={`payoff-${l.id}`}
                  onClick={() => run({ type: 'money', action: { op: 'payoff', loanId: l.id } })}
                >
                  Pay off
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {adult && (
        <section className="panel-section" data-testid="housing">
          <h3 className="section-title">Home</h3>
          <div className="row">
            <span className="grow" data-testid="housing-status">
              {HOUSING_LABEL[game.assets.housing] ?? game.assets.housing}
            </span>
            {game.assets.housing === 'parents' && (
              <button
                data-testid="btn-move-out"
                onClick={() => run({ type: 'money', action: { op: 'move_out' } })}
              >
                Move out
              </button>
            )}
            {(game.assets.housing === 'renting' || game.assets.housing === 'owning') && (
              <button onClick={() => run({ type: 'money', action: { op: 'live_with_parents' } })}>
                Move back home
              </button>
            )}
          </div>
          <ul className="plain" data-testid="homes">
            {game.assets.homes.map((h) => (
              <li key={h.id} className="asset-row">
                <span className="grow">
                  {homeLabel(h)}
                  {h.livingIn ? ' (home)' : ''}
                  <span className="muted small">
                    {' '}
                    · {formatMoney(game, h.value)} · condition {h.condition}
                  </span>
                </span>
                {!h.livingIn && (
                  <button onClick={() => run({ type: 'move_home', id: h.id })}>Move in</button>
                )}
                <button onClick={() => run({ type: 'renovate', id: h.id })}>Renovate</button>
                <button
                  data-testid={`sell-${h.id}`}
                  onClick={() => run({ type: 'sell_asset', id: h.id })}
                >
                  Sell
                </button>
              </li>
            ))}
          </ul>
          <h4 className="section-title">For sale</h4>
          <ul className="plain" data-testid="listings-homes">
            {(game.assets.listingsYear === game.year ? game.assets.listings : []).map((l, i) => (
              <li key={`${l.name}-${i}`} className="asset-row" data-testid={`listing-${i}`}>
                <span className="grow">
                  {l.name}
                  <span className="muted small">
                    {' '}
                    · {formatMoney(game, l.price)} · condition {l.condition}
                  </span>
                </span>
                <button
                  data-testid={`buy-cash-${i}`}
                  disabled={m.cash < l.price}
                  onClick={() => run({ type: 'buy_home', index: i, financing: { kind: 'cash' } })}
                >
                  Cash
                </button>
                <button
                  data-testid={`buy-mortgage-${i}`}
                  onClick={() =>
                    run({
                      type: 'buy_home',
                      index: i,
                      financing: { kind: 'mortgage', years: 30, down: 0.1 },
                    })
                  }
                >
                  30-yr mortgage
                </button>
                <button
                  data-testid={`buy-mortgage15-${i}`}
                  onClick={() =>
                    run({
                      type: 'buy_home',
                      index: i,
                      financing: { kind: 'mortgage', years: 15, down: 0.2 },
                    })
                  }
                >
                  15-yr
                </button>
              </li>
            ))}
            {game.assets.listingsYear !== game.year && (
              <li className="muted small">New listings arrive with the year.</li>
            )}
          </ul>
        </section>
      )}
      {game.player.age >= 16 && (
        <section className="panel-section" data-testid="vehicles">
          <h3 className="section-title">
            Vehicles {game.assets.licence ? '· licensed' : '· no licence'}
          </h3>
          <ul className="plain">
            {game.assets.vehicles.map((v) => (
              <li key={v.id} className="asset-row">
                <span className="grow">
                  {VEHICLE_BY_ID[v.model]?.emoji} {VEHICLE_BY_ID[v.model]?.label}
                  <span className="muted small">
                    {' '}
                    · {formatMoney(game, v.value)} · condition {v.condition}
                  </span>
                </span>
                <button onClick={() => run({ type: 'sell_asset', id: v.id })}>Sell</button>
              </li>
            ))}
          </ul>
          <div className="enroll">
            <select
              aria-label="Vehicle model"
              data-testid="vehicle-model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              {VEHICLES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} · {formatMoney(game, money(game, v.price))}
                </option>
              ))}
            </select>
            <button
              data-testid="btn-buy-vehicle"
              onClick={() => run({ type: 'buy_vehicle', model, financed: false })}
            >
              Buy
            </button>
            {adult && (
              <button onClick={() => run({ type: 'buy_vehicle', model, financed: true })}>
                Finance
              </button>
            )}
          </div>
        </section>
      )}
      {game.player.age >= 8 && (
        <section className="panel-section" data-testid="possessions">
          <h3 className="section-title">Possessions</h3>
          <ul className="plain">
            {game.assets.possessions.map((p) => (
              <li key={p.id} className="asset-row">
                <span className="grow">
                  {POSSESSION_BY_ID[p.item]?.emoji} {POSSESSION_BY_ID[p.item]?.label}
                  <span className="muted small"> · {formatMoney(game, p.value)}</span>
                </span>
                <button onClick={() => run({ type: 'sell_asset', id: p.id })}>Sell</button>
              </li>
            ))}
          </ul>
          <div className="enroll">
            <select
              aria-label="Item"
              data-testid="item-select"
              value={item}
              onChange={(e) => setItem(e.target.value)}
            >
              {POSSESSIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} · {formatMoney(game, money(game, p.price))}
                </option>
              ))}
            </select>
            <button data-testid="btn-buy-item" onClick={() => run({ type: 'buy_item', item })}>
              Buy
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
