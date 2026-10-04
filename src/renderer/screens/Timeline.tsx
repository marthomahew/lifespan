import { categoryEmoji, type GameState } from '../../engine';
import { Modal } from '../components/Modal';
import { app } from '../store/app';

const EXTRA: Record<string, string> = {
  system: '📌',
  death: '🕯️',
  achievement: '🏆',
  activity: '🎯',
};

/** The milestones of a life, in order (SPEC §2 Information). */
export function Timeline({ game }: { game: GameState }): React.JSX.Element {
  const items = game.log.filter((l) => l.milestone);
  return (
    <Modal title="Milestones" testId="timeline" onClose={() => app.set({ overlay: null })} wide>
      <ol className="timeline" data-testid="timeline-list">
        {items.map((l, i) => (
          <li key={i} className="timeline-item" data-testid="timeline-item">
            <span className="timeline-when">
              <strong>{l.age}</strong>
              <span className="muted small">{l.year}</span>
            </span>
            <span aria-hidden="true">{EXTRA[l.cat] ?? categoryEmoji(l.cat)}</span>
            <span>{l.text}</span>
          </li>
        ))}
      </ol>
      {!items.length && <p className="muted">Nothing momentous yet.</p>}
    </Modal>
  );
}
