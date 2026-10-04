import {
  netWorth,
  formatMoney,
  STAGE_LABEL,
  stageOf,
  traitModifiers,
  type GameState,
} from '../../../engine';
import { TRAIT_BY_ID } from '../../../content/traits';
import { StatBar } from '../../components/StatBar';
import { quickFacts } from './facts';

const STATS = [
  { id: 'happiness', label: 'Happiness', emoji: '😊' },
  { id: 'health', label: 'Health', emoji: '❤️' },
  { id: 'smarts', label: 'Smarts', emoji: '🧠' },
  { id: 'looks', label: 'Looks', emoji: '✨' },
] as const;

export function StatsColumn({ game }: { game: GameState }): React.JSX.Element {
  const p = game.player;
  const facts = quickFacts(game);
  return (
    <aside className="stats-col" aria-label="Stats">
      <section className="card pad">
        {STATS.map((s) => (
          <StatBar
            key={s.id}
            id={s.id}
            label={s.label}
            emoji={s.emoji}
            value={p.stats[s.id]}
            history={game.statHistory[s.id]}
          />
        ))}
      </section>
      <section className="card pad" aria-label="Traits">
        <h3 className="section-title">Traits</h3>
        <div className="chips" data-testid="traits">
          {p.traits.map((id) => {
            const t = TRAIT_BY_ID[id];
            if (!t) return null;
            const mods = traitModifiers(t);
            return (
              <span
                key={id}
                className="chip"
                tabIndex={0}
                data-testid={`trait-${id}`}
                aria-describedby={`tip-${id}`}
              >
                <span aria-hidden="true">{t.emoji}</span> {t.label}
                <span
                  className="tooltip"
                  role="tooltip"
                  id={`tip-${id}`}
                  data-testid={`trait-tip-${id}`}
                >
                  <strong>{t.label}</strong>
                  <span className="tip-desc">{t.description}</span>
                  {mods.map((m) => (
                    <span key={m} className="tip-mod">
                      {m}
                    </span>
                  ))}
                </span>
              </span>
            );
          })}
        </div>
      </section>
      <section className="card pad facts" aria-label="Quick facts" data-testid="quick-facts">
        <div>
          <span className="muted">Stage</span> {STAGE_LABEL[stageOf(p.age)]}
        </div>
        <div data-testid="fact-occupation">
          <span className="muted">Doing</span> {facts.occupation}
        </div>
        <div data-testid="fact-relationship">
          <span className="muted">Love</span> {facts.relationship}
        </div>
        <div data-testid="fact-networth">
          <span className="muted">Net worth</span> {formatMoney(game, netWorth(game))}
        </div>
      </section>
    </aside>
  );
}
