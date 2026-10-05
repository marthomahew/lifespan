import { useState } from 'react';
import { ASPIRATIONS } from '../../content/aspirations';
import type { GameState } from '../../engine';
import { aspirationReason } from '../../engine/systems/aspirations';
import { Modal } from '../components/Modal';
import { app, doAct } from '../store/app';
import { cap } from '../components/text';

/** Pick a life goal; ones you can't pick say why. */
export function GoalPicker({ game }: { game: GameState }): React.JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const close = (): void => app.set({ overlay: null });
  return (
    <Modal title="Choose a life goal" testId="goal-picker" onClose={close} wide>
      <p className="muted small">
        Up to three at a time. Reaching one is a good day; you can let one go whenever you like.
      </p>
      <ul className="activity-list goal-list">
        {ASPIRATIONS.map((a) => {
          const why = aspirationReason(game, a.id);
          return (
            <li key={a.id}>
              <button
                className="activity"
                data-testid={`pick-goal-${a.id}`}
                disabled={why !== null}
                onClick={() => {
                  const err = doAct({ type: 'aspiration', op: 'choose', id: a.id });
                  if (err) setError(err);
                  else close();
                }}
              >
                <span className="activity-emoji" aria-hidden="true">
                  {a.emoji}
                </span>
                <span className="grow">
                  <span className="activity-label">{a.label}</span>
                  <span className="activity-desc muted small">
                    {why ? cap(why) : a.description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {error && (
        <p className="error small" role="alert" data-testid="goal-error">
          {error}
        </p>
      )}
    </Modal>
  );
}
