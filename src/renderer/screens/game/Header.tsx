import { countryOf, formatMoneyShort, formatMoney, type GameState } from '../../../engine';
import { Portrait } from '../../portrait/Portrait';
import { moodOf } from '../../portrait/parts';
import { go, persist, useApp, app } from '../../store/app';

export function Header({ game }: { game: GameState }): React.JSX.Element {
  const settings = useApp((s) => s.settings);
  const p = game.player;
  const c = countryOf(game);
  const fame = p.stats.fame;
  return (
    <header
      className="header"
      data-testid="header"
      data-gender={p.gender}
      data-attraction={p.attraction}
      data-wealth={p.wealth}
    >
      <span className="avatar-wrap">
        <Portrait
          className="avatar"
          look={p.look}
          age={p.age}
          gender={p.gender}
          dead={game.death !== null}
          size={52}
          happiness={p.stats.happiness}
          ill={p.stats.health < 30}
          testId="header-portrait"
        />
        <span
          className="mood-dot"
          data-testid="mood-dot"
          title={`Mood: ${moodOf(p.stats.happiness)}`}
          aria-hidden="true"
        >
          {MOOD_FACE[moodOf(p.stats.happiness)]}
        </span>
      </span>
      <div className="who">
        <div className="name" data-testid="player-name">
          {p.first} {p.last}
        </div>
        <div className="sub muted">
          <span data-testid="header-age">Age {p.age}</span>
          <span aria-hidden="true"> · </span>
          <span data-testid="header-place">
            <span aria-hidden="true">{c.flag}</span> {p.city}, {c.name}
          </span>
          <span aria-hidden="true"> · </span>
          <span data-testid="header-year">{game.year}</span>
        </div>
      </div>
      <div className="header-badges">
        {fame > 0 && (
          <span className="badge fame" data-testid="fame-badge" title={`Fame ${fame}/100`}>
            🌟 {fame}
          </span>
        )}
        {game.cheats.used && settings.cheatBadge && (
          <span className="badge cheat" data-testid="cheat-badge" title="This life has used cheats">
            🎩 Cheated
          </span>
        )}
      </div>
      <div
        className="cash"
        data-testid="header-cash"
        title={`Cash in hand: ${formatMoney(game, game.money.cash)}`}
      >
        <span className="muted small">Cash · {c.currency.code}</span>{' '}
        {formatMoneyShort(game, game.money.cash)}
      </div>
      <nav className="header-actions" aria-label="Game menu">
        <button
          className="ghost"
          data-testid="btn-timeline"
          aria-label="Milestones"
          title="Milestones"
          onClick={() => app.set({ overlay: 'timeline' })}
        >
          📅
        </button>
        <button
          className="ghost"
          data-testid="btn-dynasty"
          aria-label="Dynasty"
          title="Dynasty"
          onClick={() => app.set({ overlay: 'dynasty' })}
        >
          👑
        </button>
        <button
          className="ghost"
          data-testid="btn-achievements"
          aria-label="Achievements"
          title="Achievements"
          onClick={() => app.set({ overlay: 'achievements' })}
        >
          🏆
        </button>
        <button
          className="ghost"
          data-testid="btn-save"
          aria-label="Save"
          title="Save (⌘S)"
          onClick={() => void persist(game)}
        >
          💾
        </button>
        <button
          className="ghost"
          data-testid="btn-lives"
          aria-label="Lives"
          title="Lives (⌘L)"
          onClick={() => go('lives')}
        >
          🗂️
        </button>
        <button
          className="ghost"
          data-testid="btn-settings"
          aria-label="Settings"
          title="Settings (⌘,)"
          onClick={() => go('settings')}
        >
          ⚙️
        </button>
        <button
          className="ghost"
          data-testid="btn-help"
          aria-label="Help"
          title="Help (?)"
          onClick={() => app.set({ overlay: 'help' })}
        >
          ❓
        </button>
      </nav>
    </header>
  );
}

const MOOD_FACE = { glad: '😄', fine: '🙂', low: '😕', sad: '😢' } as const;
