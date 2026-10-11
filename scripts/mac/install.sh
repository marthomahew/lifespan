#!/bin/bash
# Lifespan for testers: download the latest release, install it in ~/Applications and open it.
#   curl -fsSL https://github.com/__REPO__/releases/latest/download/install.sh | bash
# (publish.sh fills in the repository when it uploads this file to a release.)
set -euo pipefail
REPO="${LIFESPAN_REPO:-__REPO__}"
# Apple silicon even when Terminal runs under Rosetta.
if [ "$(sysctl -n hw.optional.arm64 2>/dev/null || echo 0)" = "1" ]; then
  ZIP=Lifespan-mac.zip
else
  ZIP=Lifespan-mac-intel.zip
fi
APPS="$HOME/Applications"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "Downloading Lifespan ($ZIP)…"
if ! curl -fL --progress-bar -o "$TMP/$ZIP" "https://github.com/$REPO/releases/latest/download/$ZIP"; then
  echo
  echo "Sorry: couldn't download $ZIP from github.com/$REPO."
  [ "$ZIP" = Lifespan-mac-intel.zip ] && echo "This looks like an Intel Mac, and this release may only be built for Apple silicon."
  echo "Check your internet connection, or ask whoever sent you this for a new link."
  exit 1
fi

pkill -x Lifespan 2>/dev/null && sleep 1 || true
mkdir -p "$APPS"
rm -rf "$APPS/Lifespan.app"
ditto -x -k "$TMP/$ZIP" "$APPS/"
# Not from the App Store: clear the download flag and sign it for this Mac only.
xattr -cr "$APPS/Lifespan.app"
codesign --force --deep --sign - "$APPS/Lifespan.app" 2>/dev/null

echo "Installed: $APPS/Lifespan.app"
echo "To open it again later: press ⌘ Space, type Lifespan, press Return."
echo "To remove it and everything it saved later:"
echo "  curl -fsSL https://github.com/$REPO/releases/latest/download/uninstall.sh | bash"
open "$APPS/Lifespan.app"
