/** The narrow API the preload script exposes on window.lifespan (SPEC §9.6). */
export type SaveMeta = { id: string; size: number; modified: number };

export interface LifespanBridge {
  saves: {
    list(): Promise<SaveMeta[]>;
    read(id: string): Promise<string | null>;
    write(id: string, json: string): Promise<void>;
    delete(id: string): Promise<void>;
    exportDialog(suggestedName: string, json: string): Promise<boolean>;
    importDialog(): Promise<string | null>;
  };
  app: { version(): Promise<string> };
  onMenu(handler: (command: string) => void): () => void;
}

export const SAVE_ID_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/;
export const MAX_SAVE_BYTES = 20 * 1024 * 1024;

export const IPC = {
  list: 'saves:list',
  read: 'saves:read',
  write: 'saves:write',
  delete: 'saves:delete',
  exportDialog: 'saves:export',
  importDialog: 'saves:import',
  version: 'app:version',
  menu: 'menu:command',
} as const;
