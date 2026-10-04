import { useEffect, useState } from 'react';
import { makeSaveFile, parseSaveFile } from '../../engine';
import { app, go, importSave, loadLife, saveStore, showError, useApp } from '../store/app';
import { listLives, type LifeRow } from './StartScreen';

export function LivesScreen(): React.JSX.Element {
  const [rows, setRows] = useState<LifeRow[] | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const version = useApp((s) => s.savesVersion);
  const back = useApp((s) => s.back);
  const game = useApp((s) => s.game);
  const settings = useApp((s) => s.settings);

  useEffect(() => {
    let live = true;
    void listLives().then((r) => live && setRows(r));
    return () => {
      live = false;
    };
  }, [version]);
  const bump = (): void => app.set((s) => ({ savesVersion: s.savesVersion + 1 }));

  const rename = async (row: LifeRow): Promise<void> => {
    const json = await saveStore.read(row.id);
    if (!json) return;
    const { state } = parseSaveFile(json);
    const n = name.trim().slice(0, 80) || row.summary.name;
    await saveStore.write(row.id, makeSaveFile(state, n, row.summary.savedAt));
    if (app.get().game?.lifeId === row.id) app.set({ saveName: n });
    setRenaming(null);
    bump();
  };
  const remove = async (id: string): Promise<void> => {
    await saveStore.delete(id);
    setConfirmDelete(null);
    bump();
  };
  const exportLife = async (row: LifeRow): Promise<void> => {
    const json = await saveStore.read(row.id);
    if (json) await saveStore.exportFile(row.summary.name.replace(/[^\w -]/g, '_'), json);
  };
  const importLife = async (): Promise<void> => {
    const text = await saveStore.importFile();
    if (!text) return;
    try {
      await importSave(text);
    } catch (e) {
      showError(`Import failed: ${(e as Error).message}`);
    }
  };

  return (
    <div className="screen" data-testid="lives-screen">
      <div className="screen-head">
        <button
          className="ghost"
          data-testid="btn-back"
          onClick={() =>
            go(
              game && back === 'game' ? 'game' : back === 'obituary' && game ? 'obituary' : 'start',
            )
          }
        >
          ← Back
        </button>
        <h1>Lives</h1>
        <div className="grow" />
        <button data-testid="btn-import" onClick={() => void importLife()}>
          Import…
        </button>
        <button className="primary" data-testid="btn-lives-new" onClick={() => go('new')}>
          New Life
        </button>
      </div>
      {rows === null && <p className="muted pad">Loading…</p>}
      {rows && rows.length === 0 && <p className="muted pad">No lives yet. Start one.</p>}
      <ul className="lives-list">
        {rows?.map((r) => (
          <li key={r.id} className="card life-row" data-testid={`life-${r.id}`}>
            <div className="grow">
              {renaming === r.id ? (
                <form
                  className="row"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void rename(r);
                  }}
                >
                  <input
                    aria-label="New name"
                    data-testid="rename-input"
                    value={name}
                    autoFocus
                    onChange={(e) => setName(e.target.value)}
                  />
                  <button type="submit" data-testid="rename-save">
                    Save
                  </button>
                </form>
              ) : (
                <>
                  <div className="life-name" data-testid="life-name">
                    {r.summary.dead ? '🪦' : '🌱'} {r.summary.name}
                    {r.summary.cheated && settings.cheatBadge && (
                      <span className="badge cheat small">🃏</span>
                    )}
                  </div>
                  <div className="muted small">
                    {r.summary.first} {r.summary.last},{' '}
                    {r.summary.dead ? `died at ${r.summary.age}` : `age ${r.summary.age}`} ·{' '}
                    {r.summary.year}
                    {r.summary.generation > 1 ? ` · generation ${r.summary.generation}` : ''}
                  </div>
                </>
              )}
            </div>
            <div className="row">
              <button
                className="primary"
                data-testid="life-load"
                onClick={() => void loadLife(r.id)}
              >
                Load
              </button>
              <button
                data-testid="life-rename"
                onClick={() => {
                  setRenaming(r.id);
                  setName(r.summary.name);
                }}
              >
                Rename
              </button>
              <button data-testid="life-export" onClick={() => void exportLife(r)}>
                Export
              </button>
              {confirmDelete === r.id ? (
                <button
                  className="danger"
                  data-testid="life-delete-confirm"
                  onClick={() => void remove(r.id)}
                >
                  Really delete
                </button>
              ) : (
                <button data-testid="life-delete" onClick={() => setConfirmDelete(r.id)}>
                  Delete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
