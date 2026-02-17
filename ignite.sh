#!/bin/bash
echo "🚀 Igniting Texas Root..."
./target/release/solochain-template-node --dev --base-path ./db_data --rpc-external --rpc-methods=unsafe > /dev/null
N_PID=$!
echo "⏳ Stabilizing (8s)..."
sleep 8
node monitor.js &
M_PID=$!
trap "kill $N_PID $M_PID; echo -e '\n🛰️ Secured.'; exit" SIGINT SIGTERM
echo "🛰️ System Live. Ctrl+C to stop."
wait
