import { useState } from 'react';
import { activitiesFor, formatMoney, type GameState } from '../../../../engine';
import { doAct } from '../../../store/app';
import { WillEditor } from './WillEditor';
import { CrimeSection } from './CrimeSection';
import { EmigrateSection } from './EmigrateSection';
import { HealthSection } from './HealthSection';
import { FocusCard } from './FocusCard';
import { OPTION_ACTIVITIES, OptionDialog } from './OptionDialog';
import { cap } from '../../../components/text';
import { FreeTime } from './FreeTime';

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
  const [picking, setPicking] = useState<string | null>(null);
  const all = activitiesFor(game);
  const query = q.trim().toLowerCase();
  const visible = all.filter(
    (a) =>
      (a.enabled ||
        a.reason === 'done enough this year' ||
        a.reason === 'no free time left this year' ||
        a.reason === 'waiting to hear back from agents' ||
        a.reason === 'the reviews aren’t in yet' ||
        a.reason.startsWith('costs')) &&
      (!query || `${a.label} ${a.description}`.toLowerCase().includes(query)),
  );
  const run = (id: string): void => {
    if (id === 'write_will') {
      setWill(true);
      return;
    }
    // Some activities ask what first (which skill, which look...).
    if (OPTION_ACTIVITIES.includes(id)) {
      setPicking(id);
      return;
    }
    setError(doAct({ type: 'activity', id }));
  };
  const runWith = (params: Record<string, string | number>): void => {
    if (!picking) return;
    setError(doAct({ type: 'activity', id: picking, params }));
    setPicking(null);
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
      {!game.legal.prison && game.settings.freeTime !== false && <FreeTime game={game} />}
      <FocusCard game={game} onError={setError} />
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
                      <span className="muted small activity-desc">
                        {a.reason ? cap(a.reason) : a.description}
                      </span>
                      {a.preview && !a.reason && (
                        <span className="small activity-preview" data-testid={`preview-${a.id}`}>
                          {a.preview}
                        </span>
                      )}
                    </span>
                    {a.cost > 0 && <span className="muted small">{formatMoney(game, a.cost)}</span>}
                    {a.parentsPay && <span className="muted small">Parents pay</span>}
                  </button>
                </li>
              ))}
          </ul>
        </section>
      ))}
      <EmigrateSection game={game} onError={setError} />
      <CrimeSection game={game} onError={setError} />
      {picking && (
        <OptionDialog
          game={game}
          activity={picking}
          onRun={runWith}
          onClose={() => setPicking(null)}
        />
      )}
      {!visible.length && (
        <p className="muted">{game.player.age < 3 ? 'Babies mostly nap.' : 'Nothing matches.'}</p>
      )}
      {will && <WillEditor game={game} onClose={() => setWill(false)} />}
    </div>
  );
}
