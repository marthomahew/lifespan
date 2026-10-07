import { useState } from 'react';
import { POSSESSIONS, VEHICLES, onSale, productName } from '../../../../content/assets';
import { formatMoney, money, type GameState, type PlayerAction } from '../../../../engine';
import { mortgageQuote, type Financing } from '../../../../engine/systems/assets';
import { annuityPayment } from '../../../../engine/systems/loans';
import { Modal } from '../../../components/Modal';
import { doAct } from '../../../store/app';

export type BuyTarget = { kind: 'home'; index: number } | { kind: 'vehicle' } | { kind: 'item' };

const pct = (x: number): string => `${(x * 100).toFixed(1)}%`;

/** The buy form (SPEC §6): what it costs now, what it costs each year, then confirm. */
export function BuyDialog({
  game,
  target,
  onClose,
}: {
  game: GameState;
  target: BuyTarget;
  onClose: () => void;
}): React.JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const buy = (a: PlayerAction): void => {
    const err = doAct(a);
    if (err) setError(err);
    else onClose();
  };
  const title =
    target.kind === 'home'
      ? 'Buy a home'
      : target.kind === 'vehicle'
        ? 'Buy a vehicle'
        : 'Buy something';
  return (
    <Modal title={title} testId="buy-dialog" onClose={onClose}>
      {target.kind === 'home' && <HomeForm game={game} index={target.index} onBuy={buy} />}
      {target.kind === 'vehicle' && <VehicleForm game={game} onBuy={buy} />}
      {target.kind === 'item' && <ItemForm game={game} onBuy={buy} />}
      {error && (
        <p className="error small" role="alert" data-testid="buy-error">
          {error}
        </p>
      )}
    </Modal>
  );
}

type FormProps = { game: GameState; onBuy: (a: PlayerAction) => void };

function HomeForm({ game, index, onBuy }: FormProps & { index: number }): React.JSX.Element {
  const l = game.assets.listings[index];
  const [how, setHow] = useState<'cash' | 'mortgage'>('mortgage');
  const [years, setYears] = useState<15 | 30>(30);
  const [downPct, setDownPct] = useState(10);
  if (!l) return <p className="muted">That listing is gone.</p>;
  const financing: Financing =
    how === 'cash' ? { kind: 'cash' } : { kind: 'mortgage', years, down: downPct / 100 };
  const q = mortgageQuote(game, l.price, financing);
  return (
    <form
      className="buy-form"
      onSubmit={(e) => {
        e.preventDefault();
        onBuy({ type: 'buy_home', index, financing });
      }}
    >
      <p>
        <strong>{l.name.charAt(0).toUpperCase() + l.name.slice(1)}</strong>
        <span className="muted">
          {' '}
          · {formatMoney(game, l.price)} · condition {l.condition}
        </span>
      </p>
      <label>
        Pay with
        <select
          data-testid="buy-how"
          value={how}
          onChange={(e) => setHow(e.target.value as 'cash' | 'mortgage')}
        >
          <option value="mortgage">A mortgage</option>
          <option value="cash">Cash</option>
        </select>
      </label>
      {how === 'mortgage' && (
        <>
          <label>
            Term
            <select
              data-testid="buy-term"
              value={years}
              onChange={(e) => setYears(Number(e.target.value) === 15 ? 15 : 30)}
            >
              <option value={30}>30 years</option>
              <option value={15}>15 years</option>
            </select>
          </label>
          <label>
            Deposit: {downPct}%
            <input
              data-testid="buy-down"
              type="range"
              min={5}
              max={50}
              step={5}
              value={downPct}
              onChange={(e) => setDownPct(Number(e.target.value))}
            />
          </label>
        </>
      )}
      <table className="breakdown" data-testid="buy-quote">
        <tbody>
          <tr>
            <th>Pay now</th>
            <td>{formatMoney(game, q.down)}</td>
          </tr>
          {how === 'mortgage' && (
            <>
              <tr>
                <th>Borrowed</th>
                <td>{formatMoney(game, q.principal)}</td>
              </tr>
              <tr>
                <th>Interest rate</th>
                <td>{pct(q.rate)}</td>
              </tr>
              <tr>
                <th>Each year</th>
                <td data-testid="buy-yearly">{formatMoney(game, q.yearly)}</td>
              </tr>
              <tr className="total">
                <th>Total paid</th>
                <td>{formatMoney(game, q.down + q.yearly * years)}</td>
              </tr>
            </>
          )}
          <tr>
            <th>Cash you have</th>
            <td>{formatMoney(game, game.money.cash)}</td>
          </tr>
        </tbody>
      </table>
      {q.problem && (
        <p className="error small" role="alert" data-testid="buy-problem">
          {q.problem.charAt(0).toUpperCase() + q.problem.slice(1)}.
        </p>
      )}
      <button
        className="primary"
        type="submit"
        data-testid="buy-confirm"
        disabled={q.problem !== null && !(game.cheats.forceSuccess && /income/.test(q.problem))}
      >
        Buy it
      </button>
    </form>
  );
}

