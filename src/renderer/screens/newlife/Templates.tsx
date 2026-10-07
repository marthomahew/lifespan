import { useState } from 'react';
import {
  deleteTemplate,
  loadTemplates,
  renameTemplate,
  saveTemplate,
  type Template,
} from '../../store/templates';
import type { Draft } from './useNewLife';

/**
 * Saved setups: keep a life you like to start from, and load it in one click. A template
 * rolls a fresh family and fresh events each time, unless you keep its seed.
 */
export function Templates({
  d,
  onLoad,
}: {
  d: Draft;
  onLoad: (d: Draft) => void;
}): React.JSX.Element {
  const [list, setList] = useState<Template[]>(loadTemplates);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [keepSeed, setKeepSeed] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [loaded, setLoaded] = useState<string | null>(null);

  const save = (e: React.FormEvent): void => {
    e.preventDefault();
    const draft = keepSeed ? d : { ...d, seed: '' };
    setList(saveTemplate(name || d.first || 'My template', draft));
    setSaving(false);
    setName('');
    setKeepSeed(false);
  };
  const rename = (e: React.FormEvent, id: string): void => {
    e.preventDefault();
    setList(renameTemplate(id, newName));
    setEditing(null);
  };

  return (
    <section className="cl-templates" data-testid="templates" aria-label="Templates">
      <span className="cl-templates-label muted small">Templates</span>
      {list.length === 0 && !saving && (
        <span className="muted small" data-testid="templates-empty">
          Save a setup to start from it again in one click.
        </span>
      )}
      {list.map((t) =>
        editing === t.id ? (
          <form key={t.id} className="cl-template" onSubmit={(e) => rename(e, t.id)}>
            <input
              aria-label="Template name"
              data-testid={`template-rename-input-${t.id}`}
              value={newName}
              maxLength={40}
              autoFocus
              onChange={(e) => setNewName(e.target.value)}
            />
            <button type="submit" data-testid={`template-rename-ok-${t.id}`}>
              OK
            </button>
            <button type="button" className="ghost" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </form>
        ) : (
          <span
            key={t.id}
            className={`cl-template${loaded === t.id ? ' active' : ''}`}
            data-testid={`template-${t.id}`}
          >
            <button
              type="button"
              className="cl-template-load"
              data-testid={`template-load-${t.id}`}
              title={t.draft.seed ? `Replays seed ${t.draft.seed}` : 'Fresh dice each time'}
              onClick={() => {
                onLoad(t.draft);
                setLoaded(t.id);
              }}
            >
              {t.draft.seed ? '🔁 ' : ''}
              {t.name}
            </button>
            <button
              type="button"
              className="cl-template-icon"
              aria-label={`Rename ${t.name}`}
              data-testid={`template-rename-${t.id}`}
              onClick={() => {
                setEditing(t.id);
                setNewName(t.name);
              }}
            >
              ✎
            </button>
            <button
              type="button"
              className="cl-template-icon"
              aria-label={`Delete ${t.name}`}
              data-testid={`template-delete-${t.id}`}
              onClick={() => setList(deleteTemplate(t.id))}
            >
              ×
            </button>
          </span>
        ),
      )}
      {saving ? (
        <form className="cl-template-save" onSubmit={save} data-testid="template-save-form">
          <input
            aria-label="Template name"
            data-testid="template-name"
            placeholder={d.first || 'Name this setup'}
            value={name}
            maxLength={40}
            autoFocus
            onChange={(e) => setName(e.target.value)}
          />
          {d.seed.trim() !== '' && (
            <label className="small">
              <input
                type="checkbox"
                data-testid="template-keep-seed"
                checked={keepSeed}
                onChange={(e) => setKeepSeed(e.target.checked)}
              />{' '}
              Keep seed {d.seed} (replay the same life)
            </label>
          )}
          <button type="submit" className="primary" data-testid="template-save-ok">
            Save
          </button>
          <button type="button" className="ghost" onClick={() => setSaving(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          className="ghost"
          data-testid="btn-save-template"
          onClick={() => setSaving(true)}
        >
          ＋ Save as template
        </button>
      )}
    </section>
  );
}
