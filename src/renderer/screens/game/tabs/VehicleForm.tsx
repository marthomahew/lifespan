import { useState } from 'react';
import { VEHICLES, productName } from '../../../../content/assets';
import { VEHICLE_CATEGORIES } from '../../../../content/vehicles';
import { formatMoney, money } from '../../../../engine';
import { vehicleOffer } from '../../../../engine/systems/assets';
import { annuityPayment } from '../../../../engine/systems/loans';
import { perkText, type FormProps } from './BuyDialog';

/** The car showroom: a category, a model, new or used, cash or finance. */
export function VehicleForm({ game, onBuy }: FormProps): React.JSX.Element {
  const available = (cat: string) =>
    VEHICLES.filter((x) => x.category === cat).filter((x) => {
      const o = vehicleOffer(x, game.year);
      return o.fresh !== null || o.used !== null;
    });
  const cats = VEHICLE_CATEGORIES.filter((c) => available(c.id).length > 0);
  const [cat, setCat] = useState(cats[0]?.id ?? 'economy');
  const models = available(cat).sort((a, b) => a.price - b.price);
  const [model, setModel] = useState(models[0]?.id ?? '');
  const v = models.find((x) => x.id === model) ?? models[0];
  const offer = v ? vehicleOffer(v, game.year) : { fresh: null, used: null };
  const [wantUsed, setUsed] = useState(false);
  const used = offer.fresh === null || (wantUsed && offer.used !== null);
  const ref = used ? offer.used : offer.fresh;
  const price = ref ? money(game, ref) : 0;
  const [financed, setFinanced] = useState(false);
  const deposit = Math.round(price * 0.1);
  const yearly = Math.round(annuityPayment(price - deposit, 0.08, 5));
  const adult = game.player.age >= 18;
  const tag = (x: (typeof models)[number]): string => {
    const o = vehicleOffer(x, game.year);
    const p = o.fresh ?? o.used ?? 0;
    return `${x.emoji} ${productName(x, game.year)} · ${formatMoney(game, money(game, p))}${o.fresh === null ? ' (used)' : ''}`;
  };
  return (
    <form
      className="buy-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (v) onBuy({ type: 'buy_vehicle', model: v.id, financed: adult && financed, used });
      }}
    >
      {!game.assets.licence && (
        <p className="muted small" data-testid="no-licence-note">
          You have no driving licence yet: you can own it, but someone else will be doing the
          driving. The driving test is under Activities.
        </p>
      )}
      <label>
        Category
        <select
          data-testid="vehicle-category"
          value={cat}
          onChange={(e) => {
            setCat(e.target.value as typeof cat);
            setModel('');
            setUsed(false);
          }}
        >
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Model
        <select
          data-testid="vehicle-model"
          value={v?.id ?? ''}
          onChange={(e) => {
            setModel(e.target.value);
            setUsed(false);
          }}
        >
          {models.map((x) => (
            <option key={x.id} value={x.id}>
              {tag(x)}
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
      {offer.fresh !== null && offer.used !== null && (
        <label className="check">
          <input
            type="checkbox"
            data-testid="buy-used"
            checked={wantUsed}
            onChange={(e) => setUsed(e.target.checked)}
          />{' '}
          Buy used: {formatMoney(game, money(game, offer.used))}, with some miles on it
        </label>
      )}
      {v?.collectible && offer.fresh === null && (
        <p className="small" data-testid="collector-note">
          A collector’s car: out of production, and it gains value every year you keep it.
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
