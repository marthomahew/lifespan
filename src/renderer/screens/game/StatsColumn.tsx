import { generationOf } from '../../../content/history/norms';
import {
  netWorth,
  formatMoney,
  STAGE_LABEL,
  stageOf,
  traitModifiers,
  type GameState,
  knownForLine,
} from '../../../engine';
import { TRAIT_BY_ID } from '../../../content/traits';
import { StatBar } from '../../components/StatBar';
import { quickFacts } from './facts';
import { SkillsCard } from './SkillsCard';
import { PeopleCard } from './PeopleCard';
import { useApp } from '../../store/app';
import { HIDDEN_STATS, VICES } from '../../../engine';
import { AspirationsCard } from './AspirationsCard';
import { ThreadsCard } from './ThreadsCard';

const STATS = [
  { id: 'happiness', label: 'Happiness', emoji: '😊' },
  { id: 'health', label: 'Health', emoji: '❤️' },
  { id: 'smarts', label: 'Smarts', emoji: '🧠' },
  { id: 'looks', label: 'Looks', emoji: '✨' },
] as const;

export function StatsColumn({ game }: { game: GameState }): React.JSX.Element {
  const p = game.player;
  const facts = quickFacts(game);
  const hidden = useApp((x) => x.hiddenStats);
  const yearStart = useApp((x) => x.yearStart);
  const since = yearStart && yearStart.lifeId === game.lifeId ? yearStart.player.stats : null;
  return (
    <aside className="stats-col" aria-label="Stats" data-testid="stats-col">
      <section className="card pad">
        {STATS.map((s) => (
          <StatBar
            key={s.id}
            id={s.id}
            label={s.label}
            emoji={s.emoji}
            value={p.stats[s.id]}
            history={game.statHistory[s.id]}
            {...(since ? { delta: p.stats[s.id] - since[s.id] } : {})}
          />
        ))}
      </section>
      {hidden && (
        <section className="card pad" aria-label="Hidden stats" data-testid="hidden-stats">
          <h3 className="section-title">Hidden stats</h3>
          <div className="hidden-stats">
            {HIDDEN_STATS.map((k) => (
              <span key={k} className="contents">
                <span>{k}</span>
                <span data-testid={`hidden-${k}`}>{p.stats[k]}</span>
              </span>
            ))}
            {VICES.map((v) => (
              <span key={v} className="contents">
                <span className="muted">{v.replace('_', ' ')}</span>
                <span>{game.vices.levels[v]}</span>
              </span>
            ))}
          </div>
        </section>
      )}
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
      <PeopleCard game={game} />
      <SkillsCard game={game} />
      <ThreadsCard game={game} />
      <AspirationsCard game={game} />
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
        <div data-testid="fact-generation">
          <span className="muted">Born</span> {p.birthYear}, {generationOf(p.birthYear)}
        </div>
        <div data-testid="fact-networth">
          <span className="muted">Net worth</span> {formatMoney(game, netWorth(game))}
        </div>
        {p.stats.fame >= 10 && (
          <div data-testid="fact-fame">
            <span className="muted">Fame</span> {p.stats.fame}{' '}
            <span className="muted small">{knownForLine(game)}</span>
          </div>
        )}
      </section>
    </aside>
  );
}
