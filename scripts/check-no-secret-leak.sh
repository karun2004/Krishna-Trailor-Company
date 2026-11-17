#!/usr/bin/env bash
# Usage: scripts/check-no-secret-leak.sh <sentinel> [dir=.next/static]
# Exits non-zero if the sentinel value appears anywhere under dir (client bundle).
set -u
sentinel="${1:?usage: check-no-secret-leak.sh <sentinel> [dir]}"
dir="${2:-.next/static}"
[ -d "$dir" ] || { echo "error: $dir not found (run pnpm build first)" >&2; exit 2; }
if matches=$(grep -rl -F -- "$sentinel" "$dir"); then
  echo "LEAK: sentinel found in client bundle:" >&2
  echo "$matches" >&2
  exit 1
fi
echo "ok: sentinel not found under $dir"
