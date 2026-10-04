import { useState } from 'react';
import { formatMoney, INVESTMENTS, type GameState, type PlayerAction } from '../../engine';
import { Modal } from '../components/Modal';
import { app, doAct } from '../store/app';

type Key = keyof typeof INVESTMENTS;

/** Net worth over time as an SVG line chart (reference dollars, so inflation doesn't distort it). */
export function NetWorthChart({
  history,
}: {
  history: [number, number, number][];
}): React.JSX.Element {
  const pts = history.slice(-80);
  const w = 640;
  const h = 160;
  if (pts.length < 2) return <p className="muted small">The graph fills in as the years go by.</p>;
  const vals = pts.map((p) => p[2]);
  const min = Math.min(0, ...vals);
  const max = Math.max(1, ...vals);
  const x = (i: number): number => (i / (pts.length - 1)) * (w - 20) + 10;
  const y = (v: number): number => h - 10 - ((v - min) / (max - min)) * (h - 20);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p[2]).toFixed(1)}`).join(' ');
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="networth-chart"
      role="img"
      aria-label="Net worth over time, inflation-adjusted"
      data-testid="networth-chart"
    >
      <line x1="10" x2={w - 10} y1={y(0)} y2={y(0)} className="axis" />
      <path d={d} className="line" />
      <text x="10" y="12" className="label">
        {pts[0]?.[0]}
      </text>
      <text x={w - 10} y="12" textAnchor="end" className="label">
        {pts.at(-1)?.[0]}
      </text>
    </svg>
  );
}

export function FinancesView({ game }: { game: GameState }): React.JSX.Element {
  const [amount, setAmount] = useState('1000');
  const [fund, setFund] = useState<Key>('index');
  const [error, setError] = useState<string | null>(null);
  const m = game.money;
  const last = m.last;
  const n = Number(amount);
  const run = (a: PlayerAction): void => setError(doAct(a));
  const rows: [string, number][] = last
    ? [
        ['Salary', last.salary],
        ['Other income', last.otherIncome],
        ['Tax', -last.tax],
        ['Living costs', -last.living],
        ['Rent', -last.housing],
        ['Loan payments', -last.loanPayments],
        ['Savings interest', last.interest],
        ['Investment returns', last.investReturn],
        ['Upkeep and maintenance', -last.maintenance],
      ]
    : [];
  return (
    <Modal title="Finances" testId="finances" onClose={() => app.set({ overlay: null })} wide>
      <div className="fin-cols">
        <section>
          <h3 className="section-title">Last year{last ? ` (${last.year})` : ''}</h3>
          {last ? (
            <table className="breakdown" data-testid="finance-breakdown">
              <tbody>
                {rows.map(([k, v]) => (
                  <tr key={k}>
                    <th scope="row">{k}</th>
                    <td className={v < 0 ? 'neg' : ''}>{formatMoney(game, v)}</td>
                  </tr>
                ))}
                <tr className="total">
                  <th scope="row">Change in net worth</th>
                  <td className={last.net < 0 ? 'neg' : ''}>{formatMoney(game, last.net)}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="muted">Nothing yet. Age up to see a year of money.</p>
          )}
        </section>
        <section>
          <h3 className="section-title">Bank and investments</h3>
          <label className="row small">
            Amount
            <input
              type="number"
              min={0}
              value={amount}
              data-testid="fin-amount"
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <div className="btn-row">
            <button
              data-testid="fin-deposit"
              onClick={() => run({ type: 'money', action: { op: 'deposit', amount: n } })}
            >
              Deposit
            </button>
            <button
              data-testid="fin-withdraw"
              onClick={() => run({ type: 'money', action: { op: 'withdraw', amount: n } })}
            >
              Withdraw
            </button>
            <button
              data-testid="fin-borrow"
              onClick={() => run({ type: 'money', action: { op: 'borrow', amount: n } })}
            >
              Borrow
            </button>
          </div>
          <p className="small muted">Savings rate {(m.savingsRate * 100).toFixed(1)}%</p>
          <table className="breakdown" data-testid="holdings">
            <tbody>
              {(Object.keys(INVESTMENTS) as Key[]).map((k) => (
                <tr key={k}>
                  <th scope="row">
                    <label className="row">
                      <input
                        type="radio"
                        name="fund"
                        checked={fund === k}
                        onChange={() => setFund(k)}
                        aria-label={INVESTMENTS[k].label}
                      />{' '}
                      {INVESTMENTS[k].label}
                    </label>
                  </th>
                  <td>{formatMoney(game, m.holdings[k])}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="btn-row">
            <button
              data-testid="fin-invest"
              onClick={() => run({ type: 'money', action: { op: 'invest', key: fund, amount: n } })}
            >
              Invest
            </button>
            <button
              data-testid="fin-sell"
              onClick={() => run({ type: 'money', action: { op: 'divest', key: fund, amount: n } })}
            >
              Sell
            </button>
          </div>
          {error && (
            <p className="error small" role="alert" data-testid="fin-error">
              {error}
            </p>
          )}
        </section>
      </div>
      <h3 className="section-title">Net worth (inflation-adjusted)</h3>
      <NetWorthChart history={m.history} />
    </Modal>
  );
}
