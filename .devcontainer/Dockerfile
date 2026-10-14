# The Claude Code dev container for lifespan (scripts/agent.sh builds and runs it): Debian 12 + Node 22, the libraries
# Electron and Chromium need under Xvfb, tmux, and Claude Code. Runs as the non-root `node` user because bypass mode refuses root.
FROM node:22-bookworm

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      git jq ripgrep curl ca-certificates procps psmisc tzdata unzip zip tmux \
      python3 make g++ \
      xvfb xauth \
      libgtk-3-0 libnss3 libxss1 libasound2 libgbm1 libxshmfence1 libdrm2 \
      libatk1.0-0 libatk-bridge2.0-0 libcups2 libxkbcommon0 libxcomposite1 \
      libxdamage1 libxfixes3 libxrandr2 libxtst6 libpango-1.0-0 libcairo2 \
      libatspi2.0-0 libsecret-1-0 \
      fonts-liberation fonts-noto-color-emoji fonts-dejavu-core \
 && rm -rf /var/lib/apt/lists/*

# Anything else Playwright's Chromium wants. The browsers themselves are installed per project.
RUN npx -y playwright@latest install-deps chromium \
 && rm -rf /var/lib/apt/lists/* /root/.npm

# Claude Code. Auto-update is off (below) so the CLI only changes on a rebuild.
RUN npm install -g @anthropic-ai/claude-code && npm cache clean --force

# GitHub over HTTPS: git reads a token from the Claude config volume (survives rebuilds), if the owner put one there.
RUN git config --system credential.https://github.com.helper \
      '!f() { [ -s /home/node/.claude/github-token ] && echo username=x-access-token && echo "password=$(cat /home/node/.claude/github-token)"; }; f'
RUN git config --system --add safe.directory '*' \
 && mkdir -p /workspaces/lifespan /home/node/.claude /home/node/.cache /home/node/.npm \
 && chown -R node:node /workspaces /home/node

ENV CLAUDE_CONFIG_DIR=/home/node/.claude \
    DISABLE_AUTOUPDATER=1 \
    BASH_DEFAULT_TIMEOUT_MS=600000 \
    BASH_MAX_TIMEOUT_MS=2700000 \
    GIT_AUTHOR_NAME="Agent" GIT_AUTHOR_EMAIL="agent@lifespan.local" \
    GIT_COMMITTER_NAME="Agent" GIT_COMMITTER_EMAIL="agent@lifespan.local" \
    npm_config_update_notifier=false npm_config_fund=false npm_config_audit=false

USER node
WORKDIR /workspaces/lifespan
CMD ["sleep", "infinity"]
