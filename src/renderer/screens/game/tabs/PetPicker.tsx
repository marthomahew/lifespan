import { useState } from 'react';
import { PET_BY_ID, PET_KINDS } from '../../../../content/pets';
import { cap } from '../../../components/text';
import { formatMoney, type GameState } from '../../../../engine';
import { refToLocal } from '../../../../engine/economy';
import { adoptReason } from '../../../../engine/systems/pets';

/** Choose an animal and a name. */
export function PetPicker({
  game,
  onRun,
}: {
  game: GameState;
  onRun: (params: Record<string, string>) => void;
}): React.JSX.Element {
  const first = PET_KINDS.find((k) => adoptReason(game, k.id) === null)?.id ?? 'cat';
  const [kind, setKind] = useState(first);
  const [name, setName] = useState('');
  const child = game.player.age < 18;
  const def = PET_BY_ID[kind];
  return (
    <form
      className="pet-picker"
      onSubmit={(e) => {
        e.preventDefault();
        onRun({ kind, name: name.trim() });
      }}
    >
      <div className="pet-tiles" role="group" aria-label="Animal">
        {PET_KINDS.map((k) => {
          const why = adoptReason(game, k.id);
          return (
            <button
              type="button"
              key={k.id}
              className={`pet-tile${kind === k.id ? ' active' : ''}`}
              data-testid={`opt-pet-${k.id}`}
              aria-pressed={kind === k.id}
              disabled={why !== null}
              title={why ?? k.blurb}
              onClick={() => setKind(k.id)}
            >
              <span className="pet-tile-emoji" aria-hidden="true">
                {k.emoji}
              </span>
              <span>{k.label}</span>
              <span className="muted small">
                {child ? 'Parents pay' : formatMoney(game, refToLocal(game, k.adoptCost))}
              </span>
            </button>
          );
        })}
      </div>
      {def && (
        <p className="pet-detail" data-testid="pet-detail">
          {adoptReason(game, def.id) ? (
            <span className="error">{cap(adoptReason(game, def.id) ?? '')}</span>
          ) : (
            def.blurb
          )}
          <span className="muted small">
            {' '}
            Lives about {def.lifespan[0]} years
            {child
              ? ''
              : `, and costs ${formatMoney(game, refToLocal(game, def.upkeep))} a year to keep`}
            .
          </span>
        </p>
      )}
      <label>
        Name <span className="muted small">(leave empty and the shelter's name stays)</span>
        <input
          data-testid="opt-pet-name"
          value={name}
          maxLength={30}
          placeholder="Their name"
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <button
        className="primary"
        type="submit"
        data-testid="opt-pet-go"
        disabled={adoptReason(game, kind) !== null}
      >
        Bring them home
      </button>
    </form>
  );
}
