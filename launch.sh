#!/bin/bash
set -e

# Kill any existing processes
pkill -f solochain-template-node || true
pkill -f "vite" || true

echo "🚀 Starting Substrate Node..."
cargo run --release --bin solochain-template-node -- --dev --tmp --rpc-external --rpc-cors all --rpc-methods=Unsafe > node.log 2>&1 &

echo "💻 Starting Frontend..."
cd frontend
# Ensure dependencies are installed
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run dev -- --host 0.0.0.0 --port 5173 > frontend.log 2>&1 &
cd ..

echo "✅ Node and Frontend are running in the background."
echo "   Node RPC: ws://127.0.0.1:9944"
echo "   Frontend: http://127.0.0.1:5173"
echo "   Logs: node.log, frontend/frontend.log"

# Keep script running
wait
