/** npm run electron:smoke:packaged — the Electron smoke specs against the dist:linux build (M12.3). */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const exe = resolve('release', 'Lifespan-linux-arm64', 'lifespan');
if (!existsSync(exe)) {
  console.error(`electron:smoke:packaged: ${exe} not found; run npm run dist:linux first`);
  process.exit(1);
}
const r = spawnSync(
  'xvfb-run',
  ['-a', 'npx', 'playwright', 'test', '-c', 'playwright.electron.config.ts'],
  {
    stdio: 'inherit',
    env: { ...process.env, LIFESPAN_EXE: exe },
  },
);
process.exit(r.status ?? 1);
