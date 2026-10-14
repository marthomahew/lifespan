#!/bin/bash
# From the Mac:  cd ~/projects/lifespan && ./stop.sh
# Ends the Claude session and stops the container. The folder, Claude's login and history are kept.
exec bash "$(dirname "$0")/scripts/agent.sh" stop "$@"
