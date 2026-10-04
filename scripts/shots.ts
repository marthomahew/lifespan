/** npm run shots: build the web app, then capture key screens into reports/screenshots/. */
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

mkdirSync('reports/screenshots', { recursive: true });
const run = (cmd: string, args: string[]): void => {
  const r = spawnSync(cmd, args, { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
};
if (!process.argv.includes('--no-build'))
  run('npx', ['vite', 'build', '-c', 'vite.web.config.ts', '--logLevel', 'warn']);
run('npx', ['playwright', 'test', '-c', 'playwright.shots.config.ts']);
