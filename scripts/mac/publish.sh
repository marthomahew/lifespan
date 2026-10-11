#!/bin/bash
# Owner, on the Mac: put Lifespan on GitHub and publish the built app as a release for testers.
#   bash scripts/mac/publish.sh            (public repository: testers need no GitHub account)
#   bash scripts/mac/publish.sh --private  (testers need access, and the one-line install won't work)
# Needs the GitHub CLI: brew install gh && gh auth login
set -euo pipefail
cd "$(dirname "$0")/../.."
VIS="${1:---public}"
command -v gh >/dev/null || { echo "Install the GitHub CLI first: brew install gh && gh auth login"; exit 1; }
# Zip the built apps (--keepParent: the zip holds Lifespan.app itself, as install.sh expects).
for pair in "darwin-arm64:Lifespan-mac.zip" "darwin-x64:Lifespan-mac-intel.zip"; do
  app="release/Lifespan-${pair%%:*}/Lifespan.app"
  if [ -d "$app" ]; then rm -f "release/${pair#*:}" && ditto -c -k --keepParent "$app" "release/${pair#*:}"; fi
done
[ -f release/Lifespan-mac.zip ] || { echo "No app in release/ yet: run npm run dist:mac first."; exit 1; }

OWNER="$(gh api user -q .login)"
REPO="$OWNER/lifespan"
if gh repo view "$REPO" >/dev/null 2>&1; then
  git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$REPO.git"
  git push -u origin HEAD
else
  gh repo create lifespan "$VIS" --source . --remote origin --push \
    --description "Lifespan: a single-player life simulator for macOS"
fi

VERSION="$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' package.json | head -n 1)"
TAG="v$VERSION-$(git rev-parse --short HEAD)"
sed "s#__REPO__#$REPO#g" scripts/mac/install.sh > release/install.sh
sed "s#<owner>/lifespan#$REPO#g" scripts/mac/uninstall.sh > release/uninstall.sh
assets=(release/Lifespan-mac.zip release/install.sh release/uninstall.sh)
[ -f release/Lifespan-mac-intel.zip ] && assets+=(release/Lifespan-mac-intel.zip)
sed "s#__REPO__#$REPO#g" scripts/mac/TESTERS.md > release/TESTERS.md
gh release create "$TAG" "${assets[@]}" --repo "$REPO" --title "Lifespan $TAG" \
  --notes-file release/TESTERS.md --latest

echo
echo "Published $TAG. Send your tester this:"
echo "  Install:   curl -fsSL https://github.com/$REPO/releases/latest/download/install.sh | bash"
echo "  Uninstall: curl -fsSL https://github.com/$REPO/releases/latest/download/uninstall.sh | bash"
