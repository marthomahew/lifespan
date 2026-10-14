# Lifespan: operating manual

Read this whole file before you start, and again whenever your context has been compacted. The details live in `docs/`.

## What you're building
Lifespan is a single-player life simulator for macOS (Electron), in the spirit of BitLife but deeper, with no monetization and a full cheat menu. It's for one person's private use.

You work in a Claude Code session inside a Linux dev container, which the owner starts from the Mac with `./start.sh`. The owner works with you directly, in the terminal or through Remote Control, and plays the builds on the Mac.

Documents, highest authority first:
1. `docs/DONE.md`: what finished means (gates, thresholds, the final check).
2. `docs/PLAN.md`: ordered milestones. Every `[Mx.y]` line is a required item.
3. `docs/SPEC.md`: the game and the architecture.
4. This file: how you work.

When two disagree, the higher one wins. Log the conflict and your resolution in `progress/DECISIONS.md`.

## Hard rules
- Don't stop to ask about routine ambiguity. Choose what best fits SPEC (depth, fun, no grind, player control), log one line in `progress/DECISIONS.md`, and keep going. Ask the owner only when the readings would lead to materially different work.
- When you take on a task, ship real work: a finished item, or a committed chunk of one. Don't end a work turn with only a plan or a status report.
- Never end a turn with a background process still running (dev server, watcher, a sim in the background). Stray servers break e2e and keep the container busy. Run long commands in the foreground with a long timeout, and kill servers before the turn ends.
- `CLAUDE.md` and the docs in `docs/` can be edited. When you change SPEC, PLAN or DONE, log what changed and why in `progress/DECISIONS.md`.
- Never weaken a gate to get green. No deleting or skipping tests, no lowering thresholds or invariants, no `@ts-ignore`, no marking items passing without evidence. A red build with an honest BLOCKERS entry beats a fake green.
- Item status lives only in `progress/features.json`, which has one entry per PLAN item. Never delete entries; hygiene checks they're all there. You may add entries for sub-tasks (`X…`) and stretch items (`S…`). Edit the file with `jq` so its formatting stays stable.
- Git: stay on the current branch. No rebase, no amending earlier commits, no resetting committed history, no force-push. Push to `origin` only when the owner asks (the token lives in `/home/node/.claude/github-token`; never print it, log it or commit it). Undo with `git revert` or a new commit.
- No sudo. System packages are fixed; everything else comes from npm.
- WebFetch and WebSearch are off. For library docs read `node_modules/<pkg>/README.md`, the `.d.ts` files, or `npx <tool> --help`. Check versions with `npm view <pkg> version`.
- Content must be original. Don't reproduce BitLife text, names, UI copy, or assets. The strings "BitLife" and "Candywriter" never appear in `src/`.
- Romance, dating, sex, and pregnancy are adults-only (every participant 18+) and always fade-to-black. Under-18 characters get friendships, rivalries, school, and family drama.

## Working loop
Repeat for each task.

### 1. Orient (at the start, and after any compaction)
```bash
head -n 80 progress/NOTES.md
tail -n 60 progress/PROGRESS.md
git log --oneline -15
jq -r 'to_entries[] | select(.value.passes != true and .value.waived != true) | "\(.key)\t\(.value.title)"' progress/features.json | head -n 25
tail -n 30 progress/BLOCKERS.md
```

### 2. Choose
- Build red? Fixing it is the task.
- Otherwise take the first unfinished `[M…]` item in PLAN order. Batch neighbours that touch the same code. Skip ahead only past a blocked item, and log the block.
- If an item won't fit in about an hour, split it into `X` entries in features.json (e.g. `X5.5a` with `"parent": "M5.5"`) and do them in order. The parent passes when all its parts do.

### 3. Build
- Engine logic: write the test first, then the code.
- Follow SPEC §9 (architecture) and the engineering rules below.
- Content work follows SPEC §11 (writing guide). Use subagents to draft content packs in parallel, one file per subagent, then validate with `npm run content:check` before committing. Wait for every subagent to finish before the turn ends.

### 4. Verify
- While iterating, run the narrowest check (one Vitest file, one Playwright spec).
- Before marking anything done, run `npm run verify`. Before verify exists (early M0), run every check that does exist.
- UI items: run `npm run shots` and look at the PNGs with the Read tool. Fix clipping, overlap, poor contrast, and broken layout before calling the item done.
- At the end of each milestone, spawn a reviewer subagent with the milestone's PLAN lines, the relevant SPEC sections, and the list of changed files. Ask it to find gaps between the requirements and the code and tests. Fix what it finds or log it.

### 5. Record (per finished item)
- `progress/features.json`: `"passes": true` and `"evidence"` naming the tests or commands that prove it, e.g. `"tests/engine/mortality.test.ts; sim invariants; e2e/death.spec.ts"`. Evidence must exist in the repo. Except for M12.2 and M12.3, it must also run inside `npm run verify`.
- `progress/PROGRESS.md`: an entry after each milestone or every couple of hours, 10 lines max (template at the top of the file).
- `progress/DECISIONS.md`, `progress/BLOCKERS.md`, `progress/NOTES.md` whenever relevant.

### 6. Commit
One commit per finished item or coherent chunk, e.g. `M5.3: relationship interactions with NPC memory`.

