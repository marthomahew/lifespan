# Overnight runbook

## What's in the folder
- `CLAUDE.md`: the agent's operating manual.
- `docs/SPEC.md`, `docs/PLAN.md`, `docs/DONE.md`: the game, the ordered checklist (96 required items), and the definition of done.
- `progress/`: the agent's logs, plus `features.json` with the status of every item.
- `overnight/`: this runbook, `GOAL.md` (the line you paste to start), the Dockerfile, and three Mac scripts: `start.sh`, `install-mac.sh`, `build-mac.sh`.

## How it works
One interactive Claude Code session in bypass mode, inside a container that can only see this folder. You start the work with `/goal`. After every turn a separate model checks the goal against the transcript and, if it isn't met, starts the next turn. When a plan usage limit hits, the session waits for the reset and carries on. The session runs inside tmux in the container, so closing your terminal doesn't stop it.

## Before bed (about 10 minutes)
1. Unzip somewhere like `~/Developer`; it creates a `lifespan` folder. Keep nothing else in it.
2. Optional: adjust `docs/SPEC.md` §2 (improvements) and §8 (cheats). If you edit `docs/PLAN.md`, keep the `- [Mx.y] ` line format and add matching entries to `progress/features.json`.
3. `cd ~/Developer/lifespan && bash overnight/start.sh`. It commits the folder and tags it `baseline`, builds the image, starts the container, starts `caffeinate`, and opens Claude Code in tmux.
4. In Claude Code: accept the bypass-mode warning, trust the folder, and log in if asked. The login lives in a Docker volume, so it's a one-time step.
5. Run `/config` and make sure "Continue automatically at usage limit" is on.
6. Paste the `/goal` line from `overnight/GOAL.md`. Work starts immediately.
7. Stay until the first commit lands (`git log --oneline` in a Mac terminal), then detach with Ctrl-b d.
8. Power cable in. Lid open, or closed only while docked to the external display.

## While it runs
- Reattach: `bash overnight/start.sh` (it reattaches when the session exists) or `docker exec -it lifespan-agent tmux attach -t night`. Detach again with Ctrl-b d.
- `/goal` with no argument shows the condition, turns so far, token spend, and the evaluator's latest reason. Anything else you type goes to the agent as a message.
- Progress without attaching: `git log --oneline -20` and `tail progress/PROGRESS.md` on the Mac.
- Stop: attach, press Esc, then `/goal clear`. Or `docker stop lifespan-agent`.

## What can stop the goal before it's met
- Cleared: an auth failure, an exhausted credit balance, a context overflow that compaction can't fix, or the model becoming unavailable. Reattach and paste the goal line again.
- Paused: an API rate limit, or three automatic retries in a row after overloads or dropped connections. A plan usage limit only pauses it until the reset, unless the reset is more than 24 hours out (weekly limits) or the wait has already re-armed twice in a row.
- Handed back to you: several turns in a row without tool use.
- Background work left running at the end of a turn defers the check. CLAUDE.md forbids it.

## Morning
1. Reattach and run `/goal` for the status, then read `progress/REPORT.md` (if it got that far) and the end of `progress/PROGRESS.md`.
2. `bash overnight/install-mac.sh` signs the app in `release/` ad hoc, copies it to /Applications, and opens it.
3. No app in `release/`? `bash overnight/build-mac.sh` builds natively from HEAD (needs Node on the Mac).
4. Saves live in `~/Library/Application Support/Lifespan/saves/`.

## Another night
Run `bash overnight/start.sh`, then paste the goal line again. A fresh session picks the work up from git and `progress/`, which beats continuing a conversation that's been compacted all night.

## Settings (environment variables for start.sh)
| Variable | Default | Effect |
|---|---|---|
| `MODEL` | account default | `opus`, `sonnet`, `fable` (needs Fable access), or a full model id; `/model` inside works too |
| `ALLOW_WEB` | 0 | 1 gives the agent WebFetch and WebSearch back |
| `CAFFEINATE_HOURS` | 10 | How long the Mac is kept awake |
| `CLAUDE_CODE_OAUTH_TOKEN` | unset | Optional: a token from `claude setup-token` instead of logging in inside the container |

## Safety model
- Bypass mode means no approval prompts, so the container is the boundary.
- The container sees this folder (a bind mount) and three Docker volumes: Claude config, npm cache, tool cache. No home directory, SSH keys, or Docker socket.
- It runs as the non-root `node` user. Claude Code refuses bypass mode as root anyway.
- Network access is open (npm, GitHub, Playwright's CDN, Anthropic). WebFetch and WebSearch are off to shrink the prompt-injection surface. The agent can read anything inside the container, the Claude login included, so keep other secrets out of this folder.
- Git history is the undo button.

## Troubleshooting
- **"cannot be used with root/sudo privileges":** the `USER node` line in the Dockerfile was changed.
- **`/goal` refuses to start:** accept the folder trust prompt. `/goal` runs on the hooks system and needs it.
- **Old CLI in the image:** `/goal` needs v2.1.139 or later. Rebuild without the cache: `docker build --no-cache -t lifespan-agent:latest overnight`.
- **Electron won't launch in the container:** xvfb with `--no-sandbox` normally works. If it doesn't, the agent can waive M0.6 and M12.3 with evidence, and you check the app on the Mac.
- **The app won't open:** run `install-mac.sh` again, then check `codesign -dv /Applications/Lifespan.app`.
