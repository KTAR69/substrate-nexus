# Gemini Quick Start Guide - NexusHub Phase 1 Deployment

**Use this document with Google Gemini Advanced when you need AI assistance.**

---

## 🎯 Current Task: Deploy Firebase Functions

You're deploying 4 Cloud Functions with NVIDIA NIM integration to Firebase project `substrate-nexus-9182`.

---

## ⚡ Quick Commands (Copy & Paste)

### 1. Login to Firebase
```bash
firebase login
```

### 2. Set NVIDIA API Key
```bash
firebase functions:config:set nvidia.api_key="YOUR_NVIDIA_API_KEY_HERE" nvidia.endpoint="https://integrate.api.nvidia.com/v1" nvidia.model="meta/llama-3.1-70b-instruct"
```

### 3. Deploy Functions
```bash
cd functions
npm run deploy
```

### 4. Initialize Agent Control Modes
```bash
cd backend
node init_control_modes.js
```

### 5. Verify Deployment
```bash
firebase functions:log --only nimRouter
```

---

## 🤖 Agent Setup

| Agent | DID | Default Mode | Description |
|-------|-----|--------------|-------------|
| Giga | `did:key:z6MkpJDdfoNfdkL8TECYLRFuQyHAVVsgHGPDBWe211dcSTuX` | 🎮 Player | You control (can switch to AI) |
| Byte | `did:key:z6MkrWdFR9FLW4FPPvNYVxGhxD7Ey3Ey3Ey3Ey3Ey3Ey3Ey` | 🤖 AI | NVIDIA NIM (can switch to Player) |
| Jules | `did:key:z6MkfwXVLSVYHN8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Y` | 🤖 AI | Always AI |
| OffRoadSDV | `did:key:z6MkoXVLSVYHN8YxGhxD7Ey3Ey3Ey3Ey3Ey3Ey3Ey3Ey3Ey` | 🤖 AI | Always AI |

---

## 🔥 Firebase Project Info

- **Project ID**: `substrate-nexus-9182`
- **Region**: `us-central1`
- **Console**: https://console.firebase.google.com/project/substrate-nexus-9182

**Collections**:
- `event_stream` - Telemetry from UE5
- `command_queue` - AI-generated commands (30s TTL)
- `nim_log` - NVIDIA inference logs
- `metabolic_state` - Agent control modes & state

---

## 🧪 Test Commands

### Test NVIDIA API
```bash
cd backend
node test_nvidia_nim.js
```

### Test vconIngest (Send Telemetry)
```bash
curl -X POST https://us-central1-substrate-nexus-9182.cloudfunctions.net/vconIngest -H "Content-Type: application/json" -d '{"agent_did":"did:key:z6MkfwXVLSVYHN8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Y","timestamp":"2026-03-31T16:00:00Z","location":{"x":100,"y":200,"z":50},"battery":85,"status":"operational"}'
```

### Test getLatestCommand (Poll for Commands)
```bash
curl "https://us-central1-substrate-nexus-9182.cloudfunctions.net/getLatestCommand?agent_did=did:key:z6MkfwXVLSVYHN8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Yx8Y"
```

---

## 🎮 UE5 Blueprint URLs (After Deployment)

Update these URLs in Unreal Engine 5:

**BP_Byte**:
- SendTelemetry: `https://us-central1-substrate-nexus-9182.cloudfunctions.net/vconIngest`
- PollCommands: `https://us-central1-substrate-nexus-9182.cloudfunctions.net/getLatestCommand?agent_did=did:key:z6MkrWdFR9FLW4FPPvNYVxGhxD7Ey3Ey3Ey3Ey3Ey3Ey3Ey`

**BP_OffRoadSDV**:
- SendTelemetry: `https://us-central1-substrate-nexus-9182.cloudfunctions.net/vconIngest`
- PollCommands: `https://us-central1-substrate-nexus-9182.cloudfunctions.net/getLatestCommand?agent_did=did:key:z6MkoXVLSVYHN8YxGhxD7Ey3Ey3Ey3Ey3Ey3Ey3Ey3Ey3Ey`

**BP_ObservatoryBrain_C**:
- FetchEvents: `https://us-central1-substrate-nexus-9182.cloudfunctions.net/observatoryFeed?limit=50`

---

## 🐛 Common Issues & Fixes

### Issue: "NVIDIA_NIM_API_KEY not configured"
```bash
firebase functions:config:get
# Should show nvidia.api_key
# If empty, run Step 2 again
```