### 7. Close the turn
End every work turn with a clean tree and this output visible, so the owner sees where things stand:
```bash
git status --porcelain | wc -l
jq '[to_entries[] | select(.key | test("^M")) | select(.value.passes != true and .value.waived != true)] | length' progress/features.json
```

## An item is done when
1. The behaviour works in the running app, UI included when the item implies UI.
2. An automated check inside `npm run verify` would fail if it broke.
3. `npm run verify` passed after the change.
4. Its `features.json` evidence points at that check.

## Engineering rules
- TypeScript strict everywhere. No `any` without a comment saying why. No `@ts-ignore`.
- `src/engine` and `src/content` are pure: no DOM, no Node APIs, no I/O, no `Math.random`, no `Date.now()` or `new Date()`. All randomness goes through the seeded RNG stored in game state. Lint enforces this (M0.3).
- Engine functions never mutate their input state.
- Runtime dependencies must be pure JavaScript with no native modules, because the app is packaged for macOS from this Linux container. Dev dependencies can be anything that installs here.
- Keep dependencies few. Before adding one, check whether 30 lines of your own code would do.
- Files stay under about 400 lines (hard limit 600, content files exempt). Split by concern.
- Every UI element a test touches gets a `data-testid`.
- Tests fail on any browser console error or page error.
- No absolute paths like `/workspaces/lifespan` in code or config. The final check verifies a fresh clone in a different directory.

## npm scripts (use these names)
Create them in M0.

| Script | Does |
|---|---|
| `dev:web` | Vite dev server for the renderer in a browser, port 5173 |
| `build` | Production build of renderer, main, preload, and the standalone web build |
| `typecheck` | `tsc --noEmit` across every TS project |
| `lint` | ESLint, zero warnings allowed |
| `hygiene` | `scripts/check-hygiene` (DONE §2.3) |
| `test` | Vitest: all unit and integration tests |
| `content:check` | Content validator and thresholds (DONE §3) |
| `sim` | 300 seeded lives, invariants and balance bands (DONE §4); writes `reports/balance-report.md` |
| `sim:coverage` | 2,000+ lives across bot personas; writes `reports/coverage-report.md` (not part of verify) |
| `e2e` | Playwright against the built web app (vite preview, port 4173), Chromium headless |
| `electron:smoke` | `xvfb-run -a` + Playwright `_electron` against the built app |
| `electron:smoke:packaged` | The same smoke test against the `dist:linux` build (M12.3) |
| `shots` | Screenshots of key screens into `reports/screenshots/` |
| `dist:mac` | Unsigned darwin-arm64 `Lifespan.app` into `release/` |
| `dist:linux` | Unpacked linux-arm64 build into `release/` |
| `verify` | typecheck, lint, hygiene, test, content:check, sim, build, e2e, electron:smoke, in that order; stops at the first failure; writes only to gitignored paths |

## Container facts
- Debian 12, arm64, Node 22, no display, no sudo. You run as user `node`.
- Playwright browsers: `npx playwright install chromium`. System libraries are already installed, so don't use `--with-deps`.
- Electron here needs `xvfb-run -a` plus `--no-sandbox` and `--disable-gpu`. Pass those only from test configs, never from the shipped app.
- The Bash tool's default timeout here is 10 minutes and the maximum is 45. Give verify and the long sims an explicit longer timeout instead of backgrounding them.
- Stray dev servers break e2e. Kill them first (`pkill -f vite`). Use fixed ports with `strictPort`.
- The project is bind-mounted from a Mac. The owner installs the `.app` that `npm run dist:mac` leaves in `release/` and signs it ad hoc on the Mac. `dist:mac` has to work in this container, and the last build in `release/` must come from your final green commit.

## When stuck
- Timebox any single obstacle to 45 minutes. Then log it in `progress/BLOCKERS.md` (what, what you tried, the error, next idea), take the simplest alternative or move to the next item, and keep going.
- If a library fights you for 30 minutes, swap it for something with less magic.
- Only M0.6, M12.2, and M12.3 can be waived, and only for container limitations. Set `"waived": true` with the exact error and what you tried as evidence, and add a line to `progress/WAIVERS.md`.

## Context hygiene
- This is one long session. After a compaction, re-read this file and run the Orient commands before doing anything else.
- Don't dump big files. Use `rg`, `head`, `sed -n`, `jq`.
- Keep PROGRESS.md entries short. Past 400 lines, condense older entries into a summary block at the top.
- Put durable gotchas and working commands in `progress/NOTES.md`, one line each. They're what you'll have after a compaction.

## Finishing
When every `[M…]` item passes: run the fresh-eyes audit (DONE §7), write `README.md` and `progress/REPORT.md` (DONE §6), and commit. Then run the final check in DONE §8 as one uninterrupted sequence and leave its full output in the transcript. The project is done when that output is clean. If any step fails, fix it, commit, and run the whole sequence again.

## Disk

- After extracting results from a large run (simulations, benchmarks, test sweeps), delete its output files. Keep at most one run's outputs at a time.
- Tests and scripts must clean up their own temp directories.
- Before starting a batch of large runs, check free space with `df -h` and tell the owner how much the batch will write.
