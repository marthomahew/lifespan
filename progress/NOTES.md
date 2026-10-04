# Notes for future sessions

One line each: gotchas, commands that work, conventions. Every session reads this first.

- Never `pkill -f vite` (it matches the Bash tool's own command line and kills it). Use `pkill -f "node.*[v]ite"`.
- Electron 44 downloads its binary lazily on first run (no postinstall); `node node_modules/electron/install.js` forces it.
- Versions pinned for compatibility: vite 7 (electron-vite 5 needs <=7), TypeScript 6.0 (typescript-eslint needs <6.1), @vitejs/plugin-react 5.2.
- Preload is built as CJS (`out/preload/index.cjs`) because sandboxed preloads can't be ESM.
- Electron smoke: `xvfb-run -a playwright test -c playwright.electron.config.ts`; flags --no-sandbox --disable-gpu live in e2e/electron/launch.ts only.
- Hygiene test strings are split (j('it', '.only', ...)) so hygiene doesn't flag its own test.
- Typecheck uses three projects: tsconfig.engine.json (no DOM/Node libs), tsconfig.web.json, tsconfig.node.json.
- Engine pattern: public fn clones (cloneState: deep copy except log/snapshots shallow), runs systems on a Ctx(draft), returns ctx.finish(). Never mutate log entries or snapshot objects in place.
- Money: stored as local nominal currency. refToLocal(s, ref, 'price'|'wage') converts content reference dollars; localToRef for inflation-adjusted figures.
- Bot decisions use their own Rng (player input), seeded from life seed; sim replays with save/load checkpoints and compares stateHash.
- tests/helpers.ts advance()/playYears()/playToDeath() — update advance() when choose() exists.
