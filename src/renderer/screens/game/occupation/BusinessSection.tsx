import { useState } from 'react';
import { BUSINESS_KINDS, BUSINESS_BY_ID } from '../../../../content/businesses';
import {
  expandCost,
  formatMoney,
  investCost,
  levelName,
  money,
  startReason,
  type BusinessOp,
  type GameState,
} from '../../../../engine';
import { doAct } from '../../../store/app';

/** Your own business: open one, grow it, step back from it, or sell it. */
export function BusinessSection({
  game,
  onError,
}: {
  game: GameState;
  onError: (e: string | null) => void;
}): React.JSX.Element | null {
  const [kind, setKind] = useState(BUSINESS_KINDS[0]?.id ?? 'cafe');
  const [name, setName] = useState('');
  const [selling, setSelling] = useState(false);
  const b = game.business ?? null;
  const run = (action: BusinessOp): void => onError(doAct({ type: 'business', action }));
  if (!b) {
    if (game.player.age < 18) return null;
    const why = startReason(game, kind);
    const k = BUSINESS_BY_ID[kind];
    return (
      <section className="panel-section" data-testid="business-section">
        <h3 className="section-title">Your own business</h3>
        <details className="enlist-details" data-testid="business-details">
          <summary data-testid="business-open">Start a business…</summary>
          <form
            className="enroll"
            onSubmit={(e) => {
              e.preventDefault();
              run({ op: 'start', kind, ...(name.trim() ? { name: name.trim() } : {}) });
            }}
          >
            <select
              aria-label="Kind of business"
              data-testid="business-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            >
              {BUSINESS_KINDS.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.emoji} {x.label} · {formatMoney(game, money(game, x.startCost, 'wage'))}
                </option>
              ))}
            </select>
            <input
              aria-label="Business name"
              data-testid="business-name"
              placeholder="Name (or leave it to us)"
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {k && <span className="muted small">{k.description}</span>}
            <button
              className="primary"
              data-testid="business-start"
              disabled={!!why}
              title={why ?? ''}
            >
              {why ? `Can't: ${why}` : 'Open it'}
            </button>
          </form>
        </details>
      </section>
    );
  }
  const k = BUSINESS_BY_ID[b.kind];
  const grow = expandCost(game, b);
  const invest = investCost(game, b);
  return (
    <section className="panel-section" data-testid="business-section">
      <h3 className="section-title">Your business</h3>
      <div className="col">
        <div data-testid="business-name-now">
          <strong>
            {k?.emoji} {b.name}
          </strong>{' '}
          <span className="muted small">
            {k?.label} · {levelName(b)} · since {b.founded}
          </span>
        </div>
        <div className="row small">
          Momentum
          <span
            className="mini-bar wide"
            aria-label={`Momentum ${Math.round(b.health)}`}
            data-testid="business-health"
          >
            <span
              className={`bar-fill ${b.health < 30 ? 'red' : b.health < 55 ? 'amber' : 'green'}`}
              style={{ width: `${b.health}%` }}
            />
          </span>
        </div>
        <div className="muted small" data-testid="business-numbers">
          Last year {b.lastProfit < 0 ? 'lost' : 'made'} {formatMoney(game, Math.abs(b.lastProfit))}{' '}
          · worth about {formatMoney(game, b.value)} ·{' '}
          {b.hands === 'self' ? 'you run it yourself' : 'a manager runs it'}
        </div>
        <div className="btn-row">
          {grow !== null && (
            <button
              data-testid="business-expand"
              disabled={game.money.cash < grow || b.health < 40}
              title={b.health < 40 ? 'Growth needs momentum (40+)' : ''}
              onClick={() => run({ op: 'expand' })}
            >
              Expand ({formatMoney(game, grow)})
            </button>
          )}
          <button
            data-testid="business-invest"
            disabled={game.money.cash < invest}
            onClick={() => run({ op: 'invest' })}
          >
            Invest ({formatMoney(game, invest)})
          </button>
          {b.hands === 'self' ? (
            <button
              data-testid="business-manager"
              onClick={() => run({ op: 'hands', hands: 'manager' })}
            >
              Hire a manager
            </button>
          ) : (
            <button
              data-testid="business-self"
              disabled={!!game.career.jobId || !!game.legal.prison}
              title={game.career.jobId ? 'Quit your job first' : ''}
              onClick={() => run({ op: 'hands', hands: 'self' })}
            >
              Run it yourself
            </button>
          )}
          {selling ? (
            <>
              <button
                className="quiet-danger"
                data-testid="business-sell-yes"
                onClick={() => run({ op: 'sell' })}
              >
                Sell for {formatMoney(game, Math.round(b.value * 0.9))}
              </button>
              <button data-testid="business-sell-no" onClick={() => setSelling(false)}>
                Keep it
              </button>
            </>
          ) : (
            <button
              className="quiet-danger"
              data-testid="business-sell"
              onClick={() => setSelling(true)}
            >
              Sell…
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
