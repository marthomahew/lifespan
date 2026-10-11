/**
 * npm run dist:mac | dist:linux — package the built app with @electron/packager (SPEC §9.8).
 * mac: unsigned darwin-arm64 Lifespan.app in release/ (the owner signs it ad hoc on the Mac).
 * linux: unpacked linux-arm64 build in release/ for the packaged smoke test.
 * `mac x64` builds the same app for Intel Macs (release/Lifespan-darwin-x64), for testers.
 */
import { packager } from '@electron/packager';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const target = process.argv[2];
const arch = process.argv[3] ?? 'arm64';
if ((target !== 'mac' && target !== 'linux') || (arch !== 'arm64' && arch !== 'x64')) {
  console.error('usage: tsx scripts/dist.ts mac|linux [arm64|x64]');
  process.exit(2);
}
const run = (cmd: string, args: string[]): void => {
  const r = spawnSync(cmd, args, { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

run('npx', ['tsx', 'scripts/make-icon.ts']);
run('npx', ['electron-vite', 'build']);

const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
  version: string;
  devDependencies: Record<string, string>;
};
const electronVersion = pkg.devDependencies['electron'] ?? '44.5.1';
const platform = target === 'mac' ? 'darwin' : 'linux';
const outDir = resolve('release', `Lifespan-${platform}-${arch}`);
// Retries: on the Mac bind mount, Finder can drop a .DS_Store in mid-delete.
if (existsSync(outDir))
  rmSync(outDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });

// Only the built app and production dependencies go into app.asar.
const KEEP = /^\/(out|node_modules|package\.json)(\/|$)/;
const paths = await packager({
  dir: '.',
  name: 'Lifespan',
  executableName: target === 'linux' ? 'lifespan' : 'Lifespan',
  platform,
  arch,
  electronVersion,
  appVersion: pkg.version,
  appBundleId: 'dev.local.lifespan',
  appCategoryType: 'public.app-category.games',
  appCopyright: 'Lifespan',
  asar: true,
  prune: true,
  overwrite: true,
  out: 'release',
  icon: target === 'mac' ? 'build/icon.icns' : 'build/icon.png',
  ignore: (p: string) => p !== '' && !KEEP.test(p),
  quiet: true,
});
console.log(`dist:${target}: ${paths.join(', ')}`);
if (target === 'mac')
  run('npx', ['tsx', 'scripts/check-mac-bundle.ts', resolve(outDir, 'Lifespan.app')]);
