#!/bin/bash
# Fallback, on the Mac: build the app natively from HEAD (or a ref you pass), then install it.
# Needs Node on the Mac (brew install node).
set -eo pipefail
cd "$(dirname "$0")/.."
command -v npm >/dev/null 2>&1 || { echo "npm not found. Install Node (brew install node), or install the container-built app with install-mac.sh"; exit 1; }
REF="${1:-HEAD}"
git rev-parse -q --verify "$REF" >/dev/null || REF=HEAD
BUILD_DIR="$(mktemp -d)/lifespan"
echo "Building $REF ($(git rev-parse --short "$REF")) in $BUILD_DIR"
git clone -q . "$BUILD_DIR"
git -C "$BUILD_DIR" checkout -q "$REF"
( cd "$BUILD_DIR" && npm ci && npm run dist:mac )
APP="$(find "$BUILD_DIR/release" -maxdepth 3 -name '*.app' -type d -prune 2>/dev/null | head -n 1 || true)"
[ -n "$APP" ] || { echo "dist:mac produced no .app"; exit 1; }
rm -rf release-final && mkdir -p release-final
ditto "$APP" "release-final/$(basename "$APP")"
exec bash overnight/install-mac.sh
