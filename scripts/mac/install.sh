#!/bin/bash
# Lifespan for testers: download the latest release, install it in ~/Applications and open it.
#   curl -fsSL https://github.com/__REPO__/releases/latest/download/install.sh | bash
# (publish.sh fills in the repository when it uploads this file to a release.)
set -euo pipefail
REPO="${LIFESPAN_REPO:-__REPO__}"
case "$(uname -m)" in
  arm64) ZIP=Lifespan-mac.zip ;;
  *) ZIP=Lifespan-mac-intel.zip ;;
esac
APPS="$HOME/Applications"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "Downloading Lifespan ($ZIP)…"
curl -fL --progress-bar -o "$TMP/$ZIP" "https://github.com/$REPO/releases/latest/download/$ZIP"

pkill -x Lifespan 2>/dev/null && sleep 1 || true
mkdir -p "$APPS"
rm -rf "$APPS/Lifespan.app"
ditto -x -k "$TMP/$ZIP" "$APPS/"
# Not from the App Store: clear the download flag and sign it for this Mac only.
xattr -cr "$APPS/Lifespan.app"
codesign --force --deep --sign - "$APPS/Lifespan.app" 2>/dev/null

echo "Installed: $APPS/Lifespan.app"
echo "To remove it and everything it saved later:"
echo "  curl -fsSL https://github.com/$REPO/releases/latest/download/uninstall.sh | bash"
open "$APPS/Lifespan.app"
