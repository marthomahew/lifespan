import { useState } from 'react';
import { PET_BY_ID } from '../../../content/pets';
import { formatMoney, type GameState } from '../../../engine';
import { petActionReason, vetCost, type PetActionId } from '../../../engine/systems/pets';
import { Modal } from '../../components/Modal';
import { barColour } from '../../components/StatBar';
import { app, doAct } from '../../store/app';

const ACTIONS: { id: PetActionId; label: string }[] = [
  { id: 'play', label: 'Play' },
  { id: 'walk', label: 'Go for a walk' },
  { id: 'vet', label: 'Visit the vet' },
];

/** One animal: how they are, and what you can do together. */
export function PetPanel({
  game,
  petId,
}: {
  game: GameState;
  petId: number;
}): React.JSX.Element | null {
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [openedAt] = useState(game.log.length);
  const pet = game.pets.find((p) => p.id === petId);
  if (!pet) return null;
  const def = PET_BY_ID[pet.kind];
  const close = (): void => app.set({ petId: null });
  const run = (id: PetActionId): void => setError(doAct({ type: 'pet', petId: pet.id, id }));
  // Only what happened while this panel was open.
  const lastLog = game.log.length > openedAt ? game.log.at(-1) : undefined;
  return (
    <Modal title={pet.name} testId="pet-panel" onClose={close}>
      <div className="pet-panel">
        <div className="pet-head">
          <span className="pet-emoji" aria-hidden="true">
            {def?.emoji ?? '🐾'}
          </span>
          <div className="grow">
            <div className="muted">
              {def?.label ?? pet.kind} ·{' '}
              {pet.alive ? `age ${pet.age}` : `${pet.fate ?? 'gone'} in ${pet.endYear ?? ''}`}
            </div>
            <div className="muted small">With you since {pet.adoptedYear}</div>
          </div>
        </div>
        {pet.alive && (
          <>
            <Meter label="Bond" value={pet.bond} testId="pet-bond" />
            <Meter label="Health" value={pet.health} testId="pet-health" />
            <div className="row wrap">
              {ACTIONS.filter((a) => a.id !== 'walk' || def?.walks).map((a) => {
                const why = petActionReason(game, pet, a.id);
                return (
                  <button
                    key={a.id}
                    data-testid={`pet-act-${a.id}`}
                    disabled={why !== null}
                    title={why ?? undefined}
                    onClick={() => run(a.id)}
                  >
                    {a.label}
                    {a.id === 'vet' && game.player.age >= 18 && (
                      <span className="muted small"> {formatMoney(game, vetCost(game, pet))}</span>
                    )}
                  </button>
                );
              })}
              {confirm ? (
                <button
                  className="danger"
                  data-testid="pet-rehome-yes"
                  onClick={() => run('rehome')}
                >
                  Yes, find them a new home
                </button>
              ) : (
                <button
                  className="quiet-danger"
                  data-testid="pet-act-rehome"
                  onClick={() => setConfirm(true)}
                >
                  Rehome…
                </button>
              )}
            </div>
          </>
        )}
        {error && (
          <p className="error small" role="alert">
            {error}
          </p>
        )}
        {lastLog && (
          <p className="pet-last small" data-testid="pet-last">
            {lastLog.text}
          </p>
        )}
      </div>
    </Modal>
  );
}

function Meter({
  label,
  value,
  testId,
}: {
  label: string;
  value: number;
  testId: string;
}): React.JSX.Element {
  return (
    <div className="pet-meter">
      <span className="small">{label}</span>
      <span
        className="mini-bar wide"
        aria-label={`${label} ${value}`}
        data-testid={testId}
        data-value={value}
      >
        <span className={`bar-fill ${barColour(value)}`} style={{ width: `${value}%` }} />
      </span>
      <span className="muted small">{value}</span>
    </div>
  );
}
