#!/bin/bash
# Run from a terminal with network. Pushes pathfinder-etf to anthonylin99/prometheus-portfolio.
set -e
cd "$(dirname "$0")/.."
echo "Repo: $(pwd)"
echo "Remote: $(git remote get-url origin)"
echo "Branch: main"
echo "Pushing..."
git push -u origin main
echo "Done. Verify: gh repo clone anthonylin99/prometheus-portfolio /tmp/pp-verify && git -C /tmp/pp-verify log --oneline -5"
