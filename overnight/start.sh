#!/bin/bash
# Run on the Mac:  bash overnight/start.sh
# First run: commits and tags the folder as `baseline`, builds the image, starts the container,
# keeps the Mac awake, and opens Claude Code (bypass mode) in a tmux session inside the container.
# Later runs: reattach to that session if it's still alive.
# Optional env: MODEL, ALLOW_WEB=1, CAFFEINATE_HOURS (10), CLAUDE_CODE_OAUTH_TOKEN
# Written for the bash 3.2 that ships with macOS.
set -eo pipefail

cd "$(dirname "$0")/.."
PROJECT_DIR="$(pwd)"
NAME=lifespan-agent
IMAGE=lifespan-agent:latest
WORKDIR=/workspaces/lifespan
SESSION=night

say() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
die() { printf '\n\033[31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }

command -v docker >/dev/null 2>&1 || die "docker CLI not found. Start OrbStack."
docker info >/dev/null 2>&1 || die "Docker engine not reachable. Is OrbStack running?"

if docker exec "$NAME" tmux has-session -t "$SESSION" >/dev/null 2>&1; then
  say "Session already running; reattaching (Ctrl-b d to detach)"
  exec docker exec -it "$NAME" tmux attach -t "$SESSION"
fi

say "Committing the folder as the baseline"
[ -d .git ] || git init -q
git add -A
if ! git diff --cached --quiet; then
  git -c user.name="$(git config user.name || echo Owner)" \
      -c user.email="$(git config user.email || echo owner@localhost)" \
      commit -qm "Baseline before overnight run"
fi
git tag -f baseline >/dev/null 2>&1

say "Building image $IMAGE (the first build takes several minutes)"
docker build -t "$IMAGE" overnight

say "Starting container $NAME"
docker rm -f "$NAME" >/dev/null 2>&1 || true
TZ_HOST="$(readlink /etc/localtime 2>/dev/null | sed 's#.*/zoneinfo/##')"
set -- -e "TZ=${TZ_HOST:-UTC}"
if [ -n "${CLAUDE_CODE_OAUTH_TOKEN:-}" ]; then set -- "$@" -e CLAUDE_CODE_OAUTH_TOKEN; fi
docker run -d --name "$NAME" --init --shm-size=2g \
  -v "$PROJECT_DIR":"$WORKDIR" \
  -v lifespan-claude-config:/home/node/.claude \
  -v lifespan-npm-cache:/home/node/.npm \
  -v lifespan-tool-cache:/home/node/.cache \
  "$@" "$IMAGE" sleep infinity >/dev/null

CLAUDE_CMD="claude --dangerously-skip-permissions"
if [ -n "${MODEL:-}" ]; then CLAUDE_CMD="$CLAUDE_CMD --model $MODEL"; fi
# --disallowedTools takes several values, so it stays last on the line.
if [ "${ALLOW_WEB:-0}" != 1 ]; then CLAUDE_CMD="$CLAUDE_CMD --disallowedTools WebFetch WebSearch"; fi

HOURS="${CAFFEINATE_HOURS:-10}"
nohup caffeinate -ims -t $(( HOURS * 3600 )) >/dev/null 2>&1 &
say "caffeinate keeps the Mac awake for ${HOURS}h (pid $!). Stay on power, lid open or docked."

cat <<'EOF'

Next, inside Claude Code:
  1. Accept the bypass-mode warning, trust the folder, and log in if asked.
  2. /config: check that "Continue automatically at usage limit" is on.
  3. Paste the /goal line from overnight/GOAL.md. Work starts immediately.
  4. When the first commit lands, detach with Ctrl-b d. Reattach later with: bash overnight/start.sh
EOF
printf 'Press Enter to open the session... '
read -r _
exec docker exec -it "$NAME" tmux new-session -A -s "$SESSION" "$CLAUDE_CMD"
