# Agent Control Mode System

## Overview

Giga and Byte can dynamically switch between **Player Mode** (manual control) and **AI Mode** (NVIDIA NIM assisted). This allows flexible gameplay where journalists can take direct control or let AI assist.

---

## Agent Roles & Default Modes

| Agent | Role | Default Mode | Can Switch? |
|-------|------|--------------|-------------|
| **Giga** | Web3 Podcast Journalist | **Player** | ✅ Yes |
| **Byte** | Web3 Podcast Journalist | **AI** | ✅ Yes |
| **Jules** | AI Assistant | **AI** | ❌ No (always AI) |
| **OffRoadSDV** | DePIN Monitor Vehicle | **AI** | ❌ No (always AI) |

---

## How It Works

### Control Mode Storage

Each agent's control mode is stored in Firestore `metabolic_state` collection:

```javascript
{
  "agent_did": "did:key:z6Mkp...",
  "control_mode": "player",  // or "ai"
  "last_updated": "2026-03-31T12:00:00Z",
  "battery": 85,
  "location": {"x": 100, "y": 200, "z": 50},
  "status": "operational"
}
```

### nimRouter Logic

```javascript
// Check agent's control mode
const agentStateDoc = await db.collection('metabolic_state').doc(agentDid).get();
const controlMode = agentStateDoc.data().control_mode || 'ai';

if (controlMode === 'player') {
    // Skip NVIDIA NIM - player is in control
    return null;
}

// Proceed with AI inference
const response = await callNvidiaAPI(...);
```

---

## Setting Control Modes

### Method 1: Firestore Console (Manual)

1. Go to Firebase Console: https://console.firebase.google.com/project/substrate-nexus-9182/firestore
2. Navigate to `metabolic_state` collection
3. Find agent document (by DID)
4. Update `control_mode` field:
   - `"player"` - Manual control
   - `"ai"` - AI-assisted

### Method 2: HTTP API (Programmatic)

Create a Cloud Function to toggle modes:

```javascript
exports.setControlMode = functions.https.onRequest(async (req, res) => {
    const { agent_did, mode } = req.body;
    
    if (!['player', 'ai'].includes(mode)) {
        return res.status(400).json({ error: 'Invalid mode' });
    }
    
    await db.collection('metabolic_state').doc(agent_did).set({
        control_mode: mode,
        last_updated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    res.json({ success: true, agent_did, mode });
});
```

### Method 3: UE5 Blueprint (In-Game)

Add a Blueprint function to toggle control mode:

```
Function: ToggleControlMode
Input: AgentDID (String)
Output: NewMode (String)

1. Get current mode from metabolic_state
2. Toggle: player → ai, ai → player
3. HTTP POST to setControlMode endpoint
4. Update UI indicator
```

### Method 4: Mobile App (Future Phase 2)

Flutter app with toggle button:
- Tap agent avatar
- Toggle switch: 🎮 Player ↔️ 🤖 AI
- Updates Firestore in real-time

---

## Use Cases

### Scenario 1: Giga Takes Control (Default)

**Setup**:
```javascript
// Firestore: metabolic_state/did:key:z6MkpJDdfoNfdkL8TECYLRFuQyHAVVsgHGPDBWe211dcSTuX
{
  "control_mode": "player",
  "agent_did": "did:key:z6MkpJDdfoNfdkL8TECYLRFuQyHAVVsgHGPDBWe211dcSTuX"
}
```

**Behavior**:
- Giga sends telemetry to vconIngest ✅
- nimRouter checks mode → sees "player" → skips AI ✅
- No NVIDIA NIM commands generated ✅
- Player controls Giga via keyboard/gamepad ✅

### Scenario 2: Byte in AI Mode (Default)

**Setup**:
```javascript
// Firestore: metabolic_state/did:key:z6MkrWdFR9FLW4FPPvNYVxGhxD7Ey3Ey3Ey3Ey3Ey3Ey3Ey
{
  "control_mode": "ai",
  "agent_did": "did:key:z6MkrWdFR9FLW4FPPvNYVxGhxD7Ey3Ey3Ey3Ey3Ey3Ey3Ey"
}
```

**Behavior**:
- Byte sends telemetry to vconIngest ✅
- nimRouter checks mode → sees "ai" → proceeds ✅
- NVIDIA NIM generates commands ✅
- Byte executes AI commands autonomously ✅

### Scenario 3: Switching Mid-Game

**Player wants to switch Giga to AI mode**:

1. Press "Toggle AI" button in UE5
2. Blueprint calls setControlMode API
3. Firestore updates: `control_mode: "player"` → `"ai"`
4. Next telemetry event triggers NVIDIA NIM
5. Giga starts receiving AI commands

**Player wants to take back control**:

1. Press "Take Control" button
2. Firestore updates: `control_mode: "ai"` → `"player"`
3. NVIDIA NIM stops generating commands
4. Player controls Giga directly

---

## Initial Setup (After Deployment)

### Set Default Modes

Run this script to initialize control modes:

