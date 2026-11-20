#!/usr/bin/env bash
# Serialize commands that share port 3100, .next and test-results (e2e, build). Usage: scripts/with-lock.sh <cmd...>
LOCK=/tmp/ktc-shared.lock
until mkdir "$LOCK" 2>/dev/null; do sleep 2; done
trap 'rmdir "$LOCK"' EXIT
"$@"
