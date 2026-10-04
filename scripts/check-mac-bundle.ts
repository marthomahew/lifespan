/**
 * Validates release/Lifespan-darwin-arm64/Lifespan.app (M12.2): Info.plist name, bundle id,
 * and category; the executable; and the app.asar with the built app inside.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const app = process.argv[2] ?? join('release', 'Lifespan-darwin-arm64', 'Lifespan.app');
const problems: string[] = [];
const plistPath = join(app, 'Contents', 'Info.plist');
if (!existsSync(plistPath)) problems.push(`missing ${plistPath}`);
else {
  const plist = readFileSync(plistPath, 'utf8');
  const value = (key: string): string | null => {
    const m = new RegExp(`<key>${key}</key>\\s*<string>([^<]*)</string>`).exec(plist);
    return m ? (m[1] ?? null) : null;
  };
  const expect = (key: string, want: string): void => {
    const got = value(key);
    if (got !== want) problems.push(`${key} is ${got ?? 'missing'}, expected ${want}`);
  };
  expect('CFBundleName', 'Lifespan');
  expect('CFBundleDisplayName', 'Lifespan');
  expect('CFBundleIdentifier', 'dev.local.lifespan');
  expect('LSApplicationCategoryType', 'public.app-category.games');
  expect('CFBundleExecutable', 'Lifespan');
  if (!value('CFBundleIconFile')) problems.push('CFBundleIconFile missing');
}
const exe = join(app, 'Contents', 'MacOS', 'Lifespan');
if (!existsSync(exe)) problems.push(`missing executable ${exe}`);
else if ((statSync(exe).mode & 0o111) === 0) problems.push('executable is not marked executable');
const asar = join(app, 'Contents', 'Resources', 'app.asar');
if (!existsSync(asar)) problems.push(`missing ${asar}`);
else {
  const buf = readFileSync(asar);
  // asar header: the JSON file table lists our built entry points.
  const header = buf.subarray(16, Math.min(buf.length, 16 + buf.readUInt32LE(12))).toString('utf8');
  for (const want of ['"out"', '"main"', '"preload"', '"renderer"', '"package.json"'])
    if (!header.includes(want)) problems.push(`app.asar lacks ${want}`);
}
if (!existsSync(join(app, 'Contents', 'Resources', 'electron.icns')))
  problems.push('icon missing from Resources');
if (problems.length) {
  console.error(`check-mac-bundle: ${problems.length} problem(s)`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`check-mac-bundle: OK (${app})`);
