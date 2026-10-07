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
          ? btcAllowance(game) < 1
            ? ' You’ve bought every bitcoin anyone would sell you this year; try again next year.'
            : ` Bitcoin’s market is tiny: about ${Math.floor(btcAllowance(game)).toLocaleString()} more coins can be had this year without moving the price.`
          : ''}
      </p>
      <label className="row small">
        <span className="nowrap">Amount ({countryOf(game).currency.symbol})</span>
        <input
          type="number"
          min={0}
          value={amount}
          data-testid="shares-amount"
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>
      <p className="small muted" data-testid="shares-hint">
        Buy spends this much; Sell sells this much worth.
        {n > 0 && open.some((t) => t.id === 'BTC')
          ? ` That’s about ${btcCoins(game, n)} bitcoin.`
          : ''}
      </p>

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
                      data-testid={`max-${t.id}`}
                      title="Spend all your cash, or buy as much as can be had this year"
                      disabled={
                        blocked !== null ||
                        game.money.cash <= 0 ||
                        (t.id === 'BTC' && btcAllowance(game) <= 0)
                      }
                      onClick={() =>
                        run({ type: 'shares', id: t.id, op: 'buy', amount: game.money.cash })
                      }
                    >
                      Max
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
                    <button
                      data-testid={`sell-all-${t.id}`}
                      disabled={have <= 0}
                      onClick={() => run({ type: 'shares', id: t.id, op: 'sell', amount: have })}
                    >
                      Sell all
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

/** How many coins an amount of money buys at this year's price. */
function btcCoins(game: GameState, amount: number): string {
  const price = priceLocal(game, 'BTC') ?? 0;
  if (price <= 0) return '0';
  const c = amount / price;
  return c >= 100 ? Math.round(c).toLocaleString() : c.toFixed(c >= 1 ? 2 : 4);
}
