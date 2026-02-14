#!/bin/bash
echo "🚀 Starting Nexus Automation..."

# 1. Fix Directory & Install Dependencies
cd frontend
npm install --save react @polkadot/api @polkadot/types @types/react @types/react-dom

# 2. Add 'dev' script if missing
if ! grep -q '"dev":' package.json; then
  sed -i 's/"scripts": {/"scripts": {\n    "dev": "vite",/' package.json
fi

# 3. Create root tsconfig if missing
cd ..
if [ ! -f tsconfig.json ]; then
  echo '{ "compilerOptions": { "baseUrl": "./frontend", "paths": { "*": ["src/*", "node_modules/*"] } } }' > tsconfig.json
fi

echo "✅ Frontend Repaired. Dependencies installed."
