#!/bin/bash
clear
echo "🌅 TEXAS ROOT RECOVERY BRIEFING | $(date)"
echo "------------------------------------------"
if tmux has-session -t texas_root 2>/dev/null; then
    echo "⛓️  NODE SESSION: ✅ ONLINE"
else
    echo "⛓️  NODE SESSION: ❌ OFFLINE"
fi
[ -f jules_watch.log ] && echo "🛰️  WATCHDOG:     ✅ LOG DETECTED" || echo "🛰️  WATCHDOG:     🟡 LOG RESET"
echo "------------------------------------------"
