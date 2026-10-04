import { currentPopup, type GameState } from '../../../engine';
import { doChoose } from '../../store/app';
import { Modal } from '../../components/Modal';

/** The event popup: emoji, text and numbered choices. Keys 1–4 choose. */
export function EventModal({ game }: { game: GameState }): React.JSX.Element | null {
  const popup = currentPopup(game);
  if (!popup) return null;
  return (
    <Modal title="Something happens" testId="event-modal" hideTitle>
      <div className="event" data-event-id={popup.eventId}>
        <div className="event-emoji" aria-hidden="true">
          {popup.emoji}
        </div>
        <p className="event-text" data-testid="event-text">
          {popup.text}
        </p>
        <div className="choices">
          {popup.choices.map((c, i) => (
            <button
              key={c.id}
              className="choice"
              data-testid={`choice-${i + 1}`}
              data-choice-id={c.id}
              disabled={!c.enabled}
              onClick={() => doChoose(c.id)}
            >
              <span className="choice-num" aria-hidden="true">
                {i + 1}
              </span>
              {c.label}
            </button>
          ))}
        </div>
        {game.pending.length > 1 && (
          <p className="muted small">{game.pending.length - 1} more this year</p>
        )}
      </div>
    </Modal>
  );
}
