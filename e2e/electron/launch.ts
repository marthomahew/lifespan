import { _electron as electron, type ElectronApplication } from '@playwright/test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

/** Launch either the built app (out/) or a packaged executable (ELECTRON_EXE). */
export async function launchApp(): Promise<{ app: ElectronApplication; userData: string }> {
  const userData = mkdtempSync(join(tmpdir(), 'lifespan-smoke-'));
  const exe = process.env['LIFESPAN_EXE'];
  // Container-only flags: passed from the test, never from the shipped app.
  const flags = ['--no-sandbox', '--disable-gpu', `--user-data-dir=${userData}`];
  const app = exe
    ? await electron.launch({ executablePath: exe, args: flags })
    : await electron.launch({ args: [resolve('.'), ...flags] });
  return { app, userData };
}
