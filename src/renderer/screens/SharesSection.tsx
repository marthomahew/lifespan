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
  const [unit, setUnit] = useState<'money' | 'units'>('money');
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
        <span className="nowrap">Amount</span>
        <input
          type="number"
          min={0}
          value={amount}
          data-testid="shares-amount"
          onChange={(e) => setAmount(e.target.value)}
        />
        <select
          value={unit}
          data-testid="shares-unit"
          aria-label="Amount in"
          onChange={(e) => setUnit(e.target.value === 'units' ? 'units' : 'money')}
        >
          <option value="money">{countryOf(game).currency.symbol}</option>
          <option value="units">shares / coins</option>
        </select>
      </label>
      <p className="small muted" data-testid="shares-hint">
        {unit === 'money'
          ? 'Buy spends this much; Sell sells this much worth.'
          : 'Buy or sell this many shares (or coins); fractions are fine.'}
        {unit === 'money' && n > 0 && open.some((t) => t.id === 'BTC')
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
                  <td data-testid={`held-${t.id}`}>
                    {have > 0 ? (
                      <>
                        {units(have, t.id === 'BTC')}{' '}
                        <span className="muted small">
                          {formatMoney(game, Math.round(have * price))}
                        </span>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="btn-row">
                    <button
                      data-testid={`buy-${t.id}`}
                      disabled={
                        blocked !== null || n <= 0 || (t.id === 'BTC' && btcAllowance(game) <= 0)
                      }
                      onClick={() =>
                        run({
                          type: 'shares',
                          id: t.id,
                          op: 'buy',
                          amount: n,
                          units: unit === 'units',
                        })
                      }
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
                          amount: Math.min(
                            have,
                            unit === 'units' ? n : price > 0 ? n / price : have,
                          ),
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

/** A holding as a count: whole shares, or coins to a few places. */
function units(n: number, coins: boolean): string {
  const shown = n >= 100 ? Math.round(n).toLocaleString() : n.toFixed(n >= 1 ? 2 : 4);
  if (coins) return `${shown} ₿`;
  return `${shown} ${n === 1 ? 'share' : 'shares'}`;
}
