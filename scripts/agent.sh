#!/bin/bash
# The Claude Code dev container for this project, run from the Mac (needs OrbStack).
#
#   ./start.sh            attach to Claude (starts the container and session if needed)
#   ./start.sh shell      a plain shell in the container
#   ./start.sh status     is the container up, is Claude running, how much disk it uses (warns past 30 GB)
#   ./start.sh stop       stop the container (same as ./stop.sh; the folder, volumes and history are kept)
#   ./start.sh rebuild    rebuild the image and recreate the container (after a Dockerfile change)
#
# It reuses what exists: the image is built only if missing, the container is created only if missing and started
# if stopped, and an existing Claude session is reattached, never replaced. It never commits, tags or touches git.
# A new Claude session continues the last conversation in the project when there is one. Detach with Ctrl-b d.
#
# Optional env: MODEL and EFFORT (override the defaults below), REMOTE=0 (no Remote Control), FRESH=1 (start a new
# conversation instead of continuing the last one), CLAUDE_CODE_OAUTH_TOKEN.
# Written for the bash 3.2 that ships with macOS.
set -eo pipefail

cd "$(dirname "$0")/.."
PROJECT_DIR="$(pwd)"

# ---- Project settings: the only part that differs between projects -----------------------------------------------
PROJECT=lifespan
DEFAULT_MODEL=      # empty: Claude's own default
DEFAULT_EFFORT=    # empty: Claude's own default
# Runs on attach and shell once the container is up, e.g. to restart a background job. Must return quickly.
project_up() { :; }
# Runs before the container stops, e.g. to pause a job so it saves cleanly.
project_stop() { :; }
# --------------------------------------------------------------------------------------------------------------------

NAME="$PROJECT-agent"
IMAGE="$PROJECT-agent:latest"
WORKDIR="/workspaces/$PROJECT"
SESSION=claude
# Claude files a project's transcripts and memory under its working folder with every non-alphanumeric turned into -.
PROJECT_KEY="$(printf '%s' "$WORKDIR" | sed 's/[^a-zA-Z0-9]/-/g')"

say() { printf '\033[1m==> %s\033[0m\n' "$*"; }
die() { printf '\033[31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }

case "${1:-attach}" in
  attach | start | shell | status | stop | rebuild) ;;
  *)
    sed -n '2,8p' "$0" | sed 's/^# \{0,1\}//'
    exit 2
    ;;
esac

# OrbStack not running? Start it and wait for the Docker engine (up to a minute).
if ! docker info >/dev/null 2>&1; then
  if command -v orb >/dev/null 2>&1; then
    say "Starting OrbStack"
    orb start >/dev/null 2>&1 || true
  elif [ -d /Applications/OrbStack.app ] || [ -d "$HOME/Applications/OrbStack.app" ]; then
    say "Starting OrbStack"
    open -ga OrbStack
  else
    die "OrbStack isn't installed (or docker isn't on your PATH)."
  fi
  for _ in $(seq 1 60); do
    docker info >/dev/null 2>&1 && break
    sleep 1
  done
  docker info >/dev/null 2>&1 || die "OrbStack didn't come up within a minute. Open it by hand and try again."
fi

exists() { docker container inspect "$NAME" >/dev/null 2>&1; }
running() { [ "$(docker container inspect -f '{{.State.Running}}' "$NAME" 2>/dev/null)" = true ]; }
has_session() { docker exec "$NAME" tmux has-session -t "$1" >/dev/null 2>&1; }

# The container's writable layer holds /tmp, where Claude's scratchpads and test temp files live (the project folder
# and the volumes are not in it). Its size as docker reports it, e.g. "31.2GB"; empty when unknown.
layer_size() {
  docker ps -a --size --filter "name=^${NAME}\$" --format '{{.Size}}' 2>/dev/null | head -n 1 | sed 's/ .*//' || true
}
# Warns past 30 GB. It only warns: it never blocks a start and never deletes anything.
check_disk() {
  local size gb
  size="$(layer_size)"
  [ -n "$size" ] || return 0
  gb="$(printf '%s\n' "$size" | awk '{ v = $0 + 0; u = $0; sub(/^[0-9.]+/, "", u); f = (u == "TB") ? 1000 : (u == "GB") ? 1 : (u == "MB") ? 0.001 : (u == "kB") ? 0.000001 : 0; printf "%.2f", v * f }')"
  if awk -v g="$gb" 'BEGIN { exit !(g > 30) }'; then
    printf '\033[33mWARNING: the container is using %s of disk (its writable layer: /tmp, the scratchpads, test files), over 30 GB.\n' "$size" >&2
    printf 'See what is in it:  docker exec %s sh -c '"'"'du -xh / --max-depth=3 2>/dev/null | sort -h | tail'"'"'\033[0m\n' "$NAME" >&2
  fi
  return 0
}

build_image() {
  say "Building image $IMAGE (several minutes the first time)"
  docker build -t "$IMAGE" .devcontainer
}

