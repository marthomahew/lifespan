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
const { atomicWrite, listSaves, idSchema, jsonSchema, nameSchema, trustedSender } =
  await import('../../src/main/saves');

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

  it('serializes overlapping writes to the same save', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'saves-'));
    await Promise.all(
      Array.from({ length: 20 }, (_, i) => atomicWrite(dir, 'race', JSON.stringify({ i }))),
    );
    expect(JSON.parse(readFileSync(join(dir, 'race.json'), 'utf8'))).toEqual({ i: 19 });
    expect(readdirSync(dir).some((f) => f.endsWith('.tmp'))).toBe(false);
  });

  it('validates every IPC input', () => {
    expect(idSchema.safeParse('life-1').success).toBe(true);
    for (const bad of ['../x', 'A', '', 'a/b', 'x'.repeat(65), 5])
      expect(idSchema.safeParse(bad).success).toBe(false);
    expect(jsonSchema.safeParse('{"a":1}').success).toBe(true);
    expect(jsonSchema.safeParse('{nope').success).toBe(false);
    expect(jsonSchema.safeParse('x'.repeat(21 * 1024 * 1024)).success).toBe(false);
    expect(nameSchema.safeParse('y'.repeat(200)).success).toBe(false);
  });

  it('only trusts our own renderer', () => {
    const root = 'file:///app/out/renderer';
    expect(trustedSender('file:///app/out/renderer/index.html', root, undefined)).toBe(true);
    expect(trustedSender('https://evil.example/', root, undefined)).toBe(false);
    expect(trustedSender(undefined, root, undefined)).toBe(false);
  });
});
