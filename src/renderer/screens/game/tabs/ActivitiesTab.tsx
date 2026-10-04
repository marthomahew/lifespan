import { useState } from 'react';
import { activitiesFor, formatMoney, type GameState } from '../../../../engine';
import { doAct } from '../../../store/app';
import { WillEditor } from './WillEditor';
import { CrimeSection } from './CrimeSection';
import { HealthSection } from './HealthSection';
import { SKILLS, LANGUAGES } from '../../../../content/skills';

const GROUP_LABEL: Record<string, string> = {
  mind_body: 'Mind and body',
  social: 'Social',
  love: 'Love (18+)',
  money: 'Money',
  fun: 'Fun',
  crime: 'Crime',
  travel: 'Travel',
  admin: 'Admin',
  prison: 'Prison',
};
const ORDER = Object.keys(GROUP_LABEL);

/** Activities, grouped and searchable (SPEC §6). */
export function ActivitiesTab({ game }: { game: GameState }): React.JSX.Element {
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [will, setWill] = useState(false);
  const [skill, setSkill] = useState(SKILLS[0]?.id ?? 'instrument');
  const [lang, setLang] = useState('spanish');
  const all = activitiesFor(game);
  const query = q.trim().toLowerCase();
  const visible = all.filter(
    (a) =>
      (a.enabled || a.reason === 'done enough this year' || a.reason.startsWith('costs')) &&
      (!query || `${a.label} ${a.description}`.toLowerCase().includes(query)),
  );
  const run = (id: string): void => {
    if (id === 'write_will') {
      setWill(true);
      return;
    }
    const params =
      id === 'practice_skill'
        ? { skill }
        : id === 'learn_language'
          ? { language: lang }
          : undefined;
    setError(doAct({ type: 'activity', id, ...(params ? { params } : {}) }));
  };
  return (
    <div className="col" data-testid="activities">
      <input
        type="search"
        placeholder="Search activities"
        aria-label="Search activities"
        data-testid="activity-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {error && (
        <p className="error small" role="alert" data-testid="activity-error">
          {error}
        </p>
      )}
      <HealthSection game={game} onError={setError} />
      {ORDER.filter((g) => visible.some((a) => a.group === g)).map((g) => (
        <section key={g} className="panel-section">
          <h3 className="section-title">{GROUP_LABEL[g]}</h3>
          <ul className="activity-list">
            {visible
              .filter((a) => a.group === g)
              .map((a) => (
                <li key={a.id}>
                  <button
                    className="activity"
                    data-testid={`act-${a.id}`}
                    disabled={!a.enabled}
                    title={a.reason || a.description}
                    onClick={() => run(a.id)}
                  >
                    <span className="activity-emoji" aria-hidden="true">
                      {a.emoji}
                    </span>
                    <span className="grow">
                      <span className="activity-label">{a.label}</span>
                      <span className="muted small activity-desc">{a.reason || a.description}</span>
                    </span>
                    {a.cost > 0 && <span className="muted small">{formatMoney(game, a.cost)}</span>}
                  </button>
                </li>
              ))}
          </ul>
        </section>
      ))}
      <CrimeSection game={game} onError={setError} />
      {visible.some((a) => a.id === 'practice_skill' || a.id === 'learn_language') && (
        <section className="panel-section row" aria-label="Practice options">
          <label className="small row">
            Skill
            <select
              data-testid="practice-skill"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
            >
              {SKILLS.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </select>
          </label>
          <label className="small row">
            Language
            <select
              data-testid="practice-language"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
        </section>
      )}
      {!visible.length && (
        <p className="muted">{game.player.age < 3 ? 'Babies mostly nap.' : 'Nothing matches.'}</p>
      )}
      {will && <WillEditor game={game} onClose={() => setWill(false)} />}
    </div>
  );
}
