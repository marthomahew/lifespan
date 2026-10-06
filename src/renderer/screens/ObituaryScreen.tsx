import { formatMoney, obituary, type GameState } from '../../engine';
import { Portrait } from '../portrait/Portrait';
import { refToLocal } from '../../engine/economy';
import { app, go, useApp } from '../store/app';
import { ContinueAsChild } from './ContinueAsChild';
import { barColour } from '../components/StatBar';

export function ObituaryScreen({ game }: { game: GameState }): React.JSX.Element {
  const settings = useApp((s) => s.settings);
  const ob = obituary(game);
  if (!ob) return <div />;
  return (
    <div className="screen obituary" data-testid="obituary-screen">
      <article className="card pad obit-card">
        <Portrait
          className="obit-portrait"
          look={game.player.look}
          age={game.player.age}
          gender={game.player.gender}
          dead
          size={112}
          testId="obit-portrait"
        />
        <h1 data-testid="obit-name">{ob.name}</h1>
        <p className="muted">
          {ob.born} – {ob.died} · aged {ob.age}
        </p>
        <div className="obit-years" data-testid="obit-years" aria-label="Through the years">
          {[1, 10, 25, 50, 75]
            .filter((a) => a < game.player.age)
            .map((a) => (
              <figure key={a}>
                <Portrait look={game.player.look} age={a} gender={game.player.gender} size={44} />
                <figcaption className="muted small">{a}</figcaption>
              </figure>
            ))}
        </div>
        <h2 className="obit-title" data-testid="obit-title">
          “{ob.title}”
        </h2>
        <p data-testid="obit-cause">
          <strong>Cause of death:</strong> {ob.cause}
        </p>
        <ul className="obit-summary" data-testid="obit-summary">
          {ob.summary.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        <div className="obit-tiles" data-testid="obit-stats">
          {(
            [
              ['😊', 'Happiness', ob.stats.happiness],
              ['❤️', 'Health', ob.stats.health],
              ['🧠', 'Smarts', ob.stats.smarts],
              ['✨', 'Looks', ob.stats.looks],
            ] as const
          ).map(([icon, label, v]) => (
            <div key={label} className="obit-tile">
              <span className="obit-tile-label">
                {icon} {label}
              </span>
              <strong>{v}</strong>
              <span className="mini-bar">
                <span className={`bar-fill ${barColour(v)}`} style={{ width: `${v}%` }} />
              </span>
            </div>
          ))}
        </div>
        <p className="obit-networth">
          Net worth at the end:{' '}
          <strong data-testid="obit-networth">
            {formatMoney(game, refToLocal(game, ob.netWorthRef))}
          </strong>
        </p>
        {ob.survivors.length > 0 && <p className="muted">Survived by {ob.survivors.join(', ')}.</p>}
        {ob.cheated && settings.cheatBadge && (
          <p className="cheat-note" data-testid="obit-cheated">
            🎩 This life was lived with a little help from the cheat menu.
          </p>
        )}
        <ContinueAsChild game={game} />
        <div className="row center-row obit-actions">
          <button className="primary" data-testid="btn-obit-new-life" onClick={() => go('new')}>
            New Life
          </button>
          <button data-testid="btn-obit-lives" onClick={() => go('lives')}>
            Lives
          </button>
          <button data-testid="btn-obit-dynasty" onClick={() => app.set({ overlay: 'dynasty' })}>
            Dynasty
          </button>
          <button
            data-testid="btn-obit-achievements"
            onClick={() => app.set({ overlay: 'achievements' })}
          >
            Achievements
          </button>
        </div>
      </article>
    </div>
  );
}
