#!/bin/bash
# PreToolUse hook on Bash: refuses commands while Claude's scratch space (/tmp/claude-*, any UID) is over the limit, so
# runs can't fill the disk. Commands that inspect or free space (starting with rm, du, df, ls or find) always pass.
# Exit 2 blocks the call and hands stderr to Claude. Under the limit it costs one du; node starts only when over.
LIMIT_KB=$((20 * 1024 * 1024))  # 20 GB

used_kb=$(du -sck /tmp/claude-* 2>/dev/null | tail -n 1 | cut -f1)
used_kb=${used_kb:-0}
[ "$used_kb" -le "$LIMIT_KB" ] && exit 0

cmd=$(node -e 'let s="";process.stdin.on("data",(d)=>(s+=d)).on("end",()=>{try{process.stdout.write(String(JSON.parse(s).tool_input?.command??""))}catch{}})')
if printf '%s' "$cmd" | grep -Eq '^[[:space:]]*(rm|du|df|ls|find)([[:space:]]|$)'; then exit 0; fi

size=$(awk -v k="$used_kb" 'BEGIN { printf "%.1f GB", k / 1048576 }')
limit=$(awk -v k="$LIMIT_KB" 'BEGIN { printf "%.0f GB", k / 1048576 }')
echo "Scratch space (/tmp/claude-*) is $size, over the $limit limit. Delete old runs from the scratchpad before continuing; commands starting with rm, du, df, ls or find still run." >&2
exit 2
