import { useState } from 'react';
import {
  TRADABLES,
  countryOf,
  formatMoney,
  inRecession,
  btcAllowance,
  investBlock,
  onRadar,
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
  const blocked = investBlock(game);
  const open = TRADABLES.filter((t) => game.year >= t.listed && onRadar(game, t.id));
  return (
    <section data-testid="shares">
      <h3 className="section-title">Shares and crypto</h3>
      <p className="small muted">
        Prices as of {game.year}
        {inRecession(game.year) ? ' · the economy is in recession' : ''}. Companies appear the year
        they list.
        {game.player.age < 18 && !blocked
          ? ' Under 18, a parent opens the account in your name.'
          : ''}
        {blocked ? ` You can’t trade: ${blocked}.` : ''}
        {onRadar(game, 'BTC') && Number.isFinite(btcAllowance(game))
          ? ` Bitcoin’s market is tiny: about ${Math.floor(btcAllowance(game)).toLocaleString()} more coins can be had this year without moving the price.`
          : ''}
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
                    <span className="muted small">{sharePrice(game, price)}</span>
                  </th>
                  <td>{have > 0 ? formatMoney(game, Math.round(have * price)) : '—'}</td>
                  <td className="btn-row">
                    <button
                      data-testid={`buy-${t.id}`}
                      disabled={
                        blocked !== null || n <= 0 || (t.id === 'BTC' && btcAllowance(game) <= 0)
                      }
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

/** A share price: whole units when it's large, pennies when it's small (Nvidia in 2009). */
function sharePrice(game: GameState, price: number): string {
  if (price >= 100) return formatMoney(game, Math.round(price));
  const sym = countryOf(game).currency.symbol;
  return `${sym}${price.toFixed(price < 0.1 ? 3 : 2)}`;
}
