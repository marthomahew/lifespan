#!/bin/bash
# Morning, on the Mac: sign the app the agent built (ad hoc) and install it.
set -eo pipefail
cd "$(dirname "$0")/.."
APP_SRC="$(find release-final release -maxdepth 3 -name '*.app' -type d -prune 2>/dev/null | head -n 1 || true)"
[ -n "$APP_SRC" ] || { echo "No .app in release-final/ or release/. Build one natively with: bash overnight/build-mac.sh"; exit 1; }
APP_NAME="$(basename "$APP_SRC")"
DEST=/Applications
[ -w "$DEST" ] || DEST="$HOME/Applications"
mkdir -p "$DEST"
echo "Installing $APP_SRC to $DEST/$APP_NAME"
rm -rf "${DEST:?}/$APP_NAME"
ditto "$APP_SRC" "$DEST/$APP_NAME"
xattr -cr "$DEST/$APP_NAME" 2>/dev/null || true
codesign --force --deep --sign - "$DEST/$APP_NAME"
codesign --verify --deep --strict "$DEST/$APP_NAME" && echo "Ad hoc signature OK"
open "$DEST/$APP_NAME"
