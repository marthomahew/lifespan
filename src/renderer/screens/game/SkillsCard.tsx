import { SKILL_BY_ID, LANGUAGE_BY_ID } from '../../../content/skills';
import { skillModifiers, type GameState } from '../../../engine';

/** Skills and languages above zero. */
export function SkillsCard({ game }: { game: GameState }): React.JSX.Element | null {
  const skills = Object.entries(game.player.skills).filter(([, v]) => v > 0);
  const langs = Object.entries(game.player.languages).filter(([, v]) => v > 0);
  if (!skills.length && !langs.length) return null;
  return (
    <section className="card pad" aria-label="Skills" data-testid="skills-card">
      <h3 className="section-title">Skills</h3>
      <dl className="kv small">
        {skills.map(([id, v]) => (
          <div key={id} className="contents">
            <dt>
              <span
                className="has-tip"
                tabIndex={0}
                data-testid={`skill-name-${id}`}
                aria-describedby={`skill-tip-${id}`}
              >
                {SKILL_BY_ID[id]?.emoji} {SKILL_BY_ID[id]?.label ?? id}
                {game.player.talent === id && (
                  <span
                    className="talent-star"
                    title="Your talent: it grows faster"
                    data-testid={`talent-${id}`}
                  >
                    {' '}
                    ★
                  </span>
                )}
                {SKILL_BY_ID[id] && (
                  <span
                    className="tooltip"
                    role="tooltip"
                    id={`skill-tip-${id}`}
                    data-testid={`skill-tip-${id}`}
                  >
                    <strong>{SKILL_BY_ID[id].label}</strong>
                    <span className="tip-desc">{SKILL_BY_ID[id].description}</span>
                    {skillModifiers(SKILL_BY_ID[id], v).map((m) => (
                      <span key={m} className="tip-mod">
                        {m}
                      </span>
                    ))}
                  </span>
                )}
              </span>
            </dt>
            <dd data-testid={`skill-${id}`}>{v}</dd>
          </div>
        ))}
        {langs.map(([id, v]) => (
          <div key={id} className="contents">
            <dt>🗣️ {LANGUAGE_BY_ID[id]?.label ?? id}</dt>
            <dd data-testid={`lang-${id}`}>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
