#!/bin/bash
# The Claude Code dev container for Lifespan, run from the Mac (needs OrbStack or Docker).
#
#   bash scripts/agent.sh            attach to Claude (starts the container and session if needed)
#   bash scripts/agent.sh shell      a plain shell in the container
#   bash scripts/agent.sh status     is the container up, is Claude running
#   bash scripts/agent.sh stop       stop the container (volumes and the folder are kept)
#   bash scripts/agent.sh rebuild    rebuild the image and recreate the container (after a Dockerfile change)
#
# It reuses what exists: the image is built only if missing, the container is created only if
# missing and started if stopped, and an existing Claude session is reattached, never replaced.
# It never commits, tags or touches git. Detach from Claude with Ctrl-b d.
#
# Optional env: MODEL (opus, sonnet, fable or a model id), ALLOW_WEB=1 (enable WebFetch and
# WebSearch), AWAKE_HOURS (keep the Mac awake this long with caffeinate), CLAUDE_CODE_OAUTH_TOKEN.
# Written for the bash 3.2 that ships with macOS.
set -eo pipefail

cd "$(dirname "$0")/.."
PROJECT_DIR="$(pwd)"
NAME=lifespan-agent
IMAGE=lifespan-agent:latest
WORKDIR=/workspaces/lifespan
SESSION=claude
# Sessions started by overnight/start.sh are called "night": reattach to one if it's alive.
OLD_SESSION=night

say() { printf '\033[1m==> %s\033[0m\n' "$*"; }
die() { printf '\033[31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }

case "${1:-attach}" in
  attach | start | shell | status | stop | rebuild) ;;
  *)
    sed -n '2,8p' "$0" | sed 's/^# \{0,1\}//'
    exit 2
    ;;
esac

command -v docker >/dev/null 2>&1 || die "docker not found. Start OrbStack."
docker info >/dev/null 2>&1 || die "Docker engine not reachable. Is OrbStack running?"

exists() { docker container inspect "$NAME" >/dev/null 2>&1; }
running() { [ "$(docker container inspect -f '{{.State.Running}}' "$NAME" 2>/dev/null)" = true ]; }
has_session() { docker exec "$NAME" tmux has-session -t "$1" >/dev/null 2>&1; }

build_image() {
  say "Building image $IMAGE (several minutes the first time)"
  docker build -t "$IMAGE" overnight
}

create_container() {
  docker image inspect "$IMAGE" >/dev/null 2>&1 || build_image
  say "Creating container $NAME"
  TZ_HOST="$(readlink /etc/localtime 2>/dev/null | sed 's#.*/zoneinfo/##')"
  set -- -e "TZ=${TZ_HOST:-UTC}"
  if [ -n "${CLAUDE_CODE_OAUTH_TOKEN:-}" ]; then set -- "$@" -e CLAUDE_CODE_OAUTH_TOKEN; fi
  docker run -d --name "$NAME" --init --shm-size=2g \
    -v "$PROJECT_DIR":"$WORKDIR" \
    -v lifespan-claude-config:/home/node/.claude \
    -v lifespan-npm-cache:/home/node/.npm \
    -v lifespan-tool-cache:/home/node/.cache \
    "$@" "$IMAGE" sleep infinity >/dev/null
}

ensure_up() {
  if ! exists; then
    create_container
  elif ! running; then
    say "Starting container $NAME"
    docker start "$NAME" >/dev/null
  fi
}

keep_awake() {
  [ -n "${AWAKE_HOURS:-}" ] || return 0
  nohup caffeinate -ims -t $((AWAKE_HOURS * 3600)) >/dev/null 2>&1 &
  say "caffeinate keeps the Mac awake for ${AWAKE_HOURS}h (pid $!)"
}

claude_cmd() {
  local cmd="claude --dangerously-skip-permissions"
  if [ -n "${MODEL:-}" ]; then cmd="$cmd --model $MODEL"; fi
  # --disallowedTools takes several values, so it stays last on the line.
  if [ "${ALLOW_WEB:-0}" != 1 ]; then cmd="$cmd --disallowedTools WebFetch WebSearch"; fi
  printf '%s' "$cmd"
}

case "${1:-attach}" in
  attach | start)
    ensure_up
    keep_awake
    if has_session "$OLD_SESSION"; then
      say "Reattaching to the running session (Ctrl-b d to detach)"
      exec docker exec -it "$NAME" tmux attach -t "$OLD_SESSION"
    fi
    if has_session "$SESSION"; then
      say "Reattaching to the running session (Ctrl-b d to detach)"
    else
      say "Opening Claude Code in bypass mode (Ctrl-b d to detach; it keeps running)"
    fi
    exec docker exec -it -w "$WORKDIR" "$NAME" tmux new-session -A -s "$SESSION" "$(claude_cmd)"
    ;;
  shell)
    ensure_up
    exec docker exec -it -w "$WORKDIR" "$NAME" bash
    ;;
  status)
    if ! exists; then
      echo "Container $NAME: not created (run: bash scripts/agent.sh)"
      exit 0
    fi
    if running; then echo "Container $NAME: running"; else echo "Container $NAME: stopped"; fi
    if running && { has_session "$SESSION" || has_session "$OLD_SESSION"; }; then
      echo "Claude session: running (bash scripts/agent.sh to attach)"
    elif running; then
      echo "Claude session: none"
    fi
    ;;
  stop)
    if running; then
      say "Stopping $NAME (any Claude session in it ends)"
      docker stop "$NAME" >/dev/null
    else
      echo "Container $NAME is not running."
    fi
    ;;
  rebuild)
    if running && { has_session "$SESSION" || has_session "$OLD_SESSION"; }; then
      printf 'A Claude session is running in %s and will end. Continue? [y/N] ' "$NAME"
      read -r answer
      [ "$answer" = y ] || [ "$answer" = Y ] || exit 1
    fi
    build_image
    docker rm -f "$NAME" >/dev/null 2>&1 || true
    create_container
    say "Rebuilt. Attach with: bash scripts/agent.sh"
    ;;
esac
