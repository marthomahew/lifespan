import { ACHIEVEMENTS } from '../../content/achievements';
import type { GameState } from '../../engine';
import { Modal } from '../components/Modal';
import { app } from '../store/app';

/** Every achievement, earned or not (SPEC §5.14). */
export function AchievementsView({ game }: { game: GameState }): React.JSX.Element {
  const earned = new Set(game.player.achievements);
  return (
    <Modal
      title={`Achievements · ${earned.size} of ${ACHIEVEMENTS.length}`}
      testId="achievements"
      onClose={() => app.set({ overlay: null })}
      wide
    >
      <ul className="achievement-grid" data-testid="achievement-list">
        {ACHIEVEMENTS.map((a) => (
          <li
            key={a.id}
            className={`ach-item${earned.has(a.id) ? ' earned' : ''}`}
            data-testid={`ach-${a.id}`}
            data-earned={earned.has(a.id)}
          >
            <span className="ach-emoji" aria-hidden="true">
              {earned.has(a.id) ? a.emoji : '🔒'}
            </span>
            <span>
              <strong>{a.label}</strong>
              <span className="muted small ach-desc">{a.description}</span>
            </span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
