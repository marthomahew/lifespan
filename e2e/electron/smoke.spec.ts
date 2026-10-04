import { test, expect } from '@playwright/test';
import { launchApp } from './launch';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

test('electron app launches with the right title and security baseline', async () => {
  const { app } = await launchApp();
  const errors: string[] = [];
  const win = await app.firstWindow();
  win.on('pageerror', (e) => errors.push(e.message));
  win.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await win.waitForLoadState('domcontentloaded');
  await expect(win).toHaveTitle('Lifespan');
  await expect(win.getByTestId('app-root')).toBeVisible();

  const prefs = await app.evaluate(({ BrowserWindow }) => {
    const w = BrowserWindow.getAllWindows()[0];
    // getLastWebPreferences exists at runtime but is missing from electron.d.ts.
    const wc = w?.webContents as unknown as
      { getLastWebPreferences(): Record<string, unknown> } | undefined;
    const p = wc?.getLastWebPreferences();
    return p
      ? {
          contextIsolation: p.contextIsolation,
          nodeIntegration: p.nodeIntegration,
          sandbox: p.sandbox,
          webSecurity: p.webSecurity,
        }
      : null;
  });
  expect(prefs).toEqual({
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
    webSecurity: true,
  });

  // The renderer has no Node access, only the narrow bridge.
  const surface = await win.evaluate(() => ({
    require: typeof (window as unknown as { require?: unknown }).require,
    process: typeof (window as unknown as { process?: unknown }).process,
    bridge: typeof (window as unknown as { lifespan?: unknown }).lifespan,
  }));
  expect(surface).toEqual({ require: 'undefined', process: 'undefined', bridge: 'object' });
  expect(errors).toEqual([]);
  await app.close();
});

test('electron plays a year and writes a save file over IPC', async () => {
  const { app, userData } = await launchApp();
  const win = await app.firstWindow();
  const errors: string[] = [];
  win.on('pageerror', (e) => errors.push(e.message));
  win.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await win.getByTestId('btn-new-life').click();
  await win.getByTestId('btn-random-life').click();
  await expect(win.getByTestId('game-screen')).toBeVisible();
  await win.getByTestId('age-up').click();
  await expect(win.getByTestId('header-age')).toHaveText('Age 1');
  const dir = join(userData, 'saves');
  await expect
    .poll(() => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).length : 0))
    .toBeGreaterThan(0);
  const file = readdirSync(dir).find((f) => f.endsWith('.json')) ?? '';
  const saved = JSON.parse(readFileSync(join(dir, file), 'utf8')) as {
    format: string;
    state: { player: { age: number } };
  };
  expect(saved.format).toBe('lifespan-save');
  await expect
    .poll(
      () => (JSON.parse(readFileSync(join(dir, file), 'utf8')) as typeof saved).state.player.age,
    )
    .toBe(1);
  // Reload: the Lives list comes back through IPC.
  await win.reload();
  await expect(win.getByTestId('btn-continue')).toBeVisible();
  expect(errors).toEqual([]);
  await app.close();
});
