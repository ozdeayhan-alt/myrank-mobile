#!/usr/bin/env bash
set -euo pipefail

TAG="v1.0.3-play-baseline"
MYRANKAPP="${MYRANKAPP_ROOT:-/root/myrankapp}"
MYRANK_MOBILE="${MYRANK_MOBILE_ROOT:-/root/myrank-mobile}"

echo "Rolling back to ${TAG}..."

for repo in "$MYRANKAPP" "$MYRANK_MOBILE"; do
  echo "==> $repo"
  git -C "$repo" fetch --tags origin 2>/dev/null || true
  git -C "$repo" checkout "$TAG"
done

echo "Done. Restart backend if needed: pm2 restart myrankapp"
