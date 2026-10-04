import type { SaveMeta } from '../../shared/api';

/** Where lives are kept: files over IPC in Electron, localStorage in the browser (SPEC §9.5). */
export interface SaveStore {
  list(): Promise<SaveMeta[]>;
  read(id: string): Promise<string | null>;
  write(id: string, json: string): Promise<void>;
  delete(id: string): Promise<void>;
  /** Returns true if the file was written. */
  exportFile(name: string, json: string): Promise<boolean>;
  /** Returns the file's text, or null if cancelled. */
  importFile(): Promise<string | null>;
}

const PREFIX = 'lifespan.save.';

export class LocalSaveStore implements SaveStore {
  async list(): Promise<SaveMeta[]> {
    const out: SaveMeta[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(PREFIX)) continue;
      const v = localStorage.getItem(k) ?? '';
      const modified = Number(
        localStorage.getItem(`lifespan.mtime.${k.slice(PREFIX.length)}`) ?? 0,
      );
      out.push({ id: k.slice(PREFIX.length), size: v.length, modified });
    }
    return out;
  }
  async read(id: string): Promise<string | null> {
    return localStorage.getItem(PREFIX + id);
  }
  async write(id: string, json: string): Promise<void> {
    localStorage.setItem(PREFIX + id, json);
    localStorage.setItem(`lifespan.mtime.${id}`, String(Date.now()));
  }
  async delete(id: string): Promise<void> {
    localStorage.removeItem(PREFIX + id);
    localStorage.removeItem(`lifespan.mtime.${id}`);
  }
  async exportFile(name: string, json: string): Promise<boolean> {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.json`;
    a.dataset['testid'] = 'export-link';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  }
  importFile(): Promise<string | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json,.json';
      input.dataset['testid'] = 'import-input';
      input.style.display = 'none';
      input.addEventListener('change', () => {
        const f = input.files?.[0];
        input.remove();
        if (!f) return resolve(null);
        void f.text().then(resolve, () => resolve(null));
      });
      input.addEventListener('cancel', () => {
        input.remove();
        resolve(null);
      });
      document.body.appendChild(input);
      input.click();
    });
  }
}

export class BridgeSaveStore implements SaveStore {
  private readonly b = window.lifespan;
  private bridge() {
    if (!this.b) throw new Error('bridge missing');
    return this.b;
  }
  list(): Promise<SaveMeta[]> {
    return this.bridge().saves.list();
  }
  read(id: string): Promise<string | null> {
    return this.bridge().saves.read(id);
  }
  write(id: string, json: string): Promise<void> {
    return this.bridge().saves.write(id, json);
  }
  delete(id: string): Promise<void> {
    return this.bridge().saves.delete(id);
  }
  exportFile(name: string, json: string): Promise<boolean> {
    return this.bridge().saves.exportDialog(name, json);
  }
  importFile(): Promise<string | null> {
    return this.bridge().saves.importDialog();
  }
}

export function createSaveStore(): SaveStore {
  return window.lifespan ? new BridgeSaveStore() : new LocalSaveStore();
}
