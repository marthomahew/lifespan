#!/bin/bash
# Remove Lifespan completely: the app, saved lives, settings, caches and logs. Nothing else is touched.
#   curl -fsSL https://github.com/<owner>/lifespan/releases/latest/download/uninstall.sh | bash
set -u
shopt -s nullglob
ID=dev.local.lifespan
L="$HOME/Library"

pkill -x Lifespan 2>/dev/null && sleep 1
defaults delete "$ID" >/dev/null 2>&1

targets=(
  "$HOME/Applications/Lifespan.app"
  "/Applications/Lifespan.app"
  "$L/Application Support/Lifespan"
  "$L/Caches/Lifespan"
  "$L/Logs/Lifespan"
  "$L/Caches/$ID"*
  "$L/Preferences/$ID"*.plist
  "$L/Saved Application State/$ID"*
  "$L/HTTPStorages/$ID"*
  "$L/WebKit/$ID"*
  "$HOME/Downloads/Lifespan-mac.zip"
  "$HOME/Downloads/Lifespan-mac-intel.zip"
)
removed=0
for t in "${targets[@]}"; do
  if [ -e "$t" ]; then
    rm -rf "$t" && echo "Removed $t" && removed=$((removed + 1))
  fi
done
# ~/Applications goes too, if Lifespan was the only thing in it.
rmdir "$HOME/Applications" 2>/dev/null && echo "Removed the empty $HOME/Applications folder"

if [ "$removed" -eq 0 ]; then echo "Lifespan isn't installed: nothing to remove."; else echo "Lifespan is gone. Thanks for testing!"; fi