create_container() {
  docker image inspect "$IMAGE" >/dev/null 2>&1 || build_image
  say "Creating container $NAME"
  TZ_HOST="$(readlink /etc/localtime 2>/dev/null | sed 's#.*/zoneinfo/##')"
  set -- -e "TZ=${TZ_HOST:-UTC}"
  if [ -n "${CLAUDE_CODE_OAUTH_TOKEN:-}" ]; then set -- "$@" -e CLAUDE_CODE_OAUTH_TOKEN; fi
  docker run -d --name "$NAME" --init --shm-size=2g \
    -v "$PROJECT_DIR":"$WORKDIR" \
    -v "$PROJECT-claude-config":/home/node/.claude \
    -v "$PROJECT-npm-cache":/home/node/.npm \
    -v "$PROJECT-tool-cache":/home/node/.cache \
    "$@" "$IMAGE" sleep infinity >/dev/null
  # A first container gets the project's Claude memory (not transcripts) from .devcontainer/claude-seed, if present.
  if [ -d .devcontainer/claude-seed ] && ! docker exec "$NAME" sh -c "ls /home/node/.claude/projects/$PROJECT_KEY/memory/MEMORY.md >/dev/null 2>&1"; then
    say "Seeding the project's Claude memory into the container"
    docker cp .devcontainer/claude-seed/. "$NAME":/home/node/.claude/
    docker exec -u root "$NAME" chown -R node:node /home/node/.claude
  fi
  # GitHub pushes, for projects that have a token: it lives in the config volume (git-credentials), and a new
  # container's git is pointed at it again. Without that file the agent can commit but not push.
  docker exec "$NAME" sh -c 'f=/home/node/.claude/git-credentials; [ -s "$f" ] && git config --global credential.helper "store --file $f"' || true
}

ensure_up() {
  if ! exists; then
    create_container
  elif ! running; then
    say "Starting container $NAME"
    docker start "$NAME" >/dev/null
  fi
}

# True when the container holds a saved conversation for the project (what `claude --continue` picks up).
has_conversation() {
  docker exec "$NAME" sh -c "ls /home/node/.claude/projects/$PROJECT_KEY/*.jsonl >/dev/null 2>&1"
}

claude_cmd() {
  local cmd="claude --dangerously-skip-permissions" model="${MODEL:-$DEFAULT_MODEL}" effort="${EFFORT:-$DEFAULT_EFFORT}"
  # Continue the last conversation (FRESH=1 to start a new one). Skipped when nothing is saved yet, since
  # --continue exits with an error in that case.
  if [ "${FRESH:-0}" != 1 ] && has_conversation; then cmd="$cmd --continue"; fi
  # Remote Control: pick the session up from claude.ai/code or the Claude app (REMOTE=0 to skip).
  if [ "${REMOTE:-1}" != 0 ]; then cmd="$cmd --remote-control $PROJECT"; fi
  if [ -n "$model" ]; then cmd="$cmd --model $model"; fi
  if [ -n "$effort" ]; then cmd="$cmd --effort $effort"; fi
  printf '%s' "$cmd"
}

case "${1:-attach}" in
  attach | start)
    ensure_up
    check_disk
    project_up
    if has_session "$SESSION"; then
      say "Reattaching to the running session (Ctrl-b d to detach)"
    else
      say "Opening Claude Code in bypass mode (Ctrl-b d to detach; it keeps running)"
    fi
    exec docker exec -it -w "$WORKDIR" "$NAME" tmux new-session -A -s "$SESSION" "$(claude_cmd)"
    ;;
  shell)
    ensure_up
    check_disk
    project_up
    exec docker exec -it -w "$WORKDIR" "$NAME" bash
    ;;
  status)
    if ! exists; then
      echo "Container $NAME: not created (run: ./start.sh)"
      exit 0
    fi
    if running; then echo "Container $NAME: running"; else echo "Container $NAME: stopped"; fi
    layer="$(layer_size)"
    echo "Disk (writable layer): ${layer:-unknown}"
    check_disk
    if running && has_session "$SESSION"; then
      echo "Claude session: running (./start.sh to attach)"
    elif running; then
      echo "Claude session: none"
    fi
    ;;
  stop)
    if ! running; then
      echo "Container $NAME is not running."
      exit 0
    fi
    project_stop
    if has_session "$SESSION"; then
      say "Ending the Claude session (./start.sh continues the conversation)"
    fi
    say "Stopping $NAME"
    docker stop -t 30 "$NAME" >/dev/null
    say "Stopped. The folder, Claude's login and history are kept; ./start.sh picks it all up again."
    ;;
  rebuild)
    if running && has_session "$SESSION"; then
      printf 'A Claude session is running in %s and will end. Continue? [y/N] ' "$NAME"
      read -r answer
      [ "$answer" = y ] || [ "$answer" = Y ] || exit 1
    fi
    build_image
    docker rm -f "$NAME" >/dev/null 2>&1 || true
    create_container
    say "Rebuilt. Attach with: ./start.sh"
    ;;
esac
