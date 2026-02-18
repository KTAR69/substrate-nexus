#!/bin/bash
echo "🔄 UPDATING..."
fuser -k 9944/tcp > /dev/null 2>&1
pkill -f "solochain-template-node" > /dev/null 2>&1
pkill -f "node monitor.js" > /dev/null 2>&1
git pull origin stable-production
./target/release/solochain-template-node purge-chain --dev -y > /dev/null 2>&1
echo "🛠️ Rebuilding..."
cargo build --release && ./ignite.sh || echo "❌ Build Failed."