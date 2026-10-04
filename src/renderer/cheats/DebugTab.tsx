import { useMemo, useState } from 'react';
import { CHEAT_BY_ID, eventTable, makeSaveFile, serialize, type GameState } from '../../engine';
import { app, doCheat, saveStore, useApp } from '../store/app';
import { CheatForm } from './CheatForm';

export function DebugTab({
  game,
  onResult,
}: {
  game: GameState;
  onResult: (m: string, ok: boolean) => void;
}): React.JSX.Element {
  const hidden = useApp((s) => s.hiddenStats);
  const [json, setJson] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const odds = useMemo(
    () =>
      eventTable(game)
        .filter((r) => r.eligible && r.weight > 0)
        .sort((a, b) => b.share - a.share)
        .slice(0, 15),
    [game],
  );
  const apply = (): void => {
    if (json === null) return;
    const r = doCheat('state.replace', { json });
    setErr(r.ok ? null : r.message);
    onResult(r.message, r.ok);
    if (r.ok) setJson(null);
  };
  const exportLife = (): void => {
    void saveStore.exportFile(
      `${game.player.first}-${game.player.last}`,
      makeSaveFile(game, app.get().saveName, Date.now()),
    );
  };
  return (
    <div className="col">
      <label className="row">
        <input
          type="checkbox"
          data-testid="debug-hidden-stats"
          checked={hidden}
          onChange={(e) => app.set({ hiddenStats: e.target.checked })}
        />
        Hidden-stats overlay
      </label>
      <section data-testid="debug-odds">
        <h4 className="section-title">This year's event odds</h4>
        <table className="odds">
          <tbody>
            {odds.map((r) => (
              <tr key={r.id}>
                <td>
                  <code>{r.id}</code>
                </td>
                <td className="muted">{r.kind}</td>
                <td className="num">{(r.share * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!odds.length && <p className="muted small">Nothing is eligible right now.</p>}
      </section>
      <section>
        <h4 className="section-title">State JSON</h4>
        {json === null ? (
          <button
            data-testid="debug-json-open"
            onClick={() => setJson(JSON.stringify(JSON.parse(serialize(game)), null, 1))}
          >
            View / edit JSON
          </button>
        ) : (
          <div className="col">
            <textarea
              className="json"
              data-testid="debug-json"
              spellCheck={false}
              aria-label="State JSON"
              value={json}
              onChange={(e) => setJson(e.target.value)}
            />
            {err && (
              <p className="error small" data-testid="debug-json-error" role="alert">
                {err}
              </p>
            )}
            <div className="row">
              <button className="primary" data-testid="debug-json-apply" onClick={apply}>
                Validate & apply
              </button>
              <button onClick={() => setJson(null)}>Close</button>
            </div>
          </div>
        )}
      </section>
      <div className="row">
        <button data-testid="debug-export" onClick={exportLife}>
          Export this life
        </button>
      </div>
      {['state.size', 'deathbot'].map((id) => {
        const def = CHEAT_BY_ID[id];
        return def ? <CheatForm key={id} def={def} game={game} onResult={onResult} /> : null;
      })}
    </div>
  );
}