### Issue: Deploy fails
```bash
# Check you're logged in
firebase login

# Check project is selected
firebase use substrate-nexus-9182

# Reinstall dependencies
cd functions
npm install
```

### Issue: No commands generated
**Check**:
1. Is agent in AI mode? Check Firestore `metabolic_state` collection
2. Is `control_mode` set to `"ai"`?
3. Check Firebase logs: `firebase functions:log --only nimRouter`

---

## 📚 Detailed Documentation

If you need more details, see these files:

1. **DEPLOYMENT_STEPS.md** - Complete step-by-step guide (358 lines)
2. **AGENT_CONTROL_MODE_SYSTEM.md** - Control mode system (438 lines)
3. **functions/index.js** - All Cloud Functions code (268 lines)
4. **FIREBASE_FUNCTIONS_DEPLOYMENT.md** - Technical reference

---

## 💬 How to Ask Gemini for Help

**Good Question Format**:
```
I'm deploying NexusHub Firebase Functions to project substrate-nexus-9182.

Current step: [Describe where you are]

Error/Issue: [Copy/paste error message]

What I've tried: [List what you've done]

Question: [Specific question]
```

**Example**:
```
I'm deploying NexusHub Firebase Functions to project substrate-nexus-9182.

Current step: Running "firebase deploy --only functions"

Error: "Error: HTTP Error: 403, The caller does not have permission"

What I've tried: firebase login (successful)

Question: How do I fix this permission error?
```

---

## 🎯 Success Checklist

- [ ] Firebase login successful
- [ ] Environment variables set (nvidia.api_key, etc.)
- [ ] Functions deployed (4 functions)
- [ ] Control modes initialized (Giga=player, Byte=ai, Jules=ai, OffRoadSDV=ai)
- [ ] Test NVIDIA API (backend/test_nvidia_nim.js) - passes
- [ ] Test vconIngest - returns success
- [ ] Test getLatestCommand - returns command
- [ ] UE5 Blueprint URLs updated
- [ ] Giga in player mode (no AI commands)
- [ ] Byte in AI mode (receives NVIDIA commands)

---

## 🔄 Control Mode System

**How to Switch Modes**:

1. Go to Firebase Console: https://console.firebase.google.com/project/substrate-nexus-9182/firestore
2. Open `metabolic_state` collection
3. Find agent document (by DID)
4. Update `control_mode` field:
   - `"player"` = Manual control (no AI)
   - `"ai"` = NVIDIA NIM generates commands

**Example**: Switch Giga to AI mode
```
Document: metabolic_state/did:key:z6MkpJDdfoNfdkL8TECYLRFuQyHAVVsgHGPDBWe211dcSTuX
Field: control_mode
Value: "ai"
```

---

## 🚀 What Happens After Deployment

1. **Giga** (player mode):
   - Sends telemetry → vconIngest ✅
   - nimRouter checks mode → sees "player" → skips AI ✅
   - You control Giga with keyboard/gamepad ✅

2. **Byte** (AI mode):
   - Sends telemetry → vconIngest ✅
   - nimRouter checks mode → sees "ai" → calls NVIDIA NIM ✅
   - NVIDIA generates command → command_queue ✅
   - Byte polls and executes AI command ✅

3. **Jules & OffRoadSDV** (always AI):
   - Same as Byte, always AI-assisted ✅

---

## 📞 Resources

- **Firebase Console**: https://console.firebase.google.com/project/substrate-nexus-9182
- **NVIDIA NIM Docs**: https://docs.nvidia.com/nim/
- **Firebase Functions Docs**: https://firebase.google.com/docs/functions
- **GitHub Repo**: https://github.com/KTAR69/substrate-nexus

---

## 💡 Tips for Working with Gemini

1. **Keep questions focused** - One issue at a time
2. **Provide error messages** - Copy/paste full errors
3. **Mention Firebase** - Gemini is excellent with Firebase/GCP
4. **Use screenshots** - Gemini can analyze Firebase Console screenshots
5. **Reference this file** - "According to GEMINI_QUICK_START.md..."

---

## 🎬 Next Steps After Phase 1

**Phase 2**: Firestore schema enhancements
**Phase 3**: Flutter mobile app for manual commands
**Phase 4**: Voice commands for Giga/Byte
**Phase 5+**: See NEXUSHUB_ARCHITECTURE_ROADMAP.md

---

**Everything is ready! Just follow the Quick Commands at the top.** 🚀

**If you get stuck, copy this entire file to Gemini and ask your question!**