#!/bin/bash
# From the Mac:  cd ~/projects/lifespan && ./start.sh
# Starts the container (reusing it if it exists) and opens Claude Code in bypass mode.
# Extra commands pass through: ./start.sh status | shell | stop | rebuild
exec bash "$(dirname "$0")/scripts/agent.sh" "$@"
