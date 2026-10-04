import { describe, expect, it, vi } from 'vitest';
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

vi.mock('electron', () => ({
  app: {},
  dialog: {},
  ipcMain: { handle: () => undefined },
  BrowserWindow: {},
}));
const { atomicWrite, listSaves } = await import('../../src/main/saves');

describe('main-process save files', () => {
  it('writes atomically and keeps one .bak', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'saves-'));
    await atomicWrite(dir, 'life-1', '{"v":1}');
    await atomicWrite(dir, 'life-1', '{"v":2}');
    expect(readFileSync(join(dir, 'life-1.json'), 'utf8')).toBe('{"v":2}');
    expect(readFileSync(join(dir, 'life-1.json.bak'), 'utf8')).toBe('{"v":1}');
    expect(readdirSync(dir).some((f) => f.endsWith('.tmp'))).toBe(false);
    const list = await listSaves(dir);
    expect(list.map((m) => m.id)).toEqual(['life-1']);
  });

  it('lists nothing for a missing directory', async () => {
    expect(await listSaves(join(tmpdir(), 'definitely-missing-dir-xyz'))).toEqual([]);
  });
});