```javascript
// init_control_modes.js
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

const agents = [
    {
        did: 'did:key:z6MkpJDdfoNfdkL8TECYLRFuQyHAVVsgHGPDBWe211dcSTuX',
        name: 'Giga',
        control_mode: 'player'  // Default: Player controlled
    },
    {
        did: 'did:key:z6MkrWdFR9FLW4FPPvNYVxGhxD7Ey3Ey3Ey3Ey3Ey3Ey3Ey',
        name: 'Byte',
        control_mode: 'ai'  // Default: AI assisted
    },
    {
        did: 'did:key:z6MkfwXVLSVYHN8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Y',
        name: 'Jules',
        control_mode: 'ai'  // Always AI
    },
    {
        did: 'did:key:z6MkoXVLSVYHN8YxGhxD7Ey3Ey3Ey3Ey3Ey3Ey3Ey3Ey3Ey',
        name: 'OffRoadSDV',
        control_mode: 'ai'  // Always AI
    }
];

async function initControlModes() {
    for (const agent of agents) {
        await db.collection('metabolic_state').doc(agent.did).set({
            agent_did: agent.did,
            agent_name: agent.name,
            control_mode: agent.control_mode,
            initialized_at: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        console.log(`✅ ${agent.name}: ${agent.control_mode} mode`);
    }
}

initControlModes().then(() => {
    console.log('Control modes initialized!');
    process.exit(0);
});
```

**Run**:
```bash
cd backend
node init_control_modes.js
```

---

## UE5 Blueprint Implementation

### Add Control Mode Toggle

**Blueprint**: `BP_Giga` or `BP_Byte`

**Variables**:
- `ControlMode` (String) - Current mode: "player" or "ai"
- `ModeIndicatorWidget` (Widget) - UI showing current mode

**Functions**:

#### 1. ToggleControlMode

```
Event: OnKeyPressed (F key)
↓
Get Current ControlMode
↓
If ControlMode == "player"
    Set ControlMode = "ai"
    Update Firestore
    Show "AI Mode Active" notification
Else
    Set ControlMode = "player"
    Update Firestore
    Show "Player Control Active" notification
↓
Update UI Indicator
```

#### 2. UpdateFirestoreMode

```
Input: NewMode (String)
↓
Create HTTP Request
    URL: https://us-central1-substrate-nexus-9182.cloudfunctions.net/setControlMode
    Method: POST
    Body: {"agent_did": "...", "mode": NewMode}
↓
Send Request
↓
On Success: Log "Mode updated"
On Failure: Log error, revert mode
```

#### 3. CheckCurrentMode (On BeginPlay)

```
Event: BeginPlay
↓
Query Firestore metabolic_state
↓
Get control_mode field
↓
Set ControlMode variable
↓
Update UI Indicator
```

---

## UI Indicators

### In-Game HUD

Show control mode indicator:

```
┌─────────────────┐
│ Giga            │
│ 🎮 PLAYER MODE  │  ← Blue indicator
│ Battery: 85%    │
└─────────────────┘

┌─────────────────┐
│ Byte            │
│ 🤖 AI MODE      │  ← Green indicator
│ Battery: 92%    │
└─────────────────┘
```

### Observatory Brain Dashboard

Color-code agents by mode:
- **Blue** = Player controlled
- **Green** = AI assisted
- **Gray** = Offline

---

## Testing Control Modes

### Test 1: Giga in Player Mode

1. Set Giga to player mode (default)
2. Play as Giga in UE5
3. Send telemetry
4. Check Firebase logs: Should see "Skipping NIM routing - agent in PLAYER mode"
5. Verify no commands in command_queue

### Test 2: Byte in AI Mode

1. Set Byte to AI mode (default)
2. Spawn Byte in UE5
3. Send telemetry
4. Check Firebase logs: Should see "Agent in AI mode, proceeding with NIM inference"
5. Verify commands appear in command_queue
6. Byte should execute AI commands

### Test 3: Switch Modes Mid-Game

1. Start with Giga in player mode
2. Press toggle button
3. Verify Firestore updates to "ai"
4. Send telemetry
5. Verify NVIDIA NIM generates commands
6. Giga should start executing AI commands

---

## Future Enhancements (Phase 2+)

### 1. Hybrid Mode
- Player can override AI suggestions
- AI provides recommendations, player approves

### 2. Auto-Switch
- Switch to AI when player is idle for 30 seconds
- Switch to player when input detected

### 3. Voice Commands
- "Giga, go AI mode"
- "Byte, I'll take control"

### 4. Mobile App Control
- Real-time mode switching from phone
- Push notifications when mode changes

### 5. Analytics
- Track time in each mode
- Compare player vs AI performance
- Optimize AI based on player behavior

---

## Troubleshooting

### Issue: Agent not responding to mode changes

**Check**:
1. Is metabolic_state document created? Query Firestore
2. Is control_mode field set correctly?
3. Are you using the correct agent DID?
4. Check Firebase function logs for errors

### Issue: AI commands still generated in player mode

**Check**:
1. Verify control_mode is exactly "player" (lowercase)
2. Check nimRouter logs: Should see "Skipping NIM routing"
3. Clear command_queue collection
4. Redeploy functions if code was updated

### Issue: Mode toggle not working in UE5

**Check**:
1. Is HTTP request URL correct?
2. Is setControlMode function deployed?
3. Check UE5 console for HTTP errors
4. Verify agent_did parameter is correct

---

## Summary

✅ **Flexible Control**: Giga and Byte can switch between player and AI modes  
✅ **Dynamic**: Change modes mid-game without restarting  
✅ **Stored in Firestore**: Persistent across sessions  
✅ **Default Modes**: Giga=Player, Byte=AI, Jules=AI, OffRoadSDV=AI  
✅ **Future-Proof**: Ready for mobile app and voice control integration  

**Next Steps**: Deploy functions, initialize control modes, test switching in UE5