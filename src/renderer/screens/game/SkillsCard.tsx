import { SKILL_BY_ID, LANGUAGE_BY_ID } from '../../../content/skills';
import type { GameState } from '../../../engine';

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
          <span key={id} className="contents">
            <dt>
              {SKILL_BY_ID[id]?.emoji} {SKILL_BY_ID[id]?.label ?? id}
            </dt>
            <dd data-testid={`skill-${id}`}>{v}</dd>
          </span>
        ))}
        {langs.map(([id, v]) => (
          <span key={id} className="contents">
            <dt>🗣️ {LANGUAGE_BY_ID[id]?.label ?? id}</dt>
            <dd data-testid={`lang-${id}`}>{v}</dd>
          </span>
        ))}
      </dl>
    </section>
  );
}
