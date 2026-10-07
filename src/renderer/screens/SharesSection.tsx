import { useState } from 'react';
import {
  TRADABLES,
  formatMoney,
  inRecession,
  priceLocal,
  type GameState,
  type PlayerAction,
} from '../../engine';

/** Shares and bitcoin: what is trading this year, at this year's price, and what you hold. */
export function SharesSection({
  game,
  run,
}: {
  game: GameState;
  run: (a: PlayerAction) => void;
}): React.JSX.Element {
  const [amount, setAmount] = useState('1000');
  const n = Math.max(0, Number(amount) || 0);
  const held = game.money.shares ?? {};
  const open = TRADABLES.filter((t) => game.year >= t.listed);
  return (
    <section data-testid="shares">
      <h3 className="section-title">Shares and crypto</h3>
      <p className="small muted">
        Prices as of {game.year}
        {inRecession(game.year) ? ' · the economy is in recession' : ''}. Companies appear the year
        they list.
      </p>
      <label className="row small">
        Amount
        <input
          type="number"
          min={0}
          value={amount}
          data-testid="shares-amount"
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>
      {open.length ? (
        <table className="breakdown">
          <tbody>
            {open.map((t) => {
              const price = priceLocal(game, t.id) ?? 0;
              const have = held[t.id] ?? 0;
              return (
                <tr key={t.id} data-testid={`share-${t.id}`}>
                  <th scope="row">
                    {t.emoji} {t.name}{' '}
                    <span className="muted small">
                      {formatMoney(game, Math.round(price * 100) / 100)}
                      {price < 1 ? ` (${price.toFixed(3)})` : ''}
                    </span>
                  </th>
                  <td>{have > 0 ? formatMoney(game, Math.round(have * price)) : '—'}</td>
                  <td className="btn-row">
                    <button
                      data-testid={`buy-${t.id}`}
                      disabled={game.player.age < 18 || n <= 0}
                      onClick={() => run({ type: 'shares', id: t.id, op: 'buy', amount: n })}
                    >
                      Buy
                    </button>
                    <button
                      data-testid={`sell-${t.id}`}
                      disabled={have <= 0}
                      onClick={() =>
                        run({
                          type: 'shares',
                          id: t.id,
                          op: 'sell',
                          amount: price > 0 ? Math.min(have, n / price) : have,
                        })
                      }
                    >
                      Sell
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="muted small">No famous companies are trading yet.</p>
      )}
    </section>
  );
}
