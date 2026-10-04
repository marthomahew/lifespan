import { test, expect } from '@playwright/test';
import { launchApp } from './launch';

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
