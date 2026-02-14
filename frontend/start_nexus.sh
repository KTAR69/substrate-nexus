#!/bin/bash
echo "🚀 Auto-Repairing Nexus..."
# 1. Install missing types and modules
cd frontend && npm install --save-dev @types/react @types/react-dom
# 2. Fix the missing 'dev' script
sed -i 's/"scripts": {/"scripts": {\n    "dev": "vite",/' package.json
# 3. Start everything
echo "✅ Setup Complete. Launching Node and Dashboard..."
npm run dev -- --host & cd .. && cargo run --release -- --dev --tmp --rpc-external --rpc-cors all
