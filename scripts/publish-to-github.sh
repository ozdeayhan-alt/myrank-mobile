#!/usr/bin/env bash
set -euo pipefail

REPO="ozdeayhan-alt/myrank-mobile"
MOBILE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="/root/myrankapp"

echo "==> Checking GitHub CLI auth..."
if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI not authenticated. Run:"
  echo "  gh auth login --hostname github.com --git-protocol ssh --web"
  exit 1
fi

echo "==> Creating repo ${REPO} (if missing)..."
if gh repo view "${REPO}" >/dev/null 2>&1; then
  echo "Repo already exists."
else
  gh repo create "${REPO}" \
    --public \
    --description "MyRank mobile app (Expo React Native)"
fi

echo "==> Pushing mobile app..."
cd "${MOBILE_DIR}"
git remote set-url origin "git@github.com:${REPO}.git"
git branch -M main
git push -u origin main

if [ -d "${APP_DIR}/.git" ]; then
  echo "==> Removing temporary myrank-mobile branch from myrankapp..."
  cd "${APP_DIR}"
  git push origin --delete myrank-mobile || true
fi

echo "==> Done: https://github.com/${REPO}"
