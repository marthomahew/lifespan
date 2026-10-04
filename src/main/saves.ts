import { app, dialog, ipcMain, BrowserWindow } from 'electron';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { IPC, MAX_SAVE_BYTES, SAVE_ID_RE, type SaveMeta } from '../shared/api';

const idSchema = z.string().regex(SAVE_ID_RE);
const jsonSchema = z
  .string()
  .max(MAX_SAVE_BYTES)
  .refine((s) => {
    try {
      JSON.parse(s);
      return true;
    } catch {
      return false;
    }
  }, 'not JSON');
const nameSchema = z.string().max(120);

export function savesDir(): string {
  return join(app.getPath('userData'), 'saves');
}

/** Write atomically: temp file then rename, keeping one .bak of the previous version. */
export async function atomicWrite(dir: string, id: string, json: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
  const target = join(dir, `${id}.json`);
  const tmp = join(dir, `${id}.json.tmp`);
  await fs.writeFile(tmp, json, 'utf8');
  try {
    await fs.copyFile(target, join(dir, `${id}.json.bak`));
  } catch {
    // No previous version yet.
  }
  await fs.rename(tmp, target);
}

export async function listSaves(dir: string): Promise<SaveMeta[]> {
  let names: string[];
  try {
    names = await fs.readdir(dir);
  } catch {
    return [];
  }
  const out: SaveMeta[] = [];
  for (const name of names) {
    if (!name.endsWith('.json')) continue;
    const id = name.slice(0, -5);
    if (!SAVE_ID_RE.test(id)) continue;
    const st = await fs.stat(join(dir, name));
    out.push({ id, size: st.size, modified: st.mtimeMs });
  }
  return out;
}

export function registerSaveHandlers(): void {
  ipcMain.handle(IPC.list, () => listSaves(savesDir()));
  ipcMain.handle(IPC.read, async (_e, rawId: unknown) => {
    const id = idSchema.parse(rawId);
    try {
      return await fs.readFile(join(savesDir(), `${id}.json`), 'utf8');
    } catch {
      return null;
    }
  });
  ipcMain.handle(IPC.write, async (_e, rawId: unknown, rawJson: unknown) => {
    await atomicWrite(savesDir(), idSchema.parse(rawId), jsonSchema.parse(rawJson));
  });
  ipcMain.handle(IPC.delete, async (_e, rawId: unknown) => {
    const id = idSchema.parse(rawId);
    await fs.rm(join(savesDir(), `${id}.json`), { force: true });
    await fs.rm(join(savesDir(), `${id}.json.bak`), { force: true });
  });
  ipcMain.handle(IPC.exportDialog, async (e, rawName: unknown, rawJson: unknown) => {
    const name = nameSchema.parse(rawName).replace(/[^\w .-]/g, '_');
    const json = jsonSchema.parse(rawJson);
    const win = BrowserWindow.fromWebContents(e.sender);
    const opts = {
      defaultPath: `${name}.json`,
      filters: [{ name: 'Lifespan life', extensions: ['json'] }],
    };
    const res = win ? await dialog.showSaveDialog(win, opts) : await dialog.showSaveDialog(opts);
    if (res.canceled || !res.filePath) return false;
    await fs.writeFile(res.filePath, json, 'utf8');
    return true;
  });
  ipcMain.handle(IPC.importDialog, async (e) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    const opts = {
      properties: ['openFile' as const],
      filters: [{ name: 'Lifespan life', extensions: ['json'] }],
    };
    const res = win ? await dialog.showOpenDialog(win, opts) : await dialog.showOpenDialog(opts);
    const file = res.filePaths[0];
    if (res.canceled || !file) return null;
    const st = await fs.stat(file);
    if (st.size > MAX_SAVE_BYTES) return null;
    return fs.readFile(file, 'utf8');
  });
  ipcMain.handle(IPC.version, () => app.getVersion());
}
