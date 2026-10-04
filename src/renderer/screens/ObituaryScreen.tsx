import { formatMoney, obituary, type GameState } from '../../engine';
import { refToLocal } from '../../engine/economy';
import { go, useApp } from '../store/app';
import { ContinueAsChild } from './ContinueAsChild';

export function ObituaryScreen({ game }: { game: GameState }): React.JSX.Element {
  const settings = useApp((s) => s.settings);
  const ob = obituary(game);
  if (!ob) return <div />;
  return (
    <div className="screen obituary" data-testid="obituary-screen">
      <article className="card pad obit-card">
        <div className="obit-emoji" aria-hidden="true">
          🕯️
        </div>
        <h1 data-testid="obit-name">{ob.name}</h1>
        <p className="muted">
          {ob.born} – {ob.died} · aged {ob.age}
        </p>
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
        <dl className="kv obit-stats">
          <dt>Happiness</dt>
          <dd>{ob.stats.happiness}</dd>
          <dt>Health</dt>
          <dd>{ob.stats.health}</dd>
          <dt>Smarts</dt>
          <dd>{ob.stats.smarts}</dd>
          <dt>Looks</dt>
          <dd>{ob.stats.looks}</dd>
          <dt>Net worth</dt>
          <dd data-testid="obit-networth">{formatMoney(game, refToLocal(game, ob.netWorthRef))}</dd>
        </dl>
        {ob.survivors.length > 0 && <p className="muted">Survived by {ob.survivors.join(', ')}.</p>}
        {ob.cheated && settings.cheatBadge && (
          <p className="cheat-note" data-testid="obit-cheated">
            🃏 This life was lived with a little help from the cheat menu.
          </p>
        )}
        <ContinueAsChild game={game} />
        <div className="row center-row">
          <button className="primary" data-testid="btn-obit-new-life" onClick={() => go('new')}>
            New Life
          </button>
          <button data-testid="btn-obit-lives" onClick={() => go('lives')}>
            Lives
          </button>
        </div>
      </article>
    </div>
  );
}
