#!/bin/bash
echo "🔭 Watchdog Active: Tracking 'stable-production'..."
while true; do
  git fetch origin stable-production > /dev/null 2>&1
  LOCAL=$(git rev-parse HEAD)
  REMOTE=$(git rev-parse origin/stable-production)
  
  if [ "$LOCAL" != "$REMOTE" ]; then
    echo -e "\n🚨 NEW CODE DETECTED FROM JULES!"
    git log HEAD..origin/stable-production --oneline
    echo "----------------------------------------"
    echo "💡 Run './update_nexus.sh' to sync."
    break
  else
    echo -n "."
  fi
  sleep 30
done
