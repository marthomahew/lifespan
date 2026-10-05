import { currentPopup, type GameState } from '../../../engine';
import { continueResult, doChoose, useApp } from '../../store/app';
import type { ChoiceResult } from '../../store/result';
import { Modal } from '../../components/Modal';

/** The event popup: emoji, text and numbered choices. Keys 1–4 choose. Then the result card. */
export function EventModal({ game }: { game: GameState }): React.JSX.Element | null {
  const result = useApp((s) => s.result);
  const popup = currentPopup(game);
  if (result) return <ResultCard result={result} more={game.pending.length} />;
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

/** What your choice did: the outcome, what changed, and one key to carry on. */
function ResultCard({ result, more }: { result: ChoiceResult; more: number }): React.JSX.Element {
  return (
    <Modal title="What happened" testId="event-modal" hideTitle>
      <div className="event result" data-testid="event-result">
        <div className="event-emoji" aria-hidden="true">
          {result.emoji}
        </div>
        {result.chose && (
          <p className="result-chose" data-testid="result-chose">
            You chose: <strong>{result.chose}</strong>
          </p>
        )}
        <p className="event-text" data-testid="result-text">
          {result.text}
        </p>
        {result.because && (
          <p className="result-because" data-testid="result-because">
            {result.because}
          </p>
        )}
        {result.changes.length > 0 && (
          <ul className="result-changes" data-testid="result-changes">
            {result.changes.map((c) => (
              <li key={c.label} className={c.good ? 'up' : 'down'}>
                {c.label} <strong>{c.value}</strong>
              </li>
            ))}
          </ul>
        )}
        {result.also.map((line) => (
          <p key={line} className="result-also small">
            {line}
          </p>
        ))}
        <div className="choices">
          <button
            className="choice primary-choice"
            data-testid="result-continue"
            onClick={continueResult}
          >
            <span className="choice-num" aria-hidden="true">
              ↵
            </span>
            {more > 0 ? `Continue (${more} more this year)` : 'Continue'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