function VehicleForm({ game, onBuy }: FormProps): React.JSX.Element {
  const forSale = VEHICLES.filter((x) => onSale(x, game.year));
  const [model, setModel] = useState(forSale[0]?.id ?? '');
  const [financed, setFinanced] = useState(false);
  const v = VEHICLES.find((x) => x.id === model);
  const price = v ? money(game, v.price) : 0;
  const deposit = Math.round(price * 0.1);
  const yearly = Math.round(annuityPayment(price - deposit, 0.08, 5));
  const adult = game.player.age >= 18;
  return (
    <form
      className="buy-form"
      onSubmit={(e) => {
        e.preventDefault();
        onBuy({ type: 'buy_vehicle', model, financed: adult && financed });
      }}
    >
      {!game.assets.licence && (
        <p className="muted small" data-testid="no-licence-note">
          You have no driving licence yet: you can own it, but someone else will be doing the
          driving. The driving test is under Activities.
        </p>
      )}
      <label>
        Model
        <select
          data-testid="vehicle-model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          {forSale.map((x) => (
            <option key={x.id} value={x.id}>
              {x.emoji} {productName(x, game.year)}
              {productName(x, game.year) !== x.label ? ` (${x.label.toLowerCase()})` : ''} ·{' '}
              {formatMoney(game, money(game, x.price))}
            </option>
          ))}
        </select>
      </label>
      {v && <p className="muted small">{v.description}</p>}
      {v?.perks && (
        <p className="small" data-testid="buy-perks">
          {perkText(v.perks)}
        </p>
      )}
      {adult && (
        <label className="check">
          <input
            type="checkbox"
            data-testid="buy-finance"
            checked={financed}
            onChange={(e) => setFinanced(e.target.checked)}
          />{' '}
          Finance it: {formatMoney(game, deposit)} now, then {formatMoney(game, yearly)} a year for
          5 years at 8%
        </label>
      )}
      <p className="small">
        Pay now: <strong>{formatMoney(game, adult && financed ? deposit : price)}</strong> · you
        have {formatMoney(game, game.money.cash)}
      </p>
      <button className="primary" type="submit" data-testid="buy-confirm">
        Buy it
      </button>
    </form>
  );
}

function ItemForm({ game, onBuy }: FormProps): React.JSX.Element {
  const forSale = POSSESSIONS.filter((x) => onSale(x, game.year));
  const [item, setItem] = useState(forSale[0]?.id ?? '');
  const p = POSSESSIONS.find((x) => x.id === item);
  return (
    <form
      className="buy-form"
      onSubmit={(e) => {
        e.preventDefault();
        onBuy({ type: 'buy_item', item });
      }}
    >
      <label>
        Item
        <select data-testid="item-select" value={item} onChange={(e) => setItem(e.target.value)}>
          {forSale.map((x) => (
            <option key={x.id} value={x.id}>
              {x.emoji} {productName(x, game.year)}
              {productName(x, game.year) !== x.label ? ` (${x.label.toLowerCase()})` : ''} ·{' '}
              {formatMoney(game, money(game, x.price))}
            </option>
          ))}
        </select>
      </label>
      {p && <p className="muted small">{p.description}</p>}
      {p?.perks && (
        <p className="small" data-testid="buy-perks">
          {perkText(p.perks)}
        </p>
      )}
      <p className="small">You have {formatMoney(game, game.money.cash)}.</p>
      <button className="primary" type="submit" data-testid="buy-confirm">
        Buy it
      </button>
    </form>
  );
}

const PERK_LABEL: Record<string, string> = {
  romance: 'romance',
  social: 'social life',
  work: 'work',
  athletic: 'sport',
  money: 'money',
  study: 'study',
  creative: 'creative work',
  crime: 'crime',
};
/** "While you own it: romance +6%, social life +3%." */
function perkText(perks: Partial<Record<string, number>>): string {
  const parts = Object.entries(perks)
    .filter(([, v]) => v)
    .map(([k, v]) => `${PERK_LABEL[k] ?? k} +${Math.round((v ?? 0) * 100)}%`);
  return `While you own one: ${parts.join(', ')} odds.`;
}
