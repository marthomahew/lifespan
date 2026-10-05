import { CHALLENGES } from '../../content/challenges';
import type { NewLifeOptions } from '../../engine';
import { challengeOptions } from '../../engine/systems/challenge';
import { Modal } from '../components/Modal';
import { startLife } from '../store/app';
import { loadCompleted } from '../store/challenges';

/** Lives with a premise and a goal. Your choices on the New Life page fill in the rest. */
export function ChallengePicker({
  own,
  seed,
  onClose,
}: {
  own: NewLifeOptions;
  seed?: number;
  onClose: () => void;
}): React.JSX.Element {
  const done = loadCompleted();
  return (
    <Modal title="Challenges" testId="challenge-picker" onClose={onClose} wide>
      <p className="muted small">
        Each challenge fixes how the life begins and sets a goal. Anything it leaves open comes from
        the page you were on. {done.length} of {CHALLENGES.length} completed.
      </p>
      <ul className="challenge-list">
        {CHALLENGES.map((c) => (
          <li key={c.id}>
            <button
              className={`challenge${done.includes(c.id) ? ' done' : ''}`}
              data-testid={`challenge-${c.id}`}
              onClick={() => startLife(challengeOptions(c.id, own), seed)}
            >
              <span className="challenge-emoji" aria-hidden="true">
                {c.emoji}
              </span>
              <span className="grow">
                <span className="challenge-title">
                  {c.title} {done.includes(c.id) && <span aria-label="completed">✅</span>}
                </span>
                <span className="muted small challenge-premise">{c.premise}</span>
                <span className="small challenge-goal">🎯 {c.goal}</span>
              </span>
              <span className="challenge-stars" aria-label={`Difficulty ${c.difficulty} of 3`}>
                {'★'.repeat(c.difficulty)}
                <span className="muted">{'★'.repeat(3 - c.difficulty)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
