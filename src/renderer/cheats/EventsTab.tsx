import { useMemo, useState } from 'react';
import { CHEAT_BY_ID, eventTable, type GameState } from '../../engine';
import { doCheat } from '../store/app';
import { CheatForm } from './CheatForm';

/** Every event with whether it's eligible right now and why not. */
export function EventsTab({
  game,
  onResult,
}: {
  game: GameState;
  onResult: (m: string, ok: boolean) => void;
}): React.JSX.Element {
  const [q, setQ] = useState('');
  const [onlyEligible, setOnlyEligible] = useState(false);
  const rows = useMemo(() => eventTable(game), [game]);
  const shown = rows
    .filter((r) => (!q || r.id.includes(q.toLowerCase())) && (!onlyEligible || r.eligible))
    .slice(0, 300);
  const fire = (id: string, force: boolean): void => {
    const r = doCheat('event.fire', { event: id, force });
    onResult(r.message, r.ok);
  };
  return (
    <div className="col">
      {['event.reroll', 'category.toggle', 'chains.list', 'chain.fire'].map((id) => {
        const def = CHEAT_BY_ID[id];
        return def ? <CheatForm key={id} def={def} game={game} onResult={onResult} /> : null;
      })}
      <div className="row">
        <input
          className="grow"
          type="search"
          aria-label="Search events"
          data-testid="event-search"
          placeholder="Search events"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <label className="row small">
          <input
            type="checkbox"
            checked={onlyEligible}
            onChange={(e) => setOnlyEligible(e.target.checked)}
          />{' '}
          eligible
        </label>
      </div>
      <ul className="event-list" data-testid="event-list">
        {shown.map((r) => (
          <li key={r.id} className={r.eligible ? 'ok' : ''} data-testid={`ev-${r.id}`}>
            <div className="grow">
              <code>{r.id}</code>
              <div className="muted small">
                {r.kind} · {r.category} ·{' '}
                {r.eligible ? `eligible, ${(r.share * 100).toFixed(1)}% of draws` : r.reason}
              </div>
            </div>
            <button
              data-testid={`ev-fire-${r.id}`}
              onClick={() => fire(r.id, false)}
              disabled={!r.eligible}
            >
              Fire
            </button>
            <button
              data-testid={`ev-force-${r.id}`}
              title="Ignore conditions"
              onClick={() => fire(r.id, true)}
            >
              Force
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
