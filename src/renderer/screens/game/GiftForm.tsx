import { useState } from 'react';
import { formatMoney, money, type GameState } from '../../../engine';
import { PRESENT_REF, type GiftParams } from '../../../engine/systems/gifts';
import { POSSESSION_BY_ID } from '../../../content/assets';

/** What to give: a small present, an amount of money, or something you own (SPEC §5.1). */
export function GiftForm({
  game,
  onGive,
}: {
  game: GameState;
  onGive: (g: GiftParams | undefined) => void;
}): React.JSX.Element {
  const [kind, setKind] = useState('present');
  const [amount, setAmount] = useState(String(money(game, 500)));
  return (
    <form
      className="card pad wedding"
      data-testid="gift-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (kind === 'money') onGive({ money: Number(amount) });
        else if (kind.startsWith('item:')) onGive({ possessionId: Number(kind.slice(5)) });
        else onGive(undefined);
      }}
    >
      <label>
        Gift
        <select data-testid="gift-kind" value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="present">
            A small present · {formatMoney(game, money(game, PRESENT_REF))}
          </option>
          <option value="money">Money</option>
          {game.assets.possessions.map((p) => (
            <option key={p.id} value={`item:${p.id}`}>
              {POSSESSION_BY_ID[p.item]?.emoji} {POSSESSION_BY_ID[p.item]?.label ?? p.item} ·{' '}
              {formatMoney(game, p.value)}
            </option>
          ))}
        </select>
      </label>
      {kind === 'money' && (
        <label>
          Amount
          <input
            data-testid="gift-amount"
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
      )}
      <button className="primary" type="submit" data-testid="gift-go">
        Give it
      </button>
    </form>
  );
}
