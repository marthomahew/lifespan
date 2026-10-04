import { useEffect, useState } from 'react';
import { parseSaveFile, type SaveSummary } from '../../engine';
import { go, loadLife, saveStore, useApp } from '../store/app';

export type LifeRow = { id: string; summary: SaveSummary };

export async function listLives(): Promise<LifeRow[]> {
  const metas = await saveStore.list();
  const rows: LifeRow[] = [];
  for (const m of metas) {
    const json = await saveStore.read(m.id);
    if (!json) continue;
    try {
      rows.push({ id: m.id, summary: parseSaveFile(json).summary });
    } catch {
      // Damaged saves are skipped here; the Lives screen shows them.
    }
  }
  return rows.sort((a, b) => b.summary.savedAt - a.summary.savedAt);
}

export function StartScreen(): React.JSX.Element {
  const [latest, setLatest] = useState<LifeRow | null>(null);
  const version = useApp((s) => s.savesVersion);
  useEffect(() => {
    let live = true;
    void listLives().then((rows) => live && setLatest(rows.find((r) => !r.summary.dead) ?? null));
    return () => {
      live = false;
    };
  }, [version]);
  return (
    <div className="start" data-testid="start-screen">
      <div className="start-card card">
        <div className="logo" aria-hidden="true">
          🌱
        </div>
        <h1>Lifespan</h1>
        <p className="muted">One year at a time.</p>
        <div className="col start-actions">
          {latest && (
            <button
              className="primary"
              data-testid="btn-continue"
              onClick={() => void loadLife(latest.id)}
            >
              Continue as {latest.summary.first} {latest.summary.last}, {latest.summary.age}
            </button>
          )}
          <button
            className={latest ? '' : 'primary'}
            data-testid="btn-new-life"
            onClick={() => go('new')}
          >
            New Life
          </button>
          <button data-testid="btn-start-lives" onClick={() => go('lives')}>
            Lives
          </button>
          <button data-testid="btn-start-settings" onClick={() => go('settings')}>
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}
