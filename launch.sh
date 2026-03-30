#!/bin/bash

# Kill old processes to clear ports
pkill -f solochain-template-node
pkill -f "npm run dev"
pkill -f cloudflared

echo "🚀 STARTING SUBSTRATE NEXUS AUTOMATION..."
echo "-----------------------------------------------"

# 1. Start the Blockchain Node (in background)
echo "📦 [1/3] Launching Blockchain Node..."
cargo run --release --bin solochain-template-node -- --dev --tmp > node.log 2>&1 &

# 2. Start the Frontend (in background)
echo "💻 [2/3] Launching Dashboard..."
cd frontend
npm run dev -- --host 127.0.0.1 > frontend.log 2>&1 &
cd ..

# 3. Start the Tunnel & Extract URL
echo "🔗 [3/3] Establishing Secure Tunnel..."
# Check if cloudflared is installed, if not, install it
if ! command -v cloudflared &> /dev/null; then
    echo "   ...Installing Cloudflare Tunnel tool..."
    curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i cloudflared.deb > /dev/null 2>&1
fi

# Run tunnel and save output to log
cloudflared tunnel --url http://localhost:5173 > tunnel.log 2>&1 &

echo "⏳ Waiting for connection (approx 10 seconds)..."
sleep 10

# 4. Find and Print the Magic Link
echo "-----------------------------------------------"
echo "✅ SYSTEM LIVE! CLICK THE LINK BELOW:"
echo "-----------------------------------------------"
grep -o 'https://.*\.trycloudflare.com' tunnel.log | head -n 1
echo "-----------------------------------------------"
echo "⚠️  KEEP THIS TERMINAL OPEN. Press Ctrl+C to stop everything."

# Keep script running to maintain background processes
wait
