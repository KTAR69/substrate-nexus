#!/bin/bash

# 1. Define where the binary will be
BINARY=./target/release/solochain-template-node

# 2. Check if the build is actually done
if [ ! -f "$BINARY" ]; then
  echo "❌ Error: The binary is not built yet!"
  echo "👉 Wait for Terminal 1 to finish, then run this again."
  exit 1
fi

echo "🏗️  The Factory is open. Generating Team Identities..."

# 3. Generate GIGA's Keys
echo "🔹 Hiring Giga..."
GIGA_OUT=$($BINARY key inspect //Giga 2>&1)
GIGA_ADDR=$(echo "$GIGA_OUT" | grep "SS58 Address" | awk '{print $3}')
echo "   ✅ Giga's ID: $GIGA_ADDR"

# 4. Generate BYTE's Keys
echo "🔹 Hiring Byte..."
BYTE_OUT=$($BINARY key inspect //Byte 2>&1)
BYTE_ADDR=$(echo "$BYTE_OUT" | grep "SS58 Address" | awk '{print $3}')
echo "   ✅ Byte's ID: $BYTE_ADDR"

# 5. Inject them into the Funding Script automatically
echo "💉 Injecting IDs into fund_team.js..."

# Use sed to replace the placeholders
sed -i "s/REPLACE_WITH_GIGA_ADDRESS/$GIGA_ADDR/g" nexus-hub/protocols/fund_team.js
sed -i "s/REPLACE_WITH_BYTE_ADDRESS/$BYTE_ADDR/g" nexus-hub/protocols/fund_team.js

echo "-----------------------------------------------------"
echo "🚀 MISSION READY:"
echo "1. Run './target/release/solochain-template-node --dev' in Terminal 1."
echo "2. Run 'node nexus-hub/protocols/monitor_team.js' in Terminal 2."
echo "3. Run 'node nexus-hub/protocols/fund_team.js' in Terminal 3."
echo "-----------------------------------------------------"
