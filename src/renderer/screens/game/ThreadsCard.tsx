import type { GameState } from '../../../engine';
import { openThreads } from '../../../engine/threads';

/** Open storylines: what's in progress, so the long arc stays visible. */
export function ThreadsCard({ game }: { game: GameState }): React.JSX.Element | null {
  const threads = openThreads(game);
  if (!threads.length) return null;
  return (
    <section className="card pad threads" aria-label="Threads" data-testid="threads">
      <h3 className="section-title">Threads</h3>
      <ul className="plain">
        {threads.map((t) => (
          <li key={t.id} className="thread" data-testid={`thread-${t.id}`}>
            <span aria-hidden="true">{t.icon}</span>
            <span className="grow">
              <span className="thread-label">{t.label}</span>
              <span className="muted small"> {t.detail}</span>
              {t.progress !== undefined && (
                <span className="mini-bar thread-bar">
                  <span className="bar-fill" style={{ width: `${t.progress}%` }} />
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
